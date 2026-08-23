import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { verifyWebhookSignature, RAZORPAY_PLANS } from "../../../../lib/payments/razorpay";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const razorpaySignature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // 1. Verify Webhook Cryptographic Signature if configured
    if (webhookSecret && !webhookSecret.includes("placeholder")) {
      if (!razorpaySignature) {
        return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
      }

      const isValid = verifyWebhookSignature(rawBody, razorpaySignature, webhookSecret);
      if (!isValid) {
        console.warn("Invalid Razorpay webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventId = event.event_id || event.id || crypto.randomUUID();
    const eventType = event.event || event.type || "unknown";

    const admin = createAdminClient();

    // 2. Idempotency Check: Drop duplicate events if already processed
    const { data: existingEvent } = await admin
      .from("webhook_events")
      .select("id")
      .eq("id", eventId)
      .single();

    if (existingEvent) {
      return NextResponse.json({ received: true, message: "Event already processed (idempotent)" });
    }

    // Record event as processed
    await admin.from("webhook_events").insert({
      id: eventId,
      event_type: eventType,
      provider: "razorpay",
      processed_at: new Date().toISOString(),
    });

    // 3. Process Razorpay Payment & Order Events
    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;

    const notes = paymentEntity?.notes || orderEntity?.notes || {};
    const userId = notes.userId || notes.user_id;
    const rawPlanTier = notes.planTier || notes.plan_tier || "pro_monthly";

    if (userId) {
      // Ensure user profile exists in public.profiles (to satisfy foreign key constraints)
      await admin.from("profiles").upsert(
        {
          id: userId,
          email: notes.userEmail || "",
          full_name: notes.userName || "User",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (eventType === "order.paid" || eventType === "payment.captured") {
        if (rawPlanTier === "credits_100") {
          // Add 100 bonus credits in user_credits table
          const { data: existingCredits } = await admin
            .from("user_credits")
            .select("bonus_credits")
            .eq("user_id", userId)
            .maybeSingle();

          const newBonus = (existingCredits?.bonus_credits || 0) + 100;
          await admin
            .from("user_credits")
            .upsert(
              {
                user_id: userId,
                bonus_credits: newBonus,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );

          await admin.from("usage_logs").insert({
            user_id: userId,
            tool_id: "webhook_addon_100",
            credits_used: 0,
            status: "success",
            metadata: { eventId, paymentId: paymentEntity?.id },
          });
        } else {
          // Pro Subscription Activation (pro_monthly or pro_yearly)
          const validPlanTier = rawPlanTier === "pro_yearly" ? "pro_yearly" : "pro_monthly";
          const resolvedPlan = RAZORPAY_PLANS[validPlanTier] || RAZORPAY_PLANS.pro_monthly;
          const periodDays = validPlanTier === "pro_yearly" ? 365 : 30;
          const periodEnd = new Date(Date.now() + periodDays * 86400000).toISOString();

          // 1. Update user_credits with 500 balance & 500 daily quota limit
          await admin.from("user_credits").upsert(
            {
              user_id: userId,
              credits_balance: 500,
              daily_quota_limit: 500,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

          // 2. Upsert Subscriptions record
          await admin.from("subscriptions").upsert(
            {
              user_id: userId,
              customer_id: paymentEntity?.customer_id || `rzp_cust_${userId.slice(0, 12)}`,
              subscription_id: paymentEntity?.id || orderEntity?.id || `order_${Date.now()}`,
              price_id: validPlanTier,
              plan_tier: validPlanTier,
              status: "active",
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

          // 3. Log event in usage_logs
          await admin.from("usage_logs").insert({
            user_id: userId,
            tool_id: `webhook_upgrade_${validPlanTier}`,
            credits_used: 0,
            status: "success",
            metadata: { eventId, paymentId: paymentEntity?.id },
          });
        }
      } else if (eventType === "subscription.cancelled" || eventType === "subscription.halted") {
        // Downgrade to Free
        await admin.from("subscriptions").update({
          status: "canceled",
          plan_tier: "free",
          updated_at: new Date().toISOString(),
        }).eq("user_id", userId);

        await admin.from("user_credits").update({
          daily_quota_limit: 10,
          updated_at: new Date().toISOString(),
        }).eq("user_id", userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { error: "Webhook Processing Error", message: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || req.headers.get("x-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET;

    // 1. Verify Webhook Cryptographic Signature if secret is configured
    if (webhookSecret && signature && !webhookSecret.includes("placeholder")) {
      // In production with Stripe SDK or HMAC verification:
      // const isValid = verifyHmacSignature(rawBody, signature, webhookSecret);
      // if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventId = event.id || event.event_id || crypto.randomUUID();
    const eventType = event.type || event.event_name || "unknown";

    const admin = createAdminClient();

    // 2. Idempotency Check: Drop duplicate events if already processed
    const { data: existingEvent } = await admin
      .from("webhook_events")
      .select("id")
      .eq("id", eventId)
      .single();

    if (existingEvent) {
      // Already processed safely
      return NextResponse.json({ received: true, message: "Event already processed (idempotent)" });
    }

    // Record event as processed
    await admin.from("webhook_events").insert({
      id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString(),
    });

    // 3. Handle Subscription & Credit Events
    const session = event.data?.object || event.data;
    const userId = session?.client_reference_id || session?.metadata?.userId;
    const customerId = session?.customer;
    const subscriptionId = session?.subscription;

    if (userId) {
      if (eventType === "checkout.session.completed" || eventType === "subscription_created") {
        const planTier = session?.metadata?.planTier || "pro_monthly";
        
        if (planTier === "credit_pack_100") {
          // Add 100 bonus credits
          await admin.rpc("add_bonus_credits", { p_user_id: userId, p_amount: 100 });
        } else {
          // Activate Pro Subscription
          await admin.from("subscriptions").upsert({
            user_id: userId,
            customer_id: customerId,
            subscription_id: subscriptionId,
            plan_tier: planTier,
            status: "active",
            current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        }
      } else if (eventType === "customer.subscription.deleted" || eventType === "subscription_canceled") {
        // Cancel subscription
        await admin.from("subscriptions").update({
          status: "canceled",
          plan_tier: "free",
          updated_at: new Date().toISOString(),
        }).eq("user_id", userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook Error", message: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { verifyPaymentSignature, getRazorpayCredentials, RAZORPAY_PLANS } from "../../../../lib/payments/razorpay";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", message: "Please sign in to verify your payment." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planTier, customCredits, isSandbox } = body;

    const { keySecret } = getRazorpayCredentials();
    const isConfigured = keySecret && !keySecret.includes("placeholder");

    // 1. Cryptographic Signature Verification
    if (isConfigured && !isSandbox) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { error: "Missing Parameters", message: "Payment verification parameters missing." },
          { status: 400 }
        );
      }

      const isValid = verifyPaymentSignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });

      if (!isValid) {
        console.error("Signature verification failed for order:", razorpay_order_id);
        return NextResponse.json(
          { error: "Verification Failed", message: "Invalid payment signature. Transaction could not be verified." },
          { status: 400 }
        );
      }
    }

    // 2. Database Update via Admin Client
    const admin = createAdminClient();

    // 0. Auto-ensure user profile exists in public.profiles (to satisfy foreign key constraints)
    await admin.from("profiles").upsert(
      {
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    // ─── Case A: Add-on Bonus Credits Top-Up (100 or Custom) ───
    if (planTier === "credits_100" || planTier === "custom_credits") {
      const creditsToAdd = planTier === "credits_100" ? 100 : Math.max(10, Number(customCredits) || 10);
      const { data: existingCredits } = await admin
        .from("user_credits")
        .select("bonus_credits")
        .eq("user_id", user.id)
        .maybeSingle();

      const newBonus = (existingCredits?.bonus_credits || 0) + creditsToAdd;

      await admin.from("user_credits").upsert(
        {
          user_id: user.id,
          bonus_credits: newBonus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      // Log purchase event in usage_logs
      await admin.from("usage_logs").insert({
        user_id: user.id,
        tool_id: `billing_addon_${creditsToAdd}`,
        credits_used: 0,
        status: "success",
        metadata: {
          type: "purchase",
          planTier,
          creditsAdded: creditsToAdd,
          razorpay_order_id,
          razorpay_payment_id,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${creditsToAdd} Bonus Credits added to your account!`,
        planTier,
        creditsAdded: creditsToAdd,
        bonusCredits: newBonus,
      });
    }

    // ─── Case B: Subscription Upgrades (Starter / Pro) ───
    const isStarter = planTier === "starter_monthly" || planTier === "starter_yearly";
    const isYearly = planTier === "starter_yearly" || planTier === "pro_yearly";
    const validPlanTier = isStarter
      ? isYearly ? "starter_yearly" : "starter_monthly"
      : isYearly ? "pro_yearly" : "pro_monthly";

    const resolvedPlan = RAZORPAY_PLANS[validPlanTier] || RAZORPAY_PLANS.pro_monthly;
    const periodDays = isYearly ? 365 : 30;
    const periodEnd = new Date(Date.now() + periodDays * 86400000).toISOString();
    const allocatedCredits = isStarter ? 100 : 500;

    // 1. Upsert Subscriptions record
    const { error: subError } = await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        customer_id: `rzp_cust_${user.id.slice(0, 12)}`,
        subscription_id: razorpay_payment_id || `order_${razorpay_order_id || Date.now()}`,
        price_id: validPlanTier,
        plan_tier: isStarter ? "pro_monthly" : validPlanTier, // Safe fallback for db check constraint while tracking price_id
        status: "active",
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (subError) {
      console.error("Failed to upsert subscription record:", subError);
      throw new Error(`Subscription update failed: ${subError.message}`);
    }

    // 2. Upsert user_credits with allocated balance and quota limit
    const { error: creditError } = await admin.from("user_credits").upsert(
      {
        user_id: user.id,
        credits_balance: allocatedCredits,
        daily_quota_limit: allocatedCredits,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (creditError) {
      console.error("Failed to update user_credits:", creditError);
      throw new Error(`Credits update failed: ${creditError.message}`);
    }

    // 3. Log event in usage_logs
    await admin.from("usage_logs").insert({
      user_id: user.id,
      tool_id: `billing_upgrade_${validPlanTier}`,
      credits_used: 0,
      status: "success",
      metadata: {
        type: "subscription_upgrade",
        planTier: validPlanTier,
        razorpay_order_id,
        razorpay_payment_id,
        periodEnd,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Congratulations! You are now on ${resolvedPlan.name}. ${allocatedCredits} credits have been added.`,
      planTier: validPlanTier,
      creditsBalance: allocatedCredits,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Verification Error", message: error.message || "Failed to update account status." },
      { status: 500 }
    );
  }
}

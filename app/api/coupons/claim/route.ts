import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import {
  getCouponDefinition,
  isEmailDomainAllowed,
  hasUserRedeemedCampaignOrActivePro,
} from "../../../../lib/coupons/couponService";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "Please sign in with your Marwadi University Google account to claim your student pass.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { error: "Invalid Request", message: "Coupon code is required." },
        { status: 400 }
      );
    }

    const coupon = await getCouponDefinition(code);
    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { error: "Invalid Coupon", message: "This coupon is either invalid or has expired." },
        { status: 404 }
      );
    }

    const userEmail = user.email || "";

    // 1. Strict Marwadi University domain check
    const isDomainAllowed = isEmailDomainAllowed(userEmail, coupon.allowedDomains);
    if (!isDomainAllowed) {
      return NextResponse.json(
        {
          error: "Domain Restriction",
          message: `This coupon is exclusively for Marwadi University students. You are currently signed in with a normal Gmail account (${userEmail}). Please continue with your Marwadi University mail.`,
        },
        { status: 403 }
      );
    }

    // 2. Strict 1-time redemption check across ALL student coupons & active Pro check
    const checkRedemption = await hasUserRedeemedCampaignOrActivePro(user.id, userEmail, coupon.campaign);
    if (checkRedemption.redeemed) {
      return NextResponse.json(
        {
          error: "Already Redeemed",
          message: checkRedemption.reason || "You have already claimed this 1-time student offer on your account.",
        },
        { status: 400 }
      );
    }

    // 3. Grant Pro Annual Access (365 days) & 500 Credits via Admin Client
    const admin = createAdminClient();
    const periodDays = 365;
    const periodEnd = new Date(Date.now() + periodDays * 86400000).toISOString();
    const allocatedCredits = 500;
    const planTier = "pro_yearly";

    // Auto-ensure user profile exists
    await admin.from("profiles").upsert(
      {
        id: user.id,
        email: userEmail,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split("@")[0] || "Student",
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    // Update Subscriptions record
    const { error: subError } = await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        customer_id: `rzp_student_${user.id.slice(0, 12)}`,
        subscription_id: `sub_student_${coupon.code.toLowerCase()}_${user.id.slice(0, 8)}_${Date.now()}`,
        price_id: `pro_yearly_${coupon.code.toLowerCase()}`,
        plan_tier: planTier,
        status: "active",
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (subError) {
      console.error("Subscription update error:", subError);
      throw new Error(`Failed to activate subscription: ${subError.message}`);
    }

    // Update User Credits
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
      console.error("Credit update error:", creditError);
      throw new Error(`Failed to update credits: ${creditError.message}`);
    }

    // Record redemption in coupon_redemptions (if table exists)
    try {
      await admin.from("coupon_redemptions").insert({
        coupon_code: coupon.code,
        user_id: user.id,
        user_email: userEmail,
        plan_tier: planTier,
        redeemed_at: new Date().toISOString(),
      });
    } catch (redemptionErr) {
      console.warn("Could not insert into coupon_redemptions table:", redemptionErr);
    }

    // Log event in usage_logs for audit
    await admin.from("usage_logs").insert({
      user_id: user.id,
      tool_id: `coupon_claim_${coupon.code}`,
      credits_used: 0,
      status: "success",
      metadata: {
        type: "coupon_claim",
        couponCode: coupon.code,
        planTier,
        discountPercent: coupon.discountValue,
        allowedDomains: coupon.allowedDomains,
        periodEnd,
      },
    });

    return NextResponse.json({
      success: true,
      message: `🎉 Congratulations! Your 1-Year Free Student Pro plan is now active. 500 High-Speed AI credits have been added to your account!`,
      planTier,
      creditsBalance: allocatedCredits,
      periodEnd,
      userEmail,
      couponCode: coupon.code,
    });
  } catch (error: any) {
    console.error("Coupon claim error:", error);
    return NextResponse.json(
      {
        error: "Claim Failed",
        message: error.message || "Failed to redeem student offer. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}

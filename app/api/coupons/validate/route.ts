import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import {
  getCouponDefinition,
  isEmailDomainAllowed,
  hasUserRedeemedCampaignOrActivePro,
} from "../../../../lib/coupons/couponService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, plan, billingCycle } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { valid: false, error: "Please enter a valid coupon code." },
        { status: 400 }
      );
    }

    const coupon = await getCouponDefinition(code);

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired coupon code." },
        { status: 404 }
      );
    }

    // Check plan and billing cycle restriction
    let targetPlanKey = plan;
    if (plan === "starter") {
      targetPlanKey = billingCycle === "annual" || billingCycle === "yearly" ? "starter_yearly" : "starter_monthly";
    } else if (plan === "pro") {
      targetPlanKey = billingCycle === "annual" || billingCycle === "yearly" ? "pro_yearly" : "pro_monthly";
    }

    if (targetPlanKey && coupon.allowedPlans.length > 0) {
      const isAllowedPlan = coupon.allowedPlans.includes(targetPlanKey);
      if (!isAllowedPlan) {
        let planErrorMsg = "This coupon is valid exclusively for the Pro Annual (Yearly) Plan.";
        if (targetPlanKey === "pro_monthly") {
          planErrorMsg = "This coupon is valid only for the Pro Annual (Yearly) Plan. Please switch billing to Annual.";
        } else if (targetPlanKey.startsWith("starter")) {
          planErrorMsg = "This coupon is valid only for the Pro Annual Plan, not the Starter plan.";
        }
        return NextResponse.json(
          {
            valid: false,
            wrongPlan: true,
            requiredPlan: "pro_yearly",
            error: planErrorMsg,
          },
          { status: 400 }
        );
      }
    }

    // Check current logged-in user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        valid: true,
        requiresLogin: true,
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discountValue: coupon.discountValue,
          discountType: coupon.discountType,
          allowedDomains: coupon.allowedDomains,
        },
        message: "Please continue with your student mail to claim this coupon.",
      });
    }

    const userEmail = user.email || "";

    // Verify email domain
    const isDomainAllowed = isEmailDomainAllowed(userEmail, coupon.allowedDomains);
    if (!isDomainAllowed) {
      return NextResponse.json(
        {
          valid: false,
          isWrongDomain: true,
          currentEmail: userEmail,
          allowedDomains: coupon.allowedDomains,
          error: `This coupon is exclusively for students (Student Pack). You are currently signed in with a normal Gmail account (${userEmail}). Please continue with your student mail.`,
        },
        { status: 403 }
      );
    }

    // Check if user has EVER redeemed any student coupon from this campaign or has active Pro
    const checkRedemption = await hasUserRedeemedCampaignOrActivePro(user.id, userEmail, coupon.campaign);
    if (checkRedemption.redeemed) {
      return NextResponse.json(
        {
          valid: false,
          alreadyRedeemed: true,
          error: checkRedemption.reason || "You have already claimed this 1-time student offer on your account.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      eligible: true,
      userEmail,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountValue: coupon.discountValue,
        discountType: coupon.discountType,
        allowedDomains: coupon.allowedDomains,
        allowedPlans: coupon.allowedPlans,
      },
      message: `Verified! You are eligible for 100% OFF on Boring Tools Annual Pro via your Student Pack.`,
    });
  } catch (error: any) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { valid: false, error: error.message || "Failed to validate coupon." },
      { status: 500 }
    );
  }
}

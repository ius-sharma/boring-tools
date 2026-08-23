import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import {
  RAZORPAY_PLANS,
  createRazorpayOrder,
  getRazorpayCredentials,
  calculateCustomCreditsAmount,
} from "../../../lib/payments/razorpay";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", message: "Please sign in or create an account before upgrading." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { plan, billingCycle, creditsCount } = body;

    let planKey = plan || "pro_monthly";
    let amount: number;
    let planTier: string;
    let planName: string;
    let customCredits = 0;

    if (planKey === "custom_credits" || planKey === "credits_custom" || creditsCount) {
      const calc = calculateCustomCreditsAmount(creditsCount || 10);
      amount = calc.amountPaise;
      planTier = "custom_credits";
      customCredits = calc.credits;
      planName = `${calc.credits} AI Bonus Credits Pack`;
    } else {
      if (planKey === "pro") {
        planKey = billingCycle === "annual" || billingCycle === "yearly" ? "pro_yearly" : "pro_monthly";
      }
      const planConfig = RAZORPAY_PLANS[planKey] || RAZORPAY_PLANS.pro_monthly;
      amount = planConfig.amount;
      planTier = planConfig.id;
      planName = planConfig.name;
    }

    const { keyId, keySecret } = getRazorpayCredentials();

    // Check if Razorpay credentials exist
    if (!keyId || !keySecret || keyId.includes("placeholder") || keySecret.includes("placeholder")) {
      return NextResponse.json({
        success: true,
        sandbox: true,
        orderId: `order_mock_${Date.now()}`,
        amount,
        currency: "INR",
        keyId: keyId || "rzp_test_placeholder",
        planTier,
        planName,
        customCredits,
        userEmail: user.email,
        userName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
        message: "Razorpay credentials not configured. Running in sandbox demo mode.",
      });
    }

    // Create real Razorpay order
    const order = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId: user.id,
        userEmail: user.email || "",
        planTier,
        planName,
        customCredits: String(customCredits),
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      planTier,
      planName,
      customCredits,
      userEmail: user.email,
      userName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
    });
  } catch (error: any) {
    console.error("Checkout order error:", error);
    return NextResponse.json(
      { error: "Order Creation Failed", message: error.message || "Could not initialize checkout session." },
      { status: 500 }
    );
  }
}

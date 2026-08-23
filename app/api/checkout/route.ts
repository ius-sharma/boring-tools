import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", message: "Please sign in before upgrading." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { plan, billingCycle } = body;

    // Check for payment gateway configuration (e.g. Stripe, LemonSqueezy, or Razorpay)
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const lemonsqueezyKey = process.env.LEMONSQUEEZY_API_KEY;

    if (stripeKey && !stripeKey.includes("placeholder")) {
      // Stripe Checkout logic
      // In production with Stripe installed:
      // const session = await stripe.checkout.sessions.create({...})
      // return NextResponse.json({ url: session.url });
    }

    // Fallback response for dev / sandbox mode
    return NextResponse.json({
      success: true,
      message: `Checkout session initialized for ${plan} (${billingCycle || "standard"}). Configure STRIPE_SECRET_KEY or LEMONSQUEEZY_API_KEY to redirect to live payment gateway.`,
      plan,
      userEmail: user.email,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

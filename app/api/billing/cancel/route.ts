import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", message: "Please sign in to manage your subscription." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // 1. Fetch current subscription
    const { data: sub } = await admin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!sub || sub.plan_tier === "free") {
      return NextResponse.json(
        { error: "No Active Subscription", message: "You do not have an active Pro subscription to cancel." },
        { status: 400 }
      );
    }

    // 2. Mark subscription as canceled
    const { error: updateError } = await admin
      .from("subscriptions")
      .update({
        status: "canceled",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(`Failed to cancel subscription: ${updateError.message}`);
    }

    // 3. Log event in usage_logs
    await admin.from("usage_logs").insert({
      user_id: user.id,
      tool_id: "billing_subscription_canceled",
      credits_used: 0,
      status: "success",
      metadata: {
        previousPlanTier: sub.plan_tier,
        currentPeriodEnd: sub.current_period_end,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your subscription has been canceled. You will continue to have Pro benefits until the end of your billing cycle.",
      currentPeriodEnd: sub.current_period_end,
    });
  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Cancellation Error", message: error.message || "Could not cancel subscription." },
      { status: 500 }
    );
  }
}

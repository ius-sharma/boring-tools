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
        { error: "Authentication required", message: "Please sign in." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // 1. Reset subscription to Free Tier
    await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan_tier: "free",
        status: "active",
        current_period_end: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    // 2. Reset user_credits to 10 daily balance (preserving bonus_credits)
    const { data: existingCredits } = await admin
      .from("user_credits")
      .select("bonus_credits")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentBonus = existingCredits?.bonus_credits || 0;

    await admin.from("user_credits").upsert(
      {
        user_id: user.id,
        credits_balance: 10,
        daily_quota_limit: 10,
        bonus_credits: currentBonus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return NextResponse.json({
      success: true,
      message: "Account reverted to Free Plan (10 Daily Credits + your Bonus Credits).",
      planTier: "free",
      creditsBalance: 10,
      bonusCredits: currentBonus,
      totalAvailable: 10 + currentBonus,
    });
  } catch (error: any) {
    console.error("Reset to free error:", error);
    return NextResponse.json(
      { error: "Reset Error", message: error.message || "Failed to reset account." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { checkGuestQuota } from "../../../../lib/auth/guest";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Guest info
      const guestCheck = await checkGuestQuota(req);
      return NextResponse.json({
        isLoggedIn: false,
        user: null,
        subscription: null,
        credits: {
          creditsBalance: guestCheck.remaining,
          bonusCredits: 0,
          dailyQuotaLimit: 3,
          totalAvailable: guestCheck.remaining,
          isPro: false,
          isGuest: true,
        },
      });
    }

    const admin = createAdminClient();

    // Fetch Profile
    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Fetch Subscription
    const { data: sub } = await admin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Fetch Credits
    const { data: credits } = await admin
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const isPro = sub?.status === "active" && (sub?.plan_tier === "pro_monthly" || sub?.plan_tier === "pro_yearly");
    const balance = credits?.credits_balance ?? 10;
    const bonus = credits?.bonus_credits ?? 0;

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0],
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url,
      },
      subscription: sub ? {
        planTier: sub.plan_tier,
        status: sub.status,
        currentPeriodEnd: sub.current_period_end,
      } : { planTier: "free", status: "active" },
      credits: {
        creditsBalance: balance,
        bonusCredits: bonus,
        dailyQuotaLimit: isPro ? 500 : (credits?.daily_quota_limit ?? 10),
        totalAvailable: isPro ? 999999 : (balance + bonus),
        isPro: !!isPro,
        isGuest: false,
      },
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({
      isLoggedIn: false,
      user: null,
      credits: {
        creditsBalance: 3,
        bonusCredits: 0,
        dailyQuotaLimit: 3,
        totalAvailable: 3,
        isPro: false,
        isGuest: true,
      },
    });
  }
}

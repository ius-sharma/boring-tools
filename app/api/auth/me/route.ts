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

    // Fetch Profile or auto-create if missing
    let { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile } = await admin
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select()
        .single();
      profile = newProfile;
    }

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

    const isPro = (sub?.status === "active" && (sub?.plan_tier === "pro_monthly" || sub?.plan_tier === "pro_yearly" || sub?.plan_tier === "pro")) || profile?.plan_tier === "pro";
    
    // For Pro users, ensure user_credits table is updated to 500 if still at 0/10
    let balance = credits?.credits_balance ?? (isPro ? 500 : 10);
    const bonus = credits?.bonus_credits ?? 0;

    if (isPro && (!credits || credits.credits_balance === 0 || credits.daily_quota_limit < 500)) {
      balance = 500;
      await admin.from("user_credits").upsert({
        user_id: user.id,
        credits_balance: 500,
        daily_quota_limit: 500,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

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
      } : { planTier: isPro ? "pro_monthly" : "free", status: isPro ? "active" : "active" },
      credits: {
        creditsBalance: isPro ? balance : balance,
        bonusCredits: bonus,
        dailyQuotaLimit: isPro ? 500 : (credits?.daily_quota_limit ?? 10),
        totalAvailable: balance + bonus,
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

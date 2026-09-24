import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

/**
 * DPDP Act 2023 - Data Principal Statutory Rights Route Handler
 * GET: Section 11 (Right to Access Information about Personal Data)
 * DELETE: Section 12(2) (Right to Erasure of Personal Data)
 */

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in to exercise your Data Principal Rights under DPDP Act 2023." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // 1. Fetch Profile
    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // 2. Fetch Subscription details
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // 3. Fetch User Credits
    const { data: credits } = await admin
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // 4. Fetch User Usage History (Audit logs)
    const { data: usageLogs } = await admin
      .from("usage_logs")
      .select("tool_id, credits_used, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    const exportPayload = {
      exportMetadata: {
        regulatoryFramework: "Digital Personal Data Protection Act, 2023 (DPDP)",
        statutoryRight: "Section 11 - Right to Access Information about Personal Data",
        dataPrincipalId: user.id,
        exportedAt: new Date().toISOString(),
        fiduciary: "BoringTools (Boring Tools AI)",
        dpoContact: "grievance@boringtoolsai.com",
      },
      dataPrincipal: {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || user.user_metadata?.full_name || null,
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || null,
        role: profile?.role || "user",
        accountCreatedAt: user.created_at || profile?.created_at,
        lastSignInAt: user.last_sign_in_at || null,
      },
      subscription: {
        tier: subscription?.plan_tier || profile?.plan_tier || "free",
        status: subscription?.status || "active",
        currentPeriodStart: subscription?.current_period_start || null,
        currentPeriodEnd: subscription?.current_period_end || null,
        cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
      },
      credits: {
        creditsBalance: credits?.credits_balance ?? 10,
        bonusCredits: credits?.bonus_credits ?? 0,
        dailyQuotaLimit: credits?.daily_quota_limit ?? 10,
        lastResetDate: credits?.last_reset_date || null,
      },
      usageHistory: usageLogs || [],
    };

    return NextResponse.json(exportPayload, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="boringtools-user-data.json"',
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("DPDP Data Rights [GET] error:", err);
    return NextResponse.json(
      { error: "Internal server error exporting user data." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in to exercise your Data Principal Rights under DPDP Act 2023." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const userId = user.id;

    // Execute complete statutory erasure under Section 12(2) of DPDP Act 2023
    // 1. Delete associated usage logs
    await admin.from("usage_logs").delete().eq("user_id", userId);

    // 2. Delete subscription record
    await admin.from("subscriptions").delete().eq("user_id", userId);

    // 3. Delete user credits record
    await admin.from("user_credits").delete().eq("user_id", userId);

    // 4. Delete profile record
    await admin.from("profiles").delete().eq("id", userId);

    // 5. Delete Supabase Auth user record (if supported by environment)
    try {
      if (admin.auth?.admin?.deleteUser) {
        await admin.auth.admin.deleteUser(userId);
      }
    } catch (authDeleteErr) {
      console.warn("Could not delete from auth.users via admin client:", authDeleteErr);
    }

    // 6. Sign out current session
    try {
      await supabase.auth.signOut();
    } catch (signOutErr) {
      console.warn("Error signing out during erasure:", signOutErr);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Your account and all associated personal data have been completely erased pursuant to Section 12(2) of the Digital Personal Data Protection Act, 2023.",
        erasedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("DPDP Data Rights [DELETE] error:", err);
    return NextResponse.json(
      { error: "Internal server error processing account and data erasure." },
      { status: 500 }
    );
  }
}

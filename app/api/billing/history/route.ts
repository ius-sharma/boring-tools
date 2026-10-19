import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", message: "Please sign in to view billing history." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // Fetch billing logs from usage_logs
    const { data: logs, error } = await admin
      .from("usage_logs")
      .select("*")
      .eq("user_id", user.id)
      .ilike("tool_id", "billing_%")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching billing logs:", error);
    }

    const formattedHistory = (logs || []).map((log) => {
      const isAddon = log.tool_id.includes("addon");
      const isYearly = log.tool_id.includes("yearly") || log.metadata?.planTier === "pro_yearly";
      const isCancel = log.tool_id.includes("canceled");

      return {
        id: log.id,
        date: new Date(log.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        description: isCancel
          ? "Subscription Canceled"
          : isAddon
          ? "100 AI Bonus Credits Pack"
          : isYearly
          ? "Boring Tools Pro (Yearly)"
          : "Boring Tools Pro (Monthly)",
        amount: isCancel
          ? "—"
          : isAddon
          ? "₹199.00"
          : isYearly
          ? "₹3,999.00"
          : "₹499.00",
        status: isCancel ? "Canceled" : "Paid",
        orderId: log.metadata?.razorpay_order_id || `rec_${log.id.slice(0, 8)}`,
      };
    });

    return NextResponse.json({
      success: true,
      history: formattedHistory,
    });
  } catch (error: any) {
    console.error("Billing history error:", error);
    return NextResponse.json(
      { error: "History Error", message: error.message || "Failed to load billing history." },
      { status: 500 }
    );
  }
}

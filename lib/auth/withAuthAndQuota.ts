import { NextRequest, NextResponse } from "next/server";
import { verifyAndDeductQuota } from "./quota";
import { ToolCostConfig } from "./types";

export function withAuthAndQuota(
  config: ToolCostConfig,
  handler: (req: NextRequest, quota: { isGuest: boolean; remaining?: number; userId?: string }) => Promise<Response>
) {
  return async function (req: NextRequest) {
    const quotaResult = await verifyAndDeductQuota(req, config);

    if (!quotaResult.allowed) {
      return NextResponse.json(
        {
          error: quotaResult.reason || "PAYMENT_REQUIRED",
          message: quotaResult.message || "Quota limit reached. Please sign in or upgrade to Pro.",
          remainingCredits: quotaResult.remaining ?? 0,
          isGuest: quotaResult.isGuest,
          upgradeUrl: "/pricing",
        },
        { status: quotaResult.reason === "UNAUTHORIZED" ? 401 : 402 }
      );
    }

    return handler(req, {
      isGuest: quotaResult.isGuest,
      remaining: quotaResult.remaining,
      userId: quotaResult.userId,
    });
  };
}

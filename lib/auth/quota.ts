import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";
import { ToolCostConfig } from "./types";
import { checkGuestQuota, incrementGuestQuota } from "./guest";
import { NextRequest } from "next/server";

export interface QuotaCheckResult {
  allowed: boolean;
  isGuest: boolean;
  isPro?: boolean;
  userId?: string;
  remaining?: number;
  reason?: "UNAUTHORIZED" | "CREDITS_EXHAUSTED" | "GUEST_LIMIT_REACHED" | "ERROR";
  message?: string;
}

/**
 * Server-authoritative gatekeeper: Verifies authentication & deducts quota atomically.
 * NEVER trust the client.
 */
export async function verifyAndDeductQuota(
  req: NextRequest,
  config: ToolCostConfig
): Promise<QuotaCheckResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. If User is Logged-In
    if (user) {
      const admin = createAdminClient();
      
      // Call atomic stored procedure in PostgreSQL
      const { data, error } = await admin.rpc("deduct_user_credits", {
        p_user_id: user.id,
        p_cost: config.costInCredits || 1,
      });

      if (error) {
        console.error("Quota deduction RPC error:", error);
        // Fallback for development if database is not connected yet
        if (process.env.NODE_ENV === "development" && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))) {
          return { allowed: true, isGuest: false, isPro: false, remaining: 10, userId: user.id };
        }
        return {
          allowed: false,
          isGuest: false,
          reason: "ERROR",
          message: "Unable to verify user quota at this moment.",
        };
      }

      if (!data?.success) {
        return {
          allowed: false,
          isGuest: false,
          isPro: false,
          remaining: data?.remaining || 0,
          reason: "CREDITS_EXHAUSTED",
          message: "You have used all your credits for today. Upgrade to Pro for unlimited access!",
        };
      }

      return {
        allowed: true,
        isGuest: false,
        isPro: data.is_pro || false,
        remaining: data.remaining,
        userId: user.id,
      };
    }

    // 2. If User is a Guest / Anonymous
    if (!config.allowGuestTrial) {
      return {
        allowed: false,
        isGuest: true,
        reason: "UNAUTHORIZED",
        message: "This tool requires a free Boring Tools account. Sign in to continue.",
      };
    }

    const guestCheck = await checkGuestQuota(req, config.toolId);
    if (!guestCheck.allowed) {
      return {
        allowed: false,
        isGuest: true,
        remaining: 0,
        reason: "GUEST_LIMIT_REACHED",
        message: "You've reached the free guest limit (3/3 runs). Sign in with Google to get 10 free daily credits!",
      };
    }

    // Increment guest usage
    await incrementGuestQuota(req, config.toolId);

    return {
      allowed: true,
      isGuest: true,
      remaining: guestCheck.remaining,
    };
  } catch (err) {
    console.error("verifyAndDeductQuota fatal error:", err);
    // Dev fallback
    if (process.env.NODE_ENV === "development") {
      return { allowed: true, isGuest: true, remaining: 3 };
    }
    return {
      allowed: false,
      isGuest: true,
      reason: "ERROR",
      message: "Security verification failed. Please refresh and try again.",
    };
  }
}

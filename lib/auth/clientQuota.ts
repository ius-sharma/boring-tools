/**
 * Client-Side Quota & Error Interceptor Utility
 * Dispatches global custom events for seamless Upgrade Modal triggers across all tool pages.
 */

export interface QuotaExceededDetail {
  reason?: "GUEST_LIMIT_REACHED" | "CREDITS_EXHAUSTED" | "UNAUTHORIZED" | "RATE_LIMITED" | string;
  message?: string;
  isGuest?: boolean;
  remainingCredits?: number;
  toolName?: string;
  upgradeUrl?: string;
}

export const QUOTA_EXCEEDED_EVENT = "boring-tools:quota-exceeded";

/**
 * Dispatch global quota exceeded event to immediately open the Upgrade Modal.
 */
export function dispatchQuotaExceeded(detail?: QuotaExceededDetail) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent(QUOTA_EXCEEDED_EVENT, {
      detail: detail || {
        reason: "CREDITS_EXHAUSTED",
        message: "You have reached your usage limit. Upgrade to Pro for unlimited access!",
      },
    });
    window.dispatchEvent(event);
  }
}

/**
 * Helper to inspect any API response and auto-trigger Upgrade Modal if quota or auth is exceeded.
 * Returns true if quota was exceeded (so the caller can safely stop processing).
 */
export function checkQuotaResponse(response: Response, data?: any, toolName?: string): boolean {
  if (response.status === 402 || response.status === 429 || (response.status === 401 && data?.isGuest)) {
    dispatchQuotaExceeded({
      reason: data?.error || (data?.isGuest ? "GUEST_LIMIT_REACHED" : "CREDITS_EXHAUSTED"),
      message: data?.message || "Usage limit reached.",
      isGuest: Boolean(data?.isGuest),
      remainingCredits: data?.remainingCredits ?? 0,
      toolName,
      upgradeUrl: data?.upgradeUrl || "/pricing",
    });
    return true;
  }

  if (
    data?.error === "GUEST_LIMIT_REACHED" ||
    data?.error === "CREDITS_EXHAUSTED" ||
    data?.error === "UPGRADE_REQUIRED" ||
    data?.error === "QUOTA_EXCEEDED"
  ) {
    dispatchQuotaExceeded({
      reason: data.error,
      message: data.message,
      isGuest: Boolean(data.isGuest),
      remainingCredits: data.remainingCredits ?? 0,
      toolName,
      upgradeUrl: data.upgradeUrl || "/pricing",
    });
    return true;
  }

  return false;
}

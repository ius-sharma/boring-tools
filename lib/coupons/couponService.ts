import { createAdminClient } from "../supabase/admin";

export interface CouponDefinition {
  code: string;
  campaign: string; // Grouping campaigns so user can't exploit multiple codes from the same campaign
  discountType: "percentage" | "fixed";
  discountValue: number; // 100 = 100% off
  allowedDomains: string[];
  allowedPlans: string[];
  description: string;
  oneTimePerUser: boolean;
  isActive: boolean;
}

export const SYSTEM_COUPONS: Record<string, CouponDefinition> = {
  MARWADI100: {
    code: "MARWADI100",
    campaign: "marwadi_student_2026",
    discountType: "percentage",
    discountValue: 100,
    allowedDomains: ["marwadiuniversity.ac.in"],
    allowedPlans: ["pro_yearly"],
    description: "Marwadi University 100% Off Annual Pro Student Pass",
    oneTimePerUser: true,
    isActive: true,
  },
  MU2026: {
    code: "MU2026",
    campaign: "marwadi_student_2026",
    discountType: "percentage",
    discountValue: 100,
    allowedDomains: ["marwadiuniversity.ac.in"],
    allowedPlans: ["pro_yearly"],
    description: "Marwadi University 2026 Annual Student Pass",
    oneTimePerUser: true,
    isActive: true,
  },
  MUFREE: {
    code: "MUFREE",
    campaign: "marwadi_student_2026",
    discountType: "percentage",
    discountValue: 100,
    allowedDomains: ["marwadiuniversity.ac.in"],
    allowedPlans: ["pro_yearly"],
    description: "Marwadi University Student Free 1-Year Pass",
    oneTimePerUser: true,
    isActive: true,
  },
};

/**
 * Verify whether an email belongs to the allowed domains
 */
export function isEmailDomainAllowed(email?: string | null, allowedDomains: string[] = []): boolean {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  return allowedDomains.some((domain) => {
    const cleanDomain = domain.trim().toLowerCase().replace(/^@/, "");
    return normalizedEmail.endsWith(`@${cleanDomain}`) || normalizedEmail.endsWith(`.${cleanDomain}`);
  });
}

/**
 * Find coupon definition from DB or static fallback
 */
export async function getCouponDefinition(code: string): Promise<CouponDefinition | null> {
  const upperCode = code.trim().toUpperCase();

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("coupons")
      .select("*")
      .ilike("code", upperCode)
      .eq("is_active", true)
      .maybeSingle();

    if (!error && data) {
      return {
        code: data.code.toUpperCase(),
        campaign: data.campaign || "marwadi_student_2026",
        discountType: data.discount_type || "percentage",
        discountValue: Number(data.discount_value) || 100,
        allowedDomains: Array.isArray(data.allowed_domains) ? data.allowed_domains : ["marwadiuniversity.ac.in"],
        allowedPlans: Array.isArray(data.allowed_plans) ? data.allowed_plans : ["pro_yearly", "pro"],
        description: data.description || "Student Discount Coupon",
        oneTimePerUser: data.max_uses_per_user === 1,
        isActive: data.is_active ?? true,
      };
    }
  } catch (err) {
    // Fall back to system coupons if table does not exist or connection fails
    console.warn("DB query for coupons failed, falling back to static config:", err);
  }

  return SYSTEM_COUPONS[upperCode] || null;
}

/**
 * Bulletproof check: Has user or email EVER redeemed ANY student coupon from this campaign?
 * Also checks if the user currently has an active Pro subscription so they can't stack years.
 */
export async function hasUserRedeemedCampaignOrActivePro(
  userId: string,
  userEmail: string,
  campaign: string = "marwadi_student_2026"
): Promise<{ redeemed: boolean; reason?: string }> {
  try {
    const admin = createAdminClient();
    const normalizedEmail = userEmail.trim().toLowerCase();

    // 1. Check if user already has an active Pro subscription
    const { data: subData } = await admin
      .from("subscriptions")
      .select("status, plan_tier, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    if (subData && subData.status === "active" && subData.plan_tier?.includes("pro")) {
      const periodEnd = subData.current_period_end ? new Date(subData.current_period_end) : null;
      if (!periodEnd || periodEnd > new Date()) {
        return {
          redeemed: true,
          reason: "Your account already has an active Pro subscription. You cannot stack additional passes.",
        };
      }
    }

    // 2. Check in coupon_redemptions by user_id OR email across ALL student campaign coupons
    const allCampaignCodes = Object.keys(SYSTEM_COUPONS);
    
    // Check by user_id or email
    const { data: redemptionData } = await admin
      .from("coupon_redemptions")
      .select("id, coupon_code, user_email")
      .or(`user_id.eq.${userId},user_email.ilike.${normalizedEmail}`);

    if (redemptionData && redemptionData.length > 0) {
      return {
        redeemed: true,
        reason: "You have already redeemed a student coupon. Offer is strictly limited to 1 pass per student.",
      };
    }

    // 3. Fallback audit check in usage_logs for ANY coupon claim event
    const { data: logData } = await admin
      .from("usage_logs")
      .select("id, tool_id")
      .eq("user_id", userId)
      .ilike("tool_id", "coupon_claim_%");

    if (logData && logData.length > 0) {
      return {
        redeemed: true,
        reason: "You have already claimed a student coupon on this account.",
      };
    }
  } catch (err) {
    console.warn("Redemption check error:", err);
  }

  return { redeemed: false };
}

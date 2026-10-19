export interface CouponDefinition {
  code: string;
  campaign: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  allowedDomains: string[];
  allowedPlans: string[];
  description: string;
  oneTimePerUser: boolean;
  isActive: boolean;
}

// All promotional coupons and offers removed / deactivated
export const SYSTEM_COUPONS: Record<string, CouponDefinition> = {};

export function isEmailDomainAllowed(email?: string | null, allowedDomains: string[] = []): boolean {
  return false;
}

export async function getCouponDefinition(code: string): Promise<CouponDefinition | null> {
  return null;
}

export interface RiskEvaluationResult {
  isAllowed: boolean;
  riskScore: number;
  confidenceScore: number;
  reason?: string;
}

export async function evaluateRedemptionRisk(
  userId: string,
  userEmail: string,
  campaign: string = "none",
  deviceFingerprint?: string | null,
  userAgent?: string | null
): Promise<RiskEvaluationResult> {
  return {
    isAllowed: false,
    riskScore: 100,
    confidenceScore: 0,
    reason: "No promotional campaigns are currently active.",
  };
}

export async function hasUserRedeemedCampaignOrActivePro(
  userId: string,
  userEmail: string,
  campaign: string = "none",
  deviceFingerprint?: string | null
): Promise<{ redeemed: boolean; reason?: string }> {
  return {
    redeemed: false,
  };
}

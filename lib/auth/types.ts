export type PlanTier = "free" | "pro_monthly" | "pro_yearly";

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  customerId?: string;
  subscriptionId?: string;
  planTier: PlanTier;
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

export interface UserCredits {
  userId: string;
  creditsBalance: number;
  bonusCredits: number;
  dailyQuotaLimit: number;
  totalAvailable: number;
  lastResetDate: string;
  isPro: boolean;
}

export interface GuestUsageState {
  anonId: string;
  remainingGuestRuns: number;
  maxGuestRuns: number;
  isLimitReached: boolean;
}

export interface ToolCostConfig {
  toolId: string;
  costInCredits: number;
  tierRequired?: PlanTier;
  allowGuestTrial: boolean;
  guestCost: number;
}

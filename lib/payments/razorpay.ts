import crypto from "crypto";

export interface PlanConfig {
  id: string;
  name: string;
  amount: number; // in paise (1 INR = 100 paise)
  currency: string;
  credits: number;
  isSubscription: boolean;
  periodDays?: number;
}

export const RAZORPAY_PLANS: Record<string, PlanConfig> = {
  starter_monthly: {
    id: "starter_monthly",
    name: "Boring Tools Starter (Monthly)",
    amount: 24900, // ₹249 (The Decoy)
    currency: "INR",
    credits: 100,
    isSubscription: true,
    periodDays: 30,
  },
  starter_yearly: {
    id: "starter_yearly",
    name: "Boring Tools Starter (Yearly)",
    amount: 238800, // ₹2,388 (~₹199/mo)
    currency: "INR",
    credits: 100,
    isSubscription: true,
    periodDays: 365,
  },
  pro_monthly: {
    id: "pro_monthly",
    name: "Boring Tools Pro (Monthly)",
    amount: 29900, // ₹299 (The Target - Only ₹50 more for 5x credits + Batch tools!)
    currency: "INR",
    credits: 500,
    isSubscription: true,
    periodDays: 30,
  },
  pro_yearly: {
    id: "pro_yearly",
    name: "Boring Tools Pro (Yearly)",
    amount: 298800, // ₹2,988 (~₹249/mo)
    currency: "INR",
    credits: 500,
    isSubscription: true,
    periodDays: 365,
  },
  credits_50: {
    id: "credits_50",
    name: "50 Bonus Credits Pack",
    amount: 9900, // ₹99
    currency: "INR",
    credits: 50,
    isSubscription: false,
  },
  credits_200: {
    id: "credits_200",
    name: "200 Bonus Credits Pack",
    amount: 24900, // ₹249 (Decoy)
    currency: "INR",
    credits: 200,
    isSubscription: false,
  },
  credits_500: {
    id: "credits_500",
    name: "500 Bonus Credits Pack",
    amount: 29900, // ₹299 (Target / Best Value)
    currency: "INR",
    credits: 500,
    isSubscription: false,
  },
  credits_100: {
    id: "credits_100",
    name: "100 Bonus Credits Pack",
    amount: 14900, // ₹149
    currency: "INR",
    credits: 100,
    isSubscription: false,
  },
};

/**
 * Calculate amount in paise and rupees for credit top-up using Decoy Effect framing:
 * - 10 credits: ₹25 (~₹2.50/credit)
 * - 50 credits: ₹99 (~₹1.98/credit)
 * - 100 credits: ₹149 (~₹1.49/credit)
 * - 200 credits: ₹249 (~₹1.25/credit) [THE DECOY]
 * - 500 credits: ₹299 (~₹0.60/credit) [THE TARGET - Only ₹50 more for 2.5x more credits!]
 */
export function calculateCustomCreditsAmount(creditsCount: number) {
  const credits = Math.max(10, Math.floor(Number(creditsCount) || 10));
  
  let amountRupees: number;
  if (credits <= 10) {
    amountRupees = 25;
  } else if (credits <= 50) {
    // ₹25 to ₹99
    amountRupees = Math.round(25 + ((credits - 10) / 40) * 74);
  } else if (credits <= 100) {
    // ₹99 to ₹149
    amountRupees = Math.round(99 + ((credits - 50) / 50) * 50);
  } else if (credits <= 200) {
    // ₹149 to ₹249 (Decoy tier)
    amountRupees = Math.round(149 + ((credits - 100) / 100) * 100);
  } else if (credits <= 500) {
    // ₹249 to ₹299 (Target value jump: only ₹50 more for 300 extra credits)
    amountRupees = Math.round(249 + ((credits - 200) / 300) * 50);
  } else {
    // For >500 credits: ₹299 + ₹0.50 per credit above 500
    amountRupees = Math.round(299 + (credits - 500) * 0.50);
  }

  const amountPaise = amountRupees * 100;
  return { amountPaise, amountRupees, credits };
}

/**
 * Get Razorpay API Credentials
 */
export function getRazorpayCredentials() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  return { keyId, keySecret };
}

/**
 * Create a new Razorpay Order via REST API
 */
export async function createRazorpayOrder(params: {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}) {
  const { keyId, keySecret } = getRazorpayCredentials();

  if (!keyId || !keySecret || keyId.includes("placeholder") || keySecret.includes("placeholder")) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) not configured in environment variables.");
  }

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency || "INR",
      receipt: params.receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
      notes: params.notes || {},
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.description || data?.error?.message || "Failed to create Razorpay order");
  }

  return data;
}

/**
 * Verify Razorpay HMAC-SHA256 Signature for Client-side verification
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayCredentials();
  if (!keySecret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf-8"),
    Buffer.from(params.signature, "utf-8")
  );
}

/**
 * Verify Razorpay Webhook Signature
 */
export function verifyWebhookSignature(rawBody: string, signature: string, secret?: string): boolean {
  const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch {
    return false;
  }
}

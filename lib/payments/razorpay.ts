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
  pro_monthly: {
    id: "pro_monthly",
    name: "Boring Tools Pro (Monthly)",
    amount: 49900, // ₹499
    currency: "INR",
    credits: 500,
    isSubscription: true,
    periodDays: 30,
  },
  pro_yearly: {
    id: "pro_yearly",
    name: "Boring Tools Pro (Yearly)",
    amount: 399900, // ₹3,999 (~₹333/mo)
    currency: "INR",
    credits: 500,
    isSubscription: true,
    periodDays: 365,
  },
  credits_100: {
    id: "credits_100",
    name: "100 Bonus Credits Pack",
    amount: 19900, // ₹199
    currency: "INR",
    credits: 100,
    isSubscription: false,
  },
};

/**
 * Calculate amount in paise and rupees for custom credit top-up (minimum 10 credits)
 * Baseline rate: ~₹1.99 / credit
 */
export function calculateCustomCreditsAmount(creditsCount: number) {
  const credits = Math.max(10, Math.floor(Number(creditsCount) || 10));
  const amountRupees = Math.max(20, Math.round(credits * 1.99));
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

"use client";

import { useState, useCallback } from "react";
import { useAuth } from "../../app/components/AuthProvider";
import { dispatchPaymentSuccess } from "../../app/components/PaymentSuccessModal";
import { showToast } from "../../app/components/ToastNotification";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Dynamically loads the Razorpay checkout script
 */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById("razorpay-checkout-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface CheckoutOptions {
  plan: string;
  billingCycle?: "monthly" | "annual" | "yearly";
  creditsCount?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useRazorpayCheckout() {
  const { user, openAuthModal, refreshUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const initiateCheckout = useCallback(
    async ({ plan, billingCycle = "monthly", creditsCount, onSuccess, onError }: CheckoutOptions) => {
      // 1. Guard: Check if user is signed in
      if (!user) {
        openAuthModal("Please sign in or create an account to upgrade to Pro.");
        return;
      }

      setIsProcessing(plan);

      try {
        // 2. Load script
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded && typeof window !== "undefined" && !window.Razorpay) {
          console.warn("Razorpay script could not be loaded from CDN.");
        }

        // 3. Request order creation
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, billingCycle, creditsCount }),
        });

        const orderData = await res.json();

        if (!res.ok || !orderData.success) {
          throw new Error(orderData.message || orderData.error || "Failed to initiate checkout");
        }

        // 4. Check if running in Sandbox Demo mode (keys not set)
        if (orderData.sandbox) {
          // Direct verify in sandbox mode
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              isSandbox: true,
              planTier: orderData.planTier,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            await refreshUser();
            onSuccess?.(verifyData);
            const now = new Date();
            const isYearly = orderData.planTier === "pro_yearly";
            const isAddon = orderData.planTier === "credits_100";
            const endDate = new Date(now.getTime() + (isYearly ? 365 : isAddon ? 0 : 30) * 86400000);
            const formatDate = (d: Date) =>
              d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

            dispatchPaymentSuccess({
              planTier: orderData.planTier,
              planName: orderData.planName || (isAddon ? "100 AI Credit Pack" : isYearly ? "Boring Tools Pro (Yearly)" : "Boring Tools Pro (Monthly)"),
              creditsAdded: isAddon ? 100 : 500,
              orderId: `ord_demo_${Date.now().toString().slice(-6)}`,
              paymentId: `pay_demo_${Date.now().toString().slice(-6)}`,
              amount: orderData.amount ? `₹${(orderData.amount / 100).toLocaleString("en-IN")}.00` : "₹499.00",
              currency: orderData.currency || "INR",
              userName: orderData.userName || "Customer",
              userEmail: orderData.userEmail || "",
              dateRange: isAddon ? "Lifetime Validity" : `Effective from ${formatDate(now)} to ${formatDate(endDate)}`,
              paymentTime: now.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              message: "Your subscription has been activated successfully.",
            });
          } else {
            onError?.(verifyData.message || "Upgrade failed");
            showToast(verifyData.message || "Upgrade failed", "error");
          }
          return;
        }

        // 5. Open Real Razorpay Modal
        if (!window.Razorpay) {
          throw new Error("Razorpay SDK not loaded. Check internet connection.");
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "BoringTools",
          description: orderData.planName || "Pro Subscription",
          order_id: orderData.orderId,
          prefill: {
            name: orderData.userName,
            email: orderData.userEmail,
          },
          theme: {
            color: "#ea580c",
          },
          handler: async function (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) {
            try {
              const verifyRes = await fetch("/api/checkout/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planTier: orderData.planTier,
                  customCredits: orderData.customCredits,
                }),
              });

              const verifyData = await verifyRes.json();

              if (verifyRes.ok && verifyData.success) {
                await refreshUser();
                onSuccess?.(verifyData);
                const now = new Date();
                const isYearly = orderData.planTier === "pro_yearly";
                const isAddon = orderData.planTier === "credits_100" || orderData.planTier === "custom_credits";
                const endDate = new Date(now.getTime() + (isYearly ? 365 : isAddon ? 0 : 30) * 86400000);

                const formatDate = (d: Date) =>
                  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

                const creditsCount = verifyData.creditsAdded || orderData.customCredits || (isAddon ? 100 : 500);

                dispatchPaymentSuccess({
                  planTier: orderData.planTier,
                  planName: orderData.planName || (isAddon ? `${creditsCount} AI Credit Pack` : isYearly ? "Boring Tools Pro (Yearly)" : "Boring Tools Pro (Monthly)"),
                  creditsAdded: creditsCount,
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  amount: orderData.amount ? `₹${(orderData.amount / 100).toLocaleString("en-IN")}.00` : "₹499.00",
                  currency: orderData.currency || "INR",
                  userName: orderData.userName || "Customer",
                  userEmail: orderData.userEmail || "",
                  dateRange: isAddon ? "Lifetime Validity" : `Effective from ${formatDate(now)} to ${formatDate(endDate)}`,
                  paymentTime: now.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }),
                  message: verifyData.message,
                });
              } else {
                throw new Error(verifyData.message || "Payment verification failed.");
              }
            } catch (vErr: any) {
              console.error("Verification error:", vErr);
              onError?.(vErr.message || "Payment verification failed");
              showToast(`Payment verification failed: ${vErr.message}`, "error");
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(null);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err: any) {
        console.error("Checkout initiation error:", err);
        onError?.(err.message || "Failed to open checkout");
        showToast(err.message || "Could not open checkout. Please try again.", "error");
      } finally {
        setIsProcessing(null);
      }
    },
    [user, openAuthModal, refreshUser]
  );

  return {
    initiateCheckout,
    isProcessing,
  };
}

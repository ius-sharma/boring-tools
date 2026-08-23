"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ConfettiCelebration from "./ConfettiCelebration";

export interface PaymentSuccessData {
  planTier: string;
  planName?: string;
  creditsAdded?: number;
  orderId?: string;
  paymentId?: string;
  amount?: string;
  currency?: string;
  userName?: string;
  userEmail?: string;
  dateRange?: string;
  paymentTime?: string;
  message?: string;
}

export const PAYMENT_SUCCESS_EVENT = "boring-tools:payment-success";

export function dispatchPaymentSuccess(detail: PaymentSuccessData) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PAYMENT_SUCCESS_EVENT, { detail }));
  }
}

export default function PaymentSuccessModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<PaymentSuccessData | null>(null);

  useEffect(() => {
    const handleSuccess = (e: Event) => {
      const customEvent = e as CustomEvent<PaymentSuccessData>;
      setData(
        customEvent.detail || {
          planTier: "pro_monthly",
          planName: "Boring Tools Pro (Monthly)",
          creditsAdded: 500,
          amount: "₹499.00",
        }
      );
      setIsOpen(true);
    };

    window.addEventListener(PAYMENT_SUCCESS_EVENT, handleSuccess);
    return () => window.removeEventListener(PAYMENT_SUCCESS_EVENT, handleSuccess);
  }, []);

  if (!isOpen || !data) return null;

  const isAddon = data.planTier === "credits_100";
  const planName =
    data.planName || (isAddon ? "100 AI Credit Pack" : "Boring Tools Pro (Monthly)");
  const creditsAmount = data.creditsAdded || (isAddon ? 100 : 500);
  const referenceId = data.orderId || `#BT-ORD-${Date.now().toString().slice(-6)}`;
  const transactionId = data.paymentId || `pay_${Date.now().toString().slice(-8)}`;
  const paymentTime =
    data.paymentTime ||
    new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  const dateRange =
    data.dateRange ||
    (isAddon
      ? "Lifetime Validity"
      : `Effective from ${new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })} to ${new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`);
  const amount = data.amount || (isAddon ? "₹199.00" : "₹499.00");
  const userName = data.userName || "Subscriber";
  const maskedEmail = data.userEmail
    ? data.userEmail.replace(/^(.{2})(.*)(@.*)$/, "$1***$3")
    : "•••• •••• •••• 4242";

  return (
    <>
      {/* Confetti Burst */}
      <ConfettiCelebration duration={4500} />

      {/* Full-screen Overlay with Theme Tokens — Screen fit without scrolling */}
      <div
        className="fixed inset-0 z-50 overflow-y-auto min-h-screen p-3 sm:p-5 flex flex-col justify-between items-center bg-[#f8fafc] text-[#0f172a] font-sans selection:bg-orange-100"
        style={{
          "--bg-page": "#f8fafc",
          "--bg-surface": "#ffffff",
          "--text-primary": "#0f172a",
          "--text-muted": "#64748b",
          "--accent": "#ea580c",
          "--accent-tint-outer": "rgba(234, 88, 12, 0.10)",
          "--accent-tint-mid": "rgba(234, 88, 12, 0.20)",
        } as React.CSSProperties}
      >
        {/* ─────────────────────────────────────────────────────────────
            1. TOP-LEFT BACK LINK (Shifted far left for natural alignment)
        ───────────────────────────────────────────────────────────── */}
        <div className="w-full max-w-5xl px-2 sm:px-6 pt-1 sm:pt-2 text-left">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 transition"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CENTERED CONTENT CONTAINER (Compact vertical rhythm)
        ───────────────────────────────────────────────────────────── */}
        <div className="w-full max-w-xl my-auto py-2 sm:py-4 flex flex-col items-center text-center">
          
          {/* ─────────────────────────────────────────────────────────
              2. SUCCESS BADGE (Concentric Rings ~108px outer glow)
          ───────────────────────────────────────────────────────── */}
          <div className="relative flex items-center justify-center w-[108px] h-[108px] rounded-full bg-[var(--accent-tint-outer)] mb-3 sm:mb-4">
            {/* Middle Concentric Ring */}
            <div className="flex items-center justify-center w-[76px] h-[76px] rounded-full bg-[var(--accent-tint-mid)]">
              {/* Innermost Solid Accent Circle */}
              <div className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-[var(--accent)] shadow-md shadow-orange-500/20">
                {/* White Checkmark Icon */}
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              3. CENTERED BOLD HEADLINE & 4. SUBTEXT
          ───────────────────────────────────────────────────────── */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Payment Successful
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 mb-4 sm:mb-5 max-w-md">
            {isAddon
              ? "Thank you for your purchase. 100 AI credits have been added to your balance."
              : "Thank you for subscribing. Your Boring Tools Pro plan is now active."}
          </p>

          {/* ─────────────────────────────────────────────────────────
              5. RECEIPT SUMMARY CARD (Max-width ~580px, Compact & Clean)
          ───────────────────────────────────────────────────────── */}
          <div className="w-full max-w-[580px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden text-left border-0">
            
            {/* ─── HEADER BAND (Top of Card) ─── */}
            <div className="w-full bg-gradient-to-r from-orange-100/80 via-orange-50/40 to-transparent p-4 sm:p-5 flex items-center justify-between gap-4">
              {/* Left Side: Plan Name + Date Range */}
              <div>
                <div className="text-slate-900 font-bold text-sm sm:text-base tracking-tight">
                  {planName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-normal">
                  {dateRange}
                </div>
              </div>

              {/* Right Side: Small circular checkmark badge */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-xs">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* ─── CARD BODY (Plain white/surface background) ─── */}
            <div className="p-5 sm:p-6 space-y-4">
              
              {/* Row 1: Three columns side by side (collapses on mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <div className="text-[11px] font-normal text-slate-500 uppercase tracking-wider">Reference ID</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                    {referenceId}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-normal text-slate-500 uppercase tracking-wider">Transaction ID</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                    {transactionId}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-normal text-slate-500 uppercase tracking-wider">Credits Added</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    +{creditsAmount} Credits
                  </div>
                </div>
              </div>

              {/* Row 2: Two columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                <div>
                  <div className="text-[11px] font-normal text-slate-500 uppercase tracking-wider">Payment Method</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    UPI / Card / NetBanking
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-normal text-slate-500 uppercase tracking-wider">Payment Time</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {paymentTime}
                  </div>
                </div>
              </div>

              {/* Full-width hairline divider */}
              <hr className="border-t border-slate-100 pt-1" />

              {/* Footer row: Left = Card SVG Icon + Cardholder name, Right = Paid amount */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
                {/* Left side: Sleek Card SVG Icon instead of emoji */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-slate-700"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.8} />
                      <line x1="2" y1="10" x2="22" y2="10" strokeWidth={1.8} />
                      <line x1="6" y1="15" x2="10" y2="15" strokeWidth={1.8} />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">{userName}</div>
                    <div className="text-[11px] text-slate-500">{maskedEmail}</div>
                  </div>
                </div>

                {/* Right side: Paid label above bold amount value */}
                <div className="text-left sm:text-right">
                  <div className="text-[11px] font-normal text-slate-500">Paid</div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900">
                    {amount}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              6. ACTION CTA BUTTONS BELOW RECEIPT CARD
          ───────────────────────────────────────────────────────── */}
          <div className="w-full max-w-[580px] mt-4 sm:mt-5 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/#find-tools"
              onClick={() => setIsOpen(false)}
              className="w-full sm:flex-1 h-[44px] bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 active:scale-[0.99]"
            >
              <span>Explore Pro AI Tools</span>
              <span className="font-mono text-sm">→</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto h-[44px] px-5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 transition active:scale-[0.99]"
            >
              Done
            </button>
          </div>
        </div>

        {/* Bottom anchor */}
        <div className="h-2" />
      </div>
    </>
  );
}

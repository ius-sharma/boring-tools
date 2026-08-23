"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";
import { useRazorpayCheckout } from "../../lib/payments/useRazorpay";
import { showToast } from "../components/ToastNotification";

interface HistoryItem {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
  orderId: string;
}

export default function BillingPage() {
  const { user, credits, subscription, refreshUser, openAuthModal } = useAuth();
  const { initiateCheckout, isProcessing } = useRazorpayCheckout();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [customCredits, setCustomCredits] = useState<number>(50);

  // Fetch billing history on mount
  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      try {
        const res = await fetch("/api/billing/history");
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, [user]);

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel subscription.");
      }

      await refreshUser();
      setIsCancelModalOpen(false);
      showToast("Subscription canceled. You retain Pro benefits until your billing period ends.", "info");

      // Reload history
      const histRes = await fetch("/api/billing/history");
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData.history || []);
      }
    } catch (err: any) {
      showToast(err.message || "Could not cancel subscription.", "error");
    } finally {
      setIsCanceling(false);
    }
  };

  const isPro = credits.isPro;
  const isCanceled = subscription?.status === "canceled";
  const planName =
    subscription?.planTier === "pro_yearly"
      ? "Boring Tools Pro (Yearly)"
      : isPro
      ? "Boring Tools Pro (Monthly)"
      : "Boring Tools Free Tier";

  const renewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      className="min-h-screen bg-white text-[#0f172a] font-sans selection:bg-orange-100 pb-20 sm:pb-28"
      style={{
        "--bg-page": "#ffffff",
        "--bg-surface": "#ffffff",
        "--text-primary": "#0f172a",
        "--text-muted": "#64748b",
        "--accent": "#ea580c",
      } as React.CSSProperties}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HERO / HEADER SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-10 sm:pt-32 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#ea580c] mb-3">
          Account & Billing
        </div>
        <h1 className="text-3xl sm:text-[38px] font-bold text-slate-900 tracking-tight leading-tight">
          Manage Subscription & Credits
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
          View your active plan, track credit quotas, purchase non-expiring top-ups, or manage billing settings.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ─────────────────────────────────────────────────────────────
            2. ACTIVE PLAN OVERVIEW CARD
        ───────────────────────────────────────────────────────────── */}
        <div className="border border-slate-200 bg-white rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {planName}
                </h2>
                {isPro && !isCanceled && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Active
                  </span>
                )}
                {isCanceled && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Cancels at period end
                  </span>
                )}
              </div>

              <div className="mt-3 text-xs sm:text-sm text-slate-600 space-y-1">
                {isPro ? (
                  <>
                    <p>
                      <strong>Billing Rate:</strong>{" "}
                      {subscription?.planTier === "pro_yearly" ? "₹3,999 / year" : "₹499 / month"} (Secured via Razorpay)
                    </p>
                    {renewalDate && (
                      <p className="text-slate-500">
                        {isCanceled ? "Pro access valid until:" : "Next auto-renewal date:"}{" "}
                        <span className="font-semibold text-slate-900">{renewalDate}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <p>
                    You are currently on the <strong>Free Plan</strong> with 10 free daily AI credits (resets every midnight).
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {isPro ? (
                <>
                  <Link
                    href="/pricing"
                    className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition shadow-xs"
                  >
                    Change Plan
                  </Link>

                  {!isCanceled && (
                    <button
                      type="button"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="px-4 py-2 text-xs sm:text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => initiateCheckout({ plan: "pro_monthly" })}
                  disabled={isProcessing !== null}
                  className="px-6 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-sm active:scale-[0.99] disabled:opacity-50"
                >
                  {isProcessing === "pro_monthly" ? "Opening Razorpay..." : "Upgrade to Pro (₹499/mo) →"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. REAL-TIME CREDITS BREAKDOWN (3-Column Grid)
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Plan Credits */}
          <div className="border border-slate-200 bg-white rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isPro ? "Monthly Plan Credits" : "Daily Free Credits"}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              ⚡ {credits.creditsBalance}{" "}
              <span className="text-sm font-normal text-slate-500">
                / {isPro ? "500" : "10"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {isPro ? "500 High-speed priority AI credits / month" : "10 free trial credits refreshed every night"}
            </p>
          </div>

          {/* Card 2: Bonus Add-on Credits */}
          <div className="border border-slate-200 bg-white rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lifetime Bonus Credits
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#ea580c] mt-2">
              🎁 {credits.bonusCredits}{" "}
              <span className="text-sm font-normal text-slate-500">Credits</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Non-expiring standalone top-up balance
            </p>
          </div>

          {/* Card 3: Total Available Balance */}
          <div className="border border-slate-200 bg-white rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Credits Available
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {credits.totalAvailable}{" "}
              <span className="text-sm font-normal text-slate-500">Executions</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Plan Credits + Bonus Credits combined
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. DYNAMIC CUSTOM ADD-ON TOP-UPS SECTION (Minimum 10 Credits)
        ───────────────────────────────────────────────────────────── */}
        <div className="border border-slate-200 bg-slate-50 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#ea580c] mb-1">
                Need Extra Credits?
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Custom AI Credits Top-Up
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Choose any custom number of credits (min 10). Standalone credits never expire and rollover forever.
              </p>

              {/* Quick Preset Buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500 mr-1">Quick Select:</span>
                {[10, 50, 100, 250, 500].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setCustomCredits(count)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                      customCredits === count
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {count} Credits
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Stepper & Live Price Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-5 flex-shrink-0">
              {/* Stepper + Input */}
              <div className="text-center sm:text-left">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Credits Amount
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomCredits((prev) => Math.max(10, prev - 10))}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-base flex items-center justify-center transition active:scale-95"
                    title="Decrease by 10"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={customCredits}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setCustomCredits(isNaN(val) ? 10 : val);
                    }}
                    className="w-20 h-8 px-2 text-center text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomCredits((prev) => prev + 10)}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-base flex items-center justify-center transition active:scale-95"
                    title="Increase by 10"
                  >
                    +
                  </button>
                </div>
                {customCredits < 10 && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">Min 10 credits</p>
                )}
              </div>

              {/* Price Calculation & Buy Button */}
              <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-5">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Price
                </div>
                <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                  ₹{Math.max(20, Math.round(customCredits * 1.99))}
                  <span className="text-xs font-normal text-slate-500 ml-1">one-time</span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    initiateCheckout({
                      plan: "custom_credits",
                      creditsCount: Math.max(10, customCredits),
                    })
                  }
                  disabled={isProcessing !== null || customCredits < 10}
                  className="mt-2.5 w-full sm:w-auto px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50 active:scale-[0.99]"
                >
                  {isProcessing === "custom_credits" ? "Opening..." : `Buy ${Math.max(10, customCredits)} Credits`}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            5. BILLING & INVOICE HISTORY TABLE
        ───────────────────────────────────────────────────────────── */}
        <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 sm:p-6 border-b border-slate-200 bg-white">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Billing & Transaction History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Recent subscription renewals, plan upgrades, and credit top-up receipts.
            </p>
          </div>

          {loadingHistory ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading transactions...</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-xs sm:text-sm text-slate-500">
              No transactions found on this account yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-5 sm:px-6">Date</th>
                    <th className="py-3 px-5 sm:px-6">Plan / Item</th>
                    <th className="py-3 px-5 sm:px-6">Order ID</th>
                    <th className="py-3 px-5 sm:px-6">Amount</th>
                    <th className="py-3 px-5 sm:px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-normal">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-5 sm:px-6 font-mono text-xs text-slate-600">{item.date}</td>
                      <td className="py-3.5 px-5 sm:px-6 font-medium text-slate-900">{item.description}</td>
                      <td className="py-3.5 px-5 sm:px-6 font-mono text-xs text-slate-500">{item.orderId}</td>
                      <td className="py-3.5 px-5 sm:px-6 font-semibold text-slate-900">{item.amount}</td>
                      <td className="py-3.5 px-5 sm:px-6 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status === "Paid" ? "✓ Paid" : item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CANCEL SUBSCRIPTION CONFIRMATION
      ───────────────────────────────────────────────────────────── */}
      {isCancelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsCancelModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Cancel Boring Tools Pro?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              If you cancel, you will continue to have Pro benefits (500+ credits, 100MB file uploads, priority servers) until{" "}
              <strong>{renewalDate || "the end of your current period"}</strong>. After that, your account will revert to the Free Plan (10 daily credits).
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={async () => {
                  setIsCanceling(true);
                  try {
                    const res = await fetch("/api/billing/reset-to-free", { method: "POST" });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message);
                    await refreshUser();
                    setIsCancelModalOpen(false);
                    showToast("Account downgraded to Free Plan (10 Daily + your Bonus Credits).", "success");
                  } catch (err: any) {
                    showToast(err.message || "Failed to reset.", "error");
                  } finally {
                    setIsCanceling(false);
                  }
                }}
                disabled={isCanceling}
                className="w-full sm:w-auto text-xs text-slate-500 hover:text-rose-600 underline text-center sm:text-left transition"
              >
                Downgrade to Free Immediately
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
                >
                  Keep Pro
                </button>

                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {isCanceling ? "Canceling..." : "Cancel at Period End"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

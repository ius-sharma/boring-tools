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
  const { user, credits, subscription, refreshUser, openAuthModal, logout } = useAuth();
  const { initiateCheckout, isProcessing } = useRazorpayCheckout();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [customCredits, setCustomCredits] = useState<number>(50);

  // DPDP Act 2023 Data Principal Rights states
  const [isExportingData, setIsExportingData] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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

  // DPDP Section 11: Right to Access (Download JSON)
  const handleDownloadData = async () => {
    if (!user) {
      openAuthModal("Sign in to download your personal data archive.");
      return;
    }
    setIsExportingData(true);
    try {
      const res = await fetch("/api/user/data-rights");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to download your data.");
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "boringtools-user-data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Personal data archive downloaded (DPDP Act Sec 11).", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to download personal data.", "error");
    } finally {
      setIsExportingData(false);
    }
  };

  // DPDP Section 12(2): Right to Erasure (Delete Account & Purge Data)
  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    try {
      const res = await fetch("/api/user/data-rights", { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account.");
      }

      // Purge all browser local storage and session storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageErr) {
        console.warn("Storage purge warning:", storageErr);
      }

      setIsDeleteModalOpen(false);
      showToast("Account and personal data completely erased under DPDP Act 2023.", "success");

      // Sign out and reload/redirect
      await logout();
      window.location.href = "/";
    } catch (err: any) {
      showToast(err.message || "Could not delete account. Please try again.", "error");
      setIsDeletingAccount(false);
    }
  };

  const isPro = credits.isPro;
  const isCanceled = subscription?.status === "canceled";
  const planName =
    subscription?.planTier === "pro_yearly"
      ? "Boring Tools Pro (Yearly)"
      : subscription?.planTier === "starter_yearly"
      ? "Boring Tools Starter (Yearly)"
      : subscription?.planTier === "starter_monthly"
      ? "Boring Tools Starter (Monthly)"
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
                      {subscription?.planTier === "pro_yearly" ? "₹3,499 / year" : "₹399 / month"} (Secured via Razorpay)
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
                  {isProcessing === "pro_monthly" ? "Opening Razorpay..." : "Upgrade to Pro (₹399/mo) →"}
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
                {[
                  { count: 10, label: "10" },
                  { count: 50, label: "50" },
                  { count: 100, label: "100" },
                  { count: 200, label: "200" },
                  { count: 500, label: "500" },
                ].map((tier) => (
                  <button
                    key={tier.count}
                    type="button"
                    onClick={() => setCustomCredits(tier.count)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                      customCredits === tier.count
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {tier.label} {tier.count >= 500 ? "Credits (Best Value)" : "Credits"}
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
                  ₹{(() => {
                    const c = Math.max(10, customCredits);
                    if (c <= 10) return 25;
                    if (c <= 50) return Math.round(25 + ((c - 10) / 40) * 74);
                    if (c <= 100) return Math.round(99 + ((c - 50) / 50) * 50);
                    if (c <= 200) return Math.round(149 + ((c - 100) / 100) * 100);
                    if (c <= 500) return Math.round(249 + ((c - 200) / 300) * 50);
                    return Math.round(299 + (c - 500) * 0.50);
                  })()}
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

        {/* ─────────────────────────────────────────────────────────────
            6. PRIVACY & DATA PRINCIPAL RIGHTS CARD (DPDP ACT 2023)
        ───────────────────────────────────────────────────────────── */}
        <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
                  DPDP Act 2023 Compliant
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">Data Principal Rights</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                Privacy &amp; Data Principal Rights
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pursuant to India&apos;s Digital Personal Data Protection Act, 2023, you retain absolute ownership and statutory control over your personal data.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Right to Access Card (Section 11) */}
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-slate-50/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs">
                      📥
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      Right to Access (Section 11)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Obtain a machine-readable summary of your personal data processed by BoringTools, including identity metadata, credit balance, plan tier, and tool usage logs.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  {user ? (
                    <button
                      type="button"
                      onClick={handleDownloadData}
                      disabled={isExportingData}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
                    >
                      {isExportingData ? (
                        <>
                          <svg className="animate-spin -ml-0.5 mr-1 h-3.5 w-3.5 text-slate-700" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Exporting JSON...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Download My Data</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAuthModal("Sign in to download your personal data archive")}
                      className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium rounded-xl transition"
                    >
                      Sign In to Download Data
                    </button>
                  )}
                </div>
              </div>

              {/* Right to Erasure Card (Section 12(2)) */}
              <div className="p-4 sm:p-5 rounded-xl border border-rose-200/80 bg-rose-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs">
                      🗑️
                    </div>
                    <h4 className="text-sm font-semibold text-rose-950">
                      Right to Erasure (Section 12(2))
                    </h4>
                  </div>
                  <p className="text-xs text-rose-900/80 leading-relaxed">
                    Permanently delete your account, authentication tokens, profile attributes, credit balances, and tool audit logs from our databases and local browser cache.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-rose-200/60">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmText("");
                        setIsDeleteModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete Account &amp; Purge Data</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAuthModal("Sign in to manage your account")}
                      className="px-4 py-2 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl transition"
                    >
                      Sign In to Manage Account
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right to Nominate Notice (Section 14) */}
            <div className="flex items-start gap-3 p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-950 leading-relaxed">
              <div className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-900">
                  Right to Nominate (Section 14, DPDP Act 2023)
                </p>
                <p className="mt-0.5 text-amber-800">
                  You have the statutory right to nominate any individual who shall, in the event of death or incapacity, exercise your rights as a Data Principal. To designate or modify a nominee for your BoringTools account, please contact our Data Protection Officer directly at{" "}
                  <a
                    href="mailto:grievance@boringtoolsai.com?subject=DPDP%20Nomination%20Request"
                    className="font-semibold underline hover:text-amber-950"
                  >
                    grievance@boringtoolsai.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
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

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CONFIRM ACCOUNT DELETION & DATA PURGE (DPDP SEC 12(2))
      ───────────────────────────────────────────────────────────── */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => !isDeletingAccount && setIsDeleteModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 sm:p-7 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Delete Account &amp; Purge All Data?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              In accordance with <strong>Section 12(2) of the DPDP Act 2023</strong>, this will immediately and permanently erase your account, active subscriptions, purchased credit balances, and all activity logs.
            </p>

            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              ⚠️ <strong>Warning:</strong> This action is irreversible. All remaining credits and history will be permanently forfeited.
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Type <span className="font-mono font-bold text-rose-600 select-all">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                disabled={isDeletingAccount}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeletingAccount}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || isDeletingAccount}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                {isDeletingAccount ? "Erasing Data..." : "Permanently Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

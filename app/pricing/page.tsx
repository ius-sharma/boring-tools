"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";

export default function PricingPage() {
  const [proBillingCycle, setProBillingCycle] = useState<"monthly" | "annual">("annual");
  const { user, openAuthModal } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Monitor scroll position to show sticky comparison sub-header ONLY while viewing the comparison table
  useEffect(() => {
    const handleScroll = () => {
      if (!cardsRef.current || !tableRef.current) return;
      const cardsRect = cardsRef.current.getBoundingClientRect();
      const tableRect = tableRef.current.getBoundingClientRect();

      // Show only when user has scrolled past cards AND is still inside the comparison table
      const isPastCards = cardsRect.bottom < 90;
      const isBeforeTableEnd = tableRect.bottom > 140;

      setShowStickyHeader(isPastCards && isBeforeTableEnd);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAction = async (planKey: string) => {
    if (planKey === "free") {
      if (!user) {
        openAuthModal("Create a free account to unlock 10 daily AI credits.");
      } else {
        window.location.href = "/";
      }
      return;
    }

    if (planKey === "enterprise") {
      window.location.href = "/contact";
      return;
    }

    if (!user) {
      openAuthModal("Please sign in or create a free account to upgrade to Pro.");
      return;
    }

    setCheckoutLoading(planKey);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billingCycle: proBillingCycle }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Payment checkout is in test mode. Stay tuned!");
      }
    } catch {
      alert("Payment service initializing. Please try again in a moment.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Reusable Single-Family Icons (Grayscale + Single Accent Checkmark)
  const CheckIcon = () => (
    <svg
      className="w-4 h-4 text-[#ea580c] flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );

  const DashIcon = () => (
    <span className="text-slate-300 font-medium text-base select-none">—</span>
  );

  return (
    <div
      className="min-h-screen bg-white text-[#0f172a]"
      style={
        {
          "--bg-primary": "#ffffff",
          "--bg-surface": "#ffffff",
          "--bg-subtle": "#f8fafc",
          "--text-primary": "#0f172a",
          "--text-muted": "#64748b",
          "--accent": "#ea580c",
          "--accent-hover": "#c2410c",
          "--border-subtle": "#e2e8f0",
          "--border-hairline": "rgba(226, 232, 240, 0.8)",
        } as React.CSSProperties
      }
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Large centered H1 + 1-line subtext)
          Generous padding (~120px desktop, ~64px mobile)
      ───────────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-12 sm:pt-28 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Use 70+ tools for free forever. Upgrade to Pro for high-speed AI power, batch processing, and 100MB file limits.
        </p>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. PRICING CARDS ROW (3 equal-width cards)
      ───────────────────────────────────────────────────────────── */}
      <section ref={cardsRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* ──── CARD 1: FREE (Starter) ──── */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              {/* Plan Name */}
              <div className="flex items-center justify-between h-8 mb-4">
                <span className="text-lg font-bold text-slate-900">Free</span>
              </div>

              {/* Price */}
              <div className="mb-2">
                <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">₹0</div>
                <div className="text-xs text-slate-500 font-medium mt-1">forever free</div>
              </div>

              {/* One-line Description */}
              <p className="text-sm text-slate-600 mt-3 mb-6 min-h-[40px]">
                Essential client utilities and daily AI trial quota for individuals.
              </p>

              {/* Primary CTA (ONLY ONE CARD GETS FILLED ACCENT BUTTON) */}
              <button
                type="button"
                onClick={() => handleAction("free")}
                className="w-full py-2.5 px-4 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-semibold rounded-xl transition shadow-sm"
              >
                {user ? "Current Plan" : "Get started free"}
              </button>

              {/* 1px Hairline Divider */}
              <hr className="my-6 border-slate-200" />

              {/* Included in Plan */}
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Included in Free:
              </div>

              {/* Checklist */}
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>70+ client-side tools (100% free forever)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>10 daily free AI credits (with free account)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>Standard 5MB file upload limit</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>Standard cloud processing speed</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>Community support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ──── CARD 2: PRO (Power Users) ──── */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between relative">
            <div>
              {/* Plan Name + INLINE Segmented Toggle (Right-aligned next to plan name) */}
              <div className="flex items-center justify-between h-8 mb-4">
                <span className="text-lg font-bold text-slate-900">Pro</span>
                
                {/* Inline Toggle */}
                <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setProBillingCycle("monthly")}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      proBillingCycle === "monthly"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setProBillingCycle("annual")}
                    className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                      proBillingCycle === "annual"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <span>Annual</span>
                    <span className="text-[10px] font-bold text-[#ea580c]">-30%</span>
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-2">
                <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                  {proBillingCycle === "annual" ? "₹291" : "₹399"}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  {proBillingCycle === "annual"
                    ? "per month, billed annually (₹3,499/yr)"
                    : "per month, billed monthly"}
                </div>
              </div>

              {/* One-line Description */}
              <p className="text-sm text-slate-600 mt-3 mb-6 min-h-[40px]">
                High-speed AI limits, heavy file processing, and priority infrastructure.
              </p>

              {/* Secondary / Outline Button */}
              <button
                type="button"
                onClick={() => handleAction("pro")}
                disabled={checkoutLoading !== null}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold rounded-xl border border-slate-300 transition shadow-xs disabled:opacity-50"
              >
                {checkoutLoading === "pro" ? "Loading..." : "Upgrade to Pro"}
              </button>

              {/* 1px Hairline Divider */}
              <hr className="my-6 border-slate-200" />

              {/* Included in Plan */}
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Included in Pro:
              </div>

              {/* Checklist */}
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span><strong>500+ High-speed AI credits</strong> / month</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span><strong>100MB file size limits</strong> (PDFs, Audio, Docs)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span><strong>Batch processing mode</strong> (up to 50 files)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span><strong>100% Ad-free</strong> clean interface</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span><strong>Priority cloud execution queue</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>VIP early access to newly released tools</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ──── CARD 3: TEAM & ENTERPRISE ──── */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              {/* Plan Name */}
              <div className="flex items-center justify-between h-8 mb-4">
                <span className="text-lg font-bold text-slate-900">Team & Enterprise</span>
              </div>

              {/* Price */}
              <div className="mb-2">
                <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Custom</div>
                <div className="text-xs text-slate-500 font-medium mt-1">per organization / year</div>
              </div>

              {/* One-line Description */}
              <p className="text-sm text-slate-600 mt-3 mb-6 min-h-[40px]">
                Dedicated API throughput, custom rate limits, and SLA support for teams.
              </p>

              {/* Neutral Dark "Contact Us" Style Button */}
              <button
                type="button"
                onClick={() => handleAction("enterprise")}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition shadow-xs"
              >
                Contact sales
              </button>

              {/* 1px Hairline Divider */}
              <hr className="my-6 border-slate-200" />

              {/* Included in Plan */}
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Included in Team:
              </div>

              {/* Checklist */}
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>Unlimited shared team credit pool</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>Dedicated API key access & webhooks</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>500MB file processing limit</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>99.9% uptime SLA & dedicated manager</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>Custom GST invoice & security audit review</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. STICKY COMPARISON SUB-HEADER (Desktop only)
          Smooth slide-down transition when scrolling past cards
      ───────────────────────────────────────────────────────────── */}
      <div
        className={`hidden md:block sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all duration-300 ease-out transform ${
          showStickyHeader
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-4 items-center py-3">
            {/* Left Title Column */}
            <div className="col-span-4 font-bold text-sm text-slate-900">
              Compare all features
            </div>
            
            {/* Free CTA Column */}
            <div className="col-span-2 text-center">
              <button
                type="button"
                onClick={() => handleAction("free")}
                className="w-full py-1.5 px-3 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold rounded-lg transition"
              >
                Get Free
              </button>
            </div>

            {/* Pro CTA Column */}
            <div className="col-span-3 text-center">
              <button
                type="button"
                onClick={() => handleAction("pro")}
                className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-900 text-xs font-semibold rounded-lg border border-slate-300 transition"
              >
                Upgrade Pro ({proBillingCycle === "annual" ? "₹291/mo" : "₹399/mo"})
              </button>
            </div>

            {/* Enterprise CTA Column */}
            <div className="col-span-3 text-center">
              <button
                type="button"
                onClick={() => handleAction("enterprise")}
                className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. FULL FEATURE COMPARISON TABLE
          Left column fixed-width (~280px) + right columns per plan
      ───────────────────────────────────────────────────────────── */}
      <section ref={tableRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
          <table className="w-full text-left border-collapse min-w-[640px]">
            {/* Table Column Headers */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-4 px-6 w-[280px] text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">
                  Feature Overview
                </th>
                <th className="py-4 px-6 text-center text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Free
                </th>
                <th className="py-4 px-6 text-center text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Pro
                </th>
                <th className="py-4 px-6 text-center text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Team & Enterprise
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              
              {/* ─── SECTION 1: CORE UTILITIES ─── */}
              <tr className="bg-slate-50/50">
                <td colSpan={4} className="py-5 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 pt-8">
                  Core Tools & Platform
                </td>
              </tr>
              
              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">70+ Client-Side Utilities</div>
                  <div className="text-xs text-slate-500 mt-0.5">Calculators, formatters, offline converters & timers</div>
                </td>
                <td className="py-4 px-6 text-center"><div className="flex justify-center"><CheckIcon /></div></td>
                <td className="py-4 px-6 text-center"><div className="flex justify-center"><CheckIcon /></div></td>
                <td className="py-4 px-6 text-center"><div className="flex justify-center"><CheckIcon /></div></td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Document & PDF Tools</div>
                  <div className="text-xs text-slate-500 mt-0.5">PDF intelligence, DOC conversion & text extraction</div>
                </td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">Basic (5MB)</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900">Advanced (100MB)</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900">Enterprise (500MB)</td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Batch Processing Mode</div>
                  <div className="text-xs text-slate-500 mt-0.5">Process multiple images or documents simultaneously</div>
                </td>
                <td className="py-4 px-6 text-center"><DashIcon /></td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900">Up to 50 files</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900">Unlimited batch</td>
              </tr>

              {/* ─── SECTION 2: AI & COMPUTE QUOTAS ─── */}
              <tr className="bg-slate-50/50">
                <td colSpan={4} className="py-5 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 pt-8">
                  AI & Compute Quotas
                </td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Monthly AI Credits</div>
                  <div className="text-xs text-slate-500 mt-0.5">Allocated credits for server-side AI & Groq tools</div>
                </td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">10 / day (300/mo)</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900">500+ / month</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900">Custom Pool</td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Model Tiers</div>
                  <div className="text-xs text-slate-500 mt-0.5">LLM reasoning and prompt architecture capacity</div>
                </td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">Standard 8B</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900">High-Capacity 70B</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900">Dedicated 70B + Custom</td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Rate Limits</div>
                  <div className="text-xs text-slate-500 mt-0.5">Maximum API requests allowed per minute</div>
                </td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">5 req / min</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900">60 req / min</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900">Custom / Unlimited</td>
              </tr>

              {/* ─── SECTION 3: INFRASTRUCTURE & SUPPORT ─── */}
              <tr className="bg-slate-50/50">
                <td colSpan={4} className="py-5 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 pt-8">
                  Infrastructure & Support
                </td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Ad-Free Experience</div>
                  <div className="text-xs text-slate-500 mt-0.5">Clean, zero-distraction workspace without banner ads</div>
                </td>
                <td className="py-4 px-6 text-center"><DashIcon /></td>
                <td className="py-4 px-6 text-center"><div className="flex justify-center"><CheckIcon /></div></td>
                <td className="py-4 px-6 text-center"><div className="flex justify-center"><CheckIcon /></div></td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Priority Cloud Queue</div>
                  <div className="text-xs text-slate-500 mt-0.5">Skip processing queues during peak server traffic</div>
                </td>
                <td className="py-4 px-6 text-center"><DashIcon /></td>
                <td className="py-4 px-6 text-center"><div className="flex justify-center"><CheckIcon /></div></td>
                <td className="py-4 px-6 text-center"><div className="flex justify-center"><CheckIcon /></div></td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Support Channel</div>
                  <div className="text-xs text-slate-500 mt-0.5">Assistance with troubleshooting and integrations</div>
                </td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">Community</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900">Priority Email</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900">Dedicated Slack / SLA</td>
              </tr>

            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. ADD-ONS / EXPANSION SECTION
          Centered eyebrow label → H2 → subtext (same rhythm as hero)
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-t border-b border-slate-200 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow Label */}
          <div className="text-xs font-bold uppercase tracking-widest text-[#ea580c] mb-2">
            ADD-ONS & TOP-UPS
          </div>
          
          {/* H2 */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Need extra credits without a monthly subscription?
          </h2>

          {/* Subtext */}
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Purchase standalone credit packs that never expire. Add-on credits work with both Free and Pro accounts.
          </p>

          {/* Add-on Card */}
          <div className="mt-10 max-w-md mx-auto bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div>
              <div className="text-base font-bold text-slate-900">100 AI Credit Pack</div>
              <div className="text-xs text-slate-500 mt-0.5">Non-expiring standalone credit top-up</div>
              <div className="text-lg font-extrabold text-slate-900 mt-2">
                ₹99 <span className="text-xs font-normal text-slate-500">($1.99) one-time</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAction("credit_pack_100")}
              disabled={checkoutLoading !== null}
              className="w-full sm:w-auto py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-xs flex-shrink-0"
            >
              {checkoutLoading === "credit_pack_100" ? "Loading..." : "Buy 100 Credits"}
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FAQS SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
              Will my favorite client tools stay free forever?
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Yes, absolutely! Over 70+ client-side tools (calculators, formatters, offline image converters) run 100% inside your browser and will always be completely free with unlimited executions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
              How do AI credits work?
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Server-side tools (like PDF Intelligence, Document Data Extractor, Resume Bullet Rewriter) consume 1 credit per execution. Free accounts receive 10 daily credits refreshed automatically at midnight. Pro members receive 500+ monthly credits with high-speed priority servers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
              What payment methods are supported?
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              We accept UPI, Google Pay, PhonePe, Paytm, RuPay/Visa/Mastercard cards, NetBanking, and all international credit & debit cards through 256-bit encrypted checkout.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
              Can I cancel my subscription anytime?
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Yes, with a single click at any time. You will continue to have Pro benefits until the end of your billing cycle without any penalty or recurring charges.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";
import { useRazorpayCheckout } from "../../lib/payments/useRazorpay";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const { user, openAuthModal, credits, subscription } = useAuth();
  const { initiateCheckout, isProcessing } = useRazorpayCheckout();
  const [customCredits, setCustomCredits] = useState<number>(50);
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

    if (planKey === "custom_credits" || planKey === "credit_pack_100" || planKey === "credits_100") {
      await initiateCheckout({
        plan: "custom_credits",
        creditsCount: Math.max(10, customCredits),
      });
      return;
    }

    if (planKey === "starter") {
      await initiateCheckout({ plan: "starter", billingCycle });
      return;
    }

    // Pro plan
    await initiateCheckout({ plan: "pro", billingCycle });
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
          1. HERO SECTION (Large centered H1 + Toggle)
      ───────────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-10 sm:pt-24 sm:pb-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Use 70+ tools for free forever. Upgrade for high-speed AI capacity, batch processing, and 100MB file limits.
        </p>

        {/* Global Monthly / Annual Toggle */}
        <div className="mt-8 inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-lg transition ${
              billingCycle === "monthly"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Monthly billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Annual billing</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-100 text-[#ea580c] rounded-md">Save 20%</span>
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. PRICING CARDS ROW (3 equal-width cards)
      ───────────────────────────────────────────────────────────── */}
      <section ref={cardsRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
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

              {/* CTA */}
              <button
                type="button"
                onClick={() => handleAction("free")}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold rounded-xl transition shadow-xs"
              >
                {user && !credits.isPro ? "Current Plan" : "Get started free"}
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

          {/* ──── CARD 2: STARTER (The Decoy) ──── */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              {/* Plan Name */}
              <div className="flex items-center justify-between h-8 mb-4">
                <span className="text-lg font-bold text-slate-900">Starter</span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Essential</span>
              </div>

              {/* Price */}
              <div className="mb-2">
                <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                  {billingCycle === "annual" ? "₹199" : "₹249"}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  {billingCycle === "annual"
                    ? "per month, billed annually (₹2,388/yr)"
                    : "per month, billed monthly"}
                </div>
              </div>

              {/* One-line Description */}
              <p className="text-sm text-slate-600 mt-3 mb-6 min-h-[40px]">
                Light AI toolkit with ad-free workspace for casual everyday usage.
              </p>

              {/* Secondary CTA Button */}
              <button
                type="button"
                onClick={() => handleAction("starter")}
                disabled={isProcessing !== null}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold rounded-xl border border-slate-300 transition shadow-xs disabled:opacity-75 active:scale-[0.99]"
              >
                {isProcessing === "starter" ? "Opening..." : "Get Starter"}
              </button>

              {/* 1px Hairline Divider */}
              <hr className="my-6 border-slate-200" />

              {/* Included in Plan */}
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Included in Starter:
              </div>

              {/* Checklist */}
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span><strong>100 High-speed AI credits</strong> / month</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span><strong>25MB file upload limits</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span><strong>100% Ad-free</strong> clean interface</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>Standard cloud processing speed</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>Email support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ──── CARD 3: PRO (The Target / Most Popular - Highlighted) ──── */}
          <div className="bg-white rounded-2xl p-7 border-2 border-[#ea580c] shadow-md flex flex-col justify-between relative ring-1 ring-[#ea580c]/10">
            {/* Top Center Floating Highlight Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ea580c] text-white text-[11px] font-bold py-0.5 px-3 rounded-full shadow-xs uppercase tracking-wider whitespace-nowrap">
              Most Popular
            </div>

            <div>
              {/* Plan Name */}
              <div className="flex items-center justify-between h-8 mb-4">
                <span className="text-lg font-bold text-slate-900">Pro</span>
                <span className="text-xs font-semibold text-[#ea580c] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                  5x Credits
                </span>
              </div>

              {/* Price */}
              <div className="mb-2">
                <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                  {billingCycle === "annual" ? "₹249" : "₹299"}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  {billingCycle === "annual"
                    ? "per month, billed annually (₹2,988/yr)"
                    : "per month, billed monthly"}
                </div>
              </div>

              {/* One-line Description */}
              <p className="text-sm text-slate-600 mt-3 mb-6 min-h-[40px]">
                High-speed AI limits, heavy file processing, and priority cloud infrastructure.
              </p>

              {/* Primary Filled Accent Button */}
              <button
                type="button"
                onClick={() => handleAction("pro")}
                disabled={isProcessing !== null || credits.isPro}
                className={`w-full py-2.5 px-4 text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-75 ${
                  credits.isPro
                    ? "bg-slate-100 text-slate-500 border border-slate-200 cursor-default"
                    : "bg-[#ea580c] hover:bg-[#c2410c] text-white active:scale-[0.99]"
                }`}
              >
                {credits.isPro
                  ? "✓ Current Plan"
                  : isProcessing === "pro"
                  ? "Initializing Checkout..."
                  : "Upgrade to Pro"}
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
                  <span><strong>Priority cloud execution queue</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span><strong>100% Ad-free</strong> clean interface</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon />
                  <span>VIP early access to newly released tools</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* ──── ENTERPRISE & TEAM BANNER ──── */}
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">Need Custom Limits, Team Workspaces, or API Access?</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 text-slate-700 uppercase">Enterprise</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Dedicated API throughput, unlimited shared team credit pool, 500MB upload limits, 99.9% uptime SLA, and custom GST invoices.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleAction("enterprise")}
            className="w-full md:w-auto py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap shadow-xs active:scale-[0.99]"
          >
            Contact enterprise sales →
          </button>
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
            <div className="col-span-3 font-bold text-sm text-slate-900">
              Compare all features
            </div>
            
            {/* Free CTA Column */}
            <div className="col-span-3 text-center">
              <button
                type="button"
                onClick={() => handleAction("free")}
                className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg transition"
              >
                Get Free
              </button>
            </div>

            {/* Starter CTA Column */}
            <div className="col-span-3 text-center">
              <button
                type="button"
                onClick={() => handleAction("starter")}
                disabled={isProcessing !== null}
                className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-900 text-xs font-semibold rounded-lg border border-slate-300 transition disabled:opacity-75"
              >
                {isProcessing === "starter" ? "Loading..." : `Get Starter (${billingCycle === "annual" ? "₹199/mo" : "₹249/mo"})`}
              </button>
            </div>

            {/* Pro CTA Column */}
            <div className="col-span-3 text-center">
              <button
                type="button"
                onClick={() => handleAction("pro")}
                disabled={isProcessing !== null || credits.isPro}
                className="w-full py-1.5 px-3 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold rounded-lg transition disabled:opacity-75 shadow-xs"
              >
                {credits.isPro
                  ? "Current Plan"
                  : isProcessing === "pro"
                  ? "Loading..."
                  : `Upgrade Pro (${billingCycle === "annual" ? "₹249/mo" : "₹299/mo"})`}
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
                  Starter (₹249/mo)
                </th>
                <th className="py-4 px-6 text-center text-xs font-bold text-slate-900 uppercase tracking-wider bg-orange-50/40">
                  Pro (₹299/mo)
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
                <td className="py-4 px-6 text-center bg-orange-50/20"><div className="flex justify-center"><CheckIcon /></div></td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Document & PDF Tools</div>
                  <div className="text-xs text-slate-500 mt-0.5">PDF intelligence, DOC conversion & text extraction</div>
                </td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">Basic (5MB)</td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">Standard (25MB)</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900 bg-orange-50/20">Advanced (100MB)</td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Batch Processing Mode</div>
                  <div className="text-xs text-slate-500 mt-0.5">Process multiple images or documents simultaneously</div>
                </td>
                <td className="py-4 px-6 text-center"><DashIcon /></td>
                <td className="py-4 px-6 text-center"><DashIcon /></td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900 bg-orange-50/20">Up to 50 files</td>
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
                <td className="py-4 px-6 text-center text-xs text-slate-600">100 / month</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900 bg-orange-50/20">500+ / month</td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Model Tiers</div>
                  <div className="text-xs text-slate-500 mt-0.5">LLM reasoning and prompt architecture capacity</div>
                </td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">Standard 8B</td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">Standard 8B</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900 bg-orange-50/20">High-Capacity 70B</td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Rate Limits</div>
                  <div className="text-xs text-slate-500 mt-0.5">Maximum API requests allowed per minute</div>
                </td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">5 req / min</td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">20 req / min</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900 bg-orange-50/20">60 req / min</td>
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
                <td className="py-4 px-6 text-center bg-orange-50/20"><div className="flex justify-center"><CheckIcon /></div></td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Priority Cloud Queue</div>
                  <div className="text-xs text-slate-500 mt-0.5">Skip processing queues during peak server traffic</div>
                </td>
                <td className="py-4 px-6 text-center"><DashIcon /></td>
                <td className="py-4 px-6 text-center"><DashIcon /></td>
                <td className="py-4 px-6 text-center bg-orange-50/20"><div className="flex justify-center"><CheckIcon /></div></td>
              </tr>

              <tr>
                <td className="py-4 px-6 sticky left-0 bg-white z-10">
                  <div className="font-semibold text-slate-900">Support Channel</div>
                  <div className="text-xs text-slate-500 mt-0.5">Assistance with troubleshooting and integrations</div>
                </td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">Community</td>
                <td className="py-4 px-6 text-center text-xs text-slate-600">Standard Email</td>
                <td className="py-4 px-6 text-center text-xs font-semibold text-slate-900 bg-orange-50/20">Priority VIP Email</td>
              </tr>

            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. ADD-ONS / EXPANSION SECTION (Custom Credits, Min 10)
      ───────────────────────────────────────────────────────────── */}
      <section id="addons" className="bg-slate-50 border-t border-b border-slate-200 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
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
            Choose any custom number of standalone credits (minimum 10). Standalone credits never expire and rollover forever with both Free and Pro accounts.
          </p>

          {/* Dynamic Custom Add-on Card */}
          <div className="mt-10 max-w-2xl mx-auto bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 text-left">
            <div>
              <div className="text-base font-bold text-slate-900">Custom AI Credits Top-Up</div>
              <div className="text-xs text-slate-500 mt-0.5">Non-expiring standalone credit top-up</div>
              
              {/* Preset buttons */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
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
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border transition ${
                      customCredits === tier.count
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper + Dynamic Buy Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Credits (min 10)
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCustomCredits((prev) => Math.max(10, prev - 10))}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center transition active:scale-95"
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
                    className="w-16 h-7 px-1 text-center text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomCredits((prev) => prev + 10)}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center transition active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-center sm:text-right w-full sm:w-auto">
                <div className="text-sm font-extrabold text-slate-900">
                  ₹{(() => {
                    const c = Math.max(10, customCredits);
                    if (c <= 10) return 25;
                    if (c <= 50) return Math.round(25 + ((c - 10) / 40) * 74);
                    if (c <= 100) return Math.round(99 + ((c - 50) / 50) * 50);
                    if (c <= 200) return Math.round(149 + ((c - 100) / 100) * 100);
                    if (c <= 500) return Math.round(249 + ((c - 200) / 300) * 50);
                    return Math.round(299 + (c - 500) * 0.50);
                  })()}
                  <span className="text-[11px] font-normal text-slate-500 ml-1">one-time</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction("custom_credits")}
                  disabled={isProcessing !== null || customCredits < 10}
                  className="mt-1.5 w-full sm:w-auto py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50 active:scale-[0.99]"
                >
                  {isProcessing === "custom_credits" ? "Opening..." : `Buy ${Math.max(10, customCredits)} Credits`}
                </button>
              </div>
            </div>
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

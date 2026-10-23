"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  KoboyoLock,
  KoboyoSparkles,
  KoboyoCheck,
  KoboyoShield,
  KoboyoClock,
  KoboyoRocket,
} from "../components/KoboyoIcons";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          toolId: "general",
          toolName: "BoringTools General Waitlist",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(data.message || "Failed to join waitlist. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-white text-[#0f172a] selection:bg-orange-100 flex flex-col justify-between"
      style={
        {
          "--bg-primary": "#ffffff",
          "--text-primary": "#0f172a",
          "--text-muted": "#64748b",
          "--accent": "#ea580c",
          "--border-subtle": "#e2e8f0",
        } as React.CSSProperties
      }
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center flex-1 flex flex-col justify-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/80 mb-6 mx-auto">
          <KoboyoLock className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
          <span>Private Beta • Invite Only</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          BoringTools is currently in private development
        </h1>

        {/* Subhead */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          We are preparing 70+ client-side utilities with zero tracking, offline capability, and instant execution. Request early access to receive an invite as rollouts commence.
        </p>

        {/* Form Container */}
        <div className="mt-10 max-w-md w-full mx-auto">
          {isSuccess ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <KoboyoCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                You&apos;re on the priority list!
              </h2>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                We&apos;ve reserved early access for <strong className="text-slate-800">{email}</strong>. When a spot opens, you will receive an invitation directly to your inbox.
              </p>
              <div className="mt-5">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
                >
                  <span>Explore Directory</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <label htmlFor="waitlist-page-email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="waitlist-page-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-sm sm:text-base shadow-xs"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-[#ea580c] hover:bg-[#c2410c] active:scale-[0.99] text-white font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-60 flex-shrink-0"
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <KoboyoSparkles className="w-4 h-4 text-white flex-shrink-0" />
                      <span>Request Invite</span>
                    </>
                  )}
                </button>
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-600 font-medium text-left">
                  {errorMessage}
                </p>
              )}

              <p className="text-xs text-slate-400 text-left pt-1">
                Zero spam. Only launch notifications and early access invites.
              </p>
            </form>
          )}
        </div>

        {/* 3 Value Pillars */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto border-t border-slate-100 pt-10">
          <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/60">
            <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-orange-600 flex items-center justify-center mb-3">
              <KoboyoShield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Client-First Privacy</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Files and data are parsed directly in the web browser. Zero tracking and no server storage.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/60">
            <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-orange-600 flex items-center justify-center mb-3">
              <KoboyoClock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Zero Wait Time</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Instant WebAssembly execution for image conversion, compression, and mathematical calculation.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/60">
            <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-orange-600 flex items-center justify-center mb-3">
              <KoboyoRocket className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">70+ Tools Suite</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Curated everyday developer, document, career, and media utilities in one lightweight hub.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

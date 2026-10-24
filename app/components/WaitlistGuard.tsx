"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { tools } from "@/app/tools-data";
import {
  KoboyoLock,
  KoboyoSparkles,
  KoboyoCheck,
  KoboyoShield,
  CategoryIcon,
} from "./KoboyoIcons";

export default function WaitlistGuard() {
  const pathname = usePathname();
  const { user, isAdmin, loading, openAuthModal } = useAuth();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasLocalBypass, setHasLocalBypass] = useState(false);

  // Check for admin bypass token in query param or localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const bypassParam = urlParams.get("admin_bypass");
      if (bypassParam === "ayush_admin") {
        localStorage.setItem("boring_admin_bypass", "ayush_admin");
        document.cookie = "boring_admin_bypass=ayush_admin; path=/; max-age=31536000";
        setHasLocalBypass(true);
      } else if (localStorage.getItem("boring_admin_bypass") === "ayush_admin") {
        document.cookie = "boring_admin_bypass=ayush_admin; path=/; max-age=31536000";
        setHasLocalBypass(true);
      }
    }
  }, []);

  // Determine if current route is a tool
  const currentTool = tools.find(
    (t) =>
      t.href === pathname ||
      pathname === `/${t.id}` ||
      pathname.startsWith(`/${t.id}/`)
  );

  const isToolPage = Boolean(currentTool);
  const isAuthorizedAdmin = isAdmin || hasLocalBypass;

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isToolPage && !isAuthorizedAdmin && !loading) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isToolPage, isAuthorizedAdmin, loading]);

  // If not a tool page or tool not found, don't render anything
  if (!currentTool) {
    return null;
  }

  // If user is authorized Admin, render subtle admin access pill indicator
  if (isAuthorizedAdmin) {
    return (
      <aside
        aria-label="Admin Status"
        className="fixed bottom-4 left-4 z-40 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 shadow-lg text-xs font-medium flex items-center gap-2 pointer-events-auto"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <KoboyoShield className="w-3.5 h-3.5 text-orange-400" />
        <span>Admin Mode: Unlocked ({user?.email || "Ayush"})</span>
      </aside>
    );
  }

  // During auth resolution, avoid flashing modal prematurely
  if (loading) {
    return null;
  }

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTool) return;
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
          toolId: currentTool.id,
          toolName: currentTool.name,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(data.message || "Failed to join waitlist. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-center overflow-hidden">
        {/* Top Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

        {/* Private Beta Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/80 mb-4 mt-1">
          <KoboyoLock className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
          <span>Private Beta • Invite Only</span>
        </div>

        {/* Title */}
        <h2
          id="waitlist-title"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900"
        >
          Still in active development
        </h2>

        {/* Subtitle */}
        <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
          We are fine-tuning BoringTools for 100% browser-first privacy, zero data logging, and instantaneous performance.
        </p>

        {/* Tool Preview Box */}
        <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-orange-100/70 border border-orange-200/80 flex items-center justify-center text-orange-600 flex-shrink-0">
              <CategoryIcon category={currentTool.category} className="w-5 h-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {currentTool.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {currentTool.category} Utility
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full flex-shrink-0">
            In Development
          </span>
        </div>

        {/* Form State */}
        {isSuccess ? (
          <div className="mt-6 p-4 sm:p-5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-center animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2.5">
              <KoboyoCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              You&apos;re on the priority waitlist!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
              We&apos;ve reserved an early access invite for <strong className="text-slate-800">{email}</strong>. You will receive an exclusive link once this tool launches.
            </p>
          </div>
        ) : (
          <form onSubmit={handleWaitlistSubmit} className="mt-6 space-y-3">
            <div className="text-left">
              <label htmlFor="waitlist-email-input" className="sr-only">
                Email Address
              </label>
              <input
                id="waitlist-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to request early access"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-sm sm:text-base shadow-xs"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 font-medium text-left">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 bg-[#ea580c] hover:bg-[#c2410c] active:scale-[0.99] text-white font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <span>Reserving your spot...</span>
              ) : (
                <>
                  <KoboyoSparkles className="w-4 h-4 text-white flex-shrink-0" />
                  <span>Join Waitlist & Request Access</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <Link
            href="/"
            className="hover:text-slate-900 font-medium transition inline-flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Return to Tools Directory</span>
          </Link>

          <button
            type="button"
            onClick={() => openAuthModal("Sign in to unlock admin access.")}
            className="hover:text-orange-600 font-medium transition underline cursor-pointer"
          >
            Developer / Admin sign in
          </button>
        </div>
      </div>
    </div>
  );
}

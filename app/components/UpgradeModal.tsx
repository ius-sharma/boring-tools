"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function UpgradeModal() {
  const { isUpgradeModalOpen, closeUpgradeModal, credits, user, upgradeModalData, loginWithGoogle } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeUpgradeModal();
      }
    };
    if (isUpgradeModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isUpgradeModalOpen, closeUpgradeModal]);

  if (!isUpgradeModalOpen) return null;

  const isGuest = upgradeModalData?.isGuest ?? (!user || credits.isGuest);
  const toolName = upgradeModalData?.toolName;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={closeUpgradeModal}
    >
      <div
        className="relative w-full max-w-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeUpgradeModal}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Top Icon Badge */}
          <div className="w-12 h-12 bg-orange-50 border border-orange-200 text-[#ea580c] rounded-xl flex items-center justify-center mb-5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {/* Heading & Subtitle */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isGuest
                ? "Guest trial limit reached (3/3)"
                : "Daily free credits exhausted (10/10)"}
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {upgradeModalData?.message ||
                (isGuest
                  ? `You've reached the free guest limit for ${toolName || "this tool"}. Create a free account to unlock 10 daily AI credits, or upgrade to Pro.`
                  : `You've used all 10 free daily credits today. Daily credits reset every night at 00:00 UTC, or upgrade to Pro for 500+ monthly credits.`)}
            </p>
          </div>

          {/* Guest Conversion Mode */}
          {isGuest ? (
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full h-[44px] px-4 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium rounded-xl border border-slate-200 transition flex items-center justify-center relative active:scale-[0.99]"
              >
                <span className="absolute left-4 flex items-center">
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27A7.2 7.2 0 014.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.97 11.97 0 000 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </span>
                <span>Sign up with Google (Free 10 Daily Credits)</span>
              </button>

              <Link
                href="/signup"
                onClick={closeUpgradeModal}
                className="w-full h-[44px] bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-semibold rounded-xl transition flex items-center justify-center active:scale-[0.99]"
              >
                Create free account with email
              </Link>
            </div>
          ) : (
            /* Registered Free User Mode */
            <div className="space-y-3 mb-6">
              {/* Pro Feature Highlights */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
                <div className="font-semibold text-slate-900 text-[13px] mb-1">Boring Tools Pro:</div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>500+ credits / month with rollover</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Unlimited 70+ client-side tools (always free)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Priority server queue & 100MB file uploads</span>
                </div>
              </div>

              <Link
                href="/pricing"
                onClick={closeUpgradeModal}
                className="w-full h-[44px] bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-semibold rounded-xl transition flex items-center justify-center active:scale-[0.99]"
              >
                Upgrade to Pro (from ₹399 / $7.99)
              </Link>

              <Link
                href="/pricing#addons"
                onClick={closeUpgradeModal}
                className="w-full h-[40px] bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium rounded-xl border border-slate-200 transition flex items-center justify-center active:scale-[0.99]"
              >
                Or buy 100 Credits Pack (₹199 / $3)
              </Link>
            </div>
          )}

          {/* Footer note */}
          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={closeUpgradeModal}
              className="text-xs text-slate-500 hover:text-slate-800 transition font-normal"
            >
              {isGuest ? "Continue browsing free tools" : "I'll wait for tomorrow's reset"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


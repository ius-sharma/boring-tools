"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: "dpdp-2023-v1";
}

export const CONSENT_STORAGE_KEY = "boringtools_cookie_consent";
export const CONSENT_VERSION = "dpdp-2023-v1";
export const CONSENT_EVENT_NAME = "boringtools_consent_updated";

declare global {
  interface Window {
    openConsentPreferences?: () => void;
  }
}

export default function ConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Preference switches (Strictly necessary is permanently true)
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Read saved consent from localStorage
  const getStoredConsent = useCallback((): CookieConsent | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === CONSENT_VERSION && parsed.necessary === true) {
        return parsed as CookieConsent;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }, []);

  // Save consent to localStorage and dispatch custom event
  const saveConsent = useCallback(
    (analytics: boolean, marketing: boolean) => {
      const consentRecord: CookieConsent = {
        necessary: true,
        analytics,
        marketing,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION,
      };

      try {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentRecord));
      } catch (err) {
        console.error("Failed to persist consent to localStorage", err);
      }

      // Dispatch custom event for dynamic script loaders (AdSense, Analytics)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(CONSENT_EVENT_NAME, {
            detail: { consent: consentRecord, ...consentRecord },
          })
        );
      }

      setAnalyticsConsent(analytics);
      setMarketingConsent(marketing);
      setShowBanner(false);
      setShowModal(false);
    },
    []
  );

  // Open the detailed preferences modal
  const openPreferences = useCallback(() => {
    const existing = getStoredConsent();
    if (existing) {
      setAnalyticsConsent(Boolean(existing.analytics));
      setMarketingConsent(Boolean(existing.marketing));
    } else {
      setAnalyticsConsent(false);
      setMarketingConsent(false);
    }
    setShowModal(true);
  }, [getStoredConsent]);

  useEffect(() => {
    setMounted(true);

    const saved = getStoredConsent();
    if (saved) {
      setAnalyticsConsent(Boolean(saved.analytics));
      setMarketingConsent(Boolean(saved.marketing));
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }

    // Expose global method for footer or other links
    window.openConsentPreferences = () => {
      openPreferences();
    };

    // Also listen for custom event trigger
    const handleOpenEvent = () => openPreferences();
    window.addEventListener("boringtools_open_consent", handleOpenEvent);

    return () => {
      window.removeEventListener("boringtools_open_consent", handleOpenEvent);
      if (window.openConsentPreferences === openPreferences) {
        delete window.openConsentPreferences;
      }
    };
  }, [getStoredConsent, openPreferences]);

  // Don't render anything during SSR to prevent hydration mismatches
  if (!mounted) return null;

  return (
    <>
      {/* 1. Bottom Non-Intrusive Banner (Only shown if no consent recorded yet) */}
      {showBanner && !showModal && (
        <aside
          role="region"
          aria-label="Privacy and Cookie Consent"
          className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-5 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="max-w-4xl mx-auto pointer-events-auto bg-slate-900/95 text-white backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  DPDP Act 2023 Compliant
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs text-slate-400 hidden sm:inline">Zero Server Storage</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                We value your digital privacy. In accordance with India&apos;s Digital Personal Data
                Protection Act 2023, optional performance and advertising cookies are{" "}
                <strong className="text-white font-medium">disabled by default</strong>. Only strictly
                necessary local storage is active.
              </p>
              <p className="text-xs text-slate-400">
                You have full control to accept all, keep non-essential rejected, or customize
                granularly. See our{" "}
                <Link
                  href="/privacy-policy"
                  className="text-amber-400 underline hover:text-amber-300 transition"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">
              <button
                type="button"
                onClick={() => openPreferences()}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition cursor-pointer"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={() => saveConsent(false, false)}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl transition cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={() => saveConsent(true, true)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition cursor-pointer"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Granular Consent Preferences Modal (Accessible anytime via footer or customize) */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-slate-900 border border-slate-700/90 text-white rounded-2xl w-full max-w-xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto flex flex-col space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-400 text-base">🛡️</span>
                  <h2 id="consent-modal-title" className="text-lg sm:text-xl font-bold text-white">
                    Privacy &amp; Cookie Preferences
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Adheres to Section 6 of India&apos;s Digital Personal Data Protection (DPDP) Act,
                  2023. You can review, modify, or withdraw your consent at any time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close preferences modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Category Cards */}
            <div className="space-y-3.5">
              {/* Category 1: Strictly Necessary */}
              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">
                      Strictly Necessary
                    </span>
                    <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Always Active
                    </span>
                  </div>
                  {/* Disabled Switch */}
                  <div
                    aria-disabled="true"
                    className="w-11 h-6 bg-emerald-600/40 rounded-full flex items-center p-1 cursor-not-allowed"
                    title="Required for basic site functionality"
                  >
                    <div className="w-4 h-4 bg-emerald-300 rounded-full translate-x-5 transition-transform" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Essential for core platform operations, including anonymous session authentication,
                  anti-abuse security, and storing your DPDP consent choices locally. These cannot be
                  switched off.
                </p>
              </div>

              {/* Category 2: Performance & Analytics */}
              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">
                      Performance &amp; Analytics
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        analyticsConsent
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-slate-400 bg-slate-700/30 border-slate-600/30"
                      }`}
                    >
                      {analyticsConsent ? "Granted" : "Opt-In (Off)"}
                    </span>
                  </div>
                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analyticsConsent}
                    onClick={() => setAnalyticsConsent(!analyticsConsent)}
                    className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors cursor-pointer ${
                      analyticsConsent ? "bg-amber-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        analyticsConsent ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Powers anonymous telemetry via Vercel Analytics to identify broken browser tools,
                  benchmark load performance, and optimize latency without storing IP addresses or
                  personal identifiers.
                </p>
              </div>

              {/* Category 3: Advertising & Marketing */}
              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">
                      Advertising &amp; Marketing
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        marketingConsent
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-slate-400 bg-slate-700/30 border-slate-600/30"
                      }`}
                    >
                      {marketingConsent ? "Granted" : "Opt-In (Off)"}
                    </span>
                  </div>
                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={marketingConsent}
                    onClick={() => setMarketingConsent(!marketingConsent)}
                    className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors cursor-pointer ${
                      marketingConsent ? "bg-amber-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        marketingConsent ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Allows Google AdSense (<code>ca-pub-7528581776456991</code>) to display relevant
                  advertisements that fund our serverless infrastructure and maintain free access to
                  all 100+ browser tools. Disabling this blocks advertising tracking scripts.
                </p>
              </div>
            </div>

            {/* DPDP Section 6(4) Notice */}
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 text-xs text-slate-400">
              <span className="text-slate-200 font-medium">Right to Withdraw (Section 6(4)): </span>
              You have the unconditional statutory right to withdraw or modify your consent at any
              time with equal ease via the &ldquo;Cookie &amp; Consent Preferences&rdquo; link in the
              website footer.
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => saveConsent(false, false)}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition cursor-pointer text-center"
              >
                Reject Non-Essential
              </button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => saveConsent(analyticsConsent, marketingConsent)}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-xl border border-slate-600 transition cursor-pointer text-center"
                >
                  Save Preferences
                </button>
                <button
                  type="button"
                  onClick={() => saveConsent(true, true)}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition cursor-pointer text-center"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

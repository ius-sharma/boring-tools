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
      {/* 1. Bottom Theme-Matched Consent Banner */}
      {showBanner && !showModal && (
        <aside
          role="region"
          aria-label="Privacy and Cookie Consent"
          className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-5 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="max-w-4xl mx-auto pointer-events-auto bg-white/95 text-slate-800 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              {/* Badge & Metadata Header */}
              <div className="flex items-center flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Privacy Choices
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-orange-50 border border-orange-200/80 text-orange-700 px-2 py-0.5 rounded-md">
                  DPDP Act 2023
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  100% In-Browser &amp; Zero File Uploads
                </span>
              </div>

              {/* Concise Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tools run privately in your browser. Optional analytics and ads are{" "}
                <span className="text-slate-900 font-semibold">disabled by default</span>. Choose what you allow or learn more in our{" "}
                <Link
                  href="/privacy-policy"
                  className="text-orange-600 font-semibold underline underline-offset-2 hover:text-orange-700 transition"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
              <button
                type="button"
                onClick={() => openPreferences()}
                className="px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={() => saveConsent(false, false)}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/90 rounded-xl transition cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={() => saveConsent(true, true)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition cursor-pointer active:scale-[0.98]"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Granular Consent Preferences Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl w-full max-w-xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <h2 id="consent-modal-title" className="text-lg font-bold text-slate-900 tracking-tight">
                    Privacy &amp; Cookie Preferences
                  </h2>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  In compliance with India&apos;s Digital Personal Data Protection (DPDP) Act, 2023. You can modify or withdraw consent anytime.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close preferences modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Category Cards */}
            <div className="space-y-3">
              {/* Category 1: Strictly Necessary */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">
                      Strictly Necessary
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Always Active
                    </span>
                  </div>
                  {/* Disabled Switch */}
                  <div
                    aria-disabled="true"
                    className="w-11 h-6 bg-emerald-600 rounded-full flex items-center p-1 cursor-not-allowed"
                    title="Required for basic site functionality"
                  >
                    <div className="w-4 h-4 bg-white rounded-full translate-x-5 transition-transform shadow-xs" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Required for core platform security, anonymous authentication, and preserving your privacy choices locally. Cannot be disabled.
                </p>
              </div>

              {/* Category 2: Performance & Analytics */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">
                      Performance &amp; Analytics
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        analyticsConsent
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : "text-slate-500 bg-slate-100 border-slate-200"
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
                      analyticsConsent ? "bg-orange-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${
                        analyticsConsent ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Anonymous performance metrics via Vercel Analytics to identify broken tools and optimize speed without storing IP addresses or tracking you.
                </p>
              </div>

              {/* Category 3: Advertising & Marketing */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">
                      Advertising &amp; Marketing
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        marketingConsent
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : "text-slate-500 bg-slate-100 border-slate-200"
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
                      marketingConsent ? "bg-orange-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${
                        marketingConsent ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Allows Google AdSense (<code>ca-pub-7528581776456991</code>) to show contextual ads that support free access to all 100+ tools. Disabling this blocks ad tracking scripts completely.
                </p>
              </div>
            </div>

            {/* DPDP Section 6(4) Notice */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-800 font-semibold">Right to Withdraw (Section 6(4)): </span>
              You can withdraw or modify your consent at any time via the &ldquo;Cookie &amp; Consent Preferences&rdquo; link in the website footer.
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => saveConsent(false, false)}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition cursor-pointer text-center"
              >
                Reject Non-Essential
              </button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => saveConsent(analyticsConsent, marketingConsent)}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer text-center"
                >
                  Save Preferences
                </button>
                <button
                  type="button"
                  onClick={() => saveConsent(true, true)}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition cursor-pointer text-center"
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

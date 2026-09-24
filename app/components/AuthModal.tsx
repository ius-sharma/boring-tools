"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMessage, loginWithGoogle, loginWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ageConsentConfirmed, setAgeConsentConfirmed] = useState(true);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = () => {
    if (!ageConsentConfirmed) {
      setErrorMessage("Please confirm that you are at least 18 years of age and agree to our terms under the DPDP Act, 2023.");
      return;
    }
    setErrorMessage("");
    loginWithGoogle();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageConsentConfirmed) {
      setErrorMessage("Please confirm that you are at least 18 years of age and agree to our terms under the DPDP Act, 2023.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    const res = await loginWithEmail(email.trim());
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setEmailSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {authModalMessage ? "Sign in to Continue" : "Welcome to Boring Tools"}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {authModalMessage || "Sign up free to unlock 10 daily AI credits & save your history."}
          </p>
        </div>

        {/* Perks Box */}
        <div className="bg-orange-50/70 border border-orange-100 rounded-xl p-3 mb-6">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>10 Daily AI Credits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>100% Free Forever</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Cloud History Save</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>No Password Needed</span>
            </div>
          </div>
        </div>

        {/* 1-Click Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-medium rounded-xl border border-slate-300 shadow-sm transition transform active:scale-[0.98] mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-slate-200" />
          <span className="px-3 text-xs text-slate-400 uppercase tracking-wider font-medium">Or magic link</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* Email Magic Link Form */}
        {emailSent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-emerald-900">Magic link sent!</h3>
            <p className="text-xs text-emerald-700 mt-1">
              Check your inbox at <span className="font-medium">{email}</span> to log in instantly.
            </p>
            <div className="mt-3 p-2.5 bg-white/90 rounded-lg border border-emerald-200/70 text-left text-xs text-slate-600">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1 text-[11px]">
                <span>📩</span> Email sender notice:
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                The login link is sent from <strong>Supabase</strong> (<code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[10px]">noreply@mail.app.supabase.io</code>). If you don&apos;t see it in your inbox, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>
            {errorMessage && (
              <p className="text-xs text-red-600">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Sending link..." : "Send Magic Link"}
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Login email will be delivered via <strong>Supabase</strong>. Check Spam if needed.
            </p>
          </form>
        )}

        {/* DPDP Act 2023 Statutory Age Confirmation & Consent */}
        <div className="mt-5 pt-3.5 border-t border-slate-100">
          <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-left cursor-pointer hover:bg-slate-100/70 transition group">
            <input
              type="checkbox"
              checked={ageConsentConfirmed}
              onChange={(e) => {
                setAgeConsentConfirmed(e.target.checked);
                if (e.target.checked) setErrorMessage("");
              }}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer flex-shrink-0"
            />
            <span className="text-[11px] text-slate-600 leading-relaxed group-hover:text-slate-800 transition select-none">
              By continuing, you confirm that you are at least 18 years of age and agree to our{" "}
              <a
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-900 underline font-medium hover:text-orange-600"
              >
                Terms of Service
              </a>{" "}
              &amp;{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-900 underline font-medium hover:text-orange-600"
              >
                Privacy Policy
              </a>{" "}
              under the Digital Personal Data Protection Act, 2023.
            </span>
          </label>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            Affirmative consent is required pursuant to Section 6 &amp; Section 9 of the DPDP Act 2023.
          </p>
        </div>
      </div>
    </div>
  );
}

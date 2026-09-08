"use client";

import React, { useState } from "react";

interface PrivacyTrustBadgeProps {
  className?: string;
  compact?: boolean;
}

export default function PrivacyTrustBadge({
  className = "",
  compact = false,
}: PrivacyTrustBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50/90 hover:bg-slate-100 text-xs font-medium text-slate-600 transition cursor-pointer"
        title="Click to learn how BoringTools protects your privacy"
      >
        <svg
          className="w-3.5 h-3.5 text-emerald-600"
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
        <span className="font-semibold text-slate-800">100% In-Browser</span>
        {!compact && <span className="text-slate-400">• 0 Bytes Sent to Server</span>}
      </button>

      {showDetails && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-80 p-4 bg-white rounded-xl border border-slate-200 shadow-xl z-50 text-left text-xs space-y-2 animate-fade-in">
            <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-2">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                Zero-Knowledge Privacy
              </span>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Your files, inputs, and documents are processed locally inside your web browser using client-side JavaScript, Web Workers, and WebAssembly.
            </p>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-emerald-500 font-bold">✓</span> No server uploads
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-emerald-500 font-bold">✓</span> No sign-up or tracking
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-emerald-500 font-bold">✓</span> Safe for sensitive documents & financial data
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

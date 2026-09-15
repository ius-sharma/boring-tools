"use client";

import React from "react";

interface PrivacyTrustBadgeProps {
  className?: string;
  compact?: boolean;
}

export default function PrivacyTrustBadge({
  className = "",
  compact = false,
}: PrivacyTrustBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-200/80 bg-emerald-50/60 text-slate-700 text-xs font-medium select-none ${className}`}
      title="Runs entirely in your browser. Your data never leaves your device."
    >
      <svg
        className="w-3.5 h-3.5 text-emerald-600 shrink-0"
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
      {compact ? (
        <span className="text-[11px] sm:text-xs">
          <span className="font-semibold text-slate-800">Runs in browser</span>
          <span className="hidden sm:inline text-slate-500"> · Data stays on device</span>
        </span>
      ) : (
        <span className="text-[11px] sm:text-xs">
          <span className="font-semibold text-slate-800">Runs entirely in your browser.</span>{" "}
          <span className="text-slate-600 hidden sm:inline">Your data never leaves your device.</span>
        </span>
      )}
    </div>
  );
}

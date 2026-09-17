"use client";

import React from "react";
import { KoboyoShield } from "./KoboyoIcons";

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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-200/80 bg-orange-50/70 text-slate-700 text-xs font-medium select-none ${className}`}
      title="Runs entirely in your browser. Your data never leaves your device."
    >
      <KoboyoShield className="w-3.5 h-3.5 text-orange-500 shrink-0" />
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

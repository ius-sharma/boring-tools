"use client";

import React from "react";
import { KoboyoShield, KoboyoSparkles } from "./KoboyoIcons";

interface PrivacyTrustBadgeProps {
  className?: string;
  compact?: boolean;
  execution?: "client" | "server";
}

export default function PrivacyTrustBadge({
  className = "",
  compact = false,
  execution = "client",
}: PrivacyTrustBadgeProps) {
  const isServer = execution === "server";

  if (isServer) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200/80 bg-sky-50/70 text-slate-700 text-xs font-medium select-none ${className}`}
        title="Stateless cloud processing. Zero data retention or logging."
      >
        <KoboyoSparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        {compact ? (
          <span className="text-[11px] sm:text-xs">
            <span className="font-semibold text-slate-800">Cloud-assisted</span>
            <span className="hidden sm:inline text-slate-500"> · No data stored</span>
          </span>
        ) : (
          <span className="text-[11px] sm:text-xs">
            <span className="font-semibold text-slate-800">Cloud-assisted.</span>{" "}
            <span className="text-slate-600 hidden sm:inline">Stateless processing, zero data stored.</span>
          </span>
        )}
      </div>
    );
  }

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
          <span className="font-semibold text-slate-800">Runs in browser.</span>{" "}
          <span className="text-slate-600 hidden sm:inline">Data stays on your device.</span>
        </span>
      )}
    </div>
  );
}

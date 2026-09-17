"use client";

import React, { useState } from "react";
import { copyShareableLink } from "@/lib/useShareableState";
import { CheckIcon, KoboyoShare } from "./KoboyoIcons";

interface ShareCalculationButtonProps {
  label?: string;
  className?: string;
  customMessage?: string;
}

export default function ShareCalculationButton({
  label = "Share Calculation",
  className = "",
  customMessage,
}: ShareCalculationButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const success = await copyShareableLink(customMessage);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Copy direct shareable link with current inputs"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-2xs ${
        isCopied
          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
          : "bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border-slate-200 hover:border-orange-300"
      } ${className}`}
    >
      {isCopied ? (
        <>
          <CheckIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Link Copied!</span>
        </>
      ) : (
        <>
          <KoboyoShare className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 shrink-0" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

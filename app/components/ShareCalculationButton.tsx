"use client";

import React, { useState } from "react";
import { copyShareableLink } from "@/lib/useShareableState";

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
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Link Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

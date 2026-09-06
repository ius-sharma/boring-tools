"use client";

import React from "react";

export default function ThemedSegmentedControl({
  value,
  options = [],
  onChange,
  ariaLabel = "Options selector",
  className = "",
  size = "md", // "sm" | "md" | "lg"
}) {
  const sizeClasses = {
    sm: "p-0.5 text-xs",
    md: "p-1 text-xs sm:text-sm",
    lg: "p-1.5 text-sm sm:text-base",
  };

  const itemPadding = {
    sm: "px-2.5 py-1",
    md: "px-3.5 py-2",
    lg: "px-4 py-2.5",
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex w-full items-center bg-slate-100/90 rounded-xl border border-slate-200/80 select-none ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        const isDisabled = Boolean(option.disabled);

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange?.(option.value)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
              itemPadding[size] || itemPadding.md
            } ${
              isSelected
                ? "bg-white text-slate-900 font-semibold shadow-xs border border-slate-200/80"
                : isDisabled
                ? "text-slate-400 cursor-not-allowed opacity-60"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <span className="truncate">{option.label}</span>

            {/* Optional price / discount / status badge */}
            {option.badge && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none ${
                  option.badgeHighlight || isSelected
                    ? "bg-orange-100 text-orange-700"
                    : "bg-slate-200/80 text-slate-600"
                }`}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

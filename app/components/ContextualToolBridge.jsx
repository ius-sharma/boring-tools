import React from "react";
import Link from "next/link";

interface ContextualToolBridgeProps {
  label?: string;
  description: string;
  toolName: string;
  href: string;
  badge?: string;
}

export default function ContextualToolBridge({
  label = "Suggested Next Step",
  description,
  toolName,
  href,
  badge = "Free & Private",
}: ContextualToolBridgeProps) {
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-slate-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {label}
            </span>
            {badge && (
              <span className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700">{description}</p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-white border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-900 hover:text-white hover:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shrink-0"
        >
          <span>{toolName}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

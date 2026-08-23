"use client";

import React, { useState, useEffect } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export const SHOW_TOAST_EVENT = "boring-tools:show-toast";

export function showToast(message: string, type: "success" | "error" | "info" = "info") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(SHOW_TOAST_EVENT, {
        detail: { message, type },
      })
    );
  }
}

export default function ToastNotification() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: "success" | "error" | "info" }>;
      const newToast: ToastMessage = {
        id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        message: customEvent.detail.message,
        type: customEvent.detail.type || "info",
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    };

    window.addEventListener(SHOW_TOAST_EVENT, handleShowToast);
    return () => window.removeEventListener(SHOW_TOAST_EVENT, handleShowToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        const isError = toast.type === "error";
        const isSuccess = toast.type === "success";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all transform animate-fade-in ${
              isError
                ? "bg-rose-950/90 border-rose-800 text-rose-100"
                : isSuccess
                ? "bg-slate-900/95 border-slate-700 text-white"
                : "bg-slate-900/95 border-slate-700 text-white"
            }`}
          >
            <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
              <span className="text-base flex-shrink-0">
                {isError ? "⚠️" : isSuccess ? "✨" : "ℹ️"}
              </span>
              <span>{toast.message}</span>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              aria-label="Dismiss toast"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

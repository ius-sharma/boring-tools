"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { showToast } from "@/app/components/ToastNotification";

/**
 * Hook to manage state that auto-syncs with URL query parameters.
 * Reads initial value from URL param if present, else uses defaultValue.
 * Updates URL via window.history.replaceState (clean, no page reloads or back-button clutter).
 */
export function useShareableParam<T extends string>(
  paramKey: string,
  defaultValue: T
): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValueInternal] = useState<T>(defaultValue);
  const isInitialized = useRef(false);

  // Initialize from URL on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlVal = params.get(paramKey);
        if (urlVal !== null && urlVal !== undefined) {
          setValueInternal(urlVal as T);
        }
      } catch (e) {
        console.error(`Error reading param ${paramKey} from URL:`, e);
      }
      isInitialized.current = true;
    }
  }, [paramKey]);

  // Sync value changes to URL
  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValueInternal((prev) => {
        const next = typeof updater === "function" ? (updater as (prev: T) => T)(prev) : updater;

        if (typeof window !== "undefined" && isInitialized.current) {
          try {
            const url = new URL(window.location.href);
            if (next === defaultValue || next === "" || next === null) {
              url.searchParams.delete(paramKey);
            } else {
              url.searchParams.set(paramKey, String(next));
            }
            window.history.replaceState(null, "", url.toString());
          } catch (e) {
            console.error(`Error updating param ${paramKey}:`, e);
          }
        }

        return next;
      });
    },
    [paramKey, defaultValue]
  );

  return [value, setValue];
}

/**
 * Copies current shareable calculation URL to clipboard and triggers success toast.
 */
export async function copyShareableLink(customMessage?: string) {
  if (typeof window === "undefined") return false;
  try {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    showToast(
      customMessage || "Calculation link copied! Anyone opening this link will see your exact inputs.",
      "success"
    );
    return true;
  } catch (err) {
    console.error("Failed to copy link:", err);
    showToast("Failed to copy link to clipboard", "error");
    return false;
  }
}

"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEYS = {
  RECENTS: "boringtools_recents",
  PINNED: "boringtools_pinned",
};

export const TOOL_PREFERENCES_CHANGE_EVENT = "boringtools:preferences-change";

export interface ToolPreferenceItem {
  id: string;
  timestamp: number;
}

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TOOL_PREFERENCES_CHANGE_EVENT));
  }
}

/**
 * Get the list of recently visited tool IDs (up to maxCount, default 8).
 */
export function getRecentToolIds(maxCount: number = 8): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENTS);
    if (!raw) return [];
    const items: ToolPreferenceItem[] = JSON.parse(raw);
    if (!Array.isArray(items)) return [];
    return items
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxCount)
      .map((item) => item.id);
  } catch {
    return [];
  }
}

/**
 * Record a tool visit into recent tools.
 */
export function recordRecentTool(toolId: string) {
  if (typeof window === "undefined" || !toolId) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENTS);
    let items: ToolPreferenceItem[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(items)) items = [];

    // Remove existing entry for this tool if present
    items = items.filter((item) => item.id !== toolId);

    // Prepend fresh entry
    items.unshift({ id: toolId, timestamp: Date.now() });

    // Keep max 20 entries in storage
    localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(items.slice(0, 20)));
    notifyChange();
  } catch (e) {
    console.error("Failed to record recent tool:", e);
  }
}

/**
 * Clear recent tools history.
 */
export function clearRecentTools() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.RECENTS);
    notifyChange();
  } catch (e) {
    console.error("Failed to clear recents:", e);
  }
}

/**
 * Get the list of user-pinned tool IDs.
 */
export function getPinnedToolIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PINNED);
    if (!raw) return [];
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

/**
 * Check if a tool is pinned.
 */
export function isToolPinned(toolId: string): boolean {
  return getPinnedToolIds().includes(toolId);
}

/**
 * Pin or unpin a tool. Returns the new pinned status.
 */
export function togglePinTool(toolId: string): boolean {
  if (typeof window === "undefined" || !toolId) return false;
  try {
    const pinned = getPinnedToolIds();
    const isPinned = pinned.includes(toolId);
    const updated = isPinned ? pinned.filter((id) => id !== toolId) : [toolId, ...pinned];
    localStorage.setItem(STORAGE_KEYS.PINNED, JSON.stringify(updated));
    notifyChange();
    return !isPinned;
  } catch (e) {
    console.error("Failed to toggle pin tool:", e);
    return false;
  }
}

/**
 * React hook to reactively subscribe to pinned and recent tool changes.
 */
export function useToolPreferences() {
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setPinnedIds(getPinnedToolIds());
    setRecentIds(getRecentToolIds());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refresh();

    const handleUpdate = () => refresh();
    window.addEventListener(TOOL_PREFERENCES_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(TOOL_PREFERENCES_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refresh]);

  return {
    pinnedIds,
    recentIds,
    isLoaded,
    togglePin: togglePinTool,
    recordRecent: recordRecentTool,
    clearRecents: clearRecentTools,
    isPinned: (id: string) => pinnedIds.includes(id),
  };
}

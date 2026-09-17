"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { tools, Tool } from "../tools-data";
import {
  useToolPreferences,
  recordRecentTool,
} from "@/lib/storage/toolPreferences";

export const OPEN_COMMAND_PALETTE_EVENT = "boringtools:open-command-palette";

export function openCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE_EVENT));
  }
}

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { pinnedIds, recentIds, togglePin, isPinned } = useToolPreferences();

  // Listen for open event or keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handleCustomOpen);
    };
  }, [isOpen]);

  // Autofocus input on open & reset states
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Tool lookups map
  const toolMap = useMemo(() => {
    const map = new Map<string, Tool>();
    tools.forEach((t) => map.set(t.id, t));
    return map;
  }, []);

  // Filtered tools based on query
  const filteredTools = useMemo(() => {
    if (!query.trim()) return tools;
    const q = query.toLowerCase().trim();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Pinned tools
  const pinnedTools = useMemo(() => {
    return pinnedIds
      .map((id) => toolMap.get(id))
      .filter((t): t is Tool => Boolean(t));
  }, [pinnedIds, toolMap]);

  // Recent tools
  const recentTools = useMemo(() => {
    return recentIds
      .map((id) => toolMap.get(id))
      .filter((t): t is Tool => Boolean(t))
      .filter((t) => !pinnedIds.includes(t.id))
      .slice(0, 5);
  }, [recentIds, pinnedIds, toolMap]);

  // Active flat list for keyboard arrow navigation
  const activeNavigationList = useMemo(() => {
    if (query.trim()) {
      return filteredTools;
    }
    const combined: Tool[] = [];
    if (pinnedTools.length > 0) combined.push(...pinnedTools);
    if (recentTools.length > 0) combined.push(...recentTools);
    const rest = filteredTools.filter(
      (t) => !combined.some((item) => item.id === t.id)
    );
    combined.push(...rest);
    return combined;
  }, [query, filteredTools, pinnedTools, recentTools]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleSelectTool = useCallback(
    (tool: Tool) => {
      recordRecentTool(tool.id);
      setIsOpen(false);
      router.push(tool.href);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < activeNavigationList.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(0, activeNavigationList.length - 1)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = activeNavigationList[selectedIndex];
      if (selected) {
        handleSelectTool(selected);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6 bg-black/40 backdrop-blur-[2px] transition-opacity"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Clean Minimalist Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-white">
          <svg
            className="w-4 h-4 text-slate-400 shrink-0 mr-3"
            fill="currentColor"
            viewBox="0 0 135 131"
            aria-hidden="true"
          >
            <path d="M39.8 8.9A47.5 47.5 0 0 0 7 54c0 13.1 4.3 23.5 13.4 32.5A46 46 0 0 0 54.1 100c11.4 0 21.4-3.6 31.3-11.4.8-.5 7.4 5.5 18.6 16.9 9.6 9.7 18.3 18 19.3 18.6 2.4 1.4 5.9-.7 5.5-3.2-.2-1.1-8.6-10.2-18.8-20.4L91.6 82l1.7-3a58 58 0 0 0 6.4-21.6 46.5 46.5 0 0 0-34.1-49 55 55 0 0 0-25.8.5m29.7 8.9a39 39 0 0 1 22.1 44.1c-6.4 30.8-42.2 41.4-65.7 19.4-18.2-17-13.6-48.8 9-62.1a37 37 0 0 1 34.6-1.4" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full text-slate-900 placeholder-slate-400 bg-transparent text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
              title="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 105 107" aria-hidden="true">
                <path d="M72.7 26.2 52 47.5l-20-20A191 191 0 0 0 10 7.2c-2.7-.4-5.2 1.6-4.8 4 .2 1 9.4 11 20.6 22.1L46 53.5l-19.1 20c-10.4 11-19.5 21-20.1 22.3-1.6 3.1 2 7 5.1 5.6 1.1-.5 10.4-9.8 20.6-20.7A325 325 0 0 1 52.1 61c.6 0 10.2 9.2 21.3 20.5A206 206 0 0 0 95.2 102c1.8 0 4.8-3.1 4.8-5 0-.8-9.3-10.7-20.7-22.2L58.6 54l3.4-3.7 20.7-21.4C92.2 19.3 100 10.6 100 9.7c0-1.6-3.5-4.7-5.5-4.7-.5-.1-10.3 9.5-21.8 21.2" />
              </svg>
            </button>
          )}
        </div>

        {/* Minimal Tool List */}
        <div
          ref={listRef}
          className="overflow-y-auto flex-1 p-2 space-y-0.5"
        >
          {activeNavigationList.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              No tools found for "{query}"
            </div>
          ) : (
            <>
              {!query.trim() ? (
                <>
                  {/* Pinned Section */}
                  {pinnedTools.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        Pinned
                      </div>
                      {pinnedTools.map((tool) => {
                        const itemIndex = activeNavigationList.findIndex(
                          (t) => t.id === tool.id
                        );
                        return (
                          <ToolRow
                            key={tool.id}
                            tool={tool}
                            isSelected={selectedIndex === itemIndex}
                            dataIndex={itemIndex}
                            isPinned={true}
                            onSelect={() => handleSelectTool(tool)}
                            onTogglePin={(e) => {
                              e.stopPropagation();
                              togglePin(tool.id);
                            }}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Recent Section */}
                  {recentTools.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        Recent
                      </div>
                      {recentTools.map((tool) => {
                        const itemIndex = activeNavigationList.findIndex(
                          (t) => t.id === tool.id
                        );
                        return (
                          <ToolRow
                            key={tool.id}
                            tool={tool}
                            isSelected={selectedIndex === itemIndex}
                            dataIndex={itemIndex}
                            isPinned={isPinned(tool.id)}
                            onSelect={() => handleSelectTool(tool)}
                            onTogglePin={(e) => {
                              e.stopPropagation();
                              togglePin(tool.id);
                            }}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* All Tools Section */}
                  <div>
                    <div className="px-3 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      All Tools
                    </div>
                    {filteredTools.map((tool) => {
                      if (
                        pinnedTools.some((t) => t.id === tool.id) ||
                        recentTools.some((t) => t.id === tool.id)
                      ) {
                        return null;
                      }
                      const itemIndex = activeNavigationList.findIndex(
                        (t) => t.id === tool.id
                      );
                      return (
                        <ToolRow
                          key={tool.id}
                          tool={tool}
                          isSelected={selectedIndex === itemIndex}
                          dataIndex={itemIndex}
                          isPinned={isPinned(tool.id)}
                          onSelect={() => handleSelectTool(tool)}
                          onTogglePin={(e) => {
                            e.stopPropagation();
                            togglePin(tool.id);
                          }}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                        />
                      );
                    })}
                  </div>
                </>
              ) : (
                filteredTools.map((tool, idx) => (
                  <ToolRow
                    key={tool.id}
                    tool={tool}
                    isSelected={selectedIndex === idx}
                    dataIndex={idx}
                    isPinned={isPinned(tool.id)}
                    onSelect={() => handleSelectTool(tool)}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      togglePin(tool.id);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  />
                ))
              )}
            </>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>{activeNavigationList.length} tools</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}

interface ToolRowProps {
  tool: Tool;
  isSelected: boolean;
  dataIndex: number;
  isPinned: boolean;
  onSelect: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
}

function ToolRow({
  tool,
  isSelected,
  dataIndex,
  isPinned,
  onSelect,
  onTogglePin,
  onMouseEnter,
}: ToolRowProps) {
  return (
    <div
      data-index={dataIndex}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
        isSelected
          ? "bg-slate-100/90 text-slate-900"
          : "hover:bg-slate-50 text-slate-700"
      }`}
    >
      <div className="min-w-0 pr-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-slate-900 truncate">
            {tool.name}
          </span>
          <span className="text-[11px] text-slate-400 shrink-0">
            {tool.category}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {tool.description}
        </p>
      </div>

      <button
        type="button"
        onClick={onTogglePin}
        title={isPinned ? "Unpin" : "Pin"}
        className={`p-1 rounded transition shrink-0 cursor-pointer ${
          isPinned
            ? "text-amber-500 hover:text-amber-600"
            : "text-slate-300 hover:text-amber-500 opacity-0 group-hover:opacity-100"
        }`}
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    </div>
  );
}

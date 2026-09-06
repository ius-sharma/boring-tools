"use client";

import { useEffect, useMemo, useRef, useState, cloneElement } from "react";
import { createPortal } from "react-dom";

export default function ThemedDropdown({
  value,
  options = [],
  onChange,
  ariaLabel,
  inlineMenu = false,
  placeholder = "Select an option",
  searchable,
  searchPlaceholder = "Type to filter...",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Auto-enable search if more than 5 options (when list scrolls), or if explicitly requested via searchable prop
  const isSearchable = searchable !== undefined ? Boolean(searchable) : options.length > 5;

  // Filter options based on user search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const term = searchQuery.toLowerCase().trim();
    return options.filter((option) => {
      const labelStr = String(option.label ?? option.value ?? "").toLowerCase();
      const valueStr = String(option.value ?? "").toLowerCase();
      return labelStr.includes(term) || valueStr.includes(term);
    });
  }, [options, searchQuery]);

  // Click outside and escape handling
  useEffect(() => {
    const handlePointerDown = (event) => {
      const isInsideTrigger = rootRef.current && rootRef.current.contains(event.target);
      const isInsideMenu = menuRef.current && menuRef.current.contains(event.target);

      if (!isInsideTrigger && !isInsideMenu) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset search and highlight when opened or closed
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setHighlightedIndex(-1);
      if (isSearchable) {
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 60);
        return () => clearTimeout(timer);
      }
    } else {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [open, isSearchable]);

  // Keyboard navigation inside menu
  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        const chosen = filteredOptions[highlightedIndex];
        onChange(chosen.value);
        setOpen(false);
      } else if (filteredOptions.length === 1) {
        onChange(filteredOptions[0].value);
        setOpen(false);
      }
    }
  };

  const selectedLabel = useMemo(() => {
    if (options && options.length > 0) {
      const found = options.find((option) => option.value === value);
      if (found) return found.label;
    }
    return value || placeholder;
  }, [options, value, placeholder]);

  // Positioning
  useEffect(() => {
    if (!open || inlineMenu) {
      setMenuStyle(null);
      return undefined;
    }

    const update = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setMenuStyle({
          position: "fixed",
          left: `${rect.left}px`,
          top: `${rect.bottom + 8}px`,
          minWidth: `${rect.width}px`,
          maxWidth: "max-content",
          zIndex: 99999,
        });
      }
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [open, inlineMenu]);

  return (
    <div ref={rootRef} className={`relative w-full ${className}`} onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        className="theme-dropdown-trigger w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-left text-base text-slate-900 shadow-sm transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <span className="truncate font-medium">{selectedLabel}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`theme-dropdown-chevron h-5 w-5 shrink-0 transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 7.72a.75.75 0 0 1 1.06.02L10 11.637l3.72-3.896a.75.75 0 1 1 1.08 1.04l-4.25 4.45a.75.75 0 0 1-1.08 0l-4.25-4.45a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && mounted && (
        (() => {
          const menu = (
            <div
              ref={menuRef}
              className={`theme-dropdown-menu ${
                inlineMenu
                  ? "relative z-10 mt-2"
                  : "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
              }`}
              style={inlineMenu ? undefined : menuStyle}
            >
              {/* Type-to-filter search input (Mistake #1 Fix: Over 10 options? Let them type.) */}
              {isSearchable && (
                <div className="p-2 border-b border-slate-100 bg-white">
                  <div className="relative flex items-center">
                    <svg
                      className="absolute left-2.5 h-4 w-4 text-slate-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setHighlightedIndex(0);
                      }}
                      placeholder={searchPlaceholder}
                      className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          searchInputRef.current?.focus();
                        }}
                        className="absolute right-2 text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5"
                        aria-label="Clear filter"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Options list */}
              <div className="max-h-60 overflow-auto p-1">
                {filteredOptions.length === 0 ? (
                  <div className="py-6 px-4 text-center text-xs sm:text-sm text-slate-400">
                    No matching options found
                  </div>
                ) : (
                  filteredOptions.map((option, idx) => {
                    const active = option.value === value;
                    const isHighlighted = idx === highlightedIndex;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onClick={() => {
                          onChange(option.value);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                          active
                            ? "theme-dropdown-option-active"
                            : isHighlighted
                            ? "bg-amber-50 text-slate-900"
                            : "theme-dropdown-option text-slate-700"
                        }`}
                      >
                        <span className="font-medium truncate">{option.label}</span>
                        {active && (
                          <svg
                            className="h-4 w-4 shrink-0 text-white ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );

          if (inlineMenu) return menu;

          if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const computed = {
              position: "fixed",
              left: `${rect.left}px`,
              top: `${rect.bottom + 8}px`,
              minWidth: `${rect.width}px`,
              maxWidth: "max-content",
              zIndex: 99999,
            };
            const styleToUse = menuStyle || computed;
            return createPortal(
              cloneElement(menu, { style: inlineMenu ? undefined : styleToUse }),
              document.body
            );
          }

          return createPortal(menu, document.body);
        })()
      )}
    </div>
  );
}

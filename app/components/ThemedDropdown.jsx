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
  multiple = false,
  showChips = true,
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

  // Auto-enable search if more than 5 options, or if explicitly requested via searchable prop
  const isSearchable = searchable !== undefined ? Boolean(searchable) : options.length > 5;

  // Normalized selected values for multi-select
  const selectedValues = useMemo(() => {
    if (!multiple) return [];
    if (Array.isArray(value)) return value;
    return value !== undefined && value !== null && value !== "" ? [value] : [];
  }, [value, multiple]);

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

  // Option selection logic (Mistake #3: Multi-select stays open)
  const handleOptionClick = (optionValue) => {
    if (multiple) {
      const isSelected = selectedValues.includes(optionValue);
      const updated = isSelected
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange?.(updated);
      // Stays open! Do not close dropdown!
    } else {
      onChange?.(optionValue);
      setOpen(false);
    }
  };

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
        handleOptionClick(chosen.value);
      } else if (filteredOptions.length === 1) {
        handleOptionClick(filteredOptions[0].value);
      }
    }
  };

  const selectedSingleLabel = useMemo(() => {
    if (options && options.length > 0) {
      const found = options.find((option) => option.value === value);
      if (found) return found.label;
    }
    return value || placeholder;
  }, [options, value, placeholder]);

  const [placement, setPlacement] = useState("down"); // "down" | "up"

  // Collision-Aware Positioning (Mistake #4: Flip it before it clips)
  useEffect(() => {
    if (!open || inlineMenu) {
      setMenuStyle(null);
      return undefined;
    }

    const update = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Dropdown menu expected height
      const measuredHeight = menuRef.current ? menuRef.current.offsetHeight : 0;
      const expectedHeight = measuredHeight > 0 ? measuredHeight : 260;

      // Flip up if not enough space below AND there is more space above
      const flipUp = spaceBelow < expectedHeight && spaceAbove > spaceBelow;
      setPlacement(flipUp ? "up" : "down");

      // Horizontal clamp so dropdown never cuts off outside screen edges
      const minW = rect.width;
      let left = rect.left;
      if (left + minW > viewportWidth - 12) {
        left = Math.max(12, viewportWidth - minW - 12);
      }

      if (flipUp) {
        setMenuStyle({
          position: "fixed",
          left: `${left}px`,
          bottom: `${viewportHeight - rect.top + 6}px`,
          top: "auto",
          width: `${rect.width}px`,
          minWidth: `${rect.width}px`,
          maxHeight: `${Math.max(150, Math.min(360, spaceAbove - 16))}px`,
          zIndex: 99999,
        });
      } else {
        setMenuStyle({
          position: "fixed",
          left: `${left}px`,
          top: `${rect.bottom + 6}px`,
          bottom: "auto",
          width: `${rect.width}px`,
          minWidth: `${rect.width}px`,
          maxHeight: `${Math.max(150, Math.min(360, spaceBelow - 16))}px`,
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
        className="theme-dropdown-trigger w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:py-3.5 text-left text-base text-slate-900 shadow-sm transition hover:bg-orange-50/50 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[52px]"
      >
        {multiple ? (
          <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 pr-2">
            {selectedValues.length === 0 ? (
              <span className="truncate text-slate-400 font-medium">{placeholder}</span>
            ) : showChips ? (
              <>
                {selectedValues.slice(0, 3).map((val) => {
                  const opt = options.find((o) => o.value === val);
                  const lbl = opt ? opt.label : val;
                  return (
                    <span
                      key={val}
                      className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded-lg max-w-[130px] shrink-0"
                    >
                      <span className="truncate">{lbl}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionClick(val);
                        }}
                        className="hover:text-orange-950 font-bold ml-0.5 cursor-pointer leading-none"
                        aria-label={`Remove ${lbl}`}
                      >
                        ×
                      </span>
                    </span>
                  );
                })}
                {selectedValues.length > 3 && (
                  <span className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg shrink-0">
                    +{selectedValues.length - 3} more
                  </span>
                )}
              </>
            ) : (
              <span className="truncate font-semibold text-slate-800">
                {selectedValues.length} selected
              </span>
            )}
          </div>
        ) : (
          <span className="truncate font-medium">{selectedSingleLabel}</span>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {multiple && selectedValues.length > 0 && !showChips && (
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {selectedValues.length}
            </span>
          )}
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
        </div>
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
              {/* Type-to-filter search input (Mistake #1: Over 10 options? Let them type.) */}
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
                    const isSelected = multiple
                      ? selectedValues.includes(option.value)
                      : option.value === value;
                    const isHighlighted = idx === highlightedIndex;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onClick={() => handleOptionClick(option.value)}
                        className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-sm transition cursor-pointer ${
                          isSelected
                            ? multiple
                              ? "bg-orange-50/80 text-orange-950 font-medium"
                              : "theme-dropdown-option-active font-medium"
                            : isHighlighted
                            ? "bg-amber-50 text-slate-900"
                            : "theme-dropdown-option text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Multi-select Checkbox (Mistake #3: Checkboxes use kar) */}
                          {multiple && (
                            <div
                              className={`h-4 w-4 shrink-0 rounded border transition-colors flex items-center justify-center ${
                                isSelected
                                  ? "bg-orange-500 border-orange-500 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  className="h-3 w-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          )}
                          <span className="truncate">{option.label}</span>
                        </div>

                        {!multiple && isSelected && (
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

              {/* Multi-select Sticky Footer with Live Count & Done Button (Mistake #3) */}
              {multiple && (
                <div className="sticky bottom-0 border-t border-slate-100 bg-slate-50/95 backdrop-blur-xs px-3 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">
                      {selectedValues.length} selected
                    </span>
                    {selectedValues.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange?.([]);
                        }}
                        className="text-xs text-slate-400 hover:text-red-600 transition underline underline-offset-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(false);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          );

          if (inlineMenu) return menu;

          if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;
            const flipUp = spaceBelow < 260 && spaceAbove > spaceBelow;

            const computed = flipUp
              ? {
                  position: "fixed",
                  left: `${rect.left}px`,
                  bottom: `${viewportHeight - rect.top + 6}px`,
                  top: "auto",
                  width: `${rect.width}px`,
                  minWidth: `${rect.width}px`,
                  zIndex: 99999,
                }
              : {
                  position: "fixed",
                  left: `${rect.left}px`,
                  top: `${rect.bottom + 6}px`,
                  bottom: "auto",
                  width: `${rect.width}px`,
                  minWidth: `${rect.width}px`,
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

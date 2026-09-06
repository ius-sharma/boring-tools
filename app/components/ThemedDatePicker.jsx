"use client";

import { useEffect, useMemo, useRef, useState, cloneElement } from "react";
import { createPortal } from "react-dom";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SHORT_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Helper: Convert YYYY-MM-DD to DD/MM/YYYY for user-friendly display
function isoToDisplay(iso) {
  if (!iso || typeof iso !== "string") return "";
  const parts = iso.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  return iso;
}

// Helper: Parse DD/MM/YYYY or YYYY-MM-DD or 8-digit string into YYYY-MM-DD
function parseToIso(input) {
  if (!input) return "";
  const trimmed = input.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    if (isValidDateParts(y, m, d)) return trimmed;
  }

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const separatorMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (separatorMatch) {
    const d = parseInt(separatorMatch[1], 10);
    const m = parseInt(separatorMatch[2], 10);
    const y = parseInt(separatorMatch[3], 10);
    if (isValidDateParts(y, m, d)) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  // 8 digits: DDMMYYYY
  if (/^\d{8}$/.test(trimmed)) {
    const d = parseInt(trimmed.slice(0, 2), 10);
    const m = parseInt(trimmed.slice(2, 4), 10);
    const y = parseInt(trimmed.slice(4, 8), 10);
    if (isValidDateParts(y, m, d)) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  return null;
}

function isValidDateParts(year, month, day) {
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1800 || year > 2200) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export default function ThemedDatePicker({
  value = "", // expects "YYYY-MM-DD"
  onChange,
  placeholder = "DD/MM/YYYY (or pick date)",
  ariaLabel = "Date picker",
  minYear = 1920,
  maxYear = new Date().getFullYear() + 5,
  className = "",
  inline = false,
}) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState(() => isoToDisplay(value));
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);

  // Parse initial view year and month
  const initialDate = useMemo(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      return { year: y, month: m - 1, day: d };
    }
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
  }, [value]);

  const [viewYear, setViewYear] = useState(initialDate.year);
  const [viewMonth, setViewMonth] = useState(initialDate.month);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const inputRef = useRef(null);

  // Synchronize inputText when external value changes
  useEffect(() => {
    setInputText(isoToDisplay(value));
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m] = value.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [value]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Click outside and escape handling
  useEffect(() => {
    const handlePointerDown = (e) => {
      const insideTrigger = containerRef.current && containerRef.current.contains(e.target);
      const insidePopover = popoverRef.current && popoverRef.current.contains(e.target);
      if (!insideTrigger && !insidePopover) {
        setOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
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

  // Positioning logic
  useEffect(() => {
    if (!open || inline) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverHeight = 350;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top = rect.bottom + 8;
      // Flip up if bottom collision
      if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
        top = Math.max(10, rect.top - popoverHeight - 8);
      }

      setMenuStyle({
        position: "fixed",
        left: `${Math.max(10, Math.min(rect.left, window.innerWidth - 330))}px`,
        top: `${top}px`,
        zIndex: 99999,
        width: "320px",
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [open, inline]);

  // Handle direct text typing
  const handleInputChange = (e) => {
    const raw = e.target.value;
    setInputText(raw);

    const parsed = parseToIso(raw);
    if (parsed) {
      onChange?.(parsed);
      const [y, m] = parsed.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    } else if (raw.trim() === "") {
      onChange?.("");
    }
  };

  // Day picking
  const handleDaySelect = (day) => {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setInputText(isoToDisplay(iso));
    onChange?.(iso);
    setOpen(false);
  };

  // Quick jumps
  const handleMonthJump = (mIdx) => {
    setViewMonth(Number(mIdx));
  };

  const handleYearJump = (yr) => {
    setViewYear(Number(yr));
  };

  // Calendar math
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun

  const today = new Date();
  const isToday = (day) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const isSelected = (day) => {
    if (!value) return false;
    const [y, m, d] = value.split("-").map(Number);
    return y === viewYear && m - 1 === viewMonth && d === day;
  };

  // Generate years list descending or ascending
  const yearsList = useMemo(() => {
    const yrs = [];
    for (let y = maxYear; y >= minYear; y--) {
      yrs.push(y);
    }
    return yrs;
  }, [minYear, maxYear]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input container with direct typing + calendar toggle */}
      <div
        ref={triggerRef}
        className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:border-slate-300 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="w-full bg-transparent text-base text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
        />

        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {inputText && (
            <button
              type="button"
              onClick={() => {
                setInputText("");
                onChange?.("");
              }}
              title="Clear date"
              className="text-slate-400 hover:text-slate-600 p-1 text-xs"
            >
              ✕
            </button>
          )}

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            title="Open calendar (Quick Month/Year jump)"
            className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
            aria-label="Toggle calendar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar popover with Month & Year Jumps (Solution #2) */}
      {open && mounted && (() => {
        const popover = (
          <div
            ref={popoverRef}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 text-slate-900 select-none animate-in fade-in zoom-in-95 duration-150"
            style={inline ? undefined : menuStyle}
          >
            {/* Header: Month Jump & Year Jump (No 390 arrow clicks!) */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 flex-1">
                {/* Month Jump Dropdown */}
                <select
                  value={viewMonth}
                  onChange={(e) => handleMonthJump(e.target.value)}
                  className="bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-800 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition border border-slate-200/60"
                  aria-label="Select month"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>

                {/* Year Jump Dropdown */}
                <select
                  value={viewYear}
                  onChange={(e) => handleYearJump(e.target.value)}
                  className="bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-800 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition border border-slate-200/60"
                  aria-label="Select year"
                >
                  {yearsList.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step Navigation (< >) for fine control */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 0) {
                      setViewMonth(11);
                      setViewYear((y) => y - 1);
                    } else {
                      setViewMonth((m) => m - 1);
                    }
                  }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                  title="Previous month"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 11) {
                      setViewMonth(0);
                      setViewYear((y) => y + 1);
                    } else {
                      setViewMonth((m) => m + 1);
                    }
                  }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                  title="Next month"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-1">
              {SHORT_DAYS.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* Empty leading days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="py-2" />
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const active = isSelected(day);
                const currentToday = isToday(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDaySelect(day)}
                    className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl font-medium transition ${
                      active
                        ? "bg-orange-500 text-white font-bold shadow-md hover:bg-orange-600"
                        : currentToday
                        ? "border border-orange-400 text-orange-600 font-semibold hover:bg-orange-50"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Bottom quick actions */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
                  setInputText(isoToDisplay(iso));
                  onChange?.(iso);
                  setOpen(false);
                }}
                className="text-orange-600 hover:text-orange-700 font-semibold px-2 py-1 rounded hover:bg-orange-50 transition"
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        );

        if (inline) return popover;
        return createPortal(popover, document.body);
      })()}
    </div>
  );
}

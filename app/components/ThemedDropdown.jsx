"use client";

import { useEffect, useMemo, useRef, useState, cloneElement } from "react";
import { createPortal } from "react-dom";

export default function ThemedDropdown({ value, options, onChange, ariaLabel, inlineMenu = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);
  const [mounted, setMounted] = useState(false);

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
    // mark mounted so portal/menu rendering only happens after client hydration
    setMounted(true);
  }, []);

  const selectedLabel = useMemo(() => {
    return options.find((option) => option.value === value)?.label ?? value;
  }, [options, value]);

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
    <div ref={rootRef} className="relative w-full">
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
          className={`theme-dropdown-chevron h-5 w-5 shrink-0 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
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
              className={`theme-dropdown-menu ${inlineMenu ? "relative z-10 mt-2" : "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"}`}
              style={inlineMenu ? undefined : menuStyle}
            >
              <div className="max-h-60 overflow-auto p-1">
                {options.map((option) => {
                  const active = option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center rounded-lg px-4 py-3 text-left text-sm transition ${
                        active
                          ? "theme-dropdown-option-active"
                          : "theme-dropdown-option text-slate-700"
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );

          if (inlineMenu) return menu;

          // position portal menu relative to trigger
          if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const computed = {
              position: "fixed",
              left: `${rect.left}px`,
              top: `${rect.bottom + 8}px`,
              minWidth: `${rect.width}px`,
              zIndex: 99999,
            };
            const styleToUse = menuStyle || computed;
            return createPortal(
              // clone menu with inline style applied
              /*#__PURE__*/ cloneElement(menu, { style: inlineMenu ? undefined : styleToUse }),
              document.body
            );
          }

          return createPortal(menu, document.body);
        })()
      )}
    </div>
  );
}

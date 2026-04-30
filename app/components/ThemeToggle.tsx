"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "boring-tools-theme";

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme: ThemeMode = stored === "dark" || stored === "light" ? stored : prefersDark ? "dark" : "light";

    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="pointer-events-auto relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-neutral-200 bg-white/80 text-neutral-900 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-300 transition"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* render both icons and crossfade for a simple morph-like effect */}
      <svg className={`absolute w-5 h-5 transition-opacity duration-200 ${isDark ? "opacity-0 scale-95" : "opacity-100 scale-100"}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.2 4.2l.7.7M19.1 19.1l.7.7M1 12h1m20 0h1M4.2 19.8l.7-.7M19.1 4.9l.7-.7M12 7a5 5 0 100 10 5 5 0 000-10z" />
      </svg>

      <svg className={`absolute w-5 h-5 transition-opacity duration-200 ${isDark ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>

      {/* fallback text for non-mounted state (visually hidden) */}
      {!mounted && <span className="sr-only">Theme</span>}
    </button>
  );
}

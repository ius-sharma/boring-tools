"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserNav from "./UserNav";
import { openCommandPalette } from "./CommandPalette";

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const pathname = usePathname();

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav
      ref={navRef}
      className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs transition"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* 1. Left: Brand Logo */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="font-bold text-slate-900 text-lg hover:text-orange-600 transition tracking-tight"
            >
              BoringTools
            </Link>
          </div>

          {/* 2. Middle: Navigation Links (Home, Pricing, About) */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                pathname === "/"
                  ? "text-orange-600 font-semibold"
                  : "text-slate-700 hover:text-orange-600"
              }`}
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className={`text-sm font-medium transition ${
                pathname === "/pricing"
                  ? "text-orange-600 font-semibold"
                  : "text-slate-700 hover:text-orange-600"
              }`}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition ${
                pathname === "/about"
                  ? "text-orange-600 font-semibold"
                  : "text-slate-700 hover:text-orange-600"
              }`}
            >
              About
            </Link>
          </div>

          {/* 3. Right: Universal Command Palette Trigger & UserNav & Mobile Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger Button (Desktop & Tablet) */}
            <button
              type="button"
              onClick={openCommandPalette}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-full transition cursor-pointer"
              title="Search tools"
            >
              <svg
                className="w-3.5 h-3.5 text-slate-400 shrink-0"
                fill="currentColor"
                viewBox="0 0 135 131"
                aria-hidden="true"
              >
                <path d="M39.8 8.9A47.5 47.5 0 0 0 7 54c0 13.1 4.3 23.5 13.4 32.5A46 46 0 0 0 54.1 100c11.4 0 21.4-3.6 31.3-11.4.8-.5 7.4 5.5 18.6 16.9 9.6 9.7 18.3 18 19.3 18.6 2.4 1.4 5.9-.7 5.5-3.2-.2-1.1-8.6-10.2-18.8-20.4L91.6 82l1.7-3a58 58 0 0 0 6.4-21.6 46.5 46.5 0 0 0-34.1-49 55 55 0 0 0-25.8.5m29.7 8.9a39 39 0 0 1 22.1 44.1c-6.4 30.8-42.2 41.4-65.7 19.4-18.2-17-13.6-48.8 9-62.1a37 37 0 0 1 34.6-1.4" />
              </svg>
              <span className="text-slate-600">
                Search tools...
              </span>
            </button>

            {/* Command Palette Trigger (Mobile Icon Only) */}
            <button
              type="button"
              onClick={openCommandPalette}
              className="sm:hidden p-2 text-slate-600 hover:text-orange-600 hover:bg-slate-100 rounded-full transition cursor-pointer active:scale-95"
              title="Search tools"
              aria-label="Search tools"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 135 131" aria-hidden="true">
                <path d="M39.8 8.9A47.5 47.5 0 0 0 7 54c0 13.1 4.3 23.5 13.4 32.5A46 46 0 0 0 54.1 100c11.4 0 21.4-3.6 31.3-11.4.8-.5 7.4 5.5 18.6 16.9 9.6 9.7 18.3 18 19.3 18.6 2.4 1.4 5.9-.7 5.5-3.2-.2-1.1-8.6-10.2-18.8-20.4L91.6 82l1.7-3a58 58 0 0 0 6.4-21.6 46.5 46.5 0 0 0-34.1-49 55 55 0 0 0-25.8.5m29.7 8.9a39 39 0 0 1 22.1 44.1c-6.4 30.8-42.2 41.4-65.7 19.4-18.2-17-13.6-48.8 9-62.1a37 37 0 0 1 34.6-1.4" />
              </svg>
            </button>

            {/* User Nav */}
            <UserNav />

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 105 107" aria-hidden="true">
                  <path d="M72.7 26.2 52 47.5l-20-20A191 191 0 0 0 10 7.2c-2.7-.4-5.2 1.6-4.8 4 .2 1 9.4 11 20.6 22.1L46 53.5l-19.1 20c-10.4 11-19.5 21-20.1 22.3-1.6 3.1 2 7 5.1 5.6 1.1-.5 10.4-9.8 20.6-20.7A325 325 0 0 1 52.1 61c.6 0 10.2 9.2 21.3 20.5A206 206 0 0 0 95.2 102c1.8 0 4.8-3.1 4.8-5 0-.8-9.3-10.7-20.7-22.2L58.6 54l3.4-3.7 20.7-21.4C92.2 19.3 100 10.6 100 9.7c0-1.6-3.5-4.7-5.5-4.7-.5-.1-10.3 9.5-21.8 21.2" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Navigation links) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-1 animate-fade-in">
            <Link
              href="/"
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

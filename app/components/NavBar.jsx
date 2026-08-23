"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserNav from "./UserNav";
import { tools } from "../tools-data";

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navRef = useRef(null);
  const pathname = usePathname();

  // Handle Search Input Filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = tools
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
    setSearchResults(filtered);
  }, [searchQuery]);

  // Click outside to collapse search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchExpanded(false);
        setSearchQuery("");
        setSearchResults([]);
      }
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Keyboard Shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchExpanded((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsSearchExpanded(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input on expand
  useEffect(() => {
    if (isSearchExpanded) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchExpanded]);

  return (
    <nav
      ref={navRef}
      className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-sm transition"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 1. Left: Brand Logo (Original authentic BoringTools style) */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="font-bold text-slate-900 text-lg hover:text-orange-600 transition"
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

          {/* 3. Right: Inline Expanding Search & UserNav */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Inline Expandable Search Container */}
            <div ref={searchContainerRef} className="relative flex items-center">
              {isSearchExpanded ? (
                /* Expanded State: Smooth input in navbar */
                <div className="flex items-center bg-slate-100/90 border border-slate-300/80 rounded-full pl-3 pr-2 py-1.5 w-60 sm:w-72 md:w-80 shadow-inner transition-all duration-300 animate-fade-in">
                  <svg
                    className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 100+ tools..."
                    className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition ml-1 flex-shrink-0"
                    aria-label="Close search"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                /* Collapsed State: Single Search Icon */
                <button
                  type="button"
                  onClick={() => setIsSearchExpanded(true)}
                  className="p-2 text-slate-700 hover:text-orange-600 hover:bg-orange-50/70 rounded-full transition focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  title="Search tools (⌘K)"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              )}

              {/* Floating Live Search Dropdown */}
              {isSearchExpanded && searchQuery.trim() && (
                <div className="absolute top-full right-0 mt-2 w-72 sm:w-84 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
                  <div className="max-h-72 overflow-y-auto p-2">
                    {searchResults.length > 0 ? (
                      <div className="space-y-1">
                        {searchResults.map((tool) => (
                          <Link
                            key={tool.id}
                            href={tool.href}
                            onClick={() => {
                              setIsSearchExpanded(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-700 transition group"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-semibold text-slate-900 group-hover:text-orange-700 text-xs sm:text-sm truncate">
                                {tool.name}
                              </div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">
                                {tool.description}
                              </div>
                            </div>
                            <span className="text-[10px] font-medium bg-slate-100 group-hover:bg-orange-100 text-slate-600 group-hover:text-orange-700 px-2 py-0.5 rounded-md flex-shrink-0">
                              {tool.category}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No tools found matching "{searchQuery}".
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Nav: Sign In / Register (Guest) OR Avatar + Name + Dropdown (Logged In) */}
            <UserNav />

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-1">
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

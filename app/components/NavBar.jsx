"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import UserNav from "./UserNav";
import { tools } from "../tools-data";

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const mobileResultsRef = useRef(null);
  const navRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

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
      const isOutsideDesktop =
        !searchContainerRef.current || !searchContainerRef.current.contains(event.target);
      const isOutsideMobile =
        !mobileSearchContainerRef.current || !mobileSearchContainerRef.current.contains(event.target);
      const isOutsideMobileResults =
        !mobileResultsRef.current || !mobileResultsRef.current.contains(event.target);

      if (isOutsideDesktop && isOutsideMobile && isOutsideMobileResults) {
        setIsSearchExpanded(false);
        setTimeout(() => {
          setSearchQuery("");
          setSearchResults([]);
        }, 300);
      }
      if (navRef.current && !navRef.current.contains(event.target) && isOutsideMobileResults) {
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
        setTimeout(() => {
          setSearchQuery("");
          setSearchResults([]);
        }, 300);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input on expand
  useEffect(() => {
    if (isSearchExpanded) {
      setTimeout(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          mobileSearchInputRef.current?.focus();
        } else {
          searchInputRef.current?.focus();
        }
      }, 50);
    }
  }, [isSearchExpanded]);

  // Reset search and mobile menu when navigating
  useEffect(() => {
    setIsSearchExpanded(false);
    setSearchQuery("");
    setSearchResults([]);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleOpenSearch = () => {
    setMobileMenuOpen(false);
    setIsSearchExpanded(true);
  };

  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    setTimeout(() => {
      setSearchQuery("");
      setSearchResults([]);
    }, 300);
  };

  const handleToolSelect = (e, href) => {
    e.preventDefault();
    setIsSearchExpanded(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(href);
  };

  const hasSearchContent = isSearchExpanded && Boolean(searchQuery.trim());

  return (
    <nav
      ref={navRef}
      className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-sm transition"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* 1. Left: Brand Logo */}
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

          {/* 3. Right: Desktop Search & UserNav & Mobile Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Expandable Search with Smooth Width Expansion */}
            <div ref={searchContainerRef} className="hidden md:flex relative items-center">
              <div
                className={`flex items-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                  isSearchExpanded
                    ? "w-72 lg:w-80 bg-slate-100/90 border border-slate-300/80 pl-3 pr-2 py-1.5 shadow-inner"
                    : "w-9 h-9 bg-transparent border border-transparent p-0 hover:bg-orange-50/70 hover:text-orange-600 justify-center cursor-pointer"
                }`}
                onClick={() => {
                  if (!isSearchExpanded) handleOpenSearch();
                }}
              >
                {/* Search Icon / Trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSearchExpanded) {
                      handleOpenSearch();
                    } else {
                      searchInputRef.current?.focus();
                    }
                  }}
                  className={`p-1.5 text-slate-700 hover:text-orange-600 rounded-full transition-colors flex-shrink-0 focus:outline-none ${
                    isSearchExpanded ? "text-slate-400 hover:text-slate-600" : ""
                  }`}
                  title={isSearchExpanded ? "Search" : "Search tools (⌘K)"}
                  aria-label="Search"
                >
                  <svg
                    className={`${isSearchExpanded ? "w-4 h-4" : "w-5 h-5"} transition-all duration-200`}
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
                </button>

                {/* Search Input Field */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 100+ tools..."
                  tabIndex={isSearchExpanded ? 0 : -1}
                  className={`w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none transition-all duration-200 ${
                    isSearchExpanded ? "opacity-100 ml-1" : "opacity-0 pointer-events-none w-0"
                  }`}
                />

                {/* Close Button (Only visible when expanded) */}
                {isSearchExpanded && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseSearch();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition ml-1 flex-shrink-0 active:scale-95 animate-fade-in"
                    aria-label="Close search"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Desktop Floating Live Search Dropdown */}
              <div
                className={`absolute top-full right-0 mt-2 w-72 sm:w-84 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right ${
                  hasSearchContent
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="max-h-72 overflow-y-auto p-2">
                  {searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((tool) => (
                        <Link
                          key={tool.id}
                          href={tool.href}
                          onClick={(e) => handleToolSelect(e, tool.href)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-700 transition group cursor-pointer"
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
            </div>

            {/* Mobile Search Trigger (Compact icon button when search is collapsed) */}
            <button
              type="button"
              onClick={handleOpenSearch}
              className="md:hidden p-2 text-slate-700 hover:text-orange-600 hover:bg-orange-50/70 rounded-full transition focus:outline-none focus:ring-2 focus:ring-orange-500/40 active:scale-95"
              aria-label="Open search"
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

            {/* User Nav: Sign In / Register (Guest) OR Avatar + Name + Dropdown (Logged In) */}
            <UserNav />

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (isSearchExpanded) handleCloseSearch();
              }}
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

          {/* Mobile Full-Width Search Bar with Smooth In/Out Transition */}
          <div
            ref={mobileSearchContainerRef}
            className={`md:hidden absolute inset-0 bg-white z-50 px-3 flex items-center gap-2 border-b border-slate-200 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isSearchExpanded
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto shadow-sm"
                : "opacity-0 -translate-y-2 scale-[0.98] pointer-events-none"
            }`}
          >
            <button
              type="button"
              onClick={handleCloseSearch}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition flex-shrink-0 active:scale-95"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div className="flex-1 flex items-center bg-slate-100/90 rounded-full pl-3 pr-2 py-1.5 border border-slate-300/80 shadow-inner">
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
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 100+ tools..."
                className="w-full text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    mobileSearchInputRef.current?.focus();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition flex-shrink-0"
                  aria-label="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleCloseSearch}
              className="text-xs font-semibold text-orange-600 px-2 py-1 hover:text-orange-700 transition flex-shrink-0 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Normal links) */}
        {mobileMenuOpen && !isSearchExpanded && (
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

      {/* Mobile Live Search Results Dropdown & Backdrop with Smooth In/Out Transition */}
      <div className="md:hidden">
        {/* Backdrop overlay */}
        <div
          className={`fixed inset-0 top-16 bg-slate-900/30 backdrop-blur-xs z-40 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            hasSearchContent
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={handleCloseSearch}
        />

        {/* Results Card */}
        <div
          ref={mobileResultsRef}
          className={`fixed inset-x-3 top-[4.5rem] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[65vh] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top ${
            hasSearchContent
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 -translate-y-3 pointer-events-none"
          }`}
        >
          <div className="max-h-[65vh] overflow-y-auto p-2">
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    onClick={(e) => handleToolSelect(e, tool.href)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-700 active:bg-orange-100 transition group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-900 group-hover:text-orange-700 text-sm truncate">
                        {tool.name}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">
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
              <div className="py-8 text-center text-sm text-slate-500">
                No tools found matching "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

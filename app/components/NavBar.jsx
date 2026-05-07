"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function NavBar({ searchRef = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/70 backdrop-blur border-b border-white/20 sticky top-0 z-40 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-slate-900 text-lg hover:text-orange-600 transition">
            BoringTools
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-700 hover:text-orange-600 font-medium transition">
              Home
            </Link>
            <Link href="/about" className="text-slate-700 hover:text-orange-600 font-medium transition">
              About
            </Link>
            <Link href="/contact" className="text-slate-700 hover:text-orange-600 font-medium transition">
              Contact
            </Link>
          </div>

          {/* Search & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            {/* Search Icon */}
            <button
              onClick={() => {
                try {
                  if (typeof window !== "undefined" && pathname === "/") {
                    // If already on homepage, scroll to tools section
                    const el = document.getElementById("find-tools");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                      return;
                    }
                  }
                } catch (e) {}
                // Otherwise navigate to homepage with focus param
                router.push("/?focus=tools");
              }}
              className="p-2 hover:bg-orange-50 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Search"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-orange-50 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Menu"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div ref={menuRef} className="md:hidden border-t border-slate-200 py-4 space-y-3">
            <Link
              href="/"
              className="block px-4 py-2 text-slate-700 hover:bg-orange-50 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-slate-700 hover:bg-orange-50 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-slate-700 hover:bg-orange-50 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

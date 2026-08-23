"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function UserNav() {
  const { user, credits, loading, openAuthModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-full" />
    );
  }

  // 1. Logged-in State (Variation 5 Style: Avatar + First Name + Down Chevron)
  if (user) {
    const displayName = user.fullName
      ? user.fullName.split(" ")[0]
      : user.email.split("@")[0];

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full transition focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          aria-label="User profile menu"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-7 h-7 rounded-full object-cover border border-slate-300"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {displayName[0].toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-slate-800 max-w-[100px] truncate">
            {displayName}
          </span>
          <svg
            className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* User Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in text-sm">
            <div className="px-4 py-2.5 border-b border-slate-100">
              <p className="font-semibold text-slate-900 truncate">{user.fullName || displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  {credits?.isPro ? "Pro Plan" : "Free Plan"}
                </span>
                <span className="text-[11px] font-semibold text-[#ea580c] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                  ⚡ {credits?.totalAvailable ?? 10} credits left
                </span>
              </div>
            </div>

            <div className="py-1">
              <Link
                href="/pricing"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition"
              >
                <span>👑</span>
                <span>{credits?.isPro ? "Manage Subscription" : "Upgrade to Pro"}</span>
              </Link>
              <Link
                href="/#find-tools"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition"
              >
                <span>🛠️</span>
                <span>Explore All Tools</span>
              </Link>
            </div>

            <div className="border-t border-slate-100 pt-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Guest / Logged-out State (Variation 1 Style: Ghost 'Sign In' + Solid Rounded 'Register')
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-orange-600 transition"
      >
        Sign in
      </Link>

      <Link
        href="/signup"
        className="px-4 py-2 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition transform active:scale-95"
      >
        Register
      </Link>
    </div>
  );
}

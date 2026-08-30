"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { tools } from "./tools-data";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");

  const popularTools = useMemo(() => {
    const featuredIds = [
      "background-remover",
      "gif-maker",
      "geography-quiz",
      "bmi-calculator",
      "qr-generator",
      "video-transcriber",
      "fake-data-generator",
      "json-formatter",
    ];
    return tools.filter((t) => featuredIds.includes(t.id) && t.status === "Live");
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return tools
      .filter(
        (t) =>
          t.status === "Live" &&
          (t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white text-[#0f172a] selection:bg-orange-100 flex flex-col justify-between font-sans">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 w-full flex-1 flex flex-col justify-center">
        <div className="max-w-3xl mx-auto w-full text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Error 404 · Page Not Found
          </div>

          {/* Two-Tone Headline matching About Page theme */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-4">
            <span className="text-slate-900 block">This tool doesn&apos;t exist yet.</span>
            <span className="text-slate-400 block font-bold text-2xl sm:text-4xl mt-2">
              Or it may have been moved or renamed.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Search our collection of 70+ free, client-side browser utilities below or jump back to the main library.
          </p>

          {/* Search Box */}
          <div className="relative max-w-lg mx-auto mt-8 mb-8 text-left">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. background remover, pdf, bmi, qr)..."
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-slate-900 focus:bg-white rounded-2xl px-4 py-3.5 pl-11 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition shadow-xs"
                aria-label="Search tools"
              />
              <svg
                className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded-md transition"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-30 divide-y divide-slate-100">
                {searchResults.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition group"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition">
                        {tool.name}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {tool.description}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-orange-600 transition ml-3 shrink-0">
                      Open →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons styled matching About Page */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            <Link
              href="/"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full transition shadow-xs inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Explore All Tools
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-full border border-slate-300 transition shadow-xs"
            >
              About the Project
            </Link>
          </div>

          {/* Popular Tools Grid */}
          <div className="border-t border-slate-200 pt-10 text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                POPULAR BROWSER TOOLS
              </h2>
              <Link href="/" className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition">
                View all 70+ tools →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {popularTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 transition group flex flex-col justify-between shadow-xs hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {tool.category}
                      </span>
                      <span className="text-xs text-slate-400 group-hover:text-orange-600 transition">
                        →
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition">
                      {tool.name}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {tool.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

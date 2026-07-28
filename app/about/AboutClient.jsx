"use client";

import { useState } from "react";
import Link from "next/link";

export default function AboutClient() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    toolIdea: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.toolIdea.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Hero Header */}
      <header className="bg-white border-b border-slate-200/80 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-1 text-xs font-mono font-medium text-amber-800 border border-amber-200/60 mb-6">
            100 DAYS • 100 TOOLS
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Boring Name. <span className="text-amber-600">Useful Tools.</span>
          </h1>

          <p className="mt-4 text-lg text-slate-600 max-w-2xl leading-relaxed">
            A curated library of fast, browser-first micro-utilities designed to solve daily tasks without signups, paywalls, or tracking.
          </p>

          {/* Minimal Metrics Grid */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200 pt-8">
            <div>
              <p className="text-2xl sm:text-3xl font-semibold font-mono text-slate-900">100</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Live Utilities</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-semibold font-mono text-slate-900">100%</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Client-Side</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-semibold font-mono text-slate-900">0</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Logins & Paywalls</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-semibold font-mono text-slate-900">Open</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Source Repository</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 mt-12 space-y-12">
        {/* Origin Story */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          <p className="text-xs font-mono font-semibold tracking-wider text-slate-600 uppercase mb-2">
            BACKGROUND
          </p>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Why BoringTools Exists</h2>

          <div className="mt-5 space-y-4 text-slate-700 leading-relaxed text-base">
            <p>
              Every time I needed a basic utility—like converting an image, formatting text, calculating dates, or generating test data—I had to search Google and navigate cluttered websites full of aggressive popups, paywalls, cookie banners, and forced signups.
            </p>
            <p className="border-l-2 border-slate-900 pl-4 py-1 text-slate-900 font-medium bg-slate-50/80 rounded-r-lg">
              Having to jump across multiple paywalled websites for simple micro-tasks was inefficient and frustrating. I wanted a clean, single destination for fast, essential tools.
            </p>
            <p>
              That led me to start the <strong>100 Days, 100 Tools</strong> challenge as a solo developer. The goal was simple: build 100 lightweight, privacy-focused utilities where processing happens entirely in your browser.
            </p>
            <p className="border-l-2 border-slate-900 pl-4 py-1 text-slate-900 font-medium bg-slate-50/80 rounded-r-lg">
              Today, that milestone is fully accomplished! 100 days of consistency has turned this experiment into a comprehensive, browser-first ecosystem of daily micro-utilities.
            </p>
          </div>
        </section>

        {/* Core Philosophy Grid */}
        <section>
          <p className="text-xs font-mono font-semibold tracking-wider text-slate-600 uppercase mb-4">
            PRINCIPLES
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-xs transition-all duration-200 group">
              <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-orange-50 group-hover:text-orange-600 flex items-center justify-center text-slate-700 mb-4 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Privacy-First Architecture</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                All data, files, and computations stay within your browser window. Nothing is transmitted to external servers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-xs transition-all duration-200 group">
              <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-orange-50 group-hover:text-orange-600 flex items-center justify-center text-slate-700 mb-4 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Zero Friction</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                No user accounts, mandatory subscriptions, or forced paywalls. Open any tool and use it instantly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-xs transition-all duration-200 group">
              <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-orange-50 group-hover:text-orange-600 flex items-center justify-center text-slate-700 mb-4 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Open Source</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                Entire codebase is public on GitHub. Anyone can review implementation details or submit new tools.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-xs transition-all duration-200 group">
              <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-orange-50 group-hover:text-orange-600 flex items-center justify-center text-slate-700 mb-4 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Unified Collection</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                A single destination covering developer, design, productivity, math, and daily browser tools.
              </p>
            </div>
          </div>
        </section>

        {/* Developer Card (Minimal & Premium) */}
        <section className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-slate-800">
          <p className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase mb-3">
            DEVELOPER
          </p>
          
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Myself Ayush Sharma
          </h2>

          <p className="mt-4 text-slate-300 text-base leading-relaxed max-w-2xl">
            I am a solo software developer building web applications and open-source tools. I created BoringTools to simplify everyday web workflows and build a clean, reliable toolkit for developers, creators, and users worldwide.
          </p>

          {/* Social Links Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/ius-sharma"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <svg className="w-3.5 h-3.5 fill-current text-slate-300" viewBox="0 0 24 24">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.55-3.88-1.55-.53-1.36-1.3-1.72-1.3-1.72-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 012.9-.39c.98.01 1.97.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.4 24 17.09 24 12 24 5.65 18.35.5 12 .5z" />
              </svg>
              GitHub
            </a>

            <a
              href="https://instagram.com/ocn.ayush07"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <svg className="w-3.5 h-3.5 fill-current text-slate-300" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Instagram
            </a>

            <a
              href="https://www.linkedin.com/in/ayush-sharma-833163320/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <svg className="w-3.5 h-3.5 fill-current text-slate-300" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              LinkedIn
            </a>

            <a
              href="https://www.youtube.com/@ocnayush"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <svg className="w-3.5 h-3.5 fill-current text-slate-300" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
              YouTube
            </a>
          </div>
        </section>

        {/* Suggestion Form & GitHub Repository Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-slate-900">Suggest a Tool</h3>
            <p className="mt-1 text-sm text-slate-600">
              Have an idea for a tool or utility? Submit your suggestion below.
            </p>

            {submitted ? (
              <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-sm font-semibold text-slate-900">Suggestion Received</p>
                <p className="text-xs text-slate-600 mt-1">Thank you for helping improve BoringTools.</p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", contact: "", toolIdea: "" });
                  }}
                  className="mt-3 text-xs text-amber-700 font-medium hover:underline cursor-pointer"
                >
                  Submit another response
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Name / Handle
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Optional"
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Contact Info
                    </label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="Optional (email or handle)"
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tool Idea / Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.toolIdea}
                    onChange={(e) => setFormData({ ...formData, toolIdea: e.target.value })}
                    placeholder="Describe what tool you need..."
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Submitting..." : "Submit Idea"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* GitHub Repository Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">GitHub Repository</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                BoringTools is open source. Check out the source code, open issues, or give the repository a star.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <a
                href="https://github.com/ius-sharma/boring-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg transition"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.55-3.88-1.55-.53-1.36-1.3-1.72-1.3-1.72-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 012.9-.39c.98.01 1.97.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.4 24 17.09 24 12 24 5.65 18.35.5 12 .5z" />
                </svg>
                View on GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-200 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition font-medium">
            ← Back to all tools
          </Link>

          <a
            href="https://github.com/ius-sharma/boring-tools/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition font-medium"
          >
            Contributing Guide →
          </a>
        </div>
      </main>
    </div>
  );
}

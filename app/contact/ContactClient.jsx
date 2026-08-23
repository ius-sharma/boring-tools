"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const QUESTIONS_TO_CYCLE = [
  "How do I upgrade to Boring Tools Pro?",
  "Are client-side utilities really free forever?",
  "How do I request a new custom tool?",
  "Where can I report a bug or suggest improvements?",
];

export default function ContactClient() {
  // ─── 1. Typewriter Placeholder State ───
  const [questionIndex, setQuestionIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // ─── 2. Contact Message Modal State ───
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Support");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState("");


  // Typewriter Loop Effect
  useEffect(() => {
    const currentFullText = QUESTIONS_TO_CYCLE[questionIndex];
    let timer;

    if (!isDeleting) {
      // Typing characters
      if (displayedText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        }, 50);
      } else {
        // Pausing at full text
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      // Deleting characters
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length - 1));
        }, 25);
      } else {
        // Switch to next question
        setIsDeleting(false);
        setQuestionIndex((prev) => (prev + 1) % QUESTIONS_TO_CYCLE.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, questionIndex]);

  // Handle direct message submission via /api/suggestions
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    setSendError("");

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `[${subject}] from ${name || "Anonymous"}`,
          description: message.trim(),
          category: subject,
          authorName: name.trim() || "Anonymous",
          authorEmail: email.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message. Please try again.");
      }

      setSendSuccess(true);
      setMessage("");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to deliver message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white text-[#0f172a] font-sans selection:bg-orange-100 flex flex-col pb-16 sm:pb-24"
      style={{
        "--bg-page": "#ffffff",
        "--bg-surface": "#ffffff",
        "--text-primary": "#0f172a",
        "--text-muted": "#64748b",
        "--accent": "#ea580c",
        "--accent-hover": "#c2410c",
        "--border-subtle": "#e2e8f0",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
          Large empty padding above and below (~100px+ top, ~80px bottom)
      ───────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6 text-center max-w-4xl mx-auto w-full">
        {/* Eyebrow Label: Centered, Bold, Uppercase, ~13px, Accent Color ONLY */}
        <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#ea580c] mb-3">
          Support & Contact
        </p>

        {/* H1: ~36-40px, Semi-bold, Primary Text Color, Conversational */}
        <h1 className="text-3xl sm:text-[40px] font-semibold text-[#0f172a] tracking-tight leading-tight">
          How can we help you today?
        </h1>

        {/* Search Bar with Typewriter Animated Placeholder */}
        <div className="mt-8 max-w-[520px] mx-auto relative flex items-center">
          {/* Left Search Icon */}
          <div className="absolute left-4.5 pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Search Input (Pill-shaped, border subtle, no shadows) */}
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={displayedText}
            className="w-full h-[52px] pl-12 pr-5 bg-white border border-slate-200 rounded-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition"
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SUPPORT OPTION CARDS (3-Column Grid)
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Guides & Documentation */}
          <div className="border border-slate-200 bg-white rounded-2xl p-8 flex flex-col justify-between transition hover:border-slate-300">
            <div>
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">
                Guides & Tutorials
              </h2>
              <p className="mt-2.5 text-[14px] text-slate-500 leading-relaxed">
                Browse detailed setup guides, keyboard shortcuts, API specifications, and step-by-step walkthroughs for all utilities.
              </p>
            </div>
            <div className="mt-8 pt-4">
              <Link
                href="/setup-guide"
                className="w-full sm:w-auto inline-flex items-center justify-between gap-3 px-5 py-2.5 rounded-full border border-slate-300 hover:border-slate-900 text-slate-800 hover:text-slate-900 text-xs sm:text-sm font-medium transition"
              >
                <span>Explore Setup Guides</span>
                <span className="text-slate-400 font-mono text-sm">→</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Developer & Open Source */}
          <div className="border border-slate-200 bg-white rounded-2xl p-8 flex flex-col justify-between transition hover:border-slate-300">
            <div>
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">
                Community & GitHub
              </h2>
              <p className="mt-2.5 text-[14px] text-slate-500 leading-relaxed">
                Found a bug or want to request a feature? Inspect the codebase, open an issue, or contribute pull requests directly on GitHub.
              </p>
            </div>
            <div className="mt-8 pt-4">
              <a
                href="https://github.com/ius-sharma/boring-tools/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-between gap-3 px-5 py-2.5 rounded-full border border-slate-300 hover:border-slate-900 text-slate-800 hover:text-slate-900 text-xs sm:text-sm font-medium transition"
              >
                <span>Visit GitHub Repo</span>
                <span className="text-slate-400 font-mono text-sm">→</span>
              </a>
            </div>
          </div>

          {/* Card 3: Direct Creator Support */}
          <div className="border border-slate-200 bg-white rounded-2xl p-8 flex flex-col justify-between transition hover:border-slate-300">
            <div>
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">
                Direct Support & Queries
              </h2>
              <p className="mt-2.5 text-[14px] text-slate-500 leading-relaxed">
                Have questions regarding accounts, enterprise custom tools, or general feedback? Send a direct message to our team.
              </p>
            </div>
            <div className="mt-8 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(true);
                  setSendSuccess(false);
                  setSendError("");
                }}
                className="w-full sm:w-auto inline-flex items-center justify-between gap-3 px-5 py-2.5 rounded-full border border-slate-300 hover:border-slate-900 text-slate-800 hover:text-slate-900 text-xs sm:text-sm font-medium transition"
              >
                <span>Send a Message</span>
                <span className="text-slate-400 font-mono text-sm">→</span>
              </button>
            </div>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. "CAN'T FIND WHAT YOU'RE LOOKING FOR?" ATTACHED BANNER
            Shares a continuous top border with the grid container
        ───────────────────────────────────────────────────────────── */}
        <div className="mt-6 border border-slate-200 bg-white rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-[20px] sm:text-[22px] font-bold text-slate-900 tracking-tight">
                Can&apos;t find what you&apos;re looking for?
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Our inbox is always open. We typically respond to all developer inquiries within 24 hours.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(true);
                  setSendSuccess(false);
                  setSendError("");
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-slate-300 hover:border-slate-900 text-slate-800 hover:text-slate-900 text-sm font-medium transition active:scale-[0.99]"
              >
                <span>Get in Touch</span>
                <span className="text-slate-400 font-mono text-sm">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            5. TRUST / COMPLIANCE STRIP
            Left: Data protection + accent text link
            Right: Horizontal row of small checkmark badges
        ───────────────────────────────────────────────────────────── */}
        <div className="py-14 sm:py-16 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-600">
            {/* Left side */}
            <div className="flex items-center gap-1.5 text-center sm:text-left">
              <span>We protect your data.</span>
              <Link href="/privacy-policy" className="text-[#ea580c] font-medium hover:underline">
                Read Security Policy
              </Link>
            </div>

            {/* Right side */}
            <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Zero Data Tracking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>100% Client-Side Private</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Encrypted Transport</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: DIRECT MESSAGE / SUPPORT DIALOG
      ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Send a Message</h3>
            <p className="text-xs text-slate-500 mt-1">
              Fill out the form below. We typically respond within 24 hours.
            </p>

            {sendSuccess ? (
              <div className="mt-6 p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto text-sm font-bold mb-3">
                  ✓
                </div>
                <h4 className="text-base font-bold text-emerald-950">Message Delivered</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Thank you for reaching out. We have received your inquiry.
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-4 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="mt-5 space-y-4">
                {sendError && (
                  <p className="text-xs text-rose-600 font-medium">{sendError}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full h-[40px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full h-[40px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-[40px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-400 transition"
                  >
                    <option value="General Support">General Support</option>
                    <option value="Pro Subscription / Billing">Pro Subscription / Billing</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature / Tool Request">Feature / Tool Request</option>
                    <option value="Partnership / Custom Tool">Partnership / Custom Tool</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help?"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-5 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold rounded-full transition disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isSending ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

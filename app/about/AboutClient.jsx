"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

// 5 Milestone Data points for the interactive scrubber
const MILESTONES = [
  {
    id: 0,
    percent: 0,
    date: "April 20, 2026",
    headline: "Day 1: The 100 Days 100 Tools Challenge Begins",
    description: "Ayush Sharma commits to building 100 browser-first, privacy-focused micro-utilities open-source.",
  },
  {
    id: 1,
    percent: 25,
    date: "May 15, 2026",
    headline: "Day 25: 25 Core Developer & Math Utilities Live",
    description: "JSON formatter, Base converters, Age & EMI calculators launch with 100% client-side execution.",
  },
  {
    id: 2,
    percent: 50,
    date: "June 09, 2026",
    headline: "Day 50: Halfway Mark & Local Media Processing",
    description: "Offline image compressors, GIF makers, and WebAssembly-powered audio tools deployed with zero server upload.",
  },
  {
    id: 3,
    percent: 75,
    date: "July 04, 2026",
    headline: "Day 75: PDF Intelligence & Document OCR Tools",
    description: "Advanced document parsing, text extraction, and privacy-preserving analysis tools added to the library.",
  },
  {
    id: 4,
    percent: 100,
    date: "July 28, 2026",
    headline: "Day 100: 101 Tools Deployed & Global Release",
    description: "100 consecutive days of shipping culminates in a full suite of 101 fast, privacy-first tools used worldwide.",
  },
];

export default function AboutClient() {
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(4);
  const scrubberTrackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const activeMilestone = MILESTONES[activeMilestoneIndex];

  // Handle Scrubbing Interaction via Click or Drag
  const handleScrubberInteraction = (clientX) => {
    if (!scrubberTrackRef.current) return;
    const rect = scrubberTrackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (clickX / rect.width) * 100;

    // Find closest milestone index
    let closestIndex = 0;
    let minDiff = 100;
    MILESTONES.forEach((m, idx) => {
      const diff = Math.abs(m.percent - percent);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    setActiveMilestoneIndex(closestIndex);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleScrubberInteraction(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleScrubberInteraction(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="min-h-screen bg-white text-[#0f172a] selection:bg-orange-100"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={
        {
          "--bg-page": "#ffffff",
          "--bg-surface": "#f8fafc",
          "--text-primary": "#0f172a",
          "--text-muted": "#64748b",
          "--text-faded": "#cbd5e1",
          "--accent": "#ea580c",
          "--accent-hover": "#c2410c",
          "--border-subtle": "#e2e8f0",
        }
      }
    >
      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION (Two-Column Layout: Left ~55% / Right ~45%)
          Stacks on mobile below ~900px
      ───────────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-b border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ── Left Column (~55% width) ── */}
          <div className="lg:col-span-7">
            {/* Small eyebrow label top */}
            <div className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-4">
              OUR MISSION
            </div>

            {/* Two-line giant headline (Line 1 primary color, Line 2 muted/faded) */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              <span className="text-slate-900 block">Fast, private utilities for everyone.</span>
              <span className="text-slate-400 block mt-1">Built open-source to eliminate paywalls and popups.</span>
            </h1>

            {/* Paragraph below (~16-18px, muted gray, max-w ~480px, 3 lines) */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-[480px] leading-relaxed">
              A curated destination of 100+ browser-first micro-tools covering developer workflows, document intelligence, and daily calculations. Processed client-side with zero tracking.
            </p>

            {/* Two pill buttons side by side (rounded-full) */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/#find-tools"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full transition shadow-xs"
              >
                Explore 100+ Tools
              </Link>
              <a
                href="https://github.com/ius-sharma/boring-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-full border border-slate-300 transition shadow-xs"
              >
                View on GitHub
              </a>
            </div>
          </div>

          {/* ── Right Column (~45% width) ── */}
          {/* Vertical stack of 4 link rows separated by 1px hairline divider */}
          <div className="lg:col-span-5 flex flex-col divide-y divide-slate-200 border-t border-b lg:border-t-0 lg:border-b-0 border-slate-200">
            
            {/* Row 1 */}
            <a
              href="https://github.com/ius-sharma/boring-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="py-5 px-3 rounded-xl hover:bg-slate-50 transition group flex items-start justify-between gap-4"
            >
              <div>
                <div className="text-base font-bold text-slate-900 group-hover:text-[#ea580c] transition">
                  Open Source Ecosystem
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">
                  100% public repository on GitHub welcoming contributions.
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-[#ea580c] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-lg">
                ↗
              </span>
            </a>

            {/* Row 2 */}
            <div className="py-5 px-3 rounded-xl hover:bg-slate-50 transition group flex items-start justify-between gap-4 cursor-default">
              <div>
                <div className="text-base font-bold text-slate-900 group-hover:text-[#ea580c] transition">
                  Browser-First Privacy
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">
                  Computations happen locally in memory with zero document storage.
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-[#ea580c] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-lg">
                ↗
              </span>
            </div>

            {/* Row 3 */}
            <Link
              href="/pricing"
              className="py-5 px-3 rounded-xl hover:bg-slate-50 transition group flex items-start justify-between gap-4"
            >
              <div>
                <div className="text-base font-bold text-slate-900 group-hover:text-[#ea580c] transition">
                  Zero Friction Architecture
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">
                  70+ tools 100% free forever with no forced signups or paywalls.
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-[#ea580c] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-lg">
                ↗
              </span>
            </Link>

            {/* Row 4 */}
            <a
              href="https://github.com/ius-sharma"
              target="_blank"
              rel="noopener noreferrer"
              className="py-5 px-3 rounded-xl hover:bg-slate-50 transition group flex items-start justify-between gap-4"
            >
              <div>
                <div className="text-base font-bold text-slate-900 group-hover:text-[#ea580c] transition">
                  Built by Solo Developer
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">
                  Created by Ayush Sharma over 100 consecutive days of shipping.
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-[#ea580c] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-lg">
                ↗
              </span>
            </a>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. "AT OUR CORE" SECTION
          Centered heading + subtext, 3-column shared bordered container
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-b border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            At our core
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            The foundational engineering principles that guide how we design and deploy every utility.
          </p>
        </div>

        {/* 3-Column Shared Container with internal dividers */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-none grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Card 01 */}
          <div className="p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="text-3xl font-extrabold text-slate-300 tracking-tight mb-6">
                01
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Speed & Simplicity
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every tool loads in milliseconds with zero bloated dependencies. Simple inputs, instant outputs, and zero learning curve for users.
              </p>
            </div>
          </div>

          {/* Card 02 */}
          <div className="p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="text-3xl font-extrabold text-slate-300 tracking-tight mb-6">
                02
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Zero-Compromise Privacy
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your files and inputs stay inside your browser window. We never sell data, store documents, or inject tracking cookies into your session.
              </p>
            </div>
          </div>

          {/* Card 03 */}
          <div className="p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="text-3xl font-extrabold text-slate-300 tracking-tight mb-6">
                03
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Open & Accessible
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Free access for learners, creators, and engineers worldwide. Built to be a public, transparent digital utility for daily productivity.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. INTERACTIVE MILESTONE TIMELINE (Scrubber Component)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-b border-slate-200">
        <div className="text-center mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-[#ea580c] mb-2">
            MILESTONES & TIMELINE
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            From Day 1 challenge to 101 live tools
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Click or drag along the scrubber track to explore our 100-day journey.
          </p>
        </div>

        {/* Scrubber Interactive Track */}
        <div className="max-w-3xl mx-auto mb-12 select-none">
          <div
            ref={scrubberTrackRef}
            onMouseDown={handleMouseDown}
            className="relative h-7 flex items-center cursor-pointer group"
          >
            {/* Background Thin Track Line */}
            <div className="absolute inset-x-0 h-1 bg-slate-200 rounded-full" />

            {/* Highlighted Active Progress Line in --accent */}
            <div
              className="absolute left-0 h-1 bg-[#ea580c] rounded-full transition-all duration-200"
              style={{ width: `${activeMilestone.percent}%` }}
            />

            {/* Evenly Spaced Dots */}
            {MILESTONES.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMilestoneIndex(idx);
                }}
                className={`absolute w-3 h-3 -ml-1.5 rounded-full transition transform hover:scale-125 focus:outline-none ${
                  idx <= activeMilestoneIndex
                    ? "bg-[#ea580c] ring-2 ring-white"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
                style={{ left: `${m.percent}%` }}
                aria-label={`Milestone ${m.date}`}
              />
            ))}

            {/* Draggable Active Handle (Larger filled dot) */}
            <div
              className="absolute w-5 h-5 -ml-2.5 bg-slate-900 border-2 border-white rounded-full shadow-md transition-all duration-200 transform scale-110 pointer-events-none flex items-center justify-center"
              style={{ left: `${activeMilestone.percent}%` }}
            >
              <div className="w-1.5 h-1.5 bg-[#ea580c] rounded-full" />
            </div>
          </div>

          {/* Date labels at both ends below the line */}
          <div className="flex justify-between text-xs text-slate-400 font-mono mt-2">
            <span>April 2026 (Day 1)</span>
            <span>July 2026 (Day 100)</span>
          </div>
        </div>

        {/* Dynamic Content Block Updating Based on Scrubber Handle */}
        <div className="max-w-2xl mx-auto text-center p-8 bg-slate-50/80 rounded-2xl border border-slate-200/80 transition-all duration-300 animate-fade-in">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#ea580c] mb-2 font-mono">
            {activeMilestone.date}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
            {activeMilestone.headline}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
            {activeMilestone.description}
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. DEVELOPMENT & OPEN SOURCE ROOTS
          Authentic developer base, repository, and edge hosting
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-b border-slate-200">
        {/* Header Row (Left text, Right CTA pill buttons) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              DEVELOPMENT & ROOTS
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Built open-source in India, open for everyone.
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-lg">
              Crafted by solo developer Ayush Sharma. Designed to be a completely free, transparent digital toolkit powered by client-side browser execution.
            </p>
          </div>

          {/* Two Pill Buttons on the Right (rounded-full) */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="https://github.com/ius-sharma/boring-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-full transition shadow-xs"
            >
              Star on GitHub
            </a>
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-full border border-slate-300 transition shadow-xs"
            >
              Get in Touch
            </Link>
          </div>
        </div>

        {/* 4-Column Grid of Authentic Detail Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex items-center justify-between">
            <span className="font-bold text-sm text-slate-800">Bihar, IN</span>
            <span className="text-xs text-slate-400 font-mono">Developer Base</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex items-center justify-between">
            <span className="font-bold text-sm text-slate-800">GitHub</span>
            <span className="text-xs text-slate-400 font-mono">100% Open Source</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex items-center justify-between">
            <span className="font-bold text-sm text-slate-800">Vercel Edge</span>
            <span className="text-xs text-slate-400 font-mono">Global CDN</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex items-center justify-between">
            <span className="font-bold text-sm text-slate-800">Browser Sandbox</span>
            <span className="text-xs text-slate-400 font-mono">Client-Side Privacy</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. "LATEST NEWS" SECTION
          Heading + "All posts" link on row, 4-column image cards below
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-b border-slate-200">
        {/* Row: Heading Left + "All posts" Right */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Latest news & releases
          </h2>
          <a
            href="https://github.com/ius-sharma/boring-tools/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-semibold text-[#ea580c] hover:underline flex items-center gap-1"
          >
            <span>All updates</span>
            <span>→</span>
          </a>
        </div>

        {/* 3-Card Horizontal Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1: 100 Days Milestone */}
          <a
            href="https://github.com/ius-sharma/boring-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col group"
          >
            <div className="h-44 rounded-xl overflow-hidden border border-slate-200 shadow-xs group-hover:border-slate-300 transition bg-slate-100">
              <img
                src="/100days-101tools.png"
                alt="100 Days 101 Tools Milestone"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-3.5">
              <div className="text-xs text-slate-400 font-mono">Jul 28, 2026</div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-[#ea580c] transition mt-1 leading-snug">
                100 Days Challenge Complete: 101 Tools Deployed to Production
              </div>
            </div>
          </a>

          {/* Card 2: Smriti Tribute Wall */}
          <a
            href="https://smritiius.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col group"
          >
            <div className="h-44 rounded-xl overflow-hidden border border-slate-200 shadow-xs group-hover:border-slate-300 transition bg-slate-100">
              <img
                src="/smriti.png"
                alt="Smriti Digital Tribute Wall"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-3.5">
              <div className="text-xs text-slate-400 font-mono">Jun 20, 2026</div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-[#ea580c] transition mt-1 leading-snug">
                Smriti Digital Tribute Sanctuary for Teachers Released
              </div>
            </div>
          </a>

          {/* Card 3: PDF Intelligence & OCR Tool */}
          <Link
            href="/pdf-intelligence-tool"
            className="flex flex-col group"
          >
            <div className="h-44 rounded-xl overflow-hidden border border-slate-200 shadow-xs group-hover:border-slate-300 transition bg-slate-900">
              <img
                src="/pdf-intelligence.png"
                alt="PDF Intelligence Tool"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image not yet uploaded, show neutral dark background gracefully
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="mt-3.5">
              <div className="text-xs text-slate-400 font-mono">Aug 2026</div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-[#ea580c] transition mt-1 leading-snug">
                AI PDF Intelligence & Document OCR Tool Launched for Power Users
              </div>
            </div>
          </Link>

        </div>
      </section>
    </div>
  );
}

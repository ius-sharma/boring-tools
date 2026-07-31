"use client";

import { useMemo, useState, useEffect } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const toneOptions = [
  { value: "impact", label: "Impact-focused" },
  { value: "ats", label: "ATS-friendly" },
  { value: "leadership", label: "Leadership & outcomes" },
  { value: "technical", label: "Technical & precise" },
  { value: "xyz", label: "Google's XYZ Formula" },
];

const countOptions = [
  { value: "3", label: "3 bullets" },
  { value: "4", label: "4 bullets" },
  { value: "5", label: "5 bullets" },
  { value: "6", label: "6 bullets" },
];

const verbCategories = [
  {
    id: "leadership",
    label: "Leadership",
    verbs: ["Spearheaded", "Orchestrated", "Directing", "Mentored", "Coordinated", "Championed", "Fostered", "Steered"],
  },
  {
    id: "technical",
    label: "Engineering",
    verbs: ["Architected", "Engineered", "Automated", "Optimized", "Refactored", "Implemented", "Deployed", "Migrated"],
  },
  {
    id: "results",
    label: "Results",
    verbs: ["Maximized", "Accelerated", "Streamlined", "Surpassed", "Amplified", "Capitalized", "Boosted", "Slashed"],
  },
  {
    id: "analysis",
    label: "Analysis",
    verbs: ["Synthesized", "Evaluated", "Investigated", "Diagnosed", "Audited", "Forecasted", "Formulated", "Modeled"],
  },
];

const starterText = `Built internal dashboard for weekly reporting
Reduced manual copy-paste work across multiple sheets
Worked with sales and ops to improve handoff quality
Tracked recurring issues and shared updates with the team`;

export default function ResumeBulletRewriter() {
  const [input, setInput] = useState(starterText);
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("impact");
  const [count, setCount] = useState("4");
  const [bullets, setBullets] = useState([]);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [source, setSource] = useState("AI assistance");
  const [loading, setLoading] = useState(false);
  const [refiningIndex, setRefiningIndex] = useState(null);
  const [message, setMessage] = useState("");
  const [copyNote, setCopyNote] = useState("");
  const [activeVerbCategory, setActiveVerbCategory] = useState("leadership");
  const [verbCopyNote, setVerbCopyNote] = useState("");
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("resume_bullets_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const inputLines = useMemo(() => input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean), [input]);

  const handleGenerate = async () => {
    if (!inputLines.length) {
      setMessage("Add a few rough notes first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/resume-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, tone, count: Number(count), jobDescription }),
      });

      const payload = await response.json();

      if (response.ok && Array.isArray(payload.bullets) && payload.bullets.length) {
        setBullets(payload.bullets);
        const resolvedKeywords = payload.matchedKeywords || [];
        setMatchedKeywords(resolvedKeywords);
        
        const srcLabel = payload.source === "Groq API" ? "AI assistance" : "AI fallback";
        setSource(srcLabel);
        setMessage("Generated successfully.");
        setCopyNote("");

        // Save to history
        const newHistoryItem = {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          bullets: payload.bullets,
          matchedKeywords: resolvedKeywords,
          source: srcLabel,
          tone: toneOptions.find((t) => t.value === tone)?.label || tone,
        };
        const updatedHistory = [newHistoryItem, ...history.slice(0, 4)];
        setHistory(updatedHistory);
        localStorage.setItem("resume_bullets_history", JSON.stringify(updatedHistory));
        return;
      }

      setMessage(payload?.error || "Could not generate bullets.");
      setBullets([]);
      setMatchedKeywords([]);
      setCopyNote("");
    } catch {
      setMessage("Request failed. Try again.");
      setBullets([]);
      setMatchedKeywords([]);
      setCopyNote("");
    } finally {
      setLoading(false);
    }
  };

  const handleRefineBullet = async (index, instruction) => {
    const bulletToRefine = bullets[index];
    if (!bulletToRefine) return;

    setRefiningIndex(index);
    try {
      const response = await fetch("/api/resume-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refineBulletText: bulletToRefine,
          refineInstruction: instruction,
        }),
      });

      const payload = await response.json();

      if (response.ok && Array.isArray(payload.bullets) && payload.bullets.length) {
        const updated = [...bullets];
        updated[index] = payload.bullets[0];
        setBullets(updated);
      } else {
        alert(payload?.error || "Could not refine bullet.");
      }
    } catch {
      alert("Refinement request failed. Try again.");
    } finally {
      setRefiningIndex(null);
    }
  };

  const handleUpdateBullet = (index, newValue) => {
    const updated = [...bullets];
    updated[index] = newValue;
    setBullets(updated);
  };

  const handleDeleteBullet = (index) => {
    setBullets(bullets.filter((_, i) => i !== index));
  };

  const handleCopy = async () => {
    if (!bullets.length) return;
    await navigator.clipboard.writeText(bullets.map((bullet) => `• ${bullet}`).join("\n"));
    setCopyNote("Copied all bullets!");
    window.clearTimeout(window.__resumeCopyToastTimer);
    window.__resumeCopyToastTimer = window.setTimeout(() => {
      setCopyNote("");
    }, 2000);
  };

  const handleCopySingle = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopyNote("Copied bullet to clipboard!");
    window.clearTimeout(window.__resumeCopyToastTimer);
    window.__resumeCopyToastTimer = window.setTimeout(() => {
      setCopyNote("");
    }, 2000);
  };

  const handleCopyVerb = async (verb) => {
    await navigator.clipboard.writeText(verb);
    setVerbCopyNote(`Copied "${verb}"!`);
    window.clearTimeout(window.__verbCopyToastTimer);
    window.__verbCopyToastTimer = window.setTimeout(() => {
      setVerbCopyNote("");
    }, 1500);
  };

  const handleClear = () => {
    setInput("");
    setJobDescription("");
    setBullets([]);
    setMatchedKeywords([]);
    setMessage("");
    setCopyNote("");
    setSource("AI assistance");
  };

  const loadHistoryItem = (item) => {
    setBullets(item.bullets);
    setMatchedKeywords(item.matchedKeywords || []);
    setSource(item.source);
    setMessage(`Restored history from ${item.timestamp}.`);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("resume_bullets_history");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white shadow-xl shadow-slate-100 rounded-3xl p-6 sm:p-10 w-full max-w-7xl border border-slate-100 flex flex-col gap-8 transition-all">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Resume Bullet Rewriter
            </h1>
            <p className="text-slate-500 text-base max-w-2xl">
              Turn messy work descriptions and rough drafts into premium, high-impact, ATS-optimized resume bullets in seconds.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 active:scale-[0.98] transition text-sm cursor-pointer"
            >
              Clear Workspace
            </button>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Rough Notes Input */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3 shadow-sm shadow-slate-50">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[10px] font-bold text-white">1</span>
                  Rough Job Notes / Responsibilities
                </label>
                <span className="text-xs text-slate-400">One item per line</span>
              </div>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={6}
                className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm text-slate-800 placeholder:text-slate-400"
                placeholder="Example:
- Built a dashboard using React
- Helped sales team close leads
- Solved bugs to make things load faster..."
              />
            </div>

            {/* Target Job Description Input */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3 shadow-sm shadow-slate-50">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-900">2</span>
                  Target Job Description <span className="text-xs text-slate-400 font-normal">(Optional ATS Booster)</span>
                </label>
              </div>
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows={5}
                className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-sm text-slate-800 placeholder:text-slate-400"
                placeholder="Paste the target job description here to optimize your bullets with keywords matching the job requirement..."
              />
            </div>
          </div>

          {/* Right Column: Settings & Utilities */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Rewrite Controls */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-5 shadow-sm shadow-slate-50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Rewrite Controls
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex flex-col gap-2">
                  Tone Style
                  <ThemedDropdown ariaLabel="Select tone" value={tone} options={toneOptions} onChange={setTone} />
                </label>

                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex flex-col gap-2">
                  Bullet Count
                  <ThemedDropdown ariaLabel="Select bullet count" value={count} options={countOptions} onChange={setCount} />
                </label>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!inputLines.length || loading}
                className={`w-full py-4 rounded-xl font-bold transition duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2 text-white ${
                  !inputLines.length || loading
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99]"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating bullets...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Rewrite Bullets</span>
                  </>
                )}
              </button>

              {message && (
                <div className={`text-xs p-3 rounded-lg border text-center font-medium ${message.includes("failed") ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
                  {message}
                </div>
              )}
            </div>

            {/* Action Verbs Explorer */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-sm shadow-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Action Verbs Explorer
                </h3>
                {verbCopyNote && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">{verbCopyNote}</span>}
              </div>

              {/* Verb Category Tabs */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                {verbCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveVerbCategory(cat.id)}
                    className={`flex-1 text-[11px] font-semibold py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                      activeVerbCategory === cat.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Verbs List */}
              <div className="grid grid-cols-4 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                {verbCategories
                  .find((cat) => cat.id === activeVerbCategory)
                  ?.verbs.map((verb) => (
                    <button
                      key={verb}
                      type="button"
                      onClick={() => handleCopyVerb(verb)}
                      className="text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border border-slate-100 rounded-lg py-1.5 text-center cursor-pointer active:scale-95 transition"
                    >
                      {verb}
                    </button>
                  ))}
              </div>
              <p className="text-[10px] text-slate-400 text-center">Click any verb to copy it instantly for your bullets.</p>
            </div>
          </div>
        </div>

        {/* Results / Outputs Section */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-slate-800">Rewritten Resume Bullets</h2>
              <p className="text-xs text-slate-400">
                Directly edit the text in the cards below, refine individually with AI, or copy.
              </p>
            </div>
            
            {bullets.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 active:scale-[0.98] transition rounded-lg text-white font-semibold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy All Bullets
                </button>
                {copyNote && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">{copyNote}</span>}
              </div>
            )}
          </div>

          {!bullets.length ? (
            <div className="text-center py-12 flex flex-col items-center gap-3 text-slate-400 bg-white/40 border border-dashed border-slate-200 rounded-2xl">
              <svg className="w-10 h-10 text-slate-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium text-slate-500">No bullets generated yet.</p>
              <p className="text-xs text-slate-400 max-w-sm">Write rough notes above and hit "Rewrite Bullets" to produce polished results.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              
              {/* Keyword Badges (from job description) */}
              {matchedKeywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 bg-amber-50/50 border border-amber-100/50 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mr-1">
                    ✓ ATS Keywords Integrated:
                  </span>
                  {matchedKeywords.map((kw, i) => (
                    <span
                      key={`${kw}-${i}`}
                      className="bg-amber-100 hover:bg-amber-200 border border-amber-200/50 text-amber-800 font-semibold px-2 py-0.5 rounded-full text-xs transition cursor-default"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Bullets List */}
              <div className="grid grid-cols-1 gap-4">
                {bullets.map((bullet, index) => {
                  const isRefining = refiningIndex === index;
                  return (
                    <div
                      key={`bullet-card-${index}`}
                      className={`rb-result-card relative rounded-2xl border bg-white p-5 flex flex-col gap-4 shadow-sm transition hover:shadow-md hover:border-slate-300 ${
                        isRefining ? "opacity-60 border-amber-300 bg-amber-50/10 pointer-events-none" : "border-slate-200"
                      }`}
                    >
                      {/* Loading overlay for refinement */}
                      {isRefining && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-2xl z-10">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full">
                            <svg className="animate-spin h-3.5 w-3.5 text-amber-800" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Refining with AI...</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        {/* Index Indicator */}
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 mt-1">
                          {index + 1}
                        </span>

                        {/* Editable Field */}
                        <div className="flex-1 min-w-0">
                          <textarea
                            value={bullet}
                            onChange={(e) => handleUpdateBullet(index, e.target.value)}
                            className="w-full text-sm leading-relaxed text-slate-800 bg-transparent resize-none border-b border-transparent focus:border-amber-400 focus:outline-none py-1 focus:bg-slate-50/50 rounded px-1 transition"
                            rows={3}
                            placeholder="Write bullet text..."
                          />
                        </div>
                      </div>

                      {/* Card Footer: Sub-actions & Quick Refinements */}
                      <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-3">
                        {/* Quick Refine Pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                            Refine:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRefineBullet(index, "make it shorter and more concise")}
                            className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 px-2.5 py-1 rounded-md transition cursor-pointer"
                          >
                            ⚡ Shorten
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRefineBullet(index, "add a professional action verb at the start")}
                            className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 px-2.5 py-1 rounded-md transition cursor-pointer"
                          >
                            🔧 Add Action Verb
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRefineBullet(index, "structure using Google XYZ formula and insert metric placeholders like [X%] or [amount]")}
                            className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 px-2.5 py-1 rounded-md transition cursor-pointer"
                          >
                            📊 Add Metric Placeholder
                          </button>
                        </div>

                        {/* Bullet Control Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopySingle(bullet)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
                            title="Copy Bullet"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBullet(index)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition cursor-pointer"
                            title="Delete Bullet"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* History Panel */}
        {history.length > 0 && (
          <div className="border-t border-slate-100 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Generations ({history.length})
              </h3>
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-slate-400 hover:text-red-500 font-semibold transition cursor-pointer"
              >
                Clear History
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {history.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => loadHistoryItem(item)}
                  className="p-3.5 border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/10 cursor-pointer rounded-xl flex flex-col gap-1 text-left transition duration-200 group active:scale-[0.98]"
                >
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-800 transition">
                    {item.timestamp} • {item.tone}
                  </span>
                  <p className="text-[11px] font-semibold text-slate-700 line-clamp-2">
                    {item.bullets[0] || "No bullets"}
                  </p>
                  <span className="text-[9px] text-slate-400 self-end">
                    {item.bullets.length} bullet(s)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}



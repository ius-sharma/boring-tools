"use client";

import { useMemo, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const toneOptions = [
  { value: "impact", label: "Impact-focused" },
  { value: "ats", label: "ATS-friendly" },
  { value: "leadership", label: "Leadership" },
  { value: "technical", label: "Technical" },
];

const countOptions = [
  { value: "3", label: "3 bullets" },
  { value: "4", label: "4 bullets" },
  { value: "5", label: "5 bullets" },
  { value: "6", label: "6 bullets" },
];

const starterText = `Built internal dashboard for weekly reporting
Reduced manual copy-paste work across multiple sheets
Worked with sales and ops to improve handoff quality
Tracked recurring issues and shared updates with the team`;

export default function ResumeBulletRewriter() {
  const [input, setInput] = useState(starterText);
  const [tone, setTone] = useState("impact");
  const [count, setCount] = useState("4");
  const [bullets, setBullets] = useState([]);
  const [source, setSource] = useState("AI assistance");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copyNote, setCopyNote] = useState("");

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
        body: JSON.stringify({ input, tone, count: Number(count) }),
      });

      const payload = await response.json();

      if (response.ok && Array.isArray(payload.bullets) && payload.bullets.length) {
        setBullets(payload.bullets);
        setSource(payload.source === "Groq API" ? "AI assistance" : "AI fallback");
        setMessage("Generated with AI assistance.");
        setCopyNote("");
        return;
      }

      setMessage(payload?.error || "Could not generate bullets.");
      setBullets([]);
      setCopyNote("");
    } catch {
      setMessage("Request failed. Try again.");
      setBullets([]);
      setCopyNote("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!bullets.length) return;
    await navigator.clipboard.writeText(bullets.map((bullet) => `• ${bullet}`).join("\n"));
    setCopyNote("Copied!");
    window.clearTimeout(window.__resumeCopyToastTimer);
    window.__resumeCopyToastTimer = window.setTimeout(() => {
      setCopyNote("");
    }, 1400);
  };

  const handleClear = () => {
    setInput("");
    setBullets([]);
    setMessage("");
    setCopyNote("");
    setSource("AI assistance");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resume Bullet Rewriter</h1>
          <p className="text-slate-500 text-base">Turn rough notes into polished resume bullets with Groq-powered rewriting.</p>
          <p className="text-xs text-slate-500">Source: {source}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">Rough notes</h2>
              <span className="text-xs text-slate-500">One idea per line</span>
            </div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={12}
              className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 transition text-sm text-slate-900 placeholder:text-slate-300"
              placeholder="Paste project notes, job responsibilities, wins, or messy bullet points here..."
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-slate-900">Rewrite controls</h2>

            <label className="text-sm text-slate-700 flex flex-col gap-2">
              Tone
              <ThemedDropdown ariaLabel="Select tone" value={tone} options={toneOptions} onChange={setTone} />
            </label>

            <label className="text-sm text-slate-700 flex flex-col gap-2">
              Bullet count
              <ThemedDropdown ariaLabel="Select bullet count" value={count} options={countOptions} onChange={setCount} />
            </label>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!inputLines.length || loading}
              className={`w-full border border-slate-900 text-slate-900 py-2.5 rounded-lg font-semibold hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${!inputLines.length || loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Rewriting..." : "Rewrite bullets"}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!bullets.length}
              className={`w-full border border-slate-300 text-slate-700 py-2.5 rounded-lg font-semibold hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${!bullets.length ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Copy bullets
            </button>

            {copyNote ? <p className="text-xs font-medium text-emerald-600 dark:text-emerald-300">{copyNote}</p> : null}

            <button
              type="button"
              onClick={handleClear}
              className="w-full border border-slate-300 text-slate-700 py-2.5 rounded-lg font-semibold hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              Clear
            </button>

            <p className="text-xs text-slate-500">Best for resume lines, project summaries, internship notes, and role descriptions.</p>
          </div>
        </div>

        {message ? <p className="text-sm text-slate-500">{message}</p> : null}

        <div className="rb-results-shell rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-base font-semibold text-slate-900">Rewritten bullets</h2>
            <span className="text-xs text-slate-500">{bullets.length ? `${bullets.length} bullet(s)` : "Generate to view"}</span>
          </div>

          {!bullets.length ? (
            <p className="text-sm text-slate-500">Add rough notes and click “Rewrite bullets” to get polished resume-ready lines.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {bullets.map((bullet, index) => (
                <div key={`${bullet}-${index}`} className="rb-result-card rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3">
                  <span className="rb-result-index mt-1 text-xs font-semibold leading-5" style={{ color: "var(--panel-text)" }}>
                    {index + 1}
                  </span>
                  <p className="rb-result-text text-sm leading-6" style={{ color: "var(--panel-text)" }}>
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}



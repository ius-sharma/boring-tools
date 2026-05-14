"use client";

import { useMemo, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const initialResult = {
  verdict: "Enter a URL to start",
  score: null,
  level: "idle",
  summary: "We will scan the URL structure, headers, and visible trust signals.",
  signals: [],
  recommendations: [],
  details: null,
};

const scoreCopy = {
  safe: "Looks reasonably trustworthy, but still verify before sharing sensitive data.",
  caution: "Mixed signals. Proceed carefully and inspect the site before trusting it.",
  risk: "Multiple red flags detected. Avoid logging in or sending money until verified.",
};

const scanDepthOptions = [
  { value: "quick", label: "Quick" },
  { value: "balanced", label: "Balanced" },
  { value: "deep", label: "Deep" },
];

function scoreColor(score) {
  if (score >= 75) return "from-emerald-500 to-green-500";
  if (score >= 45) return "from-amber-500 to-orange-500";
  return "from-rose-500 to-red-500";
}

function levelLabel(score) {
  if (score >= 75) return "Low Risk";
  if (score >= 45) return "Needs Caution";
  return "High Risk";
}

function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">Upcoming</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Can I Trust This Website?</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
          This tool is coming soon. It will check website trust signals like HTTPS, headers, transparency clues, and suspicious content patterns.
        </p>
      </div>
    </div>
  );
}

export default function CanITrustThisWebsitePage() {
  if (!process.env.NEXT_PUBLIC_SHOW_TRUST_CHECKER) {
    return <ComingSoon />;
  }

  const [url, setUrl] = useState("");
  const [context, setContext] = useState("");
  const [scanMode, setScanMode] = useState("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(initialResult);
  const [copyNote, setCopyNote] = useState("");

  const scanLabel = useMemo(() => {
    if (scanMode === "quick") return "Quick scan";
    if (scanMode === "deep") return "Deep scan";
    return "Balanced scan";
  }, [scanMode]);

  const handleScan = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a website URL first.");
      setResult(initialResult);
      return;
    }

    setLoading(true);
    setError("");
    setCopyNote("");

    try {
      const response = await fetch("/api/site-trust-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          context: context.trim(),
          mode: scanMode,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Could not analyze this website.");
      }

      setResult(payload);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Scan failed.");
      setResult(initialResult);
    } finally {
      setLoading(false);
    }
  };

  const copyReport = async () => {
    if (!result || result.score === null) return;
    const lines = [
      `${result.verdict} (${result.score}/100)`,
      result.summary,
      ...result.signals.map((signal) => `- ${signal}`),
      ...result.recommendations.map((item) => `- ${item}`),
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopyNote("Copied report!");
    window.clearTimeout(window.__trustSiteCopyTimer);
    window.__trustSiteCopyTimer = window.setTimeout(() => setCopyNote(""), 1400);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />
          </div>

          <div className="relative grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">Security check</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Can I Trust This Website?</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Paste a website URL and get a practical trust signal score based on the URL, security headers, page transparency, and suspicious content patterns.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">What it checks</p>
                  <p className="mt-2 text-sm text-slate-700">HTTPS, domain shape, transparency signals, and red flags.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">What it returns</p>
                  <p className="mt-2 text-sm text-slate-700">Score, verdict, risk notes, and next steps.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Best for</p>
                  <p className="mt-2 text-sm text-slate-700">Shopping pages, signup links, promos, and unknown domains.</p>
                </div>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Website URL</label>
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Optional context</label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={4}
                      placeholder="Tell us what made you suspicious, like a payment request, login prompt, or too-good-to-be-true offer."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[0.95fr_1.05fr]">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Scan depth</label>
                      <ThemedDropdown
                        ariaLabel="Select scan depth"
                        value={scanMode}
                        options={scanDepthOptions}
                        onChange={setScanMode}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleScan}
                        disabled={loading}
                        className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {loading ? `${scanLabel}...` : "Check Trust"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/10">
                <div className={`inline-flex rounded-full bg-gradient-to-r ${scoreColor(result.score ?? 0)} px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white`}>
                  {result.score === null ? "Awaiting scan" : levelLabel(result.score)}
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Trust score</p>
                    <p className="text-6xl font-black tracking-tight">{result.score === null ? "--" : result.score}</p>
                  </div>
                  <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${scoreColor(result.score ?? 0)} p-[3px]`}>
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-center">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">{result.score === null ? "Trust" : levelLabel(result.score)}</span>
                    </div>
                  </div>
                </div>
                <h2 className="mt-6 text-2xl font-bold text-white">{result.verdict}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{result.summary}</p>
                {result.score !== null && (
                  <p className="mt-4 text-sm font-medium text-slate-200">{scoreCopy[result.level] || scoreCopy.caution}</p>
                )}
                {result.score !== null && (
                  <button
                    onClick={copyReport}
                    className="mt-5 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Copy report
                  </button>
                )}
                {copyNote && <p className="mt-2 text-xs font-medium text-emerald-300">{copyNote}</p>}
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Signals</h3>
                <div className="mt-4 space-y-3">
                  {(result.signals.length ? result.signals : ["Your scan result will appear here."]).map((signal, index) => (
                    <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {signal}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">What to do next</h3>
                <div className="mt-4 space-y-3">
                  {(result.recommendations.length ? result.recommendations : ["Run a scan to get tailored next steps."]).map((item, index) => (
                    <div key={index} className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

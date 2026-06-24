"use client";

import { useMemo, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const initialResult = {
  verdict: "Awaiting Article",
  confidenceScore: null,
  summary: "Paste article text or enter a URL on the left to start the analysis.",
  claims: [],
  biasIndicators: [],
  credibilitySignals: [],
  redFlags: [],
  logicalFallacies: [],
  recommendation: "",
  heuristics: null,
  details: null,
};

const analysisDepthOptions = [
  { value: "quick", label: "Quick (3 claims)" },
  { value: "standard", label: "Standard (5 claims)" },
  { value: "deep", label: "Deep (7 claims)" },
];

const samplePresets = [
  {
    name: "🚨 Clickbait / Sensational",
    title: "SHOCKING TRUTH: Pyramids Generate Free Energy!",
    text: "SHOCKING TRUTH: Hidden technology found in ancient pyramids is generating free energy! Government agents have CLAMPED DOWN on scientists who exposed pyramid power. They don't want you to know this secret! LIKE and SHARE before this is deleted forever!!!",
    url: "",
  },
  {
    name: "✍️ Opinion / Editorial",
    title: "Why Remote Work Is a Mandatory Revolution",
    text: "The rise of remote work is not just a trend; it is the single most significant revolution in modern labor history. Corporations that resist this change are stuck in the 20th century. Remote workers are consistently happier, more productive, and less stressed. Offices are a relic of the past and should be decommissioned immediately.",
    url: "",
  },
  {
    name: "🐶 Satire / Parody",
    title: "Local Dog Buster Appointed CEO of Tech Startup",
    text: "In a stunning board meeting yesterday, a local golden retriever named Buster was appointed CEO of tech startup BarkSpace. Buster promises more nap times, organic treats, and unlimited chew toys for all employees. The board of directors voted unanimously after Buster rolled over. Under his leadership, stock prices are expected to fetch high returns.",
    url: "https://parodynews.org/buster-ceo-dog",
  },
  {
    name: "📊 Balanced News",
    title: "Study Shows Urban Emissions fell by 4.2%",
    text: "According to a study published in the Journal of Environmental Sciences yesterday, global carbon emissions in urban areas fell by 4.2% over the last fiscal year. Researchers noted that urban transit policies and electric grid transitions were primary factors, though some independent analysts suggest economic slowdowns played a minor role.",
    url: "https://naturestudies.org/urban-emissions-report",
  },
];

function getVerdictStyles(verdict) {
  switch (verdict) {
    case "Accurate":
      return {
        bg: "bg-emerald-50 border-emerald-200 text-emerald-950",
        badge: "bg-emerald-500 text-white",
        glow: "shadow-emerald-100",
        bar: "bg-emerald-500",
      };
    case "Mostly Accurate":
      return {
        bg: "bg-teal-50 border-teal-200 text-teal-950",
        badge: "bg-teal-600 text-white",
        glow: "shadow-teal-100",
        bar: "bg-teal-500",
      };
    case "Misleading":
      return {
        bg: "bg-amber-50 border-amber-200 text-amber-950",
        badge: "bg-amber-500 text-white",
        glow: "shadow-amber-100",
        bar: "bg-amber-500",
      };
    case "Opinion/Editorial":
      return {
        bg: "bg-sky-50 border-sky-200 text-sky-950",
        badge: "bg-sky-500 text-white",
        glow: "shadow-sky-100",
        bar: "bg-sky-500",
      };
    case "Satire/Parody":
      return {
        bg: "bg-purple-50 border-purple-200 text-purple-950",
        badge: "bg-purple-500 text-white",
        glow: "shadow-purple-100",
        bar: "bg-purple-500",
      };
    case "Unverifiable":
      return {
        bg: "bg-slate-100 border-slate-300 text-slate-900",
        badge: "bg-slate-500 text-white",
        glow: "shadow-slate-200",
        bar: "bg-slate-400",
      };
    case "Fabricated":
      return {
        bg: "bg-rose-50 border-rose-200 text-rose-950",
        badge: "bg-rose-600 text-white",
        glow: "shadow-rose-100",
        bar: "bg-rose-600",
      };
    default:
      return {
        bg: "bg-slate-50 border-slate-200 text-slate-800",
        badge: "bg-slate-500 text-white",
        glow: "shadow-slate-100",
        bar: "bg-slate-400",
      };
  }
}

function getClaimAssessmentStyles(assessment) {
  switch (assessment) {
    case "Verified":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Misleading":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "Needs Context":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Unverified":
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function NewsAccuracyCheckerPage() {
  const [inputMode, setInputMode] = useState("text"); // 'text' or 'url'
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [depth, setDepth] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(initialResult);
  const [copyNote, setCopyNote] = useState("");
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleAnalyze = async () => {
    setError("");
    setCopyNote("");

    if (inputMode === "text" && !text.trim()) {
      setError("Please paste the article text first.");
      setResult(initialResult);
      return;
    }

    if (inputMode === "url" && !url.trim()) {
      setError("Please enter the article URL first.");
      setResult(initialResult);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/news-accuracy-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputMode === "text" ? text : "",
          url: inputMode === "url" ? url : "",
          title: title.trim() || undefined,
          depth,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred during analysis.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
      setResult(initialResult);
    } finally {
      setLoading(false);
    }
  };

  const copyFullReport = async () => {
    if (!result || result.confidenceScore === null) return;
    const lines = [
      `NEWS ACCURACY CHECKER REPORT`,
      `============================`,
      `Title Analysed: ${result.details?.titleUsed || "Untitled"}`,
      `Verdict: ${result.verdict}`,
      `Confidence Score: ${result.confidenceScore}/100`,
      ``,
      `Summary:`,
      result.summary,
      ``,
      `Claims Audited:`,
      ...result.claims.map(
        (c) => `- [${c.assessment}] Claim: "${c.claim}"\n  Reasoning: ${c.reasoning}`
      ),
      ``,
      `Logical Fallacies Detected:`,
      ...(result.logicalFallacies && result.logicalFallacies.length > 0
        ? result.logicalFallacies.map((lf) => `- [${lf.type}] ${lf.explanation}`)
        : ["- None detected"]),
      ``,
      `Bias Indicators:`,
      ...result.biasIndicators.map((b) => `- ${b}`),
      ``,
      `Credibility Signals:`,
      ...result.credibilitySignals.map((c) => `- ${c}`),
      ``,
      `Red Flags:`,
      ...result.redFlags.map((r) => `- ${r}`),
      ``,
      `Heuristics Stats:`,
      `- Clickbait matches: ${result.heuristics?.sensationalCount || 0}`,
      `- Citations: ${result.heuristics?.citationCount || 0}`,
      `- Quotes count: ${result.heuristics?.quoteCount || 0}`,
      `- Emotional descriptors: ${result.heuristics?.emotionalCount || 0}`,
      ``,
      `Recommendation:`,
      result.recommendation,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopyNote("Copied report!");
    window.clearTimeout(window.__newsCopyTimer);
    window.__newsCopyTimer = window.setTimeout(() => setCopyNote(""), 1600);
  };

  const copyShareCard = async () => {
    if (!result || result.confidenceScore === null) return;
    const cardText = [
      `🔍 NEWS ACCURACY AUDIT`,
      `--------------------------------`,
      `📰 Title: ${result.details?.titleUsed || "Untitled"}`,
      `⚖️ Verdict: ${result.verdict.toUpperCase()}`,
      `🎯 Confidence Score: ${result.confidenceScore}/100`,
      ``,
      `📝 Summary:`,
      result.summary,
      ``,
      `📊 Indicators Breakdown:`,
      `✅ Credibility signals: ${result.credibilitySignals.length}`,
      `🚨 Red flags found: ${result.redFlags.length}`,
      `⚠️ Bias indicators: ${result.biasIndicators.length}`,
      `🧠 Logical fallacies: ${result.logicalFallacies?.length || 0}`,
      ``,
      `Verify accuracy instantly at Boring Tools!`,
    ].join("\n");

    await navigator.clipboard.writeText(cardText);
    setCopyNote("Copied shareable card!");
    window.clearTimeout(window.__newsCopyTimer);
    window.__newsCopyTimer = window.setTimeout(() => setCopyNote(""), 1600);
  };

  const loadPreset = (preset) => {
    setError("");
    setInputMode(preset.text ? "text" : "url");
    setText(preset.text);
    setUrl(preset.url);
    setTitle(preset.title);
    setResult(initialResult);
  };

  const clearForm = () => {
    setText("");
    setUrl("");
    setTitle("");
    setError("");
    setResult(initialResult);
    setCopyNote("");
  };

  const activeVerdictStyles = useMemo(() => {
    return getVerdictStyles(result.verdict);
  }, [result.verdict]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-200/25 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-200/25 blur-3xl" />
          </div>

          <div className="relative grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            {/* Input Section */}
            <section className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Verification Tools</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">News Accuracy Checker</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Analyze news articles for clickbait, emotional formatting, and source citations. Uses AI to audit claims and identify potential bias or misleading info.
              </p>

              {/* Sample Presets */}
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Try a sample story:</p>
                <div className="flex flex-wrap gap-2">
                  {samplePresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => loadPreset(preset)}
                      className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 font-medium transition cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Selection */}
              <div className="mt-6 flex bg-slate-100 rounded-xl p-1 self-start gap-1">
                <button
                  onClick={() => {
                    setInputMode("text");
                    setError("");
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    inputMode === "text"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Paste Text
                </button>
                <button
                  onClick={() => {
                    setInputMode("url");
                    setError("");
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    inputMode === "url"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Enter URL
                </button>
              </div>

              {/* Form Body */}
              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="grid gap-4">
                  {inputMode === "text" ? (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Article Text</label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={8}
                        placeholder="Paste the full article content here to audit..."
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Article URL</label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/news-story-url"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Article Title <span className="text-xs text-slate-400 font-normal">(Optional context)</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Major study reveals new findings on X"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[0.95fr_1.05fr]">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Analysis Depth</label>
                      <ThemedDropdown
                        ariaLabel="Select audit depth"
                        value={depth}
                        options={analysisDepthOptions}
                        onChange={setDepth}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="flex-1 rounded-2xl bg-indigo-600 px-5 py-3.5 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 shadow-sm"
                      >
                        {loading ? "Analyzing..." : "Audit Article"}
                      </button>
                      {(text || url || title || result.confidenceScore !== null) && (
                        <button
                          onClick={clearForm}
                          disabled={loading}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-semibold text-slate-600 hover:text-slate-900 transition hover:bg-slate-100 disabled:opacity-50"
                          title="Clear form"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  ⚠️ {error}
                </div>
              )}

              {/* Media Literacy Accordion Mini-Guide */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => setIsGuideOpen(!isGuideOpen)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 transition font-bold text-sm text-slate-800 text-left focus:outline-none"
                >
                  <span>📖 Media Literacy & Metric Guide</span>
                  <span className={`text-xs transform transition-transform duration-200 ${isGuideOpen ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>
                {isGuideOpen && (
                  <div className="p-4 border-t border-slate-100 text-xs text-slate-600 space-y-3 leading-relaxed">
                    <div>
                      <h4 className="font-bold text-slate-800">Verdicts Explained:</h4>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong className="text-emerald-700">Accurate:</strong> Well-sourced, objective, factual reporting.</li>
                        <li><strong className="text-teal-700">Mostly Accurate:</strong> Core facts hold up, minor details may lack depth.</li>
                        <li><strong className="text-amber-700">Misleading:</strong> Wields real facts to shape a distorted conclusion.</li>
                        <li><strong className="text-sky-700">Opinion/Editorial:</strong> Expresses personal commentary, not objective news.</li>
                        <li><strong className="text-purple-700">Satire/Parody:</strong> Comedic or hyper-exaggerated fiction.</li>
                        <li><strong className="text-slate-700">Unverifiable:</strong> Insufficient references to cross-check factuality.</li>
                        <li><strong className="text-rose-700">Fabricated:</strong> Untruthful, entirely invented fake claims.</li>
                      </ul>
                    </div>
                    <div className="border-t border-slate-100 pt-3">
                      <h4 className="font-bold text-slate-800">How Heuristics are Calculated:</h4>
                      <p className="mt-1">
                        Our code parses the text before AI processing to gather baseline signals:
                      </p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>Clickbait:</strong> Triggers on emotional superlatives (e.g. "shocking", "exposed") and shouting formatting (ALL CAPS, excessive exclamation points).</li>
                        <li><strong>Citation Density:</strong> Measures named attributions, quotes, and referencing patterns. High citation increases trust.</li>
                        <li><strong>Engagement Bait:</strong> Scans for viral phrasing like "share before deleted" or "spread the word".</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Results Section */}
            <section className="flex flex-col gap-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[1.5rem] border border-slate-200 bg-slate-50/50 p-8 text-center gap-6">
                  <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Investigating Source Veracity</h3>
                    <p className="text-sm text-slate-500 mt-2 animate-pulse">
                      Parsing claims, evaluating bias levels, and cross-matching credibility...
                    </p>
                  </div>
                </div>
              ) : result.confidenceScore === null ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500 gap-3">
                  <svg
                    className="h-12 w-12 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-slate-700">Awaiting Verification Request</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Provide text content or a web link to examine formatting, citation levels, and facts.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Verdict and Score */}
                  <div
                    className={`rounded-[1.5rem] border p-6 shadow-md transition-all ${activeVerdictStyles.bg} ${activeVerdictStyles.glow}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${activeVerdictStyles.badge}`}>
                        {result.verdict}
                      </div>
                      {result.confidenceScore !== null && (
                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                            Confidence Score
                          </span>
                          <span className="text-3xl font-black tracking-tight text-slate-900">
                            {result.confidenceScore}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-bold text-slate-900">Summary Verdict</h3>
                      <p className="text-sm mt-1 leading-relaxed text-slate-800">{result.summary}</p>
                    </div>

                    {result.recommendation && (
                      <div className="mt-4 border-t border-slate-200/50 pt-4 text-xs">
                        <strong className="text-slate-900 block font-semibold uppercase tracking-wider mb-1">
                          RECOMMENDED ACTION:
                        </strong>
                        <p className="text-slate-700">{result.recommendation}</p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2 items-center">
                      <button
                        onClick={copyFullReport}
                        className="rounded-xl border border-slate-300 bg-white/70 backdrop-blur px-4 py-2 text-xs font-bold text-slate-800 hover:bg-white hover:shadow-sm transition"
                      >
                        Copy Full Report
                      </button>
                      <button
                        onClick={copyShareCard}
                        className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100/80 transition"
                      >
                        Copy Share Card
                      </button>
                      {copyNote && (
                        <span className="text-xs font-semibold text-indigo-700 animate-pulse ml-2">
                          {copyNote}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Heuristic Markers Details */}
                  {result.heuristics && (
                    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Heuristic Signals</h3>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="block text-2xl font-black text-slate-800">{result.heuristics.sensationalCount}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Clickbaits</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="block text-2xl font-black text-slate-800">{result.heuristics.citationCount}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Citations</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="block text-2xl font-black text-slate-800">{result.heuristics.quoteCount}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Quotes</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="block text-2xl font-black text-slate-800">{result.heuristics.emotionalCount}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Loaded Words</span>
                        </div>
                      </div>

                      {result.heuristics.signals && result.heuristics.signals.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {result.heuristics.signals.map((sig, idx) => (
                            <div key={idx} className="text-xs text-slate-600 bg-slate-50/50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-start gap-1.5">
                              <span className="text-indigo-500 mt-0.5">•</span>
                              <span>{sig}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fact Audits (Claims) */}
                  {result.claims && result.claims.length > 0 && (
                    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Claims Audit</h3>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {result.claims.map((item, index) => (
                          <div key={index} className="rounded-xl border border-slate-100 bg-slate-50/40 p-3.5 flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-xs font-semibold text-slate-800 leading-normal">
                                "{item.claim}"
                              </p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getClaimAssessmentStyles(item.assessment)}`}>
                                {item.assessment}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                              {item.reasoning}
                            </p>
                            <div className="flex justify-end pt-1">
                              <a
                                href={`https://www.google.com/search?q=${encodeURIComponent("fact check " + item.claim)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-semibold"
                              >
                                🔍 Search Live Verification ↗
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Logical Fallacies Warning Box */}
                  {result.logicalFallacies && result.logicalFallacies.length > 0 && (
                    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/30 p-5 shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-2">
                        <span>🧠 Logical Fallacies Detected</span>
                        <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-black leading-none">
                          {result.logicalFallacies.length}
                        </span>
                      </h3>
                      <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                        {result.logicalFallacies.map((item, idx) => (
                          <div key={idx} className="bg-white border border-amber-100 p-3 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-amber-600">⚠️</span>
                              <strong className="text-xs text-amber-950 font-extrabold">{item.type}</strong>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed pl-5">
                              {item.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Semantic signals breakdown */}
                  {(result.biasIndicators.length > 0 || result.credibilitySignals.length > 0 || result.redFlags.length > 0) && (
                    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                      {result.credibilitySignals.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Credibility Indicators</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {result.credibilitySignals.map((item, idx) => (
                              <span key={idx} className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-1 rounded-lg">
                                ✓ {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.biasIndicators.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Bias Indicators</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {result.biasIndicators.map((item, idx) => (
                              <span key={idx} className="text-[11px] bg-amber-50 text-amber-800 border border-amber-100 px-2 py-1 rounded-lg">
                                ⚠ {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.redFlags.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2">Red Flags</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {result.redFlags.map((item, idx) => (
                              <span key={idx} className="text-[11px] bg-rose-50 text-rose-800 border border-rose-100 px-2 py-1 rounded-lg">
                                ☒ {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

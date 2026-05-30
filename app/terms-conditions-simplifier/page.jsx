"use client";

import ComingSoon from "@/app/components/ComingSoon";
import { useEffect, useMemo, useRef, useState } from "react";

const WORDS_PER_MINUTE = 220;
const TOOL_STATUS = "upcoming";

const LEGAL_PHRASE_REPLACEMENTS = [
  [/\bshall\b/gi, "must"],
  [/\bhereby\b/gi, ""],
  [/\bherein\b/gi, "in this document"],
  [/\bhereinafter\b/gi, "later in this document"],
  [/\bin the event that\b/gi, "if"],
  [/\bin the event of\b/gi, "if"],
  [/\bin accordance with\b/gi, "under"],
  [/\bto the extent permitted by law\b/gi, "if the law allows"],
  [/\bto the extent permitted by applicable law\b/gi, "if the law allows"],
  [/\bfor the avoidance of doubt\b/gi, ""],
  [/\bwithout limitation\b/gi, "including more"],
  [/\bincluding without limitation\b/gi, "including"],
  [/\bprior to\b/gi, "before"],
  [/\bsubsequent to\b/gi, "after"],
  [/\bnotwithstanding\b/gi, "despite"],
  [/\bprovided that\b/gi, "if"],
  [/\bat our sole discretion\b/gi, "if we choose"],
  [/\bat its sole discretion\b/gi, "if it chooses"],
  [/\bcommence\b/gi, "start"],
  [/\bterminate\b/gi, "end"],
  [/\bcancel\b/gi, "stop"],
  [/\bdeem\b/gi, "consider"],
  [/\bnotify\b/gi, "tell"],
  [/\bobligate\b/gi, "require"],
  [/\bremedy\b/gi, "fix"],
  [/\bthereafter\b/gi, "after that"],
  [/\bwhereas\b/gi, "while"],
  [/\baforementioned\b/gi, "above"],
  [/\bapproximately\b/gi, "about"],
  [/\bbest efforts\b/gi, "best efforts"],
  [/\breasonable efforts\b/gi, "reasonable efforts"],
];

const STOP_WORDS = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "just",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "with",
  "would",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
]);

const PRIORITY_CUES = [
  "agree",
  "agreement",
  "arbitration",
  "collect",
  "cookie",
  "data",
  "delete",
  "dispute",
  "end",
  "fee",
  "fees",
  "liability",
  "limit",
  "maintain",
  "may",
  "must",
  "notify",
  "pay",
  "privacy",
  "renew",
  "share",
  "terminate",
  "third party",
  "use",
  "waive",
  "withdraw",
  "cancel",
  "access",
  "license",
  "permission",
];

const IMPORTANT_CUES = [
  "may change",
  "right to",
  "reserve the right",
  "automatic renewal",
  "free trial",
  "dispute",
  "arbitration",
  "terminate",
  "suspend",
  "limit liability",
  "third party",
  "share your",
  "collect",
  "track",
  "fees",
  "payment",
  "refund",
  "cancel",
  "privacy",
  "sell",
  "cookies",
];

const OBLIGATION_CUES = [
  /\bmust\b/i,
  /\bshall\b/i,
  /\brequired to\b/i,
  /\bagree to\b/i,
  /\byou are responsible for\b/i,
  /\bneed to\b/i,
  /\bshould not\b/i,
  /\bdo not\b/i,
  /\bprohibited\b/i,
  /\bmust not\b/i,
  /\bpay\b/i,
  /\bprovide\b/i,
  /\bnotify\b/i,
  /\bmaintain\b/i,
  /\bcomply\b/i,
  /\bsubmit\b/i,
];

const PERMISSION_CUES = [
  /\bmay\b/i,
  /\bcan\b/i,
  /\ballow(?:s|ed)?\b/i,
  /\bpermission\b/i,
  /\bpermitted\b/i,
  /\bright to\b/i,
  /\breserve the right\b/i,
  /\blicense\b/i,
  /\bcollect\b/i,
  /\bshare\b/i,
  /\buse\b/i,
  /\baccess\b/i,
  /\bstore\b/i,
  /\bprocess\b/i,
];

const RISK_CUES = [
  /\bterminate\b/i,
  /\bsuspend\b/i,
  /\bliability\b/i,
  /\bindemnif/i,
  /\barbitration\b/i,
  /\bdispute\b/i,
  /\bautomatic renewal\b/i,
  /\brenew(?:al)?\b/i,
  /\bfees?\b/i,
  /\bcharge\b/i,
  /\bthird party\b/i,
  /\bshare\b/i,
  /\bcollect\b/i,
  /\btrack\b/i,
  /\bcookies?\b/i,
  /\bchange\b/i,
  /\bprivacy\b/i,
  /\bdelete\b/i,
  /\bsell\b/i,
  /\btransfer\b/i,
];

function normalizeText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toWords(value) {
  return normalizeText(value).toLowerCase().match(/[a-z0-9']+/g) || [];
}

function splitSentences(text) {
  const normalized = normalizeText(text);
  const matches = normalized.match(/[^.!?;\n]+[.!?;]+|[^.!?;\n]+$/g);
  return (matches || []).map((sentence) => sentence.trim()).filter(Boolean);
}

function formatReadingTime(wordCount) {
  const minutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

function truncateText(value, maxLength = 180) {
  const text = normalizeText(value);
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function buildFrequencyMap(text) {
  const frequency = new Map();

  for (const word of toWords(text)) {
    if (word.length < 4 || STOP_WORDS.has(word)) {
      continue;
    }

    frequency.set(word, (frequency.get(word) || 0) + 1);
  }

  return frequency;
}

function scoreSentence(sentence, frequencyMap) {
  const lower = sentence.toLowerCase();
  const words = toWords(sentence).filter((word) => word.length > 3 && !STOP_WORDS.has(word));

  if (!words.length) {
    return 0;
  }

  let score = 0;

  for (const word of words) {
    score += frequencyMap.get(word) || 0;
  }

  for (const cue of PRIORITY_CUES) {
    if (lower.includes(cue)) {
      score += 2.5;
    }
  }

  if (sentence.length < 50) {
    score *= 0.85;
  }

  if (sentence.length > 220) {
    score += 1;
  }

  return score;
}

function simplifySentence(sentence) {
  let text = normalizeText(sentence).replace(/^[\d().\-\s]+/, "");

  for (const [pattern, replacement] of LEGAL_PHRASE_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  text = text
    .replace(/\bwe may\b/gi, "the service may")
    .replace(/\bwe can\b/gi, "the service can")
    .replace(/\bwe will\b/gi, "the service will")
    .replace(/\bwe are\b/gi, "the service is")
    .replace(/\byou may\b/gi, "you can")
    .replace(/\byou must\b/gi, "you must")
    .replace(/\bshall not\b/gi, "must not")
    .replace(/\bmust not\b/gi, "must not")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/([,.;:]){2,}/g, "$1")
    .trim();

  if (!text) {
    return "";
  }

  const withSentenceCase = text.charAt(0).toUpperCase() + text.slice(1);
  return /[.!?]$/.test(withSentenceCase) ? withSentenceCase : `${withSentenceCase}.`;
}

function collectCategorySentences(sentences, cues, limit, frequencyMap) {
  const seen = new Set();
  const matches = [];

  for (const [index, sentence] of sentences.entries()) {
    const lower = sentence.toLowerCase();
    if (!cues.some((cue) => cue.test(lower))) {
      continue;
    }

    const simplified = simplifySentence(sentence);
    if (!simplified) {
      continue;
    }

    const key = simplified.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    matches.push({
      index,
      sentence: simplified,
      score: scoreSentence(sentence, frequencyMap),
    });
  }

  return matches
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence);
}

function collectImportantPoints(sentences, frequencyMap) {
  const seen = new Set();
  const ranked = sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: scoreSentence(sentence, frequencyMap),
    }))
    .filter(({ sentence }) => sentence.length >= 18)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const points = [];

  for (const item of ranked) {
    const simplified = simplifySentence(item.sentence);
    if (!simplified) {
      continue;
    }

    const key = simplified.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    points.push(simplified);

    if (points.length >= 5) {
      break;
    }
  }

  return points;
}

function buildSummary(sentences, frequencyMap) {
  if (!sentences.length) {
    return "Paste legal text and click Simplify to get a plain-language breakdown.";
  }

  const ranked = sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: scoreSentence(sentence, frequencyMap),
    }))
    .filter(({ sentence }) => sentence.length >= 24)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const picks = [];
  const seen = new Set();

  for (const item of ranked) {
    const simplified = simplifySentence(item.sentence);
    if (!simplified) {
      continue;
    }

    const key = simplified.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    picks.push(simplified);

    if (picks.length >= 2) {
      break;
    }
  }

  const summary = picks.join(" ");
  if (!summary) {
    return "This text explains what the service expects from you, what the service can do, and where the main risks are.";
  }

  return truncateText(summary, 320);
}

function analyzeLegalText(text) {
  const normalized = normalizeText(text);
  const sentences = splitSentences(normalized);
  const words = toWords(normalized);
  const frequencyMap = buildFrequencyMap(normalized);
  const summary = buildSummary(sentences, frequencyMap);
  const importantPoints = collectImportantPoints(sentences, frequencyMap);
  const obligations = collectCategorySentences(sentences, OBLIGATION_CUES, 5, frequencyMap);
  const permissions = collectCategorySentences(sentences, PERMISSION_CUES, 5, frequencyMap);
  const risks = collectCategorySentences(sentences, RISK_CUES, 5, frequencyMap);
  const sectionsFilled = [summary, importantPoints, obligations, permissions, risks].filter((section) => {
    if (typeof section === "string") {
      return Boolean(section.trim());
    }

    return section.length > 0;
  }).length;

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    readingTime: formatReadingTime(words.length),
    summary,
    importantPoints,
    obligations,
    permissions,
    risks,
    sectionsFilled,
  };
}

function buildReportText(analysis) {
  const lines = [
    "Terms & Conditions Simplifier Report",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    `Word count: ${analysis.wordCount}`,
    `Sentence count: ${analysis.sentenceCount}`,
    `Estimated reading time: ${analysis.readingTime}`,
    `Filled sections: ${analysis.sectionsFilled}`,
    "",
    "Summary",
    analysis.summary,
    "",
    "Important points",
    ...(analysis.importantPoints.length ? analysis.importantPoints.map((point) => `- ${point}`) : ["- None detected"]),
    "",
    "User obligations",
    ...(analysis.obligations.length ? analysis.obligations.map((point) => `- ${point}`) : ["- None detected"]),
    "",
    "Potential risks",
    ...(analysis.risks.length ? analysis.risks.map((point) => `- ${point}`) : ["- None detected"]),
    "",
    "Key permissions",
    ...(analysis.permissions.length ? analysis.permissions.map((point) => `- ${point}`) : ["- None detected"]),
  ];

  return lines.join("\n");
}

function StatCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function SectionCard({ title, items, emptyMessage, accent = false }) {
  return (
    <div className={`rounded-2xl border p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 ${accent ? "border-orange-200 bg-orange-50/70 hover:border-orange-300" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white hover:shadow-sm"}`}>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {Array.isArray(items) && items.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-500">{emptyMessage}</p>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
      </div>
      <div className="h-28 rounded-2xl bg-slate-100" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="h-40 rounded-2xl bg-slate-100" />
        <div className="h-40 rounded-2xl bg-slate-100" />
        <div className="h-40 rounded-2xl bg-slate-100" />
        <div className="h-40 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function TermsConditionsSimplifierPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Terms & Conditions Simplifier" />;
  }

  const [inputText, setInputText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const processTimerRef = useRef(null);
  const copyTimerRef = useRef(null);

  const inputStats = useMemo(() => {
    const normalized = normalizeText(inputText);
    const wordCount = toWords(normalized).length;
    const characterCount = normalized.length;

    return {
      wordCount,
      characterCount,
      readingTime: formatReadingTime(wordCount),
    };
  }, [inputText]);

  useEffect(() => {
    return () => {
      if (processTimerRef.current) {
        window.clearTimeout(processTimerRef.current);
      }

      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const clearCopyStatus = () => {
    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
    setStatus("");
  };

  const handleSimplify = () => {
    const cleaned = normalizeText(inputText);

    if (!cleaned) {
      setError("Paste terms, privacy text, or an agreement before simplifying.");
      setAnalysis(null);
      return;
    }

    if (processTimerRef.current) {
      window.clearTimeout(processTimerRef.current);
    }

    setIsLoading(true);
    setError("");
    clearCopyStatus();

    processTimerRef.current = window.setTimeout(() => {
      try {
        const nextAnalysis = analyzeLegalText(cleaned);
        setAnalysis({
          ...nextAnalysis,
          reportText: buildReportText(nextAnalysis),
        });
        setStatus("Your legal text has been simplified into plain English.");
      } catch {
        setError("Could not simplify this text. Try pasting a cleaner copy of the document.");
        setAnalysis(null);
      } finally {
        setIsLoading(false);
        processTimerRef.current = null;
      }
    }, 180);
  };

  const handleClearInput = () => {
    if (processTimerRef.current) {
      window.clearTimeout(processTimerRef.current);
      processTimerRef.current = null;
    }

    setInputText("");
    setAnalysis(null);
    setError("");
    clearCopyStatus();
    setIsLoading(false);
  };

  const handleClearAll = () => {
    if (processTimerRef.current) {
      window.clearTimeout(processTimerRef.current);
      processTimerRef.current = null;
    }

    setInputText("");
    setAnalysis(null);
    setError("");
    setStatus("");
    setIsLoading(false);
  };

  const handleCopyResults = async () => {
    if (!analysis) {
      setError("Generate a report before copying results.");
      return;
    }

    await navigator.clipboard.writeText(analysis.reportText);
    setStatus("Report copied to clipboard.");

    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current);
    }

    copyTimerRef.current = window.setTimeout(() => {
      setStatus("");
    }, 1800);
  };

  const handleDownloadReport = () => {
    if (!analysis) {
      setError("Generate a report before downloading it.");
      return;
    }

    const blob = new Blob([analysis.reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `terms-conditions-simplifier-report-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Report downloaded.");

    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current);
    }

    copyTimerRef.current = window.setTimeout(() => {
      setStatus("");
    }, 1800);
  };

  const filledSections = analysis ? [analysis.importantPoints, analysis.obligations, analysis.permissions, analysis.risks].filter((items) => items.length).length : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        <header className="text-center flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Legal text breakdown</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Terms &amp; Conditions Simplifier</h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-3xl mx-auto">
            Paste terms, privacy policies, agreements, or any legal text and get a plain-language breakdown directly in your browser.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4 items-stretch">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Paste legal text</h2>
                <p className="text-sm text-slate-500">Large agreements, policies, and notices all work here.</p>
              </div>
              <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">Local only</span>
            </div>

            <textarea
              value={inputText}
              onChange={(event) => {
                setInputText(event.target.value);
                if (error) {
                  setError("");
                }
              }}
              rows={15}
              className="terms-simplifier-textarea w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
              placeholder="Paste terms & conditions, privacy policy text, subscription rules, or any legal document text here..."
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Words" value={inputStats.wordCount.toString()} subtitle="Live text count" />
              <StatCard label="Characters" value={inputStats.characterCount.toString()} subtitle="Input size" />
              <StatCard label="Reading time" value={inputStats.readingTime} subtitle="Input preview" />
              <StatCard label="Status" value={isLoading ? "Working" : "Ready"} subtitle={isLoading ? "Simplifying now" : "Waiting for input"} />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSimplify}
                disabled={isLoading || !inputStats.wordCount}
                className={`rounded-lg border border-slate-900 bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 ${isLoading || !inputStats.wordCount ? "cursor-not-allowed opacity-50 hover:bg-slate-900 hover:text-white" : ""}`}
              >
                {isLoading ? "Simplifying..." : "Simplify"}
              </button>
              <button
                type="button"
                onClick={handleClearInput}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                Clear
              </button>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            ) : null}

            {status ? <p className="text-sm font-medium text-emerald-600">{status}</p> : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">How it works</h2>
                <p className="text-sm text-slate-500">No network calls, no account, no document upload.</p>
              </div>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">Heuristic parser</span>
            </div>

            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p>1. Paste the legal text into the large editor on the left.</p>
              <p>2. The tool scans the text locally for obligations, permissions, and risk-heavy clauses.</p>
              <p>3. You get a short summary and a report you can copy or download.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Best for</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Terms &amp; Conditions</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Privacy Policies</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Agreements</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Subscription rules</span>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-orange-700">Privacy note</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Everything stays in the browser. Nothing is sent to a backend, stored in a database, or processed by an API.
              </p>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Simplified report</h2>
              <p className="text-sm text-slate-500">Copy the breakdown or download it as a text report.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyResults}
                disabled={!analysis}
                className={`rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 ${!analysis ? "cursor-not-allowed opacity-50" : ""}`}
              >
                Copy results
              </button>
              <button
                type="button"
                onClick={handleDownloadReport}
                disabled={!analysis}
                className={`rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 ${!analysis ? "cursor-not-allowed opacity-50" : ""}`}
              >
                Download report
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-lg border border-orange-500 bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="mt-4">
            {!analysis && !isLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
                <p className="text-base font-semibold text-slate-900">No report yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Paste legal text on the left, click Simplify, and the report will appear here with a summary, obligations, risks, permissions, and reading time.
                </p>
              </div>
            ) : null}

            {isLoading ? <LoadingSkeleton /> : null}

            {analysis && !isLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard label="Words" value={analysis.wordCount.toString()} subtitle="In the pasted text" />
                  <StatCard label="Reading time" value={analysis.readingTime} subtitle="Estimated at 220 WPM" />
                  <StatCard label="Sentences" value={analysis.sentenceCount.toString()} subtitle="Detected clauses" />
                  <StatCard label="Filled sections" value={analysis.sectionsFilled.toString()} subtitle="Sections with matches" />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Short summary</p>
                  <p className="mt-3 text-sm sm:text-base leading-7 text-slate-700">{analysis.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <SectionCard
                    title="Important points"
                    items={analysis.importantPoints}
                    emptyMessage="No strong clauses were detected in this text."
                    accent
                  />
                  <SectionCard
                    title="User obligations"
                    items={analysis.obligations}
                    emptyMessage="No explicit user obligations were detected."
                  />
                  <SectionCard
                    title="Potential risks"
                    items={analysis.risks}
                    emptyMessage="No obvious risk-heavy clauses were detected."
                  />
                  <SectionCard
                    title="Key permissions"
                    items={analysis.permissions}
                    emptyMessage="No clear permissions were detected."
                  />
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <style jsx global>{`
          .terms-simplifier-textarea {
            overflow-y: auto;
            scrollbar-gutter: stable;
            scroll-behavior: smooth;
            box-sizing: border-box;
            scrollbar-width: thin;
            scrollbar-color: rgba(245, 158, 11, 0.55) transparent;
          }

          .terms-simplifier-textarea::-webkit-scrollbar {
            width: 9px;
            height: 9px;
          }

          .terms-simplifier-textarea::-webkit-scrollbar-track {
            background: transparent;
          }

          .terms-simplifier-textarea::-webkit-scrollbar-thumb {
            background-color: rgba(245, 158, 11, 0.55);
            border-radius: 999px;
            border: 2px solid rgba(248, 250, 252, 0.95);
            background-clip: padding-box;
          }

          .terms-simplifier-textarea::-webkit-scrollbar-thumb:hover {
            background-color: rgba(245, 158, 11, 0.72);
          }

          .terms-simplifier-textarea::-webkit-scrollbar-corner {
            background: transparent;
          }
        `}</style>
      </div>
    </div>
  );
}

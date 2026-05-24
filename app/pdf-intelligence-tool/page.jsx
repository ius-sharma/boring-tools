"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { extractPhones } from "./phone-utils";

let pdfWorkerConfigured = false;

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

const KEY_CUES = [
  "important",
  "deadline",
  "due",
  "payment",
  "contact",
  "email",
  "phone",
  "call",
  "meeting",
  "schedule",
  "action",
  "required",
  "note",
  "please",
  "urgent",
  "submit",
  "invoice",
  "renewal",
  "agreement",
  "policy",
  "effective",
  "expires",
  "appointment",
  "reminder",
  "confidential",
];

const TABS = [
  { id: "summary", label: "Summary" },
  { id: "keyPoints", label: "Key Points" },
  { id: "dates", label: "Important Dates" },
  { id: "contacts", label: "Contacts" },
  { id: "links", label: "Links" },
  { id: "keywords", label: "Keywords" },
  { id: "statistics", label: "Statistics" },
];

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function toWords(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .match(/[a-z0-9']+/g) || [];
}

function splitSentences(text) {
  const matches = normalizeWhitespace(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return (matches || []).map((sentence) => sentence.trim()).filter(Boolean);
}

function isPdfFile(file) {
  if (!file) return false;

  const name = String(file.name || "").toLowerCase();
  const type = String(file.type || "").toLowerCase();
  return name.endsWith(".pdf") || type === "application/pdf" || type.includes("pdf");
}

function getBaseName(fileName) {
  return String(fileName || "document").replace(/\.[^.]+$/, "") || "document";
}

function getReadingTime(wordCount) {
  if (!wordCount) return "1 min read";
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return `${minutes} min read`;
}

function scoreSentence(sentence, frequencyMap) {
  const words = toWords(sentence).filter((word) => !STOP_WORDS.has(word));
  if (!words.length) return 0;

  let score = 0;
  for (const word of words) {
    score += frequencyMap.get(word) || 0;
  }

  const lower = sentence.toLowerCase();
  for (const cue of KEY_CUES) {
    if (lower.includes(cue)) score += 2.5;
  }

  if (/\b\d{2,}\b/.test(sentence)) score += 1;
  if (sentence.length < 45) score *= 0.75;
  return score;
}

function topSentences(sentences, frequencyMap, limit) {
  return sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: scoreSentence(sentence, frequencyMap),
    }))
    .filter(({ sentence }) => sentence.length >= 24)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .sort((a, b) => a.index - b.index)
    .map(({ sentence }) => sentence);
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function extractEmails(text) {
  return uniqueValues((text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map((item) => item.trim()));
}

function extractUrls(text) {
  const matches = text.match(/(?:https?:\/\/|www\.)[\w\-._~:/?#@!$&'()*+,;=%]+/gi) || [];
  return uniqueValues(matches.map((item) => item.replace(/[),.;!?]+$/g, "")));
}

function extractDates(text) {
  const patterns = [
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
    /\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/g,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)\.?\s+\d{1,2}(?:,\s+\d{4})?\b/gi,
    /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)\.?\s+\d{4}\b/gi,
  ];

  const values = patterns.flatMap((pattern) => text.match(pattern) || []);
  return uniqueValues(values.map((value) => value.trim()));
}

function extractKeywords(text) {
  const counts = new Map();
  for (const word of toWords(text)) {
    if (word.length < 4 || STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([word]) => word);
}

function buildSummary(sentences, frequencyMap) {
  if (!sentences.length) return "No readable text was extracted from this PDF.";

  const selected = topSentences(sentences, frequencyMap, Math.min(3, sentences.length));
  const fallback = sentences.slice(0, 2);
  const source = selected.length ? selected : fallback;
  const summary = source.join(" ");
  return summary.length > 480 ? `${summary.slice(0, 477).trimEnd()}...` : summary;
}

function getContactCount(emails, phones) {
  return emails.length + phones.length;
}

function formatList(items, emptyMessage = "None detected") {
  if (!items.length) return [emptyMessage];
  return items;
}

function buildFrequencyMap(text) {
  const map = new Map();
  for (const word of toWords(text)) {
    if (word.length < 4 || STOP_WORDS.has(word)) continue;
    map.set(word, (map.get(word) || 0) + 1);
  }
  return map;
}

function generateReport(analysis) {
  const lines = [
    `# PDF Intelligence Report`,
    "",
    `File: ${analysis.fileName}`,
    `Pages: ${analysis.pageCount}`,
    `Word Count: ${analysis.wordCount}`,
    `Estimated Reading Time: ${analysis.readingTime}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    `## Summary`,
    analysis.summary || "No readable text was extracted.",
    "",
    `## Key Points`,
    ...(analysis.keyPoints.length ? analysis.keyPoints.map((point) => `- ${point}`) : ["- None detected"]),
    "",
    `## Important Dates`,
    ...(analysis.dates.length ? analysis.dates.map((date) => `- ${date}`) : ["- None detected"]),
    "",
    `## Contacts`,
    ...(analysis.emails.length ? analysis.emails.map((email) => `- Email: ${email}`) : ["- Email: None detected"]),
    ...(analysis.phones.length ? analysis.phones.map((phone) => `- Phone: ${phone}`) : ["- Phone: None detected"]),
    "",
    `## Links`,
    ...(analysis.links.length ? analysis.links.map((link) => `- ${link}`) : ["- None detected"]),
    "",
    `## Keywords`,
    ...(analysis.keywords.length ? analysis.keywords.map((keyword) => `- ${keyword}`) : ["- None detected"]),
    "",
    `## Statistics`,
    `- Total pages: ${analysis.pageCount}`,
    `- Word count: ${analysis.wordCount}`,
    `- Reading time: ${analysis.readingTime}`,
    `- Extracted links: ${analysis.links.length}`,
    `- Extracted contacts: ${getContactCount(analysis.emails, analysis.phones)}`,
    "",
    `## Extracted Text`,
    analysis.fullText || "No readable text was extracted.",
  ];

  return lines.join("\n");
}

function buildLocalRefinementPayload({ fileName, pageCount, wordCount, fullText, sentences, frequencyMap, emails, phones, links, dates, keywords }) {
  const summarySource = topSentences(sentences, frequencyMap, Math.min(3, sentences.length));
  return {
    fileName,
    pageCount,
    wordCount,
    extractedText: fullText,
    summaryCandidate: buildSummary(sentences, frequencyMap),
    keyPoints: topSentences(sentences, frequencyMap, Math.min(6, sentences.length)),
    dates,
    emails,
    phones,
    links,
    keywords,
    sampleSentences: summarySource,
  };
}

async function refineWithAi(payload) {
  const response = await fetch("/api/pdf-intelligence-tool", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Could not refine the PDF analysis.");
  }

  return data;
}

async function loadPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");

  if (!pdfWorkerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    pdfWorkerConfigured = true;
  }

  return pdfjsLib;
}

async function yieldToBrowser() {
  await new Promise((resolve) => {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => resolve());
      return;
    }

    setTimeout(resolve, 0);
  });
}

export default function PdfIntelligenceTool() {
  const fileInputRef = useRef(null);
  const noticeTimerRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [activeTab, setActiveTab] = useState("summary");
  const [analysis, setAnalysis] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: "" });
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedAllText, setCopiedAllText] = useState(false);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const fileSize = useMemo(() => file?.size || 0, [file]);
  const reportText = useMemo(() => (analysis ? generateReport(analysis) : ""), [analysis]);
  const canAnalyze = Boolean(file && !isProcessing);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => setNotice({ type: "", message: "" }), 2600);
  };

  const clearSelection = () => {
    setFile(null);
    setAnalysis(null);
    setError("");
    setActiveTab("summary");
    setProgress({ current: 0, total: 0, message: "" });
    setCopiedSummary(false);
    setCopiedAllText(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const setSelectedFile = (selectedFile) => {
    const nextFile = selectedFile instanceof File ? selectedFile : selectedFile?.[0];

    if (!nextFile) return;

    if (!isPdfFile(nextFile)) {
      setError("Please upload a valid PDF file.");
      showNotice("error", "Only PDF files are supported.");
      return;
    }

    setFile(nextFile);
    setAnalysis(null);
    setError("");
    setActiveTab("summary");
    setProgress({ current: 0, total: 0, message: "" });
    setCopiedSummary(false);
    setCopiedAllText(false);
    showNotice("success", `${nextFile.name} selected.`);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    setSelectedFile(event.dataTransfer.files?.[0]);
  };

  const copyText = async (value, successMessage, setCopiedState) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedState(true);
      showNotice("success", successMessage);
      window.setTimeout(() => setCopiedState(false), 1400);
    } catch {
      showNotice("error", "Copy failed. Please try again.");
    }
  };

  const downloadText = (content, fileName) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const analyzePdf = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      showNotice("error", "No PDF selected yet.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setAnalysis(null);
    setActiveTab("summary");
    setCopiedSummary(false);
    setCopiedAllText(false);

    try {
      const pdfjsLib = await loadPdfJs();
      const data = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data,
        useWorkerFetch: false,
        isEvalSupported: false,
        stopAtErrors: false,
      });

      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const pageTexts = [];

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = normalizeWhitespace(
          textContent.items
            .map((item) => (typeof item.str === "string" ? item.str : ""))
            .join(" ")
        );

        pageTexts.push(pageText);
        setProgress({ current: pageNumber, total: totalPages, message: `Extracting page ${pageNumber} of ${totalPages}` });

        if (pageNumber % 3 === 0) {
          await yieldToBrowser();
        }
      }

      const fullText = normalizeWhitespace(pageTexts.join("\n\n"));
      const sentences = splitSentences(fullText);
      const frequencyMap = buildFrequencyMap(fullText);
      const emails = extractEmails(fullText);
      const phones = extractPhones(fullText);
      const links = extractUrls(fullText);
      const dates = extractDates(fullText);
      const keywords = extractKeywords(fullText);
      const wordCount = toWords(fullText).length;

      setProgress({ current: totalPages, total: totalPages, message: "Refining results with AI..." });

      const fallbackRefinement = buildLocalRefinementPayload({
        fileName: file.name,
        pageCount: totalPages,
        wordCount,
        fullText,
        sentences,
        frequencyMap,
        emails,
        phones,
        links,
        dates,
        keywords,
      });

      let refined = fallbackRefinement;

      try {
        refined = await refineWithAi(fallbackRefinement);
      } catch {
        refined = { ...fallbackRefinement, source: "Local fallback" };
      }

      setAnalysis({
        fileName: file.name,
        fileSize: file.size,
        pageCount: totalPages,
        wordCount,
        readingTime: getReadingTime(wordCount),
        summary: refined.summary || fallbackRefinement.summaryCandidate,
        keyPoints: Array.isArray(refined.keyPoints) && refined.keyPoints.length ? refined.keyPoints : fallbackRefinement.keyPoints,
        dates: Array.isArray(refined.dates) && refined.dates.length ? refined.dates : fallbackRefinement.dates,
        emails: Array.isArray(refined.emails) && refined.emails.length ? refined.emails : fallbackRefinement.emails,
        phones: Array.isArray(refined.phones) && refined.phones.length ? refined.phones : fallbackRefinement.phones,
        links: Array.isArray(refined.links) && refined.links.length ? refined.links : fallbackRefinement.links,
        keywords: Array.isArray(refined.keywords) && refined.keywords.length ? refined.keywords : fallbackRefinement.keywords,
        fullText,
        pageTexts,
        source: refined.source || "Local fallback",
      });
      setActiveTab("summary");
      showNotice("success", refined.source === "Groq API" ? "PDF analyzed with AI help. Please recheck important details." : "PDF analyzed successfully.");
    } catch (analysisError) {
      const message = analysisError instanceof Error ? analysisError.message : "Could not analyze this PDF.";
      setError(message);
      showNotice("error", message);
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0, message: "" });
    }
  };

  const downloadReport = () => {
    if (!analysis) return;
    const name = `${getBaseName(analysis.fileName)}-intelligence-report.md`;
    downloadText(reportText, name);
    showNotice("success", "Report download started.");
  };

  const uploadAnotherPdf = () => {
    clearSelection();
    fileInputRef.current?.click();
  };

  const contactsCount = analysis ? getContactCount(analysis.emails, analysis.phones) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8">
            <div className="text-center">
              <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                New document intelligence
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">PDF Intelligence Tool</h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Upload a PDF and get an AI-refined summary, key points, important dates, contacts, links, keywords, and document statistics.
              </p>
            </div>

            {notice.message && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold leading-relaxed ${
                  notice.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : notice.type === "error"
                      ? "border-rose-200 bg-rose-50 text-rose-900"
                      : "border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                {notice.message}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="flex min-w-0 flex-col gap-6">
                <div
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`rounded-3xl border-2 border-dashed p-5 transition sm:p-6 ${isDragging ? "border-orange-400 bg-orange-50/80" : "border-slate-200 bg-slate-50/70"}`}
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                          <linearGradient id="pdf-intelligence-gradient" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#fb923c" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                        <path d="M7 3.75h7.25L18.75 8.5v11a1.75 1.75 0 0 1-1.75 1.75H7A1.75 1.75 0 0 1 5.25 19.5V5.5A1.75 1.75 0 0 1 7 3.75Z" fill="url(#pdf-intelligence-gradient)" />
                        <path d="M14.25 3.75V8.1c0 .69.56 1.25 1.25 1.25h3.25" stroke="rgba(255,255,255,0.78)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8.25 12.25h7.5M8.25 14.75h7.5M8.25 17.25h5.25" stroke="#fff" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="text-base font-bold text-slate-900">Drop your PDF here</p>
                      <p className="mx-auto mt-1 max-w-md break-words text-sm leading-relaxed text-slate-500">
                        Or browse your device. The tool only accepts PDF files, extracts the text locally, and uses AI to refine the final results.
                      </p>
                    </div>

                    <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileChange} />

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" d="M12 4v16m8-8H4" />
                        </svg>
                        Choose PDF
                      </button>

                      {file && (
                        <button
                          type="button"
                          onClick={clearSelection}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                        >
                          Clear file
                        </button>
                      )}
                    </div>

                    {file && (
                      <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left shadow-sm">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="break-words text-sm font-bold text-slate-900">{file.name}</p>
                            <p className="text-xs text-slate-500">{formatBytes(fileSize)} • PDF document</p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Ready</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Processing</p>
                      <p className="mt-1 break-words text-sm leading-relaxed text-slate-600">
                        The parser extracts text page by page, then sends a compact analysis packet to the AI refinement layer.
                      </p>
                    </div>
                    <div className="inline-flex w-fit self-start rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs font-bold text-white">
                      {analysis ? `${analysis.pageCount} pages` : "PDF ready"}
                    </div>
                  </div>

                  {isProcessing ? (
                    <div className="mt-5 space-y-4">
                      <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
                        <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
                        <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                      {!analysis ? (
                        <p className="break-words">Upload a PDF to see the refined summary, key details, and statistics.</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="break-words text-slate-700">Text extracted successfully from {analysis.pageCount} pages.</p>
                          <p className="break-words text-slate-700">Estimated reading time: <span className="font-bold text-slate-900">{analysis.readingTime}</span></p>
                          <p className="break-words text-slate-700">Contacts detected: <span className="font-bold text-slate-900">{contactsCount}</span></p>
                        </div>
                      )}
                    </div>
                  )}

                  {progress.total > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                        <span className="break-words">{progress.message}</span>
                        <span>{progress.current}/{progress.total}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                          style={{ width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-relaxed text-rose-900 break-words">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={analyzePdf}
                    disabled={!canAnalyze}
                    className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                          <path
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            fill="currentColor"
                            className="opacity-75"
                          />
                        </svg>
                        {progress.message || "Processing PDF..."}
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 12h16M12 4v16" />
                        </svg>
                        Analyze PDF
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">PDF only</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Local processing</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">AI refinement</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">No signup</span>
                  </div>
                </div>
              </div>

              <aside className="flex min-w-0 flex-col gap-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">What this tool does</p>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">1. Upload a PDF</p>
                      <p className="mt-1 break-words text-slate-300">Use drag and drop or browse to pick a PDF from your device.</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">2. Extract intelligence</p>
                      <p className="mt-1 break-words text-slate-300">The parser finds summaries, dates, contacts, links, keywords, and stats, then the AI layer cleans it up.</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">3. Copy or export</p>
                      <p className="mt-1 break-words text-slate-300">Copy the results, download a report, or upload another PDF right away.</p>
                    </div>
                  </div>
                </div>

                {analysis ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Quick Actions</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <button
                        type="button"
                        onClick={() => copyText(analysis.summary, "Summary copied.", setCopiedSummary)}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-slate-950"
                      >
                        {copiedSummary ? "✓ Summary copied" : "Copy summary"}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyText(analysis.fullText, "All extracted text copied.", setCopiedAllText)}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-slate-950"
                      >
                        {copiedAllText ? "✓ Text copied" : "Copy all extracted text"}
                      </button>
                      <button
                        type="button"
                        onClick={downloadReport}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-slate-950"
                      >
                        Download extracted report
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-slate-950"
                      >
                        Clear results
                      </button>
                      <button
                        type="button"
                        onClick={uploadAnotherPdf}
                        className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Upload another PDF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Empty State</p>
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600">
                      <p className="break-words">No PDF uploaded yet. Once you pick a file, this area will fill with extracted insight and downloadable results.</p>
                    </div>
                  </div>
                )}

                {analysis && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Document Snapshot</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">File</p>
                        <p className="mt-1 break-words text-sm font-semibold text-slate-900">{analysis.fileName}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Page Count</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{analysis.pageCount}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Word Count</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{analysis.wordCount.toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Reading Time</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{analysis.readingTime}</p>
                      </div>
                    </div>
                  </div>
                )}
              </aside>
            </div>

            {analysis && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Extracted Intelligence</p>
                    <p className="mt-1 break-words text-sm leading-relaxed text-slate-600">
                      Use the tabs below to inspect the AI-refined parts of the document.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TABS.map((tab) => {
                      const active = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  {activeTab === "summary" && (
                    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Summary</p>
                        <p className="mt-3 break-words text-sm leading-7 text-slate-700">{analysis.summary}</p>
                        <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-800 ring-1 ring-amber-200">
                          This content was generated with the help of AI. Please recheck and verify important information.
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-2xl bg-amber-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Reading Time</p>
                          <p className="mt-2 text-2xl font-black text-amber-900">{analysis.readingTime}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Full Text Ready</p>
                          <p className="mt-2 break-words text-sm text-slate-700">Copy the full extracted text or download the report from the action panel.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "keyPoints" && (
                    <div className="grid gap-3">
                      {formatList(analysis.keyPoints).map((point, index) => (
                        <div key={`${point}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-relaxed text-slate-700">
                          {point}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "dates" && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {formatList(analysis.dates).map((date, index) => (
                        <div key={`${date}-${index}`} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold text-amber-900">
                          {date}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "contacts" && (
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Emails</p>
                        <div className="mt-3 space-y-2">
                          {formatList(analysis.emails, "No emails detected").map((email, index) => (
                            <div key={`${email}-${index}`} className="break-words rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
                              {email}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Phone Numbers</p>
                        <div className="mt-3 space-y-2">
                          {formatList(analysis.phones, "No phone numbers detected").map((phone, index) => (
                            <div key={`${phone}-${index}`} className="break-words rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
                              {phone}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "links" && (
                    <div className="grid gap-3">
                      {formatList(analysis.links).map((link, index) => {
                        const href = /^https?:\/\//i.test(link) ? link : `https://${link}`;
                        return (
                          <a
                            key={`${link}-${index}`}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-slate-950"
                          >
                            {link}
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === "keywords" && (
                    <div className="flex flex-wrap gap-2">
                      {formatList(analysis.keywords).map((keyword, index) => (
                        <span key={`${keyword}-${index}`} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}

                  {activeTab === "statistics" && (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Pages</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{analysis.pageCount}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Word Count</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{analysis.wordCount.toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Reading Time</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{analysis.readingTime}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Links Extracted</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{analysis.links.length}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Contacts Extracted</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{contactsCount}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { recognize } from "tesseract.js";
import { buildJsonExport, buildPlainTextExport, buildReportText, extractDocumentData } from "./extractor-utils";

const SUPPORTED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "txt"];
const TAB_ITEMS = [
  { id: "personal", label: "Personal Info" },
  { id: "document", label: "Document Info" },
  { id: "financial", label: "Financial Data" },
  { id: "links", label: "Links" },
  { id: "keywords", label: "Keywords" },
  { id: "raw", label: "Raw Extracted Text" },
  { id: "stats", label: "Statistics" },
];

let pdfWorkerConfigured = false;

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
  return String(value ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
}

function getFileTypeLabel(file) {
  const lowerName = String(file?.name || "").toLowerCase();
  const lowerType = String(file?.type || "").toLowerCase();

  if (lowerName.endsWith(".pdf") || lowerType.includes("pdf")) return "PDF";
  if (lowerName.endsWith(".txt") || lowerType.includes("text")) return "TXT";
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerType.includes("jpeg") || lowerType.includes("jpg")) return "JPG";
  if (lowerName.endsWith(".png") || lowerType.includes("png")) return "PNG";
  return "File";
}

function isSupportedFile(file) {
  if (!file) return false;

  const name = String(file.name || "").toLowerCase();
  const type = String(file.type || "").toLowerCase();

  return (
    name.endsWith(".pdf") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".txt") ||
    type.includes("pdf") ||
    type.startsWith("image/") ||
    type.includes("text/plain")
  );
}

function getBaseName(fileName) {
  return String(fileName || "document").replace(/\.[^.]+$/, "") || "document";
}

function getExportBaseName(files) {
  if (!files.length) return "document-data-extractor";
  if (files.length === 1) return getBaseName(files[0].name);
  return `${getBaseName(files[0].name)}-bundle`;
}

function downloadText(content, fileName) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function copyToClipboard(value) {
  return navigator.clipboard.writeText(value);
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function waitForAnimationFrame() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => resolve());
      return;
    }

    window.setTimeout(resolve, 0);
  });
}

async function loadPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");

  if (!pdfWorkerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    pdfWorkerConfigured = true;
  }

  return pdfjsLib;
}

async function ocrImageSource(source, onProgress) {
  const result = await recognize(source, "eng", {
    logger: (message) => {
      if (message?.status === "recognizing text") {
        onProgress?.(Math.min(0.98, Math.max(0.05, message.progress || 0)), "Reading image text...");
      }
    },
  });

  return normalizeWhitespace(result?.data?.text || "");
}

async function extractTextFromImageFile(file, onProgress) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });

  onProgress?.(0.4, "Running OCR on image...");
  const text = await ocrImageSource(dataUrl, onProgress);
  onProgress?.(1, "Image OCR complete");
  return text;
}

async function extractTextFromTxtFile(file, onProgress) {
  onProgress?.(0.25, "Reading text file...");
  const text = await file.text();
  onProgress?.(1, "Text file read");
  return normalizeWhitespace(text);
}

async function renderPdfPageToCanvas(page, scale = 1.6) {
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  await page.render({ canvasContext: context, viewport }).promise;
  return canvas;
}

async function extractTextFromPdfFile(file, onProgress) {
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
    const text = normalizeWhitespace(
      textContent.items.map((item) => (typeof item.str === "string" ? item.str : "")).join(" ")
    );

    let pageText = text;
    let status = `Extracting page ${pageNumber} of ${totalPages}`;

    if (pageText.length < 24) {
      status = `OCRing page ${pageNumber} of ${totalPages}`;
      onProgress?.((pageNumber - 1 + 0.2) / totalPages, status);
      const canvas = await renderPdfPageToCanvas(page, 1.7);
      pageText = await ocrImageSource(canvas, onProgress);
      pageText = normalizeWhitespace(pageText);
    }

    pageTexts.push(pageText);
    onProgress?.(pageNumber / totalPages, status);

    if (pageNumber % 2 === 0) {
      await waitForAnimationFrame();
    }
  }

  return {
    text: normalizeWhitespace(pageTexts.join("\n\n")),
    pageCount: totalPages,
  };
}

async function extractTextFromFile(file, onProgress) {
  const lowerName = String(file.name || "").toLowerCase();
  const lowerType = String(file.type || "").toLowerCase();

  if (lowerName.endsWith(".txt") || lowerType.includes("text")) {
    return { text: await extractTextFromTxtFile(file, onProgress), pageCount: 1 };
  }

  if (lowerName.endsWith(".pdf") || lowerType.includes("pdf")) {
    return extractTextFromPdfFile(file, onProgress);
  }

  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".png") || lowerType.startsWith("image/")) {
    return { text: await extractTextFromImageFile(file, onProgress), pageCount: 1 };
  }

  throw new Error(`Unsupported file type: ${file.name}`);
}

function renderItems(items, emptyMessage = "None detected") {
  const list = Array.isArray(items) && items.length ? items : [emptyMessage];

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold leading-relaxed ${
            item === emptyMessage
              ? "border-slate-200 bg-slate-50 text-slate-500"
              : "border-orange-200 bg-orange-50 text-slate-800"
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  );
}

function SkeletonBlock({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />;
}

function ResultSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-9 w-28" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-28" />
        ))}
      </div>
      <SkeletonBlock className="h-40" />
      <SkeletonBlock className="h-64" />
    </div>
  );
}

export default function DocumentDataExtractor() {
  const fileInputRef = useRef(null);
  const noticeTimerRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [progress, setProgress] = useState({ percent: 0, message: "" });
  const [copiedExtractedData, setCopiedExtractedData] = useState(false);
  const [copiedAllText, setCopiedAllText] = useState(false);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const totalSize = useMemo(() => files.reduce((sum, file) => sum + (file.size || 0), 0), [files]);
  const exportBaseName = useMemo(() => getExportBaseName(files), [files]);
  const hasFiles = files.length > 0;
  const canProcess = hasFiles && !isProcessing;

  const showNotice = (type, message) => {
    setNotice({ type, message });
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => setNotice({ type: "", message: "" }), 2800);
  };

  const resetResults = () => {
    setAnalysis(null);
    setActiveTab("personal");
    setCopiedExtractedData(false);
    setCopiedAllText(false);
    setProgress({ percent: 0, message: "" });
  };

  const clearAll = () => {
    setFiles([]);
    resetResults();
    setError("");
    setNotice({ type: "", message: "" });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const setSelectedFiles = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles || []).filter(isSupportedFile);

    if (!validFiles.length) {
      setError("Please choose PDF, JPG, PNG, JPEG, or TXT files.");
      showNotice("error", "Only PDF, JPG, PNG, JPEG, and TXT files are supported.");
      return;
    }

    setFiles(validFiles);
    resetResults();
    setError("");
    showNotice("success", `${validFiles.length} file${validFiles.length === 1 ? "" : "s"} selected.`);
  };

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    setSelectedFiles(event.dataTransfer.files);
  };

  const uploadAnotherFile = () => {
    clearAll();
    fileInputRef.current?.click();
  };

  const copyExtractedData = async () => {
    if (!analysis) return;

    try {
      await copyToClipboard(buildJsonExport(analysis));
      setCopiedExtractedData(true);
      showNotice("success", "Structured extracted data copied.");
      window.setTimeout(() => setCopiedExtractedData(false), 1500);
    } catch {
      showNotice("error", "Copy failed. Please try again.");
    }
  };

  const copyAllText = async () => {
    if (!analysis?.fullText) return;

    try {
      await copyToClipboard(analysis.fullText);
      setCopiedAllText(true);
      showNotice("success", "All extracted text copied.");
      window.setTimeout(() => setCopiedAllText(false), 1500);
    } catch {
      showNotice("error", "Copy failed. Please try again.");
    }
  };

  const exportTxt = () => {
    if (!analysis) return;
    downloadText(buildPlainTextExport(analysis), `${exportBaseName}-extract.txt`);
    showNotice("success", "TXT export started.");
  };

  const exportJson = () => {
    if (!analysis) return;
    downloadText(buildJsonExport(analysis), `${exportBaseName}-extract.json`);
    showNotice("success", "JSON export started.");
  };

  const downloadReport = () => {
    if (!analysis) return;
    downloadText(buildReportText(analysis), `${exportBaseName}-report.txt`);
    showNotice("success", "Report download started.");
  };

  const processFiles = async () => {
    if (!files.length) {
      setError("Please upload at least one supported file first.");
      showNotice("error", "No files selected yet.");
      return;
    }

    setIsProcessing(true);
    setError("");
    resetResults();
    setNotice({ type: "", message: "" });

    try {
      const extractedTexts = [];
      const fileSummaries = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const label = getFileTypeLabel(file);
        const fileStart = index / files.length;
        const fileWeight = 1 / files.length;

        setProgress({ percent: Math.round(fileStart * 100), message: `Processing ${file.name}` });

        const result = await extractTextFromFile(file, (filePercent, message) => {
          const normalized = Number.isFinite(filePercent) ? Math.max(0, Math.min(1, filePercent)) : 0;
          setProgress({
            percent: Math.round((fileStart + normalized * fileWeight) * 100),
            message: message || `Processing ${file.name}`,
          });
        });

        extractedTexts.push(`--- ${file.name} ---\n${result.text || ""}`);
        fileSummaries.push({
          name: file.name,
          size: file.size,
          sizeLabel: formatBytes(file.size),
          type: label,
          pageCount: result.pageCount || 1,
        });

        await waitForAnimationFrame();
      }

      const combinedText = normalizeWhitespace(extractedTexts.join("\n\n"));
      const nextAnalysis = extractDocumentData({ fileSummaries, combinedText });
      setAnalysis(nextAnalysis);
      setActiveTab("personal");
      setProgress({ percent: 100, message: "Extraction complete" });
      showNotice("success", "Document data extracted successfully.");
    } catch (processError) {
      const message = processError instanceof Error ? processError.message : "Could not extract data from these files.";
      setError(message);
      showNotice("error", message);
    } finally {
      setIsProcessing(false);
      window.setTimeout(() => setProgress({ percent: 0, message: "" }), 1800);
    }
  };

  const resultTabs = useMemo(
    () => [
      {
        id: "personal",
        title: "Personal Info",
        content: analysis ? (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-bold text-slate-900">Names</p>
              <div className="mt-2">{renderItems(analysis.personalInfo.names)}</div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Phone Numbers</p>
              <div className="mt-2">{renderItems(analysis.personalInfo.phones)}</div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Email Addresses</p>
              <div className="mt-2">{renderItems(analysis.personalInfo.emails)}</div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Addresses</p>
              <div className="mt-2">{renderItems(analysis.personalInfo.addresses)}</div>
            </div>
          </div>
        ) : null,
      },
      {
        id: "document",
        title: "Document Info",
        content: analysis ? (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-bold text-slate-900">Dates</p>
              <div className="mt-2">{renderItems(analysis.documentInfo.dates)}</div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">IDs</p>
              <div className="mt-2">{renderItems(analysis.documentInfo.ids)}</div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Invoice Numbers</p>
              <div className="mt-2">{renderItems(analysis.documentInfo.invoiceNumbers)}</div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Order Numbers</p>
              <div className="mt-2">{renderItems(analysis.documentInfo.orderNumbers)}</div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Reference Numbers</p>
              <div className="mt-2">{renderItems(analysis.documentInfo.referenceNumbers)}</div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Important Text Blocks</p>
              <div className="mt-2 space-y-2">
                {(analysis.documentInfo.importantBlocks || ["None detected"]).map((block, index) => (
                  <div key={`${block}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                    {block}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null,
      },
      {
        id: "financial",
        title: "Financial Data",
        content: analysis ? (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-bold text-slate-900">Amounts</p>
              <div className="mt-2">{renderItems(analysis.financialData.amounts)}</div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Currency Values</p>
              <div className="mt-2">{renderItems(analysis.financialData.currencyValues)}</div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Totals</p>
              <div className="mt-2">{renderItems(analysis.financialData.totals)}</div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Tax Values</p>
              <div className="mt-2">{renderItems(analysis.financialData.taxValues)}</div>
            </div>
          </div>
        ) : null,
      },
      {
        id: "links",
        title: "Links",
        content: analysis ? <div className="space-y-3">{renderItems(analysis.links, "No links detected")}</div> : null,
      },
      {
        id: "keywords",
        title: "Keywords",
        content: analysis ? <div className="space-y-3">{renderItems(analysis.keywords, "No keywords detected")}</div> : null,
      },
      {
        id: "raw",
        title: "Raw Extracted Text",
        content: analysis ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Combined text</p>
              <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-sm leading-relaxed text-slate-700 shadow-inner ring-1 ring-slate-200">
                {analysis.fullText || "No readable text was extracted."}
              </pre>
            </div>
          </div>
        ) : null,
      },
      {
        id: "stats",
        title: "Statistics",
        content: analysis ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total extracted items" value={analysis.statistics.totalExtractedItems || 0} hint="Combined unique items across the main sections." />
            <StatCard label="Contact count" value={analysis.statistics.contactCount || 0} hint="Names, phones, emails, and addresses detected." />
            <StatCard label="Dates count" value={analysis.statistics.datesCount || 0} hint="Date-like values discovered in the content." />
            <StatCard label="Links count" value={analysis.statistics.linksCount || 0} hint="URLs and website links extracted." />
            <StatCard label="Numbers count" value={analysis.statistics.numbersCount || 0} hint="Numeric tokens found in the text." />
            <StatCard label="Word count" value={analysis.statistics.wordCount || 0} hint="Total words in the combined extracted text." />
          </div>
        ) : null,
      },
    ],
    [analysis]
  );

  const activePanel = resultTabs.find((tab) => tab.id === activeTab) || resultTabs[0];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8">
            <div className="text-center">
              <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                New document intelligence
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">Document Data Extractor</h1>
              <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Upload documents or images and automatically extract contacts, dates, financial details, links, keywords, and raw text without manual searching.
              </p>
            </div>

            {notice.message ? (
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
            ) : null}

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
                          <linearGradient id="document-data-extractor-gradient" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#fb923c" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                        <path d="M7 3.75h7.25L18.75 8.5v11a1.75 1.75 0 0 1-1.75 1.75H7A1.75 1.75 0 0 1 5.25 19.5V5.5A1.75 1.75 0 0 1 7 3.75Z" fill="url(#document-data-extractor-gradient)" />
                        <path d="M14.25 3.75V8.1c0 .69.56 1.25 1.25 1.25h3.25" stroke="rgba(255,255,255,0.78)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="7.75" y="11" width="8.5" height="5.75" rx="1.25" stroke="#fff" strokeWidth="1.45" />
                        <path d="M8.9 13.05h6.2M8.9 14.85h4.4" stroke="#fff" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="text-base font-bold text-slate-900">Drop files here</p>
                      <p className="mx-auto mt-1 max-w-md break-words text-sm leading-relaxed text-slate-500">
                        Or browse your device. Supported formats are PDF, JPG, JPEG, PNG, and TXT. Multiple files are supported.
                      </p>
                    </div>

                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.txt,application/pdf,image/*,text/plain" multiple className="hidden" onChange={handleFileChange} />

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" d="M12 4v16m8-8H4" />
                        </svg>
                        Choose files
                      </button>

                      {hasFiles ? (
                        <button
                          type="button"
                          onClick={clearAll}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                        >
                          Clear files
                        </button>
                      ) : null}
                    </div>

                    {hasFiles ? (
                      <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left shadow-sm">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{files.length} selected file{files.length === 1 ? "" : "s"}</p>
                            <p className="text-xs text-slate-500">{formatBytes(totalSize)} total</p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Ready to process</span>
                        </div>

                        <div className="mt-4 space-y-2">
                          {files.map((file) => (
                            <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                                <p className="text-xs text-slate-500">
                                  {formatBytes(file.size)} • {getFileTypeLabel(file)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Processing</p>
                      <p className="mt-1 break-words text-sm leading-relaxed text-slate-600">
                        The extractor processes files locally in small steps to keep the interface responsive, and uses OCR when text is not directly readable.
                      </p>
                    </div>
                    <div className="inline-flex w-fit self-start rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs font-bold text-white">
                      {analysis ? `${analysis.statistics.wordCount || 0} words` : "Ready"}
                    </div>
                  </div>

                  {isProcessing ? (
                    <div className="mt-5 space-y-4">
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300" style={{ width: `${progress.percent}%` }} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <SkeletonBlock className="h-24" />
                        <SkeletonBlock className="h-24" />
                      </div>
                      <SkeletonBlock className="h-20" />
                      <SkeletonBlock className="h-28" />
                    </div>
                  ) : analysis ? (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                      <p className="break-words text-slate-700">Extraction finished successfully.</p>
                      <p className="mt-2 break-words text-slate-700">
                        Total extracted items: <span className="font-bold text-slate-900">{analysis.statistics.totalExtractedItems || 0}</span>
                      </p>
                      <p className="mt-2 break-words text-slate-700">
                        Contacts found: <span className="font-bold text-slate-900">{analysis.statistics.contactCount || 0}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                      <p className="break-words">Upload a file to extract structured data and view the dashboard.</p>
                    </div>
                  )}

                  {(isProcessing || progress.message) && progress.percent > 0 ? (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                        <span className="break-words">{progress.message}</span>
                        <span>{progress.percent}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300" style={{ width: `${progress.percent}%` }} />
                      </div>
                    </div>
                  ) : null}

                  {error ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-relaxed text-rose-900 break-words">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={processFiles}
                    disabled={!canProcess}
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
                        {progress.message || "Processing files..."}
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 12h16M12 4v16" />
                        </svg>
                        Extract data
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-500">
                    {SUPPORTED_EXTENSIONS.map((ext) => (
                      <span key={ext} className="rounded-full bg-slate-100 px-3 py-1 uppercase">
                        {ext}
                      </span>
                    ))}
                    <span className="rounded-full bg-slate-100 px-3 py-1">OCR support</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Local processing</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">No signup</span>
                  </div>
                </div>
              </div>

              <aside className="flex min-w-0 flex-col gap-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">What this tool does</p>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">1. Upload files</p>
                      <p className="mt-1 break-words text-slate-300">Use drag and drop or browse your device for documents and images.</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">2. Extract structured data</p>
                      <p className="mt-1 break-words text-slate-300">The tool finds names, contact details, dates, IDs, financial data, links, keywords, and raw text.</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">3. Copy or export</p>
                      <p className="mt-1 break-words text-slate-300">Copy structured data, export TXT or JSON, download a report, or clear everything instantly.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Selected files</p>
                  <div className="mt-4 space-y-3">
                    {hasFiles ? (
                      files.map((file) => (
                        <div key={`${file.name}-${file.size}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="break-words text-sm font-bold text-slate-900">{file.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatBytes(file.size)} • {getFileTypeLabel(file)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                        Your uploaded files will appear here before processing.
                      </div>
                    )}
                  </div>
                </div>

                {analysis ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Quick actions</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <button
                        type="button"
                        onClick={copyExtractedData}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-slate-950"
                      >
                        {copiedExtractedData ? "✓ Data copied" : "Copy extracted data"}
                      </button>
                      <button
                        type="button"
                        onClick={copyAllText}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-slate-950"
                      >
                        {copiedAllText ? "✓ Text copied" : "Copy all text"}
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
                        onClick={exportTxt}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-slate-950"
                      >
                        Export as TXT
                      </button>
                      <button
                        type="button"
                        onClick={exportJson}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-slate-950"
                      >
                        Export as JSON
                      </button>
                      <button
                        type="button"
                        onClick={clearAll}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-slate-950"
                      >
                        Clear results
                      </button>
                      <button
                        type="button"
                        onClick={uploadAnotherFile}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-slate-950"
                      >
                        Upload another file
                      </button>
                    </div>
                  </div>
                ) : null}
              </aside>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Results</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Structured extraction dashboard</h2>
                  <p className="mt-2 max-w-3xl break-words text-sm leading-relaxed text-slate-600">
                    The extracted data is organized into tabs so you can jump straight to the section you need without scanning raw content.
                  </p>
                </div>
                {analysis ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[22rem] lg:grid-cols-3">
                    <StatCard label="Files" value={analysis.fileSummaries.length} />
                    <StatCard label="Contacts" value={analysis.statistics.contactCount || 0} />
                    <StatCard label="Words" value={analysis.statistics.wordCount || 0} />
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                {isProcessing ? (
                  <ResultSkeleton />
                ) : analysis ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
                      {TAB_ITEMS.map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                              active ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                      {activePanel?.content}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                      <svg className="h-7 w-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">Upload a file to begin</h3>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                      The dashboard will populate with personal info, document details, financial data, links, keywords, raw text, and statistics after extraction.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

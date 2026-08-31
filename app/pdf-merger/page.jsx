"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

let pdfWorkerConfigured = false;
async function loadPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!pdfWorkerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    pdfWorkerConfigured = true;
  }
  return pdfjsLib;
}

async function renderPdfThumbnail(arrayBuffer) {
  try {
    const pdfjsLib = await loadPdfJs();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer.slice(0)),
    });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");
    if (context) {
      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL("image/jpeg", 0.8);
    }
  } catch (err) {
    console.warn("Could not render page preview:", err);
  }
  return null;
}

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

function getBaseName(fileName) {
  return String(fileName || "merged-document").replace(/\.[^.]+$/, "");
}

function parsePageRanges(rangeStr, totalPages) {
  if (!rangeStr || rangeStr.trim().toLowerCase() === "all" || rangeStr.trim() === "") {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  const pages = new Set();
  const parts = rangeStr.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-").map((s) => parseInt(s.trim(), 10));
      if (!isNaN(startStr) && !isNaN(endStr)) {
        const start = Math.max(1, Math.min(startStr, endStr));
        const end = Math.min(totalPages, Math.max(startStr, endStr));
        for (let i = start; i <= end; i++) {
          pages.add(i - 1);
        }
      }
    } else {
      const pageNum = parseInt(trimmed, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum - 1);
      }
    }
  }
  const result = Array.from(pages).sort((a, b) => a - b);
  return result.length > 0 ? result : Array.from({ length: totalPages }, (_, i) => i);
}

export default function PdfMerger() {
  const fileInputRef = useRef(null);
  const additionalFileInputRef = useRef(null);
  const downloadUrlRef = useRef("");

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Ready to upload PDF files");
  const [customOutputName, setCustomOutputName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [mergedStats, setMergedStats] = useState({ totalPages: 0, totalSize: 0 });
  const [glanceModalEntry, setGlanceModalEntry] = useState(null);

  useEffect(() => {
    downloadUrlRef.current = downloadUrl;
  }, [downloadUrl]);

  useEffect(() => {
    return () => {
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }
    };
  }, []);

  const totalSize = useMemo(
    () => files.reduce((sum, entry) => sum + (entry.file?.size || 0), 0),
    [files]
  );

  const totalPagesCount = useMemo(
    () => files.reduce((sum, entry) => sum + (entry.pageCount || 0), 0),
    [files]
  );

  const loadPdfMetadata = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();

      // Render 1st-page thumbnail asynchronously for minimal glance
      let thumbnailUrl = null;
      try {
        thumbnailUrl = await renderPdfThumbnail(arrayBuffer);
      } catch {
        thumbnailUrl = null;
      }

      return {
        pageCount,
        arrayBuffer,
        thumbnailUrl,
      };
    } catch {
      return {
        pageCount: 1,
        arrayBuffer: null,
        thumbnailUrl: null,
      };
    }
  };

  const processIncomingFiles = async (incomingFilesList, isAppend = false) => {
    const validFiles = Array.from(incomingFilesList || []).filter((file) =>
      file.type === "application/pdf" || /\.pdf$/i.test(file.name)
    );

    if (validFiles.length === 0) {
      setError("Please select valid PDF files.");
      return;
    }

    setIsLoadingPages(true);
    setError("");
    setStatus(`Reading & generating glance previews for ${validFiles.length} PDF${validFiles.length === 1 ? "" : "s"}...`);

    try {
      const newEntries = await Promise.all(
        validFiles.map(async (file, idx) => {
          const meta = await loadPdfMetadata(file);
          return {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${idx}`,
            file,
            pageCount: meta.pageCount,
            arrayBuffer: meta.arrayBuffer,
            thumbnailUrl: meta.thumbnailUrl,
            pageRange: "all",
          };
        })
      );

      setFiles((prev) => {
        const combined = isAppend ? [...prev, ...newEntries] : newEntries;
        if (!customOutputName && combined.length > 0) {
          const firstBase = getBaseName(combined[0].file.name);
          setCustomOutputName(`${firstBase}-merged.pdf`);
        }
        return combined;
      });

      const totalCount = isAppend ? files.length + newEntries.length : newEntries.length;
      setStatus(`${totalCount} PDF${totalCount === 1 ? "" : "s"} ready to merge`);
    } catch {
      setError("Could not parse some PDF files. Please ensure they are valid and not password-protected.");
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleFileChange = (event) => {
    processIncomingFiles(event.target.files, false);
  };

  const handleAddMoreFiles = (event) => {
    processIncomingFiles(event.target.files, true);
    if (additionalFileInputRef.current) {
      additionalFileInputRef.current.value = "";
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    processIncomingFiles(event.dataTransfer.files, files.length > 0);
  };

  const moveItem = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    setFiles((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
  };

  const removeFileAtIndex = (index) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        clearAll();
      }
      return next;
    });
  };

  const updatePageRange = (index, range) => {
    setFiles((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], pageRange: range };
      return copy;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setError("");
    setStatus("Ready to upload PDF files");
    setDownloadName("");
    setCustomOutputName("");
    setMergedStats({ totalPages: 0, totalSize: 0 });
    setGlanceModalEntry(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (additionalFileInputRef.current) additionalFileInputRef.current.value = "";

    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = "";
      setDownloadUrl("");
    }
  };

  const downloadPdf = (urlToDownload, nameToDownload) => {
    if (!urlToDownload || !nameToDownload) return;
    const anchor = document.createElement("a");
    anchor.href = urlToDownload;
    anchor.download = nameToDownload.endsWith(".pdf") ? nameToDownload : `${nameToDownload}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setStatus("Merging PDF documents locally...");

    try {
      const mergedPdf = await PDFDocument.create();
      let totalPagesCombined = 0;

      for (let i = 0; i < files.length; i++) {
        const entry = files[i];
        setStatus(`Processing document ${i + 1} of ${files.length} (${entry.file.name})...`);

        let sourceBytes = entry.arrayBuffer;
        if (!sourceBytes) {
          sourceBytes = await entry.file.arrayBuffer();
        }

        const sourcePdf = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
        const docPageCount = sourcePdf.getPageCount();
        const pageIndicesToCopy = parsePageRanges(entry.pageRange, docPageCount);

        const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndicesToCopy);
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        totalPagesCombined += copiedPages.length;
      }

      setStatus("Finalizing combined PDF file...");
      const mergedPdfBytes = await mergedPdf.save();
      const outputBlob = new Blob([mergedPdfBytes], { type: "application/pdf" });

      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }

      const nextUrl = URL.createObjectURL(outputBlob);
      downloadUrlRef.current = nextUrl;

      const finalName = (customOutputName.trim() || "merged-document.pdf").replace(/\.pdf$/i, "") + ".pdf";

      setDownloadUrl(nextUrl);
      setDownloadName(finalName);
      setMergedStats({ totalPages: totalPagesCombined, totalSize: outputBlob.size });
      setStatus("PDFs merged successfully!");

      downloadPdf(nextUrl, finalName);
    } catch (mergeError) {
      setError(
        mergeError instanceof Error
          ? `Merge failed: ${mergeError.message}`
          : "Could not merge the PDF files. Please ensure files are not encrypted or corrupted."
      );
      setStatus("Ready to try again");
    } finally {
      setIsProcessing(false);
    }
  };

  const canMerge = files.length >= 2 && !isProcessing && !isLoadingPages;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8">
            {/* Header & Hero */}
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                PDF Merger
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Combine multiple PDF documents into a single clean file. Reorder pages, customize page ranges, and merge instantly right inside your browser.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
              {/* Left Column: Actions & File Queue */}
              <div className="flex flex-col gap-6 min-w-0">
                {/* Upload Drag & Drop Zone */}
                {files.length === 0 ? (
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
                    className={`rounded-3xl border-2 border-dashed p-6 transition sm:p-8 ${
                      isDragging ? "border-amber-400 bg-amber-50/80" : "border-slate-200 bg-slate-50/70 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 text-amber-600">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.75"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <p className="text-base font-bold text-slate-900">Drop your PDF files here</p>
                        <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-500 break-words">
                          Select 2 or more PDF documents from your device. Each file gets a visual glance preview automatically.
                        </p>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-amber-700"
                      >
                        Choose PDF Files
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Reorderable List & Controls */
                  <div className="flex flex-col gap-4">
                    {/* Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                          {files.length} {files.length === 1 ? "File" : "Files"}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {totalPagesCount} total pages • {formatBytes(totalSize)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          ref={additionalFileInputRef}
                          type="file"
                          accept="application/pdf,.pdf"
                          multiple
                          className="hidden"
                          onChange={handleAddMoreFiles}
                        />
                        <button
                          type="button"
                          onClick={() => additionalFileInputRef.current?.click()}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-amber-700"
                        >
                          + Add More
                        </button>
                        <button
                          type="button"
                          onClick={clearAll}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* PDF Cards List with Visual Glance */}
                    <div className="flex flex-col gap-3">
                      {files.map((entry, index) => (
                        <div
                          key={entry.id}
                          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                        >
                          {/* File Info with Minimal Glance Thumbnail */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Sequence Number */}
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-xs font-bold text-amber-800">
                              {index + 1}
                            </span>

                            {/* Minimal Visual Glance Thumbnail */}
                            <button
                              type="button"
                              onClick={() => setGlanceModalEntry(entry)}
                              title="Click for larger document glance"
                              className="group relative flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-xs transition hover:scale-105 hover:border-amber-400 focus:outline-none"
                            >
                              {entry.thumbnailUrl ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={entry.thumbnailUrl}
                                    alt={`Preview of ${entry.file.name}`}
                                    className="h-full w-full object-cover object-top"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition group-hover:opacity-100">
                                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-[9px] font-bold uppercase tracking-tight text-slate-500 mt-0.5">PDF</span>
                                </div>
                              )}
                            </button>

                            {/* Name and Metadata */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-slate-900" title={entry.file.name}>
                                {entry.file.name}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="font-semibold text-slate-600">{formatBytes(entry.file.size)}</span>
                                <span>•</span>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                                  {entry.pageCount} {entry.pageCount === 1 ? "page" : "pages"}
                                </span>
                                {entry.thumbnailUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setGlanceModalEntry(entry)}
                                    className="text-amber-700 hover:text-amber-900 font-semibold hover:underline flex items-center gap-1 ml-1"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Glance
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Page Range & Controls */}
                          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                            <div className="flex items-center gap-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Pages:
                              </label>
                              <input
                                type="text"
                                value={entry.pageRange}
                                onChange={(e) => updatePageRange(index, e.target.value)}
                                placeholder="all or 1-3, 5"
                                title="Enter 'all' or comma-separated pages/ranges (e.g. 1-4, 7)"
                                className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveItem(index, index - 1)}
                                disabled={index === 0}
                                title="Move up"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-slate-50"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => moveItem(index, index + 1)}
                                disabled={index === files.length - 1}
                                title="Move down"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-slate-50"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFileAtIndex(index)}
                                title="Remove file"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Output File Name Setting */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Output File Name
                      </label>
                      <div className="mt-2 flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-amber-500 focus-within:bg-white">
                        <input
                          type="text"
                          value={customOutputName}
                          onChange={(e) => setCustomOutputName(e.target.value)}
                          placeholder="merged-document.pdf"
                          className="w-full bg-transparent px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none"
                        />
                        <span className="flex items-center pr-3 text-xs font-bold text-slate-400">.pdf</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-relaxed text-rose-900 break-words">
                    {error}
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={mergePdfs}
                  disabled={!canMerge}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                      {status}
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                        />
                      </svg>
                      Merge {files.length > 0 ? `${files.length} PDFs` : "PDFs"}
                    </>
                  )}
                </button>

                <p className="text-center text-xs font-medium text-slate-500 break-words">{status}</p>
              </div>

              {/* Right Column: Informational Sidebar */}
              <aside className="flex min-w-0 flex-col gap-4">
                {/* How It Works Card */}
                <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">How It Works</p>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">1. Add PDF Files</p>
                      <p className="mt-1 text-xs text-slate-300">Upload two or more PDF documents from your device.</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">2. Arrange & Glance</p>
                      <p className="mt-1 text-xs text-slate-300">
                        Check visual 1st-page glance previews and arrange your sequence with ▲ / ▼.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">3. Merge & Download</p>
                      <p className="mt-1 text-xs text-slate-300">
                        Click Merge to compile your single combined PDF and download it instantly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Info & Output Summary */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Security & Features</p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>100% In-Browser:</strong> Documents are never transmitted over the internet.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Visual Glance:</strong> 1st-page snapshot to quickly recognize documents.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Selective Merging:</strong> Choose full files or exact page numbers.</span>
                    </li>
                  </ul>

                  {downloadName && (
                    <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 border border-emerald-100">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Ready: {downloadName}
                      </div>
                      <div className="mt-1 text-xs text-emerald-700">
                        {mergedStats.totalPages} total pages • {formatBytes(mergedStats.totalSize)}
                      </div>
                    </div>
                  )}

                  {downloadUrl && (
                    <button
                      type="button"
                      onClick={() => downloadPdf(downloadUrl, downloadName)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Again
                    </button>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Glance Preview Modal */}
      {glanceModalEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          onClick={() => setGlanceModalEntry(null)}
        >
          <div
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="min-w-0 flex-1 pr-3">
                <h3 className="truncate text-base font-bold text-slate-900">
                  {glanceModalEntry.file.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {glanceModalEntry.pageCount} {glanceModalEntry.pageCount === 1 ? "page" : "pages"} • {formatBytes(glanceModalEntry.file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGlanceModalEntry(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4">
              {glanceModalEntry.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={glanceModalEntry.thumbnailUrl}
                  alt={`1st Page Glance of ${glanceModalEntry.file.name}`}
                  className="max-h-80 w-auto rounded-lg border border-slate-200 object-contain shadow-md"
                />
              ) : (
                <div className="flex h-48 w-36 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400">
                  <span className="text-xs font-bold">No preview available</span>
                </div>
              )}
              <span className="mt-2 text-[11px] font-semibold text-slate-500">
                Page 1 Preview (Glance)
              </span>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setGlanceModalEntry(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close Glance
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

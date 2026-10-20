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

async function renderPdfThumbnail(arrayBuffer, pageNumber = 1, scale = 0.45) {
  try {
    const pdfjsLib = await loadPdfJs();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer.slice(0)),
    });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");
    if (context) {
      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL("image/jpeg", 0.8);
    }
  } catch (err) {
    console.warn(`Could not render thumbnail for page ${pageNumber}:`, err);
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
  return String(fileName || "document").replace(/\.[^.]+$/, "");
}

// Convert range string (e.g. "1-3, 5" or "all") to 0-indexed page indices array
function parsePageRanges(rangeStr, totalPages) {
  if (!rangeStr || rangeStr.trim().toLowerCase() === "all" || rangeStr.trim() === "") {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  if (rangeStr.trim().toLowerCase() === "none") {
    return [];
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
  return Array.from(pages).sort((a, b) => a - b);
}

// Convert 1-indexed list of kept pages into a clean range string (e.g. "1-3, 5-8")
function pageListToRangeString(includedPages, totalPages) {
  if (!includedPages || includedPages.length === 0) return "none";
  if (includedPages.length === totalPages) return "all";

  const sorted = [...includedPages].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    if (curr === prev + 1) {
      prev = curr;
    } else {
      ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = curr;
      prev = curr;
    }
  }
  ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
  return ranges.join(", ");
}

export default function PdfMerger() {
  const fileInputRef = useRef(null);
  const additionalFileInputRef = useRef(null);
  const downloadUrlRef = useRef("");
  const renderingSessionRef = useRef(0);

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

  // Managing Pages Modal State
  const [managingEntryId, setManagingEntryId] = useState(null);
  const [quickExcludeInput, setQuickExcludeInput] = useState("");

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

  const totalOriginalPages = useMemo(
    () => files.reduce((sum, entry) => sum + (entry.pageCount || 0), 0),
    [files]
  );

  const totalKeptPages = useMemo(() => {
    return files.reduce((sum, entry) => {
      const kept = parsePageRanges(entry.pageRange, entry.pageCount || 0);
      return sum + kept.length;
    }, 0);
  }, [files]);

  const loadPdfMetadata = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();

      // Render 1st-page thumbnail asynchronously for glance
      let thumbnailUrl = null;
      try {
        thumbnailUrl = await renderPdfThumbnail(arrayBuffer, 1, 0.45);
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
    setStatus(`Reading & preparing ${validFiles.length} PDF${validFiles.length === 1 ? "" : "s"}...`);

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
            pageThumbnails: meta.thumbnailUrl ? { 1: meta.thumbnailUrl } : {},
            excludedPages: [],
            pageRange: "all",
          };
        })
      );

      setFiles((prev) => {
        const combined = isAppend ? [...prev, ...newEntries] : newEntries;
        if (!customOutputName && combined.length > 0) {
          const firstBase = getBaseName(combined[0].file.name);
          const suffix = combined.length === 1 ? "-cleaned.pdf" : "-merged.pdf";
          setCustomOutputName(`${firstBase}${suffix}`);
        }
        return combined;
      });

      const totalCount = isAppend ? files.length + newEntries.length : newEntries.length;
      setStatus(`${totalCount} PDF${totalCount === 1 ? "" : "s"} ready`);
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
      const targetId = prev[index]?.id;
      if (managingEntryId === targetId) {
        setManagingEntryId(null);
      }
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        clearAll();
      }
      return next;
    });
  };

  // Keep manual text box and excludedPages in sync
  const updatePageRange = (index, range) => {
    setFiles((prev) => {
      const copy = [...prev];
      const entry = copy[index];
      const selectedIndices = parsePageRanges(range, entry.pageCount);
      const selectedSet = new Set(selectedIndices.map((i) => i + 1));
      const excluded = [];
      for (let p = 1; p <= entry.pageCount; p++) {
        if (!selectedSet.has(p)) {
          excluded.push(p);
        }
      }
      copy[index] = {
        ...entry,
        pageRange: range,
        excludedPages: excluded,
      };
      return copy;
    });
  };

  // Toggle page exclusion in Visual Organizer
  const togglePageExclusion = (entryId, pageNum) => {
    setFiles((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;

        const currentExcluded = new Set(entry.excludedPages || []);
        if (currentExcluded.has(pageNum)) {
          currentExcluded.delete(pageNum);
        } else {
          currentExcluded.add(pageNum);
        }

        const nextExcluded = Array.from(currentExcluded).sort((a, b) => a - b);
        const included = [];
        for (let i = 1; i <= entry.pageCount; i++) {
          if (!currentExcluded.has(i)) {
            included.push(i);
          }
        }
        const nextRangeStr = pageListToRangeString(included, entry.pageCount);

        return {
          ...entry,
          excludedPages: nextExcluded,
          pageRange: nextRangeStr,
        };
      })
    );
  };

  const includeAllPages = (entryId) => {
    setFiles((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        return {
          ...entry,
          excludedPages: [],
          pageRange: "all",
        };
      })
    );
  };

  const invertSelection = (entryId) => {
    setFiles((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        const currentExcluded = new Set(entry.excludedPages || []);
        const nextExcluded = [];
        const included = [];
        for (let i = 1; i <= entry.pageCount; i++) {
          if (currentExcluded.has(i)) {
            included.push(i);
          } else {
            nextExcluded.push(i);
          }
        }
        return {
          ...entry,
          excludedPages: nextExcluded,
          pageRange: pageListToRangeString(included, entry.pageCount),
        };
      })
    );
  };

  const excludeFromQuickInput = (entryId, inputStr) => {
    if (!inputStr.trim()) return;
    setFiles((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        const parsedToExclude = parsePageRanges(inputStr, entry.pageCount).map((idx) => idx + 1);
        const currentExcluded = new Set(entry.excludedPages || []);
        parsedToExclude.forEach((p) => currentExcluded.add(p));
        const nextExcluded = Array.from(currentExcluded).sort((a, b) => a - b);

        const included = [];
        for (let i = 1; i <= entry.pageCount; i++) {
          if (!currentExcluded.has(i)) {
            included.push(i);
          }
        }
        return {
          ...entry,
          excludedPages: nextExcluded,
          pageRange: pageListToRangeString(included, entry.pageCount),
        };
      })
    );
    setQuickExcludeInput("");
  };

  // Progressively render all page thumbnails for the document currently opened in modal
  const openPageManager = async (entryId) => {
    const entry = files.find((f) => f.id === entryId);
    if (!entry) return;

    setManagingEntryId(entryId);
    setQuickExcludeInput("");

    // Start background render for all pages of this entry if not already rendered
    const sessionId = Date.now();
    renderingSessionRef.current = sessionId;

    try {
      const pdfjsLib = await loadPdfJs();
      let buffer = entry.arrayBuffer;
      if (!buffer) {
        buffer = await entry.file.arrayBuffer();
      }

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer.slice(0)),
      });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      for (let p = 1; p <= totalPages; p++) {
        // If user switched or closed modal, cancel further renders
        if (renderingSessionRef.current !== sessionId) break;

        // Skip if already rendered
        if (entry.pageThumbnails && entry.pageThumbnails[p]) continue;

        try {
          const page = await pdf.getPage(p);
          const viewport = page.getViewport({ scale: 0.4 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext("2d");
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            const thumbUrl = canvas.toDataURL("image/jpeg", 0.75);

            setFiles((prev) =>
              prev.map((f) => {
                if (f.id === entryId) {
                  return {
                    ...f,
                    pageThumbnails: {
                      ...(f.pageThumbnails || {}),
                      [p]: thumbUrl,
                    },
                  };
                }
                return f;
              })
            );
          }
        } catch (pageErr) {
          console.warn(`Could not render thumbnail for page ${p}:`, pageErr);
        }
      }
    } catch (err) {
      console.warn("Could not load PDF document for page previewing:", err);
    }
  };

  const closePageManager = () => {
    renderingSessionRef.current = 0;
    setManagingEntryId(null);
    setQuickExcludeInput("");
  };

  const clearAll = () => {
    setFiles([]);
    setError("");
    setStatus("Ready to upload PDF files");
    setDownloadName("");
    setCustomOutputName("");
    setMergedStats({ totalPages: 0, totalSize: 0 });
    setManagingEntryId(null);
    renderingSessionRef.current = 0;

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

  const processPdfs = async () => {
    if (files.length === 0) {
      setError("Please add at least 1 PDF file.");
      return;
    }

    if (totalKeptPages === 0) {
      setError("All pages are excluded! Please keep at least 1 page to export.");
      return;
    }

    setIsProcessing(true);
    setError("");
    const isSingle = files.length === 1;
    setStatus(isSingle ? "Processing document pages..." : "Merging PDF documents locally...");

    try {
      const mergedPdf = await PDFDocument.create();
      let totalPagesCombined = 0;

      for (let i = 0; i < files.length; i++) {
        const entry = files[i];
        setStatus(
          isSingle
            ? `Extracting selected pages from ${entry.file.name}...`
            : `Processing document ${i + 1} of ${files.length} (${entry.file.name})...`
        );

        let sourceBytes = entry.arrayBuffer;
        if (!sourceBytes) {
          sourceBytes = await entry.file.arrayBuffer();
        }

        const sourcePdf = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
        const docPageCount = sourcePdf.getPageCount();
        const pageIndicesToCopy = parsePageRanges(entry.pageRange, docPageCount);

        if (pageIndicesToCopy.length > 0) {
          const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndicesToCopy);
          copiedPages.forEach((page) => mergedPdf.addPage(page));
          totalPagesCombined += copiedPages.length;
        }
      }

      if (totalPagesCombined === 0) {
        setError("No pages selected. Please keep at least 1 page across your documents.");
        setIsProcessing(false);
        return;
      }

      setStatus("Finalizing output PDF file...");
      const mergedPdfBytes = await mergedPdf.save();
      const outputBlob = new Blob([mergedPdfBytes], { type: "application/pdf" });

      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }

      const nextUrl = URL.createObjectURL(outputBlob);
      downloadUrlRef.current = nextUrl;

      const fallbackName = isSingle ? "cleaned-document.pdf" : "merged-document.pdf";
      const finalName = (customOutputName.trim() || fallbackName).replace(/\.pdf$/i, "") + ".pdf";

      setDownloadUrl(nextUrl);
      setDownloadName(finalName);
      setMergedStats({ totalPages: totalPagesCombined, totalSize: outputBlob.size });
      setStatus(isSingle ? "PDF saved successfully!" : "PDFs merged successfully!");

      downloadPdf(nextUrl, finalName);
    } catch (mergeError) {
      setError(
        mergeError instanceof Error
          ? `Operation failed: ${mergeError.message}`
          : "Could not process PDF files. Please ensure files are not encrypted or corrupted."
      );
      setStatus("Ready to try again");
    } finally {
      setIsProcessing(false);
    }
  };

  const canProcess = files.length >= 1 && totalKeptPages > 0 && !isProcessing && !isLoadingPages;
  const currentManagingEntry = files.find((f) => f.id === managingEntryId);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8">
            {/* Header & Hero */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                PDF Merger & Page Manager
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Merge PDFs & Delete Pages
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Combine multiple PDFs or clean up single documents. Visually delete unwanted pages with one click, arrange document sequence, and export right in your browser.
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
                          Upload 1 or more PDF documents. You can delete specific pages visually and merge files seamlessly.
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
                        className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-amber-700 cursor-pointer"
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
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                          {files.length} {files.length === 1 ? "File" : "Files"}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {totalKeptPages === totalOriginalPages ? (
                            <span>{totalKeptPages} total pages • {formatBytes(totalSize)}</span>
                          ) : (
                            <span className="text-amber-700 font-bold">
                              {totalKeptPages} of {totalOriginalPages} pages kept ({totalOriginalPages - totalKeptPages} deleted)
                            </span>
                          )}
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
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-amber-700 cursor-pointer"
                        >
                          + Add More
                        </button>
                        <button
                          type="button"
                          onClick={clearAll}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* PDF Cards List */}
                    <div className="flex flex-col gap-3">
                      {files.map((entry, index) => {
                        const keptIndices = parsePageRanges(entry.pageRange, entry.pageCount);
                        const keptCount = keptIndices.length;
                        const excludedCount = entry.pageCount - keptCount;

                        return (
                          <div
                            key={entry.id}
                            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              {/* File Info with Minimal Thumbnail */}
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Sequence Number */}
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-xs font-bold text-amber-800">
                                  {index + 1}
                                </span>

                                {/* Thumbnail Trigger */}
                                <button
                                  type="button"
                                  onClick={() => openPageManager(entry.id)}
                                  title="Click to visually manage/delete pages"
                                  className="group relative flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-xs transition hover:scale-105 hover:border-amber-400 focus:outline-none cursor-pointer"
                                >
                                  {entry.thumbnailUrl ? (
                                    <>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={entry.thumbnailUrl}
                                        alt={`Preview of ${entry.file.name}`}
                                        className="h-full w-full object-cover object-top"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 opacity-0 transition group-hover:opacity-100">
                                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                                    {keptCount === entry.pageCount ? (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                                        ✓ All {entry.pageCount} pages included
                                      </span>
                                    ) : keptCount === 0 ? (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
                                        ⚠️ All pages excluded
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                                        ✂ {keptCount} of {entry.pageCount} kept ({excludedCount} deleted)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                <button
                                  type="button"
                                  onClick={() => openPageManager(entry.id)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/80 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-xs transition hover:bg-amber-100 hover:border-amber-400 cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                  </svg>
                                  Manage Pages
                                </button>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveItem(index, index - 1)}
                                    disabled={index === 0}
                                    title="Move up"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-slate-50 cursor-pointer"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveItem(index, index + 1)}
                                    disabled={index === files.length - 1}
                                    title="Move down"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-slate-50 cursor-pointer"
                                  >
                                    ▼
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeFileAtIndex(index)}
                                    title="Remove document"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Range Syntax Pill Info */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                              <span className="font-medium text-slate-500">
                                Pages to include: <code className="rounded bg-slate-100 px-1 py-0.5 font-bold text-slate-700">{entry.pageRange}</code>
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-400">Manual Edit:</span>
                                <input
                                  type="text"
                                  value={entry.pageRange}
                                  onChange={(e) => updatePageRange(index, e.target.value)}
                                  placeholder="all or 1-3, 5"
                                  className="w-24 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                          placeholder="document-output.pdf"
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
                  onClick={processPdfs}
                  disabled={!canProcess}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
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
                      {files.length <= 1
                        ? `Save Cleaned PDF (${totalKeptPages} pages)`
                        : `Merge ${files.length} PDFs (${totalKeptPages} pages)`}
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
                      <p className="font-semibold text-white">1. Add PDF Document(s)</p>
                      <p className="mt-1 text-xs text-slate-300">Upload 1 file to delete pages, or 2+ files to combine them.</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">2. Visually Delete Pages</p>
                      <p className="mt-1 text-xs text-slate-300">
                        Click &quot;Manage Pages&quot; to see thumbnails of all pages. Click any page to exclude or restore it.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">3. Save & Download</p>
                      <p className="mt-1 text-xs text-slate-300">
                        Export your cleaned or combined PDF instantly with zero server uploads.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security & Features */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Features & Privacy</p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>100% In-Browser:</strong> Documents never leave your device.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Visual Page Removal:</strong> See all pages as cards and click to delete unwanted pages.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Single & Multi File:</strong> Delete pages from 1 PDF or merge several into 1.</span>
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
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
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

      {/* Visual Page Grid Modal */}
      {currentManagingEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-5 backdrop-blur-xs"
          onClick={closePageManager}
        >
          <div
            className="relative flex w-full max-w-4xl max-h-[92vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                    Page Manager
                  </span>
                  <h3 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                    {currentManagingEntry.file.name}
                  </h3>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Click any page to toggle deletion. Excluded pages turn red and won&apos;t appear in your output.
                </p>
              </div>
              <button
                type="button"
                onClick={closePageManager}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions & Stats Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-3 sm:px-6">
              <div className="flex items-center gap-2 text-xs">
                {(() => {
                  const kept = parsePageRanges(currentManagingEntry.pageRange, currentManagingEntry.pageCount).length;
                  const excluded = currentManagingEntry.pageCount - kept;
                  return (
                    <span className="font-semibold text-slate-700">
                      Including <strong className="text-slate-900">{kept}</strong> of{" "}
                      <strong>{currentManagingEntry.pageCount}</strong> pages
                      {excluded > 0 && (
                        <span className="ml-1 text-rose-600 font-bold">
                          ({excluded} {excluded === 1 ? "page" : "pages"} deleted)
                        </span>
                      )}
                    </span>
                  );
                })()}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => includeAllPages(currentManagingEntry.id)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
                >
                  ✓ Keep All
                </button>
                <button
                  type="button"
                  onClick={() => invertSelection(currentManagingEntry.id)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
                >
                  ⚡ Invert
                </button>

                {/* Quick Exclude Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    excludeFromQuickInput(currentManagingEntry.id, quickExcludeInput);
                  }}
                  className="flex items-center gap-1"
                >
                  <input
                    type="text"
                    value={quickExcludeInput}
                    onChange={(e) => setQuickExcludeInput(e.target.value)}
                    placeholder="Delete pages: e.g. 2, 4-5"
                    className="w-36 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 focus:border-rose-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>

            {/* Scrollable Visual Pages Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: currentManagingEntry.pageCount }, (_, i) => i + 1).map((pageNum) => {
                  const isExcluded = (currentManagingEntry.excludedPages || []).includes(pageNum);
                  const thumb = currentManagingEntry.pageThumbnails?.[pageNum];

                  return (
                    <div
                      key={pageNum}
                      onClick={() => togglePageExclusion(currentManagingEntry.id, pageNum)}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all cursor-pointer ${
                        isExcluded
                          ? "border-rose-300 bg-rose-50/40 opacity-75 ring-2 ring-rose-200 hover:opacity-100"
                          : "border-slate-200 bg-white hover:border-amber-400 hover:shadow-md ring-1 ring-slate-100"
                      }`}
                    >
                      {/* Page Label & Status Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-2.5 py-1.5 text-xs">
                        <span className="font-extrabold text-slate-800">Page {pageNum}</span>
                        {isExcluded ? (
                          <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[10px] font-black uppercase tracking-wider text-rose-700">
                            Deleted
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                            Included
                          </span>
                        )}
                      </div>

                      {/* Thumbnail Container */}
                      <div className="relative flex aspect-[1/1.3] w-full items-center justify-center bg-slate-100/70 p-2 overflow-hidden">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={`Page ${pageNum}`}
                            className={`h-full w-full rounded object-contain transition ${
                              isExcluded ? "filter grayscale brightness-75 contrast-75" : ""
                            }`}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 p-2 text-center">
                            <svg className="h-6 w-6 animate-pulse text-amber-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-[10px] font-medium text-slate-500">Rendering preview...</span>
                          </div>
                        )}

                        {/* Excluded Visual Cross Overlay */}
                        {isExcluded && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/35 backdrop-blur-[1px]">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white shadow-md">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <span className="mt-1 text-[11px] font-black tracking-wider text-white drop-shadow">
                              DELETED
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePageExclusion(currentManagingEntry.id, pageNum);
                        }}
                        className={`flex w-full items-center justify-center gap-1.5 border-t py-1.5 text-xs font-bold transition cursor-pointer ${
                          isExcluded
                            ? "border-rose-200 bg-rose-100 text-rose-800 hover:bg-rose-200"
                            : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                        }`}
                      >
                        {isExcluded ? (
                          <>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Restore
                          </>
                        ) : (
                          <>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Page
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-3.5 sm:px-6">
              <span className="text-xs text-slate-500 hidden sm:inline">
                All page deletions update your document instantly.
              </span>
              <button
                type="button"
                onClick={closePageManager}
                className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:from-orange-600 hover:to-amber-600 cursor-pointer"
              >
                Done / Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

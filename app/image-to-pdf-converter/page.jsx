"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

const PAPER_SIZES = {
  A4: {
    label: "A4",
    portrait: [595.28, 841.89],
    landscape: [841.89, 595.28],
  },
  Letter: {
    label: "Letter",
    portrait: [612, 792],
    landscape: [792, 612],
  },
};

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
  return String(fileName || "images").replace(/\.[^.]+$/, "");
}

function getPdfName(files) {
  if (!files.length) return "images-to-pdf.pdf";
  if (files.length === 1) return `${getBaseName(files[0].file.name)}.pdf`;
  return `${getBaseName(files[0].file.name)}-collection.pdf`;
}

function isSupportedImage(file) {
  return Boolean(file?.type?.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file?.name || ""));
}

function revokeEntryUrls(entries) {
  entries.forEach((entry) => {
    if (entry?.previewUrl) {
      URL.revokeObjectURL(entry.previewUrl);
    }
  });
}

async function loadImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = url;
  });
}

async function convertImageToPngBytes(url) {
  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Could not load image"));
    element.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  context.drawImage(image, 0, 0);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (!nextBlob) {
        reject(new Error("Could not convert image"));
        return;
      }
      resolve(nextBlob);
    }, "image/png");
  });

  return new Uint8Array(await blob.arrayBuffer());
}

function getPageDimensions(paperSize, orientation) {
  const size = PAPER_SIZES[paperSize] || PAPER_SIZES.A4;
  return orientation === "landscape" ? size.landscape : size.portrait;
}

export default function ImageToPdfConverter() {
  const fileInputRef = useRef(null);
  const downloadUrlRef = useRef("");
  const fileEntriesRef = useRef([]);

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [paperSize, setPaperSize] = useState("A4");
  const [status, setStatus] = useState("Ready to upload images");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    fileEntriesRef.current = files;
  }, [files]);

  useEffect(() => {
    downloadUrlRef.current = downloadUrl;
  }, [downloadUrl]);

  useEffect(() => {
    return () => {
      revokeEntryUrls(fileEntriesRef.current);
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }
    };
  }, []);

  const totalSize = useMemo(() => files.reduce((sum, entry) => sum + (entry.file.size || 0), 0), [files]);
  const canGenerate = files.length > 0 && !isProcessing;

  const setSelectedFiles = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles || []).filter(isSupportedImage);

    if (validFiles.length === 0) {
      setError("Please select one or more image files.");
      return;
    }

    revokeEntryUrls(fileEntriesRef.current);

    const nextEntries = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFiles(nextEntries);
    setError("");
    setStatus(`${nextEntries.length} image${nextEntries.length === 1 ? "" : "s"} ready`);
    setDownloadName("");
    setPageCount(0);

    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = "";
      setDownloadUrl("");
    }
  };

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    setSelectedFiles(event.dataTransfer.files);
  };

  const removeFileAtIndex = (index) => {
    setFiles((currentFiles) => {
      const nextFiles = [...currentFiles];
      const [removed] = nextFiles.splice(index, 1);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return nextFiles;
    });
  };

  const clearAll = () => {
    revokeEntryUrls(fileEntriesRef.current);
    fileEntriesRef.current = [];
    setFiles([]);
    setError("");
    setStatus("Ready to upload images");
    setDownloadName("");
    setPageCount(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

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
    anchor.download = nameToDownload;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const generatePdf = async () => {
    if (!files.length) {
      setError("Please upload at least one image first.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setStatus("Building PDF...");

    try {
      const pdfDoc = await PDFDocument.create();

      for (const entry of files) {
        const { file, previewUrl } = entry;
        const { width, height } = await loadImageDimensions(previewUrl);
        const orientation = width >= height ? "landscape" : "portrait";
        const [pageWidth, pageHeight] = getPageDimensions(paperSize, orientation);
        const margin = 36;
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        let image;
        const lowerType = String(file.type || "").toLowerCase();
        const fileName = String(file.name || "").toLowerCase();
        const isJpeg = lowerType.includes("jpeg") || lowerType.includes("jpg") || /\.jpe?g$/i.test(fileName);
        const isPng = lowerType.includes("png") || /\.png$/i.test(fileName);

        if (isJpeg) {
          image = await pdfDoc.embedJpg(await file.arrayBuffer());
        } else if (isPng) {
          image = await pdfDoc.embedPng(await file.arrayBuffer());
        } else {
          const pngBytes = await convertImageToPngBytes(previewUrl);
          image = await pdfDoc.embedPng(pngBytes);
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const scale = Math.min(availableWidth / image.width, availableHeight / image.height, 1);
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;
        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const nextUrl = URL.createObjectURL(blob);
      const nextName = getPdfName(files);

      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }

      downloadUrlRef.current = nextUrl;
      setDownloadUrl(nextUrl);
      setDownloadName(nextName);
      setPageCount(files.length);
      setStatus("PDF ready for download");

      downloadPdf(nextUrl, nextName);
    } catch (pdfError) {
      setError(pdfError instanceof Error ? pdfError.message : "Could not create the PDF.");
      setStatus("Ready to try again");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8">
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">Image to PDF Converter</h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Upload one image or many, arrange them into a PDF, and download the result instantly with a clean, polished flow.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
              <div className="flex flex-col gap-6">
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
                  className={`rounded-3xl border-2 border-dashed p-5 transition sm:p-6 ${
                    isDragging ? "border-orange-400 bg-orange-50/80" : "border-slate-200 bg-slate-50/70"
                  }`}
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                          <linearGradient id="image-pdf-gradient" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#fb923c" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                        <path d="M7 3.75h7.25L18.75 8.5v11a1.75 1.75 0 0 1-1.75 1.75H7A1.75 1.75 0 0 1 5.25 19.5V5.5A1.75 1.75 0 0 1 7 3.75Z" fill="url(#image-pdf-gradient)" />
                        <path d="M14.25 3.75V8.1c0 .69.56 1.25 1.25 1.25h3.25" stroke="rgba(255,255,255,0.78)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="8" y="11" width="8" height="5.75" rx="1.25" stroke="#fff" strokeWidth="1.5" />
                        <circle cx="10.25" cy="13" r="0.75" fill="#fff" />
                        <path d="M9 16.25l1.7-1.8 1.35 1.3 1.35-1.65 1.6 2.15" stroke="#fff" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="text-base font-bold text-slate-900">Drop your images here</p>
                      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-500 break-words">
                        Or browse your device. Supports multiple images at once, including JPG, PNG, WebP, GIF, and BMP.
                      </p>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" d="M12 4v16m8-8H4" />
                      </svg>
                      Choose images
                    </button>

                    {files.length > 0 && (
                      <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left shadow-sm">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{files.length} selected image{files.length === 1 ? "" : "s"}</p>
                            <p className="text-xs text-slate-500">Total size: {formatBytes(totalSize)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={clearAll}
                            className="text-xs font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
                          >
                            Clear all
                          </button>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {files.map((entry, index) => (
                            <div key={`${entry.file.name}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                              <div className="aspect-[4/3] bg-slate-100">
                                <img src={entry.previewUrl} alt={entry.file.name} className="h-full w-full object-cover" />
                              </div>
                              <div className="flex items-start justify-between gap-3 p-3">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-slate-900">{entry.file.name}</p>
                                  <p className="mt-1 text-xs text-slate-500">{formatBytes(entry.file.size)}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFileAtIndex(index)}
                                  className="text-xs font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">PDF settings</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 break-words">
                        Pick a standard paper size. Each image gets its own page and is automatically fit to the page.
                      </p>
                    </div>
                    <div className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs font-bold text-white">
                      {PAPER_SIZES[paperSize].label}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {Object.entries(PAPER_SIZES).map(([value, paper]) => {
                      const active = paperSize === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setPaperSize(value)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-orange-300 bg-white shadow-md"
                              : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white">
                              {paper.label}
                            </span>
                            {active && <span className="text-xs font-bold text-orange-600">Selected</span>}
                          </div>
                          <p className="mt-3 break-words text-sm font-semibold leading-relaxed text-slate-900">
                            Clean standard sizing for prints and sharing.
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-relaxed text-rose-900 break-words">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={generatePdf}
                  disabled={!canGenerate}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 12h16M12 4v16" />
                      </svg>
                      Generate PDF
                    </>
                  )}
                </button>

                <p className="text-center text-xs font-medium text-slate-500 break-words">{status}</p>
              </div>

              <aside className="flex min-w-0 flex-col gap-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">What this tool does</p>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">1. Upload images</p>
                      <p className="mt-1 break-words text-slate-300">Select one image or multiple images from your device.</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">2. Generate PDF</p>
                      <p className="mt-1 break-words text-slate-300">Each image becomes its own page and is scaled to fit cleanly.</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">3. Download instantly</p>
                      <p className="mt-1 break-words text-slate-300">The PDF downloads immediately and is also available for re-download.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Quick notes</p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                    <li className="break-words">• Supports multiple images and keeps their order in the final PDF.</li>
                    <li className="break-words">• Good for receipts, scans, screenshots, and photo sets.</li>
                    <li className="break-words">• Each image is centered and fit to the selected paper size.</li>
                    <li className="break-words">• Use the file cards to remove individual images before generating.</li>
                  </ul>

                  {downloadName && (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 break-words">
                      Latest output: <span className="font-bold">{downloadName}</span>
                    </div>
                  )}

                  {pageCount > 0 && (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 break-words">
                      Generated pages: <span className="font-bold text-slate-900">{pageCount}</span>
                    </div>
                  )}

                  {downloadUrl && (
                    <button
                      type="button"
                      onClick={() => downloadPdf(downloadUrl, downloadName)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Download again
                    </button>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
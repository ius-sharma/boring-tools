"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const PAPER_SIZES = {
  A4: {
    label: "A4",
    description: "Best for standard documents and sharing.",
  },
  Letter: {
    label: "Letter",
    description: "Best for US-style document layouts.",
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

function isSupportedDocument(file) {
  if (!file) return false;

  const lowerName = String(file.name || "").toLowerCase();
  const lowerType = String(file.type || "").toLowerCase();
  return lowerName.endsWith(".doc") || lowerName.endsWith(".docx") || lowerType.includes("msword") || lowerType.includes("officedocument.wordprocessingml.document");
}

function getPdfName(fileName) {
  return `${String(fileName || "document").replace(/\.[^.]+$/, "") || "document"}.pdf`;
}

export default function DocToPdfConverter() {
  const fileInputRef = useRef(null);
  const downloadUrlRef = useRef("");
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [paperSize, setPaperSize] = useState("A4");
  const [status, setStatus] = useState("Ready to upload a document");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [outputSize, setOutputSize] = useState(0);

  useEffect(() => {
    fileRef.current = file;
  }, [file]);

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

  const canConvert = Boolean(file && !isProcessing);
  const fileSize = useMemo(() => file?.size || 0, [file]);

  const clearSelection = () => {
    setFile(null);
    setError("");
    setStatus("Ready to upload a document");
    setDownloadName("");
    setOutputSize(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = "";
      setDownloadUrl("");
    }
  };

  const setSelectedFile = (selectedFile) => {
    const nextFile = selectedFile instanceof File ? selectedFile : selectedFile?.[0];

    if (!nextFile || !isSupportedDocument(nextFile)) {
      setError("Please select a DOC or DOCX file.");
      return;
    }

    setFile(nextFile);
    setError("");
    setStatus(`${nextFile.name} ready for conversion`);
    setDownloadName("");
    setOutputSize(0);

    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = "";
      setDownloadUrl("");
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    setSelectedFile(event.dataTransfer.files?.[0]);
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

  const downloadLatestPdf = () => {
    if (!downloadUrl || !downloadName) return;
    downloadPdf(downloadUrl, downloadName);
  };

  const convertDocument = async () => {
    if (!file) {
      setError("Please upload a DOC or DOCX file first.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setStatus("Converting document to PDF...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("paperSize", paperSize);

      const response = await fetch("/api/doc-to-pdf-converter", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Could not convert the document.";
        try {
          const data = await response.json();
          if (data?.error) {
            message = data.error;
          }
        } catch {}

        throw new Error(message);
      }

      const blob = await response.blob();
      const nextUrl = URL.createObjectURL(blob);
      const nextName = getPdfName(file.name);

      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }

      downloadUrlRef.current = nextUrl;
      setDownloadUrl(nextUrl);
      setDownloadName(nextName);
      setOutputSize(blob.size);
      setStatus("PDF ready for download");

      downloadPdf(nextUrl, nextName);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Could not convert the document.");
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
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">DOC to PDF Converter</h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Upload a DOC or DOCX file and convert it to a PDF while preserving formatting, layout, tables, images, and structure as closely as possible.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
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
                          <linearGradient id="doc-pdf-gradient" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#fb923c" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                        <path d="M7 3.75h7.25L18.75 8.5v11a1.75 1.75 0 0 1-1.75 1.75H7A1.75 1.75 0 0 1 5.25 19.5V5.5A1.75 1.75 0 0 1 7 3.75Z" fill="url(#doc-pdf-gradient)" />
                        <path d="M14.25 3.75V8.1c0 .69.56 1.25 1.25 1.25h3.25" stroke="rgba(255,255,255,0.78)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8.25 12.25h7.5M8.25 14.75h7.5M8.25 17.25h5.25" stroke="#fff" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="text-base font-bold text-slate-900">Drop your DOC or DOCX here</p>
                      <p className="mx-auto mt-1 max-w-md break-words text-sm leading-relaxed text-slate-500">
                        Or browse your device. The converter supports Word documents and returns a downloadable PDF right away.
                      </p>
                    </div>

                    <input ref={fileInputRef} type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleFileChange} />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" d="M12 4v16m8-8H4" />
                      </svg>
                      Choose document
                    </button>

                    {file && (
                      <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left shadow-sm">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{file.name}</p>
                            <p className="text-xs text-slate-500">{formatBytes(fileSize)} • {file.type || "Unknown type"}</p>
                          </div>
                          <button
                            type="button"
                            onClick={clearSelection}
                            className="text-xs font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
                          >
                            Clear file
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">PDF settings</p>
                      <p className="mt-1 break-words text-sm leading-relaxed text-slate-600">
                        Conversion is handled by a native document engine for high-fidelity output, so original pagination and styling are retained.
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
                          className={`rounded-2xl border p-4 text-left transition ${active ? "border-orange-300 bg-white shadow-md" : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white"}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white">{paper.label}</span>
                            {active && <span className="text-xs font-bold text-orange-600">Selected</span>}
                          </div>
                          <p className="mt-3 break-words text-sm font-semibold leading-relaxed text-slate-900">{paper.description}</p>
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
                  onClick={convertDocument}
                  disabled={!canConvert}
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
                      Convert to PDF
                    </>
                  )}
                </button>

                <p className="text-center text-xs font-medium text-slate-500 break-words">{status}</p>

                {downloadUrl && downloadName && !isProcessing && (
                  <button
                    type="button"
                    onClick={downloadLatestPdf}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-900 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" d="M4 16.5V19a2 2 0 002 2h12a2 2 0 002-2v-2.5M12 3v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Download latest PDF
                  </button>
                )}
              </div>

              <aside className="flex min-w-0 flex-col gap-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">What this tool does</p>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">1. Upload document</p>
                      <p className="mt-1 break-words text-slate-300">Select a DOC or DOCX file from your device.</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">2. Convert to PDF</p>
                      <p className="mt-1 break-words text-slate-300">The converter uses a native Office conversion pipeline to preserve the original structure and styling.</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                      <p className="font-semibold text-white">3. Download instantly</p>
                      <p className="mt-1 break-words text-slate-300">The PDF downloads right away and is also available for re-download.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Quick notes</p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                    <li className="break-words">• Supports both DOC and DOCX uploads.</li>
                    <li className="break-words">• Great for reports, notes, letters, and simple document layouts.</li>
                    <li className="break-words">• Text is wrapped automatically so the PDF stays readable on every page.</li>
                    <li className="break-words">• The latest PDF output is available for quick re-download.</li>
                  </ul>

                  {downloadName && (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 break-words">
                      Latest output: <span className="font-bold">{downloadName}</span>
                    </div>
                  )}

                  {outputSize > 0 && (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 break-words">
                      File size: <span className="font-bold text-slate-900">{formatBytes(outputSize)}</span>
                    </div>
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
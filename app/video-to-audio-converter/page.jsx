"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ComingSoon from "@/app/components/ComingSoon";

const FORMAT_OPTIONS = [
  {
    id: "mp3",
    label: "MP3",
    description: "Best compatibility for phones, players, and sharing.",
    accent: "from-orange-500 to-amber-500",
  },
  {
    id: "m4a",
    label: "M4A",
    description: "Compact and clean output with strong iPhone support.",
    accent: "from-sky-500 to-cyan-500",
  },
  {
    id: "wav",
    label: "WAV",
    description: "Lossless output for editing and archival use.",
    accent: "from-slate-700 to-slate-900",
  },
  {
    id: "flac",
    label: "FLAC",
    description: "Lossless compression for high-fidelity audio.",
    accent: "from-emerald-500 to-teal-500",
  },
];

const BITRATE_OPTIONS = ["96", "128", "160", "192", "256", "320"];

function formatBytes(bytes) {
  if (!bytes || Number.isNaN(bytes)) return "Unknown size";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getBaseName(fileName) {
  return String(fileName || "download").replace(/\.[^.]+$/, "");
}

function getSafeFilename(fileName, outputFormat) {
  const base = getBaseName(fileName)
    .replace(/[<>:\"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, " ")
    .trim() || "download";

  return `${base}.${outputFormat}`;
}

function parseDownloadName(contentDisposition, fallbackName) {
  if (!contentDisposition) return fallbackName;

  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (!match) return fallbackName;

  return match[1];
}

export default function VideoToAudioConverter() {
  const ENABLED = false; // feature flag: set true to re-enable the full tool
  if (!ENABLED) return <ComingSoon toolName="Video to Audio Converter" />;
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState("extract");
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [bitrate, setBitrate] = useState("192");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [statusLabel, setStatusLabel] = useState("Ready to upload");
  const [downloadName, setDownloadName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const fileInputRef = useRef(null);

  const selectedFormatMeta = useMemo(
    () => FORMAT_OPTIONS.find((option) => option.id === outputFormat) || FORMAT_OPTIONS[0],
    [outputFormat]
  );

  const isLossless = outputFormat === "wav" || outputFormat === "flac";

  useEffect(() => {
    if (isLossless) {
      setBitrate("192");
    }
  }, [isLossless]);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        window.URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setError("");
    setStatusLabel("File loaded and ready");
    setDownloadName(getSafeFilename(file.name, outputFormat));
    setActiveTab("extract");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedFile) {
      setError("Please choose a video file first.");
      return;
    }

    setProcessing(true);
    setStatusLabel("Uploading and extracting audio...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("format", outputFormat);
      formData.append("bitrate", bitrate);

      const response = await fetch("/api/video-to-audio-converter", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Conversion failed";
        try {
          const data = await response.json();
          message = data.error || message;
        } catch {
          message = `Conversion failed (HTTP ${response.status})`;
        }
        throw new Error(message);
      }

      setStatusLabel("Creating your download...");
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition");
      const finalName = parseDownloadName(
        disposition,
        getSafeFilename(selectedFile.name, outputFormat)
      );

      if (downloadUrl) {
        window.URL.revokeObjectURL(downloadUrl);
      }

      const blobUrl = window.URL.createObjectURL(blob);
      setDownloadUrl(blobUrl);
      setDownloadName(finalName);
      setStatusLabel("Audio extracted and ready to download");
      setActiveTab("download");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatusLabel("Ready to try again");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !downloadName) return;

    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleReset = () => {
    setError("");
    setStatusLabel("Ready to upload");
    setActiveTab("extract");
    if (downloadUrl) {
      window.URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl("");
    setDownloadName("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
          <div className="flex min-w-0 flex-col gap-8">
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Video to Audio Converter
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Upload a video, extract only the audio, and download it in the format you actually want.
                Clean, fast, and consistent with the rest of the BoringTools suite.
              </p>
            </div>

            <div className="min-w-0 rounded-3xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1 shadow-inner shadow-slate-200/70">
                <button
                  type="button"
                  onClick={() => setActiveTab("extract")}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                    activeTab === "extract"
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Extract
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("download")}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                    activeTab === "download"
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Download
                </button>
              </div>

              <div className="mt-4 min-w-0">
                {activeTab === "extract" ? (
                  <div className="grid min-w-0 gap-6 lg:grid-cols-[1.3fr_0.9fr]">
                    <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-6">
                      <div
                        onDragEnter={() => setDragActive(true)}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        className={`min-w-0 rounded-3xl border-2 border-dashed p-5 transition sm:p-6 ${
                          dragActive
                            ? "border-orange-400 bg-orange-50/80"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex min-w-0 flex-col items-center gap-4 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <defs>
                                <linearGradient id="audio-file-gradient" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                                  <stop offset="0%" stopColor="#fb923c" />
                                  <stop offset="100%" stopColor="#f59e0b" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M7 3.75h6.25L18.75 9v10.25A1.75 1.75 0 0 1 17 21H7A1.75 1.75 0 0 1 5.25 19.25V5.5A1.75 1.75 0 0 1 7 3.75Z"
                                fill="url(#audio-file-gradient)"
                              />
                              <path
                                d="M13.25 3.75V8.1c0 .69.56 1.25 1.25 1.25h4.2"
                                stroke="rgba(255,255,255,0.78)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9 12.25v3.5m3-5v7m3-4v1.5"
                                stroke="#fff"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8.25 16.75h7.5"
                                stroke="rgba(255,255,255,0.7)"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>

                          <div className="min-w-0">
                            <p className="text-base font-bold text-slate-900">Drop your video here</p>
                            <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-500 break-words">
                              Or browse your device. Supports common video files like MP4, MOV, MKV, and WEBM.
                            </p>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*,audio/*"
                            className="hidden"
                            onChange={(event) => handleFile(event.target.files?.[0])}
                          />

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" d="M12 4v16m8-8H4" />
                            </svg>
                            Choose a file
                          </button>

                          {selectedFile && (
                            <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left shadow-sm">
                              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 flex-1">
                                  <p className="break-words text-sm font-bold text-slate-900">{selectedFile.name}</p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {selectedFile.type || "Unknown type"} • {formatBytes(selectedFile.size)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFile(null);
                                    setDownloadName("");
                                    setStatusLabel("Ready to upload");
                                  }}
                                  className="self-start text-xs font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Output format</p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600 break-words">Pick the balance of compatibility, size, or fidelity.</p>
                          </div>
                          <div className={`self-start rounded-full bg-gradient-to-r px-4 py-2 text-xs font-bold text-white ${selectedFormatMeta.accent}`}>
                            {selectedFormatMeta.label}
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {FORMAT_OPTIONS.map((option) => {
                            const active = outputFormat === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setOutputFormat(option.id)}
                                className={`rounded-2xl border p-4 text-left transition ${
                                  active
                                    ? "border-orange-300 bg-white shadow-md"
                                    : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className={`rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-bold text-white ${option.accent}`}>
                                    {option.label}
                                  </span>
                                  {active && <span className="text-xs font-bold text-orange-600">Selected</span>}
                                </div>
                                <p className="mt-3 break-words text-sm font-semibold leading-relaxed text-slate-900">{option.description}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Audio quality</p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600 break-words">
                              {isLossless ? "Quality is lossless for this format." : "Higher bitrate gives better output but larger files."}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {BITRATE_OPTIONS.map((option) => {
                            const active = bitrate === option;
                            const disabled = isLossless;
                            return (
                              <button
                                key={option}
                                type="button"
                                disabled={disabled}
                                onClick={() => setBitrate(option)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                  active
                                    ? "bg-slate-900 text-white shadow"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
                              >
                                {option} kbps
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
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {processing ? (
                          <>
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                              <path
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                fill="currentColor"
                                className="opacity-75"
                              />
                            </svg>
                            {statusLabel}
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 12h16M12 4v16" />
                            </svg>
                            Extract audio
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs font-medium text-slate-500 break-words">{statusLabel}</p>
                    </form>

                    <aside className="flex min-w-0 flex-col gap-4">
                      <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">What this tool does</p>
                        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
                          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                            <p className="font-semibold text-white">1. Upload a video</p>
                            <p className="mt-1 break-words text-slate-300">Pick a local file or drop it into the upload area.</p>
                          </div>
                          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                            <p className="font-semibold text-white">2. Choose your format</p>
                            <p className="mt-1 break-words text-slate-300">Select MP3, M4A, WAV, or FLAC and set the bitrate when applicable.</p>
                          </div>
                          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                            <p className="font-semibold text-white">3. Switch to Download</p>
                            <p className="mt-1 break-words text-slate-300">After extraction, the second tab appears with your ready-to-download file.</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Quick notes</p>
                        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                          <li className="break-words">• Best used locally for large files or frequent conversions.</li>
                          <li className="break-words">• Keeps the experience simple: one extract step, one download step, no clutter.</li>
                          <li className="break-words">• Works with common video formats and existing audio files too.</li>
                          <li className="break-words">• Lossless formats ignore bitrate controls because quality is preserved.</li>
                        </ul>
                      </div>
                    </aside>
                  </div>
                ) : (
                  <div className="grid min-w-0 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Download ready</p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 break-words">
                            Your extracted audio is ready. Download it from here or go back to adjust the source settings.
                          </p>
                        </div>
                        <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          Ready
                        </div>
                      </div>

                      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">File</p>
                        <p className="mt-2 break-words text-base font-semibold text-slate-900">
                          {downloadName || "No audio has been extracted yet."}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500 break-words">
                          {selectedFile
                            ? `${selectedFile.name} converted to ${selectedFormatMeta.label}.`
                            : "Upload a file in the Extract tab to generate a download."}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleDownload}
                          disabled={!downloadUrl}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download audio
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("extract")}
                          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          Back to extract
                        </button>
                      </div>

                      <p className="mt-4 text-xs text-slate-500 break-words">
                        Tip: if you want a different format or bitrate, return to Extract and run it again.
                      </p>
                    </div>

                    <div className="flex min-w-0 flex-col gap-4">
                      <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">What this tab is for</p>
                        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
                          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                            <p className="font-semibold text-white">Review the result</p>
                            <p className="mt-1 break-words text-slate-300">Check the generated filename and confirm the output format.</p>
                          </div>
                          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                            <p className="font-semibold text-white">Download when ready</p>
                            <p className="mt-1 break-words text-slate-300">Use the download button only after the audio has been extracted.</p>
                          </div>
                          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                            <p className="font-semibold text-white">Go back anytime</p>
                            <p className="mt-1 break-words text-slate-300">Switch back to Extract if you want to try another file or format.</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Quick notes</p>
                        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                          <li className="break-words">• The file stays in memory only for this browser session.</li>
                          <li className="break-words">• Switch back to Extract if you want a different output format.</li>
                          <li className="break-words">• If nothing appears here, run Extract first.</li>
                        </ul>
                        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 break-words">
                          Latest output: <span className="font-bold">{downloadName || "No file yet"}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
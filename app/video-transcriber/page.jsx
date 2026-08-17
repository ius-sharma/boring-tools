"use client";

import { useState, useRef } from "react";

export default function VideoTranscriber() {
  const [activeTab, setActiveTab] = useState("url"); // 'url' | 'file'
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleTranscribe = async (e) => {
    e.preventDefault();
    setError("");
    setTranscript("");
    setVideoTitle("");
    setSourceType("");

    if (activeTab === "url") {
      if (!url.trim()) {
        setError("Please enter a valid video URL");
        return;
      }

      setLoading(true);
      setStatusMessage("Extracting transcript / processing audio...");

      try {
        const response = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim() }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to transcribe video");
        }

        setTranscript(data.transcript);
        setVideoTitle(data.title || "Video Transcript");
        setSourceType(data.source || "online");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setStatusMessage("");
      }
    } else {
      // File Upload Mode
      if (!selectedFile) {
        setError("Please select an audio or video file first.");
        return;
      }

      if (selectedFile.size > 25 * 1024 * 1024) {
        setError("File is larger than 25MB limit. Please choose a smaller file.");
        return;
      }

      setLoading(true);
      setStatusMessage("Uploading and transcribing with Whisper AI...");

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to transcribe audio file");
        }

        setTranscript(data.transcript);
        setVideoTitle(data.title || selectedFile.name);
        setSourceType("file-upload");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setStatusMessage("");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:text/plain;charset=utf-8,${encodeURIComponent(transcript)}`
    );
    const sanitizedTitle = (videoTitle || "transcript").replace(/[^a-zA-Z0-9_-]/g, "_");
    element.setAttribute("download", `${sanitizedTitle}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getSourceLabel = (src) => {
    switch (src) {
      case "youtube-captions":
        return "YouTube (Instant Captions)";
      case "youtube-audio":
        return "YouTube (Whisper AI)";
      case "instagram":
        return "Instagram (Whisper AI)";
      case "file-upload":
        return "Direct Audio/Video Upload";
      default:
        return "Transcribed Content";
    }
  };

  const wordCount = transcript ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = transcript ? transcript.length : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-3xl border border-slate-200 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Video Transcriber</h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Extract high-accuracy transcripts from YouTube, Instagram Reels, or direct audio/video files.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab("url");
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "url"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🔗 Video URL (YouTube / Reels)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("file");
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "file"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            📁 Upload File (Audio/Video)
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTranscribe} className="flex flex-col gap-4">
          {activeTab === "url" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
              <label htmlFor="url" className="text-sm font-semibold text-slate-900">
                Video URL
              </label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube, Shorts, or Instagram video URL..."
                className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="text-xs text-slate-500">
                Supports: YouTube standard videos, YouTube Shorts, youtu.be links, Instagram Reels, & Video Posts
              </p>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.webm,.ogg,.flac,.aac"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl">
                🎙️
              </div>
              {selectedFile ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-900">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-800">
                    Click to browse or drag & drop audio/video file here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports MP3, WAV, M4A, MP4, WEBM, AAC (Up to 25MB)
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="border border-slate-900 bg-slate-900 text-white rounded-lg px-4 py-3 font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{statusMessage || "Transcribing..."}</span>
              </>
            ) : (
              "Transcribe Video"
            )}
          </button>
        </form>

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 flex flex-col gap-1">
            <span className="font-semibold">⚠️ Transcription Issue</span>
            <span>{error}</span>
          </div>
        )}

        {/* Transcript Output */}
        {transcript && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-700">
                    {getSourceLabel(sourceType)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 mt-1">{videoTitle}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} chars</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3.5 max-h-96 overflow-y-auto">
              <p className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
                {transcript}
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 border border-slate-900 text-slate-900 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-slate-900 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                {copied ? "✓ Copied!" : "📋 Copy Transcript"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 border border-slate-900 text-slate-900 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-slate-900 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                📥 Download .TXT
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            How it works & Tips
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
            <li>• <strong>YouTube Videos & Shorts</strong>: Fetches instant captions or uses Groq Whisper AI.</li>
            <li>• <strong>Instagram Reels & Videos</strong>: Transcribes spoken speech accurately.</li>
            <li>• <strong>Upload Mode</strong>: Upload any audio or video file directly if YouTube restricts cloud access.</li>
            <li>• Powered by Whisper AI & High-Speed Audio Extractors.</li>
          </ul>
        </div>
      </div>

      <style jsx global>{`
        html {
          font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif;
        }
      `}</style>
    </div>
  );
}



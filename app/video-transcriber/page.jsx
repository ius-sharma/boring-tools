"use client";

import { useState } from "react";

export default function VideoTranscriber() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTranscribe = async (e) => {
    e.preventDefault();
    setError("");
    setTranscript("");
    setVideoTitle("");

    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);

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
      setVideoTitle(data.title || "Video");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
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
    element.setAttribute("download", `${videoTitle}-transcript.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-3xl border border-neutral-200 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Video Transcriber</h1>
          <p className="text-neutral-500 text-base">Extract captions from YouTube and Instagram videos instantly.</p>
        </div>

        <form onSubmit={handleTranscribe} className="flex flex-col gap-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-3">
            <label htmlFor="url" className="text-sm font-semibold text-neutral-900">
              Video URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube, Shorts, or Instagram video URL here..."
              className="border border-neutral-300 rounded-lg p-3 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <p className="text-xs text-neutral-500">Supports: YouTube videos, YouTube Shorts, Instagram Reels, and video posts</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="border border-neutral-900 text-neutral-900 rounded-lg px-4 py-3 font-semibold hover:bg-neutral-900 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Transcribing..." : "Transcribe"}
          </button>
        </form>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            {error}
          </div>
        )}

        {transcript && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-neutral-500">Transcript</p>
                <p className="text-sm font-semibold text-neutral-900">{videoTitle}</p>
              </div>
              <span className="text-xs text-neutral-500">{transcript.split(" ").length} words</span>
            </div>

            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-3 max-h-96 overflow-y-auto">
              <p className="text-sm text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap leading-relaxed">{transcript}</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 border border-neutral-900 text-neutral-900 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-neutral-900 hover:text-white transition"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 border border-neutral-900 text-neutral-900 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-neutral-900 hover:text-white transition"
              >
                Download
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">How it works</p>
          <ul className="mt-2 space-y-1 text-xs text-neutral-600">
            <li>• YouTube videos, Shorts, and short links (youtu.be)</li>
            <li>• Instagram Reels and video posts</li>
            <li>• YouTube: Uses official captions if available</li>
            <li>• Instagram: AI transcription (requires setup)</li>
            <li>• Results stored locally, never uploaded</li>
            <li>• Copy or download your transcript instantly</li>
          </ul>
        </div>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}

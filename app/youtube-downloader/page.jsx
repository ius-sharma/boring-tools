"use client";

import { useState } from "react";

export default function YouTubeDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFetchInfo = async (e) => {
    e.preventDefault();
    setError("");
    setVideoInfo(null);

    if (!url.trim()) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/youtube-downloader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), action: "getInfo" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch video information");
      }

      setVideoInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (itag, quality) => {
    if (!videoInfo) return;

    setDownloadingFormat(itag);
    setError("");

    try {
      const params = new URLSearchParams({ url: url.trim(), itag });
      const downloadUrl = `/api/youtube-downloader?${params.toString()}`;

      // Use fetch to check if download is available before triggering
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        // Try to parse error JSON
        try {
          const errData = await response.json();
          throw new Error(errData.error || "Download failed");
        } catch (jsonErr) {
          if (jsonErr.message && jsonErr.message !== "Download failed") {
            throw jsonErr;
          }
          throw new Error(`Download failed (HTTP ${response.status})`);
        }
      }

      // Download is available - create blob and trigger download
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${videoInfo.title}-${quality}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingFormat(null);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || Number.isNaN(bytes)) return "Unknown size";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }

    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const handleCopyInfo = () => {
    if (!videoInfo) return;
    const info = `${videoInfo.title}\n\nChannel: ${videoInfo.channelName}\nDuration: ${Math.floor(videoInfo.duration / 60)} minutes\n\n${videoInfo.description}`;
    navigator.clipboard.writeText(info);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadThumbnail = async () => {
    if (!videoInfo?.thumbnail) return;
    
    try {
      const response = await fetch(videoInfo.thumbnail);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${videoInfo.title}-thumbnail.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download thumbnail");
    }
  };

  const handleOpenOnYouTube = () => {
    if (!videoInfo?.videoId) return;
    try {
      window.open(`https://youtu.be/${videoInfo.videoId}`, "_blank");
    } catch (_) {
      setError("Unable to open YouTube link");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-3xl border border-slate-200 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">YouTube Downloader</h1>
          <p className="text-slate-500 text-base">Get video information, captions, thumbnails, and available formats.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleFetchInfo} className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
            <label htmlFor="url" className="text-sm font-semibold text-slate-900">
              YouTube URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <p className="text-xs text-slate-500">Supports: Full YouTube links, short links (youtu.be), and embedded URLs</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="border border-slate-900 text-slate-900 rounded-lg px-4 py-3 font-semibold hover:bg-slate-900 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Fetching..." : "Get Video Info"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            {error}
          </div>
        )}

        {/* Video Info */}
        {videoInfo && (
          <div className="flex flex-col gap-4">
            {/* Thumbnail */}
            {videoInfo.thumbnail && (
              <div className="rounded-lg overflow-hidden border border-slate-200 relative group">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full h-auto object-cover"
                />
                <button
                  onClick={handleDownloadThumbnail}
                  className="absolute top-3 right-3 bg-slate-900 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition shadow-lg"
                  title="Download thumbnail"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            )}

            {/* Title & Channel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-2">
              <h2 className="text-lg font-bold text-slate-900 line-clamp-2">{videoInfo.title}</h2>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>by <strong>{videoInfo.channelName}</strong></span>
                <span>{Math.floor(videoInfo.duration / 60)} min</span>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</p>
              <p className="text-sm text-slate-700 line-clamp-4 whitespace-pre-wrap">{videoInfo.description || "No description"}</p>
            </div>

            {/* Captions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Captions</p>
              <p className="text-sm font-semibold text-slate-900">{videoInfo.captions}</p>
            </div>

            {/* Available Formats */}
            {videoInfo.formats.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Available Formats</p>
                <div className="flex flex-col gap-2">
                  {videoInfo.formats.map((format) => (
                    <div key={format.itag} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                      <div className="text-sm">
                        <p className="font-semibold text-slate-900">{format.quality}</p>
                        <p className="text-xs text-slate-500">{format.mimeType?.split(";")[0]}</p>
                        {format.fps > 0 && <p className="text-xs text-slate-500">{format.fps} fps</p>}
                        <p className="text-xs text-slate-500">{formatBytes(format.filesize || format.filesizeApprox)}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(format.itag, format.quality)}
                        disabled={downloadingFormat === format.itag}
                        className="border border-slate-900 text-slate-900 rounded-lg px-3 py-1 text-xs font-semibold hover:bg-slate-900 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-2"
                      >
                        {downloadingFormat === format.itag ? "Downloading..." : "Download"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyInfo}
                className="flex-1 border border-slate-900 text-slate-900 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-slate-900 hover:text-white transition"
              >
                {copied ? "✓ Copied" : "Copy Info"}
              </button>
              <button
                type="button"
                onClick={handleOpenOnYouTube}
                className="flex-1 border border-red-600 text-red-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-600 hover:text-white transition"
              >
                Open on YouTube
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">How it works</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            <li>• Paste any YouTube URL (full link or youtu.be shortlink)</li>
            <li>• Get video title, description, channel, and duration</li>
            <li>• View high-res thumbnail and metadata</li>
            <li>• Check available video formats and qualities</li>
            <li>• Download video in your preferred quality</li>
            <li>• See if captions are available</li>
            <li>• Copy all information for external use</li>
            <li>• Open original video on YouTube</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white shadow-xl sm:shadow-2xl rounded-3xl p-6 sm:p-10 w-full max-w-3xl border border-slate-100 flex flex-col gap-8 transition-all duration-300">
        
        {/* Online Limitation Notice */}
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4 sm:p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex gap-3.5 items-start">
            <div className="flex-shrink-0 text-xl mt-0.5 bg-amber-100 rounded-full w-8 h-8 flex items-center justify-center">⚠️</div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-amber-900">Recommended for Local Use</p>
              <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">Video downloads work best when run locally. The online version has server-side rate limits, bandwidth restrictions, and download size blocks from YouTube.</p>
              <a href="/setup-guide" className="text-xs font-bold text-amber-700 hover:text-amber-900 underline mt-2 inline-flex items-center gap-1 hover:translate-x-0.5 transition-transform duration-200">
                📖 View local setup guide (2 min install) &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-1 shadow-inner animate-pulse">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.482 20.455 12 20.455 12 20.455s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">YouTube Downloader</h1>
          <p className="text-slate-500 text-sm max-w-lg leading-relaxed">Extract and download video files, high-res thumbnails, captions, and detailed metadata instantly.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleFetchInfo} className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 flex flex-col gap-3 shadow-sm">
            <label htmlFor="url" className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              YouTube Video URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="border border-slate-200 bg-white rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/80 focus:border-red-500/80 transition shadow-inner font-medium"
            />
            <p className="text-xs text-slate-400/90 font-medium">Supports full watch links, short URLs (youtu.be), playlists and mobile shares.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl px-5 py-3.5 font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-98"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Fetching video information...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Get Video Info & Download Formats
              </>
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Video Info */}
        {videoInfo && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Thumbnail */}
            {videoInfo.thumbnail && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 relative group shadow-md max-h-96">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full h-auto object-cover max-h-96 group-hover:scale-101 transition-transform duration-300"
                />
                <button
                  onClick={handleDownloadThumbnail}
                  className="absolute top-4 right-4 bg-slate-900/90 hover:bg-red-600 text-white rounded-xl p-3 hover:scale-105 transition-all shadow-lg backdrop-blur-sm flex items-center gap-1.5 text-xs font-bold"
                  title="Download thumbnail"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Cover</span>
                </button>
              </div>
            )}

            {/* Title & Channel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-2">{videoInfo.title}</h2>
              <div className="flex flex-wrap gap-2 items-center text-sm mt-1">
                <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-medium">Channel: <strong className="text-slate-900">{videoInfo.channelName}</strong></span>
                <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">⏱️ {Math.floor(videoInfo.duration / 60)} min {videoInfo.duration % 60}s</span>
                {videoInfo.captions === "Available" && <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">CC Captions</span>}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-inner">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">Description</p>
              <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap leading-relaxed">{videoInfo.description || "No description provided."}</p>
            </div>

            {/* Available Formats */}
            {videoInfo.formats.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Available Formats</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {videoInfo.formats.map((format) => (
                    <div key={format.itag} className="border border-slate-100 hover:border-orange-300 hover:shadow-md transition-all duration-200 rounded-xl p-4 flex flex-col justify-between bg-slate-50/50 hover:bg-white gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-800 text-base">{format.quality}</span>
                            {format.hasAudio && format.hasVideo && <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-semibold">Video + Audio</span>}
                            {format.hasVideo && !format.hasAudio && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">Video Only</span>}
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-1">{format.mimeType?.split(";")[0]}</p>
                          {format.fps > 0 && <p className="text-xs text-slate-400 font-medium mt-0.5">{format.fps} fps</p>}
                        </div>
                        <span className="text-xs font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-md font-mono">
                          {formatBytes(format.filesize || format.filesizeApprox)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownload(format.itag, format.quality)}
                        disabled={downloadingFormat === format.itag}
                        className="w-full bg-slate-900 hover:bg-orange-600 text-white disabled:bg-slate-300 rounded-lg py-2 text-xs font-bold transition shadow-sm hover:shadow-md active:scale-97 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {downloadingFormat === format.itag ? "Downloading..." : "Download Video"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCopyInfo}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl px-5 py-3 font-bold transition flex items-center justify-center gap-2"
              >
                {copied ? "✓ Copied" : "Copy Metadata"}
              </button>
              <button
                type="button"
                onClick={handleOpenOnYouTube}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl px-5 py-3 font-bold transition flex items-center justify-center gap-2"
              >
                Open on YouTube
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">How it works</p>
          <ul className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
            <li className="flex gap-2"><span className="text-red-500 font-bold">1.</span> Paste YouTube link (watch url or shorturl)</li>
            <li className="flex gap-2"><span className="text-red-500 font-bold">2.</span> Extract high-res thumbnail cover images</li>
            <li className="flex gap-2"><span className="text-red-500 font-bold">3.</span> Fetch details (channel name, duration, description)</li>
            <li className="flex gap-2"><span className="text-red-500 font-bold">4.</span> View formatted download files and sizes</li>
            <li className="flex gap-2"><span className="text-red-500 font-bold">5.</span> Scan if captions are available</li>
            <li className="flex gap-2"><span className="text-red-500 font-bold">6.</span> Copy details or watch the video directly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

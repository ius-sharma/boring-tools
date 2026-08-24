"use client";

import { useState } from "react";
import Link from "next/link";

const SAMPLE_PLAYLISTS = [
  {
    name: "React JS - Chai aur Code",
    url: "https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige",
  },
  {
    name: "DSA Sheet - Striver",
    url: "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz",
  },
  {
    name: "Python Bootcamp - Kunal Kushwaha",
    url: "https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ",
  },
  {
    name: "JavaScript - Traversy Media",
    url: "https://www.youtube.com/playlist?list=PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX",
  },
];

export default function YouTubePlaylistAnalyzerPage() {
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  // Calculator states
  const [selectedSpeed, setSelectedSpeed] = useState(1.5); // Default to 1.5x
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [dailyMinutes, setDailyMinutes] = useState(60); // Default 60 mins per day
  const [activeTab, setActiveTab] = useState("overview");

  // Video search & sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("index"); // 'index', 'duration-desc', 'duration-asc'
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (targetUrl) => {
    const query = (targetUrl || urlInput).trim();
    if (!query) {
      setError("Please paste a valid YouTube playlist URL or Playlist ID.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/youtube-playlist-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: query }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error || "Failed to analyze playlist.");
      } else {
        setData(json);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleUrl) => {
    setUrlInput(sampleUrl);
    handleAnalyze(sampleUrl);
  };

  // Helper calculations for speed matrix
  const getSelectedSpeedItem = () => {
    if (!data || !data.speedMatrix) return null;
    return (
      data.speedMatrix.find((s) => s.speedMultiplier === selectedSpeed) ||
      data.speedMatrix[0]
    );
  };

  // Pacing calculations
  const calculateCompletionDays = () => {
    if (!data || !data.playlist) return { days: 0, dateText: "" };
    const currentSpeedItem = getSelectedSpeedItem();
    let totalSecs = currentSpeedItem
      ? currentSpeedItem.durationSeconds
      : data.playlist.totalSeconds;

    if (isStudyMode) {
      totalSecs *= 1.5;
    }

    const dailySeconds = Math.max(15, dailyMinutes) * 60;
    const daysNeeded = Math.ceil(totalSecs / dailySeconds);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysNeeded);

    const options = { year: "numeric", month: "short", day: "numeric" };
    const dateText = targetDate.toLocaleDateString("en-US", options);

    return { days: daysNeeded, dateText };
  };

  // Filtered & sorted videos
  const getProcessedVideos = () => {
    if (!data || !data.videos) return [];
    let list = [...data.videos];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((v) => v.title.toLowerCase().includes(q));
    }

    if (sortBy === "duration-desc") {
      list.sort((a, b) => b.durationSeconds - a.durationSeconds);
    } else if (sortBy === "duration-asc") {
      list.sort((a, b) => a.durationSeconds - b.durationSeconds);
    } else {
      list.sort((a, b) => a.index - b.index);
    }

    return list;
  };

  const handleCopyMarkdown = () => {
    if (!data) return;
    const p = data.playlist;
    const c = data.conceptAnalysis;
    const speedItem = getSelectedSpeedItem();
    const pacing = calculateCompletionDays();

    const markdown = `# YouTube Playlist Analysis: ${p.title}
**Channel:** ${p.channelName}
**Total Videos:** ${p.totalVideos}
**Baseline Duration:** ${p.totalFormatted} (${p.totalHours} hours)
**At ${selectedSpeed}x Speed:** ${speedItem?.durationFormatted} (${speedItem?.hoursSavedFormatted})
**Pacing Target (${dailyMinutes} mins/day):** Finish in ~${pacing.days} days (${pacing.dateText})

---

## 🎯 Skill Level & Domain
- **Domain:** ${c.domain}
- **Level:** ${c.skillLevel}

## 📝 Overview
${c.summary}

## 💡 Key Concepts Covered
${c.coreConcepts.map((item) => `- ${item}`).join("\n")}

## 📚 Study Modules
${c.modules
  .map(
    (m) => `### ${m.moduleTitle} (${m.videoRange})
${m.description}
*Key Topics:* ${m.keyTopics.join(", ")}`
  )
  .join("\n\n")}

## ✅ Learning Outcomes
${c.learningOutcomes.map((o) => `- ${o}`).join("\n")}

---
*Generated via Boring Tools YouTube Playlist Analyzer*
`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const pacing = calculateCompletionDays();
  const speedItem = getSelectedSpeedItem();
  const processedVideos = getProcessedVideos();

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Playlist IQ
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Calculate total hours to watch any playlist across playback speeds, extract core concepts & modules, and build your personalized daily study schedule.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste YouTube playlist URL or Playlist ID (e.g. https://www.youtube.com/playlist?list=...)"
                className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 text-sm placeholder-gray-400 transition"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Analyze Playlist</span>
                </>
              )}
            </button>
          </form>

          {/* Sample Chips */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700">Try sample playlists:</span>
            {SAMPLE_PLAYLISTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleClick(sample.url)}
                className="px-2.5 py-1 bg-gray-100 hover:bg-amber-50 hover:text-amber-800 text-gray-700 border border-gray-200 rounded-lg transition"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-800 text-sm">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p className="mt-0.5 text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 space-y-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-32 h-20 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
            <div className="h-40 bg-gray-100 rounded-xl"></div>
          </div>
        )}

        {/* Results Container */}
        {data && !loading && (
          <div className="space-y-8">
            {/* Playlist Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {data.playlist.thumbnailUrl && (
                  <div className="relative shrink-0 w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={data.playlist.thumbnailUrl}
                      alt={data.playlist.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-mono">
                      {data.playlist.totalVideos} videos
                    </div>
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
                      {data.conceptAnalysis?.domain || "Playlist"}
                    </span>
                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                      Level: {data.conceptAnalysis?.skillLevel || "All"}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                    {data.playlist.title}
                  </h2>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span>By <strong className="text-gray-900">{data.playlist.channelName}</strong></span>
                    <span>•</span>
                    <a
                      href={`https://www.youtube.com/playlist?list=${data.playlist.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 underline font-medium inline-flex items-center gap-1"
                    >
                      Open on YouTube
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </p>
                </div>
              </div>

              {/* 4 Highlight Metric Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3.5 text-center">
                  <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Total Duration</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-900 mt-1">
                    {data.playlist.totalHours} <span className="text-xs font-normal">hrs</span>
                  </div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    {data.playlist.totalHMS}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-center">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Video Count</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {data.playlist.totalVideos}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Total Videos
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-center">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Video Length</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {data.playlist.avgDurationFormatted}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Per Video
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-center">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">At 1.5x Speed</div>
                  <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">
                    {data.speedMatrix?.find((s) => s.speedMultiplier === 1.5)?.durationFormatted || "N/A"}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    ⚡ {data.speedMatrix?.find((s) => s.speedMultiplier === 1.5)?.hoursSavedFormatted}
                  </div>
                </div>
              </div>
            </div>

            {/* Playback Speed Matrix & Study Mode Calculator */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    ⚡ Playback Speed & Duration Matrix
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select a speed to see exact watch time and hours saved.
                  </p>
                </div>

                {/* Study Mode Toggle */}
                <button
                  onClick={() => setIsStudyMode(!isStudyMode)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-2 ${
                    isStudyMode
                      ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Deep Study Mode (+50% practice buffer)</span>
                </button>
              </div>

              {/* Speed Tabs */}
              <div className="grid grid-cols-5 gap-2">
                {data.speedMatrix?.map((s) => {
                  const isActive = selectedSpeed === s.speedMultiplier;
                  return (
                    <button
                      key={s.speed}
                      onClick={() => setSelectedSpeed(s.speedMultiplier)}
                      className={`p-3 rounded-xl text-center border transition flex flex-col items-center justify-center ${
                        isActive
                          ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400 text-amber-900"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-sm font-bold">{s.speed}</span>
                      <span className="text-[11px] font-medium mt-0.5 text-gray-600">{s.durationHMS}</span>
                      {s.hoursSaved !== "0.00" && (
                        <span className="text-[10px] text-emerald-600 font-semibold mt-1">
                          -{s.hoursSaved}h
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Speed Result Highlight Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-xs text-amber-800 font-medium uppercase tracking-wider">
                    Calculated Watch Time at {selectedSpeed}x Speed {isStudyMode && "(Study Mode)"}
                  </div>
                  <div className="text-2xl font-extrabold text-amber-950">
                    {speedItem?.durationFormatted}{" "}
                    {isStudyMode && (
                      <span className="text-sm font-normal text-amber-800">
                        (includes practice time)
                      </span>
                    )}
                  </div>
                </div>

                {speedItem?.hoursSaved !== "0.00" && (
                  <div className="bg-white/80 border border-amber-300 rounded-xl px-4 py-2 text-center shadow-xs">
                    <span className="text-xs text-gray-500 font-medium block">Time Saved</span>
                    <span className="text-base font-bold text-emerald-600">
                      ⚡ {speedItem?.hoursSavedFormatted}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pacing Planner (Daily Watch Schedule) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  📅 Daily Pacing Planner
                </h3>
                <p className="text-xs text-gray-500">
                  Set how much time you can spend daily to calculate your completion target.
                </p>
              </div>

              <div className="space-y-4">
                {/* Preset Daily Targets */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">Quick Daily Target:</span>
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDailyMinutes(mins)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition border ${
                        dailyMinutes === mins
                          ? "bg-amber-500 text-white border-amber-600 font-bold"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {mins >= 60 ? `${mins / 60} hr${mins > 60 ? "s" : ""}/day` : `${mins} mins/day`}
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-gray-700">
                    <span>Watch Goal: <strong>{dailyMinutes} minutes / day</strong></span>
                    <span>Max: 4 hours / day</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="240"
                    step="15"
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Pacing Result Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Estimated Completion Time</span>
                    <span className="text-2xl font-extrabold text-gray-900 mt-1 block">
                      ~{pacing.days} Days
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5 block">
                      at {dailyMinutes} mins per day ({selectedSpeed}x speed)
                    </span>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-center">
                    <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">Target Finish Date</span>
                    <span className="text-xl font-bold text-amber-950 mt-1 block">
                      🎉 {pacing.dateText}
                    </span>
                    <span className="text-xs text-amber-700 mt-0.5 block">
                      Consistent daily streak target
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Concept & Knowledge Intelligence Tabs */}
            {data.conceptAnalysis && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50/70 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      💡 Concept & Module Intelligence
                    </h3>
                    <p className="text-xs text-gray-500">
                      AI-generated curriculum breakdown & topic keypoints.
                    </p>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyMarkdown}
                    className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-emerald-700">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Copy Roadmap (Markdown)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sub Tabs */}
                <div className="border-b border-gray-200 px-6 flex gap-6 overflow-x-auto text-sm font-medium">
                  {[
                    { id: "overview", label: "Overview & Outcomes" },
                    { id: "concepts", label: "Core Concepts Covered" },
                    { id: "modules", label: "Module Roadmap" },
                    { id: "tips", label: "Prerequisites & Tips" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 font-semibold border-b-2 transition whitespace-nowrap ${
                        activeTab === tab.id
                          ? "border-amber-500 text-amber-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Summary</h4>
                        <p className="text-gray-800 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                          {data.conceptAnalysis.summary}
                        </p>
                      </div>

                      {data.conceptAnalysis.learningOutcomes?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Key Learning Outcomes</h4>
                          <div className="space-y-2">
                            {data.conceptAnalysis.learningOutcomes.map((item, i) => (
                              <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mt-0.5">
                                  ✓
                                </span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Concepts Tab */}
                  {activeTab === "concepts" && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Extracted Concepts Tag Cloud</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.conceptAnalysis.coreConcepts?.map((concept, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold"
                          >
                            #{concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modules Tab */}
                  {activeTab === "modules" && (
                    <div className="space-y-4">
                      {data.conceptAnalysis.modules?.map((mod, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h5 className="font-bold text-gray-900 text-sm">{mod.moduleTitle}</h5>
                            <span className="px-2 py-0.5 bg-white border border-gray-300 text-gray-600 text-xs rounded font-mono font-medium">
                              {mod.videoRange}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{mod.description}</p>
                          {mod.keyTopics?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {mod.keyTopics.map((t, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-white border border-gray-200 text-gray-700 text-[11px] rounded">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Prerequisites & Tips Tab */}
                  {activeTab === "tips" && (
                    <div className="space-y-6">
                      {data.conceptAnalysis.prerequisites?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Prerequisites</h4>
                          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                            {data.conceptAnalysis.prerequisites.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {data.conceptAnalysis.studyTips?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Study Tips</h4>
                          <div className="space-y-2">
                            {data.conceptAnalysis.studyTips.map((tip, i) => (
                              <div key={i} className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 font-medium">
                                💡 {tip}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interactive Video List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    🎬 Video-by-Video Breakdown ({data.videos?.length})
                  </h3>
                  <p className="text-xs text-gray-500">
                    Search and inspect individual video durations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search video titles..."
                    className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full sm:w-48"
                  />

                  {/* Sort Select */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="index">Sort: Original Order</option>
                    <option value="duration-desc">Sort: Longest First</option>
                    <option value="duration-asc">Sort: Shortest First</option>
                  </select>
                </div>
              </div>

              {/* Video Table List */}
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto border border-gray-200 rounded-xl">
                {processedVideos.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    No videos match your search term "{searchQuery}".
                  </div>
                ) : (
                  processedVideos.map((video) => (
                    <div
                      key={video.videoId}
                      className="p-3 hover:bg-gray-50 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-center font-mono font-bold text-gray-400 shrink-0">
                          #{video.index}
                        </span>
                        <p className="font-medium text-gray-900 truncate">
                          {video.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono bg-gray-100 border border-gray-200 text-gray-700 px-2 py-0.5 rounded font-medium text-[11px]">
                          {video.durationText}
                        </span>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold transition"
                        >
                          Watch ↗
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

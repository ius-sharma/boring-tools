"use client";

import { useState, useRef } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const TOOL_STATUS = "live";

const TONE_OPTIONS = [
  { value: "curious", label: "Curious" },
  { value: "bold", label: "Bold" },
  { value: "professional", label: "Professional" },
  { value: "controversial", label: "Controversial" },
  { value: "educational", label: "Educational" },
];

const PLATFORM_OPTIONS = [
  { value: "twitter", label: "X / Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram / Reels" },
  { value: "youtube", label: "YouTube Shorts" },
];

export default function HookGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("curious");
  const [platform, setPlatform] = useState("twitter");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => setToast({ type: "", message: "" }), 2000);
  };

  const generateHooks = async () => {
    if (!topic.trim()) {
      showToast("error", "Please enter a topic");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/hook-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, platform }),
      });
      const data = await response.json();
      setResults(data.hooks || []);
    } catch (error) {
      showToast("error", "Failed to generate hooks");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("success", "Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 sm:py-8 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-4xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Creator Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Hook Generator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Stop the scroll with viral hooks for your next social media post.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">What's your post about?</span>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 5 ways to save money as a student"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 h-32 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Tone</span>
                  <ThemedDropdown value={tone} options={TONE_OPTIONS} onChange={setTone} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Platform</span>
                  <ThemedDropdown value={platform} options={PLATFORM_OPTIONS} onChange={setPlatform} />
                </label>
              </div>
            </div>

            <button
              onClick={generateHooks}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Hooks"}
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Generated Hooks</h2>
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((hook, idx) => (
                  <div
                    key={idx}
                    onClick={() => copyToClipboard(hook)}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition group relative"
                  >
                    <p className="text-slate-800 pr-8">{hook}</p>
                    <span className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p>Your hooks will appear here</p>
              </div>
            )}
          </div>
        </div>

        {toast.message && (
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white font-medium shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "inspirational", label: "Inspirational" },
  { value: "casual", label: "Casual" },
  { value: "thought-provoking", label: "Thought-Provoking" },
  { value: "storytelling", label: "Storytelling" },
  { value: "contrarian", label: "Contrarian (Spicy)" },
  { value: "educational", label: "Educational Guide" },
];

const formatOptions = [
  { value: "engagement", label: "Engagement-Boosting" },
  { value: "announcement", label: "Announcement" },
  { value: "advice", label: "Advice / Tips" },
  { value: "question", label: "Question" },
  { value: "story", label: "Story" },
  { value: "celebration", label: "Celebration" },
  { value: "carousel", label: "Carousel PDF Outline" },
  { value: "teardown", label: "Case Study / Teardown" },
];

const audienceOptions = [
  { value: "recruiters", label: "Recruiters" },
  { value: "entrepreneurs", label: "Entrepreneurs" },
  { value: "employees", label: "Employees" },
  { value: "job-seekers", label: "Job Seekers" },
  { value: "professionals", label: "General Professionals" },
];

const exampleTopics = [
  "Just launched a new feature that doubled our user retention rate",
  "Why work-life balance is a myth, and we should focus on work-life integration instead",
  "3 hard truths about engineering management I learned the hard way",
  "Celebrating my team completing a massive cloud migration 2 weeks early",
  "How I deal with creative block and burnout as a developer",
];

const hookLibrary = [
  { label: "Unpopular Take", text: "Unpopular opinion: [Doing X] is actually a complete waste of time." },
  { label: "Curiosity Open", text: "I used to think [Old Belief], but after [Event], I realized everything I knew was wrong." },
  { label: "Before / After", text: "12 months ago: [Struggle]. Today: [Success]. Here is the exact roadmap I followed:" },
  { label: "Mistake/Warning", text: "If you are still doing [Action], stop immediately. It's costing you hours of productivity." },
  { label: "Quick Question", text: "For anyone working in [Industry]: Have you noticed this shift happening?" },
];

const ctaLibrary = [
  { label: "Open Question", text: "What are your thoughts on this? Let's discuss in the comments below!" },
  { label: "Repost Call", text: "If you found this valuable, please repost to help others in your network!" },
  { label: "Action Call", text: "Which step are you going to implement first? Let me know!" },
  { label: "Follow / Bell", text: "Found this useful? Follow me and ring the bell to get daily updates!" },
];

// Helper functions for Unicode styling
const toBold = (text) => {
  return text.split("").map((c) => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D400 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D41A + (code - 97));
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7CE + (code - 48));
    return c;
  }).join("");
};

const toItalic = (text) => {
  return text.split("").map((c) => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D434 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D44E + (code - 97));
    return c;
  }).join("");
};

const toMonospace = (text) => {
  return text.split("").map((c) => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D670 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D68A + (code - 97));
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7F6 + (code - 48));
    return c;
  }).join("");
};

const normalizeKeywords = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

export default function LinkedInPostFormatter() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [format, setFormat] = useState("engagement");
  const [audience, setAudience] = useState("professionals");
  const [keywords, setKeywords] = useState("");
  const [posts, setPosts] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyNote, setCopyNote] = useState("");
  const [selectedPostIdx, setSelectedPostIdx] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [activeLibraryTab, setActiveLibraryTab] = useState("hooks");
  const [history, setHistory] = useState([]);

  // Load state on mount
  useEffect(() => {
    setIsClient(true);
    const savedDraft = localStorage.getItem("linkedin_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setTopic(parsed.topic || "");
        setTone(parsed.tone || "professional");
        setFormat(parsed.format || "engagement");
        setAudience(parsed.audience || "professionals");
        setKeywords(parsed.keywords || "");
      } catch (e) {
        console.error(e);
      }
    }

    const savedHistory = localStorage.getItem("linkedin_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save drafts
  useEffect(() => {
    if (!isClient) return;
    const draft = { topic, tone, format, audience, keywords };
    localStorage.setItem("linkedin_draft", JSON.stringify(draft));
  }, [isClient, topic, tone, format, audience, keywords]);

  const handleGenerate = async () => {
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      setError("Please enter your post topic or main message first.");
      setPosts([]);
      setSource("");
      return;
    }

    setLoading(true);
    setError("");
    setCopyNote("");

    try {
      const response = await fetch("/api/linkedin-post-formatter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: cleanTopic,
          tone,
          format,
          audience,
          keywords: normalizeKeywords(keywords),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || payload?.error || "Could not generate posts.");
        setPosts([]);
        setSource("");
        return;
      }

      if (Array.isArray(payload.posts) && payload.posts.length) {
        setPosts(payload.posts);
        setSelectedPostIdx(0);
        const srcLabel = payload.source || "AI assistance";
        setSource(srcLabel);

        // Save to History
        const newHistory = {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          posts: payload.posts,
          topic: cleanTopic,
          tone: toneOptions.find((t) => t.value === tone)?.label || tone,
        };
        const updatedHistory = [newHistory, ...history.slice(0, 4)];
        setHistory(updatedHistory);
        localStorage.setItem("linkedin_history", JSON.stringify(updatedHistory));

        if (payload.error) {
          setError(payload.error);
        }
        return;
      }

      setError(payload?.error || "Could not generate posts.");
      setPosts([]);
      setSource("");
    } catch {
      setError("Request failed. Try again.");
      setPosts([]);
      setSource("");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = (index, value) => {
    const updated = [...posts];
    updated[index] = value;
    setPosts(updated);
  };

  const formatSelection = (index, formatType) => {
    const textarea = document.getElementById(`post-textarea-${index}`);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    if (start === end) {
      alert("Highlight the text inside the editor first, then click format to style it.");
      return;
    }

    const selectedText = text.substring(start, end);
    let formatted = selectedText;

    if (formatType === "bold") formatted = toBold(selectedText);
    else if (formatType === "italic") formatted = toItalic(selectedText);
    else if (formatType === "mono") formatted = toMonospace(selectedText);

    const newText = text.substring(0, start) + formatted + text.substring(end);
    handleUpdatePost(index, newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formatted.length);
    }, 10);
  };

  const insertEmoji = (index, emoji) => {
    const textarea = document.getElementById(`post-textarea-${index}`);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, start) + emoji + text.substring(end);
    handleUpdatePost(index, newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 10);
  };

  const copyText = async (value) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopyNote("Copied to clipboard!");
    window.clearTimeout(window.__linkedinPostCopyToastTimer);
    window.__linkedinPostCopyToastTimer = window.setTimeout(() => {
      setCopyNote("");
    }, 1800);
  };

  const copyAll = async () => {
    if (!posts.length) return;
    await copyText(posts.join("\n\n---\n\n"));
  };

  const useExample = (value) => {
    setTopic(value);
    setError("");
    setCopyNote("");
  };

  const loadHistoryItem = (item) => {
    setPosts(item.posts);
    setSelectedPostIdx(0);
    setTopic(item.topic);
    setSource(item.source || "Restored history");
    setError("");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("linkedin_history");
  };

  // Live values
  const activePostText = posts[selectedPostIdx] || "";
  const charCount = activePostText.length;
  const isOverLimit = charCount > 3000;

  // Visual see more cut-off line (approx 140 chars)
  const seeMoreText = activePostText.substring(0, 140);
  const remainingText = activePostText.substring(140);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 px-4 py-8 sm:py-12 font-sans">
      <div className="mx-auto max-w-7xl flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider self-start">
              Content Studio
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              LinkedIn Post Formatter
            </h1>
            <p className="text-slate-500 text-base max-w-2xl">
              Convert raw business thoughts, milestones, or questions into high-performing, professionally formatted LinkedIn posts.
            </p>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid gap-8 lg:grid-cols-12 items-stretch">
          
          {/* Left Column: Post Settings & Prompt Inputs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Topic Input */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-50 flex flex-col gap-3">
              <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">1</span>
                Topic / Main Message
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Just launched our new client portal. Built it in 2 weeks. Retention is up 40%."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-amber-400 focus:bg-white resize-none"
              />
            </div>

            {/* Dropdowns */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-50 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Post Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex flex-col gap-1.5">
                  Tone Style
                  <ThemedDropdown options={toneOptions} value={tone} onChange={setTone} />
                </label>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex flex-col gap-1.5">
                  Layout Format
                  <ThemedDropdown options={formatOptions} value={format} onChange={setFormat} />
                </label>
              </div>

              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex flex-col gap-1.5">
                Target Audience
                <ThemedDropdown options={audienceOptions} value={audience} onChange={setAudience} />
              </label>

              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex flex-col gap-1.5">
                Keywords <span className="text-[10px] text-slate-400 font-normal normal-case">(Comma separated, max 4)</span>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="marketing, cloud, success"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-amber-400 focus:bg-white"
                />
              </label>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm text-white ${
                  loading
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99]"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating Posts...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generate Drafts</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Examples */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-50 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-800">Quick Pitch Ideas</h3>
              <div className="flex flex-col gap-2">
                {exampleTopics.map((example, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => useExample(example)}
                    className="w-full text-left text-xs bg-slate-50 hover:bg-amber-50 hover:text-amber-800 border border-slate-100 rounded-xl p-3 transition active:scale-[0.98] cursor-pointer text-slate-600 leading-relaxed"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Editor, Feed Mockup, and Hooks Library */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Hooks & CTA Reference Panel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-50 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  LinkedIn swipe file & snippets
                </h3>
                <span className="text-[10px] text-slate-400">Click a card to copy template</span>
              </div>

              {/* Tab Selector */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveLibraryTab("hooks")}
                  className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition text-center cursor-pointer ${
                    activeLibraryTab === "hooks" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Attention Hooks (Viral)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLibraryTab("ctas")}
                  className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition text-center cursor-pointer ${
                    activeLibraryTab === "ctas" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Closing Calls (CTAs)
                </button>
              </div>

              {/* Library Cards list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {(activeLibraryTab === "hooks" ? hookLibrary : ctaLibrary).map((item, index) => (
                  <div
                    key={index}
                    onClick={() => copyText(item.text)}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-amber-400 hover:bg-amber-50/10 cursor-pointer transition active:scale-[0.98]"
                  >
                    <span className="text-[10px] font-bold text-amber-800 block mb-1">{item.label}</span>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Interactive Editor Section */}
            {posts.length > 0 ? (
              <div className="flex flex-col gap-6">
                
                {/* Generated list selector */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">Review & Format Suggestions</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={copyAll}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer active:scale-95 transition"
                      >
                        Copy All suggestions
                      </button>
                      <button
                        onClick={() => copyText(activePostText)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition shadow-sm"
                      >
                        Copy Active post
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {posts.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPostIdx(idx)}
                        className={`px-3 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer active:scale-95 ${
                          selectedPostIdx === idx
                            ? "bg-amber-100 border-amber-300 text-amber-900"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        Option {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Sandbox */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-sm shadow-slate-50">
                  
                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1.5">
                        Style text:
                      </span>
                      <button
                        type="button"
                        onClick={() => formatSelection(selectedPostIdx, "bold")}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 font-bold rounded text-xs transition cursor-pointer"
                        title="Convert selected text to mathematical bold"
                      >
                        𝗕𝗼𝗹𝗱
                      </button>
                      <button
                        type="button"
                        onClick={() => formatSelection(selectedPostIdx, "italic")}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 italic rounded text-xs transition cursor-pointer"
                        title="Convert selected text to mathematical italic"
                      >
                        𝘐𝘵𝘢𝘭𝘪𝘤
                      </button>
                      <button
                        type="button"
                        onClick={() => formatSelection(selectedPostIdx, "mono")}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 font-mono rounded text-xs transition cursor-pointer"
                        title="Convert selected text to mathematical monospace"
                      >
                        𝙼𝚘𝚗𝚘
                      </button>
                    </div>
                  </div>

                  {/* Textarea Workspace */}
                  <div className="relative">
                    <textarea
                      id={`post-textarea-${selectedPostIdx}`}
                      value={activePostText}
                      onChange={(e) => handleUpdatePost(selectedPostIdx, e.target.value)}
                      rows={10}
                      className="w-full text-sm leading-relaxed text-slate-800 bg-transparent resize-none focus:outline-none min-h-[220px]"
                      placeholder="Post content..."
                    />
                  </div>

                  {/* Limits and cutoff visualizer info */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold ${isOverLimit ? "text-red-500 font-bold" : "text-slate-400"}`}>
                        {charCount.toLocaleString()} / 3,000 chars
                      </span>
                      {isOverLimit && (
                        <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                          Exceeds limit!
                        </span>
                      )}
                    </div>
                    
                    <span className="text-[10px] text-slate-400 font-medium">
                      Tip: Highlight words and click 𝗕𝗼𝗹𝗱 to format them.
                    </span>
                  </div>
                </div>

                {/* Simulated Feed cut-off preview mockup */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-50 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Feed Visualizer (Mobile Feeds Previews)
                  </h4>
                  
                  {/* LinkedIn Mockup container */}
                  <div className="border border-slate-200/80 rounded-xl bg-white p-4 shadow-sm max-w-md mx-auto w-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 flex items-center justify-center font-bold text-slate-500 border border-slate-300">
                        Y
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 leading-tight">Jane Doe</span>
                        <span className="text-[10px] text-slate-400 leading-none">Senior Professional • 1st</span>
                        <span className="text-[9px] text-slate-400 leading-none mt-1">2h • Edited</span>
                      </div>
                    </div>

                    {/* Post Text feed representation */}
                    <div className="text-xs text-slate-800 leading-relaxed mb-2">
                      {charCount <= 140 ? (
                        <p className="whitespace-pre-wrap">{activePostText}</p>
                      ) : (
                        <p className="whitespace-pre-wrap">
                          {seeMoreText}
                          <span className="text-slate-400 font-semibold cursor-pointer hover:underline ml-0.5">
                            ...see more
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Simulated likes footer */}
                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>42 Likes</span>
                      <span>12 Comments • 2 Reposts</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center leading-normal">
                    Users on mobile will only see the text before "...see more" without clicking. Make sure your hook is in those first 140 characters!
                  </p>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 flex flex-col items-center justify-center gap-3 text-slate-400 bg-white border border-dashed border-slate-200 rounded-3xl min-h-[350px]">
                <svg className="w-12 h-12 text-slate-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-sm font-semibold text-slate-500">Your generated drafts will appear here</p>
                <p className="text-xs text-slate-400 max-w-sm">Enter a topic/milestone, adjust your settings on the left, and click "Generate Drafts" to format your posts.</p>
              </div>
            )}
          </div>

        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {copyNote && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl shadow-xl text-sm font-semibold z-50 bg-slate-900 text-white border border-slate-800 animate-fade-in-out transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {copyNote}
          </div>
        )}

        {/* History Log Section */}
        {history.length > 0 && (
          <div className="border-t border-slate-200 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Drafts History ({history.length})
              </h3>
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-slate-400 hover:text-red-500 font-semibold transition cursor-pointer"
              >
                Clear History
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {history.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => loadHistoryItem(item)}
                  className="p-4 border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/10 cursor-pointer rounded-xl flex flex-col gap-1.5 text-left transition duration-200 group active:scale-[0.98]"
                >
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-800 transition">
                    {item.timestamp} • {item.tone}
                  </span>
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {item.topic}
                  </p>
                  <span className="text-[9px] text-slate-400 line-clamp-2 mt-0.5">
                    {item.posts[0] || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
        .animate-fade-in-out {
          animation: fadeInOut 2.2s ease-in-out;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 15px); }
          12% { opacity: 1; transform: translate(-50%, 0); }
          88% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -15px); }
        }
      `}</style>
    </div>
  );
}

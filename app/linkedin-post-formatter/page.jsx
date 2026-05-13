"use client";

import { useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";
import { notFound } from "next/navigation";

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "inspirational", label: "Inspirational" },
  { value: "casual", label: "Casual" },
  { value: "thought-provoking", label: "Thought-Provoking" },
  { value: "storytelling", label: "Storytelling" },
];

const formatOptions = [
  { value: "engagement", label: "Engagement-Boosting" },
  { value: "announcement", label: "Announcement" },
  { value: "advice", label: "Advice / Tips" },
  { value: "question", label: "Question" },
  { value: "story", label: "Story" },
  { value: "celebration", label: "Celebration" },
];

const audienceOptions = [
  { value: "recruiters", label: "Recruiters" },
  { value: "entrepreneurs", label: "Entrepreneurs" },
  { value: "employees", label: "Employees" },
  { value: "job-seekers", label: "Job Seekers" },
  { value: "professionals", label: "General Professionals" },
];

const exampleTopics = [
  "Just completed a challenging project at work",
  "Sharing insights about remote work culture",
  "Celebrating a team milestone",
  "New skill I learned this month",
  "Reflecting on career growth",
];

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
  const [source, setSource] = useState("AI assistance");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyNote, setCopyNote] = useState("");
  const exampleList = exampleTopics;

  const handleGenerate = async () => {
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      setError("Please enter your post topic or main message first.");
      setPosts([]);
      setSource("AI assistance");
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

      if (Array.isArray(payload.posts) && payload.posts.length) {
        setPosts(payload.posts);
        setSource(payload.source === "Groq API" ? "Groq API" : "Local fallback");
        if (payload.error) {
          setError(payload.error);
        }
        return;
      }

      setError(payload?.error || "Could not generate posts.");
      setPosts([]);
      setSource("AI assistance");
    } catch {
      setError("Request failed. Try again.");
      setPosts([]);
      setSource("AI assistance");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (value) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopyNote("Copied!");
    window.clearTimeout(window.__linkedinPostCopyToastTimer);
    window.__linkedinPostCopyToastTimer = window.setTimeout(() => {
      setCopyNote("");
    }, 1400);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600 mb-3">Professional Tool</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">LinkedIn Post Formatter</h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Turn your ideas into engaging LinkedIn posts with the right tone, format, and audience in mind.
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">Source: {source}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Post topic or message</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Just launched a new product feature that doubled user engagement"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Tone</label>
                  <ThemedDropdown
                    options={toneOptions}
                    value={tone}
                    onChange={setTone}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Format</label>
                  <ThemedDropdown
                    options={formatOptions}
                    value={format}
                    onChange={setFormat}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Target audience</label>
                <ThemedDropdown
                  options={audienceOptions}
                  value={audience}
                  onChange={setAudience}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Optional keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. innovation, teamwork, growth"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500"
                />
                <p className="mt-2 text-xs text-slate-600">Add up to 4 comma-separated keywords to shape the post suggestions.</p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full rounded-2xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:bg-slate-300"
              >
                {loading ? "Generating..." : "Generate Posts"}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Quick Examples</h3>
            <div className="space-y-2">
              {exampleList.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => useExample(example)}
                  className="block w-full rounded-2xl bg-slate-50 p-3 text-left text-sm hover:bg-orange-50 transition text-slate-700"
                >
                  {example}
                </button>
              ))}
            </div>
          </section>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {posts.length > 0 && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Generated Posts</h2>
              <button
                onClick={copyAll}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
              >
                Copy All
              </button>
            </div>
            {copyNote && <p className="mb-4 text-sm text-green-600 font-medium">{copyNote}</p>}
            <div className="space-y-4">
              {posts.map((post, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-800 whitespace-pre-wrap mb-3">{post}</p>
                  <button
                    onClick={() => copyText(post)}
                    className="text-xs font-medium text-orange-600 hover:text-orange-700 transition"
                  >
                    Copy Post
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const toneOptions = [
  { value: "curious", label: "Curious" },
  { value: "professional", label: "Professional" },
  { value: "energetic", label: "Energetic" },
  { value: "bold", label: "Bold" },
  { value: "friendly", label: "Friendly" },
];

const styleOptions = [
  { value: "seo", label: "SEO-Friendly" },
  { value: "howto", label: "How-To" },
  { value: "listicle", label: "Listicle" },
  { value: "curiosity", label: "Curiosity" },
  { value: "shorts", label: "Shorts / Punchy" },
];

const audienceOptions = [
  { value: "viewers", label: "General Viewers" },
  { value: "creators", label: "Creators" },
  { value: "beginners", label: "Beginners" },
  { value: "students", label: "Students" },
  { value: "professionals", label: "Professionals" },
];

const exampleTopics = [
  "How I Built a Productivity System",
  "Best Budget Travel Tips",
  "React UI Tricks",
  "Morning Routine for Deep Work",
  "Beginner Editing Workflow",
];

const normalizeKeywords = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

export default function YouTubeTitleGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("curious");
  const [style, setStyle] = useState("seo");
  const [audience, setAudience] = useState("viewers");
  const [keywords, setKeywords] = useState("");
  const [titles, setTitles] = useState([]);
  const [source, setSource] = useState("AI assistance");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyNote, setCopyNote] = useState("");
  const exampleList = exampleTopics;

  const handleGenerate = async () => {
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      setError("Please enter a video topic first.");
      setTitles([]);
      setSource("AI assistance");
      return;
    }

    setLoading(true);
    setError("");
    setCopyNote("");

    try {
      const response = await fetch("/api/youtube-title-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: cleanTopic,
          tone,
          style,
          audience,
          keywords: normalizeKeywords(keywords),
        }),
      });

      const payload = await response.json();

      if (response.ok && Array.isArray(payload.titles) && payload.titles.length) {
        setTitles(payload.titles);
        setSource(payload.source === "Groq API" ? "Groq API" : "Local fallback");
        if (payload.error) {
          setError(payload.error);
        }
        return;
      }

      setError(payload?.error || "Could not generate titles.");
      setTitles([]);
      setSource("AI assistance");
    } catch {
      setError("Request failed. Try again.");
      setTitles([]);
      setSource("AI assistance");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (value) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopyNote("Copied!");
    window.clearTimeout(window.__youtubeTitleCopyToastTimer);
    window.__youtubeTitleCopyToastTimer = window.setTimeout(() => {
      setCopyNote("");
    }, 1400);
  };

  const copyAll = async () => {
    if (!titles.length) return;
    await copyText(titles.join("\n"));
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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600 mb-3">Content Creator Tool</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">YouTube Title Generator</h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Turn a rough video idea into clickable title options with Groq-powered suggestions.
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">Source: {source}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Video topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. How I stay focused while working from home"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Optional keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="tips, guide, 2026, workflow"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500"
                />
                <p className="mt-2 text-xs text-slate-500">Add up to 4 comma-separated keywords to shape the title suggestions.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ThemedDropdown ariaLabel="Select title tone" value={tone} options={toneOptions} onChange={setTone} />
                <ThemedDropdown ariaLabel="Select title style" value={style} options={styleOptions} onChange={setStyle} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ThemedDropdown ariaLabel="Select audience" value={audience} options={audienceOptions} onChange={setAudience} />
              </div>

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className={`inline-flex items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 ${loading ? "cursor-not-allowed opacity-75" : ""}`}
                >
                  {loading ? "Generating..." : "Generate Titles"}
                </button>
                <button
                  onClick={copyAll}
                  disabled={!titles.length}
                  className={`inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-orange-400 hover:bg-orange-50 ${!titles.length ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  Copy All
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-slate-900 p-6 sm:p-8 text-white shadow-sm">
            <h2 className="text-2xl font-bold">Quick tips</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>Use a specific topic instead of a broad one for stronger titles.</li>
              <li>Try curiosity or listicle style when you want more click appeal.</li>
              <li>Keep keywords short so the generated titles stay natural.</li>
              <li>Use the audience field to shape the hook around viewers.</li>
            </ul>

            <div className="mt-6 rounded-2xl bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">Preview</p>
              <p className="mt-2 text-lg font-semibold text-white">{topic.trim() || "Your topic will appear here"}</p>
              <p className="mt-1 text-sm text-slate-300">
                {toneOptions.find((option) => option.value === tone)?.label} tone • {styleOptions.find((option) => option.value === style)?.label} style • {audienceOptions.find((option) => option.value === audience)?.label}
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Suggested titles</h2>
              <p className="mt-1 text-sm text-slate-600">Groq-generated options will appear here. Copy the ones that fit your video best.</p>
            </div>
            <div className="text-sm text-slate-500">Up to 10 title ideas per run</div>
          </div>

          {!titles.length ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500">
              Enter a topic and hit Generate Titles.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {titles.map((title, index) => (
                <div key={`${title}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Title {index + 1}</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{title}</p>
                    </div>
                    <button
                      onClick={() => copyText(title)}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:bg-orange-50"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {copyNote ? <p className="mt-4 text-sm font-medium text-emerald-600">{copyNote}</p> : null}
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Example topics</h2>
              <p className="mt-1 text-sm text-slate-600">Click one to load a fast starting point.</p>
            </div>
            <button
              onClick={() => useExample(exampleList[0])}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:bg-orange-50"
            >
              Use first example
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {exampleList.map((example) => (
              <button
                key={example}
                onClick={() => useExample(example)}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50"
              >
                {example}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
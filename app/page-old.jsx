"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "./components/ThemedDropdown";

const tools = [
  {
    id: "text-formatter",
    name: "Text Formatter",
    href: "/text-formatter",
    category: "Text",
    description: "Clean and transform text instantly.",
    status: "Live",
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    href: "/json-formatter",
    category: "Developer",
    description: "Format and validate JSON in one click.",
    status: "Live",
  },
  {
    id: "word-counter",
    name: "Word Counter",
    href: "/word-counter",
    category: "Text",
    description: "Count words and characters quickly.",
    status: "Live",
  },
  {
    id: "password-generator",
    name: "Password Generator",
    href: "/password-generator",
    category: "Security",
    description: "Generate secure passwords with options.",
    status: "Live",
  },
  {
    id: "age-calculator",
    name: "Age Calculator",
    href: "/age-calculator",
    category: "Utility",
    description: "Calculate age from date of birth.",
    status: "Live",
  },
  {
    id: "qr-generator",
    name: "QR Generator",
    href: "/qr-generator",
    category: "Developer",
    description: "Generate downloadable QR from text.",
    status: "Live",
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    href: "/unit-converter",
    category: "Utility",
    description: "Convert length, weight, temperature.",
    status: "Live",
  },
  {
    id: "file-name-sanitizer",
    name: "File Name Sanitizer",
    href: "/file-name-sanitizer",
    category: "Utility",
    description: "Clean unsafe or messy filenames.",
    status: "Live",
  },
  {
    id: "image-compressor",
    name: "Image Compressor / Resizer",
    href: "/image-compressor",
    category: "Media",
    description: "Compress and resize images quickly.",
    status: "Live",
    isNew: true,
  },
  {
    id: "resume-bullet-rewriter",
    name: "Resume Bullet Rewriter",
    href: "/resume-bullet-rewriter",
    category: "Career",
    description: "Turn rough notes into strong resume bullets.",
    status: "Live",
    isNew: true,
  },
  {
    id: "time-zone-converter",
    name: "Time Zone Converter",
    href: "/time-zone-converter",
    category: "Time & Date",
    description: "Convert meeting times across time zones.",
    status: "Live",
    isNew: true,
  },
  {
    id: "to-do-list",
    name: "To-Do List",
    href: "/to-do-list",
    category: "Productivity",
    description: "Track tasks locally with saved progress.",
    status: "Live",
    isNew: true,
  },
  {
    id: "gst-calculator",
    name: "GST Calculator",
    href: "/gst-calculator",
    category: "Finance",
    description: "Calculate GST-inclusive and exclusive totals.",
    status: "Live",
    isNew: true,
  },
  {
    id: "truth-or-dare-play",
    name: "Truth or Dare Play",
    href: "/truth-or-dare-play",
    category: "Fun",
    description: "Spin up a clean truth-or-dare game quickly.",
    status: "Live",
    isNew: true,
  },
  {
    id: "pomodoro-timer",
    name: "Pomodoro Timer",
    href: "/pomodoro-timer",
    category: "Productivity",
    description: "Focus sessions with timer cycles.",
    status: "Live",
  },
  {
    id: "roast-my-todo-list",
    name: "Roast My To-Do List",
    href: "/roast-my-todo-list",
    category: "Fun + Productivity",
    description: "Playful roast with practical next steps.",
    status: "Live",
    isNew: true,
  },
  {
    id: "markdown-previewer",
    name: "Markdown Previewer",
    href: "/markdown-previewer",
    category: "Developer",
    description: "Write markdown and preview instantly.",
    status: "Live",
    isNew: true,
  },
  {
    id: "video-transcriber",
    name: "Video Transcriber",
    href: "/video-transcriber",
    category: "Media",
    description: "Transcribe video audio to text quickly and accurately.",
    status: "Live",
    isNew: true,
  },
  {
    id: "base-converter",
    name: "Base Converter",
    href: "/base-converter",
    category: "Developer",
    description: "Convert Binary, Decimal, Octal, and Hex instantly.",
    status: "Upcoming",
  },
  {
    id: "aspect-ratio-calculator",
    name: "Aspect Ratio Calculator",
    href: "/aspect-ratio-calculator",
    category: "Developer",
    description: "Resize images while preserving aspect ratio.",
    status: "Upcoming",
  },
  {
    id: "distance-between-cities",
    name: "Distance Between Cities",
    href: "/distance-between-cities",
    category: "Utility",
    description: "Compute straight-line distance and travel estimates.",
    status: "Upcoming",
  },
  {
    id: "currency-converter",
    name: "Currency Converter",
    href: "/currency-converter",
    category: "Finance",
    description: "Quick currency conversions with optional historical rates.",
    status: "Upcoming",
  },
];

const upcomingTools = [
  {
    id: "base-converter",
    name: "Base Converter",
    category: "Developer",
    description: "Convert Binary, Decimal, Octal, and Hex instantly.",
    eta: "Coming Soon",
  },
];

// Which tools should be accessible (live) right now — keep this list small and local-only.
const liveToolIds = new Set([
  "text-formatter",
  "json-formatter",
  "word-counter",
  "password-generator",
  "age-calculator",
  "unit-converter",
  "qr-generator",
  "file-name-sanitizer",
  "pomodoro-timer",
  "image-compressor",
  "resume-bullet-rewriter",
  "gst-calculator",
  "to-do-list",
  "time-zone-converter",
  "truth-or-dare-play",
  "roast-my-todo-list",
  "markdown-previewer",
  "video-transcriber",
]);

// Derive the currently available live tools and the rest (moved to upcoming)
const availableTools = tools.filter((t) => liveToolIds.has(t.id));
const otherTools = tools.filter((t) => !liveToolIds.has(t.id));

// Compose the authoritative upcoming list (existing upcoming + moved tools)
const upcomingIds = new Set(upcomingTools.map((t) => t.id));
const allUpcoming = [
  ...upcomingTools,
  ...otherTools
    .filter((t) => !upcomingIds.has(t.id))
    .map((t) => ({ id: t.id, name: t.name, category: t.category, description: t.description, eta: "Coming Soon" })),
];

const quickFilters = [
  { id: "all", label: "All" },
  { id: "most-used", label: "Most Used" },
  { id: "new", label: "New" },
  { id: "developer", label: "Developer" },
];

const categories = ["All", "Text", "Developer", "Utility", "Security", "Productivity", "Media", "Career", "Time & Date", "Finance", "Fun", "Fun + Productivity"];
const categoryOptions = categories.map((item) => ({ value: item, label: item }));
const suggestionCategoryOptions = [
  { value: "New Tool Idea", label: "New Tool Idea" },
  { value: "Bug Report", label: "Bug Report" },
  { value: "UX Improvement", label: "UX Improvement" },
  { value: "General Feedback", label: "General Feedback" },
];

const initialSuggestionForm = {
  name: "",
  email: "",
  category: "New Tool Idea",
  suggestion: "",
};

const RECENT_STORAGE_KEY = "boring_tools_recent";
const USAGE_STORAGE_KEY = "boring_tools_usage_map";

function filterMatch(tool, query, category) {
  const normalized = query.trim().toLowerCase();
  const matchesCategory = category === "All" || tool.category === category;
  const matchesQuery =
    !normalized ||
    tool.name.toLowerCase().includes(normalized) ||
    tool.description.toLowerCase().includes(normalized) ||
    tool.category.toLowerCase().includes(normalized);

  return matchesCategory && matchesQuery;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [category, setCategory] = useState("All");
  const [recentTools, setRecentTools] = useState([]);
  const [usageMap, setUsageMap] = useState({});
  const [upcomingOpen, setUpcomingOpen] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState(initialSuggestionForm);
  const [suggestionQueueCount, setSuggestionQueueCount] = useState(null);
  const [, setSuggestionSync] = useState({ status: "loading", message: "" });
  const [suggestionState, setSuggestionState] = useState({ status: "idle", message: "" });

  const searchRef = useRef(null);

  useEffect(() => {
    let active = true;

    let nextRecent = [];
    try {
      const rawRecent = localStorage.getItem(RECENT_STORAGE_KEY);
      const parsedRecent = JSON.parse(rawRecent || "[]");
      if (Array.isArray(parsedRecent)) {
        nextRecent = parsedRecent;
      }
    } catch {
      nextRecent = [];
    }

    let nextUsage = {};
    try {
      const rawUsage = localStorage.getItem(USAGE_STORAGE_KEY);
      const parsedUsage = JSON.parse(rawUsage || "{}");
      if (parsedUsage && typeof parsedUsage === "object") {
        nextUsage = parsedUsage;
      }
    } catch {
      nextUsage = {};
    }

    const timer = window.setTimeout(() => {
      if (!active) return;
      setRecentTools(nextRecent);
      setUsageMap(nextUsage);
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadSuggestionQueue = async () => {
      try {
        const response = await fetch("/api/suggestions", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!active) {
          return;
        }

        setSuggestionQueueCount(Number.isFinite(data?.total) ? data.total : 0);
        setSuggestionSync({
          status: data?.sheetSync?.status || "disabled",
          message: data?.sheetSync?.message || "",
        });
      } catch {
        if (active) {
          setSuggestionQueueCount(null);
          setSuggestionSync({
            status: "error",
            message: "Unable to read suggestion sync status.",
          });
        }
      }
    };

    loadSuggestionQueue();

    return () => {
      active = false;
    };
  }, []);

  const toolsByUsage = useMemo(() => {
    return [...availableTools].sort((a, b) => (usageMap[b.id] || 0) - (usageMap[a.id] || 0));
  }, [usageMap]);

  const filteredLiveTools = useMemo(() => {
    let base = [...availableTools];

    if (quickFilter === "most-used") {
      const used = toolsByUsage.filter((tool) => (usageMap[tool.id] || 0) > 0);
      base = used.length ? used : toolsByUsage;
    }

    if (quickFilter === "new") {
      base = base.filter((tool) => tool.isNew);
    }

    if (quickFilter === "developer") {
      base = base.filter((tool) => tool.category === "Developer");
    }

    return base.filter((tool) => filterMatch(tool, query, category));
  }, [category, quickFilter, query, toolsByUsage, usageMap]);

  const filteredUpcomingTools = useMemo(() => {
    return allUpcoming.filter((tool) => filterMatch(tool, query, category));
  }, [category, query]);

  const recentCards = useMemo(
    () => recentTools.map((id) => availableTools.find((tool) => tool.id === id)).filter(Boolean),
    [recentTools]
  );

  const featuredTool = availableTools.find((t) => t.id === "truth-or-dare-play") || availableTools.find((tool) => tool.isNew) || availableTools[0];

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const isInput = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

      if (event.key === "/" && !isInput) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Enter" && target === searchRef.current && filteredLiveTools[0]) {
        window.location.href = filteredLiveTools[0].href;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [filteredLiveTools]);

  const handleOpenTool = (toolId) => {
    const nextRecent = [toolId, ...recentTools.filter((id) => id !== toolId)].slice(0, 4);
    setRecentTools(nextRecent);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(nextRecent));

    const nextUsage = {
      ...usageMap,
      [toolId]: (usageMap[toolId] || 0) + 1,
    };
    setUsageMap(nextUsage);
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(nextUsage));
  };

  const handleSuggestionChange = (field, value) => {
    setSuggestionForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSuggestionSubmit = async (event) => {
    event.preventDefault();

    const suggestion = suggestionForm.suggestion.trim();
    if (!suggestion) {
      setSuggestionState({
        status: "error",
        message: "Please add a suggestion before saving it.",
      });
      return;
    }

    setSuggestionState({
      status: "saving",
      message: "Saving locally for spreadsheet sync testing...",
    });

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: suggestionForm.name,
          email: suggestionForm.email,
          category: suggestionForm.category,
          suggestion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to save suggestion");
      }

      setSuggestionQueueCount(Number.isFinite(data?.queued) ? data.queued : suggestionQueueCount);
      setSuggestionSync({
        status: data?.sheetSync?.status || "disabled",
        message: data?.sheetSync?.message || "",
      });
      setSuggestionForm(initialSuggestionForm);
      setSuggestionState({
        status: "success",
        message:
          data?.sheetSync?.status === "synced"
            ? "Thanks! Your suggestion is in and we’ll review it soon."
            : "Thanks! Your suggestion is saved and will be reviewed soon.",
      });
    } catch (error) {
      setSuggestionState({
        status: "error",
        message: error instanceof Error ? error.message : "Suggestion save failed.",
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fffaf1] px-4 py-5 font-sans text-neutral-900 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute top-16 right-0 h-72 w-72 rounded-full bg-yellow-100/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-orange-100/40 blur-3xl" />
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8">
        <header className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">100 Days Build</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-neutral-950 sm:text-6xl">BoringTools</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-700 sm:text-base">
              One practical tool at a time, arranged so users can search, spot, and open the right utility without scrolling through a long catalog.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm">Search-first</span>
              <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm">One theme</span>
              <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm">Quick access</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-[1.75rem] border border-amber-200 bg-white/85 p-4 shadow-[0_20px_50px_rgba(245,158,11,0.08)] backdrop-blur">
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Live</p>
              <p className="mt-1 text-3xl font-black text-neutral-950">{availableTools.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Upcoming</p>
              <p className="mt-1 text-3xl font-black text-neutral-950">{allUpcoming.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Categories</p>
              <p className="mt-1 text-3xl font-black text-neutral-950">{categories.length - 1}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-amber-200 bg-white/90 p-5 shadow-[0_24px_70px_rgba(217,119,6,0.08)] backdrop-blur sm:p-6">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Browse</p>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">Find a tool fast, then keep moving</h2>
              <p className="max-w-2xl text-sm leading-7 text-neutral-700">
                Search is the main path, categories are secondary, and the rest stays tucked away so the page feels light even as the collection grows.
              </p>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-[#fffdf8] px-4 py-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-amber-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tools, press / to focus, Enter opens the first match"
                  className="w-full bg-transparent text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
              </label>

              <div className="flex items-center justify-between gap-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div>
                  <p className="text-xs text-amber-700">Visible live</p>
                  <p className="text-lg font-bold text-neutral-950">{filteredLiveTools.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-amber-700">Category</p>
                  <p className="text-lg font-bold text-neutral-950">{category}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {quickFilters.map((filter) => {
                const active = quickFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setQuickFilter(filter.id)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20"
                        : "border-amber-200 bg-white text-neutral-700 hover:border-amber-400 hover:text-amber-700"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-neutral-700">
                Showing <span className="font-semibold text-neutral-950">{filteredLiveTools.length}</span> live tool(s)
                {query ? (
                  <>
                    {" "}for <span className="font-semibold text-neutral-950">&quot;{query}&quot;</span>
                  </>
                ) : null}
              </p>
              <div className="flex items-center gap-2 sm:min-w-[280px]">
                <span className="text-sm text-neutral-500">More categories</span>
                <div className="relative w-full max-w-[220px]">
                  <ThemedDropdown ariaLabel="Select more categories" value={category} options={categoryOptions} onChange={setCategory} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <section className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-[0_24px_70px_rgba(217,119,6,0.08)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Featured today</p>
                  <p className="mt-1 text-2xl font-bold text-neutral-950">{featuredTool.name}</p>
                </div>
                <a
                  href={featuredTool.href}
                  onClick={() => handleOpenTool(featuredTool.id)}
                  className="shrink-0 rounded-xl border border-amber-500 bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600"
                >
                  Try now
                </a>
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{featuredTool.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-amber-100 bg-white p-3">
                  <p className="text-xs text-amber-700">Live today</p>
                  <p className="mt-1 text-base font-bold text-neutral-950">Ready now</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-white p-3">
                  <p className="text-xs text-amber-700">Current mode</p>
                  <p className="mt-1 text-base font-bold text-neutral-950">Single palette</p>
                </div>
              </div>
            </section>

            {recentCards.length > 0 && (
              <section className="rounded-[2rem] border border-amber-200 bg-white/90 p-5 shadow-[0_16px_40px_rgba(245,158,11,0.06)] backdrop-blur sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Recently used</p>
                    <p className="mt-1 text-lg font-bold text-neutral-950">Tap a tool you already know</p>
                  </div>
                  <span className="text-xs text-neutral-500">Last {recentCards.length}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recentCards.map((tool) => (
                    <a
                      key={tool.id}
                      href={tool.href}
                      onClick={() => handleOpenTool(tool.id)}
                      className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 transition hover:border-amber-400 hover:bg-amber-100"
                    >
                      {tool.name}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-950 sm:text-xl">Live tools</h2>
              <p className="text-sm text-neutral-500">Ready now</p>
            </div>
            <p className="text-sm font-medium text-amber-700">Fast open</p>
          </div>

          {filteredLiveTools.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-amber-300 bg-white/90 p-8 text-center shadow-sm">
              <p className="font-semibold text-neutral-950">No matching live tool found</p>
              <p className="mt-1 text-sm text-neutral-500">Try another query or tap a quick keyword.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["text", "json", "password", "convert"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuery(preset)}
                    className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-800 transition hover:border-amber-400 hover:bg-amber-50"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 sm:gap-4">
              {filteredLiveTools.map((tool, index) => (
                <a
                  key={tool.id}
                  href={tool.href}
                  onClick={() => handleOpenTool(tool.id)}
                  className="bt-card flex flex-col gap-3 rounded-[1.5rem] border border-amber-200 bg-white p-4 shadow-[0_18px_40px_rgba(217,119,6,0.06)] transition hover:-translate-y-0.5 hover:border-amber-400 sm:p-5"
                  style={{ animationDelay: `${index * 35}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-amber-700">{tool.category}</p>
                      <h3 className="mt-1 text-lg font-bold leading-tight text-neutral-950">{tool.name}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">{tool.status}</span>
                      {tool.isNew && <span className="rounded-full border border-amber-500 bg-amber-500 px-2 py-1 text-[11px] font-semibold text-white">New</span>}
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-neutral-700">{tool.description}</p>

                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
                    Open
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 21 12m0 0-3.75 5.25M21 12H3" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setUpcomingOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] border border-amber-200 bg-white/90 px-4 py-4 text-left shadow-sm transition hover:border-amber-400"
          >
            <div>
              <p className="text-lg font-bold text-neutral-950 sm:text-xl">Upcoming tools</p>
              <p className="text-sm text-neutral-500">{filteredUpcomingTools.length} planned</p>
            </div>
            <span className="text-sm font-semibold text-amber-700">{upcomingOpen ? "Hide" : "Show"}</span>
          </button>

          {upcomingOpen && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 sm:gap-4">
              {filteredUpcomingTools.map((tool) => (
                <div key={tool.id} className="flex flex-col gap-3 rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/50 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.14em] text-amber-700">{tool.category}</p>
                    <span className="rounded-full border border-amber-200 bg-white px-2 py-1 text-[11px] font-semibold text-amber-700">{tool.eta}</span>
                  </div>
                  <h4 className="text-base font-bold leading-tight text-neutral-950">{tool.name}</h4>
                  <p className="text-sm leading-6 text-neutral-700">{tool.description}</p>
                  <button
                    type="button"
                    disabled
                    className="mt-auto cursor-not-allowed rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-700"
                  >
                    Coming soon
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-amber-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(245,158,11,0.06)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Add your suggestion</p>
              <h2 className="mt-1 text-2xl font-black text-neutral-950">Tell us the boring problem you want solved</h2>
              <p className="mt-2 text-sm leading-7 text-neutral-700">Suggestion pipeline is currently under development, but the form stays here so the feedback path remains visible.</p>
            </div>
            <div className="min-w-[160px] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-right">
              <p className="text-xs text-amber-700">Share an idea</p>
              <p className="text-sm font-semibold text-neutral-950">Help shape the next tool</p>
              <p className="mt-1 text-[11px] text-neutral-500">Tell us the boring problem you want solved.</p>
            </div>
          </div>

          <form className="mt-5 grid grid-cols-1 gap-3" onSubmit={handleSuggestionSubmit}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-white p-4">
                <span className="text-xs uppercase tracking-[0.14em] text-amber-700">Name</span>
                <input
                  type="text"
                  value={suggestionForm.name}
                  onChange={(event) => handleSuggestionChange("name", event.target.value)}
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  placeholder="Optional"
                />
              </label>

              <label className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-white p-4">
                <span className="text-xs uppercase tracking-[0.14em] text-amber-700">Email</span>
                <input
                  type="email"
                  value={suggestionForm.email}
                  onChange={(event) => handleSuggestionChange("email", event.target.value)}
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  placeholder="Optional"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[220px_1fr]">
              <label className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-white p-4">
                <span className="text-xs uppercase tracking-[0.14em] text-amber-700">Suggestion type</span>
                <ThemedDropdown
                  ariaLabel="Select suggestion type"
                  value={suggestionForm.category}
                  options={suggestionCategoryOptions}
                  onChange={(value) => handleSuggestionChange("category", value)}
                />
              </label>

              <label className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-white p-4">
                <span className="text-xs uppercase tracking-[0.14em] text-amber-700">Suggestion</span>
                <textarea
                  rows={5}
                  value={suggestionForm.suggestion}
                  onChange={(event) => handleSuggestionChange("suggestion", event.target.value)}
                  className="w-full resize-none bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  placeholder="Tell us the boring problem you want solved and how you expect it to behave."
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-xs leading-6 text-neutral-500">Thanks for helping us improve the collection.</p>
              <button
                type="submit"
                disabled={suggestionState.status === "saving"}
                className="rounded-2xl border border-amber-500 bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {suggestionState.status === "saving" ? "Saving..." : "Save suggestion"}
              </button>
            </div>

            {suggestionState.message ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  suggestionState.status === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : suggestionState.status === "error"
                      ? "border-rose-200 bg-rose-50 text-rose-900"
                      : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
                role="status"
              >
                {suggestionState.message}
              </div>
            ) : null}
          </form>
        </section>

        <footer className="flex flex-col items-start justify-between gap-3 rounded-[1.75rem] border border-amber-200 bg-white/90 p-4 text-sm text-neutral-600 backdrop-blur sm:flex-row sm:items-center sm:p-5">
          <p>Build in public: one practical tool every day.</p>
          <div className="flex flex-wrap items-center gap-3 text-amber-700">
            <a href="/about" className="hover:underline">About</a>
            <a href="/contact" className="hover:underline">Contact</a>
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
          </div>
          <p className="font-semibold text-neutral-950">BoringTools</p>
        </footer>
      </main>

      <style jsx global>{`
        .bt-card {
          opacity: 0;
          transform: translateY(8px);
          animation: bt-card-in 280ms ease forwards;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes bt-card-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        html {
          font-family: var(--font-geist-sans), "Helvetica Neue", Arial, "system-ui", sans-serif;
        }
      `}</style>
    </div>
  );
}

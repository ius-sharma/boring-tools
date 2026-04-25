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
    isNew: true,
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    href: "/unit-converter",
    category: "Utility",
    description: "Convert length, weight, temperature.",
    status: "Live",
  },
];

const upcomingTools = [
  {
    id: "file-name-sanitizer",
    name: "File Name Sanitizer",
    category: "Utility",
    description: "Clean unsafe or messy filenames.",
    eta: "Coming Soon",
  },
  {
    id: "roast-my-todo-list",
    name: "Roast My To-Do List",
    category: "Fun + Productivity",
    description: "Playful roast with practical next steps.",
    eta: "Coming Soon",
  },
  {
    id: "markdown-previewer",
    name: "Markdown Previewer",
    category: "Developer",
    description: "Write markdown and preview instantly.",
    eta: "Coming Soon",
  },
  {
    id: "pomodoro-timer",
    name: "Pomodoro Timer",
    category: "Productivity",
    description: "Focus sessions with timer cycles.",
    eta: "Coming Soon",
  },
  {
    id: "image-compressor",
    name: "Image Compressor / Resizer",
    category: "Media",
    description: "Compress and resize images quickly.",
    eta: "Coming Soon",
  },
];

const quickFilters = [
  { id: "all", label: "All" },
  { id: "most-used", label: "Most Used" },
  { id: "new", label: "New" },
  { id: "developer", label: "Developer" },
];

const categories = ["All", "Text", "Developer", "Utility", "Security", "Productivity", "Media", "Fun + Productivity"];
const categoryOptions = categories.map((item) => ({ value: item, label: item }));

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

  const searchRef = useRef(null);

  useEffect(() => {
    try {
      const rawRecent = localStorage.getItem(RECENT_STORAGE_KEY);
      const parsedRecent = JSON.parse(rawRecent || "[]");
      if (Array.isArray(parsedRecent)) {
        setRecentTools(parsedRecent);
      }
    } catch {
      setRecentTools([]);
    }

    try {
      const rawUsage = localStorage.getItem(USAGE_STORAGE_KEY);
      const parsedUsage = JSON.parse(rawUsage || "{}");
      if (parsedUsage && typeof parsedUsage === "object") {
        setUsageMap(parsedUsage);
      }
    } catch {
      setUsageMap({});
    }
  }, []);

  const toolsByUsage = useMemo(() => {
    return [...tools].sort((a, b) => (usageMap[b.id] || 0) - (usageMap[a.id] || 0));
  }, [usageMap]);

  const filteredLiveTools = useMemo(() => {
    let base = [...tools];

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
    return upcomingTools.filter((tool) => filterMatch(tool, query, category));
  }, [category, query]);

  const recentCards = useMemo(
    () => recentTools.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean),
    [recentTools]
  );

  const featuredTool = tools.find((tool) => tool.isNew) || tools[0];

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

  return (
    <div className="relative min-h-screen bg-neutral-50 p-4 sm:p-6 font-sans overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-28 -left-16 h-80 w-80 rounded-full bg-neutral-200 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-neutral-300 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur p-5 sm:p-8 shadow-xl flex flex-col gap-5 sm:gap-6">
        <header className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6 flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">100 Days Build</p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 mt-1">BoringTools</h1>
            <p className="text-neutral-600 mt-2 text-sm sm:text-base">Small tools for boring problems. Fast, local, no login.</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 min-w-[170px]">
            <p className="text-xs text-neutral-500">Live / Upcoming</p>
            <p className="text-2xl font-bold text-neutral-900">{tools.length} / {upcomingTools.length}</p>
          </div>
        </header>

        <section className="sticky top-3 z-20 rounded-2xl border border-neutral-200 bg-white backdrop-blur p-4 sm:p-5 shadow-sm flex flex-col gap-3">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
            <label className="rounded-xl border border-neutral-200 bg-white px-4 py-3 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools (press / to focus, Enter to open first)"
                className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
            </label>
            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 flex items-center justify-between gap-6">
              <div>
                <p className="text-xs text-neutral-500">Visible live</p>
                <p className="text-lg font-semibold text-neutral-900">{filteredLiveTools.length}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Category</p>
                <p className="text-lg font-semibold text-neutral-900">{category}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {quickFilters.map((filter) => {
              const active = quickFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setQuickFilter(filter.id)}
                  className={`shrink-0 px-3 py-2 rounded-lg text-sm font-semibold border transition ${
                    active
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-neutral-600">
              Showing <span className="font-semibold text-neutral-900">{filteredLiveTools.length}</span> live tool(s)
              {query ? (
                <>
                  {" "}for <span className="font-semibold text-neutral-900">"{query}"</span>
                </>
              ) : null}
              .
            </p>
            <div className="flex items-center gap-2 sm:min-w-[280px]">
              <span className="text-sm text-neutral-500">More categories</span>
              <ThemedDropdown
                ariaLabel="Select more categories"
                value={category}
                options={categoryOptions}
                onChange={setCategory}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Featured today</p>
            <p className="text-base font-semibold text-neutral-900 mt-1">{featuredTool.name}</p>
            <p className="text-sm text-neutral-600">{featuredTool.description}</p>
          </div>
          <a
            href={featuredTool.href}
            onClick={() => handleOpenTool(featuredTool.id)}
            className="shrink-0 border border-neutral-900 text-neutral-900 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-neutral-900 hover:text-white transition"
          >
            Try Now
          </a>
        </section>

        {recentCards.length > 0 && (
          <details className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
              <span className="text-base sm:text-lg font-semibold text-neutral-900">Recently Used</span>
              <span className="text-xs text-neutral-500">Last {recentCards.length}</span>
            </summary>
            <div className="flex flex-wrap gap-2 mt-3">
              {recentCards.map((tool) => (
                <a
                  key={tool.id}
                  href={tool.href}
                  onClick={() => handleOpenTool(tool.id)}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:border-neutral-900 hover:text-neutral-900 transition"
                >
                  {tool.name}
                </a>
              ))}
            </div>
          </details>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">Live Tools</h2>
            <p className="text-sm text-neutral-500">Ready now</p>
          </div>

          {filteredLiveTools.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
              <p className="text-neutral-900 font-semibold">No matching live tool found</p>
              <p className="text-sm text-neutral-500 mt-1">Try another query or tap a quick keyword.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["text", "json", "password", "convert"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuery(preset)}
                    className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 hover:border-neutral-900"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredLiveTools.map((tool, index) => (
                <a
                  key={tool.id}
                  href={tool.href}
                  onClick={() => handleOpenTool(tool.id)}
                  className="bt-card rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 flex flex-col gap-3 hover:border-neutral-900 hover:-translate-y-0.5 transition"
                  style={{ animationDelay: `${index * 35}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">{tool.category}</p>
                      <h3 className="mt-1 text-lg font-semibold text-neutral-900 leading-tight">{tool.name}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-semibold rounded-full border border-neutral-300 px-2 py-1 text-neutral-700">{tool.status}</span>
                      {tool.isNew && <span className="text-[11px] font-semibold rounded-full border border-neutral-900 bg-neutral-900 text-white px-2 py-1">New</span>}
                    </div>
                  </div>

                  <p className="text-sm text-neutral-600">{tool.description}</p>

                  <span className="text-sm font-semibold text-neutral-900 inline-flex items-center gap-1 mt-auto">
                    Open
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
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
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left flex items-center justify-between gap-4 hover:border-neutral-900 transition"
          >
            <div>
              <p className="text-lg sm:text-xl font-semibold text-neutral-900">Upcoming Tools</p>
              <p className="text-sm text-neutral-500">{filteredUpcomingTools.length} planned</p>
            </div>
            <span className="text-sm font-semibold text-neutral-700">{upcomingOpen ? "Hide" : "Show"}</span>
          </button>

          {upcomingOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredUpcomingTools.map((tool) => (
                <div
                  key={tool.id}
                  className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 sm:p-5 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">{tool.category}</p>
                    <span className="text-[11px] font-semibold rounded-full border border-neutral-300 bg-white px-2 py-1 text-neutral-600">{tool.eta}</span>
                  </div>
                  <h4 className="text-base font-semibold text-neutral-900 leading-tight">{tool.name}</h4>
                  <p className="text-sm text-neutral-600">{tool.description}</p>
                  <button
                    type="button"
                    disabled
                    className="mt-auto rounded-lg border border-neutral-300 bg-white text-neutral-500 px-3 py-2 text-sm font-semibold cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Add your suggestion</p>
              <h2 className="text-2xl font-bold text-neutral-900 mt-1">Tell us the boring problem you want solved</h2>
              <p className="text-sm text-neutral-600 mt-2">Suggestion pipeline is currently under development. Submission form will be enabled soon.</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-right min-w-[160px]">
              <p className="text-xs text-neutral-500">Suggestion box</p>
              <p className="text-sm font-semibold text-neutral-900">Coming Soon</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
            <textarea
              disabled
              rows={4}
              className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 placeholder:text-neutral-500 cursor-not-allowed"
              placeholder="Suggestion intake is under development. This will be available soon."
            />
            <div className="flex flex-col gap-3 min-w-[220px]">
              <button
                type="button"
                disabled
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-500 cursor-not-allowed"
              >
                Coming Soon
              </button>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-xs text-neutral-500 leading-6">
                Planned workflow:
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-neutral-200 px-2 py-1">structured suggestion capture</span>
                  <span className="rounded-full border border-neutral-200 px-2 py-1">direct spreadsheet sync</span>
                  <span className="rounded-full border border-neutral-200 px-2 py-1">maintained queue</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600 flex flex-wrap items-center justify-between gap-3">
          <p>Build in public: one practical tool every day.</p>
          <p className="font-medium text-neutral-900">BoringTools</p>
        </footer>
      </div>

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

        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

const tools = [
  {
    id: "text-formatter",
    name: "Text Formatter",
    href: "/text-formatter",
    category: "Text",
    description: "Clean and transform text instantly.",
    meta: "Fast",
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    href: "/json-formatter",
    category: "Developer",
    description: "Format and validate JSON in one click.",
    meta: "No upload",
  },
  {
    id: "word-counter",
    name: "Word Counter",
    href: "/word-counter",
    category: "Text",
    description: "Count words, characters, and lines quickly.",
    meta: "Instant",
  },
  {
    id: "password-generator",
    name: "Password Generator",
    href: "/password-generator",
    category: "Security",
    description: "Generate strong passwords with custom rules.",
    meta: "Secure",
  },
  {
    id: "age-calculator",
    name: "Age Calculator",
    href: "/age-calculator",
    category: "Utility",
    description: "Get exact age from date of birth.",
    meta: "Simple",
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    href: "/unit-converter",
    category: "Utility",
    description: "Convert length, weight, and temperature.",
    meta: "Precise",
  },
  {
    id: "qr-generator",
    name: "QR Generator",
    href: "/qr-generator",
    category: "Developer",
    description: "Create downloadable QR codes from any text.",
    meta: "Share-ready",
  },
  {
    id: "markdown-previewer",
    name: "Markdown Previewer",
    href: "/markdown-previewer",
    category: "Developer",
    description: "Write markdown and preview in real-time.",
    meta: "Live",
  },
  {
    id: "pomodoro-timer",
    name: "Pomodoro Timer",
    href: "/pomodoro-timer",
    category: "Productivity",
    description: "Focus with work-break timer sessions.",
    meta: "Focus",
  },
  {
    id: "image-compressor",
    name: "Image Compressor / Resizer",
    href: "/image-compressor",
    category: "Media",
    description: "Resize and compress images in browser.",
    meta: "Local",
    isNew: true,
  },
];

const categories = ["All", "Text", "Developer", "Utility", "Productivity", "Security", "Media"];
const RECENT_STORAGE_KEY = "boring_tools_recent";

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [recentTools, setRecentTools] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecentTools(parsed);
      }
    } catch {
      setRecentTools([]);
    }
  }, []);

  const filteredTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
      const matchesSearch =
        !normalized ||
        tool.name.toLowerCase().includes(normalized) ||
        tool.description.toLowerCase().includes(normalized) ||
        tool.category.toLowerCase().includes(normalized);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, query]);

  const featuredTool = tools.find((tool) => tool.isNew) || tools[0];
  const recentToolCards = useMemo(
    () => recentTools.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean),
    [recentTools]
  );

  const handleToolVisit = (toolId) => {
    const next = [toolId, ...recentTools.filter((id) => id !== toolId)].slice(0, 4);
    setRecentTools(next);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div className="relative min-h-screen bg-neutral-50 p-4 sm:p-6 font-sans overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-28 -left-16 h-80 w-80 rounded-full bg-neutral-200 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-neutral-300 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur p-5 sm:p-8 shadow-xl flex flex-col gap-6 sm:gap-8">
        <header className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">100 Days Build</p>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 mt-1">BoringTools</h1>
              <p className="text-neutral-600 mt-2 text-sm sm:text-base">Daily utility tools. Zero login. Instant results in your browser.</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-right min-w-[150px]">
              <p className="text-xs text-neutral-500">Available tools</p>
              <p className="text-2xl font-bold text-neutral-900">{tools.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
            <label className="rounded-xl border border-neutral-200 bg-white px-4 py-3 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools by name, purpose, or category"
                className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
            </label>
            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 flex items-center justify-between gap-8">
              <div>
                <p className="text-xs text-neutral-500">Visible</p>
                <p className="text-lg font-semibold text-neutral-900">{filteredTools.length}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Category</p>
                <p className="text-lg font-semibold text-neutral-900">{activeCategory}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`bt-chip px-3 py-2 rounded-lg text-sm font-semibold border transition ${isActive ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"}`}
              >
                {category}
              </button>
            );
          })}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Featured</p>
              <h2 className="text-2xl font-bold text-neutral-900 mt-1">{featuredTool.name}</h2>
              <p className="text-neutral-600 text-sm mt-2 max-w-2xl">{featuredTool.description} Perfect for reducing file size before sharing or upload.</p>
            </div>
            <a
              href={featuredTool.href}
              onClick={() => handleToolVisit(featuredTool.id)}
              className="border border-neutral-900 text-neutral-900 py-2.5 px-5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-neutral-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              Try Now
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 21 12m0 0-3.75 5.25M21 12H3" />
              </svg>
            </a>
          </div>
        </section>

        {recentToolCards.length > 0 && (
          <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-neutral-900">Recently Used</h2>
              <span className="text-xs text-neutral-500">Last {recentToolCards.length} tools</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentToolCards.map((tool) => (
                <a
                  key={tool.id}
                  href={tool.href}
                  onClick={() => handleToolVisit(tool.id)}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:border-neutral-900 hover:text-neutral-900 transition"
                >
                  {tool.name}
                </a>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">All Tools</h2>
            <p className="text-sm text-neutral-500">Runs directly in your browser</p>
          </div>

          {filteredTools.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
              <p className="text-neutral-900 font-semibold">No matching tool found</p>
              <p className="text-sm text-neutral-500 mt-1">Try another search or switch category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredTools.map((tool, index) => (
                <a
                  key={tool.id}
                  href={tool.href}
                  onClick={() => handleToolVisit(tool.id)}
                  className="bt-card rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 flex flex-col gap-4 hover:border-neutral-900 hover:-translate-y-0.5 transition"
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">{tool.category}</p>
                      <h3 className="mt-1 text-lg font-semibold text-neutral-900 leading-tight">{tool.name}</h3>
                    </div>
                    {tool.isNew && (
                      <span className="text-xs font-semibold rounded-full border border-neutral-900 text-neutral-900 px-2 py-1">New</span>
                    )}
                  </div>

                  <p className="text-sm text-neutral-600 min-h-[42px]">{tool.description}</p>

                  <div className="flex items-center justify-between gap-3 mt-auto">
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600">{tool.meta}</span>
                    <span className="text-sm font-semibold text-neutral-900 inline-flex items-center gap-1">
                      Open
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 21 12m0 0-3.75 5.25M21 12H3" />
                      </svg>
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
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
          animation: bt-card-in 320ms ease forwards;
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
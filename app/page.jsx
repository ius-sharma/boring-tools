"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ThemedDropdown from "./components/ThemedDropdown";

const tools = [
  { id: "text-formatter", name: "Text Formatter", href: "/text-formatter", category: "Text", description: "Clean and transform text instantly.", status: "Live" },
  { id: "json-formatter", name: "JSON Formatter", href: "/json-formatter", category: "Developer", description: "Format and validate JSON in one click.", status: "Live" },
  { id: "word-counter", name: "Word Counter", href: "/word-counter", category: "Text", description: "Count words and characters quickly.", status: "Live" },
  { id: "password-generator", name: "Password Generator", href: "/password-generator", category: "Security", description: "Generate secure passwords with options.", status: "Live" },
  { id: "age-calculator", name: "Age Calculator", href: "/age-calculator", category: "Utility", description: "Calculate age from date of birth.", status: "Live" },
  { id: "qr-generator", name: "QR Generator", href: "/qr-generator", category: "Developer", description: "Generate downloadable QR from text.", status: "Live" },
  { id: "unit-converter", name: "Unit Converter", href: "/unit-converter", category: "Utility", description: "Convert length, weight, temperature.", status: "Live" },
  { id: "file-name-sanitizer", name: "File Name Sanitizer", href: "/file-name-sanitizer", category: "Utility", description: "Clean unsafe or messy filenames.", status: "Live" },
  { id: "image-compressor", name: "Image Compressor / Resizer", href: "/image-compressor", category: "Media", description: "Compress and resize images quickly.", status: "Live", isNew: true, isFeatured: true },
  { id: "resume-bullet-rewriter", name: "Resume Bullet Rewriter", href: "/resume-bullet-rewriter", category: "Career", description: "Turn rough notes into strong resume bullets.", status: "Live", isNew: true, isFeatured: true },
  { id: "time-zone-converter", name: "Time Zone Converter", href: "/time-zone-converter", category: "Time & Date", description: "Convert meeting times across time zones.", status: "Live", isNew: true },
  { id: "to-do-list", name: "To-Do List", href: "/to-do-list", category: "Productivity", description: "Track tasks locally with saved progress.", status: "Live", isNew: true },
  { id: "gst-calculator", name: "GST Calculator", href: "/gst-calculator", category: "Finance", description: "Calculate GST-inclusive and exclusive totals.", status: "Live", isNew: true },
  { id: "truth-or-dare-play", name: "Truth or Dare Play", href: "/truth-or-dare-play", category: "Fun", description: "Spin up a clean truth-or-dare game quickly.", status: "Live", isNew: true },
  { id: "pomodoro-timer", name: "Pomodoro Timer", href: "/pomodoro-timer", category: "Productivity", description: "Focus sessions with timer cycles.", status: "Live" },
  { id: "roast-my-todo-list", name: "Roast My To-Do List", href: "/roast-my-todo-list", category: "Fun + Productivity", description: "Playful roast with practical next steps.", status: "Live", isNew: true },
  { id: "markdown-previewer", name: "Markdown Previewer", href: "/markdown-previewer", category: "Developer", description: "Write markdown and preview instantly.", status: "Live", isNew: true },
  { id: "video-transcriber", name: "Video Transcriber", href: "/video-transcriber", category: "Media", description: "Transcribe video audio to text quickly and accurately.", status: "Live", isNew: true },
  { id: "youtube-title-generator", name: "YouTube Title Generator", href: "/youtube-title-generator", category: "Media", description: "Generate clickable title ideas for your next video.", status: "Live", isNew: true, isFeatured: true },
  { id: "linkedin-post-formatter", name: "LinkedIn Post Formatter", href: "/linkedin-post-formatter", category: "Professional", description: "Create engaging LinkedIn posts tailored to your audience.", status: "Live", isNew: true },
  { id: "what-happened-today", name: "What Happened Today In History", href: "/what-happened-today", category: "Learning", description: "Discover major historical events that happened on this day.", status: "Live", isNew: true },
  { id: "math-formula-calculator", name: "Math Formula Calculator", href: "/math-formula-calculator", category: "Education", description: "Calculate algebra, geometry, trigonometry, and statistics formulas.", status: "Upcoming" },
  { id: "science-formulas-calculator", name: "Science Formulas Calculator", href: "/science-formulas-calculator", category: "Education", description: "Physics, chemistry, and biology formulas with step-by-step solutions.", status: "Upcoming" },
  { id: "base-converter", name: "Base Converter", href: "/base-converter", category: "Developer", description: "Convert Binary, Decimal, Octal, and Hex instantly.", status: "Live" },
   { id: "aspect-ratio-calculator", name: "Aspect Ratio Calculator", href: "/aspect-ratio-calculator", category: "Developer", description: "Resize images while preserving aspect ratio.", status: "Live", isNew: true },
  { id: "distance-between-cities", name: "Distance Between Cities", href: "/distance-between-cities", category: "Utility", description: "Compute straight-line distance and travel estimates.", status: "Live", isNew: true },
  { id: "currency-converter", name: "Currency Converter", href: "/currency-converter", category: "Finance", description: "Quick currency conversions with optional historical rates.", status: "Live", isNew: true },
];

const liveToolIds = new Set([
  "text-formatter", "json-formatter", "word-counter", "password-generator", "age-calculator", "unit-converter", "qr-generator", "file-name-sanitizer", "pomodoro-timer", "image-compressor", "resume-bullet-rewriter", "gst-calculator", "to-do-list", "time-zone-converter", "truth-or-dare-play", "roast-my-todo-list", "markdown-previewer", "video-transcriber", "youtube-title-generator", "base-converter", "aspect-ratio-calculator", "distance-between-cities", "currency-converter", "linkedin-post-formatter", "what-happened-today"
]);

const availableTools = tools.filter((t) => liveToolIds.has(t.id));
const liveToolCount = availableTools.length;
const upcomingToolCount = tools.filter((t) => t.status === "Upcoming").length;

const suggestionCategoryOptions = [
  { value: "New Tool Idea", label: "New Tool Idea" },
  { value: "Bug Report", label: "Bug Report" },
  { value: "UX Improvement", label: "UX Improvement" },
  { value: "General Feedback", label: "General Feedback" },
];

const initialSuggestionForm = { name: "", email: "", category: "New Tool Idea", suggestion: "" };

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestionForm, setSuggestionForm] = useState(initialSuggestionForm);
  const [suggestionState, setSuggestionState] = useState({ status: "idle", message: "" });
  const [toolsToShow, setToolsToShow] = useState(6);
  const searchRef = useRef(null);
  const findToolsRef = useRef(null);

  const categories = useMemo(() => {
    const set = new Set(availableTools.map((t) => t.category));
    return Array.from(set).sort();
  }, [availableTools]);

  const filteredTools = useMemo(() => {
    if (!query.trim()) return availableTools;
    
    // Check if query matches a category exactly (from category button clicks)
    const isCategory = categories.includes(query);
    
    if (isCategory) {
      // If it's a category, filter by category only
      return availableTools.filter((t) => t.category === query);
    }
    
    // Otherwise, do broader search (name, description, category)
    const normalized = query.toLowerCase();
    return availableTools.filter((t) => t.name.toLowerCase().includes(normalized) || t.description.toLowerCase().includes(normalized) || t.category.toLowerCase().includes(normalized));
  }, [query]);

  const featuredTools = useMemo(() => {
    const featuredPinned = availableTools.filter((t) => t.isFeatured);
    const newTools = availableTools.filter((t) => t.isNew && !t.isFeatured);
    const combined = [...featuredPinned, ...newTools];
    return combined.length > 0 ? combined.slice(0, 3) : availableTools.slice(0, 3);
  }, [availableTools]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "/" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setToolsToShow(6);
  }, [query]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const focus = params.get("focus");
        if (focus === "tools") {
          setTimeout(() => {
            findToolsRef.current?.scrollIntoView({ behavior: "smooth" });
            window.history.replaceState(null, "", window.location.pathname + window.location.hash);
          }, 150);
        }
      }
    } catch (e) {}
  }, []);

  const handleSuggestionChange = (field, value) => {
    setSuggestionForm((current) => ({ ...current, [field]: value }));
  };

  const handleSuggestionSubmit = async (event) => {
    event.preventDefault();
    const suggestion = suggestionForm.suggestion.trim();
    if (!suggestion) {
      setSuggestionState({ status: "error", message: "Please add a suggestion." });
      return;
    }

    setSuggestionState({ status: "saving", message: "Saving your suggestion..." });
    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: suggestionForm.name,
          email: suggestionForm.email,
          category: suggestionForm.category,
          suggestion,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setSuggestionForm(initialSuggestionForm);
      setSuggestionState({ status: "success", message: "Thanks! Your suggestion is saved." });
      setTimeout(() => setSuggestionState({ status: "idle", message: "" }), 3000);
    } catch {
      setSuggestionState({ status: "error", message: "Failed to save suggestion. Try again." });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 sm:pt-24 lg:pt-32 pb-12 sm:pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-orange-200/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-600 mb-4">Built daily in public</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6">BoringTools</h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              100 practical tools. Built in 100 days. No signup. No clutter. Just what you need.
            </p>
            <div className="mb-8 flex justify-center gap-6 text-sm sm:text-base">
              <span className="text-slate-700 font-semibold">
                <span className="text-orange-600 font-bold">{liveToolCount}</span> Tools Live
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-700 font-semibold">
                <span className="text-orange-600 font-bold">{upcomingToolCount}</span> Coming Soon
              </span>
            </div>
            <a
              href="#explore"
              onClick={() => document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Explore Tools
            </a>
          </div>
        </div>
      </section>

      {/* Quick Value Points */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-sm font-semibold text-orange-600 mb-1">No Signup</p>
              <p className="text-slate-600 text-xs">Use instantly, no account needed</p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-sm font-semibold text-orange-600 mb-1">Free Forever</p>
              <p className="text-slate-600 text-xs">All tools are completely free</p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-sm font-semibold text-orange-600 mb-1">Fast & Simple</p>
              <p className="text-slate-600 text-xs">Minimal UI, instant results</p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-sm font-semibold text-orange-600 mb-1">Browser-Based</p>
              <p className="text-slate-600 text-xs">Works offline, saves locally</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section id="featured" className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Featured Tools</h2>
            <p className="text-slate-600">Try these popular and newly added utilities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <a
                key={tool.id}
                href={tool.href}
                className="block p-6 rounded-xl border border-slate-200 bg-white hover:border-orange-400 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-orange-600 uppercase">{tool.category}</span>
                  {tool.isNew && <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded">New</span>}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{tool.name}</h3>
                <p className="text-sm text-slate-600">{tool.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Browse by Category</h2>
            <p className="text-slate-600">Find tools for your needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => {
              const count = availableTools.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setQuery(cat);
                    setTimeout(() => findToolsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50 transition text-center"
                >
                  <p className="font-semibold text-slate-900 mb-1">{cat}</p>
                  <p className="text-xs text-slate-500">{count} tools</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">How It Works</h2>
            <p className="text-slate-600">Three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg mx-auto mb-4">1</div>
              <h3 className="font-bold text-slate-900 mb-2">Search or Browse</h3>
              <p className="text-sm text-slate-600">Find a tool by searching or browsing categories</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg mx-auto mb-4">2</div>
              <h3 className="font-bold text-slate-900 mb-2">Use Instantly</h3>
              <p className="text-sm text-slate-600">No signup required, use immediately in your browser</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg mx-auto mb-4">3</div>
              <h3 className="font-bold text-slate-900 mb-2">Copy & Go</h3>
              <p className="text-sm text-slate-600">Copy results or save to local storage instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Built For</h2>
            <p className="text-slate-600">All kinds of users</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Students", desc: "Convert units, format code, check grammar" },
              { title: "Developers", desc: "Format JSON, convert bases, generate QR codes" },
              { title: "Creators", desc: "Compress images, write better resumes, count words" },
              { title: "Everyone", desc: "Daily utilities, productivity tools, fun games" },
            ].map((use, i) => (
              <div key={i} className="p-6 rounded-lg border border-slate-200 bg-white">
                <h3 className="font-bold text-slate-900 mb-2">For {use.title}</h3>
                <p className="text-sm text-slate-600">{use.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="find-tools" ref={findToolsRef} className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Find Your Tool</h2>
            <div className="relative mb-8">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools... (press / to focus)"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No tools found for "{query}"</p>
              <button onClick={() => setQuery("")} className="text-orange-600 hover:text-orange-700 font-semibold">
                Clear search
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.slice(0, toolsToShow).map((tool) => (
                  <a
                    key={tool.id}
                    href={tool.href}
                    className="p-4 rounded-lg border border-slate-200 bg-white hover:border-orange-400 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold text-orange-600 uppercase">{tool.category}</span>
                      {tool.isNew && <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded">New</span>}
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{tool.name}</h3>
                    <p className="text-sm text-slate-600">{tool.description}</p>
                  </a>
                ))}
              </div>

              {toolsToShow < filteredTools.length && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setToolsToShow((prev) => prev + 5)}
                    className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
                  >
                    Show More Tools
                  </button>
                  <p className="text-slate-500 text-sm mt-3">
                    Showing {toolsToShow} of {filteredTools.length} tools
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Upcoming Tools */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Coming Soon</h2>
            <p className="text-slate-600">Tools we're working on for you</p>
          </div>

          {tools.filter((t) => t.status === "Upcoming").length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No upcoming tools yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.filter((t) => t.status === "Upcoming").map((tool) => (
                <div
                  key={tool.id}
                  className="p-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 opacity-75"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase">{tool.category}</span>
                    <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-1 rounded">Coming Soon</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{tool.name}</h3>
                  <p className="text-sm text-slate-600">{tool.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Suggestion Section */}
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Help Shape the Collection</h2>
            <p className="text-slate-600">Got an idea? Send us your feedback and suggestions.</p>
          </div>

          <form onSubmit={handleSuggestionSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={suggestionForm.name}
                onChange={(e) => handleSuggestionChange("name", e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="email"
                placeholder="Your email (optional)"
                value={suggestionForm.email}
                onChange={(e) => handleSuggestionChange("email", e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="mb-4">
              <ThemedDropdown
                ariaLabel="Select suggestion type"
                value={suggestionForm.category}
                options={suggestionCategoryOptions}
                onChange={(newCategory) => handleSuggestionChange("category", newCategory)}
              />
            </div>

            <textarea
              placeholder="Tell us what tool you need or what we can improve..."
              value={suggestionForm.suggestion}
              onChange={(e) => handleSuggestionChange("suggestion", e.target.value)}
              rows="5"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
            />

            <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
              Send Suggestion
            </button>

            {suggestionState.message && (
              <p className={`mt-3 text-sm ${suggestionState.status === "success" ? "text-green-600" : suggestionState.status === "error" ? "text-red-600" : "text-slate-600"}`}>
                {suggestionState.message}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-slate-300 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-3">BoringTools</h3>
              <p className="text-sm">100 practical tools built in 100 days</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/" className="hover:text-amber-300 transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" className="hover:text-amber-300 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-amber-300 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/privacy-policy" className="hover:text-amber-300 transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms-of-service" className="hover:text-amber-300 transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Follow</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.instagram.com/ius.sharma" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://github.com/ius-sharma" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>© 2026 BoringTools. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

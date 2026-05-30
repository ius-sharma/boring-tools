"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildShareText, EXAMPLE_TOPICS, POPULAR_TOPICS } from "./data";

const initialStatus = "Type a topic, then search to explore it instantly.";

export default function ConceptExplorerPage() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [recentSearches, setRecentSearches] = useState([]);
  const [feedback, setFeedback] = useState("");
  const loadingTimerRef = useRef(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "QuickLearn | Boring Tools";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  const updateRecentSearches = (topic) => {
    setRecentSearches((current) => [topic, ...current.filter((item) => item.toLowerCase() !== topic.toLowerCase())].slice(0, 6));
  };

  const runSearch = (topic) => {
    const trimmed = topic.trim();

    if (!trimmed) {
      setResult(null);
      setActiveQuery("");
      setStatus(initialStatus);
      setFeedback("");
      return;
    }

    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current);
    }

    setIsLoading(true);
    setFeedback("");
    setStatus(`Searching the knowledge engine for ${trimmed}...`);

    loadingTimerRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/concept-explorer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: trimmed }),
        });

        const payload = await response.json();

        if (payload?.unable) {
          setResult(null);
          setActiveQuery(trimmed);
          setIsLoading(false);
          setStatus(payload.message || "Unable to generate information for this topic.");
          updateRecentSearches(trimmed);
          return;
        }

        const nextResult = {
          title: payload.title,
          category: payload.category,
          source: payload.source,
          oneLine: payload.oneLineExplanation,
          eli10: payload.explainLikeIm10,
          keyConcepts: payload.keyConcepts,
          whyItMatters: payload.whyItMatters,
          examples: payload.realWorldExamples,
          learnNext: payload.learnNext,
        };

        setResult(nextResult);
        setActiveQuery(trimmed);
        setIsLoading(false);
        setStatus(`Showing a concept summary for ${nextResult.title}.`);
        updateRecentSearches(trimmed);
      } catch {
        setResult(null);
        setActiveQuery(trimmed);
        setIsLoading(false);
        setStatus("Unable to generate information for this topic.");
        updateRecentSearches(trimmed);
      }
    }, 180);
  };

  const clearSearch = () => {
    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current);
    }

    setQuery("");
    setActiveQuery("");
    setResult(null);
    setIsLoading(false);
    setStatus(initialStatus);
    setFeedback("Cleared.");
  };

  const copyResult = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(buildShareText(result));
      setFeedback("Result copied to clipboard.");
    } catch {
      setFeedback("Copy failed in this browser.");
    }
  };

  const shareResult = async () => {
    if (!result) return;

    const shareText = buildShareText(result);

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${result.title} - QuickLearn`,
          text: shareText,
        });
        setFeedback("Share sheet opened.");
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setFeedback("Share text copied to clipboard.");
    } catch {
      setFeedback("Sharing was canceled or unavailable.");
    }
  };

  const conceptCards = useMemo(() => {
    if (!result) return [];

    return [
      { title: "One-Line Explanation", body: result.oneLine, accent: "text-amber-700" },
      { title: "Explain Like I'm 10", body: result.eli10, accent: "text-slate-900" },
      { title: "Key Concepts", body: result.keyConcepts, accent: "text-amber-700", isList: true },
      { title: "Why It Matters", body: result.whyItMatters, accent: "text-slate-900" },
      { title: "Real-World Examples", body: result.examples, accent: "text-amber-700", isList: true },
      { title: "Learn Next", body: result.learnNext, accent: "text-slate-900", isList: true },
    ];
  }, [result]);

  const handleSearch = () => runSearch(query);

  const handleChipSearch = (topic) => {
    setQuery(topic);
    runSearch(topic);
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-5 sm:p-7 lg:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Learn in 60 seconds
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">QuickLearn</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Type any topic and understand it in under a minute with simple explanations, key concepts, real-world examples, and guided learning paths.
              </p>

              <div className="mt-6 space-y-3">
                <label htmlFor="concept-topic" className="text-sm font-semibold text-slate-700">
                  Topic
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="concept-topic"
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Try Artificial Intelligence, AI, Blockchain, Photosynthesis..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <div className="flex gap-3 sm:min-w-[220px]">
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="inline-flex flex-1 items-center justify-center rounded-2xl border border-amber-500 bg-amber-500 px-4 py-3 font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-100"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Example chips</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleChipSearch(topic)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-gradient-to-br from-amber-50 via-white to-slate-50 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</p>
                <p className="mt-3 text-base font-medium leading-7 text-slate-900">{status}</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Popular topics</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {POPULAR_TOPICS.slice(0, 4).map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => handleChipSearch(topic)}
                          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-amber-300"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recent searches</p>
                    {recentSearches.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recentSearches.map((topic) => (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => handleChipSearch(topic)}
                            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-amber-300"
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">Your recent searches will appear here during this session.</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Search examples: AI, Blockchain, Photosynthesis, Inflation, Quantum Physics, World War 2.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6 lg:p-8">
          {!result && !isLoading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-700 shadow-sm">?</div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Ready when you are</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {status === "Unable to generate information for this topic." ? status : "Type a topic or pick a chip, and QuickLearn will return a structured summary with explanations, concepts, examples, and next steps."}
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
                <div className="mt-4 h-4 w-24 animate-pulse rounded-full bg-slate-200" />
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
                      <div className="mt-4 space-y-2">
                        <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
                        <div className="h-3 w-11/12 animate-pulse rounded-full bg-slate-200" />
                        <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{result.title}</h2>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                      {result.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{result.source}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyResult}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                  >
                    Copy result
                  </button>
                  <button
                    type="button"
                    onClick={shareResult}
                    className="rounded-2xl border border-amber-500 bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-600"
                  >
                    Share result
                  </button>
                </div>
              </div>

              {feedback ? <p className="text-sm font-medium text-slate-600">{feedback}</p> : null}

              <div className="grid gap-4 lg:grid-cols-2">
                {conceptCards.map((card) => (
                  <article
                    key={card.title}
                    className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)] sm:p-6"
                  >
                    <h3 className={`text-sm font-semibold uppercase tracking-[0.22em] ${card.accent}`}>{card.title}</h3>
                    {card.isList ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {card.body.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition group-hover:border-amber-200 group-hover:bg-amber-50"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-[15px]">{card.body}</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <div aria-live="polite" className="sr-only">
        {activeQuery ? `Active query ${activeQuery}` : "No active query"}
      </div>
    </main>
  );
}
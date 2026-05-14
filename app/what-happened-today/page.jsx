"use client";

import { useState, useEffect, useMemo } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const categoryOptions = [
  { value: "events", label: "Historical Events" },
  { value: "births", label: "Notable Births" },
  { value: "deaths", label: "Notable Deaths" },
];

export default function WhatHappenedToday() {
  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const [selectedCategory, setSelectedCategory] = useState("events");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyNote, setCopyNote] = useState("");
  const [source, setSource] = useState("");

  const getDaysInMonth = (m) => {
    return new Date(2024, m, 0).getDate();
  };

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Date(2024, i).toLocaleString("en-US", { month: "long" }),
    }));
  }, []);

  const dayOptions = useMemo(() => {
    const days = getDaysInMonth(month);
    return Array.from({ length: days }, (_, i) => ({
      value: i + 1,
      label: String(i + 1),
    }));
  }, [month]);

  // Ensure day is valid when month changes
  useEffect(() => {
    const maxDays = getDaysInMonth(month);
    if (day > maxDays) {
      setDay(maxDays);
    }
  }, [month]);

  useEffect(() => {
    handleFetchEvents();
  }, []);

  const handleFetchEvents = async () => {
    setLoading(true);
    setError("");
    setCopyNote("");

    try {
      const response = await fetch(`/api/what-happened-today`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: parseInt(month),
          day: parseInt(day),
          category: selectedCategory,
        }),
      });

      const data = await response.json();

      if (response.ok && data.events) {
        setEvents(data.events);
        setSource(data.source);
        if (data.error) {
          setError(data.error);
        }
      } else {
        setError(data.error || "Could not fetch events.");
        setEvents([]);
      }
    } catch {
      setError("Failed to fetch events. Try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (value) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopyNote("Copied!");
    setTimeout(() => {
      setCopyNote("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Day 25
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">What Happened Today</h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Discover major historical events, births, and deaths that occurred on this day in history.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-8">
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Month</label>
                <ThemedDropdown
                  value={month}
                  options={monthOptions}
                  onChange={setMonth}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Day</label>
                <ThemedDropdown
                  value={day}
                  options={dayOptions}
                  onChange={setDay}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
                <ThemedDropdown
                  value={selectedCategory}
                  options={categoryOptions}
                  onChange={setSelectedCategory}
                />
              </div>
            </div>

            <button
              onClick={handleFetchEvents}
              disabled={loading}
              className="w-full rounded-2xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:bg-slate-300 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? "Searching History..." : "Explore This Day"}
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {events.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} on {monthOptions.find(m => m.value === month)?.label} {day}
              </h2>
              {copyNote && <p className="text-sm text-green-600 font-medium animate-pulse">{copyNote}</p>}
            </div>
            <div className="space-y-4">
              {events.map((event, idx) => (
                <div key={idx} className="group relative rounded-2xl border border-slate-100 bg-slate-50 p-5 hover:bg-white hover:border-orange-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-bold">
                          {event.year || "Unknown"}
                        </span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">{event.text}</p>
                      {event.wikipedia && (
                        <a 
                          href={event.wikipedia} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center text-xs font-medium text-slate-400 hover:text-orange-600 transition"
                        >
                          Learn more on Wikipedia
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => copyText(`${event.year}: ${event.text}`)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {source === "wikipedia" && (
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                  Data sourced from Wikipedia via byabbe.se API. Licensed under CC BY-SA 3.0.
                </p>
              </div>
            )}
          </section>
        )}

        {events.length === 0 && !error && !loading && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium">Ready to travel back in time?</p>
            <p className="text-sm mt-1">Select a date and category above to see what happened.</p>
          </div>
        )}
      </div>
    </div>
  );
}

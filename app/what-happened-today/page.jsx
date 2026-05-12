"use client";

import { useState, useEffect, useMemo } from "react";
import ThemedDropdown from "../components/ThemedDropdown";
import { notFound } from "next/navigation";

const categoryOptions = [
  { value: "births", label: "Notable Births" },
  { value: "deaths", label: "Notable Deaths" },
  { value: "events", label: "Historical Events" },
  { value: "all", label: "All Events" },
];

export default function WhatHappenedToday() {
  notFound();

  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const [selectedCategory, setSelectedCategory] = useState("events");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyNote, setCopyNote] = useState("");

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
    return Array.from({ length: getDaysInMonth(month) }, (_, i) => ({
      value: i + 1,
      label: String(i + 1),
    }));
  }, [month]);

  useEffect(() => {
    handleFetchEvents();
  }, []);

  const handleFetchEvents = async () => {
    setLoading(true);
    setError("");
    setCopyNote("");

    try {
      // Using Wikimedia API for historical events
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
    window.clearTimeout(window.__historyEventCopyTimer);
    window.__historyEventCopyTimer = window.setTimeout(() => {
      setCopyNote("");
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600 mb-3">Learning</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">What Happened Today</h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Discover major historical events, births, and deaths that occurred on any day in history.
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
                <label className="mb-2 block text-sm font-semibold text-slate-700">Filter</label>
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
              className="w-full rounded-2xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:bg-slate-300"
            >
              {loading ? "Loading..." : "Find Events"}
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {events.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Events on {new Date(2024, month - 1, day).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </h2>
              {copyNote && <p className="text-sm text-green-600 font-medium">{copyNote}</p>}
            </div>
            <div className="space-y-3">
              {events.map((event, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-orange-600 mb-1">{event.year || "Unknown"}</p>
                      <p className="text-sm text-slate-800">{event.text}</p>
                      {event.html && <p className="text-xs text-slate-500 mt-2">{event.html}</p>}
                    </div>
                    <button
                      onClick={() => copyText(`${event.year || "Unknown"}: ${event.text}`)}
                      className="text-xs font-medium text-orange-600 hover:text-orange-700 transition whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {events.length === 0 && !error && !loading && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
            <p>Click "Find Events" to discover what happened on your selected date.</p>
          </div>
        )}
      </div>
    </div>
  );
}

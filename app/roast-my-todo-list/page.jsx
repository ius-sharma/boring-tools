"use client";

import { useMemo, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const roastSets = {
  mild: [
    "Respectfully, this task is older than your coffee mug.",
    "You wrote it. You ignored it. Now it is judging you.",
    "This one keeps showing up like an unpaid subscription.",
  ],
  medium: [
    "Your to-do list has trust issues now.",
    "If this task had a passport, it would be over-stamped by now.",
    "At this point, procrastination is your co-founder.",
  ],
  savage: [
    "This task has seen three mood swings and zero progress.",
    "You are not blocked. You are negotiating with reality.",
    "Deadline called. It left a voice note full of disappointment.",
  ],
};

const actionPrompts = [
  "Do 5 minutes right now.",
  "Define one tiny next step.",
  "Set a 10-minute timer and start ugly.",
  "Finish just the first draft.",
  "Send one message to unblock this.",
  "Close all tabs and do this first.",
];

function pick(list, seed) {
  return list[Math.abs(seed) % list.length];
}

function buildLocalRoasts(todos, roastLevel) {
  return todos.map((todo, index) => {
    const seed = todo.length * 13 + index * 17;
    return {
      todo,
      roast: pick(roastSets[roastLevel], seed),
      action: pick(actionPrompts, seed + 9),
    };
  });
}

export default function RoastMyTodoList() {
  const [rawTodos, setRawTodos] = useState("Reply to pending mails\nUpdate portfolio\nFinish expense sheet\nPlan next week");
  const [roastLevel, setRoastLevel] = useState("medium");
  const [results, setResults] = useState([]);
  const [source, setSource] = useState("Local fallback");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const roastLevelOptions = [
    { value: "mild", label: "Mild" },
    { value: "medium", label: "Medium" },
    { value: "savage", label: "Savage" },
  ];

  const todos = useMemo(
    () => rawTodos.split("\n").map((line) => line.trim()).filter(Boolean),
    [rawTodos]
  );

  const handleGenerate = async () => {
    if (!todos.length) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todos, roastLevel }),
      });

      const payload = await response.json();

      if (response.ok && Array.isArray(payload.items) && payload.items.length) {
        setResults(payload.items);
        setSource("Groq API");
        return;
      }

      const fallback = buildLocalRoasts(todos, roastLevel);
      setResults(fallback);
      setSource("Local fallback");
      setError(payload?.error ? "Groq is not configured yet, so local fallback was used." : "Local fallback was used.");
    } catch {
      const fallback = buildLocalRoasts(todos, roastLevel);
      setResults(fallback);
      setSource("Local fallback");
      setError("Groq request failed, so local fallback was used.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setRawTodos("");
    setResults([]);
    setError("");
    setSource("Local fallback");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-5xl border border-neutral-200 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Roast My To-Do List</h1>
          <p className="text-neutral-500 text-base">Fun accountability with a roast + one practical action per task.</p>
          <p className="text-xs text-neutral-500">Source: {source}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-neutral-900">Your tasks</h2>
              <span className="text-xs text-neutral-500">One per line</span>
            </div>
            <textarea
              value={rawTodos}
              onChange={(event) => setRawTodos(event.target.value)}
              rows={10}
              className="w-full p-4 border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition text-sm text-black placeholder:text-neutral-300"
              placeholder="Write your pending tasks here..."
            />
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-neutral-900">Roast controls</h2>

            <label className="text-sm text-neutral-600 flex flex-col gap-2">
              Roast level
              <ThemedDropdown
                ariaLabel="Select roast level"
                value={roastLevel}
                options={roastLevelOptions}
                onChange={setRoastLevel}
              />
            </label>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!todos.length || isLoading}
              className={`w-full border border-neutral-900 text-neutral-900 py-2.5 rounded-lg font-semibold hover:bg-neutral-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-neutral-900 ${!todos.length || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Roasting..." : "Roast and motivate"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="w-full border border-neutral-300 text-neutral-700 py-2.5 rounded-lg font-semibold hover:bg-neutral-100 transition focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              Clear
            </button>

            <p className="text-xs text-neutral-500">Playful roast only. The action tips are practical and productivity-focused.</p>
          </div>
        </div>

        {error && <p className="text-sm text-neutral-500">{error}</p>}

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-base font-semibold text-neutral-900">Roast board</h2>
            <span className="text-xs text-neutral-500">{results.length ? `${results.length} task(s)` : "Generate to view"}</span>
          </div>

          {!results.length ? (
            <p className="text-sm text-neutral-500">Paste tasks and click "Roast and motivate" to get your fun kickstart.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map((item, index) => (
                <div key={`${item.todo}-${index}`} className="rounded-xl border border-neutral-200 bg-white p-4 flex flex-col gap-2">
                  <p className="text-sm font-semibold text-neutral-900">{item.todo}</p>
                  <p className="text-sm text-neutral-700">{item.roast}</p>
                  <p className="text-xs text-neutral-500">Next move: {item.action}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}

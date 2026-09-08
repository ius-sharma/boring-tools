"use client";
import { useMemo, useState, useEffect } from "react";
import ThemedDropdown from "../components/ThemedDropdown";
import ShareResultCardModal from "../components/ShareResultCardModal";
import { recordRecentTool } from "@/lib/storage/toolPreferences";

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
  const [shareCard, setShareCard] = useState(null);

  useEffect(() => {
    recordRecentTool("roast-my-todo-list");
  }, []);

  const roastLevelOptions = [
    { value: "mild", label: "Mild", badge: "Gentle" },
    { value: "medium", label: "Medium", badge: "Balanced" },
    { value: "savage", label: "Savage", badge: "🔥 Brutal", badgeHighlight: true },
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

      setResults([]);
      setError(payload?.message || payload?.error || "Could not generate roasts.");
    } catch {
      setResults([]);
      setError("Network or server request failed.");
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-5xl border border-slate-200 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Roast My To-Do List</h1>
          <p className="text-slate-500 text-base">Fun accountability with a roast + one practical action per task.</p>
          <p className="text-xs text-slate-500">Source: {source}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">Your tasks</h2>
              <span className="text-xs text-slate-500">One per line</span>
            </div>
            <textarea
              value={rawTodos}
              onChange={(event) => setRawTodos(event.target.value)}
              rows={10}
              className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 transition text-sm text-slate-900 placeholder:text-slate-300"
              placeholder="Write your pending tasks here..."
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-slate-900">Roast controls</h2>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Roast Level</span>
              <ThemedDropdown
                ariaLabel="Select roast level"
                value={roastLevel}
                options={roastLevelOptions}
                onChange={setRoastLevel}
                segmented={true}
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!todos.length || isLoading}
              className={`w-full border border-slate-900 text-slate-900 py-2.5 rounded-lg font-semibold hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${!todos.length || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Roasting..." : "Roast and motivate"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="w-full border border-slate-300 text-slate-700 py-2.5 rounded-lg font-semibold hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              Clear
            </button>

            <p className="text-xs text-slate-500">Playful roast only. The action tips are practical and productivity-focused.</p>
          </div>
        </div>

        {error && <p className="text-sm text-slate-500">{error}</p>}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-base font-semibold text-slate-900">Roast board</h2>
            <span className="text-xs text-slate-500">{results.length ? `${results.length} task(s)` : "Generate to view"}</span>
          </div>

          {!results.length ? (
            <p className="text-sm text-slate-500">Paste tasks and click "Roast and motivate" to get your fun kickstart.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map((item, index) => (
                <div key={`${item.todo}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-900">{item.todo}</p>
                    <p className="text-sm text-slate-700 italic">"{item.roast}"</p>
                    <p className="text-xs text-emerald-700 font-medium pt-1">Next move: {item.action}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setShareCard({
                          type: "roast",
                          todo: item.todo,
                          roast: item.roast,
                          action: item.action,
                          level: roastLevel,
                        })
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 px-2.5 py-1 rounded-lg hover:bg-orange-50 transition cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ShareResultCardModal
          isOpen={Boolean(shareCard)}
          onClose={() => setShareCard(null)}
          data={shareCard}
          filename="boringtools-todo-roast.png"
          tweetText={
            shareCard
              ? `My to-do list just got roasted: "${shareCard.roast}" 🔥`
              : "Check out my to-do list roast!"
          }
          shareUrl="https://www.boringtoolsai.com/roast-my-todo-list"
        />
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}



"use client";

import ComingSoon from "@/app/components/ComingSoon";
import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const TOOL_STATUS = "live";

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function StatCard({ label, value, subtitle, highlight = false }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md ${highlight ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight tabular-nums ${highlight ? 'text-orange-700' : 'text-slate-900'}`}>{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

export default function SleepCycleCalculator() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Sleep Cycle Calculator" />;
  }

  const [wakeUpTime, setWakeUpTime] = useState("07:00");
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);

  const sleepCycles = useMemo(() => {
    const [hours, minutes] = wakeUpTime.split(":").map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(hours, minutes, 0, 0);

    // Sleep cycles are typically 90 minutes.
    // We want to calculate 6, 5, 4, and 3 cycles before wake up time.
    // Also adding 15 minutes to fall asleep.
    const cycles = [6, 5, 4, 3].map((numCycles) => {
      const sleepTime = new Date(wakeDate.getTime() - (numCycles * 90 + 15) * 60000);
      return {
        cycles: numCycles,
        hours: numCycles * 1.5,
        time: formatTime(sleepTime),
        label: numCycles === 6 ? "Optimal" : numCycles === 5 ? "Recommended" : "Minimum",
      };
    });

    return cycles;
  }, [wakeUpTime]);

  const showToast = (type, message) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => setToast({ type: "", message: "" }), 2000);
  };

  const copyResults = () => {
    const text = `Sleep Cycle Results for waking up at ${wakeUpTime}:\n\n` + 
      sleepCycles.map(c => `- ${c.label}: ${c.time} (${c.cycles} cycles, ${c.hours} hrs)`).join("\n");
    navigator.clipboard.writeText(text);
    showToast("success", "Results copied!");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 sm:py-8 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-4xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Health & Productivity</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Sleep Cycle Calculator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Wake up feeling refreshed by timing your sleep with natural 90-minute cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">I want to wake up at:</h2>
              <input
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-2xl font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <p className="mt-4 text-sm text-slate-500">
                Includes 15 minutes to fall asleep.
              </p>
            </div>
            
            <button
              onClick={copyResults}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
            >
              Copy Results
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sleepCycles.map((cycle, idx) => (
              <StatCard
                key={idx}
                label={cycle.label}
                value={cycle.time}
                subtitle={`${cycle.hours} hours of sleep`}
                highlight={cycle.cycles >= 5}
              />
            ))}
          </div>
        </div>

        {toast.message && (
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white font-medium shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

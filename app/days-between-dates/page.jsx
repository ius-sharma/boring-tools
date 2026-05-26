"use client";

import { useMemo, useState } from "react";

function toDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function calculateDayDelta(startDate, endDate) {
  const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endUtc = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const signedDays = Math.round((endUtc - startUtc) / 86400000);

  return {
    signedDays,
    absoluteDays: Math.abs(signedDays),
  };
}

export default function DaysBetweenDatesPage() {
  const [startDate, setStartDate] = useState(() => toDateInputValue(new Date()));
  const [endDate, setEndDate] = useState(() => toDateInputValue(new Date()));

  const result = useMemo(() => {
    const parsedStart = parseDateInput(startDate);
    const parsedEnd = parseDateInput(endDate);

    if (!parsedStart || !parsedEnd) {
      return null;
    }

    return calculateDayDelta(parsedStart, parsedEnd);
  }, [startDate, endDate]);

  const startPreview = parseDateInput(startDate);
  const endPreview = parseDateInput(endDate);

  const summaryText = (() => {
    if (!result) {
      return "Pick two valid dates to see the difference.";
    }

    if (result.absoluteDays === 0) {
      return "Both dates are the same day.";
    }

    return result.signedDays > 0
      ? `${formatLongDate(startPreview)} is ${result.absoluteDays} day${result.absoluteDays === 1 ? "" : "s"} before ${formatLongDate(endPreview)}.`
      : `${formatLongDate(startPreview)} is ${result.absoluteDays} day${result.absoluteDays === 1 ? "" : "s"} after ${formatLongDate(endPreview)}.`;
  })();

  const totalWeeks = result ? Math.floor(result.absoluteDays / 7) : 0;
  const remainingDays = result ? result.absoluteDays % 7 : 0;

  const setTodayRange = () => {
    const today = toDateInputValue(new Date());
    setStartDate(today);
    setEndDate(today);
  };

  const swapDates = () => {
    setStartDate(endDate);
    setEndDate(startDate);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-4xl border border-slate-200 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Days Between Dates</h1>
          <p className="text-slate-500 text-base">Calculate the exact day difference between two calendar dates.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Start date</p>
              <p className="text-xs text-slate-500">The earlier or reference date</p>
            </div>

            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Selected date</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{startPreview ? formatLongDate(startPreview) : "Choose a date"}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <button
              type="button"
              onClick={swapDates}
              className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-orange-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-slate-50"
              aria-label="Swap start and end dates"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
                aria-hidden="true"
              >
                <path d="M16 3.5l4.5 4.5-4.5 4.5" />
                <path d="M20.5 8H3.5" />
                <path d="M8 20.5 3.5 16l4.5-4.5" />
                <path d="M3.5 16h17" />
              </svg>
            </button>
            <button
              type="button"
              onClick={setTodayRange}
              className="rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Set both to today
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">End date</p>
              <p className="text-xs text-slate-500">The later target date</p>
            </div>

            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Selected date</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{endPreview ? formatLongDate(endPreview) : "Choose a date"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Difference</p>
            <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums">{result ? result.absoluteDays : "--"}</p>
            <p className="text-sm text-slate-500">Total days</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Breakdown</p>
            <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums">{result ? totalWeeks : "--"}</p>
            <p className="text-sm text-slate-500">Weeks and {result ? remainingDays : "--"} day{result && remainingDays === 1 ? "" : "s"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Direction</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{result ? (result.signedDays >= 0 ? "End is after start" : "End is before start") : "--"}</p>
            <p className="text-sm text-slate-500">{result ? summaryText : "Pick dates to compare"}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Quick note</p>
          <p className="mt-2 text-sm text-slate-600">
            The calculation uses calendar dates at UTC midnight, so the result stays consistent regardless of the user’s local time zone or daylight saving changes.
          </p>
        </div>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}
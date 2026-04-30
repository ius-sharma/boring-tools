"use client";

import { useMemo, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const timeZones = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "America/New_York", label: "New York" },
  { value: "America/Chicago", label: "Chicago" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Tokyo" },
];

function getLocalDateTimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getDateTimeValueForZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date).reduce((accumulator, part) => {
    if (part.type !== "literal") {
      accumulator[part.type] = part.value;
    }
    return accumulator;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function formatZoneParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return formatter.formatToParts(date).reduce((accumulator, part) => {
    if (part.type !== "literal") {
      accumulator[part.type] = part.value;
    }
    return accumulator;
  }, {});
}

function zonedInputToInstant(value, timeZone) {
  if (!value) {
    return null;
  }

  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) {
    return null;
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute, 0);

  let utcGuess = desiredUtc;

  for (let index = 0; index < 2; index += 1) {
    const parts = formatZoneParts(new Date(utcGuess), timeZone);
    const utcWithZoneParts = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second || 0)
    );
    utcGuess += desiredUtc - utcWithZoneParts;
  }

  return new Date(utcGuess);
}

function formatDateTime(date, timeZone) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(date);
}

function formatOffset(date, timeZone) {
  const parts = formatZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second || 0)
  );
  const offsetMinutes = Math.round((asUtc - date.getTime()) / 60000);
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
  const minutes = String(absoluteMinutes % 60).padStart(2, "0");

  return `UTC${sign}${hours}:${minutes}`;
}

function formatClock(date, timeZone) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export default function TimeZoneConverter() {
  const [sourceZone, setSourceZone] = useState("Asia/Kolkata");
  const [targetZone, setTargetZone] = useState("UTC");
  const [sourceDateTime, setSourceDateTime] = useState(() => getDateTimeValueForZone(new Date(), "Asia/Kolkata"));

  const instant = useMemo(() => zonedInputToInstant(sourceDateTime, sourceZone), [sourceDateTime, sourceZone]);

  const sourceDisplay = instant ? formatDateTime(instant, sourceZone) : "Select a valid date and time.";
  const targetDisplay = instant ? formatDateTime(instant, targetZone) : "Select a valid date and time.";
  const sourceClock = instant ? formatClock(instant, sourceZone) : "--:--:--";
  const targetClock = instant ? formatClock(instant, targetZone) : "--:--:--";
  const sourceOffset = instant ? formatOffset(instant, sourceZone) : "UTC--:--";
  const targetOffset = instant ? formatOffset(instant, targetZone) : "UTC--:--";

  const handleSwap = () => {
    setSourceZone(targetZone);
    setTargetZone(sourceZone);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-5xl border border-neutral-200 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Time Zone Converter</h1>
          <p className="text-neutral-500 text-base">Convert meeting times across zones without mental math.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_auto_0.95fr] gap-4 items-stretch">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-900">Source zone</p>
              <p className="text-xs text-neutral-500">The time you already have</p>
            </div>

            <label className="text-sm text-neutral-600 flex flex-col gap-2">
              Date &amp; time
              <div className="flex gap-2 items-center">
                <input
                  type="datetime-local"
                  value={sourceDateTime}
                  onChange={(event) => setSourceDateTime(event.target.value)}
                  className="flex-1 border border-neutral-300 rounded-lg p-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50"
                />
                <button
                  type="button"
                  onClick={() => setSourceDateTime(getDateTimeValueForZone(new Date(), sourceZone))}
                  className="h-10 px-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 transition"
                >
                  Now
                </button>
              </div>
            </label>

            <label className="text-sm text-neutral-600 flex flex-col gap-2">
              Time zone
              <ThemedDropdown
                ariaLabel="Select source time zone"
                value={sourceZone}
                options={timeZones}
                onChange={(newZone) => setSourceZone(newZone)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-xs text-neutral-500">Clock</p>
                <p className="text-2xl font-semibold text-neutral-900 tabular-nums">{sourceClock}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-xs text-neutral-500">Offset</p>
                <p className="text-2xl font-semibold text-neutral-900 tabular-nums">{sourceOffset}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="h-12 w-12 rounded-full border border-neutral-300 bg-white text-neutral-900 font-semibold hover:bg-neutral-100 transition focus:outline-none focus:ring-2 focus:ring-neutral-900"
              aria-label="Swap time zones"
            >
              ↔
            </button>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-900">Target zone</p>
              <p className="text-xs text-neutral-500">The converted time you need</p>
            </div>

            <label className="text-sm text-neutral-600 flex flex-col gap-2">
              Time zone
              <ThemedDropdown
                ariaLabel="Select target time zone"
                value={targetZone}
                options={timeZones}
                onChange={(newZone) => setTargetZone(newZone)}
              />
            </label>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col gap-2">
              <p className="text-xs text-neutral-500">Converted date &amp; time</p>
              <p className="text-2xl font-semibold text-neutral-900">{targetDisplay}</p>
              <p className="text-sm text-neutral-500">{targetZone} · {targetOffset}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-xs text-neutral-500">Clock</p>
                <p className="text-2xl font-semibold text-neutral-900 tabular-nums">{targetClock}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-xs text-neutral-500">Offset</p>
                <p className="text-2xl font-semibold text-neutral-900 tabular-nums">{targetOffset}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs text-neutral-500">Source view</p>
            <p className="text-sm font-medium text-neutral-900 mt-1">{sourceDisplay}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs text-neutral-500">Target view</p>
            <p className="text-sm font-medium text-neutral-900 mt-1">{targetDisplay}</p>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-500">Black-and-white UI, quick swap, and clear offsets for meeting planning.</p>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}
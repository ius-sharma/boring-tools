"use client";

import ComingSoon from "@/app/components/ComingSoon";
import { useEffect, useMemo, useRef, useState } from "react";

const DAY_MS = 86400000;
const HOUR_MS = 3600000;
const MINUTE_MS = 60000;
const SECOND_MS = 1000;
const NUMBER_FORMAT = new Intl.NumberFormat("en-IN");
const TOOL_STATUS = "upcoming";

function parseDateInput(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function normalizeToUtcMidnight(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonthUtc(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function getObservedBirthdayForYear(birthDate, year) {
  const monthIndex = birthDate.getUTCMonth();
  const day = birthDate.getUTCDate();

  if (monthIndex === 1 && day === 29 && !isLeapYear(year)) {
    return new Date(Date.UTC(year, 1, 28));
  }

  const adjustedDay = Math.min(day, daysInMonthUtc(year, monthIndex));
  return new Date(Date.UTC(year, monthIndex, adjustedDay));
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function formatWeekday(date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    timeZone: "UTC",
  }).format(date);
}

function formatNumber(value) {
  return NUMBER_FORMAT.format(value);
}

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  return `${Math.max(0, Math.min(100, value)).toFixed(1)}%`;
}

function dayOfYear(date) {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const currentDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((currentDay - startOfYear) / DAY_MS);
}

function monthsBetween(startDate, endDate) {
  if (endDate <= startDate) {
    return 0;
  }

  let months = (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 + (endDate.getUTCMonth() - startDate.getUTCMonth());
  const monthAnchor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
  const adjustedAnchor = new Date(Date.UTC(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth() + months, Math.min(startDate.getUTCDate(), daysInMonthUtc(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth() + months))));

  if (adjustedAnchor > endDate) {
    months -= 1;
  }

  return Math.max(0, months);
}

function getZodiac(date) {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  return "Capricorn";
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CountdownCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function InsightCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse">
      <div className="h-3 w-24 rounded-full bg-slate-200" />
      <div className="mt-4 h-9 w-28 rounded-full bg-slate-200" />
      <div className="mt-2 h-3 w-36 rounded-full bg-slate-100" />
    </div>
  );
}

function toDisplayAge(age) {
  return `${formatNumber(age)} year${age === 1 ? "" : "s"}`;
}

export default function BirthdayCountdownPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Birthday Countdown" />;
  }

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [toast, setToast] = useState({ type: "", message: "" });
  const [animateCards, setAnimateCards] = useState(false);
  const toastTimerRef = useRef(null);

  const birthDate = useMemo(() => parseDateInput(dob), [dob]);
  const todayUtc = useMemo(() => normalizeToUtcMidnight(now), [now]);

  const result = useMemo(() => {
    if (!birthDate) {
      return null;
    }

    const currentYear = todayUtc.getUTCFullYear();
    const birthdayThisYear = getObservedBirthdayForYear(birthDate, currentYear);
    const hasBirthdayPassed = todayUtc.getTime() > birthdayThisYear.getTime();
    const nextBirthdayDate = hasBirthdayPassed
      ? getObservedBirthdayForYear(birthDate, currentYear + 1)
      : birthdayThisYear;
    const lastBirthdayDate = hasBirthdayPassed
      ? birthdayThisYear
      : getObservedBirthdayForYear(birthDate, currentYear - 1);

    const remainingMsRaw = nextBirthdayDate.getTime() - now.getTime();
    const remainingMs = Math.max(0, remainingMsRaw);
    const totalCycleMs = Math.max(1, nextBirthdayDate.getTime() - lastBirthdayDate.getTime());
    const completedRatio = 1 - remainingMs / totalCycleMs;
    const daysLeft = Math.max(0, Math.floor((nextBirthdayDate.getTime() - todayUtc.getTime()) / DAY_MS));
    const monthsLeft = monthsBetween(todayUtc, nextBirthdayDate);
    const weeksLeft = Math.floor(daysLeft / 7);
    const hoursLeft = Math.floor(remainingMs / HOUR_MS);
    const minutesLeft = Math.floor(remainingMs / MINUTE_MS);
    const secondsLeft = Math.floor(remainingMs / SECOND_MS);
    const currentAge = todayUtc.getTime() >= birthdayThisYear.getTime()
      ? currentYear - birthDate.getUTCFullYear()
      : currentYear - birthDate.getUTCFullYear() - 1;
    const upcomingAge = hasBirthdayPassed ? currentAge + 1 : currentAge;
    const birthdayProgressPercent = Math.max(0, Math.min(100, completedRatio * 100));
    const yearSpanDays = Math.round(totalCycleMs / DAY_MS);
    const dayOfYearPosition = dayOfYear(nextBirthdayDate);
    const birthdayWeekendLabel = [0, 6].includes(nextBirthdayDate.getUTCDay()) ? "Weekend" : "Weekday";

    return {
      daysLeft,
      monthsLeft,
      weeksLeft,
      hoursLeft,
      minutesLeft,
      secondsLeft,
      nextBirthdayDate,
      upcomingAge,
      currentAge,
      birthdayProgressPercent,
      yearSpanDays,
      dayOfYearPosition,
      birthdayWeekendLabel,
      birthWeekday: formatWeekday(birthDate),
      nextBirthdayWeekday: formatWeekday(nextBirthdayDate),
      zodiac: getZodiac(birthDate),
      leapYearCheck: isLeapYear(birthDate.getUTCFullYear()),
      remainingMs,
    };
  }, [birthDate, now, todayUtc]);

  const summaryText = useMemo(() => {
    if (!birthDate) {
      return "Enter your date of birth to start the countdown.";
    }

    if (!result) {
      return "Checking your birthday countdown...";
    }

    const displayName = name.trim() || "Your birthday";
    if (result.daysLeft === 0) {
      return `${displayName} is today. Happy Birthday!`;
    }

    return `${displayName} is coming up on ${formatLongDate(result.nextBirthdayDate)}.`;
  }, [birthDate, name, result]);

  const validationError = useMemo(() => {
    if (dob && !birthDate) {
      return "Please choose a valid date of birth.";
    }

    if (birthDate && birthDate.getTime() > todayUtc.getTime()) {
      return "Date of birth cannot be in the future.";
    }

    return "";
  }, [birthDate, dob, todayUtc]);

  const reportText = useMemo(() => {
    if (!birthDate || !result) {
      return "";
    }

    return [
      "Birthday Countdown Report",
      `Generated: ${formatLongDate(now)}`,
      "",
      `Name: ${name.trim() || "Not provided"}`,
      `Date of birth: ${formatLongDate(birthDate)} (${result.birthWeekday})`,
      `Zodiac sign: ${result.zodiac}`,
      `Leap year birth year: ${result.leapYearCheck ? "Yes" : "No"}`,
      `Current age: ${formatNumber(result.currentAge)}`,
      `Upcoming age: ${formatNumber(result.upcomingAge)}`,
      `Next birthday: ${formatLongDate(result.nextBirthdayDate)} (${result.nextBirthdayWeekday})`,
      `Days left: ${formatNumber(result.daysLeft)}`,
      `Months left: ${formatNumber(result.monthsLeft)}`,
      `Weeks left: ${formatNumber(result.weeksLeft)}`,
      `Hours left: ${formatNumber(result.hoursLeft)}`,
      `Minutes left: ${formatNumber(result.minutesLeft)}`,
      `Seconds left: ${formatNumber(result.secondsLeft)}`,
      `Birthday progress: ${formatPercent(result.birthdayProgressPercent)}`,
      `Percentage of year completed: ${formatPercent(result.birthdayProgressPercent)}`,
      `Day of year position: ${formatNumber(result.dayOfYearPosition)} of ${formatNumber(result.yearSpanDays)}`,
      `Birthday day type: ${result.birthdayWeekendLabel}`,
    ].join("\n");
  }, [birthDate, name, now, result]);

  useEffect(() => {
    if (!birthDate) {
      setAnimateCards(false);
      return undefined;
    }

    setAnimateCards(true);
    const timer = window.setTimeout(() => setAnimateCards(false), 180);
    return () => window.clearTimeout(timer);
  }, [birthDate]);

  useEffect(() => {
    if (!birthDate) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [birthDate]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (type, message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 1800);
  };

  const copyResults = async () => {
    if (!reportText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(reportText);
      showToast("success", "Results copied to clipboard.");
    } catch {
      showToast("error", "Copy failed. Try again.");
    }
  };

  const downloadReport = () => {
    if (!reportText || typeof window === "undefined") {
      return;
    }

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `${slugify(name) || "birthday-countdown"}-report.txt`;

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("success", "Report downloaded.");
  };

  const clearInputs = () => {
    setName("");
    setDob("");
    setToast({ type: "", message: "" });
    showToast("success", "Inputs cleared.");
  };

  const shouldShowEmptyState = !birthDate || !!validationError;
  const shouldShowSkeleton = Boolean(result && animateCards);
  const birthdayWeekendCopy = result ? (result.birthdayWeekendLabel === "Weekend" ? "Your next birthday lands on a weekend." : "Your next birthday lands on a weekday.") : "";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Time & Date</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Birthday Countdown</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Track time remaining until your next birthday with live countdowns and fun birthday insights.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Birthday details</p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Enter the birthday you want to track</h2>
              <p className="text-sm text-slate-500">Names are optional, but they make the countdown and report easier to read.</p>
            </div>

            <button
              type="button"
              onClick={clearInputs}
              className="inline-flex items-center justify-center rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:-translate-y-px hover:bg-orange-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 md:mt-1"
            >
              Clear inputs
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900">Name</span>
              <span className="text-xs text-slate-500">Optional</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900">Date of birth</span>
              <span className="text-xs text-slate-500">Pick the birth date from the calendar</span>
              <input
                type="date"
                value={dob}
                onChange={(event) => setDob(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Birthday countdown updates automatically once a valid date is entered.
            </p>
            {validationError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 sm:max-w-md">
                <p className="text-sm font-semibold">Please fix the highlighted issue.</p>
                <p className="text-sm">{validationError}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Summary</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{summaryText}</h2>
              <p className="mt-1 text-sm text-slate-500">The countdown updates every second and uses UTC-based date math for consistent results.</p>
            </div>
            {result ? <p className="text-sm font-medium text-orange-600">{birthdayWeekendCopy}</p> : null}
          </div>
        </div>

        {shouldShowEmptyState ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Empty state</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Enter your birth date to see the birthday countdown.</p>
            <p className="mt-1 text-sm text-slate-500">Live seconds, birthday insights, and report actions will appear here once a valid date is set.</p>
          </div>
        ) : null}

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {shouldShowSkeleton ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : result ? (
            <>
              <CountdownCard label="Days left" value={formatNumber(result.daysLeft)} subtitle="Calendar days until the next birthday" />
              <CountdownCard label="Months left" value={formatNumber(result.monthsLeft)} subtitle="Full months remaining" />
              <CountdownCard label="Weeks left" value={formatNumber(result.weeksLeft)} subtitle="Full weeks remaining" />
              <CountdownCard label="Hours left" value={formatNumber(result.hoursLeft)} subtitle="Live countdown" />
              <CountdownCard label="Minutes left" value={formatNumber(result.minutesLeft)} subtitle="Live countdown" />
              <CountdownCard label="Seconds left" value={formatNumber(result.secondsLeft)} subtitle="Updates every second" />
            </>
          ) : null}
        </div>

        {result ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <InsightCard label="Next birthday date" value={formatLongDate(result.nextBirthdayDate)} subtitle={result.nextBirthdayWeekday} />
            <InsightCard label="Upcoming age" value={toDisplayAge(result.upcomingAge)} subtitle="Age you will turn on the next birthday" />
            <InsightCard label="Current age" value={toDisplayAge(result.currentAge)} subtitle="Full years completed today" />
            <InsightCard label="Birth weekday" value={result.birthWeekday} subtitle="The weekday you were born on" />
            <InsightCard label="Zodiac sign" value={result.zodiac} subtitle="Based on your birth date" />
            <InsightCard label="Leap year check" value={result.leapYearCheck ? "Born in a leap year" : "Not born in a leap year"} subtitle={result.leapYearCheck ? "Leap-year birthdays keep the day count special." : "Observed birthdays still count correctly."} />
          </div>
        ) : null}

        {result ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Birthday progress</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{formatPercent(result.birthdayProgressPercent)} complete</p>
                </div>
                <p className="text-sm font-medium text-orange-600">{result.dayOfYearPosition} / {result.yearSpanDays} day{result.yearSpanDays === 1 ? "" : "s"}</p>
              </div>
              <div className="mt-4 rounded-full border border-orange-200/70 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-1 shadow-inner shadow-orange-100/80">
                <div className="relative h-3 overflow-hidden rounded-full bg-slate-100/80">
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.7),rgba(255,255,255,0.15),rgba(255,255,255,0.45))] opacity-70" />
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 shadow-[0_0_18px_rgba(249,115,22,0.18)] transition-[width,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ width: `${Math.max(0, Math.min(100, result.birthdayProgressPercent))}%` }}
                  >
                    <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/35 to-transparent opacity-90" />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">{formatNumber(result.dayOfYearPosition)}th day of the year position for your next birthday.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Birthday day type</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Your birthday is on a {result.birthdayWeekendLabel.toLowerCase()}.</p>
              <p className="mt-1 text-sm text-slate-500">{result.birthdayWeekendLabel === "Weekend" ? "Plan a weekend celebration." : "A weekday birthday keeps the party schedule flexible."}</p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={copyResults}
            className={`rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 ${!result || validationError ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!result || Boolean(validationError)}
          >
            Copy results
          </button>
          <button
            type="button"
            onClick={downloadReport}
            className={`rounded-xl border border-orange-500 px-4 py-3 font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${!result || validationError ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!result || Boolean(validationError)}
          >
            Download report
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Accuracy note</p>
          <p className="mt-2 text-sm text-slate-600">
            The countdown uses UTC-based date math and leap-year-aware birthday logic so results stay consistent across time zones and calendar edge cases.
          </p>
        </div>
      </div>

      {toast.message ? (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-sm shadow-lg animate-fade-in-out ${toast.type === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
        .animate-fade-in-out {
          animation: fadeInOut 1.8s;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
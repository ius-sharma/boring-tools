"use client";

import ComingSoon from "@/app/components/ComingSoon";
import { useEffect, useMemo, useRef, useState } from "react";

const DAY_MS = 86400000;
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

function getUtcMidnightTimestamp(date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function formatWeekday(date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
  }).format(date);
}

function formatNumber(value) {
  return NUMBER_FORMAT.format(value);
}

function formatPercentage(value) {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  if (value === 0) {
    return "0%";
  }

  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)}%`;
}

function daysInMonthUtc(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function addYearsClamped(date, years) {
  const targetYear = date.getUTCFullYear() + years;
  const monthIndex = date.getUTCMonth();
  const day = Math.min(date.getUTCDate(), daysInMonthUtc(targetYear, monthIndex));
  return new Date(Date.UTC(targetYear, monthIndex, day));
}

function addMonthsClamped(date, months) {
  const currentYear = date.getUTCFullYear();
  const currentMonth = date.getUTCMonth();
  const totalMonths = currentYear * 12 + currentMonth + months;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = totalMonths - targetYear * 12;
  const day = Math.min(date.getUTCDate(), daysInMonthUtc(targetYear, targetMonth));
  return new Date(Date.UTC(targetYear, targetMonth, day));
}

function getZodiac(date) {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { sign: "Aquarius", element: "Air" };
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { sign: "Pisces", element: "Water" };
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { sign: "Aries", element: "Fire" };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { sign: "Taurus", element: "Earth" };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { sign: "Gemini", element: "Air" };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { sign: "Cancer", element: "Water" };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { sign: "Leo", element: "Fire" };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { sign: "Virgo", element: "Earth" };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { sign: "Libra", element: "Air" };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { sign: "Scorpio", element: "Water" };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { sign: "Sagittarius", element: "Fire" };
  return { sign: "Capricorn", element: "Earth" };
}

function calculateAgeDifference(firstDate, secondDate) {
  const olderBirth = firstDate <= secondDate ? firstDate : secondDate;
  const youngerBirth = firstDate <= secondDate ? secondDate : firstDate;
  const totalDays = Math.round((getUtcMidnightTimestamp(youngerBirth) - getUtcMidnightTimestamp(olderBirth)) / DAY_MS);

  let years = youngerBirth.getUTCFullYear() - olderBirth.getUTCFullYear();
  let yearAnchor = addYearsClamped(olderBirth, years);
  if (yearAnchor > youngerBirth) {
    years -= 1;
    yearAnchor = addYearsClamped(olderBirth, years);
  }

  let months = (youngerBirth.getUTCFullYear() - yearAnchor.getUTCFullYear()) * 12 + (youngerBirth.getUTCMonth() - yearAnchor.getUTCMonth());
  let monthAnchor = addMonthsClamped(yearAnchor, months);
  if (monthAnchor > youngerBirth) {
    months -= 1;
    monthAnchor = addMonthsClamped(yearAnchor, months);
  }

  const days = Math.round((getUtcMidnightTimestamp(youngerBirth) - getUtcMidnightTimestamp(monthAnchor)) / DAY_MS);
  const totalMonths = years * 12 + months;
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  return {
    olderBirth,
    youngerBirth,
    years,
    months,
    days,
    totalMonths,
    totalWeeks,
    totalDays,
    totalHours,
    totalMinutes,
  };
}

function buildReport({ person1Label, person2Label, person1Birth, person2Birth, result }) {
  const person1Zodiac = getZodiac(person1Birth);
  const person2Zodiac = getZodiac(person2Birth);
  const today = startOfTodayUtc();
  const olderBirth = result.olderBirth;
  const youngerBirth = result.youngerBirth;
  const olderLabel = person1Birth <= person2Birth ? person1Label : person2Label;
  const youngerLabel = person1Birth <= person2Birth ? person2Label : person1Label;
  const olderAgeTodayDays = Math.max(1, Math.round((getUtcMidnightTimestamp(today) - getUtcMidnightTimestamp(olderBirth)) / DAY_MS));
  const ageGapPercentage = (result.totalDays / olderAgeTodayDays) * 100;

  return [
    "Age Difference Calculator Report",
    `Generated: ${formatLongDate(today)}`,
    "",
    `Person 1: ${person1Label}`,
    `Birth date: ${formatLongDate(person1Birth)} (${formatWeekday(person1Birth)})`,
    `Zodiac: ${person1Zodiac.sign} (${person1Zodiac.element})`,
    "",
    `Person 2: ${person2Label}`,
    `Birth date: ${formatLongDate(person2Birth)} (${formatWeekday(person2Birth)})`,
    `Zodiac: ${person2Zodiac.sign} (${person2Zodiac.element})`,
    "",
    `Older person: ${olderLabel}`,
    `Younger person: ${youngerLabel}`,
    `Exact difference: ${result.years} year${result.years === 1 ? "" : "s"} ${result.months} month${result.months === 1 ? "" : "s"} ${result.days} day${result.days === 1 ? "" : "s"}`,
    `Total months: ${formatNumber(result.totalMonths)}`,
    `Total weeks: ${formatNumber(result.totalWeeks)}`,
    `Total days: ${formatNumber(result.totalDays)}`,
    `Total hours: ${formatNumber(result.totalHours)}`,
    `Total minutes: ${formatNumber(result.totalMinutes)}`,
    `Age gap percentage: ${formatPercentage(ageGapPercentage)}`,
    `Days apart: ${formatNumber(result.totalDays)}`,
    `Birth weekdays: ${formatWeekday(person1Birth)} vs ${formatWeekday(person2Birth)}`,
    `Zodiac comparison: ${person1Zodiac.sign} vs ${person2Zodiac.sign}`,
  ].join("\n");
}

function StatCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function InsightCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse">
      <div className="h-3 w-20 rounded-full bg-slate-200" />
      <div className="mt-4 h-9 w-28 rounded-full bg-slate-200" />
      <div className="mt-2 h-3 w-36 rounded-full bg-slate-100" />
    </div>
  );
}

export default function AgeDifferenceCalculatorPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Age Difference Calculator" />;
  }

  const [person1Name, setPerson1Name] = useState("");
  const [person1Dob, setPerson1Dob] = useState("");
  const [person2Name, setPerson2Name] = useState("");
  const [person2Dob, setPerson2Dob] = useState("");
  const [toast, setToast] = useState({ type: "", message: "" });
  const [isAnimating, setIsAnimating] = useState(false);
  const toastTimerRef = useRef(null);

  const person1Birth = useMemo(() => parseDateInput(person1Dob), [person1Dob]);
  const person2Birth = useMemo(() => parseDateInput(person2Dob), [person2Dob]);
  const person1Label = person1Name.trim() || "Person 1";
  const person2Label = person2Name.trim() || "Person 2";

  const validationError = useMemo(() => {
    const today = startOfTodayUtc();

    if (person1Dob && !person1Birth) {
      return "Person 1 date of birth is not valid.";
    }

    if (person2Dob && !person2Birth) {
      return "Person 2 date of birth is not valid.";
    }

    if (person1Birth && person1Birth > today) {
      return "Person 1 date of birth cannot be in the future.";
    }

    if (person2Birth && person2Birth > today) {
      return "Person 2 date of birth cannot be in the future.";
    }

    return "";
  }, [person1Birth, person1Dob, person2Birth, person2Dob]);

  const result = useMemo(() => {
    if (validationError || !person1Birth || !person2Birth) {
      return null;
    }

    return calculateAgeDifference(person1Birth, person2Birth);
  }, [person1Birth, person2Birth, validationError]);

  const person1Zodiac = person1Birth ? getZodiac(person1Birth) : null;
  const person2Zodiac = person2Birth ? getZodiac(person2Birth) : null;
  const person1Weekday = person1Birth ? formatWeekday(person1Birth) : "";
  const person2Weekday = person2Birth ? formatWeekday(person2Birth) : "";

  const summaryText = useMemo(() => {
    if (!result) {
      return "Enter two dates of birth to see the age gap.";
    }

    if (result.totalDays === 0) {
      return `${person1Label} and ${person2Label} were born on the same day.`;
    }

    const olderLabel = person1Birth <= person2Birth ? person1Label : person2Label;
    const youngerLabel = person1Birth <= person2Birth ? person2Label : person1Label;

    return `${olderLabel} is ${result.years} year${result.years === 1 ? "" : "s"}, ${result.months} month${result.months === 1 ? "" : "s"}, and ${result.days} day${result.days === 1 ? "" : "s"} older than ${youngerLabel}.`;
  }, [person1Birth, person1Label, person2Birth, person2Label, result]);

  const olderLabel = result && person1Birth && person2Birth ? (person1Birth <= person2Birth ? person1Label : person2Label) : "";
  const youngerLabel = result && person1Birth && person2Birth ? (person1Birth <= person2Birth ? person2Label : person1Label) : "";
  const olderBirth = result ? result.olderBirth : null;
  const olderAgeTodayDays = olderBirth ? Math.max(1, Math.round((getUtcMidnightTimestamp(startOfTodayUtc()) - getUtcMidnightTimestamp(olderBirth)) / DAY_MS)) : 0;
  const ageGapPercentage = result ? (result.totalDays / olderAgeTodayDays) * 100 : 0;
  const zodiacComparison = person1Zodiac && person2Zodiac
    ? person1Zodiac.sign === person2Zodiac.sign
      ? "Same zodiac sign"
      : person1Zodiac.element === person2Zodiac.element
        ? `Different signs, same ${person1Zodiac.element.toLowerCase()} element`
        : `Different signs: ${person1Zodiac.sign} vs ${person2Zodiac.sign}`
    : "Zodiac comparison appears here";

  const reportText = useMemo(() => {
    if (!result || !person1Birth || !person2Birth) {
      return "";
    }

    return buildReport({
      person1Label,
      person2Label,
      person1Birth,
      person2Birth,
      result,
    });
  }, [person1Birth, person1Label, person2Birth, person2Label, result]);

  useEffect(() => {
    if (!result) {
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    const timer = window.setTimeout(() => setIsAnimating(false), 180);
    return () => window.clearTimeout(timer);
  }, [result]);

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
    link.href = url;
    link.download = `${person1Label.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "person-1"}-vs-${person2Label.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "person-2"}-age-difference-report.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("success", "Report downloaded.");
  };

  const clearInputs = () => {
    setPerson1Name("");
    setPerson1Dob("");
    setPerson2Name("");
    setPerson2Dob("");
    setToast({ type: "", message: "" });
    showToast("success", "Inputs cleared.");
  };

  const swapDates = () => {
    setPerson1Name(person2Name);
    setPerson1Dob(person2Dob);
    setPerson2Name(person1Name);
    setPerson2Dob(person1Dob);
    showToast("success", "People swapped.");
  };

  const canUseResults = Boolean(result && !validationError);
  const shouldShowEmptyState = !validationError && !canUseResults;
  const skeletonVisible = Boolean(canUseResults && isAnimating);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Time & Date</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Age Difference Calculator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Compare two birth dates and instantly calculate the exact age gap with totals, weekday details, zodiac insight, and a downloadable report.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col gap-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <div>
              <p className="text-sm font-medium text-slate-900">Person 1</p>
              <p className="text-xs text-slate-500">Optional name and date of birth</p>
            </div>

            <input
              type="text"
              value={person1Name}
              onChange={(event) => setPerson1Name(event.target.value)}
              placeholder="Person 1 name"
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
            />

            <input
              type="date"
              value={person1Dob}
              onChange={(event) => setPerson1Dob(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Selected date</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{person1Birth ? formatLongDate(person1Birth) : "Choose a date of birth"}</p>
              {person1Birth ? <p className="mt-1 text-sm text-slate-500">{person1Weekday} • {person1Zodiac?.sign}</p> : null}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <button
              type="button"
              onClick={swapDates}
              className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-orange-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-slate-50"
              aria-label="Swap people"
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
              onClick={clearInputs}
              className="rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Clear inputs
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col gap-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <div>
              <p className="text-sm font-medium text-slate-900">Person 2</p>
              <p className="text-xs text-slate-500">Optional name and date of birth</p>
            </div>

            <input
              type="text"
              value={person2Name}
              onChange={(event) => setPerson2Name(event.target.value)}
              placeholder="Person 2 name"
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
            />

            <input
              type="date"
              value={person2Dob}
              onChange={(event) => setPerson2Dob(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Selected date</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{person2Birth ? formatLongDate(person2Birth) : "Choose a date of birth"}</p>
              {person2Birth ? <p className="mt-1 text-sm text-slate-500">{person2Weekday} • {person2Zodiac?.sign}</p> : null}
            </div>
          </div>
        </div>

        {validationError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="text-sm font-semibold">Please fix the highlighted issue.</p>
            <p className="text-sm">{validationError}</p>
          </div>
        ) : null}

        {canUseResults ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Summary</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{summaryText}</h2>
                <p className="mt-1 text-sm text-slate-500">The calculation uses UTC midnight math so leap years and time zones stay consistent.</p>
              </div>
              <p className="text-sm font-medium text-orange-600">Age gap percentage: {formatPercentage(ageGapPercentage)}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Empty state</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Enter both dates of birth to see the full comparison.</p>
            <p className="mt-1 text-sm text-slate-500">You can add names later. Results will update instantly as soon as both dates are valid.</p>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {skeletonVisible ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : canUseResults ? (
            <>
              <StatCard label="Years" value={formatNumber(result.years)} subtitle="Exact calendar years" />
              <StatCard label="Months" value={formatNumber(result.months)} subtitle="Remaining months" />
              <StatCard label="Days" value={formatNumber(result.days)} subtitle="Remaining days" />
              <StatCard label="Total months" value={formatNumber(result.totalMonths)} subtitle="Years × 12 + months" />
              <StatCard label="Total weeks" value={formatNumber(result.totalWeeks)} subtitle={`${formatNumber(result.totalDays % 7)} day${result.totalDays % 7 === 1 ? "" : "s"} leftover`} />
              <StatCard label="Total days" value={formatNumber(result.totalDays)} subtitle="Exact difference in days" />
              <StatCard label="Total hours" value={formatNumber(result.totalHours)} subtitle="24 hours per day" />
              <StatCard label="Total minutes" value={formatNumber(result.totalMinutes)} subtitle="60 minutes per hour" />
            </>
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-400">
              Result cards will appear here.
            </div>
          )}
        </div>

        {canUseResults ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <InsightCard
              label="Who is older"
              value={result.totalDays === 0 ? "Same age" : olderLabel}
              subtitle={result.totalDays === 0 ? "Both people were born on the same day." : `${olderLabel} is older than ${youngerLabel}.`}
            />
            <InsightCard label="Age gap percentage" value={formatPercentage(ageGapPercentage)} subtitle="Gap vs the older person's age today" />
            <InsightCard label="Days apart" value={`${formatNumber(result.totalDays)} day${result.totalDays === 1 ? "" : "s"}`} subtitle="Exact calendar gap between birthdays" />
            <InsightCard
              label="Zodiac comparison"
              value={zodiacComparison}
              subtitle={person1Zodiac && person2Zodiac ? `${person1Zodiac.sign} (${person1Zodiac.element}) vs ${person2Zodiac.sign} (${person2Zodiac.element})` : "Zodiac insight is optional and only shown after both dates are set."}
            />
            <InsightCard
              label="Birth weekday"
              value={result.totalDays === 0 ? `${person1Weekday} for both` : `${person1Weekday} vs ${person2Weekday}`}
              subtitle="Weekday of each birth date"
            />
            <InsightCard
              label="Age gap note"
              value={result.totalDays === 0 ? "No age gap" : summaryText}
              subtitle="A quick plain-English recap"
            />
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={copyResults}
            className={`rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 ${!canUseResults ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!canUseResults}
          >
            Copy results
          </button>
          <button
            type="button"
            onClick={downloadReport}
            className={`rounded-xl border border-orange-500 px-4 py-3 font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${!canUseResults ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!canUseResults}
          >
            Download report
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Accuracy note</p>
          <p className="mt-2 text-sm text-slate-600">
            The age gap is calculated with UTC-based calendar math and month-end clamping, which keeps leap years and varying month lengths accurate without extra dependencies.
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
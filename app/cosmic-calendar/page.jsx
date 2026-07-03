"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { COSMIC_EVENTS } from "./dataset";

const IS_RELEASED = false;

const UNIVERSE_AGE = 13.8e9; // 13.8 Billion Years
const EARTH_AGE = 4.54e9; // 4.54 Billion Years
const HUMANITY_AGE = 300000; // Homo sapiens (300,000 years)
const CIVILIZATION_AGE = 12000; // Agriculture (12,000 years)
const WRITTEN_HISTORY_AGE = 5000; // Written language (5,000 years)
const INTERNET_AGE = 57; // ARPANET (1969)
const COMPUTER_AGE = 81; // ENIAC (1945)

export default function CosmicCalendar() {
  useEffect(() => {
    if (!IS_RELEASED && typeof window !== "undefined") {
      window.location.replace("/?focus=tools");
    }
  }, []);

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [dobInput, setDobInput] = useState("");
  const [isCalculated, setIsCalculated] = useState(false);
  
  // Active states for interactive calendar
  const [activeMonth, setActiveMonth] = useState(11); // Default to December
  const [timelineSearch, setTimelineSearch] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const timelineContainerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    // Try to restore previous session from localStorage
    try {
      const stored = localStorage.getItem("boring-tools-cosmic-profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.age) {
          setName(parsed.name || "");
          setAgeInput(parsed.age.toString());
          setDobInput(parsed.dob || "");
          setIsCalculated(true);
        }
      }
    } catch (e) {
      console.error("Failed to load profile from localStorage", e);
    }
  }, []);

  // Sync profile to LocalStorage when calculated
  const handleCalculate = useCallback((e) => {
    if (e) e.preventDefault();
    const age = parseFloat(ageInput);
    if (isNaN(age) || age <= 0) {
      alert("Please enter a valid age.");
      return;
    }
    
    setIsCalculated(true);
    try {
      localStorage.setItem(
        "boring-tools-cosmic-profile",
        JSON.stringify({ name, age, dob: dobInput })
      );
    } catch (e) {
      console.error("Failed to save profile to localStorage", e);
    }
  }, [name, ageInput, dobInput]);

  const handleReset = useCallback(() => {
    setName("");
    setAgeInput("");
    setDobInput("");
    setIsCalculated(false);
    setActiveMonth(11);
    setTimelineSearch("");
    try {
      localStorage.removeItem("boring-tools-cosmic-profile");
    } catch (e) {
      console.error("Failed to remove profile from localStorage", e);
    }
  }, []);

  // Age helper values
  const age = useMemo(() => {
    const parsed = parseFloat(ageInput);
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
  }, [ageInput]);

  // Translate age to Cosmic Calendar Time
  // Universe = 13.8B years = 365 days
  // 1 year = 31,536,000 seconds
  const ageToCosmicDetails = useCallback((yearsAgo) => {
    if (yearsAgo >= UNIVERSE_AGE) {
      return {
        monthIndex: 0,
        monthName: "January",
        day: 1,
        timeStr: "12:00:00 AM",
        fullFormatted: "Jan 1, 12:00:00 AM",
        millisecondsIntoDay: 0,
        fractionLeft: 1
      };
    }
    if (yearsAgo <= 0) {
      return {
        monthIndex: 11,
        monthName: "December",
        day: 31,
        timeStr: "11:59:59 PM",
        fullFormatted: "Dec 31, 11:59:59 PM",
        millisecondsIntoDay: 86400 * 1000 - 1,
        fractionLeft: 0
      };
    }

    const elapsedYears = UNIVERSE_AGE - yearsAgo;
    const fraction = elapsedYears / UNIVERSE_AGE;
    const totalSeconds = fraction * (365 * 24 * 60 * 60);

    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    let tempSeconds = totalSeconds;
    let monthIdx = 0;
    while (monthIdx < 12) {
      const monthSecs = monthDays[monthIdx] * 24 * 60 * 60;
      if (tempSeconds < monthSecs) break;
      tempSeconds -= monthSecs;
      monthIdx++;
    }

    const daySecs = 24 * 60 * 60;
    const day = Math.floor(tempSeconds / daySecs) + 1;
    const remSeconds = tempSeconds % daySecs;

    const hour = Math.floor(remSeconds / 3600);
    const minute = Math.floor((remSeconds % 3600) / 60);
    const second = Math.floor(remSeconds % 60);

    const ampm = hour >= 12 ? "PM" : "AM";
    const hr12 = hour % 12 === 0 ? 12 : hour % 12;
    const pad = (n) => String(n).padStart(2, "0");

    const timeStr = `${pad(hr12)}:${pad(minute)}:${pad(second)} ${ampm}`;
    const monthShort = monthNames[monthIdx].substring(0, 3);

    return {
      monthIndex: monthIdx,
      monthName: monthNames[monthIdx],
      day,
      timeStr,
      fullFormatted: `${monthShort} ${day}, ${timeStr}`,
      millisecondsIntoDay: remSeconds * 1000,
      fractionLeft: 1 - fraction
    };
  }, []);

  // Compute calculated values
  const calculations = useMemo(() => {
    if (age <= 0) return null;

    const pctOfUniverse = (age / UNIVERSE_AGE) * 100;
    const pctOfEarth = (age / EARTH_AGE) * 100;
    const earthHistoryBeforeBirth = ((EARTH_AGE - age) / EARTH_AGE) * 100;
    const ageInCosmicSeconds = age / 437.5; // 1 sec = 437.5 years

    // Comparisons
    const earthMultiplier = EARTH_AGE / age;
    const universeMultiplier = UNIVERSE_AGE / age;
    const civMultiplier = CIVILIZATION_AGE / age;
    const humanMultiplier = HUMANITY_AGE / age;
    const writtenMultiplier = WRITTEN_HISTORY_AGE / age;
    const computerMultiplier = COMPUTER_AGE / age;
    const internetMultiplier = INTERNET_AGE / age;

    // User's birth location in the Cosmic Year
    const birthCosmic = ageToCosmicDetails(age);

    return {
      pctOfUniverse: pctOfUniverse.toFixed(10),
      pctOfEarth: pctOfEarth.toFixed(9),
      earthHistoryBeforeBirth: earthHistoryBeforeBirth.toFixed(8),
      ageInCosmicSeconds: ageInCosmicSeconds.toFixed(6),
      birthCosmic,
      multipliers: {
        universe: universeMultiplier.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        earth: earthMultiplier.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        human: humanMultiplier.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        civ: civMultiplier.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        written: writtenMultiplier.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        computer: computerMultiplier.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        internet: internetMultiplier.toLocaleString(undefined, { maximumFractionDigits: 0 })
      }
    };
  }, [age, ageToCosmicDetails]);

  // Group events by month for the Calendar Grid
  const eventsByMonth = useMemo(() => {
    const months = Array.from({ length: 12 }, () => []);
    COSMIC_EVENTS.forEach((event) => {
      const cosmicTime = ageToCosmicDetails(event.yearsAgo);
      months[cosmicTime.monthIndex].push({
        ...event,
        cosmicTime
      });
    });
    return months;
  }, [ageToCosmicDetails]);

  // Filtered timeline events based on search
  const filteredEvents = useMemo(() => {
    const query = timelineSearch.toLowerCase().trim();
    if (!query) return COSMIC_EVENTS.map(e => ({ ...e, cosmicTime: ageToCosmicDetails(e.yearsAgo) }));

    return COSMIC_EVENTS.map(e => ({ ...e, cosmicTime: ageToCosmicDetails(e.yearsAgo) })).filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
    );
  }, [timelineSearch, ageToCosmicDetails]);

  // Jump to timeline item helper
  const jumpToTimelineItem = useCallback((id) => {
    const el = document.getElementById(`timeline-event-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-amber-400");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-amber-400");
      }, 2000);
    }
  }, []);

  const generateMarkdownReport = useCallback(() => {
    if (!calculations) return "";
    const displayName = name ? name : "You";

    return `# Cosmic Calendar Report: ${displayName}'s Place in Time
Report generated on: ${new Date().toLocaleDateString()}

==================================================
PERSONAL METRICS
==================================================
* Name: ${displayName}
* Age: ${age} years old
* Your age as a percentage of the Universe: ${calculations.pctOfUniverse}%
* Your age as a percentage of the Earth: ${calculations.pctOfEarth}%
* Proportion of Earth history elapsed before you: ${calculations.earthHistoryBeforeBirth}%
* Your entire lifespan in Cosmic Calendar seconds: ${calculations.ageInCosmicSeconds} seconds
  (Note: 1 Cosmic Calendar second represents 437.5 Earth years)

==================================================
COSMIC CALENDAR MAPPING
==================================================
If the entire 13.8 billion year history of the Universe were compressed into one calendar year:
* The Big Bang occurs on January 1 at 12:00:00 AM.
* Earth forms on September 2.
* Dinosaurs appear on December 25 and go extinct on December 30.
* First humans (Homo erectus) appear on December 31 at 10:24:00 PM.
* Written history begins on December 31 at 11:59:48 PM.
* ${displayName} is born on December 31 at ${calculations.birthCosmic.timeStr} (only ${calculations.ageInCosmicSeconds} seconds before midnight!).

==================================================
INTERACTIVE COMPARISONS (How many times older is...)
==================================================
* The Universe is ${calculations.multipliers.universe} times older than you.
* The Earth is ${calculations.multipliers.earth} times older than you.
* The Human Species is ${calculations.multipliers.human} times older than you.
* Human Civilization is ${calculations.multipliers.civ} times older than you.
* Written History is ${calculations.multipliers.written} times older than you.
* Modern Computers are ${calculations.multipliers.computer} times older than you.
* The Internet is ${calculations.multipliers.internet} times older than you.

==================================================
PRIVACY: Everything runs locally in your browser. No information is uploaded.
==================================================
`;
  }, [name, age, calculations]);

  const handleCopy = useCallback(() => {
    const report = generateMarkdownReport();
    if (!report) return;
    navigator.clipboard.writeText(report).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [generateMarkdownReport]);

  const handleDownload = useCallback(() => {
    const report = generateMarkdownReport();
    if (!report) return;
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cosmic_calendar_report_${name ? name.toLowerCase().replace(/\s+/g, "_") : "user"}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generateMarkdownReport, name]);

  // Premium SVGs for cosmic indicators
  const renderIcon = useCallback((iconKey, className = "w-5 h-5") => {
    switch (iconKey) {
      case "big-bang":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M7.757 16.243l-2.121 2.121m12.728 0l-2.121-2.121M7.757 7.757L5.636 5.636M12 9a3 3 0 100 6 3 3 0 000-6z" />
          </svg>
        );
      case "first-stars":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.448a1 1 0 00-.364 1.118l1.287 3.97c.3.922-.755 1.688-1.54 1.118l-3.39-2.448a1 1 0 00-1.17 0l-3.39 2.448c-.783.57-1.838-.197-1.538-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.05 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
          </svg>
        );
      case "milky-way":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8a4 4 0 110 8 4 4 0 010-8zm0-4a8 8 0 110 16 8 8 0 010-16z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c4 1.5 6-3.5 9-3.5s5 5 9 3.5" />
          </svg>
        );
      case "solar-system":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="9" />
            <circle cx="18" cy="12" r="1" fill="currentColor" />
            <circle cx="6" cy="12" r="1" fill="currentColor" />
          </svg>
        );
      case "earth-formation":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014.5 9c0 3.3-1.6 6.3-4.5 9M12 3a15.3 15.3 0 00-4.5 9c0 3.3 1.6 6.3 4.5 9" />
          </svg>
        );
      case "first-oceans":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c8.954-3.086 10.546 3.086 19.5 0M2.25 16.5c8.954-3.086 10.546 3.086 19.5 0M2.25 7.5c8.954-3.086 10.546 3.086 19.5 0" />
          </svg>
        );
      case "first-life":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13z" />
            <circle cx="12" cy="12" r="2.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.5V3m0 18v-2.5m6.5-6.5H21m-18 0h2.5" />
          </svg>
        );
      case "oxygen":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a9.004 9.004 0 018.716 6.747M12 3a9.004 9.004 0 00-8.716 6.747" />
          </svg>
        );
      case "complex-cells":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747m-17.432 0A9.004 9.004 0 0012 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a9.004 9.004 0 018.716 6.747M12 9a3 3 0 100 6 3 3 0 000-6z" />
          </svg>
        );
      case "multicellular":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="8" cy="8" r="3" />
            <circle cx="16" cy="8" r="3" />
            <circle cx="12" cy="16" r="3" />
            <path d="M11 8h2m-4 5l3-3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case "cambrian":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18C8.5 7 5.5 10 5.5 12s3 5 6.5 9m0-18c3.5 4 6.5 7 6.5 9s-3 5-6.5 9m-6.5-9h13m-13-3h13m-13 6h13" />
          </svg>
        );
      case "dinosaurs":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16c2-4 6-6 10-6h5l2-2-1 5-2 1v3l-3 1-1-3h-4m-6 2c2 1 4 2 6 0m2-12a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
      case "mammals":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 8.5C8 6 10 5.5 12 5.5s4 .5 4 3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01" />
          </svg>
        );
      case "extinction":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "early-humans":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="6" r="3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v7m-3-4h6m-5 8l2-4 2 4" />
          </svg>
        );
      case "agriculture":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v15M8 6c2 1 2 4 0 5m8-5c-2 1-2 4 0 5M6 13c3 1 3 4 0 5m12-5c-3 1-3 4 0 5" />
          </svg>
        );
      case "ancient-egypt":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 19h20L12 2zM12 2v17" />
          </svg>
        );
      case "roman-empire":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V3M5 6v15M19 6v15M2 3h20M2 21h20M9 6v15M15 6v15" />
          </svg>
        );
      case "industrial":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V9l-4 3V9l-4 3V9l-4 3v9h12zM3 21h18" />
          </svg>
        );
      case "space":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5L21 3m0 0l-5.5 5.5M21 3v5.5M10.5 13.5L3 21m0 0l7.5-7.5M3 21v-7.5M16.5 16.5a4.243 4.243 0 11-6-6 4.243 4.243 0 016 6z" />
          </svg>
        );
      case "internet":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014.5 9c0 3.3-1.6 6.3-4.5 9M12 3a15.3 15.3 0 00-4.5 9c0 3.3 1.6 6.3 4.5 9" />
          </svg>
        );
      case "ai":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6v6H9zM9 1v2m6-2v2m-6 18v2m6-2v2M1 9h2m-2 6h2m18-6h2m-2 6h2" />
          </svg>
        );
      default:
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  }, []);

  const getCategoryBadgeColor = useCallback((cat) => {
    switch (cat) {
      case "cosmic": return "bg-purple-50 text-purple-700 border-purple-200";
      case "earth": return "bg-blue-50 text-blue-700 border-blue-200";
      case "life": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "humanity": return "bg-orange-50 text-orange-700 border-orange-200";
      case "technology": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }, []);

  if (!IS_RELEASED) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-amber-100 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-semibold text-slate-600">Redirecting to Boring Tools...</p>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-amber-100 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-semibold text-slate-500">Preparing Cosmic Calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full bg-slate-50/50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider animate-fadeIn">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.0" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.02 12.02l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
            <span>Cosmic Time Visualizer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cosmic Calendar
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Understand the immense scale of time by compressing the 13.8 billion year history of the Universe into a single calendar year, and see where your life fits in the grand design.
          </p>
        </div>

        {/* PROFILE INPUT / WELCOME ROW */}
        {!isCalculated ? (
          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex flex-col items-center text-center space-y-2 mb-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-2">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">Map Your Place in Cosmic History</h2>
              <p className="text-xs text-slate-500 max-w-sm">
                Enter your details to generate custom comparative metrics and plot your lifespan inside the final fractions of the cosmic year.
              </p>
            </div>

            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Name <span className="text-slate-300 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="150"
                    placeholder="e.g. 25"
                    value={ageInput}
                    onChange={(e) => setAgeInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Date of Birth <span className="text-slate-300 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={dobInput}
                  onChange={(e) => setDobInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-semibold text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-md transition active:scale-[0.99] cursor-pointer text-center block"
              >
                Visualize My Place in Time
              </button>
            </form>

            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl flex gap-3 text-left">
              <div className="text-emerald-600 shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                <span className="font-extrabold text-slate-700 block mb-0.5">100% Client-Side Privacy</span>
                Everything runs locally inside your browser. No information is uploaded. Your inputs and calculated cosmic metrics are processed entirely offline.
              </p>
            </div>
          </div>
        ) : (
          /* CALCULATED DASHBOARD AREA */
          <div className="space-y-8 animate-fadeIn">
            
            {/* Top Stats Overview Controls */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
                  <svg className="w-5 h-5 animate-spin" style={{ animationDuration: "10s" }} fill="none" stroke="currentColor" strokeWidth="2.0" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Profile</span>
                  <span className="text-sm font-bold text-slate-800">
                    {name ? name : "Anonymous User"} ({age} years old)
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm transition active:scale-98 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  <span>{copySuccess ? "Copied!" : "Copy Insights"}</span>
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 bg-white hover:bg-amber-50/40 text-amber-700 text-xs font-bold shadow-sm transition active:scale-98 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  </svg>
                  <span>Download Report</span>
                </button>

                <button
                  onClick={handleReset}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold shadow-sm transition active:scale-98 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                  <span>Reset Profile</span>
                </button>
              </div>
            </div>

            {/* PERSPECTIVE CARDS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Your Life Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-amber-300 transition">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Your Life</span>
                <div className="space-y-1">
                  <h3 className="text-2xl font-extrabold text-slate-900">{age} Years</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Compressed into the Cosmic Calendar, your entire life occupies just <strong className="text-amber-600">{calculations.ageInCosmicSeconds}s</strong> of the final second of December 31.
                  </p>
                </div>
              </div>

              {/* Human History Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-orange-300 transition">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Human History</span>
                <div className="space-y-1">
                  <h3 className="text-2xl font-extrabold text-slate-900">~300,000 Yrs</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Anatomically modern humans evolved around 11:52 PM on December 31, representing just <strong className="text-orange-600">8 minutes</strong> of the entire cosmic year.
                  </p>
                </div>
              </div>

              {/* Earth History Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-blue-300 transition">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Earth History</span>
                <div className="space-y-1">
                  <h3 className="text-2xl font-extrabold text-slate-900">4.54 Billion Yrs</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Earth formed on September 2. <strong className="text-blue-600">{calculations.earthHistoryBeforeBirth}%</strong> of Earth's history passed before you were born.
                  </p>
                </div>
              </div>

              {/* Cosmic History Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-purple-300 transition">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cosmic History</span>
                <div className="space-y-1">
                  <h3 className="text-2xl font-extrabold text-slate-900">13.8 Billion Yrs</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    The Big Bang erupted on January 1 at midnight. Your life accounts for just <strong className="text-purple-600">{calculations.pctOfUniverse}%</strong> of cosmic history.
                  </p>
                </div>
              </div>

            </div>

            {/* MAIN COMPRESSED CALENDAR VIEW */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>1. The Compressed Calendar Year</span>
                </h3>
                <span className="text-xs text-slate-400 font-semibold">Click a month to inspect its cosmic milestones</span>
              </div>

              {/* Calendar Grid of Months */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((monthName, idx) => {
                  const hasEvents = eventsByMonth[idx].length > 0;
                  const isActive = activeMonth === idx;
                  const isDecember = idx === 11;
                  
                  return (
                    <button
                      key={monthName}
                      onClick={() => setActiveMonth(idx)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition relative group flex flex-col justify-between min-h-[92px] ${
                        isActive
                          ? "border-amber-400 bg-amber-50/20 shadow-sm"
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      {/* Highlight December as special */}
                      {isDecember && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                      )}

                      <span className={`text-xs font-extrabold ${isActive ? "text-amber-700" : "text-slate-700"}`}>
                        {monthName}
                      </span>
                      
                      <div className="mt-2 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          {eventsByMonth[idx].length} {eventsByMonth[idx].length === 1 ? "Event" : "Events"}
                        </span>
                        {hasEvents && (
                          <div className="flex gap-1 overflow-hidden max-w-full">
                            {eventsByMonth[idx].slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  event.category === "cosmic" ? "bg-purple-400" :
                                  event.category === "earth" ? "bg-blue-400" :
                                  event.category === "life" ? "bg-emerald-400" :
                                  event.category === "humanity" ? "bg-orange-400" : "bg-amber-400"
                                }`}
                                title={event.name}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Month Spotlight Detail Card */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Month Spotlight: {[
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ][activeMonth]}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    ≈ {((13.8e9 / 12) / 1e9).toFixed(2)} Billion Years of History
                  </span>
                </div>

                {eventsByMonth[activeMonth].length === 0 ? (
                  <p className="text-xs text-slate-500 font-semibold italic text-center py-6">
                    A cosmic epoch of relative quiet. Universe expanding steadily, stars burning through their fuels, and gravity shaping future solar systems.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {eventsByMonth[activeMonth].map((event) => (
                      <div key={event.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 border rounded-lg shrink-0 mt-0.5 ${getCategoryBadgeColor(event.category)}`}>
                            {renderIcon(event.icon, "w-4 h-4")}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block leading-tight">{event.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold block leading-tight mt-0.5">
                              {event.yearsAgo >= 1e9
                                ? `${(event.yearsAgo / 1e9).toFixed(2)} Billion Years Ago`
                                : event.yearsAgo >= 1e6
                                ? `${(event.yearsAgo / 1e6).toFixed(0)} Million Years Ago`
                                : `${event.yearsAgo.toLocaleString()} Years Ago`}
                            </span>
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-1 max-w-2xl">
                              {event.description}
                            </p>
                          </div>
                        </div>
                        <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1">
                          <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                            {event.cosmicTime.monthName} {event.cosmicTime.day}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {event.cosmicTime.timeStr}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DECEMBER 31 DEEP-DIVE: YOU ARE HERE */}
              {activeMonth === 11 && (
                <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-100 pb-3 gap-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                        </span>
                        <span>December 31: Spotlight on Humanity</span>
                      </h4>
                      <p className="text-[10px] text-rose-600 font-semibold leading-normal mt-0.5">
                        Almost everything that characterizes humans happens in the final moments of the final day.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-rose-600 uppercase bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md shrink-0 sm:self-start">
                      Last 24 Hours
                    </span>
                  </div>

                  {/* December 31 Timeline Sub-grid */}
                  <div className="space-y-4">
                    
                    {/* Hominids */}
                    <div className="flex items-start gap-4 p-3 bg-white border border-slate-100 rounded-xl">
                      <span className="text-xs font-bold text-slate-400 w-16 shrink-0 mt-0.5 text-right">
                        10:24 PM
                      </span>
                      <div className="h-4 w-0.5 bg-slate-200 mt-2 shrink-0"></div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Early Humans (Homo erectus)</span>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                          First upright human ancestors shape tools and control fire (~2 million years ago).
                        </p>
                      </div>
                    </div>

                    {/* Modern Humans */}
                    <div className="flex items-start gap-4 p-3 bg-white border border-slate-100 rounded-xl">
                      <span className="text-xs font-bold text-slate-400 w-16 shrink-0 mt-0.5 text-right">
                        11:52 PM
                      </span>
                      <div className="h-4 w-0.5 bg-slate-200 mt-2 shrink-0"></div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Modern Humans (Homo sapiens)</span>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                          Anatomically modern humans emerge. We begin migrating out of Africa (~300,000 years ago).
                        </p>
                      </div>
                    </div>

                    {/* Agriculture */}
                    <div className="flex items-start gap-4 p-3 bg-white border border-slate-100 rounded-xl">
                      <span className="text-xs font-bold text-slate-400 w-16 shrink-0 mt-0.5 text-right">
                        11:59:32 PM
                      </span>
                      <div className="h-4 w-0.5 bg-slate-200 mt-2 shrink-0"></div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Agriculture Begins</span>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                          The birth of farming and the Neolithic Revolution allows for stable settlements (~12,000 years ago).
                        </p>
                      </div>
                    </div>

                    {/* Written language */}
                    <div className="flex items-start gap-4 p-3 bg-white border border-slate-100 rounded-xl">
                      <span className="text-xs font-bold text-slate-400 w-16 shrink-0 mt-0.5 text-right">
                        11:59:48 PM
                      </span>
                      <div className="h-4 w-0.5 bg-slate-200 mt-2 shrink-0"></div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Written History</span>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                          First written language codes (Sumer, Cuneiform). Recorded human history begins (~5,000 years ago).
                        </p>
                      </div>
                    </div>

                    {/* Roman Empire */}
                    <div className="flex items-start gap-4 p-3 bg-white border border-slate-100 rounded-xl">
                      <span className="text-xs font-bold text-slate-400 w-16 shrink-0 mt-0.5 text-right">
                        11:59:56 PM
                      </span>
                      <div className="h-4 w-0.5 bg-slate-200 mt-2 shrink-0"></div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Classical Era & Empires</span>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                          Roman Empire, Buddha, Socrates, and early philosophies shape globally (~2,000 years ago).
                        </p>
                      </div>
                    </div>

                    {/* Industrial / Modernity */}
                    <div className="flex items-start gap-4 p-3 bg-white border border-slate-100 rounded-xl">
                      <span className="text-xs font-bold text-slate-400 w-16 shrink-0 mt-0.5 text-right">
                        11:59:59 PM
                      </span>
                      <div className="h-4 w-0.5 bg-slate-200 mt-2 shrink-0"></div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Industrial Era to space age</span>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                          Industrial revolution, electricity, flights, space age, computers, internet, and AI emerge (~250 to 5 years ago).
                        </p>
                      </div>
                    </div>

                    {/* USER BIRTH - YOU ARE HERE */}
                    <div className="flex items-start gap-4 p-4.5 bg-rose-50 border border-rose-250 rounded-xl relative overflow-hidden ring-2 ring-rose-500/20">
                      <div className="absolute top-0 right-0 p-1.5 bg-rose-500 text-white font-extrabold text-[8px] uppercase tracking-widest rounded-bl-lg">
                        YOU ARE HERE
                      </div>
                      <span className="text-xs font-extrabold text-rose-700 w-16 shrink-0 mt-1 text-right">
                        {calculations.birthCosmic.timeStr}
                      </span>
                      <div className="h-8 w-0.5 bg-rose-300 mt-1.5 shrink-0"></div>
                      <div className="space-y-1">
                        <span className="text-sm font-extrabold text-rose-900 block leading-tight">
                          {name ? `${name} is Born!` : "Your Birth & Lifespan"}
                        </span>
                        <p className="text-xs text-rose-700 font-semibold leading-relaxed">
                          Your entire lifespan of {age} years resides in the final <strong className="text-rose-900">{calculations.pctOfUniverse}%</strong> of cosmic history. On the scale of the calendar, you were born just <strong className="text-rose-900">{calculations.ageInCosmicSeconds} seconds</strong> ago!
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* PERSPECTIVE REFLECTIONS SECTION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925-3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 004.8 8.586m0 5.828A5.99 5.99 0 0012 18.001M12 18a3.75 3.75 0 01-3.696-3.087m3.696 3.087a3.976 3.976 0 01-3.696-3.087M12 18v2m0-2h.01m-9.013-4h18.026" />
                </svg>
                <span>2. Cosmic Perspectives</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mind-Expanding Insights</h4>
                  <ul className="space-y-3.5">
                    <li className="flex gap-2.5 items-start text-xs text-slate-600 font-semibold leading-relaxed">
                      <span className="text-amber-500 mt-0.5 shrink-0">✦</span>
                      <span><strong>Dinosaurs</strong> appeared late in the year on <strong>December 25</strong>, dominated terrestrial life, and vanished on <strong>December 30</strong> due to an asteroid.</span>
                    </li>
                    <li className="flex gap-2.5 items-start text-xs text-slate-600 font-semibold leading-relaxed">
                      <span className="text-amber-500 mt-0.5 shrink-0">✦</span>
                      <span><strong>Recorded History</strong> (which accounts for all our ancient kings, empires, written texts, and monuments) occupies only the last <strong>11 seconds</strong> of December 31.</span>
                    </li>
                    <li className="flex gap-2.5 items-start text-xs text-slate-600 font-semibold leading-relaxed">
                      <span className="text-amber-500 mt-0.5 shrink-0">✦</span>
                      <span>You have lived for less than <strong>0.000002%</strong> of Earth's total lifespan. Earth itself was already 4.54 billion years old when you took your first breath.</span>
                    </li>
                    <li className="flex gap-2.5 items-start text-xs text-slate-600 font-semibold leading-relaxed">
                      <span className="text-amber-500 mt-0.5 shrink-0">✦</span>
                      <span>Every single atom of carbon, oxygen, iron, and nitrogen in your body was forged inside the cores of dying stars billions of years ago. We are literally made of starstuff.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-700">Insights Copy Shell</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      Click the copy button above to grab a shareable markdown card containing these perspective ratios based on your age.
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-lg max-h-[140px] overflow-y-auto">
                    <pre className="text-[10px] text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
                      {generateMarkdownReport()}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE COMPARISONS CHART */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
                <span>3. Comparative Time Scales</span>
              </h3>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  How many times longer has each milestone existed compared to your life? If your age is 1 unit, here is how many units long these epoch metrics are:
                </p>

                <div className="space-y-3.5">
                  {/* Internet */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Age of the Internet (ARPANET 1969)</span>
                      <span>{calculations.multipliers.internet}x your life</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(100, (INTERNET_AGE / age) * 10)}%` }}></div>
                    </div>
                  </div>

                  {/* Modern Computers */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Age of Modern Computers (1945)</span>
                      <span>{calculations.multipliers.computer}x your life</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (COMPUTER_AGE / age) * 10)}%` }}></div>
                    </div>
                  </div>

                  {/* Written History */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Recorded Written History (5,000 yrs)</span>
                      <span>{calculations.multipliers.written}x your life</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-orange-400 h-full rounded-full" style={{ width: `${Math.min(100, (WRITTEN_HISTORY_AGE / age) * 10)}%` }}></div>
                    </div>
                  </div>

                  {/* Civilization */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Human Civilization (12,000 yrs)</span>
                      <span>{calculations.multipliers.civ}x your life</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min(100, (CIVILIZATION_AGE / age) * 10)}%` }}></div>
                    </div>
                  </div>

                  {/* Human Species */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Human Species (Homo sapiens, 300,000 yrs)</span>
                      <span>{calculations.multipliers.human}x your life</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (HUMANITY_AGE / age) * 10)}%` }}></div>
                    </div>
                  </div>

                  {/* Earth */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Age of Earth (4.54B yrs)</span>
                      <span>{calculations.multipliers.earth}x your life</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (EARTH_AGE / age) * 10)}%` }}></div>
                    </div>
                  </div>

                  {/* Universe */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Age of the Universe (13.8B yrs)</span>
                      <span>{calculations.multipliers.universe}x your life</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, (UNIVERSE_AGE / age) * 10)}%` }}></div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* FULL INTERACTIVE SCROLLABLE TIMELINE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  <span>4. Deep Cosmic Timeline</span>
                </h3>
                
                {/* Search Bar Input */}
                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    placeholder="Search milestones (e.g. Earth, Life)..."
                    value={timelineSearch}
                    onChange={(e) => setTimelineSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs font-semibold text-slate-800"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Fast Jump Category Tags */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Quick Jump Events</span>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => jumpToTimelineItem("big-bang")} className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/20 text-slate-700 font-bold transition cursor-pointer">
                    🌌 Big Bang
                  </button>
                  <button onClick={() => jumpToTimelineItem("dinosaurs")} className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/20 text-slate-700 font-bold transition cursor-pointer">
                    🦖 Dinosaurs
                  </button>
                  <button onClick={() => jumpToTimelineItem("cambrian-explosion")} className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/20 text-slate-700 font-bold transition cursor-pointer">
                    🌊 Cambrian Explosion
                  </button>
                  <button onClick={() => jumpToTimelineItem("early-humans")} className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/20 text-slate-700 font-bold transition cursor-pointer">
                    🚶 Humans
                  </button>
                  <button onClick={() => jumpToTimelineItem("space-age")} className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/20 text-slate-700 font-bold transition cursor-pointer">
                    🚀 Moon Landing
                  </button>
                  <button onClick={() => jumpToTimelineItem("internet")} className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/20 text-slate-700 font-bold transition cursor-pointer">
                    🌐 Internet
                  </button>
                  <button onClick={() => jumpToTimelineItem("artificial-intelligence")} className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/20 text-slate-700 font-bold transition cursor-pointer">
                    🤖 AI
                  </button>
                </div>
              </div>

              {/* Vertical Scroll Timeline list */}
              <div ref={timelineContainerRef} className="space-y-4 max-h-[500px] overflow-y-auto pr-2 divide-y divide-slate-100">
                {filteredEvents.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                    No timeline matches for "{timelineSearch}"
                  </div>
                ) : (
                  filteredEvents.map((event, idx) => (
                    <div
                      key={event.id}
                      id={`timeline-event-${event.id}`}
                      className="py-4 flex gap-4 transition-all duration-300 first:pt-0"
                    >
                      {/* Left: icon with connecting line */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`p-2.5 border rounded-xl ${getCategoryBadgeColor(event.category)}`}>
                          {renderIcon(event.icon, "w-5 h-5")}
                        </div>
                        {idx < filteredEvents.length - 1 && (
                          <div className="w-0.5 flex-1 bg-slate-100 my-2"></div>
                        )}
                      </div>

                      {/* Right: info */}
                      <div className="flex-1 space-y-1 text-left">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <h4 className="text-sm font-extrabold text-slate-800 leading-tight">
                            {event.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getCategoryBadgeColor(event.category)}`}>
                              {event.category}
                            </span>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                              {event.cosmicTime.monthName} {event.cosmicTime.day}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-bold block">
                          {event.yearsAgo >= 1e9
                            ? `${(event.yearsAgo / 1e9).toFixed(2)} Billion Years Ago`
                            : event.yearsAgo >= 1e6
                            ? `${(event.yearsAgo / 1e6).toFixed(0)} Million Years Ago`
                            : `${event.yearsAgo.toLocaleString()} Years Ago`}
                        </span>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* FUN COSMIC FACTS CAROUSEL */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>4. Interesting Cosmic Facts</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Sunlight Delay</span>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    Light travels at 299,792 km/s. The light you see from the Sun left its surface approximately <strong>8 minutes and 20 seconds</strong> ago. You are always looking back in time.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Star Stuff Core</span>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    Every hydrogen atom in your water molecules was created in the Big Bang. Every oxygen, carbon, and iron atom was forged in later generations of nuclear-fusing stars.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Civilization Span</span>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    Humans have been writing and building civilizations for less than <strong>0.003%</strong> of Earth's history. We are a brand new addition to an ancient biosphere.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Universe Age</span>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    The observable universe is estimated to be <strong>13.797 ± 0.023 billion years</strong> old. It contains over 2 trillion galaxies, each hosting hundreds of billions of stars.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Policy Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-start gap-3">
              <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Privacy Statement</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Everything runs locally inside your browser. No information is uploaded. Your name, age, date of birth, and compared metrics are processed entirely offline inside your browser sandbox.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}

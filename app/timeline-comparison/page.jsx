"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { HISTORICAL_DATASET } from "./dataset";

const IS_RELEASED = true;

export default function TimelineComparison() {
  useEffect(() => {
    if (!IS_RELEASED && typeof window !== "undefined") {
      window.location.replace("/?focus=tools");
    }
  }, []);
  const [itemAId, setItemAId] = useState("");
  const [itemBId, setItemBId] = useState("");
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [showSuggestionsA, setShowSuggestionsA] = useState(false);
  const [showSuggestionsB, setShowSuggestionsB] = useState(false);
  const [recents, setRecents] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  const containerRefA = useRef(null);
  const containerRefB = useRef(null);

  // Load recents from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("boring-tools-timeline-recents");
      if (stored) {
        const timer = setTimeout(() => {
          setRecents(JSON.parse(stored));
        }, 0);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("Failed to load recents from localStorage", e);
    }
  }, []);

  // Sync recents to LocalStorage when changed
  useEffect(() => {
    if (recents.length > 0) {
      try {
        localStorage.setItem("boring-tools-timeline-recents", JSON.stringify(recents));
      } catch (e) {
        console.error("Failed to save recents to localStorage", e);
      }
    }
  }, [recents]);

  // Save a comparison to recents
  const saveToRecents = useCallback((idA, idB) => {
    if (!idA || !idB || idA === idB) return;
    try {
      const nameA = HISTORICAL_DATASET[idA].name;
      const nameB = HISTORICAL_DATASET[idB].name;
      const newItem = { idA, idB, nameA, nameB, timestamp: Date.now() };

      setRecents((prev) => {
        const filtered = prev.filter(
          (r) => !(r.idA === idA && r.idB === idB) && !(r.idA === idB && r.idB === idA)
        );
        return [newItem, ...filtered].slice(0, 5);
      });
    } catch (e) {
      console.error("Failed to save recents", e);
    }
  }, []);

  // Close suggestion dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRefA.current && !containerRefA.current.contains(event.target)) {
        setShowSuggestionsA(false);
      }
      if (containerRefB.current && !containerRefB.current.contains(event.target)) {
        setShowSuggestionsB(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectA = useCallback((id) => {
    setItemAId(id);
    setSearchA(HISTORICAL_DATASET[id].name);
    setShowSuggestionsA(false);
    if (itemBId && itemBId !== id) {
      saveToRecents(id, itemBId);
    }
  }, [itemBId, saveToRecents]);

  const handleSelectB = useCallback((id) => {
    setItemBId(id);
    setSearchB(HISTORICAL_DATASET[id].name);
    setShowSuggestionsB(false);
    if (itemAId && itemAId !== id) {
      saveToRecents(itemAId, id);
    }
  }, [itemAId, saveToRecents]);

  const handleSwap = useCallback(() => {
    setItemAId((prevA) => {
      setItemBId((prevB) => {
        setSearchA(prevB ? HISTORICAL_DATASET[prevB].name : "");
        setSearchB(prevA ? HISTORICAL_DATASET[prevA].name : "");
        if (prevB && prevA && prevB !== prevA) {
          saveToRecents(prevB, prevA);
        }
        return prevA;
      });
      return itemBId;
    });
  }, [itemBId, saveToRecents]);

  const handleReset = useCallback(() => {
    setItemAId("");
    setItemBId("");
    setSearchA("");
    setSearchB("");
    setShowSuggestionsA(false);
    setShowSuggestionsB(false);
  }, []);

  const loadPreset = useCallback((idA, idB) => {
    setItemAId(idA);
    setSearchA(HISTORICAL_DATASET[idA].name);
    setItemBId(idB);
    setSearchB(HISTORICAL_DATASET[idB].name);
    saveToRecents(idA, idB);
  }, [saveToRecents]);

  const itemA = HISTORICAL_DATASET[itemAId];
  const itemB = HISTORICAL_DATASET[itemBId];

  // Filter keys for autocomplete based on input
  const getSuggestions = useCallback((query, excludeId) => {
    const list = Object.values(HISTORICAL_DATASET).filter(
      (item) => item.id !== excludeId
    );
    if (!query) return list;
    const lower = query.toLowerCase();
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
    );
  }, []);

  const suggestionsA = getSuggestions(searchA, itemBId);
  const suggestionsB = getSuggestions(searchB, itemAId);

  // Helper to render Category labels with color badge
  const getCategoryColor = useCallback((cat) => {
    switch (cat) {
      case "Civilizations":
        return "bg-rose-50 border-rose-100 text-rose-700";
      case "Technology":
        return "bg-emerald-50 border-emerald-100 text-emerald-700";
      case "Historical Events":
        return "bg-blue-50 border-blue-100 text-blue-700";
      default:
        return "bg-slate-50 border-slate-100 text-slate-750";
    }
  }, []);

  // 12 Section content export helpers
  const generateMarkdownReport = useCallback(() => {
    if (!itemA || !itemB) return "";
    return `# Historical Comparison: ${itemA.name} VS ${itemB.name}
Generated via Boring Tools Timeline Comparison

==================================================
1. TIMELINE
==================================================
[${itemA.name}]
- Started: ${itemA.timeline.started}
- Peak: ${itemA.timeline.peak}
- Decline: ${itemA.timeline.decline}
- End: ${itemA.timeline.end}

[${itemB.name}]
- Started: ${itemB.timeline.started}
- Peak: ${itemB.timeline.peak}
- Decline: ${itemB.timeline.decline}
- End: ${itemB.timeline.end}

==================================================
2. DURATION
==================================================
- ${itemA.name} Total Duration: ${itemA.duration.totalYearsDisplay} (Peak: ${itemA.duration.peakYearsDisplay})
- ${itemB.name} Total Duration: ${itemB.duration.totalYearsDisplay} (Peak: ${itemB.duration.peakYearsDisplay})
- Note: ${itemA.name}: ${itemA.duration.note} | ${itemB.name}: ${itemB.duration.note}

==================================================
3. GEOGRAPHY
==================================================
[${itemA.name}]
- Region: ${itemA.geography.region}
- Maximum Area: ${itemA.geography.maxAreaDisplay}
- Important Cities: ${itemA.geography.importantCities.join(", ")}

[${itemB.name}]
- Region: ${itemB.geography.region}
- Maximum Area: ${itemB.geography.maxAreaDisplay}
- Important Cities: ${itemB.geography.importantCities.join(", ")}

==================================================
4. POPULATION
==================================================
- ${itemA.name} Peak Population: ${itemA.population.peakDisplay} (${itemA.population.note})
- ${itemB.name} Peak Population: ${itemB.population.peakDisplay} (${itemB.population.note})

==================================================
5. ECONOMY
==================================================
[${itemA.name}]
- Trade: ${itemA.economy.trade}
- Wealth: ${itemA.economy.wealth}
- Currency: ${itemA.economy.currency}
- Major Industries: ${itemA.economy.industries.join(", ")}

[${itemB.name}]
- Trade: ${itemB.economy.trade}
- Wealth: ${itemB.economy.wealth}
- Currency: ${itemB.economy.currency}
- Major Industries: ${itemB.economy.industries.join(", ")}

==================================================
6. TECHNOLOGY & INNOVATION
==================================================
- ${itemA.name} Key Innovations: ${itemA.technology.join(", ")}
- ${itemB.name} Key Innovations: ${itemB.technology.join(", ")}

==================================================
7. MILITARY / INFLUENCE
==================================================
[${itemA.name}]
- Strength: ${itemA.military.strength}
- Expansion: ${itemA.military.expansion}
- Important Battles: ${itemA.military.importantBattles.join(", ")}

[${itemB.name}]
- Strength: ${itemB.military.strength}
- Expansion: ${itemB.military.expansion}
- Important Battles: ${itemB.military.importantBattles.join(", ")}

==================================================
8. SOCIETY & CULTURE
==================================================
[${itemA.name}]
- Education: ${itemA.society.education}
- Lifestyle: ${itemA.society.lifestyle}
- Culture: ${itemA.society.culture}
- Religion: ${itemA.society.religion}
- Architecture: ${itemA.society.architecture}

[${itemB.name}]
- Education: ${itemB.society.education}
- Lifestyle: ${itemB.society.lifestyle}
- Culture: ${itemB.society.culture}
- Religion: ${itemB.society.religion}
- Architecture: ${itemB.society.architecture}

==================================================
9. GREATEST ACHIEVEMENTS
==================================================
[${itemA.name}]
${itemA.achievements.map((a) => `* ${a}`).join("\n")}

[${itemB.name}]
${itemB.achievements.map((b) => `* ${b}`).join("\n")}

==================================================
10. REASONS FOR DECLINE / CHALLENGES
==================================================
- ${itemA.name}: ${itemA.declineReason}
- ${itemB.name}: ${itemB.declineReason}

==================================================
11. LEGACY & MODERN INFLUENCE
==================================================
- ${itemA.name}: ${itemA.legacy}
- ${itemB.name}: ${itemB.legacy}

==================================================
12. FUN FACTS
==================================================
[${itemA.name}]
${itemA.funFacts.map((f) => `* ${f}`).join("\n")}

[${itemB.name}]
${itemB.funFacts.map((f) => `* ${f}`).join("\n")}

--------------------------------------------------
PRIVACY: Everything runs locally in your browser. No information is uploaded.
`;
  }, [itemA, itemB]);

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
    link.setAttribute("download", `timeline_comparison_${itemA.id}_vs_${itemB.id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generateMarkdownReport, itemA, itemB]);

  // Premium SVGs for all historical items, categories, stages, and sections
  const renderPremiumIcon = useCallback((iconKey, className = "w-5 h-5") => {
    switch (iconKey) {
      // --- CIVILIZATIONS ---
      case "roman-empire":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V3M5 6v15M19 6v15M2 3h20M2 21h20M9 6v15M15 6v15" />
          </svg>
        );
      case "british-empire":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M12 12L5.6 5.6M12 12l6.4 6.4M12 12l6.4-6.4M12 12L5.6 18.4M9 12h6M12 9v6" />
          </svg>
        );
      case "ottoman-empire":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10v8h-2v-2h-3v4h-5zM12 6a4 4 0 00-4 4M12 6a4 4 0 014 4" />
          </svg>
        );
      case "mughal-empire":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6-3-6-10a6 6 0 0112 0c0 7-6 10-6 10zm-9 0h18M6 21V11m12 10V11M12 2v3" />
          </svg>
        );
      case "maurya-empire":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4L18.4 5.6M8.2 6.8l7.6 10.4M8.2 17.2L15.8 6.8" />
          </svg>
        );
      case "gupta-empire":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6c-3 0-5 2-5 5s2 7 5 7 5-4 5-7-2-5-5-5zm-5 5h10M9.5 9.5l5 5M9.5 14.5l5-5" />
          </svg>
        );
      case "mongol-empire":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM8 9h8M8 13h8M12 6v10" />
          </svg>
        );
      case "ancient-egypt":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 20h20L12 2zm0 2l7 16M12 2L5 20" />
          </svg>
        );
      case "ancient-greece":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 18h18M4 6h16M12 2L2 6h20L12 2zM6 6v12M10 6v12M14 6v12M18 6v12" />
          </svg>
        );
      case "indus-valley":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3V3zm6 0v18M15 0v24M3 9h18M3 15h18" />
          </svg>
        );

      // --- TECHNOLOGY ---
      case "internet":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
          </svg>
        );
      case "smartphones":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect x="5" y="2" width="14" height="20" rx="3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 5h8" />
          </svg>
        );
      case "electricity":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9v8l10-12h-9V2z" />
          </svg>
        );
      case "printing-press":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6M9 13h6M9 17h3" />
          </svg>
        );
      case "steam-engine":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18M5 17a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zm-7-2v-4M8 7l4 4 4-4M3 7h18" />
          </svg>
        );
      case "ai":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect x="5" y="5" width="14" height="14" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6v6H9V9zM9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
          </svg>
        );

      // --- EVENTS ---
      case "world-war-i":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.5 5.5l13 13M5.5 18.5l13-13M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        );
      case "world-war-ii":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 6a3 3 0 100 6 3 3 0 000-6zm-4 9h8" />
          </svg>
        );
      case "french-revolution":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9-3 9 3v12a6 6 0 01-6 6l-3-2-3 2a6 6 0 01-6-6V6zm9-3v21M6 10h12" />
          </svg>
        );
      case "industrial-revolution":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10l4-4 4 4 4-4 4 4v11H3V10zm11 3h2v3h-2v-3z" />
          </svg>
        );
      case "green-revolution":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M12 3a9 9 0 019 9c0 4-4 6-9 9M12 3a9 9 0 00-9 9c0 4 4 6 9 9M7 10l5-3 5 3M7 15l5-3 5 3" />
          </svg>
        );
      case "cold-war":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 8v8M8 12h8" />
          </svg>
        );

      // --- GENERAL CATEGORIES ---
      case "Civilizations":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918" />
          </svg>
        );
      case "Technology":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case "Historical Events":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );

      // --- ASPECT SECTIONS ---
      case "aspect-duration":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          </svg>
        );
      case "aspect-geography":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3c1.7 2.7 3 5.7 3 9s-1.3 6.3-3 9m0-18c-1.7 2.7-3 5.7-3 9s1.3 6.3 3 9" />
          </svg>
        );
      case "aspect-population":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 100-8 4 4 0 000 8zm-8 0a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
        );
      case "aspect-economy":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "aspect-technology":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case "aspect-military":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case "aspect-society":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "aspect-achievements":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case "aspect-decline":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case "aspect-legacy":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5" />
          </svg>
        );
      case "aspect-funfacts":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );

      // --- STAGE TIMELINE INDICATORS ---
      case "stage-started":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V6m0 0l-4 4m4-4l4 4m-8 9h8" />
          </svg>
        );
      case "stage-peak":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.906a1 1 0 00.95-.69l1.519-4.674z" />
          </svg>
        );
      case "stage-decline":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      case "stage-end":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );

      default:
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
    }
  }, []);

  if (!IS_RELEASED) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-semibold text-slate-600">Redirecting to Boring Tools...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full bg-slate-50/50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
            <span>Learning Tool</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Timeline Comparison
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Visually compare two historical civilizations, technologies, or events side-by-side. Inspect timelines, durations, geography, economies, and military power.
          </p>
        </div>

        {/* Search Inputs Row */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 relative z-30">
          
          {/* Dropdown A */}
          <div ref={containerRefA} className="flex-1 relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Item A</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Item A (e.g. Roman Empire)"
                value={searchA}
                onChange={(e) => {
                  setSearchA(e.target.value);
                  setItemAId(""); // Reset ID if user is typing
                  setShowSuggestionsA(true);
                }}
                onFocus={() => setShowSuggestionsA(true)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-semibold text-slate-800"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                {itemA ? renderPremiumIcon(itemAId, "w-5 h-5") : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 8a3 3 0 00-3 3" />
                  </svg>
                )}
              </div>
            </div>
            
            {showSuggestionsA && (
              <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg z-50 divide-y divide-slate-100">
                {suggestionsA.length > 0 ? (
                  suggestionsA.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectA(item.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-sm transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 shrink-0">
                          {renderPremiumIcon(item.id, "w-4.5 h-4.5")}
                        </span>
                        <span className="font-semibold text-slate-800">{item.name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-400 text-center font-medium">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* VS Divider / Swap Button */}
          <div className="flex justify-center md:pt-6">
            <button
              onClick={handleSwap}
              disabled={!itemAId && !itemBId}
              className="p-3 rounded-full border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 text-slate-500 hover:text-orange-600 shadow-sm transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              title="Swap Items"
            >
              <svg className="w-5 h-5 md:rotate-90" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* Dropdown B */}
          <div ref={containerRefB} className="flex-1 relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Item B</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Item B (e.g. British Empire)"
                value={searchB}
                onChange={(e) => {
                  setSearchB(e.target.value);
                  setItemBId(""); // Reset ID if user is typing
                  setShowSuggestionsB(true);
                }}
                onFocus={() => setShowSuggestionsB(true)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-semibold text-slate-800"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                {itemB ? renderPremiumIcon(itemBId, "w-5 h-5") : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 8a3 3 0 00-3 3" />
                  </svg>
                )}
              </div>
            </div>

            {showSuggestionsB && (
              <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg z-50 divide-y divide-slate-100">
                {suggestionsB.length > 0 ? (
                  suggestionsB.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectB(item.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-sm transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 shrink-0">
                          {renderPremiumIcon(item.id, "w-4.5 h-4.5")}
                        </span>
                        <span className="font-semibold text-slate-800">{item.name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-400 text-center font-medium">No results found</div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Interactive Comparison Dashboard Area */}
        {itemA && itemB ? (
          <div className="space-y-8 animate-fadeIn relative z-10">
            
            {/* Dashboard Action Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-250 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Comparison</span>
                <span className="text-xs bg-orange-100 border border-orange-200 text-orange-850 px-2 py-0.5 rounded-md font-bold uppercase">
                  {itemA.category} VS {itemB.category}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopy}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm transition active:scale-98 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  <span>{copySuccess ? "Copied!" : "Copy Results"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-orange-200 bg-white hover:bg-orange-50/40 text-orange-600 text-xs font-bold shadow-sm transition active:scale-98 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  </svg>
                  <span>Download Report</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold shadow-sm transition active:scale-98 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 4.93l1.41 1.41M19.07 4.93l-1.41 1.41M12 2v3M3 12h3M18 12h3M12 19v3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76a6 6 0 010 8.49m-8.49 0a6 6 0 010-8.49" />
                  </svg>
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Visual Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Item A Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600">
                    {renderPremiumIcon(itemAId, "w-6 h-6")}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Item A ({itemA.category})</span>
                    <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{itemA.name}</h3>
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="text-sm font-semibold text-slate-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Span:</span>
                    <span>{itemA.duration.totalYearsDisplay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Peak Era:</span>
                    <span>{itemA.duration.peakYearsDisplay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Geography:</span>
                    <span>{itemA.geography.maxAreaDisplay}</span>
                  </div>
                </div>
              </div>

              {/* Item B Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600">
                    {renderPremiumIcon(itemBId, "w-6 h-6")}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Item B ({itemB.category})</span>
                    <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{itemB.name}</h3>
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="text-sm font-semibold text-slate-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Span:</span>
                    <span>{itemB.duration.totalYearsDisplay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Peak Era:</span>
                    <span>{itemB.duration.peakYearsDisplay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Geography:</span>
                    <span>{itemB.geography.maxAreaDisplay}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* 1. VISUAL TIMELINE FLOW */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                {renderPremiumIcon("aspect-duration", "w-4.5 h-4.5 text-orange-650")}
                <span>1. Timeline Progression</span>
              </h3>

              {/* Vertical flow side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                {/* Center line divider for desktop */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 border-l border-dashed border-slate-200 transform -translate-x-1/2"></div>
                
                {/* Timeline A */}
                <div className="space-y-6 relative">
                  <span className="absolute top-0 right-0 text-[10px] font-bold text-rose-500 uppercase tracking-widest">{itemA.name}</span>
                  
                  {/* Started */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                        {renderPremiumIcon("stage-started", "w-4 h-4 text-rose-700")}
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-100"></div>
                    </div>
                    <div className="pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Started / Origin</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{itemA.timeline.started}</p>
                    </div>
                  </div>

                  {/* Peak */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                        {renderPremiumIcon("stage-peak", "w-4 h-4 text-amber-700")}
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-100"></div>
                    </div>
                    <div className="pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Peak / Zenith</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{itemA.timeline.peak}</p>
                    </div>
                  </div>

                  {/* Decline */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-700">
                        {renderPremiumIcon("stage-decline", "w-4 h-4 text-orange-700")}
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-100"></div>
                    </div>
                    <div className="pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Decline / Transition</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{itemA.timeline.decline}</p>
                    </div>
                  </div>

                  {/* End */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
                        {renderPremiumIcon("stage-end", "w-4 h-4 text-slate-700")}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">End / Resolution</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{itemA.timeline.end}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline B */}
                <div className="space-y-6 relative">
                  <span className="absolute top-0 right-0 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{itemB.name}</span>
                  
                  {/* Started */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        {renderPremiumIcon("stage-started", "w-4 h-4 text-emerald-700")}
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-100"></div>
                    </div>
                    <div className="pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Started / Origin</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{itemB.timeline.started}</p>
                    </div>
                  </div>

                  {/* Peak */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                        {renderPremiumIcon("stage-peak", "w-4 h-4 text-amber-700")}
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-100"></div>
                    </div>
                    <div className="pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Peak / Zenith</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{itemB.timeline.peak}</p>
                    </div>
                  </div>

                  {/* Decline */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-700">
                        {renderPremiumIcon("stage-decline", "w-4 h-4 text-orange-700")}
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-100"></div>
                    </div>
                    <div className="pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Decline / Transition</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{itemB.timeline.decline}</p>
                    </div>
                  </div>

                  {/* End */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
                        {renderPremiumIcon("stage-end", "w-4 h-4 text-slate-700")}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">End / Resolution</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{itemB.timeline.end}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                {renderPremiumIcon("aspect-geography", "w-4.5 h-4.5 text-orange-650")}
                <span>2, 3 & 4. Proportional Statistics</span>
              </h3>

              <div className="space-y-6">
                
                {/* 2. Duration Comparison Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-xs font-bold">
                    <span className="text-slate-500 uppercase tracking-wider">Total Duration (Years)</span>
                    <span className="text-slate-700">{itemA.name} ({itemA.duration.totalYears} yrs) vs {itemB.name} ({itemB.duration.totalYears} yrs)</span>
                  </div>
                  <div className="space-y-1.5">
                    {/* Bar A */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-0.5">
                        <span>{itemA.name}</span>
                        <span>{itemA.duration.totalYearsDisplay}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (itemA.duration.totalYears /
                                Math.max(itemA.duration.totalYears, itemB.duration.totalYears)) *
                              100
                            }%`
                          }}
                        ></div>
                      </div>
                    </div>
                    {/* Bar B */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-0.5">
                        <span>{itemB.name}</span>
                        <span>{itemB.duration.totalYearsDisplay}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (itemB.duration.totalYears /
                                Math.max(itemA.duration.totalYears, itemB.duration.totalYears)) *
                              100
                            }%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    * {itemA.name}: {itemA.duration.note} | {itemB.name}: {itemB.duration.note}
                  </p>
                </div>

                {/* 3. Area Comparison Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-xs font-bold">
                    <span className="text-slate-500 uppercase tracking-wider">Geography / Max Coverage Area</span>
                    <span className="text-slate-700">Relative scale comparison</span>
                  </div>
                  <div className="space-y-1.5">
                    {/* Bar A */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-0.5">
                        <span>{itemA.name}</span>
                        <span>{itemA.geography.maxAreaDisplay}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (itemA.geography.maxAreaKm /
                                Math.max(itemA.geography.maxAreaKm, itemB.geography.maxAreaKm || 1)) *
                              100
                            }%`
                          }}
                        ></div>
                      </div>
                    </div>
                    {/* Bar B */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-0.5">
                        <span>{itemB.name}</span>
                        <span>{itemB.geography.maxAreaDisplay}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (itemB.geography.maxAreaKm /
                                Math.max(itemA.geography.maxAreaKm, itemB.geography.maxAreaKm || 1)) *
                              100
                            }%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">{itemA.name} Cities / Focus Hubs</span>
                      <span className="font-semibold text-slate-800">{itemA.geography.importantCities.join(", ")}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">{itemB.name} Cities / Focus Hubs</span>
                      <span className="font-semibold text-slate-800">{itemB.geography.importantCities.join(", ")}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Population Comparison Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-xs font-bold">
                    <span className="text-slate-500 uppercase tracking-wider">Estimated Population (Peak)</span>
                    <span className="text-slate-700">Demographic impact</span>
                  </div>
                  <div className="space-y-1.5">
                    {/* Bar A */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-0.5">
                        <span>{itemA.name}</span>
                        <span>{itemA.population.peakDisplay}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (itemA.population.peakNum /
                                Math.max(itemA.population.peakNum, itemB.population.peakNum)) *
                              100
                            }%`
                          }}
                        ></div>
                      </div>
                    </div>
                    {/* Bar B */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-0.5">
                        <span>{itemB.name}</span>
                        <span>{itemB.population.peakDisplay}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (itemB.population.peakNum /
                                Math.max(itemA.population.peakNum, itemB.population.peakNum)) *
                              100
                            }%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    * Notes: {itemA.name}: {itemA.population.note} | {itemB.name}: {itemB.population.note}
                  </p>
                </div>

              </div>
            </div>

            {/* DETAILED CATEGORIES GRID (5 through 12) */}
            <div className="space-y-6">

              {/* 5. Economy */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
                  <div className="p-1 bg-white border border-slate-200 rounded-lg text-orange-650">
                    {renderPremiumIcon("aspect-economy", "w-4 h-4")}
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 tracking-tight">5. Economy, Trade & Currency</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">{itemA.name}</span>
                    <div className="text-sm space-y-1.5 font-semibold text-slate-700">
                      <div><span className="text-slate-400">Trade: </span>{itemA.economy.trade}</div>
                      <div><span className="text-slate-400">Wealth: </span>{itemA.economy.wealth}</div>
                      <div><span className="text-slate-400">Currency: </span>{itemA.economy.currency}</div>
                      <div><span className="text-slate-400">Major Industries: </span>{itemA.economy.industries.join(", ")}</div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">{itemB.name}</span>
                    <div className="text-sm space-y-1.5 font-semibold text-slate-700">
                      <div><span className="text-slate-400">Trade: </span>{itemB.economy.trade}</div>
                      <div><span className="text-slate-400">Wealth: </span>{itemB.economy.wealth}</div>
                      <div><span className="text-slate-400">Currency: </span>{itemB.economy.currency}</div>
                      <div><span className="text-slate-400">Major Industries: </span>{itemB.economy.industries.join(", ")}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Technology Innovations */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
                  <div className="p-1 bg-white border border-slate-200 rounded-lg text-orange-655">
                    {renderPremiumIcon("aspect-technology", "w-4 h-4")}
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 tracking-tight">6. Technology & Innovations</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">{itemA.name}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {itemA.technology.map((tech, idx) => (
                        <span key={idx} className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">{itemB.name}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {itemB.technology.map((tech, idx) => (
                        <span key={idx} className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. Military / Tactical Influence */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
                  <div className="p-1 bg-white border border-slate-200 rounded-lg text-orange-655">
                    {renderPremiumIcon("aspect-military", "w-4 h-4")}
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 tracking-tight">7. Military Strength & Geopolitical Expansion</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">{itemA.name}</span>
                    <div className="text-sm space-y-2 font-semibold text-slate-700">
                      <div><span className="text-slate-400 block text-[10px] uppercase">Force Strength</span>{itemA.military.strength}</div>
                      <div><span className="text-slate-400 block text-[10px] uppercase">Expansion Method</span>{itemA.military.expansion}</div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase mb-1">Key Battles / Milestones</span>
                        <div className="flex flex-wrap gap-1">
                          {itemA.military.importantBattles.map((b, i) => (
                            <span key={i} className="text-[10px] bg-rose-50 border border-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">{itemB.name}</span>
                    <div className="text-sm space-y-2 font-semibold text-slate-700">
                      <div><span className="text-slate-400 block text-[10px] uppercase">Force Strength</span>{itemB.military.strength}</div>
                      <div><span className="text-slate-400 block text-[10px] uppercase">Expansion Method</span>{itemB.military.expansion}</div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase mb-1">Key Battles / Milestones</span>
                        <div className="flex flex-wrap gap-1">
                          {itemB.military.importantBattles.map((b, i) => (
                            <span key={i} className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Society & Culture */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
                  <div className="p-1 bg-white border border-slate-200 rounded-lg text-orange-655">
                    {renderPremiumIcon("aspect-society", "w-4 h-4")}
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 tracking-tight">8. Society, Education, Culture & Architecture</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">{itemA.name}</span>
                    <div className="text-sm space-y-2 font-semibold text-slate-700">
                      <div><span className="text-slate-400">Education: </span>{itemA.society.education}</div>
                      <div><span className="text-slate-400">Lifestyle: </span>{itemA.society.lifestyle}</div>
                      <div><span className="text-slate-400">Culture: </span>{itemA.society.culture}</div>
                      <div><span className="text-slate-400">Religion: </span>{itemA.society.religion}</div>
                      <div><span className="text-slate-400">Architecture: </span>{itemA.society.architecture}</div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">{itemB.name}</span>
                    <div className="text-sm space-y-2 font-semibold text-slate-700">
                      <div><span className="text-slate-400">Education: </span>{itemB.society.education}</div>
                      <div><span className="text-slate-400">Lifestyle: </span>{itemB.society.lifestyle}</div>
                      <div><span className="text-slate-400">Culture: </span>{itemB.society.culture}</div>
                      <div><span className="text-slate-400">Religion: </span>{itemB.society.religion}</div>
                      <div><span className="text-slate-400">Architecture: </span>{itemB.society.architecture}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 9. Greatest Achievements */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
                  <div className="p-1 bg-white border border-slate-200 rounded-lg text-orange-655">
                    {renderPremiumIcon("aspect-achievements", "w-4 h-4")}
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 tracking-tight">9. Greatest Historical Achievements</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">{itemA.name}</span>
                    <ul className="text-sm font-semibold text-slate-700 space-y-2 list-disc list-inside">
                      {itemA.achievements.map((ach, idx) => (
                        <li key={idx} className="leading-relaxed">{ach}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">{itemB.name}</span>
                    <ul className="text-sm font-semibold text-slate-700 space-y-2 list-disc list-inside">
                      {itemB.achievements.map((ach, idx) => (
                        <li key={idx} className="leading-relaxed">{ach}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 10. Reasons for Decline / Challenges */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
                  <div className="p-1 bg-white border border-slate-200 rounded-lg text-orange-655">
                    {renderPremiumIcon("aspect-decline", "w-4 h-4")}
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 tracking-tight">10. Reasons for Decline & Challenges</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">{itemA.name}</span>
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{itemA.declineReason}</p>
                  </div>
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">{itemB.name}</span>
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{itemB.declineReason}</p>
                  </div>
                </div>
              </div>

              {/* 11. Legacy */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
                  <div className="p-1 bg-white border border-slate-200 rounded-lg text-orange-655">
                    {renderPremiumIcon("aspect-legacy", "w-4 h-4")}
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 tracking-tight">11. Legacy & Modern Influence</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">{itemA.name}</span>
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{itemA.legacy}</p>
                  </div>
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">{itemB.name}</span>
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{itemB.legacy}</p>
                  </div>
                </div>
              </div>

              {/* 12. Fun Facts */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
                  <div className="p-1 bg-white border border-slate-200 rounded-lg text-orange-655">
                    {renderPremiumIcon("aspect-funfacts", "w-4 h-4")}
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 tracking-tight">12. Intriguing Fun Facts</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">{itemA.name}</span>
                    <ul className="text-sm font-semibold text-slate-700 space-y-2.5 list-disc list-inside">
                      {itemA.funFacts.map((fact, idx) => (
                        <li key={idx} className="leading-relaxed">{fact}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">{itemB.name}</span>
                    <ul className="text-sm font-semibold text-slate-700 space-y-2.5 list-disc list-inside">
                      {itemB.funFacts.map((fact, idx) => (
                        <li key={idx} className="leading-relaxed">{fact}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Empty / Landing State */
          <div className="space-y-8 animate-fadeIn relative z-10">
            
            {/* Presets and Info Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[380px]">
              <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mb-2">
                <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.34V5m10-1.66V5M5.5 20.66V19m13-1.66V19" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Awaiting Selections</h3>
              <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                Select two historical entities using the dropdown inputs above, or choose one of our popular comparison presets below to begin!
              </p>

              {/* Grid of features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl text-left pt-4">
                <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl space-y-1">
                  <span className="font-bold text-xs text-slate-800 block">Proportional Metrics</span>
                  <span className="text-[11px] text-slate-500 leading-normal block">Compare duration, maximum area, and peak population via relative progress bars.</span>
                </div>
                <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl space-y-1">
                  <span className="font-bold text-xs text-slate-800 block">12 Key Aspects</span>
                  <span className="text-[11px] text-slate-500 leading-normal block">Contrasts military expansion, economy, society, greatest achievements, and legacy.</span>
                </div>
                <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl space-y-1">
                  <span className="font-bold text-xs text-slate-800 block">Local & Interactive</span>
                  <span className="text-[11px] text-slate-500 leading-normal block">Swap views instantly, export complete markdown reports, and trace history 100% offline.</span>
                </div>
              </div>
            </div>

            {/* Popular Preset Comparisons */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Popular Preset Comparisons</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => loadPreset("roman-empire", "british-empire")}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30 transition text-left cursor-pointer space-y-2 group flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center w-full text-xs font-bold text-slate-400 group-hover:text-orange-500 uppercase">
                    <span>Civilizations</span>
                    <div className="flex gap-0.5">
                      {renderPremiumIcon("roman-empire", "w-4 h-4 text-rose-500")}
                      {renderPremiumIcon("british-empire", "w-4 h-4 text-emerald-500")}
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 block mt-1">Roman Empire <span className="text-slate-400 font-semibold">VS</span> British Empire</span>
                </button>
                <button
                  onClick={() => loadPreset("ancient-egypt", "indus-valley")}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30 transition text-left cursor-pointer space-y-2 group flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center w-full text-xs font-bold text-slate-400 group-hover:text-orange-500 uppercase">
                    <span>Civilizations</span>
                    <div className="flex gap-0.5">
                      {renderPremiumIcon("ancient-egypt", "w-4 h-4 text-rose-500")}
                      {renderPremiumIcon("indus-valley", "w-4 h-4 text-emerald-500")}
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 block mt-1">Ancient Egypt <span className="text-slate-400 font-semibold">VS</span> Indus Valley</span>
                </button>
                <button
                  onClick={() => loadPreset("internet", "ai")}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30 transition text-left cursor-pointer space-y-2 group flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center w-full text-xs font-bold text-slate-400 group-hover:text-orange-500 uppercase">
                    <span>Technology</span>
                    <div className="flex gap-0.5">
                      {renderPremiumIcon("internet", "w-4 h-4 text-rose-500")}
                      {renderPremiumIcon("ai", "w-4 h-4 text-emerald-500")}
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 block mt-1">Internet <span className="text-slate-400 font-semibold">VS</span> Artificial Intelligence</span>
                </button>
                <button
                  onClick={() => loadPreset("world-war-i", "world-war-ii")}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30 transition text-left cursor-pointer space-y-2 group flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center w-full text-xs font-bold text-slate-400 group-hover:text-orange-500 uppercase">
                    <span>Historical Events</span>
                    <div className="flex gap-0.5">
                      {renderPremiumIcon("world-war-i", "w-4 h-4 text-rose-500")}
                      {renderPremiumIcon("world-war-ii", "w-4 h-4 text-emerald-500")}
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 block mt-1">World War I <span className="text-slate-400 font-semibold">VS</span> World War II</span>
                </button>
                <button
                  onClick={() => loadPreset("printing-press", "internet")}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30 transition text-left cursor-pointer space-y-2 group flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center w-full text-xs font-bold text-slate-400 group-hover:text-orange-500 uppercase">
                    <span>Technology</span>
                    <div className="flex gap-0.5">
                      {renderPremiumIcon("printing-press", "w-4 h-4 text-rose-500")}
                      {renderPremiumIcon("internet", "w-4 h-4 text-emerald-500")}
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 block mt-1">Printing Press <span className="text-slate-400 font-semibold">VS</span> Internet</span>
                </button>
              </div>
            </div>

            {/* Recent Comparisons List */}
            {recents.length > 0 && (
              <div className="space-y-3 animate-fadeIn">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Recent Comparisons</span>
                <div className="flex flex-wrap gap-2">
                  {recents.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadPreset(item.idA, item.idB)}
                      className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/20 text-slate-700 font-bold transition flex items-center gap-2 cursor-pointer shadow-sm animate-fadeIn"
                    >
                      <div className="flex gap-0.5 shrink-0">
                        {renderPremiumIcon(item.idA, "w-3.5 h-3.5 text-rose-500")}
                        {renderPremiumIcon(item.idB, "w-3.5 h-3.5 text-emerald-500")}
                      </div>
                      <span>{item.nameA} vs {item.nameB}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Privacy Policy / Local Execution Warning */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-start gap-3 relative z-10">
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Privacy Statement</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Everything runs locally in your browser. No information is uploaded. Your search selections, filters, and compared datasets are processed entirely offline inside your browser sandbox.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

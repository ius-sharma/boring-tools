"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import ThemedDropdown from "@/app/components/ThemedDropdown";
import ComingSoon from "@/app/components/ComingSoon";

const TOOL_STATUS = "upcoming"; // Set to "live" to deploy and enable routing

// Planetary orbital, rotational, and visual data
const PLANET_DATA = [
  {
    id: "mercury",
    name: "Mercury",
    icon: "🪐",
    color: "bg-slate-50 border-slate-200 text-slate-800",
    fillColor: "#94a3b8", // slate-400
    glowColor: "rgba(148, 163, 184, 0.4)",
    yearInEarthDays: 87.97,
    solarDayInEarthDays: 176.0,
    siderealRotationHours: 1407.6,
    distanceKm: 57.9, // Million km
    distanceMiles: 36.0, // Million miles
    speedKms: 47.36,
    speedMph: 105943,
    tempC: 167,
    tempF: 333,
    orbitRadius: 40,
    size: 6,
    funFact: "Mercury completes one orbit in only 88 Earth days. Its day-to-night temperature swings are the most extreme in the Solar System.",
    description: "The smallest planet and closest to the Sun."
  },
  {
    id: "venus",
    name: "Venus",
    icon: "🪐",
    color: "bg-amber-50 border-amber-200 text-amber-900",
    fillColor: "#fbbf24", // amber-400
    glowColor: "rgba(251, 191, 36, 0.4)",
    yearInEarthDays: 224.7,
    solarDayInEarthDays: 116.75,
    siderealRotationHours: -5832.5,
    distanceKm: 108.2,
    distanceMiles: 67.2,
    speedKms: 35.02,
    speedMph: 78337,
    tempC: 464,
    tempF: 867,
    orbitRadius: 60,
    size: 10,
    funFact: "Venus has one of the longest days in the Solar System (longer than its year!) and spins backward (retrograde).",
    description: "Earth's toxic twin, covered in thick sulfur clouds."
  },
  {
    id: "earth",
    name: "Earth",
    icon: "🌍",
    color: "bg-blue-50 border-blue-200 text-blue-900",
    fillColor: "#3b82f6", // blue-500
    glowColor: "rgba(59, 130, 246, 0.4)",
    yearInEarthDays: 365.256,
    solarDayInEarthDays: 1.0,
    siderealRotationHours: 24.0,
    distanceKm: 149.6,
    distanceMiles: 93.0,
    speedKms: 29.78,
    speedMph: 66615,
    tempC: 15,
    tempF: 59,
    orbitRadius: 80,
    size: 11,
    funFact: "Our home planet is the only known place in the universe that supports life, with liquid water on its surface.",
    description: "Our blue sanctuary, the third rock from the Sun."
  },
  {
    id: "moon",
    name: "Moon",
    icon: "🌕",
    color: "bg-gray-100 border-gray-200 text-gray-800",
    fillColor: "#9ca3af", // gray-400
    glowColor: "rgba(156, 163, 175, 0.4)",
    yearInEarthDays: 27.32,
    solarDayInEarthDays: 27.3,
    siderealRotationHours: 655.7,
    distanceKm: 0.384, // orbit around Earth
    distanceMiles: 0.239,
    speedKms: 1.022,
    speedMph: 2286,
    tempC: -20,
    tempF: -4,
    orbitRadius: 95,
    size: 5,
    funFact: "The Moon is Earth's only natural satellite. Because it is tidally locked, we always see the same face.",
    description: "Earth's companion, defining the word 'Month'."
  },
  {
    id: "mars",
    name: "Mars",
    icon: "🪐",
    color: "bg-red-50 border-red-200 text-red-900",
    fillColor: "#f87171", // red-400
    glowColor: "rgba(248, 113, 113, 0.4)",
    yearInEarthDays: 686.98,
    solarDayInEarthDays: 1.027,
    siderealRotationHours: 24.62,
    distanceKm: 227.9,
    distanceMiles: 141.6,
    speedKms: 24.077,
    speedMph: 53859,
    tempC: -62,
    tempF: -80,
    orbitRadius: 115,
    size: 8,
    funFact: "A Martian day (Sol) is only 39 minutes longer than Earth's day, but a Martian year is nearly two Earth years.",
    description: "The dusty, red desert world of the solar system."
  },
  {
    id: "jupiter",
    name: "Jupiter",
    icon: "🪐",
    color: "bg-orange-50 border-orange-200 text-orange-900",
    fillColor: "#fdba74", // orange-300
    glowColor: "rgba(253, 186, 116, 0.4)",
    yearInEarthDays: 4332.59,
    solarDayInEarthDays: 0.413,
    siderealRotationHours: 9.93,
    distanceKm: 778.5,
    distanceMiles: 483.8,
    speedKms: 13.07,
    speedMph: 29236,
    tempC: -108,
    tempF: -162,
    orbitRadius: 145,
    size: 19,
    funFact: "A day on Jupiter lasts only about 10 Earth hours, making it the fastest-spinning planet in the Solar System.",
    description: "The massive king of the planets, a gas giant."
  },
  {
    id: "saturn",
    name: "Saturn",
    icon: "🪐",
    color: "bg-yellow-50 border-yellow-200 text-yellow-900",
    fillColor: "#fef08a", // yellow-200
    glowColor: "rgba(254, 240, 138, 0.4)",
    yearInEarthDays: 10759.22,
    solarDayInEarthDays: 0.445,
    siderealRotationHours: 10.7,
    distanceKm: 1434.0,
    distanceMiles: 891.0,
    speedKms: 9.69,
    speedMph: 21676,
    tempC: -139,
    tempF: -218,
    orbitRadius: 175,
    size: 16,
    funFact: "Saturn is famous for its gorgeous rings. It takes 29.5 Earth years to orbit the Sun.",
    description: "The magnificent ringed gas giant."
  },
  {
    id: "uranus",
    name: "Uranus",
    icon: "🪐",
    color: "bg-cyan-50 border-cyan-200 text-cyan-900",
    fillColor: "#a5f3fc", // cyan-200
    glowColor: "rgba(165, 243, 252, 0.4)",
    yearInEarthDays: 30687.15,
    solarDayInEarthDays: 0.718,
    siderealRotationHours: -17.2,
    distanceKm: 2871.0,
    distanceMiles: 1784.0,
    speedKms: 6.81,
    speedMph: 15233,
    tempC: -197,
    tempF: -323,
    orbitRadius: 205,
    size: 13,
    funFact: "Uranus spins on its side with a 98° tilt, likely due to a cosmic collision in its early history.",
    description: "The pale blue ice giant that rolls on its side."
  },
  {
    id: "neptune",
    name: "Neptune",
    icon: "🪐",
    color: "bg-indigo-50 border-indigo-200 text-indigo-900",
    fillColor: "#c7d2fe", // indigo-200
    glowColor: "rgba(199, 210, 254, 0.4)",
    yearInEarthDays: 60190.03,
    solarDayInEarthDays: 0.671,
    siderealRotationHours: 16.11,
    distanceKm: 4495.0,
    distanceMiles: 2793.0,
    speedKms: 5.43,
    speedMph: 12146,
    tempC: -201,
    tempF: -330,
    orbitRadius: 228,
    size: 13,
    funFact: "Neptune takes approximately 165 Earth years to orbit the Sun, meaning it has completed only one orbit since its discovery in 1846.",
    description: "A dark blue world with supersonic winds."
  },
  {
    id: "pluto",
    name: "Pluto",
    icon: "🪐",
    color: "bg-purple-50 border-purple-200 text-purple-900",
    fillColor: "#e9d5ff", // purple-200
    glowColor: "rgba(233, 213, 255, 0.4)",
    yearInEarthDays: 90560.0,
    solarDayInEarthDays: 6.387,
    siderealRotationHours: -153.3,
    distanceKm: 5906.4,
    distanceMiles: 3670.0,
    speedKms: 4.74,
    speedMph: 10603,
    tempC: -225,
    tempF: -373,
    orbitRadius: 248,
    size: 5,
    funFact: "Pluto was reclassified as a dwarf planet in 2006. It takes 248 Earth years to make one full trip around the Sun.",
    description: "The ice dwarf planet at the solar system's edge."
  }
];

const SORT_OPTIONS = [
  { value: "default", label: "Solar System Order" },
  { value: "year-asc", label: "Shortest Year First" },
  { value: "year-desc", label: "Longest Year First" },
  { value: "day-asc", label: "Shortest Day First" },
  { value: "day-desc", label: "Longest Day First" }
];

const PLANET_OPTIONS = PLANET_DATA.map((p) => ({
  value: p.id,
  label: `${p.icon} ${p.name}`
}));

export default function TimeOnOtherPlanets() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Time on Other Planets" />;
  }

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState(25);
  
  const [unit, setUnit] = useState("metric"); // "metric" or "imperial"
  const [timeUnit, setTimeUnit] = useState("earth"); // "earth" (days/hours) or "planet" (local solar days)
  const [sortBy, setSortBy] = useState("default");
  
  const [comparePlanetA, setComparePlanetA] = useState("earth");
  const [comparePlanetB, setComparePlanetB] = useState("mars");
  
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [activeTab, setActiveTab] = useState("grid"); // "grid" | "orbits" | "charts"
  
  const [orbitAngle, setOrbitAngle] = useState(0);
  const animationRef = useRef(null);

  // Sync window title
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Time on Other Planets | Boring Tools";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  // Run the orbital animation loop
  useEffect(() => {
    let lastTime = performance.now();
    const animate = (time) => {
      const delta = (time - lastTime) / 1000; // seconds
      lastTime = time;
      // Increment base angle (scaled speed)
      setOrbitAngle((prev) => (prev + delta * 0.15) % (2 * Math.PI));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  // Convert DOB to Age and vice-versa in real time
  const handleDobChange = (value) => {
    setDob(value);
    if (!value) return;
    const birthDate = new Date(value);
    const today = new Date();
    if (!isNaN(birthDate.getTime())) {
      const diffTime = today - birthDate;
      const calculatedAge = diffTime / (365.256 * 24 * 60 * 60 * 1000);
      if (calculatedAge >= 0) {
        setAge(parseFloat(calculatedAge.toFixed(4)));
      }
    }
  };

  const handleAgeChange = (value) => {
    const numAge = parseFloat(value);
    setAge(isNaN(numAge) ? 0 : Math.max(0, numAge));
    if (!isNaN(numAge) && numAge >= 0) {
      const today = new Date();
      const birthTime = today.getTime() - numAge * 365.256 * 24 * 60 * 60 * 1000;
      const birthDate = new Date(birthTime);
      setDob(birthDate.toISOString().split("T")[0]);
    } else {
      setDob("");
    }
  };

  // Compute days lived based on active input parameters
  const daysLived = useMemo(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      if (!isNaN(birthDate.getTime())) {
        const diffTime = today - birthDate;
        const computed = diffTime / (1000 * 60 * 60 * 24);
        return computed > 0 ? computed : age * 365.256;
      }
    }
    return age * 365.256;
  }, [dob, age]);

  // Compute stats for all planets
  const planetaryStats = useMemo(() => {
    return PLANET_DATA.map((p) => {
      const planetAge = daysLived / p.yearInEarthDays;
      const birthdays = Math.floor(planetAge);
      
      // Calculate planet day length representation
      let dayLengthStr = "";
      if (timeUnit === "earth") {
        if (Math.abs(p.siderealRotationHours) >= 24) {
          const earthDays = Math.abs(p.siderealRotationHours) / 24;
          dayLengthStr = `${earthDays.toFixed(1)} Earth Days`;
        } else {
          dayLengthStr = `${Math.abs(p.siderealRotationHours).toFixed(1)} Earth Hours`;
        }
      } else {
        dayLengthStr = "1.0 Local Day";
      }

      // Calculate planet year length representation
      let yearLengthStr = "";
      if (timeUnit === "earth") {
        yearLengthStr = `${p.yearInEarthDays.toFixed(1)} Earth Days`;
      } else {
        // Year length in local solar days
        const localDaysInYear = p.yearInEarthDays / p.solarDayInEarthDays;
        yearLengthStr = `${localDaysInYear.toFixed(1)} Local Days`;
      }

      // Convert distance
      const distanceVal = unit === "metric" ? p.distanceKm : p.distanceMiles;
      const distanceUnit = unit === "metric" ? "Million km" : "Million miles";
      const distanceStr = `${distanceVal.toLocaleString()} ${distanceUnit}`;

      // Convert speed
      const speedVal = unit === "metric" ? p.speedKms : p.speedMph;
      const speedUnit = unit === "metric" ? "km/s" : "mph";
      const speedStr = `${speedVal.toLocaleString()} ${speedUnit}`;

      // Convert temp
      const tempVal = unit === "metric" ? p.tempC : p.tempF;
      const tempUnit = unit === "metric" ? "°C" : "°F";
      const tempStr = `${tempVal.toLocaleString()} ${tempUnit}`;

      // Interesting comparison message generator
      let comparisonMsg = "";
      if (p.id === "mercury") {
        comparisonMsg = `You celebrate birthdays roughly ${Math.max(1, Math.round(365.25 / p.yearInEarthDays))}x more often than on Earth.`;
      } else if (p.id === "venus") {
        comparisonMsg = "Your birthday on Venus would happen before a single Venusian day completes!";
      } else if (p.id === "earth") {
        comparisonMsg = "Your native orbit. This is where your timeline matches normal biological cycles.";
      } else if (p.id === "moon") {
        comparisonMsg = "A lunar year is based on one orbit around Earth, meaning you celebrate monthly!";
      } else if (p.id === "mars") {
        comparisonMsg = `You would celebrate birthdays roughly half as often (${(p.yearInEarthDays / 365.25).toFixed(1)} Earth years).`;
      } else if (birthdays === 0) {
        comparisonMsg = `You have completed only ${(planetAge * 100).toFixed(1)}% of a single year here.`;
      } else {
        comparisonMsg = `One year here equals ${(p.yearInEarthDays / 365.25).toFixed(1)} Earth years. Birthdays are rare!`;
      }

      return {
        ...p,
        planetAge,
        birthdays,
        dayLengthStr,
        yearLengthStr,
        distanceStr,
        speedStr,
        tempStr,
        comparisonMsg
      };
    });
  }, [daysLived, unit, timeUnit]);

  // Sort planets based on selection
  const sortedPlanets = useMemo(() => {
    const list = [...planetaryStats];
    switch (sortBy) {
      case "year-asc":
        return list.sort((a, b) => a.yearInEarthDays - b.yearInEarthDays);
      case "year-desc":
        return list.sort((a, b) => b.yearInEarthDays - a.yearInEarthDays);
      case "day-asc":
        return list.sort((a, b) => Math.abs(a.siderealRotationHours) - Math.abs(b.siderealRotationHours));
      case "day-desc":
        return list.sort((a, b) => Math.abs(b.siderealRotationHours) - Math.abs(a.siderealRotationHours));
      default:
        return list; // Solar system distance order
    }
  }, [planetaryStats, sortBy]);

  // Comparison details
  const comparisonData = useMemo(() => {
    const planetA = planetaryStats.find((p) => p.id === comparePlanetA) || planetaryStats[2];
    const planetB = planetaryStats.find((p) => p.id === comparePlanetB) || planetaryStats[4];
    return { planetA, planetB };
  }, [planetaryStats, comparePlanetA, comparePlanetB]);

  // Copy/Download report generator
  const reportText = useMemo(() => {
    const divider = "==================================================";
    const headerTitle = `PLANETARY TIME COMPARISON REPORT ${name ? `FOR ${name.toUpperCase()}` : ""}`;
    const inputSummary = `Date of Birth: ${dob || "Not specified"}\nAge: ${age} Earth Years\nTime Alive: ${Math.floor(daysLived).toLocaleString()} Earth Days`;

    const planetBreakdown = sortedPlanets.map((p) => {
      return `\n${p.name.toUpperCase()} ${p.id === "earth" ? "(Reference)" : ""}
- Age: ${p.planetAge.toFixed(2)} Years
- Birthdays Celebrated: ${p.birthdays}
- Length of Year: ${p.yearLengthStr}
- Length of Day: ${p.dayLengthStr}
- Distance from Sun: ${p.distanceStr}
- Orbital Speed: ${p.speedStr}
- Avg Temperature: ${p.tempStr}
- Fact: ${p.funFact}`;
    }).join("\n");

    return `${headerTitle}\n${divider}\n${inputSummary}\n${divider}\nPLANETARY BREAKDOWN\n${planetBreakdown}\n\n${divider}\nPrivacy Statement: Everything runs locally inside your browser. No information is uploaded.`;
  }, [name, dob, age, daysLived, sortedPlanets]);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      showToast("Planetary report copied to clipboard!");
    } catch (e) {
      showToast("Failed to copy report.", "error");
    }
  };

  const handleDownloadReport = () => {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name ? name.toLowerCase().replace(/\s+/g, "-") : "user"}-planetary-time-report.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Report downloaded successfully.");
  };

  // Fun dynamic insights text
  const personalInsights = useMemo(() => {
    const mercuryObj = planetaryStats.find(p => p.id === "mercury");
    const marsObj = planetaryStats.find(p => p.id === "mars");
    const neptuneObj = planetaryStats.find(p => p.id === "neptune");
    const userName = name || "You";

    return {
      mercury: `${userName} would be ${mercuryObj?.planetAge.toFixed(1)} years old on Mercury, having celebrated ${mercuryObj?.birthdays} birthdays!`,
      mars: `On Mars, ${name ? name : "your"} age would be ${marsObj?.planetAge.toFixed(1)} Martian Years.`,
      neptune: neptuneObj?.birthdays === 0
        ? `On Neptune, ${userName.toLowerCase()} would not even have completed a single Neptunian year (current progress: ${(neptuneObj.planetAge * 100).toFixed(2)}%).`
        : `On Neptune, ${userName.toLowerCase()} has celebrated ${neptuneObj?.birthdays} birthdays.`,
      invariance: `While ${name ? name : "your"} age changes depending on the planet, ${name ? name : "your"} actual duration of existence remains exactly the same: ${Math.floor(daysLived).toLocaleString()} days (${Math.floor(daysLived * 24).toLocaleString()} hours).`
    };
  }, [planetaryStats, name, daysLived]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:py-14">
      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-bounce transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : toast.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          {toast.type === "success" && (
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === "error" && (
            <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Time on Other Planets
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Understand how years, days, age, and birthdays change across the Solar System. Explore visual orbits, compare cosmic timelines, and learn space facts.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Controls & Presets */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>Parameters & Setup</span>
              </h2>

              {/* Basic Details */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name-input" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Name (optional)
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label htmlFor="dob-input" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Date of Birth
                  </label>
                  <input
                    id="dob-input"
                    type="date"
                    value={dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none text-slate-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="age-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Age (Earth Years)
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <input
                      id="age-input"
                      type="number"
                      step="any"
                      min="0"
                      value={age}
                      onChange={(e) => handleAgeChange(e.target.value)}
                      className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none text-slate-900 font-bold"
                    />
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={Math.round(age)}
                      onChange={(e) => handleAgeChange(e.target.value)}
                      className="flex-1 accent-amber-500 h-2 mt-3 rounded-lg bg-slate-100 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Presets */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Presets</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[10, 18, 25, 40, 60].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          handleAgeChange(preset);
                          showToast(`Set age to ${preset} Earth years`);
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg border font-bold transition cursor-pointer ${
                          Math.round(age) === preset
                            ? "bg-amber-100 border-amber-300 text-amber-800"
                            : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                        }`}
                      >
                        {preset} yrs
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-slate-100 my-4" />

                {/* Display Preferences */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Display Settings</span>
                  
                  {/* Metric vs Imperial */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">Measurement Units</span>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setUnit("metric")}
                        className={`px-2.5 py-1 rounded-md font-bold transition ${
                          unit === "metric" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Metric
                      </button>
                      <button
                        onClick={() => setUnit("imperial")}
                        className={`px-2.5 py-1 rounded-md font-bold transition ${
                          unit === "imperial" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Imperial
                      </button>
                    </div>
                  </div>

                  {/* Day Unit Toggle */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">Time Units (Days/Years)</span>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setTimeUnit("earth")}
                        className={`px-2.5 py-1 rounded-md font-bold transition ${
                          timeUnit === "earth" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Earth Days
                      </button>
                      <button
                        onClick={() => setTimeUnit("planet")}
                        className={`px-2.5 py-1 rounded-md font-bold transition ${
                          timeUnit === "planet" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Planet Days
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Actions */}
              <div className="flex gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={handleCopyReport}
                  className="flex-1 text-center justify-center inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Copy Report
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="flex-1 text-center justify-center inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 text-xs font-bold shadow-xs transition active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            </div>

            {/* Privacy Shield */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-xs text-emerald-800 flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Privacy Statement</h4>
                <p className="text-xs mt-1 leading-relaxed">
                  Everything runs locally inside your browser. No information is uploaded.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Results & Visualizations */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Dynamic Personalized Insights Banner */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-xs space-y-3.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">Personalized Time Insights</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed text-amber-900">
                <div className="p-3.5 bg-white/70 border border-amber-200/50 rounded-xl">
                  <span className="font-bold block text-amber-950 mb-1">Mercury Birthdays</span>
                  <span>{personalInsights.mercury}</span>
                </div>
                <div className="p-3.5 bg-white/70 border border-amber-200/50 rounded-xl">
                  <span className="font-bold block text-amber-950 mb-1">Martian Age</span>
                  <span>{personalInsights.mars}</span>
                </div>
                <div className="p-3.5 bg-white/70 border border-amber-200/50 rounded-xl sm:col-span-2">
                  <span className="font-bold block text-amber-950 mb-1">Neptunian Progression</span>
                  <span>{personalInsights.neptune}</span>
                </div>
              </div>
              <p className="text-xs text-amber-800 leading-normal border-t border-amber-200/50 pt-2.5 font-medium">
                ✨ {personalInsights.invariance}
              </p>
            </div>

            {/* TAB SELECTOR & SORT CONTROLS */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
                <div className="flex gap-2">
                  {[
                    { id: "grid", label: "Planet Cards" },
                    { id: "orbits", label: "Orbital Map" },
                    { id: "charts", label: "Comparisons" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-bold border-b-2 transition cursor-pointer ${
                        activeTab === tab.id
                          ? "border-amber-500 text-amber-600"
                          : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "grid" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 shrink-0">Sort by:</span>
                    <div className="w-48 text-xs">
                      <ThemedDropdown
                        value={sortBy}
                        options={SORT_OPTIONS}
                        onChange={setSortBy}
                        ariaLabel="Sort planets"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* GRID VIEW */}
              {activeTab === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedPlanets.map((planet) => (
                    <div
                      key={planet.id}
                      className={`rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md hover:scale-[1.01] ${planet.color} relative overflow-hidden flex flex-col justify-between`}
                    >
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-2xl mr-1.5">{planet.icon}</span>
                            <span className="text-lg font-black text-slate-900 tracking-tight">{planet.name}</span>
                          </div>
                          {planet.id === "earth" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 rounded-md">
                              Reference
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 leading-normal font-medium">{planet.description}</p>

                        <div className="grid grid-cols-2 gap-3.5 pt-1 border-t border-slate-200/50">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Age</span>
                            <span className="text-sm font-black text-slate-800">{planet.planetAge.toFixed(2)} years</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Birthdays</span>
                            <span className="text-sm font-black text-slate-800">{planet.birthdays} celebrated</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Length of Year</span>
                            <span className="text-xs font-semibold text-slate-700">{planet.yearLengthStr}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Length of Day</span>
                            <span className="text-xs font-semibold text-slate-700">{planet.dayLengthStr}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-white/70 border border-slate-200/50 rounded-xl">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Quick Fact</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{planet.comparisonMsg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ORBIT MAP VIEW */}
              {activeTab === "orbits" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Orbital Speed Map</h3>
                      <p className="text-xs text-slate-500">Concentric circles showing actual planetary orbital speeds scaled relative to Earth.</p>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-md animate-pulse">
                      Live Simulation
                    </span>
                  </div>

                  <div className="relative flex justify-center bg-slate-950 rounded-xl p-4 overflow-hidden border border-slate-900" style={{ height: "450px" }}>
                    <svg viewBox="0 0 520 520" className="w-full h-full max-w-[420px] max-h-[420px]">
                      {/* Sun */}
                      <circle cx="260" cy="260" r="16" fill="url(#sun-grad)" />
                      <circle cx="260" cy="260" r="18" fill="none" stroke="#fbbf24" strokeWidth="2" className="animate-ping" style={{ animationDuration: "3s" }} />

                      {/* Concentric Orbit Circles */}
                      {planetaryStats.map((planet) => (
                        <circle
                          key={`orbit-${planet.id}`}
                          cx="260"
                          cy="260"
                          r={planet.orbitRadius}
                          fill="none"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                        />
                      ))}

                      {/* Planet nodes */}
                      {planetaryStats.map((planet) => {
                        // Rate of movement is inversely proportional to year length
                        // Scaling factor: multiply angle by (Earth orbital period / Planet orbital period)
                        const currentAngle = (orbitAngle * (365.256 / planet.yearInEarthDays)) % (2 * Math.PI);
                        const px = 260 + planet.orbitRadius * Math.cos(currentAngle);
                        const py = 260 + planet.orbitRadius * Math.sin(currentAngle);

                        return (
                          <g key={`node-${planet.id}`}>
                            {/* Glow */}
                            <circle cx={px} cy={py} r={planet.size + 4} fill={planet.glowColor} />
                            {/* Planet Body */}
                            <circle cx={px} cy={py} r={planet.size} fill={planet.fillColor} />
                            {/* Label for larger planets */}
                            <text
                              x={px}
                              y={py - planet.size - 4}
                              fill="rgba(255,255,255,0.6)"
                              fontSize="9"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {planet.name}
                            </text>
                          </g>
                        );
                      })}

                      {/* Definitions for Gradients */}
                      <defs>
                        <radialGradient id="sun-grad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fffbeb" />
                          <stop offset="25%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </radialGradient>
                      </defs>
                    </svg>

                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur border border-white/10 rounded-lg p-2.5 text-[10px] text-slate-300 max-w-[200px]">
                      <span className="font-bold text-amber-400 block mb-1">Orbital Mechanics:</span>
                      Concentric tracks are scaled. Planets closer to the Sun move faster to maintain orbits, as governed by Kepler's Laws.
                    </div>
                  </div>
                </div>
              )}

              {/* CHARTS VIEW */}
              {activeTab === "charts" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
                  {/* Age Comparison Bars */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Age Comparison Chart</h3>
                      <p className="text-xs text-slate-500">How old you are on each planet (scaled in planet years).</p>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      {planetaryStats.map((p) => {
                        // Max age will typically be Mercury. Let's find max age in dataset for percentage scaling.
                        const maxAge = Math.max(...planetaryStats.map(x => x.planetAge));
                        const pct = maxAge > 0 ? (p.planetAge / maxAge) * 100 : 0;
                        return (
                          <div key={`age-chart-${p.id}`} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="text-slate-700">{p.icon} {p.name}</span>
                              <span className="text-slate-900 font-bold">{p.planetAge.toFixed(2)} yrs</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(1, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <hr className="border-slate-200" />

                  {/* Birthday Comparison Bars */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Birthday Celebrations</h3>
                      <p className="text-xs text-slate-500">Number of full orbits completed since birth.</p>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      {planetaryStats.map((p) => {
                        const maxBdays = Math.max(...planetaryStats.map(x => x.birthdays));
                        const pct = maxBdays > 0 ? (p.birthdays / maxBdays) * 100 : 0;
                        return (
                          <div key={`bday-chart-${p.id}`} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="text-slate-700">{p.icon} {p.name}</span>
                              <span className="text-slate-900 font-bold">{p.birthdays} celebrated</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(1, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SIDE-BY-SIDE COMPARE TOOL */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Interactive Head-to-Head Compare</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Select any two celestial bodies to examine differences side-by-side.</p>
              </div>

              {/* Selector Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Planet A</label>
                  <ThemedDropdown
                    value={comparePlanetA}
                    options={PLANET_OPTIONS}
                    onChange={setComparePlanetA}
                    ariaLabel="Compare Planet A"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Planet B</label>
                  <ThemedDropdown
                    value={comparePlanetB}
                    options={PLANET_OPTIONS}
                    onChange={setComparePlanetB}
                    ariaLabel="Compare Planet B"
                  />
                </div>
              </div>

              {/* Comparison Sheet */}
              <div className="rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-400 border-b border-slate-200/50 pb-2">
                  <span>PARAMETER</span>
                  <span className="text-center">{comparisonData.planetA.name}</span>
                  <span className="text-center">{comparisonData.planetB.name}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="font-bold text-slate-500">Planet Age</span>
                    <span className="text-center font-black text-slate-800 bg-white border border-slate-200/50 py-1.5 rounded-lg">{comparisonData.planetA.planetAge.toFixed(2)} yrs</span>
                    <span className="text-center font-black text-slate-800 bg-white border border-slate-200/50 py-1.5 rounded-lg">{comparisonData.planetB.planetAge.toFixed(2)} yrs</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="font-bold text-slate-500">Orbits (Birthdays)</span>
                    <span className="text-center font-bold text-slate-700">{comparisonData.planetA.birthdays}</span>
                    <span className="text-center font-bold text-slate-700">{comparisonData.planetB.birthdays}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="font-bold text-slate-500">Length of Year</span>
                    <span className="text-center text-slate-600 font-semibold">{comparisonData.planetA.yearLengthStr}</span>
                    <span className="text-center text-slate-600 font-semibold">{comparisonData.planetB.yearLengthStr}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="font-bold text-slate-500">Length of Day</span>
                    <span className="text-center text-slate-600 font-semibold">{comparisonData.planetA.dayLengthStr}</span>
                    <span className="text-center text-slate-600 font-semibold">{comparisonData.planetB.dayLengthStr}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="font-bold text-slate-500">Distance from Sun</span>
                    <span className="text-center text-slate-600 font-semibold">{comparisonData.planetA.distanceStr}</span>
                    <span className="text-center text-slate-600 font-semibold">{comparisonData.planetB.distanceStr}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="font-bold text-slate-500">Orbital Velocity</span>
                    <span className="text-center text-slate-600 font-semibold">{comparisonData.planetA.speedStr}</span>
                    <span className="text-center text-slate-600 font-semibold">{comparisonData.planetB.speedStr}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="font-bold text-slate-500">Average Temp</span>
                    <span className="text-center text-slate-600 font-semibold">{comparisonData.planetA.tempStr}</span>
                    <span className="text-center text-slate-600 font-semibold">{comparisonData.planetB.tempStr}</span>
                  </div>
                </div>

                <div className="bg-amber-100/50 border border-amber-200/50 rounded-xl p-3 text-[11px] text-amber-950 font-medium">
                  💡 <strong>Comparison Summary:</strong> 1 year on {comparisonData.planetA.name} is equivalent to {(comparisonData.planetA.yearInEarthDays / comparisonData.planetB.yearInEarthDays).toFixed(2)} years on {comparisonData.planetB.name}.
                </div>
              </div>
            </div>

            {/* SPACE FACTS PANEL */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <span>Important Solar System Time Facts</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-500 leading-relaxed font-medium">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-2">
                  <span className="text-amber-500 text-sm">💡</span>
                  <span><strong>Mercury</strong> orbits the Sun so fast (88 Earth days) that one solar day actually lasts two full Mercurian years!</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-2">
                  <span className="text-amber-500 text-sm">💡</span>
                  <span><strong>Neptune</strong> is the most distant major planet, taking approximately 165 Earth years (60,190 days) to complete a single revolution.</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-2">
                  <span className="text-amber-500 text-sm">💡</span>
                  <span><strong>Venus</strong> has one of the longest day/night cycles (solar day) in the Solar System, lasting 117 Earth days.</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-2">
                  <span className="text-amber-500 text-sm">💡</span>
                  <span><strong>Jupiter</strong> spins faster than any other planet, completing a rotation in just 9 hours and 56 minutes.</span>
                </div>
              </div>
            </div>

            {/* LEARN SECTION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Understanding Time in Space</h3>
                <p className="text-xs text-slate-500 mt-1">An easy-to-follow guide to how planetary motions shape calendars and clocks.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
                <div className="space-y-2">
                  <h4 className="font-black text-slate-800 text-sm">1. Rotation vs. Revolution</h4>
                  <p>
                    <strong>Rotation</strong> is the spinning of a planet on its own axis, which determines the length of its day. 
                    <strong>Revolution</strong> is the orbit of a planet around the Sun, which determines the length of its year.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-slate-800 text-sm">2. Why Planetary Years Differ</h4>
                  <p>
                    Planets closer to the Sun have smaller orbits and experience stronger gravitational pull, requiring them to move faster. 
                    This is why a year on Mercury is only 88 days, whereas distant Neptune takes 165 Earth years.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-slate-800 text-sm">3. Why Planetary Days Differ</h4>
                  <p>
                    A planet's day length depends entirely on its spin speed, which is influenced by how it formed and subsequent collisions. 
                    Jupiter spins incredibly fast, while Venus spins extremely slowly and in the opposite direction.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-slate-800 text-sm">4. How Astronomers Measure Time</h4>
                  <p>
                    Astronomers use <strong>Sidereal Time</strong> (rotation relative to distant background stars) and <strong>Solar Time</strong> (rotation relative to the Sun). 
                    This tool calculates time using Solar days to reflect the actual day/night cycle a human observer would experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

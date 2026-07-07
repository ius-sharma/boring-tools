"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ThemedDropdown from "@/app/components/ThemedDropdown";
import ComingSoon from "@/app/components/ComingSoon";

// Planetary gravity constants and facts database
const PLANET_DATA = [
  {
    id: "mercury",
    name: "Mercury",
    gravity: 3.7,
    percentage: 37.7,
    color: "bg-slate-400 border-slate-300 text-slate-800",
    accentColor: "slate",
    icon: "🪐",
    funFact: "You could jump almost 3x higher than on Earth, and it has virtually no atmosphere to slow you down.",
    description: "The smallest and closest planet to the Sun."
  },
  {
    id: "venus",
    name: "Venus",
    gravity: 8.87,
    percentage: 90.4,
    color: "bg-amber-100 border-amber-200 text-amber-800",
    accentColor: "amber",
    icon: "🪐",
    funFact: "Venus is the hottest planet in the Solar System. You would feel almost the same weight as on Earth.",
    description: "Earth's toxic twin, covered in thick sulfuric acid clouds."
  },
  {
    id: "earth",
    name: "Earth",
    gravity: 9.807,
    percentage: 100.0,
    color: "bg-blue-100 border-blue-200 text-blue-800",
    accentColor: "blue",
    icon: "🌍",
    funFact: "This is your home base. 100% of your normal weight and gravity.",
    description: "The only known planet in the universe that supports life."
  },
  {
    id: "moon",
    name: "The Moon",
    gravity: 1.62,
    percentage: 16.5,
    color: "bg-gray-200 border-gray-300 text-gray-800",
    accentColor: "gray",
    icon: "🌕",
    funFact: "With only 16.5% of Earth's gravity, you could easily jump over a car and lift heavy machinery.",
    description: "Earth's only natural satellite, orbiting us every 27.3 days."
  },
  {
    id: "mars",
    name: "Mars",
    gravity: 3.72,
    percentage: 37.9,
    color: "bg-red-100 border-red-200 text-red-800",
    accentColor: "red",
    icon: "🪐",
    funFact: "Mars has the tallest volcano in the solar system, Olympus Mons. You would feel light and springy.",
    description: "The Red Planet, home to the dustiest deserts."
  },
  {
    id: "jupiter",
    name: "Jupiter",
    gravity: 24.79,
    percentage: 252.8,
    color: "bg-orange-100 border-orange-200 text-orange-800",
    accentColor: "orange",
    icon: "🪐",
    funFact: "Jupiter is a gas giant with no solid surface. If you stood on its clouds, you would feel crushed by gravity.",
    description: "The largest planet in the Solar System, 11x wider than Earth."
  },
  {
    id: "saturn",
    name: "Saturn",
    gravity: 10.44,
    percentage: 106.5,
    color: "bg-yellow-100 border-yellow-200 text-yellow-800",
    accentColor: "yellow",
    icon: "🪐",
    funFact: "SATURN is so light and airy that if you could find a bathtub big enough, it would float on water.",
    description: "The gas giant famous for its massive and spectacular ring system."
  },
  {
    id: "uranus",
    name: "Uranus",
    gravity: 8.69,
    percentage: 88.6,
    color: "bg-cyan-100 border-cyan-200 text-cyan-800",
    accentColor: "cyan",
    icon: "🪐",
    funFact: "Uranus rotates on its side. Its surface gravity is slightly weaker than Earth's despite its size.",
    description: "An ice giant that tilts almost 98 degrees on its axis."
  },
  {
    id: "neptune",
    name: "Neptune",
    gravity: 11.15,
    percentage: 113.7,
    color: "bg-indigo-100 border-indigo-200 text-indigo-800",
    accentColor: "indigo",
    icon: "🪐",
    funFact: "Neptune has supersonic winds reaching up to 2,100 km/h, making it a very hostile place to visit.",
    description: "The windiest and most distant major planet in the Solar System."
  },
  {
    id: "pluto",
    name: "Pluto",
    gravity: 0.62,
    percentage: 6.3,
    color: "bg-purple-100 border-purple-200 text-purple-800",
    accentColor: "purple",
    icon: "🪐",
    funFact: "You would feel virtually weightless here. A standard jump could launch you onto a small building.",
    description: "A frozen dwarf planet located in the distant Kuiper Belt."
  }
];

// Reference objects for lift capacity strength comparison
const LIFT_OBJECTS = [
  { name: "Backpack", weightKg: 10, icon: "🎒" },
  { name: "Bicycle", weightKg: 15, icon: "🚲" },
  { name: "Car Tire", weightKg: 12, icon: "🛞" },
  { name: "Refrigerator", weightKg: 80, icon: "🧊" },
  { name: "Vespa Scooter", weightKg: 110, icon: "🛵" },
  { name: "Small Car", weightKg: 1000, icon: "🚗" }
];

// Dropdown options lists
const SORT_OPTIONS = [
  { value: "default", label: "Default Order" },
  { value: "gravity-asc", label: "Gravity (Low to High)" },
  { value: "gravity-desc", label: "Gravity (High to Low)" },
  { value: "weight-asc", label: "Weight (Light to Heavy)" },
  { value: "weight-desc", label: "Weight (Heavy to Light)" }
];

const PLANET_OPTIONS = PLANET_DATA.map(p => ({
  value: p.id,
  label: `${p.icon} ${p.name}`
}));

const TOOL_STATUS = "live"; // Set to "live" to deploy and enable routing

export default function PlanetsWeightPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Your Weight on Other Planets" />;
  }
  const [weight, setWeight] = useState(70);
  const [unit, setUnit] = useState("kg"); // "kg" or "lbs"
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [sortBy, setSortBy] = useState("default"); // "default", "gravity-asc", "gravity-desc", "weight-asc", "weight-desc"
  
  // Side-by-side comparison planet state
  const [comparePlanetA, setComparePlanetA] = useState("earth");
  const [comparePlanetB, setComparePlanetB] = useState("mars");
  
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Your Weight on Other Planets | Boring Tools";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  // Convert weight internal value depending on units selected
  const displayWeight = (w) => {
    if (unit === "lbs") {
      return (w * 2.20462).toFixed(1);
    }
    return w.toFixed(1);
  };

  // Lift conversion: calculate what Earth mass feels like on a target planet
  // Under reduced gravity, objects of larger mass feel like 15kg (standard bicycle) on Earth.
  // FeelsLikeWeight = ObjectWeight * (g_planet / g_earth)
  // Therefore, Equivalent mass = 15 * (g_earth / g_planet)
  const getLiftComparison = (planetGravity) => {
    const baseEarthLift = 15; // standard reference weight in kg
    const equivalentEarthMass = baseEarthLift * (9.807 / planetGravity);
    
    // Find the closest object in the database
    let bestMatch = LIFT_OBJECTS[0];
    let minDiff = Math.abs(equivalentEarthMass - LIFT_OBJECTS[0].weightKg);
    
    for (let i = 1; i < LIFT_OBJECTS.length; i++) {
      const diff = Math.abs(equivalentEarthMass - LIFT_OBJECTS[i].weightKg);
      if (diff < minDiff) {
        minDiff = diff;
        bestMatch = LIFT_OBJECTS[i];
      }
    }
    return {
      object: bestMatch,
      equivalentMass: equivalentEarthMass
    };
  };

  // Jump Height: assumes an Earth jump of 0.5 meters.
  // JumpHeight = EarthJump * (g_earth / g_planet)
  const getJumpHeight = (planetGravity) => {
    const earthJump = 0.5; // meters
    return (earthJump * (9.807 / planetGravity)).toFixed(2);
  };

  // Fall speed: time to fall 3 meters from rest (t = sqrt(2d/g))
  const getFallTime = (planetGravity) => {
    const distance = 3.0; // meters
    return Math.sqrt((2 * distance) / planetGravity).toFixed(2);
  };

  // Calculate planetary weight results list
  const calculatedPlanets = useMemo(() => {
    return PLANET_DATA.map((p) => {
      const planetWeight = weight * (p.gravity / 9.807);
      const jumpHeight = getJumpHeight(p.gravity);
      const fallTime = getFallTime(p.gravity);
      const lift = getLiftComparison(p.gravity);
      
      return {
        ...p,
        calculatedWeight: planetWeight,
        jumpHeight,
        fallTime,
        liftObject: lift.object,
        equivalentLiftMass: lift.equivalentMass
      };
    });
  }, [weight]);

  // Sort planetary weight results based on selection
  const sortedPlanets = useMemo(() => {
    const list = [...calculatedPlanets];
    switch (sortBy) {
      case "gravity-asc":
        return list.sort((a, b) => a.gravity - b.gravity);
      case "gravity-desc":
        return list.sort((a, b) => b.gravity - a.gravity);
      case "weight-asc":
        return list.sort((a, b) => a.calculatedWeight - b.calculatedWeight);
      case "weight-desc":
        return list.sort((a, b) => b.calculatedWeight - a.calculatedWeight);
      default:
        return list; // solar system order
    }
  }, [calculatedPlanets, sortBy]);

  // Dynamic summary insights
  const customInsight = useMemo(() => {
    const moonWeight = weight * (1.62 / 9.807);
    const jupiterWeight = weight * (24.79 / 9.807);
    const unitLabel = unit;
    
    return {
      moon: `On the Moon you would weigh only ${displayWeight(moonWeight)} ${unitLabel}.`,
      jupiter: `On Jupiter you would weigh ${displayWeight(jupiterWeight)} ${unitLabel}, feeling much heavier.`,
      massText: "Your weight changes across the solar system depending on the gravity, but your actual mass (amount of matter) remains exactly the same."
    };
  }, [weight, unit]);

  // side-by-side comparison data
  const comparisonData = useMemo(() => {
    const planetA = calculatedPlanets.find((p) => p.id === comparePlanetA) || calculatedPlanets[2];
    const planetB = calculatedPlanets.find((p) => p.id === comparePlanetB) || calculatedPlanets[4];
    return { planetA, planetB };
  }, [calculatedPlanets, comparePlanetA, comparePlanetB]);

  // Generate copy report text
  const reportText = useMemo(() => {
    const divider = "==================================================";
    const listLines = calculatedPlanets.map(
      (p) =>
        `- ${p.name}: Weight: ${displayWeight(p.calculatedWeight)} ${unit}, Gravity: ${p.gravity} m/s² (${p.percentage}%), Jump: ${p.jumpHeight}m, Fall (3m): ${p.fallTime}s`
    ).join("\n");

    return `PLANETARY WEIGHT REPORT
User Inputs: Weight: ${weight} ${unit}${height ? `, Height: ${height} cm` : ""}${age ? `, Age: ${age} years` : ""}

${divider}
PLANETARY BREAKDOWN
${listLines}

${divider}
FUN INSIGHTS
* ${customInsight.moon}
* ${customInsight.jupiter}
* ${customInsight.massText}

${divider}
Privacy Statement: Everything runs locally inside your browser. No information is uploaded.
`;
  }, [calculatedPlanets, weight, unit, height, age, customInsight]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      showToast("Report copied to clipboard!");
    } catch (e) {
      showToast("Failed to copy results.", "error");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `planetary-weight-report.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Report downloaded successfully.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:py-14">
      {/* Toast Notification */}
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
          {toast.type === "warning" && (
            <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        {/* Tool Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Your Weight on Other Planets
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Understand how gravity changes your weight across the Solar System through interactive calculations, jump comparisons, and physical strength perspectives.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: user input configuration */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Input Parameters</span>
              </h2>

              {/* Weight Slider / Input */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="weight-input" className="text-sm font-semibold text-slate-700">
                      Your Weight
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (unit === "lbs") {
                            setWeight(Math.round(weight * 2.20462));
                            setUnit("lbs");
                          } else {
                            // already kg, do nothing
                          }
                        }}
                        className={`px-2 py-0.5 text-xs font-bold rounded-l border border-slate-200 transition ${
                          unit === "kg" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        kg
                      </button>
                      <button
                        onClick={() => {
                          if (unit === "kg") {
                            setWeight(Math.round(weight / 2.20462));
                            setUnit("kg");
                          } else {
                            // already lbs
                          }
                        }}
                        onChange={() => {}}
                        onClickCapture={() => {
                          setUnit(unit === "kg" ? "lbs" : "kg");
                        }}
                        className={`px-2 py-0.5 text-xs font-bold rounded-r border border-l-0 border-slate-200 transition ${
                          unit === "lbs" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <input
                      id="weight-input"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none text-slate-900 font-bold"
                    />
                    <input
                      type="range"
                      min="10"
                      max="250"
                      value={weight}
                      onChange={(e) => setWeight(parseInt(e.target.value))}
                      className="flex-1 accent-amber-500 h-2 mt-4 rounded-lg bg-slate-100 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Popular weight presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Presets</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[50, 60, 70, 80, 100].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setWeight(preset);
                          showToast(`Set weight to ${preset} ${unit}`);
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-100 bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition cursor-pointer font-bold"
                      >
                        {preset} {unit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Height & Age */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label htmlFor="height-input" className="block text-xs font-semibold text-slate-500 mb-1">
                      Height (optional)
                    </label>
                    <input
                      id="height-input"
                      type="number"
                      placeholder="e.g. 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-amber-400 focus:outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="age-input" className="block text-xs font-semibold text-slate-500 mb-1">
                      Age (optional)
                    </label>
                    <input
                      id="age-input"
                      type="number"
                      placeholder="e.g. 28"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-amber-400 focus:outline-none text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Actions panel */}
              <div className="flex gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={handleCopy}
                  className="flex-1 text-center justify-center inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow transition active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Copy Report
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 text-center justify-center inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 text-xs font-bold shadow transition active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </button>
              </div>
            </div>

            {/* Quick Space Facts */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <svg className="w-4.5 h-4.5 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Space Gravity Facts</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-500 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Jupiter</strong> has the strongest gravity in the Solar System (24.79 m/s² or 253% of Earth).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>The <strong>Moon</strong> has only about 16.5% of Earth&apos;s gravity, meaning your muscles would feel super strong.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Mars</strong> surface gravity is 38% of Earth&apos;s, allowing for significantly higher jumps.</span>
                </li>
              </ul>
            </div>

            {/* Privacy note */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm text-emerald-800 flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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

          {/* Right panel: dashboard visualization cards */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Dynamic visual dashboard summary */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Personalized Gravity Insights</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed text-amber-900">
                <div className="p-3 bg-white/70 border border-amber-200/50 rounded-xl space-y-1">
                  <span className="font-bold block">Moon Weight</span>
                  <span>{customInsight.moon}</span>
                </div>
                <div className="p-3 bg-white/70 border border-amber-200/50 rounded-xl space-y-1">
                  <span className="font-bold block">Jupiter Weight</span>
                  <span>{customInsight.jupiter}</span>
                </div>
              </div>
              <p className="text-[11px] text-amber-800 leading-normal border-t border-amber-200/50 pt-2 font-medium">
                {customInsight.massText}
              </p>
            </div>

            {/* Sorting controls bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <h3 className="text-md font-bold text-slate-800 uppercase tracking-wide">Planets Grid</h3>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 shrink-0">
                  Sort by:
                </span>
                <div className="w-48 text-xs">
                  <ThemedDropdown
                    value={sortBy}
                    options={SORT_OPTIONS}
                    onChange={setSortBy}
                    ariaLabel="Sort planets"
                  />
                </div>
              </div>
            </div>

            {/* Planet cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedPlanets.map((planet) => (
                <div
                  key={planet.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition duration-300 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                >
                  {/* Planet Icon backdrop glow */}
                  <div className="absolute top-2 right-2 text-4xl opacity-10 select-none group-hover:scale-110 transition duration-300">
                    {planet.icon}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{planet.icon}</span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{planet.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold block">{planet.description}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Weight</span>
                        <span className="font-extrabold text-slate-800 text-sm mt-0.5">
                          {displayWeight(planet.calculatedWeight)} {unit}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Gravity</span>
                        <span className="font-extrabold text-slate-800 text-xs mt-0.5">
                          {planet.gravity} m/s² ({planet.percentage}%)
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed italic bg-amber-50/30 border border-dashed border-amber-200/50 rounded-xl p-3">
                      &ldquo;{planet.funFact}&rdquo;
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>Gravity Difference</span>
                    <span className={planet.percentage > 100 ? "text-rose-600" : planet.percentage < 100 ? "text-emerald-600" : "text-slate-500"}>
                      {planet.percentage > 100 ? `+${(planet.percentage - 100).toFixed(0)}% heavier` : planet.percentage < 100 ? `-${(100 - planet.percentage).toFixed(0)}% lighter` : "Same as Earth"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Jump Height & Fall Speed Comparison Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Jump height visualizer bar chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <span>🦘 Jump height Comparison</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">Base Earth Jump: 0.5m</span>
                </div>

                <div className="space-y-3 pt-1">
                  {calculatedPlanets.map((planet) => (
                    <div key={planet.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">{planet.name}</span>
                        <span className="font-bold text-slate-800">{planet.jumpHeight} meters</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(100, (parseFloat(planet.jumpHeight) / 8.0) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fall speed simulator indicators */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <span>🪂 Fall Time (3m drop)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">Lower time = faster fall</span>
                </div>

                <div className="space-y-3 pt-1">
                  {calculatedPlanets.map((planet) => (
                    <div key={planet.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">{planet.name}</span>
                        <span className="font-bold text-slate-800">{planet.fallTime} seconds</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(100, (parseFloat(planet.fallTime) / 3.5) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strength Lift Perspectives */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span>🏋️ Strength Perspective</span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                  Equivalent Earth mass object you could lift as easily as a 15kg load on Earth due to the planet&apos;s gravity.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {calculatedPlanets.filter(p => p.id !== "earth").slice(0, 5).map((planet) => (
                  <div key={planet.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col justify-between items-center text-center space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{planet.name}</span>
                    <span className="text-3xl">{planet.liftObject.icon}</span>
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">{planet.liftObject.name}</span>
                      <span className="text-[10px] text-slate-500">({planet.liftObject.weightKg} {unit})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Planet Comparison Mode */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Planet Comparison Mode</h3>
                <p className="text-[11px] text-slate-400 leading-normal mt-0.5">Select two bodies to compare side-by-side.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Select A */}
                <div className="md:col-span-5 space-y-1">
                  <label htmlFor="compare-a-select" className="block text-xs font-bold uppercase text-slate-400">Planet A</label>
                  <ThemedDropdown
                    value={comparePlanetA}
                    options={PLANET_OPTIONS}
                    onChange={setComparePlanetA}
                    ariaLabel="Select Planet A"
                  />
                </div>

                {/* VS Indicator */}
                <div className="md:col-span-2 text-center text-slate-400 font-extrabold text-sm py-2">
                  VS
                </div>

                {/* Select B */}
                <div className="md:col-span-5 space-y-1">
                  <label htmlFor="compare-b-select" className="block text-xs font-bold uppercase text-slate-400">Planet B</label>
                  <ThemedDropdown
                    value={comparePlanetB}
                    options={PLANET_OPTIONS}
                    onChange={setComparePlanetB}
                    ariaLabel="Select Planet B"
                  />
                </div>
              </div>

              {/* Side-by-side comparison details cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Planet A stats */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span className="text-xl">{comparisonData.planetA.icon}</span>
                    <span>{comparisonData.planetA.name}</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Weight</span>
                      <strong className="text-slate-900">{displayWeight(comparisonData.planetA.calculatedWeight)} {unit}</strong>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Surface Gravity</span>
                      <strong className="text-slate-900">{comparisonData.planetA.gravity} m/s²</strong>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Jump height</span>
                      <strong className="text-slate-900">{comparisonData.planetA.jumpHeight}m</strong>
                    </li>
                    <li className="flex justify-between pb-1">
                      <span>Fall Speed (3m)</span>
                      <strong className="text-slate-900">{comparisonData.planetA.fallTime}s</strong>
                    </li>
                  </ul>
                </div>

                {/* Planet B stats */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span className="text-xl">{comparisonData.planetB.icon}</span>
                    <span>{comparisonData.planetB.name}</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Weight</span>
                      <strong className="text-slate-900">{displayWeight(comparisonData.planetB.calculatedWeight)} {unit}</strong>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Surface Gravity</span>
                      <strong className="text-slate-900">{comparisonData.planetB.gravity} m/s²</strong>
                    </li>
                    <li className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Jump height</span>
                      <strong className="text-slate-900">{comparisonData.planetB.jumpHeight}m</strong>
                    </li>
                    <li className="flex justify-between pb-1">
                      <span>Fall Speed (3m)</span>
                      <strong className="text-slate-900">{comparisonData.planetB.fallTime}s</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Learn Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Educational Explainer</h3>
                <p className="text-[11px] text-slate-400 leading-normal mt-0.5">Learn about the physics of weight and gravity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase text-amber-700">1. Mass vs. Weight</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <strong>Mass</strong> is the amount of matter in your body and remains constant anywhere in the universe. <strong>Weight</strong> is the force exerted on your mass by gravity and changes based on where you stand.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase text-amber-700">2. What is Gravity?</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Gravity is an attractive force between objects with mass. Larger celestial bodies (like Jupiter) have more mass and pull objects toward them with greater force than smaller bodies (like the Moon).
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase text-amber-700">3. Why it Changes</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Weight is calculated as Mass × Gravity. Since each planet has a unique combination of mass and radius, their surface gravity acceleration values vary, changing your weight accordingly.
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

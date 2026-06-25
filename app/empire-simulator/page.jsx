"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ComingSoon from "@/app/components/ComingSoon";

const TOOL_STATUS = "upcoming"; // Set to "live" to deploy and enable routing

// Historical Archetypes for comparison
const HISTORICAL_ARCHETYPES = [
  {
    id: "rome_peak",
    name: "Pax Romana (Peak Roman Empire)",
    description: "Your empire mirrors Rome under Augustus: where formidable legions and centralized administration secured massive trade networks and internal civil stability.",
    stats: { economy: 80, military: 85, corruption: 30, innovation: 65, happiness: 70, education: 60, stability: 85, trade: 75, resources: 80, externalThreat: 40 }
  },
  {
    id: "rome_decline",
    name: "Late Roman Empire (Decline)",
    description: "Your empire resembles late Rome: crippled by political infighting, high corruption, failing civic trust, and overwhelming external pressures.",
    stats: { economy: 40, military: 50, corruption: 80, innovation: 30, happiness: 30, education: 40, stability: 25, trade: 45, resources: 50, externalThreat: 85 }
  },
  {
    id: "british_peak",
    name: "Victorian British Empire",
    description: "Your empire reflects Britain at the peak of the Industrial Revolution: dominating global maritime trade, powered by financial systems and industrial innovation.",
    stats: { economy: 90, military: 80, corruption: 25, innovation: 85, happiness: 65, education: 75, stability: 80, trade: 95, resources: 90, externalThreat: 30 }
  },
  {
    id: "ottoman_peak",
    name: "Suleiman's Ottoman Empire (Zenith)",
    description: "Your empire mirrors the peak Ottoman dynasty: an administrative powerhouse bridging East and West, with heavy border defenses and trade crossroads.",
    stats: { economy: 75, military: 85, corruption: 35, innovation: 60, happiness: 70, education: 65, stability: 80, trade: 85, resources: 75, externalThreat: 45 }
  },
  {
    id: "ottoman_decline",
    name: "Late Ottoman Empire ('Sick Man of Europe')",
    description: "Your empire resembles the declining Ottomans: plagued by growing bureaucracy, corruption, stagnating technology, and fiscal dependency.",
    stats: { economy: 45, military: 50, corruption: 75, innovation: 30, happiness: 35, education: 45, stability: 35, trade: 50, resources: 55, externalThreat: 70 }
  },
  {
    id: "mongol_peak",
    name: "Mongol Empire (Pax Mongolica)",
    description: "Your empire mirrors the Mongol Horde: unrivaled militaristic mobility, rapid territorial conquest, and open-road trade security, but vulnerable to fragmentation.",
    stats: { economy: 50, military: 95, corruption: 40, innovation: 45, happiness: 50, education: 30, stability: 45, trade: 75, resources: 70, externalThreat: 35 }
  }
];

// Helper to calculate scores
function getStabilityScore(state) {
  const raw = (state.economy * 0.12) +
              (state.military * 0.08) +
              (state.happiness * 0.15) +
              (state.stability * 0.20) +
              (state.trade * 0.08) +
              (state.resources * 0.08) +
              (state.innovation * 0.08) +
              (state.education * 0.08) +
              ((100 - state.corruption) * 0.15) +
              ((100 - state.externalThreat) * 0.08);
  return Math.max(0, Math.min(100, Math.round(raw / 1.10)));
}

function getGrowthPotential(state) {
  const raw = (state.economy * 0.20) +
              (state.trade * 0.15) +
              (state.innovation * 0.20) +
              (state.education * 0.15) +
              (state.resources * 0.10) +
              (state.happiness * 0.10) +
              ((100 - state.corruption) * 0.10);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function getCollapseRisk(state) {
  const raw = (state.corruption * 0.25) +
              (state.externalThreat * 0.20) +
              ((100 - state.stability) * 0.25) +
              ((100 - state.happiness) * 0.15) +
              ((100 - state.economy) * 0.15);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function getExpansionPotential(state) {
  const raw = (state.military * 0.40) +
              (state.economy * 0.20) +
              (state.resources * 0.15) +
              (state.trade * 0.15) +
              ((100 - state.externalThreat) * 0.10);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function getEmpireStatus(stability, happiness, innovation, growth, collapseRisk) {
  if (collapseRisk >= 65) {
    return { name: "Collapse Risk", color: "text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900/50" };
  } else if (collapseRisk >= 40) {
    return { name: "Declining Empire", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/50" };
  } else if (stability >= 75 && happiness >= 75 && innovation >= 70) {
    return { name: "Golden Age", color: "text-amber-700 bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 border-amber-300 dark:border-amber-800" };
  } else if (stability >= 60 && growth >= 65) {
    return { name: "Rising Empire", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50" };
  } else if (stability >= 45) {
    return { name: "Stable Empire", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/50" };
  } else {
    return { name: "Declining Empire", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/50" };
  }
}

// Convert data points to SVG lines
function getMultiChartPoints(data, width, height, padding) {
  if (!data || !data.length) {
    return { stabilityLine: "", economyLine: "", militaryLine: "", stabilityArea: "" };
  }

  const xSpan = width - padding * 2;
  const ySpan = height - padding * 2;
  const maxVal = 100;

  const points = data.map((item, index) => {
    const x = padding + (index / Math.max(1, data.length - 1)) * xSpan;
    const yStab = height - padding - (item.stabilityScore / maxVal) * ySpan;
    const yEcon = height - padding - (item.economy / maxVal) * ySpan;
    const yMil = height - padding - (item.military / maxVal) * ySpan;
    return { x, yStab, yEcon, yMil };
  });

  const stabilityLine = points.map(p => `${p.x},${p.yStab}`).join(" ");
  const economyLine = points.map(p => `${p.x},${p.yEcon}`).join(" ");
  const militaryLine = points.map(p => `${p.x},${p.yMil}`).join(" ");
  
  const stabilityArea = `${padding},${height - padding} ${stabilityLine} ${width - padding},${height - padding}`;

  return { stabilityLine, economyLine, militaryLine, stabilityArea };
}

function getLogIcon(type) {
  switch (type) {
    case "foundation":
      return (
        <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V10M12 21V10M5 21V10M3 7l9-4 9 4M4 21h16M4 7h16" />
        </svg>
      );
    case "war":
      return (
        <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14L4 20m0 0l-1-3 3 1 2-2M4 20l3-1-1-3-2 2m12-8l6-6m0 0l1 3-3-1-2 2m4-4l-3 1 1-3 2-2m-8 8l-3-3m0 0l3 3m-3-3L4 4m8 8l8 8" />
        </svg>
      );
    case "famine":
      return (
        <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M12 3C9.5 6 9.5 9 12 12m0-9c2.5 3 2.5 6 0 9m0 0c-2.5 3-2.5 6 0 9m0-9c2.5 3 2.5 6 0 9M7 8c2-1.5 3-.5 5 1m0 0c2-1.5 3-.5 5 1M7 14c2-1.5 3-.5 5 1m0 0c2-1.5 3-.5 5 1" />
        </svg>
      );
    case "economic":
      return (
        <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l6 6 4-4 8 8m0 0h-5.657m5.657 0V10.343" />
        </svg>
      );
    case "rebellion":
      return (
        <svg className="w-3.5 h-3.5 text-orange-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
        </svg>
      );
    case "pandemic":
      return (
        <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="6" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" strokeLinecap="round" />
        </svg>
      );
    case "tech":
      return (
        <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v1.5m-3-1.5h6m-3-13.5v1.5m3.536.964l-1.06 1.06m-8.95 0l-1.06-1.06M21 12h-1.5m-15 0H3m16.536 4.536l-1.06-1.06m-8.95 1.06l-1.06-1.06M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "trade":
      return (
        <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 17l2-9h16l2 9H2zm2-9l4-4h8l4 4M5 17v3h14v-3M9 17v3M15 17v3" />
        </svg>
      );
    case "collapse":
      return (
        <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "complete":
      return (
        <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

function getLogTextColor(type) {
  switch (type) {
    case "collapse":
      return "text-red-400 font-semibold";
    case "war":
    case "famine":
    case "economic":
    case "rebellion":
    case "pandemic":
      return "text-orange-400";
    case "tech":
    case "trade":
    case "complete":
      return "text-emerald-400";
    default:
      return "text-slate-350";
  }
}

export default function EmpireSimulatorPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Empire Simulator" />;
  }

  // Input states
  const [economy, setEconomy] = useState(55);
  const [military, setMilitary] = useState(50);
  const [corruption, setCorruption] = useState(25);
  const [innovation, setInnovation] = useState(50);
  const [happiness, setHappiness] = useState(60);
  const [education, setEducation] = useState(50);
  const [stability, setStability] = useState(65);
  const [trade, setTrade] = useState(55);
  const [resources, setResources] = useState(60);
  const [externalThreat, setExternalThreat] = useState(30);

  // Simulation settings
  const [simYears, setSimYears] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  // Notifications
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (type, message) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 2000);
  };

  // Compile current stats object
  const currentStats = useMemo(() => {
    return {
      economy: Number(economy),
      military: Number(military),
      corruption: Number(corruption),
      innovation: Number(innovation),
      happiness: Number(happiness),
      education: Number(education),
      stability: Number(stability), // Political Stability
      trade: Number(trade),
      resources: Number(resources),
      externalThreat: Number(externalThreat)
    };
  }, [economy, military, corruption, innovation, happiness, education, stability, trade, resources, externalThreat]);

  // Derived metrics
  const stabilityScore = useMemo(() => getStabilityScore(currentStats), [currentStats]);
  const growthPotential = useMemo(() => getGrowthPotential(currentStats), [currentStats]);
  const collapseRisk = useMemo(() => getCollapseRisk(currentStats), [currentStats]);
  const expansionPotential = useMemo(() => getExpansionPotential(currentStats), [currentStats]);
  const empireStatus = useMemo(() => getEmpireStatus(stabilityScore, currentStats.happiness, currentStats.innovation, growthPotential, collapseRisk), [stabilityScore, currentStats, growthPotential, collapseRisk]);

  // Historical Civ similarities based on current inputs
  const similarities = useMemo(() => {
    return HISTORICAL_ARCHETYPES.map((archetype) => {
      const keys = ["economy", "military", "corruption", "innovation", "happiness", "education", "stability", "trade", "resources", "externalThreat"];
      let distanceSum = 0;
      keys.forEach((k) => {
        distanceSum += Math.abs(currentStats[k] - archetype.stats[k]);
      });
      const maxDistance = 1000;
      const similarity = 100 - (distanceSum / maxDistance) * 100;
      return {
        ...archetype,
        score: Math.round(similarity)
      };
    }).sort((a, b) => b.score - a.score);
  }, [currentStats]);

  const bestMatch = similarities[0];

  // Specific comparison summaries
  const comparisonText = useMemo(() => {
    let text = `Your empire closest resembles the ${bestMatch.name}. `;
    if (bestMatch.id === "rome_decline") {
      text += "Political infighting and low stability combined with external threats put you on the precipice of a Dark Age.";
    } else if (bestMatch.id === "rome_peak") {
      text += "High stability and a formidable military structure ensure order and prosperous trade across your borders.";
    } else if (bestMatch.id === "british_peak") {
      text += "A thriving trade focus and high innovation fuel an industrial boom, securing unmatched global reach.";
    } else if (bestMatch.id === "ottoman_peak") {
      text += "Vast administrative bureaucracy and heavy fortifications keep your trade routes safe and borders secured.";
    } else if (bestMatch.id === "ottoman_decline") {
      text += "Stagnant technological growth combined with bureaucratic corruption creates a slow fiscal decline.";
    } else if (bestMatch.id === "mongol_peak") {
      text += "Outstanding military strength allows swift territory expansion, but fragile domestic stability makes it vulnerable to succession fractures.";
    }

    if (currentStats.corruption > 55 && currentStats.economy > 65) {
      text += " While your economy is strong, corruption levels resemble decaying dynasties and threaten long-term collapse.";
    } else if (currentStats.happiness < 35 && currentStats.stability > 60) {
      text += " Despite high political stability, suppressed population happiness suggests popular revolts are brewing.";
    } else if (currentStats.externalThreat > 60 && currentStats.military < 45) {
      text += " Your defense layers are severely underfunded compared to rising external threats, inviting border invasions.";
    }

    return text;
  }, [bestMatch, currentStats]);

  // Insights
  const insights = useMemo(() => {
    const strengthKeys = [
      { key: "economy", label: "Economy" },
      { key: "military", label: "Military Strength" },
      { key: "innovation", label: "Innovation" },
      { key: "happiness", label: "Population Happiness" },
      { key: "education", label: "Education" },
      { key: "stability", label: "Political Stability" },
      { key: "trade", label: "Trade Strength" },
      { key: "resources", label: "Resource Availability" }
    ];

    const weaknessKeys = [
      ...strengthKeys,
      { key: "corruption_inv", label: "Anti-Corruption Integrity" },
      { key: "threat_inv", label: "Border Protection" }
    ];

    // Find biggest strength
    let maxVal = -1;
    let strengthLabel = "";
    let strengthDesc = "";
    strengthKeys.forEach(({ key, label }) => {
      const val = currentStats[key];
      if (val > maxVal) {
        maxVal = val;
        strengthLabel = label;
      }
    });

    if (maxVal > 75) {
      strengthDesc = `Your exceptional ${strengthLabel.toLowerCase()} (${maxVal}/100) provides a formidable foundation for empire building. Use this leverage to secure other fragile sectors.`;
    } else {
      strengthDesc = `Your highest attribute is ${strengthLabel.toLowerCase()} (${maxVal}/100), but overall parameters are average. Focus on developing a specialized core.`;
    }

    // Find biggest weakness
    let minVal = 101;
    let weaknessLabel = "";
    let weaknessDesc = "";
    weaknessKeys.forEach(({ key, label }) => {
      let val;
      if (key === "corruption_inv") {
        val = 100 - currentStats.corruption;
      } else if (key === "threat_inv") {
        val = 100 - currentStats.externalThreat;
      } else {
        val = currentStats[key];
      }

      if (val < minVal) {
        minVal = val;
        weaknessLabel = label;
      }
    });

    const displayWeaknessVal = weaknessLabel === "Anti-Corruption Integrity" ? currentStats.corruption : weaknessLabel === "Border Protection" ? currentStats.externalThreat : minVal;
    if (weaknessLabel === "Anti-Corruption Integrity") {
      weaknessDesc = `High corruption (${displayWeaknessVal}/100) is eroding state coffers and draining political stability. Civic decay acts as a parasite to growth.`;
    } else if (weaknessLabel === "Border Protection") {
      weaknessDesc = `High external threats (${displayWeaknessVal}/100) combined with border vulnerability leave the empire exposed to sudden foreign campaigns.`;
    } else {
      weaknessDesc = `Low ${weaknessLabel.toLowerCase()} (${displayWeaknessVal}/100) represents a systemic bottleneck, dragging down the stability index and overall output.`;
    }

    // Recommendations
    const recommendations = [];
    if (currentStats.corruption > 45) {
      recommendations.push("Reform the civil service registry, install independent judicial bodies, and enforce anti-bribery penalties to curb rising corruption.");
    }
    if (currentStats.military < currentStats.externalThreat) {
      recommendations.push("Increase border defense spending, build defensive fortifications, and mobilize garrison reserves to match external threat levels.");
    }
    if (currentStats.education < 50) {
      recommendations.push("Found public libraries, fund academy guilds, and support scholar travel to build the intellectual foundation of your state.");
    }
    if (currentStats.happiness < 40) {
      recommendations.push("Subsidize grain distributions (bread and circuses), lower domestic tariffs, and address regional grievances to restore public happiness.");
    }
    if (currentStats.stability < 45) {
      recommendations.push("Appoint competent provincial governors, declare clear succession codes, and establish a permanent state senate to bolster political stability.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Maintain balanced expenditures. Consider investing heavily in Innovation and Education to initiate a Golden Age.");
    }

    // Collapse Threats
    let collapseThreat = "None apparent. The administration is balanced and secure.";
    if (currentStats.corruption > 65) {
      collapseThreat = "Internal Rot: Public funds are stolen, provincial officials act independently, and administrative lines disintegrate.";
    } else if (currentStats.happiness < 30) {
      collapseThreat = "Popular Revolution: Oppressed citizens and rural peasants stage massive rebellions, storming key administrative zones.";
    } else if (currentStats.military < currentStats.externalThreat - 20) {
      collapseThreat = "Foreign Invasion: Rival civilizations breach defensive gates, sack the capital city, and carve up provincial territories.";
    } else if (currentStats.stability < 30) {
      collapseThreat = "Dynastic Collapse: Internal coups, succession civil wars, and regional secessions fracture the empire into warring fiefdoms.";
    } else if (currentStats.economy < 25) {
      collapseThreat = "Fiscal Solvency: Hyperinflation, hyper-indebtedness, and total lack of trade trigger state bankruptcy and monetary abandonment.";
    }

    return {
      strength: { label: strengthLabel, desc: strengthDesc },
      weakness: { label: weaknessLabel, desc: weaknessDesc },
      recommendations,
      collapseThreat
    };
  }, [currentStats]);

  // Actions: Random Empire
  const handleRandomEmpire = () => {
    setEconomy(Math.floor(Math.random() * 80) + 15);
    setMilitary(Math.floor(Math.random() * 80) + 15);
    setCorruption(Math.floor(Math.random() * 75) + 10);
    setInnovation(Math.floor(Math.random() * 75) + 15);
    setHappiness(Math.floor(Math.random() * 75) + 15);
    setEducation(Math.floor(Math.random() * 75) + 15);
    setStability(Math.floor(Math.random() * 75) + 15);
    setTrade(Math.floor(Math.random() * 80) + 15);
    setResources(Math.floor(Math.random() * 80) + 15);
    setExternalThreat(Math.floor(Math.random() * 75) + 10);

    setSimResult(null);
    showToast("success", "Generated a randomized empire configuration.");
  };

  // Actions: Reset Empire
  const handleResetEmpire = () => {
    setEconomy(55);
    setMilitary(50);
    setCorruption(25);
    setInnovation(50);
    setHappiness(60);
    setEducation(50);
    setStability(65);
    setTrade(55);
    setResources(60);
    setExternalThreat(30);

    setSimResult(null);
    showToast("success", "Empire parameters reset to baseline stable state.");
  };

  // Actions: Run Timeline Simulation
  const handleRunSimulation = () => {
    setIsLoading(true);
    
    let current = {
      year: 0,
      economy: Number(economy),
      military: Number(military),
      corruption: Number(corruption),
      innovation: Number(innovation),
      happiness: Number(happiness),
      education: Number(education),
      stability: Number(stability),
      trade: Number(trade),
      resources: Number(resources),
      externalThreat: Number(externalThreat)
    };

    const history = [{ ...current, stabilityScore }];
    const logs = [{ year: 0, type: "foundation", message: "Foundation established. Charter drafted, administration centers built." }];
    let collapsed = false;
    let collapseMsg = "";

    for (let y = 1; y <= simYears; y++) {
      let next = { ...current, year: y };

      // 1. High corruption drains economy and stability
      if (current.corruption > 60) {
        const drain = (current.corruption - 60) * 0.15;
        next.economy -= drain;
        next.stability -= drain * 1.5;
      } else if (current.corruption < 30) {
        next.stability += (30 - current.corruption) * 0.1;
      }

      // 2. High education boosts innovation and economy, and happiness
      if (current.education > 65) {
        next.innovation += (current.education - 65) * 0.12;
        next.economy += (current.education - 65) * 0.08;
        next.happiness += (current.education - 65) * 0.05;
      }

      // 3. High innovation boosts economy and trade
      if (current.innovation > 60) {
        next.economy += (current.innovation - 60) * 0.1;
        next.trade += (current.innovation - 60) * 0.08;
      }

      // 4. Low happiness feeds political instability
      if (current.happiness < 40) {
        next.stability -= (40 - current.happiness) * 0.15;
      } else if (current.happiness > 75) {
        next.stability += (current.happiness - 75) * 0.05;
      }

      // 5. High trade boosts economy and resources
      if (current.trade > 60) {
        next.economy += (current.trade - 60) * 0.1;
        next.resources += (current.trade - 60) * 0.05;
      }

      // 6. Natural resource depletion if economy is high but innovation is low
      if (current.economy > 70 && current.innovation < 45) {
        next.resources -= (current.economy - 70) * 0.15;
      }

      // 7. High external threat drains economy and boosts military
      if (current.externalThreat > 60) {
        next.economy -= (current.externalThreat - 60) * 0.1;
        next.military += (current.externalThreat - 60) * 0.05;
      }

      // 8. Low military strength relative to external threat increases threat
      if (current.military < current.externalThreat - 15) {
        next.externalThreat += 1.2;
      } else if (current.military > current.externalThreat + 15) {
        next.externalThreat -= 0.8;
      }

      // 9. Political instability breeds corruption and weakens military
      if (current.stability < 45) {
        next.corruption += (45 - current.stability) * 0.15;
        next.military -= (45 - current.stability) * 0.05;
      }

      // 10. Random events (15% chance per year)
      if (Math.random() < 0.15) {
        const eventRoll = Math.random();
        if (eventRoll < 0.15) {
          next.military = Math.max(0, next.military - 12);
          next.economy = Math.max(0, next.economy - 10);
          next.happiness = Math.max(0, next.happiness - 10);
          next.stability = Math.max(0, next.stability - 8);
          next.externalThreat = Math.min(100, next.externalThreat + 15);
          logs.push({ year: y, type: "war", message: "WAR! Border tensions explode into campaign deployments. Morale and economics suffer." });
        } else if (eventRoll < 0.30) {
          next.resources = Math.max(0, next.resources - 20);
          next.happiness = Math.max(0, next.happiness - 15);
          next.stability = Math.max(0, next.stability - 10);
          logs.push({ year: y, type: "famine", message: "FAMINE! Cold winters and crop failures dry out provincial grain reserves." });
        } else if (eventRoll < 0.45) {
          next.economy = Math.max(0, next.economy - 20);
          next.trade = Math.max(0, next.trade - 15);
          next.happiness = Math.max(0, next.happiness - 10);
          logs.push({ year: y, type: "economic", message: "ECONOMIC CRISIS! Debased currencies freeze local trade exchanges." });
        } else if (eventRoll < 0.60) {
          next.stability = Math.max(0, next.stability - 20);
          next.happiness = Math.max(0, next.happiness - 10);
          next.military = Math.max(0, next.military - 5);
          logs.push({ year: y, type: "rebellion", message: "REBELLION! Heavy taxes trigger peasant riots. Administrative garrisons fight back." });
        } else if (eventRoll < 0.75) {
          next.happiness = Math.max(0, next.happiness - 20);
          next.economy = Math.max(0, next.economy - 10);
          next.stability = Math.max(0, next.stability - 8);
          next.military = Math.max(0, next.military - 5);
          logs.push({ year: y, type: "pandemic", message: "PANDEMIC! A devastating plague sweeps major cities. Labor output stalls." });
        } else if (eventRoll < 0.88) {
          next.innovation = Math.min(100, next.innovation + 15);
          next.education = Math.min(100, next.education + 5);
          next.economy = Math.min(100, next.economy + 8);
          logs.push({ year: y, type: "tech", message: "TECH BOOM! Scholars design advanced water-mills and crop rotation schemes." });
        } else {
          next.trade = Math.min(100, next.trade + 15);
          next.economy = Math.min(100, next.economy + 10);
          next.happiness = Math.min(100, next.happiness + 5);
          logs.push({ year: y, type: "trade", message: "TRADE BOOM! Exploration caravans secure safe desert and sea routes." });
        }
      }

      // Cap and round
      next.economy = Math.max(0, Math.min(100, Math.round(next.economy)));
      next.military = Math.max(0, Math.min(100, Math.round(next.military)));
      next.corruption = Math.max(0, Math.min(100, Math.round(next.corruption)));
      next.innovation = Math.max(0, Math.min(100, Math.round(next.innovation)));
      next.happiness = Math.max(0, Math.min(100, Math.round(next.happiness)));
      next.education = Math.max(0, Math.min(100, Math.round(next.education)));
      next.stability = Math.max(0, Math.min(100, Math.round(next.stability)));
      next.trade = Math.max(0, Math.min(100, Math.round(next.trade)));
      next.resources = Math.max(0, Math.min(100, Math.round(next.resources)));
      next.externalThreat = Math.max(0, Math.min(100, Math.round(next.externalThreat)));

      const yearlyStabScore = getStabilityScore(next);
      history.push({ ...next, stabilityScore: yearlyStabScore });
      current = { ...next };

      if (yearlyStabScore <= 10) {
        collapsed = true;
        if (current.corruption > 60) {
          collapseMsg = "rampant systemic corruption and bureaucratic parasitism";
        } else if (current.happiness < 20) {
          collapseMsg = "widespread civic rebellions and popular peasant revolution";
        } else if (current.military < current.externalThreat - 20) {
          collapseMsg = "uncontested border invasions and military sacking of the capital";
        } else if (current.economy < 20) {
          collapseMsg = "total monetary bankruptcy and disintegration of commerce";
        } else {
          collapseMsg = "general loss of central administrative authority and regional secession";
        }
        logs.push({ year: y, type: "collapse", message: `CIVILIZATION COLLAPSED! The imperial seat crumbled due to ${collapseMsg}.` });
        break;
      }
    }

    if (!collapsed) {
      logs.push({ year: simYears, type: "complete", message: "SIMULATION COMPLETED! The imperial flags still wave. The dynasty endures." });
    }

    setSimResult({
      active: true,
      finalYear: current.year,
      yearLogs: logs,
      timelineData: history,
      collapsed,
      collapsedReason: collapseMsg,
      finalState: current
    });

    setIsLoading(false);
    showToast("success", collapsed ? `Empire collapsed at year ${current.year}.` : `Empire endures after ${simYears} years!`);
  };

  // Plain-text report template for Copy / Download
  const reportText = useMemo(() => {
    const timestamp = new Date().toLocaleString();
    let text = `==================================================
EMPIRE SIMULATION REPORT
Generated: ${timestamp}
==================================================

INITIAL EMPIRE PARAMETERS
--------------------------------------------------
Economy            : ${economy}/100
Military Strength  : ${military}/100
Corruption         : ${corruption}/100
Innovation         : ${innovation}/100
Population Happ.   : ${happiness}/100
Education          : ${education}/100
Political Stability: ${stability}/100
Trade Strength     : ${trade}/100
Resource Avail.    : ${resources}/100
External Threat    : ${externalThreat}/100

`;

    if (simResult && simResult.active) {
      text += `SIMULATION RESULTS (${simYears} Years Run)
--------------------------------------------------
Final Status       : ${simResult.collapsed ? `COLLAPSED at Year ${simResult.finalYear}` : "STABLE / SURVIVED"}
Collapse Trigger   : ${simResult.collapsed ? simResult.collapsedReason : "N/A"}
Final Stability    : ${getStabilityScore(simResult.finalState)}/100

FINAL STATE PARAMETERS (Year ${simResult.finalYear})
--------------------------------------------------
Economy            : ${simResult.finalState.economy}/100
Military Strength  : ${simResult.finalState.military}/100
Corruption         : ${simResult.finalState.corruption}/100
Innovation         : ${simResult.finalState.innovation}/100
Population Happ.   : ${simResult.finalState.happiness}/100
Education          : ${simResult.finalState.education}/100
Political Stability: ${simResult.finalState.stability}/100
Trade Strength     : ${simResult.finalState.trade}/100
Resource Avail.    : ${simResult.finalState.resources}/100
External Threat    : ${simResult.finalState.externalThreat}/100

SIMULATION YEAR-BY-YEAR EVENT LOGS
--------------------------------------------------
${simResult.yearLogs.map(log => `Year ${log.year}: [${log.type.toUpperCase()}] ${log.message}`).join("\n")}
`;
    } else {
      text += `CURRENT STATE METRICS
--------------------------------------------------
Stability Score    : ${stabilityScore}/100
Growth Potential   : ${growthPotential}/100
Collapse Risk      : ${collapseRisk}/100
Expansion Potential: ${expansionPotential}/100
Empire Status      : ${empireStatus.name}
Closest Civilization: ${bestMatch.name} (${bestMatch.score}% Similarity)
Comparison Note    : ${comparisonText}
`;
    }

    text += `\n==================================================
Generated client-side via Boring Tools.
Everything runs locally in your browser. No data is uploaded.
==================================================`;
    return text;
  }, [simResult, simYears, economy, military, corruption, innovation, happiness, education, stability, trade, resources, externalThreat, stabilityScore, growthPotential, collapseRisk, expansionPotential, empireStatus, bestMatch, comparisonText]);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      showToast("success", "Report copied to clipboard.");
    } catch {
      showToast("error", "Copy failed. Please try again.");
    }
  };

  const handleDownloadReport = () => {
    if (typeof window === "undefined") return;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `empire-simulation-report-${simResult?.collapsed ? 'collapsed' : 'endured'}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("success", "Report downloaded successfully.");
  };

  // SVGs Chart computations
  const chartWidth = 640;
  const chartHeight = 280;
  const chartPadding = 36;
  
  const chartData = useMemo(() => {
    if (!simResult || !simResult.timelineData.length) return null;
    return getMultiChartPoints(simResult.timelineData, chartWidth, chartHeight, chartPadding);
  }, [simResult]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      
      {/* Toast Alert */}
      {toast.message && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-3 text-sm shadow-xl font-semibold border transition-all duration-300 animate-fade-in-out ${
            toast.type === "error" ? "bg-red-600 text-white border-red-700" : "bg-slate-900 text-white border-slate-950"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6 my-8">
        
        {/* Header Block */}
        <div className="flex flex-col gap-2 items-center text-center pb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Learning Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Empire Simulator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Configure ten civil indices, experience random historical crises, map developmental arcs, and compare your empire to Rome, Britain, the Ottomans, and the Mongol Horde.
          </p>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
            <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Everything runs locally in your browser. No data is uploaded.
          </div>
        </div>

        {/* Global Simulation Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Preset Configurations:</span>
            <button
              type="button"
              onClick={handleRandomEmpire}
              className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-350 hover:bg-slate-100 focus:outline-none active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5 mr-1.5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="9" cy="9" r="1.2" fill="currentColor" />
                <circle cx="15" cy="15" r="1.2" fill="currentColor" />
                <circle cx="12" cy="12" r="1.2" fill="currentColor" />
              </svg>
              Randomize
            </button>
            <button
              type="button"
              onClick={handleResetEmpire}
              className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-350 hover:bg-slate-100 focus:outline-none active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5 mr-1.5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Reset Baseline
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center rounded-xl border border-slate-950 bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-md focus:outline-none active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5 mr-1.5 shrink-0 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-9 8h10m-10 4h6" />
              </svg>
              Copy Results
            </button>
            <button
              type="button"
              onClick={handleDownloadReport}
              className="inline-flex items-center rounded-xl border border-orange-500 px-4 py-2 text-xs font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white hover:shadow-md focus:outline-none active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5 mr-1.5 shrink-0 text-orange-500 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Report
            </button>
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Sliders Control Panel (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
              
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>Civil Sliders</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">Tweak indices to model your initial civil foundation.</p>
              
              <div className="space-y-6">
                
                {/* Section: Economic Core */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-orange-50 pb-1">Economic & Resources</h3>
                  
                  {/* Economy Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Economy</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-900">{economy}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={economy}
                      onChange={(e) => { setEconomy(Number(e.target.value)); setSimResult(null); }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Trade Strength Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Trade Strength</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-900">{trade}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={trade}
                      onChange={(e) => { setTrade(Number(e.target.value)); setSimResult(null); }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Resource Availability Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Resource Availability</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-900">{resources}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={resources}
                      onChange={(e) => { setResources(Number(e.target.value)); setSimResult(null); }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Innovation Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Innovation</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-900">{innovation}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={innovation}
                      onChange={(e) => { setInnovation(Number(e.target.value)); setSimResult(null); }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                </div>

                {/* Section: Internal Governance */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-orange-50 pb-1">Governance & Society</h3>
                  
                  {/* Corruption Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Corruption</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-900">{corruption}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={corruption}
                      onChange={(e) => { setCorruption(Number(e.target.value)); setSimResult(null); }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Political Stability Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Political Stability</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-900">{stability}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stability}
                      onChange={(e) => { setStability(Number(e.target.value)); setSimResult(null); }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Population Happiness Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Population Happiness</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-900">{happiness}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={happiness}
                      onChange={(e) => { setHappiness(Number(e.target.value)); setSimResult(null); }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Education Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Education</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-900">{education}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={education}
                      onChange={(e) => { setEducation(Number(e.target.value)); setSimResult(null); }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                </div>

                {/* Section: Defense & Foreign Policy */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-orange-50 pb-1">Military & Foreign Policy</h3>
                  
                  {/* Military Strength Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Military Strength</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-900">{military}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={military}
                      onChange={(e) => { setMilitary(Number(e.target.value)); setSimResult(null); }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* External Threat Level Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">External Threat Level</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-900">{externalThreat}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={externalThreat}
                      onChange={(e) => { setExternalThreat(Number(e.target.value)); setSimResult(null); }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Results, Chart & Logs (7 columns) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Top State Status Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Status Banner */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-center ${simResult?.active && simResult.collapsed ? 'text-red-700 bg-red-50 border-red-200' : 'text-slate-900 border-slate-200 bg-slate-50'}`}>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 opacity-80">Dynasty Status</span>
                <h3 className="text-2xl font-black mt-1">
                  {simResult?.active 
                    ? (simResult.collapsed ? `Collapsed (Year ${simResult.finalYear})` : "Intact (Endured)") 
                    : empireStatus.name
                  }
                </h3>
                <p className="text-xs mt-2 text-slate-600 leading-relaxed">
                  {simResult?.active 
                    ? (simResult.collapsed 
                        ? `The administrative framework dissolved due to ${simResult.collapsedReason}.` 
                        : `Your dynasty weathered ${simResult.finalYear} years of historical drifts and crises.`)
                    : `Based on your configured indices, the empire sits in a ${empireStatus.name.toLowerCase()} state.`
                  }
                </p>
              </div>

              {/* General Core Score Indicator */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500 uppercase tracking-wider font-bold">
                    <span>Stability Index</span>
                    <span className="font-mono text-slate-900 font-black">{simResult?.active ? getStabilityScore(simResult.finalState) : stabilityScore}%</span>
                  </div>
                  
                  {/* Gauge representation */}
                  <div className="mt-3 w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300"
                      style={{ width: `${simResult?.active ? getStabilityScore(simResult.finalState) : stabilityScore}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-normal">
                  Calculated from a weighted index of economic vigor, societal happiness, anti-corruption, and military capacity.
                </div>
              </div>
            </div>

            {/* Core Calculated Statistics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              
              {/* Card: Growth Potential */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Growth Potential</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-black text-slate-900">{simResult?.active ? getGrowthPotential(simResult.finalState) : growthPotential}%</span>
                  <svg className="w-4 h-4 text-emerald-600 shrink-0 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${simResult?.active ? getGrowthPotential(simResult.finalState) : growthPotential}%` }} />
                </div>
              </div>

              {/* Card: Collapse Risk */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Collapse Risk</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-black text-slate-900">{simResult?.active ? getCollapseRisk(simResult.finalState) : collapseRisk}%</span>
                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full" style={{ width: `${simResult?.active ? getCollapseRisk(simResult.finalState) : collapseRisk}%` }} />
                </div>
              </div>

              {/* Card: Expansion Potential */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Expansion Potential</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-black text-slate-900">{simResult?.active ? getExpansionPotential(simResult.finalState) : expansionPotential}%</span>
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${simResult?.active ? getExpansionPotential(simResult.finalState) : expansionPotential}%` }} />
                </div>
              </div>

            </div>

            {/* Historical Comparison Card */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
              
              <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                <svg className="w-5 h-5 text-orange-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V10M12 21V10M5 21V10M3 7l9-4 9 4M4 21h16M4 7h16" />
                </svg>
                <span>Historical Archetype Similarity</span>
              </h3>
              
              <div className="text-xs text-slate-600 leading-relaxed mb-4">
                {comparisonText}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                {similarities.slice(0, 4).map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-800">{item.name.split(" (")[0]}</div>
                      <div className="text-[10px] text-slate-400 max-w-[200px] truncate">{item.name.includes("Peak") || item.name.includes("Zenith") ? "Imperial Zenith" : "Decline Cycle"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold font-mono text-slate-950">{item.score}%</div>
                      <div className="w-1.5 h-6 bg-slate-200 rounded-full overflow-hidden">
                        <div className="bg-orange-500 rounded-full h-full" style={{ height: `${item.score}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Simulator Launch Panel */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <svg className="w-5 h-5 text-orange-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                    </svg>
                    <span>Simulation Timeline Launcher</span>
                  </h3>
                  <p className="text-xs text-slate-500">Run a year-by-year chronological drift model.</p>
                </div>

                <div className="flex items-center gap-2">
                  {[10, 25, 50, 100].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setSimYears(y)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${simYears === y ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                    >
                      {y} yrs
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={handleRunSimulation}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-xl border border-orange-500 bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md focus:outline-none active:scale-[0.98] disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5 shrink-0 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    {isLoading ? "Simulating..." : "Run Simulation"}
                  </button>
                </div>
              </div>

              {/* Simulation Result Displays */}
              {simResult && simResult.active && (
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-6">
                  
                  {/* SVG Chart */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-800">Stability & Economic Trajectory</span>
                      
                      {/* Legend */}
                      <div className="flex gap-4 items-center text-[10px]">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-0.5 bg-orange-500 rounded" />
                          <span className="text-slate-400">Stability Score</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-0.5 bg-emerald-500 rounded" />
                          <span className="text-slate-400">Economy</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded" />
                          <span className="text-slate-400">Military</span>
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 overflow-x-auto">
                      {chartData && (
                        <svg
                          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                          className="h-56 w-full min-w-[500px]"
                          role="img"
                          aria-label="Empire stability timeline chart"
                        >
                          <defs>
                            <linearGradient id="stability-area-fill" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#f97316" stopOpacity="0.01" />
                            </linearGradient>
                          </defs>

                          {/* Grid lines */}
                          <line x1={chartPadding} y1={chartPadding} x2={chartWidth - chartPadding} y2={chartPadding} stroke="#e2e8f0" strokeDasharray="3 3" />
                          <line x1={chartPadding} y1={chartPadding + (chartHeight - chartPadding * 2) * 0.25} x2={chartWidth - chartPadding} y2={chartPadding + (chartHeight - chartPadding * 2) * 0.25} stroke="#e2e8f0" strokeDasharray="3 3" />
                          <line x1={chartPadding} y1={chartPadding + (chartHeight - chartPadding * 2) * 0.5} x2={chartWidth - chartPadding} y2={chartPadding + (chartHeight - chartPadding * 2) * 0.5} stroke="#e2e8f0" strokeDasharray="3 3" />
                          <line x1={chartPadding} y1={chartPadding + (chartHeight - chartPadding * 2) * 0.75} x2={chartWidth - chartPadding} y2={chartPadding + (chartHeight - chartPadding * 2) * 0.75} stroke="#e2e8f0" strokeDasharray="3 3" />
                          <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} stroke="#e2e8f0" strokeDasharray="3 3" />

                          {/* Y-Axis labels */}
                          <text x={chartPadding - 8} y={chartPadding + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">100</text>
                          <text x={chartPadding - 8} y={chartPadding + (chartHeight - chartPadding * 2) * 0.5 + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">50</text>
                          <text x={chartPadding - 8} y={chartHeight - chartPadding + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">0</text>

                          {/* X-Axis labels */}
                          <text x={chartPadding} y={chartHeight - chartPadding + 16} textAnchor="middle" className="text-[10px] fill-slate-400 font-mono">Yr 0</text>
                          <text x={chartPadding + (chartWidth - chartPadding * 2) * 0.5} y={chartHeight - chartPadding + 16} textAnchor="middle" className="text-[10px] fill-slate-400 font-mono">Yr {Math.round(simResult.finalYear / 2)}</text>
                          <text x={chartWidth - chartPadding} y={chartHeight - chartPadding + 16} textAnchor="middle" className="text-[10px] fill-slate-400 font-mono">Yr {simResult.finalYear}</text>

                          {/* Plots */}
                          <polygon points={chartData.stabilityArea} fill="url(#stability-area-fill)" />
                          <polyline points={chartData.stabilityLine} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points={chartData.economyLine} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2" />
                          <polyline points={chartData.militaryLine} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Event Logs Console */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800">Historical Chronicles (Simulation Events)</span>
                    <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 max-h-56 overflow-y-auto font-mono text-[11px] text-slate-350 space-y-2.5 leading-relaxed">
                      {simResult.yearLogs.map((log, index) => {
                        const icon = getLogIcon(log.type);
                        const textColor = getLogTextColor(log.type);
                        return (
                          <div key={index} className={`pb-1.5 border-b border-slate-900/60 last:border-b-0 last:pb-0 flex items-start gap-2 ${textColor}`}>
                            <span className="mt-0.5 shrink-0">{icon}</span>
                            <div>
                              <span className="font-semibold text-slate-500 mr-1.5">Year {log.year}:</span>
                              <span>{log.message}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Insights Block */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide flex items-center gap-1.5">
                <svg className="w-5 h-5 text-orange-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0l-3-9m-3 0h18m-6-1l-3-1m0 0l3 9a5.002 5.002 0 006.001 0l-3-9m-3 0h-6M12 3v18" />
                </svg>
                <span>Analytical Insights & Recommendations</span>
              </h3>

              <div className="space-y-4">
                
                {/* Strength */}
                <div className="flex gap-3">
                  <span className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900">Civil Strength: {insights.strength.label}</span>
                    <p className="text-xs text-slate-500 leading-normal">{insights.strength.desc}</p>
                  </div>
                </div>

                {/* Weakness */}
                <div className="flex gap-3">
                  <span className="w-5 h-5 rounded bg-red-100 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-red-750" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900">Systemic Weakness: {insights.weakness.label}</span>
                    <p className="text-xs text-slate-500 leading-normal">{insights.weakness.desc}</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded bg-orange-100 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-orange-700" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                    </svg>
                  </span>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-900">Admin Directives</span>
                    <ul className="list-disc pl-4 text-xs text-slate-500 space-y-1 leading-normal">
                      {insights.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Primary Collapse Cause */}
                <div className="flex gap-3 pt-3 border-t border-slate-200">
                  <span className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900">Primary Collapse Threat</span>
                    <p className="text-xs text-slate-500 leading-normal font-medium">{insights.collapseThreat}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Inline styles for toast animations */}
      <style jsx global>{`
        .animate-fade-in-out {
          animation: fadeInOut 1.8s ease-in-out forwards;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 12px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -12px); }
        }
      `}</style>
    </div>
  );
}

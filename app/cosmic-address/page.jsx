"use client";

import { useEffect, useState, useMemo } from "react";
import ComingSoon from "@/app/components/ComingSoon";

const TOOL_STATUS = "live"; // Set to "live" to deploy and enable routing

const COSMIC_LEVELS = [
  {
    id: "you",
    name: "You",
    description: "A sentient observer of the universe, a conscious node in the cosmic web composed of stardust, breathing and exploring from a small rocky planet.",
    diameter: "≈ 1.7 meters (5.6 feet)",
    age: "Varied (Your atoms are ≈ 13.8 Billion Years old)",
    distance: "0 meters (The absolute center of your observable universe)",
    extraLabel: "Stardust Composition",
    extraVal: "65% Oxygen, 18.5% Carbon, 9.5% Hydrogen, 3.2% Nitrogen",
    interestingFact: "Over 90% of your body mass was forged in the nuclear fires of dying stars, and the hydrogen in your water was created in the early moments of the Big Bang.",
    scaleText: "Individual Scale",
    graphicId: "you"
  },
  {
    id: "earth",
    name: "Earth",
    description: "Our home planet, a vibrant blue water-world orbiting a stable yellow dwarf star. It is the third planet from the Sun and the only known harbor of life.",
    diameter: "12,742 kilometers (≈ 7,917 miles)",
    age: "≈ 4.54 Billion Years",
    distance: "0 meters (Your current landing pads)",
    extraLabel: "Orbit Speed",
    extraVal: "≈ 107,000 km/h (67,000 mph)",
    interestingFact: "Earth's atmosphere and magnetic field shield us from harmful solar radiation, while active plate tectonics constantly recycle its crust.",
    scaleText: "Planetary Scale",
    graphicId: "earth"
  },
  {
    id: "solar_system",
    name: "Solar System",
    description: "Our Sun, Sol, and the gravitational family of celestial bodies bound to it, including 8 planets, dwarf planets, moons, asteroids, and the distant Oort Cloud.",
    diameter: "≈ 287.46 Billion Kilometers (≈ 2 Light-Years to Oort boundary)",
    age: "≈ 4.57 Billion Years",
    distance: "≈ 149.6 Million Kilometers (Sun-Earth distance / 8.3 Light-Minutes)",
    extraLabel: "System Mass",
    extraVal: "99.86% is held within the Sun",
    interestingFact: "If the Sun were scaled down to the size of a white blood cell, the Milky Way galaxy would be the size of the continental United States.",
    scaleText: "Planetary System Scale",
    graphicId: "solarsystem"
  },
  {
    id: "orion_arm",
    name: "Orion Arm",
    description: "A minor spiral arm of the Milky Way galaxy. Our Solar System resides near the inner edge of this arm, inside a pocket called the Local Bubble.",
    diameter: "≈ 20,000 Light-Years (length)",
    age: "≈ 10-12 Billion Years",
    distance: "≈ 26,000 Light-Years (from the Galactic Core)",
    extraLabel: "Arm Thickness",
    extraVal: "≈ 1,000 Light-Years",
    interestingFact: "Most of the brightest stars visible in our night sky, including Orion's belt, Sirius, Polaris, and Betelgeuse, reside with us in the Orion Arm.",
    scaleText: "Galactic Substructure Scale",
    graphicId: "orionarm"
  },
  {
    id: "milky_way",
    name: "Milky Way Galaxy",
    description: "A massive barred spiral galaxy hosting hundreds of billions of stars, planets, and gas clouds, all revolving around a supermassive black hole named Sagittarius A*.",
    diameter: "≈ 100,000 to 120,000 Light-Years",
    age: "≈ 13.6 Billion Years",
    distance: "≈ 26,000 Light-Years (to Galactic Center)",
    extraLabel: "Estimated Star Count",
    extraVal: "≈ 100 to 400 Billion Stars",
    interestingFact: "The Solar System completes one full orbit around the Milky Way center every 225-250 million years. This orbit is known as a Galactic (or Cosmic) Year.",
    scaleText: "Galactic Scale",
    graphicId: "milkyway"
  },
  {
    id: "local_group",
    name: "Local Group",
    description: "Our galactic neighborhood, a cluster of over 80 galaxies dominated gravitationally by two massive giants: the Milky Way and the Andromeda Galaxy.",
    diameter: "≈ 10 Million Light-Years",
    age: "≈ 13 Billion Years",
    distance: "≈ 2.537 Million Light-Years (to nearest major galaxy, Andromeda)",
    extraLabel: "Galaxies Count",
    extraVal: "80+ Galaxies (mostly dwarf clusters)",
    interestingFact: "The Milky Way and Andromeda are currently rushing toward each other at 400,000 km/h, and will merge to form a single giant galaxy in about 4.5 billion years.",
    scaleText: "Galactic Group Scale",
    graphicId: "localgroup"
  },
  {
    id: "virgo_cluster",
    name: "Virgo Cluster",
    description: "A dense cluster of galaxies forming the physical heart of the Virgo Supercluster. Its immense gravity exerts a major pull on our Local Group.",
    diameter: "≈ 15 Million Light-Years",
    age: "≈ 12 Billion Years",
    distance: "≈ 54 Million Light-Years",
    extraLabel: "Galaxies Count",
    extraVal: "≈ 1,300 to 2,000 Galaxies",
    interestingFact: "The Virgo Cluster is so massive that it pulls the Milky Way and the Local Group towards it, a cosmic drift known as the 'Virgo Infall'.",
    scaleText: "Galactic Cluster Scale",
    graphicId: "virgocluster"
  },
  {
    id: "laniakea_supercluster",
    name: "Laniakea Supercluster",
    description: "A gargantuan gravitational watershed spanning hundreds of thousands of galaxies. The Milky Way sits on one of its outer filaments.",
    diameter: "≈ 520 Million Light-Years",
    age: "≈ 13 Billion Years",
    distance: "Spans across 520 million light-years; we sit on a quiet outer filament.",
    extraLabel: "Galaxies Count",
    extraVal: "≈ 100,000+ Galaxies",
    interestingFact: "Laniakea means 'immeasurable heaven' in Hawaiian. It is bound by a focal point called the Great Attractor, towards which all galaxies inside are flowing.",
    scaleText: "Supercluster Scale",
    graphicId: "laniakea"
  },
  {
    id: "observable_universe",
    name: "Observable Universe",
    description: "The spherical bubble of space containing all matter and energy that we can theoretically observe from Earth. Its boundary is defined by the speed of light.",
    diameter: "≈ 93 Billion Light-Years",
    age: "≈ 13.8 Billion Years",
    distance: "≈ 46.5 Billion Light-Years in all directions from Earth",
    extraLabel: "Total Galaxies Estimate",
    extraVal: "≈ 2 Trillion Galaxies",
    interestingFact: "Although the universe is only 13.8 billion years old, its diameter is 93 billion light-years because space itself has been expanding since the Big Bang.",
    scaleText: "Cosmic Scale",
    graphicId: "observableuniverse"
  }
];

const FUN_COMPARISONS = [
  {
    title: "Earth vs. The Sun",
    metricA: "Earth (12,742 km)",
    metricB: "Sun (1,392,700 km)",
    comparison: "If Earth were the size of a single grain of sand (1 millimeter wide), the Sun would be the size of a soccer ball (11 centimeters) sitting about 11.7 meters (38 feet) away.",
    funDetails: "About 1.3 million Earths could fit inside the volume of the Sun.",
    graphicType: "earth_sun"
  },
  {
    title: "The Sun vs. The Solar System",
    metricA: "Sun (1.39M km)",
    metricB: "Oort Cloud Orbit (~2 Light-Years)",
    comparison: "If the Sun were the size of a grain of sand (1 mm), the Solar System's outer boundary (Oort Cloud) would be a massive sphere stretching 300 meters (1,000 feet) in all directions.",
    funDetails: "The nearest neighboring star, Proxima Centauri, would be another grain of sand located 15 kilometers (9.3 miles) away.",
    graphicType: "sun_solarsystem"
  },
  {
    title: "The Solar System vs. The Milky Way",
    metricA: "Solar System (2 Light-Years)",
    metricB: "Milky Way (~100,000 Light-Years)",
    comparison: "If our entire Solar System (out to the Oort Cloud) were compressed to the size of a U.S. Quarter (2.4 cm), the Milky Way galaxy would stretch across the entire continent of North America.",
    funDetails: "Our Solar System orbits the galactic center at 828,000 km/h, but still takes 230 million years to make one trip.",
    graphicType: "solarsystem_milkyway"
  },
  {
    title: "The Milky Way vs. The Local Group",
    metricA: "Milky Way (~100,000 Light-Years)",
    metricB: "Local Group (~10 Million Light-Years)",
    comparison: "If the Milky Way galaxy were the size of a grain of sand (1 mm), the Local Group containing our 80+ neighbor galaxies would fit inside a small dinner plate (10 cm wide).",
    funDetails: "The Andromeda galaxy would be another grain of sand just 2.5 centimeters away.",
    graphicType: "milkyway_localgroup"
  },
  {
    title: "The Milky Way vs. The Observable Universe",
    metricA: "Milky Way (~100,000 Light-Years)",
    metricB: "Observable Universe (93 Billion Light-Years)",
    comparison: "If the Milky Way were a single grain of sand (1 mm), the entire Observable Universe would be a sphere 930 kilometers (580 miles) wide—spanning the distance from New York to Detroit.",
    funDetails: "There are estimated to be over 2 trillion galaxies in the observable universe, each hosting billions of stars.",
    graphicType: "milkyway_universe"
  }
];

const SPACE_FACTS = [
  "Every single hydrogen atom in your body was created in the immediate aftermath of the Big Bang, about 13.8 billion years ago.",
  "The iron in your blood, calcium in your teeth, and carbon in your DNA were forged in the hearts of massive stars that exploded billions of years ago.",
  "Light from the Sun takes 8 minutes and 20 seconds to reach Earth, meaning you are always seeing the Sun as it was in the past.",
  "The Milky Way galaxy is so vast that a beam of light, traveling at 300,000 km/s, takes over 100,000 years to cross from one side to the other.",
  "Due to the expansion of space, the farthest objects we can see are now about 46.5 billion light-years away, even though the universe is 13.8 billion years old.",
  "If the history of the universe were compressed into a single calendar year, all of recorded human history would occupy just the final 21 seconds of December 31st.",
  "You are currently moving through space at 2.2 million km/h relative to the Cosmic Microwave Background due to the rotation of Earth, its orbit, and the drift of our galaxy.",
  "95% of the universe is composed of dark matter and dark energy, which are completely invisible and unknown forms of mass-energy."
];

export default function CosmicAddress() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Cosmic Address" />;
  }

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [compareIndex, setCompareIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  // Load name if previously saved
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("boring-tools-cosmic-name");
      if (stored) {
        setName(stored);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Auto rotate space facts every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % SPACE_FACTS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = (e) => {
    if (e) e.preventDefault();
    setIsStarted(true);
    setCurrentLevel(0);
    try {
      localStorage.setItem("boring-tools-cosmic-name", name);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setIsStarted(false);
    setCurrentLevel(0);
    setName("");
    try {
      localStorage.removeItem("boring-tools-cosmic-name");
    } catch (err) {
      console.error(err);
    }
  };

  const levelData = COSMIC_LEVELS[currentLevel];
  const userName = name.trim() || "You";

  // SVG Graphics for each level
  const renderCosmicGraphic = (graphicId) => {
    switch (graphicId) {
      case "you":
        return (
          <svg className="w-full h-full max-w-[280px] max-h-[280px]" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="human-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Background stars */}
            <circle cx="20" cy="30" r="1" fill="#fff" opacity="0.8" />
            <circle cx="170" cy="40" r="1.5" fill="#fff" opacity="0.6" />
            <circle cx="50" cy="160" r="1" fill="#fff" opacity="0.5" />
            <circle cx="150" cy="150" r="1" fill="#fff" opacity="0.9" />
            {/* Glow */}
            <circle cx="100" cy="100" r="70" fill="url(#human-glow)" />
            {/* Human body representation */}
            <circle cx="100" cy="65" r="15" fill="#f59e0b" />
            <path d="M75 125 C75 95, 125 95, 125 125 Z" fill="#d97706" />
            {/* Star particles floating */}
            <circle cx="100" cy="100" r="2" fill="#fff" className="animate-pulse" />
            <circle cx="85" cy="85" r="1" fill="#fff" opacity="0.8" />
            <circle cx="115" cy="90" r="1" fill="#fff" opacity="0.8" />
            <circle cx="95" cy="115" r="1.5" fill="#fff" opacity="0.9" />
            {/* Concentric rings */}
            <circle cx="100" cy="100" r="85" stroke="#fef3c7" strokeWidth="0.5" strokeDasharray="3 3" fill="none" />
          </svg>
        );
      case "earth":
        return (
          <svg className="w-full h-full max-w-[280px] max-h-[280px]" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="earth-glow" cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#earth-glow)" />
            {/* Orbit path for moon */}
            <ellipse cx="100" cy="100" rx="75" ry="30" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="4 4" fill="none" transform="rotate(-15 100 100)" />
            {/* Earth */}
            <circle cx="100" cy="100" r="40" fill="#2563eb" />
            {/* Earth Continents (Stylized) */}
            <path d="M80 85 C85 80, 95 85, 90 95 C85 105, 75 100, 80 85 Z" fill="#16a34a" />
            <path d="M105 90 C115 80, 125 90, 120 105 C110 115, 100 105, 105 90 Z" fill="#16a34a" />
            <path d="M92 110 C96 115, 105 125, 98 132 C92 135, 88 125, 92 110 Z" fill="#16a34a" />
            {/* Atmosphere shimmer */}
            <circle cx="100" cy="100" r="41" stroke="#60a5fa" strokeWidth="1" fill="none" opacity="0.6" />
            {/* Moon */}
            <circle cx="160" cy="85" r="8" fill="#cbd5e1" />
            <circle cx="158" cy="83" r="2" fill="#94a3b8" />
            <circle cx="163" cy="87" r="1.5" fill="#94a3b8" />
          </svg>
        );
      case "solarsystem":
        return (
          <svg className="w-full h-full max-w-[280px] max-h-[280px]" viewBox="0 0 200 200">
            {/* Sun */}
            <circle cx="100" cy="100" r="18" fill="#f59e0b" className="animate-pulse" />
            <circle cx="100" cy="100" r="22" stroke="#f59e0b" strokeWidth="0.5" fill="none" opacity="0.3" />
            {/* Orbit lines & Planets */}
            <circle cx="100" cy="100" r="32" stroke="#cbd5e1" strokeWidth="0.5" fill="none" opacity="0.4" />
            <circle cx="123" cy="80" r="2.5" fill="#94a3b8" title="Mercury" />
            
            <circle cx="100" cy="100" r="48" stroke="#cbd5e1" strokeWidth="0.5" fill="none" opacity="0.4" />
            <circle cx="66" cy="134" r="4" fill="#d97706" title="Venus" />
            
            <circle cx="100" cy="100" r="66" stroke="#bfdbfe" strokeWidth="0.8" fill="none" opacity="0.6" />
            <circle cx="154" cy="138" r="4.5" fill="#3b82f6" title="Earth" />
            <circle cx="159" cy="141" r="1" fill="#94a3b8" title="Moon" /> {/* Earth Moon */}

            <circle cx="100" cy="100" r="82" stroke="#fca5a5" strokeWidth="0.5" fill="none" opacity="0.4" />
            <circle cx="34" cy="65" r="3.2" fill="#ef4444" title="Mars" />
            
            {/* Asteroid Belt representation */}
            <circle cx="100" cy="100" r="92" stroke="#94a3b8" strokeWidth="2" strokeDasharray="1 8" fill="none" opacity="0.3" />
          </svg>
        );
      case "orionarm":
        return (
          <svg className="w-full h-full max-w-[280px] max-h-[280px]" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="arm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Orion arm curve */}
            <path d="M 10 180 Q 90 90, 190 20" stroke="url(#arm-grad)" strokeWidth="32" strokeLinecap="round" fill="none" opacity="0.75" />
            <path d="M 30 190 Q 100 100, 170 10" stroke="#e9d5ff" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.3" strokeDasharray="2 12" />
            {/* Stars inside the arm */}
            <circle cx="70" cy="115" r="2.5" fill="#f59e0b" className="animate-pulse" /> {/* Betelgeuse */}
            <text x="75" y="112" fill="#fca5a5" fontSize="6.5" fontWeight="bold">Betelgeuse</text>
            
            <circle cx="120" cy="70" r="2" fill="#3b82f6" /> {/* Rigel */}
            <text x="125" y="73" fill="#93c5fd" fontSize="6.5" fontWeight="bold">Rigel</text>

            <circle cx="95" cy="95" r="1.5" fill="#fff" /> {/* Polaris */}
            
            {/* Solar System Location Marker */}
            <g transform="translate(100, 85)">
              <circle cx="0" cy="0" r="3.5" fill="#ef4444" className="animate-ping" style={{ animationDuration: "2s" }} />
              <circle cx="0" cy="0" r="4" fill="#f59e0b" />
              <polygon points="-4,-12 4,-12 0,-4" fill="#f59e0b" />
              <text x="-25" y="-15" fill="#fef3c7" fontSize="7" fontWeight="black" backgroundColor="rgba(0,0,0,0.6)">Solar System</text>
            </g>
          </svg>
        );
      case "milkyway":
        return (
          <svg className="w-full h-full max-w-[280px] max-h-[280px]" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="galactic-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                <stop offset="25%" stopColor="#fef3c7" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#d97706" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Rotating spiral group */}
            <g className="animate-spin" style={{ animationDuration: "30s", transformOrigin: "100px 100px" }}>
              {/* Galactic Core */}
              <circle cx="100" cy="100" r="20" fill="url(#galactic-core)" />
              {/* Spiral Arms */}
              <path d="M 100 100 Q 120 70, 150 70 T 180 120" stroke="#c084fc" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.4" />
              <path d="M 100 100 Q 80 130, 50 130 T 20 80" stroke="#818cf8" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.4" />
              <path d="M 100 100 Q 70 80, 70 50 T 120 20" stroke="#f472b6" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.3" />
              <path d="M 100 100 Q 130 120, 130 150 T 80 180" stroke="#60a5fa" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.3" />
              
              {/* Orion Arm (Highlight) */}
              <path d="M 120 70 Q 130 65, 140 75" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
              
              {/* Flashing Earth Marker */}
              <circle cx="132" cy="68" r="3" fill="#f59e0b" />
            </g>
            {/* Legend Pointer overlay */}
            <g transform="translate(132, 68)">
              <circle cx="0" cy="0" r="5" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" />
              <line x1="0" y1="0" x2="35" y2="-25" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
              <rect x="35" y="-35" width="45" height="12" rx="3" fill="#ef4444" />
              <text x="38" y="-27" fill="#fff" fontSize="6.5" fontWeight="bold">YOU ARE HERE</text>
            </g>
          </svg>
        );
      case "localgroup":
        return (
          <svg className="w-full h-full max-w-[280px] max-h-[280px]" viewBox="0 0 200 200">
            {/* Milky Way */}
            <g transform="translate(70, 120)">
              <ellipse cx="0" cy="0" rx="16" ry="6" fill="#c084fc" opacity="0.7" transform="rotate(-30)" />
              <circle cx="0" cy="0" r="4" fill="#fff" />
              <text x="-25" y="16" fill="#d8b4fe" fontSize="7.5" fontWeight="black">Milky Way</text>
              {/* Star point */}
              <circle cx="-2" cy="-1" r="2.5" fill="#ef4444" className="animate-ping" />
            </g>
            
            {/* Andromeda Galaxy */}
            <g transform="translate(135, 70)">
              <ellipse cx="0" cy="0" rx="22" ry="8" fill="#818cf8" opacity="0.7" transform="rotate(15)" />
              <circle cx="0" cy="0" r="5" fill="#fff" />
              <text x="-22" y="-12" fill="#c7d2fe" fontSize="7.5" fontWeight="bold">Andromeda (M31)</text>
            </g>

            {/* Triangulum Galaxy */}
            <g transform="translate(155, 130)">
              <ellipse cx="0" cy="0" rx="8" ry="4" fill="#f472b6" opacity="0.6" transform="rotate(45)" />
              <circle cx="0" cy="0" r="2" fill="#fff" />
              <text x="11" y="4" fill="#fbcfe8" fontSize="6.5">Triangulum</text>
            </g>

            {/* Large/Small Magellanic Clouds */}
            <circle cx="45" cy="135" r="3" fill="#94a3b8" opacity="0.7" />
            <circle cx="54" cy="142" r="2.2" fill="#94a3b8" opacity="0.6" />
            <text x="35" y="152" fill="#cbd5e1" fontSize="6">Magellanic Clouds</text>

            {/* Faint dwarf galaxies as dots */}
            <circle cx="100" cy="50" r="1.2" fill="#fff" opacity="0.5" />
            <circle cx="115" cy="110" r="1" fill="#fff" opacity="0.4" />
            <circle cx="40" cy="80" r="1.5" fill="#fff" opacity="0.6" />
            <circle cx="85" cy="85" r="1" fill="#fff" opacity="0.3" />
            <circle cx="170" cy="95" r="1.3" fill="#fff" opacity="0.4" />
          </svg>
        );
      case "virgocluster":
        return (
          <svg className="w-full h-full max-w-[280px] max-h-[280px]" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="cluster-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#cluster-glow)" />
            {/* Core Elliptical Galaxies */}
            <ellipse cx="100" cy="100" rx="14" ry="10" fill="#fee2e2" opacity="0.8" />
            <circle cx="100" cy="100" r="3" fill="#fff" />
            <text x="82" y="117" fill="#fca5a5" fontSize="7" fontWeight="bold">Messier 87</text>
            
            <ellipse cx="115" cy="88" rx="8" ry="6" fill="#ffedd5" opacity="0.7" />
            <ellipse cx="82" cy="108" rx="9" ry="5" fill="#ffedd5" opacity="0.7" />

            {/* Various galaxies in cluster */}
            <g opacity="0.65">
              <ellipse cx="60" cy="70" rx="6" ry="2" fill="#c084fc" transform="rotate(30 60 70)" />
              <ellipse cx="140" cy="120" rx="5" ry="3" fill="#818cf8" transform="rotate(-15 140 120)" />
              <ellipse cx="130" cy="65" rx="7" ry="2" fill="#f472b6" transform="rotate(45 130 65)" />
              <ellipse cx="70" cy="130" rx="5" ry="2" fill="#cbd5e1" transform="rotate(-45 70 130)" />
              <circle cx="105" cy="135" r="1.5" fill="#fff" />
              <circle cx="150" cy="90" r="2.2" fill="#fed7aa" />
              <circle cx="50" cy="105" r="1.8" fill="#fbcfe8" />
            </g>
            
            {/* Faint cluster background nodes */}
            <circle cx="110" cy="60" r="1" fill="#fff" opacity="0.5" />
            <circle cx="90" cy="140" r="1" fill="#fff" opacity="0.5" />
            <circle cx="135" cy="100" r="1.2" fill="#fff" opacity="0.4" />
            
            {/* Local Group location at the outskirt */}
            <g transform="translate(45, 145)">
              <circle cx="0" cy="0" r="3" fill="#ef4444" className="animate-pulse" />
              <line x1="0" y1="0" x2="15" y2="-12" stroke="#ef4444" strokeWidth="0.8" />
              <text x="18" y="-12" fill="#fca5a5" fontSize="6.5" fontWeight="bold">Local Group</text>
            </g>
          </svg>
        );
      case "laniakea":
        return (
          <svg className="w-full h-full max-w-[280px] max-h-[280px]" viewBox="0 0 200 200">
            {/* Stream lines simulating flow filaments */}
            <g fill="none" strokeWidth="0.75" opacity="0.6">
              <path d="M 10 10 Q 50 30, 90 90 T 110 110" stroke="#fde047" />
              <path d="M 190 20 Q 150 50, 110 110" stroke="#f59e0b" />
              <path d="M 20 180 Q 80 160, 110 110" stroke="#c084fc" />
              <path d="M 180 180 Q 150 140, 110 110" stroke="#3b82f6" />
              {/* Sub-branches */}
              <path d="M 60 40 Q 80 70, 90 90" stroke="#fef3c7" strokeWidth="0.5" />
              <path d="M 140 60 Q 120 85, 110 110" stroke="#fef3c7" strokeWidth="0.5" />
              <path d="M 75 145 Q 95 130, 110 110" stroke="#e9d5ff" strokeWidth="0.5" />
              <path d="M 145 135 Q 125 125, 110 110" stroke="#bfdbfe" strokeWidth="0.5" />
            </g>

            {/* Central convergence: The Great Attractor */}
            <circle cx="110" cy="110" r="8" fill="#fbbf24" opacity="0.3" className="animate-pulse" />
            <circle cx="110" cy="110" r="2" fill="#fff" />
            <text x="116" y="108" fill="#fef3c7" fontSize="6.5" fontWeight="bold">Great Attractor</text>

            {/* Highlighted dot for Virgo Cluster / Our local area */}
            <g transform="translate(85, 82)">
              <circle cx="0" cy="0" r="3.5" fill="#ef4444" className="animate-ping" />
              <circle cx="0" cy="0" r="3" fill="#ef4444" />
              <text x="-48" y="-4" fill="#fca5a5" fontSize="7" fontWeight="bold">Virgo Cluster</text>
            </g>
          </svg>
        );
      case "observableuniverse":
        return (
          <svg className="w-full h-full max-w-[280px] max-h-[280px]" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="universe-edge" cx="50%" cy="50%" r="50%">
                <stop offset="85%" stopColor="#020617" stopOpacity="1" />
                <stop offset="95%" stopColor="#ea580c" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#b91c1c" stopOpacity="1" />
              </radialGradient>
            </defs>
            {/* The boundary of the observable universe */}
            <circle cx="100" cy="100" r="95" fill="url(#universe-edge)" stroke="#b91c1c" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="95" stroke="#f97316" strokeWidth="0.5" strokeDasharray="3 3" fill="none" />
            
            {/* Cosmic Web filaments overlay (simulated by random lines) */}
            <g stroke="#6366f1" strokeWidth="0.3" opacity="0.4" fill="none">
              <path d="M 20 80 Q 60 50, 100 100 T 180 120" />
              <path d="M 50 170 Q 100 120, 150 160" />
              <path d="M 40 40 Q 100 100, 160 50" />
              <path d="M 100 10 Q 100 100, 95 190" stroke="#a855f7" />
              <path d="M 15 110 Q 100 100, 185 90" stroke="#f43f5e" />
            </g>

            {/* Small yellow dots as galaxy superclusters */}
            <circle cx="65" cy="70" r="1.5" fill="#fde047" opacity="0.8" />
            <circle cx="140" cy="120" r="1.2" fill="#fde047" opacity="0.7" />
            <circle cx="130" cy="65" r="1" fill="#fde047" opacity="0.6" />
            <circle cx="70" cy="130" r="1.5" fill="#fde047" opacity="0.7" />
            <circle cx="105" cy="45" r="1" fill="#fde047" opacity="0.5" />
            <circle cx="160" cy="90" r="1.2" fill="#fde047" opacity="0.6" />
            
            {/* Center dot - You/Earth */}
            <g transform="translate(100, 100)">
              <circle cx="0" cy="0" r="4.5" fill="#ef4444" className="animate-ping" style={{ animationDuration: "3.5s" }} />
              <circle cx="0" cy="0" r="3" fill="#fff" />
              <text x="-48" y="14" fill="#fff" fontSize="6.5" fontWeight="black" letterSpacing="0.5">YOU ARE HERE</text>
              <text x="-32" y="21" fill="#94a3b8" fontSize="5">(Center of Observation)</text>
            </g>
          </svg>
        );
      default:
        return null;
    }
  };

  const nextLevel = () => {
    if (currentLevel < COSMIC_LEVELS.length - 1) {
      setCurrentLevel((prev) => prev + 1);
    }
  };

  const prevLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel((prev) => prev - 1);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      {/* Custom Styles for floating/blinking stars & slide transitions */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .space-card-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <main className="mx-auto max-w-6xl space-y-8 mt-12">
        {/* HEADER SECTION */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Cosmic Address
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-500 font-semibold">
            Trace your exact coordinate in the grand tapestry of space. Zoom out from yourself to the edge of the observable universe.
          </p>
        </div>

        {/* FACT CAROUSEL - Top Banner */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-center shadow-xs backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">
            <span>Cosmic Fact of the Moment</span>
          </div>
          <p className="text-sm font-bold text-amber-950 transition-opacity duration-500 leading-relaxed max-w-3xl mx-auto">
            "{SPACE_FACTS[factIndex]}"
          </p>
          <div className="flex justify-center gap-1.5 mt-2">
            {SPACE_FACTS.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                onClick={() => setFactIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === factIndex ? "bg-amber-500 w-3" : "bg-amber-300"
                }`}
                aria-label={`Show fact ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* INTRO FORM OR JOURNEY WRAPPER */}
        {!isStarted ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-3xl">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.952 11.952 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918M3.284 12c0-.778.099-1.533.284-2.253" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Locate Your Galactic Position</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Enter your name to customize your stardust details and align your coordinates. This tool runs 100% locally in your browser.
              </p>
            </div>

            <form onSubmit={handleStart} className="space-y-4 text-left">
              <div className="space-y-1">
                <label htmlFor="name-input" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Your Name (Optional)
                </label>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Explorer, Neil, Sally"
                  maxLength={25}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 py-3.5 text-sm font-bold text-white shadow-lg transition transform hover:-translate-y-px cursor-pointer"
              >
                Begin Zoom Journey
              </button>

              <button
                type="button"
                onClick={() => {
                  setName("");
                  setIsStarted(true);
                  setCurrentLevel(0);
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-orange-600 font-bold transition block py-1"
              >
                Skip & Continue Anonymous
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: The Interactive Zoom Viewport */}
            <div className="lg:col-span-5 flex flex-col items-center gap-4">
              <div className="w-full rounded-2xl border border-slate-200 bg-slate-950 p-6 shadow-lg flex flex-col items-center justify-center relative overflow-hidden aspect-square">
                {/* Grid backdrop overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_30%,#020617_90%) pointer-events-none" />
                
                {/* Dynamic SVG graphic */}
                <div className="z-10 w-full h-full flex items-center justify-center space-card-float">
                  {renderCosmicGraphic(levelData.graphicId)}
                </div>

                {/* Info Overlay inside the viewport */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-center text-[10px] font-bold tracking-wider text-slate-400 bg-slate-900/80 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 shadow-xs">
                  <span>SCALE: {levelData.scaleText.toUpperCase()}</span>
                  <span className="text-amber-400">LEVEL {currentLevel + 1} / 9</span>
                </div>
              </div>

              {/* Viewport Control Buttons */}
              <div className="w-full flex gap-3">
                <button
                  onClick={prevLevel}
                  disabled={currentLevel === 0}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition shadow-xs cursor-pointer ${
                    currentLevel === 0
                      ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <span>Zoom In</span>
                </button>
                <button
                  onClick={nextLevel}
                  disabled={currentLevel === COSMIC_LEVELS.length - 1}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition shadow-xs cursor-pointer ${
                    currentLevel === COSMIC_LEVELS.length - 1
                      ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <span>Zoom Out</span>
                </button>
              </div>

              {/* Progress step bar on mobile / left list */}
              <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center border-b border-slate-100 pb-2">
                  "You Are Here" Containment Path
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-extrabold text-slate-600">
                  {COSMIC_LEVELS.map((lvl, index) => (
                    <div key={`path-node-${lvl.id}`} className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentLevel(index)}
                        className={`px-2 py-1 rounded-md transition ${
                          index === currentLevel
                            ? "bg-orange-600 text-white font-black shadow-xs"
                            : index < currentLevel
                            ? "bg-orange-50 text-orange-700 border border-orange-100"
                            : "bg-slate-50 text-slate-400 border border-slate-200/50"
                        }`}
                      >
                        {lvl.name === "You" ? userName : lvl.name}
                      </button>
                      {index < COSMIC_LEVELS.length - 1 && (
                        <span className="text-slate-300 font-normal">➔</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Level Specifications & Details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* CURRENT LEVEL DISPLAY CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md space-y-6">
                
                {/* Level Title, Badge, and Reset */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {levelData.scaleText}
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 pt-1">
                      {levelData.name === "You" ? userName : levelData.name}
                    </h2>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    Reset Journey
                  </button>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                  {levelData.description}
                </p>

                <hr className="border-slate-100" />

                {/* Level Stats Sheet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/70 border border-slate-200/50 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Size (Diameter)</span>
                    <span className="text-sm font-black text-slate-800">{levelData.diameter}</span>
                  </div>
                  <div className="p-3 bg-slate-50/70 border border-slate-200/50 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Age</span>
                    <span className="text-sm font-black text-slate-800">{levelData.age}</span>
                  </div>
                  <div className="p-3 bg-slate-50/70 border border-slate-200/50 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Distance from {userName}</span>
                    <span className="text-sm font-black text-slate-800">{levelData.distance}</span>
                  </div>
                  <div className="p-3 bg-slate-50/70 border border-slate-200/50 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{levelData.extraLabel}</span>
                    <span className="text-sm font-black text-slate-800">{levelData.extraVal}</span>
                  </div>
                </div>

                {/* Interesting Fact Box */}
                <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50/60 border border-orange-100 rounded-2xl space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 opacity-10 text-7xl font-serif text-orange-400 select-none">
                    “
                  </div>
                  <h4 className="text-xs font-bold text-orange-800 uppercase tracking-widest flex items-center gap-1.5">
                    Interesting Cosmic Fact
                  </h4>
                  <p className="text-xs text-orange-950 font-bold leading-relaxed relative z-10">
                    "{levelData.interestingFact}"
                  </p>
                </div>

                {/* Zoom Stepper Controls */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={prevLevel}
                    disabled={currentLevel === 0}
                    className="text-xs font-bold text-slate-600 hover:text-orange-600 disabled:text-slate-300 disabled:hover:text-slate-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Previous: {currentLevel > 0 ? COSMIC_LEVELS[currentLevel - 1].name : "None"}</span>
                  </button>
                  <button
                    onClick={nextLevel}
                    disabled={currentLevel === COSMIC_LEVELS.length - 1}
                    className="text-xs font-bold text-slate-600 hover:text-orange-600 disabled:text-slate-300 disabled:hover:text-slate-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next: {currentLevel < COSMIC_LEVELS.length - 1 ? COSMIC_LEVELS[currentLevel + 1].name : "None"} →</span>
                  </button>
                </div>
              </div>

              {/* VERTICAL STEPPER MAP: Visualizing the entire stack */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                  Your Cosmic Address Hierarchy
                </h3>
                
                <div className="relative pl-6 space-y-5">
                  {/* Vertical connector line */}
                  <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-slate-200" />

                  {COSMIC_LEVELS.map((lvl, index) => {
                    const isActive = index === currentLevel;
                    const isPassed = index < currentLevel;

                    return (
                      <div
                        key={`stepper-node-${lvl.id}`}
                        onClick={() => setCurrentLevel(index)}
                        className="relative flex items-start gap-4 group cursor-pointer"
                      >
                        {/* Dot indicator */}
                        <div
                          className={`absolute left-[-21px] w-[11px] h-[11px] rounded-full border-2 transition-all ${
                            isActive
                              ? "bg-orange-500 border-orange-500 scale-125 shadow-xs"
                              : isPassed
                              ? "bg-white border-orange-400"
                              : "bg-white border-slate-300 group-hover:border-slate-400"
                          }`}
                        />

                        {/* Text labels */}
                        <div className="flex-1 space-y-0.5 text-left">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold transition-colors ${
                                isActive ? "text-orange-600 font-extrabold" : "text-slate-800"
                              }`}
                            >
                              {lvl.name === "You" ? userName : lvl.name}
                            </span>
                            {isActive && (
                              <span className="text-[9px] bg-orange-100 text-orange-700 font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                                Current
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block">
                            Size: {lvl.diameter}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* COMPARISONS SECTION (FUN COMPARISONS) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Perspective: Sizing Comparisons
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Linear comparisons fail when analyzing space, but scaling things down to items we know makes the sizes tangible.
            </p>
          </div>

          {/* Sizing Slider / Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
            {FUN_COMPARISONS.map((comp, idx) => (
              <button
                key={`comp-tab-${idx}`}
                onClick={() => setCompareIndex(idx)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                  idx === compareIndex
                    ? "bg-orange-600 border-orange-600 text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {comp.title}
              </button>
            ))}
          </div>

          {/* Comparison Output */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Comparative Info */}
            <div className="md:col-span-7 space-y-4 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                  Comparative Analysis
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {FUN_COMPARISONS[compareIndex].title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Scale A</span>
                  <span className="font-extrabold text-slate-800">{FUN_COMPARISONS[compareIndex].metricA}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Scale B</span>
                  <span className="font-extrabold text-slate-800">{FUN_COMPARISONS[compareIndex].metricB}</span>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                {FUN_COMPARISONS[compareIndex].comparison}
              </p>

              <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl text-xs text-emerald-950 font-bold leading-relaxed">
                <strong>Scale Fact:</strong> {FUN_COMPARISONS[compareIndex].funDetails}
              </div>
            </div>

            {/* Interactive SVG Scale Graphics */}
            <div className="md:col-span-5 flex items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800 min-h-[180px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:12px_12px]" />
              
              {/* Conditional rendering of SVGs based on selection */}
              {compareIndex === 0 && (
                <svg className="w-full max-w-[200px]" viewBox="0 0 160 120">
                  {/* Sun (Huge yellow circle) */}
                  <circle cx="150" cy="60" r="90" fill="#f59e0b" opacity="0.8" />
                  <circle cx="150" cy="60" r="92" stroke="#fbbf24" strokeWidth="0.5" fill="none" opacity="0.4" />
                  {/* Earth (Tiny blue dot) */}
                  <circle cx="20" cy="60" r="1.5" fill="#3b82f6" className="animate-pulse" />
                  <text x="18" y="52" fill="#93c5fd" fontSize="6.5" fontWeight="bold">Earth</text>
                  <text x="75" y="112" fill="#fca5a5" fontSize="7" fontWeight="bold">Sun (Massive Segment)</text>
                </svg>
              )}

              {compareIndex === 1 && (
                <svg className="w-full max-w-[200px]" viewBox="0 0 160 120">
                  {/* Solar system Oort shell */}
                  <circle cx="80" cy="60" r="45" stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="3 3" fill="none" opacity="0.6" />
                  {/* Sun center */}
                  <circle cx="80" cy="60" r="1" fill="#f59e0b" className="animate-ping" />
                  <circle cx="80" cy="60" r="1.5" fill="#f59e0b" />
                  <line x1="80" y1="60" x2="112" y2="28" stroke="#ef4444" strokeWidth="0.5" />
                  <text x="115" y="27" fill="#fca5a5" fontSize="6" fontWeight="bold">Oort Boundary (~1 Ly radius)</text>
                  <text x="75" y="55" fill="#fff" fontSize="6">Sun</text>
                </svg>
              )}

              {compareIndex === 2 && (
                <svg className="w-full max-w-[200px]" viewBox="0 0 160 120">
                  {/* Spiral galaxy representation */}
                  <g className="animate-spin" style={{ animationDuration: "25s", transformOrigin: "80px 60px" }}>
                    <path d="M 80 60 Q 95 30, 120 30 T 150 70" stroke="#cbd5e1" strokeWidth="3" fill="none" opacity="0.4" />
                    <path d="M 80 60 Q 65 90, 40 90 T 10 50" stroke="#cbd5e1" strokeWidth="3" fill="none" opacity="0.4" />
                    <circle cx="80" cy="60" r="10" fill="#fff" opacity="0.15" />
                  </g>
                  {/* Solar System dot */}
                  <circle cx="108" cy="45" r="2.5" fill="#ef4444" className="animate-pulse" />
                  <text x="113" y="44" fill="#fef3c7" fontSize="5.5" fontWeight="black">Solar System</text>
                  <text x="55" y="112" fill="#d8b4fe" fontSize="7" fontWeight="bold">Milky Way Galaxy</text>
                </svg>
              )}

              {compareIndex === 3 && (
                <svg className="w-full max-w-[200px]" viewBox="0 0 160 120">
                  {/* Milky Way circle */}
                  <circle cx="45" cy="60" r="8" fill="#c084fc" opacity="0.8" />
                  <circle cx="45" cy="60" r="2" fill="#fff" />
                  <text x="25" y="44" fill="#e9d5ff" fontSize="6.5" fontWeight="bold">Milky Way</text>
                  
                  {/* Andromeda circle */}
                  <circle cx="115" cy="60" r="11" fill="#818cf8" opacity="0.8" />
                  <circle cx="115" cy="60" r="3" fill="#fff" />
                  <text x="100" y="44" fill="#c7d2fe" fontSize="6.5" fontWeight="bold">Andromeda</text>
                  
                  {/* Distance line */}
                  <line x1="53" y1="60" x2="104" y2="60" stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="3 3" />
                  <text x="59" y="70" fill="#fef3c7" fontSize="5">2.5M Light-Years</text>
                </svg>
              )}

              {compareIndex === 4 && (
                <svg className="w-full max-w-[200px]" viewBox="0 0 160 120">
                  {/* Universe bubble */}
                  <circle cx="80" cy="60" r="50" stroke="#ef4444" strokeWidth="1" fill="none" opacity="0.6" />
                  {/* Filaments density */}
                  <circle cx="80" cy="60" r="49" fill="#020617" />
                  <path d="M 40 40 L 120 80 M 35 85 L 125 35" stroke="#cbd5e1" strokeWidth="0.25" opacity="0.2" />
                  {/* Milky Way (One tiny grain dot) */}
                  <circle cx="80" cy="60" r="1" fill="#fff" className="animate-ping" />
                  <circle cx="80" cy="60" r="1.5" fill="#fff" />
                  <text x="60" y="55" fill="#93c5fd" fontSize="5.5">Milky Way Galaxy</text>
                  <text x="50" y="116" fill="#fca5a5" fontSize="6.5" fontWeight="bold">Observable Universe</text>
                </svg>
              )}

            </div>
          </div>
        </div>

        {/* PERSPECTIVE SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 12a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">The Grain of Sand</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              If our Earth were scaled down to the size of a single tiny grain of sand, the Milky Way galaxy would still stretch for thousands of kilometers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">Galactic Suburbs</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Our Sun and Solar System are not in the center of things. We live in the Orion Arm—a quiet, ordinary neighborhood on the spiral outskirts of a single galaxy.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">Your Entire Life</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Every person who has ever lived, every empire that rose and fell, and every human event took place on one tiny blue marble orbiting an ordinary yellow star.
            </p>
          </div>
        </div>

        {/* LEARN SECTION (GLOSSARY) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Understanding Cosmic Terminology</h2>
            <p className="text-xs text-slate-500 mt-1">
              A beginner-friendly guide to the structures that make up our universe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* GLOSSARY ITEM: SOLAR SYSTEM */}
            <div className="border border-slate-150 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center justify-between">
                <span>1. Solar System</span>
                <span className="text-[10px] text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-sm">SYSTEM</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                A stellar system consisting of a star (like our Sun) and all the celestial objects that orbit it due to gravity. This includes major planets, moons, dwarf planets, comets, asteroid belts, and cosmic dust.
              </p>
            </div>

            {/* GLOSSARY ITEM: LIGHT YEAR */}
            <div className="border border-slate-150 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center justify-between">
                <span>2. Light-Year</span>
                <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-sm">UNIT OF DISTANCE</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Not a measure of time, but the distance that light travels through a vacuum in one Earth year. It is equal to about 9.46 trillion kilometers (5.88 trillion miles).
              </p>
            </div>

            {/* GLOSSARY ITEM: GALAXY */}
            <div className="border border-slate-150 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center justify-between">
                <span>3. Galaxy</span>
                <span className="text-[10px] text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-sm">STELLAR GIANT</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                A massive gravitational system containing gas, dust, dark matter, and anywhere from ten million to one hundred trillion stars. Galaxies are shaped as spirals, ellipticals, or irregular clouds.
              </p>
            </div>

            {/* GLOSSARY ITEM: GALAXY CLUSTER */}
            <div className="border border-slate-150 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center justify-between">
                <span>4. Galaxy Cluster</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-sm">GROUPING</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                A cosmic structure consisting of hundreds to thousands of individual galaxies bound together by gravity. They are among the largest gravitationally bound structures in the universe.
              </p>
            </div>

            {/* GLOSSARY ITEM: SUPERCLUSTER */}
            <div className="border border-slate-150 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center justify-between">
                <span>5. Supercluster</span>
                <span className="text-[10px] text-pink-600 bg-pink-50 border border-pink-100 px-1.5 py-0.5 rounded-sm">WATERSHED</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Large associations of galaxy groups and galaxy clusters. Unlike clusters, superclusters are so large that they are not bound by gravity and are slowly pulling apart due to cosmic expansion.
              </p>
            </div>

            {/* GLOSSARY ITEM: OBSERVABLE UNIVERSE */}
            <div className="border border-slate-150 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center justify-between">
                <span>6. Observable Universe</span>
                <span className="text-[10px] text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-sm">TOTALITY</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                The spherical bubble of the universe that humans can see from Earth. Light from objects outside this bubble has not had enough time to reach us since the Big Bang began 13.8 billion years ago.
              </p>
            </div>

          </div>
        </div>

        {/* PRIVACY BOX */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs flex items-start gap-4">
          <div className="p-2.5 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-800 shrink-0 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div className="space-y-1 text-left">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Privacy Statement</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Everything runs locally inside your browser. No information is uploaded. Your name and navigation inputs are processed entirely offline inside your browser sandbox and are never sent to any server.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

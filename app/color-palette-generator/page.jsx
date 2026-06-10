"use client";

import { useEffect, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

// Helper: Convert HEX to RGB
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper: Convert RGB to HEX
function rgbToHex(r, g, b) {
  const clamp = (val) => Math.min(255, Math.max(0, Math.round(val)));
  const toHex = (val) => clamp(val).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Helper: Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Helper: Convert HSL to RGB
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// Helper: Convert HSL to HEX
function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// Helper: Check if color is light (for readable text overlay)
function isLightColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  // HSP color model formula
  const brightness = Math.sqrt(
    0.299 * (rgb.r * rgb.r) +
    0.587 * (rgb.g * rgb.g) +
    0.114 * (rgb.b * rgb.b)
  );
  return brightness > 127.5;
}

// Drops options
const COUNT_OPTIONS = [
  { value: "3", label: "3 Colors" },
  { value: "5", label: "5 Colors" },
  { value: "7", label: "7 Colors" },
];

const HARMONY_OPTIONS = [
  { value: "harmonious", label: "Harmonious (Golden Angle)" },
  { value: "analogous", label: "Analogous" },
  { value: "monochromatic", label: "Monochromatic" },
  { value: "complementary", label: "Complementary" },
  { value: "triadic", label: "Triadic" },
  { value: "split", label: "Split Complementary" },
  { value: "tetradic", label: "Tetradic" },
];

const PRESET_OPTIONS = [
  { value: "all", label: "All Styles" },
  { value: "pastel", label: "Pastels" },
  { value: "neon", label: "Neons" },
  { value: "vintage", label: "Vintage / Muted" },
  { value: "dark", label: "Dark Themes" },
  { value: "warm", label: "Warm Colors" },
  { value: "cool", label: "Cool Colors" },
];

export default function ColorPaletteGeneratorPage() {
  const [colorCount, setColorCount] = useState(5);
  const [harmony, setHarmony] = useState("harmonious");
  const [preset, setPreset] = useState("all");
  const [colors, setColors] = useState([]);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [activeShadeIndex, setActiveShadeIndex] = useState(null); // which color card is viewing shades
  const toastTimerRef = useRef(null);

  // Initialize first palette on mount
  useEffect(() => {
    // Start with a default set of 5 colors
    const initial = [
      { hex: "#F59E0B", locked: false },
      { hex: "#EF4444", locked: false },
      { hex: "#10B981", locked: false },
      { hex: "#3B82F6", locked: false },
      { hex: "#8B5CF6", locked: false }
    ];
    setColors(initial);
  }, []);

  // Show status toasts
  const showToast = (type, message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 1800);
  };

  // Keyboard shortcut listener: Spacebar to generate
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger if user is focusing input or textarea
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target.isContentEditable)) {
        e.preventDefault();
        generatePalette();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [colors, colorCount, harmony, preset]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Helper to get random S and L values based on the preset selection
  const getPresetHsl = (p, currentHue) => {
    let h = currentHue !== undefined ? currentHue : Math.floor(Math.random() * 360);
    let s = 65 + Math.floor(Math.random() * 25); // default 65-90%
    let l = 45 + Math.floor(Math.random() * 20); // default 45-65%

    if (p === "pastel") {
      s = 35 + Math.floor(Math.random() * 20); // 35-55%
      l = 75 + Math.floor(Math.random() * 10); // 75-85%
    } else if (p === "neon") {
      s = 90 + Math.floor(Math.random() * 10); // 90-100%
      l = 50 + Math.floor(Math.random() * 10); // 50-60%
    } else if (p === "vintage") {
      s = 20 + Math.floor(Math.random() * 20); // 20-40%
      l = 35 + Math.floor(Math.random() * 15); // 35-50%
    } else if (p === "dark") {
      s = 15 + Math.floor(Math.random() * 15); // 15-30%
      l = 12 + Math.floor(Math.random() * 12); // 12-24%
    } else if (p === "warm") {
      h = Math.random() < 0.5 ? Math.floor(Math.random() * 50) : 320 + Math.floor(Math.random() * 40);
    } else if (p === "cool") {
      h = 120 + Math.floor(Math.random() * 150);
    }
    return { h, s, l };
  };

  // Main generator function
  const generatePalette = (forcedCount = null) => {
    const targetCount = forcedCount || colorCount;
    const newColors = Array(targetCount).fill(null);

    // 1. Keep locked colors that fit inside size limits
    for (let i = 0; i < targetCount; i++) {
      if (colors[i] && colors[i].locked) {
        newColors[i] = { ...colors[i] };
      }
    }

    // 2. Determine an anchor color HSL
    let anchorHsl = null;
    const firstLocked = newColors.find(c => c !== null);
    if (firstLocked) {
      const rgb = hexToRgb(firstLocked.hex);
      if (rgb) anchorHsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    }

    if (!anchorHsl) {
      anchorHsl = getPresetHsl(preset);
    }

    // 3. Compute Hues array for target size based on harmony rules
    let hues = [];
    const baseH = anchorHsl.h;

    if (harmony === "monochromatic") {
      hues = Array(targetCount).fill(baseH);
    } else if (harmony === "analogous") {
      const step = 25;
      for (let i = 0; i < targetCount; i++) {
        hues.push((baseH + (i - Math.floor(targetCount / 2)) * step + 360) % 360);
      }
    } else if (harmony === "complementary") {
      const oppH = (baseH + 180) % 360;
      for (let i = 0; i < targetCount; i++) {
        hues.push(i % 2 === 0 ? baseH : oppH);
      }
    } else if (harmony === "triadic") {
      for (let i = 0; i < targetCount; i++) {
        hues.push((baseH + (i * 120)) % 360);
      }
    } else if (harmony === "split") {
      const splitLeft = (baseH + 150) % 360;
      const splitRight = (baseH + 210) % 360;
      hues.push(baseH);
      hues.push(splitLeft);
      hues.push(splitRight);
      hues.push((baseH + 30) % 360);
      hues.push((baseH + 180) % 360);
      hues.push((baseH + 330) % 360);
      hues.push((baseH + 90) % 360);
    } else if (harmony === "tetradic") {
      for (let i = 0; i < targetCount; i++) {
        hues.push((baseH + (i * 90)) % 360);
      }
    } else {
      // Golden Angle distribution (harmonious random)
      for (let i = 0; i < targetCount; i++) {
        hues.push((baseH + i * 137.508) % 360);
      }
    }

    // 4. Fill in unlocked slots
    for (let i = 0; i < targetCount; i++) {
      if (newColors[i] === null) {
        const h = hues[i % hues.length];
        let { s, l } = getPresetHsl(preset, h);

        if (harmony === "monochromatic") {
          // Monochromatic needs spread of lightness and saturation to be interesting
          const step = 65 / targetCount;
          if (preset === "dark") {
            l = 8 + (i * 3.5);
          } else if (preset === "pastel") {
            l = 68 + (i * 3.5);
          } else {
            l = 15 + (i * step);
          }
        }

        newColors[i] = {
          hex: hslToHex(h, s, l),
          locked: false
        };
      }
    }

    setColors(newColors);
    showToast("success", "Generated new palette!");
  };

  // Toggle lock state of a card
  const toggleLock = (index) => {
    setColors(prev => prev.map((color, i) => i === index ? { ...color, locked: !color.locked } : color));
  };

  // Manually update a specific color card
  const handleColorChange = (index, newHex) => {
    if (/^#[0-9A-F]{6}$/i.test(newHex)) {
      setColors(prev => prev.map((color, i) => i === index ? { ...color, hex: newHex } : color));
    }
  };

  // Change palette count
  const handleCountChange = (value) => {
    const newCount = parseInt(value);
    setColorCount(newCount);
    generatePalette(newCount);
    setActiveShadeIndex(null);
  };

  // Copy individual color
  const copyColor = async (hexCode, label) => {
    try {
      await navigator.clipboard.writeText(hexCode);
      showToast("success", `Copied ${label}: ${hexCode}`);
    } catch {
      showToast("error", "Failed to copy.");
    }
  };

  // Copy full palette list
  const copyFullPalette = async () => {
    const list = colors.map(c => c.hex).join(", ");
    try {
      await navigator.clipboard.writeText(list);
      showToast("success", "Copied full palette to clipboard!");
    } catch {
      showToast("error", "Failed to copy.");
    }
  };

  // Export as JSON file
  const exportJson = () => {
    const data = colors.map(color => {
      const rgb = hexToRgb(color.hex);
      const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
      return {
        hex: color.hex,
        rgb: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "",
        hsl: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : ""
      };
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `boring-palette.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("success", "Exported JSON!");
  };

  // Draw palette inside standard Canvas and download
  const downloadImage = () => {
    if (colors.length === 0) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const width = 1200;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    const barWidth = width / colors.length;

    colors.forEach((color, i) => {
      // Color Stripe
      ctx.fillStyle = color.hex;
      ctx.fillRect(i * barWidth, 0, barWidth, height - 160);

      // Label background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(i * barWidth, height - 160, barWidth, 160);

      // Draw HEX label
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(color.hex, i * barWidth + barWidth / 2, height - 90);

      // Draw RGB Label
      const rgb = hexToRgb(color.hex);
      const rgbText = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "";
      ctx.fillStyle = "#71717a";
      ctx.font = "16px sans-serif";
      ctx.fillText(rgbText, i * barWidth + barWidth / 2, height - 45);

      // Divider lines
      if (i > 0) {
        ctx.strokeStyle = "rgba(0,0,0,0.06)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(i * barWidth, 0);
        ctx.lineTo(i * barWidth, height);
        ctx.stroke();
      }
    });

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `boring-palette-${colors.map(c => c.hex.replace("#", "")).join("-")}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("success", "Downloaded PNG image!");
  };

  // Generate 10 similar shades (tints/shades)
  const getShades = (hexCode) => {
    const rgb = hexToRgb(hexCode);
    if (!rgb) return [];
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const shadesList = [];
    
    // Generate lightness ranging from 12% to 92% in 10 steps
    for (let i = 1; i <= 10; i++) {
      const l = 7 + (i * 8.5);
      shadesList.push(hslToHex(hsl.h, hsl.s, l));
    }
    return shadesList;
  };

  // Replace active shade with selected one
  const handleShadeSelect = (shadeHex) => {
    if (activeShadeIndex !== null) {
      setColors(prev => prev.map((color, i) => i === activeShadeIndex ? { ...color, hex: shadeHex } : color));
      showToast("success", `Updated color to ${shadeHex}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 sm:py-8 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        
        {/* Header Title Section */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Creator Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Color Palette Generator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Generate and customize stunning color palettes in one click. Lock colors you love, modify details, explore shade variations, and export immediately.
          </p>
        </div>

        {/* Dashboard Settings Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Palette Size</label>
            <ThemedDropdown
              ariaLabel="Choose size"
              value={colorCount.toString()}
              options={COUNT_OPTIONS}
              onChange={handleCountChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Color Harmony</label>
            <ThemedDropdown
              ariaLabel="Choose harmony"
              value={harmony}
              options={HARMONY_OPTIONS}
              onChange={(value) => {
                setHarmony(value);
                // regenerate automatically
                setTimeout(() => generatePalette(), 0);
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Style Preset</label>
            <ThemedDropdown
              ariaLabel="Choose preset"
              value={preset}
              options={PRESET_OPTIONS}
              onChange={(value) => {
                setPreset(value);
                // regenerate automatically
                setTimeout(() => generatePalette(), 0);
              }}
            />
          </div>
        </div>

        {/* Spacebar Instruction Tip */}
        <p className="text-center text-xs text-slate-400 -mt-2 flex items-center justify-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="14" width="18" height="4" rx="1" /><path d="M5 14V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7" /></svg>
          <span>Press <span className="font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500">Space</span> to generate a new palette</span>
        </p>

        {/* MAIN PALETTE CONTAINER (Desktop row, Mobile column) */}
        <div className="flex flex-col md:flex-row gap-3 min-h-[420px] md:h-[480px]">
          {colors.map((color, i) => {
            const light = isLightColor(color.hex);
            const rgb = hexToRgb(color.hex);
            const rgbString = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "";
            const isViewingShades = activeShadeIndex === i;

            return (
              <div
                key={i}
                style={{ backgroundColor: color.hex }}
                className={`relative flex-1 rounded-2xl flex flex-row md:flex-col justify-between items-center md:items-stretch p-4 md:p-5 shadow-sm border border-black/5 transition-all duration-300 group ${
                  light ? "text-slate-900" : "text-white"
                } ${isViewingShades ? "ring-4 ring-orange-500 shadow-lg" : "hover:shadow-md"}`}
              >
                
                {/* Lock & Direct Picker Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-auto md:w-full order-3 md:order-1">
                  {/* Lock button */}
                  <button
                    type="button"
                    onClick={() => toggleLock(i)}
                    title={color.locked ? "Unlock color" : "Lock color"}
                    className={`flex items-center justify-center w-10 h-10 rounded-xl transition duration-200 shadow-sm border focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                      light 
                        ? "bg-white/90 border-slate-200 hover:bg-slate-50 text-slate-800" 
                        : "bg-slate-900/40 border-white/10 hover:bg-slate-900/60 text-white"
                    } ${color.locked ? "scale-110 !border-orange-500 !bg-orange-50 text-orange-600" : ""}`}
                  >
                    {color.locked ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /><circle cx="12" cy="16" r="1" fill="currentColor" /></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.83-1" /></svg>
                    )}
                  </button>

                  {/* HTML5 Native Color input container */}
                  <div 
                    title="Choose custom color"
                    className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition shadow-sm overflow-hidden cursor-pointer ${
                      light 
                        ? "bg-white/90 border-slate-200 hover:bg-slate-50 text-slate-800" 
                        : "bg-slate-900/40 border-white/10 hover:bg-slate-900/60 text-white"
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => handleColorChange(i, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Color Codes Display (Middle on desktop) */}
                <div className="flex-1 md:flex-none flex flex-col gap-2 items-start md:items-center justify-center w-full order-1 md:order-2">
                  {/* Hex display */}
                  <button
                    type="button"
                    onClick={() => copyColor(color.hex, "HEX")}
                    title="Click to copy HEX code"
                    className={`text-xl sm:text-2xl font-black tracking-wider hover:scale-105 transition active:scale-95 font-mono ${
                      light ? "hover:text-slate-600" : "hover:text-slate-200"
                    }`}
                  >
                    {color.hex}
                  </button>

                  {/* RGB display */}
                  <button
                    type="button"
                    onClick={() => copyColor(rgbString, "RGB")}
                    title="Click to copy RGB values"
                    className={`text-xs opacity-75 hover:opacity-100 transition font-mono ${
                      light ? "hover:text-slate-600" : "hover:text-slate-200"
                    }`}
                  >
                    rgb({rgbString})
                  </button>
                </div>

                {/* Card footer action: Shades Selector Toggle */}
                <div className="w-auto md:w-full order-2 md:order-3 md:pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (isViewingShades) {
                        setActiveShadeIndex(null);
                      } else {
                        setActiveShadeIndex(i);
                      }
                    }}
                    className={`w-full py-2 px-3 rounded-xl font-medium text-xs border transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                      light 
                        ? "bg-white/80 border-slate-200 text-slate-800 hover:bg-slate-100" 
                        : "bg-slate-950/20 border-white/10 text-white hover:bg-slate-950/40"
                    } ${isViewingShades ? "!bg-orange-500 !text-white !border-orange-500" : ""}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none" /></svg>
                    <span>{isViewingShades ? "Close Shades" : "Shades"}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* SIMILAR SHADES DRAWER/DRAIN PANEL */}
        {activeShadeIndex !== null && colors[activeShadeIndex] && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 flex flex-col gap-3 transition-all duration-300 animate-slide-down">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Similar Shades for Slot #{activeShadeIndex + 1} ({colors[activeShadeIndex].hex})
                </h3>
                <p className="text-xs text-slate-500">Click a shade to replace this color card slot.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveShadeIndex(null)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow"
              >
                Close Panel
              </button>
            </div>
            
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {getShades(colors[activeShadeIndex].hex).map((shadeHex, index) => {
                const isSelected = colors[activeShadeIndex].hex === shadeHex;
                return (
                  <button
                    key={index}
                    type="button"
                    style={{ backgroundColor: shadeHex }}
                    onClick={() => handleShadeSelect(shadeHex)}
                    title={`Select shade ${shadeHex}`}
                    className={`aspect-square w-full rounded-xl border border-black/5 transition hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      isSelected ? "ring-4 ring-orange-500 scale-105" : ""
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Actions Dashboard */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => generatePalette()}
            className="flex-1 rounded-xl border border-slate-900 bg-slate-900 px-4 py-4 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
            <span>Generate New Palette</span>
          </button>
          
          <button
            type="button"
            onClick={copyFullPalette}
            className="rounded-xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            <span>Copy Palette Code</span>
          </button>
          
          <button
            type="button"
            onClick={downloadImage}
            className="rounded-xl border border-orange-500 bg-white px-5 py-4 font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            <span>Download PNG Image</span>
          </button>
          
          <button
            type="button"
            onClick={exportJson}
            className="rounded-xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /><line x1="9" y1="18" x2="13" y2="18" /></svg>
            <span>Export JSON</span>
          </button>
        </div>

        {/* Informative Explanation Note */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Color Palette Science</p>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
            Beautiful palettes rely on geometric relationships on the color wheel. Selecting different HSL spacing configurations like Complementary (180° opposite colors), Analogous (neighboring colors), or Triadic (equilateral triangle) creates immediate harmony. Use style presets to lock the saturation and lightness limits for specific design aesthetics.
          </p>
        </div>
      </div>

      {/* Floating Status Toast Notification */}
      {toast.message ? (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm shadow-xl font-medium border animate-fade-in-out ${
            toast.type === "error" 
              ? "bg-red-600 border-red-600 text-white" 
              : "bg-slate-900 border-slate-950 text-white"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
        .animate-fade-in-out {
          animation: fadeInOut 1.8s ease-in-out forwards;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 15px) scale(0.95); }
          10% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          90% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -15px) scale(0.95); }
        }
        .animate-slide-down {
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

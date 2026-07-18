"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export default function LogoMeaningExplorerPage() {
  const [logoSrc, setLogoSrc] = useState(null);
  const [logoName, setLogoName] = useState("");
  const [logoType, setLogoType] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [auditResult, setAuditResult] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [history, setHistory] = useState([]);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [learningModes, setLearningModes] = useState({});

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const loadingSteps = [
    "Analyzing visual layout and shape geometry...",
    "Scanning color tones and psychology indicators...",
    "Decoding typography styles and balance ratios...",
    "Assessing accessibility, contrast, and scaling...",
    "Synthesizing brand personality and emotional impact...",
    "Generating brand story and designer takeaways..."
  ];

  // Load history from localStorage on mount
  useEffect(() => {
    document.title = "Logo Meaning Explorer – Analyze Logo Psychology & Branding | Boring Tools";
    if (typeof window !== "undefined") {
      const storedHistory = localStorage.getItem("logo_explorer_history");
      if (storedHistory) {
        try {
          setHistory(JSON.parse(storedHistory));
        } catch (e) {
          console.error("Failed to parse history from localStorage", e);
        }
      }
    }
  }, []);

  // Show auto-fade toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Convert file to Base64
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file (PNG, JPG, WebP, SVG).", "error");
      return;
    }
    setLogoName(file.name);
    setLogoType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoSrc(e.target.result);
      setAuditResult(null); // Clear previous audit
    };
    reader.onerror = () => {
      showToast("Error reading file.", "error");
    };
    reader.readAsDataURL(file);
  };

  // Handle file input selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processImageFile(file);
  };

  // Drag & Drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    processImageFile(file);
  };

  // Listen for paste actions on window
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          processImageFile(file);
          showToast("Image pasted from clipboard!", "success");
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

// Helper to compress/downscale base64 image to reduce token footprint
const compressLogoImage = (dataUrl, maxDimension = 256) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
};

  // Trigger analysis call to backend
  const handleRunAnalysis = async () => {
    if (!logoSrc) return;
    setIsLoading(true);
    setErrorState(null);

    // Start loading step rotator
    let currentStep = 0;
    setLoadingStep(loadingSteps[0]);
    const stepInterval = setInterval(() => {
      currentStep = (currentStep + 1) % loadingSteps.length;
      setLoadingStep(loadingSteps[currentStep]);
    }, 2500);

    try {
      // Downscale image to fit under free tier TPM rate limit (8,000 tokens)
      const compressedDataUrl = await compressLogoImage(logoSrc, 128);
      const base64Content = compressedDataUrl.split(",")[1];

      const response = await fetch("/api/logo-meaning-explorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Content,
          fileType: logoType || "image/png"
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setAuditResult(data);
      saveToHistory(data);
      showToast("Logo brand audit generated successfully!", "success");
    } catch (err) {
      console.error(err);
      setErrorState(err.message || "Failed to analyze image.");
      showToast("Analysis failed. Please check backend API.", "error");
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const [errorState, setErrorState] = useState(null);

  // Save successful result to local history
  const saveToHistory = (result) => {
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      brandName: result.brandName,
      logoSrc: logoSrc,
      logoName: logoName,
      logoType: logoType,
      auditResult: result,
      isFavorite: false
    };

    const updated = [newEntry, ...history].slice(0, 30); // Cache up to 30 items
    setHistory(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("logo_explorer_history", JSON.stringify(updated));
    }
  };

  // Toggle favorite flag
  const toggleFavorite = (id) => {
    const updated = history.map((item) => {
      if (item.id === id) {
        const nextFav = !item.isFavorite;
        showToast(nextFav ? "Added to favorites!" : "Removed from favorites", "success");
        return { ...item, isFavorite: nextFav };
      }
      return item;
    });
    setHistory(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("logo_explorer_history", JSON.stringify(updated));
    }
    // Update active report favorite state if open
    if (auditResult && activeHistoryId) {
      const activeItem = updated.find((x) => x.id === activeHistoryId);
      if (activeItem) {
        setAuditResult(activeItem.auditResult);
      }
    }
  };

  // Active loaded history item identifier
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  // Load history item
  const handleLoadHistoryItem = (item) => {
    setLogoSrc(item.logoSrc);
    setLogoName(item.logoName);
    setLogoType(item.logoType);
    setAuditResult(item.auditResult);
    setActiveHistoryId(item.id);
    showToast(`Loaded report for ${item.brandName}`, "success");
  };

  // Delete history item
  const handleDeleteHistoryItem = (e, id) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("logo_explorer_history", JSON.stringify(updated));
    }
    if (activeHistoryId === id) {
      setAuditResult(null);
      setLogoSrc(null);
      setActiveHistoryId(null);
    }
    showToast("History entry deleted", "success");
  };

  // Toggle learning mode block
  const toggleLearningMode = (sectionKey) => {
    setLearningModes((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Copy hex colors
  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text).then(
      () => showToast(`Copied ${label}: ${text}`, "success"),
      () => showToast("Failed to copy", "error")
    );
  };

  // Reset / start over
  const handleReset = () => {
    setLogoSrc(null);
    setLogoName("");
    setLogoType("");
    setAuditResult(null);
    setActiveHistoryId(null);
    setErrorState(null);
  };

  // Computed favorites filter
  const displayedHistory = useMemo(() => {
    if (filterFavorites) {
      return history.filter((item) => item.isFavorite);
    }
    return history;
  }, [history, filterFavorites]);

  // Export 1: Copy full report to clipboard as Markdown
  const buildReportMarkdown = () => {
    if (!auditResult) return "";
    const traitsList = auditResult.brandPersonality?.traits || [];
    const colorsList = auditResult.colorPsychology || [];
    const shapesList = auditResult.shapeAnalysis || [];
    const strengthsList = auditResult.designStrengths || [];
    const improvementsList = auditResult.improvementSuggestions || [];
    const principlesList = auditResult.designPrinciples?.principles || [];
    const historyList = auditResult.historyMode?.evolution || [];

    return [
      `# Brand Audit Report: ${auditResult.brandName}`,
      `Generated via BoringTools Logo Meaning Explorer`,
      `Date: ${new Date().toLocaleDateString()}`,
      `---`,
      `## 1. Brand Story`,
      auditResult.brandStoryGenerator || "No story generated.",
      "",
      `## 2. Brand Personality`,
      traitsList.map((t) => `- **${t.trait}**: ${t.score}% | ${t.explanation}`).join("\n"),
      "",
      `## 3. Color Psychology`,
      colorsList.map((c) => [
        `### Color: ${c.color} (${c.hex})`,
        `- **Meaning**: ${c.meaning}`,
        `- **Emotional Impact**: ${c.emotionalImpact}`,
        `- **Common Industries**: ${c.commonIndustries}`,
        `- **Psychological Effect**: ${c.psychologicalEffect}`,
        `- **Strengths**: ${c.strengths}`,
        `- **Weaknesses**: ${c.weaknesses}`
      ].join("\n")).join("\n\n"),
      "",
      `## 4. Shape Analysis`,
      shapesList.map((s) => [
        `### Shape: ${s.shape} (Presence: ${s.presence})`,
        `- **Communicates**: ${s.communicates}`,
        `- **Branding Insight**: ${s.brandingInsight}`
      ].join("\n")).join("\n\n"),
      "",
      `## 5. Typography Analysis`,
      `- **Style**: ${auditResult.typographyAnalysis?.style}`,
      `- **Suggested Font**: ${auditResult.typographyAnalysis?.fontNameGuess}`,
      `- **Personality**: ${auditResult.typographyAnalysis?.personalityCreated}`,
      "",
      `## 6. Logo Type`,
      `- **Classification**: ${auditResult.logoType?.type}`,
      `- **Rationale**: ${auditResult.logoType?.explanation}`,
      "",
      `## 7. Visual Hierarchy`,
      `- **Balance**: ${auditResult.visualHierarchy?.balance}`,
      `- **Alignment**: ${auditResult.visualHierarchy?.alignment}`,
      `- **Spacing**: ${auditResult.visualHierarchy?.spacing}`,
      `- **Contrast**: ${auditResult.visualHierarchy?.contrast}`,
      `- **Negative Space**: ${auditResult.visualHierarchy?.negativeSpace}`,
      `- **Focal Point**: ${auditResult.visualHierarchy?.focusPoint}`,
      `- **Simplicity**: ${auditResult.visualHierarchy?.simplicity}`,
      `- **Complexity**: ${auditResult.visualHierarchy?.complexity}`,
      "",
      `## 8. Target Audience & Positioning`,
      `- **Target Audience**: ${auditResult.targetAudience?.predictedAudience}`,
      `- **Audience Reasoning**: ${auditResult.targetAudience?.reasoning}`,
      `- **Market Position**: ${auditResult.brandPositioning?.marketSegment}`,
      `- **Position Reasoning**: ${auditResult.brandPositioning?.reasoning}`,
      "",
      `## 9. Design Strengths`,
      strengthsList.map((s) => `- **${s.strength}**: ${s.details}`).join("\n"),
      "",
      `## 10. Improvement Suggestions`,
      improvementsList.map((i) => `- **${i.suggestion}**: ${i.details}`).join("\n"),
      "",
      `## 11. Logo Style Comparison`,
      `- **Looks similar to**: ${auditResult.logoStyleComparison?.similarStyles?.join(", ")}`,
      `- **Details**: ${auditResult.logoStyleComparison?.explanation}`,
      "",
      `## 12. Accessibility Checklist`,
      Object.entries(auditResult.accessibility || {}).map(([key, val]) => `- **${key.replace(/([A-Z])/g, " $1")}**: ${val}`).join("\n"),
      "",
      `## 13. Design Principles Audit`,
      `Verdict: ${auditResult.designPrinciples?.verdict}`,
      principlesList.map((p) => `- **${p.principle}** (${p.status}): ${p.explanation}`).join("\n"),
      "",
      `## 14. What Designers Can Learn`,
      auditResult.learningMode || "N/A",
      "",
      auditResult.historyMode?.isFamous ? [
        `## 15. Brand Evolution Timeline`,
        historyList.map((h) => `- **${h.year} (${h.event})**: ${h.reason}`).join("\n")
      ].join("\n") : ""
    ].filter(Boolean).join("\n");
  };

  const handleCopyReport = () => {
    const md = buildReportMarkdown();
    if (!md) return;
    navigator.clipboard.writeText(md).then(
      () => showToast("Copied Markdown Report to clipboard!", "success"),
      () => showToast("Copy failed", "error")
    );
  };

  // Export 2: Download report as Markdown file
  const handleDownloadMarkdown = () => {
    const md = buildReportMarkdown();
    if (!md) return;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `brand-audit-${auditResult.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Downloaded Markdown Report!", "success");
  };

  // Export 3: PNG Summary Card
  const handleDownloadPNGSummary = () => {
    if (!auditResult) return;

    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 500);
    gradient.addColorStop(0, "#0f172a"); // Dark slate
    gradient.addColorStop(1, "#1e293b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 500);

    // Draw header text
    ctx.fillStyle = "#fbbf24"; // Amber Accent
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("BRAND AUDIT SUMMARY", 50, 60);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px sans-serif";
    ctx.fillText(auditResult.brandName, 50, 110);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Audited on ${new Date().toLocaleDateString()}`, 50, 140);

    // Draw brand personality pills
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Top Brand Personality Traits:", 50, 200);

    const sortedTraits = [...(auditResult.brandPersonality?.traits || [])]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    let traitY = 230;
    sortedTraits.forEach((t) => {
      ctx.fillStyle = "rgba(251, 191, 36, 0.15)";
      ctx.fillRect(50, traitY - 18, 140, 28);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#fbbf24";
      ctx.strokeRect(50, traitY - 18, 140, 28);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(`${t.trait} (${t.score}%)`, 65, traitY + 2);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "13px sans-serif";
      ctx.fillText(t.explanation.substring(0, 65) + "...", 210, traitY + 2);
      traitY += 40;
    });

    // Draw Colors
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Dominant Palette:", 50, 370);

    let colorX = 50;
    const colors = auditResult.colorPsychology || [];
    colors.forEach((c) => {
      ctx.fillStyle = c.hex;
      ctx.fillRect(colorX, 395, 45, 45);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.strokeRect(colorX, 395, 45, 45);

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.fillText(c.color, colorX, 460);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.fillText(c.hex, colorX, 475);
      colorX += 80;
    });

    // Draw right panel with logo if loaded
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.onload = () => {
      // Draw background panel for logo
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(490, 160, 260, 260);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.strokeRect(490, 160, 260, 260);

      // Scale logo image to fit 220x220 square inside 260x260 container
      const maxW = 220;
      const maxH = 220;
      let w = logoImg.width;
      let h = logoImg.height;

      const ratio = Math.min(maxW / w, maxH / h);
      w *= ratio;
      h *= ratio;

      const x = 490 + (260 - w) / 2;
      const y = 160 + (260 - h) / 2;

      ctx.drawImage(logoImg, x, y, w, h);
      triggerDownload();
    };

    logoImg.onerror = () => {
      // Fallback if logo cannot draw due to canvas cors or base64 format issues
      // Draw placeholder text/graphic
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(490, 160, 260, 260);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "16px sans-serif";
      ctx.fillText("[ Logo visual placeholder ]", 520, 290);
      triggerDownload();
    };

    logoImg.src = logoSrc;

    function triggerDownload() {
      // Draw footer brand watermark
      ctx.fillStyle = "#64748b";
      ctx.font = "12px sans-serif";
      ctx.fillText("BoringTools Logo Meaning Explorer", 50, 490);

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `brand-audit-${auditResult.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-summary.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Downloaded PNG Summary Card!", "success");
    }
  };

  // Export 4: PDF / Styled Print Action
  const handlePrintPDF = () => {
    window.print();
  };

  // Render SVG Radar Chart for Emotion Meter
  const renderRadarChart = (emotions) => {
    if (!emotions || emotions.length === 0) return null;

    const cx = 160;
    const cy = 160;
    const r = 100;
    const numPoints = emotions.length;

    // Calculate grid lines
    const gridCircles = [0.25, 0.5, 0.75, 1];
    const gridLines = gridCircles.map((factor) => {
      const radius = r * factor;
      const points = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = i * ((2 * Math.PI) / numPoints) - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      return points.join(" ");
    });

    // Calculate axes lines and label coordinates
    const axes = [];
    const labelCoords = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = i * ((2 * Math.PI) / numPoints) - Math.PI / 2;
      // Axis line endpoint
      const endX = cx + r * Math.cos(angle);
      const endY = cy + r * Math.sin(angle);
      axes.push({ x1: cx, y1: cy, x2: endX, y2: endY });

      // Label coordinate (offset slightly outside circle)
      const labelRadius = r + 20;
      const lx = cx + labelRadius * Math.cos(angle);
      const ly = cy + labelRadius * Math.sin(angle);
      // Adjust text anchoring based on location
      let textAnchor = "middle";
      if (Math.cos(angle) > 0.1) textAnchor = "start";
      else if (Math.cos(angle) < -0.1) textAnchor = "end";

      let alignmentBaseline = "middle";
      if (Math.sin(angle) > 0.5) alignmentBaseline = "hanging";
      else if (Math.sin(angle) < -0.5) alignmentBaseline = "baseline";

      labelCoords.push({
        x: lx,
        y: ly,
        label: emotions[i].emotion,
        score: emotions[i].score,
        anchor: textAnchor,
        baseline: alignmentBaseline
      });
    }

    // Calculate filled data polygon points
    const dataPoints = emotions.map((item, i) => {
      const angle = i * ((2 * Math.PI) / numPoints) - Math.PI / 2;
      const scoreRadius = r * (item.score / 100);
      const x = cx + scoreRadius * Math.cos(angle);
      const y = cy + scoreRadius * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg viewBox="0 0 320 320" className="w-full max-w-[280px] sm:max-w-[320px] mx-auto drop-shadow-md">
        {/* Outer and Inner Hexagon Grid lines */}
        {gridLines.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1.2"
            strokeDasharray={idx < 3 ? "3 3" : "none"}
          />
        ))}

        {/* Axes lines */}
        {axes.map((axis, idx) => (
          <line
            key={idx}
            x1={axis.x1}
            y1={axis.y1}
            x2={axis.x2}
            y2={axis.y2}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}

        {/* Filled Data Area */}
        <polygon
          points={dataPoints}
          fill="rgba(245, 158, 11, 0.2)"
          stroke="var(--accent)"
          strokeWidth="2.5"
          className="transition-all duration-700 ease-in-out"
        />

        {/* Outer Data Points */}
        {emotions.map((item, i) => {
          const angle = i * ((2 * Math.PI) / numPoints) - Math.PI / 2;
          const scoreRadius = r * (item.score / 100);
          const x = cx + scoreRadius * Math.cos(angle);
          const y = cy + scoreRadius * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill="var(--accent)"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="hover:scale-125 hover:fill-amber-600 transition"
            />
          );
        })}

        {/* Labels */}
        {labelCoords.map((pt, idx) => (
          <text
            key={idx}
            x={pt.x}
            y={pt.y}
            textAnchor={pt.anchor}
            dominantBaseline={pt.baseline}
            className="text-[10px] sm:text-[11px] font-bold text-slate-700 fill-slate-700"
          >
            {pt.label} <tspan className="fill-amber-600 font-extrabold">{pt.score}%</tspan>
          </text>
        ))}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8 sm:py-12 relative print:bg-white print:p-0">
      
      {/* Dynamic print-only style tag */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 12pt;
          }
          nav, .fixed, button, input, .print\\:hidden {
            display: none !important;
          }
          .print-area {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-break-inside-avoid {
            page-break-inside: avoid !important;
          }
          .print-grid {
            display: block !important;
          }
          .print-card {
            border: 1px solid #ddd !important;
            margin-bottom: 20px !important;
            page-break-inside: avoid !important;
            background: white !important;
          }
        }
      `}</style>

      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-center gap-2 animate-bounce transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        
        {/* Tool Header */}
        <div className="mb-10 text-center print:hidden">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Logo Meaning Explorer
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Upload any logo and discover the psychology, symbolism, branding decisions, colors, typography, shapes, and emotional impact behind its design.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Upload / History Panel */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            
            {/* Upload Area */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Logo</span>
              </h2>

              {/* Drag/Drop Box */}
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? "border-amber-500 bg-amber-50/50 scale-[1.01]"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-300"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/png, image/svg+xml, image/jpeg, image/webp"
                  className="hidden"
                />

                {logoSrc ? (
                  <div className="space-y-4">
                    <img
                      src={logoSrc}
                      alt="Logo preview"
                      className="max-h-36 mx-auto object-contain rounded border border-slate-200 bg-white p-2 shadow-sm"
                    />
                    <div className="text-xs text-slate-500 truncate max-w-[200px] font-semibold">
                      {logoName}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-bold"
                    >
                      Remove Logo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-full inline-block shadow-sm border border-slate-100 text-slate-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Drag & Drop image here
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        or click to browse from device
                      </p>
                      <p className="text-[10px] font-semibold text-amber-600 mt-1 bg-amber-50 px-2 py-0.5 rounded inline-block">
                        Ctrl + V to paste any copied image
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Supported: PNG, SVG, JPG, JPEG, WebP
                    </div>
                  </div>
                )}
              </div>

              {logoSrc && !isLoading && !auditResult && (
                <button
                  onClick={handleRunAnalysis}
                  className="w-full rounded-xl bg-slate-900 hover:bg-black font-bold text-white text-sm py-3.5 shadow transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-amber-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span>Analyze Branding Symbolism</span>
                </button>
              )}

              {isLoading && (
                <div className="space-y-3 p-2 text-center">
                  <div className="relative w-10 h-10 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-100 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">Conducting Professional Audit...</p>
                    <p className="text-[11px] text-slate-500 italic max-w-[240px] mx-auto min-h-[32px] leading-relaxed">
                      {loadingStep}
                    </p>
                  </div>
                </div>
              )}

              {errorState && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
                  <p className="font-bold">Generation failed</p>
                  <p className="opacity-90">{errorState}</p>
                  <button
                    onClick={handleRunAnalysis}
                    className="mt-2 text-xs font-bold text-rose-900 underline hover:no-underline"
                  >
                    Retry Request
                  </button>
                </div>
              )}
            </div>

            {/* Audit History List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Audit History</span>
                </h3>
                <button
                  onClick={() => setFilterFavorites(!filterFavorites)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition ${
                    filterFavorites
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  ⭐ Stars Only
                </button>
              </div>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {displayedHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    {filterFavorites ? "No starred audits yet." : "No previous audits in history."}
                  </p>
                ) : (
                  displayedHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadHistoryItem(item)}
                      className={`group p-3 rounded-xl border transition flex items-center justify-between cursor-pointer text-left ${
                        activeHistoryId === item.id
                          ? "border-amber-400 bg-amber-50/30"
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <img
                          src={item.logoSrc}
                          alt=""
                          className="w-10 h-10 object-contain p-1 border border-slate-200 bg-white rounded shadow-sm"
                        />
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {item.brandName}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {item.timestamp}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className={`p-1 rounded hover:bg-slate-200/50 text-xs ${
                            item.isFavorite ? "text-amber-500" : "text-slate-400 hover:text-amber-500"
                          }`}
                        >
                          ★
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-200/50 text-xs font-bold"
                          title="Delete history entry"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Educational Banner */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-tr from-slate-900 to-slate-800 p-5 shadow-sm text-white space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Visual Branding Audit
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Visual identity communicates values faster than wording. This tool breaks down how colors target demographics, how typography evokes confidence, and how geometric outlines build emotional affinity.
              </p>
            </div>
          </div>

          {/* Right Panel: Report Dashboard */}
          <div className="lg:col-span-8 space-y-8 print-area">
            
            {!auditResult ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-4 print:hidden">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    No Audit Report Loaded
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Upload a logo file or paste an image from your clipboard, then run the analyzer to generate a complete visual branding report.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Dashboard Action Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm print:hidden">
                  <div className="flex items-center gap-3">
                    <img
                      src={logoSrc}
                      alt=""
                      className="w-12 h-12 object-contain p-1 border border-slate-200 bg-white rounded shadow-sm"
                    />
                    <div>
                      <h2 className="text-base font-black text-slate-900">
                        {auditResult.brandName}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {auditResult.logoType?.type || "Logo Audit Report"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleCopyReport}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 text-xs shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                    >
                      📋 Copy Markdown
                    </button>
                    <button
                      onClick={handleDownloadMarkdown}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 text-xs shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                    >
                      ⬇️ Download .md
                    </button>
                    <button
                      onClick={handleDownloadPNGSummary}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 text-xs shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                    >
                      🖼️ Save PNG Summary
                    </button>
                    <button
                      onClick={handlePrintPDF}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black font-bold text-white text-xs shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                    >
                      🖨️ PDF Report
                    </button>
                  </div>
                </div>

                {/* Print Title Header */}
                <div className="hidden print:block border-b pb-4 mb-6">
                  <h1 className="text-3xl font-black text-slate-900 uppercase">
                    Logo Branding Audit Report
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Audited Brand: <strong>{auditResult.brandName}</strong> | Logo Type: {auditResult.logoType?.type}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generated via BoringTools Logo Meaning Explorer on {new Date().toLocaleString()}
                  </p>
                </div>

                {/* SECTION 14: BRAND STORY GENERATOR */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 print-card">
                  <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-amber-500 text-lg">💡</span>
                    <span>1. Brand Narrative & Positioning Statement</span>
                  </h3>
                  <blockquote className="border-l-4 border-amber-400 bg-slate-50 px-5 py-4 text-slate-700 italic text-sm sm:text-base leading-relaxed rounded-r-xl">
                    "{auditResult.brandStoryGenerator}"
                  </blockquote>
                  
                  {/* Learning Mode */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleLearningMode("brandStory")}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                    >
                      {learningModes["brandStory"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                    </button>
                    {(learningModes["brandStory"] || typeof window === "undefined") && (
                      <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                        <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                        {auditResult.learningMode || "A logo represents a narrative. A good brand story builds continuity by connecting abstract geometric lines with the business's core purpose, values, or origin history."}
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid for Personality & Emotion Chart */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch print-break-inside-avoid">
                  
                  {/* SECTION 1: BRAND PERSONALITY */}
                  <div className="md:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between print-card">
                    <div className="space-y-4 w-full">
                      <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-amber-500 text-lg">👤</span>
                        <span>2. Brand Personality Traits</span>
                      </h3>
                      
                      <div className="space-y-3.5">
                        {auditResult.brandPersonality?.traits?.map((t) => (
                          <div key={t.trait} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-800">{t.trait}</span>
                              <span className="text-amber-600 font-extrabold">{t.score}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                                style={{ width: `${t.score}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed pl-1">
                              {t.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning Mode */}
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <button
                        onClick={() => toggleLearningMode("personality")}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                      >
                        {learningModes["personality"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                      </button>
                      {(learningModes["personality"] || typeof window === "undefined") && (
                        <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                          <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                          Brand personality should align exactly with client expectations. A luxury brand uses restraint and symmetry, whereas playful brands introduce organic curves and high-contrast color values.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECTION 7: EMOTION METER */}
                  <div className="md:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between print-card">
                    <div className="space-y-4">
                      <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-amber-500 text-lg">❤️</span>
                        <span>3. Emotional Perception Radar</span>
                      </h3>
                      
                      <div className="py-4 flex justify-center items-center">
                        {renderRadarChart(auditResult.emotionMeter)}
                      </div>
                    </div>

                    {/* Learning Mode */}
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <button
                        onClick={() => toggleLearningMode("emotion")}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                      >
                        {learningModes["emotion"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                      </button>
                      {(learningModes["emotion"] || typeof window === "undefined") && (
                        <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                          <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                          Logos invoke subconscious emotions. High authority is established via heavy bold glyphs or shield boundaries, while innovation is expressed through futuristic geometry, glowing accents, or asymmetry.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: COLOR PSYCHOLOGY */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 print-break-inside-avoid print-card">
                  <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-amber-500 text-lg">🎨</span>
                    <span>4. Color Psychology Audit</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {auditResult.colorPsychology?.map((c, i) => (
                      <div key={i} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => handleCopyText(c.hex, `${c.color} Hex`)}
                            className="w-12 h-12 rounded-xl shadow-sm border border-slate-200 cursor-pointer flex flex-col items-center justify-center text-[10px] font-bold select-all transition hover:scale-105"
                            style={{ backgroundColor: c.hex, color: getContrastColor(c.hex) }}
                            title="Click to copy hex code"
                          >
                            <span>Copy</span>
                            <span className="opacity-90">{c.hex}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800">{c.color}</h4>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Psychology Core
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                          <div>
                            <span className="font-bold text-slate-400 text-[10px] uppercase block">Meaning</span>
                            <span className="text-slate-800 font-semibold">{c.meaning}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-400 text-[10px] uppercase block">Emotional Impact</span>
                            <span className="text-slate-800 font-semibold">{c.emotionalImpact}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-bold text-slate-400 text-[10px] uppercase block">Common Industries</span>
                            <span className="text-slate-800 font-semibold">{c.commonIndustries}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-bold text-slate-400 text-[10px] uppercase block">Psychological Effect</span>
                            <span className="text-slate-700">{c.psychologicalEffect}</span>
                          </div>
                          <div>
                            <span className="font-bold text-emerald-600 text-[10px] uppercase block">Strength</span>
                            <span className="text-slate-700">{c.strengths}</span>
                          </div>
                          <div>
                            <span className="font-bold text-rose-600 text-[10px] uppercase block">Weakness</span>
                            <span className="text-slate-700">{c.weaknesses}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Learning Mode */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => toggleLearningMode("color")}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                    >
                      {learningModes["color"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                    </button>
                    {(learningModes["color"] || typeof window === "undefined") && (
                      <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                        <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                        Colors carry culturally learned triggers. Financial firms use blue for security, medical brands select green for rejuvenation, and active lifestyles seek red or orange to symbolize adrenaline and velocity.
                      </div>
                    )}
                  </div>
                </div>

                {/* Shape & Typography Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-break-inside-avoid">
                  
                  {/* SECTION 3: SHAPE ANALYSIS */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between print-card">
                    <div className="space-y-4">
                      <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-amber-500 text-lg">🔺</span>
                        <span>5. Geometric Shape Analysis</span>
                      </h3>

                      <div className="space-y-4">
                        {auditResult.shapeAnalysis?.map((s, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-slate-800">{s.shape}</span>
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                                s.presence === "High"
                                  ? "bg-amber-100 text-amber-800"
                                  : s.presence === "Medium"
                                  ? "bg-slate-200 text-slate-800"
                                  : "bg-slate-100 text-slate-400"
                              }`}>
                                {s.presence} Presence
                              </span>
                            </div>
                            <div className="text-xs space-y-1 text-slate-700 leading-relaxed">
                              <p><span className="font-bold text-slate-400">Communicates:</span> {s.communicates}</p>
                              <p><span className="font-bold text-slate-400">Branding Insight:</span> {s.brandingInsight}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning Mode */}
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <button
                        onClick={() => toggleLearningMode("shape")}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                      >
                        {learningModes["shape"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                      </button>
                      {(learningModes["shape"] || typeof window === "undefined") && (
                        <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                          <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                          Shapes hold ancient symbolism. Triangles represent upward motion or power; circles indicate connection, community, and infinity; squares provide boundaries and structural trust.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECTION 4: TYPOGRAPHY & LOGO TYPE */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between print-card">
                    <div className="space-y-5">
                      
                      {/* Typography section */}
                      <div className="space-y-3">
                        <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <span className="text-amber-500 text-lg">🔤</span>
                          <span>6. Typography System</span>
                        </h3>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                          <div className="text-center py-4 border border-dashed border-slate-200 bg-white rounded-lg select-none">
                            <span className="text-slate-400 text-xs font-medium block mb-1">Visual Preview</span>
                            <span
                              className="text-xl sm:text-2xl tracking-wide font-extrabold text-slate-800 truncate px-2 block"
                              style={{ fontFamily: getFontFamilyFallback(auditResult.typographyAnalysis?.style) }}
                            >
                              {auditResult.brandName}
                            </span>
                          </div>
                          <div className="text-xs space-y-1.5 text-slate-700 mt-2">
                            <p><span className="font-bold text-slate-400">Class:</span> <span className="font-semibold text-slate-900">{auditResult.typographyAnalysis?.style}</span></p>
                            <p><span className="font-bold text-slate-400">Identified Style:</span> <span className="font-semibold text-slate-900">{auditResult.typographyAnalysis?.fontNameGuess}</span></p>
                            <p><span className="font-bold text-slate-400">Atmosphere:</span> {auditResult.typographyAnalysis?.personalityCreated}</p>
                          </div>
                        </div>
                      </div>

                      {/* Logo Type section */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          7. Classification Category
                        </h3>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1.5 text-slate-700">
                          <p><span className="font-bold text-slate-400">Category:</span> <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 inline-block">{auditResult.logoType?.type}</span></p>
                          <p><span className="font-bold text-slate-400">Rationale:</span> {auditResult.logoType?.explanation}</p>
                        </div>
                      </div>

                    </div>

                    {/* Learning Mode */}
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <button
                        onClick={() => toggleLearningMode("typography")}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                      >
                        {learningModes["typography"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                      </button>
                      {(learningModes["typography"] || typeof window === "undefined") && (
                        <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                          <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                          Fonts speak louder than copy. Serif typefaces suggest tradition, heritage, and academic rigor; sans-serif signals utility, clarity, and tech-focus; scripts build human-scale intimacy.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 6: VISUAL HIERARCHY */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 print-card">
                  <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-amber-500 text-lg">⚖️</span>
                    <span>8. Visual Hierarchy & Composition Balance</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-400 text-[10px] uppercase block mb-0.5">Balance</span>
                      <span className="text-slate-800 font-semibold">{auditResult.visualHierarchy?.balance}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-400 text-[10px] uppercase block mb-0.5">Alignment</span>
                      <span className="text-slate-800 font-semibold">{auditResult.visualHierarchy?.alignment}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-400 text-[10px] uppercase block mb-0.5">Spacing</span>
                      <span className="text-slate-800 font-semibold">{auditResult.visualHierarchy?.spacing}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-400 text-[10px] uppercase block mb-0.5">Contrast</span>
                      <span className="text-slate-800 font-semibold">{auditResult.visualHierarchy?.contrast}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-400 text-[10px] uppercase block mb-0.5">Negative Space</span>
                      <span className="text-slate-800 font-semibold">{auditResult.visualHierarchy?.negativeSpace}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-400 text-[10px] uppercase block mb-0.5">Focus Point</span>
                      <span className="text-slate-800 font-semibold">{auditResult.visualHierarchy?.focusPoint}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-400 text-[10px] uppercase block mb-0.5">Simplicity</span>
                      <span className="text-slate-800 font-semibold">{auditResult.visualHierarchy?.simplicity}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-400 text-[10px] uppercase block mb-0.5">Complexity</span>
                      <span className="text-slate-800 font-semibold">{auditResult.visualHierarchy?.complexity}</span>
                    </div>
                  </div>

                  {/* Learning Mode */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => toggleLearningMode("hierarchy")}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                    >
                      {learningModes["hierarchy"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                    </button>
                    {(learningModes["hierarchy"] || typeof window === "undefined") && (
                      <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                        <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                        Visual hierarchy commands user eyes. Good alignment sets structural predictability. Contrast separates core icons from subsidiary wording. Negative space allows breathing room at tiny scale.
                      </div>
                    )}
                  </div>
                </div>

                {/* Target Audience & Positioning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-break-inside-avoid">
                  
                  {/* SECTION 8: TARGET AUDIENCE */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between print-card">
                    <div className="space-y-3">
                      <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-amber-500 text-lg">🎯</span>
                        <span>9. Target Audience Profile</span>
                      </h3>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2 text-slate-700">
                        <p><span className="font-bold text-slate-400">Demographic Segment:</span> <span className="font-bold text-slate-900 text-sm block mt-0.5">{auditResult.targetAudience?.predictedAudience}</span></p>
                        <p><span className="font-bold text-slate-400">Reasoning Details:</span> {auditResult.targetAudience?.reasoning}</p>
                      </div>
                    </div>

                    {/* Learning Mode */}
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <button
                        onClick={() => toggleLearningMode("audience")}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                      >
                        {learningModes["audience"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                      </button>
                      {(learningModes["audience"] || typeof window === "undefined") && (
                        <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                          <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                          A logo never targets "everyone." Understand the cultural indicators of your market segment. Tech buyers expect clean modular lines, while children's brands seek organic forms and primary hues.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECTION 9: BRAND POSITIONING */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between print-card">
                    <div className="space-y-3">
                      <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-amber-500 text-lg">📈</span>
                        <span>10. Brand Market Positioning</span>
                      </h3>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2 text-slate-700">
                        <p><span className="font-bold text-slate-400">Positioning Level:</span> <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 inline-block mt-0.5">{auditResult.brandPositioning?.marketSegment}</span></p>
                        <p><span className="font-bold text-slate-400">Conveyance Strategy:</span> {auditResult.brandPositioning?.reasoning}</p>
                      </div>
                    </div>

                    {/* Learning Mode */}
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <button
                        onClick={() => toggleLearningMode("positioning")}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                      >
                        {learningModes["positioning"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                      </button>
                      {(learningModes["positioning"] || typeof window === "undefined") && (
                        <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                          <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                          Value triggers are built into outlines. Premium/Luxury positioning utilizes spacious letter tracking, thin refined strokes, or monochromatic colors. Mass market brands rely on bold, dense layouts.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-break-inside-avoid">
                  
                  {/* SECTION 10: DESIGN STRENGTHS */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between print-card">
                    <div className="space-y-4">
                      <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-emerald-500 text-lg">✓</span>
                        <span>11. Key Design Strengths</span>
                      </h3>
                      <div className="space-y-3">
                        {auditResult.designStrengths?.map((s, idx) => (
                          <div key={idx} className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100 text-xs">
                            <span className="font-bold text-emerald-800 uppercase block mb-1">
                              ✦ {s.strength}
                            </span>
                            <span className="text-slate-700 leading-relaxed">
                              {s.details}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning Mode */}
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <button
                        onClick={() => toggleLearningMode("strengths")}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                      >
                        {learningModes["strengths"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                      </button>
                      {(learningModes["strengths"] || typeof window === "undefined") && (
                        <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                          <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                          A logo excels when it checks core parameters like Scalability (working as a favicon) and Timelessness (avoiding fleeting design fads like gradients that become dated quickly).
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECTION 11: IMPROVEMENT SUGGESTIONS */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between print-card">
                    <div className="space-y-4">
                      <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-amber-500 text-lg">⚠️</span>
                        <span>12. Brand Optimization Suggestions</span>
                      </h3>
                      <div className="space-y-3">
                        {auditResult.improvementSuggestions?.map((s, idx) => (
                          <div key={idx} className="p-3 bg-amber-50/30 rounded-xl border border-amber-200/40 text-xs">
                            <span className="font-bold text-amber-800 uppercase block mb-1">
                              ⚡ {s.suggestion}
                            </span>
                            <span className="text-slate-700 leading-relaxed">
                              {s.details}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning Mode */}
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <button
                        onClick={() => toggleLearningMode("improvements")}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                      >
                        {learningModes["improvements"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                      </button>
                      {(learningModes["improvements"] || typeof window === "undefined") && (
                        <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                          <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                          Design is iterative. Continuous improvements on color contrast values ensure accessibility compliance, while minor spacing alignment changes fix geometric optical illusions.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 12: STYLE COMPARISONS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 print-card">
                  <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-amber-500 text-lg">👥</span>
                    <span>13. Logo Style & Visual Equivalents</span>
                  </h3>
                  
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-3 text-slate-700">
                    <div>
                      <span className="font-bold text-slate-400 block mb-1">Visually Aligns with Styles:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {auditResult.logoStyleComparison?.similarStyles?.map((style, i) => (
                          <span key={i} className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 font-bold text-slate-600">
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p><span className="font-bold text-slate-400">Stylistic Reason:</span> {auditResult.logoStyleComparison?.explanation}</p>
                  </div>

                  {/* Learning Mode */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleLearningMode("styles")}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                    >
                      {learningModes["styles"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                    </button>
                    {(learningModes["styles"] || typeof window === "undefined") && (
                      <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                        <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                        No design exists in a vacuum. SaaS tech logos often feature abstract circular intersections, while luxury companies adopt minimalist high-symmetry symbols to establish instant prestige.
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 13: ACCESSIBILITY CHECKLIST */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 print-card">
                  <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-amber-500 text-lg">♿</span>
                    <span>14. Accessibility Audit Checklist</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {Object.entries(auditResult.accessibility || {}).map(([key, val]) => (
                      <div key={key} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                        <span className="text-emerald-600 font-extrabold text-sm mt-0.5">✓</span>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 uppercase text-[9px] tracking-wider block">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span className="text-slate-600 leading-relaxed block">
                            {val}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Learning Mode */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => toggleLearningMode("accessibility")}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                    >
                      {learningModes["accessibility"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                    </button>
                    {(learningModes["accessibility"] || typeof window === "undefined") && (
                      <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                        <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                        A beautiful logo must be functional. Ensuring high contrast ratios on light and dark screens satisfies readability conditions. A black-and-white print validation ensures correct legibility on invoice printing.
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 15: DESIGN PRINCIPLES AUDIT */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 print-card">
                  <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-amber-500 text-lg">📐</span>
                    <span>15. Design Principles Matrix</span>
                  </h3>
                  
                  <div className="p-4 bg-amber-50/20 border border-amber-200/50 rounded-xl text-xs">
                    <span className="font-bold text-amber-900 uppercase block mb-1">Overall Design Verdict</span>
                    <span className="text-slate-700 leading-relaxed">{auditResult.designPrinciples?.verdict}</span>
                  </div>

                  <div className="space-y-3">
                    {auditResult.designPrinciples?.principles?.map((p, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                        <div className="space-y-0.5 sm:max-w-[75%]">
                          <span className="font-bold text-slate-800 block">{p.principle}</span>
                          <span className="text-slate-600 leading-relaxed block">{p.explanation}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] text-center uppercase tracking-wider self-start sm:self-center ${
                          p.status === "Excellent"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : p.status === "Average"
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Learning Mode */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => toggleLearningMode("principles")}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                    >
                      {learningModes["principles"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                    </button>
                    {(learningModes["principles"] || typeof window === "undefined") && (
                      <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                        <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                        Design systems rely on rules. Consistency in line weight ensures elements look like they belong together. Contrast prevents elements from blending in, and simplicity anchors visual memory.
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 17: HISTORY EVOLUTION MODE (Only if recognized/famous) */}
                {auditResult.historyMode?.isFamous && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 print-card">
                    <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="text-amber-500 text-lg">⏳</span>
                      <span>16. Brand Evolution Timeline</span>
                    </h3>
                    
                    <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 mt-4 ml-2">
                      {auditResult.historyMode.evolution?.map((evo, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[31px] top-1.5 w-4 h-4 bg-amber-500 rounded-full border-4 border-white shadow-sm" />
                          <div className="space-y-1.5 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                                {evo.year}
                              </span>
                              <h4 className="font-black text-slate-800">
                                {evo.event}
                              </h4>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                              {evo.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Learning Mode */}
                    <div className="pt-2 border-t border-slate-100 mt-4">
                      <button
                        onClick={() => toggleLearningMode("history")}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 focus:outline-none print:hidden"
                      >
                        {learningModes["history"] ? "▼ Hide Branding Insight" : "▶ What can designers learn?"}
                      </button>
                      {(learningModes["history"] || typeof window === "undefined") && (
                        <div className="mt-2.5 p-3.5 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-700 leading-relaxed">
                          <p className="font-bold text-amber-800 mb-1">Takeaway:</p>
                          Famous brands iterate rather than rebuild. Rebrandings occur when companies pivot their business models (e.g. Starbucks dropping "Coffee" when expanding products), or to simplify logos for high density mobile screens.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Start Over Button */}
                <div className="text-center pt-4 print:hidden">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl border border-slate-300 hover:border-slate-400 font-bold text-slate-700 text-sm shadow-sm transition hover:bg-slate-50 cursor-pointer"
                  >
                    Start Over / Audit Another Logo
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

// Helper to determine readable color on active backgrounds
function getContrastColor(hex) {
  if (!hex) return "#000000";
  const color = hex.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#1a1a1a" : "#ffffff";
}

// Helper to get fallback fonts representing style categories
function getFontFamilyFallback(style) {
  switch (style) {
    case "Serif":
      return "Georgia, 'Times New Roman', serif";
    case "Script":
      return "'Brush Script MT', cursive";
    case "Display":
      return "Impact, Haettenschweiler, sans-serif";
    case "Monospace":
      return "Courier, monospace";
    case "Sans Serif":
    default:
      return "var(--font-sans), 'Helvetica Neue', Arial, sans-serif";
  }
}

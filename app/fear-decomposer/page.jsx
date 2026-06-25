"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ComingSoon from "@/app/components/ComingSoon";

// Set to "live" to deploy and enable routing
const TOOL_STATUS = "upcoming";

// Presets data for the Fear Decomposer
const PRESETS = [
  {
    title: "Starting a company",
    fear: "Starting a startup software company",
    realRisks: [
      "Financial loss of my initial $15,000 personal savings.",
      "Opportunity cost of 12 months of missed corporate salary.",
      "Increased stress levels and reduced personal free time during launch."
    ],
    imaginedRisks: [
      "Failing will ruin my reputation and make me permanently unemployable.",
      "Going completely bankrupt, losing my apartment, and ending up on the streets.",
      "Being ridiculed publicly by former colleagues and friends."
    ],
    controllableFactors: [
      "The exact amount of capital I risk (budgeting a hard financial limit).",
      "Validating demand with customer interviews before quitting my day job.",
      "Maintaining a healthy sleep, eating, and exercise routine."
    ],
    uncontrollableFactors: [
      "Broader economic downturns and market fluctuations.",
      "Actions, product features, and pricing strategies of competitor companies.",
      "The time it takes to get regulatory or platform approvals."
    ],
    worstCase: "The startup fails after 12 months. I lose my $15,000 budget and have to spend 2 months interviewing to get another job. I am back to my original salary but have gained invaluable hands-on product and leadership experience.",
    firstStep: "Draft a one-page landing page outline and talk to 5 target customers this weekend."
  },
  {
    title: "Giving an interview",
    fear: "Interviews for a senior role at a top-tier tech company",
    realRisks: [
      "Not receiving a job offer and having to continue searching.",
      "Feeling embarrassed if I fail to answer a highly technical question."
    ],
    imaginedRisks: [
      "The interviewers will mock me and think I'm a complete fraud.",
      "Failing this interview means I am not good enough for my industry.",
      "I will freeze up, panic, and be unable to speak at all."
    ],
    controllableFactors: [
      "Preparing stories for common behavioral questions using the STAR method.",
      "Conducting mock interviews with peers or on prep platforms.",
      "Researching the company's recent engineering blogs and business challenges."
    ],
    uncontrollableFactors: [
      "The specific questions or coding challenges the interviewers choose.",
      "The mood, biases, or personalities of the interviewers on that day.",
      "The qualifications and performance of other applicants in the pipeline."
    ],
    worstCase: "I get stuck on a coding question and perform poorly. I receive a rejection email a few days later. I feel disappointed for a weekend, then I request feedback, refine my prep, and apply to other companies.",
    firstStep: "Spend 30 minutes solving a simple problem and practicing explaining the solution out loud."
  },
  {
    title: "Speaking publicly",
    fear: "Giving a 15-minute presentation to a 100-person audience",
    realRisks: [
      "Forgetting my notes or stuttering for a brief moment.",
      "Experiencing technical issues with the projector or microphone.",
      "Being unable to answer a specific follow-up question immediately."
    ],
    imaginedRisks: [
      "The entire audience will notice my hands shaking and laugh at me.",
      "My mind will go blank and I will run off the stage in tears.",
      "A bad presentation will destroy my professional credibility forever."
    ],
    controllableFactors: [
      "Rehearsing my slides at least 5 times out loud, timing each section.",
      "Arriving 30 minutes early to test the slide clicker and audio setup.",
      "Preparing a brief physical outline or note cards as a backup."
    ],
    uncontrollableFactors: [
      "The exact number of people who show up to the room.",
      "Audience members looking at their phones or yawning (not about me).",
      "Any unexpected environmental noise or fire alarm tests."
    ],
    worstCase: "I lose my train of thought, pause awkwardly for 10 seconds, then use my notes to get back on track. My presentation is a bit dry, but I finish it. Nobody laughs; they clap politely, and the day moves on.",
    firstStep: "Record a video of myself presenting the first 2 minutes on my phone and watch it to assess my pacing."
  }
];

const LOADING_STEPS = [
  "Mapping situational context...",
  "Calibrating threat magnitudes...",
  "Isolating rational risks from emotional amplifiers...",
  "Evaluating your sphere of control...",
  "Structuring defensive recovery protocols...",
  "Formulating low-friction micro-actions..."
];

export default function FearDecomposerPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Fear Decomposer" />;
  }

  // Input states
  const [fear, setFear] = useState("");
  const [realRisks, setRealRisks] = useState([]);
  const [imaginedRisks, setImaginedRisks] = useState([]);
  const [controllableFactors, setControllableFactors] = useState([]);
  const [uncontrollableFactors, setUncontrollableFactors] = useState([]);
  const [worstCase, setWorstCase] = useState("");
  const [firstStep, setFirstStep] = useState("");

  // Temp input states for list additions
  const [tempRealRisk, setTempRealRisk] = useState("");
  const [tempImaginedRisk, setTempImaginedRisk] = useState("");
  const [tempControllable, setTempControllable] = useState("");
  const [tempUncontrollable, setTempUncontrollable] = useState("");

  // Loading & generation states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);
  const loadingTimerRef = useRef(null);

  // Clean toast and timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (loadingTimerRef.current) window.clearInterval(loadingTimerRef.current);
    };
  }, []);

  // Animate loading messages
  useEffect(() => {
    if (isLoading) {
      setLoadingStepIndex(0);
      loadingTimerRef.current = window.setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 1500);
    } else {
      if (loadingTimerRef.current) {
        window.clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }
  }, [isLoading]);

  const showToast = (type, message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 2000);
  };

  // Preset loader
  const handleLoadPreset = (preset) => {
    setFear(preset.fear);
    setRealRisks(preset.realRisks);
    setImaginedRisks(preset.imaginedRisks);
    setControllableFactors(preset.controllableFactors);
    setUncontrollableFactors(preset.uncontrollableFactors);
    setWorstCase(preset.worstCase);
    setFirstStep(preset.firstStep);
    showToast("success", `Loaded preset: "${preset.title}"`);
  };

  // Handlers to add items to lists
  const handleAddRealRisk = (e) => {
    e.preventDefault();
    if (!tempRealRisk.trim()) return;
    setRealRisks([...realRisks, tempRealRisk.trim()]);
    setTempRealRisk("");
  };

  const handleAddImaginedRisk = (e) => {
    e.preventDefault();
    if (!tempImaginedRisk.trim()) return;
    setImaginedRisks([...imaginedRisks, tempImaginedRisk.trim()]);
    setTempImaginedRisk("");
  };

  const handleAddControllable = (e) => {
    e.preventDefault();
    if (!tempControllable.trim()) return;
    setControllableFactors([...controllableFactors, tempControllable.trim()]);
    setTempControllable("");
  };

  const handleAddUncontrollable = (e) => {
    e.preventDefault();
    if (!tempUncontrollable.trim()) return;
    setUncontrollableFactors([...uncontrollableFactors, tempUncontrollable.trim()]);
    setTempUncontrollable("");
  };

  // Handlers to remove items from lists
  const handleRemoveRealRisk = (index) => {
    setRealRisks(realRisks.filter((_, i) => i !== index));
  };

  const handleRemoveImaginedRisk = (index) => {
    setImaginedRisks(imaginedRisks.filter((_, i) => i !== index));
  };

  const handleRemoveControllable = (index) => {
    setControllableFactors(controllableFactors.filter((_, i) => i !== index));
  };

  const handleRemoveUncontrollable = (index) => {
    setUncontrollableFactors(uncontrollableFactors.filter((_, i) => i !== index));
  };

  // API Call for dynamic decomposition
  const handleDecompose = async () => {
    if (!fear.trim()) {
      showToast("error", "Please enter a fear or project description first.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/fear-decomposer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fear: fear.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze fear.");
      }

      const data = await response.json();
      setRealRisks(data.realRisks || []);
      setImaginedRisks(data.imaginedRisks || []);
      setControllableFactors(data.controllableFactors || []);
      setUncontrollableFactors(data.uncontrollableFactors || []);
      setWorstCase(data.worstCase || "");
      setFirstStep(data.firstStep || "");
      showToast("success", "Fear successfully deconstructed!");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Error analyzing fear.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset/Clear all inputs
  const handleClear = () => {
    setFear("");
    setRealRisks([]);
    setImaginedRisks([]);
    setControllableFactors([]);
    setUncontrollableFactors([]);
    setWorstCase("");
    setFirstStep("");
    showToast("success", "Fear analysis cleared.");
  };

  // Text Report Generator
  const reportText = useMemo(() => {
    const timestamp = new Date().toLocaleString();
    const cleanFear = fear.trim() || "Unspecified Fear";
    const cleanWorst = worstCase.trim() || "Not specified";
    const cleanStep = firstStep.trim() || "Not specified";

    const formatList = (list) => {
      if (list.length === 0) return "  (None added)";
      return list.map((item, idx) => `  ${idx + 1}. ${item}`).join("\n");
    };

    return `==================================================
              FEAR DECOMPOSER REPORT
              Generated: ${timestamp}
==================================================

OBJECTIVE / FEAR DESCRIPTION
--------------------------------------------------
${cleanFear}

1. REAL RISKS
--------------------------------------------------
${formatList(realRisks)}

2. IMAGINED RISKS
--------------------------------------------------
${formatList(imaginedRisks)}

3. CONTROLLABLE FACTORS (How to prevent or prepare)
--------------------------------------------------
${formatList(controllableFactors)}

4. UNCONTROLLABLE FACTORS (To accept or delegate)
--------------------------------------------------
${formatList(uncontrollableFactors)}

5. WORST CASE SCENARIO & RECOVERY PLAN
--------------------------------------------------
${cleanWorst}

6. FIRST SMALL STEP (Immediate action)
--------------------------------------------------
${cleanStep}

--------------------------------------------------
Generated client-side via Boring Tools.
==================================================`;
  }, [fear, realRisks, imaginedRisks, controllableFactors, uncontrollableFactors, worstCase, firstStep]);

  // Actions
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
    
    const slug = (fear.trim() || "fear-analysis")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 30);
    
    link.download = `fear-decomposer-${slug}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showToast("success", "Report downloaded successfully.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative">
      
      {/* Toast Alert */}
      {toast.message && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 animate-slide-in ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.type === "success" ? (
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center gap-4 animate-scale-up">
            <div className="relative flex items-center justify-center w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Decomposing Fear</h3>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Please wait while logic reframes anxiety</p>
            </div>
            <div className="h-10 flex items-center justify-center">
              <p className="text-sm font-medium text-slate-600 transition-all duration-300">
                {LOADING_STEPS[loadingStepIndex]}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6 my-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600 font-bold">Productivity Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Fear Decomposer</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Break down intimidating obstacles into manageable risks. Separate real threats from imagined anxieties, outline what you control, and identify your immediate first step.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Load a demo preset to see how it works</p>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.title}
                onClick={() => handleLoadPreset(preset)}
                className="bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 border border-slate-200 hover:border-orange-200 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Workspace Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Editor Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Analysis Inputs</span>
              </h2>
              <button
                onClick={handleClear}
                className="text-xs font-semibold text-slate-500 hover:text-orange-600 transition"
              >
                Clear Workspace
              </button>
            </div>

            {/* Fear Description & Decompose Button */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-bold text-slate-900">
                What is the fear or project?
              </label>
              <textarea
                rows={3}
                value={fear}
                onChange={(e) => setFear(e.target.value)}
                placeholder="e.g., Starting a software company, giving a keynote presentation..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
              />
              <button
                type="button"
                onClick={handleDecompose}
                disabled={!fear.trim() || isLoading}
                className="w-full bg-slate-900 hover:bg-orange-500 disabled:bg-slate-200 text-white disabled:text-slate-400 py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition shadow-sm hover:shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Decompose Fear with AI</span>
              </button>
            </div>

            {/* Custom Modifiers Header */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
              <h3 className="text-sm font-bold text-slate-800">Fine-tune details manually</h3>
              <p className="text-xs text-slate-500">Edit or expand on the generated fields below</p>
            </div>

            {/* Risks Block */}
            <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-4 bg-slate-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Decompose Risks</span>
              
              {/* Real Risks Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Real Risks (Physical, financial, or time losses)</label>
                <form onSubmit={handleAddRealRisk} className="flex gap-2">
                  <input
                    type="text"
                    value={tempRealRisk}
                    onChange={(e) => setTempRealRisk(e.target.value)}
                    placeholder="Add a real risk..."
                    className="flex-1 rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-orange-600 text-white px-3 rounded-lg text-sm font-bold transition cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Imagined Risks Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Imagined Risks (Worst anxiety, shame, or collapse)</label>
                <form onSubmit={handleAddImaginedRisk} className="flex gap-2">
                  <input
                    type="text"
                    value={tempImaginedRisk}
                    onChange={(e) => setTempImaginedRisk(e.target.value)}
                    placeholder="Add an imagined risk..."
                    className="flex-1 rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-orange-600 text-white px-3 rounded-lg text-sm font-bold transition cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>

            {/* Factors Block */}
            <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-4 bg-slate-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Determine Control</span>

              {/* Controllable Factors Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Controllable Factors (Your prep, safeguards, habits)</label>
                <form onSubmit={handleAddControllable} className="flex gap-2">
                  <input
                    type="text"
                    value={tempControllable}
                    onChange={(e) => setTempControllable(e.target.value)}
                    placeholder="Add controllable factor..."
                    className="flex-1 rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-orange-600 text-white px-3 rounded-lg text-sm font-bold transition cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Uncontrollable Factors Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Uncontrollable Factors (Markets, weather, other people)</label>
                <form onSubmit={handleAddUncontrollable} className="flex gap-2">
                  <input
                    type="text"
                    value={tempUncontrollable}
                    onChange={(e) => setTempUncontrollable(e.target.value)}
                    placeholder="Add uncontrollable factor..."
                    className="flex-1 rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-orange-600 text-white px-3 rounded-lg text-sm font-bold transition cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>

            {/* Worst Case & Mitigation */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-900">Worst Case Scenario & Recovery Plan</label>
              <textarea
                rows={3}
                value={worstCase}
                onChange={(e) => setWorstCase(e.target.value)}
                placeholder="What is the absolute baseline outcome if this fails completely? How will you rebuild or recover?"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
              />
            </div>

            {/* First Small Step */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-900">First Small Step</label>
              <textarea
                rows={2}
                value={firstStep}
                onChange={(e) => setFirstStep(e.target.value)}
                placeholder="What is an immediate, low-stress, 15-minute action you can take to make progress?"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
              />
            </div>
          </div>

          {/* Visualization Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Deconstructed Fear Board</span>
                </h2>
                <p className="text-xs text-slate-500">Live breakdown of your cognitive map</p>
              </div>

              {/* Actions row */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopyReport}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Report
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 px-3 py-2 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </button>
              </div>
            </div>

            {/* Target Fear Title Banner */}
            <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-md flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-y-2 translate-x-2">
                <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </div>
              <div className="z-10 w-full font-sans">
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Target Obstacle</span>
                <h3 className="text-lg font-bold tracking-tight mt-1 leading-snug break-words">
                  {fear.trim() ? fear.trim() : "Explain your fear in the inputs panel..."}
                </h3>
              </div>
            </div>

            {/* 6 Sections Visualization Layout */}
            <div className="flex flex-col gap-6">
              
              {/* Row 1: Risks Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Real Risks Card */}
                <div className="border border-indigo-100 bg-indigo-50/20 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[160px] group transition-all duration-200 hover:shadow">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5 font-sans font-bold">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                        Real Risks
                      </span>
                      <span className="text-xs text-indigo-500 font-semibold">{realRisks.length} item(s)</span>
                    </div>
                    {realRisks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No real risks added yet. These represent true potential losses or setbacks.</p>
                    ) : (
                      <ul className="space-y-2">
                        {realRisks.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-800 flex items-start justify-between gap-2 bg-white p-2 rounded-lg border border-indigo-100/60">
                            <span className="leading-relaxed break-words pr-2">{item}</span>
                            <button
                              onClick={() => handleRemoveRealRisk(idx)}
                              className="text-slate-400 hover:text-red-500 text-[10px] font-bold px-1 transition shrink-0 cursor-pointer"
                              title="Delete item"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Imagined Risks Card */}
                <div className="border border-fuchsia-100 bg-fuchsia-50/20 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[160px] group transition-all duration-200 hover:shadow">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-700 flex items-center gap-1.5 font-sans font-bold">
                        <span className="w-1.5 h-1.5 bg-fuchsia-600 rounded-full" />
                        Imagined Risks
                      </span>
                      <span className="text-xs text-fuchsia-500 font-semibold">{imaginedRisks.length} item(s)</span>
                    </div>
                    {imaginedRisks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No imagined risks. These are catastrophic scenarios fueled by shame or exaggeration.</p>
                    ) : (
                      <ul className="space-y-2">
                        {imaginedRisks.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-800 flex items-start justify-between gap-2 bg-white p-2 rounded-lg border border-fuchsia-100/60">
                            <span className="leading-relaxed break-words pr-2">{item}</span>
                            <button
                              onClick={() => handleRemoveImaginedRisk(idx)}
                              className="text-slate-400 hover:text-red-500 text-[10px] font-bold px-1 transition shrink-0 cursor-pointer"
                              title="Delete item"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Control Check */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Controllable Factors Card */}
                <div className="border border-emerald-100 bg-emerald-50/20 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[160px] group transition-all duration-200 hover:shadow">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 font-sans font-bold">
                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                        Controllable Factors
                      </span>
                      <span className="text-xs text-emerald-500 font-semibold">{controllableFactors.length} item(s)</span>
                    </div>
                    {controllableFactors.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No controllable factors yet. List things you can actively influence, prepare, or safeguard.</p>
                    ) : (
                      <ul className="space-y-2">
                        {controllableFactors.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-800 flex items-start justify-between gap-2 bg-white p-2 rounded-lg border border-emerald-100/60">
                            <span className="leading-relaxed flex gap-1.5 items-start break-words pr-2">
                              <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{item}</span>
                            </span>
                            <button
                              onClick={() => handleRemoveControllable(idx)}
                              className="text-slate-400 hover:text-red-500 text-[10px] font-bold px-1 transition shrink-0 cursor-pointer"
                              title="Delete item"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Uncontrollable Factors Card */}
                <div className="border border-amber-100 bg-amber-50/20 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[160px] group transition-all duration-200 hover:shadow">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5 font-sans font-bold">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                        Uncontrollable Factors
                      </span>
                      <span className="text-xs text-amber-500 font-semibold">{uncontrollableFactors.length} item(s)</span>
                    </div>
                    {uncontrollableFactors.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No uncontrollable factors. List things outside your hands that you must prepare to accept or delegate.</p>
                    ) : (
                      <ul className="space-y-2">
                        {uncontrollableFactors.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-800 flex items-start justify-between gap-2 bg-white p-2 rounded-lg border border-amber-100/60">
                            <span className="leading-relaxed flex gap-1.5 items-start break-words pr-2">
                              <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>{item}</span>
                            </span>
                            <button
                              onClick={() => handleRemoveUncontrollable(idx)}
                              className="text-slate-400 hover:text-red-500 text-[10px] font-bold px-1 transition shrink-0 cursor-pointer"
                              title="Delete item"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Worst Case Scenario & Mitigation Card */}
              <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2 font-sans font-bold">
                  <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Worst Case Scenario & Recovery Plan
                </span>
                <p className="text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 break-words">
                  {worstCase.trim() ? worstCase.trim() : "What will you do if the absolute worst happens? (e.g. Failure, loss of funds). Write down a plan to show yourself that failure is temporary and recoverable."}
                </p>
              </div>

              {/* Row 4: First Small Step Highlight Card */}
              <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-5 shadow-md group transition duration-300">
                <div className="absolute right-0 bottom-0 opacity-[0.08] pointer-events-none translate-y-4 translate-x-4 scale-125">
                  <svg className="w-40 h-40 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div className="relative z-10 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-100 font-sans">First Small Step</span>
                  <h4 className="text-xl font-black tracking-tight leading-snug break-words">
                    {firstStep.trim() ? firstStep.trim() : "Outline a 15-minute action to overcome initial inertia..."}
                  </h4>
                  <p className="text-xs text-orange-50/80 leading-relaxed">
                    By committing to a small, immediate action, you break the cycle of overthinking and begin building positive momentum.
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

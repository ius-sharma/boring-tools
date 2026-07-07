"use client";

import { useState, useEffect, useMemo } from "react";

export default function CgpaTargetPlanner() {
  const [scale, setScale] = useState(10); // 10 or 4
  const [useCredits, setUseCredits] = useState(false); // Enable credit-weighted calculation

  // Basic Inputs
  const [currentCgpaInput, setCurrentCgpaInput] = useState("7.50");
  const [targetCgpaInput, setTargetCgpaInput] = useState("8.50");
  const [completedSems, setCompletedSems] = useState(4);
  const [totalSems, setTotalSems] = useState(8);

  // Default credits inputs (only used to initialize or if user checks useCredits)
  const [currentSemCreditsInput, setCurrentSemCreditsInput] = useState("20");
  const [futureSemCreditsInput, setFutureSemCreditsInput] = useState("20");

  // Planner States
  const [semesterSgpas, setSemesterSgpas] = useState([]);
  const [semesterCredits, setSemesterCredits] = useState([]);
  const [editedFutureSemesters, setEditedFutureSemesters] = useState([]); // indices
  const [autoDistribute, setAutoDistribute] = useState(true);

  // What-If Simulator state
  const [simulatorSgpa, setSimulatorSgpa] = useState(8.5);

  // Saved plans state
  const [savedPlans, setSavedPlans] = useState([]);
  const [newPlanName, setNewPlanName] = useState("");
  const [activePlanId, setActivePlanId] = useState(null);

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Sync title
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "CGPA Target Planner | Boring Tools";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  // Fetch saved plans on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("boring_cgpa_plans");
      if (stored) {
        setSavedPlans(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved plans", e);
    }
  }, []);

  // Show Toast Helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Re-initialize planner SGPAs and Credits when basic configuration changes
  useEffect(() => {
    const defaultSgpa = parseFloat(currentCgpaInput) || (scale === 10 ? 7.5 : 3.0);
    const completed = Math.min(completedSems, totalSems);
    
    // Build default credits array
    const creditsArr = [];
    const currentCredits = parseFloat(currentSemCreditsInput) || 20;
    const futureCredits = parseFloat(futureSemCreditsInput) || 20;

    for (let i = 0; i < totalSems; i++) {
      if (i < completed) {
        creditsArr.push(futureCredits); // default past credits
      } else if (i === completed) {
        creditsArr.push(currentCredits); // current sem credits
      } else {
        creditsArr.push(futureCredits); // future sem credits
      }
    }

    // Build default SGPAs array
    const sgpasArr = [];
    for (let i = 0; i < totalSems; i++) {
      if (i < completed) {
        sgpasArr.push(defaultSgpa);
      } else {
        sgpasArr.push(defaultSgpa); // placeholder, will be calculated next
      }
    }

    setSemesterCredits(creditsArr);
    setSemesterSgpas(sgpasArr);
    setEditedFutureSemesters([]);
    setActivePlanId(null);
  }, [totalSems, completedSems, scale]);

  // Handle Current CGPA and Target CGPA changes
  // Setting the current CGPA sets the completed semesters' SGPAs to that CGPA.
  const handleCurrentCgpaChange = (valStr) => {
    setCurrentCgpaInput(valStr);
    const val = parseFloat(valStr) || 0;
    setSemesterSgpas((prev) => {
      const copy = [...prev];
      const completed = Math.min(completedSems, totalSems);
      for (let i = 0; i < completed; i++) {
        copy[i] = val;
      }
      return copy;
    });
  };

  // Switch scale between 10.0 and 4.0
  const handleScaleChange = (newScale) => {
    if (newScale === scale) return;
    setScale(newScale);
    if (newScale === 10) {
      setCurrentCgpaInput("7.50");
      setTargetCgpaInput("8.50");
      setSimulatorSgpa(8.5);
    } else {
      setCurrentCgpaInput("3.00");
      setTargetCgpaInput("3.50");
      setSimulatorSgpa(3.5);
    }
  };

  // Convert inputs
  const currentCgpa = parseFloat(currentCgpaInput) || 0;
  const targetCgpa = parseFloat(targetCgpaInput) || 0;

  // Perform core calculations and auto-distribution
  const calculations = useMemo(() => {
    const completed = Math.min(completedSems, totalSems);
    const remainingSems = totalSems - completed;

    if (totalSems <= 0) return null;

    // 1. Calculate past points
    let completedCreditsSum = 0;
    let completedPointsSum = 0;
    for (let i = 0; i < completed; i++) {
      const cred = useCredits ? (semesterCredits[i] || 20) : 20;
      const sgpa = semesterSgpas[i] || 0;
      completedCreditsSum += cred;
      completedPointsSum += sgpa * cred;
    }

    // Actual current CGPA (weighted)
    const actualCurrentCgpa = completedCreditsSum > 0 ? completedPointsSum / completedCreditsSum : currentCgpa;

    // 2. Calculate target points
    let totalCreditsSum = 0;
    for (let i = 0; i < totalSems; i++) {
      totalCreditsSum += useCredits ? (semesterCredits[i] || 20) : 20;
    }
    const targetPoints = targetCgpa * totalCreditsSum;

    // 3. Points needed from future semesters
    const futurePointsNeeded = targetPoints - completedPointsSum;

    // 4. Calculate credits for future semesters
    let futureCreditsSum = 0;
    for (let i = completed; i < totalSems; i++) {
      futureCreditsSum += useCredits ? (semesterCredits[i] || 20) : 20;
    }

    // Required Average SGPA for all remaining semesters
    const requiredAverageSgpa = futureCreditsSum > 0 ? futurePointsNeeded / futureCreditsSum : 0;

    // 5. Auto-distribute targets across unedited semesters
    let finalSgpas = [...semesterSgpas];
    let isImpossible = false;
    let requiredUneditedSgpa = 0;

    if (remainingSems > 0) {
      const editedIndices = editedFutureSemesters.filter((idx) => idx >= completed && idx < totalSems);
      const uneditedIndices = [];
      for (let i = completed; i < totalSems; i++) {
        if (!editedIndices.includes(i)) {
          uneditedIndices.push(i);
        }
      }

      if (autoDistribute && uneditedIndices.length > 0) {
        // Calculate points in edited future semesters
        let editedPoints = 0;
        for (const idx of editedIndices) {
          editedPoints += (semesterSgpas[idx] || 0) * (useCredits ? (semesterCredits[idx] || 20) : 20);
        }

        // Points left for unedited semesters
        const uneditedPointsNeeded = futurePointsNeeded - editedPoints;
        let uneditedCreditsSum = 0;
        for (const idx of uneditedIndices) {
          uneditedCreditsSum += useCredits ? (semesterCredits[idx] || 20) : 20;
        }

        requiredUneditedSgpa = uneditedCreditsSum > 0 ? uneditedPointsNeeded / uneditedCreditsSum : 0;

        // Apply to unedited semesters
        for (const idx of uneditedIndices) {
          finalSgpas[idx] = Math.max(0, requiredUneditedSgpa);
        }

        if (requiredUneditedSgpa > scale || requiredUneditedSgpa < 0) {
          isImpossible = true;
        }
      } else {
        // Manual planning: finalSgpas is just what's in state
        requiredUneditedSgpa = requiredAverageSgpa;
      }
    }

    // 6. Calculate Final CGPA with currently planned SGPAs
    let plannedPointsSum = 0;
    for (let i = 0; i < totalSems; i++) {
      plannedPointsSum += (finalSgpas[i] || 0) * (useCredits ? (semesterCredits[i] || 20) : 20);
    }
    const plannedFinalCgpa = totalCreditsSum > 0 ? plannedPointsSum / totalCreditsSum : 0;
    const gapRemaining = targetCgpa - actualCurrentCgpa;
    const plannedGap = targetCgpa - plannedFinalCgpa;

    // Progress percentage
    const progressPercent = totalSems > 0 ? Math.min(100, Math.round((completed / totalSems) * 100)) : 0;

    // Target Difficulty classification
    const reqSgpaToEvaluate = autoDistribute && remainingSems > 1 && editedFutureSemesters.length < remainingSems
      ? requiredUneditedSgpa
      : requiredAverageSgpa;

    let difficulty = "Moderate";
    let difficultyColor = "text-amber-600 bg-amber-50 border-amber-200";

    if (remainingSems === 0) {
      difficulty = "Completed";
      difficultyColor = "text-slate-600 bg-slate-100 border-slate-200";
    } else if (reqSgpaToEvaluate > scale) {
      difficulty = "Mathematically Impossible";
      difficultyColor = "text-red-600 bg-red-50 border-red-200 animate-pulse";
    } else if (reqSgpaToEvaluate <= 0) {
      difficulty = "Already Achieved";
      difficultyColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
    } else {
      const ratio = reqSgpaToEvaluate / scale;
      if (ratio < 0.7) {
        difficulty = "Easy";
        difficultyColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
      } else if (ratio < 0.8) {
        difficulty = "Moderate";
        difficultyColor = "text-amber-600 bg-amber-50 border-amber-200";
      } else if (ratio < 0.9) {
        difficulty = "Hard";
        difficultyColor = "text-orange-600 bg-orange-50 border-orange-200";
      } else if (ratio < 0.98) {
        difficulty = "Very Difficult";
        difficultyColor = "text-red-500 bg-red-50 border-red-100";
      } else {
        difficulty = "Almost Impossible";
        difficultyColor = "text-red-700 bg-red-100 border-red-300";
      }
    }

    return {
      actualCurrentCgpa,
      requiredAverageSgpa,
      requiredUneditedSgpa,
      remainingSems,
      totalCreditsSum,
      completedCreditsSum,
      plannedFinalCgpa,
      gapRemaining,
      plannedGap,
      progressPercent,
      difficulty,
      difficultyColor,
      isImpossible,
      finalSgpas
    };
  }, [completedSems, totalSems, semesterSgpas, semesterCredits, editedFutureSemesters, autoDistribute, currentCgpaInput, targetCgpaInput, scale, useCredits]);

  // Update a single semester's SGPA
  const updateSemesterSgpa = (index, value) => {
    const val = Math.max(0, Math.min(scale, parseFloat(value) || 0));
    
    setSemesterSgpas((prev) => {
      const nextSgpas = [...prev];
      nextSgpas[index] = val;
      
      const completed = Math.min(completedSems, totalSems);
      if (index < completed) {
        let compPts = 0;
        let compCred = 0;
        for (let i = 0; i < completed; i++) {
          const cred = useCredits ? (semesterCredits[i] || 20) : 20;
          const sgpa = nextSgpas[i];
          compPts += sgpa * cred;
          compCred += cred;
        }
        const newAvg = compCred > 0 ? (compPts / compCred).toFixed(2) : "0.00";
        setCurrentCgpaInput(newAvg);
      }
      
      return nextSgpas;
    });

    const completed = Math.min(completedSems, totalSems);
    if (index >= completed) {
      if (!editedFutureSemesters.includes(index)) {
        setEditedFutureSemesters((prev) => [...prev, index]);
      }
    }
  };

  // Update a single semester's credits
  const updateSemesterCredits = (index, value) => {
    const val = Math.max(1, parseInt(value) || 1);
    setSemesterCredits((prev) => {
      const nextCredits = [...prev];
      nextCredits[index] = val;
      
      const completed = Math.min(completedSems, totalSems);
      if (index < completed) {
        let compPts = 0;
        let compCred = 0;
        for (let i = 0; i < completed; i++) {
          const cred = nextCredits[i] || 20;
          const sgpa = semesterSgpas[i] || 0;
          compPts += sgpa * cred;
          compCred += cred;
        }
        const newAvg = compCred > 0 ? (compPts / compCred).toFixed(2) : "0.00";
        setCurrentCgpaInput(newAvg);
      }
      
      return nextCredits;
    });
  };

  // Reset custom future edits
  const resetFuturePlannerEdits = () => {
    setEditedFutureSemesters([]);
    showToast("Planner targets reset to default required average.", "success");
  };

  // Save Plan locally
  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!newPlanName.trim()) {
      showToast("Please enter a name for the plan.", "error");
      return;
    }

    const planId = activePlanId || Date.now().toString();
    const newPlan = {
      id: planId,
      name: newPlanName.trim(),
      scale,
      useCredits,
      currentCgpa: currentCgpaInput,
      targetCgpa: targetCgpaInput,
      completedSems,
      totalSems,
      semesterSgpas: calculations ? calculations.finalSgpas : semesterSgpas,
      semesterCredits,
      editedFutureSemesters,
      autoDistribute,
      timestamp: new Date().toLocaleString()
    };

    let updatedPlans = [];
    if (activePlanId) {
      updatedPlans = savedPlans.map((p) => (p.id === activePlanId ? newPlan : p));
      showToast("Plan updated successfully!", "success");
    } else {
      updatedPlans = [...savedPlans, newPlan];
      showToast("Plan saved successfully!", "success");
    }

    setSavedPlans(updatedPlans);
    localStorage.setItem("boring_cgpa_plans", JSON.stringify(updatedPlans));
    setNewPlanName("");
    setActivePlanId(null);
  };

  // Load plan
  const handleLoadPlan = (plan) => {
    setScale(plan.scale);
    setUseCredits(plan.useCredits || false);
    setCurrentCgpaInput(plan.currentCgpa);
    setTargetCgpaInput(plan.targetCgpa);
    setCompletedSems(plan.completedSems);
    setTotalSems(plan.totalSems);
    
    setTimeout(() => {
      setSemesterSgpas(plan.semesterSgpas);
      setSemesterCredits(plan.semesterCredits);
      setEditedFutureSemesters(plan.editedFutureSemesters || []);
      setAutoDistribute(plan.autoDistribute !== undefined ? plan.autoDistribute : true);
      setActivePlanId(plan.id);
      showToast(`Loaded plan: ${plan.name}`, "success");
    }, 50);
  };

  // Delete plan
  const handleDeletePlan = (id, e) => {
    e.stopPropagation();
    const updated = savedPlans.filter((p) => p.id !== id);
    setSavedPlans(updated);
    localStorage.setItem("boring_cgpa_plans", JSON.stringify(updated));
    if (activePlanId === id) {
      setActivePlanId(null);
      setNewPlanName("");
    }
    showToast("Plan deleted.", "success");
  };

  // Copy Results to Clipboard
  const handleCopyResults = () => {
    if (!calculations) return;
    const completed = Math.min(completedSems, totalSems);
    
    let text = `CGPA TARGET PLANNER REPORT\n`;
    text += `==========================\n`;
    text += `Scale: ${scale}.0 GPA Scale\n`;
    text += `Completed Semesters: ${completed} / ${totalSems}\n`;
    text += `Current CGPA: ${calculations.actualCurrentCgpa.toFixed(2)}\n`;
    text += `Target CGPA: ${targetCgpa.toFixed(2)}\n`;
    text += `Required Average SGPA: ${calculations.requiredAverageSgpa.toFixed(2)} (${calculations.difficulty})\n`;
    if (calculations.remainingSems > 0) {
      text += `Remaining Semesters: ${calculations.remainingSems}\n`;
    }
    text += `\nSEMESTER ROADMAP:\n`;
    
    for (let i = 0; i < totalSems; i++) {
      const type = i < completed ? "Completed" : "Target";
      const credText = useCredits ? ` (Credits: ${semesterCredits[i] || 20})` : "";
      text += `- Semester ${i + 1} (${type}): SGPA ${calculations.finalSgpas[i].toFixed(2)}${credText}\n`;
    }

    text += `\n--------------------------\n`;
    text += `Generated using Boring Tools CGPA Target Planner. Everything runs 100% locally.\n`;

    navigator.clipboard.writeText(text);
    showToast("Results copied to clipboard!", "success");
  };

  // Export JSON file
  const handleExportJson = () => {
    if (!calculations) return;
    const planObj = {
      scale,
      useCredits,
      currentCgpa: currentCgpaInput,
      targetCgpa: targetCgpaInput,
      completedSems,
      totalSems,
      semesterSgpas: calculations.finalSgpas,
      semesterCredits,
      editedFutureSemesters,
      autoDistribute,
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(planObj, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cgpa_plan_${totalSems}sem.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("JSON file downloaded!", "success");
  };

  // What-If Simulator results
  const simulatorResults = useMemo(() => {
    if (!calculations) return null;
    const completed = Math.min(completedSems, totalSems);
    if (completed >= totalSems) return null;

    const currentSemIndex = completed;
    const currentSemCred = useCredits ? (semesterCredits[currentSemIndex] || 20) : 20;

    let simCompletedCredits = 0;
    let simCompletedPoints = 0;
    for (let i = 0; i < completed; i++) {
      const cred = useCredits ? (semesterCredits[i] || 20) : 20;
      const sgpa = semesterSgpas[i] || 0;
      simCompletedCredits += cred;
      simCompletedPoints += sgpa * cred;
    }
    simCompletedCredits += currentSemCred;
    simCompletedPoints += simulatorSgpa * currentSemCred;

    const simulatedCgpaAfterThisSem = simCompletedPoints / simCompletedCredits;

    let totalCredits = 0;
    for (let i = 0; i < totalSems; i++) {
      totalCredits += useCredits ? (semesterCredits[i] || 20) : 20;
    }
    const targetPoints = targetCgpa * totalCredits;
    const pointsNeededSubseq = targetPoints - simCompletedPoints;

    let subseqCreditsSum = 0;
    for (let i = completed + 1; i < totalSems; i++) {
      subseqCreditsSum += useCredits ? (semesterCredits[i] || 20) : 20;
    }

    const subseqRequiredAverageSgpa = subseqCreditsSum > 0 ? pointsNeededSubseq / subseqCreditsSum : 0;

    return {
      simulatedCgpaAfterThisSem,
      subseqRequiredAverageSgpa,
      remainingSemsLeft: totalSems - completed - 1
    };
  }, [calculations, completedSems, totalSems, semesterCredits, semesterSgpas, simulatorSgpa, targetCgpa, useCredits]);

  // Goal Insights Text Generator
  const goalInsights = useMemo(() => {
    if (!calculations) return [];
    const list = [];
    const completed = Math.min(completedSems, totalSems);
    const reqSgpa = calculations.requiredAverageSgpa;

    if (completed === totalSems) {
      return [{
        type: "success",
        text: "You have completed all semesters! Check your final CGPA against your target."
      }];
    }

    list.push({
      type: "info",
      text: `You need an average SGPA of ${reqSgpa.toFixed(2)} in your remaining ${calculations.remainingSems} semesters.`
    });

    if (reqSgpa > scale) {
      list.push({
        type: "error",
        text: `Target is mathematically impossible. Even with a perfect ${scale}.00 in all remaining semesters, you will max out below your target.`
      });
    } else if (reqSgpa <= 0) {
      list.push({
        type: "success",
        text: "You have already secured enough points to meet your target. Keep performing steadily to lock it in!"
      });
    } else if (reqSgpa > scale * 0.92) {
      list.push({
        type: "warning",
        text: "Stiff targets! You have very little room for low scores. You will need to hit top grades consistently."
      });
    } else if (reqSgpa > scale * 0.82) {
      list.push({
        type: "warning",
        text: "Challenging but achievable! Solid preparation and consistent focus will get you across the line."
      });
    } else {
      list.push({
        type: "success",
        text: "Highly doable! Maintaining a reasonable standard of study will comfortably lead to your target."
      });
    }

    // Credits insight
    if (useCredits) {
      const futureCred = semesterCredits.slice(completed).reduce((a, b) => a + b, 0);
      const pastCred = semesterCredits.slice(0, completed).reduce((a, b) => a + b, 0);
      if (futureCred < pastCred && reqSgpa > calculations.actualCurrentCgpa) {
        list.push({
          type: "info",
          text: "Note: You have more completed credits than remaining. This makes it harder to move your CGPA upwards, requiring higher SGPAs."
        });
      } else if (futureCred > pastCred && reqSgpa > calculations.actualCurrentCgpa) {
        list.push({
          type: "success",
          text: "Advantage: You have more credits remaining than completed. This gives you high leverage to lift your CGPA."
        });
      }
    }

    return list;
  }, [calculations, completedSems, totalSems, scale, semesterCredits, useCredits]);

  // Render SVG Performance Graph Path
  const svgGraphContent = useMemo(() => {
    if (!calculations || totalSems < 1) return null;
    
    const width = 540;
    const height = 240;
    const padding = { left: 45, right: 20, top: 30, bottom: 35 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const completed = Math.min(completedSems, totalSems);
    const sgpasToRender = calculations.finalSgpas;

    // Calculate cumulative CGPA at each semester
    const cumulativeCgpas = [];
    let runningPoints = 0;
    let runningCredits = 0;
    for (let i = 0; i < totalSems; i++) {
      runningCredits += useCredits ? (semesterCredits[i] || 20) : 20;
      runningPoints += sgpasToRender[i] * (useCredits ? (semesterCredits[i] || 20) : 20);
      cumulativeCgpas.push(runningPoints / runningCredits);
    }

    // Helper functions for SVG scaling
    const getX = (index) => {
      if (totalSems === 1) return padding.left + chartWidth / 2;
      return padding.left + (index / (totalSems - 1)) * chartWidth;
    };

    const getY = (val) => {
      const valClamped = Math.max(0, Math.min(scale, val));
      return padding.top + (1 - valClamped / scale) * chartHeight;
    };

    // Y Axis labels and lines
    const gridLines = [];
    const ticks = scale === 10 ? [0, 2, 4, 6, 8, 10] : [0, 1, 2, 3, 4];
    ticks.forEach((tick) => {
      gridLines.push({
        value: tick,
        y: getY(tick)
      });
    });

    // Build SVG Path for Cumulative CGPA
    let cgpaPath = "";
    cumulativeCgpas.forEach((cgpa, idx) => {
      const x = getX(idx);
      const y = getY(cgpa);
      if (idx === 0) cgpaPath += `M ${x} ${y}`;
      else cgpaPath += ` L ${x} ${y}`;
    });

    // Build SVG Path for Semester SGPA (dashed orange line)
    let sgpaPath = "";
    sgpasToRender.forEach((sgpa, idx) => {
      const x = getX(idx);
      const y = getY(sgpa);
      if (idx === 0) sgpaPath += `M ${x} ${y}`;
      else sgpaPath += ` L ${x} ${y}`;
    });

    // Target Line Y
    const targetY = getY(targetCgpa);

    return {
      width,
      height,
      padding,
      chartWidth,
      chartHeight,
      gridLines,
      cgpaPath,
      sgpaPath,
      targetY,
      cumulativeCgpas,
      sgpasToRender,
      getX,
      getY,
      completed
    };
  }, [calculations, totalSems, completedSems, semesterCredits, targetCgpa, scale, useCredits]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans print:bg-white print:p-0">
      
      {/* Premium Slider styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-slider {
          width: 100%;
          height: 8px;
          border-radius: 8px;
          background: #e2e8f0;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
        }
        .premium-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ea580c;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
          transition: transform 0.15s ease;
        }
        .premium-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          background: #f97316;
        }
        .premium-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ea580c;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
          transition: transform 0.15s ease;
        }
        /* Custom scrollbar styling for roadmap checklist */
        .roadmap-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .roadmap-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .roadmap-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .roadmap-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      ` }} />

      {/* PRINT-ONLY REPORT ELEMENT */}
      {calculations && (
        <div className="hidden print:block max-w-4xl mx-auto p-8 text-slate-900 bg-white font-sans">
          <div className="text-center border-b pb-6 mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">CGPA Target Planner Report</h1>
            <p className="text-sm text-slate-500">Degree Roadmap &amp; Required SGPA Analysis</p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-8 border rounded-xl p-6 bg-slate-50/50">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Academic Profile</h3>
              <div className="space-y-1 text-sm font-medium">
                <div>Scale: <span className="font-bold">{scale}.0 GPA Scale</span></div>
                <div>Completed Semesters: <span className="font-bold">{completedSems} / {totalSems}</span></div>
                <div>Current CGPA: <span className="font-bold">{calculations.actualCurrentCgpa.toFixed(2)}</span></div>
                <div>Target CGPA: <span className="font-bold text-orange-600">{targetCgpa.toFixed(2)}</span></div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Status</h3>
              <div className="space-y-1 text-sm font-medium">
                <div>Required Average SGPA: <span className="font-bold text-orange-600">{calculations.requiredAverageSgpa.toFixed(2)}</span></div>
                <div>Target Difficulty: <span className="font-bold">{calculations.difficulty}</span></div>
                {useCredits && <div>Total Program Credits: <span className="font-bold">{calculations.totalCreditsSum}</span></div>}
                <div>Remaining Gap: <span className="font-bold">{calculations.gapRemaining.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold mb-4">Semester Roadmap</h2>
          <table className="w-full text-left border-collapse border border-slate-200 mb-8">
            <thead>
              <tr className="bg-slate-100 text-xs font-bold uppercase text-slate-600">
                <th className="border p-3">Semester</th>
                <th className="border p-3">Status</th>
                {useCredits && <th className="border p-3">Credits</th>}
                <th className="border p-3">SGPA</th>
                <th className="border p-3">Cumulative CGPA</th>
              </tr>
            </thead>
            <tbody>
              {calculations.finalSgpas.map((sgpa, idx) => {
                const isCompleted = idx < completedSems;
                let runningPoints = 0;
                let runningCredits = 0;
                for (let i = 0; i <= idx; i++) {
                  runningCredits += useCredits ? (semesterCredits[i] || 20) : 20;
                  runningPoints += calculations.finalSgpas[i] * (useCredits ? (semesterCredits[i] || 20) : 20);
                }
                const runningCumCgpa = runningPoints / runningCredits;

                return (
                  <tr key={idx} className="text-sm border-b">
                    <td className="border p-3 font-semibold">Semester {idx + 1}</td>
                    <td className="border p-3">{isCompleted ? "Completed" : "Planned Target"}</td>
                    {useCredits && <td className="border p-3">{semesterCredits[idx] || 20}</td>}
                    <td className="border p-3 font-bold">{sgpa.toFixed(2)}</td>
                    <td className="border p-3">{runningCumCgpa.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="border-t pt-6 text-center text-xs text-slate-400">
            Everything runs locally inside your browser. No information is uploaded.
          </div>
        </div>
      )}

      {/* SCREEN LAYOUT */}
      <div className="max-w-6xl mx-auto print:hidden">
        
        {/* Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
            CGPA Target Planner
          </h1>
          <p className="text-slate-600 max-w-2xl text-sm sm:text-base">
            Help college students understand exactly what SGPA they need in future semesters to reach their target CGPA.
          </p>
        </div>

        {/* Global Toast */}
        {toast.show && (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg transition duration-300">
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT SIDEBAR - CONFIGURATION */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Scale toggle */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Grading Scale</h2>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => handleScaleChange(10)}
                  className={`py-2 px-3 rounded-lg font-bold text-sm transition ${
                    scale === 10
                      ? "bg-white text-orange-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  10.0 Scale
                </button>
                <button
                  onClick={() => handleScaleChange(4)}
                  className={`py-2 px-3 rounded-lg font-bold text-sm transition ${
                    scale === 4
                      ? "bg-white text-orange-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  4.0 Scale
                </button>
              </div>
            </div>

            {/* Inputs Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
              <h2 className="text-base font-bold text-slate-900">Academic Profile</h2>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Current CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={scale}
                  value={currentCgpaInput}
                  onChange={(e) => handleCurrentCgpaChange(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Completed Sems
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalSems}
                    value={completedSems}
                    onChange={(e) => setCompletedSems(Math.max(0, Math.min(totalSems, parseInt(e.target.value) || 0)))}
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Total Semesters
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={totalSems}
                    onChange={(e) => setTotalSems(Math.max(1, Math.min(12, parseInt(e.target.value) || 8)))}
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Target CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={scale}
                  value={targetCgpaInput}
                  onChange={(e) => setTargetCgpaInput(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Popular Targets */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Popular Targets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(scale === 10 ? ["7.5", "8.0", "8.5", "9.0", "9.5", "10.0"] : ["2.5", "3.0", "3.2", "3.5", "3.8", "4.0"]).map((target) => (
                    <button
                      key={target}
                      onClick={() => setTargetCgpaInput(target)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition ${
                        targetCgpaInput === target
                          ? "bg-orange-500 border-orange-500 text-white shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {target}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle credit weight option */}
              <div className="pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCredits}
                    onChange={(e) => setUseCredits(e.target.checked)}
                    className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">Enable Credit-Weighting</span>
                </label>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">
                  Check this if your college courses have unequal credits per semester (e.g. Semester 5 is worth 24 credits, Semester 6 is 18).
                </p>
              </div>

              {/* Credit inputs (Only shown if checked) */}
              {useCredits && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Default Credit Weights
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                        Current Sem
                      </label>
                      <input
                        type="number"
                        value={currentSemCreditsInput}
                        onChange={(e) => setCurrentSemCreditsInput(e.target.value)}
                        placeholder="e.g. 20"
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                        Future Sems
                      </label>
                      <input
                        type="number"
                        value={futureSemCreditsInput}
                        onChange={(e) => setFutureSemCreditsInput(e.target.value)}
                        placeholder="e.g. 20"
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Plans Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Saved Degrees</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {savedPlans.length}
                </span>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-2">
                <input
                  type="text"
                  placeholder="Plan name (e.g. My Degree)"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs transition"
                >
                  {activePlanId ? "Update Plan" : "Save Current Setup"}
                </button>
              </form>

              {savedPlans.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto roadmap-scroll pr-1">
                  {savedPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => handleLoadPlan(plan)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                        activePlanId === plan.id
                          ? "bg-orange-50 border-orange-200"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200/60"
                      }`}
                    >
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate">{plan.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {plan.completedSems}/{plan.totalSems} sems • {plan.scale}.0 scale {plan.useCredits ? "• Weighted" : ""}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeletePlan(plan.id, e)}
                        className="text-slate-400 hover:text-red-500 p-1 transition"
                        title="Delete Plan"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2 font-medium">
                  No saved plans yet.
                </p>
              )}
            </div>

            {/* Privacy Card */}
            <div className="bg-slate-900 rounded-2xl p-6 text-slate-200 space-y-2 border border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-orange-400 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Privacy Statement</span>
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Everything runs locally inside your browser. No information is uploaded. All calculations and plan storage reside 100% offline.
              </p>
            </div>

          </div>

          {/* RIGHT PANELS - CALCULATIONS, CHARTS, AND PLANNER */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Visual Dashboard Cards */}
            {calculations && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Current CGPA</span>
                  <span className="text-xl font-black text-slate-800">{calculations.actualCurrentCgpa.toFixed(2)}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target CGPA</span>
                  <span className="text-xl font-black text-orange-600">{targetCgpa.toFixed(2)}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Required SGPA</span>
                  <span className="text-xl font-black text-orange-600">
                    {calculations.remainingSems > 0 ? calculations.requiredAverageSgpa.toFixed(2) : "N/A"}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sems Left</span>
                  <span className="text-xl font-black text-slate-800">{calculations.remainingSems}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Progress</span>
                  <span className="text-xl font-black text-slate-800">{calculations.progressPercent}%</span>
                </div>
              </div>
            )}

            {/* Live Progress Card */}
            {calculations && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Current: {calculations.actualCurrentCgpa.toFixed(2)}</span>
                  <span>Target: {targetCgpa.toFixed(2)}</span>
                </div>

                {/* Horizontal Progress bar */}
                <div className="h-3 w-full bg-slate-100 rounded-full relative overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (calculations.actualCurrentCgpa / scale) * 100)}%` }}
                    className="h-full bg-slate-300 transition-all duration-500 rounded-full"
                  />
                  <div
                    style={{
                      left: `${Math.min(100, (calculations.actualCurrentCgpa / scale) * 100)}%`,
                      width: `${Math.max(0, Math.min(100, (calculations.gapRemaining / scale) * 100))}%`
                    }}
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 absolute top-0 transition-all duration-500"
                  />
                  <div
                    style={{ left: `${Math.min(100, (targetCgpa / scale) * 100)}%` }}
                    className="h-full w-0.5 bg-red-600 absolute top-0"
                  />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="w-2.5 h-2.5 bg-slate-300 rounded-full inline-block" />
                    <span>Completed CGPA</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="w-2.5 h-2.5 bg-orange-500 rounded-full inline-block" />
                    <span>Gap: {Math.max(0, calculations.gapRemaining).toFixed(2)}</span>
                  </div>
                  <div className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${calculations.difficultyColor}`}>
                    {calculations.difficulty}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Graph Card */}
            {svgGraphContent && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">SGPA &amp; CGPA Progression Roadmap</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Nodes display actual and planned cumulative grades directly.</p>
                  </div>
                  <div className="flex gap-4 text-[9px] font-bold">
                    <span className="flex items-center gap-1 text-indigo-600">
                      <span className="w-2 h-0.5 bg-indigo-600 inline-block" /> Cumulative CGPA
                    </span>
                    <span className="flex items-center gap-1 text-orange-500">
                      <span className="w-2 h-0.5 bg-orange-500 border-dashed inline-block" /> Semester SGPA
                    </span>
                    <span className="flex items-center gap-1 text-red-500">
                      <span className="w-2 h-0.5 bg-red-500 border-dashed inline-block" /> Target CGPA
                    </span>
                  </div>
                </div>

                {/* SVG Chart with labels directly on nodes */}
                <div className="relative w-full aspect-[54/24] bg-slate-50/50 border border-slate-100 rounded-xl overflow-hidden">
                  <svg
                    viewBox={`0 0 ${svgGraphContent.width} ${svgGraphContent.height}`}
                    className="w-full h-full"
                  >
                    {/* Y Axis Grid Lines */}
                    {svgGraphContent.gridLines.map((line) => (
                      <g key={line.value}>
                        <line
                          x1={svgGraphContent.padding.left}
                          y1={line.y}
                          x2={svgGraphContent.width - svgGraphContent.padding.right}
                          y2={line.y}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        />
                        <text
                          x={svgGraphContent.padding.left - 8}
                          y={line.y + 4}
                          className="text-[9px] font-bold fill-slate-400 text-right"
                          textAnchor="end"
                        >
                          {line.value.toFixed(1)}
                        </text>
                      </g>
                    ))}

                    {/* Target line */}
                    <line
                      x1={svgGraphContent.padding.left}
                      y1={svgGraphContent.targetY}
                      x2={svgGraphContent.width - svgGraphContent.padding.right}
                      y2={svgGraphContent.targetY}
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    
                    {/* Target Line label */}
                    <text
                      x={svgGraphContent.width - svgGraphContent.padding.right - 4}
                      y={svgGraphContent.targetY - 4}
                      className="text-[8px] font-bold fill-red-600 text-right"
                      textAnchor="end"
                    >
                      Target: {targetCgpa.toFixed(2)}
                    </text>

                    {/* SGPA Area (Orange dotted line) */}
                    <path
                      d={svgGraphContent.sgpaPath}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* CGPA Progression Line (Solid blue line) */}
                    <path
                      d={svgGraphContent.cgpaPath}
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="3"
                    />

                    {/* Nodes and Labels */}
                    {svgGraphContent.sgpasToRender.map((sgpa, idx) => {
                      const x = svgGraphContent.getX(idx);
                      const yCgpa = svgGraphContent.getY(svgGraphContent.cumulativeCgpas[idx]);
                      const ySgpa = svgGraphContent.getY(sgpa);
                      const isCompleted = idx < svgGraphContent.completed;

                      return (
                        <g key={idx}>
                          {/* SGPA Node */}
                          <circle
                            cx={x}
                            cy={ySgpa}
                            r="3"
                            className="fill-orange-500 stroke-white"
                            strokeWidth="1"
                          />
                          {/* SGPA Value text */}
                          <text
                            x={x}
                            y={ySgpa + 12}
                            className="text-[8px] font-black fill-orange-600"
                            textAnchor="middle"
                          >
                            {sgpa.toFixed(2)}
                          </text>

                          {/* CGPA Node */}
                          <circle
                            cx={x}
                            cy={yCgpa}
                            r="4.5"
                            className={isCompleted ? "fill-indigo-600 stroke-white" : "fill-indigo-400 stroke-white"}
                            strokeWidth="1.5"
                          />
                          {/* Cumulative CGPA Value text */}
                          <text
                            x={x}
                            y={yCgpa - 8}
                            className="text-[8px] font-black fill-indigo-700"
                            textAnchor="middle"
                          >
                            {svgGraphContent.cumulativeCgpas[idx].toFixed(2)}
                          </text>

                          {/* X labels (Semester name) */}
                          <text
                            x={x}
                            y={svgGraphContent.height - 8}
                            className="text-[9px] font-bold fill-slate-500"
                            textAnchor="middle"
                          >
                            Sem {idx + 1}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {/* Goal Insights and Summary Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Goal Insights</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
                {goalInsights.map((insight, idx) => {
                  let cardStyle = "bg-slate-50 border-slate-100 border-l-4 border-l-slate-400";
                  if (insight.type === "success") {
                    cardStyle = "bg-emerald-50/50 border-emerald-100 border-l-4 border-l-emerald-500 text-emerald-950";
                  } else if (insight.type === "warning") {
                    cardStyle = "bg-amber-50/50 border-amber-100 border-l-4 border-l-amber-500 text-amber-950";
                  } else if (insight.type === "error") {
                    cardStyle = "bg-red-50/50 border-red-100 border-l-4 border-l-red-500 text-red-950";
                  } else if (insight.type === "info") {
                    cardStyle = "bg-blue-50/50 border-blue-100 border-l-4 border-l-blue-500 text-blue-950";
                  }
                  
                  return (
                    <div key={idx} className={`p-3.5 rounded-xl flex gap-2.5 items-start ${cardStyle}`}>
                      <span className="text-sm shrink-0">
                        {insight.type === "success" ? "🎉" : insight.type === "error" ? "⚠️" : insight.type === "warning" ? "🔥" : "💡"}
                      </span>
                      <span className="leading-relaxed">{insight.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What-If Simulator Card */}
            {calculations && calculations.remainingSems > 0 && simulatorResults && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 text-white shadow-sm space-y-4">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-bold text-orange-400">What-If Simulator</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Instantly test how a specific score in Semester {completedSems + 1} shifts your remaining targets.
                    </p>
                  </div>
                  <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                    Sandbox
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">Simulated Semester {completedSems + 1} SGPA</span>
                      <span className="text-lg font-black text-orange-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                        {simulatorSgpa.toFixed(2)}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={scale}
                      step="0.05"
                      value={simulatorSgpa}
                      onChange={(e) => setSimulatorSgpa(parseFloat(e.target.value))}
                      className="premium-slider"
                    />

                    {/* What-if Quick Presets */}
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      {(scale === 10 ? ["7.5", "8.0", "8.5", "9.0", "9.3", "9.8"] : ["2.5", "3.0", "3.3", "3.5", "3.7", "4.0"]).map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setSimulatorSgpa(parseFloat(preset))}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition border ${
                            simulatorSgpa === parseFloat(preset)
                              ? "bg-orange-500 border-orange-500 text-white shadow-xs"
                              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-800/80 rounded-xl p-4.5 space-y-3.5 font-semibold">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Resulting CGPA after this semester:</span>
                      <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded text-sm">
                        {simulatorResults.simulatedCgpaAfterThisSem.toFixed(3)}
                      </span>
                    </div>
                    {simulatorResults.remainingSemsLeft > 0 ? (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Remaining SGPA needed ({simulatorResults.remainingSemsLeft} sems):</span>
                        <span className={`font-black px-2 py-0.5 rounded text-sm ${
                          simulatorResults.subseqRequiredAverageSgpa > scale
                            ? "text-red-400 bg-red-950/20 animate-pulse"
                            : "text-orange-400 bg-orange-950/20"
                        }`}>
                          {simulatorResults.subseqRequiredAverageSgpa.toFixed(3)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 text-center italic pt-1 border-t border-slate-800">
                        No subsequent semesters remain after this push!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Semester Planner Card */}
            {calculations && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Roadmap Targets Planner</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Slide SGPA targets for future semesters. Watch remaining semesters balance automatically.
                    </p>
                  </div>
                  
                  {calculations.remainingSems > 1 && (
                    <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      {editedFutureSemesters.length > 0 && (
                        <button
                          onClick={resetFuturePlannerEdits}
                          className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline px-1"
                        >
                          Reset Manual Targets
                        </button>
                      )}
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-600 select-none">
                        <input
                          type="checkbox"
                          checked={autoDistribute}
                          onChange={(e) => setAutoDistribute(e.target.checked)}
                          className="w-3.5 h-3.5 accent-orange-600 rounded cursor-pointer"
                        />
                        <span>Auto-balance remaining</span>
                      </label>
                    </div>
                  )}
                </div>

                {calculations.isImpossible && autoDistribute && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                    ⚠️ <strong>Friction Alert:</strong> Current planned targets require a subsequent average of{" "}
                    <span className="font-bold">{calculations.requiredUneditedSgpa.toFixed(2)}</span>, which is above your grading scale limit. Modify custom targets downward or click Reset.
                  </div>
                )}

                {/* Semester List */}
                <div className="space-y-3 max-h-96 overflow-y-auto roadmap-scroll pr-1">
                  {calculations.finalSgpas.map((sgpa, idx) => {
                    const isCompleted = idx < completedSems;
                    const isCurrent = idx === completedSems;
                    const isEdited = editedFutureSemesters.includes(idx);
                    
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all ${
                          isCompleted
                            ? "bg-slate-50/50 border-slate-150"
                            : isCurrent
                            ? "bg-orange-50/30 border-orange-200 shadow-3xs"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        {/* Title & Status */}
                        <div className="min-w-[120px] select-none">
                          <span className="text-xs font-bold text-slate-800 block">Semester {idx + 1}</span>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            {isCompleted ? "Completed" : isCurrent ? "⚡ Current" : "Future Target"}
                          </span>
                        </div>

                        {/* Credits Input (Only shown if credit-weighting is enabled) */}
                        {useCredits && (
                          <div className="w-full sm:w-20">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Credits</label>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={semesterCredits[idx] || ""}
                              onChange={(e) => updateSemesterCredits(idx, e.target.value)}
                              className="w-full border border-slate-200 rounded-lg p-1 text-xs bg-slate-50/50 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                          </div>
                        )}

                        {/* Slider / Value selector */}
                        <div className="flex-1 w-full space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Target SGPA</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              !isCompleted && sgpa > scale
                                ? "bg-red-500 text-white animate-pulse"
                                : isCompleted
                                ? "bg-slate-200 text-slate-700"
                                : isEdited
                                ? "bg-orange-600 text-white"
                                : "bg-orange-100 text-orange-700"
                            }`}>
                              {sgpa.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex gap-2 items-center">
                            <input
                              type="range"
                              min="0"
                              max={scale}
                              step="0.05"
                              value={sgpa}
                              onChange={(e) => updateSemesterSgpa(idx, e.target.value)}
                              className="premium-slider"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Export and Action Cards */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="text-left w-full sm:w-auto">
                <h3 className="text-sm font-bold text-slate-900">Save &amp; Export Roadmap</h3>
                <p className="text-[11px] text-slate-500">Download reports, copy summaries, or export planners.</p>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyResults}
                  className="flex-1 sm:flex-none text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
                >
                  Copy Results
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={handleExportJson}
                  className="flex-1 sm:flex-none text-xs font-bold bg-slate-900 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Export JSON
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

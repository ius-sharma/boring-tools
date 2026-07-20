"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import ThemedDropdown from "../components/ThemedDropdown";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const CURRENCIES = [
  { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "CAD", label: "Canadian Dollar (C$)", symbol: "C$" },
  { value: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
  { value: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
];

const INDUSTRIES = [
  { id: "Development", label: "Software Development", multiplier: 1.15 },
  { id: "Design", label: "UI/UX & Product Design", multiplier: 1.10 },
  { id: "AI", label: "AI & Data Science", multiplier: 1.25 },
  { id: "Consulting", label: "Business Consulting", multiplier: 1.20 },
  { id: "Marketing", label: "Digital Marketing & SEO", multiplier: 1.05 },
  { id: "Video Editing", label: "Video & Animation", multiplier: 1.05 },
  { id: "Writing", label: "Copywriting & Content", multiplier: 1.00 },
  { id: "Other", label: "General Freelance", multiplier: 1.00 },
];

const COMPLEXITY_LEVELS = [
  { id: "simple", label: "Simple", desc: "Standard task, clear specs, minimal risk", multiplier: 0.85 },
  { id: "medium", label: "Medium", desc: "Standard project, moderate integrations", multiplier: 1.00 },
  { id: "complex", label: "Complex", desc: "High technical difficulty, custom arch", multiplier: 1.30 },
  { id: "expert", label: "Expert / Enterprise", desc: "Mission-critical, compliance, high risk", multiplier: 1.65 },
];

const URGENCY_LEVELS = [
  { id: "normal", label: "Normal", desc: "Standard timeline", multiplier: 1.00 },
  { id: "fast", label: "Fast", desc: "Accelerated deadline (+25%)", multiplier: 1.25 },
  { id: "rush", label: "Rush", desc: "Immediate / Weekend work (+50%)", multiplier: 1.50 },
];

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner (0-2 yrs)", desc: "Building portfolio", multiplier: 0.80 },
  { id: "intermediate", label: "Intermediate (2-5 yrs)", desc: "Solid experience", multiplier: 1.00 },
  { id: "senior", label: "Senior (5-8 yrs)", desc: "High speed & quality", multiplier: 1.35 },
  { id: "expert", label: "Expert / Thought Leader (8+ yrs)", desc: "Top tier authority", multiplier: 1.75 },
];

function toFloat(val, fallback = 0) {
  if (val === "" || val === null || val === undefined) return fallback;
  const num = parseFloat(val);
  return isNaN(num) ? fallback : num;
}

function formatVal(val, currSymbol = "₹") {
  const num = Number(val) || 0;
  return `${currSymbol}${num.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function FreelancerPricingCalculator() {
  const [isClient, setIsClient] = useState(false);

  // Currency
  const [currency, setCurrency] = useState("INR");
  const currencySymbol = useMemo(() => {
    return CURRENCIES.find((c) => c.value === currency)?.symbol || "₹";
  }, [currency]);

  // Section 1: Monthly Financial Goals
  const [desiredIncome, setDesiredIncome] = useState("100000");
  const [softwareCost, setSoftwareCost] = useState("4000");
  const [equipmentCost, setEquipmentCost] = useState("3000");
  const [internetCost, setInternetCost] = useState("1500");
  const [officeCost, setOfficeCost] = useState("5000");
  const [otherExpenses, setOtherExpenses] = useState("2500");
  const [taxPercent, setTaxPercent] = useState("20");
  const [savingsPercent, setSavingsPercent] = useState("10");
  const [profitPercent, setProfitPercent] = useState("15");

  // Section 2: Working Schedule
  const [workingDaysMonth, setWorkingDaysMonth] = useState("20");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [billablePercent, setBillablePercent] = useState("60");
  const [vacationDaysYear, setVacationDaysYear] = useState("20");
  const [sickDaysYear, setSickDaysYear] = useState("10");

  // Section 3: Project Scope
  const [projectName, setProjectName] = useState("Web App Development");
  const [clientName, setClientName] = useState("Acme Clients");
  const [projectHours, setProjectHours] = useState("40");
  const [revisionRounds, setRevisionRounds] = useState("2");
  const [urgency, setUrgency] = useState("normal");
  const [complexity, setComplexity] = useState("medium");
  const [industry, setIndustry] = useState("Development");

  // Section 4: Experience Level
  const [experience, setExperience] = useState("intermediate");

  // Modes & Interactive Tools
  const [clientBudget, setClientBudget] = useState("25000");
  const [discountPercent, setDiscountPercent] = useState(0);

  // Scenario Simulator Flags
  const [scenario4Days, setScenario4Days] = useState(false);
  const [scenarioIncrease20, setScenarioIncrease20] = useState(false);
  const [scenarioReduceBillable, setScenarioReduceBillable] = useState(false);
  const [scenarioHireAssistant, setScenarioHireAssistant] = useState(false);

  // Profile Storage State
  const [profileName, setProfileName] = useState("");
  const [savedProfiles, setSavedProfiles] = useState({});
  const [activeProfileKey, setActiveProfileKey] = useState("Default");
  const [showGuide, setShowGuide] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, msg: "" });
  const toastTimerRef = useRef(null);

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, msg });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, msg: "" });
    }, 3000);
  };

  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem("freelancer-pricing-calculator-profiles");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedProfiles(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save current profile to local storage
  const handleSaveProfile = () => {
    const nameToSave = profileName.trim() || `Profile ${Object.keys(savedProfiles).length + 1}`;
    const profileData = {
      desiredIncome, softwareCost, equipmentCost, internetCost, officeCost, otherExpenses,
      taxPercent, savingsPercent, profitPercent, workingDaysMonth, hoursPerDay,
      billablePercent, vacationDaysYear, sickDaysYear, experience, industry, currency
    };
    const updated = { ...savedProfiles, [nameToSave]: profileData };
    setSavedProfiles(updated);
    setActiveProfileKey(nameToSave);
    setProfileName("");
    try {
      localStorage.setItem("freelancer-pricing-calculator-profiles", JSON.stringify(updated));
      showToast(`Profile "${nameToSave}" saved successfully!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadProfile = (key) => {
    const prof = savedProfiles[key];
    if (!prof) return;
    if (prof.desiredIncome !== undefined) setDesiredIncome(prof.desiredIncome);
    if (prof.softwareCost !== undefined) setSoftwareCost(prof.softwareCost);
    if (prof.equipmentCost !== undefined) setEquipmentCost(prof.equipmentCost);
    if (prof.internetCost !== undefined) setInternetCost(prof.internetCost);
    if (prof.officeCost !== undefined) setOfficeCost(prof.officeCost);
    if (prof.otherExpenses !== undefined) setOtherExpenses(prof.otherExpenses);
    if (prof.taxPercent !== undefined) setTaxPercent(prof.taxPercent);
    if (prof.savingsPercent !== undefined) setSavingsPercent(prof.savingsPercent);
    if (prof.profitPercent !== undefined) setProfitPercent(prof.profitPercent);
    if (prof.workingDaysMonth !== undefined) setWorkingDaysMonth(prof.workingDaysMonth);
    if (prof.hoursPerDay !== undefined) setHoursPerDay(prof.hoursPerDay);
    if (prof.billablePercent !== undefined) setBillablePercent(prof.billablePercent);
    if (prof.vacationDaysYear !== undefined) setVacationDaysYear(prof.vacationDaysYear);
    if (prof.sickDaysYear !== undefined) setSickDaysYear(prof.sickDaysYear);
    if (prof.experience !== undefined) setExperience(prof.experience);
    if (prof.industry !== undefined) setIndustry(prof.industry);
    if (prof.currency !== undefined) setCurrency(prof.currency);
    setActiveProfileKey(key);
    showToast(`Loaded profile "${key}"`);
  };

  const handleDeleteProfile = (key) => {
    const updated = { ...savedProfiles };
    delete updated[key];
    setSavedProfiles(updated);
    try {
      localStorage.setItem("freelancer-pricing-calculator-profiles", JSON.stringify(updated));
      showToast(`Profile deleted.`);
    } catch (e) {
      console.error(e);
    }
  };

  // --- CORE CALCULATION ENGINE ---
  const calculations = useMemo(() => {
    // Basic inputs
    let incomeGoal = toFloat(desiredIncome, 100000);
    let software = toFloat(softwareCost, 0);
    let equipment = toFloat(equipmentCost, 0);
    let internet = toFloat(internetCost, 0);
    let office = toFloat(officeCost, 0);
    let other = toFloat(otherExpenses, 0);
    let taxPct = toFloat(taxPercent, 20);
    let savPct = toFloat(savingsPercent, 10);
    let profPct = toFloat(profitPercent, 15);

    let workDaysM = toFloat(workingDaysMonth, 20);
    let hrsDay = toFloat(hoursPerDay, 8);
    let billPct = toFloat(billablePercent, 60);
    let vacDaysY = toFloat(vacationDaysYear, 20);
    let sickDaysY = toFloat(sickDaysYear, 10);

    // Scenario Adjustments
    if (scenario4Days) {
      workDaysM = workDaysM * 0.8; // 4 days instead of 5
    }
    if (scenarioReduceBillable) {
      billPct = Math.max(30, billPct - 15); // reduce billable hours
    }
    if (scenarioHireAssistant) {
      software += 12000; // assistant / overhead costs
      billPct = Math.min(90, billPct + 15); // increased billable efficiency
    }

    const totalBusinessCosts = software + equipment + internet + office + other;
    const baseNetRequired = incomeGoal + totalBusinessCosts;

    // Allocation logic: Total Gross Revenue required to achieve Net Goal after Taxes, Savings, Profit
    // Gross * (1 - (Tax% + Savings% + Profit%)/100) = Base Net Required
    const combinedDeductionRate = Math.min(0.70, (taxPct + savPct + profPct) / 100);
    const totalRequiredGrossMonthly = combinedDeductionRate < 1 
      ? baseNetRequired / (1 - combinedDeductionRate)
      : baseNetRequired * 1.5;

    const monthlyTaxes = totalRequiredGrossMonthly * (taxPct / 100);
    const monthlySavings = totalRequiredGrossMonthly * (savPct / 100);
    const monthlyProfit = totalRequiredGrossMonthly * (profPct / 100);
    const netPersonalIncome = incomeGoal;

    // Workload Breakdown
    const totalWorkingDaysYear = Math.max(10, (workDaysM * 12) - vacDaysY - sickDaysY);
    const totalAvailableHoursYear = totalWorkingDaysYear * hrsDay;
    const totalBillableHoursYear = totalAvailableHoursYear * (billPct / 100);
    const effectiveBillableHoursMonth = Math.max(1, totalBillableHoursYear / 12);
    const effectiveBillableHoursDay = effectiveBillableHoursMonth / Math.max(1, workDaysM);

    // Rate Derivations
    // Break-even hourly rate covers personal income + business expenses + taxes only
    const breakEvenMonthly = (incomeGoal + totalBusinessCosts) / (1 - (taxPct / 100));
    const breakEvenHourlyRate = breakEvenMonthly / effectiveBillableHoursMonth;

    // Minimum safe rate covers full revenue requirement (including savings & profit)
    const minimumHourlyRate = totalRequiredGrossMonthly / effectiveBillableHoursMonth;

    // Multipliers
    const expObj = EXPERIENCE_LEVELS.find((e) => e.id === experience) || EXPERIENCE_LEVELS[1];
    const compObj = COMPLEXITY_LEVELS.find((c) => c.id === complexity) || COMPLEXITY_LEVELS[1];
    const urgObj = URGENCY_LEVELS.find((u) => u.id === urgency) || URGENCY_LEVELS[0];
    const indObj = INDUSTRIES.find((i) => i.id === industry) || INDUSTRIES[0];

    let combinedMultiplier = expObj.multiplier * compObj.multiplier * urgObj.multiplier * indObj.multiplier;
    if (scenarioIncrease20) {
      combinedMultiplier *= 1.20;
    }

    const recommendedHourlyRate = minimumHourlyRate * combinedMultiplier;
    const dailyRate = recommendedHourlyRate * (hrsDay * (billPct / 100));
    const weeklyRate = dailyRate * (workDaysM / 4.33);
    const monthlyRate = recommendedHourlyRate * effectiveBillableHoursMonth;

    // Price Tiers / Benchmarks
    const breakEvenRate = breakEvenHourlyRate;
    const lowestSafePrice = minimumHourlyRate;
    const idealPrice = recommendedHourlyRate;
    const premiumPrice = idealPrice * 1.30;
    const luxuryPrice = idealPrice * 1.70;

    // Project Calculations
    const hrs = toFloat(projectHours, 40);
    const revRounds = toFloat(revisionRounds, 2);
    const revisionMultiplier = 1 + (revRounds * 0.08);

    const baseProjectQuote = hrs * recommendedHourlyRate * revisionMultiplier;
    const finalDiscountedQuote = baseProjectQuote * (1 - (discountPercent / 100));

    // Project Profitability Status
    const projectCostBreakEven = hrs * breakEvenHourlyRate;
    const projectProfit = finalDiscountedQuote - projectCostBreakEven;
    const projectProfitMarginPct = finalDiscountedQuote > 0 ? (projectProfit / finalDiscountedQuote) * 100 : 0;

    let profitabilityStatus = "Healthy";
    let statusColor = "text-blue-600 bg-blue-50 border-blue-200";
    if (projectProfitMarginPct >= 35) {
      profitabilityStatus = "Very Profitable";
      statusColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
    } else if (projectProfitMarginPct >= 15) {
      profitabilityStatus = "Healthy";
      statusColor = "text-blue-600 bg-blue-50 border-blue-200";
    } else if (projectProfitMarginPct >= 0) {
      profitabilityStatus = "Risky";
      statusColor = "text-amber-600 bg-amber-50 border-amber-200";
    } else {
      profitabilityStatus = "Loss";
      statusColor = "text-rose-600 bg-rose-50 border-rose-200";
    }

    // Negotiation Evaluation
    const cBudget = toFloat(clientBudget, 0);
    let negotiationVerdict = "Accept";
    let negotiationColor = "bg-emerald-500 text-white";
    let negotiationDesc = "This budget meets or exceeds your recommended pricing target. Highly profitable proposal.";
    let negotiationProfitDelta = cBudget - baseProjectQuote;

    if (cBudget >= baseProjectQuote) {
      negotiationVerdict = "Accept";
      negotiationColor = "bg-emerald-500 text-white";
      negotiationDesc = "Excellent! The client budget aligns with your recommended premium quote.";
    } else if (cBudget >= projectCostBreakEven * 1.1) {
      negotiationVerdict = "Negotiate";
      negotiationColor = "bg-amber-500 text-white";
      negotiationDesc = `Workable budget, but leaves less profit. Recommend reducing scope by ${Math.round((1 - cBudget / baseProjectQuote) * 100)}% or reducing revision rounds.`;
    } else {
      negotiationVerdict = "Reject";
      negotiationColor = "bg-rose-500 text-white";
      negotiationDesc = "Warning: This budget is below your break-even cost of doing business. Accepting will cause a loss.";
    }

    // Smart Insights Generation
    const insights = [];
    if (billPct < 50) {
      insights.push({ type: "warning", title: "Low Billable Ratio", text: `Only ${billPct}% of your hours produce revenue. You spend ${100 - billPct}% on unpaid admin/marketing tasks. Streamline your workflow to boost earnings.` });
    } else {
      insights.push({ type: "success", title: "Strong Billable Efficiency", text: `${billPct}% of your working hours are billable, maximizing revenue density.` });
    }

    if (recommendedHourlyRate > minimumHourlyRate * 1.4) {
      insights.push({ type: "success", title: "High Value Positioning", text: `Your experience (${expObj.label}) and urgency/complexity multipliers add ${Math.round((combinedMultiplier - 1) * 100)}% premium to your baseline rates.` });
    } else if (combinedMultiplier <= 1.0) {
      insights.push({ type: "info", title: "Pricing Opportunity", text: `You are charging close to base rates. Increasing rates by 20% would add ${formatVal(totalRequiredGrossMonthly * 0.2, currencySymbol)} extra profit every month.` });
    }

    if (savPct < 10) {
      insights.push({ type: "warning", title: "Low Emergency Reserve", text: `Your savings target is set to ${savPct}%. Freelancers should aim for at least 10-15% emergency reserve for dry spells.` });
    }

    if (discountPercent > 20) {
      insights.push({ type: "warning", title: "Aggressive Discount Alert", text: `Giving a ${discountPercent}% discount reduces your project quote by ${formatVal(baseProjectQuote * (discountPercent / 100), currencySymbol)}.` });
    }

    return {
      totalBusinessCosts,
      totalRequiredGrossMonthly,
      monthlyTaxes,
      monthlySavings,
      monthlyProfit,
      netPersonalIncome,
      effectiveBillableHoursMonth,
      effectiveBillableHoursDay,
      totalBillableHoursYear,
      breakEvenHourlyRate,
      minimumHourlyRate,
      recommendedHourlyRate,
      dailyRate,
      weeklyRate,
      monthlyRate,
      breakEvenRate,
      lowestSafePrice,
      idealPrice,
      premiumPrice,
      luxuryPrice,
      baseProjectQuote,
      finalDiscountedQuote,
      projectCostBreakEven,
      projectProfit,
      projectProfitMarginPct,
      profitabilityStatus,
      statusColor,
      negotiationVerdict,
      negotiationColor,
      negotiationDesc,
      negotiationProfitDelta,
      combinedMultiplier,
      insights
    };
  }, [
    desiredIncome, softwareCost, equipmentCost, internetCost, officeCost, otherExpenses,
    taxPercent, savingsPercent, profitPercent, workingDaysMonth, hoursPerDay, billablePercent,
    vacationDaysYear, sickDaysYear, projectHours, revisionRounds, urgency, complexity,
    industry, experience, clientBudget, discountPercent, scenario4Days, scenarioIncrease20,
    scenarioReduceBillable, scenarioHireAssistant, currencySymbol
  ]);

  // Export PDF proposal/quote
  const handleExportPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const drawText = (text, x, y, size = 12, isBold = false, color = rgb(0.1, 0.1, 0.1)) => {
        page.drawText(text, { x, y, size, font: isBold ? font : regularFont, color });
      };

      // Header Banner
      page.drawRectangle({
        x: 0,
        y: 720,
        width: 600,
        height: 80,
        color: rgb(0.96, 0.62, 0.04),
      });
      drawText("FREELANCE PRICING PROPOSAL", 40, 755, 22, true, rgb(1, 1, 1));
      drawText(`Generated via BoringTools Freelancer Calculator`, 40, 735, 10, false, rgb(1, 1, 1));

      let y = 680;
      drawText(`Project: ${projectName}`, 40, y, 14, true);
      drawText(`Client: ${clientName}`, 350, y, 14, true);
      y -= 25;
      drawText(`Date: ${new Date().toLocaleDateString()}`, 40, y, 10, false, rgb(0.4, 0.4, 0.4));
      drawText(`Currency: ${currency}`, 350, y, 10, false, rgb(0.4, 0.4, 0.4));

      y -= 35;
      page.drawLine({ start: { x: 40, y }, end: { x: 560, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

      y -= 30;
      drawText("PROJECT RATE SUMMARY", 40, y, 13, true, rgb(0.9, 0.4, 0.0));
      y -= 25;
      drawText(`Estimated Scope: ${projectHours} Hours`, 40, y, 11);
      drawText(`Revision Rounds Included: ${revisionRounds}`, 300, y, 11);
      y -= 20;
      drawText(`Urgency Level: ${urgency.toUpperCase()}`, 40, y, 11);
      drawText(`Complexity: ${complexity.toUpperCase()}`, 300, y, 11);

      y -= 35;
      // Box for final quote
      page.drawRectangle({
        x: 40,
        y: y - 50,
        width: 520,
        height: 60,
        color: rgb(0.98, 0.95, 0.9),
        borderColor: rgb(0.96, 0.62, 0.04),
        borderWidth: 1,
      });

      drawText("TOTAL RECOMMENDED PROJECT QUOTE", 60, y - 15, 11, true, rgb(0.3, 0.3, 0.3));
      const finalAmountStr = `${currencySymbol}${Math.round(calculations.finalDiscountedQuote).toLocaleString()}`;
      drawText(finalAmountStr, 60, y - 40, 22, true, rgb(0.8, 0.3, 0.0));

      if (discountPercent > 0) {
        drawText(`(Includes ${discountPercent}% Discount)`, 320, y - 35, 10, false, rgb(0.5, 0.5, 0.5));
      }

      y -= 90;
      drawText("FREELANCER HOURLY & BENCHMARK RATES", 40, y, 13, true, rgb(0.9, 0.4, 0.0));
      y -= 25;
      drawText(`Recommended Hourly Rate: ${currencySymbol}${Math.round(calculations.recommendedHourlyRate).toLocaleString()}/hr`, 40, y, 11, true);
      drawText(`Daily Rate (Billable): ${currencySymbol}${Math.round(calculations.dailyRate).toLocaleString()}/day`, 300, y, 11);
      y -= 20;
      drawText(`Break-even Rate: ${currencySymbol}${Math.round(calculations.breakEvenHourlyRate).toLocaleString()}/hr`, 40, y, 11);
      drawText(`Monthly Target Revenue: ${currencySymbol}${Math.round(calculations.totalRequiredGrossMonthly).toLocaleString()}/mo`, 300, y, 11);

      y -= 40;
      drawText("RECOMMENDED PAYMENT TERMS", 40, y, 13, true, rgb(0.9, 0.4, 0.0));
      y -= 25;
      drawText(`• 50% Upfront Deposit: ${currencySymbol}${Math.round(calculations.finalDiscountedQuote * 0.5).toLocaleString()}`, 50, y, 11);
      y -= 20;
      drawText(`• 25% Mid-Project Milestone: ${currencySymbol}${Math.round(calculations.finalDiscountedQuote * 0.25).toLocaleString()}`, 50, y, 11);
      y -= 20;
      drawText(`• 25% Final Delivery: ${currencySymbol}${Math.round(calculations.finalDiscountedQuote * 0.25).toLocaleString()}`, 50, y, 11);

      y -= 50;
      drawText("Thank you for your business!", 220, y, 12, true, rgb(0.4, 0.4, 0.4));

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${projectName.replace(/\s+/g, "_")}_Pricing_Quote.pdf`;
      link.click();
      showToast("PDF Quote generated & downloaded!");
    } catch (err) {
      console.error("PDF generation error:", err);
      showToast("Error generating PDF.");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Currency", currency],
      ["Desired Monthly Income", desiredIncome],
      ["Monthly Business Expenses", calculations.totalBusinessCosts],
      ["Total Required Gross Revenue / Month", calculations.totalRequiredGrossMonthly],
      ["Effective Billable Hours / Month", calculations.effectiveBillableHoursMonth.toFixed(1)],
      ["Break-even Hourly Rate", calculations.breakEvenHourlyRate.toFixed(2)],
      ["Recommended Hourly Rate", calculations.recommendedHourlyRate.toFixed(2)],
      ["Daily Rate", calculations.dailyRate.toFixed(2)],
      ["Weekly Rate", calculations.weeklyRate.toFixed(2)],
      ["Monthly Target Rate", calculations.monthlyRate.toFixed(2)],
      ["Project Name", projectName],
      ["Project Hours", projectHours],
      ["Base Project Quote", calculations.baseProjectQuote.toFixed(2)],
      ["Discount %", discountPercent],
      ["Final Discounted Quote", calculations.finalDiscountedQuote.toFixed(2)],
      ["Project Profitability Status", calculations.profitabilityStatus],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Freelancer_Pricing_${projectName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV file exported successfully!");
  };

  // Copy Proposal text
  const handleCopyPricing = () => {
    const text = `📋 PRICING PROPOSAL - ${projectName}
Client: ${clientName}
Estimated Hours: ${projectHours} hrs
Revisions Included: ${revisionRounds} rounds

Rates Breakdown:
- Hourly Rate: ${currencySymbol}${Math.round(calculations.recommendedHourlyRate).toLocaleString()}/hr
- Total Project Quote: ${currencySymbol}${Math.round(calculations.finalDiscountedQuote).toLocaleString()}

Payment Terms:
- 50% Upfront Deposit (${currencySymbol}${Math.round(calculations.finalDiscountedQuote * 0.5).toLocaleString()})
- 25% Milestone (${currencySymbol}${Math.round(calculations.finalDiscountedQuote * 0.25).toLocaleString()})
- 25% Final Delivery (${currencySymbol}${Math.round(calculations.finalDiscountedQuote * 0.25).toLocaleString()})

Calculated using BoringTools Freelancer Pricing Calculator.`;

    navigator.clipboard.writeText(text);
    showToast("Pricing summary copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm animate-bounce">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                Financial Advisor & Rate Engine
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                100% Client-Side
              </span>
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 hover:border-amber-300 transition flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{showGuide ? "Hide User Guide" : "How to Use Guide"}</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Freelancer Pricing Calculator
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Calculate profitable freelance hourly, daily, and project rates based on your real business costs, income goals, taxes, billable hours, and scope complexity.
            </p>
          </div>

          {/* Top Controls: Currency & Profile */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-48">
              <label className="block text-xs font-medium text-slate-500 mb-1">Currency</label>
              <ThemedDropdown
                options={CURRENCIES}
                value={currency}
                onChange={setCurrency}
                className="w-full text-sm"
              />
            </div>

            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <button
                onClick={handleExportPDF}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export PDF</span>
              </button>
              <button
                onClick={handleCopyPricing}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copy Quote</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* HOW TO USE GUIDE (COLLAPSIBLE / TOGGLEABLE) */}
        {showGuide && (
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-900/5 p-6 rounded-2xl border border-amber-300 shadow-sm space-y-4 transition-all">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 text-white rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">How to Use Freelancer Pricing Calculator</h3>
                  <p className="text-xs text-slate-600">Quick step-by-step guide to calculate profitable freelance rates</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-1.5 hover:bg-white rounded-lg transition"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md">STEP 1</span>
                <h4 className="text-xs font-bold text-slate-900">Financial Goals & Costs</h4>
                <p className="text-xs text-slate-600">
                  Enter your monthly take-home income goal, software, equipment, internet, office costs, tax %, emergency reserve %, and profit margin.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md">STEP 2</span>
                <h4 className="text-xs font-bold text-slate-900">Working Capacity</h4>
                <p className="text-xs text-slate-600">
                  Set working days per month, hours per day, billable % (subtracting non-billable admin/sales work), and vacation/sick days per year.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md">STEP 3</span>
                <h4 className="text-xs font-bold text-slate-900">Project Scope & Multipliers</h4>
                <p className="text-xs text-slate-600">
                  Select project hours, revision rounds, timeline urgency (Rush/Fast), project complexity (Simple to Expert), and your experience level.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md">STEP 4</span>
                <h4 className="text-xs font-bold text-slate-900">Analyze Benchmarks & Tiers</h4>
                <p className="text-xs text-slate-600">
                  View your Break-even rate vs Ideal target rate vs Premium rate, along with pre-calculated Budget, Standard, Premium & Enterprise tiers.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md">STEP 5</span>
                <h4 className="text-xs font-bold text-slate-900">Negotiation & Discount Mode</h4>
                <p className="text-xs text-slate-600">
                  Input client budget to get instant Accept/Negotiate/Reject verdicts. Use the Discount slider to test safe rate limits without losing money.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md">STEP 6</span>
                <h4 className="text-xs font-bold text-slate-900">Scenario Simulator & PDF Export</h4>
                <p className="text-xs text-slate-600">
                  Test what happens if you work 4 days/week or increase rates +20%. Click <strong>Export PDF</strong> to download a formal quote proposal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TOP METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recommended Rate</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {formatVal(calculations.recommendedHourlyRate, currencySymbol)}<span className="text-sm font-normal text-slate-500">/hr</span>
                </h3>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
              <span>Break-even: {formatVal(calculations.breakEvenHourlyRate, currencySymbol)}/hr</span>
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Target Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {formatVal(calculations.totalRequiredGrossMonthly, currencySymbol)}<span className="text-sm font-normal text-slate-500">/mo</span>
                </h3>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Personal Goal: {formatVal(desiredIncome, currencySymbol)} + Costs & Taxes
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Effective Billable Hours</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {calculations.effectiveBillableHoursMonth.toFixed(0)} <span className="text-sm font-normal text-slate-500">hrs/mo</span>
                </h3>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              {billablePercent}% billable efficiency ({calculations.effectiveBillableHoursDay.toFixed(1)} hrs/day)
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Project Quote ({projectHours}h)</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">
                  {formatVal(calculations.finalDiscountedQuote, currencySymbol)}
                </h3>
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${calculations.statusColor}`}>
                {calculations.profitabilityStatus}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Profit Margin: ~{Math.round(calculations.projectProfitMarginPct)}%
            </p>
          </div>
        </div>

        {/* PROFILE MANAGEMENT BAR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Saved Profiles</span>
              <span className="text-sm font-semibold text-slate-800">Current: {activeProfileKey}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {Object.keys(savedProfiles).length > 0 && (
              <select
                value={activeProfileKey}
                onChange={(e) => handleLoadProfile(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Default">Select Saved Profile...</option>
                {Object.keys(savedProfiles).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            )}

            <input
              type="text"
              placeholder="Profile Name (e.g. Side-Hustle)"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 w-44"
            />
            <button
              onClick={handleSaveProfile}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-medium transition"
            >
              Save Profile
            </button>
            {activeProfileKey !== "Default" && savedProfiles[activeProfileKey] && (
              <button
                onClick={() => handleDeleteProfile(activeProfileKey)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-medium transition"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT: INPUTS & CALCULATOR PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: INPUT FORM SECTIONS */}
          <div className="lg:col-span-7 space-y-6">
            {/* SECTION 1: MONTHLY FINANCIAL GOALS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Monthly Financial Goals</h2>
                  <p className="text-xs text-slate-500">Personal income target, overhead, and tax obligations</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Desired Monthly Take-Home ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={desiredIncome}
                    onChange={(e) => setDesiredIncome(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Software Subscriptions ({currencySymbol}/mo)
                  </label>
                  <input
                    type="number"
                    value={softwareCost}
                    onChange={(e) => setSoftwareCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Equipment Monthly Cost ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={equipmentCost}
                    onChange={(e) => setEquipmentCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internet & Utilities ({currencySymbol}/mo)
                  </label>
                  <input
                    type="number"
                    value={internetCost}
                    onChange={(e) => setInternetCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Coworking / Office Rent ({currencySymbol}/mo)
                  </label>
                  <input
                    type="number"
                    value={officeCost}
                    onChange={(e) => setOfficeCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Other Business Expenses ({currencySymbol}/mo)
                  </label>
                  <input
                    type="number"
                    value={otherExpenses}
                    onChange={(e) => setOtherExpenses(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Percentage Allocations */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Taxes (%)</label>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Reserve (%)</label>
                  <input
                    type="number"
                    value={savingsPercent}
                    onChange={(e) => setSavingsPercent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Profit Margin (%)</label>
                  <input
                    type="number"
                    value={profitPercent}
                    onChange={(e) => setProfitPercent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: WORKING SCHEDULE */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Working Schedule & Capacity</h2>
                  <p className="text-xs text-slate-500">Calculate realistic billable availability</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Working Days / Month</label>
                  <input
                    type="number"
                    value={workingDaysMonth}
                    onChange={(e) => setWorkingDaysMonth(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Hours / Day</label>
                  <input
                    type="number"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billable Hours %</label>
                  <input
                    type="number"
                    value={billablePercent}
                    onChange={(e) => setBillablePercent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vacation Days / Year</label>
                  <input
                    type="number"
                    value={vacationDaysYear}
                    onChange={(e) => setVacationDaysYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sick / Personal Days / Year</label>
                  <input
                    type="number"
                    value={sickDaysYear}
                    onChange={(e) => setSickDaysYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: PROJECT SCOPE DETAILS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Project Details & Complexity</h2>
                  <p className="text-xs text-slate-500">Custom project quote parameters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={projectHours}
                    onChange={(e) => setProjectHours(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Revision Rounds Included</label>
                  <input
                    type="number"
                    value={revisionRounds}
                    onChange={(e) => setRevisionRounds(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Benchmark</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i.id} value={i.id}>{i.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Radio Selector: Complexity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Project Complexity</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COMPLEXITY_LEVELS.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setComplexity(lvl.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition ${
                        complexity === lvl.id
                          ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-400 text-slate-900 font-semibold"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      <div className="font-bold">{lvl.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Radio Selector: Urgency */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Timeline Urgency</label>
                <div className="grid grid-cols-3 gap-2">
                  {URGENCY_LEVELS.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition ${
                        urgency === u.id
                          ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-400 text-slate-900 font-semibold"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      <div className="font-bold">{u.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{u.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 4: EXPERIENCE LEVEL */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Experience & Seniority</h2>
                  <p className="text-xs text-slate-500">Market positioning multiplier</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setExperience(exp.id)}
                    className={`p-3.5 rounded-xl border text-left text-xs transition ${
                      experience === exp.id
                        ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-400 text-slate-900 font-semibold"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-900">{exp.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{exp.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* SCENARIO SIMULATOR ("What happens if...") */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  <h3 className="text-base font-bold text-white">Scenario Simulator</h3>
                </div>
                <span className="text-xs text-amber-400 font-medium">Instant Recalculation</span>
              </div>

              <p className="text-xs text-slate-300">Test hypothetical business changes and see immediate impact on rates:</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${scenario4Days ? "bg-amber-500/20 border-amber-400" : "bg-slate-800/60 border-slate-700 hover:border-slate-600"}`}>
                  <input
                    type="checkbox"
                    checked={scenario4Days}
                    onChange={(e) => setScenario4Days(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Work 4 Days / Week</span>
                    <span className="text-[11px] text-slate-400">Reduces working days by 20%</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${scenarioIncrease20 ? "bg-amber-500/20 border-amber-400" : "bg-slate-800/60 border-slate-700 hover:border-slate-600"}`}>
                  <input
                    type="checkbox"
                    checked={scenarioIncrease20}
                    onChange={(e) => setScenarioIncrease20(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Increase Pricing +20%</span>
                    <span className="text-[11px] text-slate-400">Boosts target hourly rate</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${scenarioReduceBillable ? "bg-amber-500/20 border-amber-400" : "bg-slate-800/60 border-slate-700 hover:border-slate-600"}`}>
                  <input
                    type="checkbox"
                    checked={scenarioReduceBillable}
                    onChange={(e) => setScenarioReduceBillable(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Reduce Billable Ratio (-15%)</span>
                    <span className="text-[11px] text-slate-400">Simulates more non-billable overhead</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${scenarioHireAssistant ? "bg-amber-500/20 border-amber-400" : "bg-slate-800/60 border-slate-700 hover:border-slate-600"}`}>
                  <input
                    type="checkbox"
                    checked={scenarioHireAssistant}
                    onChange={(e) => setScenarioHireAssistant(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Hire Subcontractor</span>
                    <span className="text-[11px] text-slate-400">+Overhead, +15% billable capacity</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CALCULATED RESULTS, BENCHMARKS & DASHBOARD */}
          <div className="lg:col-span-5 space-y-6">
            {/* PRICING BENCHMARKS CARD */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Pricing Benchmarks</span>
                <span className="text-xs font-normal text-slate-500">Per Hour</span>
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Break-even Rate</span>
                    <span className="text-[11px] text-slate-500">Covers expenses & net income only</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{formatVal(calculations.breakEvenRate, currencySymbol)}/hr</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                  <div>
                    <span className="text-xs font-bold text-blue-900 block">Lowest Safe Price</span>
                    <span className="text-[11px] text-blue-700">Covers taxes, savings & base goal</span>
                  </div>
                  <span className="text-sm font-bold text-blue-900">{formatVal(calculations.lowestSafePrice, currencySymbol)}/hr</span>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-amber-50 border-2 border-amber-400 shadow-xs">
                  <div>
                    <span className="text-xs font-extrabold text-amber-900 block">Ideal Price (Target)</span>
                    <span className="text-[11px] text-amber-700 font-medium">Experience & Complexity Adjusted</span>
                  </div>
                  <span className="text-base font-extrabold text-amber-900">{formatVal(calculations.idealPrice, currencySymbol)}/hr</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                  <div>
                    <span className="text-xs font-bold text-purple-900 block">Premium Price</span>
                    <span className="text-[11px] text-purple-700">Ideal + 30% high-value rate</span>
                  </div>
                  <span className="text-sm font-bold text-purple-900">{formatVal(calculations.premiumPrice, currencySymbol)}/hr</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">Luxury / Enterprise Price</span>
                    <span className="text-[11px] text-emerald-700">Ideal + 70% top-tier positioning</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-900">{formatVal(calculations.luxuryPrice, currencySymbol)}/hr</span>
                </div>
              </div>
            </div>

            {/* PRICE TIERS DISPLAY */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Client Package Tiers
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block">Budget Tier</span>
                  <span className="text-lg font-bold text-slate-900">{formatVal(projectHours * calculations.breakEvenRate, currencySymbol)}</span>
                  <ul className="text-[10px] text-slate-500 mt-2 space-y-1">
                    <li>• Essential deliverables</li>
                    <li>• 1 Revision round</li>
                    <li>• Standard speed</li>
                  </ul>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-300">
                  <span className="text-xs font-bold text-amber-900 block">Standard Tier</span>
                  <span className="text-lg font-bold text-amber-900">{formatVal(calculations.baseProjectQuote, currencySymbol)}</span>
                  <ul className="text-[10px] text-amber-800 mt-2 space-y-1">
                    <li>• Full project scope</li>
                    <li>• {revisionRounds} Revision rounds</li>
                    <li>• Priority support</li>
                  </ul>
                </div>

                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                  <span className="text-xs font-bold text-purple-900 block">Premium Tier</span>
                  <span className="text-lg font-bold text-purple-900">{formatVal(projectHours * calculations.premiumPrice, currencySymbol)}</span>
                  <ul className="text-[10px] text-purple-800 mt-2 space-y-1">
                    <li>• Fast turnaround</li>
                    <li>• 4 Revision rounds</li>
                    <li>• Source files + Consultation</li>
                  </ul>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-900 block">Enterprise Tier</span>
                  <span className="text-lg font-bold text-emerald-900">{formatVal(projectHours * calculations.luxuryPrice, currencySymbol)}</span>
                  <ul className="text-[10px] text-emerald-800 mt-2 space-y-1">
                    <li>• Dedicated priority</li>
                    <li>• Unlimited revisions</li>
                    <li>• SLA & Post-support</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* NEGOTIATION MODE */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Negotiation Mode</h3>
                <span className="text-xs text-slate-500">Client Budget Evaluator</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Proposed Budget ({currencySymbol})
                </label>
                <input
                  type="number"
                  value={clientBudget}
                  onChange={(e) => setClientBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Verdict</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${calculations.negotiationColor}`}>
                    {calculations.negotiationVerdict}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium">
                  {calculations.negotiationDesc}
                </p>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Standard Quote: {formatVal(calculations.baseProjectQuote, currencySymbol)}</span>
                  <span>Difference: {formatVal(calculations.negotiationProfitDelta, currencySymbol)}</span>
                </div>
              </div>
            </div>

            {/* DISCOUNT MODE SLIDER */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Discount Mode</h3>
                <span className="text-xs font-bold text-amber-600">{discountPercent}% Discount</span>
              </div>

              <div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] text-slate-500 block">Original Quote</span>
                  <span className="text-sm font-bold text-slate-800">{formatVal(calculations.baseProjectQuote, currencySymbol)}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <span className="text-[11px] text-amber-800 block">Discounted Quote</span>
                  <span className="text-sm font-bold text-amber-900">{formatVal(calculations.finalDiscountedQuote, currencySymbol)}</span>
                </div>
              </div>
            </div>

            {/* PAYMENT MODE RECOMMENDATION */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Recommended Payment Schedule
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl text-xs">
                  <span className="font-semibold text-slate-700">50% Upfront Deposit</span>
                  <span className="font-bold text-slate-900">{formatVal(calculations.finalDiscountedQuote * 0.5, currencySymbol)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl text-xs">
                  <span className="font-semibold text-slate-700">25% Milestone Approval</span>
                  <span className="font-bold text-slate-900">{formatVal(calculations.finalDiscountedQuote * 0.25, currencySymbol)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl text-xs">
                  <span className="font-semibold text-slate-700">25% Final Delivery</span>
                  <span className="font-bold text-slate-900">{formatVal(calculations.finalDiscountedQuote * 0.25, currencySymbol)}</span>
                </div>
              </div>
            </div>

            {/* SMART INSIGHTS BOX */}
            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/60 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Smart Financial Insights</span>
              </div>

              <div className="space-y-2.5">
                {calculations.insights.map((ins, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-amber-100 shadow-2xs">
                    <span className="text-xs font-bold text-slate-900 block">{ins.title}</span>
                    <p className="text-xs text-slate-600 mt-0.5">{ins.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* VISUAL DASHBOARD SECTION (CHARTS) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Monthly Revenue Allocation Dashboard</h3>
            <p className="text-xs text-slate-500 mt-0.5">Visual breakdown of how your target monthly revenue ({formatVal(calculations.totalRequiredGrossMonthly, currencySymbol)}) is distributed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* SVG DONUT CHART */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <svg viewBox="0 0 100 100" className="w-56 h-56 transform -rotate-90">
                {(() => {
                  const total = calculations.totalRequiredGrossMonthly || 1;
                  const incomePct = (calculations.netPersonalIncome / total) * 100;
                  const costsPct = (calculations.totalBusinessCosts / total) * 100;
                  const taxesPct = (calculations.monthlyTaxes / total) * 100;
                  const savingsPct = (calculations.monthlySavings / total) * 100;
                  const profitPct = (calculations.monthlyProfit / total) * 100;

                  let accumulated = 0;
                  const slices = [
                    { pct: incomePct, color: "#f59e0b" }, // Amber - Income
                    { pct: costsPct, color: "#3b82f6" },  // Blue - Costs
                    { pct: taxesPct, color: "#ef4444" },  // Red - Taxes
                    { pct: savingsPct, color: "#10b981" },// Emerald - Savings
                    { pct: profitPct, color: "#8b5cf6" }, // Purple - Profit
                  ];

                  return slices.map((slice, i) => {
                    const strokeDasharray = `${slice.pct} ${100 - slice.pct}`;
                    const strokeDashoffset = -accumulated;
                    accumulated += slice.pct;

                    return (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="15.91549430918954"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="10"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500 hover:opacity-90"
                      />
                    );
                  });
                })()}
              </svg>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 w-full">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-xs text-slate-700">Income ({formatVal(calculations.netPersonalIncome, currencySymbol)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-xs text-slate-700">Costs ({formatVal(calculations.totalBusinessCosts, currencySymbol)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="text-xs text-slate-700">Taxes ({formatVal(calculations.monthlyTaxes, currencySymbol)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-xs text-slate-700">Savings ({formatVal(calculations.monthlySavings, currencySymbol)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span className="text-xs text-slate-700">Profit ({formatVal(calculations.monthlyProfit, currencySymbol)})</span>
                </div>
              </div>
            </div>

            {/* SVG BAR CHART COMPARISON */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rate Benchmarks Comparison ({currencySymbol}/hr)</h4>
              
              <div className="space-y-3">
                {[
                  { label: "Break-even", val: calculations.breakEvenRate, color: "bg-slate-400" },
                  { label: "Lowest Safe", val: calculations.lowestSafePrice, color: "bg-blue-500" },
                  { label: "Ideal Target", val: calculations.idealPrice, color: "bg-amber-500" },
                  { label: "Premium", val: calculations.premiumPrice, color: "bg-purple-500" },
                  { label: "Enterprise", val: calculations.luxuryPrice, color: "bg-emerald-500" },
                ].map((bar, i) => {
                  const maxVal = calculations.luxuryPrice || 1;
                  const widthPct = Math.min(100, Math.max(15, (bar.val / maxVal) * 100));

                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700">
                        <span>{bar.label}</span>
                        <span className="font-bold">{formatVal(bar.val, currencySymbol)}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${bar.color}`}
                          style={{ width: `${widthPct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">
            Calculations run completely client-side in your browser. Data is saved locally.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
            >
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
            >
              Print Summary
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Download PDF Quote
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

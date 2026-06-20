"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AED", label: "UAE Dirham (AED)" },
];

const categories = [
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "apparel", label: "Apparel & Fashion" },
  { value: "fitness", label: "Fitness & Health" },
  { value: "home", label: "Home & Kitchen" },
  { value: "education", label: "Books & Education" },
  { value: "hobbies", label: "Hobbies & Recreation" },
  { value: "software", label: "Software & Subscriptions" },
  { value: "other", label: "Other / Uncategorized" },
];

const lifetimes = [
  { value: "0.083", label: "1 Month" },
  { value: "0.25", label: "3 Months" },
  { value: "0.5", label: "6 Months" },
  { value: "1", label: "1 Year" },
  { value: "2", label: "2 Years" },
  { value: "3", label: "3 Years" },
  { value: "5", label: "5 Years" },
  { value: "10", label: "10 Years" },
];

const frequencyPeriods = [
  { value: "day", label: "per Day" },
  { value: "week", label: "per Week" },
  { value: "month", label: "per Month" },
  { value: "year", label: "per Year" },
];

const alternativeOptions = [
  { value: "none", label: "No, this is the only viable option" },
  { value: "low_quality", label: "Yes, but it is lower quality or less convenient" },
  { value: "borrow_rent", label: "Yes, I can borrow, rent, or use what I have" },
];

const replacementOptions = [
  { value: "broken", label: "Yes, replacing a broken/unusable item" },
  { value: "working_outdated", label: "Yes, but the current item still works" },
  { value: "none", label: "No, this is a brand new addition" },
];

function parseNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value, currency) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function ScoreCircle({ score, label, desc }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-red-500";
  if (score >= 80) {
    colorClass = "text-emerald-600";
  } else if (score >= 50) {
    colorClass = "text-amber-500";
  }

  return (
    <div className="flex flex-col items-center p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition duration-200">
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="text-slate-100 stroke-current"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            className={`stroke-current ${colorClass} transition-all duration-500 ease-out`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-2xl font-extrabold text-slate-800">{score}%</span>
      </div>
      <p className="mt-3 font-semibold text-slate-700 text-sm text-center">{label}</p>
      <p className="mt-1 text-xs text-slate-500 text-center max-w-[160px]">{desc}</p>
    </div>
  );
}

export default function PurchaseIntelligencePage() {
  const [productName, setProductName] = useState("Vaporfly Running Shoes");
  const [price, setPrice] = useState("250");
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState("fitness");
  
  // Questions and inputs
  const [needWant, setNeedWant] = useState("want");
  const [frequencyTimes, setFrequencyTimes] = useState("3");
  const [frequencyPeriod, setFrequencyPeriod] = useState("week");
  const [lifetime, setLifetime] = useState("2");
  const [alternative, setAlternative] = useState("low_quality");
  const [replacement, setReplacement] = useState("none");
  const [hourlyWage, setHourlyWage] = useState("");

  const [toast, setToast] = useState({ type: "", message: "" });
  const [animateCards, setAnimateCards] = useState(false);
  const toastTimerRef = useRef(null);

  const validationError = useMemo(() => {
    const parsedPrice = parseNumber(price);
    const parsedFrequency = parseNumber(frequencyTimes);
    const parsedWage = hourlyWage === "" ? 0 : parseNumber(hourlyWage);

    if (!productName.trim()) {
      return "Enter a product name.";
    }

    if (parsedPrice === null || parsedPrice < 0) {
      return "Enter a valid product price.";
    }

    if (parsedFrequency === null || parsedFrequency <= 0) {
      return "Enter a usage frequency greater than 0.";
    }

    if (parsedWage === null || parsedWage < 0) {
      return "Enter a valid hourly wage.";
    }

    return "";
  }, [productName, price, frequencyTimes, hourlyWage]);

  // Calculations
  const analysis = useMemo(() => {
    if (validationError) {
      return null;
    }

    const parsedPrice = Number(price);
    const parsedFrequency = Number(frequencyTimes);
    const parsedLifetime = Number(lifetime);
    const parsedWage = hourlyWage !== "" ? Number(hourlyWage) : null;

    // 1. Total Lifetime Uses
    let multiplier = 1;
    if (frequencyPeriod === "day") multiplier = 365;
    else if (frequencyPeriod === "week") multiplier = 52;
    else if (frequencyPeriod === "month") multiplier = 12;
    else if (frequencyPeriod === "year") multiplier = 1;

    const totalUsesPerYear = parsedFrequency * multiplier;
    const totalLifetimeUses = Math.max(1, Math.round(totalUsesPerYear * parsedLifetime));

    // 2. Cost Per Use
    const costPerUse = parsedPrice / totalLifetimeUses;

    // 3. Purchase Score (0 - 100)
    let purchaseScore = 50;

    // Need or Want
    if (needWant === "need") {
      purchaseScore += 25;
    } else {
      purchaseScore += 5;
    }

    // Alternatives
    if (alternative === "none") {
      purchaseScore += 15;
    } else if (alternative === "low_quality") {
      purchaseScore += 5;
    } else if (alternative === "borrow_rent") {
      purchaseScore -= 15;
    }

    // Replacing
    if (replacement === "broken") {
      purchaseScore += 15;
    } else if (replacement === "working_outdated") {
      purchaseScore -= 5;
    } else if (replacement === "none") {
      purchaseScore += 0;
    }

    // Frequency
    if (totalUsesPerYear >= 100) {
      purchaseScore += 10;
    } else if (totalUsesPerYear >= 24) {
      purchaseScore += 5;
    } else {
      purchaseScore -= 10;
    }

    // Value factor (Cost per use compared to overall price)
    const costPerUseRatio = costPerUse / Math.max(1, parsedPrice);
    if (costPerUseRatio > 0.1) {
      purchaseScore -= 15; // extremely few uses relative to cost
    } else if (costPerUseRatio < 0.01) {
      purchaseScore += 10; // highly repeated value
    }

    purchaseScore = Math.max(0, Math.min(100, purchaseScore));

    // 4. Usage Reality Score (0 - 100)
    let realityScore = 85;

    // Want vs Need
    if (needWant === "want") {
      realityScore -= 15;
    } else {
      realityScore += 5;
    }

    // Replacement
    if (replacement === "broken") {
      realityScore += 10;
    } else if (replacement === "working_outdated") {
      realityScore += 5;
    } else if (replacement === "none") {
      realityScore -= 15; // New habit required
    }

    // Category check
    if (category === "fitness") realityScore -= 15;
    else if (category === "education") realityScore -= 10;
    else if (category === "hobbies") realityScore -= 10;
    else if (category === "apparel") realityScore -= 5;
    else if (category === "software") realityScore -= 5;

    // Planning Fallacy Penalty
    if (needWant === "want" && replacement === "none" && frequencyPeriod === "day" && parsedFrequency >= 1) {
      realityScore -= 15; // Unrealistic daily use for new want
    } else if (needWant === "want" && replacement === "none" && frequencyPeriod === "week" && parsedFrequency >= 5) {
      realityScore -= 8;
    }

    realityScore = Math.max(0, Math.min(100, realityScore));

    // 5. Buy / Wait / Reconsider Recommendation
    let recommendation = "wait";
    let recommendationColor = "bg-amber-50 border-amber-200 text-amber-800";
    let recommendationBadge = "bg-amber-100 text-amber-800 border-amber-300";
    let recommendationMsg = "Wait 48 hours or 30 days. This could be an impulse buy. Sleeping on it will confirm if the desire or need is real.";

    if (purchaseScore >= 80) {
      recommendation = "buy";
      recommendationColor = "bg-emerald-50 border-emerald-200 text-emerald-800";
      recommendationBadge = "bg-emerald-100 text-emerald-800 border-emerald-300";
      recommendationMsg = "Looks like a sensible purchase. High score suggests high utility, proven habit, and solid value.";
    } else if (purchaseScore < 50) {
      recommendation = "reconsider";
      recommendationColor = "bg-red-50 border-red-200 text-red-800";
      recommendationBadge = "bg-red-100 text-red-800 border-red-300";
      recommendationMsg = "High risk of regret. Very high cost per use, readily available alternatives, or low necessity. Consider renting, borrowing, or skipping.";
    }

    // 6. Spending Impact
    const monthlyImpact = parsedPrice / (parsedLifetime * 12);
    const yearlyImpact = parsedPrice / parsedLifetime;
    const hoursWorkRequired = parsedWage ? parsedPrice / parsedWage : null;

    // 7. Insights
    let impulseRisk = "Medium";
    let impulseRiskDesc = "Standard discretion applies. Review alternatives before proceeding.";
    if (needWant === "want" && replacement === "none" && parsedPrice > 100) {
      impulseRisk = "High";
      impulseRiskDesc = "Brand new item with high cost and pure want status. High risk of buyers remorse.";
    } else if (needWant === "need" && replacement === "broken") {
      impulseRisk = "Low";
      impulseRiskDesc = "Functional replacement of an essential item. Very low impulse risk.";
    }

    let longTermValue = "Fair";
    let longTermValueDesc = "Modest repeat value relative to price.";
    if (costPerUseRatio < 0.01) {
      longTermValue = "Excellent";
      longTermValueDesc = "Extremely low cost per use. Great long-term investment utility.";
    } else if (costPerUseRatio > 0.1) {
      longTermValue = "Poor";
      longTermValueDesc = "Very high cost per single use. Check if renting makes more sense.";
    }

    return {
      totalLifetimeUses,
      costPerUse,
      purchaseScore,
      realityScore,
      recommendation,
      recommendationColor,
      recommendationBadge,
      recommendationMsg,
      monthlyImpact,
      yearlyImpact,
      hoursWorkRequired,
      impulseRisk,
      impulseRiskDesc,
      longTermValue,
      longTermValueDesc,
    };
  }, [price, frequencyTimes, frequencyPeriod, lifetime, needWant, alternative, replacement, category, hourlyWage, validationError]);

  const showToast = (type, message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 1800);
  };

  const copyAnalysis = async () => {
    if (!analysis) return;

    const categoryLabel = categories.find((c) => c.value === category)?.label ?? category;
    const lifetimeLabel = lifetimes.find((l) => l.value === lifetime)?.label ?? `${lifetime} years`;
    const alternativeLabel = alternativeOptions.find((a) => a.value === alternative)?.label ?? alternative;
    const replacementLabel = replacementOptions.find((r) => r.value === replacement)?.label ?? replacement;

    const reportText = [
      "=== PURCHASE INTELLIGENCE REPORT ===",
      `Product Name: ${productName}`,
      `Category: ${categoryLabel}`,
      `Price: ${formatCurrency(price, currency)}`,
      `Lifetime: ${lifetimeLabel}`,
      `Hourly Wage: ${hourlyWage ? formatCurrency(hourlyWage, currency) + "/hr" : "Not specified"}`,
      "",
      "--- Questions & Answers ---",
      `* Need or Want? : ${needWant === "need" ? "Need" : "Want"}`,
      `* Usage Frequency : ${frequencyTimes} times ${frequencyPeriods.find(p => p.value === frequencyPeriod)?.label}`,
      `* Alternative? : ${alternativeLabel}`,
      `* Replacing? : ${replacementLabel}`,
      "",
      "--- Analysis & Scores ---",
      `* Purchase Score: ${analysis.purchaseScore}/100`,
      `* Usage Reality Score: ${analysis.realityScore}/100`,
      `* Recommendation: ${analysis.recommendation.toUpperCase()}`,
      `  (${analysis.recommendationMsg})`,
      "",
      "--- Value & Financials ---",
      `* Cost Per Use Estimate: ${formatCurrency(analysis.costPerUse, currency)}`,
      `* Total Lifetime Uses: ${analysis.totalLifetimeUses}`,
      `* Monthly Spending Impact: ${formatCurrency(analysis.monthlyImpact, currency)}`,
      `* Yearly Spending Impact: ${formatCurrency(analysis.yearlyImpact, currency)}`,
      analysis.hoursWorkRequired ? `* Work Hours Needed to Pay: ${analysis.hoursWorkRequired.toFixed(1)} hours` : "",
      "",
      "--- Insights ---",
      `* Impulse Risk: ${analysis.impulseRisk} (${analysis.impulseRiskDesc})`,
      `* Long-Term Value: ${analysis.longTermValue} (${analysis.longTermValueDesc})`,
      "===================================="
    ].filter(Boolean).join("\n");

    try {
      await navigator.clipboard.writeText(reportText);
      showToast("success", "Analysis copied to clipboard.");
    } catch {
      showToast("error", "Copy failed. Try again.");
    }
  };

  const clearForm = () => {
    setProductName("");
    setPrice("");
    setNeedWant("want");
    setFrequencyTimes("1");
    setFrequencyPeriod("week");
    setLifetime("1");
    setAlternative("none");
    setReplacement("none");
    setHourlyWage("");
    setCategory("other");
    showToast("success", "Inputs cleared.");
  };

  useEffect(() => {
    if (!analysis) {
      setAnimateCards(false);
      return undefined;
    }
    setAnimateCards(true);
    const timer = window.setTimeout(() => setAnimateCards(false), 200);
    return () => window.clearTimeout(timer);
  }, [analysis]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showEmptyState = !analysis && !validationError;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Decision Support</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Purchase Intelligence</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Evaluate purchases objectively. Uncover cost-per-use, gauge usage realism, and make smarter buying decisions.
          </p>
        </div>

        {/* Main Grid: Form Inputs & Quick Recommendation / Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
          
          {/* Inputs Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">Inputs</p>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">Product & Frequency</h2>
                </div>
                <button
                  type="button"
                  onClick={clearForm}
                  className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-gradient-to-r from-white to-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm shadow-amber-100/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:from-amber-50 hover:to-amber-100 hover:text-amber-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  Clear Form
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {/* Product Name */}
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Product Name</span>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Vaporfly Running Shoes"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                {/* Price, Currency, Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-slate-700">Product Price</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 250"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-slate-700">Currency</span>
                    <ThemedDropdown
                      ariaLabel="Select currency"
                      value={currency}
                      options={currencies}
                      onChange={setCurrency}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-slate-700">Category</span>
                    <ThemedDropdown
                      ariaLabel="Select category"
                      value={category}
                      options={categories}
                      onChange={setCategory}
                    />
                  </label>
                </div>

                {/* Expected Usage Frequency inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex flex-col gap-2 sm:col-span-1">
                    <span className="text-sm font-semibold text-slate-700">Expected Usage</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={frequencyTimes}
                      onChange={(e) => setFrequencyTimes(e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </label>

                  <label className="flex flex-col gap-2 sm:col-span-1">
                    <span className="text-sm font-semibold text-slate-700">How often will it be used?</span>
                    <ThemedDropdown
                      ariaLabel="Usage period"
                      value={frequencyPeriod}
                      options={frequencyPeriods}
                      onChange={setFrequencyPeriod}
                    />
                  </label>

                  <label className="flex flex-col gap-2 sm:col-span-1">
                    <span className="text-sm font-semibold text-slate-700">Expected Lifetime</span>
                    <ThemedDropdown
                      ariaLabel="Expected lifetime"
                      value={lifetime}
                      options={lifetimes}
                      onChange={setLifetime}
                    />
                  </label>
                </div>

                {/* Hourly Wage */}
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Your Hourly Wage <span className="text-xs font-normal text-slate-400">(Optional - computes labor hours equivalent)</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={hourlyWage}
                    onChange={(e) => setHourlyWage(e.target.value)}
                    placeholder="e.g. 30"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>
              </div>
            </div>

            {validationError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                <p className="text-sm font-bold">Please resolve the following input issue:</p>
                <p className="text-sm mt-1">{validationError}</p>
              </div>
            )}
          </div>

          {/* Questions Section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Qualitative Questions</p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950 mt-1 mb-6 border-b border-slate-200/60 pb-4">
                Be honest with yourself
              </h2>

              <div className="grid grid-cols-1 gap-5">
                {/* Need or Want */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Is this a need or a want?</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNeedWant("need")}
                      className={`rounded-xl py-3 border font-semibold transition ${
                        needWant === "need"
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Need
                    </button>
                    <button
                      type="button"
                      onClick={() => setNeedWant("want")}
                      className={`rounded-xl py-3 border font-semibold transition ${
                        needWant === "want"
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Want
                    </button>
                  </div>
                </div>

                {/* Alternatives */}
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Is there an alternative?</span>
                  <ThemedDropdown
                    ariaLabel="Alternatives availability"
                    value={alternative}
                    options={alternativeOptions}
                    onChange={setAlternative}
                  />
                </label>

                {/* Replacement */}
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Is this replacing something?</span>
                  <ThemedDropdown
                    ariaLabel="Replacing option"
                    value={replacement}
                    options={replacementOptions}
                    onChange={setReplacement}
                  />
                </label>
              </div>
            </div>

            {showEmptyState && (
              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center">
                <p className="text-sm text-slate-500 font-medium">Scores & recommendations will appear below as you fill out the details.</p>
              </div>
            )}
          </div>

        </div>

        {/* Results Panel */}
        {analysis && (
          <div className="flex flex-col gap-6 mt-2">
            
            {/* Recommendation Header Card */}
            <div className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 transition duration-200 ${analysis.recommendationColor}`}>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border tracking-wide inline-block ${analysis.recommendationBadge}`}>
                  {analysis.recommendation}
                </span>
                <p className="mt-2 text-base font-semibold max-w-xl leading-relaxed">
                  {analysis.recommendationMsg}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={copyAnalysis}
                  className="rounded-xl bg-slate-900 border border-slate-900 hover:bg-black text-white px-5 py-3 text-sm font-semibold shadow-sm transition active:scale-[0.98]"
                >
                  Copy Analysis
                </button>
              </div>
            </div>

            {/* Score Circles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ScoreCircle
                score={analysis.purchaseScore}
                label="Purchase Score"
                desc="Measures utility, necessity, replacement value, and cost worthiness."
              />
              <ScoreCircle
                score={analysis.realityScore}
                label="Usage Reality Score"
                desc="Adjusts for planning fallacy, category risk, and habit durability."
              />
            </div>

            {/* Financial Estimates & Impact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cost per use */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition duration-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cost Per Use Estimate</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
                  {formatCurrency(analysis.costPerUse, currency)}
                </p>
                <p className="mt-1.5 text-xs text-slate-500 leading-normal">
                  Based on <strong className="text-slate-800">{analysis.totalLifetimeUses} total uses</strong> over the expected lifetime.
                </p>
              </div>

              {/* Monthly Spending Impact */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition duration-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Cost Impact</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
                  {formatCurrency(analysis.monthlyImpact, currency)}
                </p>
                <p className="mt-1.5 text-xs text-slate-500 leading-normal">
                  Amortized cost per month over the item's expected lifespan.
                </p>
              </div>

              {/* Yearly Spending Impact */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition duration-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Yearly Cost Impact</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
                  {formatCurrency(analysis.yearlyImpact, currency)}
                </p>
                <p className="mt-1.5 text-xs text-slate-500 leading-normal">
                  Amortized cost per year over the item's expected lifespan.
                </p>
              </div>
            </div>

            {/* Insights and Labor Hour Equivalent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Labor hours details if wage entered */}
              {analysis.hoursWorkRequired !== null ? (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Labor Hour Equivalent</p>
                    <p className="mt-2 text-3xl font-extrabold text-amber-950 tabular-nums">
                      {analysis.hoursWorkRequired.toFixed(1)} Hours
                    </p>
                  </div>
                  <p className="mt-3 text-xs text-amber-700 leading-normal">
                    You need to work approximately <strong className="text-amber-950">{analysis.hoursWorkRequired.toFixed(1)} hours</strong> at {formatCurrency(hourlyWage, currency)}/hr to purchase this item.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-5 flex items-center justify-center text-center">
                  <p className="text-xs text-slate-500 max-w-[280px]">
                    Enter your hourly wage in the inputs block to calculate how many hours of work this purchase costs.
                  </p>
                </div>
              )}

              {/* Qualitative Insights */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Impulse Risk</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      analysis.impulseRisk === "High" ? "bg-red-500" : analysis.impulseRisk === "Medium" ? "bg-amber-400" : "bg-emerald-500"
                    }`} />
                    <span className="font-semibold text-slate-800 text-sm">{analysis.impulseRisk} Risk</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-normal">{analysis.impulseRiskDesc}</p>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Long-term Value</p>
                  <p className="mt-1 font-semibold text-slate-800 text-sm">{analysis.longTermValue} Utility</p>
                  <p className="mt-1 text-xs text-slate-500 leading-normal">{analysis.longTermValueDesc}</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Accuracy and Theory Note */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Decision Psychology Note</p>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            The Purchase Score weights utility, necessity, and alternative options. The Usage Reality Score adjusts for the Planning Fallacy, recognizing that we overestimate usage for fitness and educational items, and underestimate habits we haven't already established (brand new purchases vs. broken replacements).
          </p>
        </div>

      </div>

      {/* Floating Toast Notification */}
      {toast.message && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-3 text-sm shadow-xl font-semibold border ${
            toast.type === "error" ? "bg-red-600 text-white border-red-700" : "bg-slate-900 text-white border-slate-950"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const TOOL_STATUS = "live";

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other / Prefer not to say" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "active", label: "Active" },
  { value: "very-active", label: "Very Active" },
];

const CLIMATE_OPTIONS = [
  { value: "cold", label: "Cold" },
  { value: "moderate", label: "Moderate" },
  { value: "hot", label: "Hot" },
];

const DEFAULTS = {
  age: "30",
  weight: "70",
  gender: "male",
  activityLevel: "moderate",
  climate: "moderate",
};

const GLASS_LITERS = 0.25;
const GAUGE_CAP_LITERS = 5;

function parseNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatValue(value, digits = 2) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value) || 0);
}

function formatWhole(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function getAgeAdjustmentFactor(age) {
  if (age < 18) {
    return 1.05;
  }

  if (age < 31) {
    return 1;
  }

  if (age < 51) {
    return 0.98;
  }

  if (age < 65) {
    return 0.95;
  }

  return 0.92;
}

function getBaseLiters(age, weightKg) {
  if (age < 4) {
    return 1.2;
  }

  if (age < 9) {
    return 1.5;
  }

  if (age < 14) {
    return 1.9;
  }

  if (age < 18) {
    return Math.max(weightKg * 0.033, 2.1);
  }

  return weightKg * 0.033;
}

function getGenderFactor(gender, age) {
  if (age < 14) {
    return 1;
  }

  if (gender === "male") {
    return 1.03;
  }

  if (gender === "female") {
    return 0.97;
  }

  return 1;
}

function getActivityFactor(activityLevel) {
  const factors = {
    sedentary: 0.95,
    light: 1,
    moderate: 1.1,
    active: 1.2,
    "very-active": 1.3,
  };

  return factors[activityLevel] ?? 1;
}

function getClimateFactor(climate) {
  const factors = {
    cold: 0.95,
    moderate: 1,
    hot: 1.1,
  };

  return factors[climate] ?? 1;
}

function getActivityLabel(activityLevel) {
  return ACTIVITY_OPTIONS.find((option) => option.value === activityLevel)?.label ?? activityLevel;
}

function getClimateLabel(climate) {
  return CLIMATE_OPTIONS.find((option) => option.value === climate)?.label ?? climate;
}

function getGenderLabel(gender) {
  return GENDER_OPTIONS.find((option) => option.value === gender)?.label ?? gender;
}

function StatCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function InsightCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function buildReport({ age, weightKg, gender, activityLevel, climate, result }) {
  return [
    "Water Intake Calculator Report",
    `Generated: ${new Date().toLocaleString("en-IN")}`,
    "",
    `Age: ${formatWhole(age)} years`,
    `Weight: ${formatValue(weightKg, 1)} kg`,
    `Gender: ${getGenderLabel(gender)}`,
    `Activity level: ${getActivityLabel(activityLevel)}`,
    `Climate: ${getClimateLabel(climate)}`,
    "",
    `Base intake: ${formatValue(result.baseLiters, 2)} L`,
    `Age adjustment: ${result.ageAdjustment >= 0 ? "+" : ""}${formatValue(result.ageAdjustment, 2)} L`,
    `Gender adjustment: ${result.genderAdjustment >= 0 ? "+" : ""}${formatValue(result.genderAdjustment, 2)} L`,
    `Activity adjustment: ${result.activityAdjustment >= 0 ? "+" : ""}${formatValue(result.activityAdjustment, 2)} L`,
    `Weather adjustment: ${result.weatherAdjustment >= 0 ? "+" : ""}${formatValue(result.weatherAdjustment, 2)} L`,
    `Recommended daily intake: ${formatValue(result.dailyLiters, 2)} L`,
    `Daily water intake in glasses: ${formatValue(result.dailyGlasses, 1)} glasses`,
    `Hourly hydration target: ${formatValue(result.hourlyLiters, 2)} L/hour`,
    `Approximate hourly target: ${formatValue(result.hourlyGlasses, 1)} glasses/hour`,
    `Hydration tips: ${result.tips.join(" | ")}`,
  ].join("\n");
}

function WaterGauge({ dailyLiters, fillPercent }) {
  const ticks = [25, 50, 75];

  return (
    <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Water progress visualization</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Recommended target fill</h3>
          <p className="mt-1 text-sm text-slate-500">Shown against a 5 L reference bottle.</p>
        </div>
        <div className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold text-sky-700">
          {formatValue(dailyLiters, 2)} L target
        </div>
      </div>

      <div className="mt-5 flex items-end gap-4">
        <div className="relative h-64 w-24 overflow-hidden rounded-[2rem] border border-sky-200 bg-sky-100 shadow-inner">
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sky-600 via-sky-500 to-cyan-300 transition-all duration-500 ease-out"
            style={{ height: `${fillPercent}%` }}
          />
          <div className="absolute inset-x-0 top-0 border-b border-white/70 bg-white/10 px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-800">
            Water
          </div>
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute inset-x-3 flex items-center justify-between text-[10px] font-semibold text-sky-900/50"
              style={{ bottom: `${tick}%` }}
            >
              <span className="h-px w-4 bg-white/80" />
              <span>{tick}%</span>
            </div>
          ))}
        </div>

        <div className="flex-1 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
              <span>Filled target</span>
              <span>{formatValue(fillPercent, 0)}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500 ease-out"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              A visual cue for the estimated daily goal, not a live intake tracker.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Daily target</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{formatValue(dailyLiters, 2)} L</p>
              <p className="mt-1 text-sm text-slate-500">Recommended for this profile.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Hourly target</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatValue(dailyLiters / 16, 2)} L/hr
              </p>
              <p className="mt-1 text-sm text-slate-500">Spread across waking hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WaterIntakeCalculatorPage() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [activityLevel, setActivityLevel] = useState(DEFAULTS.activityLevel);
  const [climate, setClimate] = useState(DEFAULTS.climate);
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);

  const validationError = useMemo(() => {
    const parsedAge = parseNumber(age);
    const parsedWeight = parseNumber(weight);

    if (parsedAge === null) {
      return "Enter a valid age in years.";
    }

    if (parsedAge < 1 || parsedAge > 120) {
      return "Age should be between 1 and 120 years.";
    }

    if (parsedWeight === null) {
      return "Enter a valid weight in kilograms.";
    }

    if (parsedWeight < 1 || parsedWeight > 400) {
      return "Weight should be between 1 and 400 kg.";
    }

    return "";
  }, [age, weight]);

  const result = useMemo(() => {
    const parsedAge = parseNumber(age);
    const parsedWeight = parseNumber(weight);

    if (validationError || parsedAge === null || parsedWeight === null) {
      return null;
    }

    const ageFactor = getAgeAdjustmentFactor(parsedAge);
    const genderFactor = getGenderFactor(gender, parsedAge);
    const activityFactor = getActivityFactor(activityLevel);
    const weatherFactor = getClimateFactor(climate);

    const baseLiters = getBaseLiters(parsedAge, parsedWeight);
    const afterAgeAdjustment = baseLiters * ageFactor;
    const afterGenderAdjustment = afterAgeAdjustment * genderFactor;
    const afterActivityAdjustment = afterGenderAdjustment * activityFactor;
    const dailyLiters = clamp(afterActivityAdjustment * weatherFactor, 0.8, 6);

    const ageAdjustment = afterAgeAdjustment - baseLiters;
    const genderAdjustment = afterGenderAdjustment - afterAgeAdjustment;
    const activityAdjustment = afterActivityAdjustment - afterGenderAdjustment;
    const weatherAdjustment = dailyLiters - afterActivityAdjustment;
    const dailyGlasses = dailyLiters / GLASS_LITERS;
    const hourlyLiters = dailyLiters / 16;
    const hourlyGlasses = hourlyLiters / GLASS_LITERS;
    const fillPercent = clamp((dailyLiters / GAUGE_CAP_LITERS) * 100, 8, 100);

    const tips = [
      "Sip water throughout the day instead of waiting until you feel very thirsty.",
      "Pair a glass of water with meals and after waking up to build a simple routine.",
      activityLevel === "very-active" || climate === "hot"
        ? "Add extra fluids after heavy sweating, travel, or long outdoor sessions."
        : "Keep a bottle nearby so small sips become effortless habits.",
    ];

    return {
      baseLiters,
      ageAdjustment,
      genderAdjustment,
      activityAdjustment,
      weatherAdjustment,
      dailyLiters,
      dailyGlasses,
      hourlyLiters,
      hourlyGlasses,
      fillPercent,
      tips,
    };
  }, [activityLevel, age, climate, gender, validationError, weight]);

  const summaryText = useMemo(() => {
    if (validationError) {
      return validationError;
    }

    if (!result) {
      return "Enter your details to estimate a practical daily water target.";
    }

    return `Estimated daily intake is ${formatValue(result.dailyLiters, 2)} L (${formatValue(result.dailyGlasses, 1)} glasses) for this profile.`;
  }, [result, validationError]);

  const reportText = useMemo(() => {
    if (!result) {
      return "";
    }

    return buildReport({
      age: parseNumber(age) || 0,
      weightKg: parseNumber(weight) || 0,
      gender,
      activityLevel,
      climate,
      result,
    });
  }, [activityLevel, age, climate, gender, result, weight]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (type, message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 1800);
  };

  const copyResults = async () => {
    if (!reportText) {
      showToast("error", "Enter valid inputs first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(reportText);
      showToast("success", "Results copied to clipboard.");
    } catch {
      showToast("error", "Copy failed. Try again.");
    }
  };

  const downloadReport = () => {
    if (!reportText || typeof window === "undefined") {
      showToast("error", "Enter valid inputs first.");
      return;
    }

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "water-intake-calculator-report.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("success", "Report downloaded.");
  };

  const resetForm = () => {
    setAge(DEFAULTS.age);
    setWeight(DEFAULTS.weight);
    setGender(DEFAULTS.gender);
    setActivityLevel(DEFAULTS.activityLevel);
    setClimate(DEFAULTS.climate);
    setToast({ type: "", message: "" });
    showToast("success", "Inputs reset.");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 font-sans sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-8">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Health</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Water Intake Calculator</h1>
          <p className="mx-auto max-w-2xl text-base text-slate-500">
            Estimate a practical daily water target using age, weight, gender, activity level, and climate.
          </p>
          <p className="text-sm text-slate-500">{summaryText}</p>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-[1.02fr_0.98fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Inputs</p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Tell us a bit about your routine</h2>
              <p className="text-sm text-slate-500">Weight is entered in kilograms and the result is recalculated instantly.</p>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Age</span>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    step="1"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    placeholder="Enter age in years"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Weight (kg)</span>
                  <input
                    type="number"
                    min="1"
                    max="400"
                    step="0.1"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    placeholder="Enter weight in kg"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Gender</span>
                  <ThemedDropdown
                    ariaLabel="Choose gender"
                    value={gender}
                    options={GENDER_OPTIONS}
                    onChange={(value) => setGender(value)}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Activity Level</span>
                  <ThemedDropdown
                    ariaLabel="Choose activity level"
                    value={activityLevel}
                    options={ACTIVITY_OPTIONS}
                    onChange={(value) => setActivityLevel(value)}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-900">Climate</span>
                <ThemedDropdown
                  ariaLabel="Choose climate"
                  value={climate}
                  options={CLIMATE_OPTIONS}
                  onChange={(value) => setClimate(value)}
                />
              </label>

              {validationError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  <p className="text-sm font-semibold">Please fix the input issue below.</p>
                  <p className="text-sm">{validationError}</p>
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Calculation model</p>
                <p className="mt-2">
                  The result starts with a body-weight baseline, then adjusts for age, gender, activity, and weather.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6">
            <WaterGauge dailyLiters={result?.dailyLiters ?? 0} fillPercent={result?.fillPercent ?? 0} />

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <StatCard
                label="Recommended daily intake"
                value={result ? `${formatValue(result.dailyLiters, 2)} L` : "--"}
                subtitle="Estimated liters per day"
              />
              <StatCard
                label="Daily water intake"
                value={result ? `${formatValue(result.dailyGlasses, 1)} glasses` : "--"}
                subtitle={`Using ${formatValue(GLASS_LITERS, 2)} L glasses`}
              />
              <StatCard
                label="Hourly hydration target"
                value={result ? `${formatValue(result.hourlyLiters, 2)} L/hr` : "--"}
                subtitle={result ? `${formatValue(result.hourlyGlasses, 1)} glasses/hr` : "Spread evenly"}
              />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <InsightCard
                label="Hydration tips"
                value="Stay steady"
                subtitle={result ? result.tips.join(" ") : "Small, regular sips are easier to maintain than large swings."}
              />
              <InsightCard
                label="Activity adjustment"
                value={result ? `${result.activityAdjustment >= 0 ? "+" : ""}${formatValue(result.activityAdjustment, 2)} L/day` : "--"}
                subtitle={getActivityLabel(activityLevel)}
              />
              <InsightCard
                label="Weather adjustment"
                value={result ? `${result.weatherAdjustment >= 0 ? "+" : ""}${formatValue(result.weatherAdjustment, 2)} L/day` : "--"}
                subtitle={getClimateLabel(climate)}
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={copyResults}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-orange-200 bg-gradient-to-r from-white to-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 shadow-sm shadow-orange-100/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:from-orange-50 hover:to-orange-100 hover:text-orange-800 hover:shadow-md hover:shadow-orange-200/60 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Copy results
              </button>
              <button
                type="button"
                onClick={downloadReport}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Download report
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Reset
              </button>
            </div>
          </section>
        </div>

        {toast.message ? (
          <div
            className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-sm shadow-lg animate-fade-in-out ${toast.type === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`}
          >
            {toast.message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
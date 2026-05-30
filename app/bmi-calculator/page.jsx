"use client";

import ComingSoon from "@/app/components/ComingSoon";
import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const TOOL_STATUS = "upcoming";

const HEIGHT_UNIT_OPTIONS = [
  { value: "cm", label: "cm" },
  { value: "ft-in", label: "ft/in" },
];

const WEIGHT_UNIT_OPTIONS = [
  { value: "kg", label: "kg" },
  { value: "lb", label: "lb" },
];

function parseNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(Number(value) || 0);
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) {
    return "Underweight";
  }

  if (bmi < 25) {
    return "Normal";
  }

  if (bmi < 30) {
    return "Overweight";
  }

  return "Obese";
}

function getDifferenceNote(weightKg, healthyMinKg, healthyMaxKg) {
  if (weightKg < healthyMinKg) {
    return {
      value: healthyMinKg - weightKg,
      direction: "below",
      suggestion: "Gain",
    };
  }

  if (weightKg > healthyMaxKg) {
    return {
      value: weightKg - healthyMaxKg,
      direction: "above",
      suggestion: "Lose",
    };
  }

  return {
    value: 0,
    direction: "within",
    suggestion: "Maintain",
  };
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

function buildReport({ heightUnit, weightUnit, heightCmRaw, heightFtRaw, heightInRaw, weightRaw, result }) {
  const heightEntry =
    heightUnit === "cm"
      ? `${heightCmRaw} cm`
      : `${heightFtRaw} ft ${heightInRaw} in`;
  const weightEntry = `${weightRaw} ${weightUnit}`;

  return [
    "BMI Calculator Report",
    `Generated: ${new Date().toLocaleString("en-IN")}`,
    `Height unit: ${heightUnit}`,
    `Weight unit: ${weightUnit}`,
    `Height entered: ${heightEntry}`,
    `Weight entered: ${weightEntry}`,
    "",
    `BMI score: ${formatNumber(result.bmi, 2)}`,
    `BMI category: ${result.category}`,
    `Healthy BMI range: 18.5 to 24.9`,
    `Healthy weight range: ${formatNumber(result.healthyMinKg, 1)} kg to ${formatNumber(result.healthyMaxKg, 1)} kg`,
    `Difference from ideal range: ${result.difference.direction === "within" ? "Within ideal range" : `${result.difference.suggestion} ${formatNumber(result.difference.value, 1)} kg to reach ideal range`}`,
    `Scale position: ${formatNumber(result.scalePosition, 1)}%`,
  ].join("\n");
}

export default function BmiCalculatorPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="BMI Calculator" />;
  }

  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [heightCmInput, setHeightCmInput] = useState("170");
  const [heightFtInput, setHeightFtInput] = useState("5");
  const [heightInInput, setHeightInInput] = useState("8");
  const [weightInput, setWeightInput] = useState("65");
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);

  const validationError = useMemo(() => {
    const parsedWeight = parseNumber(weightInput);
    const parsedHeightCm = parseNumber(heightCmInput);
    const parsedHeightFt = parseNumber(heightFtInput);
    const parsedHeightIn = parseNumber(heightInInput);

    if (heightUnit === "cm" && parsedHeightCm === null) {
      return "Enter a valid height in cm.";
    }

    if (heightUnit === "ft-in" && (parsedHeightFt === null || parsedHeightIn === null)) {
      return "Enter valid values for height in feet and inches.";
    }

    if (parsedWeight === null) {
      return "Enter a valid weight value.";
    }

    if (heightUnit === "cm") {
      if (parsedHeightCm <= 0 || parsedHeightCm < 50 || parsedHeightCm > 280) {
        return "Height in cm should be between 50 and 280.";
      }
    } else {
      if (parsedHeightFt < 0 || parsedHeightFt > 9) {
        return "Feet should be between 0 and 9.";
      }

      if (parsedHeightIn < 0 || parsedHeightIn >= 12) {
        return "Inches should be between 0 and 11.99.";
      }

      if (parsedHeightFt === 0 && parsedHeightIn === 0) {
        return "Height must be greater than zero.";
      }
    }

    if (weightUnit === "kg") {
      if (parsedWeight <= 0 || parsedWeight < 10 || parsedWeight > 500) {
        return "Weight in kg should be between 10 and 500.";
      }
    } else {
      if (parsedWeight <= 0 || parsedWeight < 22 || parsedWeight > 1100) {
        return "Weight in lbs should be between 22 and 1100.";
      }
    }

    return "";
  }, [heightCmInput, heightFtInput, heightInInput, heightUnit, weightInput, weightUnit]);

  const result = useMemo(() => {
    if (validationError) {
      return null;
    }

    const parsedWeight = parseNumber(weightInput);
    const parsedHeightCm = parseNumber(heightCmInput);
    const parsedHeightFt = parseNumber(heightFtInput);
    const parsedHeightIn = parseNumber(heightInInput);

    if (parsedWeight === null) {
      return null;
    }

    let heightM = 0;
    if (heightUnit === "cm" && parsedHeightCm !== null) {
      heightM = parsedHeightCm / 100;
    }

    if (heightUnit === "ft-in" && parsedHeightFt !== null && parsedHeightIn !== null) {
      heightM = (parsedHeightFt * 12 + parsedHeightIn) * 0.0254;
    }

    if (heightM <= 0) {
      return null;
    }

    const weightKg = weightUnit === "kg" ? parsedWeight : parsedWeight * 0.45359237;
    const bmi = weightKg / (heightM * heightM);
    const category = getBmiCategory(bmi);

    const healthyMinKg = 18.5 * heightM * heightM;
    const healthyMaxKg = 24.9 * heightM * heightM;
    const difference = getDifferenceNote(weightKg, healthyMinKg, healthyMaxKg);

    const scaleMin = 12;
    const scaleMax = 40;
    const clampedBmi = Math.min(Math.max(bmi, scaleMin), scaleMax);
    const scalePosition = ((clampedBmi - scaleMin) / (scaleMax - scaleMin)) * 100;

    return {
      heightM,
      weightKg,
      bmi,
      category,
      healthyMinKg,
      healthyMaxKg,
      difference,
      scalePosition,
    };
  }, [heightCmInput, heightFtInput, heightInInput, heightUnit, validationError, weightInput, weightUnit]);

  const summaryText = useMemo(() => {
    if (validationError) {
      return validationError;
    }

    if (!result) {
      return "Enter your height and weight to instantly calculate BMI.";
    }

    return `Your BMI is ${formatNumber(result.bmi, 2)} (${result.category}).`;
  }, [result, validationError]);

  const reportText = useMemo(() => {
    if (!result || validationError) {
      return "";
    }

    return buildReport({
      heightUnit,
      weightUnit,
      heightCmRaw: heightCmInput,
      heightFtRaw: heightFtInput,
      heightInRaw: heightInInput,
      weightRaw: weightInput,
      result,
    });
  }, [heightCmInput, heightFtInput, heightInInput, heightUnit, result, validationError, weightInput, weightUnit]);

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
      return;
    }

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bmi-calculator-report.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("success", "Report downloaded.");
  };

  const resetCalculator = () => {
    setHeightUnit("cm");
    setWeightUnit("kg");
    setHeightCmInput("");
    setHeightFtInput("");
    setHeightInInput("");
    setWeightInput("");
    showToast("success", "Calculator reset.");
  };

  const canUseResults = Boolean(result && !validationError);

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 sm:py-8 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Health</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">BMI Calculator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Calculate your Body Mass Index instantly and understand your weight category, healthy range, and next-step guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4 items-stretch">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Inputs</p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Enter your body measurements</h2>
              <p className="text-sm text-slate-500">Choose height and weight units independently for faster entry.</p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Height</span>
                  {heightUnit === "cm" ? (
                    <>
                      <input
                        type="number"
                        min="50"
                        max="280"
                        step="0.1"
                        value={heightCmInput}
                        onChange={(event) => setHeightCmInput(event.target.value)}
                        placeholder="170"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <p className="text-xs text-slate-500">Example: 170 cm</p>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="0"
                          max="9"
                          step="1"
                          value={heightFtInput}
                          onChange={(event) => setHeightFtInput(event.target.value)}
                          placeholder="5 ft"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <input
                          type="number"
                          min="0"
                          max="11.99"
                          step="0.1"
                          value={heightInInput}
                          onChange={(event) => setHeightInInput(event.target.value)}
                          placeholder="8 in"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <p className="text-xs text-slate-500">Example: 5 ft 8 in</p>
                    </>
                  )}
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Unit</span>
                  <ThemedDropdown
                    ariaLabel="Choose height unit"
                    value={heightUnit}
                    options={HEIGHT_UNIT_OPTIONS}
                    onChange={(value) => setHeightUnit(value)}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Weight</span>
                  <input
                    type="number"
                    min={weightUnit === "kg" ? "10" : "22"}
                    max={weightUnit === "kg" ? "500" : "1100"}
                    step="0.1"
                    value={weightInput}
                    onChange={(event) => setWeightInput(event.target.value)}
                    placeholder={weightUnit === "kg" ? "65" : "143"}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <p className="text-xs text-slate-500">Example: {weightUnit === "kg" ? "65 kg" : "143 lb"}</p>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Unit</span>
                  <ThemedDropdown
                    ariaLabel="Choose weight unit"
                    value={weightUnit}
                    options={WEIGHT_UNIT_OPTIONS}
                    onChange={(value) => setWeightUnit(value)}
                  />
                </label>
              </div>
            </div>

            {validationError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                <p className="text-sm font-semibold">Please check your inputs.</p>
                <p className="text-sm">{validationError}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Summary</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{summaryText}</h2>
            <p className="mt-1 text-sm text-slate-500">Results update instantly as you type.</p>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">BMI scale</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="flex h-full w-full">
                  <div className="h-full w-[23%] bg-sky-400" aria-hidden="true" />
                  <div className="h-full w-[23%] bg-emerald-500" aria-hidden="true" />
                  <div className="h-full w-[22%] bg-amber-400" aria-hidden="true" />
                  <div className="h-full w-[32%] bg-rose-500" aria-hidden="true" />
                </div>
              </div>
              <div className="relative mt-2 h-5">
                <div
                  className="absolute top-0 -translate-x-1/2 text-xs font-semibold text-slate-900"
                  style={{ left: `${canUseResults ? result.scalePosition : 0}%` }}
                >
                  ▲
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>
            </div>
          </div>
        </div>

        {canUseResults ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <StatCard label="BMI Score" value={formatNumber(result.bmi, 2)} subtitle="Calculated from height and weight" />
              <StatCard label="BMI Category" value={result.category} subtitle="WHO classification" />
              <StatCard
                label="Healthy weight range"
                value={`${formatNumber(result.healthyMinKg, 1)} - ${formatNumber(result.healthyMaxKg, 1)} kg`}
                subtitle="Based on BMI 18.5 to 24.9"
              />
              <StatCard
                label="Difference from ideal"
                value={result.difference.direction === "within" ? "Within range" : `${result.difference.suggestion} ${formatNumber(result.difference.value, 1)} kg`}
                subtitle={result.difference.direction === "within" ? "Maintain current range" : `${result.difference.direction === "below" ? "Below" : "Above"} healthy range`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <InsightCard label="Category insight" value={result.category} subtitle="Underweight • Normal • Overweight • Obese" />
              <InsightCard
                label="Healthy BMI band"
                value="18.5 to 24.9"
                subtitle="General adult reference range"
              />
              <InsightCard
                label="Action guidance"
                value={result.difference.direction === "within" ? "Maintain current routine" : `${result.difference.suggestion} ${formatNumber(result.difference.value, 1)} kg`}
                subtitle="General fitness reference, not medical advice"
              />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Empty state</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Enter valid values to see your BMI details.</p>
            <p className="mt-1 text-sm text-slate-500">You will get score, category, healthy range, and instant guidance.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={copyResults}
            className={`rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 ${!canUseResults ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!canUseResults}
          >
            Copy results
          </button>
          <button
            type="button"
            onClick={downloadReport}
            className={`rounded-xl border border-orange-500 px-4 py-3 font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${!canUseResults ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!canUseResults}
          >
            Download report
          </button>
          <button
            type="button"
            onClick={resetCalculator}
            className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            Reset
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Accuracy note</p>
          <p className="mt-2 text-sm text-slate-600">
            BMI is a general screening metric based on weight and height. It does not directly measure body fat percentage, age, or muscle mass.
          </p>
        </div>
      </div>

      {toast.message ? (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-sm shadow-lg animate-fade-in-out ${toast.type === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
        .animate-fade-in-out {
          animation: fadeInOut 1.8s;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

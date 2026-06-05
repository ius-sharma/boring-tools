"use client";

import ComingSoon from "@/app/components/ComingSoon";
import { useEffect, useMemo, useRef, useState } from "react";

const TOOL_STATUS = "live";

const MODES = [
  {
    value: "of",
    label: "What is X% of Y?",
    inputs: [
      { key: "percent", label: "X (%)", placeholder: "15", step: "0.01" },
      { key: "value", label: "Y", placeholder: "240", step: "0.01" },
    ],
  },
  {
    value: "what-percent",
    label: "X is what percent of Y?",
    inputs: [
      { key: "part", label: "X", placeholder: "30", step: "0.01" },
      { key: "whole", label: "Y", placeholder: "120", step: "0.01" },
    ],
  },
  {
    value: "increase",
    label: "Percentage increase",
    inputs: [
      { key: "from", label: "Original value", placeholder: "80", step: "0.01" },
      { key: "to", label: "New value", placeholder: "100", step: "0.01" },
    ],
  },
  {
    value: "decrease",
    label: "Percentage decrease",
    inputs: [
      { key: "from", label: "Original value", placeholder: "100", step: "0.01" },
      { key: "to", label: "New value", placeholder: "85", step: "0.01" },
    ],
  },
  {
    value: "profit-loss",
    label: "Profit / Loss percentage",
    inputs: [
      { key: "cost", label: "Cost price", placeholder: "250", step: "0.01" },
      { key: "selling", label: "Selling price", placeholder: "320", step: "0.01" },
    ],
  },
];

const EMPTY_VALUES = {
  percent: "",
  value: "",
  part: "",
  whole: "",
  from: "",
  to: "",
  cost: "",
  selling: "",
};

function parseNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatPercent(value) {
  return `${formatNumber(value)}%`;
}

function getModeMeta(mode) {
  return MODES.find((item) => item.value === mode) || MODES[0];
}

function getRequiredKeys(mode) {
  return getModeMeta(mode).inputs.map((input) => input.key);
}

export default function PercentageCalculatorPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Percentage Calculator" />;
  }

  const [mode, setMode] = useState("of");
  const [values, setValues] = useState({
    percent: "15",
    value: "240",
    part: "30",
    whole: "120",
    from: "80",
    to: "100",
    cost: "250",
    selling: "320",
  });
  const [toast, setToast] = useState("");
  const [animateResult, setAnimateResult] = useState(false);
  const toastTimerRef = useRef(null);

  const activeMode = getModeMeta(mode);

  const result = useMemo(() => {
    const requiredKeys = getRequiredKeys(mode);
    const requiredValues = requiredKeys.map((key) => values[key]);
    const hasAnyValue = requiredValues.some((value) => value !== "");

    if (!hasAnyValue) {
      return null;
    }

    const percent = parseNumber(values.percent);
    const numericValue = parseNumber(values.value);
    const part = parseNumber(values.part);
    const whole = parseNumber(values.whole);
    const from = parseNumber(values.from);
    const to = parseNumber(values.to);
    const cost = parseNumber(values.cost);
    const selling = parseNumber(values.selling);

    if (mode === "of") {
      if (percent === null || numericValue === null || percent < 0 || numericValue < 0) {
        return { error: "Enter valid non-negative numbers." };
      }

      const resultValue = (percent / 100) * numericValue;
      return {
        value: resultValue,
        displayValue: formatNumber(resultValue),
        formula: "Result = (X / 100) × Y",
        breakdown: [
          `X = ${formatPercent(percent)}`,
          `Y = ${formatNumber(numericValue)}`,
          `Calculation = (${formatPercent(percent)} ÷ 100) × ${formatNumber(numericValue)}`,
          `Result = ${formatNumber(resultValue)}`,
        ],
      };
    }

    if (mode === "what-percent") {
      if (part === null || whole === null || part < 0 || whole <= 0) {
        return { error: "X must be non-negative and Y must be greater than zero." };
      }

      const resultValue = (part / whole) * 100;
      return {
        value: resultValue,
        displayValue: formatPercent(resultValue),
        formula: "Result = (X ÷ Y) × 100",
        breakdown: [
          `X = ${formatNumber(part)}`,
          `Y = ${formatNumber(whole)}`,
          `Calculation = (${formatNumber(part)} ÷ ${formatNumber(whole)}) × 100`,
          `Result = ${formatPercent(resultValue)}`,
        ],
      };
    }

    if (mode === "increase") {
      if (from === null || to === null || from <= 0 || to < 0) {
        return { error: "Original value must be greater than zero and new value must be valid." };
      }

      const difference = to - from;
      const resultValue = (difference / from) * 100;
      return {
        value: resultValue,
        displayValue: formatPercent(Math.abs(resultValue)),
        direction: resultValue >= 0 ? "increase" : "decrease",
        formula: "Result = ((New - Original) ÷ Original) × 100",
        breakdown: [
          `Original value = ${formatNumber(from)}`,
          `New value = ${formatNumber(to)}`,
          `Difference = ${formatNumber(difference)}`,
          `Calculation = ((${formatNumber(to)} - ${formatNumber(from)}) ÷ ${formatNumber(from)}) × 100`,
          `Result = ${formatPercent(Math.abs(resultValue))}`,
        ],
      };
    }

    if (mode === "decrease") {
      if (from === null || to === null || from <= 0 || to < 0) {
        return { error: "Original value must be greater than zero and new value must be valid." };
      }

      const difference = from - to;
      const resultValue = (difference / from) * 100;
      return {
        value: resultValue,
        displayValue: formatPercent(Math.abs(resultValue)),
        direction: resultValue >= 0 ? "decrease" : "increase",
        formula: "Result = ((Original - New) ÷ Original) × 100",
        breakdown: [
          `Original value = ${formatNumber(from)}`,
          `New value = ${formatNumber(to)}`,
          `Difference = ${formatNumber(difference)}`,
          `Calculation = ((${formatNumber(from)} - ${formatNumber(to)}) ÷ ${formatNumber(from)}) × 100`,
          `Result = ${formatPercent(Math.abs(resultValue))}`,
        ],
      };
    }

    if (cost === null || selling === null || cost <= 0 || selling < 0) {
      return { error: "Cost price must be greater than zero and selling price must be valid." };
    }

    const difference = selling - cost;
    const resultValue = Math.abs((difference / cost) * 100);
    return {
      value: resultValue,
      displayValue: formatPercent(resultValue),
      direction: difference >= 0 ? "profit" : "loss",
      formula: "Profit/Loss % = (Difference ÷ Cost Price) × 100",
      breakdown: [
        `Cost price = ${formatNumber(cost)}`,
        `Selling price = ${formatNumber(selling)}`,
        `Difference = ${formatNumber(Math.abs(difference))}`,
        `Calculation = (${formatNumber(Math.abs(difference))} ÷ ${formatNumber(cost)}) × 100`,
        `Result = ${formatPercent(resultValue)} ${difference >= 0 ? "profit" : "loss"}`,
      ],
    };
  }, [mode, values]);

  const summary = useMemo(() => {
    if (result?.error) {
      return result.error;
    }

    if (!result) {
      return "Enter values to see the percentage breakdown instantly.";
    }

    if (mode === "of") {
      return `${values.percent || 0}% of ${formatNumber(values.value || 0)} equals ${result.displayValue}.`;
    }

    if (mode === "what-percent") {
      return `${formatNumber(values.part || 0)} is ${result.displayValue} of ${formatNumber(values.whole || 0)}.`;
    }

    if (mode === "increase") {
      return `${formatNumber(values.from || 0)} to ${formatNumber(values.to || 0)} is a ${result.displayValue} ${result.direction}.`;
    }

    if (mode === "decrease") {
      return `${formatNumber(values.from || 0)} to ${formatNumber(values.to || 0)} is a ${result.displayValue} ${result.direction}.`;
    }

    return `${formatNumber(values.cost || 0)} to ${formatNumber(values.selling || 0)} is a ${result.displayValue} ${result.direction}.`;
  }, [mode, result, values]);

  const copyResult = async () => {
    if (!result || result.error) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.displayValue);
      setToast("Result copied to clipboard.");
    } catch {
      setToast("Copy failed. Try again.");
    }
  };

  const resetCalculator = () => {
    setMode("of");
    setValues(EMPTY_VALUES);
    setToast("Calculator reset.");
  };

  useEffect(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    if (!toast) {
      return undefined;
    }

    toastTimerRef.current = window.setTimeout(() => setToast(""), 1700);
    return () => window.clearTimeout(toastTimerRef.current);
  }, [toast]);

  useEffect(() => {
    if (!result || result.error) {
      setAnimateResult(false);
      return undefined;
    }

    setAnimateResult(true);
    const timer = window.setTimeout(() => setAnimateResult(false), 160);
    return () => window.clearTimeout(timer);
  }, [result]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const updateValue = (field, fieldValue) => {
    setValues((current) => ({ ...current, [field]: fieldValue }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans sm:p-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
          <div className="mb-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-600">Finance Utility</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Percentage Calculator</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Perform common percentage calculations instantly with formulas, result summaries, and a step-by-step breakdown.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {MODES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMode(item.value)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 ${mode === item.value ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200" : "border-slate-300 bg-slate-50 text-slate-700 hover:border-orange-300 hover:bg-orange-50"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {activeMode.inputs.map((input) => (
                  <label key={input.key} className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    {input.label}
                    <input
                      type="number"
                      min="0"
                      step={input.step}
                      value={values[input.key]}
                      onChange={(event) => updateValue(input.key, event.target.value)}
                      placeholder={input.placeholder}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </label>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Formula used</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{result?.formula || "Select a mode to see the formula."}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyResult}
                  disabled={!result || result.error}
                  className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Copy result
                </button>
                <button
                  type="button"
                  onClick={resetCalculator}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                >
                  Reset calculator
                </button>
              </div>

              {toast ? (
                <p className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800">
                  {toast}
                </p>
              ) : null}
            </div>

            <div className={`space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 sm:p-5 transition-all duration-200 ${animateResult ? "scale-[0.99] shadow-xl shadow-orange-100" : "shadow-sm"}`}>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Result</p>
                <div className="mt-2 flex items-end gap-3">
                  <p className="text-4xl font-black tracking-tight text-slate-900 tabular-nums">
                    {result?.error ? "--" : result?.displayValue || "0.00%"}
                  </p>
                  {result?.direction ? (
                    <span className="mb-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700">
                      {result.direction}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{summary}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Calculation breakdown</p>
                  {result?.error ? (
                    <p className="mt-2 text-sm font-medium text-red-600">{result.error}</p>
                  ) : result?.breakdown ? (
                    <ol className="mt-3 space-y-2 text-sm text-slate-700">
                      {result.breakdown.map((line) => (
                        <li key={line} className="rounded-xl bg-slate-50 px-3 py-2 leading-relaxed">
                          {line}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">Fill in the inputs to see the breakdown.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live mode</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{activeMode.label}</p>
                  <p className="mt-1 text-sm text-slate-600">Instant updates with no submit button or page refresh.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import ComingSoon from "@/app/components/ComingSoon";
import { useEffect, useMemo, useRef, useState } from "react";

const MONTHS_IN_YEAR = 12;
const TOOL_STATUS = "upcoming";

function toNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function calculateSipFutureValue(monthlyInvestment, monthlyRate, months) {
  if (months <= 0 || monthlyInvestment <= 0) {
    return 0;
  }

  if (monthlyRate === 0) {
    return monthlyInvestment * months;
  }

  return monthlyInvestment * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
}

function toChartPoints(data, width, height, padding) {
  if (!data.length) {
    return { line: "", area: "" };
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const xSpan = width - padding * 2;
  const ySpan = height - padding * 2;

  const points = data.map((item, index) => {
    const x = padding + (index / Math.max(1, data.length - 1)) * xSpan;
    const y = height - padding - (item.value / maxValue) * ySpan;
    return { x, y };
  });

  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padding},${height - padding} ${line} ${width - padding},${height - padding}`;

  return { line, area };
}

export default function SipCalculatorPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="SIP Calculator" />;
  }

  const [monthlyInvestment, setMonthlyInvestment] = useState("5000");
  const [annualReturn, setAnnualReturn] = useState("12");
  const [years, setYears] = useState("10");
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);

  const result = useMemo(() => {
    const monthly = toNumber(monthlyInvestment);
    const annual = toNumber(annualReturn);
    const durationYears = toNumber(years);

    if (monthly === null || annual === null || durationYears === null) {
      return null;
    }

    if (monthly <= 0 || annual < 0 || durationYears <= 0) {
      return { error: "Enter valid values. Monthly investment and duration must be greater than 0." };
    }

    const months = Math.max(1, Math.round(durationYears * MONTHS_IN_YEAR));
    const monthlyRate = annual / (100 * MONTHS_IN_YEAR);

    const totalInvestment = monthly * months;
    const maturityValue = calculateSipFutureValue(monthly, monthlyRate, months);
    const wealthGained = maturityValue - totalInvestment;

    const step = Math.max(1, Math.floor(months / 24));
    const growthData = [{ month: 0, invested: 0, value: 0 }];

    for (let month = step; month <= months; month += step) {
      const invested = monthly * month;
      const value = calculateSipFutureValue(monthly, monthlyRate, month);
      growthData.push({ month, invested, value });
    }

    const lastPoint = growthData[growthData.length - 1];
    if (!lastPoint || lastPoint.month !== months) {
      growthData.push({
        month: months,
        invested: totalInvestment,
        value: maturityValue,
      });
    }

    return {
      monthly,
      annual,
      durationYears,
      months,
      totalInvestment,
      wealthGained,
      maturityValue,
      growthData,
    };
  }, [monthlyInvestment, annualReturn, years]);

  const reportText = useMemo(() => {
    if (!result || result.error) {
      return "";
    }

    return [
      "SIP Calculator Report",
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      "",
      `Monthly Investment: ${formatCurrency(result.monthly)}`,
      `Expected Annual Return: ${formatPercent(result.annual)}`,
      `Investment Duration: ${result.durationYears} years (${result.months} months)`,
      "",
      `Total Investment: ${formatCurrency(result.totalInvestment)}`,
      `Wealth Gained: ${formatCurrency(result.wealthGained)}`,
      `Estimated Maturity Value: ${formatCurrency(result.maturityValue)}`,
      "",
      "Formula:",
      "M = P x [((1 + i)^n - 1) / i] x (1 + i)",
      "Where P = monthly investment, i = monthly return rate, n = total months",
    ].join("\n");
  }, [result]);

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
    link.download = "sip-calculator-report.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showToast("success", "Report downloaded.");
  };

  const resetCalculator = () => {
    setMonthlyInvestment("5000");
    setAnnualReturn("12");
    setYears("10");
    showToast("success", "Calculator reset.");
  };

  const chart = useMemo(() => {
    if (!result || result.error) {
      return null;
    }

    const width = 640;
    const height = 280;
    const padding = 36;
    const points = toChartPoints(result.growthData, width, height, padding);
    const maxValue = Math.max(...result.growthData.map((item) => item.value), 1);

    return { ...points, width, height, padding, maxValue };
  }, [result]);

  const hasError = Boolean(result?.error);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Finance</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">SIP Calculator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Estimate long-term SIP returns instantly with accurate monthly compounding, investment breakdown cards, and a growth chart.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">SIP inputs</p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Enter your monthly SIP plan details</h2>
              <p className="text-sm text-slate-500">Everything runs in your browser. No server needed.</p>
            </div>

            <button
              type="button"
              onClick={resetCalculator}
              className="inline-flex items-center justify-center rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:-translate-y-px hover:bg-orange-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 md:mt-1"
            >
              Reset
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900">Monthly Investment</span>
              <span className="text-xs text-slate-500">Amount invested every month</span>
              <input
                type="number"
                min="1"
                step="100"
                value={monthlyInvestment}
                onChange={(event) => setMonthlyInvestment(event.target.value)}
                placeholder="5000"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900">Expected Annual Return (%)</span>
              <span className="text-xs text-slate-500">Expected rate of return per year</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={annualReturn}
                onChange={(event) => setAnnualReturn(event.target.value)}
                placeholder="12"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900">Investment Duration (Years)</span>
              <span className="text-xs text-slate-500">Total SIP period in years</span>
              <input
                type="number"
                min="1"
                step="0.5"
                value={years}
                onChange={(event) => setYears(event.target.value)}
                placeholder="10"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </label>
          </div>

          {hasError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <p className="text-sm font-semibold">Please check your inputs.</p>
              <p className="text-sm">{result.error}</p>
            </div>
          ) : null}
        </div>

        {result && !result.error ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Investment</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{formatCurrency(result.totalInvestment)}</p>
                <p className="mt-1 text-sm text-slate-500">Your principal over {result.months} months.</p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">Wealth Gained</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-900">{formatCurrency(result.wealthGained)}</p>
                <p className="mt-1 text-sm text-emerald-700">Estimated returns generated.</p>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
                <p className="text-xs font-medium uppercase tracking-wider text-orange-700">Estimated Maturity Value</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-orange-900">{formatCurrency(result.maturityValue)}</p>
                <p className="mt-1 text-sm text-orange-700">Projected final corpus at maturity.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Growth chart</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Projected SIP growth over time</h2>
                </div>
                <p className="text-sm font-medium text-orange-600">Max value: {formatCompactCurrency(chart?.maxValue || 0)}</p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chart?.width || 640} ${chart?.height || 280}`}
                  className="h-64 w-full min-w-[560px]"
                  role="img"
                  aria-label="SIP growth line chart"
                >
                  <defs>
                    <linearGradient id="sip-area-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.04" />
                    </linearGradient>
                  </defs>

                  <line
                    x1={chart?.padding || 36}
                    y1={(chart?.height || 280) - (chart?.padding || 36)}
                    x2={(chart?.width || 640) - (chart?.padding || 36)}
                    y2={(chart?.height || 280) - (chart?.padding || 36)}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                  <line
                    x1={chart?.padding || 36}
                    y1={chart?.padding || 36}
                    x2={chart?.padding || 36}
                    y2={(chart?.height || 280) - (chart?.padding || 36)}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />

                  <polygon points={chart?.area || ""} fill="url(#sip-area-fill)" />
                  <polyline
                    points={chart?.line || ""}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                  />
                </svg>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>0y</span>
                <span>{Math.max(1, Math.round(result.durationYears / 2))}y</span>
                <span>{result.durationYears}y</span>
                <span className="ml-auto">Compounded monthly using SIP formula</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={copyResults}
                className="rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                Copy results
              </button>

              <button
                type="button"
                onClick={downloadReport}
                className="rounded-xl border border-orange-500 px-4 py-3 font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
          </>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Formula note</p>
          <p className="mt-2 text-sm text-slate-600">
            We use the standard SIP future value formula with monthly compounding: M = P x [((1 + i)^n - 1) / i] x (1 + i), where i is monthly return and n is total months.
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

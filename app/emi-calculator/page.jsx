"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MONTHS_IN_YEAR = 12;

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

function calculateEmi(principal, monthlyRate, months) {
  if (months <= 0 || principal <= 0) {
    return 0;
  }
  if (monthlyRate === 0) {
    return principal / months;
  }
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

export default function EmiCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState("1000000"); // 10 Lakhs default
  const [interestRate, setInterestRate] = useState("8.5");  // 8.5% default
  const [tenure, setTenure] = useState("5");                // 5 Years default
  const [tenureType, setTenureType] = useState("years");    // years / months
  const [showDetailedAmortization, setShowDetailedAmortization] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);

  const result = useMemo(() => {
    const P = toNumber(loanAmount);
    const R = toNumber(interestRate);
    const T = toNumber(tenure);

    if (P === null || R === null || T === null) {
      return null;
    }

    if (P <= 0 || R < 0 || T <= 0) {
      return { error: "Enter valid values. Loan amount, interest rate, and tenure must be positive numbers." };
    }

    const months = tenureType === "years" ? Math.max(1, Math.round(T * MONTHS_IN_YEAR)) : Math.max(1, Math.round(T));
    
    if (months > 480) {
      return { error: "Tenure cannot exceed 40 years (480 months) for accuracy." };
    }

    const monthlyRate = R / (100 * MONTHS_IN_YEAR);
    const emi = calculateEmi(P, monthlyRate, months);
    const totalPayable = emi * months;
    const totalInterest = totalPayable - P;

    // Generate monthly amortization schedule
    const schedule = [];
    let balance = P;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;

    for (let m = 1; m <= months; m++) {
      const interest = balance * monthlyRate;
      let principal = emi - interest;

      if (balance - principal < 0.01 || m === months) {
        principal = balance;
      }

      const actualEmi = principal + interest;
      balance = balance - principal;
      if (balance < 0) balance = 0;

      cumulativeInterest += interest;
      cumulativePrincipal += principal;

      schedule.push({
        month: m,
        openingBalance: balance + principal,
        emi: actualEmi,
        interest,
        principal,
        endingBalance: balance,
        cumulativeInterest,
        cumulativePrincipal,
      });
    }

    // Generate yearly summary
    const yearlySummary = [];
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    let yearNum = 1;
    let yearOpeningBalance = P;

    schedule.forEach((item) => {
      yearlyPrincipal += item.principal;
      yearlyInterest += item.interest;

      if (item.month % 12 === 0 || item.month === months) {
        yearlySummary.push({
          year: yearNum,
          openingBalance: yearOpeningBalance,
          principal: yearlyPrincipal,
          interest: yearlyInterest,
          emi: yearlyPrincipal + yearlyInterest,
          endingBalance: item.endingBalance,
        });
        yearNum++;
        yearOpeningBalance = item.endingBalance;
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
    });

    // Sample points for the repayment trend chart (up to 24 points)
    const sampleCount = Math.min(24, schedule.length);
    const step = Math.max(1, Math.floor(schedule.length / sampleCount));
    const trendData = [];
    
    // Include starting point (Month 0)
    trendData.push({
      month: 0,
      balance: P,
      cumulativeInterest: 0,
    });

    for (let i = step - 1; i < schedule.length; i += step) {
      trendData.push({
        month: schedule[i].month,
        balance: schedule[i].endingBalance,
        cumulativeInterest: schedule[i].cumulativeInterest,
      });
    }

    if (trendData[trendData.length - 1].month !== schedule[schedule.length - 1].month) {
      trendData.push({
        month: schedule[schedule.length - 1].month,
        balance: schedule[schedule.length - 1].endingBalance,
        cumulativeInterest: schedule[schedule.length - 1].cumulativeInterest,
      });
    }

    return {
      P,
      R,
      T,
      months,
      emi,
      totalInterest,
      totalPayable,
      schedule,
      yearlySummary,
      trendData,
    };
  }, [loanAmount, interestRate, tenure, tenureType]);

  const reportText = useMemo(() => {
    if (!result || result.error) {
      return "";
    }

    const header = [
      "==================================================",
      "             EMI CALCULATOR REPORT                ",
      `             Generated: ${new Date().toLocaleString("en-IN")} `,
      "==================================================",
      "",
      "LOAN PARAMETERS",
      "--------------------------------------------------",
      `Loan Amount          : ${formatCurrency(result.P)}`,
      `Interest Rate        : ${formatPercent(result.R)} p.a.`,
      `Loan Tenure          : ${result.T} ${tenureType} (${result.months} months)`,
      "",
      "REPAYMENT SUMMARY",
      "--------------------------------------------------",
      `Monthly EMI          : ${formatCurrency(result.emi)}`,
      `Total Interest Paid  : ${formatCurrency(result.totalInterest)}`,
      `Total Payable Amount : ${formatCurrency(result.totalPayable)}`,
      "",
      "YEARLY AMORTIZATION SCHEDULE SUMMARY",
      "--------------------------------------------------------------------------------",
      "Year | Opening Balance | Principal Paid | Interest Paid | Total Paid | Ending Balance",
      "--------------------------------------------------------------------------------",
    ];

    const body = result.yearlySummary.map((y) => {
      const yr = String(y.year).padEnd(4);
      const op = formatCurrency(y.openingBalance).padEnd(16);
      const pr = formatCurrency(y.principal).padEnd(15);
      const intr = formatCurrency(y.interest).padEnd(14);
      const tot = formatCurrency(y.emi).padEnd(11);
      const ed = formatCurrency(y.endingBalance);
      return `${yr} | ${op} | ${pr} | ${intr} | ${tot} | ${ed}`;
    });

    const footer = [
      "--------------------------------------------------------------------------------",
      "This report is generated client-side and is for illustrative purposes only.",
      "Formula used: EMI = P * r * (1+r)^n / ((1+r)^n - 1)",
    ];

    return [...header, ...body, ...footer].join("\n");
  }, [result, tenureType]);

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
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
      showToast("success", "Results copied to clipboard.");
    } catch {
      showToast("error", "Copy failed. Try again.");
    }
  };

  const downloadReport = () => {
    if (!result || result.error || typeof window === "undefined") return;

    // Detailed amortization output for download file (with monthly detail)
    const header = [
      "=================================================================",
      "               EMI CALCULATOR DETAILED REPORT                    ",
      `               Generated: ${new Date().toLocaleString("en-IN")} `,
      "=================================================================",
      "",
      "LOAN SUMMARY",
      "-----------------------------------------------------------------",
      `Principal Amount       : ${formatCurrency(result.P)}`,
      `Annual Interest Rate   : ${formatPercent(result.R)}`,
      `Tenure                 : ${result.T} ${tenureType} (${result.months} months)`,
      `Monthly EMI            : ${formatCurrency(result.emi)}`,
      `Total Interest Payable : ${formatCurrency(result.totalInterest)}`,
      `Total Payable Amount   : ${formatCurrency(result.totalPayable)}`,
      "",
      "DETAILED MONTH-BY-MONTH AMORTIZATION SCHEDULE",
      "-----------------------------------------------------------------------------------------",
      "Month | Opening Balance   | EMI Amount        | Principal Paid    | Interest Paid     | Ending Balance",
      "-----------------------------------------------------------------------------------------",
    ];

    const body = result.schedule.map((item) => {
      const m = String(item.month).padEnd(5);
      const op = formatCurrency(item.openingBalance).padEnd(17);
      const emiVal = formatCurrency(item.emi).padEnd(17);
      const pr = formatCurrency(item.principal).padEnd(18);
      const intr = formatCurrency(item.interest).padEnd(17);
      const ed = formatCurrency(item.endingBalance);
      return `${m} | ${op} | ${emiVal} | ${pr} | ${intr} | ${ed}`;
    });

    const footer = [
      "-----------------------------------------------------------------------------------------",
      "End of report.",
    ];

    const fullReportText = [...header, ...body, ...footer].join("\n");
    const blob = new Blob([fullReportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `loan-emi-report-${result.P}-at-${result.R}percent.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showToast("success", "Report downloaded successfully.");
  };

  const resetCalculator = () => {
    setLoanAmount("1000000");
    setInterestRate("8.5");
    setTenure("5");
    setTenureType("years");
    setShowDetailedAmortization(false);
    showToast("success", "Calculator values reset.");
  };

  // SVGs calculations
  const donutChart = useMemo(() => {
    if (!result || result.error) return null;

    const C = 2 * Math.PI * 45; // Circumference for r=45 -> ~282.74
    const principalFraction = result.P / result.totalPayable;
    const interestFraction = result.totalInterest / result.totalPayable;

    const principalDash = principalFraction * C;
    const interestDash = interestFraction * C;

    const principalOffset = 0;
    const interestOffset = -principalDash;

    return {
      C,
      principalDash,
      interestDash,
      principalPercent: (principalFraction * 100).toFixed(1),
      interestPercent: (interestFraction * 100).toFixed(1),
    };
  }, [result]);

  const trendChart = useMemo(() => {
    if (!result || result.error) return null;

    const width = 640;
    const height = 280;
    const padding = 44;
    
    const xSpan = width - padding * 2;
    const ySpan = height - padding * 2;

    const maxY = Math.max(result.P, result.totalInterest);
    const pointsCount = result.trendData.length;

    const coords = result.trendData.map((p, idx) => {
      const x = padding + (idx / Math.max(1, pointsCount - 1)) * xSpan;
      const yBalance = height - padding - (p.balance / maxY) * ySpan;
      const yInterest = height - padding - (p.cumulativeInterest / maxY) * ySpan;
      return { x, yBalance, yInterest, label: p.month };
    });

    const lineBalance = coords.map((c) => `${c.x.toFixed(1)},${c.yBalance.toFixed(1)}`).join(" ");
    const areaBalance = `${padding.toFixed(1)},${(height - padding).toFixed(1)} ${lineBalance} ${(width - padding).toFixed(1)},${(height - padding).toFixed(1)}`;

    const lineInterest = coords.map((c) => `${c.x.toFixed(1)},${c.yInterest.toFixed(1)}`).join(" ");
    const areaInterest = `${padding.toFixed(1)},${(height - padding).toFixed(1)} ${lineInterest} ${(width - padding).toFixed(1)},${(height - padding).toFixed(1)}`;

    return {
      width,
      height,
      padding,
      maxY,
      coords,
      lineBalance,
      areaBalance,
      lineInterest,
      areaInterest,
    };
  }, [result]);

  const hasError = Boolean(result?.error);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Finance Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">EMI Calculator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Calculate your equated monthly installment (EMI) for home, car, or personal loans instantly with interactive repayment charts and schedules.
          </p>
        </div>

        {/* Inputs Panel */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600 font-bold">Loan Inputs</p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Enter your loan details</h2>
              <p className="text-sm text-slate-500">Calculations are performed 100% in your browser instantly.</p>
            </div>

            <button
              type="button"
              onClick={resetCalculator}
              className="inline-flex items-center justify-center rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:-translate-y-px hover:bg-orange-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Reset
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Loan Amount */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900 flex justify-between">
                <span>Loan Amount</span>
                {result && !result.error && (
                  <span className="text-xs text-orange-600 font-semibold">{formatCompactCurrency(result.P)}</span>
                )}
              </span>
              <span className="text-xs text-slate-400">Total principal borrowing amount</span>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 text-sm">₹</span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="1000000"
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-8 pr-4 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </label>

            {/* Interest Rate */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900 flex justify-between">
                <span>Interest Rate (% p.a.)</span>
                {result && !result.error && (
                  <span className="text-xs text-indigo-600 font-semibold">{result.R}%</span>
                )}
              </span>
              <span className="text-xs text-slate-400">Annual interest rate charged</span>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.05"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="8.5"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-slate-500 text-sm">%</span>
                </div>
              </div>
            </label>

            {/* Tenure */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900 flex justify-between">
                <span>Loan Tenure</span>
                {result && !result.error && (
                  <span className="text-xs text-slate-500 font-semibold">{result.months} Months</span>
                )}
              </span>
              <span className="text-xs text-slate-400">Repayment duration</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  placeholder="5"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <div className="flex rounded-xl border border-slate-300 bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setTenureType("years")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${tenureType === "years" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    Yr
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenureType("months")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${tenureType === "months" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    Mo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {hasError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <p className="text-sm font-semibold">Please check your inputs.</p>
              <p className="text-sm">{result.error}</p>
            </div>
          )}
        </div>

        {/* Results Panel */}
        {result && !result.error && (
          <>
            {/* Calculation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Monthly Loan EMI</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{formatCurrency(result.emi)}</p>
                <p className="mt-1.5 text-xs text-slate-500">Fixed amount paid every month.</p>
              </div>

              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
                <p className="text-xs font-medium uppercase tracking-wider text-indigo-700">Total Interest Payable</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-indigo-900">{formatCurrency(result.totalInterest)}</p>
                <p className="mt-1.5 text-xs text-indigo-700">Accumulated loan charges.</p>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
                <p className="text-xs font-medium uppercase tracking-wider text-orange-700">Total Payable Amount</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-orange-900">{formatCurrency(result.totalPayable)}</p>
                <p className="mt-1.5 text-xs text-orange-700">Principal + interest over tenure.</p>
              </div>
            </div>

            {/* Visual Charts: Donut + Repayment Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Pie/Donut Chart Component */}
              <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md flex flex-col items-center justify-between min-h-[360px]">
                <div className="w-full text-left">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Breakdown Share</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">Principal vs Interest</h3>
                </div>

                <div className="relative my-4 flex items-center justify-center">
                  <svg viewBox="0 0 120 120" className="w-48 h-48 sm:w-52 sm:h-52">
                    {/* Background Circle */}
                    <circle cx="60" cy="60" r="45" fill="transparent" stroke="#f1f5f9" strokeWidth="11" />
                    
                    {/* Principal Circle */}
                    {donutChart && (
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="transparent"
                        stroke="#f97316"
                        strokeWidth="11"
                        strokeDasharray={`${donutChart.principalDash} ${donutChart.C}`}
                        strokeDashoffset="0"
                        transform="rotate(-90 60 60)"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Interest Circle */}
                    {donutChart && (
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="transparent"
                        stroke="#6366f1"
                        strokeWidth="11"
                        strokeDasharray={`${donutChart.interestDash} ${donutChart.C}`}
                        strokeDashoffset="0"
                        transform={`rotate(${-90 + (result.P / result.totalPayable) * 360} 60 60)`}
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                  
                  {/* Inside Text */}
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Monthly Pay</span>
                    <span className="text-lg font-bold text-slate-800">{formatCompactCurrency(result.emi)}</span>
                  </div>
                </div>

                {/* Legend */}
                {donutChart && (
                  <div className="w-full flex justify-around gap-4 text-xs font-medium mt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
                      <div className="flex flex-col">
                        <span className="text-slate-500 font-normal">Principal</span>
                        <span className="text-slate-900 font-bold">{donutChart.principalPercent}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                      <div className="flex flex-col">
                        <span className="text-slate-500 font-normal">Interest</span>
                        <span className="text-slate-900 font-bold">{donutChart.interestPercent}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Repayment area chart */}
              <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Repayment curve</p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Loan Repayment Schedule Trend</h3>
                    </div>
                    <p className="text-xs text-slate-500">Max limit: {formatCompactCurrency(trendChart?.maxY || 0)}</p>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-2 overflow-x-auto">
                    <svg
                      viewBox={`0 0 ${trendChart?.width || 640} ${trendChart?.height || 280}`}
                      className="h-64 w-full min-w-[540px]"
                      role="img"
                      aria-label="Loan repayment area chart"
                    >
                      <defs>
                        <linearGradient id="balance-area-fill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                        </linearGradient>
                        <linearGradient id="interest-area-fill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                        const y = (trendChart?.padding || 44) + ratio * ((trendChart?.height || 280) - (trendChart?.padding || 44) * 2);
                        const labelValue = (trendChart?.maxY || 0) * (1 - ratio);
                        return (
                          <g key={ratio} className="opacity-40">
                            <line
                              x1={trendChart?.padding || 44}
                              y1={y}
                              x2={(trendChart?.width || 640) - (trendChart?.padding || 44)}
                              y2={y}
                              stroke="#cbd5e1"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                            />
                            <text
                              x={(trendChart?.padding || 44) - 8}
                              y={y + 4}
                              textAnchor="end"
                              className="text-[9px] fill-slate-400 font-semibold"
                            >
                              {formatCompactCurrency(labelValue)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Area paths */}
                      <polygon points={trendChart?.areaBalance || ""} fill="url(#balance-area-fill)" />
                      <polygon points={trendChart?.areaInterest || ""} fill="url(#interest-area-fill)" />

                      {/* Line paths */}
                      <polyline
                        points={trendChart?.lineBalance || ""}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points={trendChart?.lineInterest || ""}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Dots */}
                      {trendChart?.coords.map((c, idx) => {
                        // Plot starting, middle and ending points to not overcrowd the SVG with circles
                        if (idx % 4 === 0 || idx === trendChart.coords.length - 1) {
                          return (
                            <g key={idx}>
                              <circle cx={c.x} cy={c.yBalance} r="4" fill="#f97316" className="stroke-white stroke-2" />
                              <circle cx={c.x} cy={c.yInterest} r="4" fill="#6366f1" className="stroke-white stroke-2" />
                            </g>
                          );
                        }
                        return null;
                      })}
                    </svg>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500 px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                    <span>Remaining Principal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                    <span>Cumulative Interest Paid</span>
                  </div>
                  <span>Timeline: {result.months} months</span>
                </div>
              </div>
            </div>

            {/* Yearly Amortization Summary Table */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowDetailedAmortization(!showDetailedAmortization)}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Amortization Table</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">Yearly Repayment Schedule Breakdown</h3>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-orange-600">
                  <span>{showDetailedAmortization ? "Hide Details" : "Show Details"}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${showDetailedAmortization ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {showDetailedAmortization && (
                <div className="mt-5 border-t border-slate-100 pt-4 overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600 border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-2">Year</th>
                        <th className="py-3 px-2">Opening Balance</th>
                        <th className="py-3 px-2 text-orange-600">Principal Paid</th>
                        <th className="py-3 px-2 text-indigo-600">Interest Paid</th>
                        <th className="py-3 px-2">Total Paid</th>
                        <th className="py-3 px-2">Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.yearlySummary.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50/50 transition duration-150">
                          <td className="py-3.5 px-2 font-bold text-slate-900">Year {row.year}</td>
                          <td className="py-3.5 px-2 font-medium text-slate-700">{formatCurrency(row.openingBalance)}</td>
                          <td className="py-3.5 px-2 font-semibold text-orange-600">{formatCurrency(row.principal)}</td>
                          <td className="py-3.5 px-2 font-semibold text-indigo-600">{formatCurrency(row.interest)}</td>
                          <td className="py-3.5 px-2 font-medium text-slate-700">{formatCurrency(row.emi)}</td>
                          <td className="py-3.5 px-2 font-bold text-slate-900">{formatCurrency(row.endingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={copyResults}
                className="rounded-xl border border-slate-950 bg-slate-950 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-350 hover:bg-slate-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Reset
              </button>
            </div>
          </>
        )}

        {/* Formula Note Banner */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-bold">Standard Formula Note</p>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Equated Monthly Installment (EMI) is computed using the amortization algorithm:
            <code className="mx-1 px-1.5 py-0.5 bg-slate-200 rounded text-slate-800 font-mono text-xs sm:text-sm">
              EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
            </code>
            where <strong className="text-slate-800">P</strong> is the principal amount, <strong className="text-slate-800">r</strong> is the monthly interest rate, and <strong className="text-slate-800">n</strong> is the number of monthly payments.
          </p>
        </div>
      </div>

      {/* Local Toast Alert */}
      {toast.message && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg animate-fade-in-out border ${toast.type === "error" ? "bg-red-600 border-red-500 text-white" : "bg-slate-900 border-slate-800 text-white"}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      {/* Global Inline Keyframes */}
      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
        .animate-fade-in-out {
          animation: fadeInOut 1.8s ease-in-out forwards;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 12px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -12px); }
        }
      `}</style>
    </div>
  );
}

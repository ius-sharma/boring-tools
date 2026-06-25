"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const CURRENCIES = [
  { value: "USD", symbol: "$", label: "US Dollar ($)" },
  { value: "INR", symbol: "₹", label: "Indian Rupee (₹)" },
  { value: "EUR", symbol: "€", label: "Euro (€)" },
  { value: "GBP", symbol: "£", label: "British Pound (£)" },
  { value: "CAD", symbol: "C$", label: "Canadian Dollar (C$)" },
  { value: "AUD", symbol: "A$", label: "Australian Dollar (A$)" },
];

// Localized equivalents for trade-offs
const EQUIVALENTS = {
  USD: { coffee: 5, streaming: 15, gym: 50, meal: 20, coffeeName: "Premium Coffees", streamingName: "Netflix Months", gymName: "Gym Months", mealName: "Restaurant Meals" },
  CAD: { coffee: 6, streaming: 18, gym: 60, meal: 25, coffeeName: "Premium Coffees", streamingName: "Netflix Months", gymName: "Gym Months", mealName: "Restaurant Meals" },
  AUD: { coffee: 6.5, streaming: 19, gym: 65, meal: 28, coffeeName: "Premium Coffees", streamingName: "Netflix Months", gymName: "Gym Months", mealName: "Restaurant Meals" },
  EUR: { coffee: 4.5, streaming: 14, gym: 45, meal: 18, coffeeName: "Premium Coffees", streamingName: "Netflix Months", gymName: "Gym Months", mealName: "Restaurant Meals" },
  GBP: { coffee: 4, streaming: 12, gym: 40, meal: 16, coffeeName: "Premium Coffees", streamingName: "Netflix Months", gymName: "Gym Months", mealName: "Restaurant Meals" },
  INR: { coffee: 200, streaming: 300, gym: 1500, meal: 400, coffeeName: "Premium Coffees", streamingName: "Netflix Months", gymName: "Gym Months", mealName: "Restaurant Meals" },
};

function toNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function TimeCostCalculatorPage() {
  // Input states
  const [productPrice, setProductPrice] = useState("500");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [monthlyIncome, setMonthlyIncome] = useState("3000");
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState("8");
  const [savingsPerMonth, setSavingsPerMonth] = useState("500");
  const [workDaysPerMonth, setWorkDaysPerMonth] = useState("20");

  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);

  // Clear toast on unmount
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

  // Find active currency symbol and trade-offs
  const currency = useMemo(() => {
    return CURRENCIES.find((c) => c.value === currencyCode) || CURRENCIES[0];
  }, [currencyCode]);

  const equivalents = useMemo(() => {
    return EQUIVALENTS[currencyCode] || EQUIVALENTS.USD;
  }, [currencyCode]);

  // Safe input parsing
  const parsedValues = useMemo(() => {
    return {
      price: toNumber(productPrice),
      income: toNumber(monthlyIncome),
      hoursPerDay: toNumber(workingHoursPerDay),
      savings: toNumber(savingsPerMonth),
      daysPerMonth: toNumber(workDaysPerMonth),
    };
  }, [productPrice, monthlyIncome, workingHoursPerDay, savingsPerMonth, workDaysPerMonth]);

  // Validate inputs
  const validationError = useMemo(() => {
    const { price, income, hoursPerDay, savings, daysPerMonth } = parsedValues;

    if (price === null || price <= 0) {
      return "Product price must be a positive number greater than 0.";
    }
    if (income === null || income <= 0) {
      return "Monthly income must be a positive number greater than 0.";
    }
    if (hoursPerDay === null || hoursPerDay <= 0 || hoursPerDay > 24) {
      return "Working hours per day must be between 0.1 and 24.";
    }
    if (daysPerMonth === null || daysPerMonth <= 0 || daysPerMonth > 31) {
      return "Work days per month must be between 1 and 31.";
    }
    if (savings === null || savings < 0) {
      return "Savings per month cannot be negative.";
    }
    if (savings > income) {
      return "Savings per month cannot exceed your monthly income.";
    }

    return "";
  }, [parsedValues]);

  // Calculations
  const results = useMemo(() => {
    if (validationError) return null;

    const { price, income, hoursPerDay, savings, daysPerMonth } = parsedValues;

    // Daily income equivalent
    const dailyIncome = income / daysPerMonth;

    // Hourly wage equivalent
    const hourlyWage = dailyIncome / hoursPerDay;

    // Hours required to earn it
    const hoursRequired = price / hourlyWage;

    // Working days required
    const daysRequired = price / dailyIncome;

    // Months of savings required
    const savingsMonthsRequired = savings > 0 ? price / savings : Infinity;

    // Opportunity Cost: growth if invested instead at 8% annual return
    // Future Value = P * (1 + r)^t
    const futureValue5Years = price * Math.pow(1 + 0.08, 5);
    const futureValue10Years = price * Math.pow(1 + 0.08, 10);

    // Trade-off equivalents
    const coffeeCount = price / equivalents.coffee;
    const streamingCount = price / equivalents.streaming;
    const gymCount = price / equivalents.gym;
    const mealCount = price / equivalents.meal;

    return {
      dailyIncome,
      hourlyWage,
      hoursRequired,
      daysRequired,
      savingsMonthsRequired,
      futureValue5Years,
      futureValue10Years,
      coffeeCount,
      streamingCount,
      gymCount,
      mealCount,
    };
  }, [parsedValues, validationError, equivalents]);

  // Format currency helper
  const formatVal = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const formatDecimal = (val, maxDecimals = 1) => {
    if (!Number.isFinite(val)) return "N/A";
    return val.toLocaleString("en-IN", {
      maximumFractionDigits: maxDecimals,
      minimumFractionDigits: 0,
    });
  };

  // Plain-text report template for Copy / Download
  const reportText = useMemo(() => {
    if (!results) return "";

    const timestamp = new Date().toLocaleString();
    const { price, income, hoursPerDay, savings, daysPerMonth } = parsedValues;

    return `==================================================
            TIME COST CALCULATOR REPORT
            Generated: ${timestamp}
==================================================

INPUT PARAMETERS
--------------------------------------------------
Product Price        : ${formatVal(price)}
Monthly Income       : ${formatVal(income)}
Working Hours / Day  : ${hoursPerDay} hours
Work Days / Month    : ${daysPerMonth} days
Savings / Month      : ${formatVal(savings)}

CALCULATED METRICS
--------------------------------------------------
Daily Income Equiv   : ${formatVal(results.dailyIncome)}/day
Hourly Wage Equiv    : ${formatVal(results.hourlyWage)}/hour
Hours of Work Req.   : ${formatDecimal(results.hoursRequired)} hours
Working Days Req.    : ${formatDecimal(results.daysRequired)} days
Months of Savings Req: ${savings > 0 ? formatDecimal(results.savingsMonthsRequired) + " months" : "Infinite / No savings"}

REAL-WORLD PERSPECTIVES
--------------------------------------------------
* Life Energy Trade : You must trade ${formatDecimal(results.hoursRequired)} hours of your life energy to buy this.
* Work Schedule      : This equals ${formatDecimal(results.daysRequired)} full working days of your career.
* Monthly Income %   : This purchase consumes ${formatDecimal((price / income) * 100)}% of your monthly earnings.
* Investment Growth  : If you invested ${formatVal(price)} at an 8% p.a. compound return:
                      - In 5 Years : ${formatVal(results.futureValue5Years)}
                      - In 10 Years: ${formatVal(results.futureValue10Years)}

CONSUMER ALTERNATIVES & TRADE-OFFS
--------------------------------------------------
Instead of this purchase, you could buy:
* ${formatDecimal(results.coffeeCount)} cups of Premium Coffee
* ${formatDecimal(results.streamingCount)} months of Netflix subscription
* ${formatDecimal(results.gymCount)} months of Gym membership
* ${formatDecimal(results.mealCount)} Restaurant meals

--------------------------------------------------
Generated client-side via Boring Tools.
==================================================`;
  }, [results, parsedValues, currencyCode]);

  const handleCopyReport = async () => {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
      showToast("success", "Report copied to clipboard.");
    } catch {
      showToast("error", "Copy failed. Please try again.");
    }
  };

  const handleDownloadReport = () => {
    if (!results || typeof window === "undefined") return;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `time-cost-report-${parsedValues.price}-${currencyCode}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showToast("success", "Report downloaded successfully.");
  };

  const handleReset = () => {
    setProductPrice("500");
    setCurrencyCode("USD");
    setMonthlyIncome("3000");
    setWorkingHoursPerDay("8");
    setSavingsPerMonth("500");
    setWorkDaysPerMonth("20");
    showToast("success", "Calculator values reset.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6 my-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Finance Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Time Cost Calculator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Translate product price tags into hours of labor, career days, and saving months. Calculate your opportunity costs and make smarter purchases.
          </p>
        </div>

        {/* Inputs Block */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600 font-bold">Calculator Inputs</p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Configure your purchase and work parameters</h2>
              <p className="text-sm text-slate-500">Calculations run locally in your browser instantly.</p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:-translate-y-px hover:bg-orange-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Reset
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Currency */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900">Currency</span>
              <span className="text-xs text-slate-400">Select currency for localization</span>
              <div className="relative rounded-xl shadow-sm">
                <select
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none font-medium cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.22 7.72a.75.75 0 0 1 1.06.02L10 11.637l3.72-3.896a.75.75 0 1 1 1.08 1.04l-4.25 4.45a.75.75 0 0 1-1.08 0l-4.25-4.45a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </label>

            {/* Product Price */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900 flex justify-between">
                <span>Product Price</span>
              </span>
              <span className="text-xs text-slate-400">Cost of the item to purchase</span>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 text-sm">{currency.symbol}</span>
                </div>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-8 pr-4 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>
            </label>

            {/* Monthly Income */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900 flex justify-between">
                <span>Monthly Net Income</span>
              </span>
              <span className="text-xs text-slate-400">Your monthly post-tax take-home salary</span>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 text-sm">{currency.symbol}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="3000"
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-8 pr-4 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>
            </label>

            {/* Working Hours Per Day */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900">Working Hours Per Day</span>
              <span className="text-xs text-slate-400">Hours spent working actively each day</span>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="number"
                  min="0.1"
                  max="24"
                  step="0.5"
                  value={workingHoursPerDay}
                  onChange={(e) => setWorkingHoursPerDay(e.target.value)}
                  placeholder="8"
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-slate-500 text-sm">hrs</span>
                </div>
              </div>
            </label>

            {/* Work Days Per Month */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900">Work Days Per Month</span>
              <span className="text-xs text-slate-400">Total days you work in a typical month</span>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="number"
                  min="1"
                  max="31"
                  step="1"
                  value={workDaysPerMonth}
                  onChange={(e) => setWorkDaysPerMonth(e.target.value)}
                  placeholder="20"
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-slate-500 text-sm">days</span>
                </div>
              </div>
            </label>

            {/* Savings Per Month */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900">Savings Per Month</span>
              <span className="text-xs text-slate-400">How much money you save monthly</span>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 text-sm">{currency.symbol}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={savingsPerMonth}
                  onChange={(e) => setSavingsPerMonth(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-8 pr-4 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Validation Errors banner */}
        {validationError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-medium text-sm flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{validationError}</span>
          </div>
        ) : (
          results && (
            <>
              {/* Visual Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                {/* Work Hours Card */}
                <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition duration-300 flex flex-col justify-between group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-500" />
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Work Hours</span>
                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums group-hover:scale-105 transition-transform duration-200 origin-left">
                      {formatDecimal(results.hoursRequired)} hrs
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Hours of work required to earn this price at {formatVal(results.hourlyWage)}/hr
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs font-semibold text-slate-600">
                    <span>Work Week Equivalent</span>
                    <span className="text-indigo-600">{formatDecimal((results.hoursRequired / 40) * 100)}% of 40h</span>
                  </div>
                </div>

                {/* Work Days Card */}
                <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition duration-300 flex flex-col justify-between group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500" />
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Work Days</span>
                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums group-hover:scale-105 transition-transform duration-200 origin-left">
                      {formatDecimal(results.daysRequired)} days
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Full working days required to pay for it at {formatVal(results.dailyIncome)}/day
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs font-semibold text-slate-600">
                    <span>Monthly Work Share</span>
                    <span className="text-emerald-600">{formatDecimal((results.daysRequired / parsedValues.daysPerMonth) * 100)}% of month</span>
                  </div>
                </div>

                {/* Savings Months Card */}
                <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-amber-300 hover:shadow-md transition duration-300 flex flex-col justify-between group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-500" />
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Savings Months</span>
                    <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums group-hover:scale-105 transition-transform duration-200 origin-left">
                      {parsedValues.savings > 0 ? `${formatDecimal(results.savingsMonthsRequired)} mos` : "∞"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Months of saving required at {formatVal(parsedValues.savings)}/mo
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs font-semibold text-slate-600">
                    <span>Income Saved Ratio</span>
                    <span className="text-amber-600">{formatDecimal((parsedValues.savings / parsedValues.income) * 100)}% saved</span>
                  </div>
                </div>

                {/* Opportunity Cost Card */}
                <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-orange-300 hover:shadow-md transition duration-300 flex flex-col justify-between group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-orange-500" />
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">Opportunity Cost</span>
                    <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums group-hover:scale-105 transition-transform duration-200 origin-left">
                      {formatVal(results.futureValue5Years)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Value of this purchase if invested instead for 5 years at 8% p.a.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs font-semibold text-slate-600">
                    <span>Compound Multiplier</span>
                    <span className="text-orange-600">1.47x growth</span>
                  </div>
                </div>

              </div>

              {/* Perspective & Trade-offs Panel */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-8 flex flex-col gap-6 shadow-inner relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none translate-y-10 translate-x-10 scale-150">
                  <svg className="w-96 h-96 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 font-bold">Real-World Perspectives</p>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Understanding the true value exchange</h3>
                  <p className="text-slate-500 text-sm mt-1">Here is what spending {formatVal(parsedValues.price)} really means to your life and schedule.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Perspective Column 1 */}
                  <div className="space-y-4">
                    
                    {/* Time Statement */}
                    <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Life Energy Cost</h4>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                          This product costs <strong className="text-indigo-600">{formatDecimal(results.hoursRequired)} work hours</strong>. You are trading that much of your focused time and mental energy to acquire this.
                        </p>
                      </div>
                    </div>

                    {/* Schedule Statement */}
                    <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Career Schedule Impact</h4>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                          This equals <strong className="text-emerald-600">{formatDecimal(results.daysRequired)} working days</strong>. This represents a dedication of <strong className="text-slate-800">{formatDecimal(results.daysRequired / 5, 1)} business weeks</strong> of labor.
                        </p>
                      </div>
                    </div>

                    {/* Income share */}
                    <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-700 shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Income Allocation</h4>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                          This single item consumes <strong className="text-slate-900">{formatDecimal((parsedValues.price / parsedValues.income) * 100)}%</strong> of your total post-tax monthly earnings.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Perspective Column 2 */}
                  <div className="space-y-4">
                    
                    {/* Compound Growth Opportunity */}
                    <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
                      <div className="p-2 bg-orange-50 rounded-lg text-orange-600 shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Compound Investment Growth</h4>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                          Investing {formatVal(parsedValues.price)} instead at 8% annual compound growth yields:
                          <br />
                          - 5 Years: <strong className="text-orange-600">{formatVal(results.futureValue5Years)}</strong>
                          <br />
                          - 10 Years: <strong className="text-orange-700">{formatVal(results.futureValue10Years)}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Consumer Trade-offs list */}
                    <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
                      <div className="p-2 bg-rose-50 rounded-lg text-rose-600 shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div className="w-full">
                        <h4 className="text-sm font-bold text-slate-900">Alternative Trade-offs</h4>
                        <p className="text-sm text-slate-500 text-xs mt-0.5">Other utilities you could buy with the same funds:</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="block text-slate-400 font-semibold">{equivalents.coffeeName}</span>
                            <span className="text-slate-900 font-bold text-sm tabular-nums">{formatDecimal(results.coffeeCount)}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="block text-slate-400 font-semibold">{equivalents.streamingName}</span>
                            <span className="text-slate-900 font-bold text-sm tabular-nums">{formatDecimal(results.streamingCount)}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="block text-slate-400 font-semibold">{equivalents.gymName}</span>
                            <span className="text-slate-950 font-bold text-sm tabular-nums">{formatDecimal(results.gymCount)}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="block text-slate-400 font-semibold">{equivalents.mealName}</span>
                            <span className="text-slate-950 font-bold text-sm tabular-nums">{formatDecimal(results.mealCount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="rounded-xl border border-slate-950 bg-slate-950 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 active:scale-[0.98]"
                >
                  Copy Report
                </button>

                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="rounded-xl border border-orange-500 px-4 py-3 font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 active:scale-[0.98]"
                >
                  Download Report
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-350 hover:bg-slate-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 active:scale-[0.98]"
                >
                  Reset
                </button>
              </div>
            </>
          )
        )}

        {/* Formula Note Banner */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-bold">Time Cost Methodology</p>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            The calculator converts prices to hours and days based on your actual earnings per hour:
            <br />
            <code className="block mt-1.5 p-2 bg-slate-200/60 rounded text-slate-800 font-mono text-xs overflow-x-auto whitespace-pre">
              Daily Income Equiv = Monthly Net Income / Work Days Per Month
              <br />
              Hourly Wage Equiv  = Daily Income Equiv / Working Hours Per Day
              <br />
              Work Hours Required = Product Price / Hourly Wage Equiv
            </code>
            This method is inspired by standard personal finance models (such as "Your Money or Your Life") which treat money as a store of life energy traded at a specific wage rate.
          </p>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast.message && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-3 text-sm shadow-xl font-semibold border transition-all duration-300 animate-fade-in-out ${
            toast.type === "error" ? "bg-red-600 text-white border-red-700" : "bg-slate-900 text-white border-slate-950"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      {/* Inline styles for toast animations */}
      <style jsx global>{`
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

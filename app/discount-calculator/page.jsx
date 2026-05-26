"use client";

import ComingSoon from "@/app/components/ComingSoon";
import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const currencies = [
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AED", label: "UAE Dirham (AED)" },
];

const TOOL_STATUS = "upcoming";

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

function formatPercent(value) {
  return `${(Number(value) || 0).toFixed(2)}%`;
}

function StatCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function InsightCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse">
      <div className="h-3 w-24 rounded-full bg-slate-200" />
      <div className="mt-4 h-9 w-28 rounded-full bg-slate-200" />
      <div className="mt-2 h-3 w-32 rounded-full bg-slate-100" />
    </div>
  );
}

function buildReport({ originalPrice, discountPercentage, additionalDiscountPercentage, taxPercentage, currency, result }) {
  return [
    "Discount Calculator Report",
    `Original price: ${formatCurrency(originalPrice, currency)}`,
    `Discount percentage: ${formatPercent(discountPercentage)}`,
    `Additional discount: ${additionalDiscountPercentage > 0 ? formatPercent(additionalDiscountPercentage) : "None"}`,
    `Tax percentage: ${taxPercentage > 0 ? formatPercent(taxPercentage) : "None"}`,
    `Discount amount: ${formatCurrency(result.discountAmount, currency)}`,
    `Total savings: ${formatCurrency(result.totalSavings, currency)}`,
    `Final price after discount: ${formatCurrency(result.finalAfterDiscount, currency)}`,
    `Tax amount: ${formatCurrency(result.taxAmount, currency)}`,
    `Final price after tax: ${formatCurrency(result.finalAfterTax, currency)}`,
    `Effective discount percentage: ${formatPercent(result.effectiveDiscountPercentage)}`,
    `You saved: ${formatCurrency(result.totalSavings, currency)}`,
    `Total percentage reduced: ${formatPercent(result.effectiveDiscountPercentage)}`,
    `Price difference: ${formatCurrency(result.priceDifference, currency)}`,
    `Final payable amount: ${formatCurrency(result.finalAfterTax, currency)}`,
  ].join("\n");
}

export default function DiscountCalculatorPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Discount Calculator" />;
  }

  const [originalPrice, setOriginalPrice] = useState("2499");
  const [discountPercentage, setDiscountPercentage] = useState("20");
  const [additionalDiscountPercentage, setAdditionalDiscountPercentage] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [toast, setToast] = useState({ type: "", message: "" });
  const [animateCards, setAnimateCards] = useState(false);
  const toastTimerRef = useRef(null);

  const validationError = useMemo(() => {
    const parsedOriginal = parseNumber(originalPrice);
    const parsedDiscount = parseNumber(discountPercentage);
    const parsedAdditional = additionalDiscountPercentage === "" ? 0 : parseNumber(additionalDiscountPercentage);
    const parsedTax = taxPercentage === "" ? 0 : parseNumber(taxPercentage);

    if (parsedOriginal === null || parsedOriginal < 0) {
      return "Enter a valid original price.";
    }

    if (parsedDiscount === null || parsedDiscount < 0 || parsedDiscount > 100) {
      return "Discount percentage must be between 0 and 100.";
    }

    if (parsedAdditional === null || parsedAdditional < 0 || parsedAdditional > 100) {
      return "Additional discount must be between 0 and 100.";
    }

    if (parsedTax === null || parsedTax < 0 || parsedTax > 100) {
      return "Tax percentage must be between 0 and 100.";
    }

    return "";
  }, [additionalDiscountPercentage, discountPercentage, originalPrice, taxPercentage]);

  const result = useMemo(() => {
    const parsedOriginal = parseNumber(originalPrice);
    const parsedDiscount = parseNumber(discountPercentage);
    const parsedAdditional = additionalDiscountPercentage === "" ? 0 : parseNumber(additionalDiscountPercentage);
    const parsedTax = taxPercentage === "" ? 0 : parseNumber(taxPercentage);

    if (validationError || parsedOriginal === null || parsedDiscount === null) {
      return null;
    }

    const discountAfterFirst = parsedOriginal * (parsedDiscount / 100);
    const afterFirstDiscount = parsedOriginal - discountAfterFirst;
    const additionalDiscountAmount = afterFirstDiscount * (Math.max(0, parsedAdditional || 0) / 100);
    const finalAfterDiscount = afterFirstDiscount - additionalDiscountAmount;
    const discountAmount = parsedOriginal - finalAfterDiscount;
    const taxAmount = finalAfterDiscount * ((Math.max(0, parsedTax || 0)) / 100);
    const finalAfterTax = finalAfterDiscount + taxAmount;
    const totalSavings = parsedOriginal - finalAfterDiscount;
    const effectiveDiscountPercentage = parsedOriginal > 0 ? (discountAmount / parsedOriginal) * 100 : 0;
    const totalPercentageReduced = effectiveDiscountPercentage;
    const priceDifference = parsedOriginal - finalAfterTax;

    return {
      originalPrice: parsedOriginal,
      discountAmount,
      totalSavings,
      finalAfterDiscount,
      taxAmount,
      finalAfterTax,
      effectiveDiscountPercentage,
      totalPercentageReduced,
      priceDifference,
      additionalDiscountAmount,
    };
  }, [additionalDiscountPercentage, discountPercentage, originalPrice, taxPercentage, validationError]);

  const summaryText = useMemo(() => {
    if (!originalPrice && !discountPercentage && !additionalDiscountPercentage && !taxPercentage) {
      return "Enter a price and discount to see the savings breakdown.";
    }

    if (!result) {
      return validationError || "Checking discount details...";
    }

    return `You save ${formatCurrency(result.totalSavings, currency)} and pay ${formatCurrency(result.finalAfterTax, currency)} after tax.`;
  }, [additionalDiscountPercentage, currency, discountPercentage, originalPrice, result, taxPercentage, validationError]);

  const reportText = useMemo(() => {
    if (!result) {
      return "";
    }

    return buildReport({
      originalPrice: result.originalPrice,
      discountPercentage: parseNumber(discountPercentage) || 0,
      additionalDiscountPercentage: parseNumber(additionalDiscountPercentage) || 0,
      taxPercentage: parseNumber(taxPercentage) || 0,
      currency,
      result,
    });
  }, [additionalDiscountPercentage, currency, discountPercentage, result, taxPercentage]);

  useEffect(() => {
    if (!result) {
      setAnimateCards(false);
      return undefined;
    }

    setAnimateCards(true);
    const timer = window.setTimeout(() => setAnimateCards(false), 180);
    return () => window.clearTimeout(timer);
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
    link.download = `discount-calculator-report-${currency.toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("success", "Report downloaded.");
  };

  const clearInputs = () => {
    setOriginalPrice("");
    setDiscountPercentage("");
    setAdditionalDiscountPercentage("");
    setTaxPercentage("");
    setCurrency("INR");
    setToast({ type: "", message: "" });
    showToast("success", "Inputs cleared.");
  };

  const swapValues = () => {
    setDiscountPercentage(additionalDiscountPercentage);
    setAdditionalDiscountPercentage(discountPercentage);
    showToast("success", "Values swapped.");
  };

  const showEmptyState = !result && !validationError;
  const showSkeleton = Boolean(result && animateCards);
  const currencyLabel = currencies.find((item) => item.value === currency)?.label ?? currency;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Finance</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Discount Calculator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Instantly calculate discounts, savings, taxes, and final payable amounts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4 items-stretch">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Inputs</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Set the pricing details</h2>
              </div>
              <button
                type="button"
                onClick={swapValues}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Swap values
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_0.9fr] gap-3">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Original Price</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={originalPrice}
                    onChange={(event) => setOriginalPrice(event.target.value)}
                    placeholder="Enter original price"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Currency</span>
                  <ThemedDropdown
                    ariaLabel="Choose currency"
                    value={currency}
                    options={currencies}
                    onChange={(value) => setCurrency(value)}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Discount Percentage</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={discountPercentage}
                    onChange={(event) => setDiscountPercentage(event.target.value)}
                    placeholder="e.g. 20"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Additional Discount</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={additionalDiscountPercentage}
                    onChange={(event) => setAdditionalDiscountPercentage(event.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Tax Percentage</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxPercentage}
                    onChange={(event) => setTaxPercentage(event.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">Use optional fields to stack discounts and tax on top of the base price.</p>
                <button
                  type="button"
                  onClick={clearInputs}
                  className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-gradient-to-r from-white to-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 shadow-sm shadow-orange-100/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:from-orange-50 hover:to-orange-100 hover:text-orange-800 hover:shadow-md hover:shadow-orange-200/60 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Clear inputs
                </button>
              </div>

              {validationError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  <p className="text-sm font-semibold">Please fix the highlighted issue.</p>
                  <p className="text-sm">{validationError}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Summary</p>
            <div className="mt-2 flex flex-col gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{summaryText}</h2>
              <p className="text-sm text-slate-500">Live calculation updates instantly as you type.</p>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Selected currency</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{currencyLabel}</p>
            </div>

            {showEmptyState ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Empty state</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Enter a price to see the discount breakdown.</p>
                <p className="mt-1 text-sm text-slate-500">Discount, savings, tax, and payable amount will appear here instantly.</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {showSkeleton ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : result ? (
            <>
              <StatCard label="Original price" value={formatCurrency(result.originalPrice, currency)} subtitle="Starting price before discounts" />
              <StatCard label="Discount amount" value={formatCurrency(result.discountAmount, currency)} subtitle="Discounts applied in sequence" />
              <StatCard label="Total savings" value={formatCurrency(result.totalSavings, currency)} subtitle="Money saved before tax" />
              <StatCard label="Final price after discount" value={formatCurrency(result.finalAfterDiscount, currency)} subtitle="Before tax is added" />
              <StatCard label="Final price after tax" value={formatCurrency(result.finalAfterTax, currency)} subtitle="Final price you pay" />
              <StatCard label="Effective discount percentage" value={formatPercent(result.effectiveDiscountPercentage)} subtitle="Combined discount effect" />
            </>
          ) : null}
        </div>

        {result ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InsightCard label="You saved" value={formatCurrency(result.totalSavings, currency)} subtitle="Savings from discount percentages" />
            <InsightCard label="Total percentage reduced" value={formatPercent(result.totalPercentageReduced)} subtitle="Overall discount impact" />
            <InsightCard label="Price difference" value={formatCurrency(Math.abs(result.priceDifference), currency)} subtitle={result.priceDifference >= 0 ? "Less than the original price" : "More than the original price"} />
            <InsightCard label="Final payable amount" value={formatCurrency(result.finalAfterTax, currency)} subtitle="After discounts and tax" />
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={copyResults}
            className={`rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 ${!result || validationError ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!result || Boolean(validationError)}
          >
            Copy results
          </button>
          <button
            type="button"
            onClick={downloadReport}
            className={`rounded-xl border border-orange-500 px-4 py-3 font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${!result || validationError ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!result || Boolean(validationError)}
          >
            Download report
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Accuracy note</p>
          <p className="mt-2 text-sm text-slate-600">
            Discount math uses sequential percentage reductions, so the effective discount stays accurate even with optional extra discounts and tax.
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
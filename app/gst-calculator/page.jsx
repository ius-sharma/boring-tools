"use client";

import { useMemo, useState } from "react";

const gstRates = [5, 12, 18, 28];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export default function GSTCalculator() {
  const [amount, setAmount] = useState("1000");
  const [gstRate, setGstRate] = useState("18");
  const [mode, setMode] = useState("exclusive");

  const result = useMemo(() => {
    const numericAmount = Number(amount) || 0;
    const numericRate = Number(gstRate) || 0;

    if (mode === "inclusive") {
      const baseAmount = numericRate ? numericAmount / (1 + numericRate / 100) : numericAmount;
      const gstAmount = numericAmount - baseAmount;
      return {
        baseAmount,
        gstAmount,
        totalAmount: numericAmount,
        label: "GST included in the total amount",
      };
    }

    const gstAmount = numericAmount * (numericRate / 100);
    return {
      baseAmount: numericAmount,
      gstAmount,
      totalAmount: numericAmount + gstAmount,
      label: "GST added on top of the base amount",
    };
  }, [amount, gstRate, mode]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-5xl border border-slate-200 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">GST Calculator</h1>
          <p className="text-slate-500 text-base">Quickly calculate GST-inclusive or GST-exclusive totals.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "exclusive", label: "Before GST" },
                { value: "inclusive", label: "Including GST" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-500 ${mode === item.value ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label className="text-sm text-slate-700 flex flex-col gap-2">
              {mode === "exclusive" ? "Base amount" : "Total amount"}
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </label>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">GST rate</p>
              <div className="grid grid-cols-4 gap-2">
                {gstRates.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setGstRate(String(rate))}
                    className={`rounded-full border px-4 py-2 text-sm font-medium flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-orange-500 ${gstRate === String(rate) ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="0"
                step="0.1"
                value={gstRate}
                onChange={(event) => setGstRate(event.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Custom GST rate"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-4 min-w-0">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Calculation mode</p>
              <p className="text-sm font-medium text-slate-900 mt-1">{result.label}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch min-w-0">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-1 items-start min-h-28 justify-between min-w-0 overflow-hidden">
                <p className="text-xs text-slate-500">Base amount</p>
                <p className="w-full text-xl sm:text-2xl font-semibold text-slate-900 leading-none tracking-tight tabular-nums truncate">
                  ₹{formatCurrency(result.baseAmount)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-1 items-start min-h-28 justify-between min-w-0 overflow-hidden">
                <p className="text-xs text-slate-500">GST amount</p>
                <p className="w-full text-xl sm:text-2xl font-semibold text-slate-900 leading-none tracking-tight tabular-nums truncate">
                  ₹{formatCurrency(result.gstAmount)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-1 items-start min-h-28 justify-between min-w-0 overflow-hidden">
                <p className="text-xs text-slate-500">Total amount</p>
                <p className="w-full text-xl sm:text-2xl font-semibold text-slate-900 leading-none tracking-tight tabular-nums truncate">
                  ₹{formatCurrency(result.totalAmount)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Quick summary</p>
              <p className="text-sm font-medium text-slate-900 mt-1 leading-relaxed break-words">
                GST at {gstRate || 0}% on ₹{formatCurrency(amount || 0)} gives ₹{formatCurrency(result.gstAmount)} tax and ₹{formatCurrency(result.totalAmount)} total.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">Black-and-white layout, fast presets, and live total updates for easy billing checks.</p>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}



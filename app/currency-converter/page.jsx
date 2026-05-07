"use client";

import React, { useEffect, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [rate, setRate] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const currencies = ["USD", "EUR", "INR", "GBP", "JPY", "AUD", "CAD"];

  useEffect(() => {
    const fetchRate = async () => {
      setLoading(true);
      setError("");
      try {
        // Primary source (may require an API key now)
        const res = await fetch(`https://api.exchangerate.host/latest?base=${from}&symbols=${to}`);
        const json = await res.json();

        if (json && json.rates && json.rates[to]) {
          const nextRate = Number(json.rates[to]);
          const nextAmount = Number(amount);
          setRate(nextRate);
          setResult(Number.isFinite(nextAmount) ? (nextAmount * nextRate).toFixed(2) : "");
        } else {
          // Fallback to open.er-api.com which provides free access without a key
          try {
            const fb = await fetch(`https://open.er-api.com/v6/latest/${from}`);
            const fbJson = await fb.json();
            if (fbJson && fbJson.rates && fbJson.rates[to]) {
              const nextRate = Number(fbJson.rates[to]);
              const nextAmount = Number(amount);
              setRate(nextRate);
              setResult(Number.isFinite(nextAmount) ? (nextAmount * nextRate).toFixed(2) : "");
            } else {
              setRate(null);
              setResult("");
              setError("Rate not available right now");
            }
          } catch {
            setRate(null);
            setResult("");
            setError("Rate not available right now");
          }
        }
      } catch {
        setRate(null);
        setResult("");
        setError("Unable to load live rate right now");
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, [from, to, amount]);

  const swap = () => {
    const prev = from;
    setFrom(to);
    setTo(prev);
    setResult("");
    setRate(null);
    setError("");
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`${amount} ${from} = ${result} ${to}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-xl border border-slate-200 flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Currency Converter</h1>
          <p className="text-slate-500 text-base text-center">Convert between currencies using the live market rate</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ThemedDropdown
            ariaLabel="From currency"
            value={from}
            options={currencies.map((c) => ({ value: c, label: c }))}
            onChange={(v) => {
              setFrom(v);
              setResult("");
              setError("");
            }}
          />

          <ThemedDropdown
            ariaLabel="To currency"
            value={to}
            options={currencies.map((c) => ({ value: c, label: c }))}
            onChange={(v) => {
              setTo(v);
              setResult("");
              setError("");
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <input
            type="number"
            inputMode="decimal"
            className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition text-base text-slate-900 placeholder:text-slate-300"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />

          <button
            type="button"
            onClick={swap}
            className="h-14 min-w-14 border border-slate-300 rounded-xl px-4 py-3 text-slate-700 bg-slate-50 hover:bg-slate-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 flex items-center justify-center shadow-sm"
            aria-label="Swap currencies"
          >
            ⇄
          </button>
        </div>

        <button
          onClick={copy}
          className="w-full border border-orange-500 text-orange-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-orange-500"
          disabled={!result || loading}
        >
          Copy Result
        </button>

        {error && <p className="text-red-600 text-sm -mt-2">{error}</p>}

        <div className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-center space-y-2 min-h-[120px] flex flex-col justify-center">
          {loading ? (
            <div className="text-slate-500">Loading live rate...</div>
          ) : rate ? (
            <>
              <div className="text-lg text-slate-700">1 {from} = {rate.toFixed(4)} {to}</div>
              <div className="text-2xl font-bold mt-1 text-slate-900">{result} {to}</div>
              <p className="text-sm text-slate-700 break-words">
                {amount || "0"} {from} = {result} {to}
              </p>
            </>
          ) : (
            <div className="text-slate-400">Live rate will appear here</div>
          )}
        </div>

        {showToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-fade-in-out">
            Result copied!
          </div>
        )}
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
        .animate-fade-in-out {
          animation: fadeInOut 1.5s;
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



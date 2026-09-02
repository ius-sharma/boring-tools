"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const COINS = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    icon: "/crypto/bitcoin.png",
    defaultPriceUsd: 77000,
    defaultPriceInr: 7280000,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    icon: "/crypto/ethereum.png",
    defaultPriceUsd: 2380,
    defaultPriceInr: 226000,
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    icon: "/crypto/solana.png",
    defaultPriceUsd: 98.5,
    defaultPriceInr: 9350,
  },
];

function formatPrice(num, currency = "USD") {
  if (!Number.isFinite(num) || num === null || num === undefined) return "—";
  const isINR = currency === "INR";
  const symbol = isINR ? "₹" : "$";
  return (
    symbol +
    new Intl.NumberFormat(isINR ? "en-IN" : "en-US", {
      maximumFractionDigits: num < 1 ? 4 : 2,
      minimumFractionDigits: 2,
    }).format(num)
  );
}

export default function CryptoTrackerPage() {
  const [currency, setCurrency] = useState("USD");
  const [marketData, setMarketData] = useState({
    bitcoin: { priceUsd: 77065, priceInr: 7280000, change24h: 0.85, high24hUsd: 77720, low24hUsd: 76290, high24hInr: 7350000, low24hInr: 7210000 },
    ethereum: { priceUsd: 2376, priceInr: 226000, change24h: -1.2, high24hUsd: 2426, low24hUsd: 2357, high24hInr: 230000, low24hInr: 224000 },
    solana: { priceUsd: 98.5, priceInr: 9350, change24h: 2.1, high24hUsd: 100.6, low24hUsd: 97.4, high24hInr: 9550, low24hInr: 9240 },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Quick Calculator / Converter State
  const [converterCoin, setConverterCoin] = useState("bitcoin");
  const [converterAmount, setConverterAmount] = useState("1");

  const toastTimerRef = useRef(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(""), 2000);
  };

  // Fetch real-time market data
  const fetchMarketPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      // Primary: CoinGecko markets API (provides real-time price, 24h change, 24h high/low for USD)
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana"
      );
      
      // Secondary: USD/INR exchange rate or simple price endpoint
      const inrRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=inr"
      );

      if (res.ok && inrRes.ok) {
        const usdData = await res.json();
        const inrData = await inrRes.json();

        const updated = {};
        for (const coin of COINS) {
          const uCoin = usdData.find((d) => d.id === coin.id);
          const inrPrice = inrData[coin.id]?.inr || (uCoin ? uCoin.current_price * 94.5 : coin.defaultPriceInr);

          if (uCoin) {
            const inrRatio = inrPrice / (uCoin.current_price || 1);
            updated[coin.id] = {
              priceUsd: uCoin.current_price,
              priceInr: inrPrice,
              change24h: uCoin.price_change_percentage_24h ?? 0,
              high24hUsd: uCoin.high_24h,
              low24hUsd: uCoin.low_24h,
              high24hInr: uCoin.high_24h ? uCoin.high_24h * inrRatio : null,
              low24hInr: uCoin.low_24h ? uCoin.low_24h * inrRatio : null,
            };
          }
        }
        setMarketData(updated);
        setLastUpdated(new Date());
        return;
      }
    } catch {
      // Fallback: Binance ticker
      try {
        const bRes = await fetch(
          'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]'
        );
        if (bRes.ok) {
          const list = await bRes.json();
          const inrMult = 94.5;
          const updated = {};
          
          const symbolMap = { BTCUSDT: "bitcoin", ETHUSDT: "ethereum", SOLUSDT: "solana" };
          for (const item of list) {
            const coinId = symbolMap[item.symbol];
            if (coinId) {
              const lastP = Number(item.lastPrice);
              const highP = Number(item.highPrice);
              const lowP = Number(item.lowPrice);
              const change = Number(item.priceChangePercent);

              updated[coinId] = {
                priceUsd: lastP,
                priceInr: lastP * inrMult,
                change24h: change,
                high24hUsd: highP,
                low24hUsd: lowP,
                high24hInr: highP * inrMult,
                low24hInr: lowP * inrMult,
              };
            }
          }
          setMarketData((prev) => ({ ...prev, ...updated }));
          setLastUpdated(new Date());
        }
      } catch {
        // keep existing
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketPrices();
    const interval = setInterval(fetchMarketPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchMarketPrices]);

  // Converter calculation
  const currentCoinData = marketData[converterCoin];
  const unitPrice = currency === "INR" ? currentCoinData?.priceInr : currentCoinData?.priceUsd;
  const convertedTotal = (Number(converterAmount) || 0) * (unitPrice || 0);

  const copyPrice = (coinName, priceStr) => {
    navigator.clipboard.writeText(`${coinName}: ${priceStr}`);
    showToast(`${coinName} price copied!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-3xl border border-slate-200 flex flex-col gap-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Market Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Crypto Price Tracker
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Live prices, 24-hour highs, lows & instant conversion.
            </p>
          </div>

          {/* Controls: Currency Switcher & Refresh */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currency === "USD"
                    ? "bg-white text-slate-900 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency("INR")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currency === "INR"
                    ? "bg-white text-slate-900 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ₹ INR
              </button>
            </div>

            <button
              type="button"
              onClick={fetchMarketPrices}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition active:scale-95"
              title="Refresh Prices"
            >
              <svg
                className={`w-4 h-4 ${isLoading ? "animate-spin text-orange-600" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 3 Main Coin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COINS.map((coin) => {
            const data = marketData[coin.id];
            const price = currency === "INR" ? data?.priceInr : data?.priceUsd;
            const change = data?.change24h ?? 0;
            const isPos = change >= 0;
            const high = currency === "INR" ? data?.high24hInr : data?.high24hUsd;
            const low = currency === "INR" ? data?.low24hInr : data?.low24hUsd;
            const priceText = formatPrice(price, currency);

            return (
              <div
                key={coin.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Official Coin Icon, Name, 24h Change */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={coin.icon}
                        alt={`${coin.name} logo`}
                        className="w-8 h-8 rounded-full object-contain shrink-0"
                      />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 leading-tight">
                          {coin.name}
                        </h2>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {coin.symbol}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isPos
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {change.toFixed(2)}%
                    </span>
                  </div>

                  {/* Big Price */}
                  <div className="mt-4">
                    <p className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 tabular-nums">
                      {priceText}
                    </p>
                  </div>

                  {/* 24h Range */}
                  {(high || low) && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div>
                        <span className="text-slate-400">Low: </span>
                        <span className="font-semibold text-slate-700">{formatPrice(low, currency)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">High: </span>
                        <span className="font-semibold text-slate-700">{formatPrice(high, currency)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="mt-4 pt-2">
                  <button
                    type="button"
                    onClick={() => copyPrice(coin.name, priceText)}
                    className="w-full py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition text-center"
                  >
                    Copy Price
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Instant Converter / Multiplier */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Quick Value Calculator
            </h3>
            <span className="text-xs text-slate-400">Live rate conversion</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Amount input */}
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                step="any"
                value={converterAmount}
                onChange={(e) => setConverterAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm font-semibold text-slate-900 focus:border-orange-500 focus:outline-none"
                placeholder="Enter amount"
              />
            </div>

            {/* Coin selector */}
            <div className="flex gap-1.5">
              {COINS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setConverterCoin(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                    converterCoin === c.id
                      ? "bg-white border-orange-500 text-orange-700 shadow-sm"
                      : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <img src={c.icon} alt={c.name} className="w-4 h-4 rounded-full" />
                  <span>{c.symbol}</span>
                </button>
              ))}
            </div>

            {/* Equals output */}
            <div className="sm:text-right px-3 py-2 bg-white rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 block font-medium">Value</span>
              <span className="text-base font-extrabold text-slate-900 tabular-nums">
                {formatPrice(convertedTotal, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            {lastUpdated
              ? `Auto-refreshed: ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
              : "Connecting to live market..."}
          </span>
          <span className="text-slate-400">100% Client-Side • Privacy First</span>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg">
            ✓ {toast}
          </div>
        )}

      </div>
    </div>
  );
}

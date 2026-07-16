"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import ComingSoon from "@/app/components/ComingSoon";

const TOOL_STATUS = "live";

// Helper to safely parse inputs to floats
function toFloat(value, defaultValue = 0) {
  if (value === "" || value === null || value === undefined) {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Helper to safely parse inputs to integers
function toInt(value, defaultValue = 0) {
  if (value === "" || value === null || value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Helper to format currency values
function formatVal(val, curr) {
  const symbolMap = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
  };
  const symbol = symbolMap[curr] || curr;
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: curr,
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);
}

// Helper to format compact currency values
function formatCompactVal(val, curr) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: curr,
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(Number(val) || 0);
}

// Helper to translate relative month offsets to actual Date strings
const getMonthDateString = (startDateStr, monthOffset) => {
  if (!startDateStr) return `Month ${monthOffset}`;
  const [year, month] = startDateStr.split("-").map(Number);
  const date = new Date(year, month - 1 + monthOffset, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function CashRunwayCalculatorPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Cash Runway Calculator" />;
  }

  // Core Calculator States
  const [currentCash, setCurrentCash] = useState("100000");
  const [monthlyRevenue, setMonthlyRevenue] = useState("15000");
  const [monthlyExpenses, setMonthlyExpenses] = useState("25000");
  const [useDirectBurn, setUseDirectBurn] = useState(false);
  const [monthlyBurnRate, setMonthlyBurnRate] = useState("10000");
  const [expectedRevenueGrowth, setExpectedRevenueGrowth] = useState("2");
  const [expectedExpenseGrowth, setExpectedExpenseGrowth] = useState("1");
  const [currency, setCurrency] = useState("USD");
  const [startMonth, setStartMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });

  // Expected Funding States
  const [investmentExpected, setInvestmentExpected] = useState(false);
  const [fundingAmount, setFundingAmount] = useState("50000");
  const [fundingMonth, setFundingMonth] = useState("6");

  // Simulated Events list
  const [simulatedEvents, setSimulatedEvents] = useState([]);

  // Simulation Form States
  const [simType, setSimType] = useState("hire");
  const [simName, setSimName] = useState("");
  const [simVal, setSimVal] = useState("");
  const [simMonth, setSimMonth] = useState("3");
  const [simDuration, setSimDuration] = useState("-1"); // -1 for ongoing, positive integer for specific duration

  // Toast notifications
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);

  // Load state from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cash-runway-calculator-data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentCash !== undefined) setCurrentCash(parsed.currentCash);
        if (parsed.monthlyRevenue !== undefined) setMonthlyRevenue(parsed.monthlyRevenue);
        if (parsed.monthlyExpenses !== undefined) setMonthlyExpenses(parsed.monthlyExpenses);
        if (parsed.useDirectBurn !== undefined) setUseDirectBurn(parsed.useDirectBurn);
        if (parsed.monthlyBurnRate !== undefined) setMonthlyBurnRate(parsed.monthlyBurnRate);
        if (parsed.expectedRevenueGrowth !== undefined) setExpectedRevenueGrowth(parsed.expectedRevenueGrowth);
        if (parsed.expectedExpenseGrowth !== undefined) setExpectedExpenseGrowth(parsed.expectedExpenseGrowth);
        if (parsed.currency !== undefined) setCurrency(parsed.currency);
        if (parsed.startMonth !== undefined) setStartMonth(parsed.startMonth);
        if (parsed.investmentExpected !== undefined) setInvestmentExpected(parsed.investmentExpected);
        if (parsed.fundingAmount !== undefined) setFundingAmount(parsed.fundingAmount);
        if (parsed.fundingMonth !== undefined) setFundingMonth(parsed.fundingMonth);
        if (parsed.simulatedEvents !== undefined) setSimulatedEvents(parsed.simulatedEvents);
      }
    } catch (e) {
      console.error("Failed to restore session:", e);
    }
  }, []);

  // Save state to local storage when items change
  useEffect(() => {
    try {
      const dataToSave = {
        currentCash,
        monthlyRevenue,
        monthlyExpenses,
        useDirectBurn,
        monthlyBurnRate,
        expectedRevenueGrowth,
        expectedExpenseGrowth,
        currency,
        startMonth,
        investmentExpected,
        fundingAmount,
        fundingMonth,
        simulatedEvents,
      };
      localStorage.setItem("cash-runway-calculator-data", JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Failed to save session:", e);
    }
  }, [
    currentCash,
    monthlyRevenue,
    monthlyExpenses,
    useDirectBurn,
    monthlyBurnRate,
    expectedRevenueGrowth,
    expectedExpenseGrowth,
    currency,
    startMonth,
    investmentExpected,
    fundingAmount,
    fundingMonth,
    simulatedEvents,
  ]);

  // Clean up toast timer
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
    }, 2000);
  };

  // Reset function
  const handleReset = () => {
    setCurrentCash("100000");
    setMonthlyRevenue("15000");
    setMonthlyExpenses("25000");
    setUseDirectBurn(false);
    setMonthlyBurnRate("10000");
    setExpectedRevenueGrowth("2");
    setExpectedExpenseGrowth("1");
    setCurrency("USD");
    const today = new Date();
    setStartMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`);
    setInvestmentExpected(false);
    setFundingAmount("50000");
    setFundingMonth("6");
    setSimulatedEvents([]);
    setSimType("hire");
    setSimName("");
    setSimVal("");
    setSimMonth("3");
    setSimDuration("-1");
    showToast("success", "Calculator reset successfully");
  };

  // Add a simulation event
  const addSimEvent = (e) => {
    e.preventDefault();
    if (!simName.trim()) {
      showToast("error", "Please provide a name/title for the simulation event");
      return;
    }
    const val = toFloat(simVal);
    if (val <= 0) {
      showToast("error", "Please enter a value greater than 0");
      return;
    }
    const month = toInt(simMonth, 1);
    if (month < 1 || month > 60) {
      showToast("error", "Month must be between 1 and 60");
      return;
    }

    const newEvent = {
      id: Date.now().toString(),
      type: simType,
      name: simName.trim(),
      amount: val, // used for expense / funding
      salary: val, // used for hire
      cost: val, // used for marketing
      startMonth: month, // used for hire / marketing
      month: month, // used for expense / funding
      duration: toInt(simDuration, -1), // used for marketing
    };

    setSimulatedEvents((prev) => [...prev, newEvent].sort((a, b) => a.month - b.month));
    setSimName("");
    setSimVal("");
    showToast("success", `Added simulated ${simType}`);
  };

  // Remove a simulation event
  const deleteSimEvent = (id) => {
    setSimulatedEvents((prev) => prev.filter((item) => item.id !== id));
    showToast("success", "Simulated event removed");
  };

  // Calculation parameters
  const parsedInputs = useMemo(() => {
    return {
      cash: toFloat(currentCash, 0),
      rev: useDirectBurn ? 0 : toFloat(monthlyRevenue, 0),
      exp: useDirectBurn ? toFloat(monthlyBurnRate, 0) : toFloat(monthlyExpenses, 0),
      directBurn: toFloat(monthlyBurnRate, 0),
      revG: toFloat(expectedRevenueGrowth, 0),
      expG: toFloat(expectedExpenseGrowth, 0),
      fundAmt: toFloat(fundingAmount, 0),
      fundMon: toInt(fundingMonth, 6),
    };
  }, [
    currentCash,
    monthlyRevenue,
    monthlyExpenses,
    useDirectBurn,
    monthlyBurnRate,
    expectedRevenueGrowth,
    expectedExpenseGrowth,
    fundingAmount,
    fundingMonth,
  ]);

  // Core Projection Engine (Run up to 60 months)
  const projection = useMemo(() => {
    const data = [];
    const maxMonths = 60;
    let cash = parsedInputs.cash;
    let rev = parsedInputs.rev;
    let exp = parsedInputs.exp;
    const revG = parsedInputs.revG;
    const expG = parsedInputs.expG;

    // Month 0
    data.push({
      month: 0,
      monthName: getMonthDateString(startMonth, 0),
      cash: cash,
      revenue: rev,
      expenses: exp,
      netBurn: Math.max(0, exp - rev),
      profit: rev - exp,
      funding: 0,
    });

    for (let m = 1; m <= maxMonths; m++) {
      // Calculate growth baseline
      const currentRev = useDirectBurn ? 0 : rev * Math.pow(1 + revG / 100, m);
      const currentExpBase = useDirectBurn
        ? exp * Math.pow(1 + expG / 100, m)
        : exp * Math.pow(1 + expG / 100, m);

      let eventFunding = 0;
      let eventExpenses = 0;

      // Apply simulated events
      simulatedEvents.forEach((evt) => {
        if (evt.type === "hire" && m >= evt.startMonth) {
          eventExpenses += evt.salary;
        } else if (evt.type === "marketing" && m >= evt.startMonth) {
          if (evt.duration === -1 || m < evt.startMonth + evt.duration) {
            eventExpenses += evt.cost;
          }
        } else if (evt.type === "expense" && m === evt.month) {
          eventExpenses += evt.amount;
        } else if (evt.type === "funding" && m === evt.month) {
          eventFunding += evt.amount;
        }
      });

      // Apply static optional expected funding
      if (investmentExpected && m === parsedInputs.fundMon) {
        eventFunding += parsedInputs.fundAmt;
      }

      const totalExp = currentExpBase + eventExpenses;
      const profit = currentRev - totalExp;
      const prevCash = cash;
      
      // Calculate next cash balance
      cash = prevCash + profit + eventFunding;

      data.push({
        month: m,
        monthName: getMonthDateString(startMonth, m),
        cash: cash < 0 ? 0 : cash,
        rawCash: cash,
        revenue: currentRev,
        expenses: totalExp,
        netBurn: Math.max(0, totalExp - currentRev),
        profit: profit,
        funding: eventFunding,
      });
    }

    return data;
  }, [parsedInputs, startMonth, investmentExpected, simulatedEvents, useDirectBurn]);

  // Calculate actual Runway Months exactly
  const runwayMonths = useMemo(() => {
    // We run the projection loop for up to 120 months to accurately determine very long runways
    const maxSimMonths = 120;
    let cash = parsedInputs.cash;
    let rev = parsedInputs.rev;
    let exp = parsedInputs.exp;
    const revG = parsedInputs.revG;
    const expG = parsedInputs.expG;

    if (cash <= 0) return 0;

    for (let m = 1; m <= maxSimMonths; m++) {
      const currentRev = useDirectBurn ? 0 : rev * Math.pow(1 + revG / 100, m);
      const currentExpBase = useDirectBurn
        ? exp * Math.pow(1 + expG / 100, m)
        : exp * Math.pow(1 + expG / 100, m);

      let eventFunding = 0;
      let eventExpenses = 0;

      simulatedEvents.forEach((evt) => {
        if (evt.type === "hire" && m >= evt.startMonth) {
          eventExpenses += evt.salary;
        } else if (evt.type === "marketing" && m >= evt.startMonth) {
          if (evt.duration === -1 || m < evt.startMonth + evt.duration) {
            eventExpenses += evt.cost;
          }
        } else if (evt.type === "expense" && m === evt.month) {
          eventExpenses += evt.amount;
        } else if (evt.type === "funding" && m === evt.month) {
          eventFunding += evt.amount;
        }
      });

      if (investmentExpected && m === parsedInputs.fundMon) {
        eventFunding += parsedInputs.fundAmt;
      }

      const totalExp = currentExpBase + eventExpenses;
      const profit = currentRev - totalExp;
      const prevCash = cash;
      
      cash = prevCash + profit + eventFunding;

      if (cash <= 0) {
        // Cash ran out in month m. Compute fractional month coverage.
        const totalOutflow = (totalExp - currentRev - eventFunding);
        if (totalOutflow > 0) {
          const fraction = prevCash / totalOutflow;
          return (m - 1) + Math.min(1, Math.max(0, fraction));
        }
        return m - 1;
      }
    }

    return Infinity;
  }, [parsedInputs, investmentExpected, simulatedEvents, useDirectBurn]);

  // Find break even month index (first month where profit >= 0)
  const breakEvenMonth = useMemo(() => {
    if (useDirectBurn) return null;
    
    // Check if already profitable
    if (parsedInputs.rev >= parsedInputs.exp) {
      return 0;
    }

    // Check next 60 months
    for (let i = 1; i < projection.length; i++) {
      if (projection[i].profit >= 0) {
        return i;
      }
    }
    return null;
  }, [parsedInputs, projection, useDirectBurn]);

  // Risk Rating Score
  const runwayStatus = useMemo(() => {
    if (runwayMonths === Infinity) return "Healthy";
    if (runwayMonths < 6) return "Critical";
    if (runwayMonths <= 12) return "Warning";
    return "Healthy";
  }, [runwayMonths]);

  // Dynamic Suggestion Engine
  const suggestions = useMemo(() => {
    if (runwayMonths === Infinity) {
      return [
        {
          title: "Optimize Capital Efficiency",
          description: "Since the company is profitable, explore investing surplus cash into high-ROI marketing or product expansion.",
          action: "Invest surplus cash"
        }
      ];
    }

    const items = [];
    const R = runwayMonths;

    // 1. Cut expenses by 15% simulation
    // We run runwayMonths again with exp reduced by 15%
    const runSimulationHelper = (expMultiplier, revMultiplier) => {
      const maxSim = 120;
      let cash = parsedInputs.cash;
      let rev = parsedInputs.rev * revMultiplier;
      let exp = parsedInputs.exp * expMultiplier;
      const revG = parsedInputs.revG;
      const expG = parsedInputs.expG;

      if (cash <= 0) return 0;

      for (let m = 1; m <= maxSim; m++) {
        const currentRev = useDirectBurn ? 0 : rev * Math.pow(1 + revG / 100, m);
        const currentExpBase = useDirectBurn
          ? exp * Math.pow(1 + expG / 100, m)
          : exp * Math.pow(1 + expG / 100, m);

        let eventFunding = 0;
        let eventExpenses = 0;

        simulatedEvents.forEach((evt) => {
          if (evt.type === "hire" && m >= evt.startMonth) {
            eventExpenses += evt.salary;
          } else if (evt.type === "marketing" && m >= evt.startMonth) {
            if (evt.duration === -1 || m < evt.startMonth + evt.duration) {
              eventExpenses += evt.cost;
            }
          } else if (evt.type === "expense" && m === evt.month) {
            eventExpenses += evt.amount;
          } else if (evt.type === "funding" && m === evt.month) {
            eventFunding += evt.amount;
          }
        });

        if (investmentExpected && m === parsedInputs.fundMon) {
          eventFunding += parsedInputs.fundAmt;
        }

        const totalExp = currentExpBase + eventExpenses;
        const profit = currentRev - totalExp;
        const prevCash = cash;
        cash = prevCash + profit + eventFunding;

        if (cash <= 0) {
          const totalOutflow = (totalExp - currentRev - eventFunding);
          if (totalOutflow > 0) {
            return (m - 1) + Math.min(1, Math.max(0, prevCash / totalOutflow));
          }
          return m - 1;
        }
      }
      return Infinity;
    };

    const runwayWithCut = runSimulationHelper(0.85, 1.0); // 15% expense cut
    const cutDiff = runwayWithCut === Infinity ? "Infinite" : (runwayWithCut - R).toFixed(1);

    items.push({
      title: "Reduce Monthly Burn (15% Cut)",
      description: runwayWithCut === Infinity
        ? "Cutting operating expenses by 15% shifts the startup to a self-sustaining profitable growth track."
        : `A 15% reduction in operating costs extends your runway by +${cutDiff} months (to ${runwayWithCut.toFixed(1)} months).`,
      action: "Review non-essential SaaS, vendor contracts, or optimize infrastructure costs."
    });

    // 2. Increase Revenue by 15% simulation
    if (!useDirectBurn) {
      const runwayWithGrowth = runSimulationHelper(1.0, 1.15); // 15% revenue increase
      const revDiff = runwayWithGrowth === Infinity ? "Infinite" : (runwayWithGrowth - R).toFixed(1);

      items.push({
        title: "Increase Revenue (15% Boost)",
        description: runwayWithGrowth === Infinity
          ? "Boosting monthly revenue by 15% instantly puts the company on a profitable growth track, giving infinite runway."
          : `Increasing sales/mrr by 15% extends your runway by +${revDiff} months (to ${runwayWithGrowth.toFixed(1)} months).`,
        action: "Focus on closing near-term pipeline, cross-selling existing users, or optimizing pricing tiers."
      });
    }

    // 3. Fund Raising suggestion
    // Let's find cash at month 18
    let month18CashIndex = Math.min(18, projection.length - 1);
    let cashAt18 = projection[month18CashIndex]?.rawCash || 0;
    if (cashAt18 < 0 || R < 18) {
      // Find what amount is needed to make month 18 cash >= 0.
      let lowestCashIn18Months = 0;
      let cashAccum = parsedInputs.cash;
      let revAccum = parsedInputs.rev;
      let expAccum = parsedInputs.exp;

      for (let m = 1; m <= 18; m++) {
        const currentRev = useDirectBurn ? 0 : revAccum * Math.pow(1 + parsedInputs.revG / 100, m);
        const currentExpBase = useDirectBurn
          ? expAccum * Math.pow(1 + parsedInputs.expG / 100, m)
          : expAccum * Math.pow(1 + parsedInputs.expG / 100, m);

        let eventFunding = 0;
        let eventExpenses = 0;

        simulatedEvents.forEach((evt) => {
          if (evt.type === "hire" && m >= evt.startMonth) {
            eventExpenses += evt.salary;
          } else if (evt.type === "marketing" && m >= evt.startMonth) {
            if (evt.duration === -1 || m < evt.startMonth + evt.duration) {
              eventExpenses += evt.cost;
            }
          } else if (evt.type === "expense" && m === evt.month) {
            eventExpenses += evt.amount;
          } else if (evt.type === "funding" && m === evt.month) {
            eventFunding += evt.amount;
          }
        });

        if (investmentExpected && m === parsedInputs.fundMon) {
          eventFunding += parsedInputs.fundAmt;
        }

        const profit = currentRev - (currentExpBase + eventExpenses);
        cashAccum = cashAccum + profit + eventFunding;
        if (cashAccum < lowestCashIn18Months) {
          lowestCashIn18Months = cashAccum;
        }
      }

      const deficit = Math.abs(lowestCashIn18Months < 0 ? lowestCashIn18Months : (cashAccum < 0 ? cashAccum : 0));
      if (deficit > 0) {
        items.push({
          title: "Raise Additional Funding",
          description: `To secure a safe 18-month cash runway, you need to secure a minimum of ${formatVal(deficit, currency)} in funding.`,
          action: "Start prepping investor decks immediately. Typical startup funding rounds take 4-6 months to close."
        });
      }
    }

    // 4. Hiring delay recommendation
    const simulatedHires = simulatedEvents.filter(e => e.type === 'hire');
    if (simulatedHires.length > 0) {
      // Run simulation without hires
      const runWithoutHires = () => {
        const maxSim = 120;
        let cash = parsedInputs.cash;
        let rev = parsedInputs.rev;
        let exp = parsedInputs.exp;

        if (cash <= 0) return 0;

        for (let m = 1; m <= maxSim; m++) {
          const currentRev = useDirectBurn ? 0 : rev * Math.pow(1 + parsedInputs.revG / 100, m);
          const currentExpBase = useDirectBurn
            ? exp * Math.pow(1 + parsedInputs.expG / 100, m)
            : exp * Math.pow(1 + parsedInputs.expG / 100, m);

          let eventFunding = 0;
          let eventExpenses = 0;

          simulatedEvents.forEach((evt) => {
            if (evt.type === "hire") {
              // skip hires
              return;
            }
            if (evt.type === "marketing" && m >= evt.startMonth) {
              if (evt.duration === -1 || m < evt.startMonth + evt.duration) {
                eventExpenses += evt.cost;
              }
            } else if (evt.type === "expense" && m === evt.month) {
              eventExpenses += evt.amount;
            } else if (evt.type === "funding" && m === evt.month) {
              eventFunding += evt.amount;
            }
          });

          if (investmentExpected && m === parsedInputs.fundMon) {
            eventFunding += parsedInputs.fundAmt;
          }

          const totalExp = currentExpBase + eventExpenses;
          const profit = currentRev - totalExp;
          const prevCash = cash;
          cash = prevCash + profit + eventFunding;

          if (cash <= 0) {
            const totalOutflow = (totalExp - currentRev - eventFunding);
            if (totalOutflow > 0) {
              return (m - 1) + Math.min(1, Math.max(0, prevCash / totalOutflow));
            }
            return m - 1;
          }
        }
        return Infinity;
      };

      const runwayNoHires = runWithoutHires();
      const hireDiff = runwayNoHires === Infinity ? "Infinite" : (runwayNoHires - R).toFixed(1);

      if (runwayNoHires > R) {
        items.push({
          title: "Postpone Planned Hiring",
          description: runwayNoHires === Infinity
            ? `Postponing or canceling your ${simulatedHires.length} planned hires extends your runway infinitely.`
            : `Delaying or canceling your ${simulatedHires.length} planned hires extends your runway by +${hireDiff} months (to ${runwayNoHires.toFixed(1)} months).`,
          action: "Freeze hiring until the company achieves break-even or closes next investment round."
        });
      }
    }

    return items;
  }, [runwayMonths, parsedInputs, simulatedEvents, investmentExpected, useDirectBurn, currency, projection]);

  // Determine active months to show in chart (12, 24 or 36)
  const chartMonthsToDisplay = useMemo(() => {
    if (runwayMonths === Infinity) return 24;
    return Math.min(36, Math.max(12, Math.ceil(runwayMonths)));
  }, [runwayMonths]);

  const chartData = useMemo(() => {
    return projection.slice(0, chartMonthsToDisplay + 1);
  }, [projection, chartMonthsToDisplay]);

  // Helper to generate SVG Chart Path points
  const getChartPoints = (data, valueKey, width, height, padding) => {
    if (!data || !data.length) return { line: "", area: "", max: 100, points: [] };
    const values = data.map((d) => d[valueKey] || 0);
    const maxValue = Math.max(...values, 100);
    const xSpan = width - padding * 2;
    const ySpan = height - padding * 2;

    const points = data.map((item, index) => {
      const x = padding + (index / Math.max(1, data.length - 1)) * xSpan;
      const y = height - padding - ((item[valueKey] || 0) / maxValue) * ySpan;
      return { x, y };
    });

    const line = points.map((p) => `${p.x},${p.y}`).join(" ");
    const area = `${padding},${height - padding} ${line} ${width - padding},${height - padding}`;

    return { line, area, max: maxValue, points };
  };

  // Precomputed chart visual states
  const cashChart = useMemo(() => {
    return getChartPoints(chartData, "cash", 640, 240, 40);
  }, [chartData]);

  const burnChart = useMemo(() => {
    return getChartPoints(chartData, "netBurn", 640, 240, 40);
  }, [chartData]);

  // Dual line chart parameters (Revenue vs Expenses)
  const revExpChart = useMemo(() => {
    if (!chartData || !chartData.length) return null;
    const revs = chartData.map((d) => d.revenue || 0);
    const exps = chartData.map((d) => d.expenses || 0);
    const maxVal = Math.max(...revs, ...exps, 100);

    const width = 640;
    const height = 240;
    const padding = 40;
    const xSpan = width - padding * 2;
    const ySpan = height - padding * 2;

    const revPoints = chartData.map((item, index) => {
      const x = padding + (index / Math.max(1, chartData.length - 1)) * xSpan;
      const y = height - padding - ((item.revenue || 0) / maxVal) * ySpan;
      return { x, y };
    });

    const expPoints = chartData.map((item, index) => {
      const x = padding + (index / Math.max(1, chartData.length - 1)) * xSpan;
      const y = height - padding - ((item.expenses || 0) / maxVal) * ySpan;
      return { x, y };
    });

    const revLine = revPoints.map((p) => `${p.x},${p.y}`).join(" ");
    const expLine = expPoints.map((p) => `${p.x},${p.y}`).join(" ");

    return { revLine, expLine, max: maxVal, width, height, padding, revPoints, expPoints };
  }, [chartData]);

  // Formatted display values
  const runwayText = useMemo(() => {
    if (runwayMonths === Infinity) return "Infinite (Profitable)";
    return `${runwayMonths.toFixed(1)} Months`;
  }, [runwayMonths]);

  const runwayEndDateText = useMemo(() => {
    if (runwayMonths === Infinity) return "N/A (Self-Sustaining)";
    const roundedMonths = Math.ceil(runwayMonths);
    return getMonthDateString(startMonth, roundedMonths);
  }, [runwayMonths, startMonth]);

  const currentNetBurn = useMemo(() => {
    const baselineExpenses = useDirectBurn ? toFloat(monthlyBurnRate) : toFloat(monthlyExpenses);
    const baselineRevenue = useDirectBurn ? 0 : toFloat(monthlyRevenue);
    return Math.max(0, baselineExpenses - baselineRevenue);
  }, [monthlyExpenses, monthlyRevenue, monthlyBurnRate, useDirectBurn]);

  const monthlyProfitLoss = useMemo(() => {
    const baselineExpenses = useDirectBurn ? toFloat(monthlyBurnRate) : toFloat(monthlyExpenses);
    const baselineRevenue = useDirectBurn ? 0 : toFloat(monthlyRevenue);
    return baselineRevenue - baselineExpenses;
  }, [monthlyExpenses, monthlyRevenue, monthlyBurnRate, useDirectBurn]);

  const breakEvenMonthText = useMemo(() => {
    if (useDirectBurn) return "N/A (No Revenue Input)";
    if (breakEvenMonth === 0) return "Already Profitable";
    if (breakEvenMonth !== null) return getMonthDateString(startMonth, breakEvenMonth);
    return "No break-even within 5 years";
  }, [breakEvenMonth, startMonth, useDirectBurn]);

  // Generate downloadable plaintext report
  const handleDownloadReport = () => {
    if (typeof window === "undefined") return;

    const report = [];
    report.push("==================================================");
    report.push("         STARTUP CASH RUNWAY CALCULATOR REPORT    ");
    report.push("==================================================");
    report.push(`Generated: ${new Date().toLocaleString("en-US")}`);
    report.push(`Starting Month: ${getMonthDateString(startMonth, 0)}`);
    report.push("");
    report.push("--- INPUT PARAMETERS ---");
    report.push(`Current Cash Balance: ${formatVal(currentCash, currency)}`);
    if (useDirectBurn) {
      report.push(`Monthly Burn Rate: ${formatVal(monthlyBurnRate, currency)}`);
    } else {
      report.push(`Monthly Revenue: ${formatVal(monthlyRevenue, currency)}`);
      report.push(`Monthly Expenses: ${formatVal(monthlyExpenses, currency)}`);
      report.push(`Monthly Burn Rate (Calculated): ${formatVal(currentNetBurn, currency)}`);
    }
    report.push(`Expected Revenue Growth: ${expectedRevenueGrowth}% per month`);
    report.push(`Expected Expense Growth: ${expectedExpenseGrowth}% per month`);
    if (investmentExpected) {
      report.push(`Expected Funding Round: ${formatVal(fundingAmount, currency)} in Month ${fundingMonth}`);
    }
    report.push("");
    report.push("--- CORE RUNWAY METRICS ---");
    report.push(`Runway Duration: ${runwayText}`);
    report.push(`Runway End Date: ${runwayEndDateText}`);
    report.push(`Current Net Burn Rate: ${formatVal(currentNetBurn, currency)}/month`);
    report.push(`Current Net Cash Flow: ${formatVal(monthlyProfitLoss, currency)}/month`);
    report.push(`Projected Break-Even Month: ${breakEvenMonthText}`);
    report.push(`Safety Status Rating: ${runwayStatus.toUpperCase()}`);
    report.push("");
    report.push("--- SIMULATED EVENTS ---");
    if (simulatedEvents.length === 0) {
      report.push("No interactive simulated events added.");
    } else {
      simulatedEvents.forEach((evt) => {
        if (evt.type === "hire") {
          report.push(`- Hire: ${evt.name}, Salary: ${formatVal(evt.salary, currency)}/mo, Starts Month ${evt.startMonth}`);
        } else if (evt.type === "marketing") {
          report.push(`- Marketing: ${evt.name}, Cost: ${formatVal(evt.cost, currency)}/mo, Starts Month ${evt.startMonth}, Duration: ${evt.duration === -1 ? "Ongoing" : evt.duration + " months"}`);
        } else if (evt.type === "expense") {
          report.push(`- Expense: ${evt.name}, Amount: ${formatVal(evt.amount, currency)}, Month ${evt.month} (One-Time)`);
        } else if (evt.type === "funding") {
          report.push(`- Funding: ${evt.name}, Amount: ${formatVal(evt.amount, currency)}, Month ${evt.month} (One-Time)`);
        }
      });
    }
    report.push("");
    report.push("--- RISK ANALYSIS & SUGGESTIONS ---");
    suggestions.forEach((item, index) => {
      report.push(`${index + 1}. ${item.title}`);
      report.push(`   Impact: ${item.description}`);
      report.push(`   Action: ${item.action}`);
      report.push("");
    });
    report.push("");
    report.push("--- MONTHLY CASH FLOW TIMELINE ---");
    report.push("Month\tMonth Date\tRevenue\tExpenses\tNet Burn\tFunding\tCash Remaining");
    projection.slice(0, 36).forEach((row) => {
      report.push(
        `${row.month}\t${row.monthName}\t${formatVal(row.revenue, currency)}\t${formatVal(row.expenses, currency)}\t${formatVal(row.netBurn, currency)}\t${formatVal(row.funding, currency)}\t${formatVal(row.cash, currency)}`
      );
    });
    report.push("");
    report.push("==================================================");
    report.push("Calculations powered by BoringTools Cash Runway Calculator.");

    const text = report.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cash-runway-report.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("success", "Detailed report downloaded successfully");
  };

  // Copy Markdown Runway Summary to Clipboard
  const handleCopySummary = async () => {
    const summary = [
      `📊 **Cash Runway Summary Report**`,
      `* **Runway Months:** ${runwayText}`,
      `* **Runway End Date:** ${runwayEndDateText}`,
      `* **Starting Cash:** ${formatVal(currentCash, currency)}`,
      `* **Monthly Net Burn:** ${formatVal(currentNetBurn, currency)}/mo`,
      `* **Monthly Net Cash Flow:** ${formatVal(monthlyProfitLoss, currency)}/mo`,
      `* **Break-Even Month:** ${breakEvenMonthText}`,
      `* **Runway Safety Status:** **${runwayStatus}**`,
      `*Generated via BoringTools Cash Runway Calculator*`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      showToast("success", "Runway summary copied to clipboard");
    } catch {
      showToast("error", "Copy summary failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6 my-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Finance</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Cash Runway Calculator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Understand how long your company can survive before running out of cash. Simulate hiring, revenue growth, marketing scale-up, and funding rounds instantly.
          </p>
        </div>

        {/* Core Inputs Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
          
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Core parameters</p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Configure startup financials</h2>
              <p className="text-sm text-slate-500">Everything runs locally in your browser. Auto-saves instantly.</p>
            </div>
            
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:-translate-y-px hover:bg-orange-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Reset
            </button>
          </div>

          {/* Grid Layout for Inputs */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Cash Balance */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900">Current Cash Balance</span>
              <span className="text-xs text-slate-500">Total bank cash balance</span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={currentCash}
                  onChange={(e) => setCurrentCash(e.target.value)}
                  placeholder="100000"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </label>

            {/* Currency Select */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900">Currency</span>
              <span className="text-xs text-slate-500">Base currency for calculations</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </label>

            {/* Start Date */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-900">Start Date</span>
              <span className="text-xs text-slate-500">Projection baseline month</span>
              <input
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </label>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="directBurnToggle"
                checked={useDirectBurn}
                onChange={(e) => setUseDirectBurn(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="directBurnToggle" className="text-sm font-medium text-slate-900 select-none">
                I only know my Monthly Burn Rate (Simple Mode)
              </label>
            </div>

            {useDirectBurn ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Monthly Burn Rate</span>
                  <span className="text-xs text-slate-500">Amount of cash company burns monthly</span>
                  <input
                    type="number"
                    min="1"
                    value={monthlyBurnRate}
                    onChange={(e) => setMonthlyBurnRate(e.target.value)}
                    placeholder="10000"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Expected Expense Growth (%)</span>
                  <span className="text-xs text-slate-500">Monthly growth rate of expenses</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={expectedExpenseGrowth}
                    onChange={(e) => setExpectedExpenseGrowth(e.target.value)}
                    placeholder="1"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Monthly Revenue</span>
                  <span className="text-xs text-slate-500">Current starting MRR</span>
                  <input
                    type="number"
                    min="0"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(e.target.value)}
                    placeholder="15000"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Monthly Expenses</span>
                  <span className="text-xs text-slate-500">Current starting monthly cost</span>
                  <input
                    type="number"
                    min="0"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    placeholder="25000"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Expected Revenue Growth (%)</span>
                  <span className="text-xs text-slate-500">Monthly growth rate of revenue</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={expectedRevenueGrowth}
                    onChange={(e) => setExpectedRevenueGrowth(e.target.value)}
                    placeholder="2"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Expected Expense Growth (%)</span>
                  <span className="text-xs text-slate-500">Monthly growth rate of expenses</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={expectedExpenseGrowth}
                    onChange={(e) => setExpectedExpenseGrowth(e.target.value)}
                    placeholder="1"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Expected Funding Round */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="expectedFundingToggle"
                checked={investmentExpected}
                onChange={(e) => setInvestmentExpected(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="expectedFundingToggle" className="text-sm font-medium text-slate-950 select-none">
                Add an expected funding round?
              </label>
            </div>

            {investmentExpected && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Funding Round Amount</span>
                  <span className="text-xs text-slate-500">Expected funding injection</span>
                  <input
                    type="number"
                    min="1"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    placeholder="50000"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-900">Funding Month</span>
                  <span className="text-xs text-slate-500">Which month from start does cash arrive?</span>
                  <input
                    type="number"
                    min="1"
                    value={fundingMonth}
                    onChange={(e) => setFundingMonth(e.target.value)}
                    placeholder="6"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Results Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Runway Duration Card */}
          <div className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
            runwayStatus === "Critical" ? "border-red-200 bg-red-50/50" :
            runwayStatus === "Warning" ? "border-amber-200 bg-amber-50/50" :
            "border-emerald-200 bg-emerald-50/50"
          }`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${
              runwayStatus === "Critical" ? "text-red-700" :
              runwayStatus === "Warning" ? "text-amber-800" :
              "text-emerald-700"
            }`}>Runway Survival Time</p>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${
              runwayStatus === "Critical" ? "text-red-900" :
              runwayStatus === "Warning" ? "text-amber-950" :
              "text-emerald-900"
            }`}>{runwayText}</p>
            <p className="mt-1 text-sm text-slate-600">
              Runway End: <span className="font-semibold text-slate-800">{runwayEndDateText}</span>
            </p>
            
            {/* Safe Zone Badge */}
            <div className="mt-4 flex items-center gap-1.5">
              <span className={`inline-block h-2 w-2 rounded-full ${
                runwayStatus === "Critical" ? "bg-red-600" :
                runwayStatus === "Warning" ? "bg-amber-500" :
                "bg-emerald-600"
              }`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                runwayStatus === "Critical" ? "text-red-700" :
                runwayStatus === "Warning" ? "text-amber-800" :
                "text-emerald-700"
              }`}>
                {runwayStatus} Safe Zone Rating
              </span>
            </div>
          </div>

          {/* Current Burn Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Current Net Burn Rate</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{formatVal(currentNetBurn, currency)}/mo</p>
            <p className="mt-1 text-sm text-slate-600">
              Starting Profit/Loss: <span className={`font-semibold ${monthlyProfitLoss >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {monthlyProfitLoss >= 0 ? "+" : ""}{formatVal(monthlyProfitLoss, currency)}/mo
              </span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Initial Cash: {formatVal(currentCash, currency)}
            </p>
          </div>

          {/* Break Even Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Break-Even Timeline</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {useDirectBurn ? "N/A" : breakEvenMonth === 0 ? "Profitable" : breakEvenMonth !== null ? `Month ${breakEvenMonth}` : "No break-even"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Cross-over month: <span className="font-semibold text-slate-800">{breakEvenMonthText}</span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {useDirectBurn ? "Simple Mode disables break-even calculations" : "Month when monthly revenue exceeds expenses"}
            </p>
          </div>
        </div>

        {/* Runway Progress Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition duration-200">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>RUNWAY HORIZON</span>
            <span className="font-bold text-slate-700">{runwayMonths === Infinity ? "No Burn (Self-Sustaining)" : `${runwayMonths.toFixed(1)} / 24 Months`}</span>
          </div>
          <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                runwayStatus === "Critical" ? "bg-red-500" :
                runwayStatus === "Warning" ? "bg-amber-500" :
                "bg-emerald-500"
              }`}
              style={{
                width: runwayMonths === Infinity ? "100%" : `${Math.min(100, (runwayMonths / 24) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
            <span>0m (Critical)</span>
            <span>6m (Warning)</span>
            <span>12m (Healthy)</span>
            <span>18m</span>
            <span>24m+ (Safe Zone)</span>
          </div>
        </div>

        {/* Interactive Simulation Dashboard */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Timeline simulator</p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 mt-1">Simulate Growth & Financial Events</h2>
          <p className="text-sm text-slate-500">Inject events to see the runway impact instantly.</p>

          <form onSubmit={addSimEvent} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
            
            {/* Event Type */}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-700">Event Type</span>
              <select
                value={simType}
                onChange={(e) => {
                  setSimType(e.target.value);
                  setSimName("");
                  setSimVal("");
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="hire">Hire Employee</option>
                <option value="marketing">Marketing Campaign</option>
                <option value="expense">One-Time Expense</option>
                <option value="funding">Funding Round</option>
              </select>
            </label>

            {/* Event Name */}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-700">
                {simType === "hire" ? "Role Title" : simType === "marketing" ? "Campaign Name" : "Description"}
              </span>
              <input
                type="text"
                required
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                placeholder={
                  simType === "hire" ? "Backend Engineer" :
                  simType === "marketing" ? "Google Ads Launch" :
                  simType === "expense" ? "Server Migration" : "Pre-seed Angel"
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </label>

            {/* Event Value */}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-700">
                {simType === "hire" ? "Monthly Salary" : simType === "marketing" ? "Monthly Budget" : "Amount"}
              </span>
              <input
                type="number"
                required
                min="1"
                value={simVal}
                onChange={(e) => setSimVal(e.target.value)}
                placeholder="5000"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </label>

            {/* Start Month */}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-700">Month Event Starts</span>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  required
                  min="1"
                  max="60"
                  value={simMonth}
                  onChange={(e) => setSimMonth(e.target.value)}
                  placeholder="3"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">
                  ({getMonthDateString(startMonth, toInt(simMonth, 1))})
                </span>
              </div>
            </label>

            {/* Additional parameters (Marketing Duration) or Submit Button */}
            {simType === "marketing" ? (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-slate-700">Duration</span>
                <select
                  value={simDuration}
                  onChange={(e) => setSimDuration(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="-1">Ongoing (Permanent)</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                </select>
              </label>
            ) : (
              <div className="h-9 flex items-center justify-end">
                {/* Spacer on desktop */}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white text-sm font-semibold py-2 px-4 rounded-xl shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-slate-900 sm:col-span-2 lg:col-span-1 lg:mt-0"
            >
              Add Event
            </button>
          </form>

          {/* Active Events Table */}
          {simulatedEvents.length > 0 ? (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Active Simulation Events</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                      <th className="py-2">Event Type</th>
                      <th className="py-2">Name / Description</th>
                      <th className="py-2">Value</th>
                      <th className="py-2">Month Timing</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulatedEvents.map((evt) => (
                      <tr key={evt.id} className="border-b border-slate-50 text-slate-700 hover:bg-slate-50 transition duration-150">
                        <td className="py-2.5">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            evt.type === "hire" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            evt.type === "marketing" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            evt.type === "expense" ? "bg-red-50 text-red-700 border border-red-100" :
                            "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}>
                            {evt.type}
                          </span>
                        </td>
                        <td className="py-2.5 font-medium text-slate-900">{evt.name}</td>
                        <td className="py-2.5">
                          {evt.type === "hire" ? `${formatVal(evt.salary, currency)}/mo` :
                           evt.type === "marketing" ? `${formatVal(evt.cost, currency)}/mo` :
                           formatVal(evt.amount, currency)}
                        </td>
                        <td className="py-2.5">
                          Month {evt.month} ({getMonthDateString(startMonth, evt.month)})
                          {evt.type === "marketing" && (
                            <span className="text-[10px] text-slate-400 ml-1">
                              ({evt.duration === -1 ? "Ongoing" : `for ${evt.duration} mos`})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => deleteSimEvent(evt.id)}
                            className="text-red-500 hover:text-red-700 font-semibold transition"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-4 bg-slate-50 rounded-xl p-3 text-center text-xs text-slate-500 border border-dashed border-slate-200">
              No simulation events active. Add items above to test impact on cash flow.
            </div>
          )}
        </div>

        {/* Visualizations Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition duration-200">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Visual Charts</p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 mt-1">Cash Balance & Burn Timeline</h2>
          <p className="text-sm text-slate-500 mb-4">Interactive charts updated in real-time based on simulation data.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Cash Balance Timeline */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remaining Cash Timeline</span>
                <span className="text-xs text-emerald-600 font-semibold">Max: {formatCompactVal(cashChart.max, currency)}</span>
              </div>
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox="0 0 640 240"
                  className="h-48 w-full min-w-[420px]"
                  role="img"
                  aria-label="Remaining Cash Line Chart"
                >
                  <defs>
                    <linearGradient id="cash-area-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="40" y1="200" x2="600" y2="200" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="40" y1="40" x2="40" y2="200" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Shaded Area */}
                  <polygon points={cashChart.area} fill="url(#cash-area-fill)" />

                  {/* Trend Line */}
                  <polyline
                    points={cashChart.line}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Draw points */}
                  {cashChart.points.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r="3.5"
                      fill="#ffffff"
                      stroke="#10b981"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-5 transition-all"
                      title={`Month ${idx}: ${formatVal(chartData[idx]?.cash || 0, currency)}`}
                    />
                  ))}
                </svg>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-2 mt-2">
                <span>Month 0 ({getMonthDateString(startMonth, 0)})</span>
                <span>Month {Math.round(chartMonthsToDisplay / 2)}</span>
                <span>Month {chartMonthsToDisplay} ({getMonthDateString(startMonth, chartMonthsToDisplay)})</span>
              </div>
            </div>

            {/* Chart 2: Revenue vs Expenses */}
            {!useDirectBurn ? (
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue vs Expenses</span>
                  <div className="flex gap-3 text-[10px] font-semibold">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <span className="inline-block w-2.5 h-1 bg-emerald-500" /> Revenue
                    </span>
                    <span className="text-rose-600 flex items-center gap-1">
                      <span className="inline-block w-2.5 h-1 bg-rose-500" /> Expenses
                    </span>
                  </div>
                </div>
                {revExpChart && (
                  <div className="w-full overflow-x-auto">
                    <svg
                      viewBox="0 0 640 240"
                      className="h-48 w-full min-w-[420px]"
                      role="img"
                      aria-label="Revenue vs Expenses Comparison Chart"
                    >
                      {/* Grid Lines */}
                      <line x1="40" y1="200" x2="600" y2="200" stroke="#cbd5e1" strokeWidth="1" />
                      <line x1="40" y1="40" x2="40" y2="200" stroke="#cbd5e1" strokeWidth="1" />

                      {/* Revenue Line */}
                      <polyline
                        points={revExpChart.revLine}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Expenses Line */}
                      <polyline
                        points={revExpChart.expLine}
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Points */}
                      {revExpChart.revPoints.map((p, idx) => (
                        <circle
                          key={`rev-${idx}`}
                          cx={p.x}
                          cy={p.y}
                          r="2.5"
                          fill="#ffffff"
                          stroke="#10b981"
                          strokeWidth="1.5"
                        />
                      ))}
                      {revExpChart.expPoints.map((p, idx) => (
                        <circle
                          key={`exp-${idx}`}
                          cx={p.x}
                          cy={p.y}
                          r="2.5"
                          fill="#ffffff"
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                        />
                      ))}
                    </svg>
                  </div>
                )}
                <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-2 mt-2">
                  <span>Month 0</span>
                  <span>Month {Math.round(chartMonthsToDisplay / 2)}</span>
                  <span>Month {chartMonthsToDisplay}</span>
                </div>
              </div>
            ) : (
              // Chart 3: Net Burn Timeline (For simple burn rate mode)
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Burn Rate Timeline</span>
                  <span className="text-xs text-rose-600 font-semibold">Max: {formatCompactVal(burnChart.max, currency)}</span>
                </div>
                <div className="w-full overflow-x-auto">
                  <svg
                    viewBox="0 0 640 240"
                    className="h-48 w-full min-w-[420px]"
                    role="img"
                    aria-label="Net Burn Rate chart"
                  >
                    <line x1="40" y1="200" x2="600" y2="200" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="40" y1="40" x2="40" y2="200" stroke="#cbd5e1" strokeWidth="1" />

                    <polyline
                      points={burnChart.line}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {burnChart.points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="#ffffff"
                        stroke="#ef4444"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-2 mt-2">
                  <span>Month 0</span>
                  <span>Month {Math.round(chartMonthsToDisplay / 2)}</span>
                  <span>Month {chartMonthsToDisplay}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Risk Analysis & Suggestions Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Risk Assessment</p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 mt-1">Runway Score & Suggestions</h2>
          <p className="text-sm text-slate-500">Intelligent diagnostic analytics on how to optimize your cash timeline.</p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Risk rating card */}
            <div className={`rounded-xl border p-4 flex flex-col justify-between ${
              runwayStatus === "Critical" ? "bg-red-50/30 border-red-200" :
              runwayStatus === "Warning" ? "bg-amber-50/30 border-amber-200" :
              "bg-emerald-50/30 border-emerald-200"
            }`}>
              <div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                  runwayStatus === "Critical" ? "bg-red-100 text-red-700" :
                  runwayStatus === "Warning" ? "bg-amber-100 text-amber-700" :
                  "bg-emerald-100 text-emerald-700"
                }`}>
                  {runwayStatus} Score
                </span>
                <p className="mt-3 text-sm text-slate-700">
                  {runwayStatus === "Critical" ? "CRITICAL: Cash reserves are insufficient to sustain operations past 6 months. High risk of shutdown. Focus heavily on immediate cost reduction or closing bridge investment." :
                   runwayStatus === "Warning" ? "WARNING: Runway is between 6 and 12 months. Monitor burn rate closely. Initiate fundraising outreach immediately since venture rounds take at least 5 months." :
                   "HEALTHY: Safe runway level above 12 months. Focus on efficient, structured growth, and building product milestones."}
                </p>
              </div>
              <div className="mt-4 text-xs font-medium text-slate-500">
                Score criteria: Critical &lt; 6m | Warning 6-12m | Healthy &gt; 12m
              </div>
            </div>

            {/* Actionable suggestions checklist */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Optimizing Action Steps</h3>
              {suggestions.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/30 p-4 flex flex-col sm:flex-row gap-4 items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">
                        {idx + 1}
                      </span>
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed pl-7">{item.description}</p>
                    <p className="text-[10px] text-slate-400 font-semibold pl-7 mt-1 uppercase tracking-wider">Suggested: {item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Monthly Cash Flow Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition duration-200">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Timeline Projection</p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 mt-1">Detailed Monthly Projections Table</h2>
          <p className="text-sm text-slate-500 mb-4">First 12 months projected cash ledger summary.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5">Month</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Revenue</th>
                  <th className="py-2.5">Expenses</th>
                  <th className="py-2.5">Net Burn</th>
                  <th className="py-2.5">Funding Round</th>
                  <th className="py-2.5 text-right">Cash Balance</th>
                </tr>
              </thead>
              <tbody>
                {projection.slice(0, 13).map((row) => (
                  <tr key={row.month} className="border-b border-slate-100 hover:bg-slate-50 transition duration-150">
                    <td className="py-3 font-semibold text-slate-500">Month {row.month}</td>
                    <td className="py-3 font-medium text-slate-900">{row.monthName}</td>
                    <td className="py-3 text-emerald-600 font-medium">
                      {row.revenue > 0 ? `+${formatVal(row.revenue, currency)}` : `${formatVal(0, currency)}`}
                    </td>
                    <td className="py-3 text-rose-600 font-medium">
                      -{formatVal(row.expenses, currency)}
                    </td>
                    <td className="py-3 text-slate-600 font-medium">
                      {row.netBurn > 0 ? `-${formatVal(row.netBurn, currency)}` : `${formatVal(0, currency)}`}
                    </td>
                    <td className="py-3 font-semibold text-emerald-700">
                      {row.funding > 0 ? `+${formatVal(row.funding, currency)}` : "—"}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-950">
                      {formatVal(row.cash, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right text-[10px] text-slate-400 font-semibold italic">
            * Capped table at Month 12. Use &quot;Download Report&quot; below for the full 36-month timeline log.
          </div>
        </div>

        {/* Action Panel: Copy/Download */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleCopySummary}
            className="rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            Copy Summary
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="rounded-xl border border-orange-500 px-4 py-3 font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Download Report
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950"
          >
            Reset Session
          </button>
        </div>
      </div>

      {toast.message ? (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-sm shadow-lg animate-fade-in-out ${
            toast.type === "error" ? "bg-red-600 text-white" : "bg-slate-950 text-white"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
        .animate-fade-in-out {
          animation: fadeInOut 2.0s;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px) translateX(-50%); }
          10% { opacity: 1; transform: translateY(0) translateX(-50%); }
          90% { opacity: 1; transform: translateY(0) translateX(-50%); }
          100% { opacity: 0; transform: translateY(-10px) translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import ThemedDropdown from "../components/ThemedDropdown";

const STORAGE_KEY = "boring_tools_subscriptions";
const CURRENCY_KEY = "boring_tools_subscriptions_currency";

const CATEGORIES = [
  { id: "Entertainment", label: "Entertainment", bgClass: "bg-purple-50 text-purple-700 border-purple-200", textClass: "text-purple-700", barBg: "bg-purple-500", hoverBg: "hover:bg-purple-100" },
  { id: "Software & Utilities", label: "Software & Utilities", bgClass: "bg-blue-50 text-blue-700 border-blue-200", textClass: "text-blue-700", barBg: "bg-blue-500", hoverBg: "hover:bg-blue-100" },
  { id: "Health & Fitness", label: "Health & Fitness", bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200", textClass: "text-emerald-700", barBg: "bg-emerald-500", hoverBg: "hover:bg-emerald-100" },
  { id: "Food & Beverages", label: "Food & Beverages", bgClass: "bg-amber-50 text-amber-700 border-amber-200", textClass: "text-amber-700", barBg: "bg-amber-500", hoverBg: "hover:bg-amber-100" },
  { id: "Finance", label: "Finance", bgClass: "bg-rose-50 text-rose-700 border-rose-200", textClass: "text-rose-700", barBg: "bg-rose-500", hoverBg: "hover:bg-rose-100" },
  { id: "Work & Business", label: "Work & Business", bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200", textClass: "text-indigo-700", barBg: "bg-indigo-500", hoverBg: "hover:bg-indigo-100" },
  { id: "Others", label: "Others", bgClass: "bg-slate-50 text-slate-700 border-slate-200", textClass: "text-slate-700", barBg: "bg-slate-500", hoverBg: "hover:bg-slate-100" }
];

const CURRENCIES = [
  { symbol: "$", name: "USD ($)" },
  { symbol: "€", name: "EUR (€)" },
  { symbol: "£", name: "GBP (£)" },
  { symbol: "₹", name: "INR (₹)" },
  { symbol: "¥", name: "JPY/CNY (¥)" },
  { symbol: "₩", name: "KRW (₩)" },
];

const initialForm = {
  name: "",
  category: "Entertainment",
  cycle: "monthly",
  cost: "",
  renewalDate: "",
};

export default function SubscriptionTracker() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [currency, setCurrency] = useState("$");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("renewalDate");

  // Notification states
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  // Load initial data
  useEffect(() => {
    try {
      const savedSubs = localStorage.getItem(STORAGE_KEY);
      if (savedSubs) {
        const parsed = JSON.parse(savedSubs);
        if (Array.isArray(parsed)) {
          setSubscriptions(parsed);
        }
      }
      const savedCurrency = localStorage.getItem(CURRENCY_KEY);
      if (savedCurrency) {
        setCurrency(savedCurrency);
      }
    } catch (e) {
      console.error("Failed to load local storage data:", e);
    }
  }, []);

  // Save to localStorage when state changes
  const triggerSave = (newSubs, newCurrency = currency) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSubs));
      localStorage.setItem(CURRENCY_KEY, newCurrency);
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Set today's date formatted as YYYY-MM-DD
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setForm((f) => ({ ...f, renewalDate: today }));
  }, []);

  // Category Icon SVGs instead of emojis
  const getCategoryIcon = (catId, className = "w-4 h-4") => {
    switch (catId) {
      case "Entertainment":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="17" x2="22" y2="17" />
            <line x1="17" y1="7" x2="22" y2="7" />
          </svg>
        );
      case "Software & Utilities":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        );
      case "Health & Fitness":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        );
      case "Food & Beverages":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
          </svg>
        );
      case "Finance":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
            <rect x="4" y="14" width="4" height="2" />
          </svg>
        );
      case "Work & Business":
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        );
      default:
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        );
    }
  };

  // Projection logic for renewals in the past
  const getNextRenewalInfo = (renewalDateStr, cycle) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = (renewalDateStr || "").split("-");
    if (parts.length !== 3) {
      return { nextDate: new Date(), daysLeft: 0, dateStr: renewalDateStr };
    }

    let rDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    rDate.setHours(0, 0, 0, 0);

    if (rDate < today) {
      // Loop to project forward into the future
      while (rDate < today) {
        if (cycle === "monthly") {
          rDate.setMonth(rDate.getMonth() + 1);
        } else {
          rDate.setFullYear(rDate.getFullYear() + 1);
        }
      }
    }

    const diffTime = rDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      nextDate: rDate,
      daysLeft,
      dateStr: rDate.toISOString().split("T")[0],
    };
  };

  // Derived metrics
  const metrics = useMemo(() => {
    let monthlySum = 0;
    let yearlySum = 0;
    let mostExpensive = null;

    subscriptions.forEach((sub) => {
      const cost = parseFloat(sub.cost) || 0;
      const monthlyCost = sub.cycle === "monthly" ? cost : cost / 12;
      const yearlyCost = sub.cycle === "yearly" ? cost : cost * 12;

      monthlySum += monthlyCost;
      yearlySum += yearlyCost;

      if (!mostExpensive || monthlyCost > mostExpensive.monthlyCost) {
        mostExpensive = {
          ...sub,
          monthlyCost,
        };
      }
    });

    return {
      totalMonthly: monthlySum,
      totalYearly: yearlySum,
      count: subscriptions.length,
      mostExpensive,
      averageMonthly: subscriptions.length > 0 ? monthlySum / subscriptions.length : 0,
    };
  }, [subscriptions]);

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    CATEGORIES.forEach((cat) => {
      breakdown[cat.id] = { count: 0, cost: 0 };
    });

    subscriptions.forEach((sub) => {
      const cost = parseFloat(sub.cost) || 0;
      const monthlyCost = sub.cycle === "monthly" ? cost : cost / 12;
      if (breakdown[sub.category]) {
        breakdown[sub.category].count += 1;
        breakdown[sub.category].cost += monthlyCost;
      } else {
        breakdown[sub.category] = { count: 1, cost: monthlyCost };
      }
    });

    return CATEGORIES.map((cat) => {
      const data = breakdown[cat.id] || { count: 0, cost: 0 };
      const percentage = metrics.totalMonthly > 0 ? (data.cost / metrics.totalMonthly) * 100 : 0;
      return {
        ...cat,
        ...data,
        percentage,
      };
    }).sort((a, b) => b.cost - a.cost);
  }, [subscriptions, metrics.totalMonthly]);

  // Upcoming renewals (within next 30 days or general upcoming)
  const sortedUpcomingRenewals = useMemo(() => {
    return subscriptions
      .map((sub) => {
        const renewalInfo = getNextRenewalInfo(sub.renewalDate, sub.cycle);
        return {
          ...sub,
          nextRenewalDate: renewalInfo.dateStr,
          daysLeft: renewalInfo.daysLeft,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);

  // Filtered & Sorted Subscriptions for primary table list
  const filteredSubscriptions = useMemo(() => {
    return sortedUpcomingRenewals.filter((sub) => {
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || sub.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === "renewalDate") {
        return a.daysLeft - b.daysLeft;
      }
      if (sortBy === "cost-desc") {
        const costA = a.cycle === "monthly" ? a.cost : a.cost / 12;
        const costB = b.cycle === "monthly" ? b.cost : b.cost / 12;
        return costB - costA;
      }
      if (sortBy === "cost-asc") {
        const costA = a.cycle === "monthly" ? a.cost : a.cost / 12;
        const costB = b.cycle === "monthly" ? b.cost : b.cost / 12;
        return costA - costB;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "category") {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });
  }, [sortedUpcomingRenewals, searchQuery, categoryFilter, sortBy]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Cancel/Clear Action
  const handleCancel = () => {
    const today = new Date().toISOString().split("T")[0];
    setForm({
      name: "",
      category: "Entertainment",
      cycle: "monthly",
      cost: "",
      renewalDate: today,
    });
    setEditingId(null);
  };

  // Add or Edit Submission Action
  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const cost = parseFloat(form.cost);

    if (!name) {
      showNotification("Subscription name is required", "error");
      return;
    }
    if (isNaN(cost) || cost <= 0) {
      showNotification("Please enter a valid cost greater than 0", "error");
      return;
    }
    if (!form.renewalDate) {
      showNotification("Please select a renewal date", "error");
      return;
    }

    if (editingId !== null) {
      // Edit mode
      const updated = subscriptions.map((sub) =>
        sub.id === editingId
          ? {
              ...sub,
              name,
              category: form.category,
              cycle: form.cycle,
              cost,
              renewalDate: form.renewalDate,
            }
          : sub
      );
      setSubscriptions(updated);
      triggerSave(updated);
      showNotification(`Updated subscription: ${name}`);
    } else {
      // Add mode
      const newSub = {
        id: Date.now(),
        name,
        category: form.category,
        cycle: form.cycle,
        cost,
        renewalDate: form.renewalDate,
      };
      const updated = [newSub, ...subscriptions];
      setSubscriptions(updated);
      triggerSave(updated);
      showNotification(`Added subscription: ${name}`);
    }

    handleCancel();
  };

  // Trigger edit mode
  const handleEdit = (sub) => {
    setForm({
      name: sub.name,
      category: sub.category,
      cycle: sub.cycle,
      cost: sub.cost.toString(),
      renewalDate: sub.renewalDate,
    });
    setEditingId(sub.id);
  };

  // Delete Action
  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const updated = subscriptions.filter((sub) => sub.id !== id);
      setSubscriptions(updated);
      triggerSave(updated);
      showNotification(`Deleted subscription: ${name}`);
      if (editingId === id) {
        handleCancel();
      }
    }
  };

  // Currency select via ThemedDropdown
  const handleCurrencyChange = (symbol) => {
    setCurrency(symbol);
    triggerSave(subscriptions, symbol);
  };

  // Export to JSON
  const handleExport = () => {
    try {
      const exportData = {
        version: "1.0",
        currency,
        subscriptions,
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportData, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `boring_tools_subscriptions.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showNotification("Subscription data exported successfully");
    } catch (e) {
      showNotification("Failed to export data", "error");
    }
  };

  // Import from JSON file
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string") throw new Error("Invalid file content");

        const parsed = JSON.parse(text);
        let importedSubs = [];
        let importedCurrency = currency;

        // Support formats (array or object wrapped)
        if (Array.isArray(parsed)) {
          importedSubs = parsed;
        } else if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.subscriptions)) {
            importedSubs = parsed.subscriptions;
          }
          if (parsed.currency) {
            importedCurrency = parsed.currency;
          }
        } else {
          throw new Error("Invalid JSON structure");
        }

        // Validate individual items
        const validatedSubs = importedSubs.filter((sub) => {
          return (
            sub &&
            typeof sub.name === "string" &&
            typeof sub.category === "string" &&
            typeof sub.cycle === "string" &&
            (typeof sub.cost === "number" || !isNaN(parseFloat(sub.cost))) &&
            typeof sub.renewalDate === "string"
          );
        }).map((sub) => ({
          id: sub.id || Date.now() + Math.random(),
          name: sub.name,
          category: sub.category,
          cycle: sub.cycle === "yearly" ? "yearly" : "monthly",
          cost: parseFloat(sub.cost),
          renewalDate: sub.renewalDate,
        }));

        if (validatedSubs.length === 0) {
          showNotification("No valid subscriptions found in the import file", "error");
          return;
        }

        setSubscriptions(validatedSubs);
        setCurrency(importedCurrency);
        triggerSave(validatedSubs, importedCurrency);
        showNotification(`Successfully imported ${validatedSubs.length} subscriptions`);
      } catch (err) {
        showNotification("Failed to parse JSON file. Ensure it is a valid export format.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset file input
  };

  // Quick Days Left Text Helper
  const getDaysLeftText = (daysLeft) => {
    if (daysLeft === 0) return { text: "Today", badge: "bg-red-500 text-white animate-pulse" };
    if (daysLeft === 1) return { text: "Tomorrow", badge: "bg-orange-500 text-white" };
    if (daysLeft < 7) return { text: `In ${daysLeft} days`, badge: "bg-amber-100 text-amber-800 border border-amber-200" };
    return { text: `In ${daysLeft} days`, badge: "bg-slate-100 text-slate-700" };
  };

  // Dropdown options mappings
  const categoryOptions = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      value: cat.id,
      label: cat.label
    }));
  }, []);

  const categoryFilterOptions = useMemo(() => {
    return [
      { value: "all", label: "All Categories" },
      ...categoryOptions
    ];
  }, [categoryOptions]);

  const sortOptions = useMemo(() => {
    return [
      { value: "renewalDate", label: "Sort: Renewal Date" },
      { value: "cost-desc", label: "Sort: Cost (High to Low)" },
      { value: "cost-asc", label: "Sort: Cost (Low to High)" },
      { value: "name", label: "Sort: Name (A-Z)" },
      { value: "category", label: "Sort: Category" }
    ];
  }, []);

  const currencyOptions = useMemo(() => {
    return CURRENCIES.map((c) => ({
      value: c.symbol,
      label: c.name
    }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans pb-16">
      <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 w-full max-w-6xl border border-slate-100 flex flex-col gap-6 relative overflow-hidden">
        
        {/* Floating Notification */}
        {notification && (
          <div className={`fixed top-20 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 max-w-md ${
            notification.type === "error" 
              ? "bg-rose-50 border-rose-200 text-rose-800" 
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === "error" ? (
                <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                  <rect x="4" y="14" width="4" height="2" />
                </svg>
              </div>
              Subscription Tracker
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Track recurring subscriptions, analyze categories, and preview upcoming renewal cycles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Currency Selector (Directly styled label + ThemedDropdown) */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500 text-sm font-semibold whitespace-nowrap">Currency:</span>
              <div className="w-40 sm:w-48">
                <ThemedDropdown
                  ariaLabel="Select currency"
                  value={currency}
                  options={currencyOptions}
                  onChange={handleCurrencyChange}
                />
              </div>
            </div>

            {/* Import / Export Buttons (py-4 to align with dropdown triggers) */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 px-4 py-4 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-sm"
                title="Export list as JSON"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export</span>
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                className="flex items-center gap-1.5 px-4 py-4 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-sm"
                title="Import list from JSON"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Import</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Dashboard Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Monthly Cost */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition duration-300">
            <div className="absolute right-3 top-3 text-orange-200 group-hover:scale-110 transition duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Spending</span>
            <div className="text-3xl font-extrabold text-slate-900">
              {currency}{metrics.totalMonthly.toFixed(2)}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Average: {currency}{metrics.averageMonthly.toFixed(2)} / sub
            </span>
          </div>

          {/* Card 2: Yearly Cost */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition duration-300">
            <div className="absolute right-3 top-3 text-blue-200 group-hover:scale-110 transition duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Annual Spending</span>
            <div className="text-3xl font-extrabold text-slate-900">
              {currency}{metrics.totalYearly.toFixed(2)}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Equivalent to {currency}{(metrics.totalYearly / 365).toFixed(2)} / day
            </span>
          </div>

          {/* Card 3: Subscription Count */}
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition duration-300">
            <div className="absolute right-3 top-3 text-purple-200 group-hover:scale-110 transition duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subscriptions</span>
            <div className="text-3xl font-extrabold text-slate-900">
              {metrics.count} <span className="text-lg font-bold text-slate-500">Active</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Across {categoryBreakdown.filter((c) => c.count > 0).length} distinct categories
            </span>
          </div>

          {/* Card 4: Most Expensive */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition duration-300">
            <div className="absolute right-3 top-3 text-rose-200 group-hover:scale-110 transition duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="6 2 18 2 22 8 12 22 2 8" />
                <line x1="2" y1="8" x2="22" y2="8" />
                <line x1="12" y1="2" x2="12" y2="22" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Most Expensive</span>
            {metrics.mostExpensive ? (
              <>
                <div className="text-xl font-extrabold text-slate-900 truncate pr-6" title={metrics.mostExpensive.name}>
                  {metrics.mostExpensive.name}
                </div>
                <div className="text-sm text-slate-500 font-semibold mt-1">
                  {currency}{parseFloat(metrics.mostExpensive.cost).toFixed(2)}
                  <span className="text-xs font-normal"> / {metrics.mostExpensive.cycle}</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-slate-400">None Added</div>
                <span className="text-xs text-slate-400">Add a subscription</span>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] gap-6 items-start">
          
          {/* LEFT COLUMN: Add Form & Category Breakdown */}
          <div className="flex flex-col gap-6">
            
            {/* Form Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {editingId ? (
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                  {editingId ? "Edit Subscription" : "Add Subscription"}
                </h2>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {/* Subscription Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subscription Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Netflix, Spotify, AWS, Gym..."
                    className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-base text-slate-900 placeholder:text-slate-400 shadow-sm"
                  />
                </div>

                {/* Cost & Billing Cycle Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Cost */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost ({currency})</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base font-medium pointer-events-none">{currency}</span>
                      <input
                        type="number"
                        name="cost"
                        value={form.cost}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full pl-10 pr-4 py-4 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-base text-slate-900 placeholder:text-slate-400 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Billing Cycle */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Billing Cycle</label>
                    <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-sm h-[58px] items-center">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, cycle: "monthly" }))}
                        className={`py-2 text-sm font-bold rounded-lg transition cursor-pointer ${
                          form.cycle === "monthly"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, cycle: "yearly" }))}
                        className={`py-2 text-sm font-bold rounded-lg transition cursor-pointer ${
                          form.cycle === "yearly"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Yearly
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category & Renewal Date Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Category dropdown (ThemedDropdown) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                    <ThemedDropdown
                      ariaLabel="Select Category"
                      value={form.category}
                      options={categoryOptions}
                      onChange={(val) => setForm((f) => ({ ...f, category: val }))}
                    />
                  </div>

                  {/* Renewal Date */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Renewal Date</label>
                    <input
                      type="date"
                      name="renewalDate"
                      value={form.renewalDate}
                      onChange={handleChange}
                      className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-base text-slate-900 cursor-pointer shadow-sm"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full mt-2 bg-amber-500 text-white font-bold py-4 px-4 rounded-xl hover:bg-amber-600 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer transform active:scale-[0.98]"
                >
                  {editingId ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>Add Subscription</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Category Breakdown list */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  Category Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Based on monthly equivalent cost</p>
              </div>

              <div className="flex flex-col gap-4">
                {categoryBreakdown.map((cat) => {
                  const hasData = cat.count > 0;
                  return (
                    <div key={cat.id} className={`flex flex-col gap-1.5 ${hasData ? "" : "opacity-40"}`}>
                      <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-700">
                        <span className="flex items-center gap-2">
                          <span className={`${cat.textClass}`}>{getCategoryIcon(cat.id, "w-4 h-4")}</span>
                          <span>{cat.label}</span>
                          {hasData && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">
                              {cat.count} {cat.count === 1 ? "sub" : "subs"}
                            </span>
                          )}
                        </span>
                        <span>
                          {currency}{cat.cost.toFixed(2)}
                          <span className="text-[10px] font-normal text-slate-400">/mo</span>
                        </span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${cat.barBg} rounded-full transition-all duration-500`} 
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Filterable Subscriptions List & Upcoming Timelines */}
          <div className="flex flex-col gap-6">
            
            {/* List and Dashboard Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-sm min-h-[500px]">
              
              {/* Header & Controls */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    My Subscriptions
                  </h3>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                    Showing {filteredSubscriptions.length} of {subscriptions.length}
                  </span>
                </div>

                {/* Filter and Search controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search subscriptions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-4 text-base text-slate-800 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-orange-500 transition shadow-sm placeholder:text-slate-400"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                    {/* Category Filter (ThemedDropdown) */}
                    <div className="w-full sm:w-44">
                      <ThemedDropdown
                        ariaLabel="Filter Category"
                        value={categoryFilter}
                        options={categoryFilterOptions}
                        onChange={setCategoryFilter}
                      />
                    </div>

                    {/* Sorting (ThemedDropdown) */}
                    <div className="w-full sm:w-48">
                      <ThemedDropdown
                        ariaLabel="Sort Subscriptions"
                        value={sortBy}
                        options={sortOptions}
                        onChange={setSortBy}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscriptions Grid / List */}
              {filteredSubscriptions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3 border-2 border-dashed border-slate-100 rounded-2xl">
                  <div className="text-slate-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                    </svg>
                  </div>
                  <div className="font-bold text-slate-700 text-base">No subscriptions found</div>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-sm">
                    {subscriptions.length === 0 
                      ? "Get started by adding your first subscription using the form, or import an existing JSON setup."
                      : "Try widening your search terms or clearing your category filters."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredSubscriptions.map((sub) => {
                    const matchedCat = CATEGORIES.find((c) => c.id === sub.category) || CATEGORIES[6];
                    const daysLeftInfo = getDaysLeftText(sub.daysLeft);
                    
                    return (
                      <div 
                        key={sub.id} 
                        className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-200 hover:shadow-sm ${
                          editingId === sub.id 
                            ? "border-amber-400 bg-amber-50/30" 
                            : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        {/* Left section: Category Icon, Name, and Renewal info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${matchedCat.bgClass}`}>
                            {getCategoryIcon(sub.category, "w-5 h-5")}
                          </div>
                          <div className="min-w-0 flex flex-col gap-0.5">
                            <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate" title={sub.name}>
                              {sub.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                              <span className="font-semibold text-slate-500">{sub.category}</span>
                              <span className="text-slate-300">•</span>
                              <span>Next: {sub.nextRenewalDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right section: Price & Action buttons */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t border-slate-50 pt-3 sm:border-t-0 sm:pt-0">
                          <div className="text-left sm:text-right">
                            <div className="font-extrabold text-slate-800 text-sm sm:text-base">
                              {currency}{parseFloat(sub.cost).toFixed(2)}
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                              {sub.cycle}
                            </span>
                          </div>

                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5">
                            {/* Days Left badge */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${daysLeftInfo.badge}`}>
                              {daysLeftInfo.text}
                            </span>
                            
                            {/* Edit & Delete Action Row */}
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleEdit(sub)}
                                className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                                title="Edit subscription"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(sub.id, sub.name)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                                title="Delete subscription"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Renewals Timeline Panel */}
            {subscriptions.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <path d="M9 16l2 2 4-4" />
                    </svg>
                    Upcoming Renewals Schedule
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Chronological list of next billing cycles</p>
                </div>

                <div className="relative border-l border-slate-100 pl-4 ml-2 flex flex-col gap-5">
                  {sortedUpcomingRenewals.slice(0, 4).map((sub) => {
                    const matchedCat = CATEGORIES.find((c) => c.id === sub.category) || CATEGORIES[6];
                    const isUrgent = sub.daysLeft <= 3;
                    return (
                      <div key={sub.id} className="relative flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        {/* Bullet point on timeline */}
                        <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 bg-white ${
                          isUrgent ? "border-orange-500" : "border-slate-300"
                        }`} />

                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <span>{sub.name}</span>
                            <span className="inline-flex items-center gap-1 text-xs font-normal text-slate-400">
                              <span className={`${matchedCat.textClass}`}>{getCategoryIcon(sub.category, "w-3 h-3")}</span>
                              <span>{sub.category}</span>
                            </span>
                          </span>
                          <span className="text-xs text-slate-400">
                            Billing Date: {sub.nextRenewalDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-600">
                            {currency}{parseFloat(sub.cost).toFixed(2)}
                            <span className="text-[10px] font-normal text-slate-400">/{sub.cycle === "monthly" ? "mo" : "yr"}</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            sub.daysLeft === 0 
                              ? "bg-red-500 text-white animate-pulse" 
                              : sub.daysLeft === 1 
                                ? "bg-orange-500 text-white" 
                                : isUrgent 
                                  ? "bg-amber-100 text-amber-800" 
                                  : "bg-slate-100 text-slate-600"
                          }`}>
                            {sub.daysLeft === 0 ? "Today" : sub.daysLeft === 1 ? "Tomorrow" : `${sub.daysLeft} days left`}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {sortedUpcomingRenewals.length > 4 && (
                    <div className="text-xs text-slate-400 italic pl-1">
                      + {sortedUpcomingRenewals.length - 4} more upcoming renewal schedules
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info / FAQ Footer Block */}
        <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-500 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col gap-1.5 max-w-xl">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Privacy & Security Notice
            </h4>
            <p className="leading-relaxed">
              All subscription details, costs, dates, and local currency choices are saved entirely in your local browser storage (<code className="bg-slate-200/60 px-1 rounded font-mono text-xs">localStorage</code>). No information is ever transmitted to a server or third parties. Export backup files regularly to keep copies.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Quick Calculation Rules
            </h4>
            <ul className="list-disc pl-4 space-y-0.5 leading-relaxed text-slate-500 font-sans">
              <li>Monthly cost = Monthly price OR Yearly price / 12</li>
              <li>Annual cost = Yearly price OR Monthly price * 12</li>
              <li>Renewal alerts automatically project to the next billing day.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

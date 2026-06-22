"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "boring_tools_clipboard_history_v1";

const defaultEntries = [];

export default function ClipboardHistoryManager() {
  const [entries, setEntries] = useState(defaultEntries);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'pinned' | 'favorites'
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  // Hydration protection & load localStorage
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setEntries(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load clipboard entries from localStorage", e);
    }
  }, []);

  // Save to localStorage whenever entries change
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to save clipboard entries to localStorage", e);
    }
  }, [entries, isMounted]);

  // Toast notification system
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => {
        if (curr?.message === message) return null;
        return curr;
      });
    }, 3000);
  };

  // Helper stats for input text
  const currentStats = useMemo(() => {
    const chars = inputText.length;
    const words = inputText.trim().split(/\s+/).filter(Boolean).length;
    return { chars, words };
  }, [inputText]);

  // Global statistics
  const stats = useMemo(() => {
    const total = entries.length;
    const pinned = entries.filter((e) => e.pinned).length;
    const favorites = entries.filter((e) => e.favorite).length;
    return { total, pinned, favorites };
  }, [entries]);

  // Dynamic content type detection
  const detectContentType = (text) => {
    const trimmed = text.trim();
    if (/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(trimmed)) {
      return { type: "URL", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return { type: "Email", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (
      trimmed.includes("{") &&
      trimmed.includes("}") &&
      (trimmed.includes("function") ||
        trimmed.includes("const ") ||
        trimmed.includes("let ") ||
        trimmed.includes("import ") ||
        trimmed.includes("export "))
    ) {
      return { type: "Code", color: "bg-purple-50 text-purple-700 border-purple-200" };
    }
    if (trimmed.length > 0) {
      return { type: "Text", color: "bg-slate-50 text-slate-700 border-slate-200" };
    }
    return { type: "Empty", color: "bg-slate-50 text-slate-700 border-slate-200" };
  };

  // Add text entry
  const handleAddEntry = (textToSet) => {
    const trimmed = textToSet.trim();
    if (!trimmed) {
      showNotification("Please enter some text or paste first.", "error");
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      text: trimmed,
      timestamp: new Date().toISOString(),
      pinned: false,
      favorite: false,
    };

    setEntries((curr) => [newEntry, ...curr]);
    showNotification("Text added to clipboard history!");
  };

  const handleManualAdd = () => {
    handleAddEntry(inputText);
    setInputText("");
  };

  // Paste from system clipboard
  const handlePasteFromClipboard = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          handleAddEntry(text);
        } else {
          showNotification("System clipboard is empty or doesn't contain text.", "error");
        }
      } else {
        showNotification("Clipboard API not supported in this browser.", "error");
      }
    } catch (err) {
      showNotification("Clipboard access denied. Please allow permission.", "error");
    }
  };

  // Copy entry to system clipboard
  const handleCopyText = async (text) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showNotification("Copied back to system clipboard!");
      }
    } catch (err) {
      showNotification("Failed to copy text.", "error");
    }
  };

  // Toggle Pinned status
  const handleTogglePin = (id) => {
    setEntries((curr) =>
      curr.map((entry) => (entry.id === id ? { ...entry, pinned: !entry.pinned } : entry))
    );
  };

  // Toggle Favorite status
  const handleToggleFavorite = (id) => {
    setEntries((curr) =>
      curr.map((entry) => (entry.id === id ? { ...entry, favorite: !entry.favorite } : entry))
    );
  };

  // Delete individual entry
  const handleDeleteEntry = (id) => {
    setEntries((curr) => curr.filter((entry) => entry.id !== id));
    showNotification("Clipboard entry deleted.");
  };

  // Toggle expanded view for long texts
  const toggleExpand = (id) => {
    setExpandedEntries((curr) => {
      const next = new Set(curr);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Clean / Formatted dates
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Backup & Import Handlers
  const handleExportJSON = () => {
    if (entries.length === 0) {
      showNotification("No entries to export.", "error");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `clipboard_history_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("JSON backup file exported successfully.");
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string") return;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          showNotification("Invalid backup format. Must be a JSON array.", "error");
          return;
        }

        // Validate structure
        const validated = parsed.filter(
          (item) => item && typeof item.text === "string" && typeof item.id === "string"
        );

        if (validated.length === 0) {
          showNotification("No valid clipboard entries found in the file.", "error");
          return;
        }

        // Merge entries, preventing duplicate IDs
        setEntries((curr) => {
          const existingIds = new Set(curr.map((item) => item.id));
          const newItems = validated.filter((item) => !existingIds.has(item.id));
          return [...newItems, ...curr];
        });

        showNotification(`Successfully imported ${validated.length} entries!`);
      } catch (err) {
        showNotification("Failed to parse JSON file.", "error");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Export current list as TXT file
  const handleExportAllTXT = (entriesToExport, filename = "clipboard_entries_export.txt") => {
    if (entriesToExport.length === 0) {
      showNotification("No entries to export.", "error");
      return;
    }

    const txtContent = entriesToExport
      .map((entry, index) => {
        const typeInfo = detectContentType(entry.text);
        return `=== Entry #${index + 1} ===
Timestamp: ${new Date(entry.timestamp).toLocaleString()}
Type: ${typeInfo.type}
Pinned: ${entry.pinned ? "Yes" : "No"}
Favorite: ${entry.favorite ? "Yes" : "No"}
----------------------------------------
${entry.text}
========================================\n\n`;
      })
      .join("");

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(txtContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("TXT export file downloaded.");
  };

  const handleExportSingleTXT = (entry) => {
    const cleanFileName = `clip_${entry.id}.txt`;
    const txtContent = `Clipboard Entry details
Created: ${new Date(entry.timestamp).toLocaleString()}
----------------------------------------
${entry.text}`;

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(txtContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", cleanFileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("TXT downloaded for snippet.");
  };

  // Filter and search computation
  const filteredEntries = useMemo(() => {
    let list = [...entries];

    // Filter by tab
    if (filterTab === "pinned") {
      list = list.filter((e) => e.pinned);
    } else if (filterTab === "favorites") {
      list = list.filter((e) => e.favorite);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => e.text.toLowerCase().includes(q));
    }

    // Sort: Pinned first, then by timestamp descending
    // Except when we are specifically looking at pinned tab, where they are all pinned
    return list.sort((a, b) => {
      if (filterTab !== "pinned") {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [entries, filterTab, searchQuery]);

  // Recent entries calculation (latest 3 entries added, ignoring pins)
  const recentEntries = useMemo(() => {
    const list = [...entries];
    return list
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
  }, [entries]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans pb-16">
        <div className="text-center flex flex-col gap-2">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium">Loading clipboard manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans pb-16">
      <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 w-full max-w-6xl border border-slate-100 flex flex-col gap-6 relative overflow-hidden">
        
        {/* Floating Notification */}
        {notification && (
          <div
            className={`fixed top-20 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 max-w-md ${
              notification.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              Clipboard History Manager
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              A private, local snippet dashboard. Save clipboard segments, pin critical texts, and search instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer shadow-sm w-full sm:w-auto"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer shadow-sm w-full sm:w-auto"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Backup
            </button>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImportJSON}
              className="hidden"
            />
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-6">
          
          {/* Left Column: Form & Stats */}
          <div className="flex flex-col gap-6">
            
            {/* Input Form Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Add Clipboard Entry</h2>
                <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  Local Storage
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste or write your text snippet here..."
                    className="w-full min-h-[120px] p-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-y text-sm font-sans"
                  />
                  <button
                    onClick={handlePasteFromClipboard}
                    title="Paste from system clipboard"
                    className="absolute bottom-3 right-3 p-2 bg-white hover:bg-amber-50 hover:text-amber-600 text-slate-500 border border-slate-200 rounded-lg shadow-sm transition flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Paste Clipboard
                  </button>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="flex gap-3">
                    <span>Characters: <strong className="text-slate-700 font-semibold">{currentStats.chars}</strong></span>
                    <span>Words: <strong className="text-slate-700 font-semibold">{currentStats.words}</strong></span>
                  </span>
                </div>

                <button
                  onClick={handleManualAdd}
                  disabled={!inputText.trim()}
                  className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm ${
                    inputText.trim()
                      ? "bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Save Entry
                </button>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Clipboard Metrics</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-150 bg-slate-50 p-3 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold text-slate-500">Total Clips</p>
                  <p className="text-2xl font-extrabold text-slate-900">{stats.total}</p>
                </div>
                <div className="rounded-xl border border-slate-150 bg-slate-50 p-3 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold text-slate-500">Pinned</p>
                  <p className="text-2xl font-extrabold text-amber-600">{stats.pinned}</p>
                </div>
                <div className="rounded-xl border border-slate-150 bg-slate-50 p-3 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold text-slate-500">Favorites</p>
                  <p className="text-2xl font-extrabold text-rose-500">{stats.favorites}</p>
                </div>
              </div>

              {/* Utility Export Button */}
              {filteredEntries.length > 0 && (
                <button
                  onClick={() => handleExportAllTXT(filteredEntries, "clipboard_filtered_entries.txt")}
                  className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Current List as TXT
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Search, Filters, and Snippet List */}
          <div className="flex flex-col gap-4">
            
            {/* Search and Filters Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clipboard entries..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-sm font-sans"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                {[
                  { value: "all", label: "All Items" },
                  { value: "pinned", label: "Pinned" },
                  { value: "favorites", label: "Favorites" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilterTab(tab.value)}
                    className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all focus:outline-none cursor-pointer ${
                      filterTab === tab.value
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Snippets Bar */}
            {entries.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
                  Recent Snippets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {recentEntries.map((entry) => {
                    const typeInfo = detectContentType(entry.text);
                    return (
                      <div
                        key={`recent-${entry.id}`}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between gap-3 shadow-xs hover:border-amber-300 transition group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${typeInfo.color}`}>
                              {typeInfo.type}
                            </span>
                            <span>{formatTime(entry.timestamp)}</span>
                          </p>
                          <p className="text-xs text-slate-800 font-mono truncate whitespace-nowrap">
                            {entry.text}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopyText(entry.text)}
                          className="w-full py-1.5 bg-slate-50 hover:bg-amber-500 hover:text-white border border-slate-150 rounded-lg text-slate-600 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Quick Copy
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Snippets List */}
            <div className="flex flex-col gap-3">
              {filteredEntries.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-full text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">No snippets found</h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
                      {searchQuery
                        ? "We couldn't find any entries matching your query. Try searching for something else."
                        : filterTab !== "all"
                        ? `You don't have any items under the "${filterTab}" filter.`
                        : "Clipboard history is currently empty. Write something or click Paste to get started!"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredEntries.map((entry) => {
                    const isLongText = entry.text.length > 220;
                    const isExpanded = expandedEntries.has(entry.id);
                    const typeInfo = detectContentType(entry.text);
                    const charCount = entry.text.length;
                    const wordCount = entry.text.trim().split(/\s+/).filter(Boolean).length;

                    return (
                      <div
                        key={entry.id}
                        className={`rounded-2xl border bg-white p-4.5 sm:p-5 flex flex-col gap-4 shadow-sm transition hover:shadow-md ${
                          entry.pinned ? "border-amber-300 ring-2 ring-amber-100/50" : "border-slate-200"
                        }`}
                      >
                        {/* Entry Header */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${typeInfo.color}`}>
                              {typeInfo.type}
                            </span>
                            <span className="text-slate-400 text-xs font-semibold" title={new Date(entry.timestamp).toLocaleString()}>
                              {formatTime(entry.timestamp)}
                            </span>
                          </div>

                          {/* Quick Stats & Toggles */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                              {charCount} chars • {wordCount} words
                            </span>
                            
                            {/* Pin Action */}
                            <button
                              onClick={() => handleTogglePin(entry.id)}
                              title={entry.pinned ? "Unpin this snippet" : "Pin this snippet"}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                entry.pinned
                                  ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                                  : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                              }`}
                            >
                              <svg className="w-4 h-4 fill-current stroke-current" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </button>

                            {/* Favorite Action */}
                            <button
                              onClick={() => handleToggleFavorite(entry.id)}
                              title={entry.favorite ? "Remove from Favorites" : "Add to Favorites"}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                entry.favorite
                                  ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                                  : "bg-white border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                              }`}
                            >
                              <svg className="w-4 h-4 fill-current stroke-current" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>

                            {/* Delete Action */}
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              title="Delete entry"
                              className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-lg transition cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Content text */}
                        <div className="relative rounded-xl border border-slate-150 bg-slate-50/50 p-4.5">
                          <p
                            className={`text-slate-800 text-sm font-mono leading-relaxed break-words whitespace-pre-wrap ${
                              isLongText && !isExpanded ? "max-h-[140px] overflow-hidden" : ""
                            }`}
                          >
                            {entry.text}
                          </p>

                          {/* Long text overlay gradient */}
                          {isLongText && !isExpanded && (
                            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
                          )}

                          {isLongText && (
                            <button
                              onClick={() => toggleExpand(entry.id)}
                              className="mt-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition flex items-center gap-1 focus:outline-none cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  Show Less
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                  </svg>
                                </>
                              ) : (
                                <>
                                  Show Full Content ({charCount - 220} more characters)
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Card bottom actions */}
                        <div className="flex justify-between items-center flex-wrap gap-2 pt-2 border-t border-slate-100">
                          {typeInfo.type === "URL" && (
                            <a
                              href={entry.text.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                            >
                              <span>Open URL</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                              </svg>
                            </a>
                          )}
                          {typeInfo.type === "Email" && (
                            <a
                              href={`mailto:${entry.text.trim()}`}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                            >
                              <span>Send Email</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                              </svg>
                            </a>
                          )}
                          <div className="flex items-center gap-2 ml-auto">
                            <button
                              onClick={() => handleExportSingleTXT(entry)}
                              className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Export TXT
                            </button>
                            <button
                              onClick={() => handleCopyText(entry.text)}
                              className="px-3.5 py-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

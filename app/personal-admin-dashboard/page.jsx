"use client";

import { useEffect, useMemo, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const STORAGE_KEY = "boring_tools_personal_admin_dashboard_v1";

const defaultData = {
  dates: [],
  documents: [],
  reminders: []
};

const dateCategories = [
  { value: "Passport", label: "Passport" },
  { value: "License", label: "Driver's License" },
  { value: "Insurance", label: "Insurance Renewal" },
  { value: "Membership", label: "Membership Renewal" },
  { value: "Exam", label: "Exam / Test Date" },
  { value: "Other", label: "Other Important Date" }
];

const priorityOptions = [
  { value: "High", label: "🔴 High Priority" },
  { value: "Medium", label: "🟡 Medium Priority" },
  { value: "Low", label: "⚪ Low Priority" }
];

export default function PersonalAdminDashboard() {
  // Navigation Tabs: overview, dates, documents, reminders
  const [activeTab, setActiveTab] = useState("overview");

  // Core State
  const [data, setData] = useState(defaultData);
  const [isMounted, setIsMounted] = useState(false);
  const [notification, setNotification] = useState(null);

  // Storage Estimator
  const [storageUsage, setStorageUsage] = useState({ toolSize: 0, totalSize: 0, pct: 0 });

  // Modals & Forms State
  const [modalType, setModalType] = useState(null); // 'date', 'document', 'reminder'
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit'
  const [editingId, setEditingId] = useState(null);

  // Form Field States
  // Dates Form
  const [dateForm, setDateForm] = useState({
    category: "Passport",
    name: "",
    date: "",
    notes: ""
  });

  // Documents Form
  const [docForm, setDocForm] = useState({
    name: "",
    expiryDate: "",
    notes: "",
    fileName: "",
    fileType: "",
    fileData: "",
    fileSize: 0
  });

  // Reminders Form
  const [reminderForm, setReminderForm] = useState({
    text: "",
    dueDate: "",
    priority: "Medium"
  });

  // File Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Merge Selection Modal (for JSON upload)
  const [pendingImportData, setPendingImportData] = useState(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  // Load from localStorage on Mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure structure is correct
        const verified = {
          dates: Array.isArray(parsed.dates) ? parsed.dates : [],
          documents: Array.isArray(parsed.documents) ? parsed.documents : [],
          reminders: Array.isArray(parsed.reminders) ? parsed.reminders : []
        };
        setData(verified);
      }
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
      showNotification("Error loading data from local storage", "error");
    }
  }, []);

  // Sync to localStorage & Calculate Storage Usage
  useEffect(() => {
    if (!isMounted) return;
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serialized);

      // Estimate storage sizes
      const toolSizeKB = Math.round((serialized.length * 2) / 1024 * 10) / 10; // UTF-16 characters = 2 bytes each
      
      // Calculate overall localStorage size
      let totalLength = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalLength += localStorage[key].length;
        }
      }
      const totalSizeKB = Math.round((totalLength * 2) / 1024 * 10) / 10;
      const pct = Math.min(100, Math.round((totalLength / (5 * 1024 * 1024)) * 100 * 10) / 10); // standard 5MB character limit

      setStorageUsage({
        toolSize: toolSizeKB,
        totalSize: totalSizeKB,
        pct: pct
      });
    } catch (e) {
      console.error("Failed to save data / full storage:", e);
      showNotification("Local storage full! Remove some documents or notes.", "error");
    }
  }, [data, isMounted]);

  // Notifications
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Days Remaining Utility
  const getDaysRemaining = (targetDateStr) => {
    if (!targetDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Status Level Utility
  const getStatusDetails = (days, type = "date") => {
    if (days === null) {
      return {
        label: "No Expiry",
        color: "bg-slate-100 text-slate-700 border-slate-200",
        urgency: "none"
      };
    }

    if (days < 0) {
      return {
        label: type === "exam" ? `Completed ${Math.abs(days)}d ago` : `Expired by ${Math.abs(days)}d`,
        color: "bg-rose-50 text-rose-700 border-rose-200",
        urgency: "expired"
      };
    }
    if (days === 0) {
      return {
        label: type === "exam" ? "Exam is Today!" : "Expires Today!",
        color: "bg-amber-100 text-amber-900 border-amber-300 animate-pulse font-bold",
        urgency: "urgent"
      };
    }
    if (days <= 30) {
      return {
        label: type === "exam" ? `Exam in ${days}d` : `Expires in ${days}d`,
        color: "bg-orange-50 text-orange-700 border-orange-200 font-semibold",
        urgency: "urgent"
      };
    }
    if (days <= 90) {
      return {
        label: type === "exam" ? `Exam in ${days}d` : `Expires in ${days}d`,
        color: "bg-yellow-50 text-yellow-800 border-yellow-200",
        urgency: "warning"
      };
    }
    return {
      label: type === "exam" ? `Exam in ${days}d` : `${days} days left`,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      urgency: "safe"
    };
  };

  // Compile overview statistics
  const statistics = useMemo(() => {
    let expired = 0;
    let urgent = 0;
    let warning = 0;

    // Dates
    data.dates.forEach(d => {
      const days = getDaysRemaining(d.date);
      if (days !== null) {
        if (days < 0) expired++;
        else if (days <= 30) urgent++;
        else if (days <= 90) warning++;
      }
    });

    // Documents
    data.documents.forEach(d => {
      const days = getDaysRemaining(d.expiryDate);
      if (days !== null) {
        if (days < 0) expired++;
        else if (days <= 30) urgent++;
        else if (days <= 90) warning++;
      }
    });

    // Reminders (Only active/undone)
    data.reminders.filter(r => !r.done).forEach(r => {
      const days = getDaysRemaining(r.dueDate);
      if (days !== null) {
        if (days < 0) expired++;
        else if (days <= 30) urgent++;
        else if (days <= 90) warning++;
      }
    });

    return { expired, urgent, warning };
  }, [data]);

  // Combined timeline of all upcoming events (sorted by date)
  const timelineItems = useMemo(() => {
    const items = [];

    // Dates
    data.dates.forEach(d => {
      const days = getDaysRemaining(d.date);
      items.push({
        id: `date-${d.id}`,
        type: "date",
        name: d.name,
        category: d.category,
        date: d.date,
        days,
        notes: d.notes,
        rawItem: d
      });
    });

    // Documents
    data.documents.forEach(d => {
      if (!d.expiryDate) return;
      const days = getDaysRemaining(d.expiryDate);
      items.push({
        id: `doc-${d.id}`,
        type: "document",
        name: d.name,
        category: "Document",
        date: d.expiryDate,
        days,
        notes: d.notes,
        rawItem: d
      });
    });

    // Reminders
    data.reminders.filter(r => !r.done).forEach(r => {
      if (!r.dueDate) return;
      const days = getDaysRemaining(r.dueDate);
      items.push({
        id: `rem-${r.id}`,
        type: "reminder",
        name: r.text,
        category: `Reminder (${r.priority})`,
        date: r.dueDate,
        days,
        notes: "",
        rawItem: r
      });
    });

    // Sort by: Expired/due first (earliest dates), then upcoming (closest dates)
    return items.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });
  }, [data]);

  // Handlers for Dates
  const handleOpenDateModal = (mode, item = null) => {
    setModalType("date");
    setModalMode(mode);
    if (mode === "edit" && item) {
      setEditingId(item.id);
      setDateForm({
        category: item.category,
        name: item.name,
        date: item.date,
        notes: item.notes || ""
      });
    } else {
      setEditingId(null);
      setDateForm({
        category: "Passport",
        name: "",
        date: "",
        notes: ""
      });
    }
  };

  const handleSaveDate = (e) => {
    e.preventDefault();
    if (!dateForm.name.trim() || !dateForm.date) {
      showNotification("Name and Date are required", "error");
      return;
    }

    if (modalMode === "add") {
      const newItem = {
        id: Date.now().toString(),
        ...dateForm
      };
      setData(prev => ({
        ...prev,
        dates: [...prev.dates, newItem]
      }));
      showNotification("Important date added!");
    } else {
      setData(prev => ({
        ...prev,
        dates: prev.dates.map(item => item.id === editingId ? { ...item, ...dateForm } : item)
      }));
      showNotification("Important date updated!");
    }
    setModalType(null);
  };

  const handleDeleteDate = (id) => {
    if (confirm("Are you sure you want to delete this date entry?")) {
      setData(prev => ({
        ...prev,
        dates: prev.dates.filter(item => item.id !== id)
      }));
      showNotification("Date entry deleted");
    }
  };

  // Handlers for Documents
  const handleOpenDocModal = (mode, item = null) => {
    setModalType("document");
    setModalMode(mode);
    if (mode === "edit" && item) {
      setEditingId(item.id);
      setDocForm({
        name: item.name,
        expiryDate: item.expiryDate || "",
        notes: item.notes || "",
        fileName: item.fileName || "",
        fileType: item.fileType || "",
        fileData: item.fileData || "",
        fileSize: item.fileSize || 0
      });
    } else {
      setEditingId(null);
      setDocForm({
        name: "",
        expiryDate: "",
        notes: "",
        fileName: "",
        fileType: "",
        fileData: "",
        fileSize: 0
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1.2MB threshold check
    if (file.size > 1.2 * 1024 * 1024) {
      showNotification("File exceeds 1.2MB. Storing large files in localStorage will quickly fill your browser quota.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDocForm(prev => ({
        ...prev,
        fileName: file.name,
        fileType: file.type,
        fileData: reader.result,
        fileSize: file.size
      }));
      showNotification("Document file attached successfully!");
    };
    reader.onerror = () => {
      showNotification("Failed to read file contents.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setDocForm(prev => ({
      ...prev,
      fileName: "",
      fileType: "",
      fileData: "",
      fileSize: 0
    }));
  };

  const handleSaveDoc = (e) => {
    e.preventDefault();
    if (!docForm.name.trim()) {
      showNotification("Document Name is required", "error");
      return;
    }

    if (modalMode === "add") {
      const newItem = {
        id: Date.now().toString(),
        ...docForm
      };
      setData(prev => ({
        ...prev,
        documents: [...prev.documents, newItem]
      }));
      showNotification("Important document stored!");
    } else {
      setData(prev => ({
        ...prev,
        documents: prev.documents.map(item => item.id === editingId ? { ...item, ...docForm } : item)
      }));
      showNotification("Important document details updated!");
    }
    setModalType(null);
  };

  const handleDeleteDoc = (id) => {
    if (confirm("Are you sure you want to delete this document entry?")) {
      setData(prev => ({
        ...prev,
        documents: prev.documents.filter(item => item.id !== id)
      }));
      showNotification("Document entry deleted");
    }
  };

  const downloadFile = (doc) => {
    if (!doc.fileData) return;
    const link = document.createElement("a");
    link.href = doc.fileData;
    link.download = doc.fileName || doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Downloading file...");
  };

  // Handlers for Reminders
  const handleOpenReminderModal = (mode, item = null) => {
    setModalType("reminder");
    setModalMode(mode);
    if (mode === "edit" && item) {
      setEditingId(item.id);
      setReminderForm({
        text: item.text,
        dueDate: item.dueDate || "",
        priority: item.priority || "Medium"
      });
    } else {
      setEditingId(null);
      setReminderForm({
        text: "",
        dueDate: "",
        priority: "Medium"
      });
    }
  };

  const handleSaveReminder = (e) => {
    e.preventDefault();
    if (!reminderForm.text.trim()) {
      showNotification("Reminder details are required", "error");
      return;
    }

    if (modalMode === "add") {
      const newItem = {
        id: Date.now().toString(),
        ...reminderForm,
        done: false
      };
      setData(prev => ({
        ...prev,
        reminders: [...prev.reminders, newItem]
      }));
      showNotification("Quick reminder set!");
    } else {
      setData(prev => ({
        ...prev,
        reminders: prev.reminders.map(item => item.id === editingId ? { ...item, ...reminderForm } : item)
      }));
      showNotification("Quick reminder updated!");
    }
    setModalType(null);
  };

  const handleToggleReminder = (id) => {
    setData(prev => ({
      ...prev,
      reminders: prev.reminders.map(item => item.id === id ? { ...item, done: !item.done } : item)
    }));
  };

  const handleDeleteReminder = (id) => {
    setData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(item => item.id !== id)
    }));
    showNotification("Reminder deleted");
  };

  const handleClearCompletedReminders = () => {
    const completedCount = data.reminders.filter(r => r.done).length;
    if (completedCount === 0) return;
    if (confirm(`Clear all ${completedCount} completed reminders?`)) {
      setData(prev => ({
        ...prev,
        reminders: prev.reminders.filter(r => !r.done)
      }));
      showNotification("Completed reminders cleared");
    }
  };

  // Export & Import Handlers
  const handleExportJSON = () => {
    try {
      const serialized = JSON.stringify(data, null, 2);
      const blob = new Blob([serialized], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `boring_tools_personal_admin_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification("Backup JSON exported successfully!");
    } catch (e) {
      showNotification("Export failed", "error");
    }
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        // Basic schema check
        if (!parsed || (typeof parsed !== "object")) {
          throw new Error("Invalid format");
        }
        
        const validated = {
          dates: Array.isArray(parsed.dates) ? parsed.dates : [],
          documents: Array.isArray(parsed.documents) ? parsed.documents : [],
          reminders: Array.isArray(parsed.reminders) ? parsed.reminders : []
        };

        setPendingImportData(validated);
        setShowImportConfirm(true);
      } catch (err) {
        showNotification("Failed to parse backup file. Make sure it is a valid JSON backup.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Clear file input
  };

  const executeImport = (merge) => {
    if (!pendingImportData) return;

    if (merge) {
      setData(prev => {
        // Prevent duplicate IDs by keeping current items and filtering out imported items with conflicting IDs
        const existingDateIds = new Set(prev.dates.map(d => d.id));
        const filteredImportedDates = pendingImportData.dates.filter(d => !existingDateIds.has(d.id));

        const existingDocIds = new Set(prev.documents.map(d => d.id));
        const filteredImportedDocs = pendingImportData.documents.filter(d => !existingDocIds.has(d.id));

        const existingReminderIds = new Set(prev.reminders.map(r => r.id));
        const filteredImportedReminders = pendingImportData.reminders.filter(r => !existingReminderIds.has(r.id));

        return {
          dates: [...prev.dates, ...filteredImportedDates],
          documents: [...prev.documents, ...filteredImportedDocs],
          reminders: [...prev.reminders, ...filteredImportedReminders]
        };
      });
      showNotification("Backup data merged successfully!");
    } else {
      setData(pendingImportData);
      showNotification("All current data replaced with backup!");
    }

    setPendingImportData(null);
    setShowImportConfirm(false);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Personal Admin Dashboard
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Manage passport expiries, license renewals, insurances, docs, and reminders in one browser-only hub.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer shadow-sm w-full sm:w-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export JSON
            </button>
            <label className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition cursor-pointer shadow-sm w-full sm:w-auto text-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Local Storage Indicator bar */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">LocalStorage Storage Used</span>
              <span className="text-xs font-semibold text-amber-600">({storageUsage.toolSize} KB of 5,000 KB max limit)</span>
            </div>
            <p className="text-slate-500 text-xs">
              Runs 100% locally. Storage consumption depends heavily on base64 attached documents.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-64">
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${storageUsage.pct > 80 ? "bg-rose-500" : storageUsage.pct > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.max(1, storageUsage.pct)}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-slate-600 shrink-0">{storageUsage.pct}%</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-2 scrollbar-none">
          {[
            { id: "overview", label: "Overview", count: null },
            { id: "dates", label: "Important Dates", count: data.dates.length },
            { id: "documents", label: "Documents", count: data.documents.length },
            { id: "reminders", label: "Quick Reminders", count: data.reminders.filter(r => !r.done).length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-rose-100 bg-rose-50/30 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-700">Overdue / Expired</p>
                  <p className="text-3xl font-extrabold text-rose-900">{statistics.expired}</p>
                </div>
              </div>

              <div className="border border-orange-100 bg-orange-50/20 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-700">Urgent (≤ 30 days)</p>
                  <p className="text-3xl font-extrabold text-orange-900">{statistics.urgent}</p>
                </div>
              </div>

              <div className="border border-yellow-100 bg-yellow-50/20 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-yellow-700">Upcoming (31–90 days)</p>
                  <p className="text-3xl font-extrabold text-yellow-900">{statistics.warning}</p>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines & Expirations Timeline */}
            <div className="border border-slate-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Expirations & Deadlines Timeline
              </h2>

              {timelineItems.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-400 font-medium">No dates, documents, or reminders recorded.</p>
                  <p className="text-slate-400 text-sm mt-1">Visit other tabs to add your first item!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {timelineItems.map((item) => {
                    const status = getStatusDetails(item.days, item.category === "Exam" ? "exam" : "date");
                    return (
                      <div 
                        key={item.id} 
                        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border rounded-xl hover:shadow-sm transition ${
                          item.days !== null && item.days < 0 
                            ? "border-rose-100 bg-rose-50/10" 
                            : item.days !== null && item.days <= 30 
                            ? "border-orange-100 bg-orange-50/10" 
                            : "border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Left icon wrapper */}
                          <div className={`p-2.5 rounded-lg shrink-0 ${
                            item.type === "date" 
                              ? "bg-blue-50 text-blue-600" 
                              : item.type === "document" 
                              ? "bg-purple-50 text-purple-600" 
                              : "bg-amber-50 text-amber-600"
                          }`}>
                            {item.type === "date" ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : item.type === "document" ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-800 text-sm truncate sm:text-base">{item.name}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                                {item.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5 font-medium">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Target: {item.date}
                              {item.notes && (
                                <span className="truncate max-w-[150px] sm:max-w-[300px]">
                                  • {item.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                          <span className={`text-xs sm:text-sm px-3 py-1 rounded-full border font-bold whitespace-nowrap ${status.color}`}>
                            {status.label}
                          </span>
                          
                          <button
                            onClick={() => {
                              setActiveTab(item.type + "s"); // map date -> dates, document -> documents, reminder -> reminders
                              setTimeout(() => {
                                if (item.type === "date") handleOpenDateModal("edit", item.rawItem);
                                else if (item.type === "document") handleOpenDocModal("edit", item.rawItem);
                                else if (item.type === "reminder") handleOpenReminderModal("edit", item.rawItem);
                              }, 100);
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Edit details"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00-2 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: IMPORTANT DATES */}
        {activeTab === "dates" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Important Dates</h2>
                <p className="text-slate-500 text-sm">Track renewals, passports, license, exam dates.</p>
              </div>
              <button
                onClick={() => handleOpenDateModal("add")}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition cursor-pointer shadow-sm text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Date
              </button>
            </div>

            {data.dates.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl w-fit mx-auto mb-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-bold">No important dates recorded yet.</p>
                <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">Keep track of your passport expiration date, driver's license renewal, or upcoming test schedules.</p>
                <button
                  onClick={() => handleOpenDateModal("add")}
                  className="mt-4 px-4 py-2 border border-amber-500 text-amber-600 rounded-xl hover:bg-amber-50 transition font-semibold text-sm cursor-pointer"
                >
                  Create Your First Date Entry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.dates.map((item) => {
                  const days = getDaysRemaining(item.date);
                  const status = getStatusDetails(days, item.category === "Exam" ? "exam" : "date");
                  return (
                    <div key={item.id} className="border border-slate-100 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition bg-white gap-4 relative overflow-hidden">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            item.category === "Passport" ? "bg-blue-50 text-blue-600" :
                            item.category === "License" ? "bg-emerald-50 text-emerald-600" :
                            item.category === "Insurance" ? "bg-purple-50 text-purple-600" :
                            item.category === "Membership" ? "bg-orange-50 text-orange-600" :
                            item.category === "Exam" ? "bg-indigo-50 text-indigo-600" :
                            "bg-slate-50 text-slate-600"
                          }`}>
                            {item.category === "Passport" || item.category === "License" ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.378 0 2.473-.398 3-1m-3 1c-1.378 0-2.473-.398-3-1m3 1a2 2 0 012 2v1h-8v-1a2 2 0 012-2z" />
                              </svg>
                            ) : item.category === "Insurance" ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            ) : item.category === "Exam" ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">{item.category}</span>
                            <h3 className="font-extrabold text-slate-900 text-lg leading-tight mt-0.5">{item.name}</h3>
                          </div>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenDateModal("edit", item)}
                            className="p-2 text-slate-400 hover:text-amber-500 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00-2 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteDate(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                            title="Delete"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-slate-500 text-sm bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 leading-relaxed italic">
                          "{item.notes}"
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 gap-2">
                        <div className="flex items-center gap-1 text-slate-400 text-sm font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {item.date}
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: IMPORTANT DOCUMENTS */}
        {activeTab === "documents" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Important Documents</h2>
                <p className="text-slate-500 text-sm">Store document information and backups in your browser.</p>
              </div>
              <button
                onClick={() => handleOpenDocModal("add")}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition cursor-pointer shadow-sm text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Document
              </button>
            </div>

            {data.documents.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl w-fit mx-auto mb-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-bold">No documents stored.</p>
                <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">Securely save document names, expiration deadlines, notes, and attach files (max 1.2MB) stored locally inside your browser cache.</p>
                <button
                  onClick={() => handleOpenDocModal("add")}
                  className="mt-4 px-4 py-2 border border-amber-500 text-amber-600 rounded-xl hover:bg-amber-50 transition font-semibold text-sm cursor-pointer"
                >
                  Store Your First Document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.documents.map((item) => {
                  const days = getDaysRemaining(item.expiryDate);
                  const status = getStatusDetails(days, "date");
                  return (
                    <div key={item.id} className="border border-slate-100 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition bg-white gap-4 relative overflow-hidden">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Offline Document</span>
                            <h3 className="font-extrabold text-slate-900 text-lg leading-tight mt-0.5">{item.name}</h3>
                          </div>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenDocModal("edit", item)}
                            className="p-2 text-slate-400 hover:text-amber-500 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00-2 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteDoc(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                            title="Delete"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-slate-500 text-sm bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 leading-relaxed">
                          {item.notes}
                        </p>
                      )}

                      {/* File attachment preview / download row */}
                      {item.fileName ? (
                        <div className="flex items-center justify-between bg-purple-50/30 border border-purple-100/50 rounded-xl p-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <svg className="w-5 h-5 text-purple-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{item.fileName}</p>
                              <p className="text-[10px] font-semibold text-slate-400">
                                {Math.round(item.fileSize / 1024)} KB • {item.fileType?.split("/")[1]?.toUpperCase() || "FILE"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            {item.fileType?.startsWith("image/") && (
                              <button
                                onClick={() => setPreviewDoc(item)}
                                className="px-2.5 py-1 text-xs font-bold bg-white text-purple-700 hover:bg-purple-50 border border-purple-200 rounded-lg shadow-sm transition cursor-pointer"
                              >
                                View
                              </button>
                            )}
                            <button
                              onClick={() => downloadFile(item)}
                              className="px-2.5 py-1 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 font-medium italic">No file attached</div>
                      )}

                      <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 gap-2">
                        <div className="flex items-center gap-1 text-slate-400 text-sm font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Expiry: {item.expiryDate || "Never"}
                        </div>
                        {item.expiryDate && (
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${status.color}`}>
                            {status.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QUICK REMINDERS */}
        {activeTab === "reminders" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Quick Reminders</h2>
                <p className="text-slate-500 text-sm">Create checklist tasks with priorities and due dates.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleClearCompletedReminders}
                  disabled={data.reminders.filter(r => r.done).length === 0}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm cursor-pointer w-full sm:w-auto"
                >
                  Clear Completed
                </button>
                <button
                  onClick={() => handleOpenReminderModal("add")}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition cursor-pointer shadow-sm text-sm whitespace-nowrap w-full sm:w-auto"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Reminder
                </button>
              </div>
            </div>

            {data.reminders.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl w-fit mx-auto mb-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-slate-500 font-bold">No reminders set.</p>
                <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">Create a quick reminder for renewals, submission milestones, or administrative chores.</p>
                <button
                  onClick={() => handleOpenReminderModal("add")}
                  className="mt-4 px-4 py-2 border border-amber-500 text-amber-600 rounded-xl hover:bg-amber-50 transition font-semibold text-sm cursor-pointer"
                >
                  Add a Reminder
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Active Reminders */}
                {data.reminders.filter(r => !r.done).map((item) => {
                  const days = getDaysRemaining(item.dueDate);
                  const status = getStatusDetails(days, "reminder");
                  return (
                    <div 
                      key={item.id} 
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-xl bg-white hover:shadow-sm transition ${
                        item.priority === "High" ? "border-l-4 border-l-rose-500 border-slate-100" :
                        item.priority === "Medium" ? "border-l-4 border-l-amber-500 border-slate-100" :
                        "border-l-4 border-l-slate-300 border-slate-100"
                      }`}
                    >
                      <div className="flex items-start gap-3 w-full sm:w-auto min-w-0">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => handleToggleReminder(item.id)}
                          className="mt-1 h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p className="text-slate-800 font-semibold text-sm sm:text-base break-words">{item.text}</p>
                          {item.dueDate && (
                            <p className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Due: {item.dueDate.replace("T", " ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end mt-3 sm:mt-0">
                        {item.dueDate && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${status.color}`}>
                            {status.label}
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          item.priority === "High" ? "bg-rose-50 text-rose-700" :
                          item.priority === "Medium" ? "bg-amber-50 text-amber-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {item.priority}
                        </span>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleOpenReminderModal("edit", item)}
                            className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00-2 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteReminder(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Completed Reminders Separator */}
                {data.reminders.filter(r => r.done).length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Completed Reminders</h3>
                    <div className="flex flex-col gap-2 opacity-65">
                      {data.reminders.filter(r => r.done).map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={item.done}
                              onChange={() => handleToggleReminder(item.id)}
                              className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                            />
                            <p className="text-slate-500 text-sm font-medium line-through truncate">{item.text}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteReminder(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: ADD/EDIT DATE */}
        {modalType === "date" && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setModalType(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {modalMode === "add" ? "Add Important Date" : "Edit Important Date"}
              </h3>

              <form onSubmit={handleSaveDate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
                  <ThemedDropdown
                    value={dateForm.category}
                    options={dateCategories}
                    onChange={(val) => setDateForm(prev => ({ ...prev, category: val }))}
                    ariaLabel="Select Category"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Name / Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My Passport, Office Health Insurance"
                    value={dateForm.name}
                    onChange={(e) => setDateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Date</label>
                  <input
                    type="date"
                    required
                    value={dateForm.date}
                    onChange={(e) => setDateForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Notes (Optional)</label>
                  <textarea
                    placeholder="e.g. Needs document checklist, insurance claim phone is..."
                    value={dateForm.notes}
                    onChange={(e) => setDateForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl p-4 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  ></textarea>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition cursor-pointer shadow-md"
                  >
                    {modalMode === "add" ? "Save Date" : "Update Date"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD/EDIT DOCUMENT */}
        {modalType === "document" && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setModalType(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {modalMode === "add" ? "Upload / Add Document" : "Edit Document Details"}
              </h3>

              <form onSubmit={handleSaveDoc} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Document Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Driver's License PDF, Apartment Lease"
                    value={docForm.name}
                    onChange={(e) => setDocForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={docForm.expiryDate}
                    onChange={(e) => setDocForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Notes / Details</label>
                  <textarea
                    placeholder="e.g. Account number, physical cabinet folder location, emergency contact info"
                    value={docForm.notes}
                    onChange={(e) => setDocForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl p-4 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  ></textarea>
                </div>

                {/* File Attachment Uploader */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">File Attachment (Max 1.2MB)</label>
                  {docForm.fileName ? (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{docForm.fileName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{Math.round(docForm.fileSize / 1024)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/60 transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-6.5 h-6.5 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-[11px] text-slate-500 font-semibold">Click to attach image or small PDF document</p>
                        </div>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*,application/pdf"
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition cursor-pointer shadow-md"
                  >
                    {modalMode === "add" ? "Save Document" : "Update Details"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD/EDIT REMINDER */}
        {modalType === "reminder" && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setModalType(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {modalMode === "add" ? "Create Quick Reminder" : "Edit Quick Reminder"}
              </h3>

              <form onSubmit={handleSaveReminder} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Reminder Details</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Call insurance company, renew library card"
                    value={reminderForm.text}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Due Date & Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={reminderForm.dueDate}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Priority Level</label>
                  <ThemedDropdown
                    value={reminderForm.priority}
                    options={priorityOptions}
                    onChange={(val) => setReminderForm(prev => ({ ...prev, priority: val }))}
                    ariaLabel="Select Priority"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition cursor-pointer shadow-md"
                  >
                    {modalMode === "add" ? "Save Reminder" : "Update Reminder"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: DOCUMENT FILE PREVIEW */}
        {previewDoc && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-slate-100 relative flex flex-col gap-4 max-h-[90vh]">
              <button
                onClick={() => setPreviewDoc(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div>
                <span className="text-xs uppercase tracking-wider text-purple-600 font-bold">Document Image Preview</span>
                <h3 className="text-lg font-extrabold text-slate-900">{previewDoc.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{previewDoc.fileName}</p>
              </div>

              <div className="flex-1 border border-slate-100 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center p-4 max-h-[60vh]">
                {previewDoc.fileType?.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewDoc.fileData}
                    alt={previewDoc.name}
                    className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-sm border border-slate-200"
                  />
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-500 font-semibold">Preview not supported for this file type.</p>
                    <p className="text-slate-400 text-sm mt-1">Please download it to view physical contents.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => downloadFile(previewDoc)}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition cursor-pointer shadow-md text-sm"
                >
                  Download File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: IMPORT CONFIRMATION */}
        {showImportConfirm && pendingImportData && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-100 relative">
              <h3 className="text-xl font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-5.5 h-5.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Import Backup Data
              </h3>
              
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Choose how you want to load data from the uploaded backup file. The backup file contains:
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 flex flex-col gap-2 text-xs font-bold text-slate-600">
                <div className="flex justify-between">
                  <span>📅 Dates:</span>
                  <span>{pendingImportData.dates.length} entries</span>
                </div>
                <div className="flex justify-between">
                  <span>📄 Documents:</span>
                  <span>{pendingImportData.documents.length} entries</span>
                </div>
                <div className="flex justify-between">
                  <span>🔔 Reminders:</span>
                  <span>{pendingImportData.reminders.length} entries</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => executeImport(true)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition cursor-pointer shadow-sm text-sm"
                >
                  Merge (Keep current items & append new ones)
                </button>
                <button
                  onClick={() => executeImport(false)}
                  className="w-full py-3 border border-rose-200 text-rose-600 bg-rose-50/20 hover:bg-rose-50 font-bold rounded-xl transition cursor-pointer text-sm"
                >
                  Replace (Overwrite all current board data)
                </button>
                <button
                  onClick={() => {
                    setPendingImportData(null);
                    setShowImportConfirm(false);
                  }}
                  className="w-full py-3 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info text */}
        <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed max-w-md mx-auto">
          All Admin Dashboard files and dates remain inside your browser cache. Export standard backup JSON files to securely move your records between devices.
        </p>

      </div>
    </div>
  );
}

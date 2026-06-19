"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const STORAGE_KEY = "boring_tools_learning_os";

const PRESET_TEMPLATES = {
  "React Developer": {
    topics: [
      { text: "HTML, CSS, & Javascript Essentials", section: "Fundamentals" },
      { text: "React Components, Props, and JSX", section: "Fundamentals" },
      { text: "State Management with useState", section: "Fundamentals" },
      { text: "Handling DOM Events & User Inputs", section: "Fundamentals" },
      { text: "Effects & Data Fetching with useEffect", section: "Intermediate" },
      { text: "Building & Using Custom React Hooks", section: "Intermediate" },
      { text: "React Context API for Global State", section: "Intermediate" },
      { text: "Form Handling & Validation", section: "Intermediate" },
      { text: "Routing & Navigation (Next.js/React Router)", section: "Intermediate" },
      { text: "State Managers (Zustand / Redux Toolkit)", section: "Advanced" },
      { text: "Performance Optimization (useMemo, useCallback)", section: "Advanced" },
      { text: "Testing React Components (Jest & React Testing Library)", section: "Advanced" },
      { text: "React Server Components (RSC) & SSR", section: "Advanced" },
      { text: "Deployment, Vercel, & CI/CD Pipelines", section: "Advanced" },
      { text: "Security, Authentication, & Authorization", section: "Advanced" }
    ]
  },
  "Python & Data Science": {
    topics: [
      { text: "Python Syntax, Variables, & Data Types", section: "Fundamentals" },
      { text: "Control Flow, Loops, & Exception Handling", section: "Fundamentals" },
      { text: "Writing Reusable Functions & Modules", section: "Fundamentals" },
      { text: "File I/O operations & Data Formats (JSON/CSV)", section: "Fundamentals" },
      { text: "NumPy for Scientific Computing", section: "Intermediate" },
      { text: "Data Analysis with Pandas DataFrames", section: "Intermediate" },
      { text: "Data Visualization (Matplotlib & Seaborn)", section: "Intermediate" },
      { text: "SQL Databases & Connecting Python to DBs", section: "Intermediate" },
      { text: "Exploratory Data Analysis (EDA) Projects", section: "Intermediate" },
      { text: "Scikit-Learn for Machine Learning Basics", section: "Advanced" },
      { text: "Supervised Learning (Regression & Classification)", section: "Advanced" },
      { text: "Unsupervised Learning (Clustering & Dimensionality)", section: "Advanced" },
      { text: "Model Evaluation, Cross-Validation & GridSearch", section: "Advanced" },
      { text: "Feature Engineering & Feature Selection", section: "Advanced" },
      { text: "Deploying ML Models (Streamlit / Flask)", section: "Advanced" }
    ]
  },
  "UI/UX Design": {
    topics: [
      { text: "Design Thinking Process & Principles", section: "Fundamentals" },
      { text: "Color Theory & Palette Selection", section: "Fundamentals" },
      { text: "Typography Rules & Hierarchies", section: "Fundamentals" },
      { text: "Grid Systems, Layouts, & Alignment", section: "Fundamentals" },
      { text: "Figma Interface & Basic Shapes", section: "Fundamentals" },
      { text: "User Research, Personas, & Journey Maps", section: "Intermediate" },
      { text: "Information Architecture & Site Maps", section: "Intermediate" },
      { text: "Wireframing & Medium-Fidelity Mockups", section: "Intermediate" },
      { text: "Interactive Prototyping in Figma", section: "Intermediate" },
      { text: "Component Libraries & Auto Layout", section: "Intermediate" },
      { text: "Usability Testing & Feedback Loops", section: "Intermediate" },
      { text: "Design Systems & Variables Management", section: "Advanced" },
      { text: "Advanced Micro-animations & Transitions", section: "Advanced" },
      { text: "Responsive Design (Web, Mobile, & Tablet)", section: "Advanced" },
      { text: "Web Accessibility (WCAG 2.1 Guidelines)", section: "Advanced" },
      { text: "Developer Hand-off & Spec Writing", section: "Advanced" },
      { text: "Portfolio Building & Presentation Skills", section: "Advanced" }
    ]
  },
  "SQL & Databases": {
    topics: [
      { text: "Relational Database Concepts & Tables", section: "Fundamentals" },
      { text: "Basic Queries (SELECT, WHERE, ORDER BY)", section: "Fundamentals" },
      { text: "Filtering Data (AND, OR, NOT, IN, BETWEEN)", section: "Fundamentals" },
      { text: "Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)", section: "Fundamentals" },
      { text: "Grouping Data (GROUP BY & HAVING)", section: "Fundamentals" },
      { text: "Table Joins (INNER, LEFT, RIGHT, FULL)", section: "Intermediate" },
      { text: "Subqueries & Nested SELECTs", section: "Intermediate" },
      { text: "Common Table Expressions (CTEs & WITH)", section: "Intermediate" },
      { text: "Data Definition Language (CREATE, ALTER, DROP)", section: "Intermediate" },
      { text: "Transactions & ACID Properties", section: "Intermediate" },
      { text: "Designing Indexes & Execution Plans", section: "Intermediate" },
      { text: "Advanced Joins & Set Operators", section: "Advanced" },
      { text: "Stored Procedures, Functions, & Triggers", section: "Advanced" },
      { text: "Database Normalization (1NF, 2NF, 3NF)", section: "Advanced" },
      { text: "Query Optimization & Tuning", section: "Advanced" },
      { text: "NoSQL Databases vs Relational Databases", section: "Advanced" },
      { text: "Database Backup, Restore, & Migration", section: "Advanced" }
    ]
  }
};

export default function LearningOS() {
  const [goals, setGoals] = useState([]);
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [isEditingSetup, setIsEditingSetup] = useState(false);
  const [formTopic, setFormTopic] = useState("");
  const [formTargetSkill, setFormTargetSkill] = useState("");
  const [formHoursPerWeek, setFormHoursPerWeek] = useState(5);
  const [formLevel, setFormLevel] = useState("Beginner");
  const [formTemplate, setFormTemplate] = useState("React Developer");

  const [newTopicFundamentals, setNewTopicFundamentals] = useState("");
  const [newTopicIntermediate, setNewTopicIntermediate] = useState("");
  const [newTopicAdvanced, setNewTopicAdvanced] = useState("");

  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editingTopicText, setEditingTopicText] = useState("");

  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notification, setNotification] = useState(null);

  const fileInputRef = useRef(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.goals)) {
          setGoals(parsed.goals);
          setActiveGoalId(parsed.activeGoalId || (parsed.goals[0]?.id || null));
        }
      }
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ goals, activeGoalId }));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [goals, activeGoalId, isInitialized]);

  const activeGoal = useMemo(() => goals.find((g) => g.id === activeGoalId) || null, [goals, activeGoalId]);

  const sortedTopics = useMemo(() => {
    if (!activeGoal) return { Fundamentals: [], Intermediate: [], Advanced: [] };
    return {
      Fundamentals: activeGoal.topics.filter((t) => t.section === "Fundamentals"),
      Intermediate: activeGoal.topics.filter((t) => t.section === "Intermediate"),
      Advanced: activeGoal.topics.filter((t) => t.section === "Advanced")
    };
  }, [activeGoal]);

  const stats = useMemo(() => {
    if (!activeGoal || activeGoal.topics.length === 0) return { total: 0, completed: 0, remaining: 0, percentage: 0, estimatedWeeks: 0 };
    const total = activeGoal.topics.length;
    const completed = activeGoal.topics.filter((t) => t.done).length;
    const remaining = total - completed;
    const percentage = Math.round((completed / total) * 100);
    const hoursPerTopic = 4;
    const estimatedWeeks = remaining === 0 ? 0 : Math.max(1, Math.ceil((remaining * hoursPerTopic) / activeGoal.hoursPerWeek));
    return { total, completed, remaining, percentage, estimatedWeeks };
  }, [activeGoal]);

  const plannerData = useMemo(() => {
    if (!activeGoal) return { dailyMinutes: 0, weeklyTargets: [], focusTopic: null };
    const incomplete = activeGoal.topics.filter((t) => !t.done);
    const dailyMinutes = Math.round((activeGoal.hoursPerWeek * 60) / 7);
    const focusTopic = incomplete[0] || null;
    const hoursPerTopic = 4;
    const topicsPerWeek = Math.max(1, Math.round(activeGoal.hoursPerWeek / hoursPerTopic));
    const weeklyTargets = [];
    for (let i = 0; i < incomplete.length; i += topicsPerWeek) {
      weeklyTargets.push({ weekNum: Math.floor(i / topicsPerWeek) + 1, topics: incomplete.slice(i, i + topicsPerWeek) });
    }
    return { dailyMinutes, weeklyTargets, focusTopic };
  }, [activeGoal]);

  useEffect(() => {
    if (activeGoal && isEditingSetup) {
      setFormTopic(activeGoal.topic);
      setFormTargetSkill(activeGoal.targetSkill);
      setFormHoursPerWeek(activeGoal.hoursPerWeek);
      setFormLevel(activeGoal.level);
      setFormTemplate(activeGoal.template || "Custom");
    } else if (!activeGoal) {
      setFormTopic("");
      setFormTargetSkill("");
      setFormHoursPerWeek(5);
      setFormLevel("Beginner");
      setFormTemplate("React Developer");
    }
  }, [activeGoal, isEditingSetup]);

  // Action Handlers
  const handleSaveGoalSetup = (e) => {
    e.preventDefault();
    const topicTrimmed = formTopic.trim();
    const targetSkillTrimmed = formTargetSkill.trim();
    if (!topicTrimmed || !targetSkillTrimmed) return;

    if (isEditingSetup && activeGoal) {
      setGoals((c) => c.map((g) => g.id === activeGoal.id ? { ...g, topic: topicTrimmed, targetSkill: targetSkillTrimmed, hoursPerWeek: Number(formHoursPerWeek), level: formLevel } : g));
      setIsEditingSetup(false);
      showNotification("Goal settings updated");
    } else {
      const newGoalId = Date.now();
      let newTopics = [];
      if (formTemplate !== "Custom" && PRESET_TEMPLATES[formTemplate]) {
        newTopics = PRESET_TEMPLATES[formTemplate].topics.map((t, i) => ({ id: `${newGoalId}-${i}`, text: t.text, section: t.section, done: false, notes: "" }));
      }
      const newGoal = { id: newGoalId, topic: topicTrimmed, targetSkill: targetSkillTrimmed, hoursPerWeek: Number(formHoursPerWeek), level: formLevel, template: formTemplate, topics: newTopics, generalNotes: "", createdAt: new Date().toISOString() };
      setGoals((c) => [...c, newGoal]);
      setActiveGoalId(newGoalId);
      showNotification("New learning workspace created!");
    }
  };

  const handleDeleteGoal = () => {
    if (!activeGoal) return;
    if (confirm(`Delete the entire goal "${activeGoal.topic}"? This cannot be undone.`)) {
      const nextGoals = goals.filter((g) => g.id !== activeGoal.id);
      setGoals(nextGoals);
      setActiveGoalId(nextGoals[0]?.id || null);
      setIsEditingSetup(false);
      showNotification("Goal deleted");
    }
  };

  const handleAddTopic = (section, text, clearInput) => {
    const trimmed = text.trim();
    if (!trimmed || !activeGoal) return;
    setGoals((c) => c.map((g) => g.id === activeGoal.id ? { ...g, topics: [...g.topics, { id: `topic-${Date.now()}`, text: trimmed, section, done: false, notes: "" }] } : g));
    clearInput();
    showNotification("Topic added");
  };

  const handleToggleTopic = (topicId) => {
    setGoals((c) => c.map((g) => g.id === activeGoal.id ? { ...g, topics: g.topics.map((t) => t.id === topicId ? { ...t, done: !t.done } : t) } : g));
  };

  const handleDeleteTopic = (topicId) => {
    setGoals((c) => c.map((g) => g.id === activeGoal.id ? { ...g, topics: g.topics.filter((t) => t.id !== topicId) } : g));
    if (expandedTopicId === topicId) setExpandedTopicId(null);
  };

  const handleStartEditTopic = (topic) => { setEditingTopicId(topic.id); setEditingTopicText(topic.text); };

  const handleSaveTopicName = (topicId) => {
    const trimmed = editingTopicText.trim();
    if (!trimmed) return;
    setGoals((c) => c.map((g) => g.id === activeGoal.id ? { ...g, topics: g.topics.map((t) => t.id === topicId ? { ...t, text: trimmed } : t) } : g));
    setEditingTopicId(null);
  };

  const handleUpdateTopicNotes = (topicId, notesContent) => {
    setGoals((c) => c.map((g) => g.id === activeGoal.id ? { ...g, topics: g.topics.map((t) => t.id === topicId ? { ...t, notes: notesContent } : t) } : g));
  };

  const handleUpdateGeneralNotes = (notesContent) => {
    setGoals((c) => c.map((g) => g.id === activeGoal.id ? { ...g, generalNotes: notesContent } : g));
  };

  const handleResetProgress = () => {
    if (!activeGoal) return;
    if (confirm("Reset all topic progress? Notes will be kept.")) {
      setGoals((c) => c.map((g) => g.id === activeGoal.id ? { ...g, topics: g.topics.map((t) => ({ ...t, done: false })) } : g));
      showNotification("Progress reset");
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ goals, activeGoalId }, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `boring_tools_learning_os.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showNotification("Data exported successfully");
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && Array.isArray(parsed.goals)) {
          setGoals(parsed.goals);
          setActiveGoalId(parsed.activeGoalId || (parsed.goals[0]?.id || null));
          showNotification(`Imported ${parsed.goals.length} goal(s) successfully`);
        } else {
          showNotification("Invalid backup file structure", "error");
        }
      } catch {
        showNotification("Failed to parse JSON file", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // Loading state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  // Helper: render a single topic card in a breakdown column
  function renderTopicItem(topic) {
    const isEditing = editingTopicId === topic.id;
    return (
      <div key={topic.id} className={`group rounded-xl border p-3 flex flex-col gap-1.5 transition ${topic.done ? "bg-slate-50 border-slate-100" : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm"}`}>
        <div className="flex items-start gap-2.5">
          <input type="checkbox" checked={topic.done} onChange={() => handleToggleTopic(topic.id)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 shrink-0 cursor-pointer accent-amber-500" />
          <div className="flex-grow min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input type="text" value={editingTopicText} onChange={(e) => setEditingTopicText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSaveTopicName(topic.id); if (e.key === "Escape") setEditingTopicId(null); }} className="w-full text-sm font-medium text-slate-900 border-b border-amber-400 outline-none bg-transparent" autoFocus />
                <button onClick={() => handleSaveTopicName(topic.id)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-1">Save</button>
                <button onClick={() => setEditingTopicId(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 px-1">Esc</button>
              </div>
            ) : (
              <p className={`text-sm font-medium leading-snug break-words ${topic.done ? "text-slate-400 line-through" : "text-slate-800"}`} onDoubleClick={() => handleStartEditTopic(topic)} title="Double click to rename">{topic.text}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <button onClick={() => { setActiveTab("notes"); setExpandedTopicId(topic.id); }} className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition flex items-center gap-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              <span>{topic.notes && topic.notes.trim() ? "Edit Notes" : "Notes"}</span>
            </button>
            {!isEditing && <button onClick={() => handleStartEditTopic(topic)} className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition">Rename</button>}
          </div>
          <button onClick={() => handleDeleteTopic(topic.id)} className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition">Delete</button>
        </div>
      </div>
    );
  }

  // Helper: render a breakdown column
  function renderBreakdownColumn(title, subtitle, dotColor, topics, inputValue, setInputValue, sectionKey) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
              {title}
            </h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{topics.filter(t => t.done).length}/{topics.length}</span>
        </div>
        <div className="flex-grow space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {topics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-xs text-slate-400 italic">No topics yet. Add one below.</p>
            </div>
          ) : topics.map((topic) => renderTopicItem(topic))}
        </div>
        <div className="border-t border-slate-100 pt-3">
          <div className="flex gap-2">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAddTopic(sectionKey, inputValue, () => setInputValue("")); }} placeholder={`Add ${title.toLowerCase()} topic...`} className="flex-1 text-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition placeholder:text-slate-400" />
            <button onClick={() => handleAddTopic(sectionKey, inputValue, () => setInputValue(""))} className="border border-slate-900 text-slate-900 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-900 hover:text-white transition">Add</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans pb-16">
      <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 w-full max-w-6xl border border-slate-100 flex flex-col gap-6 relative overflow-hidden">

        {/* Floating Notification */}
        {notification && (
          <div className={`fixed top-20 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 max-w-md ${notification.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
            <div className="flex items-center gap-2">
              {notification.type === "error" ? (
                <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Hidden file input for import */}
        <input type="file" ref={fileInputRef} accept=".json" onChange={handleImportData} className="hidden" />

        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              Learning OS
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Organize learning goals, track breakdown topics, and generate daily/weekly study targets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {goals.length > 0 && (
              <div className="w-48">
                <ThemedDropdown
                  ariaLabel="Select learning goal"
                  value={activeGoalId}
                  options={goals.map((g) => ({ value: g.id, label: g.topic }))}
                  onChange={(val) => { setActiveGoalId(Number(val)); setIsEditingSetup(false); }}
                />
              </div>
            )}
            <button onClick={handleExportData} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>Export</span>
            </button>
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span>Import</span>
            </button>
            <button onClick={() => { setActiveGoalId(null); setIsEditingSetup(false); }} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition cursor-pointer shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              <span>New Goal</span>
            </button>
          </div>
        </div>

        {/* Setup / Creation Form */}
        {(!activeGoal || isEditingSetup) ? (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-900">
              {isEditingSetup ? `Edit "${activeGoal?.topic}" Settings` : "Create a New Learning Goal"}
            </h2>

            <form onSubmit={handleSaveGoalSetup} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Topic Name</label>
                  <input type="text" required value={formTopic} onChange={(e) => setFormTopic(e.target.value)} placeholder="e.g. Next.js, Rust, Docker, Cooking" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Target Skill / Outcome</label>
                  <input type="text" required value={formTargetSkill} onChange={(e) => setFormTargetSkill(e.target.value)} placeholder="e.g. Build a portfolio site" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Hours Per Week</label>
                  <input type="number" min="1" max="168" required value={formHoursPerWeek} onChange={(e) => setFormHoursPerWeek(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Current Level</label>
                  <ThemedDropdown
                    ariaLabel="Select current level"
                    value={formLevel}
                    options={[
                      { value: "Beginner", label: "Beginner" },
                      { value: "Intermediate", label: "Intermediate" },
                      { value: "Advanced", label: "Advanced" }
                    ]}
                    onChange={(val) => setFormLevel(val)}
                  />
                </div>
              </div>
              {!isEditingSetup && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Breakdown Template</label>
                  <ThemedDropdown
                    ariaLabel="Select breakdown template"
                    value={formTemplate}
                    options={[
                      { value: "Custom", label: "Custom (Start empty)" },
                      { value: "React Developer", label: "React Developer" },
                      { value: "Python & Data Science", label: "Python & Data Science" },
                      { value: "UI/UX Design", label: "UI/UX Design" },
                      { value: "SQL & Databases", label: "SQL & Databases" }
                    ]}
                    onChange={(val) => setFormTemplate(val)}
                  />
                  <p className="text-xs text-slate-500">Templates prepopulate Fundamentals, Intermediate, and Advanced milestones.</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-3 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition shadow-sm">
                  {isEditingSetup ? "Save Settings" : "Create Workspace"}
                </button>
                {isEditingSetup && (
                  <button type="button" onClick={() => setIsEditingSetup(false)} className="px-4 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">Cancel</button>
                )}
                {!isEditingSetup && goals.length > 0 && (
                  <button type="button" onClick={() => { if (goals.length > 0) setActiveGoalId(goals[0].id); }} className="px-4 py-3 text-sm font-semibold text-slate-500 hover:text-slate-900 transition">Back to Dashboard</button>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* Main Dashboard */
          <>
            {/* Goal Metadata Bar */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">{activeGoal.level}</span>
                  <span className="text-xs font-semibold text-slate-500">{activeGoal.hoursPerWeek} hrs/week</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{activeGoal.topic}</h2>
                <p className="text-sm text-slate-500"><span className="font-semibold text-slate-700">Goal:</span> {activeGoal.targetSkill}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setIsEditingSetup(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer shadow-sm">Edit Setup</button>
                <button onClick={handleResetProgress} disabled={stats.completed === 0} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer shadow-sm disabled:opacity-40">Reset</button>
                <button onClick={handleDeleteGoal} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition cursor-pointer shadow-sm">Delete</button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 overflow-x-auto gap-2 scrollbar-none">
              {[
                { id: "dashboard", label: "Dashboard" },
                { id: "planner", label: "Study Planner" },
                { id: "notes", label: "Notes" }
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id ? "border-amber-500 text-amber-600" : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: Dashboard */}
            {activeTab === "dashboard" && (
              <div className="flex flex-col gap-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition duration-300">
                    <div className="absolute right-3 top-3 text-orange-200 group-hover:scale-110 transition duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Progress</span>
                    <div className="text-3xl font-extrabold text-slate-900">{stats.percentage}%</div>
                    <span className="text-xs text-slate-500 font-medium">{stats.completed} of {stats.total} completed</span>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition duration-300">
                    <div className="absolute right-3 top-3 text-blue-200 group-hover:scale-110 transition duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estimated Timeline</span>
                    <div className="text-3xl font-extrabold text-slate-900">~{stats.estimatedWeeks} <span className="text-lg font-bold text-slate-500">weeks</span></div>
                    <span className="text-xs text-slate-500 font-medium">At {activeGoal.hoursPerWeek} hrs/week</span>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition duration-300">
                    <div className="absolute right-3 top-3 text-purple-200 group-hover:scale-110 transition duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Remaining</span>
                    <div className="text-3xl font-extrabold text-slate-900">{stats.remaining} <span className="text-lg font-bold text-slate-500">topics</span></div>
                    <span className="text-xs text-slate-500 font-medium">Across all 3 levels</span>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition duration-300">
                    <div className="absolute right-3 top-3 text-emerald-200 group-hover:scale-110 transition duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Focus Today</span>
                    <div className="text-sm font-extrabold text-slate-900 truncate pr-6" title={plannerData.focusTopic?.text}>
                      {plannerData.focusTopic ? plannerData.focusTopic.text : "🎉 All done!"}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {plannerData.focusTopic ? `${plannerData.dailyMinutes} mins daily target` : "No remaining topics"}
                    </span>
                  </div>
                </div>

                {/* 3-Column Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {renderBreakdownColumn("Fundamentals", "Core building blocks", "bg-slate-400", sortedTopics.Fundamentals, newTopicFundamentals, setNewTopicFundamentals, "Fundamentals")}
                  {renderBreakdownColumn("Intermediate", "Applied concepts & APIs", "bg-amber-500", sortedTopics.Intermediate, newTopicIntermediate, setNewTopicIntermediate, "Intermediate")}
                  {renderBreakdownColumn("Advanced", "Architecture & deployment", "bg-orange-600", sortedTopics.Advanced, newTopicAdvanced, setNewTopicAdvanced, "Advanced")}
                </div>

                {/* Inline note editor when expanding from dashboard */}
                {expandedTopicId && activeTab === "dashboard" && activeGoal.topics.find(t => t.id === expandedTopicId) && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm">Notes: &ldquo;{activeGoal.topics.find(t => t.id === expandedTopicId).text}&rdquo;</h4>
                      <button onClick={() => setExpandedTopicId(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800 transition">Close</button>
                    </div>
                    <textarea value={activeGoal.topics.find(t => t.id === expandedTopicId).notes} onChange={(e) => handleUpdateTopicNotes(expandedTopicId, e.target.value)} placeholder="Write study notes, snippets, or definitions..." className="w-full min-h-[150px] text-sm p-4 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition" />
                  </div>
                )}
              </div>
            )}

            {/* TAB: Study Planner */}
            {activeTab === "planner" && (
              <div className="flex flex-col gap-6">
                {/* Planner Header Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Your Action Planner</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Focus on one topic at a time. Each topic ≈ 4 hours of deep study.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-amber-600">{plannerData.dailyMinutes} min</span>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-bold">Daily Target</p>
                  </div>
                </div>

                {/* Today's Focus */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-md">Today&apos;s Focus</span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1.5">{plannerData.focusTopic ? plannerData.focusTopic.text : "🎉 All goals complete!"}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Spend your session reading, coding, or taking notes on this topic.</p>
                  </div>
                  {plannerData.focusTopic && (
                    <button onClick={() => handleToggleTopic(plannerData.focusTopic.id)} className="px-4 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition cursor-pointer shadow-sm shrink-0">Done for Today</button>
                  )}
                </div>

                {/* Weekly Targets */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Schedule</h4>
                  {plannerData.weeklyTargets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                      <p className="text-slate-500 text-sm">🎉 No remaining targets. You completed the entire roadmap!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plannerData.weeklyTargets.map((week) => (
                        <div key={week.weekNum} className={`rounded-2xl border p-5 transition ${week.weekNum === 1 ? "border-amber-300 bg-amber-50/30 shadow-md" : "border-slate-200 bg-white hover:shadow-sm"}`}>
                          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                            <h5 className="font-extrabold text-slate-900 text-sm">
                              Week {week.weekNum}
                              {week.weekNum === 1 && <span className="text-xs font-bold text-amber-700 bg-amber-100 rounded-md px-1.5 py-0.5 ml-1.5">THIS WEEK</span>}
                            </h5>
                            <span className="text-xs font-semibold text-slate-400">{week.topics.length} topic{week.topics.length > 1 ? "s" : ""}</span>
                          </div>
                          <ul className="space-y-2">
                            {week.topics.map((t) => (
                              <li key={t.id} className="text-sm font-medium text-slate-700 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                <span>{t.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Notes */}
            {activeTab === "notes" && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
                {/* Sidebar: Notebook Selector */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
                  <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Select Notebook</h4>
                  <button onClick={() => setExpandedTopicId("general")} className={`w-full text-left text-sm font-bold rounded-xl p-2.5 transition flex items-center gap-2 ${expandedTopicId === "general" || expandedTopicId === null ? "bg-amber-50 text-amber-700 border border-amber-200" : "hover:bg-slate-50 text-slate-600 border border-transparent"}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    <span>General Notes</span>
                  </button>
                  <div className="border-t border-slate-100 pt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Topic Notes</p>
                    <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
                      {activeGoal.topics.map((t) => (
                        <button key={t.id} onClick={() => setExpandedTopicId(t.id)} className={`w-full text-left text-sm font-medium rounded-xl p-2 transition truncate flex items-center justify-between ${expandedTopicId === t.id ? "bg-amber-50 text-amber-700 border border-amber-200" : "hover:bg-slate-50 text-slate-600 border border-transparent"}`}>
                          <span className="truncate pr-2">{t.text}</span>
                          {t.notes && t.notes.trim().length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Has notes" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Editor Panel */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 min-h-[400px] flex flex-col">
                  {(expandedTopicId === "general" || expandedTopicId === null) ? (
                    <div className="flex-grow flex flex-col gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">General Goal Notebook</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Resources, links, strategies, and reminders for {activeGoal.topic}.</p>
                      </div>
                      <textarea value={activeGoal.generalNotes || ""} onChange={(e) => handleUpdateGeneralNotes(e.target.value)} placeholder="Write general notes, resources, links, plans..." className="flex-grow w-full min-h-[300px] text-sm p-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition" />
                    </div>
                  ) : activeGoal.topics.find(t => t.id === expandedTopicId) ? (
                    <div className="flex-grow flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{activeGoal.topics.find(t => t.id === expandedTopicId).section}</span>
                          <h3 className="text-base font-bold text-slate-900 mt-1">{activeGoal.topics.find(t => t.id === expandedTopicId).text}</h3>
                        </div>
                        <button onClick={() => handleToggleTopic(expandedTopicId)} className={`rounded-xl px-3 py-1.5 border text-xs font-semibold transition ${activeGoal.topics.find(t => t.id === expandedTopicId).done ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                          {activeGoal.topics.find(t => t.id === expandedTopicId).done ? "✓ Completed" : "Mark Done"}
                        </button>
                      </div>
                      <textarea value={activeGoal.topics.find(t => t.id === expandedTopicId).notes} onChange={(e) => handleUpdateTopicNotes(expandedTopicId, e.target.value)} placeholder="Write code snippets, flashcards, or key concepts..." className="flex-grow w-full min-h-[300px] text-sm p-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition" />
                    </div>
                  ) : (
                    <div className="flex-grow flex items-center justify-center text-slate-400 text-sm italic">Select a notebook from the sidebar.</div>
                  )}
                  <p className="text-xs text-slate-400 pt-3 border-t border-slate-100 mt-4">All notes are stored locally on your device via localStorage.</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 pt-2">Learning OS — 100% offline, client-side data storage. Part of the Boring Tools ecosystem.</p>
      </div>
    </div>
  );
}

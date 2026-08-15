"use client";

import { useState, useMemo, useEffect, useRef } from "react";

const HOLIDAYS = [
  // Indian Festivals
  { date: "2026-01-26", name: "Republic Day", category: "indian" },
  { date: "2026-03-25", name: "Holi", category: "indian" },
  { date: "2026-04-14", name: "Ambedkar Jayanti", category: "indian" },
  { date: "2026-08-15", name: "Independence Day", category: "indian" },
  { date: "2026-10-02", name: "Gandhi Jayanti", category: "indian" },
  { date: "2026-10-29", name: "Diwali", category: "indian" },
  { date: "2026-11-01", name: "Diwali (Day 2)", category: "indian" },
  { date: "2026-11-15", name: "Guru Nanak Jayanti", category: "indian" },

  // General Holidays
  { date: "2026-12-25", name: "Christmas", category: "general" },
  { date: "2026-01-01", name: "New Year", category: "general" },
  { date: "2026-04-10", name: "Good Friday", category: "general" },
];

const INITIAL_SUBJECTS = [
  { id: "sub-1", name: "Data Structures & Algorithms", attended: 28, total: 35, target: 75, medical: 0, weeklyClasses: 4 },
  { id: "sub-2", name: "Database Management Systems", attended: 20, total: 32, target: 75, medical: 1, weeklyClasses: 3 },
  { id: "sub-3", name: "Computer Networks Lab", attended: 14, total: 16, target: 80, medical: 0, weeklyClasses: 2 },
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIMETABLE_PRESETS = {
  cse: [
    { id: "p-1", name: "Data Structures & Algorithms", attended: 24, total: 30, target: 75, medical: 0, weeklyClasses: 4 },
    { id: "p-2", name: "Database Management Systems", attended: 21, total: 28, target: 75, medical: 0, weeklyClasses: 3 },
    { id: "p-3", name: "Operating Systems", attended: 18, total: 25, target: 75, medical: 1, weeklyClasses: 3 },
    { id: "p-4", name: "Computer Networks Lab", attended: 12, total: 14, target: 80, medical: 0, weeklyClasses: 2 },
  ],
  ece: [
    { id: "p-5", name: "Digital Signal Processing", attended: 22, total: 28, target: 75, medical: 0, weeklyClasses: 4 },
    { id: "p-6", name: "Microprocessors & Microcontrollers", attended: 19, total: 24, target: 75, medical: 0, weeklyClasses: 3 },
    { id: "p-7", name: "Control Systems", attended: 16, total: 22, target: 75, medical: 0, weeklyClasses: 3 },
    { id: "p-8", name: "VLSI Design Lab", attended: 10, total: 12, target: 80, medical: 0, weeklyClasses: 2 },
  ],
  science: [
    { id: "p-9", name: "Mathematics & Calculus", attended: 26, total: 32, target: 75, medical: 0, weeklyClasses: 4 },
    { id: "p-10", name: "Quantum Physics", attended: 20, total: 26, target: 75, medical: 0, weeklyClasses: 4 },
    { id: "p-11", name: "Organic Chemistry", attended: 18, total: 24, target: 75, medical: 1, weeklyClasses: 3 },
    { id: "p-12", name: "Physics Practical Lab", attended: 12, total: 14, target: 80, medical: 0, weeklyClasses: 2 },
  ],
  bba: [
    { id: "p-13", name: "Financial Accounting", attended: 25, total: 30, target: 75, medical: 0, weeklyClasses: 4 },
    { id: "p-14", name: "Marketing Management", attended: 20, total: 25, target: 75, medical: 0, weeklyClasses: 3 },
    { id: "p-15", name: "Business Law", attended: 17, total: 22, target: 75, medical: 0, weeklyClasses: 3 },
    { id: "p-16", name: "Organizational Behavior", attended: 19, total: 24, target: 75, medical: 0, weeklyClasses: 3 },
  ],
};

export default function AttendanceCalculator() {
  const [activeTab, setActiveTab] = useState("semester"); // "semester" | "live" | "subjects"
  
  // State for Semester Planner Mode
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-07-30");
  const [classesPerDay, setClassesPerDay] = useState(4);
  const [offDays, setOffDays] = useState(["saturday", "sunday"]);
  const [selectedHolidays, setSelectedHolidays] = useState(
    HOLIDAYS.filter((h) => h.category === "indian").map((h) => h.date)
  );
  const [attendancePercentage, setAttendancePercentage] = useState(75);
  const [medicalLeaveDays, setMedicalLeaveDays] = useState(0);
  const [vacationDaysWanted, setVacationDaysWanted] = useState(5);
  const [vacationMonth, setVacationMonth] = useState("July");
  const [vacationPlannerOpen, setVacationPlannerOpen] = useState(false);

  // State for Live Tracker & Catch-Up Predictor Mode
  const [liveAttended, setLiveAttended] = useState(26);
  const [liveTotal, setLiveTotal] = useState(38);
  const [liveTarget, setLiveTarget] = useState(75);
  const [liveMedicalCount, setLiveMedicalCount] = useState(0);

  // State for Subject-Wise Manager Mode
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectAttended, setNewSubjectAttended] = useState(20);
  const [newSubjectTotal, setNewSubjectTotal] = useState(25);
  const [newSubjectTarget, setNewSubjectTarget] = useState(75);
  const [newSubjectMedical, setNewSubjectMedical] = useState(0);
  const [newSubjectWeekly, setNewSubjectWeekly] = useState(3);
  const [showAddSubjectForm, setShowAddSubjectForm] = useState(false);

  // State for Timetable Upload & Schedule Parser
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [rawExtractedText, setRawExtractedText] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState("");
  const [uploadStatusType, setUploadStatusType] = useState("info"); // "info" | "success" | "error"
  const [showTimetableUploadSection, setShowTimetableUploadSection] = useState(false);
  const [parsedPreviewSubjects, setParsedPreviewSubjects] = useState([]);
  const [quickBulkInputText, setQuickBulkInputText] = useState("");
  const [showERPGuide, setShowERPGuide] = useState(false);

  // Weekly Schedule Grid State (Day -> Subject array)
  const [weeklySchedule, setWeeklySchedule] = useState({
    Monday: ["Data Structures & Algorithms", "Database Management Systems"],
    Tuesday: ["Computer Networks Lab", "Data Structures & Algorithms"],
    Wednesday: ["Database Management Systems", "Data Structures & Algorithms"],
    Thursday: ["Computer Networks Lab", "Database Management Systems"],
    Friday: ["Data Structures & Algorithms"],
    Saturday: [],
  });

  // State for Smart Auto-Estimation Wizard (Option 1)
  const [estimateStartDate, setEstimateStartDate] = useState("2026-06-01");
  const [estimateCalculationDate, setEstimateCalculationDate] = useState("2026-07-15");
  const [estimateAttendancePct, setEstimateAttendancePct] = useState(75);
  const [showAutoEstimateBar, setShowAutoEstimateBar] = useState(false);

  const fileInputRef = useRef(null);

  // Persistence: Load saved data from localStorage on client side
  useEffect(() => {
    try {
      const saved = localStorage.getItem("attendance_calc_data_v5");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.endDate) setEndDate(parsed.endDate);
        if (parsed.classesPerDay) setClassesPerDay(parsed.classesPerDay);
        if (parsed.offDays) setOffDays(parsed.offDays);
        if (parsed.selectedHolidays) setSelectedHolidays(parsed.selectedHolidays);
        if (parsed.attendancePercentage) setAttendancePercentage(parsed.attendancePercentage);
        if (parsed.medicalLeaveDays !== undefined) setMedicalLeaveDays(parsed.medicalLeaveDays);
        if (parsed.liveAttended !== undefined) setLiveAttended(parsed.liveAttended);
        if (parsed.liveTotal !== undefined) setLiveTotal(parsed.liveTotal);
        if (parsed.liveTarget !== undefined) setLiveTarget(parsed.liveTarget);
        if (parsed.liveMedicalCount !== undefined) setLiveMedicalCount(parsed.liveMedicalCount);
        if (parsed.subjects && Array.isArray(parsed.subjects)) setSubjects(parsed.subjects);
        if (parsed.weeklySchedule) setWeeklySchedule(parsed.weeklySchedule);
      }
    } catch (e) {
      console.error("Failed to load attendance calculator data", e);
    }
  }, []);

  // Persistence: Save data to localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        activeTab,
        startDate,
        endDate,
        classesPerDay,
        offDays,
        selectedHolidays,
        attendancePercentage,
        medicalLeaveDays,
        liveAttended,
        liveTotal,
        liveTarget,
        liveMedicalCount,
        subjects,
        weeklySchedule,
      };
      localStorage.setItem("attendance_calc_data_v5", JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Failed to save attendance calculator data", e);
    }
  }, [
    activeTab, startDate, endDate, classesPerDay, offDays, selectedHolidays,
    attendancePercentage, medicalLeaveDays, liveAttended, liveTotal, liveTarget,
    liveMedicalCount, subjects, weeklySchedule,
  ]);

  const [parsedWeeklySchedule, setParsedWeeklySchedule] = useState(null);
  const [isAiParsed, setIsAiParsed] = useState(false);

  // Handle File Upload via Server API (/api/parse-timetable)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setUploadedFileName(file.name);
    setUploadStatusMessage(`Analyzing ${file.name} with AI...`);
    setUploadStatusType("info");
    setRawExtractedText("");
    setParsedPreviewSubjects([]);
    setParsedWeeklySchedule(null);
    setIsAiParsed(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-timetable", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server failed to parse the file");
      }

      setRawExtractedText(data.extractedText || "");
      setParsedPreviewSubjects(data.subjects || []);
      setParsedWeeklySchedule(data.weeklySchedule || null);
      setIsAiParsed(Boolean(data.isAiExtracted));
      setUploadStatusMessage(data.message || `Parsed ${file.name}`);
      setUploadStatusType(data.subjects?.length > 0 ? "success" : "info");
    } catch (err) {
      console.error("Error uploading timetable file:", err);
      setUploadStatusMessage(`Failed to parse ${file.name}: ${err.message}. Try pasting text directly below.`);
      setUploadStatusType("error");
    } finally {
      setIsProcessingFile(false);
      // Reset file input so same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Confirm adding previewed subjects to subjects list
  const handleAddPreviewSubjectsToMain = (applySchedule = true) => {
    if (parsedPreviewSubjects.length === 0) return;
    setSubjects((prev) => [...prev, ...parsedPreviewSubjects]);

    if (applySchedule && parsedWeeklySchedule) {
      setWeeklySchedule((prev) => ({
        ...prev,
        ...parsedWeeklySchedule,
      }));
      setUploadStatusMessage(`Added ${parsedPreviewSubjects.length} subjects & applied AI weekly timetable schedule!`);
    } else {
      setUploadStatusMessage(`Added ${parsedPreviewSubjects.length} subjects to your tracker!`);
    }

    setUploadStatusType("success");
    setParsedPreviewSubjects([]);
    setParsedWeeklySchedule(null);
  };

  // Remove a single subject from preview before adding
  const handleRemoveFromPreview = (id) => {
    setParsedPreviewSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // Handle Bulk Text Input Add (Line-by-line subjects)
  const handleBulkAddText = () => {
    if (!quickBulkInputText.trim()) return;
    const lines = quickBulkInputText.split(/[\r\n]+/);
    const newItems = [];
    let idx = 1;
    lines.forEach((l) => {
      const name = l.trim();
      if (name.length >= 2) {
        newItems.push({
          id: `sub-bulk-${Date.now()}-${idx++}`,
          name: name,
          attended: 0,
          total: 0,
          target: 75,
          medical: 0,
          weeklyClasses: 3,
        });
      }
    });

    if (newItems.length > 0) {
      setSubjects((prev) => [...prev, ...newItems]);
      setUploadStatusMessage(`Bulk added ${newItems.length} subjects!`);
      setUploadStatusType("success");
      setQuickBulkInputText("");
    }
  };

  // Auto-Estimate Classes from Semester Dates (Option 1)
  const handleAutoEstimateClasses = () => {
    const start = new Date(estimateStartDate);
    const curr = new Date(estimateCalculationDate);
    const diffTime = curr - start;

    if (diffTime < 0) {
      setUploadStatusMessage("Calculation date must be after Semester Start date");
      setUploadStatusType("error");
      return;
    }

    const elapsedDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
    const elapsedWeeks = Math.max(1, Math.round(elapsedDays / 7));

    setSubjects((prev) =>
      prev.map((sub) => {
        const weekly = Math.max(1, sub.weeklyClasses || 3);
        const total = Math.max(1, elapsedWeeks * weekly);
        const attended = Math.max(
          0,
          Math.min(total, Math.round(total * (estimateAttendancePct / 100)))
        );
        return {
          ...sub,
          total,
          attended,
        };
      })
    );

    setUploadStatusMessage(
      `⚡ Auto-estimated classes across ${elapsedWeeks} elapsed weeks with ${estimateAttendancePct}% attendance!`
    );
    setUploadStatusType("success");
  };

  // Quick Preset percentage applied to a single subject
  const handleQuickSetSubjectPct = (subjectId, percentage) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === subjectId) {
          const total = Math.max(1, sub.total || 20);
          const attended = Math.max(
            0,
            Math.min(total, Math.round(total * (percentage / 100)))
          );
          return {
            ...sub,
            attended,
          };
        }
        return sub;
      })
    );
  };

  // Load Preset Template
  const handleLoadPreset = (presetKey) => {
    const selected = TIMETABLE_PRESETS[presetKey];
    if (selected) {
      setSubjects(selected);
      setUploadStatusMessage(`Loaded ${presetKey.toUpperCase()} preset schedule!`);
      setUploadStatusType("success");
    }
  };

  // Add subject to specific day in weekly schedule grid
  const handleAddSlotToDay = (dayName, subjectName) => {
    if (!subjectName) return;
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayName]: [...(prev[dayName] || []), subjectName],
    }));
  };

  // Remove subject slot from specific day
  const handleRemoveSlotFromDay = (dayName, slotIndex) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayName]: (prev[dayName] || []).filter((_, idx) => idx !== slotIndex),
    }));
  };

  // Semester Calculations
  const calculations = useMemo(() => {
    if (!startDate || !endDate || classesPerDay <= 0) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) return { error: "End date must be after start date" };

    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    let weekendDays = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const isWeekend =
        (dayOfWeek === 6 && offDays.includes("saturday")) ||
        (dayOfWeek === 0 && offDays.includes("sunday"));
      if (isWeekend) weekendDays++;
    }

    let holidayDays = 0;
    selectedHolidays.forEach((holidayDate) => {
      const hDate = new Date(holidayDate);
      if (hDate >= start && hDate <= end) {
        const dayOfWeek = hDate.getDay();
        const isWeekend =
          (dayOfWeek === 6 && offDays.includes("saturday")) ||
          (dayOfWeek === 0 && offDays.includes("sunday"));
        if (!isWeekend) holidayDays++;
      }
    });

    const workingDays = Math.max(0, totalDays - weekendDays - holidayDays);
    const totalClassesPossible = workingDays * classesPerDay;
    const medicalClassesCredit = (medicalLeaveDays || 0) * classesPerDay;
    const effectiveTargetClasses = Math.max(0, Math.ceil(totalClassesPossible * (attendancePercentage / 100)) - medicalClassesCredit);
    const classesCanMiss = Math.max(0, totalClassesPossible - effectiveTargetClasses);
    const daysCanMiss = Math.floor(classesCanMiss / classesPerDay);

    return {
      totalDays, weekendDays, holidayDays, workingDays, totalClassesPossible,
      classesNeededForSelectedPercentage: effectiveTargetClasses,
      classesCanMiss, daysCanMiss, medicalClassesCredit,
      attendance: totalClassesPossible > 0 ? (((totalClassesPossible - classesCanMiss) / totalClassesPossible) * 100).toFixed(1) : "0.0",
      classesLostToVacation: vacationDaysWanted * classesPerDay,
      canTakeFullVacation: vacationDaysWanted * classesPerDay <= classesCanMiss,
    };
  }, [startDate, endDate, classesPerDay, offDays, selectedHolidays, attendancePercentage, medicalLeaveDays, vacationDaysWanted]);

  // Live Catch-Up & Bunk Metrics
  const liveMetrics = useMemo(() => {
    const total = Math.max(1, liveTotal);
    const attended = Math.max(0, Math.min(liveAttended, total));
    const medical = Math.max(0, liveMedicalCount);
    const effectiveAttended = attended + medical;
    const targetPct = Math.max(1, Math.min(99, liveTarget));
    const currentPct = (effectiveAttended / total) * 100;
    const isBelowTarget = currentPct < targetPct;

    let classesToAttendNeeded = 0;
    let classesCanBunkAllowed = 0;

    if (isBelowTarget) {
      classesToAttendNeeded = Math.max(0, Math.ceil((targetPct * total - 100 * effectiveAttended) / (100 - targetPct)));
    } else {
      classesCanBunkAllowed = Math.max(0, Math.floor((100 * effectiveAttended - targetPct * total) / targetPct));
    }

    return { currentPct: currentPct.toFixed(1), isBelowTarget, classesToAttendNeeded, classesCanBunkAllowed, effectiveAttended, total, targetPct };
  }, [liveAttended, liveTotal, liveTarget, liveMedicalCount]);

  // Subject-Wise Status Helper
  const getSubjectStatus = (subject) => {
    const total = Math.max(1, subject.total);
    const attended = Math.max(0, Math.min(subject.attended, total));
    const medical = Math.max(0, subject.medical || 0);
    const effective = attended + medical;
    const target = subject.target || 75;
    const pct = (effective / total) * 100;
    const isBelow = pct < target;

    let consecutiveNeeded = 0;
    let safeToBunk = 0;

    if (isBelow) {
      consecutiveNeeded = Math.max(0, Math.ceil((target * total - 100 * effective) / (100 - target)));
    } else {
      safeToBunk = Math.max(0, Math.floor((100 * effective - target * total) / target));
    }

    let status = "green";
    if (isBelow) status = "red";
    else if (safeToBunk <= 2) status = "amber";

    return { pct: pct.toFixed(1), isBelow, consecutiveNeeded, safeToBunk, status, effective };
  };

  // Add / Delete / Edit Subject Handlers
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    const newSub = {
      id: "sub-" + Date.now(),
      name: newSubjectName.trim(),
      attended: parseInt(newSubjectAttended) || 0,
      total: Math.max(1, parseInt(newSubjectTotal) || 1),
      target: parseInt(newSubjectTarget) || 75,
      medical: parseInt(newSubjectMedical) || 0,
      weeklyClasses: Math.max(1, parseInt(newSubjectWeekly) || 3),
    };
    setSubjects([...subjects, newSub]);
    setNewSubjectName("");
    setNewSubjectAttended(20);
    setNewSubjectTotal(25);
    setNewSubjectMedical(0);
    setShowAddSubjectForm(false);
  };

  const handleDeleteSubject = (id) => setSubjects(subjects.filter((s) => s.id !== id));

  const handleUpdateSubject = (id, field, value) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const toggleHoliday = (date) => {
    setSelectedHolidays((prev) => prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]);
  };

  const toggleOffDay = (day) => {
    setOffDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const toggleAllHolidays = (category) => {
    const categoryHolidays = HOLIDAYS.filter((h) => h.category === category).map((h) => h.date);
    const allSelected = categoryHolidays.every((d) => selectedHolidays.includes(d));
    if (allSelected) {
      setSelectedHolidays((prev) => prev.filter((d) => !categoryHolidays.includes(d)));
    } else {
      setSelectedHolidays((prev) => [...new Set([...prev, ...categoryHolidays])]);
    }
  };

  const getStatusColor = (daysCanMiss, percentage) => {
    if (percentage <= 75) {
      if (daysCanMiss >= 25) return "green";
      if (daysCanMiss >= 12) return "amber";
      return "red";
    } else if (percentage <= 85) {
      if (daysCanMiss >= 15) return "green";
      if (daysCanMiss >= 7) return "amber";
      return "red";
    } else {
      if (daysCanMiss >= 10) return "green";
      if (daysCanMiss >= 5) return "amber";
      return "red";
    }
  };

  const statusColor = calculations ? getStatusColor(calculations.daysCanMiss, attendancePercentage) : null;
  const statusLabels = {
    green: { label: "Good", description: "Plenty of leave room" },
    amber: { label: "Caution", description: "Limited leave buffer" },
    red: { label: "Critical", description: "Very little room for leaves" },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold mb-3">
            <span>✨ Academic Attendance Intelligence</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
            Attendance Calculator
          </h1>
          <p className="text-slate-600 max-w-2xl text-sm sm:text-base">
            Plan your college semester attendance strategically. Upload timetables (PDF, DOC, CSV), predict bunk buffers, and track custom subjects in real-time.
          </p>
        </div>

        {/* Segmented Liquid Tab Switcher */}
        <div className="relative bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-md flex items-center mb-8 shadow-inner">
          <div
            className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04),_inset_0_1px_1px_rgba(255,255,255,0.9)] border border-slate-100/50 transition-all duration-300 z-0"
            style={{
              left: activeTab === "semester" ? "6px" : activeTab === "live" ? "calc(33.333% + 2px)" : "calc(66.666% - 2px)",
              width: "calc(33.333% - 6px)",
              transitionTimingFunction: "cubic-bezier(0.34, 1.2, 0.64, 1)",
            }}
          />

          {[
            { key: "semester", label: "Semester Planner", shortLabel: "Planner", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
            { key: "live", label: "Catch-Up & Bunk Predictor", shortLabel: "Predictor", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
            { key: "subjects", label: "Subject-Wise & Timetable", shortLabel: "Subjects", icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 select-none relative z-10 transition-colors duration-300 ${
                activeTab === tab.key ? "text-orange-600 font-extrabold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={activeTab === tab.key ? 2.5 : 2} stroke="currentColor" className="w-4 h-4 transition-transform duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* University Presets Quick Bar */}
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>University Target Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { pct: 75, label: "75% (Standard AICTE / AKTU)" },
              { pct: 85, label: "85% (Strict VTU / Anna)" },
              { pct: 67, label: "67% (Relaxed DU / Central)" },
            ].map((preset) => (
              <button
                key={preset.pct}
                onClick={() => { setAttendancePercentage(preset.pct); setLiveTarget(preset.pct); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  attendancePercentage === preset.pct && liveTarget === preset.pct
                    ? "bg-orange-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============== TAB 1: SEMESTER PLANNER ============== */}
        {activeTab === "semester" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {/* Date Inputs */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Dates & Daily Schedule</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 block mb-2">Starting Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900 block mb-2">Ending Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900 block mb-2">Classes Per Day</label>
                    <input type="number" min="1" max="12" value={classesPerDay} onChange={(e) => setClassesPerDay(parseInt(e.target.value) || 1)} className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                    <p className="text-xs text-slate-500 mt-1">Typically 4-6 lectures/day</p>
                  </div>
                </div>
              </div>

              {/* Attendance Target Slider */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-md border border-orange-100 p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Attendance Target</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-slate-900">Percentage Needed</label>
                      <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-1.5 rounded-lg shadow-sm">{attendancePercentage}%</span>
                    </div>
                    <input type="range" min="50" max="99" value={attendancePercentage} onChange={(e) => setAttendancePercentage(parseInt(e.target.value))} className="premium-slider w-full" />
                    <div className="flex justify-between text-xs text-slate-600 mt-2 font-medium">
                      <span>50%</span><span>75%</span><span>99%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-orange-200">
                    {[75, 80, 85].map((p) => (
                      <button key={p} onClick={() => setAttendancePercentage(p)} className={`py-2 px-3 rounded-lg font-semibold text-xs transition ${attendancePercentage === p ? "bg-orange-600 text-white" : "bg-white border border-orange-300 text-slate-900 hover:bg-orange-50"}`}>
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Medical Leave */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-slate-900">Medical / OD Days</h2>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">Condonation</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">Medical certificates or Official Duty (OD) credits allowed by college.</p>
                <input type="number" min="0" max="30" value={medicalLeaveDays} onChange={(e) => setMedicalLeaveDays(Math.max(0, parseInt(e.target.value) || 0))} className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                <p className="text-xs text-slate-500 mt-1">Adds +{medicalLeaveDays * classesPerDay} lecture credits to target</p>
              </div>

              {/* Off Days */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Off Days</h2>
                <div className="space-y-3">
                  {["saturday", "sunday"].map((day) => (
                    <label key={day} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={offDays.includes(day)} onChange={() => toggleOffDay(day)} className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500" />
                      <span className="text-sm text-slate-700 capitalize">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Holidays */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Holidays Calendar</h2>
                <div className="space-y-4">
                  {["indian", "general"].map((category) => (
                    <div key={category} className={category === "general" ? "pt-4 border-t border-slate-200" : ""}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-900 text-sm capitalize">{category === "indian" ? "Indian Festivals" : "General Holidays"}</h3>
                        <button onClick={() => toggleAllHolidays(category)} className="text-xs font-semibold text-orange-600 hover:text-orange-800">
                          {HOLIDAYS.filter((h) => h.category === category).every((h) => selectedHolidays.includes(h.date)) ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {HOLIDAYS.filter((h) => h.category === category).map((holiday) => (
                          <label key={holiday.date} className="flex items-center gap-2 cursor-pointer text-xs">
                            <input type="checkbox" checked={selectedHolidays.includes(holiday.date)} onChange={() => toggleHoliday(holiday.date)} className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500" />
                            <span className="text-slate-700">{holiday.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results Dashboard */}
              {calculations && !calculations.error ? (
                <div className="space-y-4">
                  <div className={`rounded-2xl shadow-md border-2 p-6 transition-all ${statusColor === "green" ? "bg-emerald-50 border-emerald-300" : statusColor === "amber" ? "bg-amber-50 border-amber-300" : "bg-rose-50 border-rose-300"}`}>
                    <div className="text-center">
                      <p className={`text-base font-bold mb-2 px-3 py-1 rounded-full inline-block ${statusColor === "green" ? "text-emerald-900 bg-emerald-100" : statusColor === "amber" ? "text-amber-900 bg-amber-100" : "text-rose-900 bg-rose-100"}`}>
                        {statusLabels[statusColor].label} Status
                      </p>
                      <p className={`text-sm font-medium ${statusColor === "green" ? "text-emerald-700" : statusColor === "amber" ? "text-amber-700" : "text-rose-700"}`}>
                        {statusLabels[statusColor].description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                      <p className="text-3xl font-bold text-slate-900">{calculations.workingDays}</p>
                      <p className="text-xs text-slate-600 mt-1">Working Days</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                      <p className="text-3xl font-bold text-slate-900">{calculations.totalClassesPossible}</p>
                      <p className="text-xs text-slate-600 mt-1">Total Classes</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 text-center">
                      <p className="text-3xl font-bold text-orange-900">{calculations.classesNeededForSelectedPercentage}</p>
                      <p className="text-xs text-orange-700 mt-1">Needed ({attendancePercentage}%)</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
                      <p className="text-3xl font-bold text-emerald-900">{calculations.classesCanMiss}</p>
                      <p className="text-xs text-emerald-700 mt-1">Can Miss (Lectures)</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-emerald-50 rounded-2xl border-2 border-orange-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Leave Allowance Breakdown</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Full Days Safe to Skip</p>
                        <p className="text-4xl font-black text-emerald-600">{calculations.daysCanMiss}</p>
                        <p className="text-xs text-slate-500 mt-2">Equivalent to {calculations.classesCanMiss} lectures</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Target Requirement</p>
                        <p className="text-4xl font-black text-orange-600">{attendancePercentage}%</p>
                        <p className="text-xs text-slate-500 mt-2">({calculations.attendance}% max possible)</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setVacationPlannerOpen(!vacationPlannerOpen)} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-between transition-all shadow-md hover:shadow-lg text-sm">
                    <div className="flex items-center gap-2">
                      <span>Plan Extended Vacation / Trip</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Simulator</span>
                    </div>
                    <svg className={`w-5 h-5 transition-transform ${vacationPlannerOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>

                  {vacationPlannerOpen && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-900 block mb-2">Days Planned Off</label>
                          <input type="number" min="0" max={calculations.daysCanMiss + 10} value={vacationDaysWanted} onChange={(e) => setVacationDaysWanted(Math.max(0, parseInt(e.target.value) || 0))} className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-900 block mb-2">Period / Event</label>
                          <input type="text" placeholder="e.g. College Fest / Trip" value={vacationMonth} onChange={(e) => setVacationMonth(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                        </div>
                      </div>
                      <div className="pt-2">
                        {calculations.canTakeFullVacation ? (
                          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-xs">
                            <p className="text-emerald-900 font-bold mb-2 text-sm">✅ Vacation Approved ({vacationDaysWanted} Days)</p>
                            <p className="text-emerald-800">You will miss {calculations.classesLostToVacation} lectures. Your attendance will remain safely above target!</p>
                          </div>
                        ) : (
                          <div className="bg-rose-50 rounded-xl p-4 border border-rose-200 text-xs">
                            <p className="text-rose-900 font-bold mb-1 text-sm">⚠️ Warning: Exceeds Safe Limit</p>
                            <p className="text-rose-800">You can only skip {calculations.daysCanMiss} days. Taking {vacationDaysWanted} days will push attendance below {attendancePercentage}%.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : calculations?.error ? (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 text-center">
                  <p className="text-rose-900 font-semibold text-sm">{calculations.error}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ============== TAB 2: CATCH-UP & BUNK PREDICTOR ============== */}
        {activeTab === "live" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-5">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">Current Attendance Status</h2>
                <div>
                  <label className="text-xs font-semibold text-slate-900 block mb-1">Attended Classes So Far</label>
                  <input type="number" min="0" max={liveTotal} value={liveAttended} onChange={(e) => setLiveAttended(Math.max(0, parseInt(e.target.value) || 0))} className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-base" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-900 block mb-1">Total Classes Held So Far</label>
                  <input type="number" min="1" value={liveTotal} onChange={(e) => setLiveTotal(Math.max(1, parseInt(e.target.value) || 1))} className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-base" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-900 block mb-1">Medical / Duty Leave (OD) Classes</label>
                  <input type="number" min="0" value={liveMedicalCount} onChange={(e) => setLiveMedicalCount(Math.max(0, parseInt(e.target.value) || 0))} className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                  <p className="text-xs text-slate-500 mt-1">Official duty or medical certificates approved</p>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-900">Target Percentage</label>
                    <span className="text-sm font-bold text-orange-600">{liveTarget}%</span>
                  </div>
                  <input type="range" min="50" max="95" value={liveTarget} onChange={(e) => setLiveTarget(parseInt(e.target.value))} className="premium-slider w-full" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Live Percentage</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black text-slate-900">{liveMetrics.currentPct}%</span>
                      <span className="text-xs text-slate-500">({liveMetrics.effectiveAttended} / {liveMetrics.total} classes)</span>
                    </div>
                  </div>
                  <div>
                    {liveMetrics.isBelowTarget ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-100 text-rose-800 font-bold text-sm">⚠️ Below Target ({liveMetrics.targetPct}%)</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">🎉 Safe Zone (≥ {liveMetrics.targetPct}%)</span>
                    )}
                  </div>
                </div>
              </div>

              {liveMetrics.isBelowTarget ? (
                <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl border-2 border-rose-200 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-xl">🚨</div>
                    <div>
                      <h3 className="text-lg font-bold text-rose-950">Catch-Up Recovery Plan</h3>
                      <p className="text-xs text-rose-700">Required continuous attendance to hit {liveMetrics.targetPct}%</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-rose-200 text-center">
                    <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide">Must Attend Continuously</p>
                    <p className="text-5xl font-black text-rose-600 my-1">{liveMetrics.classesToAttendNeeded}</p>
                    <p className="text-xs text-slate-600 font-medium">upcoming lectures without missing a single class!</p>
                  </div>
                  <div className="text-xs text-slate-600 bg-white/70 rounded-lg p-3 border border-rose-100">
                    💡 <strong>Calculation:</strong> Attending {liveMetrics.classesToAttendNeeded} consecutive lectures will bring your total to <strong>{liveMetrics.effectiveAttended + liveMetrics.classesToAttendNeeded} / {liveMetrics.total + liveMetrics.classesToAttendNeeded}</strong> classes.
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl">😎</div>
                    <div>
                      <h3 className="text-lg font-bold text-emerald-950">Bunk Margin Buffer</h3>
                      <p className="text-xs text-emerald-700">You are above target attendance</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-emerald-200 text-center">
                    <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide">Safe to Bunk (Skip)</p>
                    <p className="text-5xl font-black text-emerald-600 my-1">{liveMetrics.classesCanBunkAllowed}</p>
                    <p className="text-xs text-slate-600 font-medium">consecutive upcoming lectures and still stay above {liveMetrics.targetPct}%!</p>
                  </div>
                  <div className="text-xs text-slate-600 bg-white/70 rounded-lg p-3 border border-emerald-100">
                    💡 <strong>Calculation:</strong> If you bunk {liveMetrics.classesCanBunkAllowed} upcoming lectures, your attendance will be <strong>{liveMetrics.effectiveAttended} / {liveMetrics.total + liveMetrics.classesCanBunkAllowed}</strong> = <strong>{(((liveMetrics.effectiveAttended) / (liveMetrics.total + liveMetrics.classesCanBunkAllowed)) * 100).toFixed(1)}%</strong>.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============== TAB 3: SUBJECT-WISE & TIMETABLE MANAGER ============== */}
        {activeTab === "subjects" && (
          <div className="space-y-6">
            {/* Header Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Subject-Wise & Timetable Intelligence</h2>
                  <p className="text-xs text-slate-500">Upload timetable documents (PDF, DOCX, CSV) or load pre-built branch schedules.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowAutoEstimateBar(!showAutoEstimateBar)}
                    className="bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>⚡ Auto-Estimate from Dates</span>
                  </button>
                  <button onClick={() => setShowTimetableUploadSection(!showTimetableUploadSection)} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span>Upload Timetable</span>
                  </button>
                  <button onClick={() => setShowAddSubjectForm(!showAddSubjectForm)} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span>Add Subject</span>
                  </button>
                </div>
              </div>

              {/* Smart Date-Based Auto-Estimator Wizard Card (Option 1) */}
              {showAutoEstimateBar && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Smart Class & Attendance Estimator</h3>
                        <p className="text-[11px] text-slate-600">Don't know exact counts? Let the system calculate classes held since semester start.</p>
                      </div>
                    </div>
                    <button onClick={() => setShowAutoEstimateBar(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Semester Start Date</label>
                      <input
                        type="date"
                        value={estimateStartDate}
                        onChange={(e) => setEstimateStartDate(e.target.value)}
                        className="w-full border border-orange-300 rounded-lg p-2 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Today / Calculation Date</label>
                      <input
                        type="date"
                        value={estimateCalculationDate}
                        onChange={(e) => setEstimateCalculationDate(e.target.value)}
                        className="w-full border border-orange-300 rounded-lg p-2 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-700">Estimated Attendance</label>
                        <span className="text-xs font-bold text-orange-700">{estimateAttendancePct}%</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="98"
                        value={estimateAttendancePct}
                        onChange={(e) => setEstimateAttendancePct(parseInt(e.target.value))}
                        className="premium-slider w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-orange-200/60">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <span>Quick Target:</span>
                      {[85, 75, 65].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setEstimateAttendancePct(pct)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            estimateAttendancePct === pct
                              ? "bg-orange-600 text-white"
                              : "bg-white text-slate-700 border border-orange-200"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleAutoEstimateClasses}
                      className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition"
                    >
                      <span>⚡ Auto-Fill All Subjects</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Preset Branch Timetables */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">⚡ 1-Click Ready Branch Timetables:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "cse", label: "B.Tech CS / IT" },
                    { key: "ece", label: "B.Tech ECE / EE" },
                    { key: "science", label: "B.Sc Science" },
                    { key: "bba", label: "BBA / Commerce" },
                  ].map((preset) => (
                    <button key={preset.key} onClick={() => handleLoadPreset(preset.key)} className="px-3 py-1 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition">
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Alert */}
              {uploadStatusMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-center justify-between ${
                  uploadStatusType === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-900" :
                  uploadStatusType === "error" ? "bg-rose-50 border border-rose-200 text-rose-900" :
                  "bg-blue-50 border border-blue-200 text-blue-900"
                }`}>
                  <span>{uploadStatusType === "success" ? "✅" : uploadStatusType === "error" ? "❌" : "ℹ️"} {uploadStatusMessage}</span>
                  <button onClick={() => setUploadStatusMessage("")} className="font-bold px-1 hover:opacity-70">×</button>
                </div>
              )}
            </div>

            {/* ====== TIMETABLE UPLOAD SECTION ====== */}
            {showTimetableUploadSection && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <h3 className="font-bold text-sm text-orange-400 flex items-center gap-2">📄 Timetable Document Upload & Subject Import</h3>
                  <button onClick={() => setShowTimetableUploadSection(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
                </div>

                {/* 3-Method Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Method 1: File Upload */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Method 1: Upload File</p>
                    <div
                      onClick={() => !isProcessingFile && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 min-h-[120px] ${
                        isProcessingFile ? "border-orange-500 bg-orange-900/20" : "border-slate-700 hover:border-orange-500 bg-slate-800/50 hover:bg-slate-800"
                      }`}
                    >
                      {isProcessingFile ? (
                        <>
                          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs text-orange-300">Parsing on server...</p>
                        </>
                      ) : (
                        <>
                          <svg className="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xs font-semibold text-slate-200">
                            {uploadedFileName ? `Uploaded: ${uploadedFileName}` : "Drop PDF, DOCX, CSV, or TXT"}
                          </p>
                          <p className="text-[10px] text-slate-400">Parsed on server with pdf-parse</p>
                        </>
                      )}
                      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.csv,.json,.ics" onChange={handleFileUpload} className="hidden" />
                    </div>
                  </div>

                  {/* Method 2: Quick Bulk Paste */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Method 2: Quick Paste</p>
                    <textarea
                      rows={4}
                      value={quickBulkInputText}
                      onChange={(e) => setQuickBulkInputText(e.target.value)}
                      placeholder={`Data Structures\nOperating Systems\nDBMS\nComputer Networks\nMaths`}
                      className="w-full border border-slate-700 rounded-xl p-2.5 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono min-h-[120px]"
                    />
                    <button onClick={handleBulkAddText} disabled={!quickBulkInputText.trim()} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold text-xs py-2 rounded-lg transition shadow-sm">
                      + Add All Subjects
                    </button>
                  </div>

                  {/* Method 3: Copy from ERP Guide */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Method 3: From College ERP</p>
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3 min-h-[120px]">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">🎓</span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">Copy from your college portal</p>
                          <p className="text-[10px] text-slate-400 mt-1">Works with all university ERPs</p>
                        </div>
                      </div>
                      <button onClick={() => setShowERPGuide(!showERPGuide)} className="w-full text-xs text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2">
                        {showERPGuide ? "Hide Guide ▲" : "Show Step-by-Step Guide ▼"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ERP Copy Guide */}
                {showERPGuide && (
                  <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 space-y-3 animate-in fade-in">
                    <h4 className="text-sm font-bold text-blue-400">📋 How to copy subjects from your college ERP / portal:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { step: "1", title: "Login to your ERP", desc: "Go to your college portal (e.g., AKTU OneView, VTU Results, DU Portal, etc.)" },
                        { step: "2", title: "Find Attendance Section", desc: "Navigate to Attendance → Subject-wise Attendance or Timetable section" },
                        { step: "3", title: "Select & Copy", desc: "Select all subject names with Ctrl+A or manually select, then Ctrl+C to copy" },
                        { step: "4", title: "Paste Here", desc: "Come back here, paste in the 'Quick Paste' box (Method 2), and click 'Add All Subjects'" },
                      ].map((item) => (
                        <div key={item.step} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{item.step}</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Extracted Text Preview */}
                {rawExtractedText && (
                  <div className="pt-3 border-t border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">📝 Extracted Document Text (editable):</span>
                      <span className="text-[10px] text-slate-500">{rawExtractedText.length} chars</span>
                    </div>
                    <textarea
                      rows={4}
                      value={rawExtractedText}
                      onChange={(e) => setRawExtractedText(e.target.value)}
                      className="w-full border border-slate-700 rounded-xl p-2.5 bg-slate-950 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                )}

                {/* Parsed Preview Subjects */}
                {parsedPreviewSubjects.length > 0 && (
                  <div className="pt-3 border-t border-slate-700/60 space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400">
                          {isAiParsed ? "✨ AI-Extracted Clean Subjects" : "✅ Candidate Subjects Found"} ({parsedPreviewSubjects.length})
                        </span>
                        {isAiParsed && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                            AI Cleaned
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {parsedWeeklySchedule && (
                          <button
                            onClick={() => handleAddPreviewSubjectsToMain(true)}
                            className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition"
                          >
                            <span>⚡ Add & Apply Weekly Schedule</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleAddPreviewSubjectsToMain(false)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition"
                        >
                          Add Subjects
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {parsedPreviewSubjects.map((ps) => (
                        <div
                          key={ps.id}
                          className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-xs text-slate-200"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                ps.source === "ai"
                                  ? "bg-orange-400 animate-pulse"
                                  : ps.source === "code"
                                  ? "bg-blue-400"
                                  : "bg-emerald-400"
                              }`}
                            />
                            <span className="font-semibold truncate">{ps.name}</span>
                            {ps.code && (
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                                {ps.code}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-slate-400">{ps.weeklyClasses} lec/wk</span>
                            <button
                              onClick={() => handleRemoveFromPreview(ps.id)}
                              className="text-slate-500 hover:text-rose-400 font-bold ml-1"
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add Subject Form */}
            {showAddSubjectForm && (
              <form onSubmit={handleAddSubject} className="bg-orange-50/70 border-2 border-orange-200 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="font-bold text-slate-900 text-sm">Add New Subject</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="lg:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Subject Name</label>
                    <input type="text" placeholder="e.g. Operating Systems" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} required className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Attended</label>
                    <input type="number" min="0" value={newSubjectAttended} onChange={(e) => setNewSubjectAttended(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Total Held</label>
                    <input type="number" min="1" value={newSubjectTotal} onChange={(e) => setNewSubjectTotal(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Target %</label>
                    <input type="number" min="50" max="99" value={newSubjectTarget} onChange={(e) => setNewSubjectTarget(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddSubjectForm(false)} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-100">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700">Save Subject</button>
                </div>
              </form>
            )}

            {/* Weekly Schedule Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">📅 Weekly Timetable Schedule Grid</h3>
                <span className="text-xs text-slate-500">Assign subjects to days</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DAYS_OF_WEEK.map((day) => {
                  const daySlots = weeklySchedule[day] || [];
                  return (
                    <div key={day} className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="font-bold text-slate-900">{day}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">{daySlots.length} lectures</span>
                      </div>
                      <div className="space-y-1.5 min-h-[48px]">
                        {daySlots.map((slotSubject, idx) => (
                          <div key={idx} className="bg-white border border-slate-200 p-1.5 rounded-lg flex items-center justify-between font-medium text-slate-800 shadow-2xs">
                            <span className="truncate pr-1">{slotSubject}</span>
                            <button onClick={() => handleRemoveSlotFromDay(day, idx)} className="text-slate-400 hover:text-rose-600 font-bold px-1" title="Remove slot">×</button>
                          </div>
                        ))}
                        {daySlots.length === 0 && <p className="text-[11px] text-slate-400 italic text-center py-2">No classes scheduled</p>}
                      </div>
                      <select
                        onChange={(e) => { if (e.target.value) { handleAddSlotToDay(day, e.target.value); e.target.value = ""; } }}
                        className="w-full bg-white border border-slate-200 rounded p-1 text-[11px] text-slate-600 focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="">+ Add subject slot...</option>
                        {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subject Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((sub) => {
                const subMeta = getSubjectStatus(sub);
                return (
                  <div key={sub.id} className={`rounded-2xl border-2 p-5 bg-white transition-all shadow-sm ${subMeta.status === "green" ? "border-emerald-200 hover:border-emerald-400" : subMeta.status === "amber" ? "border-amber-200 hover:border-amber-400" : "border-rose-200 hover:border-rose-400"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{sub.name}</h3>
                        <p className="text-xs text-slate-500">Target: <span className="font-bold">{sub.target}%</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-extrabold ${subMeta.status === "green" ? "bg-emerald-100 text-emerald-800" : subMeta.status === "amber" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                          {subMeta.pct}%
                        </span>
                        <button onClick={() => handleDeleteSubject(sub.id)} className="text-slate-400 hover:text-rose-600 transition p-1" title="Delete Subject">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs mb-3">
                      <div>
                        <span className="text-slate-500 block mb-1">Attended</span>
                        <input type="number" min="0" value={sub.attended} onChange={(e) => handleUpdateSubject(sub.id, "attended", Math.max(0, parseInt(e.target.value) || 0))} className="w-full border border-slate-300 rounded p-1 bg-white font-semibold" />
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Total Held</span>
                        <input type="number" min="1" value={sub.total} onChange={(e) => handleUpdateSubject(sub.id, "total", Math.max(1, parseInt(e.target.value) || 1))} className="w-full border border-slate-300 rounded p-1 bg-white font-semibold" />
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">OD/Medical</span>
                        <input type="number" min="0" value={sub.medical || 0} onChange={(e) => handleUpdateSubject(sub.id, "medical", Math.max(0, parseInt(e.target.value) || 0))} className="w-full border border-slate-300 rounded p-1 bg-white font-semibold" />
                      </div>
                    </div>

                    {/* Quick Preset Chips for When Counts are Unknown */}
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-3 pt-1 border-t border-slate-100 text-[10px]">
                      <span className="text-slate-600 font-medium">Quick Estimate:</span>
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => handleQuickSetSubjectPct(sub.id, 85)}
                          className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold border border-emerald-200 transition"
                          title="Auto-set 85% attendance"
                        >
                          85%
                        </button>
                        <button
                          onClick={() => handleQuickSetSubjectPct(sub.id, 75)}
                          className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold border border-amber-200 transition"
                          title="Auto-set 75% attendance"
                        >
                          75%
                        </button>
                        <button
                          onClick={() => handleQuickSetSubjectPct(sub.id, 60)}
                          className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 hover:bg-rose-100 font-semibold border border-rose-200 transition"
                          title="Auto-set 60% attendance"
                        >
                          60%
                        </button>
                        <button
                          onClick={() => {
                            handleUpdateSubject(sub.id, "attended", 0);
                            handleUpdateSubject(sub.id, "total", 0);
                          }}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold border border-slate-200 transition"
                          title="Fresh semester (0 classes held)"
                        >
                          0/0 (Fresh)
                        </button>
                      </div>
                    </div>

                    {subMeta.isBelow ? (
                      <div className="bg-rose-50 text-rose-800 p-2.5 rounded-xl text-xs font-medium border border-rose-100 flex items-center justify-between">
                        <span>🚨 Must attend continuously:</span>
                        <span className="font-extrabold text-sm">{subMeta.consecutiveNeeded} classes</span>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs font-medium border border-emerald-100 flex items-center justify-between">
                        <span>😎 Safe to bunk:</span>
                        <span className="font-extrabold text-sm">{subMeta.safeToBunk} classes</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <p className="text-xs sm:text-sm text-orange-900">
            <strong>Tip:</strong> Your attendance data, uploaded timetables, and custom subjects are automatically saved locally on your browser. Easily switch between Semester Planner, Catch-Up Predictor, and Subject-Wise Manager to keep your attendance stress-free!
          </p>
        </div>
      </div>

      <style jsx>{`
        .premium-slider {
          width: 100%;
          height: 10px;
          border-radius: 10px;
          background: linear-gradient(90deg, #ea580c 0%, #fb923c 50%, #fed7aa 100%);
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
        }
        .premium-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 10px;
          border-radius: 10px;
          background: linear-gradient(90deg, #ea580c 0%, #fb923c 50%, #fed7aa 100%);
          box-shadow: 0 0 20px rgba(234, 88, 12, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.15);
        }
        .premium-slider::-webkit-slider-thumb {
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.15), 0 8px 16px rgba(234, 88, 12, 0.35), inset -1px -1px 2px rgba(0, 0, 0, 0.15), inset 1px 1px 2px rgba(255, 255, 255, 0.3);
          border: 2px solid white;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          margin-top: -9px;
        }
        .premium-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 0 6px rgba(234, 88, 12, 0.2), 0 12px 24px rgba(234, 88, 12, 0.45);
        }
        .premium-slider::-moz-range-track {
          background: linear-gradient(90deg, #ea580c 0%, #fb923c 50%, #fed7aa 100%);
          border-radius: 10px;
          border: none;
          height: 10px;
        }
        .premium-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.15), 0 8px 16px rgba(234, 88, 12, 0.35);
          border: 2px solid white;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInFromTop { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.3s ease-in-out; }
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        .slide-in-from-top-2 { animation: slideInFromTop 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}

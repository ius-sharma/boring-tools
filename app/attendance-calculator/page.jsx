"use client";

import { useState, useMemo } from "react";

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

export default function AttendanceCalculator() {
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-07-30");
  const [classesPerDay, setClassesPerDay] = useState(4);
  const [offDays, setOffDays] = useState(["saturday", "sunday"]);
  const [selectedHolidays, setSelectedHolidays] = useState(
    HOLIDAYS.filter((h) => h.category === "indian").map((h) => h.date)
  );
  const [attendancePercentage, setAttendancePercentage] = useState(75);
  const [vacationDaysWanted, setVacationDaysWanted] = useState(5);
  const [vacationMonth, setVacationMonth] = useState("July");
  const [vacationPlannerOpen, setVacationPlannerOpen] = useState(false);

  // Calculate attendance metrics
  const calculations = useMemo(() => {
    if (!startDate || !endDate || classesPerDay <= 0) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return { error: "End date must be after start date" };
    }

    // Calculate total days
    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Count weekends
    let weekendDays = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const isWeekend =
        (dayOfWeek === 6 && offDays.includes("saturday")) ||
        (dayOfWeek === 0 && offDays.includes("sunday"));

      if (isWeekend) {
        weekendDays++;
      }
    }

    // Count holiday days (only selected ones)
    let holidayDays = 0;
    selectedHolidays.forEach((holidayDate) => {
      const hDate = new Date(holidayDate);
      if (hDate >= start && hDate <= end) {
        // Check if it's already a weekend
        const dayOfWeek = hDate.getDay();
        const isWeekend =
          (dayOfWeek === 6 && offDays.includes("saturday")) ||
          (dayOfWeek === 0 && offDays.includes("sunday"));

        if (!isWeekend) {
          holidayDays++;
        }
      }
    });

    const workingDays = totalDays - weekendDays - holidayDays;
    const totalClassesPossible = workingDays * classesPerDay;

    // Calculate for selected attendance percentage
    const classesNeededForSelectedPercentage = Math.ceil(
      totalClassesPossible * (attendancePercentage / 100)
    );
    const classesCanMiss = totalClassesPossible - classesNeededForSelectedPercentage;
    const daysCanMiss = Math.floor(classesCanMiss / classesPerDay);

    // Also calculate for common percentages for comparison
    const classesFor75 = Math.ceil(totalClassesPossible * 0.75);
    const classesFor80 = Math.ceil(totalClassesPossible * 0.80);
    const classesFor90 = Math.ceil(totalClassesPossible * 0.90);

    return {
      totalDays,
      weekendDays,
      holidayDays,
      workingDays,
      totalClassesPossible,
      classesNeededForSelectedPercentage,
      classesCanMiss,
      daysCanMiss,
      attendance: (
        ((totalClassesPossible - classesCanMiss) / totalClassesPossible) *
        100
      ).toFixed(1),
      classesFor75,
      classesFor80,
      classesFor90,
      // Vacation Planner
      classesLostToVacation: vacationDaysWanted * classesPerDay,
      availableClassesAfterVacation: (workingDays * classesPerDay) - (vacationDaysWanted * classesPerDay),
      classesNeededFor75AfterVacation: Math.ceil(((workingDays * classesPerDay) - (vacationDaysWanted * classesPerDay)) * 0.75),
      classesNeededFor80AfterVacation: Math.ceil(((workingDays * classesPerDay) - (vacationDaysWanted * classesPerDay)) * 0.80),
      classesNeededFor90AfterVacation: Math.ceil(((workingDays * classesPerDay) - (vacationDaysWanted * classesPerDay)) * 0.90),
      canTakeFullVacation: (vacationDaysWanted * classesPerDay) <= classesCanMiss,
    };
  }, [startDate, endDate, classesPerDay, offDays, selectedHolidays, attendancePercentage, vacationDaysWanted]);

  const toggleHoliday = (date) => {
    setSelectedHolidays((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const toggleOffDay = (day) => {
    setOffDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleAllHolidays = (category) => {
    const categoryHolidays = HOLIDAYS.filter((h) => h.category === category).map(
      (h) => h.date
    );
    const allSelected = categoryHolidays.every((d) => selectedHolidays.includes(d));

    if (allSelected) {
      setSelectedHolidays((prev) =>
        prev.filter((d) => !categoryHolidays.includes(d))
      );
    } else {
      setSelectedHolidays((prev) => [
        ...new Set([...prev, ...categoryHolidays]),
      ]);
    }
  };

  const getStatusColor = (daysCanMiss, percentage) => {
    // Higher percentage = stricter = more risky
    if (percentage <= 75) {
      // For 75% and below, more lenient
      if (daysCanMiss >= 25) return "green";
      if (daysCanMiss >= 12) return "amber";
      return "red";
    } else if (percentage <= 85) {
      // For 75-85%, medium
      if (daysCanMiss >= 15) return "green";
      if (daysCanMiss >= 7) return "amber";
      return "red";
    } else {
      // For 85%+, strict
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
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
            Attendance Calculator
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Plan your college semester attendance strategically. Calculate how many classes you can skip while maintaining your target percentage.
          </p>
        </div>

        {/* Main Content - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Inputs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Date Inputs */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Dates</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-900 block mb-2">
                    Starting Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 block mb-2">
                    Ending Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 block mb-2">
                    Classes Per Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={classesPerDay}
                    onChange={(e) => setClassesPerDay(parseInt(e.target.value) || 1)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Typically 4-5 for colleges</p>
                </div>
              </div>
            </div>

            {/* Attendance Percentage Slider */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-md border border-orange-100 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Attendance Target</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-900">
                      Percentage Needed
                    </label>
                    <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2 rounded-lg">
                      {attendancePercentage}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={attendancePercentage}
                    onChange={(e) => setAttendancePercentage(parseInt(e.target.value))}
                    className="premium-slider w-full"
                  />

                  <div className="flex justify-between text-xs text-slate-600 mt-2">
                    <span>50%</span>
                    <span>75%</span>
                    <span>99%</span>
                  </div>
                </div>

                {/* Quick Select Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-orange-200">
                  <button
                    onClick={() => setAttendancePercentage(75)}
                    className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
                      attendancePercentage === 75
                        ? "bg-orange-600 text-white"
                        : "bg-white border border-orange-300 text-slate-900 hover:bg-orange-50"
                    }`}
                  >
                    75%
                  </button>
                  <button
                    onClick={() => setAttendancePercentage(80)}
                    className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
                      attendancePercentage === 80
                        ? "bg-orange-600 text-white"
                        : "bg-white border border-orange-300 text-slate-900 hover:bg-orange-50"
                    }`}
                  >
                    80%
                  </button>
                  <button
                    onClick={() => setAttendancePercentage(85)}
                    className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
                      attendancePercentage === 85
                        ? "bg-orange-600 text-white"
                        : "bg-white border border-orange-300 text-slate-900 hover:bg-orange-50"
                    }`}
                  >
                    85%
                  </button>
                </div>
              </div>
            </div>

            {/* Off Days Selection */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Off Days</h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offDays.includes("saturday")}
                    onChange={() => toggleOffDay("saturday")}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-700">Saturday</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offDays.includes("sunday")}
                    onChange={() => toggleOffDay("sunday")}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-700">Sunday</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Side - Holidays & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Holidays Selection */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Holidays</h2>

              <div className="space-y-4">
                {/* Indian Festivals */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">Indian Festivals</h3>
                    <button
                      onClick={() => toggleAllHolidays("indian")}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {HOLIDAYS.filter((h) => h.category === "indian").every((h) =>
                        selectedHolidays.includes(h.date)
                      )
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {HOLIDAYS.filter((h) => h.category === "indian").map((holiday) => (
                      <label
                        key={holiday.date}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedHolidays.includes(holiday.date)}
                          onChange={() => toggleHoliday(holiday.date)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-slate-700">{holiday.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* General Holidays */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">General Holidays</h3>
                    <button
                      onClick={() => toggleAllHolidays("general")}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {HOLIDAYS.filter((h) => h.category === "general").every((h) =>
                        selectedHolidays.includes(h.date)
                      )
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {HOLIDAYS.filter((h) => h.category === "general").map((holiday) => (
                      <label
                        key={holiday.date}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedHolidays.includes(holiday.date)}
                          onChange={() => toggleHoliday(holiday.date)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-slate-700">{holiday.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Dashboard */}
            {calculations && !calculations.error ? (
              <div className="space-y-4">
                {/* Main Status Card */}
                <div
                  className={`rounded-2xl shadow-md border-2 p-6 ${
                    statusColor === "green"
                      ? "bg-emerald-50 border-emerald-300"
                      : statusColor === "amber"
                      ? "bg-amber-50 border-amber-300"
                      : "bg-rose-50 border-rose-300"
                  }`}
                >
                  <div className="text-center">
                    <p
                      className={`text-base font-bold mb-3 px-3 py-1 rounded-full inline-block ${
                        statusColor === "green"
                          ? "text-emerald-900 bg-emerald-100"
                          : statusColor === "amber"
                          ? "text-amber-900 bg-amber-100"
                          : "text-rose-900 bg-rose-100"
                      }`}
                    >
                      {statusLabels[statusColor].label}
                    </p>
                    <p
                      className={`text-sm ${
                        statusColor === "green"
                          ? "text-emerald-700"
                          : statusColor === "amber"
                          ? "text-amber-700"
                          : "text-rose-700"
                      }`}
                    >
                      {statusLabels[statusColor].description}
                    </p>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                    <p className="text-3xl font-bold text-slate-900">
                      {calculations.workingDays}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Working Days</p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                    <p className="text-3xl font-bold text-slate-900">
                      {calculations.totalClassesPossible}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Total Classes</p>
                  </div>

                  <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 text-center">
                    <p className="text-3xl font-bold text-orange-900">
                      {calculations.classesNeededForSelectedPercentage}
                    </p>
                    <p className="text-xs text-orange-700 mt-1">Needed ({attendancePercentage}%)</p>
                  </div>

                  <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-900">
                      {calculations.classesCanMiss}
                    </p>
                    <p className="text-xs text-emerald-700 mt-1">Can Miss</p>
                  </div>
                </div>

                {/* Leave Days Card */}
                <div className="bg-gradient-to-br from-orange-50 to-emerald-50 rounded-2xl border-2 border-orange-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Your Allowance
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-2">Days to Skip</p>
                      <p className="text-4xl font-black text-emerald-600">
                        {calculations.daysCanMiss}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {calculations.classesCanMiss} classes
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-2">Target</p>
                      <p className="text-4xl font-black text-orange-600">{attendancePercentage}%</p>
                      <p className="text-xs text-slate-500 mt-2">
                        ({calculations.attendance}% max)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vacation Planner Toggle Button */}
                <button
                  onClick={() => setVacationPlannerOpen(!vacationPlannerOpen)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-between transition-all shadow-md hover:shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <span>Plan Vacation</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Optional</span>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${vacationPlannerOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Vacation Planner Section - Collapsible */}
                {vacationPlannerOpen && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-900 block mb-2">
                            Days Wanted
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={calculations.daysCanMiss + 10}
                            value={vacationDaysWanted}
                            onChange={(e) => setVacationDaysWanted(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <p className="text-xs text-slate-500 mt-1">How many days</p>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-900 block mb-2">
                            Month/Period
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., July"
                            value={vacationMonth}
                            onChange={(e) => setVacationMonth(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <p className="text-xs text-slate-500 mt-1">When</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        {calculations.canTakeFullVacation ? (
                          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                            <p className="text-sm text-emerald-900 font-semibold mb-3">
                              You can take {vacationDaysWanted} days
                            </p>
                            <div className="space-y-2 text-sm text-emerald-800">
                              <div className="flex justify-between">
                                <span>Classes to miss:</span>
                                <span className="font-bold">{calculations.classesLostToVacation}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Classes left:</span>
                                <span className="font-bold">{calculations.availableClassesAfterVacation}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>For 75%:</span>
                                <span className="font-bold">{calculations.classesNeededFor75AfterVacation}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <p className="text-sm text-orange-900 font-semibold mb-2">
                              Too many days
                            </p>
                            <p className="text-xs text-orange-800">
                              You can only skip {calculations.daysCanMiss} days. Reduce by {vacationDaysWanted - calculations.daysCanMiss} days.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm font-semibold text-slate-900 mb-3">Impact after {vacationDaysWanted} days:</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 text-center">
                            <p className="text-xs text-slate-700 mb-1">75%</p>
                            <p className="text-lg font-bold text-orange-600">{calculations.classesNeededFor75AfterVacation}</p>
                            <p className="text-xs text-slate-500 mt-1">needed</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-center">
                            <p className="text-xs text-slate-700 mb-1">80%</p>
                            <p className="text-lg font-bold text-amber-600">{calculations.classesNeededFor80AfterVacation}</p>
                            <p className="text-xs text-slate-500 mt-1">needed</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-center">
                            <p className="text-xs text-slate-700 mb-1">90%</p>
                            <p className="text-lg font-bold text-amber-700">{calculations.classesNeededFor90AfterVacation}</p>
                            <p className="text-xs text-slate-500 mt-1">needed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">Total Days</span>
                      <span className="font-semibold text-slate-900">
                        {calculations.totalDays}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">Weekends</span>
                      <span className="font-semibold text-slate-900">
                        -{calculations.weekendDays}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">Holidays</span>
                      <span className="font-semibold text-slate-900">
                        -{calculations.holidayDays}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-sm font-semibold text-emerald-900">
                        Working Days
                      </span>
                      <span className="font-bold text-emerald-900">
                        {calculations.workingDays}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comparison - Different Percentages */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Comparison
                  </h3>

                  <div className="space-y-3">
                    <div className={`p-4 rounded-lg border-2 transition ${
                      attendancePercentage === 75
                        ? "bg-orange-50 border-orange-300"
                        : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900">75% Attendance</p>
                          <p className="text-sm text-slate-600 mt-1">
                            Classes needed: <span className="font-bold">{calculations.classesFor75}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-orange-600">
                            {Math.floor((calculations.totalClassesPossible - calculations.classesFor75) / classesPerDay)}
                          </p>
                          <p className="text-xs text-slate-600">days to skip</p>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 transition ${
                      attendancePercentage === 80
                        ? "bg-orange-50 border-orange-300"
                        : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900">80% Attendance</p>
                          <p className="text-sm text-slate-600 mt-1">
                            Classes needed: <span className="font-bold">{calculations.classesFor80}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-amber-600">
                            {Math.floor((calculations.totalClassesPossible - calculations.classesFor80) / classesPerDay)}
                          </p>
                          <p className="text-xs text-slate-600">days to skip</p>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 transition ${
                      attendancePercentage === 90
                        ? "bg-orange-50 border-orange-300"
                        : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900">90% Attendance</p>
                          <p className="text-sm text-slate-600 mt-1">
                            Classes needed: <span className="font-bold">{calculations.classesFor90}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-amber-700">
                            {Math.floor((calculations.totalClassesPossible - calculations.classesFor90) / classesPerDay)}
                          </p>
                          <p className="text-xs text-slate-600">days to skip</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : calculations?.error ? (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 text-center">
                <p className="text-rose-900 font-semibold">{calculations.error}</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <p className="text-sm text-orange-900">
            <strong>Tip:</strong> Select only the holidays when your college is closed. Adjust dates to see your attendance requirement. Plan strategically to maximize your break time.
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
          position: relative;
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
          box-shadow: 
            0 0 0 4px rgba(234, 88, 12, 0.15),
            0 8px 16px rgba(234, 88, 12, 0.35),
            inset -1px -1px 2px rgba(0, 0, 0, 0.15),
            inset 1px 1px 2px rgba(255, 255, 255, 0.3);
          border: 2px solid white;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          z-index: 5;
          margin-top: -9px;
        }

        .premium-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 
            0 0 0 6px rgba(234, 88, 12, 0.2),
            0 12px 24px rgba(234, 88, 12, 0.45),
            inset -1px -1px 2px rgba(0, 0, 0, 0.15),
            inset 1px 1px 2px rgba(255, 255, 255, 0.4);
        }

        .premium-slider::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }

        .premium-slider::-moz-range-track {
          background: linear-gradient(90deg, #ea580c 0%, #fb923c 50%, #fed7aa 100%);
          border-radius: 10px;
          border: none;
          height: 10px;
          box-shadow: 0 0 20px rgba(234, 88, 12, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.15);
        }

        .premium-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          cursor: pointer;
          box-shadow: 
            0 0 0 4px rgba(234, 88, 12, 0.15),
            0 8px 16px rgba(234, 88, 12, 0.35),
            inset -1px -1px 2px rgba(0, 0, 0, 0.15),
            inset 1px 1px 2px rgba(255, 255, 255, 0.3);
          border: 2px solid white;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .premium-slider::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 
            0 0 0 6px rgba(234, 88, 12, 0.2),
            0 12px 24px rgba(234, 88, 12, 0.45),
            inset -1px -1px 2px rgba(0, 0, 0, 0.15),
            inset 1px 1px 2px rgba(255, 255, 255, 0.4);
        }

        .premium-slider::-moz-range-thumb:active {
          transform: scale(1.2);
        }

        .premium-slider::-moz-range-progress {
          background: linear-gradient(90deg, #ea580c 0%, #fb923c 50%, #fed7aa 100%);
          height: 10px;
          border-radius: 10px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        .slide-in-from-top-2 {
          animation: slideInFromTop 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

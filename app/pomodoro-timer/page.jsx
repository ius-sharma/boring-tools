"use client";

import { useEffect, useRef, useState } from "react";

export default function PomodoroTimer() {
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  const LONG_BREAK_TIME = 15 * 60;

  const [seconds, setSeconds] = useState(WORK_TIME);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [dailyStats, setDailyStats] = useState({ focusSessions: 0, breakSessions: 0, focusMinutes: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [customWorkTime, setCustomWorkTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const notificationPermissionRequestedRef = useRef(false);
  const audioContextRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Timer state stored in localStorage
  const TIMER_STORAGE_KEY = "pomodoroTimerState";

  // Helper: Save timer state to localStorage
  const saveTimerState = (state) => {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  };

  // Helper: Load timer state from localStorage
  const loadTimerState = () => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  // Helper: Get remaining time based on wall clock
  const getRemainingTime = (timerState) => {
    if (!timerState.isRunning || !timerState.startTime || !timerState.duration) {
      return timerState.secondsLeft || timerState.duration;
    }

    const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
    const remaining = Math.max(0, timerState.duration - elapsed);
    return remaining;
  };

  // Load stats and timer state on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem("pomodoroStats");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        setDailyStats(data.stats);
      } else {
        localStorage.setItem("pomodoroStats", JSON.stringify({ date: today, stats: { focusSessions: 0, breakSessions: 0, focusMinutes: 0 } }));
      }
    }

    // Load timer state if exists
    const timerState = loadTimerState();
    if (timerState) {
      const remaining = getRemainingTime(timerState);
      setSeconds(remaining);
      setRunning(timerState.isRunning);
      setIsBreak(timerState.isBreak);
      setSessions(timerState.sessions);
      setCustomWorkTime(timerState.customWorkTime || 25);
      setCustomBreakTime(timerState.customBreakTime || 5);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (running) handlePause();
        else handleStart();
      }
      if (e.code === "KeyR") {
        e.preventDefault();
        resetTimer();
      }
      if (e.code === "Escape") {
        setShowSettings(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [running]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // Ignore
      }
    }
  };

  // Play beep sound
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioContext = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log("Sound play failed");
    }
  };

  // Send notification
  const sendNotification = (title, body) => {
    if (typeof window === "undefined" || typeof Notification === "undefined") return;
    if (Notification.permission === "granted") {
      playBeep();
      new Notification(title, { body });
    }
  };

  // Main timer loop - uses wall clock for accuracy
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      const timerState = loadTimerState();
      if (!timerState) return;

      // Calculate remaining time based on wall clock
      const remaining = getRemainingTime(timerState);

      // Update UI
      setSeconds(remaining);
      setRunning(timerState.isRunning);
      setIsBreak(timerState.isBreak);
      setSessions(timerState.sessions);

      // If timer finished and still running
      if (remaining === 0 && timerState.isRunning) {
        let newIsBreak, newDuration, newSeconds;
        let newSessions = timerState.sessions;

        if (!timerState.isBreak) {
          // Work session completed
          newSessions = timerState.sessions + 1;
          newIsBreak = true;
          newDuration = timerState.customBreakTime * 60;
          newSeconds = newDuration;

          // Update daily stats
          const newStats = {
            ...dailyStats,
            focusSessions: dailyStats.focusSessions + 1,
            focusMinutes: dailyStats.focusMinutes + timerState.customWorkTime,
          };
          setDailyStats(newStats);
          const today = new Date().toDateString();
          localStorage.setItem("pomodoroStats", JSON.stringify({ date: today, stats: newStats }));

          if (newSessions % 4 === 0) {
            sendNotification("4 sessions completed!", `Time for a 15 min long break. Great work!`);
          } else {
            sendNotification("Focus session complete", `Break time started. Take ${timerState.customBreakTime} minutes to reset.`);
          }
        } else {
          // Break session completed
          newIsBreak = false;
          newDuration = timerState.customWorkTime * 60;
          newSeconds = newDuration;

          // Update daily stats
          const newStats = { ...dailyStats, breakSessions: dailyStats.breakSessions + 1 };
          setDailyStats(newStats);
          const today = new Date().toDateString();
          localStorage.setItem("pomodoroStats", JSON.stringify({ date: today, stats: newStats }));

          sendNotification("Break finished", `Focus time started. Back to work.`);
        }

        // Save new state
        const newTimerState = {
          isRunning: true,
          startTime: Date.now(),
          duration: newDuration,
          secondsLeft: newSeconds,
          isBreak: newIsBreak,
          sessions: newSessions,
          customWorkTime: timerState.customWorkTime,
          customBreakTime: timerState.customBreakTime,
        };
        saveTimerState(newTimerState);
      }
    }, 500); // Update every 500ms for smooth updates

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [dailyStats, soundEnabled]);

  // Handle visibility change (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) return; // Tab is hidden, do nothing

      // Tab became visible - resync timer state
      const timerState = loadTimerState();
      if (timerState) {
        const remaining = getRemainingTime(timerState);
        setSeconds(remaining);
        setRunning(timerState.isRunning);
        setIsBreak(timerState.isBreak);
        setSessions(timerState.sessions);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Start timer
  const handleStart = async () => {
    if (!notificationPermissionRequestedRef.current) {
      notificationPermissionRequestedRef.current = true;
      await requestNotificationPermission();
    }

    const duration = isBreak ? customBreakTime * 60 : customWorkTime * 60;
    const newTimerState = {
      isRunning: true,
      startTime: Date.now(),
      duration,
      secondsLeft: seconds,
      isBreak,
      sessions,
      customWorkTime,
      customBreakTime,
    };
    saveTimerState(newTimerState);
    setRunning(true);
  };

  // Pause timer
  const handlePause = () => {
    const timerState = loadTimerState();
    if (timerState) {
      const remaining = getRemainingTime(timerState);
      timerState.isRunning = false;
      timerState.secondsLeft = remaining;
      timerState.startTime = null;
      saveTimerState(timerState);
    }
    setRunning(false);
  };

  // Reset timer
  const resetTimer = () => {
    const duration = customWorkTime * 60;
    const newTimerState = {
      isRunning: false,
      startTime: null,
      duration,
      secondsLeft: duration,
      isBreak: false,
      sessions: 0,
      customWorkTime,
      customBreakTime,
    };
    saveTimerState(newTimerState);
    setRunning(false);
    setIsBreak(false);
    setSeconds(duration);
    setSessions(0);
  };

  // Apply preset
  const applyPreset = (preset) => {
    if (preset === "standard") {
      setCustomWorkTime(25);
      setCustomBreakTime(5);
    } else if (preset === "long") {
      setCustomWorkTime(50);
      setCustomBreakTime(10);
    } else if (preset === "short") {
      setCustomWorkTime(15);
      setCustomBreakTime(3);
    }
    setShowSettings(false);
    setTimeout(() => resetTimer(), 0);
  };

  // Apply custom settings
  const applyCustom = () => {
    setShowSettings(false);
    setTimeout(() => resetTimer(), 0);
  };

  // Format time
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // Calculate progress
  const maxTime = isBreak ? customBreakTime * 60 : customWorkTime * 60;
  const progress = ((maxTime - seconds) / maxTime) * 100;
  const isLastThreeSeconds = seconds <= 3 && seconds > 0 && running;
  const nextPhaseText = isBreak ? `Next: ${customWorkTime} min focus` : `Next: ${customBreakTime} min break`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-1 items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Pomodoro Timer</h1>
          <p className="text-slate-500 text-base">Stay focused with work and break cycles</p>
        </div>

        {/* Timer Display with Progress Ring */}
        <div className="w-full p-6 border border-slate-200 rounded-xl bg-slate-50 text-center relative">
          <div className="flex justify-center mb-4">
            <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
              {/* Background circle */}
              <circle cx="60" cy="60" r="55" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="55"
                fill="none"
                stroke="#171717"
                strokeWidth="3"
                strokeDasharray={`${(progress / 100) * 345.6} 345.6`}
                style={{ transition: "stroke-dasharray 0.5s linear" }}
              />
            </svg>
          </div>
          <p className="mb-2 text-base font-medium text-slate-700">{isBreak ? "Break Time" : "Focus Time"}</p>
          <div className={`text-5xl sm:text-6xl font-bold text-slate-900 tabular-nums ${isLastThreeSeconds ? "animate-pulse" : ""}`}>
            {formatTime(seconds)}
          </div>
          <p className="text-xs text-slate-500 mt-3">{nextPhaseText}</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleStart}
            className="border border-slate-300 rounded-lg py-2 px-2 text-slate-700 hover:bg-slate-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            Start
          </button>

          <button
            onClick={handlePause}
            className="border border-slate-300 rounded-lg py-2 px-2 text-slate-700 hover:bg-slate-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            Pause
          </button>

          <button
            onClick={resetTimer}
            className="border border-slate-300 rounded-lg py-2 px-2 text-slate-700 hover:bg-slate-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            Reset
          </button>
        </div>

        {/* Keyboard Shortcuts Info */}
        <p className="text-center text-xs text-slate-500">
          <span className="font-medium">Shortcuts:</span> Space (Start/Pause) • R (Reset) • Esc (Close)
        </p>

        {/* Daily Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 text-center">
            <p className="text-xs text-slate-500">Focus Sessions</p>
            <p className="text-xl font-semibold text-slate-900">{dailyStats.focusSessions}</p>
          </div>
          <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 text-center">
            <p className="text-xs text-slate-500">Break Sessions</p>
            <p className="text-xl font-semibold text-slate-900">{dailyStats.breakSessions}</p>
          </div>
          <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 text-center">
            <p className="text-xs text-slate-500">Focus Minutes</p>
            <p className="text-xl font-semibold text-slate-900">{dailyStats.focusMinutes}</p>
          </div>
        </div>

        {/* Session Queue & Settings */}
        <div className="flex gap-2">
          <div className="flex-1 p-3 border border-slate-200 rounded-lg bg-slate-50 text-center">
            <p className="text-xs text-slate-500">Sessions Till Long Break</p>
            <p className="text-lg font-semibold text-slate-900">{4 - (sessions % 4)}</p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Settings</h2>

              {/* Presets */}
              <div className="mb-6">
                <p className="font-medium text-slate-900 mb-3">Timer Presets</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => applyPreset("standard")}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-sm font-medium text-slate-700"
                  >
                    Standard (25-5)
                  </button>
                  <button
                    onClick={() => applyPreset("long")}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-sm font-medium text-slate-700"
                  >
                    Long (50-10)
                  </button>
                  <button
                    onClick={() => applyPreset("short")}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-sm font-medium text-slate-700"
                  >
                    Short (15-3)
                  </button>
                </div>
              </div>

              {/* Custom Timer */}
              <div className="mb-6">
                <p className="font-medium text-slate-900 mb-3">Custom Timer</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Work (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={customWorkTime}
                      onChange={(e) => setCustomWorkTime(parseInt(e.target.value) || 1)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Break (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={customBreakTime}
                      onChange={(e) => setCustomBreakTime(parseInt(e.target.value) || 1)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Sound Toggle */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 border-slate-300 rounded focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-slate-900 font-medium">Enable Sound Notifications</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={applyCustom}
                  className="flex-1 bg-orange-500 text-white rounded-lg py-2 font-medium hover:bg-orange-600 transition focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Apply
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 border border-slate-300 rounded-lg py-2 text-slate-700 font-medium hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-500">
          Wall-clock based timer for accurate background tracking
        </p>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}



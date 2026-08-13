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
  const [streak, setStreak] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom Timer Settings
  const [customWorkTime, setCustomWorkTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);
  const [customLongBreakTime, setCustomLongBreakTime] = useState(15);
  const [autoStartBreaks, setAutoStartBreaks] = useState(true);
  const [autoStartFocus, setAutoStartFocus] = useState(true);

  // Sound Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundTone, setSoundTone] = useState("chime"); // chime | bell | beep
  const [soundVolume, setSoundVolume] = useState(0.5);

  // Task Goal Tracking
  const [currentTask, setCurrentTask] = useState("");

  const notificationPermissionRequestedRef = useRef(false);
  const audioContextRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Storage Keys
  const TIMER_STORAGE_KEY = "pomodoroTimerState";
  const SETTINGS_STORAGE_KEY = "pomodoroSettingsState";
  const HISTORY_STORAGE_KEY = "pomodoroHistory";

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

  // Helper: Calculate streak from history
  const calculateStreak = (history) => {
    let streakCount = 0;
    const today = new Date();
    const todayStr = today.toDateString();

    if (history[todayStr] && history[todayStr].focusSessions > 0) {
      streakCount++;
    }

    let checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
      const dateStr = checkDate.toDateString();
      if (history[dateStr] && history[dateStr].focusSessions > 0) {
        streakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streakCount;
  };

  // Load stats, settings, task and timer state on mount
  useEffect(() => {
    const today = new Date().toDateString();

    // Load History & Daily Stats
    let history = {};
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) history = JSON.parse(savedHistory);
    } catch {}

    const savedStats = localStorage.getItem("pomodoroStats");
    if (savedStats) {
      try {
        const data = JSON.parse(savedStats);
        if (data.date === today) {
          setDailyStats(data.stats);
        } else {
          setDailyStats({ focusSessions: 0, breakSessions: 0, focusMinutes: 0 });
        }
      } catch {}
    }

    setStreak(calculateStreak(history));

    // Load Saved Settings
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.customWorkTime) setCustomWorkTime(parsed.customWorkTime);
        if (parsed.customBreakTime) setCustomBreakTime(parsed.customBreakTime);
        if (parsed.customLongBreakTime) setCustomLongBreakTime(parsed.customLongBreakTime);
        if (parsed.autoStartBreaks !== undefined) setAutoStartBreaks(parsed.autoStartBreaks);
        if (parsed.autoStartFocus !== undefined) setAutoStartFocus(parsed.autoStartFocus);
        if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
        if (parsed.soundTone) setSoundTone(parsed.soundTone);
        if (parsed.soundVolume !== undefined) setSoundVolume(parsed.soundVolume);
      }
    } catch {}

    // Load Task Goal
    const savedTask = localStorage.getItem("pomodoroCurrentTask");
    if (savedTask) setCurrentTask(savedTask);

    // Load timer state if exists
    const timerState = loadTimerState();
    if (timerState) {
      const remaining = getRemainingTime(timerState);
      setSeconds(remaining);
      setRunning(timerState.isRunning);
      setIsBreak(timerState.isBreak);
      setSessions(timerState.sessions);
      if (timerState.customWorkTime) setCustomWorkTime(timerState.customWorkTime);
      if (timerState.customBreakTime) setCustomBreakTime(timerState.customBreakTime);
      if (timerState.customLongBreakTime) setCustomLongBreakTime(timerState.customLongBreakTime);
    }
  }, []);

  // Update document title for live browser tab countdown
  useEffect(() => {
    if (running) {
      const icon = isBreak ? "☕" : "🍅";
      const phase = isBreak ? "Break" : "Focus";
      document.title = `(${formatTime(seconds)}) ${icon} ${phase} | Pomodoro`;
    } else {
      document.title = "Pomodoro Timer";
    }
    return () => {
      document.title = "Pomodoro Timer";
    };
  }, [seconds, running, isBreak]);

  // Save current task to localStorage
  const handleTaskChange = (val) => {
    setCurrentTask(val);
    localStorage.setItem("pomodoroCurrentTask", val);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts if user is typing in task input or numbers
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (running) handlePause();
        else handleStart();
      }
      if (e.code === "KeyR") {
        e.preventDefault();
        resetTimer();
      }
      if (e.code === "KeyS") {
        e.preventDefault();
        handleSkip();
      }
      if (e.code === "KeyM") {
        e.preventDefault();
        setSoundEnabled((prev) => !prev);
      }
      if (e.code === "Escape") {
        setShowSettings(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [running, isBreak, seconds, customWorkTime, customBreakTime, customLongBreakTime, autoStartBreaks, autoStartFocus]);

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

  // Synthesize Sound Tone using Web Audio API
  const playSound = (tone = soundTone, vol = soundVolume) => {
    if (!soundEnabled) return;
    try {
      const audioContext = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const now = audioContext.currentTime;

      if (tone === "chime") {
        // Harmonic triad chord (C5, E5, G5)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(vol * 0.25, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.8);
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.8);
        });
      } else if (tone === "bell") {
        // Gentle bell tone
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.setValueAtTime(vol * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 1.1);
      } else {
        // Standard beep
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(vol * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {
      console.log("Sound play failed");
    }
  };

  // Send notification & trigger audio tone
  const sendNotification = (title, body) => {
    playSound();
    if (typeof window === "undefined" || typeof Notification === "undefined") return;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  // Main timer loop - uses wall clock for accuracy
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      const timerState = loadTimerState();
      if (!timerState) return;

      const remaining = getRemainingTime(timerState);

      setSeconds(remaining);
      setRunning(timerState.isRunning);
      setIsBreak(timerState.isBreak);
      setSessions(timerState.sessions);

      // If timer finished and still running
      if (remaining === 0 && timerState.isRunning) {
        let newIsBreak, newDuration, newSeconds;
        let newSessions = timerState.sessions;
        let shouldAutoStart = true;

        if (!timerState.isBreak) {
          // Focus session completed
          newSessions = timerState.sessions + 1;
          newIsBreak = true;

          const isLongBreak = newSessions % 4 === 0;
          const breakMins = isLongBreak
            ? (timerState.customLongBreakTime || customLongBreakTime)
            : (timerState.customBreakTime || customBreakTime);

          newDuration = breakMins * 60;
          newSeconds = newDuration;
          shouldAutoStart = timerState.autoStartBreaks !== undefined ? timerState.autoStartBreaks : autoStartBreaks;

          // Update daily stats & history
          const today = new Date().toDateString();
          const workMins = timerState.customWorkTime || customWorkTime;
          const newStats = {
            ...dailyStats,
            focusSessions: dailyStats.focusSessions + 1,
            focusMinutes: dailyStats.focusMinutes + workMins,
          };
          setDailyStats(newStats);
          localStorage.setItem("pomodoroStats", JSON.stringify({ date: today, stats: newStats }));

          // Save to history object
          try {
            const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            const historyObj = savedHistory ? JSON.parse(savedHistory) : {};
            historyObj[today] = newStats;
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyObj));
            setStreak(calculateStreak(historyObj));
          } catch {}

          if (isLongBreak) {
            sendNotification("4 sessions completed!", `Time for a ${breakMins} min long break. Great work!`);
          } else {
            sendNotification("Focus session complete", `Break time started. Take ${breakMins} minutes to reset.`);
          }
        } else {
          // Break session completed
          newIsBreak = false;
          const workMins = timerState.customWorkTime || customWorkTime;
          newDuration = workMins * 60;
          newSeconds = newDuration;
          shouldAutoStart = timerState.autoStartFocus !== undefined ? timerState.autoStartFocus : autoStartFocus;

          // Update daily stats & history
          const today = new Date().toDateString();
          const newStats = { ...dailyStats, breakSessions: dailyStats.breakSessions + 1 };
          setDailyStats(newStats);
          localStorage.setItem("pomodoroStats", JSON.stringify({ date: today, stats: newStats }));

          try {
            const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            const historyObj = savedHistory ? JSON.parse(savedHistory) : {};
            historyObj[today] = newStats;
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyObj));
          } catch {}

          sendNotification("Break finished", `Focus time started. Back to work.`);
        }

        // Save new state
        const newTimerState = {
          isRunning: shouldAutoStart,
          startTime: shouldAutoStart ? Date.now() : null,
          duration: newDuration,
          secondsLeft: newSeconds,
          isBreak: newIsBreak,
          sessions: newSessions,
          customWorkTime: timerState.customWorkTime || customWorkTime,
          customBreakTime: timerState.customBreakTime || customBreakTime,
          customLongBreakTime: timerState.customLongBreakTime || customLongBreakTime,
          autoStartBreaks,
          autoStartFocus,
        };
        saveTimerState(newTimerState);
        setRunning(shouldAutoStart);
      }
    }, 500);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [dailyStats, soundEnabled, soundTone, soundVolume, autoStartBreaks, autoStartFocus, customWorkTime, customBreakTime, customLongBreakTime]);

  // Handle visibility change (tab switch resync)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) return;

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

    let duration;
    if (isBreak) {
      const isLongBreak = sessions > 0 && sessions % 4 === 0;
      duration = isLongBreak ? customLongBreakTime * 60 : customBreakTime * 60;
    } else {
      duration = customWorkTime * 60;
    }

    const newTimerState = {
      isRunning: true,
      startTime: Date.now(),
      duration,
      secondsLeft: seconds,
      isBreak,
      sessions,
      customWorkTime,
      customBreakTime,
      customLongBreakTime,
      autoStartBreaks,
      autoStartFocus,
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
      customLongBreakTime,
      autoStartBreaks,
      autoStartFocus,
    };
    saveTimerState(newTimerState);
    setRunning(false);
    setIsBreak(false);
    setSeconds(duration);
    setSessions(0);
  };

  // Skip current phase
  const handleSkip = () => {
    let nextIsBreak = !isBreak;
    let nextDuration;

    if (nextIsBreak) {
      const nextSessions = sessions;
      const isLong = (nextSessions + 1) % 4 === 0;
      nextDuration = (isLong ? customLongBreakTime : customBreakTime) * 60;
    } else {
      nextDuration = customWorkTime * 60;
    }

    const shouldAutoStart = nextIsBreak ? autoStartBreaks : autoStartFocus;

    const newTimerState = {
      isRunning: shouldAutoStart,
      startTime: shouldAutoStart ? Date.now() : null,
      duration: nextDuration,
      secondsLeft: nextDuration,
      isBreak: nextIsBreak,
      sessions,
      customWorkTime,
      customBreakTime,
      customLongBreakTime,
      autoStartBreaks,
      autoStartFocus,
    };

    saveTimerState(newTimerState);
    setIsBreak(nextIsBreak);
    setSeconds(nextDuration);
    setRunning(shouldAutoStart);
  };

  // Apply preset
  const applyPreset = (preset) => {
    let w = 25, b = 5, lb = 15;
    if (preset === "long") {
      w = 50; b = 10; lb = 20;
    } else if (preset === "short") {
      w = 15; b = 3; lb = 10;
    }
    setCustomWorkTime(w);
    setCustomBreakTime(b);
    setCustomLongBreakTime(lb);

    saveSettings({
      customWorkTime: w,
      customBreakTime: b,
      customLongBreakTime: lb,
      autoStartBreaks,
      autoStartFocus,
      soundEnabled,
      soundTone,
      soundVolume,
    });

    setShowSettings(false);
    setTimeout(() => resetTimer(), 0);
  };

  // Save Settings Helper
  const saveSettings = (newSettingsObj) => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettingsObj));
  };

  // Apply custom settings
  const applyCustom = () => {
    saveSettings({
      customWorkTime,
      customBreakTime,
      customLongBreakTime,
      autoStartBreaks,
      autoStartFocus,
      soundEnabled,
      soundTone,
      soundVolume,
    });
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
  const isLongBreakCurrent = isBreak && sessions > 0 && sessions % 4 === 0;
  const maxTime = isBreak
    ? (isLongBreakCurrent ? customLongBreakTime : customBreakTime) * 60
    : customWorkTime * 60;
  const progress = Math.min(100, Math.max(0, ((maxTime - seconds) / maxTime) * 100));
  const isLastThreeSeconds = seconds <= 3 && seconds > 0 && running;
  const nextPhaseText = isBreak
    ? `Next: ${customWorkTime} min focus`
    : (sessions + 1) % 4 === 0
    ? `Next: ${customLongBreakTime} min long break`
    : `Next: ${customBreakTime} min break`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl border border-slate-200 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col gap-1 items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Pomodoro Timer</h1>
          <p className="text-slate-500 text-base">Stay focused with work and break cycles</p>
        </div>

        {/* Task Goal Input */}
        <div className="w-full">
          <input
            type="text"
            placeholder="🎯 What are you working on? (Optional)"
            value={currentTask}
            onChange={(e) => handleTaskChange(e.target.value)}
            className="w-full text-center text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition placeholder:text-slate-400 font-medium"
          />
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
          <p className="mb-2 text-base font-medium text-slate-700">
            {isBreak ? (isLongBreakCurrent ? "☕ Long Break Time" : "☕ Break Time") : "🍅 Focus Time"}
          </p>
          <div className={`text-5xl sm:text-6xl font-bold text-slate-900 tabular-nums ${isLastThreeSeconds ? "animate-pulse" : ""}`}>
            {formatTime(seconds)}
          </div>
          <p className="text-xs text-slate-500 mt-3">{nextPhaseText}</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-4 gap-2">
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
            onClick={handleSkip}
            className="border border-slate-300 rounded-lg py-2 px-2 text-slate-700 hover:bg-slate-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
            title="Skip to next phase (S)"
          >
            Skip ⏭️
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
          <span className="font-medium">Shortcuts:</span> Space (Start/Pause) • S (Skip) • R (Reset) • M (Mute/Unmute)
        </p>

        {/* Daily Stats & Streak */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
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
          <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 text-center">
            <p className="text-xs text-slate-500">Daily Streak</p>
            <p className="text-xl font-semibold text-amber-600">{streak} 🔥</p>
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
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-200 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Settings</h2>

              {/* Presets */}
              <div className="mb-6">
                <p className="font-medium text-slate-900 mb-3 text-sm">Timer Presets</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => applyPreset("standard")}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-xs font-medium text-slate-700"
                  >
                    Standard (25-5-15)
                  </button>
                  <button
                    onClick={() => applyPreset("long")}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-xs font-medium text-slate-700"
                  >
                    Long (50-10-20)
                  </button>
                  <button
                    onClick={() => applyPreset("short")}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-xs font-medium text-slate-700"
                  >
                    Short (15-3-10)
                  </button>
                </div>
              </div>

              {/* Custom Durations */}
              <div className="mb-6">
                <p className="font-medium text-slate-900 mb-3 text-sm">Custom Durations (minutes)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-700 mb-1">Work</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={customWorkTime}
                      onChange={(e) => setCustomWorkTime(parseInt(e.target.value) || 1)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 mb-1">Short Break</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={customBreakTime}
                      onChange={(e) => setCustomBreakTime(parseInt(e.target.value) || 1)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 mb-1">Long Break</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={customLongBreakTime}
                      onChange={(e) => setCustomLongBreakTime(parseInt(e.target.value) || 1)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Auto Start Options */}
              <div className="mb-6 border-t border-slate-100 pt-4 flex flex-col gap-3">
                <p className="font-medium text-slate-900 text-sm">Cycle Controls</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoStartBreaks}
                    onChange={(e) => setAutoStartBreaks(e.target.checked)}
                    className="w-4 h-4 border-slate-300 rounded focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-slate-800 text-sm font-medium">Auto-start Breaks</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoStartFocus}
                    onChange={(e) => setAutoStartFocus(e.target.checked)}
                    className="w-4 h-4 border-slate-300 rounded focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-slate-800 text-sm font-medium">Auto-start Focus Sessions</span>
                </label>
              </div>

              {/* Sound Options */}
              <div className="mb-6 border-t border-slate-100 pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="w-4 h-4 border-slate-300 rounded focus:ring-2 focus:ring-slate-900"
                    />
                    <span className="text-slate-900 text-sm font-medium">Sound Notifications</span>
                  </label>
                  {soundEnabled && (
                    <button
                      onClick={() => playSound(soundTone, soundVolume)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium transition"
                    >
                      🔊 Test Sound
                    </button>
                  )}
                </div>

                {soundEnabled && (
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Tone</label>
                      <select
                        value={soundTone}
                        onChange={(e) => setSoundTone(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="chime">Gentle Chime</option>
                        <option value="bell">Soft Bell</option>
                        <option value="beep">Digital Beep</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Volume ({Math.round(soundVolume * 100)}%)</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={soundVolume}
                        onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                        className="w-full mt-2 accent-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={applyCustom}
                  className="flex-1 bg-slate-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  Apply & Save
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 border border-slate-300 rounded-lg py-2 text-slate-700 text-sm font-medium hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-slate-900"
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

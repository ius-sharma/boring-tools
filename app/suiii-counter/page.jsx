"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ComingSoon from "../components/ComingSoon";

const TOOL_STATUS = "live"; // Set to "live" to deploy and enable routing

/* ────────────────────────── constants ────────────────────────── */

const STORAGE_KEY = "boring-tools-suiii-counter";
const COMBO_WINDOW_MS = 1200;
const AUDIO_FILES = [
  "/audio/suiii-1.mp3",
  "/audio/suiii-2.MP3",
  "/audio/suiii-3.MP3",
  "/audio/suiii-4.MP3",
  "/audio/suiii-5.MP3",
];

const ACHIEVEMENTS = [
  { id: "first", label: "First SUIII", icon: "🎉", description: "Click the SUIII button for the first time", threshold: (s) => s.lifetime >= 1 },
  { id: "ten", label: "10 SUIIIs", icon: "🔟", description: "Reach 10 lifetime SUIIIs", threshold: (s) => s.lifetime >= 10 },
  { id: "hundred", label: "100 SUIIIs", icon: "💯", description: "Reach 100 lifetime SUIIIs", threshold: (s) => s.lifetime >= 100 },
  { id: "five_hundred", label: "500 SUIIIs", icon: "🔥", description: "Reach 500 lifetime SUIIIs", threshold: (s) => s.lifetime >= 500 },
  { id: "thousand", label: "1,000 SUIIIs", icon: "🏆", description: "Reach 1,000 lifetime SUIIIs", threshold: (s) => s.lifetime >= 1000 },
  { id: "five_k", label: "5,000 SUIIIs", icon: "⭐", description: "Reach 5,000 lifetime SUIIIs", threshold: (s) => s.lifetime >= 5000 },
  { id: "ten_k", label: "10,000 SUIIIs", icon: "👑", description: "Reach 10,000 lifetime SUIIIs", threshold: (s) => s.lifetime >= 10000 },
  { id: "combo_master", label: "Combo Master", icon: "⚡", description: "Reach a combo of 25 or more", threshold: (s) => s.bestCombo >= 25 },
  { id: "speed_demon", label: "Speed Demon", icon: "🚀", description: "Click 8+ times per second", threshold: (s) => s.fastestCps >= 8 },
  { id: "weekend_warrior", label: "Weekend Warrior", icon: "🎊", description: "Click on a Saturday or Sunday", threshold: (s) => s.weekendClicked },
];

const THEMES = {
  classic: {
    name: "Classic",
    bg: "bg-slate-50",
    card: "bg-white border-slate-200",
    cardHover: "hover:border-slate-300 hover:shadow-md",
    text: "text-slate-900",
    muted: "text-slate-500",
    accent: "text-orange-600",
    accentBg: "bg-orange-600",
    accentBorder: "border-orange-500",
    buttonGradient: "linear-gradient(135deg, #f59e0b, #ea580c)",
    buttonShadow: "0 8px 32px rgba(245, 158, 11, 0.4)",
    buttonGlow: "0 0 40px rgba(245, 158, 11, 0.3)",
    particleColors: ["#f59e0b", "#ea580c", "#fbbf24", "#dc2626"],
    particleEmojis: ["✨", "⭐", "🌟", "💫"],
    counterColor: "#f59e0b",
  },
  gold: {
    name: "Gold",
    bg: "bg-[#1a1510]",
    card: "bg-[#231e16] border-[#3d3425]",
    cardHover: "hover:border-[#b8860b] hover:shadow-md",
    text: "text-[#fde68a]",
    muted: "text-[#a08050]",
    accent: "text-[#fbbf24]",
    accentBg: "bg-[#b8860b]",
    accentBorder: "border-[#b8860b]",
    buttonGradient: "linear-gradient(135deg, #fbbf24, #b8860b, #8b6914)",
    buttonShadow: "0 8px 32px rgba(184, 134, 11, 0.5)",
    buttonGlow: "0 0 60px rgba(251, 191, 36, 0.3)",
    particleColors: ["#fbbf24", "#f59e0b", "#b8860b", "#fde68a"],
    particleEmojis: ["🏆", "⭐", "🪙", "👑"],
    counterColor: "#fbbf24",
  },
  neon: {
    name: "Neon",
    bg: "bg-[#0d0015]",
    card: "bg-[#1a0028] border-[#6b21a8]",
    cardHover: "hover:border-[#e879f9] hover:shadow-md",
    text: "text-[#e879f9]",
    muted: "text-[#9333ea]",
    accent: "text-[#06b6d4]",
    accentBg: "bg-[#9333ea]",
    accentBorder: "border-[#9333ea]",
    buttonGradient: "linear-gradient(135deg, #e879f9, #9333ea, #06b6d4)",
    buttonShadow: "0 8px 32px rgba(147, 51, 234, 0.5)",
    buttonGlow: "0 0 80px rgba(232, 121, 249, 0.3)",
    particleColors: ["#e879f9", "#06b6d4", "#9333ea", "#22d3ee"],
    particleEmojis: ["⚡", "💎", "🔮", "🌀"],
    counterColor: "#e879f9",
  },
  stadium: {
    name: "Stadium",
    bg: "bg-[#0a2e0a]",
    card: "bg-[#143814] border-[#2d6b2d]",
    cardHover: "hover:border-[#4ade80] hover:shadow-md",
    text: "text-[#bbf7d0]",
    muted: "text-[#4ade80]",
    accent: "text-[#f0fdf4]",
    accentBg: "bg-[#16a34a]",
    accentBorder: "border-[#16a34a]",
    buttonGradient: "linear-gradient(135deg, #16a34a, #15803d, #166534)",
    buttonShadow: "0 8px 32px rgba(22, 163, 74, 0.5)",
    buttonGlow: "0 0 60px rgba(74, 222, 128, 0.3)",
    particleColors: ["#4ade80", "#16a34a", "#fbbf24", "#ffffff"],
    particleEmojis: ["⚽", "🥅", "🏟️", "📣"],
    counterColor: "#4ade80",
  },
};

const CHALLENGE_DURATIONS = [
  { value: 10, label: "10 Seconds" },
  { value: 30, label: "30 Seconds" },
  { value: 60, label: "60 Seconds" },
];

/* ────────────────────────── helpers ────────────────────────── */

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function weekKey() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

function formatNumber(n) {
  return new Intl.NumberFormat("en-IN").format(n);
}

function getDefaultState() {
  return {
    lifetime: 0,
    today: 0,
    todayKey: todayKey(),
    weekly: 0,
    weekKey: weekKey(),
    monthly: 0,
    monthKey: monthKey(),
    bestCombo: 0,
    fastestCps: 0,
    avgClickSpeed: 0,
    totalClicks: 0,
    totalClickTime: 0,
    longestSession: 0,
    sessionsPlayed: 0,
    achievements: [],
    challengeScores: { 10: 0, 30: 0, 60: 0 },
    theme: "classic",
    soundOn: true,
    volume: 0.7,
    soundMode: "random",
    selectedSound: 0,
    weekendClicked: false,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    const def = getDefaultState();
    const merged = { ...def, ...parsed };

    // Roll over date-based counters
    if (merged.todayKey !== todayKey()) {
      merged.today = 0;
      merged.todayKey = todayKey();
    }
    if (merged.weekKey !== weekKey()) {
      merged.weekly = 0;
      merged.weekKey = weekKey();
    }
    if (merged.monthKey !== monthKey()) {
      merged.monthly = 0;
      merged.monthKey = monthKey();
    }
    return merged;
  } catch {
    return getDefaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full — ignore */
  }
}

/* ────────────────────────── audio helpers ────────────────────────── */

function createAudioContext() {
  if (typeof window === "undefined") return null;
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }
}

function playSynthFallback(ctx, volume) {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    /* silent fail */
  }
}

/* ────────────────────────── component ────────────────────────── */

export default function SuiiiCounterPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="SUIII Counter" />;
  }

  /* ── state ── */
  const [state, setState] = useState(getDefaultState);
  const [hydrated, setHydrated] = useState(false);
  const [combo, setCombo] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [particles, setParticles] = useState([]);
  const [floaters, setFloaters] = useState([]);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("counter");

  // Challenge state
  const [challengeDuration, setChallengeDuration] = useState(10);
  const [challengeActive, setChallengeActive] = useState(false);
  const [challengePrimed, setChallengePrimed] = useState(false);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(0);
  const [challengeFinished, setChallengeFinished] = useState(false);

  // Refs
  const lastClickRef = useRef(0);
  const comboTimerRef = useRef(null);
  const sessionStartRef = useRef(Date.now());
  const clickTimestampsRef = useRef([]);
  const audioCtxRef = useRef(null);
  const audioElementsRef = useRef([]);
  const toastTimerRef = useRef(null);
  const challengeIntervalRef = useRef(null);
  const challengeEndRef = useRef(0);
  const containerRef = useRef(null);
  const particleIdRef = useRef(0);
  const floaterIdRef = useRef(0);
  const confettiActiveRef = useRef(false);

  const theme = THEMES[state.theme] || THEMES.classic;

  /* ── hydrate from localStorage ── */
  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setHydrated(true);
    sessionStartRef.current = Date.now();
  }, []);

  /* ── persist to localStorage ── */
  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  /* ── preload audio ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    audioCtxRef.current = createAudioContext();

    const elements = AUDIO_FILES.map((src) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = state.volume;
      return audio;
    });
    audioElementsRef.current = elements;

    return () => {
      elements.forEach((a) => {
        a.pause();
        a.src = "";
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── update audio volume when changed ── */
  useEffect(() => {
    audioElementsRef.current.forEach((a) => {
      a.volume = state.volume;
    });
  }, [state.volume]);

  /* ── keyboard support ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === " " || e.key === "Enter" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleClick();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, state, combo, challengeActive, challengePrimed, challengeFinished]);

  /* ── challenge timer ── */
  useEffect(() => {
    if (!challengeActive) return;
    challengeIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, (challengeEndRef.current - Date.now()) / 1000);
      setChallengeTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(challengeIntervalRef.current);
        setChallengeActive(false);
        setChallengeFinished(true);
      }
    }, 50);
    return () => clearInterval(challengeIntervalRef.current);
  }, [challengeActive]);

  /* ── show toast ── */
  const showToast = useCallback((message, icon = "🎉") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, icon });
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  /* ── play audio ── */
  const playAudio = useCallback(() => {
    if (!state.soundOn) return;
    try {
      // Resume audio context if suspended
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      let index;
      if (state.soundMode === "random") {
        index = Math.floor(Math.random() * AUDIO_FILES.length);
      } else {
        index = state.selectedSound;
      }

      const audio = audioElementsRef.current[index];
      if (audio) {
        const clone = audio.cloneNode();
        clone.volume = state.volume;
        clone.play().catch(() => {
          playSynthFallback(audioCtxRef.current, state.volume);
        });
      } else {
        playSynthFallback(audioCtxRef.current, state.volume);
      }
    } catch {
      playSynthFallback(audioCtxRef.current, state.volume);
    }
  }, [state.soundOn, state.soundMode, state.selectedSound, state.volume]);

  /* ── spawn particles ── */
  const spawnParticles = useCallback(() => {
    const count = 8 + Math.floor(Math.random() * 5);
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: Math.random() * 200 - 100,
        y: Math.random() * -150 - 50,
        emoji: theme.particleEmojis[Math.floor(Math.random() * theme.particleEmojis.length)],
        color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
        scale: 0.5 + Math.random() * 0.8,
        rotation: Math.random() * 360,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1000);
  }, [theme.particleEmojis, theme.particleColors]);

  /* ── spawn floaters ── */
  const spawnFloater = useCallback((comboVal) => {
    const texts = comboVal > 5 ? [`+${comboVal}`, "SIUUU!", "GOAT!"] : ["+1", "SUIII!", "SIUUU!"];
    const text = texts[Math.floor(Math.random() * texts.length)];
    const id = floaterIdRef.current++;
    const floater = {
      id,
      text,
      x: Math.random() * 100 - 50,
      scale: Math.min(1 + comboVal * 0.05, 2),
    };
    setFloaters((prev) => [...prev, floater]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 900);
  }, []);

  /* ── confetti burst (milestones) ── */
  const triggerConfetti = useCallback(() => {
    if (confettiActiveRef.current) return;
    confettiActiveRef.current = true;
    const emojis = ["🎉", "🎊", "🥳", "🏆", "⭐", "✨", "🌟", "💫", "🎇", "🎆"];
    const confettiParticles = [];
    for (let i = 0; i < 30; i++) {
      confettiParticles.push({
        id: particleIdRef.current++,
        x: Math.random() * 400 - 200,
        y: Math.random() * -400 - 100,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
        scale: 0.6 + Math.random() * 1.0,
        rotation: Math.random() * 720,
      });
    }
    setParticles((prev) => [...prev, ...confettiParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !confettiParticles.find((c) => c.id === p.id)));
      confettiActiveRef.current = false;
    }, 1800);
  }, [theme.particleColors]);

  /* ── check achievements ── */
  const checkAchievements = useCallback(
    (newState) => {
      const stats = {
        lifetime: newState.lifetime,
        bestCombo: newState.bestCombo,
        fastestCps: newState.fastestCps,
        weekendClicked: newState.weekendClicked,
      };
      const unlockedIds = new Set(newState.achievements);
      let newUnlocked = false;
      ACHIEVEMENTS.forEach((ach) => {
        if (!unlockedIds.has(ach.id) && ach.threshold(stats)) {
          unlockedIds.add(ach.id);
          newUnlocked = true;
          showToast(`Achievement Unlocked: ${ach.label}`, ach.icon);
        }
      });
      if (newUnlocked) {
        triggerConfetti();
        return Array.from(unlockedIds);
      }
      return newState.achievements;
    },
    [showToast, triggerConfetti]
  );

  /* ── main click handler ── */
  const handleClick = useCallback(() => {
    if (!hydrated) return;
    if (challengeFinished) return;

    const now = Date.now();

    // Challenge: start on first click if primed
    if (challengePrimed && !challengeActive) {
      setChallengeActive(true);
      setChallengePrimed(false);
      challengeEndRef.current = now + challengeDuration * 1000;
      setChallengeTimeLeft(challengeDuration);
    }

    // If in challenge mode and finished, ignore
    if (challengeActive) {
      setChallengeScore((prev) => prev + 1);
    }

    // Combo logic
    const elapsed = now - lastClickRef.current;
    lastClickRef.current = now;

    let newCombo;
    if (elapsed < COMBO_WINDOW_MS && elapsed > 0) {
      newCombo = combo + 1;
    } else {
      newCombo = 1;
    }
    setCombo(newCombo);

    // Reset combo timer
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => setCombo(0), COMBO_WINDOW_MS);

    // CPS tracking
    clickTimestampsRef.current.push(now);
    const oneSecAgo = now - 1000;
    clickTimestampsRef.current = clickTimestampsRef.current.filter((t) => t > oneSecAgo);
    const currentCps = clickTimestampsRef.current.length;

    // Weekend check
    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;

    // Effects
    playAudio();
    spawnParticles();
    spawnFloater(newCombo);

    // Screen shake
    setShaking(true);
    setTimeout(() => setShaking(false), 150);

    // Counter bounce
    setBouncing(true);
    setTimeout(() => setBouncing(false), 300);

    // Haptic vibration
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Update state
    setState((prev) => {
      const next = { ...prev };

      // Roll over date-based counters
      const tk = todayKey();
      const wk = weekKey();
      const mk = monthKey();
      if (next.todayKey !== tk) { next.today = 0; next.todayKey = tk; }
      if (next.weekKey !== wk) { next.weekly = 0; next.weekKey = wk; }
      if (next.monthKey !== mk) { next.monthly = 0; next.monthKey = mk; }

      next.lifetime += 1;
      next.today += 1;
      next.weekly += 1;
      next.monthly += 1;
      next.bestCombo = Math.max(next.bestCombo, newCombo);
      next.fastestCps = Math.max(next.fastestCps, currentCps);

      // Average click speed
      next.totalClicks += 1;
      if (elapsed > 0 && elapsed < 5000) {
        next.totalClickTime += elapsed;
      }
      if (next.totalClicks > 1 && next.totalClickTime > 0) {
        next.avgClickSpeed = Math.round(next.totalClickTime / (next.totalClicks - 1));
      }

      // Session duration
      const sessionDuration = Math.floor((now - sessionStartRef.current) / 1000);
      next.longestSession = Math.max(next.longestSession, sessionDuration);

      if (isWeekend) next.weekendClicked = true;

      // Check achievements
      next.achievements = checkAchievements(next);

      // Confetti milestones
      const milestones = [100, 500, 1000, 5000, 10000];
      if (milestones.includes(next.lifetime)) {
        triggerConfetti();
      }

      return next;
    });
  }, [hydrated, combo, challengeActive, challengePrimed, challengeFinished, challengeDuration, playAudio, spawnParticles, spawnFloater, checkAchievements, triggerConfetti]);

  /* ── challenge finish effect ── */
  useEffect(() => {
    if (!challengeFinished) return;
    setState((prev) => {
      const key = challengeDuration;
      const best = prev.challengeScores[key] || 0;
      if (challengeScore > best) {
        showToast(`New Record: ${challengeScore} SUIIIs in ${key}s!`, "🏆");
        triggerConfetti();
        return {
          ...prev,
          challengeScores: { ...prev.challengeScores, [key]: challengeScore },
          sessionsPlayed: prev.sessionsPlayed + 1,
        };
      }
      return { ...prev, sessionsPlayed: prev.sessionsPlayed + 1 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeFinished]);

  /* ── start challenge ── */
  const startChallenge = useCallback((duration) => {
    setChallengeDuration(duration);
    setChallengeScore(0);
    setChallengeActive(false);
    setChallengePrimed(true);
    setChallengeFinished(false);
    setChallengeTimeLeft(duration);
    setTab("counter");
  }, []);

  /* ── reset challenge ── */
  const resetChallenge = useCallback(() => {
    setChallengeActive(false);
    setChallengePrimed(false);
    setChallengeFinished(false);
    setChallengeScore(0);
    setChallengeTimeLeft(0);
    clearInterval(challengeIntervalRef.current);
  }, []);

  /* ── export functions ── */
  const getReportText = useCallback(() => {
    return [
      "═══════════════════════════════════════",
      "         SUIII Counter Report",
      "═══════════════════════════════════════",
      "",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "── Statistics ──────────────────────────",
      `Lifetime SUIIIs:       ${formatNumber(state.lifetime)}`,
      `Today:                 ${formatNumber(state.today)}`,
      `This Week:             ${formatNumber(state.weekly)}`,
      `This Month:            ${formatNumber(state.monthly)}`,
      `Best Combo:            x${formatNumber(state.bestCombo)}`,
      `Fastest CPS:           ${state.fastestCps}/sec`,
      `Avg Click Interval:    ${state.avgClickSpeed}ms`,
      `Longest Session:       ${state.longestSession}s`,
      `Sessions Played:       ${formatNumber(state.sessionsPlayed)}`,
      "",
      "── Challenge High Scores ───────────────",
      `10 Second:             ${formatNumber(state.challengeScores[10] || 0)}`,
      `30 Second:             ${formatNumber(state.challengeScores[30] || 0)}`,
      `60 Second:             ${formatNumber(state.challengeScores[60] || 0)}`,
      "",
      "── Achievements ───────────────────────",
      `Unlocked:              ${state.achievements.length}/${ACHIEVEMENTS.length}`,
      ...state.achievements.map((id) => {
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        return ach ? `  ${ach.icon}  ${ach.label}` : `  ✓  ${id}`;
      }),
      "",
      `Theme:                 ${THEMES[state.theme]?.name || state.theme}`,
      "",
      "═══════════════════════════════════════",
      "  Generated by BoringTools SUIII Counter",
      "═══════════════════════════════════════",
    ].join("\n");
  }, [state]);

  const copyStats = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getReportText());
      showToast("Statistics copied to clipboard!", "📋");
    } catch {
      showToast("Copy failed. Try again.", "❌");
    }
  }, [getReportText, showToast]);

  const downloadReport = useCallback(() => {
    const blob = new Blob([getReportText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "suiii-counter-report.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Report downloaded!", "📥");
  }, [getReportText, showToast]);

  const resetStats = useCallback(() => {
    if (confirm("Are you sure you want to reset ALL statistics, achievements, and challenge records? This cannot be undone.")) {
      const def = getDefaultState();
      def.theme = state.theme;
      def.soundOn = state.soundOn;
      def.volume = state.volume;
      def.soundMode = state.soundMode;
      def.selectedSound = state.selectedSound;
      setState(def);
      setCombo(0);
      resetChallenge();
      showToast("All statistics reset.", "🗑️");
    }
  }, [state.theme, state.soundOn, state.volume, state.soundMode, state.selectedSound, resetChallenge, showToast]);

  /* ── derived values ── */
  const achievementPercent = useMemo(() => {
    if (ACHIEVEMENTS.length === 0) return 0;
    return Math.round((state.achievements.length / ACHIEVEMENTS.length) * 100);
  }, [state.achievements]);

  /* ── render ── */
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-6xl border border-slate-200 flex flex-col items-center gap-4">
          <div className="h-8 w-48 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-20 w-20 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-4 w-32 rounded-full bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-screen ${theme.bg} flex flex-col items-center p-4 font-sans transition-colors duration-300`}
      style={shaking ? { animation: "suiii-shake 0.15s ease-in-out" } : undefined}
    >
      {/* Main container */}
      <div className={`w-full max-w-6xl rounded-2xl border p-5 sm:p-8 shadow-lg flex flex-col gap-6 transition-colors duration-300 ${theme.card}`}>

        {/* Header */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${theme.accent}`}>Fun</p>
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight ${theme.text}`}>
            SUIII Counter
          </h1>
          <p className={`text-base max-w-2xl ${theme.muted}`}>
            Celebrate every SUIII with sound effects, achievements, combos, statistics and challenge mode.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: "counter", label: "Counter" },
            { id: "stats", label: "Statistics" },
            { id: "challenge", label: "Challenge" },
            { id: "achievements", label: "Achievements" },
            { id: "settings", label: "Settings" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                tab === t.id
                  ? `${theme.accentBg} text-white ${theme.accentBorder}`
                  : `${theme.card} ${theme.text} hover:opacity-80`
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ COUNTER TAB ═══ */}
        {tab === "counter" && (
          <div className="flex flex-col items-center gap-6">

            {/* Hero card */}
            <div className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 w-full transition-all duration-200 ${theme.card} ${theme.cardHover}`}>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />

              {/* Challenge banner */}
              {(challengePrimed || challengeActive || challengeFinished) && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏱️</span>
                    {challengePrimed && <span className={`text-sm font-semibold ${theme.text}`}>Challenge Primed — Click SUIIIIIII to start!</span>}
                    {challengeActive && (
                      <span className={`text-sm font-semibold ${theme.text}`}>
                        {challengeTimeLeft.toFixed(1)}s remaining — Score: {challengeScore}
                      </span>
                    )}
                    {challengeFinished && (
                      <span className={`text-sm font-semibold ${theme.text}`}>
                        Challenge Over! Score: {challengeScore}
                        {challengeScore > (state.challengeScores[challengeDuration] || 0) ? " 🏆 NEW RECORD!" : ""}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={resetChallenge}
                    className={`text-xs font-medium px-3 py-1 rounded-full border ${theme.accentBorder} ${theme.text} hover:opacity-80 transition`}
                  >
                    {challengeFinished ? "Close" : "Cancel"}
                  </button>
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${theme.accent}`}>SUIIIs</p>
                <p
                  className={`text-6xl sm:text-7xl md:text-8xl font-black tabular-nums tracking-tight ${theme.text}`}
                  style={{
                    animation: bouncing ? "suiii-bounce 0.3s ease-out" : "none",
                    color: theme.counterColor,
                  }}
                >
                  {formatNumber(state.lifetime)}
                </p>
              </div>

              {/* Mini stat strip */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: "Today", value: formatNumber(state.today) },
                  { label: "This Week", value: formatNumber(state.weekly) },
                  { label: "Lifetime", value: formatNumber(state.lifetime) },
                  { label: "Current Combo", value: combo > 0 ? `x${combo}` : "—" },
                  { label: "Best Combo", value: state.bestCombo > 0 ? `x${state.bestCombo}` : "—" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-xl border p-3 text-center transition-all duration-200 hover:-translate-y-0.5 ${theme.card} ${theme.cardHover}`}
                  >
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${theme.muted}`}>{item.label}</p>
                    <p className={`mt-1 text-lg font-bold tabular-nums ${theme.text}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SUIIIIIII Button */}
            <div className="relative flex items-center justify-center" style={{ minHeight: 200 }}>
              {/* Particles */}
              {particles.map((p) => (
                <span
                  key={p.id}
                  className="absolute pointer-events-none select-none"
                  style={{
                    fontSize: `${p.scale * 24}px`,
                    left: "50%",
                    top: "50%",
                    animation: "suiii-particle 0.9s ease-out forwards",
                    transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
                  }}
                >
                  {p.emoji}
                </span>
              ))}

              {/* Floaters */}
              {floaters.map((f) => (
                <span
                  key={f.id}
                  className="absolute pointer-events-none select-none font-black"
                  style={{
                    left: `calc(50% + ${f.x}px)`,
                    top: "30%",
                    fontSize: `${f.scale * 20}px`,
                    color: theme.counterColor,
                    animation: "suiii-float 0.9s ease-out forwards",
                    textShadow: `0 0 12px ${theme.counterColor}40`,
                  }}
                >
                  {f.text}
                </span>
              ))}

              {/* Pulse ring */}
              {bouncing && (
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: 180,
                    height: 180,
                    animation: "suiii-pulse-ring 0.6s ease-out forwards",
                    border: `2px solid ${theme.counterColor}`,
                    opacity: 0.5,
                  }}
                />
              )}

              {/* The button */}
              <button
                type="button"
                onClick={handleClick}
                disabled={challengeFinished}
                aria-label="SUIIIIIII celebration button"
                className="relative rounded-full font-black text-white text-xl sm:text-2xl transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-orange-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none"
                style={{
                  width: 160,
                  height: 160,
                  background: theme.buttonGradient,
                  boxShadow: bouncing ? theme.buttonGlow : theme.buttonShadow,
                  animation: bouncing ? "suiii-bounce 0.3s ease-out" : combo > 0 ? "suiii-glow-pulse 1.5s ease-in-out infinite" : "none",
                }}
              >
                SUIIIIIII
                {combo > 2 && (
                  <span
                    className="absolute -top-3 -right-3 rounded-full text-white text-xs font-bold px-2 py-1"
                    style={{ background: theme.buttonGradient, boxShadow: `0 4px 12px ${theme.counterColor}60` }}
                  >
                    x{combo}
                  </span>
                )}
              </button>
            </div>

            {/* Keyboard hint */}
            <p className={`text-xs ${theme.muted}`}>
              Press <kbd className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${theme.card} ${theme.text}`}>Space</kbd>{" "}
              <kbd className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${theme.card} ${theme.text}`}>Enter</kbd>{" "}
              or <kbd className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${theme.card} ${theme.text}`}>S</kbd> to SUIII
            </p>
          </div>
        )}

        {/* ═══ STATISTICS TAB ═══ */}
        {tab === "stats" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${theme.text}`}>Statistics</h2>
              <div className="flex gap-2">
                <button type="button" onClick={copyStats} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 ${theme.card} ${theme.text}`}>
                  📋 Copy
                </button>
                <button type="button" onClick={downloadReport} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 ${theme.card} ${theme.text}`}>
                  📥 Download
                </button>
                <button type="button" onClick={resetStats} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 border-red-300 text-red-600`}>
                  🗑️ Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Today's SUIIIs", value: formatNumber(state.today) },
                { label: "Weekly", value: formatNumber(state.weekly) },
                { label: "Monthly", value: formatNumber(state.monthly) },
                { label: "Lifetime", value: formatNumber(state.lifetime) },
                { label: "Fastest Click/Sec", value: `${state.fastestCps}/sec` },
                { label: "Highest Combo", value: state.bestCombo > 0 ? `x${state.bestCombo}` : "—" },
                { label: "Avg Click Interval", value: state.avgClickSpeed > 0 ? `${state.avgClickSpeed}ms` : "—" },
                { label: "Longest Session", value: state.longestSession > 0 ? `${state.longestSession}s` : "—" },
                { label: "Sessions Played", value: formatNumber(state.sessionsPlayed) },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${theme.card} ${theme.cardHover}`}
                >
                  <p className={`text-xs font-medium uppercase tracking-wider ${theme.muted}`}>{item.label}</p>
                  <p className={`mt-2 text-2xl font-bold tabular-nums ${theme.text}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ CHALLENGE TAB ═══ */}
        {tab === "challenge" && (
          <div className="flex flex-col gap-4">
            <h2 className={`text-lg font-semibold ${theme.text}`}>Challenge Mode</h2>
            <p className={`text-sm ${theme.muted}`}>Get as many SUIIIs as possible within the time limit!</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CHALLENGE_DURATIONS.map((dur) => (
                <div
                  key={dur.value}
                  className={`rounded-2xl border p-5 flex flex-col items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 ${theme.card} ${theme.cardHover}`}
                >
                  <p className={`text-3xl font-black ${theme.text}`}>{dur.value}s</p>
                  <p className={`text-sm ${theme.muted}`}>{dur.label} Challenge</p>
                  <p className={`text-xs ${theme.muted}`}>
                    Best: <span className={`font-bold ${theme.text}`}>{formatNumber(state.challengeScores[dur.value] || 0)}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => startChallenge(dur.value)}
                    className={`w-full rounded-lg border py-2.5 text-sm font-semibold transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500 ${theme.accentBg} text-white ${theme.accentBorder}`}
                  >
                    Start Challenge
                  </button>
                </div>
              ))}
            </div>

            {/* Challenge high scores */}
            <div className={`rounded-2xl border p-4 ${theme.card}`}>
              <h3 className={`text-sm font-semibold ${theme.text} mb-3`}>High Scores</h3>
              <div className="flex flex-col gap-2">
                {CHALLENGE_DURATIONS.map((dur) => {
                  const score = state.challengeScores[dur.value] || 0;
                  return (
                    <div key={dur.value} className="flex items-center justify-between">
                      <span className={`text-sm ${theme.muted}`}>{dur.label}</span>
                      <span className={`text-sm font-bold tabular-nums ${theme.text}`}>{formatNumber(score)} SUIIIs</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ ACHIEVEMENTS TAB ═══ */}
        {tab === "achievements" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${theme.text}`}>Achievements</h2>
              <span className={`text-sm font-medium ${theme.muted}`}>{achievementPercent}% Complete</span>
            </div>

            {/* Progress bar */}
            <div className={`rounded-full h-3 overflow-hidden border ${theme.card}`}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${achievementPercent}%`,
                  background: theme.buttonGradient,
                }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = state.achievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`rounded-2xl border p-4 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                      unlocked ? `${theme.card} ${theme.cardHover}` : `opacity-40 ${theme.card}`
                    }`}
                  >
                    <span className="text-3xl block mb-2" style={{ filter: unlocked ? "none" : "grayscale(1)" }}>
                      {ach.icon}
                    </span>
                    <p className={`text-xs font-semibold ${theme.text}`}>{ach.label}</p>
                    <p className={`text-[10px] mt-1 ${theme.muted}`}>{ach.description}</p>
                    {unlocked && <p className="text-[10px] mt-1 text-green-500 font-semibold">✓ Unlocked</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {tab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sound settings */}
            <div className={`rounded-2xl border p-5 flex flex-col gap-4 ${theme.card}`}>
              <h2 className={`text-base font-semibold ${theme.text}`}>Sound Settings</h2>

              {/* Toggle */}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme.muted}`}>Sound</span>
                <button
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, soundOn: !prev.soundOn }))}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    state.soundOn ? "bg-green-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      state.soundOn ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Volume */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme.muted}`}>Volume</span>
                  <span className={`text-xs tabular-nums ${theme.text}`}>{Math.round(state.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={state.volume}
                  onChange={(e) => setState((prev) => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-full accent-orange-500"
                />
              </div>

              {/* Mode */}
              <div className="flex flex-col gap-2">
                <span className={`text-sm ${theme.muted}`}>Playback Mode</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, soundMode: "random" }))}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                      state.soundMode === "random" ? `${theme.accentBg} text-white ${theme.accentBorder}` : `${theme.card} ${theme.text}`
                    }`}
                  >
                    🎲 Random
                  </button>
                  <button
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, soundMode: "specific" }))}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                      state.soundMode === "specific" ? `${theme.accentBg} text-white ${theme.accentBorder}` : `${theme.card} ${theme.text}`
                    }`}
                  >
                    🎯 Specific
                  </button>
                </div>
              </div>

              {/* Specific sound selector */}
              {state.soundMode === "specific" && (
                <div className="flex flex-col gap-2">
                  <span className={`text-sm ${theme.muted}`}>Choose Sound</span>
                  <div className="flex flex-wrap gap-2">
                    {AUDIO_FILES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setState((prev) => ({ ...prev, selectedSound: i }))}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          state.selectedSound === i ? `${theme.accentBg} text-white ${theme.accentBorder}` : `${theme.card} ${theme.text}`
                        }`}
                      >
                        SUIII {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme settings */}
            <div className={`rounded-2xl border p-5 flex flex-col gap-4 ${theme.card}`}>
              <h2 className={`text-base font-semibold ${theme.text}`}>Theme</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, theme: key }))}
                    className={`rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                      state.theme === key ? `ring-2 ring-orange-500 ${t.card}` : `${t.card}`
                    }`}
                    style={{ background: key === "classic" ? "#fff" : key === "gold" ? "#231e16" : key === "neon" ? "#1a0028" : "#143814" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: t.counterColor }}>{t.name}</p>
                    <div className="flex gap-1 mt-2">
                      {t.particleColors.map((c, i) => (
                        <span key={i} className="w-4 h-4 rounded-full inline-block border border-white/20" style={{ background: c }} />
                      ))}
                    </div>
                    {state.theme === key && <p className="text-[10px] mt-2 text-green-500 font-semibold">✓ Active</p>}
                  </button>
                ))}
              </div>
            </div>

            {/* Export section */}
            <div className={`rounded-2xl border p-5 flex flex-col gap-4 lg:col-span-2 ${theme.card}`}>
              <h2 className={`text-base font-semibold ${theme.text}`}>Export & Reset</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyStats}
                  className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-md ${theme.card} ${theme.text}`}
                >
                  📋 Copy Statistics
                </button>
                <button
                  type="button"
                  onClick={downloadReport}
                  className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-md ${theme.card} ${theme.text}`}
                >
                  📥 Download TXT Report
                </button>
                <button
                  type="button"
                  onClick={resetStats}
                  className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md"
                >
                  🗑️ Reset Statistics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className={`text-center text-xs ${theme.muted}`}>
          100% client-side. No data leaves your browser. All stats saved locally.
        </p>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-2xl flex items-center gap-2"
          style={{ animation: "suiii-toast-in 0.3s ease-out" }}
        >
          <span className="text-lg">{toast.icon}</span>
          <span className="text-sm font-semibold text-slate-900">{toast.message}</span>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes suiii-shake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-3px, 2px); }
          40% { transform: translate(3px, -2px); }
          60% { transform: translate(-2px, -1px); }
          80% { transform: translate(2px, 1px); }
        }

        @keyframes suiii-bounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.12); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }

        @keyframes suiii-particle {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(var(--px, 80px), var(--py, -120px)) scale(0.2) rotate(360deg);
          }
        }

        @keyframes suiii-float {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-80px) scale(0.6);
          }
        }

        @keyframes suiii-pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes suiii-glow-pulse {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
          }
          50% {
            box-shadow: 0 8px 48px rgba(245, 158, 11, 0.6);
          }
        }

        @keyframes suiii-toast-in {
          0% {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}

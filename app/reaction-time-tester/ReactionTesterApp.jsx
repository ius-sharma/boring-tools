"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";

// Local storage key
const STORAGE_KEY = "boringtools_reaction_tester_v2";

// Sound synthesis helper (Web Audio API)
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  playHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  playPerfect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.06);
      osc.frequency.setValueAtTime(880.00, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {}
  }

  playEarly() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }

  playFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.08);
        osc.stop(this.ctx.currentTime + i * 0.08 + 0.2);
      });
    } catch (e) {}
  }
}

const sfx = new SoundFX();

// Achievements definition
const ACHIEVEMENTS_LIST = [
  { id: "sub_200", title: "⚡ Lightning Reflexes", desc: "Achieve under 200 ms average in Reaction Test", icon: "⚡" },
  { id: "acc_100", title: "🎯 Hawkeye Precision", desc: "Score 100% Accuracy in Mouse Accuracy Test", icon: "🎯" },
  { id: "tests_10", title: "🔥 Dedicated Benchmark", desc: "Complete 10 performance sessions", icon: "🔥" },
  { id: "elite_90", title: "🏆 Elite Human Performance", desc: "Reach an Overall Score of 90+", icon: "🏆" },
  { id: "perfect_session", title: "💯 Marksman", desc: "Score 5+ Perfect hits in Precision Mode", icon: "💯" },
  { id: "speed_demon", title: "⚡ Speed Demon", desc: "Reach a peak of 10+ CPS in Click Speed Test", icon: "⚡" },
  { id: "tracker_master", title: "👁️ Tracker Master", desc: "Complete Target Tracking with 90%+ Accuracy", icon: "👁️" },
  { id: "daily_hero", title: "📅 Daily Challenger", desc: "Complete a Daily Challenge objective", icon: "📅" }
];

// Helper to determine rank based on reaction time
function getReactionRank(ms) {
  if (!ms || ms <= 0) return { title: "N/A", emoji: "❓", color: "text-slate-500 border-slate-200 bg-slate-100" };
  if (ms < 150) return { title: "Lightning", emoji: "⚡", color: "text-amber-700 border-amber-300 bg-amber-50" };
  if (ms <= 200) return { title: "Elite", emoji: "👑", color: "text-purple-700 border-purple-300 bg-purple-50" };
  if (ms <= 250) return { title: "Diamond", emoji: "🥇", color: "text-cyan-700 border-cyan-300 bg-cyan-50" };
  if (ms <= 300) return { title: "Gold", emoji: "🥈", color: "text-yellow-700 border-yellow-300 bg-yellow-50" };
  if (ms <= 350) return { title: "Silver", emoji: "🥉", color: "text-slate-700 border-slate-300 bg-slate-100" };
  return { title: "Beginner", emoji: "🔰", color: "text-emerald-700 border-emerald-300 bg-emerald-50" };
}

// Helper to calculate overall score (0-100)
function calculateOverallScore({ mode, reactionMs, accuracyPct, cps, precisionPct, consistencyPct }) {
  let score = 70;
  if (mode === "reaction") {
    if (reactionMs) {
      if (reactionMs <= 150) score = 98;
      else if (reactionMs <= 200) score = 90 + ((200 - reactionMs) / 50) * 8;
      else if (reactionMs <= 250) score = 80 + ((250 - reactionMs) / 50) * 10;
      else if (reactionMs <= 300) score = 70 + ((300 - reactionMs) / 50) * 10;
      else if (reactionMs <= 400) score = 50 + ((400 - reactionMs) / 100) * 20;
      else score = Math.max(30, 50 - ((reactionMs - 400) / 10));
    }
    if (consistencyPct) score = Math.min(100, Math.max(0, Math.round(score * 0.8 + consistencyPct * 0.2)));
  } else if (mode === "accuracy") {
    const accWeight = (accuracyPct || 0) * 0.7;
    const timeBonus = reactionMs ? Math.max(0, (500 - reactionMs) / 10) * 0.3 : 15;
    score = Math.min(100, Math.max(0, Math.round(accWeight + timeBonus)));
  } else if (mode === "cps") {
    score = Math.min(100, Math.max(20, Math.round((cps || 0) * 8.5)));
  } else if (mode === "precision") {
    score = Math.min(100, Math.max(0, Math.round((precisionPct || 0) * 0.85 + (accuracyPct || 0) * 0.15)));
  } else if (mode === "tracking") {
    score = Math.min(100, Math.max(0, Math.round((accuracyPct || 0) * 0.8 + (consistencyPct || 75) * 0.2)));
  }
  return Math.round(score);
}

export default function ReactionTesterApp() {
  const [activeMode, setActiveMode] = useState("home");
  const [gameState, setGameState] = useState("idle");

  const [settings, setSettings] = useState({
    soundEnabled: true,
    targetSize: "medium",
    difficulty: "normal",
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  const [storedData, setStoredData] = useState({
    personalBests: { reaction: null, accuracy: null, cps: null, precision: null, tracking: null },
    history: [],
    unlockedAchievements: [],
    stats: { totalTests: 0, totalClicks: 0, secondsPracticed: 0 },
    dailyCompleted: null,
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    sfx.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setStoredData((prev) => ({
          ...prev,
          ...parsed,
          personalBests: { ...prev.personalBests, ...(parsed.personalBests || {}) },
          stats: { ...prev.stats, ...(parsed.stats || {}) },
        }));
      }
    } catch (e) {}
  }, []);

  const saveStoredData = useCallback((newData) => {
    setStoredData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {}
  }, []);

  const triggerToast = useCallback((msg, icon = "🏆") => {
    setToast({ msg, icon, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const checkAchievements = useCallback((sessionData, currentStored) => {
    const newlyUnlocked = [];
    const unlocked = new Set(currentStored.unlockedAchievements || []);

    if (!unlocked.has("sub_200") && sessionData.mode === "reaction" && sessionData.avgReaction && sessionData.avgReaction < 200) {
      newlyUnlocked.push("sub_200");
    }
    if (!unlocked.has("acc_100") && sessionData.mode === "accuracy" && sessionData.accuracyPct === 100) {
      newlyUnlocked.push("acc_100");
    }
    if (!unlocked.has("tests_10") && (currentStored.stats.totalTests + 1) >= 10) {
      newlyUnlocked.push("tests_10");
    }
    if (!unlocked.has("elite_90") && sessionData.overallScore >= 90) {
      newlyUnlocked.push("elite_90");
    }
    if (!unlocked.has("perfect_session") && sessionData.mode === "precision" && sessionData.perfectHits >= 5) {
      newlyUnlocked.push("perfect_session");
    }
    if (!unlocked.has("speed_demon") && sessionData.mode === "cps" && sessionData.peakCps >= 10) {
      newlyUnlocked.push("speed_demon");
    }
    if (!unlocked.has("tracker_master") && sessionData.mode === "tracking" && sessionData.accuracyPct >= 90) {
      newlyUnlocked.push("tracker_master");
    }

    if (newlyUnlocked.length > 0) {
      const updatedList = [...Array.from(unlocked), ...newlyUnlocked];
      newlyUnlocked.forEach((id) => {
        const item = ACHIEVEMENTS_LIST.find((a) => a.id === id);
        if (item) {
          triggerToast(`Unlocked Achievement: ${item.title}`, item.icon);
          sfx.playFanfare();
        }
      });
      return updatedList;
    }
    return Array.from(unlocked);
  }, [triggerToast]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const dailyChallenge = useMemo(() => {
    const dayChar = todayStr.charCodeAt(todayStr.length - 1);
    if (dayChar % 2 === 0) {
      return {
        id: "daily_reaction",
        title: "Sub-220ms Reflex Goal",
        description: "Achieve an average reaction speed under 220 ms in Reaction Test.",
        mode: "reaction",
        targetVal: 220,
      };
    } else {
      return {
        id: "daily_accuracy",
        title: "Sharpshooter 95% Goal",
        description: "Achieve at least 95% accuracy in Mouse Accuracy Test.",
        mode: "accuracy",
        targetVal: 95,
      };
    }
  }, [todayStr]);

  const isDailyCompleted = storedData.dailyCompleted === todayStr;

  // -------------------------------------------------------------
  // GAME METRICS & REFS
  // -------------------------------------------------------------
  const arenaRef = useRef(null);

  // 1. REACTION TIME TEST STATE
  const [reactionAttempts, setReactionAttempts] = useState([]);
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [reactionStateText, setReactionStateText] = useState("Click Anywhere to Start");
  const reactionTimerRef = useRef(null);

  // 2. MOUSE ACCURACY STATE
  const [accuracyTargets, setAccuracyTargets] = useState([]);
  const [accuracyHits, setAccuracyHits] = useState(0);
  const [accuracyMisses, setAccuracyMisses] = useState(0);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const targetStartTimeRef = useRef(0);
  const targetTimesRef = useRef([]);

  // 3. CPS TEST STATE
  const [cpsClicks, setCpsClicks] = useState(0);
  const [cpsTimeLeft, setCpsTimeLeft] = useState(30);
  const [peakCps, setPeakCps] = useState(0);
  const cpsTimerRef = useRef(null);

  // 4. PRECISION MODE STATE
  const [precisionTargets, setPrecisionTargets] = useState([]);
  const [precisionScore, setPrecisionScore] = useState(0);
  const [precisionHits, setPrecisionHits] = useState({ perfect: 0, great: 0, good: 0, miss: 0 });
  const [floatingPopups, setFloatingPopups] = useState([]);
  const precisionAnimRef = useRef(null);

  // 5. TARGET TRACKING STATE
  const [trackingCircles, setTrackingCircles] = useState([]);
  const [activeCircleId, setActiveCircleId] = useState(null);
  const [trackingHits, setTrackingHits] = useState(0);
  const [trackingMistakes, setTrackingMistakes] = useState(0);
  const [trackingTotalAttempts, setTrackingTotalAttempts] = useState(0);

  // SESSION RESULTS STATE
  const [sessionResults, setSessionResults] = useState(null);

  useEffect(() => {
    return () => {
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      if (cpsTimerRef.current) clearInterval(cpsTimerRef.current);
      if (precisionAnimRef.current) cancelAnimationFrame(precisionAnimRef.current);
    };
  }, []);

  // -------------------------------------------------------------
  // REACTION TIME TEST
  // -------------------------------------------------------------
  const startReactionTest = () => {
    setActiveMode("reaction");
    setGameState("idle");
    setReactionAttempts([]);
    setReactionStateText("Click anywhere inside this area to start 5-attempt session");
  };

  const triggerReactionWait = () => {
    setGameState("waiting");
    setReactionStateText("Wait for Green...");
    const delay = Math.floor(Math.random() * 3000) + 2000;
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = setTimeout(() => {
      setGameState("ready");
      setReactionStartTime(performance.now());
      setReactionStateText("CLICK NOW!");
      sfx.playHit();
    }, delay);
  };

  const handleReactionClick = () => {
    sfx.playClick();
    if (gameState === "idle") {
      triggerReactionWait();
    } else if (gameState === "waiting") {
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      setGameState("early");
      setReactionStateText("Too Early! Click to try this attempt again.");
      sfx.playEarly();
    } else if (gameState === "early") {
      triggerReactionWait();
    } else if (gameState === "ready") {
      const endTime = performance.now();
      const reactMs = Math.round(endTime - reactionStartTime);
      const updated = [...reactionAttempts, reactMs];
      setReactionAttempts(updated);

      if (updated.length >= 5) {
        finishReactionTest(updated);
      } else {
        setGameState("idle");
        setReactionStateText(`${reactMs} ms! Click to start attempt ${updated.length + 1} of 5.`);
      }
    }
  };

  const finishReactionTest = (attempts) => {
    const valid = attempts.filter((a) => typeof a === "number");
    const fastest = Math.min(...valid);
    const slowest = Math.max(...valid);
    const sum = valid.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / valid.length);
    const sorted = [...valid].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    const variance = valid.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / valid.length;
    const stdDev = Math.sqrt(variance);
    const consistencyPct = Math.max(0, Math.min(100, Math.round(100 - (stdDev / avg) * 100)));

    const overallScore = calculateOverallScore({
      mode: "reaction",
      reactionMs: avg,
      consistencyPct,
    });

    const rank = getReactionRank(avg);

    const res = {
      mode: "reaction",
      modeTitle: "Reaction Time Test",
      attempts: valid,
      fastest,
      slowest,
      avgReaction: avg,
      median,
      consistencyPct,
      overallScore,
      rank,
      primaryMetric: `${avg} ms`,
      secondaryMetric: `Fastest: ${fastest}ms | Median: ${median}ms`,
    };

    setSessionResults(res);
    setGameState("finished");
    sfx.playFanfare();
    saveSessionResults(res);
  };

  // -------------------------------------------------------------
  // MOUSE ACCURACY TEST
  // -------------------------------------------------------------
  const spawnAccuracyTargets = useCallback(() => {
    const total = 30;
    const sizeMultiplier = settings.targetSize === "small" ? 0.7 : settings.targetSize === "large" ? 1.3 : 1.0;
    const isHard = settings.difficulty === "hard";

    const targets = [];
    for (let i = 0; i < total; i++) {
      const radius = Math.floor((Math.random() * 20 + 22) * sizeMultiplier * (isHard ? 0.65 : 1.0));
      const xPct = Math.floor(Math.random() * 80) + 10;
      const yPct = Math.floor(Math.random() * 75) + 12;
      targets.push({ id: i, xPct, yPct, radius });
    }
    return targets;
  }, [settings.targetSize, settings.difficulty]);

  const startAccuracyTest = () => {
    setActiveMode("accuracy");
    const targets = spawnAccuracyTargets();
    setAccuracyTargets(targets);
    setCurrentTargetIndex(0);
    setAccuracyHits(0);
    setAccuracyMisses(0);
    targetTimesRef.current = [];
    setGameState("playing");
    targetStartTimeRef.current = performance.now();
  };

  const handleAccuracyTargetClick = (e, index) => {
    e.stopPropagation();
    sfx.playHit();
    const clickTime = performance.now();
    const delta = clickTime - targetStartTimeRef.current;
    targetTimesRef.current.push(delta);

    const newHits = accuracyHits + 1;
    setAccuracyHits(newHits);

    if (index + 1 >= 30) {
      finishAccuracyTest(newHits, accuracyMisses, targetTimesRef.current);
    } else {
      setCurrentTargetIndex(index + 1);
      targetStartTimeRef.current = performance.now();
    }
  };

  const handleAccuracyMissClick = () => {
    if (gameState !== "playing") return;
    sfx.playEarly();
    setAccuracyMisses((prev) => prev + 1);
  };

  const finishAccuracyTest = (hits, misses, times) => {
    const totalClicks = hits + misses;
    const accuracyPct = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 0;
    const avgTimePerTarget = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    const totalTimeSec = (times.reduce((a, b) => a + b, 0) / 1000).toFixed(2);

    const overallScore = calculateOverallScore({
      mode: "accuracy",
      reactionMs: avgTimePerTarget,
      accuracyPct,
    });

    const rank = getReactionRank(avgTimePerTarget);

    const res = {
      mode: "accuracy",
      modeTitle: "Mouse Accuracy Test",
      hits,
      misses,
      accuracyPct,
      avgTimePerTarget,
      totalTimeSec,
      overallScore,
      rank,
      primaryMetric: `${accuracyPct}% Accuracy`,
      secondaryMetric: `Avg Target Time: ${avgTimePerTarget}ms | Total: ${totalTimeSec}s`,
    };

    setSessionResults(res);
    setGameState("finished");
    sfx.playFanfare();
    saveSessionResults(res);
  };

  // -------------------------------------------------------------
  // CPS TEST
  // -------------------------------------------------------------
  const startCpsTest = () => {
    setActiveMode("cps");
    setGameState("idle");
    setCpsClicks(0);
    setCpsTimeLeft(30);
    setPeakCps(0);
  };

  const triggerCpsStart = () => {
    setGameState("playing");
    setCpsClicks(1);
    sfx.playClick();
    setCpsTimeLeft(30);
    setPeakCps(0);

    let elapsed = 0;
    let clickCount = 1;

    if (cpsTimerRef.current) clearInterval(cpsTimerRef.current);
    cpsTimerRef.current = setInterval(() => {
      elapsed += 1;
      const remaining = 30 - elapsed;
      setCpsTimeLeft(remaining);

      setCpsClicks((prevCount) => {
        clickCount = prevCount;
        return prevCount;
      });

      const currentInstantCps = Number((clickCount / elapsed).toFixed(1));
      setPeakCps((prevPeak) => Math.max(prevPeak, currentInstantCps));

      if (remaining <= 0) {
        clearInterval(cpsTimerRef.current);
        finishCpsTest(clickCount);
      }
    }, 1000);
  };

  const handleCpsClick = () => {
    if (gameState === "idle") {
      triggerCpsStart();
    } else if (gameState === "playing") {
      sfx.playClick();
      setCpsClicks((prev) => prev + 1);
    }
  };

  const finishCpsTest = (totalClicks) => {
    const avgCps = Number((totalClicks / 30).toFixed(2));
    const overallScore = calculateOverallScore({
      mode: "cps",
      cps: avgCps,
    });

    const rank = avgCps >= 10 ? { title: "Lightning", emoji: "⚡" } : avgCps >= 8 ? { title: "Elite", emoji: "👑" } : avgCps >= 6 ? { title: "Diamond", emoji: "🥇" } : { title: "Gold", emoji: "🥈" };

    const res = {
      mode: "cps",
      modeTitle: "Click Speed Challenge (30s)",
      totalClicks,
      avgCps,
      peakCps,
      overallScore,
      rank,
      primaryMetric: `${avgCps} CPS`,
      secondaryMetric: `Total Clicks: ${totalClicks} | Peak CPS: ${peakCps}`,
    };

    setSessionResults(res);
    setGameState("finished");
    sfx.playFanfare();
    saveSessionResults(res);
  };

  // -------------------------------------------------------------
  // PRECISION MODE
  // -------------------------------------------------------------
  const startPrecisionMode = () => {
    setActiveMode("precision");
    setGameState("playing");
    setPrecisionScore(0);
    setPrecisionHits({ perfect: 0, great: 0, good: 0, miss: 0 });
    setFloatingPopups([]);

    const initial = [];
    for (let i = 0; i < 6; i++) {
      initial.push({
        id: i,
        xPct: Math.floor(Math.random() * 70) + 15,
        yPct: Math.floor(Math.random() * 60) + 20,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 28,
      });
    }
    setPrecisionTargets(initial);
  };

  useEffect(() => {
    if (activeMode === "precision" && gameState === "playing") {
      const updateLoop = () => {
        setPrecisionTargets((prevTargets) =>
          prevTargets.map((t) => {
            let nextX = t.xPct + t.vx;
            let nextY = t.yPct + t.vy;
            let vx = t.vx;
            let vy = t.vy;

            if (nextX <= 8 || nextX >= 88) vx = -vx;
            if (nextY <= 10 || nextY >= 82) vy = -vy;

            return { ...t, xPct: nextX, yPct: nextY, vx, vy };
          })
        );
        precisionAnimRef.current = requestAnimationFrame(updateLoop);
      };
      precisionAnimRef.current = requestAnimationFrame(updateLoop);
      return () => {
        if (precisionAnimRef.current) cancelAnimationFrame(precisionAnimRef.current);
      };
    }
  }, [activeMode, gameState]);

  const handlePrecisionTargetClick = (e, target) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const dist = Math.sqrt(Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2));
    const normalizedDist = dist / (rect.width / 2);

    let pts = 0;
    let label = "Good";
    let popupColor = "text-yellow-600 font-bold";

    if (normalizedDist <= 0.2) {
      pts = 100;
      label = "PERFECT! +100";
      popupColor = "text-emerald-600 font-extrabold scale-110";
      sfx.playPerfect();
      setPrecisionHits((prev) => ({ ...prev, perfect: prev.perfect + 1 }));
    } else if (normalizedDist <= 0.5) {
      pts = 75;
      label = "Great! +75";
      popupColor = "text-cyan-600 font-bold";
      sfx.playHit();
      setPrecisionHits((prev) => ({ ...prev, great: prev.great + 1 }));
    } else {
      pts = 50;
      label = "Good +50";
      popupColor = "text-amber-600";
      sfx.playClick();
      setPrecisionHits((prev) => ({ ...prev, good: prev.good + 1 }));
    }

    setPrecisionScore((prev) => prev + pts);

    const popupId = Date.now() + Math.random();
    setFloatingPopups((prev) => [
      ...prev,
      { id: popupId, text: label, xPct: target.xPct, yPct: target.yPct, color: popupColor },
    ]);
    setTimeout(() => {
      setFloatingPopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 800);

    setPrecisionTargets((prev) =>
      prev.map((t) =>
        t.id === target.id
          ? {
              ...t,
              xPct: Math.floor(Math.random() * 70) + 15,
              yPct: Math.floor(Math.random() * 60) + 20,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5,
            }
          : t
      )
    );

    const totalHits = precisionHits.perfect + precisionHits.great + precisionHits.good + precisionHits.miss + 1;
    if (totalHits >= 20) {
      finishPrecisionMode(precisionScore + pts, {
        ...precisionHits,
        [normalizedDist <= 0.2 ? "perfect" : normalizedDist <= 0.5 ? "great" : "good"]:
          precisionHits[normalizedDist <= 0.2 ? "perfect" : normalizedDist <= 0.5 ? "great" : "good"] + 1,
      });
    }
  };

  const handlePrecisionMissClick = () => {
    if (gameState !== "playing") return;
    sfx.playEarly();
    setPrecisionHits((prev) => ({ ...prev, miss: prev.miss + 1 }));
  };

  const finishPrecisionMode = (finalScore, hitsObj) => {
    const totalAttempts = hitsObj.perfect + hitsObj.great + hitsObj.good + hitsObj.miss;
    const precisionPct = totalAttempts > 0 ? Math.round(((hitsObj.perfect * 1.0 + hitsObj.great * 0.75 + hitsObj.good * 0.5) / totalAttempts) * 100) : 0;
    const accuracyPct = totalAttempts > 0 ? Math.round(((totalAttempts - hitsObj.miss) / totalAttempts) * 100) : 0;

    const overallScore = calculateOverallScore({
      mode: "precision",
      precisionPct,
      accuracyPct,
    });

    const rank = precisionPct >= 85 ? { title: "Elite", emoji: "👑" } : precisionPct >= 70 ? { title: "Diamond", emoji: "🥇" } : { title: "Gold", emoji: "🥈" };

    const res = {
      mode: "precision",
      modeTitle: "Precision Target Mode",
      finalScore,
      hitsObj,
      precisionPct,
      accuracyPct,
      perfectHits: hitsObj.perfect,
      overallScore,
      rank,
      primaryMetric: `${finalScore} Pts (${precisionPct}% Precision)`,
      secondaryMetric: `Perfect: ${hitsObj.perfect} | Great: ${hitsObj.great} | Good: ${hitsObj.good} | Miss: ${hitsObj.miss}`,
    };

    setSessionResults(res);
    setGameState("finished");
    sfx.playFanfare();
    saveSessionResults(res);
  };

  // -------------------------------------------------------------
  // TARGET TRACKING CHALLENGE
  // -------------------------------------------------------------
  const startTrackingMode = () => {
    setActiveMode("tracking");
    setGameState("playing");
    setTrackingHits(0);
    setTrackingMistakes(0);
    setTrackingTotalAttempts(0);

    const circles = [];
    for (let i = 0; i < 7; i++) {
      circles.push({
        id: i,
        xPct: Math.floor(Math.random() * 70) + 15,
        yPct: Math.floor(Math.random() * 60) + 20,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }
    setTrackingCircles(circles);
    setActiveCircleId(Math.floor(Math.random() * 7));
  };

  useEffect(() => {
    if (activeMode === "tracking" && gameState === "playing") {
      const updateLoop = () => {
        setTrackingCircles((prev) =>
          prev.map((c) => {
            let nextX = c.xPct + c.vx;
            let nextY = c.yPct + c.vy;
            let vx = c.vx;
            let vy = c.vy;

            if (nextX <= 8 || nextX >= 88) vx = -vx;
            if (nextY <= 10 || nextY >= 82) vy = -vy;

            return { ...c, xPct: nextX, yPct: nextY, vx, vy };
          })
        );
        precisionAnimRef.current = requestAnimationFrame(updateLoop);
      };
      precisionAnimRef.current = requestAnimationFrame(updateLoop);
      return () => {
        if (precisionAnimRef.current) cancelAnimationFrame(precisionAnimRef.current);
      };
    }
  }, [activeMode, gameState]);

  const handleTrackingCircleClick = (e, circleId) => {
    e.stopPropagation();
    const isTarget = circleId === activeCircleId;
    const newTotal = trackingTotalAttempts + 1;
    setTrackingTotalAttempts(newTotal);

    if (isTarget) {
      sfx.playHit();
      const newHits = trackingHits + 1;
      setTrackingHits(newHits);

      if (newHits >= 15) {
        finishTrackingMode(newHits, trackingMistakes, newTotal);
      } else {
        let nextTargetId = Math.floor(Math.random() * 7);
        while (nextTargetId === activeCircleId) {
          nextTargetId = Math.floor(Math.random() * 7);
        }
        setActiveCircleId(nextTargetId);
      }
    } else {
      sfx.playEarly();
      setTrackingMistakes((prev) => prev + 1);
    }
  };

  const finishTrackingMode = (hits, mistakes, totalAttempts) => {
    const accuracyPct = Math.round((hits / (hits + mistakes)) * 100);
    const overallScore = calculateOverallScore({
      mode: "tracking",
      accuracyPct,
    });

    const rank = accuracyPct >= 90 ? { title: "Elite", emoji: "👑" } : accuracyPct >= 75 ? { title: "Diamond", emoji: "🥇" } : { title: "Gold", emoji: "🥈" };

    const res = {
      mode: "tracking",
      modeTitle: "Target Tracking Challenge",
      hits,
      mistakes,
      accuracyPct,
      overallScore,
      rank,
      primaryMetric: `${accuracyPct}% Tracking Accuracy`,
      secondaryMetric: `Successful Hits: ${hits} | Mistakes: ${mistakes}`,
    };

    setSessionResults(res);
    setGameState("finished");
    sfx.playFanfare();
    saveSessionResults(res);
  };

  // -------------------------------------------------------------
  // SAVE RESULTS & UPDATE STATS
  // -------------------------------------------------------------
  const saveSessionResults = (res) => {
    const newStats = {
      ...storedData.stats,
      totalTests: storedData.stats.totalTests + 1,
      secondsPracticed: storedData.stats.secondsPracticed + 30,
    };

    const newPBs = { ...storedData.personalBests };
    if (res.mode === "reaction") {
      if (!newPBs.reaction || res.avgReaction < newPBs.reaction) newPBs.reaction = res.avgReaction;
    } else if (res.mode === "accuracy") {
      if (!newPBs.accuracy || res.accuracyPct > newPBs.accuracy) newPBs.accuracy = res.accuracyPct;
    } else if (res.mode === "cps") {
      if (!newPBs.cps || res.avgCps > newPBs.cps) newPBs.cps = res.avgCps;
    } else if (res.mode === "precision") {
      if (!newPBs.precision || res.precisionPct > newPBs.precision) newPBs.precision = res.precisionPct;
    } else if (res.mode === "tracking") {
      if (!newPBs.tracking || res.accuracyPct > newPBs.tracking) newPBs.tracking = res.accuracyPct;
    }

    let newDailyCompleted = storedData.dailyCompleted;
    if (dailyChallenge.mode === res.mode) {
      let passed = false;
      if (res.mode === "reaction" && res.avgReaction <= dailyChallenge.targetVal) passed = true;
      if (res.mode === "accuracy" && res.accuracyPct >= dailyChallenge.targetVal) passed = true;

      if (passed && storedData.dailyCompleted !== todayStr) {
        newDailyCompleted = todayStr;
        triggerToast(`Daily Challenge Completed! Reward Unlocked.`, "📅");
      }
    }

    const newHistory = [
      {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        mode: res.modeTitle,
        primaryMetric: res.primaryMetric,
        score: res.overallScore,
        rank: res.rank.title,
      },
      ...storedData.history.slice(0, 19),
    ];

    const updatedStored = {
      ...storedData,
      personalBests: newPBs,
      stats: newStats,
      history: newHistory,
      dailyCompleted: newDailyCompleted,
    };

    const updatedAchievements = checkAchievements(res, updatedStored);
    updatedStored.unlockedAchievements = updatedAchievements;

    saveStoredData(updatedStored);
  };

  // -------------------------------------------------------------
  // SHARE CARD CANVAS EXPORTER
  // -------------------------------------------------------------
  const downloadShareCardPng = () => {
    if (!sessionResults) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");

    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630);
    bgGradient.addColorStop(0, "#0f172a");
    bgGradient.addColorStop(0.5, "#1e1b4b");
    bgGradient.addColorStop(1, "#020617");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 630);

    ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
    ctx.beginPath();
    ctx.arc(1000, 150, 300, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("BoringTools", 80, 90);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 24px sans-serif";
    ctx.fillText("Human Performance Benchmark", 280, 90);

    ctx.fillStyle = "#ffffff";
    ctx.font = "extrabold 52px sans-serif";
    ctx.fillText(sessionResults.modeTitle, 80, 180);

    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 3;
    ctx.roundRect(80, 230, 480, 320, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 22px sans-serif";
    ctx.fillText("ASSIGNED RANK", 120, 280);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "extrabold 72px sans-serif";
    ctx.fillText(`${sessionResults.rank.emoji} ${sessionResults.rank.title}`, 120, 370);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "500 24px sans-serif";
    ctx.fillText(sessionResults.primaryMetric, 120, 440);

    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
    ctx.roundRect(620, 230, 500, 320, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 22px sans-serif";
    ctx.fillText("PERFORMANCE SCORE", 660, 280);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "extrabold 110px sans-serif";
    ctx.fillText(`${sessionResults.overallScore}`, 660, 400);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("/ 100", 870, 390);

    ctx.fillStyle = "#64748b";
    ctx.font = "500 20px sans-serif";
    ctx.fillText("Tested on boringtools.vercel.app/reaction-time-tester", 80, 585);

    const link = document.createElement("a");
    link.download = `boringtools-reaction-benchmark-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    triggerToast("PNG Performance Card downloaded!", "📥");
  };

  // -------------------------------------------------------------
  // RENDER UI MATCHING BORINGTOOLS DESIGN SYSTEM
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 sm:py-8 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-orange-600 text-white px-5 py-3 rounded-2xl font-bold shadow-xl border border-orange-500">
          <span className="text-xl">{toast.icon}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Main BoringTools Container */}
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        
        {/* Tool Header */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Productivity & Gaming</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Reaction Time & Mouse Accuracy Tester
          </h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Test your reaction speed, mouse precision, and click accuracy in real-time. Benchmark your reflexes and improve your scores.
          </p>

          {/* Quick Action Badges */}
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => setShowAchievementsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
            >
              <span>🏆 Badges</span>
              <span className="bg-orange-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {storedData.unlockedAchievements.length}
              </span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
            >
              <span>⚙️ Settings</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HOME / HERO VIEW */}
        {/* ========================================================= */}
        {activeMode === "home" && (
          <div className="flex flex-col gap-8">
            
            {/* Quick Stats Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Best Reaction</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {storedData.personalBests.reaction ? `${storedData.personalBests.reaction} ms` : "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">Sub-200ms target</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Best Accuracy</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {storedData.personalBests.accuracy ? `${storedData.personalBests.accuracy}%` : "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">30 Target practice</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Tests Completed</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {storedData.stats.totalTests}
                </p>
                <p className="mt-1 text-xs text-slate-500">Sessions benchmarked</p>
              </div>
            </div>

            {/* Daily Challenge Card */}
            <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl p-2 rounded-xl bg-orange-100 text-orange-600">📅</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Daily Objective</span>
                    {isDailyCompleted && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        COMPLETED ✓
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{dailyChallenge.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{dailyChallenge.description}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (dailyChallenge.mode === "reaction") startReactionTest();
                  else startAccuracyTest();
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm ${
                  isDailyCompleted
                    ? "bg-slate-200 text-slate-500 cursor-default"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {isDailyCompleted ? "Completed Today" : "Start Challenge"}
              </button>
            </div>

            {/* Benchmark Modes Grid */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">Choose a Benchmark Mode</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Mode 1 */}
                <div
                  onClick={startReactionTest}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xl mb-2 text-orange-500">⚡</div>
                    <h3 className="text-base font-bold text-slate-900">1. Reaction Time Test</h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                      Random wait period (2–5s) followed by instant visual trigger. Measure reaction time in milliseconds across 5 attempts. Anti-cheat included.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-orange-600">
                    <span>5 Attempts</span>
                    <span>Start Test →</span>
                  </div>
                </div>

                {/* Mode 2 */}
                <div
                  onClick={startAccuracyTest}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xl mb-2 text-cyan-600">🎯</div>
                    <h3 className="text-base font-bold text-slate-900">2. Mouse Accuracy Test</h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                      30 circular targets spawn randomly across grid. Tracks hit %, average time per target, and miss count.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-cyan-600">
                    <span>30 Targets</span>
                    <span>Start Test →</span>
                  </div>
                </div>

                {/* Mode 3 */}
                <div
                  onClick={startCpsTest}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xl mb-2 text-purple-600">🖱️</div>
                    <h3 className="text-base font-bold text-slate-900">3. Click Speed Challenge</h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                      30-second click sprint. Measure total clicks, peak CPS, and average clicks per second.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600">
                    <span>30 Sec Sprint</span>
                    <span>Start Test →</span>
                  </div>
                </div>

                {/* Mode 4 */}
                <div
                  onClick={startPrecisionMode}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xl mb-2 text-emerald-600">🎯</div>
                    <h3 className="text-base font-bold text-slate-900">4. Precision Mode</h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                      Click drifting target bullseyes close to exact center for score multipliers (Perfect +100, Great +75, Good +50).
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                    <span>Center Bullseye</span>
                    <span>Start Test →</span>
                  </div>
                </div>

                {/* Mode 5 */}
                <div
                  onClick={startTrackingMode}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xl mb-2 text-rose-600">👁️</div>
                    <h3 className="text-base font-bold text-slate-900">5. Target Tracking</h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                      Multiple moving circles float across arena. Track and hit only the designated active target while ignoring decoys.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-rose-600">
                    <span>Decoy Avoidance</span>
                    <span>Start Test →</span>
                  </div>
                </div>

              </div>
            </div>

            {/* History Table */}
            {storedData.history.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Performance History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="pb-2 px-2">Date</th>
                        <th className="pb-2 px-2">Mode</th>
                        <th className="pb-2 px-2">Result</th>
                        <th className="pb-2 px-2">Rank</th>
                        <th className="pb-2 px-2">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {storedData.history.slice(0, 5).map((item) => (
                        <tr key={item.id} className="hover:bg-white">
                          <td className="py-2.5 px-2 font-mono text-slate-500">{item.date}</td>
                          <td className="py-2.5 px-2 font-medium text-slate-900">{item.mode}</td>
                          <td className="py-2.5 px-2 font-bold text-orange-600">{item.primaryMetric}</td>
                          <td className="py-2.5 px-2 font-bold text-slate-700">{item.rank}</td>
                          <td className="py-2.5 px-2 font-bold text-slate-900">{item.score}/100</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* ACTIVE GAME ARENA */}
        {/* ========================================================= */}
        {activeMode !== "home" && gameState !== "finished" && (
          <div className="flex flex-col gap-4">
            {/* Live Controls Bar */}
            <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-600 pb-2 border-b border-slate-200">
              <button
                onClick={() => {
                  setActiveMode("home");
                  setGameState("idle");
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition font-bold"
              >
                ← Exit Arena
              </button>

              <div className="flex items-center gap-4 font-mono">
                {activeMode === "reaction" && (
                  <span>Attempts: <strong>{reactionAttempts.length} / 5</strong></span>
                )}
                {activeMode === "accuracy" && (
                  <>
                    <span>Target: <strong>{currentTargetIndex + 1} / 30</strong></span>
                    <span className="text-emerald-600">Hits: {accuracyHits}</span>
                    <span className="text-rose-600">Misses: {accuracyMisses}</span>
                  </>
                )}
                {activeMode === "cps" && (
                  <>
                    <span className="text-orange-600 font-bold">Time: {cpsTimeLeft}s</span>
                    <span>Clicks: {cpsClicks}</span>
                  </>
                )}
                {activeMode === "precision" && (
                  <>
                    <span>Hits: <strong>{precisionHits.perfect + precisionHits.great + precisionHits.good} / 20</strong></span>
                    <span className="text-orange-600 font-bold">Score: {precisionScore}</span>
                  </>
                )}
                {activeMode === "tracking" && (
                  <>
                    <span>Hits: <strong>{trackingHits} / 15</strong></span>
                    <span className="text-rose-600">Mistakes: {trackingMistakes}</span>
                  </>
                )}
              </div>
            </div>

            {/* Game Canvas Box */}
            <div
              ref={arenaRef}
              className={`relative min-h-[440px] rounded-2xl border transition-all duration-200 overflow-hidden flex items-center justify-center select-none cursor-pointer ${
                activeMode === "reaction"
                  ? gameState === "waiting"
                    ? "bg-purple-900 border-purple-600"
                    : gameState === "ready"
                    ? "bg-emerald-600 border-emerald-400"
                    : gameState === "early"
                    ? "bg-rose-900 border-rose-600"
                    : "bg-slate-900 border-slate-800"
                  : "bg-slate-950 border-slate-900"
              }`}
              onClick={(e) => {
                if (activeMode === "reaction") handleReactionClick();
                else if (activeMode === "accuracy") handleAccuracyMissClick();
                else if (activeMode === "cps") handleCpsClick();
                else if (activeMode === "precision") handlePrecisionMissClick();
              }}
            >
              {/* REACTION TEST */}
              {activeMode === "reaction" && (
                <div className="text-center px-6 pointer-events-none">
                  {gameState === "idle" && (
                    <>
                      <div className="text-5xl mb-3">⚡</div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{reactionStateText}</h2>
                      <p className="mt-2 text-xs text-slate-300">Click anywhere inside this box to trigger signal.</p>
                    </>
                  )}

                  {gameState === "waiting" && (
                    <>
                      <div className="text-5xl mb-3">⏳</div>
                      <h2 className="text-3xl sm:text-4xl font-black text-purple-100">{reactionStateText}</h2>
                      <p className="mt-2 text-xs text-purple-200">Keep steady... wait for green!</p>
                    </>
                  )}

                  {gameState === "ready" && (
                    <>
                      <div className="text-6xl mb-3">🎯</div>
                      <h2 className="text-4xl sm:text-5xl font-black text-slate-950 uppercase">{reactionStateText}</h2>
                      <p className="mt-2 text-sm text-slate-950 font-bold">CLICK NOW AS FAST AS YOU CAN!</p>
                    </>
                  )}

                  {gameState === "early" && (
                    <>
                      <div className="text-5xl mb-3">⚠️</div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-200">{reactionStateText}</h2>
                    </>
                  )}
                </div>
              )}

              {/* MOUSE ACCURACY */}
              {activeMode === "accuracy" && (
                <>
                  {accuracyTargets.length > 0 && currentTargetIndex < accuracyTargets.length && (
                    <button
                      onClick={(e) => handleAccuracyTargetClick(e, currentTargetIndex)}
                      style={{
                        top: `${accuracyTargets[currentTargetIndex].yPct}%`,
                        left: `${accuracyTargets[currentTargetIndex].xPct}%`,
                        width: `${accuracyTargets[currentTargetIndex].radius * 2}px`,
                        height: `${accuracyTargets[currentTargetIndex].radius * 2}px`,
                      }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 border-4 border-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95"
                    >
                      <span className="w-3 h-3 rounded-full bg-slate-950" />
                    </button>
                  )}
                </>
              )}

              {/* CPS TEST */}
              {activeMode === "cps" && (
                <div className="text-center px-6 pointer-events-none">
                  {gameState === "idle" && (
                    <>
                      <div className="text-5xl mb-3">🖱️</div>
                      <h2 className="text-2xl font-extrabold text-white">Click Anywhere to Start 30s Test</h2>
                    </>
                  )}

                  {gameState === "playing" && (
                    <>
                      <div className="text-6xl font-black text-amber-400 font-mono">
                        {cpsClicks}
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-widest text-slate-400 font-bold">Total Clicks</p>
                    </>
                  )}
                </div>
              )}

              {/* PRECISION MODE */}
              {activeMode === "precision" && (
                <>
                  {precisionTargets.map((t) => (
                    <button
                      key={t.id}
                      onClick={(e) => handlePrecisionTargetClick(e, t)}
                      style={{
                        top: `${t.yPct}%`,
                        left: `${t.xPct}%`,
                        width: `${t.radius * 2}px`,
                        height: `${t.radius * 2}px`,
                      }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-400 bg-emerald-500/20 shadow-lg flex items-center justify-center hover:scale-105"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      </span>
                    </button>
                  ))}

                  {floatingPopups.map((p) => (
                    <div
                      key={p.id}
                      style={{ top: `${p.yPct}%`, left: `${p.xPct}%` }}
                      className={`absolute pointer-events-none transform -translate-x-1/2 -translate-y-full text-xs font-bold ${p.color}`}
                    >
                      {p.text}
                    </div>
                  ))}
                </>
              )}

              {/* TARGET TRACKING */}
              {activeMode === "tracking" && (
                <>
                  {trackingCircles.map((c) => {
                    const isTarget = c.id === activeCircleId;
                    return (
                      <button
                        key={c.id}
                        onClick={(e) => handleTrackingCircleClick(e, c.id)}
                        style={{ top: `${c.yPct}%`, left: `${c.xPct}%` }}
                        className={`absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-transform shadow-lg flex items-center justify-center ${
                          isTarget
                            ? "bg-amber-500 border-amber-300 shadow-amber-500/50 scale-110"
                            : "bg-slate-800 border-slate-700 text-slate-500"
                        }`}
                      >
                        {isTarget ? (
                          <span className="w-3.5 h-3.5 rounded-full bg-slate-950" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-600" />
                        )}
                      </button>
                    );
                  })}
                </>
              )}

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FINAL RESULTS DASHBOARD */}
        {/* ========================================================= */}
        {gameState === "finished" && sessionResults && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <span className="text-xs uppercase font-bold text-orange-600 tracking-wider">
                Session Completed
              </span>

              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                {sessionResults.modeTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{sessionResults.secondaryMetric}</p>

              {/* Score & Rank Cards */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <span className="text-xs uppercase font-semibold text-slate-500">Human Performance Score</span>
                  <p className="mt-1 text-4xl font-extrabold text-slate-900">{sessionResults.overallScore} <span className="text-sm font-normal text-slate-500">/ 100</span></p>
                </div>

                <div className={`rounded-xl border p-5 ${sessionResults.rank.color}`}>
                  <span className="text-xs uppercase font-semibold opacity-80">Rank Tier</span>
                  <p className="mt-1 text-2xl font-extrabold flex items-center justify-center gap-1.5">
                    <span>{sessionResults.rank.emoji}</span>
                    <span>{sessionResults.rank.title}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    if (sessionResults.mode === "reaction") startReactionTest();
                    else if (sessionResults.mode === "accuracy") startAccuracyTest();
                    else if (sessionResults.mode === "cps") startCpsTest();
                    else if (sessionResults.mode === "precision") startPrecisionMode();
                    else startTrackingMode();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition"
                >
                  🔄 Retry Session
                </button>

                <button
                  onClick={downloadShareCardPng}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  📥 Download Share PNG
                </button>

                <button
                  onClick={() => {
                    setActiveMode("home");
                    setGameState("idle");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Choose Different Mode
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ACHIEVEMENTS MODAL */}
      {showAchievementsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🏆</span>
                <span>Unlocked Achievements</span>
              </h3>
              <button
                onClick={() => setShowAchievementsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-2">
              {ACHIEVEMENTS_LIST.map((item) => {
                const isUnlocked = storedData.unlockedAchievements.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                      isUnlocked
                        ? "bg-orange-50 border-orange-200 text-slate-900"
                        : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                    }`}
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs">{item.title}</h4>
                        {isUnlocked && (
                          <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.2 rounded-full">
                            UNLOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>⚙️</span>
                <span>Settings</span>
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-slate-900">Sound Effects</p>
                <p className="text-[11px] text-slate-500">Synthesized audio cues for clicks & hits</p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-orange-600 cursor-pointer"
              />
            </div>

            <div>
              <p className="font-bold text-xs text-slate-900 mb-2">Target Sizing</p>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                {["small", "medium", "large"].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSettings({ ...settings, targetSize: sz })}
                    className={`py-1.5 rounded-lg uppercase border transition ${
                      settings.targetSize === sz
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-bold text-xs text-slate-900 mb-2">Difficulty</p>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                {["easy", "normal", "hard"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSettings({ ...settings, difficulty: diff })}
                    className={`py-1.5 rounded-lg uppercase border transition ${
                      settings.difficulty === diff
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
            >
              Save & Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

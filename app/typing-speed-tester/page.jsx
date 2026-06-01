"use client";

import { useEffect, useRef, useState } from "react";
import ComingSoon from "../components/ComingSoon";

const TOOL_STATUS = "upcoming";

const PARAGRAPHS = [
  "The art of life lies in a constant readjustment to our surroundings. We must learn to flow like water, adapting to the shapes of the channels we pass through, yet retaining our essential nature and moving steadily toward our destination.",
  "Artificial intelligence is not a substitute for human intelligence; it is a tool to amplify it. The future belongs to those who learn to collaborate with technology, using it to solve complex challenges while preserving empathy, creativity, and ethics.",
  "Above the valley, the mountains rose like silent giants, their peaks dusted with eternal snow. A gentle wind swept through the pine forest, carrying the scent of rain and damp earth. In this quiet sanctuary, time seemed to stand completely still.",
  "Writing clean code is like writing a good book. It requires clarity of thought, a simple vocabulary, and respect for the reader. Refactoring is not a sign of failure, but a commitment to craftsmanship and long-term sustainability.",
  "Great things are done by a series of small things brought together. Every master was once a beginner who refused to quit. True progress is measured not by how fast you run, but by the consistency of your steps day after day.",
  "It was a bright, cold day in April, and the clocks were striking thirteen. The wind was relentless, carrying with it a fine dust that settled on every surface. Yet, in the face of the storm, the city remained resilient, waiting for the return of spring.",
  "The universe is under no obligation to make sense to us, yet our curiosity drives us to seek its secrets. From the motion of distant galaxies to the dance of subatomic particles, everything is connected in a beautiful, mathematical harmony.",
  "To create is to step into the unknown. It is the willingness to make mistakes, to play with ideas, and to look at the world from an unexpected angle. The spark of inspiration is only the beginning; the real magic is in the persistence.",
  "In a world of constant distractions, focus is a superpower. By training your mind to concentrate on a single task, you unlock a state of flow where effort becomes effortless and time disappears. Protect your attention; it is your most valuable asset.",
  "Kindness is a language that the deaf can hear and the blind can see. The greatest wisdom is to realize that we know very little, and the greatest strength is to treat others with respect and compassion, regardless of our differences.",
  "The open road is a symbol of freedom and endless possibilities. Every turn offers a new horizon, every town a new story. To travel is to realize that our differences are small compared to the shared human journey that unites us all.",
  "Innovation does not always mean creating something entirely new; it often means combining existing ideas in a novel way. It requires the courage to challenge assumptions, ask difficult questions, and look past the status quo."
];

const getRandomParagraph = (exclude = "") => {
  const filtered = PARAGRAPHS.filter((p) => p !== exclude);
  const idx = Math.floor(Math.random() * filtered.length);
  return filtered[idx];
};

function ResultCard({ label, value, subtitle, badge }) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md">
      {badge && (
        <span className="absolute top-3 right-3 bg-orange-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
          {badge}
        </span>
      )}
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">{value}</p>
      {subtitle ? <p className="mt-1.5 text-xs text-slate-500 font-medium">{subtitle}</p> : null}
    </div>
  );
}

function RankCard({ label, value, subtitle, rankColor }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${rankColor}`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-85">{label}</p>
        <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">{value}</p>
      </div>
      {subtitle ? <p className="mt-2 text-xs opacity-95 leading-snug font-medium">{subtitle}</p> : null}
    </div>
  );
}

export default function TypingSpeedTester() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Typing Speed Tester" />;
  }

  const [duration, setDuration] = useState(30);
  const [fontProfile, setFontProfile] = useState("mono");
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Game states: 'idle', 'playing', 'finished'
  const [gameState, setGameState] = useState("idle");
  const [paragraph, setParagraph] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [keystrokes, setKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isNewPB, setIsNewPB] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);

  // SVG Chart hover states
  const [hoverIdx, setHoverIdx] = useState(null);

  // Second-by-second metrics history for chart
  const [history, setHistory] = useState([]);

  // Local storage stats
  const [personalBests, setPersonalBests] = useState({ 15: 0, 30: 0, 60: 0, 120: 0 });
  const [recentTests, setRecentTests] = useState([]);

  const textareaRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const lastParagraphRef = useRef("");
  const paragraphContainerRef = useRef(null);

  // Sync inputs with refs to prevent stale closure in interval/effects
  const userInputRef = useRef(userInput);
  const mistakesRef = useRef(mistakes);
  const paragraphRef = useRef(paragraph);

  useEffect(() => { userInputRef.current = userInput; }, [userInput]);
  useEffect(() => { mistakesRef.current = mistakes; }, [mistakes]);
  useEffect(() => { paragraphRef.current = paragraph; }, [paragraph]);

  // Load localStorage data
  useEffect(() => {
    try {
      const pbs = localStorage.getItem("boring_typing_pb");
      if (pbs) {
        setPersonalBests(JSON.parse(pbs));
      }
      const recents = localStorage.getItem("boring_typing_recent");
      if (recents) {
        setRecentTests(JSON.parse(recents));
      }
    } catch (e) {
      console.warn("Could not read from local storage", e);
    }
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Set initial paragraph on load
  useEffect(() => {
    resetTest(duration);
  }, []);

  const showToast = (type, message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 1800);
  };

  // Web Audio API Sound generator
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
      } else if (type === "error") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      }
    } catch (e) {
      // Audio context blocked or unsupported
    }
  };

  // Keyboard shortcut for Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        resetTest(duration);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [duration, paragraph]);

  // Handle active word scrolling
  useEffect(() => {
    if (gameState === "playing" || gameState === "idle") {
      const activeEl = document.getElementById("active-char");
      if (activeEl && paragraphContainerRef.current) {
        const container = paragraphContainerRef.current;
        const activeTop = activeEl.offsetTop;
        const containerHeight = container.clientHeight;
        
        if (activeTop > container.scrollTop + containerHeight / 2) {
          container.scrollTo({
            top: activeTop - containerHeight / 2,
            behavior: "smooth",
          });
        } else if (activeTop < container.scrollTop) {
          container.scrollTo({
            top: activeTop,
            behavior: "smooth",
          });
        }
      }
    }
  }, [userInput.length, gameState]);

  // Main game timer effect
  useEffect(() => {
    if (gameState !== "playing") return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [gameState]);

  // Record second-by-second history
  useEffect(() => {
    if (gameState !== "playing") return;

    const elapsed = duration - timeLeft;
    if (elapsed <= 0) return;

    const typedLength = userInputRef.current.length;
    const targetText = paragraphRef.current;
    
    // Count correct chars up to typedLength
    let correctCount = 0;
    for (let i = 0; i < typedLength; i++) {
      if (userInputRef.current[i] === targetText[i]) {
        correctCount++;
      }
    }

    const currentWpm = elapsed > 0 ? Math.round((correctCount / 5) / (elapsed / 60)) : 0;
    const currentRawWpm = elapsed > 0 ? Math.round((typedLength / 5) / (elapsed / 60)) : 0;
    const currentAccuracy = typedLength > 0 ? Math.round((correctCount / typedLength) * 100) : 100;

    setHistory((prev) => {
      if (prev.some((pt) => pt.second === elapsed)) return prev;
      return [...prev, { second: elapsed, wpm: currentWpm, rawWpm: currentRawWpm, accuracy: currentAccuracy }];
    });
  }, [timeLeft, gameState]);

  // Appends new paragraphs continuously for endless scroll typing
  const appendParagraph = () => {
    const next = getRandomParagraph(lastParagraphRef.current);
    lastParagraphRef.current = next;
    setParagraph((prev) => prev + " " + next);
  };

  // Start Typing Speed Test
  const startTest = () => {
    setGameState("playing");
    setHistory([]);
    setIsNewPB(false);
  };

  // End Typing Speed Test & Calculate Final Results
  const finishTest = () => {
    setGameState("finished");
    setIsFocused(false);

    const finalTyped = userInputRef.current;
    const targetText = paragraphRef.current;
    const finalMistakes = mistakesRef.current;

    let correctChars = 0;
    for (let i = 0; i < finalTyped.length; i++) {
      if (finalTyped[i] === targetText[i]) {
        correctChars++;
      }
    }

    const minutes = duration / 60;
    const finalWpm = Math.round((correctChars / 5) / minutes);
    const finalAccuracy = finalTyped.length > 0 ? Math.round((correctChars / finalTyped.length) * 100) : 100;

    // Check personal best
    let newPbSet = false;
    let updatedPBs = { ...personalBests };
    if (finalWpm > (personalBests[duration] || 0)) {
      updatedPBs[duration] = finalWpm;
      setPersonalBests(updatedPBs);
      localStorage.setItem("boring_typing_pb", JSON.stringify(updatedPBs));
      setIsNewPB(true);
      newPbSet = true;
      showToast("success", "New Personal Best!");
    } else {
      showToast("success", "Test completed! Check your stats below.");
    }

    // Save recent test
    const newTest = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      duration,
      wpm: finalWpm,
      accuracy: finalAccuracy,
      mistakes: finalMistakes,
      isPB: newPbSet,
    };

    setRecentTests((prev) => {
      const updated = [newTest, ...prev].slice(0, 10);
      localStorage.setItem("boring_typing_recent", JSON.stringify(updated));
      return updated;
    });
  };

  // Reset and restart the test
  const resetTest = (selectedDuration = duration) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    const initialText = getRandomParagraph();
    lastParagraphRef.current = initialText;

    setParagraph(initialText);
    setUserInput("");
    setGameState("idle");
    setTimeLeft(selectedDuration);
    setKeystrokes(0);
    setMistakes(0);
    setIsNewPB(false);
    setHistory([]);
    setHoverIdx(null);
    if (paragraphContainerRef.current) {
      paragraphContainerRef.current.scrollTop = 0;
    }
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  // Handle value change inside hidden textarea
  const handleInputChange = (e) => {
    if (gameState === "finished") return;

    const val = e.target.value;
    
    // Start game on first character
    if (gameState === "idle" && val.length > 0) {
      startTest();
    }

    const prevLength = userInput.length;
    const newLength = val.length;

    if (newLength > prevLength) {
      // Key typed
      const typedChar = val[newLength - 1];
      const targetChar = paragraph[newLength - 1];

      setKeystrokes((prev) => prev + 1);

      if (typedChar === targetChar) {
        playSound("click");
      } else {
        setMistakes((prev) => prev + 1);
        playSound("error");
      }
    }

    setUserInput(val);

    if (val.length >= paragraph.length - 40) {
      appendParagraph();
    }
  };

  // Calculate final metrics
  const getResults = () => {
    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === paragraph[i]) {
        correctChars++;
      }
    }

    const minutes = duration / 60;
    const wpm = Math.round((correctChars / 5) / minutes);
    const rawWpm = Math.round((userInput.length / 5) / minutes);
    const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;
    const totalChars = userInput.length;

    // Calculate words: split correct portion by spaces
    const typedWords = userInput.trim().split(/\s+/).filter(Boolean);
    const targetWords = paragraph.substring(0, userInput.length).trim().split(/\s+/).filter(Boolean);
    let correctWords = 0;
    for (let i = 0; i < Math.min(typedWords.length, targetWords.length); i++) {
      if (typedWords[i] === targetWords[i]) {
        correctWords++;
      }
    }

    // Determine Rank
    let rank = "Beginner";
    let rankDesc = "Keep practicing! Focus on accuracy and muscle memory.";
    let rankColor = "text-slate-650 bg-slate-50 border border-slate-200 text-slate-800";
    if (wpm >= 90) {
      rank = "Expert";
      rankDesc = "Incredible speed! You are a master typist.";
      rankColor = "text-indigo-700 bg-indigo-50 border border-indigo-200 text-indigo-900";
    } else if (wpm >= 60) {
      rank = "Fast";
      rankDesc = "Outstanding speed! You are well above average.";
      rankColor = "text-orange-700 bg-orange-50 border border-orange-200 text-orange-900";
    } else if (wpm >= 30) {
      rank = "Average";
      rankDesc = "Good typing speed. Try to increase accuracy.";
      rankColor = "text-teal-700 bg-teal-50 border border-teal-200 text-teal-900";
    }

    return { wpm, rawWpm, accuracy, totalChars, correctChars, correctWords, rank, rankDesc, rankColor };
  };

  const results = getResults();

  // Copy results summary to clipboard
  const handleCopyResults = () => {
    const summary = `BoringTools Typing Speed Tester Results:
------------------------------------
Duration: ${duration} Seconds
Font Profile: Geist ${fontProfile === "mono" ? "Mono" : "Sans"}
WPM: ${results.wpm} (net) | ${results.rawWpm} (raw)
Accuracy: ${results.accuracy}%
Rank: ${results.rank}
Mistakes: ${mistakes} | Characters: ${results.totalChars}
Correct Words: ${results.correctWords}
------------------------------------
Test your speed at: https://boring-tools-nine.vercel.app/typing-speed-tester`;

    try {
      navigator.clipboard.writeText(summary);
      showToast("success", "Results copied to clipboard.");
    } catch {
      showToast("error", "Copy failed. Try again.");
    }
  };

  // Download detailed report
  const handleDownloadReport = () => {
    const report = `====================================
    TYPING SPEED TEST REPORT
====================================
Date: ${new Date().toLocaleString()}
Duration: ${duration} Seconds
Font Profile: Geist ${fontProfile === "mono" ? "Mono" : "Sans"}

METRICS
------------------------------------
Net WPM: ${results.wpm}
Raw WPM: ${results.rawWpm}
Accuracy: ${results.accuracy}%
Mistakes: ${mistakes}
Total Keystrokes: ${keystrokes}
Correct Characters: ${results.correctChars}
Correct Words: ${results.correctWords}

PERFORMANCE RANK
------------------------------------
Rank: ${results.rank}
${results.rankDesc}

PERSONAL BESTS
------------------------------------
15s: ${personalBests[15] || 0} WPM
30s: ${personalBests[30] || 0} WPM
60s: ${personalBests[60] || 0} WPM
120s: ${personalBests[120] || 0} WPM

====================================
Generated by BoringTools Typing Speed Tester
====================================`;

    try {
      const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `typing-report-${duration}s.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("success", "Report downloaded.");
    } catch {
      showToast("error", "Download failed. Try again.");
    }
  };

  // Generate Custom SVG Chart Coordinates
  const getChartElements = () => {
    if (history.length === 0) return null;

    const width = 600;
    const height = 220;
    const padding = { top: 20, right: 45, bottom: 30, left: 40 };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Get max value from wpm and rawWpm
    const maxVal = Math.max(
      60,
      ...history.map((pt) => pt.wpm),
      ...history.map((pt) => pt.rawWpm)
    );

    const getX = (t) => padding.left + (t / duration) * plotWidth;
    const getY = (w) => padding.top + plotHeight - (w / maxVal) * plotHeight;
    const getAccY = (a) => padding.top + plotHeight - (a / 100) * plotHeight;

    // Build Paths
    const wpmPoints = history.map((pt) => `${getX(pt.second)},${getY(pt.wpm)}`);
    const wpmD = wpmPoints.length > 0 ? `M ${wpmPoints.join(" L ")}` : "";
    const wpmAreaD = wpmPoints.length > 0 
      ? `${wpmD} L ${getX(history[history.length - 1].second)},${padding.top + plotHeight} L ${padding.left},${padding.top + plotHeight} Z`
      : "";

    const rawPoints = history.map((pt) => `${getX(pt.second)},${getY(pt.rawWpm)}`);
    const rawD = rawPoints.length > 0 ? `M ${rawPoints.join(" L ")}` : "";

    const accPoints = history.map((pt) => `${getX(pt.second)},${getAccY(pt.accuracy)}`);
    const accD = accPoints.length > 0 ? `M ${accPoints.join(" L ")}` : "";

    return {
      width,
      height,
      padding,
      plotWidth,
      plotHeight,
      maxVal,
      getX,
      getY,
      getAccY,
      wpmD,
      wpmAreaD,
      rawD,
      accD,
    };
  };

  const chart = getChartElements();

  // Handle Chart Hover mouse movement
  const handleMouseMove = (e) => {
    if (history.length === 0 || !chart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const svgX = (x / rect.width) * chart.width;
    
    const relativeX = svgX - chart.padding.left;
    const pct = relativeX / chart.plotWidth;
    const targetSecond = Math.max(1, Math.min(duration, Math.round(pct * duration)));
    
    const idx = history.findIndex((h) => h.second === targetSecond);
    if (idx !== -1) {
      setHoverIdx(idx);
    } else {
      setHoverIdx(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans pt-24 pb-12 transition-colors duration-200">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-5xl border border-slate-200 flex flex-col gap-6">
        
        {/* Hero Header Section */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Productivity</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Typing Speed Tester</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Test and improve your typing speed and accuracy in real-time, 100% client-side.
          </p>
        </div>

        {/* Configurations & Personal Best Card */}
        {gameState !== "finished" && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all duration-200 hover:border-slate-300">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              
              {/* Durations segment picker */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</span>
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  {[15, 30, 60, 120].map((t) => (
                    <button
                      key={t}
                      type="button"
                      disabled={gameState === "playing"}
                      onClick={() => {
                        setDuration(t);
                        resetTest(t);
                      }}
                      className={`text-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        duration === t
                          ? "bg-orange-500 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      } ${gameState === "playing" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Font segment picker */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Font Profile</span>
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  {[
                    { id: "mono", label: "Monospace" },
                    { id: "sans", label: "Sans" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontProfile(f.id)}
                      className={`text-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        fontProfile === f.id
                          ? "bg-orange-500 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sound controls and Personal Best */}
            <div className="flex items-center gap-6 self-start md:self-auto border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 pl-0 md:pl-6 w-full md:w-auto">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feedback Sounds</span>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    soundEnabled
                      ? "bg-orange-50 border-orange-205 text-orange-600 font-semibold"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {soundEnabled ? "Sound On" : "Sound Off"}
                </button>
              </div>

              <div className="flex flex-col justify-center pl-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PB ({duration}s)</span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
                  {personalBests[duration] || 0} <span className="text-xs font-semibold text-slate-400">WPM</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Live Typing Workspace */}
        {gameState !== "finished" && (
          <div className="flex flex-col gap-4">
            
            {/* Live Progress Metrics Bar */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500 font-sans">Time remaining:</span>
                <span className="text-2xl font-bold font-mono text-slate-800 tracking-tight tabular-nums">
                  {timeLeft}s
                </span>
              </div>

              <div className="flex-1 mx-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300 rounded-full"
                  style={{ width: `${(timeLeft / duration) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="text-slate-500">
                  WPM: <span className="font-bold text-slate-900 font-mono text-sm">{results.wpm}</span>
                </div>
                <div className="text-slate-500">
                  Acc: <span className="font-bold text-slate-900 font-mono text-sm">{results.accuracy}%</span>
                </div>
              </div>
            </div>

            {/* Central typing block */}
            <div
              className="relative bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 cursor-text overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              onClick={() => textareaRef.current?.focus()}
            >
              {/* Focus trigger screen */}
              {!isFocused && (
                <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 cursor-pointer" onClick={() => textareaRef.current?.focus()}>
                  <div className="flex flex-col items-center gap-1.5 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-xl transition-transform duration-200 hover:scale-102">
                    <span className="text-sm font-bold text-slate-900">
                      Click here to focus and start typing
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Test timer starts as soon as you type the first letter.
                    </span>
                  </div>
                </div>
              )}

              {/* Hidden text capture area */}
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none z-0 resize-none outline-none"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />

              {/* Characters word blocks */}
              <div
                ref={paragraphContainerRef}
                className={`max-h-48 overflow-y-hidden select-none leading-relaxed text-lg sm:text-xl md:text-2xl transition-all duration-200 ${
                  fontProfile === "mono" ? "font-mono tracking-normal" : "font-sans tracking-wide"
                }`}
              >
                <div className="flex flex-wrap">
                  {paragraph.split(" ").map((word, wordIdx) => {
                    const letters = word.split("");
                    const wordLetters = wordIdx < paragraph.split(" ").length - 1 ? [...letters, " "] : letters;

                    let globalBaseIdx = 0;
                    const wordsList = paragraph.split(" ");
                    for (let w = 0; w < wordIdx; w++) {
                      globalBaseIdx += wordsList[w].length + 1;
                    }

                    return (
                      <div key={wordIdx} className="flex flex-wrap mr-2 sm:mr-3 mb-1 sm:mb-2">
                        {wordLetters.map((char, charIdx) => {
                          const globalIdx = globalBaseIdx + charIdx;
                          const typedChar = userInput[globalIdx];
                          let status = "pending";

                          if (globalIdx < userInput.length) {
                            status = typedChar === char ? "correct" : "incorrect";
                          }

                          const isCursor = globalIdx === userInput.length;

                          return (
                            <span
                              key={charIdx}
                              id={isCursor ? "active-char" : undefined}
                              className={`relative transition-all duration-100 ${
                                status === "correct"
                                  ? "text-emerald-600 font-semibold"
                                  : status === "incorrect"
                                  ? "text-rose-600 bg-rose-50 border-b-2 border-rose-550 font-semibold"
                                  : "text-slate-400"
                              }`}
                            >
                              {char === " " ? (status === "incorrect" ? "␣" : "\u00A0") : char}
                              {isCursor && isFocused && (
                                <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-orange-500 animate-pulse" />
                              )}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Restart row */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Tip: Press <kbd className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">Esc</kbd> to restart.</span>
              <button
                type="button"
                onClick={() => resetTest(duration)}
                className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-gradient-to-r from-white to-orange-55 px-4 py-2.5 text-xs font-bold text-orange-700 shadow-sm shadow-orange-100/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-850 hover:shadow-md cursor-pointer"
              >
                Restart Test
              </button>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {gameState === "finished" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            {/* Speed Summary Cards (Stat Cards style) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResultCard 
                label="Speed (WPM)" 
                value={results.wpm} 
                subtitle={`Raw Speed: ${results.rawWpm} WPM`} 
                badge={isNewPB ? "New PB!" : null}
              />
              <ResultCard 
                label="Accuracy" 
                value={`${results.accuracy}%`} 
                subtitle={`Mistakes: ${mistakes}`} 
              />
              <ResultCard 
                label="Characters" 
                value={results.totalChars} 
                subtitle={`Correct: ${results.correctChars}`} 
              />
              <RankCard 
                label="Typing Rank" 
                value={results.rank} 
                subtitle={results.rankDesc} 
                rankColor={results.rankColor}
              />
            </div>

            {/* Custom SVG Line Chart */}
            {chart && history.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md relative">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Analytics</p>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">Speed & Accuracy Progress</h3>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5 text-orange-500">
                      <span className="w-2.5 h-2.5 bg-orange-50 rounded-full" />
                      Net WPM
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
                      Raw WPM
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-500">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                      Accuracy
                    </span>
                  </div>
                </div>

                <div className="relative w-full overflow-hidden">
                  <svg
                    viewBox={`0 0 ${chart.width} ${chart.height}`}
                    className="w-full h-auto text-slate-200"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoverIdx(null)}
                  >
                    <defs>
                      <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Y Axis Grid lines (Speed) */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                      const val = Math.round(p * chart.maxVal);
                      const y = chart.getAccY(p * 100);
                      return (
                        <g key={p} className="opacity-30">
                          <line
                            x1={chart.padding.left}
                            y1={y}
                            x2={chart.width - chart.padding.right}
                            y2={y}
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={chart.padding.left - 8}
                            y={y + 4}
                            textAnchor="end"
                            className="text-[9px] font-mono font-bold fill-slate-400"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Y Axis Labels (Accuracy %) */}
                    {[0, 25, 50, 75, 100].map((val) => {
                      const y = chart.getAccY(val);
                      return (
                        <g key={val} className="opacity-30">
                          <text
                            x={chart.width - chart.padding.right + 8}
                            y={y + 4}
                            textAnchor="start"
                            className="text-[9px] font-mono font-bold fill-emerald-500"
                          >
                            {val}%
                          </text>
                        </g>
                      );
                    })}

                    {/* X Axis Labels */}
                    {Array.from({ length: 6 }).map((_, i) => {
                      const t = Math.round((i / 5) * duration);
                      const x = chart.getX(t);
                      const y = chart.height - chart.padding.bottom + 16;
                      return (
                        <text
                          key={i}
                          x={x}
                          y={y}
                          textAnchor="middle"
                          className="text-[9px] font-mono font-bold fill-slate-400 opacity-60"
                        >
                          {t}s
                        </text>
                      );
                    })}

                    {/* Gradient under WPM */}
                    {chart.wpmAreaD && (
                      <path d={chart.wpmAreaD} fill="url(#wpmGradient)" className="pointer-events-none" />
                    )}

                    {/* Raw WPM Line */}
                    {chart.rawD && (
                      <path
                        d={chart.rawD}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        className="pointer-events-none"
                      />
                    )}

                    {/* Net WPM Line */}
                    {chart.wpmD && (
                      <path
                        d={chart.wpmD}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="pointer-events-none"
                      />
                    )}

                    {/* Accuracy Line */}
                    {chart.accD && (
                      <path
                        d={chart.accD}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="pointer-events-none"
                      />
                    )}

                    {/* Hover items */}
                    {hoverIdx !== null && history[hoverIdx] && (
                      <g>
                        <line
                          x1={chart.getX(history[hoverIdx].second)}
                          y1={chart.padding.top}
                          x2={chart.getX(history[hoverIdx].second)}
                          y2={chart.height - chart.padding.bottom}
                          stroke="#f59e0b"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                        <circle
                          cx={chart.getX(history[hoverIdx].second)}
                          cy={chart.getY(history[hoverIdx].wpm)}
                          r="4.5"
                          fill="#f97316"
                          stroke="white"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={chart.getX(history[hoverIdx].second)}
                          cy={chart.getAccY(history[hoverIdx].accuracy)}
                          r="4.5"
                          fill="#10b981"
                          stroke="white"
                          strokeWidth="1.5"
                        />
                      </g>
                    )}
                  </svg>

                  {/* Absolute HTML Tooltip */}
                  {hoverIdx !== null && history[hoverIdx] && (
                    <div
                      className="absolute pointer-events-none bg-white text-slate-950 text-[10px] sm:text-xs rounded-xl p-2.5 shadow-2xl z-20 flex flex-col gap-1 border border-slate-200 -translate-x-1/2"
                      style={{
                        left: `${(chart.getX(history[hoverIdx].second) / chart.width) * 100}%`,
                        top: "12%",
                      }}
                    >
                      <div className="font-bold border-b border-slate-100 pb-1 mb-0.5 text-center">
                        Second {history[hoverIdx].second}s
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Net WPM:</span>
                        <span className="font-bold text-orange-600">
                          {history[hoverIdx].wpm}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Raw WPM:</span>
                        <span className="font-bold text-slate-500">
                          {history[hoverIdx].rawWpm}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Accuracy:</span>
                        <span className="font-bold text-emerald-600">
                          {history[hoverIdx].accuracy}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons (Redesigned matching Discount Calculator) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => resetTest(duration)}
                className="rounded-xl border border-slate-900 bg-slate-900 px-4 py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer text-sm text-center flex items-center justify-center"
              >
                Restart Test
              </button>

              <button
                type="button"
                onClick={handleCopyResults}
                className="rounded-xl border border-orange-500 px-4 py-3.5 font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer text-sm text-center flex items-center justify-center"
              >
                Copy Results
              </button>

              <button
                type="button"
                onClick={handleDownloadReport}
                className="rounded-xl border border-orange-500 px-4 py-3.5 font-semibold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer text-sm text-center flex items-center justify-center"
              >
                Download Report
              </button>
            </div>

            {/* Records & Attempt History Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Personal Bests Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Records</p>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">Personal Bests</h4>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[15, 30, 60, 120].map((t) => (
                    <div
                      key={t}
                      className={`text-center p-2.5 rounded-xl border transition-all duration-150 ${
                        duration === t
                          ? "border-orange-200 bg-orange-50/50 text-orange-700"
                          : "border-slate-100 bg-slate-50 text-slate-650"
                      }`}
                    >
                      <span className="block text-[10px] font-bold text-slate-405">{t}s</span>
                      <span className="text-lg font-extrabold font-mono mt-0.5 block">
                        {personalBests[t] || 0}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400 block">WPM</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Attempts list */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">History</p>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">Recent Attempts</h4>
                  </div>
                  {recentTests.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Clear recent attempts?")) {
                          localStorage.removeItem("boring_typing_recent");
                          setRecentTests([]);
                          showToast("success", "History cleared.");
                        }
                      }}
                      className="text-[10px] text-rose-500 hover:text-rose-600 font-bold transition uppercase cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {recentTests.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No previous attempts yet. Your typed results will appear here.
                  </p>
                ) : (
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Time</th>
                          <th className="pb-2 text-right">WPM</th>
                          <th className="pb-2 text-right">Acc</th>
                          <th className="pb-2 text-center">Record</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-750 font-medium font-mono">
                        {recentTests.slice(0, 4).map((test) => (
                          <tr key={test.id} className="hover:bg-slate-50">
                            <td className="py-2">{test.date}</td>
                            <td className="py-2">{test.duration}s</td>
                            <td className="py-2 text-right font-bold text-slate-900">
                              {test.wpm}
                            </td>
                            <td className="py-2 text-right text-emerald-600">
                              {test.accuracy}%
                            </td>
                            <td className="py-2 text-center">
                              {test.isPB ? (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  PB
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Metrics Info Box */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-slate-300">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Typing Metrics Guide</p>
              <p className="mt-2 text-xs sm:text-sm text-slate-650 leading-relaxed">
                <strong>Words Per Minute (WPM)</strong> is calculated using the formula: <code>(Correct Characters / 5) / Time (Minutes)</code>, which is the international typing standard. <strong>Raw WPM</strong> counts all characters typed (correct and incorrect) to measure raw finger speed. <strong>Accuracy</strong> is the percentage of correct key entries relative to total typed keys.
              </p>
            </div>

          </div>
        )}
      </div>

      {/* Floating toast notification */}
      {toast.message ? (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-2.5 text-xs sm:text-sm shadow-xl border animate-fade-in-out ${
            toast.type === "error" 
              ? "bg-red-650 border-red-500 text-white" 
              : "bg-slate-900 border-slate-800 text-white"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      <style jsx global>{`
        @keyframes caret-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-pulse {
          animation: caret-blink 1s steps(2, start) infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-fade-in-out {
          animation: fadeInOut 1.8s forwards;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 10px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }
      `}</style>
    </div>
  );
}

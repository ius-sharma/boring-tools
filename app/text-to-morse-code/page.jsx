"use client";

import ComingSoon from "@/app/components/ComingSoon";
import { useMemo, useRef, useState } from "react";

const TOOL_STATUS = "upcoming";

const MORSE_MAP = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
};

const REVERSE_MORSE_MAP = Object.fromEntries(Object.entries(MORSE_MAP).map(([char, code]) => [code, char]));

const DOT_UNIT_SECONDS = 0.09;

function textToMorse(text) {
  if (!text.trim()) return "";

  return text
    .toUpperCase()
    .split("\n")
    .map((line) =>
      line
        .split(" ")
        .map((word) =>
          word
            .split("")
            .map((char) => MORSE_MAP[char] || "")
            .filter(Boolean)
            .join(" ")
        )
        .filter(Boolean)
        .join(" / ")
    )
    .filter(Boolean)
    .join(" / ");
}

function morseToText(value) {
  const normalized = String(value || "")
    .replace(/\|/g, " /")
    .replace(/\r?\n/g, " / ")
    .trim();

  if (!normalized) return "";

  const tokens = normalized.split(/\s+/).filter(Boolean);
  let output = "";

  for (const token of tokens) {
    if (token === "/") {
      if (!output.endsWith(" ")) {
        output += " ";
      }
      continue;
    }

    output += REVERSE_MORSE_MAP[token] || "?";
  }

  return output.replace(/\s+/g, " ").trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function countWords(output, mode) {
  const trimmed = output.trim();
  if (!trimmed) return 0;

  if (mode === "text-to-morse") {
    return trimmed
      .split(/\s*\/\s*/)
      .map((part) => part.trim())
      .filter(Boolean).length;
  }

  return trimmed.split(/\s+/).filter(Boolean).length;
}

export default function TextToMorseCodePage() {
  if (TOOL_STATUS !== "live") {
    return <ComingSoon toolName="Text to Morse Code" />;
  }

  const [mode, setMode] = useState("text-to-morse");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundError, setSoundError] = useState("");

  const audioContextRef = useRef(null);
  const stopPlaybackRef = useRef(false);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return mode === "text-to-morse" ? textToMorse(input) : morseToText(input);
  }, [input, mode]);

  const charCount = output.length;
  const wordCount = countWords(output, mode);

  const morseForPlayback = useMemo(() => {
    if (mode === "text-to-morse") {
      return output;
    }

    return String(input || "")
      .replace(/\|/g, " /")
      .replace(/\r?\n/g, " / ")
      .replace(/\s+/g, " ")
      .trim();
  }, [input, mode, output]);

  const copyResult = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const downloadTxt = () => {
    if (!output) return;

    const fileName = mode === "text-to-morse" ? "text-to-morse-output.txt" : "morse-to-text-output.txt";
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    stopPlaybackRef.current = true;
    setInput("");
    setCopied(false);
    setSoundError("");
    setIsPlaying(false);
  };

  const getAudioContext = () => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;

    const context = new AudioContextCtor();
    audioContextRef.current = context;
    return context;
  };

  const playTone = async (ctx, durationSec) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 650;

    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + durationSec + 0.01);

    await sleep(durationSec * 1000);
  };

  const playMorseSound = async () => {
    if (!soundEnabled || !morseForPlayback || isPlaying) return;

    setSoundError("");
    stopPlaybackRef.current = false;
    setIsPlaying(true);

    try {
      const ctx = getAudioContext();
      if (!ctx) {
        setSoundError("Audio is not supported in this browser.");
        return;
      }

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const cleaned = morseForPlayback.replace(/[^.\-\/\s]/g, "").replace(/\s+/g, " ").trim();
      const chars = cleaned.split("");

      for (const symbol of chars) {
        if (stopPlaybackRef.current) break;

        if (symbol === ".") {
          await playTone(ctx, DOT_UNIT_SECONDS);
          await sleep(DOT_UNIT_SECONDS * 1000);
        } else if (symbol === "-") {
          await playTone(ctx, DOT_UNIT_SECONDS * 3);
          await sleep(DOT_UNIT_SECONDS * 1000);
        } else if (symbol === " ") {
          await sleep(DOT_UNIT_SECONDS * 2000);
        } else if (symbol === "/") {
          await sleep(DOT_UNIT_SECONDS * 4000);
        }
      }
    } catch {
      setSoundError("Unable to play Morse sound. Try again.");
    } finally {
      setIsPlaying(false);
      stopPlaybackRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-4xl border border-slate-200 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Text to Morse Code</h1>
          <p className="text-slate-500 text-base">Convert text to Morse and Morse back to text instantly in your browser.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("text-to-morse")}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              mode === "text-to-morse"
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
            }`}
          >
            Text to Morse
          </button>
          <button
            type="button"
            onClick={() => setMode("morse-to-text")}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              mode === "morse-to-text"
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
            }`}
          >
            Morse to Text
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-slate-900">Input</p>
            <textarea
              rows={8}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                mode === "text-to-morse"
                  ? "Type text here..."
                  : "Type Morse here... Use spaces between letters and / between words"
              }
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 transition resize-none text-base text-slate-900 placeholder:text-slate-400"
              spellCheck={false}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-slate-900">Output</p>
            {output ? (
              <textarea
                rows={8}
                value={output}
                readOnly
                spellCheck={false}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none resize-none text-base text-slate-900"
              />
            ) : (
              <div className="min-h-[204px] w-full p-3 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center text-center">
                Converted output will appear here
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{charCount}</p>
            <p className="text-xs text-slate-500">Character Count</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{wordCount}</p>
            <p className="text-xs text-slate-500">Word Count</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={copyResult}
            disabled={!output}
            className={`rounded-lg border py-2 px-3 font-semibold text-sm transition ${
              output
                ? "border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                : "border-slate-300 text-slate-400 cursor-not-allowed"
            }`}
          >
            {copied ? "Copied" : "Copy Result"}
          </button>

          <button
            type="button"
            onClick={downloadTxt}
            disabled={!output}
            className={`rounded-lg border py-2 px-3 font-semibold text-sm transition ${
              output
                ? "border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                : "border-slate-300 text-slate-400 cursor-not-allowed"
            }`}
          >
            Download TXT
          </button>

          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-slate-300 py-2 px-3 font-semibold text-sm text-slate-700 hover:border-slate-900 hover:text-slate-900 transition"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => {
              if (isPlaying) {
                stopPlaybackRef.current = true;
                return;
              }
              playMorseSound();
            }}
            disabled={!soundEnabled || !morseForPlayback}
            className={`rounded-lg border py-2 px-3 font-semibold text-sm transition ${
              soundEnabled && morseForPlayback
                ? "border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                : "border-slate-300 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isPlaying ? "Stop Sound" : "Play Morse"}
          </button>

          <button
            type="button"
            onClick={() => {
              setSoundEnabled((current) => !current);
              if (isPlaying) {
                stopPlaybackRef.current = true;
              }
            }}
            className={`rounded-lg border py-2 px-3 font-semibold text-sm transition ${
              soundEnabled
                ? "border-emerald-500 text-emerald-700 hover:bg-emerald-500 hover:text-white"
                : "border-slate-300 text-slate-600 hover:border-slate-900 hover:text-slate-900"
            }`}
          >
            Sound: {soundEnabled ? "On" : "Off"}
          </button>
        </div>

        {soundError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{soundError}</div>}

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-600">
          Morse tip: separate letters with spaces and words with /. Example: <span className="font-mono">.... . .-.. .-.. --- / .-- --- .-. .-.. -..</span>
        </div>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}

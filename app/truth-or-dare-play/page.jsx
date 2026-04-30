"use client";

import { useMemo, useState } from "react";

const truths = [
  "What is the most random item in your search history?",
  "Which habit do you pretend is under control but is not?",
  "What is one app you open too many times a day?",
  "What is the last thing you Googled for no reason?",
  "What is a small talent you hide from people?",
  "Which unfinished task is silently judging you?",
  "What is a movie or song you secretly overplay?",
  "What is the most questionable purchase you have made?",
  "Which rule do you only follow when someone is watching?",
  "What is one thing you would delete from your daily routine?",
];

const dares = [
  "Send a one-line appreciation message to someone.",
  "Do 10 clean jumping jacks right now.",
  "Speak in a dramatic announcer voice for 15 seconds.",
  "Set a 2-minute timer and tidy one small area.",
  "Type your next thought using only uppercase letters.",
  "Give your current to-do list a ridiculous movie trailer title.",
  "Do your best serious face for the next 20 seconds.",
  "Open a note and write one thing you should stop delaying.",
  "Pretend you are a product demo host for your water bottle.",
  "Take a deep breath and stretch both arms above your head for 10 seconds.",
];

function pickRandom(list, seed) {
  return list[Math.abs(seed) % list.length];
}

export default function TruthOrDarePlay() {
  const [mode, setMode] = useState("random");
  const [prompt, setPrompt] = useState("Pick Truth, Dare, or Random to start the round.");
  const [currentType, setCurrentType] = useState("Ready");
  const [roundCount, setRoundCount] = useState(0);
  const [history, setHistory] = useState([]);

  const promptSource = useMemo(() => ({
    truth: truths,
    dare: dares,
  }), []);

  const createRound = (type) => {
    const nextType = type === "random" ? (Math.random() > 0.5 ? "truth" : "dare") : type;
    const pool = promptSource[nextType];
    const seed = Date.now() + roundCount * 17 + pool.length;
    const nextPrompt = pickRandom(pool, seed);

    setPrompt(nextPrompt);
    setCurrentType(nextType === "truth" ? "Truth" : "Dare");
    setRoundCount((value) => value + 1);
    setHistory((value) => [{ type: nextType === "truth" ? "Truth" : "Dare", prompt: nextPrompt }, ...value].slice(0, 5));
  };

  const resetGame = () => {
    setPrompt("Pick Truth, Dare, or Random to start the round.");
    setCurrentType("Ready");
    setRoundCount(0);
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-5xl border border-neutral-200 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Truth or Dare Play</h1>
          <p className="text-neutral-500 text-base">A clean, fast party game with truth and dare prompts.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-neutral-900">Game mode</h2>
              <span className="text-xs text-neutral-500">Rounds: {roundCount}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: "random", label: "Random" },
                { value: "truth", label: "Truth" },
                { value: "dare", label: "Dare" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-neutral-900 ${mode === item.value ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 min-h-[240px] flex flex-col justify-between gap-4">
              <div>
                <p className="text-xs text-neutral-500">Current card</p>
                <div className="mt-2 inline-flex rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-700">
                  {currentType}
                </div>
              </div>

              <p className="text-2xl sm:text-3xl font-semibold leading-snug text-neutral-900">
                {prompt}
              </p>

              <p className="text-xs text-neutral-500">Pick a mode or keep hitting Random for a fresh mix.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => createRound(mode)}
                className="border border-neutral-900 text-neutral-900 rounded-lg py-3 font-semibold hover:bg-neutral-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                Play next round
              </button>
              <button
                type="button"
                onClick={resetGame}
                className="border border-neutral-300 text-neutral-700 rounded-lg py-3 font-semibold hover:bg-neutral-100 transition focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-neutral-900">Recent rounds</h2>

            {!history.length ? (
              <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-500">Your last 5 prompts will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map((item, index) => (
                  <div key={`${item.type}-${index}-${item.prompt}`} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs text-neutral-500">{item.type}</p>
                    <p className="text-sm font-medium text-neutral-900 mt-1">{item.prompt}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center">
                <p className="text-xs text-neutral-500">Truth prompts</p>
                <p className="text-2xl font-semibold text-neutral-900">{truths.length}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center">
                <p className="text-xs text-neutral-500">Dare prompts</p>
                <p className="text-2xl font-semibold text-neutral-900">{dares.length}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-500">Simple black-and-white party UI with quick rounds and a short history board.</p>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}
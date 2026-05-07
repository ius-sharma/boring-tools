"use client";
import { useState } from "react";

export default function PasswordGenerator() {
  const [length, setLength] = useState(10);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);

  const generatePassword = () => {
    let chars = "";
    if (includeUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+";

    if (!chars) {
      setError("Select at least one option");
      setPassword("");
      return;
    }

    let generated = "";
    for (let i = 0; i < length; i++) {
      generated += chars[Math.floor(Math.random() * chars.length)];
    }

    setPassword(generated);
    setError("");
  };

  const copyToClipboard = async () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Password Generator</h1>
          <p className="text-slate-500 text-base">Generate secure passwords in a clean, simple interface</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
            <label htmlFor="password-length" className="font-medium">Password Length</label>
            <span className="font-semibold text-slate-900">{length}</span>
          </div>
          <input
            id="password-length"
            type="range"
            min="6"
            max="24"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer">
            <input type="checkbox" checked={includeUpper} onChange={() => setIncludeUpper(!includeUpper)} className="accent-slate-900" />
            Uppercase
          </label>
          <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer">
            <input type="checkbox" checked={includeLower} onChange={() => setIncludeLower(!includeLower)} className="accent-slate-900" />
            Lowercase
          </label>
          <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer">
            <input type="checkbox" checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} className="accent-slate-900" />
            Numbers
          </label>
          <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer">
            <input type="checkbox" checked={includeSymbols} onChange={() => setIncludeSymbols(!includeSymbols)} className="accent-slate-900" />
            Symbols
          </label>
        </div>

        {error && <p className="text-red-600 text-sm -mt-1">{error}</p>}

        <button
          onClick={generatePassword}
          className="w-full border border-slate-900 text-slate-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          Generate Password
        </button>

        {password ? (
          <textarea
            className="w-full p-4 border border-slate-100 rounded-xl bg-slate-50 text-base mb-2 resize-none focus:outline-none text-slate-900"
            rows="3"
            value={password}
            readOnly
            spellCheck={false}
          />
        ) : (
          <div className="w-full p-4 border border-dashed border-slate-100 rounded-xl bg-slate-50 text-slate-300 text-base mb-2 min-h-[72px] flex items-center justify-center select-none">
            Generated password will appear here
          </div>
        )}

        <button
          onClick={copyToClipboard}
          className={`w-full border border-slate-900 text-slate-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${!password ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!password}
          aria-label="Copy password"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15.75H6A2.25 2.25 0 013.75 13.5v-9A2.25 2.25 0 016 2.25h9A2.25 2.25 0 0117.25 4.5v2.25m-9 9h9A2.25 2.25 0 0019.5 13.5v6A2.25 2.25 0 0117.25 22.5h-9A2.25 2.25 0 016 20.25v-6z" />
          </svg>
          Copy Password
        </button>

        {showToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-fade-in-out">
            Password copied!
          </div>
        )}
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
        .animate-fade-in-out {
          animation: fadeInOut 1.5s;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}



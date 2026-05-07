"use client";
import { useState } from "react";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError("");
    } catch {
      setError("Invalid JSON");
      setOutput("");
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError("");
    } catch {
      setError("Invalid JSON");
      setOutput("");
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const copyToClipboard = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">JSON Formatter</h1>
          <p className="text-slate-600 text-base">Format, minify and validate JSON instantly</p>
        </div>

        <textarea
          className="w-full p-4 border border-slate-300 rounded-xl mb-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition resize-none text-base text-slate-900 placeholder:text-slate-400"
          rows="6"
          placeholder="Paste your JSON here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button onClick={formatJSON} className="border border-slate-300 rounded-lg py-2 px-2 text-slate-700 hover:bg-slate-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-orange-500">Format JSON</button>
          <button onClick={minifyJSON} className="border border-slate-300 rounded-lg py-2 px-2 text-slate-700 hover:bg-slate-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-orange-500">Minify JSON</button>
          <button onClick={clearAll} className="border border-slate-300 rounded-lg py-2 px-2 text-slate-700 hover:bg-slate-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-orange-500">Clear</button>
        </div>

        {error && <p className="text-red-600 text-sm -mt-1">{error}</p>}

        {output ? (
          <textarea
            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-base mb-2 resize-none focus:outline-none text-slate-900"
            rows="6"
            placeholder="Formatted output..."
            value={output}
            readOnly
            spellCheck={false}
          />
        ) : (
          <div className="w-full p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-base mb-2 min-h-[144px] flex items-center justify-center select-none">
            Output will appear here
          </div>
        )}

        <button
          onClick={copyToClipboard}
          className={`w-full border border-slate-900 text-slate-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-orange-500 ${!output ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!output}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15.75H6A2.25 2.25 0 013.75 13.5v-9A2.25 2.25 0 016 2.25h9A2.25 2.25 0 0117.25 4.5v2.25m-9 9h9A2.25 2.25 0 0019.5 13.5v6A2.25 2.25 0 0117.25 22.5h-9A2.25 2.25 0 016 20.25v-6z" />
          </svg>
          Copy Output
        </button>

        {showToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-fade-in-out">
            Output copied!
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



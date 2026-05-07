"use client";
import { useState } from "react";

export default function WordCounter() {
  const [text, setText] = useState("");

  const getStats = () => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const characters = text.length;
    const noSpaces = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;

    return { words, characters, noSpaces, sentences };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Word Counter</h1>
          <p className="text-slate-500 text-base">Count words, characters and sentences instantly</p>
        </div>

        <textarea
          className="w-full p-4 border border-slate-200 rounded-xl mb-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition resize-none text-base text-slate-900 placeholder:text-slate-300"
          rows="6"
          placeholder="Type or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-2xl font-semibold text-slate-900">{stats.words}</p>
            <p className="text-sm text-slate-500">Words</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-2xl font-semibold text-slate-900">{stats.characters}</p>
            <p className="text-sm text-slate-500">Characters</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-2xl font-semibold text-slate-900">{stats.noSpaces}</p>
            <p className="text-sm text-slate-500">No Spaces</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-2xl font-semibold text-slate-900">{stats.sentences}</p>
            <p className="text-sm text-slate-500">Sentences</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}



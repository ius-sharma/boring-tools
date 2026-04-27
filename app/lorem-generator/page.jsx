"use client";
import { useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const loremWords = [
  "lorem", "ipsum", "dolor", "sit", "amet",
  "consectetur", "adipiscing", "elit", "sed",
  "do", "eiusmod", "tempor", "incididunt",
  "ut", "labore", "et", "dolore", "magna", "aliqua",
];

export default function LoremGenerator() {
  const [count, setCount] = useState(3);
  const [type, setType] = useState("paragraphs");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const typeOptions = [
    { value: "paragraphs", label: "Paragraphs" },
    { value: "sentences", label: "Sentences" },
    { value: "words", label: "Words" },
  ];

  const randomWord = () => {
    return loremWords[Math.floor(Math.random() * loremWords.length)];
  };

  const makeSentence = () => {
    const words = [];
    for (let i = 0; i < 10; i++) {
      words.push(randomWord());
    }
    const sentence = words.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  };

  const generateLorem = () => {
    if (!count || count < 1) {
      setError("Please enter a valid count");
      setOutput("");
      return;
    }

    setError("");

    if (type === "words") {
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push(randomWord());
      }
      setOutput(arr.join(" "));
      return;
    }

    if (type === "sentences") {
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push(makeSentence());
      }
      setOutput(arr.join(" "));
      return;
    }

    const paragraphs = [];
    for (let p = 0; p < count; p++) {
      const para = [];
      for (let s = 0; s < 5; s++) {
        para.push(makeSentence());
      }
      paragraphs.push(para.join(" "));
    }

    setOutput(paragraphs.join("\n\n"));
  };

  const copyText = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-8 w-full max-w-3xl border border-neutral-200 flex flex-col gap-6">
        <div className="flex flex-col gap-1 items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-1">Lorem Generator</h1>
          <p className="text-neutral-500 text-base">Generate placeholder text in words, sentences, or paragraphs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            min="1"
            className="w-full p-4 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition text-base text-black"
          />

          <ThemedDropdown
            ariaLabel="Select lorem output type"
            value={type}
            options={typeOptions}
            onChange={setType}
          />
        </div>

        {error && <p className="text-red-600 text-sm -mt-2">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={generateLorem}
            className="w-full border border-neutral-900 text-neutral-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-neutral-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            Generate
          </button>

          <button
            onClick={copyText}
            disabled={!output}
            className={`w-full border border-neutral-900 text-neutral-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-neutral-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-neutral-900 ${!output ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Copy
          </button>
        </div>

        {output ? (
          <pre className="w-full p-4 border border-neutral-200 rounded-xl bg-neutral-50 text-black whitespace-pre-wrap">
            {output}
          </pre>
        ) : (
          <div className="w-full p-4 border border-dashed border-neutral-100 rounded-xl bg-neutral-50 text-neutral-300 text-base min-h-[120px] flex items-center justify-center select-none">
            Generated lorem text will appear here
          </div>
        )}
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}

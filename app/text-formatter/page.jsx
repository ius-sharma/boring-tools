"use client";
import { useState } from "react";

export default function TextFormatter() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");

  const toUpper = () => setOutput(text.toUpperCase());

  const toLower = () => setOutput(text.toLowerCase());

  const capitalize = () =>
    setOutput(text.replace(/\b\w/g, (c) => c.toUpperCase()));

  // ✅ FIXED (Clean extra spaces)
  const cleanSpaces = () =>
    setOutput(text.replace(/\s+/g, " ").trim());

  const copyText = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Text Formatter</h1>

      <textarea
        className="w-full p-2 border rounded mb-4"
        rows="5"
        placeholder="Enter your text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={toUpper} className="bg-blue-500 text-white px-3 py-1 rounded">
          UPPERCASE
        </button>

        <button onClick={toLower} className="bg-green-500 text-white px-3 py-1 rounded">
          lowercase
        </button>

        <button onClick={capitalize} className="bg-purple-500 text-white px-3 py-1 rounded">
          Capitalize
        </button>

        <button onClick={cleanSpaces} className="bg-red-500 text-white px-3 py-1 rounded">
          Clean Spaces
        </button>
      </div>

      <textarea
        className="w-full p-2 border rounded mb-2"
        rows="5"
        value={output}
        readOnly
      />

      <button
        onClick={copyText}
        className="bg-black text-white px-4 py-1 rounded"
      >
        Copy Output
      </button>
    </div>
  );
}
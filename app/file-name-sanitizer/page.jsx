"use client";

import { useMemo, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const WINDOWS_RESERVED = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
]);

function sanitizeName(input, style, maxLength) {
  const trimmed = input.trim();
  if (!trimmed) return "untitled";

  const lastDot = trimmed.lastIndexOf(".");
  const hasExtension = lastDot > 0 && lastDot < trimmed.length - 1;
  const rawBase = hasExtension ? trimmed.slice(0, lastDot) : trimmed;
  const rawExt = hasExtension ? trimmed.slice(lastDot + 1) : "";

  let base = rawBase
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, " ")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (style === "kebab") {
    base = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  } else if (style === "snake") {
    base = base.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  } else {
    base = base.replace(/[^a-zA-Z0-9 ._-]+/g, "").replace(/\s+/g, " ").trim();
  }

  if (!base) base = "untitled";
  if (WINDOWS_RESERVED.has(base.toUpperCase())) {
    base = `${base}-file`;
  }

  const cleanExt = rawExt.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const maxBaseLength = Math.max(8, maxLength - (cleanExt ? cleanExt.length + 1 : 0));
  const safeBase = base.slice(0, maxBaseLength).replace(/[._ -]+$/g, "") || "untitled";

  return cleanExt ? `${safeBase}.${cleanExt}` : safeBase;
}

export default function FileNameSanitizer() {
  const [input, setInput] = useState("Screenshot 2026-04-26 at 09.10.11 PM.png\nFinal Report (v2)!!.pdf\nCON.txt\nMy Trip ✈️ Photos.zip");
  const [style, setStyle] = useState("kebab");
  const [maxLength, setMaxLength] = useState(70);
  const [copied, setCopied] = useState(false);

  const styleOptions = [
    { value: "kebab", label: "kebab-case" },
    { value: "snake", label: "snake_case" },
    { value: "readable", label: "Readable file name" },
  ];

  const lines = useMemo(
    () => input.split("\n").map((line) => line.trim()).filter(Boolean),
    [input]
  );

  const sanitized = useMemo(
    () => lines.map((line) => ({ original: line, clean: sanitizeName(line, style, maxLength) })),
    [lines, style, maxLength]
  );

  const handleCopy = async () => {
    if (!sanitized.length) return;
    const payload = sanitized.map((item) => item.clean).join("\n");
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-5xl border border-neutral-200 flex flex-col gap-6">
        <div className="flex flex-col gap-1 items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">File Name Sanitizer</h1>
          <p className="text-neutral-500 text-base">Clean messy filenames for safe sharing, backups, and uploads.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-neutral-900">Original names</h2>
              <span className="text-xs text-neutral-500">One per line</span>
            </div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={10}
              className="w-full p-4 border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition text-sm text-black placeholder:text-neutral-300"
              placeholder="Paste file names here..."
            />
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-neutral-900">Sanitize options</h2>

            <label className="text-sm text-neutral-600 flex flex-col gap-2">
              Naming style
              <ThemedDropdown
                ariaLabel="Select naming style"
                value={style}
                options={styleOptions}
                onChange={setStyle}
              />
            </label>

            <label className="text-sm text-neutral-600 flex flex-col gap-2">
              Max length: {maxLength}
              <input
                type="range"
                min="24"
                max="120"
                value={maxLength}
                onChange={(event) => setMaxLength(Number(event.target.value))}
                className="w-full accent-neutral-900"
              />
            </label>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full border border-neutral-900 text-neutral-900 py-2.5 rounded-lg font-semibold hover:bg-neutral-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              {copied ? "Copied" : "Copy sanitized list"}
            </button>

            <p className="text-xs text-neutral-500">Removes unsafe symbols, trims spaces, and avoids reserved Windows file names.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-base font-semibold text-neutral-900">Sanitized preview</h2>
            <span className="text-xs text-neutral-500">{sanitized.length} file(s)</span>
          </div>

          {sanitized.length === 0 ? (
            <p className="text-sm text-neutral-500">Add at least one filename to preview sanitized output.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {sanitized.map((item, idx) => (
                <div key={`${item.original}-${idx}`} className="rounded-xl border border-neutral-200 bg-white p-3 text-sm">
                  <p className="text-neutral-500 truncate">{item.original}</p>
                  <p className="text-neutral-900 font-medium truncate">{item.clean}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}

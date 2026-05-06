"use client";

import { useMemo, useState } from "react";

const BASES = {
  binary: 2,
  decimal: 10,
  octal: 8,
  hex: 16,
};

const EXAMPLES = [
  { label: "10", value: "10", base: "decimal" },
  { label: "255", value: "255", base: "decimal" },
  { label: "1024", value: "1024", base: "decimal" },
  { label: "11111111", value: "11111111", base: "binary" },
  { label: "FF", value: "FF", base: "hex" },
];

function normalizeInput(raw) {
  return raw.replace(/[_\s]/g, "").trim();
}

function isValidForBase(value, base) {
  if (!value) return true;

  const checks = {
    binary: /^-?[01]+$/,
    decimal: /^-?[0-9]+$/,
    octal: /^-?[0-7]+$/,
    hex: /^-?[0-9a-fA-F]+$/,
  };

  return checks[base].test(value);
}

function parseToBigInt(value, base) {
  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;

  if (!unsigned) return null;

  const parsed = BigInt(parseInt(unsigned, BASES[base]));
  // parseInt can lose precision for huge numbers, so use manual fallback.
  if (unsigned.length > 14) {
    let total = 0n;
    const radix = BigInt(BASES[base]);

    for (const char of unsigned.toLowerCase()) {
      const digit = parseInt(char, BASES[base]);
      total = total * radix + BigInt(digit);
    }

    return negative ? -total : total;
  }

  return negative ? -parsed : parsed;
}

function toBaseString(number, base) {
  const output = number.toString(BASES[base]);
  return base === "hex" ? output.toUpperCase() : output;
}

export default function BaseConverterPage() {
  const [sourceBase, setSourceBase] = useState("decimal");
  const [sourceValue, setSourceValue] = useState("10");
  const [copiedField, setCopiedField] = useState("");

  const cleanedSource = useMemo(() => normalizeInput(sourceValue), [sourceValue]);

  const conversion = useMemo(() => {
    if (!cleanedSource) {
      return {
        binary: "",
        decimal: "",
        octal: "",
        hex: "",
        error: "",
      };
    }

    if (!isValidForBase(cleanedSource, sourceBase)) {
      const hints = {
        binary: "Binary accepts only 0 and 1.",
        decimal: "Decimal accepts digits 0 to 9.",
        octal: "Octal accepts digits 0 to 7.",
        hex: "Hex accepts 0-9 and A-F.",
      };

      return {
        binary: "",
        decimal: "",
        octal: "",
        hex: "",
        error: hints[sourceBase],
      };
    }

    try {
      const parsed = parseToBigInt(cleanedSource, sourceBase);

      if (parsed === null) {
        return {
          binary: "",
          decimal: "",
          octal: "",
          hex: "",
          error: "Enter a valid value.",
        };
      }

      return {
        binary: toBaseString(parsed, "binary"),
        decimal: toBaseString(parsed, "decimal"),
        octal: toBaseString(parsed, "octal"),
        hex: toBaseString(parsed, "hex"),
        error: "",
      };
    } catch {
      return {
        binary: "",
        decimal: "",
        octal: "",
        hex: "",
        error: "Could not convert this value. Please check the input format.",
      };
    }
  }, [cleanedSource, sourceBase]);

  const fields = [
    { key: "binary", label: "Binary", placeholder: "e.g. 1010" },
    { key: "decimal", label: "Decimal", placeholder: "e.g. 42" },
    { key: "octal", label: "Octal", placeholder: "e.g. 52" },
    { key: "hex", label: "Hex", placeholder: "e.g. 2A" },
  ];

  const handleFieldChange = (base, value) => {
    setSourceBase(base);
    setSourceValue(value);
  };

  const handleCopy = async (base) => {
    const text = sourceBase === base ? sourceValue : conversion[base];
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(base);
      setTimeout(() => setCopiedField(""), 1200);
    } catch {
      setCopiedField("");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-4xl border border-neutral-200 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Base Converter</h1>
          <p className="text-neutral-500 text-base">Convert values between Binary, Decimal, Octal, and Hex in real time.</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col gap-3">
          <p className="text-sm text-neutral-600">Quick examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((item) => (
              <button
                key={`${item.base}-${item.value}`}
                type="button"
                onClick={() => {
                  setSourceBase(item.base);
                  setSourceValue(item.value);
                }}
                className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setSourceBase("decimal");
                setSourceValue("");
              }}
              className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            const active = sourceBase === field.key;
            const value = active ? sourceValue : conversion[field.key];

            return (
              <div key={field.key} className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{field.label}</p>
                    <p className="text-xs text-neutral-500">Base {BASES[field.key]}</p>
                  </div>
                  {active && <span className="text-[11px] font-semibold rounded-full border border-neutral-900 bg-neutral-900 text-white px-2 py-1">Input</span>}
                </div>

                <input
                  value={value}
                  onChange={(event) => handleFieldChange(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-3 border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition text-base text-black placeholder:text-neutral-300"
                />

                <button
                  type="button"
                  onClick={() => handleCopy(field.key)}
                  disabled={!value}
                  className={`w-full border py-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                    value
                      ? "border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                      : "border-neutral-300 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  {copiedField === field.key ? "Copied" : `Copy ${field.label}`}
                </button>
              </div>
            );
          })}
        </div>

        {conversion.error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{conversion.error}</div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            Tip: Type in any field and all other bases update automatically.
          </div>
        )}
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}

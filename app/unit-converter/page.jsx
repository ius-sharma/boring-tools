"use client";
import { useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

export default function UnitConverter() {
  const [type, setType] = useState("length");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("km");
  const [toUnit, setToUnit] = useState("m");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [precision, setPrecision] = useState("4");
  const [showToast, setShowToast] = useState(false);

  const units = {
    length: ["km", "m", "cm", "mile"],
    weight: ["kg", "g", "lb"],
    temperature: ["C", "F"],
  };

  const typeOptions = [
    { value: "length", label: "Length" },
    { value: "weight", label: "Weight" },
    { value: "temperature", label: "Temperature" },
  ];

  const precisionOptions = [
    { value: "auto", label: "Precision: Auto" },
    { value: "2", label: "Precision: 2 decimals" },
    { value: "4", label: "Precision: 4 decimals" },
    { value: "6", label: "Precision: 6 decimals" },
  ];

  const resetOutputState = () => {
    setResult("");
    setError("");
  };

  const swapUnits = () => {
    const previousFrom = fromUnit;
    setFromUnit(toUnit);
    setToUnit(previousFrom);
    resetOutputState();
  };

  const formatOutput = (output) => {
    const normalized = Math.abs(output) < 1e-12 ? 0 : output;
    if (precision === "auto") {
      return parseFloat(normalized.toFixed(12)).toString();
    }

    return normalized.toFixed(Number(precision));
  };

  const convert = () => {
    if (!value.trim()) {
      setError("Please enter a value to convert");
      setResult("");
      return;
    }

    const val = parseFloat(value);
    if (isNaN(val) || !Number.isFinite(val)) {
      setError("Please enter a valid number");
      setResult("");
      return;
    }

    if (Math.abs(val) > 1e12) {
      setError("Value is too large. Please enter a smaller number.");
      setResult("");
      return;
    }

    let output;

    if (type === "length") {
      const factors = {
        km: 1000,
        m: 1,
        cm: 0.01,
        mile: 1609.34,
      };

      output = (val * factors[fromUnit]) / factors[toUnit];
    }

    if (type === "weight") {
      const factors = {
        kg: 1000,
        g: 1,
        lb: 453.592,
      };

      output = (val * factors[fromUnit]) / factors[toUnit];
    }

    if (type === "temperature") {
      if (fromUnit === "C" && toUnit === "F") {
        output = (val * 9) / 5 + 32;
      } else if (fromUnit === "F" && toUnit === "C") {
        output = ((val - 32) * 5) / 9;
      } else {
        output = val;
      }
    }

    setError("");
    setResult(formatOutput(output));
  };

  const copyResult = async () => {
    if (!result) return;
    const text = `${value} ${fromUnit} = ${result} ${toUnit}`;
    await navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-5 sm:p-8 w-full max-w-xl border border-neutral-200 flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-1">Unit Converter</h1>
          <p className="text-neutral-500 text-base">Convert values across length, weight, and temperature</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ThemedDropdown
            ariaLabel="Select conversion category"
            value={type}
            options={typeOptions}
            onChange={(newType) => {
              setType(newType);
              setFromUnit(units[newType][0]);
              setToUnit(units[newType][1]);
              resetOutputState();
            }}
          />

          <ThemedDropdown
            ariaLabel="Select precision"
            value={precision}
            options={precisionOptions}
            onChange={(newPrecision) => {
              setPrecision(newPrecision);
              resetOutputState();
            }}
          />
        </div>

        <input
          type="number"
          placeholder="Enter value"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            resetOutputState();
          }}
          className="w-full p-4 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition text-base text-black placeholder:text-neutral-300"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <ThemedDropdown
            ariaLabel="Select source unit"
            value={fromUnit}
            options={units[type].map((unit) => ({ value: unit, label: unit }))}
            onChange={(newUnit) => {
              setFromUnit(newUnit);
              resetOutputState();
            }}
          />

          <button
            onClick={swapUnits}
            className="h-14 min-w-14 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-700 bg-neutral-50 hover:bg-neutral-100 transition font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 flex items-center justify-center shadow-sm"
            aria-label="Swap units"
          >
            ⇄
          </button>

          <ThemedDropdown
            ariaLabel="Select target unit"
            value={toUnit}
            options={units[type].map((unit) => ({ value: unit, label: unit }))}
            onChange={(newUnit) => {
              setToUnit(newUnit);
              resetOutputState();
            }}
          />
        </div>

        <button
          onClick={convert}
          className="w-full border border-neutral-900 text-neutral-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-neutral-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          Convert
        </button>

        {error && <p className="text-red-600 text-sm -mt-2">{error}</p>}

        {result ? (
          <div className="w-full p-4 border border-neutral-200 rounded-xl bg-neutral-50 text-center space-y-2">
            <h2 className="text-2xl font-bold text-neutral-900">{result}</h2>
            <p className="text-sm text-neutral-500">{toUnit}</p>
            <p className="text-sm text-neutral-600 break-words">
              {value} {fromUnit} = {result} {toUnit}
            </p>

            <button
              onClick={copyResult}
              className="w-full border border-neutral-900 text-neutral-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-neutral-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              Copy Result
            </button>
          </div>
        ) : (
          <div className="w-full p-4 border border-dashed border-neutral-100 rounded-xl bg-neutral-50 text-neutral-300 text-base min-h-[96px] flex items-center justify-center select-none">
            Converted output will appear here
          </div>
        )}

        {showToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-fade-in-out">
            Result copied!
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
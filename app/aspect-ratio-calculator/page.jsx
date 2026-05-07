"use client";

import React, { useMemo, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

export default function AspectRatioCalculator() {
  const [origW, setOrigW] = useState(1920);
  const [origH, setOrigH] = useState(1080);
  const [targetW, setTargetW] = useState(0);
  const [targetH, setTargetH] = useState(0);
  const [preset, setPreset] = useState("16:9");
  const [precision, setPrecision] = useState("0");

  const presets = [
    { value: "16:9", label: "16:9" },
    { value: "4:3", label: "4:3" },
    { value: "1:1", label: "1:1" },
  ];

  const ratio = useMemo(() => {
    if (origW && origH) return origW / origH;
    return 16 / 9;
  }, [origW, origH]);

  const applyPreset = (p) => {
    setPreset(p);
    const [w, h] = p.split(":").map(Number);
    setOrigW(w * 100);
    setOrigH(h * 100);
    setTargetW(0);
    setTargetH(0);
  };

  const computeFromWidth = () => {
    if (!targetW) return;
    const h = targetW / ratio;
    setTargetH(Number(h.toFixed(Number(precision))));
  };

  const computeFromHeight = () => {
    if (!targetH) return;
    const w = targetH * ratio;
    setTargetW(Number(w.toFixed(Number(precision))));
  };

  const reset = () => {
    setTargetW(0);
    setTargetH(0);
    setOrigW(1920);
    setOrigH(1080);
    setPreset("16:9");
    setPrecision("0");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Aspect Ratio Calculator</h1>
          <p className="text-slate-500">Resize while preserving aspect ratio</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-700">Original Width</label>
                <input
                  type="number"
                  value={origW}
                  onChange={(e) => setOrigW(Number(e.target.value || 0))}
                  className="w-full p-4 border rounded-lg"
                  placeholder="Original width"
                />
              </div>

              <div>
                <label className="text-sm text-slate-700">Original Height</label>
                <input
                  type="number"
                  value={origH}
                  onChange={(e) => setOrigH(Number(e.target.value || 0))}
                  className="w-full p-4 border rounded-lg"
                  placeholder="Original height"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <ThemedDropdown value={preset} options={presets} onChange={applyPreset} ariaLabel="Choose ratio preset" />
              <input
                type="number"
                value={precision}
                onChange={(e) => setPrecision(e.target.value)}
                className="p-4 border rounded-lg"
                placeholder="Decimal places"
              />
              <button onClick={reset} className="px-4 py-2 rounded-lg border">Reset</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-1">Target Width</label>
                <input
                  type="number"
                  value={targetW}
                  onChange={(e) => setTargetW(Number(e.target.value || 0))}
                  className="w-full p-4 border rounded-lg"
                  placeholder="Enter width to compute height"
                />
                <button onClick={computeFromWidth} className="mt-2 w-full border rounded-lg py-2">Compute Height</button>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1">Target Height</label>
                <input
                  type="number"
                  value={targetH}
                  onChange={(e) => setTargetH(Number(e.target.value || 0))}
                  className="w-full p-4 border rounded-lg"
                  placeholder="Enter height to compute width"
                />
                <button onClick={computeFromHeight} className="mt-2 w-full border rounded-lg py-2">Compute Width</button>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="w-full p-6 border border-slate-200 rounded-lg bg-slate-50 text-center">
              <div className="text-sm text-slate-700">Computed</div>
              <div className="text-2xl font-bold mt-2">{targetW || "—"} × {targetH || "—"}</div>
              <div className="text-sm text-slate-500 mt-2">Original ratio: {Math.round(ratio * 100) / 100}</div>
            </div>

            <div className="w-full p-4 border border-slate-200 rounded-lg bg-slate-50 flex-1 flex items-center justify-center">
              <div style={{ width: Math.min(900, targetW || origW), height: Math.min(480, targetH || origH), border: '2px dashed rgba(209,213,219,0.6)' }} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { navigator.clipboard.writeText(`${targetW || '-'} x ${targetH || '-'}`); }} className="flex-1 border rounded-lg py-2">Copy</button>
              <button onClick={() => { setTargetW(0); setTargetH(0); }} className="flex-1 border rounded-lg py-2">Clear</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



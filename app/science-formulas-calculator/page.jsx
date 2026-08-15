"use client";

import { useState, useMemo } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const formulaCategories = {
  Physics: [
    {
      id: "force",
      name: "Force (F = m × a)",
      formula: "F = m × a",
      defaultTarget: "F",
      targets: [
        {
          id: "F",
          label: "Force (F)",
          unit: "N",
          formulaStr: "F = m × a",
          inputs: [
            { key: "m", label: "Mass (m)", unit: "kg", default: 10 },
            { key: "a", label: "Acceleration (a)", unit: "m/s²", default: 9.81 },
          ],
          solve: (v) => {
            const m = parseFloat(v.m), a = parseFloat(v.a);
            if (isNaN(m) || isNaN(a)) return { error: "Please enter valid numeric values." };
            const ans = m * a;
            return {
              answerStr: `F = ${ans.toFixed(4)} N`,
              steps: [
                `Step 1: Identify mass (m = ${m} kg) and acceleration (a = ${a} m/s²)`,
                `Step 2: Apply formula → F = m × a = ${m} × ${a}`,
                `Step 3: Result → F = ${ans.toFixed(4)} N (Newtons)`,
              ],
            };
          },
        },
        {
          id: "m",
          label: "Mass (m)",
          unit: "kg",
          formulaStr: "m = F / a",
          inputs: [
            { key: "F", label: "Force (F)", unit: "N", default: 98.1 },
            { key: "a", label: "Acceleration (a)", unit: "m/s²", default: 9.81 },
          ],
          solve: (v) => {
            const F = parseFloat(v.F), a = parseFloat(v.a);
            if (isNaN(F) || isNaN(a)) return { error: "Please enter valid numeric values." };
            if (a === 0) return { error: "Acceleration cannot be zero (division by zero)." };
            const ans = F / a;
            return {
              answerStr: `m = ${ans.toFixed(4)} kg`,
              steps: [
                `Step 1: Identify Force (F = ${F} N) and Acceleration (a = ${a} m/s²)`,
                `Step 2: Rearrange formula → m = F / a = ${F} / ${a}`,
                `Step 3: Result → m = ${ans.toFixed(4)} kg`,
              ],
            };
          },
        },
        {
          id: "a",
          label: "Acceleration (a)",
          unit: "m/s²",
          formulaStr: "a = F / m",
          inputs: [
            { key: "F", label: "Force (F)", unit: "N", default: 98.1 },
            { key: "m", label: "Mass (m)", unit: "kg", default: 10 },
          ],
          solve: (v) => {
            const F = parseFloat(v.F), m = parseFloat(v.m);
            if (isNaN(F) || isNaN(m)) return { error: "Please enter valid numeric values." };
            if (m <= 0) return { error: "Mass must be greater than zero." };
            const ans = F / m;
            return {
              answerStr: `a = ${ans.toFixed(4)} m/s²`,
              steps: [
                `Step 1: Identify Force (F = ${F} N) and Mass (m = ${m} kg)`,
                `Step 2: Rearrange formula → a = F / m = ${F} / ${m}`,
                `Step 3: Result → a = ${ans.toFixed(4)} m/s²`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "velocity",
      name: "Velocity (v = d / t)",
      formula: "v = d / t",
      defaultTarget: "v",
      targets: [
        {
          id: "v",
          label: "Velocity (v)",
          unit: "m/s",
          formulaStr: "v = d / t",
          inputs: [
            { key: "d", label: "Distance (d)", unit: "m", default: 100 },
            { key: "t", label: "Time (t)", unit: "s", default: 9.58 },
          ],
          solve: (v) => {
            const d = parseFloat(v.d), t = parseFloat(v.t);
            if (isNaN(d) || isNaN(t)) return { error: "Please enter valid numeric values." };
            if (t <= 0) return { error: "Time must be greater than zero." };
            const ans = d / t;
            return {
              answerStr: `v = ${ans.toFixed(4)} m/s`,
              steps: [
                `Step 1: Identify distance (d = ${d} m) and time (t = ${t} s)`,
                `Step 2: Apply formula → v = d / t = ${d} / ${t}`,
                `Step 3: Result → v = ${ans.toFixed(4)} m/s`,
              ],
            };
          },
        },
        {
          id: "d",
          label: "Distance (d)",
          unit: "m",
          formulaStr: "d = v × t",
          inputs: [
            { key: "v", label: "Velocity (v)", unit: "m/s", default: 10.44 },
            { key: "t", label: "Time (t)", unit: "s", default: 9.58 },
          ],
          solve: (val) => {
            const v = parseFloat(val.v), t = parseFloat(val.t);
            if (isNaN(v) || isNaN(t)) return { error: "Please enter valid numeric values." };
            const ans = v * t;
            return {
              answerStr: `d = ${ans.toFixed(4)} m`,
              steps: [
                `Step 1: Identify velocity (v = ${v} m/s) and time (t = ${t} s)`,
                `Step 2: Rearrange formula → d = v × t = ${v} × ${t}`,
                `Step 3: Result → d = ${ans.toFixed(4)} m`,
              ],
            };
          },
        },
        {
          id: "t",
          label: "Time (t)",
          unit: "s",
          formulaStr: "t = d / v",
          inputs: [
            { key: "d", label: "Distance (d)", unit: "m", default: 100 },
            { key: "v", label: "Velocity (v)", unit: "m/s", default: 10.44 },
          ],
          solve: (val) => {
            const d = parseFloat(val.d), v = parseFloat(val.v);
            if (isNaN(d) || isNaN(v)) return { error: "Please enter valid numeric values." };
            if (v === 0) return { error: "Velocity cannot be zero (division by zero)." };
            const ans = d / v;
            return {
              answerStr: `t = ${ans.toFixed(4)} s`,
              steps: [
                `Step 1: Identify distance (d = ${d} m) and velocity (v = ${v} m/s)`,
                `Step 2: Rearrange formula → t = d / v = ${d} / ${v}`,
                `Step 3: Result → t = ${ans.toFixed(4)} s`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "acceleration",
      name: "Acceleration (a = Δv / t)",
      formula: "a = (v₂ - v₁) / t",
      defaultTarget: "a",
      targets: [
        {
          id: "a",
          label: "Acceleration (a)",
          unit: "m/s²",
          formulaStr: "a = (v₂ - v₁) / t",
          inputs: [
            { key: "v1", label: "Initial Velocity (v₁)", unit: "m/s", default: 0 },
            { key: "v2", label: "Final Velocity (v₂)", unit: "m/s", default: 28 },
            { key: "t", label: "Time (t)", unit: "s", default: 4 },
          ],
          solve: (v) => {
            const v1 = parseFloat(v.v1), v2 = parseFloat(v.v2), t = parseFloat(v.t);
            if (isNaN(v1) || isNaN(v2) || isNaN(t)) return { error: "Please enter valid numeric values." };
            if (t <= 0) return { error: "Time must be greater than zero." };
            const dv = v2 - v1;
            const ans = dv / t;
            return {
              answerStr: `a = ${ans.toFixed(4)} m/s²`,
              steps: [
                `Step 1: Initial velocity = ${v1} m/s, Final velocity = ${v2} m/s, Time = ${t} s`,
                `Step 2: Calculate change in velocity Δv = v₂ - v₁ = ${v2} - ${v1} = ${dv} m/s`,
                `Step 3: Apply formula → a = Δv / t = ${dv} / ${t} = ${ans.toFixed(4)} m/s²`,
              ],
            };
          },
        },
        {
          id: "v2",
          label: "Final Velocity (v₂)",
          unit: "m/s",
          formulaStr: "v₂ = v₁ + (a × t)",
          inputs: [
            { key: "v1", label: "Initial Velocity (v₁)", unit: "m/s", default: 0 },
            { key: "a", label: "Acceleration (a)", unit: "m/s²", default: 7 },
            { key: "t", label: "Time (t)", unit: "s", default: 4 },
          ],
          solve: (v) => {
            const v1 = parseFloat(v.v1), a = parseFloat(v.a), t = parseFloat(v.t);
            if (isNaN(v1) || isNaN(a) || isNaN(t)) return { error: "Please enter valid numeric values." };
            const ans = v1 + a * t;
            return {
              answerStr: `v₂ = ${ans.toFixed(4)} m/s`,
              steps: [
                `Step 1: Initial velocity = ${v1} m/s, Acceleration = ${a} m/s², Time = ${t} s`,
                `Step 2: Rearrange formula → v₂ = v₁ + (a × t)`,
                `Step 3: Calculate → v₂ = ${v1} + (${a} × ${t}) = ${ans.toFixed(4)} m/s`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "kinetic_energy",
      name: "Kinetic Energy (KE = ½mv²)",
      formula: "KE = ½ × m × v²",
      defaultTarget: "KE",
      targets: [
        {
          id: "KE",
          label: "Kinetic Energy (KE)",
          unit: "J",
          formulaStr: "KE = ½ × m × v²",
          inputs: [
            { key: "m", label: "Mass (m)", unit: "kg", default: 1000 },
            { key: "v", label: "Velocity (v)", unit: "m/s", default: 20 },
          ],
          solve: (val) => {
            const m = parseFloat(val.m), v = parseFloat(val.v);
            if (isNaN(m) || isNaN(v)) return { error: "Please enter valid numeric values." };
            if (m < 0) return { error: "Mass cannot be negative." };
            const ans = 0.5 * m * v * v;
            return {
              answerStr: `KE = ${ans.toFixed(4)} J`,
              steps: [
                `Step 1: Mass = ${m} kg, Velocity = ${v} m/s`,
                `Step 2: Square velocity → v² = ${v}² = ${(v * v).toFixed(4)}`,
                `Step 3: KE = 0.5 × ${m} × ${(v * v).toFixed(4)} = ${ans.toFixed(4)} J (Joules)`,
              ],
            };
          },
        },
        {
          id: "v",
          label: "Velocity (v)",
          unit: "m/s",
          formulaStr: "v = √(2 × KE / m)",
          inputs: [
            { key: "KE", label: "Kinetic Energy (KE)", unit: "J", default: 200000 },
            { key: "m", label: "Mass (m)", unit: "kg", default: 1000 },
          ],
          solve: (val) => {
            const KE = parseFloat(val.KE), m = parseFloat(val.m);
            if (isNaN(KE) || isNaN(m)) return { error: "Please enter valid numeric values." };
            if (m <= 0) return { error: "Mass must be greater than zero." };
            if (KE < 0) return { error: "Kinetic energy cannot be negative." };
            const ans = Math.sqrt((2 * KE) / m);
            return {
              answerStr: `v = ${ans.toFixed(4)} m/s`,
              steps: [
                `Step 1: Kinetic Energy = ${KE} J, Mass = ${m} kg`,
                `Step 2: Rearrange formula → v = √(2 × KE / m) = √(2 × ${KE} / ${m})`,
                `Step 3: Result → v = √(${((2 * KE) / m).toFixed(4)}) = ${ans.toFixed(4)} m/s`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "potential_energy",
      name: "Potential Energy (PE = mgh)",
      formula: "PE = m × g × h",
      defaultTarget: "PE",
      targets: [
        {
          id: "PE",
          label: "Potential Energy (PE)",
          unit: "J",
          formulaStr: "PE = m × g × h",
          inputs: [
            { key: "m", label: "Mass (m)", unit: "kg", default: 5 },
            { key: "g", label: "Gravity (g)", unit: "m/s²", default: 9.81 },
            { key: "h", label: "Height (h)", unit: "m", default: 10 },
          ],
          solve: (v) => {
            const m = parseFloat(v.m), g = parseFloat(v.g), h = parseFloat(v.h);
            if (isNaN(m) || isNaN(g) || isNaN(h)) return { error: "Please enter valid numeric values." };
            const ans = m * g * h;
            return {
              answerStr: `PE = ${ans.toFixed(4)} J`,
              steps: [
                `Step 1: Mass = ${m} kg, g = ${g} m/s², Height = ${h} m`,
                `Step 2: Apply formula → PE = m × g × h = ${m} × ${g} × ${h}`,
                `Step 3: Result → PE = ${ans.toFixed(4)} J`,
              ],
            };
          },
        },
        {
          id: "h",
          label: "Height (h)",
          unit: "m",
          formulaStr: "h = PE / (m × g)",
          inputs: [
            { key: "PE", label: "Potential Energy (PE)", unit: "J", default: 490.5 },
            { key: "m", label: "Mass (m)", unit: "kg", default: 5 },
            { key: "g", label: "Gravity (g)", unit: "m/s²", default: 9.81 },
          ],
          solve: (v) => {
            const PE = parseFloat(v.PE), m = parseFloat(v.m), g = parseFloat(v.g);
            if (isNaN(PE) || isNaN(m) || isNaN(g)) return { error: "Please enter valid numeric values." };
            if (m <= 0 || g === 0) return { error: "Mass and gravity must be valid non-zero numbers." };
            const ans = PE / (m * g);
            return {
              answerStr: `h = ${ans.toFixed(4)} m`,
              steps: [
                `Step 1: PE = ${PE} J, Mass = ${m} kg, Gravity = ${g} m/s²`,
                `Step 2: Rearrange formula → h = PE / (m × g) = ${PE} / (${m} × ${g})`,
                `Step 3: Result → h = ${ans.toFixed(4)} m`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "work",
      name: "Work (W = F × d)",
      formula: "W = F × d",
      defaultTarget: "W",
      targets: [
        {
          id: "W",
          label: "Work (W)",
          unit: "J",
          formulaStr: "W = F × d",
          inputs: [
            { key: "f", label: "Force (F)", unit: "N", default: 50 },
            { key: "d", label: "Distance (d)", unit: "m", default: 12 },
          ],
          solve: (v) => {
            const f = parseFloat(v.f), d = parseFloat(v.d);
            if (isNaN(f) || isNaN(d)) return { error: "Please enter valid numeric values." };
            const ans = f * d;
            return {
              answerStr: `W = ${ans.toFixed(4)} J`,
              steps: [
                `Step 1: Force = ${f} N, Distance = ${d} m`,
                `Step 2: Apply formula → W = F × d = ${f} × ${d}`,
                `Step 3: Result → W = ${ans.toFixed(4)} J`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "power",
      name: "Power (P = W / t)",
      formula: "P = W / t",
      defaultTarget: "P",
      targets: [
        {
          id: "P",
          label: "Power (P)",
          unit: "W",
          formulaStr: "P = W / t",
          inputs: [
            { key: "w", label: "Work (W)", unit: "J", default: 600 },
            { key: "t", label: "Time (t)", unit: "s", default: 10 },
          ],
          solve: (v) => {
            const w = parseFloat(v.w), t = parseFloat(v.t);
            if (isNaN(w) || isNaN(t)) return { error: "Please enter valid numeric values." };
            if (t <= 0) return { error: "Time must be greater than zero." };
            const ans = w / t;
            return {
              answerStr: `P = ${ans.toFixed(4)} W`,
              steps: [
                `Step 1: Work = ${w} J, Time = ${t} s`,
                `Step 2: Apply formula → P = W / t = ${w} / ${t}`,
                `Step 3: Result → P = ${ans.toFixed(4)} W (Watts)`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "pressure",
      name: "Pressure (P = F / A)",
      formula: "P = F / A",
      defaultTarget: "P",
      targets: [
        {
          id: "P",
          label: "Pressure (P)",
          unit: "Pa",
          formulaStr: "P = F / A",
          inputs: [
            { key: "f", label: "Force (F)", unit: "N", default: 500 },
            { key: "a", label: "Area (A)", unit: "m²", default: 2 },
          ],
          solve: (v) => {
            const f = parseFloat(v.f), a = parseFloat(v.a);
            if (isNaN(f) || isNaN(a)) return { error: "Please enter valid numeric values." };
            if (a <= 0) return { error: "Area must be greater than zero." };
            const ans = f / a;
            return {
              answerStr: `P = ${ans.toFixed(4)} Pa`,
              steps: [
                `Step 1: Force = ${f} N, Area = ${a} m²`,
                `Step 2: Apply formula → P = F / A = ${f} / ${a}`,
                `Step 3: Result → P = ${ans.toFixed(4)} Pa (Pascals)`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "density",
      name: "Density (ρ = m / V)",
      formula: "ρ = m / V",
      defaultTarget: "rho",
      targets: [
        {
          id: "rho",
          label: "Density (ρ)",
          unit: "kg/m³",
          formulaStr: "ρ = m / V",
          inputs: [
            { key: "m", label: "Mass (m)", unit: "kg", default: 1000 },
            { key: "v", label: "Volume (V)", unit: "m³", default: 1 },
          ],
          solve: (val) => {
            const m = parseFloat(val.m), v = parseFloat(val.v);
            if (isNaN(m) || isNaN(v)) return { error: "Please enter valid numeric values." };
            if (v <= 0) return { error: "Volume must be greater than zero." };
            const ans = m / v;
            return {
              answerStr: `ρ = ${ans.toFixed(4)} kg/m³`,
              steps: [
                `Step 1: Mass = ${m} kg, Volume = ${v} m³`,
                `Step 2: Apply formula → ρ = m / V = ${m} / ${v}`,
                `Step 3: Result → ρ = ${ans.toFixed(4)} kg/m³`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "ohms_law",
      name: "Ohm's Law (V = I × R)",
      formula: "V = I × R",
      defaultTarget: "V",
      targets: [
        {
          id: "V",
          label: "Voltage (V)",
          unit: "V",
          formulaStr: "V = I × R",
          inputs: [
            { key: "I", label: "Current (I)", unit: "A", default: 2 },
            { key: "R", label: "Resistance (R)", unit: "Ω", default: 10 },
          ],
          solve: (val) => {
            const I = parseFloat(val.I), R = parseFloat(val.R);
            if (isNaN(I) || isNaN(R)) return { error: "Please enter valid numeric values." };
            const ans = I * R;
            return {
              answerStr: `V = ${ans.toFixed(4)} V`,
              steps: [
                `Step 1: Current (I) = ${I} A, Resistance (R) = ${R} Ω`,
                `Step 2: Apply Ohm's Law → V = I × R = ${I} × ${R}`,
                `Step 3: Result → V = ${ans.toFixed(4)} V (Volts)`,
              ],
            };
          },
        },
        {
          id: "I",
          label: "Current (I)",
          unit: "A",
          formulaStr: "I = V / R",
          inputs: [
            { key: "V", label: "Voltage (V)", unit: "V", default: 220 },
            { key: "R", label: "Resistance (R)", unit: "Ω", default: 110 },
          ],
          solve: (val) => {
            const V = parseFloat(val.V), R = parseFloat(val.R);
            if (isNaN(V) || isNaN(R)) return { error: "Please enter valid numeric values." };
            if (R <= 0) return { error: "Resistance must be greater than zero." };
            const ans = V / R;
            return {
              answerStr: `I = ${ans.toFixed(4)} A`,
              steps: [
                `Step 1: Voltage (V) = ${V} V, Resistance (R) = ${R} Ω`,
                `Step 2: Rearrange formula → I = V / R = ${V} / ${R}`,
                `Step 3: Result → I = ${ans.toFixed(4)} A (Amperes)`,
              ],
            };
          },
        },
        {
          id: "R",
          label: "Resistance (R)",
          unit: "Ω",
          formulaStr: "R = V / I",
          inputs: [
            { key: "V", label: "Voltage (V)", unit: "V", default: 220 },
            { key: "I", label: "Current (I)", unit: "A", default: 2 },
          ],
          solve: (val) => {
            const V = parseFloat(val.V), I = parseFloat(val.I);
            if (isNaN(V) || isNaN(I)) return { error: "Please enter valid numeric values." };
            if (I === 0) return { error: "Current cannot be zero." };
            const ans = V / I;
            return {
              answerStr: `R = ${ans.toFixed(4)} Ω`,
              steps: [
                `Step 1: Voltage (V) = ${V} V, Current (I) = ${I} A`,
                `Step 2: Rearrange formula → R = V / I = ${V} / ${I}`,
                `Step 3: Result → R = ${ans.toFixed(4)} Ω (Ohms)`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "electrical_power",
      name: "Electrical Power (P = V × I)",
      formula: "P = V × I",
      defaultTarget: "P",
      targets: [
        {
          id: "P",
          label: "Power (P)",
          unit: "W",
          formulaStr: "P = V × I",
          inputs: [
            { key: "V", label: "Voltage (V)", unit: "V", default: 120 },
            { key: "I", label: "Current (I)", unit: "A", default: 5 },
          ],
          solve: (val) => {
            const V = parseFloat(val.V), I = parseFloat(val.I);
            if (isNaN(V) || isNaN(I)) return { error: "Please enter valid numeric values." };
            const ans = V * I;
            return {
              answerStr: `P = ${ans.toFixed(4)} W`,
              steps: [
                `Step 1: Voltage = ${V} V, Current = ${I} A`,
                `Step 2: P = V × I = ${V} × ${I}`,
                `Step 3: Result → P = ${ans.toFixed(4)} W (Watts)`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "wave_speed",
      name: "Wave Speed (v = f × λ)",
      formula: "v = f × λ",
      defaultTarget: "v",
      targets: [
        {
          id: "v",
          label: "Wave Speed (v)",
          unit: "m/s",
          formulaStr: "v = f × λ",
          inputs: [
            { key: "f", label: "Frequency (f)", unit: "Hz", default: 440 },
            { key: "lambda", label: "Wavelength (λ)", unit: "m", default: 0.78 },
          ],
          solve: (val) => {
            const f = parseFloat(val.f), lam = parseFloat(val.lambda);
            if (isNaN(f) || isNaN(lam)) return { error: "Please enter valid numeric values." };
            const ans = f * lam;
            return {
              answerStr: `v = ${ans.toFixed(4)} m/s`,
              steps: [
                `Step 1: Frequency = ${f} Hz, Wavelength = ${lam} m`,
                `Step 2: Apply formula → v = f × λ = ${f} × ${lam}`,
                `Step 3: Result → v = ${ans.toFixed(4)} m/s`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "momentum",
      name: "Momentum (p = m × v)",
      formula: "p = m × v",
      defaultTarget: "p",
      targets: [
        {
          id: "p",
          label: "Momentum (p)",
          unit: "kg·m/s",
          formulaStr: "p = m × v",
          inputs: [
            { key: "m", label: "Mass (m)", unit: "kg", default: 70 },
            { key: "v", label: "Velocity (v)", unit: "m/s", default: 10 },
          ],
          solve: (val) => {
            const m = parseFloat(val.m), v = parseFloat(val.v);
            if (isNaN(m) || isNaN(v)) return { error: "Please enter valid numeric values." };
            const ans = m * v;
            return {
              answerStr: `p = ${ans.toFixed(4)} kg·m/s`,
              steps: [
                `Step 1: Mass = ${m} kg, Velocity = ${v} m/s`,
                `Step 2: Apply formula → p = m × v = ${m} × ${v}`,
                `Step 3: Result → p = ${ans.toFixed(4)} kg·m/s`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "torque",
      name: "Torque (τ = F × r)",
      formula: "τ = F × r",
      defaultTarget: "tau",
      targets: [
        {
          id: "tau",
          label: "Torque (τ)",
          unit: "N·m",
          formulaStr: "τ = F × r",
          inputs: [
            { key: "F", label: "Force (F)", unit: "N", default: 40 },
            { key: "r", label: "Lever Arm (r)", unit: "m", default: 0.5 },
          ],
          solve: (val) => {
            const F = parseFloat(val.F), r = parseFloat(val.r);
            if (isNaN(F) || isNaN(r)) return { error: "Please enter valid numeric values." };
            const ans = F * r;
            return {
              answerStr: `τ = ${ans.toFixed(4)} N·m`,
              steps: [
                `Step 1: Force = ${F} N, Distance = ${r} m`,
                `Step 2: Apply formula → τ = F × r = ${F} × ${r}`,
                `Step 3: Result → τ = ${ans.toFixed(4)} N·m`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "ideal_gas_law",
      name: "Ideal Gas Law (PV = nRT)",
      formula: "P × V = n × R × T",
      defaultTarget: "P",
      targets: [
        {
          id: "P",
          label: "Pressure (P)",
          unit: "Pa",
          formulaStr: "P = (n × R × T) / V",
          inputs: [
            { key: "n", label: "Moles (n)", unit: "mol", default: 1 },
            { key: "T", label: "Temperature (T)", unit: "K", default: 298.15 },
            { key: "V", label: "Volume (V)", unit: "m³", default: 0.0244 },
          ],
          solve: (val) => {
            const n = parseFloat(val.n), T = parseFloat(val.T), V = parseFloat(val.V);
            const R = 8.314;
            if (isNaN(n) || isNaN(T) || isNaN(V)) return { error: "Please enter valid numeric values." };
            if (V <= 0) return { error: "Volume must be greater than zero." };
            if (T <= 0) return { error: "Temperature must be greater than zero Kelvin." };
            const ans = (n * R * T) / V;
            return {
              answerStr: `P = ${ans.toFixed(2)} Pa`,
              steps: [
                `Step 1: Moles (n) = ${n} mol, Temp (T) = ${T} K, Volume (V) = ${V} m³, Gas Constant R = 8.314 J/(mol·K)`,
                `Step 2: Rearrange formula → P = (n × R × T) / V`,
                `Step 3: Result → P = (${n} × 8.314 × ${T}) / ${V} = ${ans.toFixed(2)} Pa`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "hookes_law",
      name: "Hooke's Law (F = k × x)",
      formula: "F = k × x",
      defaultTarget: "F",
      targets: [
        {
          id: "F",
          label: "Spring Force (F)",
          unit: "N",
          formulaStr: "F = k × x",
          inputs: [
            { key: "k", label: "Spring Constant (k)", unit: "N/m", default: 500 },
            { key: "x", label: "Displacement (x)", unit: "m", default: 0.05 },
          ],
          solve: (val) => {
            const k = parseFloat(val.k), x = parseFloat(val.x);
            if (isNaN(k) || isNaN(x)) return { error: "Please enter valid numeric values." };
            const ans = k * x;
            return {
              answerStr: `F = ${ans.toFixed(4)} N`,
              steps: [
                `Step 1: Spring constant (k) = ${k} N/m, Displacement (x) = ${x} m`,
                `Step 2: F = k × x = ${k} × ${x}`,
                `Step 3: Result → F = ${ans.toFixed(4)} N`,
              ],
            };
          },
        },
      ],
    },
  ],
  Chemistry: [
    {
      id: "molarity",
      name: "Molarity (M = n / V)",
      formula: "M = n / V (in liters)",
      defaultTarget: "M",
      targets: [
        {
          id: "M",
          label: "Molarity (M)",
          unit: "mol/L",
          formulaStr: "M = n / V",
          inputs: [
            { key: "n", label: "Moles of Solute (n)", unit: "mol", default: 0.5 },
            { key: "v", label: "Volume (V)", unit: "L", default: 2 },
          ],
          solve: (val) => {
            const n = parseFloat(val.n), v = parseFloat(val.v);
            if (isNaN(n) || isNaN(v)) return { error: "Please enter valid numeric values." };
            if (v <= 0) return { error: "Volume must be greater than zero." };
            const ans = n / v;
            return {
              answerStr: `M = ${ans.toFixed(4)} mol/L`,
              steps: [
                `Step 1: Moles = ${n} mol, Volume = ${v} L`,
                `Step 2: M = n / V = ${n} / ${v}`,
                `Step 3: Result → M = ${ans.toFixed(4)} mol/L (Molar)`,
              ],
            };
          },
        },
        {
          id: "n",
          label: "Moles (n)",
          unit: "mol",
          formulaStr: "n = M × V",
          inputs: [
            { key: "M", label: "Molarity (M)", unit: "mol/L", default: 0.25 },
            { key: "v", label: "Volume (V)", unit: "L", default: 2 },
          ],
          solve: (val) => {
            const M = parseFloat(val.M), v = parseFloat(val.v);
            if (isNaN(M) || isNaN(v)) return { error: "Please enter valid numeric values." };
            const ans = M * v;
            return {
              answerStr: `n = ${ans.toFixed(4)} mol`,
              steps: [
                `Step 1: Molarity = ${M} mol/L, Volume = ${v} L`,
                `Step 2: n = M × V = ${M} × ${v}`,
                `Step 3: Result → n = ${ans.toFixed(4)} mol`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "ph",
      name: "pH Calculation (-log[H+])",
      formula: "pH = -log₁₀[H⁺]",
      defaultTarget: "ph",
      targets: [
        {
          id: "ph",
          label: "pH Value",
          unit: "",
          formulaStr: "pH = -log₁₀[H⁺]",
          inputs: [
            { key: "h", label: "[H⁺] Concentration", unit: "mol/L", default: 0.0001 },
          ],
          solve: (val) => {
            const h = parseFloat(val.h);
            if (isNaN(h)) return { error: "Please enter a valid concentration value." };
            if (h <= 0) return { error: "Hydrogen ion concentration [H+] must be greater than 0." };
            const ph = -Math.log10(h);
            let acidity = "";
            if (ph < 7) acidity = " (Acidic)";
            else if (ph === 7) acidity = " (Neutral)";
            else acidity = " (Basic / Alkaline)";

            return {
              answerStr: `pH = ${ph.toFixed(4)}${acidity}`,
              steps: [
                `Step 1: Given [H⁺] concentration = ${h} mol/L`,
                `Step 2: Calculate log₁₀(${h}) = ${Math.log10(h).toFixed(4)}`,
                `Step 3: pH = -(${Math.log10(h).toFixed(4)}) = ${ph.toFixed(4)}${acidity}`,
              ],
            };
          },
        },
        {
          id: "h_conc",
          label: "[H⁺] Concentration",
          unit: "mol/L",
          formulaStr: "[H⁺] = 10⁻ᵖᴴ",
          inputs: [
            { key: "ph_val", label: "pH Value", unit: "", default: 4 },
          ],
          solve: (val) => {
            const ph = parseFloat(val.ph_val);
            if (isNaN(ph)) return { error: "Please enter a valid pH value." };
            const h = Math.pow(10, -ph);
            return {
              answerStr: `[H⁺] = ${h.toExponential(4)} mol/L`,
              steps: [
                `Step 1: Given pH = ${ph}`,
                `Step 2: Rearrange formula → [H⁺] = 10⁻ᵖᴴ = 10⁻⁴`,
                `Step 3: Result → [H⁺] = ${h.toExponential(4)} mol/L`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "percent_composition",
      name: "Percent Composition",
      formula: "% = (mass element / mass compound) × 100",
      defaultTarget: "pct",
      targets: [
        {
          id: "pct",
          label: "Mass Percent (%)",
          unit: "%",
          formulaStr: "% = (m_elem / m_comp) × 100",
          inputs: [
            { key: "m_elem", label: "Mass of Element", unit: "g", default: 12 },
            { key: "m_comp", label: "Mass of Compound", unit: "g", default: 44 },
          ],
          solve: (val) => {
            const m_elem = parseFloat(val.m_elem), m_comp = parseFloat(val.m_comp);
            if (isNaN(m_elem) || isNaN(m_comp)) return { error: "Please enter valid numeric values." };
            if (m_comp <= 0) return { error: "Total mass of compound must be greater than zero." };
            const ans = (m_elem / m_comp) * 100;
            return {
              answerStr: `% = ${ans.toFixed(4)}%`,
              steps: [
                `Step 1: Mass of element = ${m_elem} g, Mass of compound = ${m_comp} g`,
                `Step 2: % = (${m_elem} / ${m_comp}) × 100`,
                `Step 3: Result → ${ans.toFixed(4)}%`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "molar_mass",
      name: "Molar Mass",
      formula: "Molar Mass = atoms × atomic mass",
      defaultTarget: "mm",
      targets: [
        {
          id: "mm",
          label: "Molar Mass",
          unit: "g/mol",
          formulaStr: "Molar Mass = Σ(atoms × atomic mass)",
          inputs: [
            { key: "atoms", label: "Number of Atoms", unit: "", default: 2 },
            { key: "mass_per_atom", label: "Atomic Mass", unit: "g/mol", default: 1.008 },
          ],
          solve: (val) => {
            const atoms = parseFloat(val.atoms), mass = parseFloat(val.mass_per_atom);
            if (isNaN(atoms) || isNaN(mass)) return { error: "Please enter valid numeric values." };
            const ans = atoms * mass;
            return {
              answerStr: `Molar Mass = ${ans.toFixed(4)} g/mol`,
              steps: [
                `Step 1: Atoms = ${atoms}, Atomic mass = ${mass} g/mol`,
                `Step 2: Molar Mass = ${atoms} × ${mass}`,
                `Step 3: Result → ${ans.toFixed(4)} g/mol`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "dilution_law",
      name: "Dilution Law (C₁V₁ = C₂V₂)",
      formula: "C₁ × V₁ = C₂ × V₂",
      defaultTarget: "C2",
      targets: [
        {
          id: "C2",
          label: "Final Concentration (C₂)",
          unit: "M",
          formulaStr: "C₂ = (C₁ × V₁) / V₂",
          inputs: [
            { key: "C1", label: "Initial Concentration (C₁)", unit: "M", default: 12 },
            { key: "V1", label: "Initial Volume (V₁)", unit: "mL", default: 50 },
            { key: "V2", label: "Final Volume (V₂)", unit: "mL", default: 500 },
          ],
          solve: (val) => {
            const C1 = parseFloat(val.C1), V1 = parseFloat(val.V1), V2 = parseFloat(val.V2);
            if (isNaN(C1) || isNaN(V1) || isNaN(V2)) return { error: "Please enter valid numeric values." };
            if (V2 <= 0) return { error: "Final volume V₂ must be greater than zero." };
            const ans = (C1 * V1) / V2;
            return {
              answerStr: `C₂ = ${ans.toFixed(4)} M`,
              steps: [
                `Step 1: C₁ = ${C1} M, V₁ = ${V1} mL, V₂ = ${V2} mL`,
                `Step 2: C₂ = (C₁ × V₁) / V₂ = (${C1} × ${V1}) / ${V2}`,
                `Step 3: Result → C₂ = ${ans.toFixed(4)} M`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "poh_relation",
      name: "pH & pOH Relation (pH + pOH = 14)",
      formula: "pH + pOH = 14",
      defaultTarget: "pH",
      targets: [
        {
          id: "pH",
          label: "pH Value",
          unit: "",
          formulaStr: "pH = 14 - pOH",
          inputs: [
            { key: "pOH", label: "pOH Value", unit: "", default: 3.5 },
          ],
          solve: (val) => {
            const poh = parseFloat(val.pOH);
            if (isNaN(poh)) return { error: "Please enter a valid pOH value." };
            const ans = 14 - poh;
            return {
              answerStr: `pH = ${ans.toFixed(2)}`,
              steps: [
                `Step 1: Given pOH = ${poh}`,
                `Step 2: pH = 14 - pOH = 14 - ${poh}`,
                `Step 3: Result → pH = ${ans.toFixed(2)}`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "boyles_law",
      name: "Boyle's Law (P₁V₁ = P₂V₂)",
      formula: "P₁ × V₁ = P₂ × V₂",
      defaultTarget: "P2",
      targets: [
        {
          id: "P2",
          label: "Final Pressure (P₂)",
          unit: "atm",
          formulaStr: "P₂ = (P₁ × V₁) / V₂",
          inputs: [
            { key: "P1", label: "Initial Pressure (P₁)", unit: "atm", default: 1 },
            { key: "V1", label: "Initial Volume (V₁)", unit: "L", default: 10 },
            { key: "V2", label: "Final Volume (V₂)", unit: "L", default: 2.5 },
          ],
          solve: (val) => {
            const P1 = parseFloat(val.P1), V1 = parseFloat(val.V1), V2 = parseFloat(val.V2);
            if (isNaN(P1) || isNaN(V1) || isNaN(V2)) return { error: "Please enter valid numeric values." };
            if (V2 <= 0) return { error: "Final volume V₂ must be greater than zero." };
            const ans = (P1 * V1) / V2;
            return {
              answerStr: `P₂ = ${ans.toFixed(4)} atm`,
              steps: [
                `Step 1: P₁ = ${P1} atm, V₁ = ${V1} L, V₂ = ${V2} L`,
                `Step 2: P₂ = (P₁ × V₁) / V₂ = (${P1} × ${V1}) / ${V2}`,
                `Step 3: Result → P₂ = ${ans.toFixed(4)} atm`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "half_life",
      name: "1st Order Reaction Half-Life",
      formula: "t½ = ln(2) / k",
      defaultTarget: "t_half",
      targets: [
        {
          id: "t_half",
          label: "Half-Life (t½)",
          unit: "s",
          formulaStr: "t½ = 0.6931 / k",
          inputs: [
            { key: "k", label: "Rate Constant (k)", unit: "s⁻¹", default: 0.05 },
          ],
          solve: (val) => {
            const k = parseFloat(val.k);
            if (isNaN(k)) return { error: "Please enter a valid rate constant." };
            if (k <= 0) return { error: "Rate constant k must be greater than zero." };
            const ans = Math.LN2 / k;
            return {
              answerStr: `t½ = ${ans.toFixed(4)} s`,
              steps: [
                `Step 1: Given rate constant k = ${k} s⁻¹`,
                `Step 2: Apply formula → t½ = ln(2) / k = 0.693147 / ${k}`,
                `Step 3: Result → t½ = ${ans.toFixed(4)} s`,
              ],
            };
          },
        },
      ],
    },
  ],
  Biology: [
    {
      id: "bmi",
      name: "BMI (kg / m²)",
      formula: "BMI = weight(kg) / height(m)²",
      defaultTarget: "bmi",
      targets: [
        {
          id: "bmi",
          label: "Body Mass Index (BMI)",
          unit: "kg/m²",
          formulaStr: "BMI = weight / height²",
          inputs: [
            { key: "weight", label: "Weight", unit: "kg", default: 70 },
            { key: "height", label: "Height", unit: "m", default: 1.75 },
          ],
          solve: (val) => {
            const weight = parseFloat(val.weight), height = parseFloat(val.height);
            if (isNaN(weight) || isNaN(height)) return { error: "Please enter valid numeric values." };
            if (height <= 0) return { error: "Height must be greater than zero meters." };
            const bmi = weight / (height * height);
            let category = "";
            if (bmi < 18.5) category = " (Underweight)";
            else if (bmi < 25) category = " (Normal weight)";
            else if (bmi < 30) category = " (Overweight)";
            else category = " (Obese)";

            return {
              answerStr: `BMI = ${bmi.toFixed(2)}${category}`,
              steps: [
                `Step 1: Weight = ${weight} kg, Height = ${height} m`,
                `Step 2: Square height → (${height})² = ${(height * height).toFixed(4)} m²`,
                `Step 3: BMI = ${weight} / ${(height * height).toFixed(4)} = ${bmi.toFixed(2)}${category}`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "heart_rate_reserve",
      name: "Heart Rate Reserve (HRR)",
      formula: "HRR = Max HR - Rest HR",
      defaultTarget: "hrr",
      targets: [
        {
          id: "hrr",
          label: "Heart Rate Reserve",
          unit: "bpm",
          formulaStr: "HRR = Max HR - Rest HR",
          inputs: [
            { key: "max_hr", label: "Max Heart Rate", unit: "bpm", default: 185 },
            { key: "rest_hr", label: "Resting Heart Rate", unit: "bpm", default: 65 },
          ],
          solve: (val) => {
            const max_hr = parseFloat(val.max_hr), rest_hr = parseFloat(val.rest_hr);
            if (isNaN(max_hr) || isNaN(rest_hr)) return { error: "Please enter valid numeric values." };
            const ans = max_hr - rest_hr;
            return {
              answerStr: `HRR = ${ans.toFixed(0)} bpm`,
              steps: [
                `Step 1: Max HR = ${max_hr} bpm, Resting HR = ${rest_hr} bpm`,
                `Step 2: HRR = ${max_hr} - ${rest_hr}`,
                `Step 3: Result → HRR = ${ans.toFixed(0)} bpm`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "metabolic_rate",
      name: "BMR (Mifflin-St Jeor)",
      formula: "BMR = 10W + 6.25H - 5A + s",
      defaultTarget: "bmr",
      targets: [
        {
          id: "bmr",
          label: "Basal Metabolic Rate",
          unit: "kcal/day",
          formulaStr: "BMR = 10(Weight) + 6.25(Height) - 5(Age) + s",
          inputs: [
            { key: "weight", label: "Weight", unit: "kg", default: 70 },
            { key: "height", label: "Height", unit: "cm", default: 175 },
            { key: "age", label: "Age", unit: "years", default: 25 },
            { key: "gender", label: "Gender", unit: "", type: "select", options: [{ value: "male", label: "Male (+5)" }, { value: "female", label: "Female (-161)" }], default: "male" },
          ],
          solve: (val) => {
            const weight = parseFloat(val.weight), height = parseFloat(val.height), age = parseFloat(val.age);
            const gender = val.gender || "male";
            if (isNaN(weight) || isNaN(height) || isNaN(age)) return { error: "Please enter valid numeric values." };
            const s = gender === "male" ? 5 : -161;
            const bmr = 10 * weight + 6.25 * height - 5 * age + s;

            return {
              answerStr: `BMR = ${bmr.toFixed(2)} kcal/day`,
              steps: [
                `Step 1: Weight = ${weight} kg, Height = ${height} cm, Age = ${age} years, Gender = ${gender}`,
                `Step 2: Apply Mifflin-St Jeor → BMR = (10 × ${weight}) + (6.25 × ${height}) - (5 × ${age}) + (${s})`,
                `Step 3: Result → BMR = ${bmr.toFixed(2)} kcal/day`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "bsa_mosteller",
      name: "Body Surface Area (Mosteller)",
      formula: "BSA = √((height × weight) / 3600)",
      defaultTarget: "bsa",
      targets: [
        {
          id: "bsa",
          label: "Body Surface Area",
          unit: "m²",
          formulaStr: "BSA = √((h(cm) × w(kg)) / 3600)",
          inputs: [
            { key: "height", label: "Height", unit: "cm", default: 175 },
            { key: "weight", label: "Weight", unit: "kg", default: 70 },
          ],
          solve: (val) => {
            const h = parseFloat(val.height), w = parseFloat(val.weight);
            if (isNaN(h) || isNaN(w)) return { error: "Please enter valid numeric values." };
            if (h <= 0 || w <= 0) return { error: "Height and weight must be greater than zero." };
            const bsa = Math.sqrt((h * w) / 3600);
            return {
              answerStr: `BSA = ${bsa.toFixed(4)} m²`,
              steps: [
                `Step 1: Height = ${h} cm, Weight = ${w} kg`,
                `Step 2: Calculate (${h} × ${w}) / 3600 = ${((h * w) / 3600).toFixed(4)}`,
                `Step 3: Square root → BSA = √(${((h * w) / 3600).toFixed(4)}) = ${bsa.toFixed(4)} m²`,
              ],
            };
          },
        },
      ],
    },
    {
      id: "population_growth",
      name: "Exponential Population Growth",
      formula: "N_t = N₀ × e^(r × t)",
      defaultTarget: "Nt",
      targets: [
        {
          id: "Nt",
          label: "Population at Time t (N_t)",
          unit: "count",
          formulaStr: "N_t = N₀ × e^(r × t)",
          inputs: [
            { key: "N0", label: "Initial Population (N₀)", unit: "count", default: 100 },
            { key: "r", label: "Growth Rate (r)", unit: "per time", default: 0.1 },
            { key: "t", label: "Time (t)", unit: "units", default: 5 },
          ],
          solve: (val) => {
            const N0 = parseFloat(val.N0), r = parseFloat(val.r), t = parseFloat(val.t);
            if (isNaN(N0) || isNaN(r) || isNaN(t)) return { error: "Please enter valid numeric values." };
            const Nt = N0 * Math.exp(r * t);
            return {
              answerStr: `N_t = ${Math.round(Nt)} individuals (${Nt.toFixed(2)})`,
              steps: [
                `Step 1: N₀ = ${N0}, Growth rate r = ${r}, Time t = ${t}`,
                `Step 2: Exponent e^(r × t) = e^(${r * t}) = ${Math.exp(r * t).toFixed(4)}`,
                `Step 3: Result → N_t = ${N0} × ${Math.exp(r * t).toFixed(4)} = ${Nt.toFixed(2)}`,
              ],
            };
          },
        },
      ],
    },
  ],
};

export default function ScienceFormulasCalculator() {
  const [selectedCategory, setSelectedCategory] = useState("Physics");
  const [selectedFormulaId, setSelectedFormulaId] = useState("force");
  const [selectedTargetId, setSelectedTargetId] = useState("F");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [copyNote, setCopyNote] = useState("");

  const currentCategoryFormulas = formulaCategories[selectedCategory] || [];

  // Filter formulas based on search
  const filteredFormulas = useMemo(() => {
    if (!searchQuery.trim()) return currentCategoryFormulas;
    const q = searchQuery.toLowerCase();
    return currentCategoryFormulas.filter(
      (f) => f.name.toLowerCase().includes(q) || f.formula.toLowerCase().includes(q)
    );
  }, [currentCategoryFormulas, searchQuery]);

  const currentFormula = useMemo(() => {
    return currentCategoryFormulas.find((f) => f.id === selectedFormulaId) || currentCategoryFormulas[0];
  }, [currentCategoryFormulas, selectedFormulaId]);

  const currentTarget = useMemo(() => {
    if (!currentFormula) return null;
    return currentFormula.targets.find((t) => t.id === selectedTargetId) || currentFormula.targets[0];
  }, [currentFormula, selectedTargetId]);

  const categoryOptions = Object.keys(formulaCategories).map((cat) => ({ value: cat, label: cat }));
  const formulaOptions = filteredFormulas.map((f) => ({ value: f.id, label: f.name }));
  const targetOptions = currentFormula
    ? currentFormula.targets.map((t) => ({ value: t.id, label: `Solve for ${t.label}` }))
    : [];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const firstFormula = formulaCategories[category][0];
    setSelectedFormulaId(firstFormula.id);
    setSelectedTargetId(firstFormula.defaultTarget || firstFormula.targets[0].id);
    setInputs({});
    setResult(null);
  };

  const handleFormulaChange = (formulaId) => {
    setSelectedFormulaId(formulaId);
    const formulaObj = currentCategoryFormulas.find((f) => f.id === formulaId);
    if (formulaObj) {
      setSelectedTargetId(formulaObj.defaultTarget || formulaObj.targets[0].id);
    }
    setInputs({});
    setResult(null);
  };

  const handleTargetChange = (targetId) => {
    setSelectedTargetId(targetId);
    setInputs({});
    setResult(null);
  };

  const handleInputChange = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const loadSampleValues = () => {
    if (!currentTarget) return;
    const sample = {};
    currentTarget.inputs.forEach((inp) => {
      sample[inp.key] = inp.default !== undefined ? String(inp.default) : "";
    });
    setInputs(sample);
  };

  const calculateResult = () => {
    if (!currentTarget) return;

    // Build values object with defaults if blank
    const vals = {};
    currentTarget.inputs.forEach((inp) => {
      vals[inp.key] = inputs[inp.key] !== undefined && inputs[inp.key] !== "" ? inputs[inp.key] : (inp.default !== undefined ? String(inp.default) : "0");
    });

    const res = currentTarget.solve(vals);
    if (res.error) {
      setResult({ error: res.error, answer: null, steps: [] });
    } else {
      setResult({ answer: res.answerStr, steps: res.steps, error: null });
    }
  };

  const copyText = async (value) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopyNote("Copied Answer!");
    window.clearTimeout(window.__sciCopyTimer);
    window.__sciCopyTimer = window.setTimeout(() => setCopyNote(""), 1400);
  };

  const copyFullSolution = async () => {
    if (!result || !result.answer) return;
    const textToCopy = `Formula: ${currentTarget?.formulaStr}\nResult: ${result.answer}\n\nSteps:\n${result.steps.join("\n")}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopyNote("Copied Full Solution!");
    window.clearTimeout(window.__sciCopyTimer);
    window.__sciCopyTimer = window.setTimeout(() => setCopyNote(""), 1400);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 px-3 sm:px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500 mb-2">Science Formulas Calculator</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1 text-slate-900">
            Physics, Chemistry, Biology
          </h1>
          <p className="text-sm text-slate-600">Step-by-step solutions with multi-variable solving</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Input Panel - Left */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm space-y-4 h-fit">
              {/* Category & Formula Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wide">Category</label>
                  <ThemedDropdown
                    ariaLabel="Select science category"
                    value={selectedCategory}
                    options={categoryOptions}
                    onChange={handleCategoryChange}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wide">Formula</label>
                  <ThemedDropdown
                    ariaLabel="Select formula"
                    value={currentFormula?.id || ""}
                    options={formulaOptions}
                    onChange={handleFormulaChange}
                  />
                </div>
              </div>

              {/* Target Variable Dropdown (Solve For) */}
              {currentFormula && currentFormula.targets.length > 1 && (
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wide">Solve For (Target Variable)</label>
                  <ThemedDropdown
                    ariaLabel="Select target variable to solve"
                    value={selectedTargetId}
                    options={targetOptions}
                    onChange={handleTargetChange}
                  />
                </div>
              )}

              {/* Formula Display */}
              {currentTarget && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-orange-700 mb-0.5">Active Equation</p>
                    <p className="text-base font-bold text-orange-600">{currentTarget.formulaStr}</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadSampleValues}
                    className="text-xs px-2.5 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 font-semibold transition"
                    title="Load sample values into inputs"
                  >
                    Sample Data
                  </button>
                </div>
              )}

              {/* Input Fields */}
              {currentTarget && (
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wide">Known Values</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentTarget.inputs.map((inp) => (
                      <div key={inp.key}>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          {inp.label} {inp.unit ? `(${inp.unit})` : ""}
                        </label>
                        {inp.type === "select" ? (
                          <select
                            value={inputs[inp.key] !== undefined ? inputs[inp.key] : (inp.default || "")}
                            onChange={(e) => handleInputChange(inp.key, e.target.value)}
                            className="w-full px-2.5 py-2 rounded text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                          >
                            {inp.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            step="any"
                            placeholder={inp.default !== undefined ? `e.g. ${inp.default}` : inp.label}
                            value={inputs[inp.key] !== undefined ? inputs[inp.key] : ""}
                            onChange={(e) => handleInputChange(inp.key, e.target.value)}
                            className="w-full px-2.5 py-2 rounded text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calculate Button */}
              <button
                onClick={calculateResult}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-lg font-bold text-sm hover:from-orange-600 hover:to-orange-700 transition active:opacity-90 shadow-sm"
              >
                Calculate
              </button>
            </div>
          </div>

          {/* Info Panel & Result - Right */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category Overview Card */}
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Scientific Domains</h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold flex-shrink-0">1.</span>
                  <span className="leading-snug">Physics - Force, Energy, Waves, Electricity, Gas Laws</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold flex-shrink-0">2.</span>
                  <span className="leading-snug">Chemistry - Molarity, pH, Dilution, Gas Laws, Reactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold flex-shrink-0">3.</span>
                  <span className="leading-snug">Biology - BMI, Metabolism, Population Growth, BSA</span>
                </li>
              </ul>
            </div>

            {/* Error Guard Display */}
            {result && result.error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm animate-fadeIn text-red-700 text-sm font-medium">
                ⚠️ {result.error}
              </div>
            )}

            {/* Result Panel */}
            {result && result.answer && (
              <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm animate-fadeIn">
                <p className="text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wide">Calculated Answer</p>
                <p className="text-2xl sm:text-3xl font-black text-green-600 break-words leading-tight mb-3">{result.answer}</p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => copyText(result.answer)}
                    className="w-full px-3 py-1.5 bg-white text-green-600 border border-green-500 rounded text-sm font-semibold hover:bg-green-50 transition"
                  >
                    Copy Answer
                  </button>
                  <button
                    onClick={copyFullSolution}
                    className="w-full px-3 py-1.5 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 transition"
                  >
                    Copy Solution
                  </button>
                </div>
                {copyNote && <p className="text-xs text-green-600 mt-1.5 text-center font-bold">{copyNote}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Steps Display */}
        {result && result.steps && result.steps.length > 0 && (
          <div className="mt-4 animate-fadeIn">
            <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-3">Step-by-Step Solution</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {result.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2 p-2.5 rounded bg-white border-l-2 border-green-500 hover:bg-green-50 transition">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 border border-green-400 text-center">
                        <span className="text-xs font-bold text-green-600">{idx + 1}</span>
                      </div>
                    </div>
                    <p className="flex-grow text-xs text-slate-700 font-medium leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

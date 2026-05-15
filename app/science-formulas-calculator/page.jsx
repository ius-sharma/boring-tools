"use client";


import { useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const formulaCategories = {
  Physics: [
    { id: "force", name: "Force (F = ma)", vars: ["m", "a"], formula: "F = m × a" },
    { id: "velocity", name: "Velocity (v = d/t)", vars: ["d", "t"], formula: "v = d / t" },
    { id: "acceleration", name: "Acceleration (a = Δv/Δt)", vars: ["v1", "v2", "t"], formula: "a = (v₂ - v₁) / t" },
    { id: "kinetic_energy", name: "Kinetic Energy (KE = ½mv²)", vars: ["m", "v"], formula: "KE = ½ × m × v²" },
    { id: "potential_energy", name: "Potential Energy (PE = mgh)", vars: ["m", "g", "h"], formula: "PE = m × g × h" },
    { id: "work", name: "Work (W = F × d)", vars: ["f", "d"], formula: "W = F × d" },
    { id: "power", name: "Power (P = W/t)", vars: ["w", "t"], formula: "P = W / t" },
    { id: "pressure", name: "Pressure (P = F/A)", vars: ["f", "a"], formula: "P = F / A" },
    { id: "density", name: "Density (ρ = m/V)", vars: ["m", "v"], formula: "ρ = m / V" },
  ],
  Chemistry: [
    { id: "molarity", name: "Molarity (M = n/V)", vars: ["n", "v"], formula: "M = n / V (in liters)" },
    { id: "ph", name: "pH (-log[H+])", vars: ["h"], formula: "pH = -log[H+]" },
    { id: "percent_composition", name: "Percent Composition", vars: ["mass_element", "mass_compound"], formula: "% = (mass element / mass compound) × 100" },
    { id: "molar_mass", name: "Molar Mass (sum of atomic masses)", vars: ["atoms", "mass_per_atom"], formula: "Molar Mass = Σ(atoms × atomic mass)" },
    { id: "molality", name: "Molality (m = n/kg)", vars: ["n", "kg"], formula: "m = n / kg solvent" },
  ],
  Biology: [
    { id: "bmi", name: "BMI (kg/m²)", vars: ["weight", "height"], formula: "BMI = weight(kg) / height(m)²" },
    { id: "heart_rate_reserve", name: "Heart Rate Reserve", vars: ["max_hr", "rest_hr"], formula: "HRR = Max HR - Rest HR" },
    { id: "metabolic_rate", name: "Basal Metabolic Rate (BMR) - Mifflin-St Jeor", vars: ["weight", "height", "age", "gender"], formula: "BMR = based on weight, height, age, gender" },
  ],
};

const getStepByStepExplanation = (formula, inputs, values) => {
  const steps = [];
  switch (formula) {
    case "force": {
      const [m, a] = values;
      steps.push(`Step 1: Identify mass and acceleration → m = ${m} kg, a = ${a} m/s²`);
      steps.push(`Step 2: Apply formula → F = m × a = ${m} × ${a}`);
      steps.push(`Step 3: F = ${(m * a).toFixed(4)} N (Newtons)`);
      break;
    }
    case "velocity": {
      const [d, t] = values;
      steps.push(`Step 1: Identify distance and time → d = ${d} m, t = ${t} s`);
      steps.push(`Step 2: Apply formula → v = d / t = ${d} / ${t}`);
      steps.push(`Step 3: v = ${(d / t).toFixed(4)} m/s`);
      break;
    }
    case "acceleration": {
      const [v1, v2, t] = values;
      const dv = v2 - v1;
      steps.push(`Step 1: Initial velocity = ${v1} m/s, Final velocity = ${v2} m/s, Time = ${t} s`);
      steps.push(`Step 2: Change in velocity → Δv = ${v2} - ${v1} = ${dv} m/s`);
      steps.push(`Step 3: a = Δv / t = ${dv} / ${t} = ${(dv / t).toFixed(4)} m/s²`);
      break;
    }
    case "kinetic_energy": {
      const [m, v] = values;
      steps.push(`Step 1: Mass = ${m} kg, Velocity = ${v} m/s`);
      steps.push(`Step 2: Square velocity → v² = ${v}² = ${(v * v).toFixed(4)}`);
      steps.push(`Step 3: KE = ½ × ${m} × ${(v * v).toFixed(4)} = ${(0.5 * m * v * v).toFixed(4)} J`);
      break;
    }
    case "potential_energy": {
      const [m, g, h] = values;
      steps.push(`Step 1: Mass = ${m} kg, g = ${g} m/s², Height = ${h} m`);
      steps.push(`Step 2: PE = m × g × h = ${m} × ${g} × ${h}`);
      steps.push(`Step 3: PE = ${(m * g * h).toFixed(4)} J (Joules)`);
      break;
    }
    case "work": {
      const [f, d] = values;
      steps.push(`Step 1: Force = ${f} N, Distance = ${d} m`);
      steps.push(`Step 2: W = F × d = ${f} × ${d}`);
      steps.push(`Step 3: W = ${(f * d).toFixed(4)} J`);
      break;
    }
    case "power": {
      const [w, t] = values;
      steps.push(`Step 1: Work = ${w} J, Time = ${t} s`);
      steps.push(`Step 2: P = W / t = ${w} / ${t}`);
      steps.push(`Step 3: P = ${(w / t).toFixed(4)} W (Watts)`);
      break;
    }
    case "pressure": {
      const [f, a] = values;
      steps.push(`Step 1: Force = ${f} N, Area = ${a} m²`);
      steps.push(`Step 2: P = F / A = ${f} / ${a}`);
      steps.push(`Step 3: P = ${(f / a).toFixed(4)} Pa (Pascals)`);
      break;
    }
    case "density": {
      const [m, v] = values;
      steps.push(`Step 1: Mass = ${m} kg, Volume = ${v} m³`);
      steps.push(`Step 2: ρ = m / V = ${m} / ${v}`);
      steps.push(`Step 3: ρ = ${(m / v).toFixed(4)} kg/m³`);
      break;
    }
    case "molarity": {
      const [n, v] = values;
      steps.push(`Step 1: Moles of solute = ${n} mol, Volume = ${v} L`);
      steps.push(`Step 2: M = n / V = ${n} / ${v}`);
      steps.push(`Step 3: M = ${(n / v).toFixed(4)} mol/L`);
      break;
    }
    case "ph": {
      const [h] = values;
      const ph = -Math.log10(h);
      steps.push(`Step 1: [H+] concentration = ${h} mol/L`);
      steps.push(`Step 2: pH = -log(${h})`);
      steps.push(`Step 3: pH = ${ph.toFixed(4)}`);
      break;
    }
    case "percent_composition": {
      const [mass_element, mass_compound] = values;
      steps.push(`Step 1: Mass of element = ${mass_element} g, Mass of compound = ${mass_compound} g`);
      steps.push(`Step 2: % = (mass element / mass compound) × 100`);
      steps.push(`Step 3: % = (${mass_element} / ${mass_compound}) × 100 = ${((mass_element / mass_compound) * 100).toFixed(4)}%`);
      break;
    }
    case "molar_mass": {
      const [atoms, mass_per_atom] = values;
      steps.push(`Step 1: Number of atoms = ${atoms}, Mass per atom = ${mass_per_atom} g/mol`);
      steps.push(`Step 2: Molar Mass = ${atoms} × ${mass_per_atom}`);
      steps.push(`Step 3: Molar Mass = ${(atoms * mass_per_atom).toFixed(4)} g/mol`);
      break;
    }
    case "molality": {
      const [n, kg] = values;
      steps.push(`Step 1: Moles of solute = ${n} mol, Mass of solvent = ${kg} kg`);
      steps.push(`Step 2: m = n / kg = ${n} / ${kg}`);
      steps.push(`Step 3: m = ${(n / kg).toFixed(4)} mol/kg`);
      break;
    }
    case "bmi": {
      const [weight, height] = values;
      const bmi = weight / (height * height);
      steps.push(`Step 1: Weight = ${weight} kg, Height = ${height} m`);
      steps.push(`Step 2: BMI = weight / height² = ${weight} / (${height})²`);
      steps.push(`Step 3: BMI = ${weight} / ${(height * height).toFixed(4)} = ${bmi.toFixed(4)}`);
      let category = "";
      if (bmi < 18.5) category = " (Underweight)";
      else if (bmi < 25) category = " (Normal weight)";
      else if (bmi < 30) category = " (Overweight)";
      else category = " (Obese)";
      steps.push(`Classification: ${category}`);
      break;
    }
    case "heart_rate_reserve": {
      const [max_hr, rest_hr] = values;
      steps.push(`Step 1: Max Heart Rate = ${max_hr} bpm, Rest Heart Rate = ${rest_hr} bpm`);
      steps.push(`Step 2: HRR = Max HR - Rest HR = ${max_hr} - ${rest_hr}`);
      steps.push(`Step 3: HRR = ${(max_hr - rest_hr).toFixed(4)} bpm`);
      break;
    }
    case "metabolic_rate": {
      const [weight, height, age, gender] = inputs.gender ? [parseFloat(inputs.weight), parseFloat(inputs.height), parseFloat(inputs.age), inputs.gender] : values;
      let bmr = 0;
      steps.push(`Step 1: Input data → Weight: ${weight} kg, Height: ${height} cm, Age: ${age} years, Gender: ${gender}`);
      if (gender === "male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        steps.push(`Step 2: Males: BMR = 10W + 6.25H - 5A + 5`);
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        steps.push(`Step 2: Females: BMR = 10W + 6.25H - 5A - 161`);
      }
      steps.push(`Step 3: BMR = ${bmr.toFixed(4)} kcal/day`);
      break;
    }
  }
  return steps;
};

export default function ScienceFormulasCalculator() {
  const [selectedCategory, setSelectedCategory] = useState("Physics");
  const [selectedFormula, setSelectedFormula] = useState("force");
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [copyNote, setCopyNote] = useState("");

  const categoryOptions = Object.keys(formulaCategories).map((cat) => ({ value: cat, label: cat }));
  const currentFormulas = formulaCategories[selectedCategory];
  const formulaOptions = currentFormulas.map((f) => ({ value: f.id, label: f.name }));
  const currentFormula = currentFormulas.find((f) => f.id === selectedFormula);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedFormula(formulaCategories[category][0].id);
    setInputs({});
    setResult(null);
  };

  const handleFormulaChange = (formula) => {
    setSelectedFormula(formula);
    setInputs({});
    setResult(null);
  };

  const handleInputChange = (varName, value) => {
    setInputs((prev) => ({ ...prev, [varName]: value }));
  };

  const calculateResult = () => {
    if (!currentFormula) return;

    const values = currentFormula.vars.map((v) => parseFloat(inputs[v] || 0));
    let res = null;

    switch (selectedFormula) {
      case "force": {
        const [m, a] = values;
        res = `F = ${(m * a).toFixed(4)} N`;
        break;
      }
      case "velocity": {
        const [d, t] = values;
        res = `v = ${(d / t).toFixed(4)} m/s`;
        break;
      }
      case "acceleration": {
        const [v1, v2, t] = values;
        res = `a = ${((v2 - v1) / t).toFixed(4)} m/s²`;
        break;
      }
      case "kinetic_energy": {
        const [m, v] = values;
        res = `KE = ${(0.5 * m * v * v).toFixed(4)} J`;
        break;
      }
      case "potential_energy": {
        const [m, g, h] = values;
        res = `PE = ${(m * g * h).toFixed(4)} J`;
        break;
      }
      case "work": {
        const [f, d] = values;
        res = `W = ${(f * d).toFixed(4)} J`;
        break;
      }
      case "power": {
        const [w, t] = values;
        res = `P = ${(w / t).toFixed(4)} W`;
        break;
      }
      case "pressure": {
        const [f, a] = values;
        res = `P = ${(f / a).toFixed(4)} Pa`;
        break;
      }
      case "density": {
        const [m, v] = values;
        res = `ρ = ${(m / v).toFixed(4)} kg/m³`;
        break;
      }
      case "molarity": {
        const [n, v] = values;
        res = `M = ${(n / v).toFixed(4)} mol/L`;
        break;
      }
      case "ph": {
        const [h] = values;
        res = `pH = ${(-Math.log10(h)).toFixed(4)}`;
        break;
      }
      case "percent_composition": {
        const [mass_element, mass_compound] = values;
        res = `% = ${((mass_element / mass_compound) * 100).toFixed(4)}%`;
        break;
      }
      case "molar_mass": {
        const [atoms, mass_per_atom] = values;
        res = `Molar Mass = ${(atoms * mass_per_atom).toFixed(4)} g/mol`;
        break;
      }
      case "molality": {
        const [n, kg] = values;
        res = `m = ${(n / kg).toFixed(4)} mol/kg`;
        break;
      }
      case "bmi": {
        const [weight, height] = values;
        const bmi = weight / (height * height);
        let category = "";
        if (bmi < 18.5) category = " (Underweight)";
        else if (bmi < 25) category = " (Normal)";
        else if (bmi < 30) category = " (Overweight)";
        else category = " (Obese)";
        res = `BMI = ${bmi.toFixed(4)}${category}`;
        break;
      }
      case "heart_rate_reserve": {
        const [max_hr, rest_hr] = values;
        res = `HRR = ${(max_hr - rest_hr).toFixed(4)} bpm`;
        break;
      }
      case "metabolic_rate": {
        const [weight, height, age, gender] = values;
        let bmr = 0;
        const g = inputs.gender || "male";
        if (g === "male") {
          bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
          bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        res = `BMR = ${bmr.toFixed(4)} kcal/day`;
        break;
      }
      default:
        res = "Unknown formula";
    }

    const steps = getStepByStepExplanation(selectedFormula, inputs, values);
    setResult({ answer: res, steps });
  };

  const copyText = async (value) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopyNote("Copied!");
    window.clearTimeout(window.__sciCopyTimer);
    window.__sciCopyTimer = window.setTimeout(() => {
      setCopyNote("");
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 px-3 sm:px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Compact Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500 mb-2">Science Formulas Calculator</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1 text-slate-900">
            Physics, Chemistry, Biology
          </h1>
          <p className="text-sm text-slate-600">Step-by-step solutions for science formulas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Input Panel - Left */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm space-y-4 h-fit">
              {/* Category & Formula in one row */}
              <div className="grid grid-cols-2 gap-3">
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
                    value={selectedFormula}
                    options={formulaOptions}
                    onChange={handleFormulaChange}
                  />
                </div>
              </div>

              {/* Formula Display - Compact */}
              {currentFormula && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200">
                  <p className="text-xs font-bold text-orange-700 mb-1">Formula</p>
                  <p className="text-base font-bold text-orange-600">{currentFormula.formula}</p>
                </div>
              )}

              {/* Input Fields - Compact Grid */}
              {currentFormula && (
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wide">Values</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {currentFormula.vars.map((varName) => (
                      <div key={varName}>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">{varName}</label>
                        <input
                          type="number"
                          placeholder={varName}
                          value={inputs[varName] || ""}
                          onChange={(e) => handleInputChange(varName, e.target.value)}
                          className="w-full px-2.5 py-2 rounded text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium"
                        />
                      </div>
                    ))}
                    {selectedFormula === "metabolic_rate" && (
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">gender</label>
                        <select
                          value={inputs.gender || "male"}
                          onChange={(e) => handleInputChange("gender", e.target.value)}
                          className="w-full px-2.5 py-2 rounded text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Calculate Button */}
              <button
                onClick={calculateResult}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-lg font-bold text-sm hover:from-orange-600 hover:to-orange-700 transition active:opacity-90"
              >
                Calculate
              </button>
            </div>
          </div>

          {/* Info Panel & Result - Right */}
          <div className="lg:col-span-2 space-y-4">
            {/* Info Panel */}
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Categories</h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold flex-shrink-0">1.</span>
                  <span className="leading-snug">Physics - Force, Energy, Motion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold flex-shrink-0">2.</span>
                  <span className="leading-snug">Chemistry - pH, Molarity, Composition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold flex-shrink-0">3.</span>
                  <span className="leading-snug">Biology - BMI, Heart Rate, Metabolism</span>
                </li>
              </ul>
            </div>

            {/* Result Panel - Compact */}
            {result && (
              <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm animate-fadeIn">
                <p className="text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wide">Answer</p>
                <p className="text-2xl sm:text-3xl font-black text-green-600 break-words leading-tight mb-3">{result.answer}</p>
                
                <button
                  onClick={() => copyText(result.answer)}
                  className="w-full px-3 py-1.5 bg-white text-green-600 border border-green-500 rounded text-sm font-semibold hover:bg-green-50 transition"
                >
                  Copy
                </button>
                {copyNote && <p className="text-xs text-green-600 mt-1.5">{copyNote}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Steps Display - Below */}
        {result && result.steps && result.steps.length > 0 && (
          <div className="mt-4 animate-fadeIn">
            <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-3">Solution Steps</p>
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

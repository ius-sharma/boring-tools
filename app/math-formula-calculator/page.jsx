"use client";


import { useState, useMemo } from "react";
import ThemedDropdown from "../components/ThemedDropdown";
import dynamic from "next/dynamic";

const ComingSoon = dynamic(() => import("./coming-soon"), { ssr: false });

const formulaCategories = {
  Algebra: [
    { id: "quadratic", name: "Quadratic Equation (ax² + bx + c = 0)", vars: ["a", "b", "c"], formula: "x = (-b ± √(b² - 4ac)) / 2a" },
    { id: "linear", name: "Linear Equation (y = mx + b)", vars: ["m", "x", "b"], formula: "y = mx + b" },
    { id: "distance", name: "Distance Formula", vars: ["x1", "y1", "x2", "y2"], formula: "d = √((x₂ - x₁)² + (y₂ - y₁)²)" },
    { id: "slope", name: "Slope (m = Δy/Δx)", vars: ["y1", "y2", "x1", "x2"], formula: "m = (y₂ - y₁) / (x₂ - x₁)" },
  ],
  Geometry: [
    { id: "circle_area", name: "Circle Area (A = πr²)", vars: ["r"], formula: "A = π × r²" },
    { id: "circle_circumference", name: "Circle Circumference (C = 2πr)", vars: ["r"], formula: "C = 2π × r" },
    { id: "triangle_area", name: "Triangle Area (A = ½bh)", vars: ["b", "h"], formula: "A = ½ × b × h" },
    { id: "rectangle_area", name: "Rectangle Area (A = l × w)", vars: ["l", "w"], formula: "A = l × w" },
    { id: "sphere_volume", name: "Sphere Volume (V = ⁴⁄₃πr³)", vars: ["r"], formula: "V = (4/3) × π × r³" },
    { id: "cylinder_volume", name: "Cylinder Volume (V = πr²h)", vars: ["r", "h"], formula: "V = π × r² × h" },
  ],
  Trigonometry: [
    { id: "sin", name: "Sine (sin θ = opposite/hypotenuse)", vars: ["opposite", "hypotenuse"], formula: "sin θ = opposite / hypotenuse" },
    { id: "cos", name: "Cosine (cos θ = adjacent/hypotenuse)", vars: ["adjacent", "hypotenuse"], formula: "cos θ = adjacent / hypotenuse" },
    { id: "tan", name: "Tangent (tan θ = opposite/adjacent)", vars: ["opposite", "adjacent"], formula: "tan θ = opposite / adjacent" },
    { id: "pythagorean", name: "Pythagorean Theorem (a² + b² = c²)", vars: ["a", "b"], formula: "c = √(a² + b²)" },
  ],
  Statistics: [
    { id: "mean", name: "Mean (Average)", vars: ["values"], formula: "Mean = Sum of values / Count", note: "Enter comma-separated values" },
    { id: "variance", name: "Variance", vars: ["values"], formula: "Variance = Σ(x - mean)² / n", note: "Enter comma-separated values" },
    { id: "std_dev", name: "Standard Deviation", vars: ["values"], formula: "σ = √Variance", note: "Enter comma-separated values" },
  ],
};

// Helper to format step-by-step breakdown
const getStepByStepExplanation = (formula, inputs, values) => {
  const steps = [];
  switch (formula) {
    case "quadratic": {
      const [a, b, c] = values;
      steps.push(`Step 1: Identify coefficients → a = ${a}, b = ${b}, c = ${c}`);
      steps.push(`Step 2: Calculate discriminant → Δ = b² - 4ac = ${b}² - 4(${a})(${c}) = ${(b*b - 4*a*c).toFixed(4)}`);
      if (b * b - 4 * a * c < 0) {
        steps.push(`Step 3: Discriminant is negative → No real roots`);
      } else {
        const sqrt = Math.sqrt(b * b - 4 * a * c);
        steps.push(`Step 3: Calculate √Δ = √${(b*b - 4*a*c).toFixed(4)} = ${sqrt.toFixed(4)}`);
        const x1 = (-b + sqrt) / (2 * a);
        const x2 = (-b - sqrt) / (2 * a);
        steps.push(`Step 4: x₁ = (-${b} + ${sqrt.toFixed(4)}) / ${2*a} = ${x1.toFixed(4)}`);
        steps.push(`Step 5: x₂ = (-${b} - ${sqrt.toFixed(4)}) / ${2*a} = ${x2.toFixed(4)}`);
      }
      break;
    }
    case "linear": {
      const [m, x, b] = values;
      steps.push(`Step 1: Substitute into formula → y = mx + b`);
      steps.push(`Step 2: y = (${m}) × (${x}) + (${b})`);
      steps.push(`Step 3: y = ${(m*x).toFixed(4)} + ${b}`);
      steps.push(`Step 4: y = ${(m*x + b).toFixed(4)}`);
      break;
    }
    case "distance": {
      const [x1, y1, x2, y2] = values;
      steps.push(`Step 1: Identify points → P₁(${x1}, ${y1}), P₂(${x2}, ${y2})`);
      const dx = x2 - x1;
      const dy = y2 - y1;
      steps.push(`Step 2: Calculate differences → Δx = ${x2} - ${x1} = ${dx}, Δy = ${y2} - ${y1} = ${dy}`);
      steps.push(`Step 3: Square the differences → (Δx)² = ${dx}² = ${(dx*dx).toFixed(4)}, (Δy)² = ${dy}² = ${(dy*dy).toFixed(4)}`);
      steps.push(`Step 4: Sum of squares → ${(dx*dx).toFixed(4)} + ${(dy*dy).toFixed(4)} = ${(dx*dx + dy*dy).toFixed(4)}`);
      steps.push(`Step 5: Take square root → d = √${(dx*dx + dy*dy).toFixed(4)} = ${Math.sqrt(dx*dx + dy*dy).toFixed(4)}`);
      break;
    }
    case "slope": {
      const [y1, y2, x1, x2] = values;
      const dy = y2 - y1;
      const dx = x2 - x1;
      steps.push(`Step 1: Identify points → (${x1}, ${y1}) and (${x2}, ${y2})`);
      steps.push(`Step 2: Calculate rise (Δy) → ${y2} - ${y1} = ${dy}`);
      steps.push(`Step 3: Calculate run (Δx) → ${x2} - ${x1} = ${dx}`);
      if (dx === 0) {
        steps.push(`Step 4: Division by zero → Slope is undefined (vertical line)`);
      } else {
        steps.push(`Step 4: m = Δy / Δx = ${dy} / ${dx} = ${(dy/dx).toFixed(4)}`);
      }
      break;
    }
    case "circle_area": {
      const [r] = values;
      steps.push(`Step 1: Identify radius → r = ${r}`);
      steps.push(`Step 2: Square the radius → r² = ${r}² = ${(r*r).toFixed(4)}`);
      steps.push(`Step 3: Multiply by π → A = π × ${(r*r).toFixed(4)} = ${(Math.PI * r * r).toFixed(4)}`);
      break;
    }
    case "circle_circumference": {
      const [r] = values;
      steps.push(`Step 1: Identify radius → r = ${r}`);
      steps.push(`Step 2: Apply formula → C = 2πr = 2 × π × ${r}`);
      steps.push(`Step 3: C = ${(2 * Math.PI * r).toFixed(4)}`);
      break;
    }
    case "triangle_area": {
      const [b, h] = values;
      steps.push(`Step 1: Identify base and height → b = ${b}, h = ${h}`);
      steps.push(`Step 2: Multiply base and height → b × h = ${b} × ${h} = ${(b*h).toFixed(4)}`);
      steps.push(`Step 3: Divide by 2 → A = ½ × ${(b*h).toFixed(4)} = ${(0.5*b*h).toFixed(4)}`);
      break;
    }
    case "rectangle_area": {
      const [l, w] = values;
      steps.push(`Step 1: Identify length and width → l = ${l}, w = ${w}`);
      steps.push(`Step 2: Multiply → A = ${l} × ${w} = ${(l*w).toFixed(4)}`);
      break;
    }
    case "sphere_volume": {
      const [r] = values;
      steps.push(`Step 1: Identify radius → r = ${r}`);
      steps.push(`Step 2: Cube the radius → r³ = ${r}³ = ${(r*r*r).toFixed(4)}`);
      steps.push(`Step 3: Multiply by (4/3)π → V = (4/3) × π × ${(r*r*r).toFixed(4)} = ${((4/3)*Math.PI*r*r*r).toFixed(4)}`);
      break;
    }
    case "cylinder_volume": {
      const [r, h] = values;
      steps.push(`Step 1: Identify radius and height → r = ${r}, h = ${h}`);
      steps.push(`Step 2: Calculate base area → πr² = π × ${r}² = ${(Math.PI*r*r).toFixed(4)}`);
      steps.push(`Step 3: Multiply by height → V = ${(Math.PI*r*r).toFixed(4)} × ${h} = ${(Math.PI*r*r*h).toFixed(4)}`);
      break;
    }
    case "sin":
    case "cos":
    case "tan": {
      const [numerator, denominator] = values;
      const label = formula === "sin" ? "sin θ" : formula === "cos" ? "cos θ" : "tan θ";
      steps.push(`Step 1: Identify values → Numerator = ${numerator}, Denominator = ${denominator}`);
      if (denominator === 0) {
        steps.push(`Step 2: Division by zero → ${label} is undefined`);
      } else {
        steps.push(`Step 2: Divide → ${label} = ${numerator} / ${denominator} = ${(numerator/denominator).toFixed(4)}`);
      }
      break;
    }
    case "pythagorean": {
      const [a, b] = values;
      steps.push(`Step 1: Identify sides → a = ${a}, b = ${b}`);
      steps.push(`Step 2: Square both sides → a² = ${(a*a).toFixed(4)}, b² = ${(b*b).toFixed(4)}`);
      steps.push(`Step 3: Add squares → a² + b² = ${(a*a).toFixed(4)} + ${(b*b).toFixed(4)} = ${(a*a + b*b).toFixed(4)}`);
      steps.push(`Step 4: Take square root → c = √${(a*a + b*b).toFixed(4)} = ${Math.sqrt(a*a + b*b).toFixed(4)}`);
      break;
    }
    case "mean": {
      const valArray = inputs.values
        ?.split(",")
        .map((v) => parseFloat(v.trim()))
        .filter((v) => !isNaN(v));
      if (valArray && valArray.length > 0) {
        steps.push(`Step 1: List values → [${valArray.map(v => v.toFixed(2)).join(", ")}]`);
        steps.push(`Step 2: Count values → n = ${valArray.length}`);
        const sum = valArray.reduce((a, b) => a + b, 0);
        steps.push(`Step 3: Sum values → ${valArray.map(v => v.toFixed(2)).join(" + ")} = ${sum.toFixed(4)}`);
        steps.push(`Step 4: Divide by count → Mean = ${sum.toFixed(4)} / ${valArray.length} = ${(sum/valArray.length).toFixed(4)}`);
      }
      break;
    }
    case "variance": {
      const valArray = inputs.values
        ?.split(",")
        .map((v) => parseFloat(v.trim()))
        .filter((v) => !isNaN(v));
      if (valArray && valArray.length > 0) {
        const mean = valArray.reduce((a, b) => a + b, 0) / valArray.length;
        steps.push(`Step 1: Calculate mean → Mean = ${mean.toFixed(4)}`);
        steps.push(`Step 2: Find differences from mean → [${valArray.map(v => (v - mean).toFixed(2)).join(", ")}]`);
        const squaredDiffs = valArray.map(v => (v - mean) ** 2);
        steps.push(`Step 3: Square differences → [${squaredDiffs.map(d => d.toFixed(2)).join(", ")}]`);
        const sumSquaredDiffs = squaredDiffs.reduce((a, b) => a + b, 0);
        steps.push(`Step 4: Sum squared differences → ${sumSquaredDiffs.toFixed(4)}`);
        steps.push(`Step 5: Divide by count → Variance = ${sumSquaredDiffs.toFixed(4)} / ${valArray.length} = ${(sumSquaredDiffs/valArray.length).toFixed(4)}`);
      }
      break;
    }
    case "std_dev": {
      const valArray = inputs.values
        ?.split(",")
        .map((v) => parseFloat(v.trim()))
        .filter((v) => !isNaN(v));
      if (valArray && valArray.length > 0) {
        const mean = valArray.reduce((a, b) => a + b, 0) / valArray.length;
        const variance = valArray.reduce((a, b) => a + (b - mean) ** 2, 0) / valArray.length;
        steps.push(`Step 1: Calculate variance → Variance = ${variance.toFixed(4)}`);
        steps.push(`Step 2: Take square root → σ = √${variance.toFixed(4)} = ${Math.sqrt(variance).toFixed(4)}`);
      }
      break;
    }
  }
  return steps;
};

export default function MathFormulaCalculator() {
  // If the env variable is not set, show Coming Soon
  if (!process.env.NEXT_PUBLIC_SHOW_MATH_FORMULA_CALCULATOR) {
    return <ComingSoon />;
  }
  const [selectedCategory, setSelectedCategory] = useState("Algebra");
  const [selectedFormula, setSelectedFormula] = useState("quadratic");
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
    let steps = [];

    switch (selectedFormula) {
      case "quadratic": {
        const [a, b, c] = values;
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
          res = "No real roots (discriminant < 0)";
        } else {
          const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
          const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
          res = `x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`;
        }
        break;
      }
      case "linear": {
        const [m, x, b] = values;
        const y = m * x + b;
        res = `y = ${y.toFixed(4)}`;
        break;
      }
      case "distance": {
        const [x1, y1, x2, y2] = values;
        const d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        res = `d = ${d.toFixed(4)}`;
        break;
      }
      case "slope": {
        const [y1, y2, x1, x2] = values;
        if (x2 === x1) {
          res = "Undefined (vertical line)";
        } else {
          const m = (y2 - y1) / (x2 - x1);
          res = `m = ${m.toFixed(4)}`;
        }
        break;
      }
      case "circle_area": {
        const [r] = values;
        const a = Math.PI * r * r;
        res = `A = ${a.toFixed(4)} square units`;
        break;
      }
      case "circle_circumference": {
        const [r] = values;
        const c = 2 * Math.PI * r;
        res = `C = ${c.toFixed(4)} units`;
        break;
      }
      case "triangle_area": {
        const [b, h] = values;
        const a = 0.5 * b * h;
        res = `A = ${a.toFixed(4)} square units`;
        break;
      }
      case "rectangle_area": {
        const [l, w] = values;
        const a = l * w;
        res = `A = ${a.toFixed(4)} square units`;
        break;
      }
      case "sphere_volume": {
        const [r] = values;
        const v = (4 / 3) * Math.PI * r ** 3;
        res = `V = ${v.toFixed(4)} cubic units`;
        break;
      }
      case "cylinder_volume": {
        const [r, h] = values;
        const v = Math.PI * r * r * h;
        res = `V = ${v.toFixed(4)} cubic units`;
        break;
      }
      case "sin": {
        const [opposite, hypotenuse] = values;
        if (hypotenuse === 0) {
          res = "Invalid (hypotenuse cannot be 0)";
        } else {
          const sinVal = opposite / hypotenuse;
          res = `sin θ = ${sinVal.toFixed(4)}`;
        }
        break;
      }
      case "cos": {
        const [adjacent, hypotenuse] = values;
        if (hypotenuse === 0) {
          res = "Invalid (hypotenuse cannot be 0)";
        } else {
          const cosVal = adjacent / hypotenuse;
          res = `cos θ = ${cosVal.toFixed(4)}`;
        }
        break;
      }
      case "tan": {
        const [opposite, adjacent] = values;
        if (adjacent === 0) {
          res = "Undefined (adjacent = 0)";
        } else {
          const tanVal = opposite / adjacent;
          res = `tan θ = ${tanVal.toFixed(4)}`;
        }
        break;
      }
      case "pythagorean": {
        const [a, b] = values;
        const c = Math.sqrt(a * a + b * b);
        res = `c = ${c.toFixed(4)}`;
        break;
      }
      case "mean": {
        const valArray = inputs.values
          ?.split(",")
          .map((v) => parseFloat(v.trim()))
          .filter((v) => !isNaN(v));
        if (!valArray || valArray.length === 0) {
          res = "Please enter values";
        } else {
          const mean = valArray.reduce((a, b) => a + b, 0) / valArray.length;
          res = `Mean = ${mean.toFixed(4)}`;
        }
        break;
      }
      case "variance": {
        const valArray = inputs.values
          ?.split(",")
          .map((v) => parseFloat(v.trim()))
          .filter((v) => !isNaN(v));
        if (!valArray || valArray.length === 0) {
          res = "Please enter values";
        } else {
          const mean = valArray.reduce((a, b) => a + b, 0) / valArray.length;
          const variance = valArray.reduce((a, b) => a + (b - mean) ** 2, 0) / valArray.length;
          res = `Variance = ${variance.toFixed(4)}`;
        }
        break;
      }
      case "std_dev": {
        const valArray = inputs.values
          ?.split(",")
          .map((v) => parseFloat(v.trim()))
          .filter((v) => !isNaN(v));
        if (!valArray || valArray.length === 0) {
          res = "Please enter values";
        } else {
          const mean = valArray.reduce((a, b) => a + b, 0) / valArray.length;
          const variance = valArray.reduce((a, b) => a + (b - mean) ** 2, 0) / valArray.length;
          const stdDev = Math.sqrt(variance);
          res = `σ = ${stdDev.toFixed(4)}`;
        }
        break;
      }
      default:
        res = "Unknown formula";
    }

    steps = getStepByStepExplanation(selectedFormula, inputs, values);
    setResult({ answer: res, steps });
  };

  const copyText = async (value) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopyNote("Copied!");
    window.clearTimeout(window.__mathCopyTimer);
    window.__mathCopyTimer = window.setTimeout(() => {
      setCopyNote("");
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 px-3 sm:px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Compact Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500 mb-2">Math Formula Calculator</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1 text-slate-900">
            Calculate & Learn
          </h1>
          <p className="text-sm text-slate-600">Step-by-step solutions for math formulas</p>
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
                    ariaLabel="Select formula category"
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
                  {currentFormula.note && (
                    <p className="text-xs text-orange-600 mt-1.5 font-medium">{currentFormula.note}</p>
                  )}
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Steps</h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold flex-shrink-0 mt-0.5">1.</span>
                  <span className="leading-snug">Choose category</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold flex-shrink-0 mt-0.5">2.</span>
                  <span className="leading-snug">Pick formula</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold flex-shrink-0 mt-0.5">3.</span>
                  <span className="leading-snug">Enter values</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold flex-shrink-0 mt-0.5">4.</span>
                  <span className="leading-snug">Get solution</span>
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

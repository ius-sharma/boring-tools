"use client";

import { useState, useMemo, useEffect } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

// Expanded Formula Database across 6 rich categories
const formulaCategories = {
  Algebra: [
    {
      id: "quadratic",
      name: "Quadratic Equation (ax² + bx + c = 0)",
      vars: [
        { name: "a", label: "a (x² coeff)", type: "number", default: 1 },
        { name: "b", label: "b (x coeff)", type: "number", default: -5 },
        { name: "c", label: "c (constant)", type: "number", default: 6 },
      ],
      formula: "x = (-b ± √(b² - 4ac)) / (2a)",
      description: "Finds real or complex roots for quadratic equation ax² + bx + c = 0.",
      visType: "quadratic",
    },
    {
      id: "linear",
      name: "Linear Slope-Intercept (y = mx + b)",
      vars: [
        { name: "m", label: "Slope (m)", type: "number", default: 2 },
        { name: "x", label: "Input x", type: "number", default: 3 },
        { name: "b", label: "y-intercept (b)", type: "number", default: 1 },
      ],
      formula: "y = m × x + b",
      description: "Calculates output y given slope m, x value, and y-intercept b.",
      visType: "linear",
    },
    {
      id: "distance",
      name: "Distance Formula (2D Plane)",
      vars: [
        { name: "x1", label: "x₁", type: "number", default: 0 },
        { name: "y1", label: "y₁", type: "number", default: 0 },
        { name: "x2", label: "x₂", type: "number", default: 3 },
        { name: "y2", label: "y₂", type: "number", default: 4 },
      ],
      formula: "d = √((x₂ - x₁)² + (y₂ - y₁)²)",
      description: "Calculates euclidean distance between two points (x₁, y₁) and (x₂, y₂).",
      visType: "distance",
    },
    {
      id: "slope",
      name: "Slope between 2 Points (m)",
      vars: [
        { name: "x1", label: "x₁", type: "number", default: 1 },
        { name: "y1", label: "y₁", type: "number", default: 2 },
        { name: "x2", label: "x₂", type: "number", default: 5 },
        { name: "y2", label: "y₂", type: "number", default: 10 },
      ],
      formula: "m = (y₂ - y₁) / (x₂ - x₁)",
      description: "Calculates line gradient (rise over run) between two points.",
      visType: "linear",
    },
    {
      id: "ap_term",
      name: "Arithmetic Progression (n-th Term & Sum)",
      vars: [
        { name: "a", label: "First term (a)", type: "number", default: 2 },
        { name: "d", label: "Common diff (d)", type: "number", default: 3 },
        { name: "n", label: "Term count (n)", type: "number", default: 10 },
      ],
      formula: "aₙ = a + (n-1)d  |  Sₙ = ⁿ⁄₂ (2a + (n-1)d)",
      description: "Calculates the n-th term and total sum of an arithmetic sequence.",
    },
    {
      id: "gp_term",
      name: "Geometric Progression (n-th Term & Sum)",
      vars: [
        { name: "a", label: "First term (a)", type: "number", default: 3 },
        { name: "r", label: "Common ratio (r)", type: "number", default: 2 },
        { name: "n", label: "Term count (n)", type: "number", default: 5 },
      ],
      formula: "aₙ = a × rⁿ⁻¹  |  Sₙ = a(1 - rⁿ) / (1 - r)",
      description: "Calculates the n-th term and sum of a geometric progression.",
    },
  ],

  Geometry: [
    {
      id: "circle_area",
      name: "Circle (Area & Circumference)",
      vars: [{ name: "r", label: "Radius (r)", type: "number", default: 5 }],
      formula: "Area = π × r²  |  Circumference = 2πr",
      description: "Computes 2D circle surface area and perimeter.",
      visType: "circle",
    },
    {
      id: "triangle_area",
      name: "Triangle Area (Base & Height)",
      vars: [
        { name: "b", label: "Base (b)", type: "number", default: 8 },
        { name: "h", label: "Height (h)", type: "number", default: 6 },
      ],
      formula: "Area = ½ × b × h",
      description: "Calculates area of a triangle given base and perpendicular height.",
      visType: "triangle",
    },
    {
      id: "heron_triangle",
      name: "Triangle Area (Heron's Formula - 3 Sides)",
      vars: [
        { name: "a", label: "Side a", type: "number", default: 3 },
        { name: "b", label: "Side b", type: "number", default: 4 },
        { name: "c", label: "Side c", type: "number", default: 5 },
      ],
      formula: "s = (a+b+c)/2  |  Area = √(s(s-a)(s-b)(s-c))",
      description: "Calculates area of any triangle given its three side lengths.",
      visType: "triangle",
    },
    {
      id: "rectangle_area",
      name: "Rectangle (Area & Perimeter)",
      vars: [
        { name: "l", label: "Length (l)", type: "number", default: 10 },
        { name: "w", label: "Width (w)", type: "number", default: 5 },
      ],
      formula: "Area = l × w  |  Perimeter = 2(l + w)",
      description: "Computes area and perimeter of a rectangle.",
      visType: "rectangle",
    },
    {
      id: "sphere_volume",
      name: "Sphere (Volume & Surface Area)",
      vars: [{ name: "r", label: "Radius (r)", type: "number", default: 4 }],
      formula: "Volume = ⁴⁄₃ × π × r³  |  Surface Area = 4πr²",
      description: "Computes 3D sphere volume and total outer surface area.",
      visType: "sphere",
    },
    {
      id: "cylinder_volume",
      name: "Cylinder (Volume & Surface Area)",
      vars: [
        { name: "r", label: "Radius (r)", type: "number", default: 3 },
        { name: "h", label: "Height (h)", type: "number", default: 7 },
      ],
      formula: "Volume = πr²h  |  Surface Area = 2πrh + 2πr²",
      description: "Computes 3D cylinder volume and total surface area.",
      visType: "cylinder",
    },
    {
      id: "cone_volume",
      name: "Cone (Volume & Surface Area)",
      vars: [
        { name: "r", label: "Radius (r)", type: "number", default: 3 },
        { name: "h", label: "Height (h)", type: "number", default: 4 },
      ],
      formula: "Volume = ⅓πr²h  |  Slant Height l = √(r²+h²)",
      description: "Computes 3D cone volume and slant height.",
      visType: "cone",
    },
  ],

  Trigonometry: [
    {
      id: "pythagorean",
      name: "Pythagorean Theorem (c = √(a² + b²))",
      vars: [
        { name: "a", label: "Side a (Leg)", type: "number", default: 3 },
        { name: "b", label: "Side b (Leg)", type: "number", default: 4 },
      ],
      formula: "c = √(a² + b²)",
      description: "Finds hypotenuse c of a right-angled triangle given sides a and b.",
      visType: "right_triangle",
    },
    {
      id: "trig_ratios",
      name: "Trigonometric Ratios (Sin, Cos, Tan)",
      vars: [
        { name: "opposite", label: "Opposite Side", type: "number", default: 3 },
        { name: "adjacent", label: "Adjacent Side", type: "number", default: 4 },
        { name: "hypotenuse", label: "Hypotenuse", type: "number", default: 5 },
      ],
      formula: "sin θ = Opp/Hyp  |  cos θ = Adj/Hyp  |  tan θ = Opp/Adj",
      description: "Calculates primary trigonometric ratios and angle θ in degrees.",
      visType: "right_triangle",
    },
    {
      id: "law_cosines",
      name: "Law of Cosines (c² = a² + b² - 2ab cos C)",
      vars: [
        { name: "a", label: "Side a", type: "number", default: 5 },
        { name: "b", label: "Side b", type: "number", default: 7 },
        { name: "angleC", label: "Angle C (Degrees)", type: "number", default: 60 },
      ],
      formula: "c = √(a² + b² - 2ab × cos(C))",
      description: "Finds third side c of any triangle given two sides and included angle C.",
      visType: "triangle",
    },
  ],

  Statistics: [
    {
      id: "mean_median_mode",
      name: "Mean, Median & Mode",
      vars: [
        {
          name: "values",
          label: "Data Points (comma separated)",
          type: "text",
          default: "12, 15, 12, 18, 22, 15, 30",
          placeholder: "e.g. 10, 20, 30, 40",
        },
      ],
      formula: "Mean = Σx/n  |  Median = Middle value  |  Mode = Most frequent",
      description: "Calculates measures of central tendency for a dataset.",
    },
    {
      id: "variance_stddev",
      name: "Variance & Standard Deviation",
      vars: [
        {
          name: "values",
          label: "Data Points (comma separated)",
          type: "text",
          default: "4, 8, 6, 5, 3, 2, 8, 9",
          placeholder: "e.g. 5, 10, 15, 20",
        },
      ],
      formula: "Variance σ² = Σ(x - μ)² / n  |  Std Dev σ = √Variance",
      description: "Measures data dispersion and standard deviation from the mean.",
    },
    {
      id: "npr_ncr",
      name: "Permutations (nPr) & Combinations (nCr)",
      vars: [
        { name: "n", label: "Total items (n)", type: "number", default: 7 },
        { name: "r", label: "Items chosen (r)", type: "number", default: 3 },
      ],
      formula: "nPr = n! / (n-r)!  |  nCr = n! / (r! × (n-r)!)",
      description: "Calculates total arrangements (nPr) and combinations (nCr).",
    },
  ],

  Calculus: [
    {
      id: "power_rule_derivative",
      name: "Polynomial Derivative (d/dx [a · xⁿ])",
      vars: [
        { name: "a", label: "Coefficient (a)", type: "number", default: 4 },
        { name: "n", label: "Exponent (n)", type: "number", default: 3 },
        { name: "xVal", label: "Evaluate at x (optional)", type: "number", default: 2 },
      ],
      formula: "f'(x) = (a × n) × xⁿ⁻¹",
      description: "Applies power rule of differentiation and evaluates derivative at x.",
    },
    {
      id: "power_rule_integral",
      name: "Definite Integral (∫ a · xⁿ dx)",
      vars: [
        { name: "a", label: "Coefficient (a)", type: "number", default: 1 },
        { name: "n", label: "Exponent (n ≠ -1)", type: "number", default: 2 },
        { name: "lower", label: "Lower bound (A)", type: "number", default: 0 },
        { name: "upper", label: "Upper bound (B)", type: "number", default: 3 },
      ],
      formula: "∫ f(x)dx = [a/(n+1) × xⁿ⁺¹] from A to B",
      description: "Calculates area under polynomial curve from A to B.",
    },
    {
      id: "matrix_2x2_det",
      name: "2x2 Matrix Determinant |A|",
      vars: [
        { name: "a", label: "a (Top-Left)", type: "number", default: 4 },
        { name: "b", label: "b (Top-Right)", type: "number", default: 2 },
        { name: "c", label: "c (Bottom-Left)", type: "number", default: 3 },
        { name: "d", label: "d (Bottom-Right)", type: "number", default: 5 },
      ],
      formula: "det(A) = (a × d) - (b × c)",
      description: "Computes determinant of a 2x2 matrix [[a, b], [c, d]].",
    },
    {
      id: "vector_dot",
      name: "Vector Dot Product (u · v in 3D)",
      vars: [
        { name: "u1", label: "u₁", type: "number", default: 1 },
        { name: "u2", label: "u₂", type: "number", default: 2 },
        { name: "u3", label: "u₃", type: "number", default: 3 },
        { name: "v1", label: "v₁", type: "number", default: 4 },
        { name: "v2", label: "v₂", type: "number", default: -1 },
        { name: "v3", label: "v₃", type: "number", default: 2 },
      ],
      formula: "u · v = u₁v₁ + u₂v₂ + u₃v₃",
      description: "Calculates scalar dot product of two 3D vectors.",
    },
  ],

  Finance: [
    {
      id: "simple_interest",
      name: "Simple Interest (I = P × R × T / 100)",
      vars: [
        { name: "P", label: "Principal Amount (P)", type: "number", default: 10000 },
        { name: "R", label: "Rate per Year % (R)", type: "number", default: 7.5 },
        { name: "T", label: "Time in Years (T)", type: "number", default: 3 },
      ],
      formula: "Interest = (P × R × T) / 100  |  Total = P + Interest",
      description: "Computes non-compounding simple interest earnings or loan cost.",
    },
    {
      id: "compound_interest",
      name: "Compound Interest A = P(1 + r/n)ⁿᵗ",
      vars: [
        { name: "P", label: "Principal (P)", type: "number", default: 5000 },
        { name: "r", label: "Annual Rate % (r)", type: "number", default: 6 },
        { name: "t", label: "Years (t)", type: "number", default: 5 },
        { name: "n", label: "Compounding/Yr (n)", type: "number", default: 12 },
      ],
      formula: "A = P × (1 + (r/100)/n)^(n×t)",
      description: "Computes total future value with monthly/annual compound interest.",
    },
    {
      id: "percent_change",
      name: "Percentage Increase / Decrease",
      vars: [
        { name: "oldVal", label: "Original Value", type: "number", default: 150 },
        { name: "newVal", label: "New Value", type: "number", default: 210 },
      ],
      formula: "Change % = ((New - Old) / |Old|) × 100",
      description: "Calculates percentage growth or drop between two values.",
    },
  ],
};

// Factorial helper function
const factorial = (num) => {
  if (num < 0) return NaN;
  if (num === 0 || num === 1) return 1;
  let res = 1;
  for (let i = 2; i <= num; i++) res *= i;
  return res;
};

// Step by step breakdown generator
const getStepByStepExplanation = (formulaId, inputs, numericVals) => {
  const steps = [];

  switch (formulaId) {
    case "quadratic": {
      const a = numericVals.a ?? 1;
      const b = numericVals.b ?? 0;
      const c = numericVals.c ?? 0;
      steps.push(`Step 1: Identify coefficients → a = ${a}, b = ${b}, c = ${c}`);
      const disc = b * b - 4 * a * c;
      steps.push(`Step 2: Calculate Discriminant (Δ = b² - 4ac) → (${b})² - 4(${a})(${c}) = ${disc.toFixed(4)}`);

      if (a === 0) {
        steps.push(`Step 3: Coefficient 'a' is 0 → Equation reduces to linear bx + c = 0 → x = ${(-c / b).toFixed(4)}`);
      } else if (disc < 0) {
        const realPart = (-b / (2 * a)).toFixed(4);
        const imagPart = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
        steps.push(`Step 3: Δ < 0 → Roots are Complex conjugate pairs.`);
        steps.push(`Step 4: Real part = -b / 2a = ${realPart}, Imaginary part = √|Δ| / 2a = ${imagPart}`);
        steps.push(`Step 5: x₁ = ${realPart} + ${imagPart}i, x₂ = ${realPart} - ${imagPart}i`);
      } else {
        const sqrtD = Math.sqrt(disc);
        steps.push(`Step 3: Take square root of discriminant → √Δ = √${disc.toFixed(4)} = ${sqrtD.toFixed(4)}`);
        const x1 = (-b + sqrtD) / (2 * a);
        const x2 = (-b - sqrtD) / (2 * a);
        steps.push(`Step 4: Compute x₁ = (-(${b}) + ${sqrtD.toFixed(4)}) / (2 × ${a}) = ${x1.toFixed(4)}`);
        steps.push(`Step 5: Compute x₂ = (-(${b}) - ${sqrtD.toFixed(4)}) / (2 × ${a}) = ${x2.toFixed(4)}`);
      }
      break;
    }
    case "linear": {
      const { m = 0, x = 0, b = 0 } = numericVals;
      steps.push(`Step 1: Substitute values into line equation y = mx + b`);
      steps.push(`Step 2: Multiply slope by x → m × x = ${m} × ${x} = ${(m * x).toFixed(4)}`);
      steps.push(`Step 3: Add y-intercept b → y = ${(m * x).toFixed(4)} + ${b} = ${(m * x + b).toFixed(4)}`);
      break;
    }
    case "distance": {
      const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = numericVals;
      const dx = x2 - x1;
      const dy = y2 - y1;
      steps.push(`Step 1: Identify point coordinates → P₁(${x1}, ${y1}), P₂(${x2}, ${y2})`);
      steps.push(`Step 2: Calculate differences → Δx = ${x2} - ${x1} = ${dx}, Δy = ${y2} - ${y1} = ${dy}`);
      steps.push(`Step 3: Square differences → (Δx)² = ${dx * dx}, (Δy)² = ${dy * dy}`);
      steps.push(`Step 4: Sum squared differences → ${dx * dx} + ${dy * dy} = ${dx * dx + dy * dy}`);
      steps.push(`Step 5: Take square root → d = √${dx * dx + dy * dy} = ${Math.sqrt(dx * dx + dy * dy).toFixed(4)}`);
      break;
    }
    case "slope": {
      const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = numericVals;
      const dy = y2 - y1;
      const dx = x2 - x1;
      steps.push(`Step 1: Calculate rise (y₂ - y₁) = ${y2} - ${y1} = ${dy}`);
      steps.push(`Step 2: Calculate run (x₂ - x₁) = ${x2} - ${x1} = ${dx}`);
      if (dx === 0) {
        steps.push(`Step 3: Δx = 0 → Division by zero, line is vertical (Slope is Undefined).`);
      } else {
        steps.push(`Step 3: Slope m = Rise / Run = ${dy} / ${dx} = ${(dy / dx).toFixed(4)}`);
      }
      break;
    }
    case "ap_term": {
      const { a = 0, d = 0, n = 1 } = numericVals;
      const an = a + (n - 1) * d;
      const Sn = (n / 2) * (2 * a + (n - 1) * d);
      steps.push(`Step 1: Formula for n-th term → aₙ = a + (n-1)d`);
      steps.push(`Step 2: Substitute → aₙ = ${a} + (${n}-1)(${d}) = ${a} + ${(n - 1) * d} = ${an}`);
      steps.push(`Step 3: Formula for sum of first n terms → Sₙ = (n/2) × [2a + (n-1)d]`);
      steps.push(`Step 4: Substitute → Sₙ = (${n}/2) × [2(${a}) + ${(n - 1) * d}] = ${Sn.toFixed(4)}`);
      break;
    }
    case "gp_term": {
      const { a = 0, r = 1, n = 1 } = numericVals;
      const an = a * Math.pow(r, n - 1);
      steps.push(`Step 1: Formula for n-th term → aₙ = a × rⁿ⁻¹`);
      steps.push(`Step 2: Substitute → aₙ = ${a} × (${r})^(${n}-1) = ${a} × ${Math.pow(r, n - 1)} = ${an.toFixed(4)}`);
      if (r === 1) {
        steps.push(`Step 3: r = 1 → Sum Sₙ = n × a = ${n} × ${a} = ${n * a}`);
      } else {
        const Sn = (a * (1 - Math.pow(r, n))) / (1 - r);
        steps.push(`Step 3: Formula for Sum Sₙ = a(1 - rⁿ) / (1 - r)`);
        steps.push(`Step 4: Substitute → Sₙ = ${a}(1 - ${Math.pow(r, n)}) / (1 - ${r}) = ${Sn.toFixed(4)}`);
      }
      break;
    }
    case "circle_area": {
      const r = numericVals.r ?? 0;
      steps.push(`Step 1: Given Radius r = ${r}`);
      steps.push(`Step 2: Square radius → r² = ${r * r}`);
      steps.push(`Step 3: Area = π × r² = π × ${r * r} = ${(Math.PI * r * r).toFixed(4)}`);
      steps.push(`Step 4: Circumference = 2 × π × r = 2 × π × ${r} = ${(2 * Math.PI * r).toFixed(4)}`);
      break;
    }
    case "triangle_area": {
      const { b = 0, h = 0 } = numericVals;
      steps.push(`Step 1: Identify Base b = ${b}, Height h = ${h}`);
      steps.push(`Step 2: Multiply b × h = ${b * h}`);
      steps.push(`Step 3: Divide by 2 → Area = ½ × ${b * h} = ${(0.5 * b * h).toFixed(4)}`);
      break;
    }
    case "heron_triangle": {
      const { a = 0, b = 0, c = 0 } = numericVals;
      const s = (a + b + c) / 2;
      steps.push(`Step 1: Calculate semi-perimeter s = (a + b + c)/2 = (${a} + ${b} + ${c})/2 = ${s}`);
      const areaSq = s * (s - a) * (s - b) * (s - c);
      if (areaSq <= 0) {
        steps.push(`Step 2: Check triangle inequality → Invalid triangle sides!`);
      } else {
        steps.push(`Step 2: Compute s(s-a)(s-b)(s-c) = ${s}(${s - a})(${s - b})(${s - c}) = ${areaSq.toFixed(4)}`);
        steps.push(`Step 3: Take square root → Area = √${areaSq.toFixed(4)} = ${Math.sqrt(areaSq).toFixed(4)}`);
      }
      break;
    }
    case "rectangle_area": {
      const { l = 0, w = 0 } = numericVals;
      steps.push(`Step 1: Area = Length × Width = ${l} × ${w} = ${(l * w).toFixed(4)}`);
      steps.push(`Step 2: Perimeter = 2 × (Length + Width) = 2 × (${l} + ${w}) = ${(2 * (l + w)).toFixed(4)}`);
      break;
    }
    case "sphere_volume": {
      const r = numericVals.r ?? 0;
      steps.push(`Step 1: Radius r = ${r}`);
      steps.push(`Step 2: Compute r³ = ${Math.pow(r, 3)}`);
      steps.push(`Step 3: Volume = (4/3) × π × r³ = ${( (4/3) * Math.PI * Math.pow(r, 3) ).toFixed(4)}`);
      steps.push(`Step 4: Surface Area = 4 × π × r² = ${(4 * Math.PI * r * r).toFixed(4)}`);
      break;
    }
    case "cylinder_volume": {
      const { r = 0, h = 0 } = numericVals;
      steps.push(`Step 1: Base Area = π × r² = π × ${r * r} = ${(Math.PI * r * r).toFixed(4)}`);
      steps.push(`Step 2: Volume = Base Area × Height = ${(Math.PI * r * r).toFixed(4)} × ${h} = ${(Math.PI * r * r * h).toFixed(4)}`);
      steps.push(`Step 3: Curved Surface Area = 2πrh = ${(2 * Math.PI * r * h).toFixed(4)}`);
      steps.push(`Step 4: Total Surface Area = 2πrh + 2πr² = ${(2 * Math.PI * r * h + 2 * Math.PI * r * r).toFixed(4)}`);
      break;
    }
    case "cone_volume": {
      const { r = 0, h = 0 } = numericVals;
      const slant = Math.sqrt(r * r + h * h);
      steps.push(`Step 1: Slant Height l = √(r² + h²) = √(${r * r} + ${h * h}) = ${slant.toFixed(4)}`);
      steps.push(`Step 2: Volume = ⅓ × π × r² × h = ${( (1/3) * Math.PI * r * r * h ).toFixed(4)}`);
      steps.push(`Step 3: Total Surface Area = πr(r + l) = ${(Math.PI * r * (r + slant)).toFixed(4)}`);
      break;
    }
    case "pythagorean": {
      const { a = 0, b = 0 } = numericVals;
      steps.push(`Step 1: Square leg a → a² = ${a * a}`);
      steps.push(`Step 2: Square leg b → b² = ${b * b}`);
      steps.push(`Step 3: Add squares → a² + b² = ${a * a + b * b}`);
      steps.push(`Step 4: Hypotenuse c = √(${a * a + b * b}) = ${Math.sqrt(a * a + b * b).toFixed(4)}`);
      break;
    }
    case "trig_ratios": {
      const { opposite = 0, adjacent = 0, hypotenuse = 0 } = numericVals;
      if (hypotenuse === 0) {
        steps.push(`Step 1: Hypotenuse cannot be zero!`);
      } else {
        const sinVal = opposite / hypotenuse;
        const cosVal = adjacent / hypotenuse;
        const rad = Math.asin(Math.max(-1, Math.min(1, sinVal)));
        const deg = (rad * 180) / Math.PI;
        steps.push(`Step 1: sin θ = Opposite / Hypotenuse = ${opposite} / ${hypotenuse} = ${sinVal.toFixed(4)}`);
        steps.push(`Step 2: cos θ = Adjacent / Hypotenuse = ${adjacent} / ${hypotenuse} = ${cosVal.toFixed(4)}`);
        steps.push(`Step 3: tan θ = Opposite / Adjacent = ${adjacent === 0 ? "Undefined" : (opposite / adjacent).toFixed(4)}`);
        steps.push(`Step 4: Angle θ = arcsin(${sinVal.toFixed(4)}) ≈ ${deg.toFixed(2)}°`);
      }
      break;
    }
    case "law_cosines": {
      const { a = 0, b = 0, angleC = 0 } = numericVals;
      const radC = (angleC * Math.PI) / 180;
      const cosVal = Math.cos(radC);
      const cSq = a * a + b * b - 2 * a * b * cosVal;
      steps.push(`Step 1: Convert angle C (${angleC}°) to radians → cos(${angleC}°) = ${cosVal.toFixed(4)}`);
      steps.push(`Step 2: Compute a² + b² = ${a * a} + ${b * b} = ${a * a + b * b}`);
      steps.push(`Step 3: Compute 2ab cos(C) = 2(${a})(${b})(${cosVal.toFixed(4)}) = ${(2 * a * b * cosVal).toFixed(4)}`);
      steps.push(`Step 4: c = √(${cSq.toFixed(4)}) = ${Math.sqrt(Math.max(0, cSq)).toFixed(4)}`);
      break;
    }
    case "mean_median_mode": {
      const raw = inputs.values || "";
      const arr = raw
        .split(/[\s,]+/)
        .map((v) => parseFloat(v.trim()))
        .filter((v) => !isNaN(v));

      if (arr.length === 0) {
        steps.push(`Please enter valid comma-separated numeric values.`);
      } else {
        steps.push(`Step 1: Parsed array of ${arr.length} values → [${arr.join(", ")}]`);
        const sum = arr.reduce((acc, curr) => acc + curr, 0);
        steps.push(`Step 2: Sum of values = ${sum.toFixed(4)}`);
        steps.push(`Step 3: Mean = Sum / Count = ${sum} / ${arr.length} = ${(sum / arr.length).toFixed(4)}`);

        const sorted = [...arr].sort((x, y) => x - y);
        steps.push(`Step 4: Sorted array → [${sorted.join(", ")}]`);
        let median = 0;
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
          median = (sorted[mid - 1] + sorted[mid]) / 2;
          steps.push(`Step 5: Even count → Median = (${sorted[mid - 1]} + ${sorted[mid]}) / 2 = ${median}`);
        } else {
          median = sorted[mid];
          steps.push(`Step 5: Odd count → Median = middle value = ${median}`);
        }
      }
      break;
    }
    case "variance_stddev": {
      const raw = inputs.values || "";
      const arr = raw
        .split(/[\s,]+/)
        .map((v) => parseFloat(v.trim()))
        .filter((v) => !isNaN(v));

      if (arr.length === 0) {
        steps.push(`Please enter valid comma-separated numbers.`);
      } else {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        steps.push(`Step 1: Calculate Mean (μ) = ${mean.toFixed(4)}`);
        const squaredDiffs = arr.map((x) => Math.pow(x - mean, 2));
        steps.push(`Step 2: Squared differences from mean → [${squaredDiffs.map((d) => d.toFixed(2)).join(", ")}]`);
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
        steps.push(`Step 3: Population Variance σ² = Σ(x - μ)² / n = ${variance.toFixed(4)}`);
        steps.push(`Step 4: Standard Deviation σ = √Variance = ${Math.sqrt(variance).toFixed(4)}`);
      }
      break;
    }
    case "npr_ncr": {
      const { n = 0, r = 0 } = numericVals;
      if (r > n || n < 0 || r < 0) {
        steps.push(`Invalid input: r cannot be greater than n, and numbers must be non-negative.`);
      } else {
        const nFact = factorial(n);
        const rFact = factorial(r);
        const nrFact = factorial(n - r);
        const nPr = nFact / nrFact;
        const nCr = nFact / (rFact * nrFact);

        steps.push(`Step 1: Compute factorials → n! = ${nFact}, r! = ${rFact}, (n-r)! = ${nrFact}`);
        steps.push(`Step 2: Permutations nPr = n! / (n-r)! = ${nFact} / ${nrFact} = ${nPr}`);
        steps.push(`Step 3: Combinations nCr = n! / [r!(n-r)!] = ${nFact} / (${rFact} × ${nrFact}) = ${nCr}`);
      }
      break;
    }
    case "power_rule_derivative": {
      const { a = 1, n = 1, xVal = 0 } = numericVals;
      const newCoeff = a * n;
      const newExp = n - 1;
      steps.push(`Step 1: Apply Power Rule → d/dx [a · xⁿ] = (a × n) · xⁿ⁻¹`);
      steps.push(`Step 2: Derivative expression → ${newCoeff} · x^(${newExp})`);
      const val = newCoeff * Math.pow(xVal, newExp);
      steps.push(`Step 3: Evaluate at x = ${xVal} → ${newCoeff} × (${xVal})^(${newExp}) = ${val.toFixed(4)}`);
      break;
    }
    case "power_rule_integral": {
      const { a = 1, n = 1, lower = 0, upper = 1 } = numericVals;
      if (n === -1) {
        steps.push(`For n = -1, integral is a · ln|x|.`);
      } else {
        const newExp = n + 1;
        const coeff = a / newExp;
        steps.push(`Step 1: Antiderivative F(x) = (${a}/${newExp}) × x^(${newExp}) = ${coeff.toFixed(4)} × x^(${newExp})`);
        const valUpper = coeff * Math.pow(upper, newExp);
        const valLower = coeff * Math.pow(lower, newExp);
        steps.push(`Step 2: Evaluate F(B) at x = ${upper} → ${valUpper.toFixed(4)}`);
        steps.push(`Step 3: Evaluate F(A) at x = ${lower} → ${valLower.toFixed(4)}`);
        steps.push(`Step 4: Definite Integral = F(B) - F(A) = ${(valUpper - valLower).toFixed(4)}`);
      }
      break;
    }
    case "matrix_2x2_det": {
      const { a = 0, b = 0, c = 0, d = 0 } = numericVals;
      steps.push(`Step 1: Identify 2x2 elements: [[${a}, ${b}], [${c}, ${d}]]`);
      steps.push(`Step 2: Main diagonal product (a × d) = ${a} × ${d} = ${a * d}`);
      steps.push(`Step 3: Anti diagonal product (b × c) = ${b} × ${c} = ${b * c}`);
      steps.push(`Step 4: Determinant det(A) = (a × d) - (b × c) = ${a * d} - ${b * c} = ${a * d - b * c}`);
      break;
    }
    case "vector_dot": {
      const { u1 = 0, u2 = 0, u3 = 0, v1 = 0, v2 = 0, v3 = 0 } = numericVals;
      steps.push(`Step 1: Given vectors u = [${u1}, ${u2}, ${u3}], v = [${v1}, ${v2}, ${v3}]`);
      steps.push(`Step 2: Multiply components → u₁v₁ = ${u1*v1}, u₂v₂ = ${u2*v2}, u₃v₃ = ${u3*v3}`);
      steps.push(`Step 3: Sum components → Dot Product = ${u1*v1} + ${u2*v2} + ${u3*v3} = ${u1*v1 + u2*v2 + u3*v3}`);
      break;
    }
    case "simple_interest": {
      const { P = 0, R = 0, T = 0 } = numericVals;
      const interest = (P * R * T) / 100;
      steps.push(`Step 1: Interest = (P × R × T) / 100 = (${P} × ${R} × ${T}) / 100`);
      steps.push(`Step 2: Interest Amount = $${interest.toFixed(2)}`);
      steps.push(`Step 3: Total Maturity Amount = Principal + Interest = $${P} + $${interest.toFixed(2)} = $${(P + interest).toFixed(2)}`);
      break;
    }
    case "compound_interest": {
      const { P = 0, r = 0, t = 0, n = 12 } = numericVals;
      const rateDecimal = r / 100;
      const amount = P * Math.pow(1 + rateDecimal / n, n * t);
      const interest = amount - P;
      steps.push(`Step 1: Rate decimal r = ${r}% = ${rateDecimal}`);
      steps.push(`Step 2: Rate per period (r/n) = ${rateDecimal} / ${n} = ${(rateDecimal / n).toFixed(6)}`);
      steps.push(`Step 3: Total periods (n × t) = ${n} × ${t} = ${n * t}`);
      steps.push(`Step 4: Compound Amount A = $${P} × (1 + ${(rateDecimal / n).toFixed(6)})^${n * t} = $${amount.toFixed(2)}`);
      steps.push(`Step 5: Total Interest Earned = A - P = $${amount.toFixed(2)} - $${P} = $${interest.toFixed(2)}`);
      break;
    }
    case "percent_change": {
      const { oldVal = 0, newVal = 0 } = numericVals;
      if (oldVal === 0) {
        steps.push(`Division by zero: Original value cannot be 0.`);
      } else {
        const diff = newVal - oldVal;
        const pct = (diff / Math.abs(oldVal)) * 100;
        steps.push(`Step 1: Calculate difference → New - Old = ${newVal} - ${oldVal} = ${diff}`);
        steps.push(`Step 2: Divide by |Old| → ${diff} / ${Math.abs(oldVal)} = ${(diff / Math.abs(oldVal)).toFixed(4)}`);
        steps.push(`Step 3: Multiply by 100 → Percentage Change = ${pct.toFixed(2)}% (${pct >= 0 ? "Increase" : "Decrease"})`);
      }
      break;
    }
    default:
      steps.push("Step-by-step breakdown available upon calculation.");
  }

  return steps;
};

// Dynamic SVG Shape Visualizer Component (Light Theme styled)
function DynamicShapeVisualizer({ formulaId, numericVals }) {
  switch (formulaId) {
    case "circle_area": {
      const r = Math.max(10, Math.min(80, (numericVals.r || 5) * 8));
      return (
        <svg className="w-full h-44 bg-slate-50 border border-slate-200 rounded-xl" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={r} fill="rgba(249, 115, 22, 0.12)" stroke="#f97316" strokeWidth="2.5" />
          <line x1="100" y1="100" x2={100 + r} y2="100" stroke="#ea580c" strokeWidth="2" strokeDasharray="4 2" />
          <circle cx="100" cy="100" r="3" fill="#ea580c" />
          <text x={100 + r / 2} y="92" fill="#ea580c" fontSize="12" fontWeight="bold" textAnchor="middle">
            r = {numericVals.r || 5}
          </text>
        </svg>
      );
    }
    case "rectangle_area": {
      const l = Math.max(20, Math.min(140, (numericVals.l || 10) * 8));
      const w = Math.max(20, Math.min(100, (numericVals.w || 5) * 8));
      const x = 100 - l / 2;
      const y = 100 - w / 2;
      return (
        <svg className="w-full h-44 bg-slate-50 border border-slate-200 rounded-xl" viewBox="0 0 200 200">
          <rect x={x} y={y} width={l} height={w} fill="rgba(59, 130, 246, 0.12)" stroke="#3b82f6" strokeWidth="2.5" rx="4" />
          <text x="100" y={y - 8} fill="#2563eb" fontSize="12" fontWeight="bold" textAnchor="middle">
            l = {numericVals.l || 10}
          </text>
          <text x={x - 8} y={y + w / 2} fill="#2563eb" fontSize="12" fontWeight="bold" textAnchor="end">
            w = {numericVals.w || 5}
          </text>
        </svg>
      );
    }
    case "triangle_area":
    case "heron_triangle":
    case "law_cosines": {
      return (
        <svg className="w-full h-44 bg-slate-50 border border-slate-200 rounded-xl" viewBox="0 0 200 200">
          <polygon points="30,150 170,150 110,40" fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" strokeWidth="2.5" />
          <line x1="110" y1="40" x2="110" y2="150" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" />
          <text x="100" y="166" fill="#059669" fontSize="12" fontWeight="bold" textAnchor="middle">
            Base
          </text>
          <text x="116" y="100" fill="#059669" fontSize="12" fontWeight="bold">
            Height
          </text>
        </svg>
      );
    }
    case "pythagorean":
    case "trig_ratios": {
      return (
        <svg className="w-full h-44 bg-slate-50 border border-slate-200 rounded-xl" viewBox="0 0 200 200">
          <polygon points="40,160 160,160 40,40" fill="rgba(139, 92, 246, 0.12)" stroke="#8b5cf6" strokeWidth="2.5" />
          <rect x="40" y="145" width="15" height="15" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
          <text x="100" y="178" fill="#7c3aed" fontSize="11" fontWeight="bold" textAnchor="middle">
            Adjacent (b = {numericVals.b || numericVals.adjacent || 4})
          </text>
          <text x="25" y="105" fill="#7c3aed" fontSize="11" fontWeight="bold" textAnchor="end">
            Opposite (a = {numericVals.a || numericVals.opposite || 3})
          </text>
          <text x="110" y="90" fill="#6d28d9" fontSize="11" fontWeight="bold" textAnchor="start">
            Hypotenuse c
          </text>
        </svg>
      );
    }
    case "cylinder_volume": {
      return (
        <svg className="w-full h-44 bg-slate-50 border border-slate-200 rounded-xl" viewBox="0 0 200 200">
          <ellipse cx="100" cy="50" rx="50" ry="18" fill="rgba(14, 165, 233, 0.15)" stroke="#0ea5e9" strokeWidth="2" />
          <line x1="50" y1="50" x2="50" y2="140" stroke="#0ea5e9" strokeWidth="2" />
          <line x1="150" y1="50" x2="150" y2="140" stroke="#0ea5e9" strokeWidth="2" />
          <ellipse cx="100" cy="140" rx="50" ry="18" fill="rgba(14, 165, 233, 0.1)" stroke="#0ea5e9" strokeWidth="2" />
          <text x="100" y="46" fill="#0284c7" fontSize="11" fontWeight="bold" textAnchor="middle">
            r = {numericVals.r || 3}
          </text>
          <text x="156" y="100" fill="#0284c7" fontSize="11" fontWeight="bold">
            h = {numericVals.h || 7}
          </text>
        </svg>
      );
    }
    case "sphere_volume": {
      return (
        <svg className="w-full h-44 bg-slate-50 border border-slate-200 rounded-xl" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="55" fill="rgba(236, 72, 153, 0.12)" stroke="#ec4899" strokeWidth="2.5" />
          <ellipse cx="100" cy="100" rx="55" ry="18" fill="none" stroke="#db2777" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="100" y1="100" x2="155" y2="100" stroke="#db2777" strokeWidth="2" />
          <text x="125" y="92" fill="#be185d" fontSize="11" fontWeight="bold">
            r = {numericVals.r || 4}
          </text>
        </svg>
      );
    }
    case "cone_volume": {
      return (
        <svg className="w-full h-44 bg-slate-50 border border-slate-200 rounded-xl" viewBox="0 0 200 200">
          <polygon points="100,30 45,150 155,150" fill="rgba(245, 158, 11, 0.12)" stroke="#f59e0b" strokeWidth="2" />
          <ellipse cx="100" cy="150" rx="55" ry="18" fill="rgba(245, 158, 11, 0.15)" stroke="#d97706" strokeWidth="2" />
          <line x1="100" y1="30" x2="100" y2="150" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="106" y="90" fill="#b45309" fontSize="11" fontWeight="bold">
            h = {numericVals.h || 4}
          </text>
        </svg>
      );
    }
    case "linear":
    case "slope":
    case "distance": {
      return (
        <svg className="w-full h-44 bg-slate-50 border border-slate-200 rounded-xl" viewBox="0 0 200 200">
          {/* Grid lines */}
          <line x1="20" y1="100" x2="180" y2="100" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="100" y1="20" x2="100" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Slope line */}
          <line x1="30" y1="160" x2="170" y2="40" stroke="#ef4444" strokeWidth="2.5" />
          <circle cx="70" cy="128" r="4" fill="#dc2626" />
          <circle cx="130" cy="72" r="4" fill="#dc2626" />
          <text x="105" y="115" fill="#64748b" fontSize="10">
            (0,0)
          </text>
        </svg>
      );
    }
    default:
      return null;
  }
}

export default function MathFormulaCalculator() {
  const [selectedCategory, setSelectedCategory] = useState("Algebra");
  const [selectedFormula, setSelectedFormula] = useState("quadratic");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [copyNote, setCopyNote] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);

  // Load persistence
  useEffect(() => {
    try {
      const savedFavs = JSON.parse(localStorage.getItem("math_calc_favs") || "[]");
      const savedHist = JSON.parse(localStorage.getItem("math_calc_hist") || "[]");
      setFavorites(savedFavs);
      setHistory(savedHist);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync default variable values when formula changes
  const currentCategoryFormulas = formulaCategories[selectedCategory] || [];
  const currentFormula = useMemo(() => {
    return (
      currentCategoryFormulas.find((f) => f.id === selectedFormula) ||
      Object.values(formulaCategories)
        .flat()
        .find((f) => f.id === selectedFormula) ||
      formulaCategories.Algebra[0]
    );
  }, [selectedCategory, selectedFormula, currentCategoryFormulas]);

  useEffect(() => {
    if (currentFormula) {
      const initialInputs = {};
      currentFormula.vars.forEach((v) => {
        initialInputs[v.name] = v.default !== undefined ? String(v.default) : "";
      });
      setInputs(initialInputs);
      setResult(null);
    }
  }, [currentFormula]);

  // Flattened formulas list for search
  const allFormulas = useMemo(() => {
    const list = [];
    Object.entries(formulaCategories).forEach(([category, items]) => {
      items.forEach((item) => {
        list.push({ ...item, category });
      });
    });
    return list;
  }, []);

  // Search filtered options
  const filteredFormulas = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allFormulas.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
    );
  }, [searchQuery, allFormulas]);

  const categoryOptions = Object.keys(formulaCategories).map((cat) => ({
    value: cat,
    label: cat,
  }));

  const formulaOptions = currentCategoryFormulas.map((f) => ({
    value: f.id,
    label: f.name,
  }));

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (formulaCategories[cat] && formulaCategories[cat].length > 0) {
      setSelectedFormula(formulaCategories[cat][0].id);
    }
  };

  const handleFormulaSelect = (formulaId, catName) => {
    if (catName) setSelectedCategory(catName);
    setSelectedFormula(formulaId);
    setSearchQuery("");
  };

  const handleInputChange = (varName, val) => {
    setInputs((prev) => ({ ...prev, [varName]: val }));
  };

  // Convert string inputs to numeric values object
  const numericVals = useMemo(() => {
    const obj = {};
    if (currentFormula) {
      currentFormula.vars.forEach((v) => {
        obj[v.name] = parseFloat(inputs[v.name] || "0");
      });
    }
    return obj;
  }, [currentFormula, inputs]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("math_calc_favs", JSON.stringify(next));
      return next;
    });
  };

  const calculateResult = () => {
    if (!currentFormula) return;

    let ans = "";
    const fid = currentFormula.id;

    switch (fid) {
      case "quadratic": {
        const { a = 1, b = 0, c = 0 } = numericVals;
        if (a === 0) {
          ans = `Linear equation: x = ${(-c / b).toFixed(4)}`;
        } else {
          const disc = b * b - 4 * a * c;
          if (disc < 0) {
            const real = (-b / (2 * a)).toFixed(4);
            const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
            ans = `x₁ = ${real} + ${imag}i,  x₂ = ${real} - ${imag}i`;
          } else {
            const x1 = (-b + Math.sqrt(disc)) / (2 * a);
            const x2 = (-b - Math.sqrt(disc)) / (2 * a);
            ans = `x₁ = ${x1.toFixed(4)},  x₂ = ${x2.toFixed(4)}`;
          }
        }
        break;
      }
      case "linear": {
        const { m = 0, x = 0, b = 0 } = numericVals;
        ans = `y = ${(m * x + b).toFixed(4)}`;
        break;
      }
      case "distance": {
        const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = numericVals;
        const d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        ans = `Distance d = ${d.toFixed(4)} units`;
        break;
      }
      case "slope": {
        const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = numericVals;
        if (x2 === x1) {
          ans = "Undefined (Vertical line)";
        } else {
          ans = `Slope m = ${((y2 - y1) / (x2 - x1)).toFixed(4)}`;
        }
        break;
      }
      case "ap_term": {
        const { a = 0, d = 0, n = 1 } = numericVals;
        const an = a + (n - 1) * d;
        const Sn = (n / 2) * (2 * a + (n - 1) * d);
        ans = `aₙ = ${an},  Sₙ = ${Sn.toFixed(4)}`;
        break;
      }
      case "gp_term": {
        const { a = 0, r = 1, n = 1 } = numericVals;
        const an = a * Math.pow(r, n - 1);
        const Sn = r === 1 ? n * a : (a * (1 - Math.pow(r, n))) / (1 - r);
        ans = `aₙ = ${an.toFixed(4)},  Sₙ = ${Sn.toFixed(4)}`;
        break;
      }
      case "circle_area": {
        const r = numericVals.r ?? 0;
        const area = Math.PI * r * r;
        const circ = 2 * Math.PI * r;
        ans = `Area = ${area.toFixed(4)} sq units, Circumference = ${circ.toFixed(4)} units`;
        break;
      }
      case "triangle_area": {
        const { b = 0, h = 0 } = numericVals;
        ans = `Area = ${(0.5 * b * h).toFixed(4)} sq units`;
        break;
      }
      case "heron_triangle": {
        const { a = 0, b = 0, c = 0 } = numericVals;
        const s = (a + b + c) / 2;
        const areaSq = s * (s - a) * (s - b) * (s - c);
        ans = areaSq > 0 ? `Area = ${Math.sqrt(areaSq).toFixed(4)} sq units` : "Invalid triangle sides";
        break;
      }
      case "rectangle_area": {
        const { l = 0, w = 0 } = numericVals;
        ans = `Area = ${(l * w).toFixed(4)} sq units, Perimeter = ${(2 * (l + w)).toFixed(4)} units`;
        break;
      }
      case "sphere_volume": {
        const r = numericVals.r ?? 0;
        const vol = (4 / 3) * Math.PI * Math.pow(r, 3);
        const sa = 4 * Math.PI * r * r;
        ans = `Volume = ${vol.toFixed(4)} cu units, Surface Area = ${sa.toFixed(4)} sq units`;
        break;
      }
      case "cylinder_volume": {
        const { r = 0, h = 0 } = numericVals;
        const vol = Math.PI * r * r * h;
        const sa = 2 * Math.PI * r * h + 2 * Math.PI * r * r;
        ans = `Volume = ${vol.toFixed(4)} cu units, Surface Area = ${sa.toFixed(4)} sq units`;
        break;
      }
      case "cone_volume": {
        const { r = 0, h = 0 } = numericVals;
        const vol = (1 / 3) * Math.PI * r * r * h;
        const slant = Math.sqrt(r * r + h * h);
        ans = `Volume = ${vol.toFixed(4)} cu units, Slant Height l = ${slant.toFixed(4)}`;
        break;
      }
      case "pythagorean": {
        const { a = 0, b = 0 } = numericVals;
        ans = `Hypotenuse c = ${Math.sqrt(a * a + b * b).toFixed(4)}`;
        break;
      }
      case "trig_ratios": {
        const { opposite = 0, adjacent = 0, hypotenuse = 0 } = numericVals;
        if (hypotenuse === 0) ans = "Hypotenuse cannot be 0";
        else {
          const sinVal = opposite / hypotenuse;
          const deg = (Math.asin(Math.max(-1, Math.min(1, sinVal))) * 180) / Math.PI;
          ans = `sin θ = ${sinVal.toFixed(4)},  cos θ = ${(adjacent / hypotenuse).toFixed(4)},  Angle θ ≈ ${deg.toFixed(2)}°`;
        }
        break;
      }
      case "law_cosines": {
        const { a = 0, b = 0, angleC = 0 } = numericVals;
        const rad = (angleC * Math.PI) / 180;
        const cSq = a * a + b * b - 2 * a * b * Math.cos(rad);
        ans = `Side c = ${Math.sqrt(Math.max(0, cSq)).toFixed(4)}`;
        break;
      }
      case "mean_median_mode": {
        const arr = (inputs.values || "")
          .split(/[\s,]+/)
          .map((v) => parseFloat(v.trim()))
          .filter((v) => !isNaN(v));
        if (arr.length === 0) ans = "Please enter valid comma-separated values";
        else {
          const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
          const sorted = [...arr].sort((x, y) => x - y);
          const mid = Math.floor(sorted.length / 2);
          const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
          ans = `Mean = ${mean.toFixed(4)}, Median = ${median}`;
        }
        break;
      }
      case "variance_stddev": {
        const arr = (inputs.values || "")
          .split(/[\s,]+/)
          .map((v) => parseFloat(v.trim()))
          .filter((v) => !isNaN(v));
        if (arr.length === 0) ans = "Please enter valid numbers";
        else {
          const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
          const varVal = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
          ans = `Variance σ² = ${varVal.toFixed(4)}, Std Dev σ = ${Math.sqrt(varVal).toFixed(4)}`;
        }
        break;
      }
      case "npr_ncr": {
        const { n = 0, r = 0 } = numericVals;
        if (r > n || n < 0 || r < 0) ans = "Invalid n or r";
        else {
          const nPr = factorial(n) / factorial(n - r);
          const nCr = nPr / factorial(r);
          ans = `nPr = ${nPr}, nCr = ${nCr}`;
        }
        break;
      }
      case "power_rule_derivative": {
        const { a = 1, n = 1, xVal = 0 } = numericVals;
        const derivExpr = `${a * n}·x^(${n - 1})`;
        const evaluated = a * n * Math.pow(xVal, n - 1);
        ans = `f'(x) = ${derivExpr}, evaluated f'(${xVal}) = ${evaluated.toFixed(4)}`;
        break;
      }
      case "power_rule_integral": {
        const { a = 1, n = 1, lower = 0, upper = 1 } = numericVals;
        if (n === -1) ans = "Integral = a · ln|x|";
        else {
          const coeff = a / (n + 1);
          const valUpper = coeff * Math.pow(upper, n + 1);
          const valLower = coeff * Math.pow(lower, n + 1);
          ans = `Definite Integral = ${(valUpper - valLower).toFixed(4)}`;
        }
        break;
      }
      case "matrix_2x2_det": {
        const { a = 0, b = 0, c = 0, d = 0 } = numericVals;
        ans = `det(A) = ${a * d - b * c}`;
        break;
      }
      case "vector_dot": {
        const { u1 = 0, u2 = 0, u3 = 0, v1 = 0, v2 = 0, v3 = 0 } = numericVals;
        ans = `u · v = ${u1 * v1 + u2 * v2 + u3 * v3}`;
        break;
      }
      case "simple_interest": {
        const { P = 0, R = 0, T = 0 } = numericVals;
        const interest = (P * R * T) / 100;
        ans = `Interest = $${interest.toFixed(2)}, Total = $${(P + interest).toFixed(2)}`;
        break;
      }
      case "compound_interest": {
        const { P = 0, r = 0, t = 0, n = 12 } = numericVals;
        const amount = P * Math.pow(1 + r / 100 / n, n * t);
        ans = `Maturity Amount = $${amount.toFixed(2)}, Interest = $${(amount - P).toFixed(2)}`;
        break;
      }
      case "percent_change": {
        const { oldVal = 0, newVal = 0 } = numericVals;
        if (oldVal === 0) ans = "Original value cannot be 0";
        else {
          const pct = ((newVal - oldVal) / Math.abs(oldVal)) * 100;
          ans = `Change = ${pct.toFixed(2)}% (${pct >= 0 ? "Increase" : "Decrease"})`;
        }
        break;
      }
      default:
        ans = "Calculated successfully";
    }

    const steps = getStepByStepExplanation(fid, inputs, numericVals);
    const newResult = { answer: ans, steps };
    setResult(newResult);

    // Save to history
    const historyItem = {
      id: Date.now(),
      formulaName: currentFormula.name,
      formulaId: fid,
      category: selectedCategory,
      answer: ans,
      inputs: { ...inputs },
    };

    setHistory((prev) => {
      const updated = [historyItem, ...prev.slice(0, 7)];
      localStorage.setItem("math_calc_hist", JSON.stringify(updated));
      return updated;
    });
  };

  const copyText = async (text) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopyNote("Copied to clipboard!");
    setTimeout(() => setCopyNote(""), 1500);
  };

  const copyFullSolution = async () => {
    if (!result) return;
    const text = `Formula: ${currentFormula.name}\nResult: ${result.answer}\n\nSteps:\n${result.steps.join("\n")}`;
    await copyText(text);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-3 sm:px-6 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            Math Utility
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Math Formula Calculator
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Solve 25+ math, algebra, geometry, trigonometry, statistics & calculus formulas with step-by-step breakdowns and interactive diagrams.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto pt-3">
            <input
              type="text"
              placeholder="🔍 Search formula (e.g., quadratic, cone, derivative, interest)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm shadow-sm"
            />
            {filteredFormulas && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-100">
                {filteredFormulas.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 text-center">No formulas found matching &quot;{searchQuery}&quot;</div>
                ) : (
                  filteredFormulas.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleFormulaSelect(f.id, f.category)}
                      className="w-full px-4 py-3 text-left hover:bg-orange-50 transition flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600">{f.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{f.formula}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {f.category}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {Object.keys(formulaCategories).map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200 scale-105"
                    : "bg-white text-slate-700 hover:bg-orange-50 hover:border-orange-200 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Input & Control Panel - 7 Cols */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
              {/* Category & Formula Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                    Category
                  </label>
                  <ThemedDropdown
                    ariaLabel="Select category"
                    value={selectedCategory}
                    options={categoryOptions}
                    onChange={handleCategoryChange}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      Formula
                    </label>
                    {currentFormula && (
                      <button
                        onClick={() => toggleFavorite(currentFormula.id)}
                        className={`text-xs font-semibold flex items-center gap-1 ${
                          favorites.includes(currentFormula.id) ? "text-amber-500" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        ★ {favorites.includes(currentFormula.id) ? "Favorite" : "Star"}
                      </button>
                    )}
                  </div>
                  <ThemedDropdown
                    ariaLabel="Select formula"
                    value={selectedFormula}
                    options={formulaOptions}
                    onChange={(val) => setSelectedFormula(val)}
                  />
                </div>
              </div>

              {/* Active Formula Banner */}
              {currentFormula && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Formula Expression</span>
                    <span className="text-[11px] text-orange-600 font-mono">{currentFormula.name}</span>
                  </div>
                  <p className="text-base sm:text-lg font-mono font-bold text-orange-600 break-words">
                    {currentFormula.formula}
                  </p>
                  <p className="text-xs text-slate-600">{currentFormula.description}</p>
                </div>
              )}

              {/* Input Variables Grid */}
              {currentFormula && (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Input Parameters
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentFormula.vars.map((v) => (
                      <div key={v.name} className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 block">{v.label}</label>
                        <input
                          type={v.type || "number"}
                          placeholder={v.placeholder || `Enter ${v.name}`}
                          value={inputs[v.name] || ""}
                          onChange={(e) => handleInputChange(v.name, e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calculate Action */}
              <button
                onClick={calculateResult}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold text-sm sm:text-base hover:from-orange-600 hover:to-orange-700 transition shadow-md shadow-orange-200 active:scale-[0.99]"
              >
                Calculate Solution ⚡
              </button>
            </div>

            {/* Dynamic Diagram Visualizer */}
            {currentFormula?.visType && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Shape / Graph Preview</p>
                <DynamicShapeVisualizer formulaId={currentFormula.id} numericVals={numericVals} />
              </div>
            )}
          </div>

          {/* Solution & History Panel - 5 Cols */}
          <div className="lg:col-span-5 space-y-5">
            {/* Result Box */}
            {result ? (
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 sm:p-6 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Final Answer</span>
                  {copyNote && <span className="text-xs text-emerald-700 font-semibold">{copyNote}</span>}
                </div>
                <div className="p-4 rounded-xl bg-white border border-emerald-300 shadow-inner">
                  <p className="text-xl sm:text-2xl font-mono font-black text-emerald-600 break-words leading-tight">
                    {result.answer}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => copyText(result.answer)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    📋 Copy Answer
                  </button>
                  <button
                    onClick={copyFullSolution}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200"
                  >
                    📄 Copy Full Solution
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-400 space-y-2 shadow-sm">
                <p className="text-3xl">📐</p>
                <p className="text-sm font-semibold text-slate-700">Ready to calculate</p>
                <p className="text-xs text-slate-500">Enter your parameters and click &quot;Calculate Solution&quot; to view step-by-step breakdown.</p>
              </div>
            )}

            {/* Step-by-Step Breakdown */}
            {result && result.steps && result.steps.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600">Step-by-Step Solution</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {result.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono leading-relaxed flex items-start gap-2.5 hover:border-slate-300 transition"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold text-[11px] flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calculation History */}
            {history.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Calculations</span>
                  <button
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem("math_calc_hist");
                    }}
                    className="text-[11px] text-slate-400 hover:text-red-600"
                  >
                    Clear History
                  </button>
                </div>
                <div className="space-y-2">
                  {history.slice(0, 4).map((h) => (
                    <div
                      key={h.id}
                      onClick={() => handleFormulaSelect(h.formulaId, h.category)}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition cursor-pointer flex items-center justify-between text-xs group"
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold text-slate-800 group-hover:text-orange-600 truncate">{h.formulaName}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{h.answer}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">Reload →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

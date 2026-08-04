import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// Helper: Convert HSL to RGB
function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHex(r, g, b) {
  const clamp = (val) => Math.min(255, Math.max(0, Math.round(val)));
  const toHex = (val) => clamp(val).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function buildLocalResponse(prompt, count, lockedColors) {
  const colors = [];
  const baseHue = Math.floor(Math.random() * 360);
  
  for (let i = 0; i < count; i++) {
    if (lockedColors && lockedColors[i]) {
      colors.push({
        hex: lockedColors[i].toUpperCase(),
        name: `Locked Color ${i + 1}`,
        role: i === 0 ? "Primary Base" : i === 1 ? "Secondary Base" : "Accent / Contrast"
      });
    } else {
      const hue = (baseHue + (i * (360 / count))) % 360;
      const s = 70;
      const l = 50 + (i % 2 === 0 ? 10 : -10);
      const rgb = hslToRgb(hue, s, l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      colors.push({
        hex,
        name: `Vibrant Shade ${i + 1}`,
        role: i === 0 ? "Primary Hue" : i === count - 1 ? "Accent Accent" : "Harmonious Intermediate"
      });
    }
  }

  return {
    title: prompt ? `Theme: ${prompt}` : "Harmonious Spark",
    description: `A custom generated palette using local geometry matching the requested ${count} colors.`,
    colors
  };
}

function buildPrompt(prompt, count, lockedColors) {
  const lockedStr = JSON.stringify(lockedColors);
  return [
    "You are a professional color designer and brand stylist.",
    `Create a highly cohesive and visually stunning color palette of exactly ${count} colors based on the theme/prompt: "${prompt}".`,
    "",
    "Locked Colors Rule:",
    `The user has provided this array of locked colors: ${lockedStr} (which is of length ${count}).`,
    "For any index in that array where a color string (e.g., '#FF5733') is provided (NOT null):",
    "1. You MUST keep that exact color hex code in the same index position in your response colors array.",
    "2. You MUST design the remaining (null) color slots to be highly harmonious with these locked colors while matching the requested theme.",
    "",
    "Output Format:",
    "Return ONLY valid JSON using this exact shape:",
    "{",
    '  "title": "A short creative title for the palette (e.g., Autumn Whispers)",',
    '  "description": "A 1-2 sentence description explaining the design choices and the vibe.",',
    '  "colors": [',
    '    {',
    '      "hex": "#HEXCODE (Must be standard 6-character hex starting with #, in uppercase)",',
    '      "name": "A creative, descriptive name for the color (e.g., Burnt Terracotta, Frosted Mint)",',
    '      "role": "Specific design role (e.g., Primary Brand Color, Accent Highlight, Soft Background Neutral, Deep Text Contrast)"',
    '    }',
    '  ]',
    "}",
    "",
    `Remember, the "colors" array MUST have exactly ${count} items. Response must be ONLY valid JSON.`
  ].join("\n");
}

function safeParseJson(content) {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    const firstObject = content.match(/\{[\s\S]*\}/)?.[0];
    if (firstObject) {
      try {
        return JSON.parse(firstObject);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const prompt = body?.prompt || "";
    const count = parseInt(body?.count) || 5;
    const lockedColors = Array.isArray(body?.lockedColors) ? body?.lockedColors : Array(count).fill(null);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(buildLocalResponse(prompt, count, lockedColors));
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a professional color matching AI. Return valid JSON only.",
          },
          {
            role: "user",
            content: buildPrompt(prompt, count, lockedColors),
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(buildLocalResponse(prompt, count, lockedColors));
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);

    if (!parsed || !Array.isArray(parsed.colors)) {
      return NextResponse.json(buildLocalResponse(prompt, count, lockedColors));
    }

    const finalColors = parsed.colors.map((color, idx) => {
      if (lockedColors[idx]) {
        return {
          hex: lockedColors[idx].toUpperCase(),
          name: color?.name || "Locked Color",
          role: color?.role || "Locked Base Color"
        };
      }
      let hex = color?.hex || "#CCCCCC";
      if (!hex.startsWith("#")) hex = "#" + hex;
      hex = hex.toUpperCase();
      return {
        hex,
        name: color?.name || `Color ${idx + 1}`,
        role: color?.role || `Color Role ${idx + 1}`
      };
    });

    return NextResponse.json({
      title: parsed.title || "AI Generated Palette",
      description: parsed.description || "Generated from prompt.",
      colors: finalColors.slice(0, count)
    });
  } catch (error) {
    console.error("AI Color Generation error:", error);
    return NextResponse.json(buildLocalResponse("", 5, []));
  }
}

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function normalize(value) {
  return String(value ?? "").trim();
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
      } catch {}
    }
    const fenced = content.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] || content.match(/```\s*([\s\S]*?)\s*```/)?.[1];
    if (!fenced) return null;
    try {
      return JSON.parse(fenced);
    } catch {
      return null;
    }
  }
}

function buildLocalHooks(topic, tone, platform) {
  const cleanTopic = topic.replace(/\s+/g, " ").trim();
  return [
    `Why everyone is talking about ${cleanTopic} right now.`,
    `Stop scrolling! Here is the truth about ${cleanTopic}.`,
    `I wish I knew this about ${cleanTopic} earlier.`,
    `${cleanTopic}: The secret to success in 2026.`,
    `How to master ${cleanTopic} in just 5 minutes a day.`,
  ];
}

function buildPrompt({ topic, tone, platform }) {
  return [
    `You are a viral content strategist. Generate 5 highly engaging "hooks" for a ${platform} post about: ${topic}.`,
    `The tone should be ${tone}.`,
    "A hook is the first sentence that grabs attention and stops the scroll.",
    "Return ONLY valid JSON in this exact shape:",
    '{"hooks":["...","...","...","...","..."]}',
  ].join("\n");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const topic = normalize(body?.topic);
    const tone = normalize(body?.tone) || "curious";
    const platform = normalize(body?.platform) || "twitter";

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ hooks: buildLocalHooks(topic, tone, platform), source: "Local fallback" });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.8,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: "You are a viral hook generator. You provide punchy, attention-grabbing opening lines for social media.",
          },
          {
            role: "user",
            content: buildPrompt({ topic, tone, platform }),
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ hooks: buildLocalHooks(topic, tone, platform), source: "Local fallback" });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);
    const hooks = Array.isArray(parsed?.hooks) ? parsed.hooks : buildLocalHooks(topic, tone, platform);

    return NextResponse.json({ hooks, source: "Groq API" });
  } catch (error) {
    return NextResponse.json({ hooks: buildLocalHooks("Error", "neutral", "social"), source: "Error fallback" });
  }
}

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
      } catch {
        // fall through to fenced parsing below
      }
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

function buildLocalTitles(topic, tone, style, audience, keywords) {
  const cleanTopic = topic.replace(/\s+/g, " ").trim();
  const keywordPool = keywords.length ? keywords : ["tips", "guide", "strategy", "ideas"];
  const audienceLabel = {
    viewers: "viewers",
    creators: "creators",
    beginners: "beginners",
    students: "students",
    professionals: "professionals",
  }[audience] || "viewers";

  const styleSets = {
    seo: [
      `${cleanTopic}: Best ${keywordPool[0]} Tips`,
      `${cleanTopic} Guide for ${audienceLabel}`,
      `How to Improve ${cleanTopic}`,
    ],
    howto: [
      `How to Do ${cleanTopic} Better`,
      `How I Approach ${cleanTopic}`,
      `How to Start with ${cleanTopic}`,
    ],
    listicle: [
      `7 ${cleanTopic} Ideas for ${audienceLabel}`,
      `5 ${keywordPool[0]} Ways to Improve ${cleanTopic}`,
      `10 ${cleanTopic} Mistakes to Avoid`,
    ],
    curiosity: [
      `Nobody Talks About This ${cleanTopic} Trick`,
      `What Happened When I Tried ${cleanTopic}`,
      `The ${keywordPool[0]} Secret Behind ${cleanTopic}`,
    ],
    shorts: [
      `${cleanTopic} in 60 Seconds`,
      `${cleanTopic} Hack You Need Today`,
      `The Fastest Way to Handle ${cleanTopic}`,
    ],
  };

  const toneSets = {
    curious: [`Can ${cleanTopic} Actually Help ${audienceLabel}?`, `I Tried ${cleanTopic} So You Don't Have To`],
    professional: [`${cleanTopic}: A Practical Guide`, `The Smart Way to Approach ${cleanTopic}`],
    energetic: [`Level Up Your ${cleanTopic} Game`, `${cleanTopic} Tips That Feel Instantly Useful`],
    bold: [`${cleanTopic} Is a Bigger Deal Than You Think`, `Why ${cleanTopic} Deserves More Attention`],
    friendly: [`A Simple ${cleanTopic} Guide`, `Easy ${cleanTopic} Ideas You Can Use Now`],
  };

  const base = [
    `${cleanTopic}`,
    `${cleanTopic}: ${keywordPool[0]} That Works`,
    `The ${keywordPool[1] || keywordPool[0]} Guide to ${cleanTopic}`,
    `${cleanTopic} for ${audienceLabel}`,
  ];

  return Array.from(new Set([
    ...styleSets[style],
    ...toneSets[tone],
    ...base,
  ])).slice(0, 10);
}

function buildPrompt({ topic, tone, style, audience, keywords }) {
  return [
    "You are a senior YouTube growth strategist and title writer.",
    "Write clickable but honest titles. Avoid clickbait that overpromises.",
    "Keep each title natural, punchy, and easy to read on mobile.",
    "Prefer strong verbs, curiosity, specificity, and clear benefits.",
    "Generate exactly 10 unique title ideas.",
    "Return ONLY valid JSON in this exact shape:",
    '{"titles":["...","..."]}',
    `Topic: ${topic}`,
    `Tone: ${tone}`,
    `Style: ${style}`,
    `Audience: ${audience}`,
    `Keywords: ${keywords.length ? keywords.join(", ") : "none"}`,
  ].join("\n");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const topic = normalize(body?.topic);
    const tone = ["curious", "professional", "energetic", "bold", "friendly"].includes(body?.tone) ? body.tone : "curious";
    const style = ["seo", "howto", "listicle", "curiosity", "shorts"].includes(body?.style) ? body.style : "seo";
    const audience = ["viewers", "creators", "beginners", "students", "professionals"].includes(body?.audience) ? body.audience : "viewers";
    const keywords = Array.isArray(body?.keywords)
      ? body.keywords.map((item) => normalize(item)).filter(Boolean).slice(0, 4)
      : [];
    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ titles: buildLocalTitles(topic, tone, style, audience, keywords), source: "Local fallback" });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.9,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You generate concise, high-quality YouTube titles. Keep them human, helpful, and likely to earn clicks without being misleading.",
          },
          {
            role: "user",
            content: buildPrompt({ topic, tone, style, audience, keywords }),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ titles: buildLocalTitles(topic, tone, style, audience, keywords), source: "Local fallback", error: "Groq request failed", details: errorText }, { status: 200 });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);
    const titles = Array.isArray(parsed?.titles) ? parsed.titles.map((item) => normalize(item)).filter(Boolean).slice(0, 10) : [];

    if (!titles.length) {
      return NextResponse.json({ titles: buildLocalTitles(topic, tone, style, audience, keywords), source: "Local fallback", error: "Groq response could not be parsed" }, { status: 200 });
    }

    return NextResponse.json({ titles, source: "Groq API" });
  } catch (error) {
    return NextResponse.json(
      {
        titles: buildLocalTitles(topic, tone, style, audience, keywords),
        source: "Local fallback",
        error: "API error - using local generation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
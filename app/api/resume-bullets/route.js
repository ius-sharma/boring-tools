const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function normalize(text) {
  return String(text ?? "").trim();
}

function buildPrompt(input, tone, count) {
  const toneGuidance = {
    ats: "ATS-friendly, concise, and keyword-aware",
    impact: "impact-focused and measurable",
    leadership: "leadership-oriented and outcome-driven",
    technical: "technical, clear, and precise",
  };

  return [
    "You are a resume writing assistant that rewrites rough work notes into strong resume bullets.",
    `Tone: ${toneGuidance[tone] || toneGuidance.impact}.`,
    `Generate exactly ${count} resume bullets.`,
    "Keep each bullet concise, specific, and professional.",
    "Prefer action verbs, metrics, and outcomes where possible.",
    "Return ONLY valid JSON in this exact shape:",
    '{"bullets":["...","..."]}',
    "Input notes:",
    input,
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
        // fall through to fenced-block parsing below
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

function buildLocalBullets(input, tone, count) {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const verbs = tone === "leadership" ? ["Led", "Coordinated", "Directed", "Mentored"] : tone === "technical" ? ["Built", "Optimized", "Implemented", "Automated"] : ["Improved", "Delivered", "Streamlined", "Reduced"];
  return Array.from({ length: count }, (_, index) => {
    const line = lines[index % Math.max(lines.length, 1)] || "key responsibility";
    const verb = verbs[index % verbs.length];
    return `${verb} ${line.toLowerCase()} to improve clarity, speed, and measurable impact.`;
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const input = normalize(body?.input);
    const tone = ["ats", "impact", "leadership", "technical"].includes(body?.tone) ? body.tone : "impact";
    const count = Math.min(6, Math.max(3, Number(body?.count) || 4));

    if (!input) {
      return Response.json({ error: "Input notes are required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ bullets: buildLocalBullets(input, tone, count), source: "Local fallback" });
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
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content:
              "You rewrite rough work notes into polished resume bullets. Avoid fluff, keep claims realistic, and keep the output useful for job applications.",
          },
          {
            role: "user",
            content: buildPrompt(input, tone, count),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: "Groq request failed", details: errorText }, { status: 502 });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);

    if (!parsed?.bullets || !Array.isArray(parsed.bullets)) {
      return Response.json({ bullets: buildLocalBullets(input, tone, count), source: "AI fallback" });
    }

    const bullets = parsed.bullets.map((bullet) => normalize(bullet)).filter(Boolean).slice(0, count);
    return Response.json({ bullets, source: "Groq API" });
  } catch (error) {
    return Response.json(
      { error: "Unexpected resume bullet generation failure", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
import { withAuthAndQuota } from "../../../lib/auth/withAuthAndQuota";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function normalize(text) {
  return String(text ?? "").trim();
}

function buildPrompt({ input, tone, count, jobDescription, refineBulletText, refineInstruction }) {
  const toneGuidance = {
    ats: "ATS-friendly, concise, and keyword-aware",
    impact: "impact-focused and measurable",
    leadership: "leadership-oriented and outcome-driven",
    technical: "technical, clear, and precise",
  };

  if (refineBulletText) {
    return [
      "You are a professional resume writing assistant.",
      "Your task is to refine a single resume bullet based on the provided instruction.",
      `Bullet to refine: "${refineBulletText}"`,
      `Instruction: "${refineInstruction || "Make it better"}"`,
      "Keep the result professional, concise, action-oriented, and highly polished.",
      "Return ONLY valid JSON in this exact shape:",
      '{"bullets":["refined bullet text"]}'
    ].join("\n");
  }

  const promptParts = [
    "You are a resume writing assistant that rewrites rough work notes into strong, professional resume bullets.",
  ];

  if (tone === "xyz") {
    promptParts.push(
      "Tone/Format: Google's XYZ Formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
      "IMPORTANT: If the input notes do not have specific metrics or numbers, insert clear placeholders in brackets (e.g., '[X%]', '[$Y]', '[number]') so the user knows where they need to provide quantitative data."
    );
  } else {
    promptParts.push(`Tone: ${toneGuidance[tone] || toneGuidance.impact}.`);
  }

  if (jobDescription) {
    promptParts.push(
      `Target Job Description:`,
      `"""`,
      jobDescription,
      `"""`,
      "IMPORTANT: Extract 3-5 critical keywords, skills, or technologies from the Job Description. Rewrite the bullets so they naturally and professionally incorporate these keywords without keyword stuffing. Return these extracted keywords in the \"matchedKeywords\" property of the JSON response."
    );
  }

  promptParts.push(
    `Generate exactly ${count} resume bullets.`,
    "Keep each bullet concise, specific, and professional.",
    "Prefer action verbs, metrics, and outcomes where possible.",
    "Return ONLY valid JSON in this exact shape:",
    jobDescription
      ? '{"bullets":["...","..."],"matchedKeywords":["...","..."]}'
      : '{"bullets":["...","..."]}',
    "Input notes:",
    input
  );

  return promptParts.join("\n");
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

function buildLocalBullets(input, tone, count, jobDescription = "") {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const verbs = tone === "leadership" ? ["Led", "Coordinated", "Directed", "Mentored"]
              : tone === "technical" ? ["Built", "Optimized", "Implemented", "Automated"]
              : tone === "xyz" ? ["Accomplished", "Delivered", "Improved", "Optimized"]
              : ["Improved", "Delivered", "Streamlined", "Reduced"];

  // Extract clean keywords from Job Description for mockup
  const extractedKeywords = jobDescription
    ? Array.from(new Set(jobDescription.split(/[^a-zA-Z]/).map(w => w.trim()).filter(w => w.length > 4)))
        .slice(0, 4)
    : [];

  const bullets = Array.from({ length: count }, (_, index) => {
    const line = lines[index % Math.max(lines.length, 1)] || "key responsibility";
    const verb = verbs[index % verbs.length];
    const kw = extractedKeywords.length > 0 ? ` using ${extractedKeywords[index % extractedKeywords.length]}` : "";

    if (tone === "xyz") {
      return `${verb} positive outcomes [X] by [Y%] through executing ${line.toLowerCase()}${kw} [Z].`;
    }
    return `${verb} ${line.toLowerCase()}${kw} to improve clarity, speed, and measurable impact.`;
  });

  return { bullets, matchedKeywords: extractedKeywords };
}

async function handlePost(request) {
  try {
    const body = await request.json();
    const input = normalize(body?.input);
    const tone = ["ats", "impact", "leadership", "technical", "xyz"].includes(body?.tone) ? body.tone : "impact";
    const count = Math.min(6, Math.max(3, Number(body?.count) || 4));
    const jobDescription = normalize(body?.jobDescription);
    const refineBulletText = normalize(body?.refineBulletText);
    const refineInstruction = normalize(body?.refineInstruction);

    if (!input && !refineBulletText) {
      return Response.json({ error: "Input notes or bullet to refine are required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      if (refineBulletText) {
        const refined = `Refined: ${refineBulletText} (Processed with ${refineInstruction || "local fallback"})`;
        return Response.json({ bullets: [refined], source: "Local fallback" });
      }
      const localResult = buildLocalBullets(input, tone, count, jobDescription);
      return Response.json({ bullets: localResult.bullets, matchedKeywords: localResult.matchedKeywords, source: "Local fallback" });
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
        messages: [
          {
            role: "system",
            content:
              "You rewrite rough work notes into polished resume bullets. Avoid fluff, keep claims realistic, and keep the output useful for job applications.",
          },
          {
            role: "user",
            content: buildPrompt({ input, tone, count, jobDescription, refineBulletText, refineInstruction }),
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
      if (refineBulletText) {
        return Response.json({ bullets: [refineBulletText], source: "AI fallback" });
      }
      const localResult = buildLocalBullets(input, tone, count, jobDescription);
      return Response.json({ bullets: localResult.bullets, matchedKeywords: localResult.matchedKeywords, source: "AI fallback" });
    }

    const bullets = parsed.bullets.map((bullet) => normalize(bullet)).filter(Boolean);
    const matchedKeywords = Array.isArray(parsed?.matchedKeywords)
      ? parsed.matchedKeywords.map((kw) => normalize(kw)).filter(Boolean)
      : [];

    return Response.json({
      bullets: refineBulletText ? bullets.slice(0, 1) : bullets.slice(0, count),
      matchedKeywords,
      source: "Groq API",
    });
  } catch (error) {
    return Response.json(
      { error: "Unexpected resume bullet generation failure", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export const POST = withAuthAndQuota({
  toolId: "resume-bullets",
  costInCredits: 1,
  allowGuestTrial: true,
  guestCost: 1,
}, handlePost);
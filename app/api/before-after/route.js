const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function buildPrompt(topic) {
  return [
    `You are "Before & After", an expert historical and technological analyst. Your goal is to analyze any invention, breakthrough, historical event, or scientific discovery by comparing life BEFORE and AFTER it occurred.`,
    `Analyze the following topic:`,
    `TOPIC: "${topic}"`,
    ``,
    `Instructions:`,
    `1. Identify the topic's category (e.g., Technology, Infrastructure, Science, Medicine, History, etc.) and write a brief summary of how it changed the world.`,
    `2. Generate exactly 3 key quantitative or qualitative metrics or transitions comparing before vs after. For example:`,
    `   - Label: "Global Connectivity", beforeValue: "< 0.1% (1990)", afterValue: "67% (~5.4 Billion)"`,
    `3. Compare life before and after this topic across exactly 7 categories, providing 1 descriptive sentence for 'before' and 1 descriptive sentence for 'after' in each:`,
    `   - dailyLife`,
    `   - communication`,
    `   - education`,
    `   - business`,
    `   - transportation`,
    `   - technology`,
    `   - society`,
    `4. Outline the impact profile: exactly 3 biggest winners and exactly 3 biggest losers.`,
    `5. Detail exactly 3 positive unexpected consequences and exactly 3 negative unexpected consequences.`,
    `6. Construct a 4-step chronological timeline mapping these exact stages:`,
    `   - "Before": life prior to the breakthrough`,
    `   - "Major Event": the key invention, date, or event that triggered the shift`,
    `   - "Immediate Impact": what happened right after (e.g., initial years/decades)`,
    `   - "Long-Term Impact": the new normalized state`,
    `7. Provide exactly 2 or 3 fascinating fun facts about this topic.`,
    ``,
    `Return ONLY a valid JSON response in this exact format. Do not wrap it in markdown code blocks unless it is fenced with \`\`\`json, do not include introductory text, and do not add any commentary outside the JSON:`,
    `{`,
    `  "title": "Title of the topic (e.g. Internet)",`,
    `  "category": "Category name (e.g. Technology)",`,
    `  "summary": "Summary of how it changed the world...",`,
    `  "stats": [`,
    `    { "label": "Metric Label", "beforeValue": "...", "afterValue": "..." },`,
    `    { "label": "Metric Label", "beforeValue": "...", "afterValue": "..." },`,
    `    { "label": "Metric Label", "beforeValue": "...", "afterValue": "..." }`,
    `  ],`,
    `  "comparisons": {`,
    `    "dailyLife": { "before": "...", "after": "..." },`,
    `    "communication": { "before": "...", "after": "..." },`,
    `    "education": { "before": "...", "after": "..." },`,
    `    "business": { "before": "...", "after": "..." },`,
    `    "transportation": { "before": "...", "after": "..." },`,
    `    "technology": { "before": "...", "after": "..." },`,
    `    "society": { "before": "...", "after": "..." }`,
    `  },`,
    `  "winners": ["winner 1", "winner 2", "winner 3"],`,
    `  "losers": ["loser 1", "loser 2", "loser 3"],`,
    `  "consequences": {`,
    `    "positive": ["consequence 1", "consequence 2", "consequence 3"],`,
    `    "negative": ["consequence 1", "consequence 2", "consequence 3"]`,
    `  },`,
    `  "timeline": [`,
    `    { "stage": "Before", "text": "..." },`,
    `    { "stage": "Major Event", "text": "..." },`,
    `    { "stage": "Immediate Impact", "text": "..." },`,
    `    { "stage": "Long-Term Impact", "text": "..." }`,
    `  ],`,
    `  "funFacts": ["fun fact 1", "fun fact 2", "fun fact 3"]`,
    `}`
  ].join("\n");
}

function safeParseJson(content) {
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    const fenced = content.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] || content.match(/```\s*([\s\S]*?)\s*```/)?.[1];
    if (!fenced) return null;

    try {
      return JSON.parse(fenced);
    } catch {
      return null;
    }
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic || !topic.trim()) {
      return Response.json({ error: "No topic provided" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Groq API key not configured" }, { status: 503 });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.6,
        max_tokens: 1800,
        messages: [
          {
            role: "system",
            content: "You are a professional historical and technological comparison assistant called Before & After. You help users compare how breakthroughs changed daily life, communication, education, business, transportation, technology, and society. You provide structured JSON output matching the requested schema exactly.",
          },
          {
            role: "user",
            content: buildPrompt(topic),
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

    // Validate structure of parsed JSON
    if (
      !parsed ||
      !parsed.title ||
      !parsed.category ||
      !parsed.summary ||
      !parsed.stats ||
      parsed.stats.length !== 3 ||
      !parsed.comparisons ||
      !parsed.comparisons.dailyLife ||
      !parsed.comparisons.communication ||
      !parsed.comparisons.education ||
      !parsed.comparisons.business ||
      !parsed.comparisons.transportation ||
      !parsed.comparisons.technology ||
      !parsed.comparisons.society ||
      !parsed.winners ||
      !parsed.losers ||
      !parsed.consequences ||
      !parsed.consequences.positive ||
      !parsed.consequences.negative ||
      !parsed.timeline ||
      parsed.timeline.length !== 4 ||
      !parsed.funFacts
    ) {
      return Response.json({ error: "Groq response could not be parsed as structured JSON" }, { status: 502 });
    }

    return Response.json(parsed);
  } catch (error) {
    return Response.json(
      { error: "Unexpected generation failure", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function buildPrompt(topic) {
  return [
    `You are "History Repeats", an expert historical analyst. Your goal is to help users understand how a current modern event, situation, or trend resembles a major historical event.`,
    `Analyze the following modern topic/situation:`,
    `TOPIC: "${topic}"`,
    ``,
    `Instructions:`,
    `1. Identify the most fitting historical parallel/event that resembles this modern topic.`,
    `2. Deconstruct the comparison into the following 6 sections:`,
    `   - Similar Historical Event: The name of the event and its time period.`,
    `   - What Happened Then: A concise historical narrative (1-2 paragraphs) of what transpired during the historical event.`,
    `   - Similarities: Exactly 3 or 4 points of intersection/parallels between then and now.`,
    `   - Differences: Exactly 3 points of divergence (e.g. scale of technology, modern regulatory frameworks, speed of propagation).`,
    `   - Lessons Learned: Exactly 3 structural lessons that society, leaders, or builders can take away from how the past event played out.`,
    `   - Key Takeaways: Exactly 2 highly practical, individual-level personal takeaways for a person living through the modern counterpart today.`,
    `3. Design a comparative timeline mapping 4 distinct chronological stages from both sides:`,
    `   - Stage 1: Origin / Genesis`,
    `   - Stage 2: Disruption Peak / Climax`,
    `   - Stage 3: Regulation / Social Friction / Adaptation`,
    `   - Stage 4: New Equilibrium / Long-term Normalization`,
    `   For each stage, specify:`,
    `     - "stage": the stage name (e.g., "1. Origin")`,
    `     - "historyYear": the year or period for the historical event`,
    `     - "historyText": what happened in history at this stage`,
    `     - "modernYear": the year or period for the modern event`,
    `     - "modernText": what is happening now or expected to happen at this stage`,
    `4. Return ONLY a valid JSON response in this exact format. Do not wrap it in markdown code blocks unless it is fenced with \`\`\`json, do not include introductory text, and do not add any commentary outside the JSON:`,
    `{`,
    `  "historicalEvent": "Name of similar historical event",`,
    `  "historicalPeriod": "Time period of historical event",`,
    `  "summary": "One or two sentences summarising the overall parallel between the modern topic and this historical event...",`,
    `  "whatHappened": "Historical narrative detailing what happened then...",`,
    `  "similarities": ["similarity 1", "similarity 2", "similarity 3", "similarity 4"],`,
    `  "differences": ["difference 1", "difference 2", "difference 3"],`,
    `  "lessonsLearned": ["lesson 1", "lesson 2", "lesson 3"],`,
    `  "takeaways": ["takeaway 1", "takeaway 2"],`,
    `  "timeline": [`,
    `    {`,
    `      "stage": "1. Origin",`,
    `      "historyYear": "1800s",`,
    `      "historyText": "...",`,
    `      "modernYear": "2010s",`,
    `      "modernText": "..."`,
    `    },`,
    `    {`,
    `      "stage": "2. Disruption Peak",`,
    `      "historyYear": "...",`,
    `      "historyText": "...",`,
    `      "modernYear": "...",`,
    `      "modernText": "..."`,
    `    },`,
    `    {`,
    `      "stage": "3. Adaptation",`,
    `      "historyYear": "...",`,
    `      "historyText": "...",`,
    `      "modernYear": "...",`,
    `      "modernText": "..."`,
    `    },`,
    `    {`,
    `      "stage": "4. Equilibrium",`,
    `      "historyYear": "...",`,
    `      "historyText": "...",`,
    `      "modernYear": "...",`,
    `      "modernText": "..."`,
    `    }`,
    `  ]`,
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
        temperature: 0.7,
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content: "You are a professional historical analogy assistant called History Repeats. You help users compare modern topics to historical events. You provide structured JSON output matching the requested schema exactly.",
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

    if (
      !parsed ||
      !parsed.historicalEvent ||
      !parsed.historicalPeriod ||
      !parsed.summary ||
      !parsed.whatHappened ||
      !parsed.similarities ||
      !parsed.differences ||
      !parsed.lessonsLearned ||
      !parsed.takeaways ||
      !parsed.timeline ||
      parsed.timeline.length !== 4
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

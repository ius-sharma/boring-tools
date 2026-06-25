const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function buildPrompt(problem, context, category) {
  return [
    `You are "Second Mind", an expert psychological and cognitive reframing utility. Your goal is to analyze the user's situation/dilemma from four distinct cognitive perspectives:`,
    `1. Logical Mind: Objective, rational, probability-focused, identifying cognitive biases (like sunk cost fallacy, loss aversion, status quo bias) and cost-benefit trade-offs.`,
    `2. Future Self: 10-year long-term projection, focusing on legacy, personal growth, regret minimization, and compound effects of habits.`,
    `3. Risk Perspective: Defensive, cautious, worst-case scenarios, identifying irreversible decisions (one-way doors), and planning a Plan B / margin of safety.`,
    `4. Opportunity Perspective: Growth-oriented, identifying asymmetric upside (capped downside, unlimited upside potential), learning loops, and leverage.`,
    ``,
    `Here is the user's situation:`,
    `PROBLEM: "${problem}"`,
    `CONTEXT: "${context || "None provided"}"`,
    `CATEGORY FOCUS: "${category}"`,
    ``,
    `Instructions:`,
    `1. Analyze the situation deeply, writing clear, practical, and highly empathetic analysis paragraphs. Avoid generic chatbot phrasing and instead integrate specific details of the user's problem.`,
    `2. For each perspective, return:`,
    `   - A detailed "analysis" string (1-2 paragraphs, around 80-150 words). Make it specific to the facts and variables of the problem and context!`,
    `   - Exactly three "concerns" (highly specific bullet points matching the perspective).`,
    `   - Exactly three "questions" (deep, reflective questions the user should ask themselves).`,
    `3. Return ONLY a valid JSON response in this exact format, with no markdown code blocks (except optional JSON fencing), no introductory text, and no commentary:`,
    `{`,
    `  "logical": {`,
    `    "analysis": "logical analysis paragraph...",`,
    `    "concerns": ["concern 1", "concern 2", "concern 3"],`,
    `    "questions": ["question 1", "question 2", "question 3"]`,
    `  },`,
    `  "future": {`,
    `    "analysis": "future self paragraph...",`,
    `    "concerns": ["concern 1", "concern 2", "concern 3"],`,
    `    "questions": ["question 1", "question 2", "question 3"]`,
    `  },`,
    `  "risk": {`,
    `    "analysis": "risk analysis paragraph...",`,
    `    "concerns": ["concern 1", "concern 2", "concern 3"],`,
    `    "questions": ["question 1", "question 2", "question 3"]`,
    `  },`,
    `  "opportunity": {`,
    `    "analysis": "opportunity analysis paragraph...",`,
    `    "concerns": ["concern 1", "concern 2", "concern 3"],`,
    `    "questions": ["question 1", "question 2", "question 3"]`,
    `  }`,
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
    const { problem, context, category } = body;

    if (!problem || !problem.trim()) {
      return Response.json({ error: "No problem text provided" }, { status: 400 });
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
        temperature: 0.75,
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content: "You are a professional cognitive reframing assistant called Second Mind. You help users look at their problems from multiple perspectives (Logical Mind, Future Self, Risk Perspective, Opportunity Perspective). You provide structured JSON output matching the requested schema exactly.",
          },
          {
            role: "user",
            content: buildPrompt(problem, context, category),
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
      !parsed.logical ||
      !parsed.future ||
      !parsed.risk ||
      !parsed.opportunity
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

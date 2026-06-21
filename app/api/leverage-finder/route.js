const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function buildPrompt(goal, time, resources, situation) {
  return [
    `Analyze the following goal, constraints, and situation to identify the highest leverage focus areas:`,
    `---`,
    `GOAL:`,
    goal,
    `---`,
    `AVAILABLE TIME:`,
    time,
    `---`,
    `AVAILABLE RESOURCES:`,
    resources,
    `---`,
    `CURRENT SITUATION / FRICTION:`,
    situation,
    `---`,
    `Instructions:`,
    `1. Classify the endeavor into one of these categories: "business", "career", "learning", "health", "finance", "creative", or "general".`,
    `2. Determine a themeColor matching the category:`,
    `   - business: "amber"`,
    `   - career: "blue"`,
    `   - learning: "emerald"`,
    `   - health: "rose"`,
    `   - finance: "indigo"`,
    `   - creative: "purple"`,
    `   - general: "slate"`,
    `3. Calculate a "Leverage Score" (an integer from 30 to 100) representing how focused and high-leverage the user's plan is under these time and resource constraints.`,
    `4. Write a concise "summary" synthesizing the goal, resources, and situation, identifying the biggest structural bottleneck.`,
    `5. Provide exactly three "actions" (Top 3 high-leverage activities) sorted from highest leverage to lowest.`,
    `   - Each action must have a "title", a brief "focus" sentence, a "difficulty" ("Easy", "Medium", or "Hard"), and exactly three concrete, step-by-step implementation instructions.`,
    `   - The actions must utilize the user's input resources and address the specific situation constraints.`,
    `6. Provide three "pitfalls" (low-value distractions or chores they must AVOID focusing on at first).`,
    `7. Provide a "priority" ranking detailing the "highest" priority (do first), "medium" priority (do next), and "lowest" priority (defer/avoid).`,
    `8. Provide a focus timeline with recommendations for "today", "thisWeek", and "thisMonth".`,
    `9. Return ONLY a valid JSON response in this exact format with no additional text, explanation, or markdown wrapper:`,
    `{`,
    `  "category": "business",`,
    `  "categoryName": "Business & Side Hustle",`,
    `  "themeColor": "amber",`,
    `  "score": 85,`,
    `  "summary": "Goal summary text...",`,
    `  "actions": [`,
    `    {`,
    `      "title": "Action 1 Title",`,
    `      "focus": "Focus description",`,
    `      "difficulty": "Easy",`,
    `      "steps": ["Step 1", "Step 2", "Step 3"]`,
    `    },`,
    `    {`,
    `      "title": "Action 2 Title",`,
    `      "focus": "Focus description",`,
    `      "difficulty": "Medium",`,
    `      "steps": ["Step 1", "Step 2", "Step 3"]`,
    `    },`,
    `    {`,
    `      "title": "Action 3 Title",`,
    `      "focus": "Focus description",`,
    `      "difficulty": "Hard",`,
    `      "steps": ["Step 1", "Step 2", "Step 3"]`,
    `    }`,
    `  ],`,
    `  "pitfalls": [`,
    `    "Pitfall 1",`,
    `    "Pitfall 2",`,
    `    "Pitfall 3"`,
    `  ],`,
    `  "priority": {`,
    `    "highest": "Highest priority task",`,
    `    "medium": "Medium priority task",`,
    `    "lowest": "Lowest priority task"`,
    `  },`,
    `  "timeline": {`,
    `    "today": "Today's action step",`,
    `    "thisWeek": "This week's focus step",`,
    `    "thisMonth": "This month's milestone"`,
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
    const { goal, time, resources, situation } = body;

    if (!goal || !goal.trim()) {
      return Response.json({ error: "No goal text provided" }, { status: 400 });
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
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a strategic leverage planner. You analyze goals, resources, and situations to separate the vital few actions from the trivial many distractions. You return responses strictly in structured JSON format.",
          },
          {
            role: "user",
            content: buildPrompt(goal, time, resources, situation),
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

    if (!parsed || !parsed.summary || !Array.isArray(parsed.actions)) {
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

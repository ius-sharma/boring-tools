const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function buildPrompt(todos, roastLevel) {
  const levelGuidance = {
    mild: "light, playful, and encouraging",
    medium: "witty, mildly sarcastic, and still motivating",
    savage: "sharp but not offensive, with a practical next step",
  };

  return [
    "You are a fun productivity assistant that roasts to-do items in a playful, non-abusive way.",
    `Tone: ${levelGuidance[roastLevel] || levelGuidance.medium}.`,
    "For every todo, return one roast line and one practical next action.",
    "Keep each roast short, fresh, and specific to the task.",
    "Return ONLY valid JSON in this exact shape:",
    '{"items":[{"todo":"...","roast":"...","action":"..."}]}',
    "Todos:",
    ...todos.map((todo, index) => `${index + 1}. ${todo}`),
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
    const todos = Array.isArray(body?.todos) ? body.todos.map((item) => String(item).trim()).filter(Boolean) : [];
    const roastLevel = ["mild", "medium", "savage"].includes(body?.roastLevel) ? body.roastLevel : "medium";

    if (!todos.length) {
      return Response.json({ error: "No todos provided" }, { status: 400 });
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
        temperature: 0.8,
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content:
              "You generate fun, productivity-friendly roasts. Avoid profanity, hate, harassment, or anything cruel. Keep it playful and useful.",
          },
          {
            role: "user",
            content: buildPrompt(todos, roastLevel),
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

    if (!parsed?.items || !Array.isArray(parsed.items)) {
      return Response.json({ error: "Groq response could not be parsed" }, { status: 502 });
    }

    const items = parsed.items
      .map((item, index) => ({
        todo: String(item?.todo || todos[index] || "Untitled task").trim(),
        roast: String(item?.roast || "This task needs your attention.").trim(),
        action: String(item?.action || "Start with a tiny next step.").trim(),
      }))
      .filter((item) => item.todo);

    return Response.json({ items });
  } catch (error) {
    return Response.json(
      { error: "Unexpected roast generation failure", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

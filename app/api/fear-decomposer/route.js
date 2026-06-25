const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function buildPrompt(fear) {
  return [
    `You are "Fear Decomposer", a cognitive reframing assistant built for the Boring Tools collection. Your purpose is to help users break down their fears into actionable, structured parts using "Fear Setting" principles.`,
    ``,
    `Here is the user's fear or obstacle description:`,
    `FEAR: "${fear}"`,
    ``,
    `Instructions:`,
    `1. Decompose this fear objectively, logically, and with high empathy. Avoid generic conversational fluff (e.g., "Sure, here is your breakdown") and make the text highly specific to the user's input.`,
    `2. Deconstruct the fear into these six specific sections:`,
    `   - "realRisks": An array of 2 to 4 tangible, practical risks, costs, or actual challenges (e.g. financial capital spent, time committed, lack of specific skill).`,
    `   - "imaginedRisks": An array of 2 to 4 exaggerated fears, cognitive distortions, catastrophizing, or emotional anxieties that are highly unlikely or amplified by fear.`,
    `   - "controllableFactors": An array of 2 to 4 things under their direct control (e.g. preparation, mock practice, financial budget caps, schedule limits, habits).`,
    `   - "uncontrollableFactors": An array of 2 to 4 things outside their control that they must accept, navigate, or delegate (e.g. general economy, interviewer moods, audience sizes, competitor reactions).`,
    `   - "worstCase": A well-reasoned paragraph (2-4 sentences, around 50-80 words) describing the absolute baseline scenario if things go completely wrong, written in a way that shows how the damage is temporary, manageable, and how they can recover/rebuild.`,
    `   - "firstStep": A single, high-leverage, low-stress action (1-2 sentences) they can complete in 15 minutes to break inertia and build momentum.`,
    `3. Return ONLY a valid JSON response in this exact format with no markdown blocks, no introductory text, and no commentary:`,
    `{`,
    `  "realRisks": ["real risk 1", "real risk 2", ...],`,
    `  "imaginedRisks": ["imagined risk 1", "imagined risk 2", ...],`,
    `  "controllableFactors": ["controllable factor 1", "controllable factor 2", ...],`,
    `  "uncontrollableFactors": ["uncontrollable factor 1", "uncontrollable factor 2", ...],`,
    `  "worstCase": "worst case scenario and recovery plan text...",`,
    `  "firstStep": "first small step description..."`,
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
    const { fear } = body;

    if (!fear || !fear.trim()) {
      return Response.json({ error: "No fear description provided" }, { status: 400 });
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
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: "You are a professional cognitive reframing assistant called Fear Decomposer. You help users deconstruct their anxieties into structured analysis models. You output only valid JSON matching the requested schema.",
          },
          {
            role: role => "user", // Workaround for typing, or just use string
            role: "user",
            content: buildPrompt(fear),
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
      !Array.isArray(parsed.realRisks) ||
      !Array.isArray(parsed.imaginedRisks) ||
      !Array.isArray(parsed.controllableFactors) ||
      !Array.isArray(parsed.uncontrollableFactors) ||
      typeof parsed.worstCase !== "string" ||
      typeof parsed.firstStep !== "string"
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

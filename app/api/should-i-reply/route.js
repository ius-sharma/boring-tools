const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function buildPrompt(message, context, relationship, vibe, urgency, mood) {
  return [
    `Analyze if, when, and how the user should reply to this message.`,
    `---`,
    `MESSAGE:`,
    message,
    `---`,
    `CONTEXT:`,
    context || "None provided",
    `---`,
    `ADDITIONAL METADATA:`,
    `- Sender relationship: ${relationship}`,
    `- Message tone/vibe: ${vibe}`,
    `- Response urgency: ${urgency}`,
    `- User's current mood/state: ${mood}`,
    `---`,
    `Instructions:`,
    `1. Provide a recommendation. It must be exactly one of: "Reply now", "Reply later", "Ignore", or "Needs clarification".`,
    `2. Provide exactly three concise, highly specific reasoning bullet points explaining why. Do not use generic statements. Include a blend of practical advice and witty, fun tone.`,
    `3. Provide a single "Suggested Next Action" (e.g. "Wait 20 minutes, draft in notepad first, then send", "Delete, block, and make some coffee").`,
    `4. Provide three canned reply templates tailored to this scenario (e.g. "Professional/Polite", "Casual", "Boundary-setting" or similar fitting names depending on recommendation).`,
    `5. CRITICAL: The templates must feel extremely genuine, human, and tailored directly to the specific facts of the incoming MESSAGE and CONTEXT.`,
    `   - DO NOT use generic template brackets or placeholders like "[Name]", "[Time]", "[factual response]", "[Status]", or "[Action]".`,
    `   - Instead, dynamically fill in realistic details based on the input! For example, if the sender is asking for 'green sweater', the template must mention 'sweater' or 'clothes'. If the user's context says they will reply on 'Monday', write 'Monday' in the message itself.`,
    `   - The tone of the replies must sound like a real person typed them on their phone or laptop, not like a corporate chatbot template. Avoid repetitive openings (e.g. don't start every template with 'Hi [Name], thanks for...').`,
    `6. Return ONLY a valid JSON response in this exact format, with no other text, markdown blocks, or commentary:`,
    `{`,
    `  "recommendation": "Reply now",`,
    `  "reasoningPoints": [`,
    `    "reasoning point 1",`,
    `    "reasoning point 2",`,
    `    "reasoning point 3"`,
    `  ],`,
    `  "nextAction": "suggested next action",`,
    `  "templates": [`,
    `    { "title": "Template Title", "text": "Template Text" },`,
    `    { "title": "Template Title", "text": "Template Text" },`,
    `    { "title": "Template Title", "text": "Template Text" }`,
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
    const { message, context, relationship, vibe, urgency, mood } = body;

    if (!message || !message.trim()) {
      return Response.json({ error: "No message text provided" }, { status: 400 });
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
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content: "You are an empathetic, witty, and highly practical communication advisor. You hate robotic, template-like responses. When generating templates, you write exactly how a real human would text or email in that specific situation—incorporating specific names, objects, times, or issues mentioned in the message and context, rather than using generic text or bracketed placeholders.",
          },
          {
            role: "user",
            content: buildPrompt(message, context, relationship, vibe, urgency, mood),
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

    if (!parsed || !parsed.recommendation || !Array.isArray(parsed.reasoningPoints)) {
      return Response.json({ error: "Groq response could not be parsed as structured JSON" }, { status: 502 });
    }

    // Ensure recommendation is valid format
    const validRecs = ["Reply now", "Reply later", "Ignore", "Needs clarification"];
    if (!validRecs.includes(parsed.recommendation)) {
      parsed.recommendation = "Reply later";
    }

    return Response.json(parsed);
  } catch (error) {
    return Response.json(
      { error: "Unexpected generation failure", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

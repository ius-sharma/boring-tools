const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function buildPrompt(emailText) {
  return [
    `Analyze the following email to help the user understand its meaning, tone, key points, subtext, and recommended responses.`,
    `---`,
    `EMAIL CONTENT:`,
    emailText,
    `---`,
    `Instructions:`,
    `1. Detect the primary emotional tone of the email. It must be exactly one of the following: "Professional", "Friendly", "Neutral", "Urgent", "Rejection", or "Opportunity".`,
    `2. Provide a short, clear summary (1-2 sentences) of what the email means in plain English.`,
    `3. Extract a list of explicit requests found in the email. Format as an array of strings. If none, return an empty array or a single string explaining none found.`,
    `4. Extract any deadlines mentioned in the email (explicit or implicit). Format as an array of strings. If none, return an empty array.`,
    `5. Define any required action commands the user needs to perform. Format as an array of strings.`,
    `6. Explain the likely intent or subtext behind the email (the "Hidden Meaning"). Read between the lines. Keep it insightful, realistic, and highly practical.`,
    `7. Provide a recommended response strategy. It must be exactly one of: "Reply", "Follow Up", "Ignore", or "Wait".`,
    `8. Provide two canned reply templates tailored directly to this scenario (e.g. "Professional Acceptance", "Polite Pass", "Clarification Request" etc.).`,
    `   - CRITICAL: The templates must feel extremely genuine, human, and tailored directly to the specific facts of the incoming email.`,
    `   - DO NOT use generic template brackets or placeholders like "[Name]", "[Time]", "[factual response]", "[Status]", or "[Action]".`,
    `   - Instead, dynamically fill in realistic details based on the input email.`,
    `   - The tone of the replies must sound like a real person typed them. Avoid repetitive corporate chatbot language.`,
    `9. Return ONLY a valid JSON response in this exact format, with no other text, markdown blocks, or commentary:`,
    `{`,
    `  "tone": "Opportunity",`,
    `  "summary": "Short explanation of the email.",`,
    `  "requests": ["Request 1", "Request 2"],`,
    `  "deadlines": ["Deadline 1"],`,
    `  "actions": ["Action 1"],`,
    `  "hiddenMeaning": "Detailed explanation of intent and subtext.",`,
    `  "recommendation": "Reply",`,
    `  "templates": [`,
    `    { "title": "Template Title 1", "text": "Template Text 1" },`,
    `    { "title": "Template Title 2", "text": "Template Text 2" }`,
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
    const { emailText } = body;

    if (!emailText || !emailText.trim()) {
      return Response.json({ error: "No email text provided" }, { status: 400 });
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
            content: "You are an expert communications strategist and subtext decoder. You analyze emails to reveal their true emotional undertone, hidden agenda, and next actions. You hate robotic, template-like placeholders. You write actual sample drafts matching the situation.",
          },
          {
            role: "user",
            content: buildPrompt(emailText),
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

    if (!parsed || !parsed.tone || !parsed.summary || !parsed.recommendation) {
      return Response.json({ error: "Groq response could not be parsed as structured JSON" }, { status: 502 });
    }

    // Validate and sanitize the tone
    const validTones = ["Professional", "Friendly", "Neutral", "Urgent", "Rejection", "Opportunity"];
    if (!validTones.includes(parsed.tone)) {
      parsed.tone = "Neutral";
    }

    // Validate and sanitize the recommendation
    const validRecs = ["Reply", "Follow Up", "Ignore", "Wait"];
    if (!validRecs.includes(parsed.recommendation)) {
      parsed.recommendation = "Reply";
    }

    return Response.json(parsed);
  } catch (error) {
    return Response.json(
      { error: "Unexpected generation failure", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

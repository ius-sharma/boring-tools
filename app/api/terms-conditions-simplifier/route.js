import { withAuthAndQuota } from "../../../lib/auth/withAuthAndQuota";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function buildPrompt(legalText) {
  return [
    `Analyze the following legal text (Terms & Conditions, Privacy Policy, End User Agreement, or Contract) and simplify it into plain, transparent, human-readable language.`,
    `---`,
    `LEGAL TEXT:`,
    legalText,
    `---`,
    `Instructions:`,
    `1. Provide a short, crystal-clear "summary" (2-3 sentences) explaining the main purpose of this agreement and what the user is agreeing to.`,
    `2. Extract 3 to 5 "importantPoints" highlighting major terms, governing laws, account terms, or notable rules.`,
    `3. Extract 3 to 5 "obligations" listing what the user is required to do, pay, maintain, or refrain from doing.`,
    `4. Extract 3 to 5 "risks" identifying potential traps, hidden costs, automatic renewals, mandatory arbitration, limitation of liability, account termination clauses, or data selling/sharing risks.`,
    `5. Extract 3 to 5 "permissions" detailing what rights or licenses the user grants to the service (e.g. data collection, content usage license, third-party tracking).`,
    `6. Write every bullet point in active, simple, everyday English. Avoid legalese, jargon, and vague summaries. Be direct, clear, and informative.`,
    `7. Return ONLY a valid JSON object matching this exact schema with no markdown code block wrapper or extra text:`,
    `{`,
    `  "summary": "A clear 2-3 sentence overview...",`,
    `  "importantPoints": ["Point 1", "Point 2", "Point 3"],`,
    `  "obligations": ["Obligation 1", "Obligation 2", "Obligation 3"],`,
    `  "risks": ["Risk 1", "Risk 2", "Risk 3"],`,
    `  "permissions": ["Permission 1", "Permission 2", "Permission 3"]`,
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

async function handlePost(request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return Response.json({ error: "No legal text provided" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Groq API key not configured" }, { status: 503 });
    }

    // Limit text length sent to API to avoid extreme token limits while keeping full context
    const maxChars = 24000;
    const truncatedInput = text.length > maxChars ? text.slice(0, maxChars) + "\n...[truncated for length]" : text;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.3,
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content: "You are an expert legal document analyst and plain-language simplifier. You help users understand terms, policies, and contracts by outputting structured JSON with plain English explanations.",
          },
          {
            role: "user",
            content: buildPrompt(truncatedInput),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: "Groq request failed", details: errorText }, { status: 502 });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    const parsed = safeParseJson(rawContent);

    if (!parsed || !parsed.summary) {
      return Response.json({ error: "Failed to parse legal analysis output" }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: {
        summary: String(parsed.summary || "").trim(),
        importantPoints: Array.isArray(parsed.importantPoints) ? parsed.importantPoints.map(String).filter(Boolean) : [],
        obligations: Array.isArray(parsed.obligations) ? parsed.obligations.map(String).filter(Boolean) : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks.map(String).filter(Boolean) : [],
        permissions: Array.isArray(parsed.permissions) ? parsed.permissions.map(String).filter(Boolean) : [],
      },
    });
  } catch (error) {
    return Response.json({ error: "Server error analyzing legal text", details: error.message }, { status: 500 });
  }
}

export const POST = withAuthAndQuota({
  toolId: "terms-conditions-simplifier",
  costInCredits: 1,
  allowGuestTrial: true,
  guestCost: 1,
}, handlePost);


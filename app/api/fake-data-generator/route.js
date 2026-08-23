import { withAuthAndQuota } from "../../../lib/auth/withAuthAndQuota";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function buildPrompt(columns, count, country) {
  return [
    `You are an expert data generation agent. Your goal is to generate highly realistic, coherent, and localized mock datasets.`,
    `Generate exactly ${count} records matching the columns described below, localized to the country: "${country}".`,
    ``,
    `Columns specification:`,
    JSON.stringify(columns, null, 2),
    ``,
    `Instructions:`,
    `1. Localize names, phone numbers, addresses, states, cities, and postal codes to "${country}". If "${country}" is "Random", choose a single realistic country for the entire dataset or mix them sensibly.`,
    `2. Keep the fields coherent within each record. For example:`,
    `   - A female first name should have a matching gender ("Female").`,
    `   - An email address should correspond to the generated first/last name.`,
    `   - The city, state, postal code, and latitude/longitude should represent actual physical locations within that country.`,
    `3. For custom columns, pay close attention to their type and options. If options are comma-separated values (e.g. "A,B,C"), randomly select one. If options are a numeric range (e.g. "1,100"), generate a number within that range.`,
    `4. Return exactly ${count} objects inside a JSON array.`,
    ``,
    `Return ONLY a valid JSON response in this exact format. Do not wrap it in markdown code blocks unless it is fenced with \`\`\`json, do not include introductory text, and do not add any commentary outside the JSON:`,
    `{`,
    `  "data": [`,
    `    {`,
    `      /* record fields matching the requested column ids */`,
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

async function handlePost(request) {
  try {
    const body = await request.json();
    const { columns, count, country } = body;

    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return Response.json({ error: "No columns specified" }, { status: 400 });
    }

    const targetCount = Math.min(Number(count) || 10, 50); // Capped at 50 for performance and token limits

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Groq API key not configured on server. Please set GROQ_API_KEY in your .env file." }, { status: 503 });
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
        max_tokens: 4000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a professional mock data generator. You generate realistic mock database records in JSON format matching the schema exactly.",
          },
          {
            role: "user",
            content: buildPrompt(columns, targetCount, country),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: "Groq request failed", details: errorText }, { status: 502 });
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);

    if (!parsed || !Array.isArray(parsed.data)) {
      return Response.json({ error: "Groq response could not be parsed as structured dataset JSON" }, { status: 502 });
    }

    // Attach row _ids for local frontend tracking
    const finalData = parsed.data.map((row, idx) => ({
      _id: idx + 1,
      ...row
    }));

    return Response.json({ data: finalData });
  } catch (error) {
    return Response.json(
      { error: "Unexpected generation failure", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export const POST = withAuthAndQuota({
  toolId: "fake-data-generator",
  costInCredits: 1,
  allowGuestTrial: true,
  guestCost: 1,
}, handlePost);

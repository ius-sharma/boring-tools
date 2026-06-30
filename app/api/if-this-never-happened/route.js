const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function buildPrompt(topic) {
  return [
    `You are "If This Never Happened", an expert historical and counterfactual analyst. Your goal is to help users explore alternate history by simulating how the world might look today if a major historical event, invention, discovery, or technological breakthrough had never happened.`,
    `Analyze the following topic/event that did NOT happen:`,
    `TOPIC: "${topic}"`,
    ``,
    `Instructions:`,
    `1. Carefully analyze the specific input topic. Understand what it is, when it occurred in real history, its primary utility, its secondary connections, and how society, science, technology, and politics rely on it today.`,
    `2. Imagine a detailed, logically consistent counterfactual world where this breakthrough or event never occurred. What would fill the void? What alternative technologies or social structures would be optimized instead?`,
    `3. Deconstruct the alternate timeline into the requested JSON schema. Every field must contain highly specific, bespoke details. Do NOT use generic placeholders (like 'Missing Tech 1', 'Domain 1', 'Baseline state', or 'Alternate state').`,
    `4. Keep the icon field as one of the following exact string values: "war", "globe", "lightbulb", "book", "phone", "satellite", "plant", "circle", "flag", "needle", "flame", "rocket". Select the most appropriate icon matching the topic.`,
    `5. The "cards" array MUST compare three distinct, highly relevant sub-domains (e.g. if the input is "Smartphones", the cards could represent "Social Gathering", "Logistics", and "Navigation"). Provide concrete descriptions of the modern baseline world vs. this alternate world for each card.`,
    `6. The "rippleEffects" array must contain a progressive, logical cascade of cause-and-effect transitions (e.g. Event not happening -> immediate consequence -> secondary consequence -> further adaptation -> modern outcome).`,
    `7. Return ONLY a valid JSON response in this exact format. Do not wrap it in markdown code blocks unless it is fenced with \`\`\`json, do not include introductory text, and do not add any commentary outside the JSON:`,
    `{`,
    `  "title": "If [Topic] Never Happened (or Existed/etc.)",`,
    `  "category": "Technology, War & Politics, Science & Space, or Culture",`,
    `  "shortTitle": "A 2-3 word short name for the topic",`,
    `  "icon": "Choose from: war, globe, lightbulb, book, phone, satellite, plant, circle, flag, needle, flame, rocket",`,
    `  "originalEvent": {`,
    `    "summary": "Explain what happened in the real timeline (1-2 sentences)",`,
    `    "importance": "Explain why it mattered to humanity (1-2 sentences)"`,
    `  },`,
    `  "timeline": {`,
    `    "tenYears": "Describe the state of the world 10 years after this event did not happen, detailing immediate adaptations (1-2 sentences)",`,
    `    "fiftyYears": "Describe the state of the world 50 years after this event did not happen, detailing structural adaptations (1-2 sentences)",`,
    `    "hundredYears": "Describe the state of the world 100 years after this event did not happen, detailing generational shifts (1-2 sentences)",`,
    `    "present": "Describe the present day world in this alternate timeline, detailing modern equivalents or replacements (1-2 sentences)"`,
    `  },`,
    `  "techImpact": {`,
    `    "missingTech": ["Concrete Missing Tech 1", "Concrete Missing Tech 2", "Concrete Missing Tech 3", "Concrete Missing Tech 4", "Concrete Missing Tech 5"],`,
    `    "description": "How technology and tools developed differently in the absence of this breakthrough."`,
    `  },`,
    `  "societyImpact": {`,
    `    "description": "How people's daily lives, social structures, and habits changed."`,
    `  },`,
    `  "economyImpact": {`,
    `    "description": "The business, trade, financial, and wealth allocation effects."`,
    `  },`,
    `  "scienceImpact": {`,
    `    "description": "Which scientific discoveries or theories were delayed or modified."`,
    `  },`,
    `  "politicsImpact": {`,
    `    "description": "How governments, borders, conflicts, and global order adapted."`,
    `  },`,
    `  "cultureImpact": {`,
    `    "description": "How entertainment, communication, values, and lifestyle evolved."`,
    `  },`,
    `  "rippleEffects": [`,
    `    "Step 1: The direct immediate result of the event not happening",`,
    `    "Step 2: A secondary consequence triggered by Step 1",`,
    `    "Step 3: A third consequence triggered by Step 2",`,
    `    "Step 4: A fourth consequence triggered by Step 3",`,
    `    "Step 5: The final resulting state in the present day"`,
    `  ],`,
    `  "positives": [`,
    `    "Possible positive outcome 1",`,
    `    "Possible positive outcome 2",`,
    `    "Possible positive outcome 3"`,
    `  ],`,
    `  "negatives": [`,
    `    "Possible negative outcome 1",`,
    `    "Possible negative outcome 2",`,
    `    "Possible negative outcome 3"`,
    `  ],`,
    `  "comparison": {`,
    `    "before": "One sentence summary of the baseline modern world with this event.",`,
    `    "after": "One sentence summary of the alternate modern world without this event."`,
    `  },`,
    `  "cards": [`,
    `    { "title": "Bespoke Domain Title 1 (e.g. Communication)", "modern": "Detailed baseline state", "alternate": "Detailed alternate state" },`,
    `    { "title": "Bespoke Domain Title 2 (e.g. Transport)", "modern": "Detailed baseline state", "alternate": "Detailed alternate state" },`,
    `    { "title": "Bespoke Domain Title 3 (e.g. Daily Habits)", "modern": "Detailed baseline state", "alternate": "Detailed alternate state" }`,
    `  ],`,
    `  "finalPerspective": "Summarize what this event changed for humanity in a single, thought-provoking sentence."`,
    `}`
  ].join("\n");
}

function safeParseJson(content) {
  if (!content) return null;

  let cleanContent = content.trim();
  
  // Strip opening code fences
  if (cleanContent.startsWith("```json")) {
    cleanContent = cleanContent.substring(7).trim();
  } else if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent.substring(3).trim();
  }
  
  // Strip closing code fences
  if (cleanContent.endsWith("```")) {
    cleanContent = cleanContent.substring(0, cleanContent.length - 3).trim();
  }

  // Parse and clean character by character
  let result = "";
  let inString = false;
  let escaped = false;
  
  for (let i = 0; i < cleanContent.length; i++) {
    const char = cleanContent[i];
    
    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }
    
    if (char === "\\") {
      result += char;
      escaped = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    
    if (inString) {
      if (char === "\n" || char === "\r") {
        result += "\\n";
        continue;
      }
      if (char === "\t") {
        result += "\\t";
        continue;
      }
    } else {
      if (char === ",") {
        // Look ahead to skip trailing commas before ] or }
        let nextIdx = i + 1;
        while (nextIdx < cleanContent.length && /\s/.test(cleanContent[nextIdx])) {
          nextIdx++;
        }
        if (nextIdx < cleanContent.length && (cleanContent[nextIdx] === "]" || cleanContent[nextIdx] === "}")) {
          continue; // skip trailing comma
        }
      }
    }
    
    result += char;
  }

  try {
    return JSON.parse(result);
  } catch (e) {
    console.error("Failed to parse cleaned JSON:", result);
    console.error("Parse error detail:", e);
    return null;
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
        temperature: 0.75,
        max_tokens: 1800,
        messages: [
          {
            role: "system",
            content: "You are an expert alternate history engine called If This Never Happened. You help users simulate timelines without major milestones. You provide structured JSON output matching the requested schema exactly.",
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
    const rawContent = data.choices?.[0]?.message?.content;
    const parsed = safeParseJson(rawContent);

    if (!parsed) {
      console.error("Failed to parse JSON content from Groq response:", rawContent);
      return Response.json({ error: "Groq response could not be parsed as structured JSON" }, { status: 502 });
    }

    return Response.json({ source: "Groq API", ...parsed });
  } catch (error) {
    console.error("Error in if-this-never-happened API route:", error);
    return Response.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}

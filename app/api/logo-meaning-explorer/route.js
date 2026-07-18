const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const VISION_MODEL = "qwen/qwen3.6-27b";

function buildSystemPrompt() {
  return [
    "You are a brand consultant. Analyze the logo image and return a JSON brand audit.",
    "RULES: No thinking. No preamble. No markdown. Output ONLY valid JSON.",
    "Keep ALL text fields under 10 words. Be concise."
  ].join(" ");
}

function buildUserPrompt() {
  return `Analyze this logo. Return JSON with these keys:
brandName(string),
brandPersonality:{traits:[{trait,score(0-100),explanation}]} for: Modern,Luxury,Minimal,Playful,Professional,Creative,Aggressive,Friendly,Elegant,Innovative,
colorPsychology:[{color,hex,meaning,emotionalImpact,commonIndustries,psychologicalEffect,strengths,weaknesses}],
shapeAnalysis:[{shape,presence(High/Medium/Low/None),communicates,brandingInsight}],
typographyAnalysis:{style,fontNameGuess,personalityCreated},
logoType:{type,explanation},
visualHierarchy:{balance,alignment,spacing,contrast,negativeSpace,focusPoint,simplicity,complexity},
emotionMeter:[{emotion,score}] for: Trust,Innovation,Luxury,Fun,Authority,Friendliness,
targetAudience:{predictedAudience,reasoning},
brandPositioning:{marketSegment,reasoning},
designStrengths:[{strength,details}],
improvementSuggestions:[{suggestion,details}],
logoStyleComparison:{similarStyles:[],explanation},
accessibility:{contrastCheck,visibility,darkModeCompatibility,lightModeCompatibility,smallSizes,largeScreens,printFriendliness},
brandStoryGenerator(string),
designPrinciples:{verdict,principles:[{principle,status(Excellent/Average/Poor),explanation}] for: Contrast,Alignment,Simplicity,Memorability,Consistency},
learningMode(string),
historyMode:{isFamous(bool),evolution:[{year,event,reason}]}`;
}

function repairTruncatedJson(str) {
  if (!str.trim()) return "{}";
  let repaired = str.trim();

  // If there's an open quote that isn't escaped, close it
  let openQuote = false;
  for (let i = 0; i < repaired.length; i++) {
    if (repaired[i] === '"' && (i === 0 || repaired[i - 1] !== '\\')) {
      openQuote = !openQuote;
    }
  }
  if (openQuote) {
    repaired += '"';
  }

  // Clean trailing commas, colons, or incomplete properties
  repaired = repaired.replace(/,\s*$/, "");
  repaired = repaired.replace(/:\s*$/, ': ""');
  repaired = repaired.replace(/,\s*"\w*"\s*:\s*$/, "");
  repaired = repaired.replace(/,\s*"\w*$/, '');
  repaired = repaired.replace(/,\s*$/, '');

  // Track brackets and braces to close
  const stack = [];
  let inString = false;
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    if (char === '"' && (i === 0 || repaired[i - 1] !== '\\')) {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === '{' || char === '[') {
      stack.push(char);
    } else if (char === '}') {
      if (stack.length > 0 && stack[stack.length - 1] === '{') stack.pop();
    } else if (char === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === '[') stack.pop();
    }
  }

  // Append matching closing delimiters
  while (stack.length > 0) {
    const open = stack.pop();
    if (open === '{') repaired += '}';
    if (open === '[') repaired += ']';
  }

  return repaired;
}

function safeParseJson(content) {
  if (!content) return null;
  
  // Clean thinking blocks if the model generated any
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  
  // Clean potential leading thinking block if tag wasn't closed
  if (cleaned.includes("<think>")) {
    const idx = cleaned.lastIndexOf("</think>");
    if (idx !== -1) {
      cleaned = cleaned.substring(idx + 8).trim();
    } else {
      // Unclosed think tag — try to find the first '{' after it
      const braceIdx = cleaned.indexOf("{");
      if (braceIdx !== -1) {
        cleaned = cleaned.substring(braceIdx).trim();
      }
    }
  }
  
  // Direct parse attempt
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try extracting from fenced code blocks
    const fenced = cleaned.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] || cleaned.match(/```\s*([\s\S]*?)\s*```/)?.[1];
    if (fenced) {
      try { return JSON.parse(fenced.trim()); } catch {}
    }
    
    // Extract between first '{' and last '}'
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.substring(firstBrace, lastBrace + 1);
      try { return JSON.parse(candidate); } catch {}
    }
    
    // Try repairing truncated JSON from first brace
    if (firstBrace !== -1) {
      try {
        const repaired = repairTruncatedJson(cleaned.substring(firstBrace));
        return JSON.parse(repaired);
      } catch (e) {
        console.error("JSON repair failed:", e.message);
      }
    }
    
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, fileType } = body;

    if (!image) {
      return Response.json({ error: "No image data provided" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Groq API key not configured on server" }, { status: 503 });
    }

    // Prepare image url: check if already has standard base64 prefix
    let imageUrl = image;
    if (!imageUrl.startsWith("data:")) {
      const type = fileType || "image/png";
      imageUrl = `data:${type};base64,${image}`;
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        temperature: 0.2,
        max_completion_tokens: 4096,
        reasoning_effort: "none",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(),
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: buildUserPrompt(),
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: "Groq API request failed", details: errorText }, { status: 502 });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);

    if (!parsed) {
      return Response.json({ error: "Could not parse Groq response as valid structured JSON", raw: content }, { status: 502 });
    }

    return Response.json(parsed);
  } catch (error) {
    return Response.json(
      { error: "Unexpected execution error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

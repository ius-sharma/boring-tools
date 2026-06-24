export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const DEFAULT_TIMEOUT_MS = 10000;

function normalize(input) {
  return String(input ?? "").trim();
}

function safeHostname(hostname) {
  return hostname.toLowerCase();
}

// Security: reject private networks
function isPrivateAddress(hostname) {
  if (!hostname) return true;
  if (hostname === "localhost" || hostname.endsWith(".localhost")) return true;
  if (hostname === "127.0.0.1" || hostname === "::1") return true;
  if (/^10\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return true;
  if (/^0\./.test(hostname)) return true;
  if (/^169\.254\./.test(hostname)) return true;
  return false;
}

function normalizeUrl(rawUrl) {
  const trimmed = normalize(rawUrl);
  if (!trimmed) throw new Error("URL is required");

  let value = trimmed;
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  const parsed = new URL(value);
  if (!/^https?:$/.test(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported");
  }

  if (isPrivateAddress(safeHostname(parsed.hostname))) {
    throw new Error("Local and private network addresses are not allowed");
  }

  return parsed;
}

function extractVisibleText(html) {
  if (!html) return "";
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");
  return stripped.slice(0, 10000);
}

// Heuristic analysis of the article text
function analyzeHeuristics(text) {
  const lowercaseText = text.toLowerCase();
  const signals = [];
  let scoreAdjuster = 0;

  // 1. Clickbait and Sensationalism
  const sensationalWords = [
    "shocking", "unbelievable", "destroy", "obliterate", "slam", "eviscerate",
    "you won't believe", "secret they don't want", "mind-blowing", "miracle",
    "exposed", "panic", "hysteria", "conspiracy", "critical truth"
  ];
  let sensationalCount = 0;
  sensationalWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowercaseText.match(regex);
    if (matches) sensationalCount += matches.length;
  });

  if (sensationalCount > 4) {
    signals.push(`High level of sensationalized language detected (${sensationalCount} matches).`);
    scoreAdjuster -= 15;
  } else if (sensationalCount > 1) {
    signals.push(`Mild sensationalism or clickbait language detected.`);
    scoreAdjuster -= 5;
  }

  // 2. All-caps headlines/text patterns
  const allCapsWords = text.split(/\s+/).filter(w => w.length > 4 && /^[A-Z]{4,}$/.test(w));
  if (allCapsWords.length > 5) {
    signals.push("Excessive capitalized words (ALL CAPS) detected, indicating potential yelling/sensationalism.");
    scoreAdjuster -= 10;
  }

  // 3. Punctuation patterns
  if (/!{2,}/.test(text) || /\?{2,}/.test(text)) {
    signals.push("Multiple consecutive exclamation or question marks (e.g. !!! or ???) found.");
    scoreAdjuster -= 8;
  }

  // 4. Citation and Attribution Density
  const citationPhrases = [
    "according to", "said in a statement", "reported by", "published in",
    "studies show", "researchers found", "concluded that", "pointed out",
    "referring to", "in an interview"
  ];
  let citationCount = 0;
  citationPhrases.forEach(phrase => {
    const idx = lowercaseText.indexOf(phrase);
    if (idx !== -1) citationCount++;
  });

  // Check for quotes
  const quoteCount = (text.match(/"[^"]+"/g) || []).length;

  if (citationCount >= 3 || quoteCount >= 4) {
    signals.push("Strong presence of source attribution and direct quotes.");
    scoreAdjuster += 15;
  } else if (citationCount === 0 && quoteCount < 2) {
    signals.push("Low citation density: very few references or direct attributions observed.");
    scoreAdjuster -= 12;
  }

  // 5. Emotional vs Neutral Load
  const emotionalBiases = [
    "outrageous", "furious", "terrible", "horrific", "disastrous", "disgraceful",
    "evil", "corrupt", "brave", "heroic", "pure", "undeniable", "clearly"
  ];
  let emotionalCount = 0;
  emotionalBiases.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowercaseText.match(regex);
    if (matches) emotionalCount += matches.length;
  });

  if (emotionalCount > 3) {
    signals.push("Highly loaded or emotional descriptors used throughout the text.");
    scoreAdjuster -= 10;
  }

  // 6. Satire markers
  const satireMarkers = [
    "satire", "parody", "fictional", "for entertainment purposes", "the onion", "babylon bee"
  ];
  const isSatirical = satireMarkers.some(marker => lowercaseText.includes(marker));
  if (isSatirical) {
    signals.push("Markers of satire/parody detected in the text.");
  }

  // 7. Engagement/Viral bait
  const engagementPhrases = [
    "share this", "viral", "before it gets deleted", "spread the word",
    "copy and paste", "repost this", "tell everyone"
  ];
  const hasEngagementBait = engagementPhrases.some(phrase => lowercaseText.includes(phrase));
  if (hasEngagementBait) {
    signals.push("Contains engagement-baiting language (urging readers to share or repost).");
    scoreAdjuster -= 10;
  }

  return {
    signals,
    scoreAdjuster,
    isSatirical,
    sensationalCount,
    citationCount,
    quoteCount,
    emotionalCount
  };
}

function buildPrompt(articleText, title, depth, heuristics) {
  const maxClaims = depth === "deep" ? 7 : depth === "quick" ? 3 : 5;

  return [
    `Analyze the accuracy, bias, and credibility of the following news article:`,
    title ? `TITLE: "${title}"` : ``,
    `---`,
    `ARTICLE CONTENT:`,
    articleText,
    `---`,
    `HEURISTIC PRE-ANALYSIS RESULTS (Use these as additional context signals):`,
    `- Clickbait words detected: ${heuristics.sensationalCount}`,
    `- Citations/attributions matched: ${heuristics.citationCount}`,
    `- Direct quotes found: ${heuristics.quoteCount}`,
    `- Emotional/loaded words: ${heuristics.emotionalCount}`,
    `- Heuristic flags: ${heuristics.signals.join(" | ") || "None"}`,
    `---`,
    `Instructions:`,
    `1. Produce a single overall verdict. It MUST be exactly one of the following:`,
    `   - "Accurate" (Factual, well-sourced, objective reporting)`,
    `   - "Mostly Accurate" (Minor omissions, slight bias, or secondary details incorrect, but core facts check out)`,
    `   - "Misleading" (Presents true facts in a warped way, omits critical context, or mixes truth with falsehood)`,
    `   - "Opinion/Editorial" (Mainly an opinion piece or opinion-driven commentary, not objective news)`,
    `   - "Satire/Parody" (Intentional humor, exaggeration, or fictional parody)`,
    `   - "Unverifiable" (Lacks source material, references, or cross-checks to verify accuracy)`,
    `   - "Fabricated" (Entirely made-up stories, false claims, or fake news)`,
    `2. Calculate a confidenceScore (integer from 0 to 100) representing how confidently we can analyze this article based on its internal consistency, source citations, quality of claims, and known context.`,
    `3. Write a clear, objective 2-3 sentence 'summary' evaluating the article's core claim and trustworthiness.`,
    `4. Extract and assess the top key claims (up to a maximum of ${maxClaims} claims). For each claim, provide:`,
    `   - "claim": The specific factual statement made in the article.`,
    `   - "assessment": Exactly one of: "Verified", "Unverified", "Misleading", "Needs Context".`,
    `   - "reasoning": A 1-2 sentence explanation of why this claim is verified, unverified, or misleading based on common knowledge, logic, source citations, or contextual clues.`,
    `5. Provide lists for:`,
    `   - "biasIndicators": instances of loaded language, cherry-picked data, or framing.`,
    `   - "credibilitySignals": positive indicators (e.g., neutral tone, links to studies, direct attribution).`,
    `   - "redFlags": suspicious aspects (e.g., anonymous sources only, logical fallacies, emotional appeals).`,
    `6. Write a practical, constructive "recommendation" for the reader (e.g., "Cross-reference with reputable sources", "Enjoy as satire", "Treat as subjective editorial").`,
    `7. Identify any logical fallacies used in the article. Provide an array of objects under "logicalFallacies". Each object must contain:`,
    `   - "type": The name of the logical fallacy (e.g., "Strawman", "Ad Hominem", "False Dilemma", "Slippery Slope", "False Equivalence", "Circular Reasoning", "Cherry Picking").`,
    `   - "explanation": A 1-2 sentence description explaining how this logical fallacy manifests in the text.`,
    `   If no fallacies are detected, return an empty array [].`,
    `8. Return ONLY a valid JSON response in this exact format. Do NOT wrap in markdown boxes other than the requested JSON structure. Keep keys exactly as specified below:`,
    `{`,
    `  "verdict": "Mostly Accurate",`,
    `  "confidenceScore": 78,`,
    `  "summary": "This article discusses X correctly but exaggerates Y. The core events are backed by reputable quotes, though some secondary assertions lack citations.",`,
    `  "claims": [`,
    `    { "claim": "First major statement...", "assessment": "Verified", "reasoning": "..." },`,
    `    { "claim": "Second statement...", "assessment": "Misleading", "reasoning": "..." }`,
    `  ],`,
    `  "biasIndicators": ["loaded word choice in title", "unbalanced quote distribution"],`,
    `  "credibilitySignals": ["quotes from named officials", "dates and times provided"],`,
    `  "redFlags": ["lack of external links"],`,
    `  "recommendation": "Cross-reference the financial figures with official treasury reports.",`,
    `  "logicalFallacies": [`,
    `    { "type": "False Dilemma", "explanation": "The text presents remote work and complete office return as the only two options, ignoring hybrid possibilities." }`,
    `  ]`,
    `}`
  ].filter(Boolean).join("\n");
}

function safeParseJson(content) {
  if (!content) return null;
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // Try extraction from JSON markdown block
    const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] || trimmed.match(/```\s*([\s\S]*?)\s*```/)?.[1];
    if (!fenced) {
      // Try finding the first '{' and last '}'
      const firstBrace = trimmed.indexOf("{");
      const lastBrace = trimmed.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
        } catch {
          return null;
        }
      }
      return null;
    }

    try {
      return JSON.parse(fenced.trim());
    } catch {
      return null;
    }
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, url, title, depth = "standard" } = body;

    let articleText = normalize(text);
    let articleTitle = normalize(title);
    let finalUrl = "";

    // If URL is provided and text is empty, try to fetch it
    if (url && !articleText) {
      try {
        const parsedUrl = normalizeUrl(url);
        finalUrl = parsedUrl.toString();
        const response = await fetchWithTimeout(finalUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BoringToolsNewsChecker/1.0",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch article (HTTP ${response.status})`);
        }

        const html = await response.text();
        articleText = extractVisibleText(html);

        // Try to extract title if not provided
        if (!articleTitle) {
          const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
          if (match && match[1]) {
            articleTitle = normalize(match[1].replace(/\s+/g, " "));
          }
        }

        if (!articleText || articleText.length < 100) {
          throw new Error("No significant readable text could be extracted from this URL.");
        }
      } catch (err) {
        return Response.json(
          { error: `URL extraction failed: ${err instanceof Error ? err.message : "Unable to reach website"}` },
          { status: 400 }
        );
      }
    }

    if (!articleText || articleText.length < 40) {
      return Response.json(
        { error: "Please enter a longer article or a valid URL to analyze." },
        { status: 400 }
      );
    }

    // Run heuristics
    const heuristics = analyzeHeuristics(articleText);

    // Groq API check
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Groq API key not configured" }, { status: 503 });
    }

    const prompt = buildPrompt(articleText, articleTitle, depth, heuristics);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.3, // analytical precision
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content: "You are an expert news veracity investigator, claims auditor, and media literacy trainer. Your job is to break down articles into claims and objectively judge them based on verified general knowledge, logical structure, and source citations. Return only structured JSON analysis.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errDetails = await response.text();
      return Response.json(
        { error: "Analysis request to Groq API failed", details: errDetails },
        { status: 502 }
      );
    }

    const data = await response.json();
    const responseContent = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(responseContent);

    if (!parsed || !parsed.verdict || typeof parsed.confidenceScore !== "number") {
      return Response.json(
        {
          error: "Unable to parse a valid structured report from the AI. The response format was unexpected.",
          raw: responseContent.slice(0, 500)
        },
        { status: 502 }
      );
    }

    // Combine manual score adjusts with the AI's confidence
    let adjustedScore = parsed.confidenceScore + heuristics.scoreAdjuster;
    if (heuristics.isSatirical) {
      parsed.verdict = "Satire/Parody";
    }
    parsed.confidenceScore = Math.max(5, Math.min(100, adjustedScore));

    // Make sure logicalFallacies exists
    if (!Array.isArray(parsed.logicalFallacies)) {
      parsed.logicalFallacies = [];
    }

    // Return the response
    return Response.json({
      ...parsed,
      heuristics: {
        sensationalCount: heuristics.sensationalCount,
        citationCount: heuristics.citationCount,
        quoteCount: heuristics.quoteCount,
        emotionalCount: heuristics.emotionalCount,
        signals: heuristics.signals
      },
      details: {
        titleUsed: articleTitle || "Untitled",
        textLength: articleText.length,
        urlChecked: finalUrl || null
      }
    });

  } catch (error) {
    return Response.json(
      { error: "Unexpected server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

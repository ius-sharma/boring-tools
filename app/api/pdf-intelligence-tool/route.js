import { NextResponse } from "next/server";
import { extractPhones, normalizePhoneDisplay } from "../../pdf-intelligence-tool/phone-utils";
import { withAuthAndQuota } from "../../../lib/auth/withAuthAndQuota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// Larger limit: the previous 22,000-char clip silently cut off long PDFs, so
// the AI only ever saw the first pages and missed later content entirely.
const TEXT_CLIP_LIMIT = 28000;

const STOP_WORDS = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "just",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "with",
  "would",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
]);

// The frontend already boosts sentences containing these action cues, but the
// server-side local fallback skipped this weighting entirely, so local results
// (when the AI layer fails) were weaker than they should be.
const KEY_CUES = [
  "important",
  "deadline",
  "due",
  "payment",
  "contact",
  "email",
  "phone",
  "call",
  "meeting",
  "schedule",
  "action",
  "required",
  "note",
  "please",
  "urgent",
  "submit",
  "invoice",
  "renewal",
  "agreement",
  "policy",
  "effective",
  "expires",
  "appointment",
  "reminder",
  "confidential",
];

// Placeholder strings an LLM may emit for empty arrays; these must not leak
// into the user-facing results.
const PLACEHOLDER_VALUES = new Set(["none", "n/a", "na", "not found", "no data", "-", "--", "null", "none detected", "no entries", "nil", "not available"]);

function normalize(value) {
  return String(value ?? "").trim();
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function splitSentences(text) {
  const matches = normalizeWhitespace(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return (matches || []).map((sentence) => sentence.trim()).filter(Boolean);
}

function toWords(value) {
  return normalizeWhitespace(value).toLowerCase().match(/[a-z0-9']+/g) || [];
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function extractEmails(text) {
  return unique((text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map((item) => item.trim()));
}

function extractUrls(text) {
  const matches = text.match(/(?:https?:\/\/|www\.)[\w\-._~:/?#@!$&'()*+,;=%]+/gi) || [];
  return unique(matches.map((item) => item.replace(/[),.;!?]+$/g, "")));
}

function extractDates(text) {
  const patterns = [
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
    /\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/g,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)\.?\s+\d{1,2}(?:,\s+\d{4})?\b/gi,
    /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)\.?\s+\d{4}\b/gi,
  ];

  return unique(patterns.flatMap((pattern) => text.match(pattern) || []).map((value) => value.trim()));
}

function extractKeywords(text) {
  const counts = new Map();
  for (const word of toWords(text)) {
    if (word.length < 4 || STOP_WORDS.has(word) || /^\d+$/.test(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([word]) => word);
}

function scoreSentence(sentence, frequencyMap) {
  const words = toWords(sentence).filter((word) => !STOP_WORDS.has(word));
  if (!words.length) return 0;

  let score = 0;
  for (const word of words) {
    score += frequencyMap.get(word) || 0;
  }

  // Action cues make a sentence more likely to matter to the reader.
  const lower = sentence.toLowerCase();
  for (const cue of KEY_CUES) {
    if (lower.includes(cue)) score += 2.5;
  }

  if (/\b\d{2,}\b/.test(sentence)) score += 1;
  if (sentence.length < 45) score *= 0.75;
  return score;
}

function topSentences(sentences, frequencyMap, limit) {
  return sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: scoreSentence(sentence, frequencyMap),
    }))
    .filter(({ sentence }) => sentence.length >= 24)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .sort((a, b) => a.index - b.index)
    .map(({ sentence }) => sentence);
}

function buildFrequencyMap(text) {
  const map = new Map();
  for (const word of toWords(text)) {
    if (word.length < 4 || STOP_WORDS.has(word)) continue;
    map.set(word, (map.get(word) || 0) + 1);
  }
  return map;
}

function buildLocalRefinement(payload) {
  const text = normalizeWhitespace(payload?.extractedText || "");
  const sentences = splitSentences(text);
  const frequencyMap = buildFrequencyMap(text);
  const summarySource = topSentences(sentences, frequencyMap, Math.min(3, sentences.length));
  const summary = summarySource.length ? summarySource.join(" ") : "No readable text was extracted from this PDF.";
  const keyPoints = topSentences(sentences, frequencyMap, Math.min(6, sentences.length));

  return {
    summary: summary.length > 480 ? `${summary.slice(0, 477).trimEnd()}...` : summary,
    keyPoints,
    dates: extractDates(text),
    emails: extractEmails(text),
    phones: extractPhones(text),
    links: extractUrls(text),
    keywords: extractKeywords(text),
    source: "Local fallback",
  };
}

function safeParseJson(content) {
  if (!content) return null;

  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }

  // Markdown code fences are the most common wrapper around LLM JSON.
  const fenced =
    trimmed.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] || trimmed.match(/```\s*([\s\S]*?)\s*```/)?.[1];
  if (fenced) {
    try {
      return JSON.parse(fenced);
    } catch {
      // fall through
    }
  }

  // Try the largest balanced JSON object anywhere in the response.
  for (let start = 0; start < trimmed.length; start += 1) {
    if (trimmed[start] !== "{") continue;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let end = start; end < trimmed.length; end += 1) {
      const char = trimmed[end];
      if (inString) {
        escape = !escape && char === "\\";
        if (char === '"' && !escape) inString = false;
        continue;
      }
      if (char === '"') {
        inString = true;
        continue;
      }
      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(trimmed.slice(start, end + 1));
        } catch {
          break;
        }
      }
    }
  }

  return null;
}

function buildPrompt(payload) {
  const text = normalizeWhitespace(payload?.extractedText || "");
  const clippedText = text.length > TEXT_CLIP_LIMIT ? `${text.slice(0, TEXT_CLIP_LIMIT)}...` : text;
  const clippedSample = Array.isArray(payload?.sampleSentences) ? payload.sampleSentences.slice(0, 8) : [];

  return [
    "You are a careful document intelligence analyst.",
    "Refine the extracted PDF text into a concise, helpful, human-readable report.",
    "Use ONLY the provided content. Do not invent facts, dates, contacts, links, or claims. Copy every contact, date, and link exactly as written in the source.",
    "Prefer clear wording over raw extraction. Merge duplicates and clean formatting.",
    "Include every contact (emails and phone numbers), every date, and every link found in the text. Do not drop contacts just because the document is long.",
    "Numbers like order references (ORD-1101), serial numbers (SN-9928173), invoice numbers, figure labels, or page numbers are NOT phone numbers and must not appear in the phones array.",
    "For arrays where nothing exists, return an empty array [], never placeholder words like \"none\" or \"n/a\".",
    "Return ONLY valid JSON in this exact shape:",
    '{"summary":"...","keyPoints":["..."],"dates":["..."],"emails":["..."],"phones":["..."],"links":["..."],"keywords":["..."]}',
    `File name: ${payload?.fileName || "document.pdf"}`,
    `Page count: ${payload?.pageCount || 0}`,
    `Word count: ${payload?.wordCount || 0}`,
    `Preliminary summary: ${payload?.summaryCandidate || "none"}`,
    `Preliminary key points: ${(payload?.keyPoints || []).slice(0, 8).join(" | ") || "none"}`,
    `Preliminary dates: ${(payload?.dates || []).slice(0, 10).join(", ") || "none"}`,
    `Preliminary contacts: ${[(payload?.emails || []).slice(0, 10).join(", "), (payload?.phones || []).slice(0, 10).join(", ")].filter(Boolean).join(" ; ") || "none"}`,
    `Preliminary links: ${(payload?.links || []).slice(0, 10).join(", ") || "none"}`,
    `Preliminary keywords: ${(payload?.keywords || []).slice(0, 12).join(", ") || "none"}`,
    "Sample sentences:",
    ...clippedSample.map((sentence) => `- ${sentence}`),
    "Extracted text (may be truncated for long documents):",
    clippedText,
  ].join("\n");
}

function normalizeArray(value) {
  return Array.isArray(value)
    ? value
        .map((item) => normalize(item))
        .filter((item) => Boolean(item) && !PLACEHOLDER_VALUES.has(item.toLowerCase()))
    : [];
}

function dedupeArray(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const key = String(value).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

// Merge the AI output with the local detector output so nothing that was
// found locally gets silently lost when the AI returns a shorter or
// different list. AI values keep their order and take priority.
function mergeArrays(aiValues, localValues) {
  const aiNormalized = normalizeArray(aiValues);
  const localNormalized = normalizeArray(localValues);
  return dedupeArray([...aiNormalized, ...localNormalized]);
}

// Build the final result by combining AI refinement with local detections.
// Summary and key points rely on the AI, but contacts, dates, links, and
// keywords are the union of both sources so nothing detected locally is lost.
function buildAiResult(parsed, fallback) {
  const summary = normalize(parsed?.summary) || fallback.summary;
  const keyPoints = normalizeArray(parsed?.keyPoints).slice(0, 8);
  const dates = mergeArrays(parsed?.dates, fallback.dates);
  const emails = mergeArrays(parsed?.emails, fallback.emails);
  const links = mergeArrays(parsed?.links, fallback.links);
  const keywords = mergeArrays(parsed?.keywords, fallback.keywords);

  // AI phone numbers must pass the local phone validation before being
  // trusted. The old logic required AI phones to already exist in the local
  // list, which silently deleted correct numbers that the local heuristic
  // had missed.
  const aiPhones = locallyValidatedPhones(normalizeArray(parsed?.phones));
  const phones = dedupeArray([...aiPhones, ...fallback.phones]);

  return {
    summary,
    keyPoints: keyPoints.length ? keyPoints : fallback.keyPoints,
    dates,
    emails,
    phones,
    links,
    keywords,
    source: "Groq API",
  };
}

// Local phone validation uses the shared phone-utils validator so the API
// and the frontend apply identical rules. A phone survives only when its
// normalized display form passes the same digit/format rules used by the
// local detector; obviously wrong values from the AI never reach the user.
// The old `validatePhoneList` logic required AI phones to already exist in
// the local list and is no longer used here.
function locallyValidatedPhones(values) {
  const validated = [];
  for (const value of Array.isArray(values) ? values : []) {
    const display = normalizePhoneDisplay(value);
    if (display) validated.push(display);
  }
  return dedupePhones(validated);
}

function dedupePhones(values) {
  const map = new Map();
  for (const value of values) {
    const digits = String(value).replace(/\D/g, "");
    if (!digits) continue;
    if (!map.has(digits)) map.set(digits, value);
  }
  return Array.from(map.values());
}

async function callGroq(apiKey, payload) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.25,
      // A previous limit of 1200 tokens cut long reports mid-JSON, which then
      // failed parsing and silently downgraded the whole result to the local
      // fallback. 3000 tokens gives the model room for complete output.
      max_tokens: 3000,
      // Structured JSON output removes markdown fences and trailing text, so
      // parsing is reliable even when the model chatters around the JSON.
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You refine PDF text into a structured document intelligence report. Be faithful to the source, concise, and well organized. Never fabricate details. Always include every contact, date, and link found in the text.",
        },
        {
          role: "user",
          content: buildPrompt(payload),
        },
      ],
    }),
  });

  return response;
}

async function handlePost(request) {
  try {
    const body = await request.json();
    const extractedText = normalizeWhitespace(body?.extractedText);

    if (!extractedText) {
      return NextResponse.json({ error: "Extracted text is required" }, { status: 400 });
    }

    const fallback = buildLocalRefinement(body);
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ ...fallback, source: "Local fallback" });
    }

    const response = await callGroq(apiKey, body);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ ...fallback, source: "Local fallback", error: "Groq request failed", details: errorText }, { status: 200 });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    let parsed = safeParseJson(content);

    // If the first call produced unparsable content (e.g., rate-limited edge
    // responses), retry once with a fresh request before giving up.
    if (!parsed) {
      const retry = await callGroq(apiKey, body);
      if (retry.ok) {
        const retryData = await retry.json();
        const retryContent = retryData?.choices?.[0]?.message?.content || "";
        parsed = safeParseJson(retryContent);
      }
    }

    if (!parsed) {
      return NextResponse.json({ ...fallback, source: "Local fallback", error: "Groq response could not be parsed" }, { status: 200 });
    }

    return NextResponse.json(buildAiResult(parsed, fallback));
  } catch (error) {
    return NextResponse.json(
      {
        ...buildLocalRefinement({ extractedText: "" }),
        error: "Unexpected PDF intelligence failure",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const POST = withAuthAndQuota({
  toolId: "pdf-intelligence-tool",
  costInCredits: 1,
  allowGuestTrial: true,
  guestCost: 1,
}, handlePost);

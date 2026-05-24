import { NextResponse } from "next/server";
import { extractPhones, validatePhoneList } from "../../pdf-intelligence-tool/phone-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

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
    if (word.length < 4 || STOP_WORDS.has(word)) continue;
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

  try {
    return JSON.parse(content);
  } catch {
    const firstObject = content.match(/\{[\s\S]*\}/)?.[0];
    if (firstObject) {
      try {
        return JSON.parse(firstObject);
      } catch {
        // fall through
      }
    }

    const fenced = content.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] || content.match(/```\s*([\s\S]*?)\s*```/)?.[1];
    if (!fenced) return null;

    try {
      return JSON.parse(fenced);
    } catch {
      return null;
    }
  }
}

function buildPrompt(payload) {
  const text = normalizeWhitespace(payload?.extractedText || "");
  const clippedText = text.length > 22000 ? `${text.slice(0, 22000)}...` : text;
  const clippedSample = Array.isArray(payload?.sampleSentences) ? payload.sampleSentences.slice(0, 8) : [];

  return [
    "You are a careful document intelligence analyst.",
    "Refine the extracted PDF text into a concise, helpful, human-readable report.",
    "Use only the provided content. Do not invent facts, dates, contacts, links, or claims.",
    "Prefer clear wording over raw extraction. Merge duplicates and clean formatting.",
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
    "Extracted text:",
    clippedText,
  ].join("\n");
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.map((item) => normalize(item)).filter(Boolean) : [];
}

function buildAiResult(parsed, fallback) {
  const summary = normalize(parsed?.summary) || fallback.summary;
  const keyPoints = normalizeArray(parsed?.keyPoints).slice(0, 8);
  const dates = normalizeArray(parsed?.dates);
  const emails = normalizeArray(parsed?.emails);
  const phones = validatePhoneList(normalizeArray(parsed?.phones), fallback.phones);
  const links = normalizeArray(parsed?.links);
  const keywords = normalizeArray(parsed?.keywords);

  return {
    summary,
    keyPoints: keyPoints.length ? keyPoints : fallback.keyPoints,
    dates: dates.length ? dates : fallback.dates,
    emails: emails.length ? emails : fallback.emails,
    phones: phones.length ? phones : fallback.phones,
    links: links.length ? links : fallback.links,
    keywords: keywords.length ? keywords : fallback.keywords,
    source: "Groq API",
  };
}

export async function POST(request) {
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

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.25,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "You refine PDF text into a structured document intelligence report. Be faithful to the source, concise, and well organized. Never fabricate details.",
          },
          {
            role: "user",
            content: buildPrompt(body),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ ...fallback, source: "Local fallback", error: "Groq request failed", details: errorText }, { status: 200 });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);

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
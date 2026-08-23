import { NextResponse } from "next/server";
import { withAuthAndQuota } from "../../../lib/auth/withAuthAndQuota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function normalize(value) {
  return String(value ?? "")
    .replace(/\\n/g, "\n")
    .trim();
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
        // fall through to fenced parsing below
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

function buildLocalPosts(topic, tone, format, audience, keywords) {
  const cleanTopic = topic.replace(/\s+/g, " ").trim();
  const keywordPool = keywords.length ? keywords : ["growth", "learning", "success"];
  const audienceLabel = {
    recruiters: "recruiters",
    entrepreneurs: "entrepreneurs",
    employees: "employees",
    "job-seekers": "job seekers",
    professionals: "professionals",
  }[audience] || "professionals";

  const formatTemplates = {
    engagement: [
      `Just had a moment of clarity about ${cleanTopic}. Here's what I learned: The real ${keywordPool[0]} happens when you focus on what matters most. 🎯`,
      `Something clicked today: ${cleanTopic} isn't about perfection—it's about progress. What's one small step you took today toward your goals?`,
      `Unpopular opinion: ${cleanTopic} is one of the best investments for your career. Have you experienced this?`,
    ],
    announcement: [
      `Excited to share: ${cleanTopic}! This represents months of ${keywordPool[0]} and collaboration with an amazing team. Grateful for the journey.`,
      `Big news: ${cleanTopic} is here! Looking forward to the impact this will have on our ${audienceLabel}.`,
      `Thrilled to announce: ${cleanTopic}. A huge thank you to everyone who contributed to making this possible.`,
    ],
    advice: [
      `3 lessons I learned about ${cleanTopic}:\n1. ${keywordPool[0]} is non-negotiable\n2. Progress beats perfection\n3. Community amplifies impact\n\nWhat's your #1 lesson?`,
      `Want to master ${cleanTopic}? Start with these fundamentals:\n• Focus on the fundamentals\n• Build in public\n• Iterate based on feedback`,
      `My ${keywordPool[0]} tips for ${cleanTopic}:\n1. Start small and experiment\n2. Measure what matters\n3. Stay consistent`,
    ],
    question: [
      `Quick question for the ${audienceLabel} here: What's your biggest challenge with ${cleanTopic}? Genuinely curious to hear your thoughts.`,
      `I'm researching ${cleanTopic}—what advice would you give to someone just starting out? Your insights would help so many.`,
      `For those focused on ${cleanTopic}: What's the #1 thing that moved the needle for you?`,
    ],
    story: [
      `Here's a story about ${cleanTopic}: A year ago, I had no idea how important ${keywordPool[0]} would become. Today, it's changed everything. The lesson? Start where you are.`,
      `This time last year, ${cleanTopic} seemed impossible. Then I learned one thing that shifted everything: focus on ${keywordPool[0]}. Now it feels inevitable.`,
      `The turning point in my journey was when I realized ${cleanTopic}. It wasn't about talent—it was about commitment.`,
    ],
    celebration: [
      `Celebrating a milestone: ${cleanTopic}! 🎉 Grateful for the ${keywordPool[0]}, the team, and everyone who believed in this vision.`,
      `Feeling grateful today. We just hit: ${cleanTopic}. Huge thanks to the ${audienceLabel} who supported us along the way.`,
      `Today marks ${cleanTopic}. Reflecting on the journey, I'm reminded that ${keywordPool[0]} + community = breakthrough.`,
    ],
    carousel: [
      `Swipe to read → How we solved ${cleanTopic}!\n\nSlide 1: The Core Problem we faced.\nSlide 2: Our ${keywordPool[0]}-driven strategy.\nSlide 3: Step-by-step execution details.\nSlide 4: Key results & metrics.\n\nLet me know your thoughts in the comments! 👇`,
      `Slide-by-slide guide to ${cleanTopic}:\n\nSlide 1: Why most people fail at this.\nSlide 2: The ${keywordPool[0]} shift you need.\nSlide 3: 3 actionable steps to implement today.\nSlide 4: What to monitor for long-term success.`,
    ],
    teardown: [
      `Deep dive analysis: Let's break down ${cleanTopic}.\n\nHere is how it works under the hood, why it was successful, and what we can learn about ${keywordPool[0]} from their execution.`,
      `Case study on ${cleanTopic}:\n\n• The Context: Market shifts.\n• The Strategy: Bold pivots.\n• The Lesson: Speed beats scale in ${keywordPool[0]}.`,
    ],
  };

  const base = [
    `${cleanTopic}—${keywordPool[0]} and ${keywordPool[1] || keywordPool[0]} are what matter most.`,
    `Reflecting on ${cleanTopic}: The key isn't knowing everything, it's staying curious and committed.`,
    `Today I learned that ${cleanTopic} starts with a single decision to take action.`,
  ];

  const formatList = formatTemplates[format] || formatTemplates.engagement;

  return Array.from(new Set([
    ...formatList,
    ...base,
  ])).slice(0, 5);
}

function buildPrompt({ topic, tone, format, audience, keywords }) {
  const toneGuidance = {
    professional: "Keep it concise, corporate, polished, and business-focused.",
    inspirational: "Emphasize growth, personal transformation, possibilities, and positive outcomes.",
    casual: "Sound friendly, highly conversational, approachable, and authentic.",
    "thought-provoking": "Make it reflective, contrarian, intellectually engaging, and deep.",
    storytelling: "Write in a narrative arc (situation, conflict, resolution) sharing personal experiences.",
    contrarian: "Spicy take, challenge standard status quo or standard advice politely but boldly.",
    educational: "Provide step-by-step guide, actionable key lessons, and clear tactical value."
  };

  const formatGuidance = {
    engagement: "Start with a strong hook, break lines often, keep spacing wide, end with comment booster question.",
    announcement: "Clear excitement, highlight the news, thank the team/partners, state what is next.",
    advice: "Bulleted lists, actionable tips, metrics-focused takeaways.",
    question: "Pose an open debate or survey question, explain context, call to action in comments.",
    story: "Relatable anecdote, personal learning moment, key takeaway, soft call to action.",
    celebration: "Highly enthusiastic, emoji usage, thank community/partners, highlight achievement.",
    carousel: "Format as a Slide-by-slide PDF Carousel script (e.g. Slide 1: Hook, Slide 2: Problem, Slide 3-4: Actionable steps, Slide 5: CTA).",
    teardown: "Deconstruct/analyze a topic or campaign step-by-step with pros, cons, and lessons learned."
  };

  return [
    "You are an expert LinkedIn content strategist and copywriter.",
    "Write LinkedIn posts that are engaging, authentic, and tailored to the specific audience.",
    "Posts should be professional yet personable, with clear value and high readability (use clean line breaks, short paragraphs of 1-2 lines, bullet points).",
    "Keep posts concise (5-15 lines max) and ready to post directly.",
    "Generate exactly 5 unique LinkedIn posts.",
    "Return ONLY valid JSON in this exact shape:",
    '{"posts":["...","..."]}',
    "CRITICAL: Do not include raw newlines inside the JSON strings. Instead, use escaped '\\n' for all line breaks in the posts.",
    `Topic/Message: ${topic}`,
    `Tone: ${toneGuidance[tone] || toneGuidance.professional}`,
    `Format: ${formatGuidance[format] || formatGuidance.engagement}`,
    `Audience: ${audience}`,
    `Keywords: ${keywords.length ? keywords.join(", ") : "none"}`,
  ].join("\n");
}

async function handlePost(request) {
  try {
    const body = await request.json();
    const topic = normalize(body?.topic);
    const tone = ["professional", "inspirational", "casual", "thought-provoking", "storytelling", "contrarian", "educational"].includes(body?.tone) ? body.tone : "professional";
    const format = ["engagement", "announcement", "advice", "question", "story", "celebration", "carousel", "teardown"].includes(body?.format) ? body.format : "engagement";
    const audience = ["recruiters", "entrepreneurs", "employees", "job-seekers", "professionals"].includes(body?.audience) ? body.audience : "professionals";
    const keywords = Array.isArray(body?.keywords)
      ? body.keywords.map((item) => normalize(item)).filter(Boolean).slice(0, 4)
      : [];

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ posts: buildLocalPosts(topic, tone, format, audience, keywords), source: "Local fallback" });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.85,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "You generate high-quality LinkedIn posts that are engaging, authentic, and tailored to the target audience. Each post is professional yet personable, with clear value and strong readability.",
          },
          {
            role: "user",
            content: buildPrompt({ topic, tone, format, audience, keywords }),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ posts: buildLocalPosts(topic, tone, format, audience, keywords), source: "Local fallback", error: "Groq request failed", details: errorText }, { status: 200 });
    }

function extractPosts(content) {
  if (!content) return [];

  // Try standard JSON parse first
  try {
    const parsed = safeParseJson(content);
    if (parsed && Array.isArray(parsed.posts)) {
      return parsed.posts.map(p => normalize(p)).filter(Boolean);
    }
  } catch (e) {
    // Ignored
  }

  // Fallback 1: Regex matcher for unescaped JSON array containing raw newlines
  try {
    const arrayMatch = content.match(/"posts"\s*:\s*\[([\s\S]*?)\]/);
    if (arrayMatch) {
      const arrayContent = arrayMatch[1];
      const matches = [...arrayContent.matchAll(/"([\s\S]*?)"(?=\s*,|\s*$)/g)];
      const posts = matches.map(m => normalize(m[1])).filter(Boolean);
      if (posts.length > 0) return posts;
    }
  } catch (e) {
    // Ignored
  }

  // Fallback 2: Delimiter split
  if (content.includes("===POST_BREAK===")) {
    return content.split("===POST_BREAK===").map(p => normalize(p)).filter(Boolean);
  }
  if (content.includes("---")) {
    return content.split("---").map(p => normalize(p)).filter(Boolean);
  }

  // Fallback 3: Split by number patterns (e.g. 1., 2., etc.)
  const numberedSplit = content.split(/(?:^|\n)\d+\.\s+/);
  if (numberedSplit.length > 1) {
    return numberedSplit.slice(1).map(p => normalize(p)).filter(Boolean);
  }

  return [];
}

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const posts = extractPosts(content).slice(0, 5);

    if (!posts.length) {
      console.error("Failed parsing Groq response. Content received:", content);
      return NextResponse.json({ posts: buildLocalPosts(topic, tone, format, audience, keywords), source: "Local fallback", error: "Groq response could not be parsed" }, { status: 200 });
    }

    return NextResponse.json({ posts, source: `Groq API (${DEFAULT_MODEL})` });
  } catch (error) {
    return NextResponse.json(
      {
        posts: buildLocalPosts(body?.topic || "", body?.tone || "professional", body?.format || "engagement", body?.audience || "professionals", body?.keywords || []),
        source: "Local fallback",
        error: "API error - using local generation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}

export const POST = withAuthAndQuota({
  toolId: "linkedin-post-formatter",
  costInCredits: 1,
  allowGuestTrial: true,
  guestCost: 1,
}, handlePost);

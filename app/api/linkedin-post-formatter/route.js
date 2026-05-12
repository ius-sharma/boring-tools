import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function normalize(value) {
  return String(value ?? "").trim();
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
  };

  const toneModifiers = {
    professional: "Keep it concise and business-focused.",
    inspirational: "Emphasize growth, possibilities, and positive outcomes.",
    casual: "Sound conversational and approachable.",
    "thought-provoking": "Make it reflective and intellectually engaging.",
    storytelling: "Build narrative and share personal experiences.",
  };

  const base = [
    `${cleanTopic}—${keywordPool[0]} and ${keywordPool[1] || keywordPool[0]} are what matter most.`,
    `Reflecting on ${cleanTopic}: The key isn't knowing everything, it's staying curious and committed.`,
    `Today I learned that ${cleanTopic} starts with a single decision to take action.`,
  ];

  return Array.from(new Set([
    ...formatTemplates[format],
    ...base,
  ])).slice(0, 5);
}

function buildPrompt({ topic, tone, format, audience, keywords }) {
  return [
    "You are an expert LinkedIn content strategist and copywriter.",
    "Write LinkedIn posts that are engaging, authentic, and tailored to the specific audience.",
    "Posts should be professional yet personable, with clear value and relatability.",
    "Keep posts concise (5-15 lines max) and ready to post directly.",
    "Generate exactly 5 unique LinkedIn posts.",
    "Return ONLY valid JSON in this exact shape:",
    '{"posts":["...","..."]}',
    `Topic/Message: ${topic}`,
    `Tone: ${tone}`,
    `Format: ${format}`,
    `Audience: ${audience}`,
    `Keywords: ${keywords.length ? keywords.join(", ") : "none"}`,
  ].join("\n");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const topic = normalize(body?.topic);
    const tone = ["professional", "inspirational", "casual", "thought-provoking", "storytelling"].includes(body?.tone) ? body.tone : "professional";
    const format = ["engagement", "announcement", "advice", "question", "story", "celebration"].includes(body?.format) ? body.format : "engagement";
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
        temperature: 0.9,
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content:
              "You generate high-quality LinkedIn posts that are engaging, authentic, and tailored to the target audience. Each post is professional yet personable, with clear value and strong relatability.",
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

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);
    let posts = [];
    
    if (Array.isArray(parsed?.posts)) {
      posts = parsed.posts
        .map((item) => {
          // Handle both string and object formats
          if (typeof item === "string") {
            return normalize(item);
          } else if (typeof item === "object" && item !== null) {
            // If it's an object, try to extract text field
            return normalize(item.text || item.content || item.post || JSON.stringify(item));
          }
          return normalize(item);
        })
        .filter(Boolean)
        .slice(0, 5);
    }

    if (!posts.length) {
      return NextResponse.json({ posts: buildLocalPosts(topic, tone, format, audience, keywords), source: "Local fallback", error: "Groq response could not be parsed" }, { status: 200 });
    }

    return NextResponse.json({ posts, source: "Groq API" });
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

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const CATEGORY_HINTS = [
  { category: "Science", keywords: ["science", "physics", "chemistry", "biology", "quantum", "cell", "energy", "planet", "climate"] },
  { category: "Technology", keywords: ["technology", "tech", "ai", "computer", "software", "internet", "app", "system", "data", "blockchain"] },
  { category: "History", keywords: ["history", "war", "empire", "revolution", "ancient", "modern", "world war", "timeline"] },
  { category: "Geography", keywords: ["geography", "map", "country", "city", "region", "river", "mountain", "rainforest", "desert", "ocean"] },
  { category: "Finance", keywords: ["finance", "money", "inflation", "interest", "budget", "bank", "investment", "loan", "market"] },
  { category: "Mathematics", keywords: ["math", "algebra", "geometry", "probability", "equation", "formula", "statistics", "number"] },
  { category: "Business", keywords: ["business", "company", "market", "brand", "startup", "customer", "operations", "supply", "strategy"] },
  { category: "Internet", keywords: ["internet", "web", "search", "api", "social", "platform", "browser", "website", "online"] },
];

function normalize(value) {
  return String(value ?? "").trim();
}

function normalizeLower(value) {
  return normalize(value).toLowerCase();
}

function inferCategory(topic) {
  const value = normalizeLower(topic);

  for (const item of CATEGORY_HINTS) {
    if (item.keywords.some((keyword) => value.includes(keyword))) {
      return item.category;
    }
  }

  return "General Knowledge";
}

function buildLocalResponse(topic) {
  const cleanTopic = normalize(topic);
  const category = inferCategory(cleanTopic);
  const topicLabel = cleanTopic.replace(/\s+/g, " ");

  const categoryProfiles = {
    Science: {
      oneLineExplanation: `${topicLabel} is a science topic that helps explain how natural systems, matter, energy, or life work.`,
      explainLikeIm10: `${topicLabel} is like a clue about how the natural world works. It helps people understand why things happen and how to test ideas.`,
      keyConcepts: ["Observation", "Evidence", "Cause and effect", "Patterns", "Experiment"],
      whyItMatters: `It matters because understanding ${topicLabel.toLowerCase()} helps people solve real problems in health, energy, and the environment.`,
      realWorldExamples: ["School experiments", "Lab research", "Everyday natural processes"],
      learnNext: ["Scientific method", "Systems", "Energy"],
    },
    Technology: {
      oneLineExplanation: `${topicLabel} is a technology topic about tools, systems, or software that solve problems or automate work.`,
      explainLikeIm10: `${topicLabel} is like a smart tool kit for computers or digital systems. People use it to build things, move information, or make tasks faster.`,
      keyConcepts: ["Software", "Automation", "Data", "Systems", "Interfaces"],
      whyItMatters: `It matters because ${topicLabel.toLowerCase()} helps people work faster, communicate better, and build useful products.`,
      realWorldExamples: ["Apps", "Online services", "Automated workflows"],
      learnNext: ["Programming", "Cloud computing", "Databases"],
    },
    History: {
      oneLineExplanation: `${topicLabel} is a history topic about past events, people, and changes that shaped the world.`,
      explainLikeIm10: `${topicLabel} is like a story from the past. It helps us understand what happened, why it happened, and what changed after.`,
      keyConcepts: ["Timeline", "Causes", "Effects", "People", "Change"],
      whyItMatters: `It matters because learning about ${topicLabel.toLowerCase()} helps us understand how the present was shaped.`,
      realWorldExamples: ["Major wars", "Movements", "Turning points"],
      learnNext: ["Primary sources", "World history", "Civics"],
    },
    Geography: {
      oneLineExplanation: `${topicLabel} is a geography topic about places, environments, and how people interact with them.`,
      explainLikeIm10: `${topicLabel} is like learning the map and the story of a place at the same time. It explains land, climate, and people.`,
      keyConcepts: ["Location", "Climate", "Landforms", "Resources", "Population"],
      whyItMatters: `It matters because ${topicLabel.toLowerCase()} affects travel, weather, trade, and where people live.`,
      realWorldExamples: ["Maps", "Regions", "Natural resources"],
      learnNext: ["Map reading", "Climate zones", "Urban geography"],
    },
    Finance: {
      oneLineExplanation: `${topicLabel} is a finance topic about how money changes value, moves, or grows.`,
      explainLikeIm10: `${topicLabel} is like a money rule. It helps people understand saving, spending, borrowing, and investing.`,
      keyConcepts: ["Money", "Risk", "Growth", "Rates", "Planning"],
      whyItMatters: `It matters because ${topicLabel.toLowerCase()} affects budgets, prices, loans, and long-term financial decisions.`,
      realWorldExamples: ["Savings", "Loans", "Investments"],
      learnNext: ["Budgeting", "Compound growth", "Personal finance"],
    },
    Mathematics: {
      oneLineExplanation: `${topicLabel} is a mathematics topic that helps us describe patterns, quantities, or relationships.`,
      explainLikeIm10: `${topicLabel} is like a puzzle with rules. Once you know the rules, you can solve problems step by step.`,
      keyConcepts: ["Pattern", "Formula", "Logic", "Variables", "Reasoning"],
      whyItMatters: `It matters because ${topicLabel.toLowerCase()} supports science, engineering, coding, and everyday decision-making.`,
      realWorldExamples: ["Homework problems", "Calculations", "Data analysis"],
      learnNext: ["Algebra basics", "Statistics", "Geometry"],
    },
    Business: {
      oneLineExplanation: `${topicLabel} is a business topic about how organizations create value, serve customers, and grow.`,
      explainLikeIm10: `${topicLabel} is like the playbook for running a company or project. It connects people, money, and decisions.`,
      keyConcepts: ["Customers", "Value", "Operations", "Revenue", "Strategy"],
      whyItMatters: `It matters because ${topicLabel.toLowerCase()} influences how companies compete, deliver products, and stay profitable.`,
      realWorldExamples: ["Startups", "Retail", "Operations teams"],
      learnNext: ["Marketing", "Product strategy", "Operations"],
    },
    Internet: {
      oneLineExplanation: `${topicLabel} is an internet topic about online systems, platforms, or communication tools.`,
      explainLikeIm10: `${topicLabel} is like the plumbing of the web. It helps websites, apps, and people exchange information quickly.`,
      keyConcepts: ["Networks", "Protocols", "Content", "Search", "Sharing"],
      whyItMatters: `It matters because ${topicLabel.toLowerCase()} shapes how people discover information, communicate, and build online products.`,
      realWorldExamples: ["Websites", "Messaging apps", "Search results"],
      learnNext: ["Web basics", "APIs", "Digital privacy"],
    },
    "General Knowledge": {
      oneLineExplanation: `${topicLabel} is a general knowledge topic that helps you understand everyday ideas and how they connect.`,
      explainLikeIm10: `${topicLabel} is like a useful idea for real life. It gives you a simple way to think about the world.`,
      keyConcepts: ["Context", "Meaning", "Examples", "Reasoning", "Application"],
      whyItMatters: `It matters because ${topicLabel.toLowerCase()} makes it easier to communicate clearly and learn new subjects faster.`,
      realWorldExamples: ["Daily decisions", "Conversations", "School learning"],
      learnNext: ["Critical thinking", "Communication", "Research skills"],
    },
  };

  const profile = categoryProfiles[category] || categoryProfiles["General Knowledge"];

  return {
    title: topicLabel,
    category,
    ...profile,
  };
}

function buildPrompt(topic) {
  return [
    "You are QuickLearn, a structured learning assistant.",
    "Generate a concise, beginner-friendly explanation for the user's topic.",
    "Stay strictly on the requested topic. Never substitute a related topic.",
    "If the topic is ambiguous or cannot be understood, return only JSON with unable=true and message='Unable to generate information for this topic.'",
    "Return ONLY valid JSON using this exact shape when successful:",
    '{"title":"","category":"","oneLineExplanation":"","explainLikeIm10":"","keyConcepts":[],"whyItMatters":"","realWorldExamples":[],"learnNext":[]}',
    "Make it factual, beginner friendly, and concise enough to read in under two minutes.",
    `Topic: ${topic}`,
  ].join("\n");
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
        return null;
      }
    }
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const topic = normalize(body?.topic);

    if (!topic) {
      return NextResponse.json({ unable: true, message: "Unable to generate information for this topic." }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ source: "Local generator", ...buildLocalResponse(topic) });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.35,
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content:
              "You generate structured learning summaries. Never mention policies or reasoning. Return valid JSON only.",
          },
          {
            role: "user",
            content: buildPrompt(topic),
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ unable: true, message: "Unable to generate information for this topic." }, { status: 200 });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);

    if (!parsed || parsed.unable) {
      return NextResponse.json({ unable: true, message: "Unable to generate information for this topic." }, { status: 200 });
    }

    const normalized = {
      title: normalize(parsed.title) || topic,
      category: normalize(parsed.category) || inferCategory(topic),
      oneLineExplanation: normalize(parsed.oneLineExplanation),
      explainLikeIm10: normalize(parsed.explainLikeIm10),
      keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts.map(normalize).filter(Boolean).slice(0, 8) : [],
      whyItMatters: normalize(parsed.whyItMatters),
      realWorldExamples: Array.isArray(parsed.realWorldExamples) ? parsed.realWorldExamples.map(normalize).filter(Boolean).slice(0, 8) : [],
      learnNext: Array.isArray(parsed.learnNext) ? parsed.learnNext.map(normalize).filter(Boolean).slice(0, 8) : [],
    };

    if (!normalized.oneLineExplanation || !normalized.explainLikeIm10 || !normalized.keyConcepts.length || !normalized.whyItMatters || !normalized.realWorldExamples.length || !normalized.learnNext.length) {
      return NextResponse.json({ unable: true, message: "Unable to generate information for this topic." }, { status: 200 });
    }

    return NextResponse.json({ source: "Groq API", ...normalized });
  } catch {
    return NextResponse.json({ unable: true, message: "Unable to generate information for this topic." }, { status: 200 });
  }
}
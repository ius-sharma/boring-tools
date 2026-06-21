"use client";

import { useState, useMemo, useEffect } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const presets = [
  {
    id: "saas",
    name: "Side Hustle SaaS",
    goal: "Launch a Next.js invoice generator and get 10 paying customers",
    time: "10-15",
    resources: "Laptop, internet, $50 budget, basic coding skills",
    situation: "Working full-time, tired in evenings, struggle to stay consistent",
  },
  {
    id: "learn",
    name: "Learn Coding",
    goal: "Learn React and build 3 frontend projects for portfolio",
    time: "5-10",
    resources: "Laptop, internet, free tutorials, GitHub account",
    situation: "Have a busy day job, easy to get distracted by social media",
  },
  {
    id: "job",
    name: "Job Hunt Sprint",
    goal: "Apply to junior developer roles and get 2 interviews",
    time: "15-20",
    resources: "Resume draft, LinkedIn profile, portfolio site",
    situation: "Unemployed, plenty of time but feeling anxious and applying blindly",
  },
  {
    id: "health",
    name: "Health & Habit Reset",
    goal: "Run a half marathon under 2 hours in 4 months",
    time: "1-5",
    resources: "Running shoes, smartphone app, local park",
    situation: "Struggling with knee soreness occasionally, poor stamina currently",
  },
];

const timeOptions = [
  { value: "1-5", label: "1-5 hours per week" },
  { value: "5-10", label: "5-10 hours per week" },
  { value: "10-15", label: "10-15 hours per week" },
  { value: "15-20", label: "15-20 hours per week" },
  { value: "20+", label: "20+ hours per week" },
];

const engineData = {
  business: { categoryName: "Business & Side Hustle", themeColor: "amber" },
  career: { categoryName: "Career & Professional Growth", themeColor: "blue" },
  learning: { categoryName: "Skill Acquisition & Learning", themeColor: "emerald" },
  health: { categoryName: "Health, Fitness & Habits", themeColor: "rose" },
  finance: { categoryName: "Personal Finance & Investing", themeColor: "indigo" },
  creative: { categoryName: "Creative Production & Content", themeColor: "purple" },
  general: { categoryName: "General Productivity & Habits", themeColor: "slate" }
};

const classifyGoal = (goal = "", situation = "") => {
  const text = `${goal} ${situation}`.toLowerCase();
  
  if (/\b(business|sales|product|startup|saas|revenue|marketing|customer|client|launch|selling|app|website|income|side\s*hustle|monetize|shop|store|company|founder|product-market)\b/.test(text)) {
    return "business";
  }
  if (/\b(job|career|resume|interview|salary|promotion|work|hired|internship|cv|linkedin|employer|manager|negotiat)\b/.test(text)) {
    return "career";
  }
  if (/\b(learn|study|code|course|exam|python|javascript|react|engineering|developer|programming|university|school|grade|math|science|academy|certif)\b/.test(text)) {
    return "learning";
  }
  if (/\b(health|weight|gym|fitness|diet|sleep|run|workout|nutrition|calorie|exercise|fat|muscle|yoga|meditat|mental|cardi)\b/.test(text)) {
    return "health";
  }
  if (/\b(money|finance|save|invest|budget|stock|debt|portfolio|real\s*estate|crypto|tax|passive|wealth|loan)\b/.test(text)) {
    return "finance";
  }
  if (/\b(youtube|create|write|video|book|blog|design|content|podcast|social\s*media|tiktok|instagram|twitter|author|art|paint|music|editing)\b/.test(text)) {
    return "creative";
  }
  return "general";
};

const analyzeContext = (goal, time, resources, situation) => {
  const category = classifyGoal(goal, situation);
  const cleanGoal = goal.trim();
  const cleanResources = resources.trim();
  const cleanSituation = situation.trim();

  // 1. Extract resource items
  const resourceItems = cleanResources.split(/, | and |; /).map(r => r.trim()).filter(r => r.length > 1);
  const primaryResource = resourceItems[0] || "available tools";
  const secondaryResource = resourceItems[1] || "your current setup";

  // 2. Extract action verb and target noun
  const words = cleanGoal.split(/\s+/);
  const verbs = ["learn", "build", "launch", "get", "write", "run", "lose", "save", "invest", "create", "start", "improve", "find", "transition", "publish"];
  let detectedVerb = "execute";
  let targetNoun = cleanGoal;

  for (let i = 0; i < words.length; i++) {
    const w = words[i].toLowerCase();
    if (verbs.includes(w)) {
      detectedVerb = w;
      targetNoun = words.slice(i + 1).join(" ");
      break;
    }
  }

  // Cap targetNoun length if it's too long
  if (targetNoun.length > 60) {
    targetNoun = targetNoun.substring(0, 57) + "...";
  }

  // 3. Situational friction analysis
  const sitLower = cleanSituation.toLowerCase();
  let frictionInsight = "manage cognitive load and scale down complexity.";
  let frictionAction = "Set a timer for 25 minutes and shut down all background apps.";

  if (sitLower.includes("tired") || sitLower.includes("evening") || sitLower.includes("night") || sitLower.includes("after work")) {
    frictionInsight = "avoid scheduling high-cognitive tasks in the evening when your energy is depleted.";
    frictionAction = "Shift your focus window to the morning. Even 20 minutes before work beats 1 hour of tired evening effort.";
  } else if (sitLower.includes("distract") || sitLower.includes("phone") || sitLower.includes("social media") || sitLower.includes("youtube") || sitLower.includes("tab")) {
    frictionInsight = "minimize environmental triggers that pull your attention away.";
    frictionAction = "Put your phone in another room, turn off notifications, and use a browser blocker for social sites.";
  } else if (sitLower.includes("consistent") || sitLower.includes("consistency") || sitLower.includes("regularly") || sitLower.includes("habit")) {
    frictionInsight = "prioritize building a chain of daily check-ins rather than high-volume weekly sessions.";
    frictionAction = "Establish a micro-habit baseline (e.g., 'work for 5 minutes'). Never skip two days in a row.";
  } else if (sitLower.includes("slow") || sitLower.includes("edit") || sitLower.includes("perfection")) {
    frictionInsight = "combat perfectionism and separate creation from editing.";
    frictionAction = "Write or build without looking back. Forbid editing, refactoring, or polishing until a complete draft is done.";
  } else if (sitLower.includes("anxious") || sitLower.includes("overwhelm") || sitLower.includes("lost") || sitLower.includes("fear")) {
    frictionInsight = "reduce anxiety by scoping down the problem to a singular next step.";
    frictionAction = "Break down your next milestone into tasks that take less than 10 minutes to complete.";
  }

  // 4. Calculate leverage score
  let score = 75;
  if (time === "1-5") {
    score -= 12; // Scarcity of time increases friction
  } else if (time === "15-20" || time === "20+") {
    score += 10;
  }
  if (resourceItems.length <= 1) {
    score -= 8; // Lack of resources lowers initial leverage
  }
  if (cleanGoal.length < 15) {
    score -= 10; // Vague goals lower focus effectiveness
  }
  const leverageScore = Math.min(Math.max(score, 38), 97);

  // 5. Synthesize Goal Summary
  const cleanResourcesText = cleanResources || "your available constraints";
  const summary = `Your objective is to ${detectedVerb} "${targetNoun}". Analyzing your resources ("${cleanResourcesText}"), you have ${timeOptions.find(o => o.value === time)?.label} available. Your situation indicates friction from: "${cleanSituation}". To overcome this bottleneck, you must ${frictionInsight}`;

  // 6. Synthesize Actions dynamically
  let action1 = { title: "", focus: "", steps: [], difficulty: "Easy" };
  let action2 = { title: "", focus: "", steps: [], difficulty: "Medium" };
  let action3 = { title: "", focus: "", steps: [], difficulty: "Hard" };

  if (category === "business") {
    action1 = {
      title: `Direct Audience Validation for "${targetNoun}"`,
      focus: `Validate if target customers actually want to ${detectedVerb} this.`,
      difficulty: "Easy",
      steps: [
        `Identify 5 potential users online. Use your "${primaryResource}" to locate them.`,
        "Reach out asking about their current problems; do not mention your idea yet.",
        "Observe if they are currently spending money or time trying to solve this pain point."
      ]
    };
    action2 = {
      title: `Build a One-Page Waitlist for "${targetNoun}"`,
      focus: "Set up a lightweight landing page before developing features.",
      difficulty: "Medium",
      steps: [
        `Use your "${secondaryResource || "basic tools"}" to publish a page in under 3 hours.`,
        "Clearly state the primary benefit and add a simple email signup form.",
        "Drive traffic to this page and aim for at least 15 email signups to justify building it."
      ]
    };
    action3 = {
      title: "Manually Deliver the Core Value",
      focus: "Deliver the solution manually to your first subscriber/client.",
      difficulty: "Hard",
      steps: [
        "Do not automate or build complex billing, auth, or databases yet.",
        "Solve the customer's problem by hand (concierge model) using simple emails or spreadsheets.",
        "Get direct feedback on this manual delivery and iterate on the value proposition."
      ]
    };
  } else if (category === "career") {
    action1 = {
      title: `Informational Outreach targeting "${targetNoun}"`,
      focus: "Interview practitioners in your target role to build networks.",
      difficulty: "Medium",
      steps: [
        "Find 3 people on LinkedIn working in the field you want to break into.",
        `Leverage your "${primaryResource}" to send a short request for a 10-minute chat.`,
        "Ask about the key skills they use daily and what skills are lacking in new applicants."
      ]
    };
    action2 = {
      title: `Flagship Project targeting "${targetNoun}"`,
      focus: "Build one deep, comprehensive demonstration of your abilities.",
      difficulty: "Hard",
      steps: [
        `Avoid generic tutorial templates. Construct a unique utility based on your "${secondaryResource}".`,
        "Document the entire system structure, architectural tradeoffs, and bugs solved in a GitHub README.",
        "Create a 2-minute Loom video demoing the project and place it at the top of your resume."
      ]
    };
    action3 = {
      title: "Metric-Focused Resume Refactoring",
      focus: "Rewrite resume bullets to emphasize results over duties.",
      difficulty: "Easy",
      steps: [
        "Reframe your bullets: 'Accomplished [Result X], measured by [Metric Y], by doing [Action Z]'.",
        "Quantify your past impact (e.g. speedups, time saved, budget optimized).",
        "Keep your resume format single-column, clear, and highly scannable."
      ]
    };
  } else if (category === "learning") {
    action1 = {
      title: `Project-Based Learning Sandbox for "${targetNoun}"`,
      focus: "Build custom sandboxes instead of watching tutorials passively.",
      difficulty: "Hard",
      steps: [
        `For every 30 minutes of study, spend 1 hour building custom mini-projects using "${primaryResource}".`,
        "Take a tutorial project and expand it with 2 features not covered in the lesson.",
        "Force yourself to read official documentation to solve errors rather than copying code."
      ]
    };
    action2 = {
      title: "Establish a Daily Morning Focus Block",
      focus: "Dedicate a distraction-free slot first thing in the day.",
      difficulty: "Easy",
      steps: [
        "Carve out 30-45 minutes immediately after waking up, before checking email or social media.",
        `Use your "${secondaryResource || "workspace"}" strictly for focused learning.`,
        "Consistency is key: 30 minutes daily is more effective than 4 hours once a week."
      ]
    };
    action3 = {
      title: "Public Explanations & Summaries",
      focus: "Explain concepts in your own words to verify understanding.",
      difficulty: "Medium",
      steps: [
        "Write a simple, 3-paragraph summary of what you learned and share it on GitHub or social channels.",
        "Explain the topic to a peer or AI, highlighting potential edge cases.",
        "If you struggle to explain it simply, return to the study material to address gaps."
      ]
    };
  } else if (category === "health") {
    action1 = {
      title: `Nutrition & Sleep Environment Setup`,
      focus: "Redesign your environment to make good habits frictionless.",
      difficulty: "Easy",
      steps: [
        "Remove highly processed snack food from your immediate cabinet or work area.",
        `Place your "${primaryResource || "active gear"}" (shoes, water, clothes) in plain view.`,
        "Set a rigid alarm to turn off screens and wind down at night."
      ]
    };
    action2 = {
      title: `Step & Movement Baseline for "${targetNoun}"`,
      focus: "Set a daily active baseline requiring low recovery time.",
      difficulty: "Easy",
      steps: [
        "Aim for a consistent daily baseline (e.g., 8,000 steps) using phone tracking.",
        "Take a 10-minute walk after meals to aid digestion and lower blood sugar spikes.",
        "Use walking slots to listen to educational audio or plan projects."
      ]
    };
    action3 = {
      title: "Progressive Resistance Schedule",
      focus: "Establish a 3-session weekly compound exercise routine.",
      difficulty: "Medium",
      steps: [
        `Use your "${secondaryResource || "available time"}" to commit to 30-minute compound workouts.`,
        "Track your progress (reps, weights, or times) and aim for minor improvements weekly.",
        "Prioritize consistency and safety over complete muscle exhaustion."
      ]
    };
  } else if (category === "finance") {
    action1 = {
      title: `Pay-Day Savings Automation`,
      focus: "Set up auto-transfers to pay yourself first.",
      difficulty: "Easy",
      steps: [
        "Create an automated rule to draft 10-20% of your earnings immediately on pay day.",
        `Direct these funds into low-cost index assets or a dedicated account for "${targetNoun}".`,
        "Train yourself to budget and spend only what is left after savings are extracted."
      ]
    };
    action2 = {
      title: "Audit Top 3 Fixed Subscriptions/Bills",
      focus: "Cut large, recurring fixed expenses for compounding savings.",
      difficulty: "Medium",
      steps: [
        "Review your credit statements from the last 3 months and list all recurring fees.",
        `Identify 3 unused items to cancel or renegotiate using your "${primaryResource}".`,
        "Focus on saving $100/month recurring rather than stressing over minor daily cash."
      ]
    };
    action3 = {
      title: "Debt Paydown Avalanche",
      focus: "Target extra cash flow at high-interest liabilities first.",
      difficulty: "Medium",
      steps: [
        `List all debts by interest rate. Automate minimum payments for all using "${secondaryResource}".`,
        "Funnel all extra money toward the debt with the highest rate.",
        "Celebrate each payoff and roll the entire freed-up payment into the next target."
      ]
    };
  } else if (category === "creative") {
    action1 = {
      title: `Time-Boxed Rough Drafting for "${targetNoun}"`,
      focus: "Create raw content without stopping to edit or correct.",
      difficulty: "Medium",
      steps: [
        "Set a timer for 30 minutes. Write or record continuously without pausing.",
        `Utilize your "${primaryResource}" strictly for raw output, blocking editing functions.`,
        "Focus entirely on finishing the draft; quantity is the pathway to quality."
      ]
    };
    action2 = {
      title: "Spend 50% Effort on Title & Opening Hook",
      focus: "Refine packaging to ensure readers/viewers click and stay.",
      difficulty: "Easy",
      steps: [
        "Draft 10 title/headline variations for your draft before publishing.",
        "Design your first 2 sentences or first 5 seconds to hook attention directly.",
        `Analyze similar high-leverage packaging made with "${secondaryResource || "basic tools"}" in your space.`
      ]
    };
    action3 = {
      title: "Batch Creation Workflows",
      focus: "Consolidate creative phases to maintain flow states.",
      difficulty: "Medium",
      steps: [
        "Schedule separate days for: 1) Outline brainstorming, 2) Drafting/recording, 3) Editing.",
        "Avoid context-switching between writing and editing in the same hour.",
        "Pre-schedule your content to maintain a consistent publishing calendar."
      ]
    };
  } else {
    // Fallback/General
    action1 = {
      title: `Environment Friction Audit for "${targetNoun}"`,
      focus: "Arrange your space to make starting the task effortless.",
      difficulty: "Easy",
      steps: [
        `Place your target materials ("${primaryResource}") in plain sight where you sit.`,
        "Remove friction to start: open your workspace or set up files the night before.",
        "Mute notifications and use browser extensions to block distracting sites."
      ]
    };
    action2 = {
      title: "Establish Micro-Habits",
      focus: "Reduce the entry barrier of the goal to prevent failure.",
      difficulty: "Easy",
      steps: [
        `Scale down your daily goal to an incredibly easy 5-minute action using "${secondaryResource}".`,
        "Commit to showing up daily at a set time, regardless of how much you accomplish.",
        "Keep a visual tracker of your daily streak to build behavioral momentum."
      ]
    };
    action3 = {
      title: "Integrate a Sunday Retro Review",
      focus: "Analyze weekly outcomes and adjust constraints.",
      difficulty: "Medium",
      steps: [
        "Every Sunday, write down: 1) What went well? 2) What distracted me? 3) What is next week's priority?",
        "Identify if your available hours are matching your actual execution.",
        "Schedule next week's priorities directly in your calendar."
      ]
    };
  }

  // Avoid list synthesis based on category
  let pitfalls = [];
  if (category === "business") {
    pitfalls = [
      `Spending hours/days designing a logo, picking color schemes, or finding names for "${targetNoun}".`,
      "Writing a long, theoretical business plan instead of contacting 5 potential customers.",
      "Building advanced settings, billing integrations, or profile menus before validating demand."
    ];
  } else if (category === "learning") {
    pitfalls = [
      `Watching courses on "${targetNoun}" at 1.5x speed without typing any code or doing exercises.`,
      "Reorganizing your Notion space, bookmark folders, or workspace instead of coding/studying.",
      "Buying more books, tutorials, or subscribing to premium learning subscriptions."
    ];
  } else if (category === "career") {
    pitfalls = [
      "Blindly clicking 'Easy Apply' on dozens of generic job boards every day.",
      "Collecting online certificates and course completion badges to put on resume.",
      "Over-designing your portfolio website styling instead of polishing your flagship project."
    ];
  } else if (category === "health") {
    pitfalls = [
      "Purchasing expensive fitness supplements, fat burners, or complex heart trackers.",
      "Obsessing over food timing or micro-nutrients before establishing baseline calorie intake.",
      "Constantly swapping exercise routines or seeking complex splits instead of simple consistency."
    ];
  } else if (category === "finance") {
    pitfalls = [
      "Micro-budgeting: spending energy comparing minor daily expenditures like coffee.",
      "Checking stock price indices, crypto accounts, or net worth values daily.",
      "Buying high-fee active funds or trading speculative currencies without research."
    ];
  } else if (category === "creative") {
    pitfalls = [
      "Pausing to correct typos, grammar, or edit sentences while in the rough draft phase.",
      "Upgrading creator hardware (microphones, cameras) before publishing at least 15 items.",
      "Checking subscriber counts, analytics, click-through rates, and views multiple times daily."
    ];
  } else {
    pitfalls = [
      "Over-planning: configuring complex tags, databases, or formatting in list apps.",
      "Reading tips and articles about productivity instead of working on the goal.",
      "Splitting focus across three major new initiatives instead of tackling one."
    ];
  }

  // Priority Pyramid
  const priority = {
    highest: `Establish direct validation/momentum for "${targetNoun}" (Today's task)`,
    medium: `Dedicate a focused daily study/work block utilizing "${primaryResource}"`,
    lowest: `Polishing minor visual designs, research, and setting up secondary admin tasks`
  };

  if (category === "business") {
    priority.highest = `Talk to 5 target users about their struggle with "${targetNoun}"`;
    priority.medium = `Launch a basic waitlist landing page using "${primaryResource}"`;
    priority.lowest = `Design logos, business cards, and file legal paperwork`;
  } else if (category === "career") {
    priority.highest = `Direct LinkedIn/email outreach to 3 professionals working in "${targetNoun}" fields`;
    priority.medium = `Optimize key architecture and README of your flagship project`;
    priority.lowest = `Browse job aggregators and submit generic automated applications`;
  } else if (category === "learning") {
    priority.highest = `Create a custom folder and write a mini-project script for "${targetNoun}"`;
    priority.medium = `Maintain a 30-minute daily morning study block using "${primaryResource}"`;
    priority.lowest = `Read reviews of other courses or reorganize note directories`;
  }

  // Timeline recommendations
  const timeline = {
    today: `Draft a 3-sentence description of "${targetNoun}" and list 3 immediate sub-tasks.`,
    thisWeek: `${frictionAction}`,
    thisMonth: `Consolidate your progress and publish/demo a single functional iteration of "${targetNoun}".`
  };

  return {
    category,
    categoryName: engineData[category].categoryName,
    themeColor: engineData[category].themeColor,
    score: leverageScore,
    summary,
    actions: [action1, action2, action3],
    pitfalls,
    priority,
    timeline
  };
};

export default function LeverageFinder() {
  const [goal, setGoal] = useState("");
  const [time, setTime] = useState("5-10");
  const [resources, setResources] = useState("");
  const [situation, setSituation] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const [source, setSource] = useState("");
  const [error, setError] = useState("");

  const loadPreset = (preset) => {
    setGoal(preset.goal);
    setTime(preset.time);
    setResources(preset.resources);
    setSituation(preset.situation);
    setResult(null);
    setError("");
    setSource("");
  };

  const handleClear = () => {
    setGoal("");
    setTime("5-10");
    setResources("");
    setSituation("");
    setResult(null);
    setError("");
    setSource("");
  };

  const handleAnalyze = async () => {
    if (!goal.trim()) return;

    setIsLoading(true);
    setLoadingStep(0);
    setResult(null);
    setError("");
    setSource("");

    // Start loading step simulation
    const steps = [
      "Analyzing goal scope & classification...",
      "Auditing resources and situational friction...",
      "Filtering out low-value activities...",
      "Generating leverage action plans..."
    ];

    let currentStep = 0;
    const loadingInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setLoadingStep(currentStep);
      }
    }, 250);

    try {
      const response = await fetch("/api/leverage-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, time, resources, situation }),
      });

      const payload = await response.json();

      clearInterval(loadingInterval);

      if (response.ok && payload.summary && Array.isArray(payload.actions)) {
        setResult(payload);
        setSource("Groq Llama API");
        return;
      }

      // Fallback to local
      const fallback = analyzeContext(goal, time, resources, situation);
      setResult(fallback);
      setSource("Local Engine Fallback");
      setError(payload?.error ? `Groq Llama is not configured yet (${payload.error}), so local fallback was used.` : "Local fallback was used.");
    } catch (err) {
      clearInterval(loadingInterval);
      const fallback = analyzeContext(goal, time, resources, situation);
      setResult(fallback);
      setSource("Local Engine Fallback");
      setError("Groq Llama request failed, so local fallback was used.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;

    const markdownReport = `
# Leverage Finder - Action Plan Report

## Goal Summary
${result.summary}

## High Leverage Actions (Top 3)
${result.actions.map((act, i) => `
### ${i + 1}. ${act.title}
* **Focus**: ${act.focus}
* **Difficulty**: ${act.difficulty}
* **Implementation Steps**:
${act.steps.map(s => `  - ${s}`).join("\n")}
`).join("\n")}

## Low Value Activities to Avoid
${result.pitfalls.map(p => `* ${p}`).join("\n")}

## Priority Ranking
* **Highest Priority (Do First)**: ${result.priority.highest}
* **Medium Priority**: ${result.priority.medium}
* **Lowest Priority (Defer/Avoid)**: ${result.priority.lowest}

## Focus Timeline Recommendations
* **Start Today**: ${result.timeline.today}
* **This Week**: ${result.timeline.thisWeek}
* **This Month**: ${result.timeline.thisMonth}

---
*Generated by Leverage Finder - Boring Tools*
`.trim();

    navigator.clipboard.writeText(markdownReport).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isFormValid = goal.trim() !== "" && resources.trim() !== "" && situation.trim() !== "";

  // Dynamic theme colors
  const getThemeClasses = (color) => {
    switch (color) {
      case "amber":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-700",
          badge: "bg-amber-100 text-amber-800",
          accent: "amber"
        };
      case "blue":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
          badge: "bg-blue-100 text-blue-800",
          accent: "blue"
        };
      case "emerald":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-700",
          badge: "bg-emerald-100 text-emerald-800",
          accent: "emerald"
        };
      case "rose":
        return {
          bg: "bg-rose-50",
          border: "border-rose-200",
          text: "text-rose-700",
          badge: "bg-rose-100 text-rose-800",
          accent: "rose"
        };
      case "indigo":
        return {
          bg: "bg-indigo-50",
          border: "border-indigo-200",
          text: "text-indigo-700",
          badge: "bg-indigo-100 text-indigo-800",
          accent: "indigo"
        };
      case "purple":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          text: "text-purple-700",
          badge: "bg-purple-100 text-purple-800",
          accent: "purple"
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          text: "text-slate-700",
          badge: "bg-slate-100 text-slate-800",
          accent: "slate"
        };
    }
  };

  const getPresetIcon = (id) => {
    switch (id) {
      case "saas":
        return (
          <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "learn":
        return (
          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "job":
        return (
          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case "health":
        return (
          <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const theme = result ? getThemeClasses(result.themeColor) : getThemeClasses("slate");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-10 w-full max-w-6xl border border-slate-200 flex flex-col gap-8">
        
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <span className="inline-flex items-center gap-1.5 self-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 w-fit mx-auto">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Productivity Engine
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Leverage Finder
          </h1>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Input your goal, constraints, and situation. Identify the 20% of actions that drive 80% of your results while avoiding low-value distractions.
          </p>
        </div>

        {/* Presets Bar */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick Presets / Examples
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-orange-50 hover:border-orange-200 hover:text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {getPresetIcon(preset.id)}
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Split Form & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-8 items-start">
          
          {/* Inputs Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col gap-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Input Context
            </h2>

            {/* Goal Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="goal" className="text-sm font-semibold text-slate-700 flex justify-between">
                <span>What is your Goal?</span>
                <span className="text-xs font-normal text-slate-400">Be specific</span>
              </label>
              <textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm text-slate-900 placeholder:text-slate-400"
                placeholder="e.g. Launch a Next.js invoice generator and get 10 paying customers"
              />
            </div>

            {/* Time Available Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Available Time
              </label>
              <ThemedDropdown
                ariaLabel="Select available time"
                value={time}
                options={timeOptions}
                onChange={setTime}
              />
            </div>

            {/* Available Resources Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="resources" className="text-sm font-semibold text-slate-700 flex justify-between">
                <span>Available Resources</span>
                <span className="text-xs font-normal text-slate-400">Budget, skills, tools</span>
              </label>
              <input
                id="resources"
                type="text"
                value={resources}
                onChange={(e) => setResources(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm text-slate-900 placeholder:text-slate-400"
                placeholder="e.g. Laptop, internet, $50 budget, basic coding skills"
              />
            </div>

            {/* Current Situation Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="situation" className="text-sm font-semibold text-slate-700 flex justify-between">
                <span>Current Situation / Friction</span>
                <span className="text-xs font-normal text-slate-400">Bottlenecks, job constraints</span>
              </label>
              <textarea
                id="situation"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm text-slate-900 placeholder:text-slate-400"
                placeholder="e.g. Working full-time, tired in evenings, struggle to stay consistent"
              />
            </div>

            {/* Actions Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!isFormValid || isLoading}
                className={`flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-950 ${!isFormValid || isLoading ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-800"}`}
              >
                Find Leverage
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
              >
                Reset
              </button>
            </div>
            
            {error && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-100 mt-1">
                {error}
              </p>
            )}
          </div>

          {/* Results Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 min-h-[450px] flex flex-col shadow-sm">
            
            {/* 1. Blank state */}
            {!isLoading && !result && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-800">No Action Plan Generated</h3>
                <p className="text-sm text-slate-400 max-w-sm">
                  Complete all the input fields on the left and click "Find Leverage" to get your customized priority roadmap.
                </p>
              </div>
            )}

            {/* 2. Loading state */}
            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm font-semibold text-slate-800 text-center">
                    {[
                      "Analyzing goal scope & classification...",
                      "Auditing resources and situational friction...",
                      "Filtering out low-value activities...",
                      "Generating leverage action plans..."
                    ][loadingStep]}
                  </p>
                  <p className="text-xs text-slate-400">Processing...</p>
                </div>
              </div>
            )}

            {/* 3. Output state */}
            {!isLoading && result && (
              <div className="flex flex-col gap-6">
                
                {/* Score and Classification */}
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goal Category</span>
                    <span className={`text-base font-extrabold ${theme.text}`}>{result.categoryName}</span>
                    {source && <span className="text-[10px] text-slate-400 font-medium">Powered by {source}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leverage Score</span>
                      <span className="text-lg font-black text-slate-800">{result.score}%</span>
                    </div>
                    {/* Score Bar */}
                    <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={result.score > 70 ? "text-emerald-500" : "text-amber-500"}
                          strokeWidth="3.5"
                          strokeDasharray={`${result.score}, 100`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold text-slate-500">LVG</span>
                    </div>
                  </div>
                </div>

                {/* 1. Goal Summary */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Goal Summary</h3>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {result.summary}
                  </p>
                </div>

                {/* 2. High Leverage Actions */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. High Leverage Actions (Top 3)</h3>
                  <div className="flex flex-col gap-3">
                    {result.actions.map((act, index) => (
                      <div key={act.title} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-2 shadow-sm hover:border-slate-300 transition">
                        <div className="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
                          <h4 className="text-sm font-bold text-slate-800 flex gap-1.5">
                            <span className="text-orange-500">{index + 1}.</span>
                            {act.title}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                            act.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            act.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {act.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 italic">Focus: {act.focus}</p>
                        <div className="mt-1 flex flex-col gap-1">
                          {act.steps.map((step, sIdx) => (
                            <div key={sIdx} className="flex gap-2 items-start text-xs text-slate-600">
                              <span className="text-slate-300 mt-0.5">•</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Low Value Activities */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Low Value Activities (Distractions)</h3>
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col gap-2">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      DO NOT FOCUS ON THESE
                    </span>
                    <ul className="flex flex-col gap-1.5">
                      {result.pitfalls.map((pit, pIdx) => (
                        <li key={pIdx} className="flex gap-2 items-start text-xs text-slate-600">
                          <svg className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>{pit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4. Priority Ranking */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. Priority Ranking</h3>
                  <div className="flex flex-col border border-slate-100 rounded-xl overflow-hidden text-xs">
                    <div className="flex items-center gap-2 p-3 bg-slate-900 text-white font-bold">
                      <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase">Highest Priority</span>
                        <span>{result.priority.highest}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-100 text-slate-800 border-t border-slate-200 font-semibold">
                      <span className="bg-slate-300 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase">Medium Priority</span>
                        <span>{result.priority.medium}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white text-slate-500 border-t border-slate-200">
                      <span className="border border-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">3</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase">Lowest Priority (Defer)</span>
                        <span>{result.priority.lowest}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Focus Recommendation */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">5. Focus Recommendation</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    
                    {/* Today */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider">Start Today</span>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed">{result.timeline.today}</p>
                    </div>

                    {/* This Week */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">This Week</span>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed">{result.timeline.thisWeek}</p>
                    </div>

                    {/* This Month */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">This Month</span>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed">{result.timeline.thisMonth}</p>
                    </div>

                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {copied ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      )}
                    </svg>
                    {copied ? "Copied!" : "Copy Report"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                  >
                    Clear
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

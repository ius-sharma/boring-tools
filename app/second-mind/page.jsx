"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ComingSoon from "@/app/components/ComingSoon";

// Preset situations that users can click to load instantly
const PRESETS = [
  {
    title: "Quit job for freelance",
    problem: "Should I quit my stable corporate job of 4 years to start a freelance UX design business?",
    context: "I have 6 months of savings, 2 warm client leads, but I'm terrified of income instability and losing corporate health benefits."
  },
  {
    title: "Buy home vs. renting",
    problem: "Should I buy a home now with current high interest rates, or continue renting for another year?",
    context: "I have a 10% down payment saved. Renting is cheaper right now, but I want long-term stability and pride of ownership."
  },
  {
    title: "Confront friend boundaries",
    problem: "Should I confront my close friend about them repeatedly canceling our plans at the last minute?",
    context: "It has happened 4 times in the past month. I value the friendship, but I feel disrespected. I hate conflict."
  },
  {
    title: "Time for side project",
    problem: "Should I dedicate 15 hours a week of my free time to building my side project instead of relaxing or socializing?",
    context: "I feel tired after work, but I really want to build something of my own. My friends might feel neglected."
  }
];

const CATEGORIES = {
  general: {
    label: "General / Other",
    keywords: []
  },
  career: {
    label: "Career & Business",
    keywords: ["job", "career", "quit", "resign", "promotion", "salary", "boss", "business", "startup", "company", "work", "colleague", "employee", "interview", "hire", "freelance", "corporate", "co-worker", "profession"]
  },
  money: {
    label: "Finance & Purchase",
    keywords: ["buy", "cost", "purchase", "invest", "save", "rent", "house", "car", "price", "money", "finance", "rates", "payment", "cheap", "expensive", "interest", "spend", "dollar", "rupee", "euro", "loan", "debt", "afford"]
  },
  social: {
    label: "Relationships & Social",
    keywords: ["friend", "relationship", "dating", "love", "ex", "break up", "confront", "boundary", "boundaries", "family", "marriage", "fight", "partner", "value", "respect", "disrespect", "conflict", "cancel", "cheat"]
  },
  productivity: {
    label: "Productivity & Time",
    keywords: ["project", "time", "build", "lazy", "relax", "focus", "priority", "dedicate", "hours", "study", "exam", "school", "college", "degree", "schedule", "procrastinate", "goals"]
  },
  health: {
    label: "Health & Well-being",
    keywords: ["health", "fitness", "diet", "sleep", "anxiety", "stress", "tired", "burnout", "mental", "lonely", "exhausted", "sick", "weight", "exercise", "recovery", "mind"]
  }
};

// Loading step message loop
const LOADING_STEPS = [
  "Consulting the Logical Mind...",
  "Calibrating statistical probabilities...",
  "Fast-forwarding to your Future Self (10 years out)...",
  "Assessing downside risk indicators...",
  "Evaluating Plan B and defensive mitigations...",
  "Scanning for asymmetric upside and hidden leverage...",
  "Synthesizing opportunity perspectives...",
  "Structuring mental model outputs..."
];

const TOOL_STATUS = "upcoming"; // Set to "live" to deploy and enable routing

export default function SecondMindPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Second Mind" />;
  }

  const [problem, setProblem] = useState("");
  const [context, setContext] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("auto"); // "auto" or key of CATEGORIES
  const [detectedCategory, setDetectedCategory] = useState("general");
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [source, setSource] = useState("Local fallback");
  const [error, setError] = useState("");
  const [expandedCards, setExpandedCards] = useState({
    logical: true,
    future: true,
    risk: true,
    opportunity: true
  });
  
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);
  const loadingTimerRef = useRef(null);

  // Auto-detect category based on problem and context text
  useEffect(() => {
    if (!problem && !context) {
      setDetectedCategory("general");
      return;
    }

    const fullText = `${problem} ${context}`.toLowerCase();
    let bestCategory = "general";
    let maxScore = 0;

    Object.entries(CATEGORIES).forEach(([catKey, catData]) => {
      if (catKey === "general") return;
      let score = 0;
      catData.keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b|${keyword}`, "g");
        const matches = fullText.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      if (score > maxScore) {
        maxScore = score;
        bestCategory = catKey;
      }
    });

    setDetectedCategory(bestCategory);
  }, [problem, context]);

  // Clean toast on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (loadingTimerRef.current) window.clearInterval(loadingTimerRef.current);
    };
  }, []);

  const showToast = (type, message) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 2000);
  };

  const handleLoadPreset = (preset) => {
    setProblem(preset.problem);
    setContext(preset.context);
    setSelectedCategory("auto");
    setResult(null);
    showToast("success", `Loaded preset: "${preset.title}"`);
  };

  const handleClear = () => {
    setProblem("");
    setContext("");
    setSelectedCategory("auto");
    setResult(null);
    showToast("success", "Cleared all inputs.");
  };

  const activeCategory = selectedCategory === "auto" ? detectedCategory : selectedCategory;

  // Formats problem into a readable subphrase to embed in templates
  const formatProblemPhrase = (text) => {
    let phrase = text.trim();
    if (!phrase) return "address this situation";
    
    // Strip trailing question mark
    if (phrase.endsWith("?")) {
      phrase = phrase.slice(0, -1);
    }
    // Strip starting question phrase
    phrase = phrase.replace(/^(should i|deciding whether to|deciding to|how to|i want to|should we|deciding if we should|can i|is it a good idea to|whether to)\s+/i, "");
    
    // Lowercase first letter
    if (phrase.length > 0) {
      phrase = phrase.charAt(0).toLowerCase() + phrase.slice(1);
    }
    return phrase;
  };

  const handleAnalyze = async () => {
    if (!problem.trim()) {
      showToast("error", "Please input a problem or situation to analyze.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setLoadingStepIndex(0);
    setError("");

    // Simulate loading steps dynamically while request is processing
    let currentStep = 0;
    if (loadingTimerRef.current) window.clearInterval(loadingTimerRef.current);
    loadingTimerRef.current = window.setInterval(() => {
      currentStep = (currentStep + 1) % LOADING_STEPS.length;
      setLoadingStepIndex(currentStep);
    }, 350);

    try {
      const response = await fetch("/api/second-mind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem,
          context,
          category: activeCategory,
        }),
      });

      if (loadingTimerRef.current) {
        window.clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }

      const payload = await response.json();

      if (response.ok && payload.logical && payload.future && payload.risk && payload.opportunity) {
        setResult({
          logical: payload.logical,
          future: payload.future,
          risk: payload.risk,
          opportunity: payload.opportunity,
          categoryLabel: CATEGORIES[activeCategory].label,
          problemText: problem,
          contextText: context
        });
        setSource("Groq API");
        setIsLoading(false);
        showToast("success", "Analysis generated from multiple perspectives!");
        return;
      }

      // API returned error or incomplete structure
      const fallback = runLocalAnalysis();
      setResult(fallback);
      setSource("Local fallback");
      setError(payload?.error ? `LLM error (${payload.error}), so local fallback was used.` : "LLM response format incorrect; local fallback used.");
      setIsLoading(false);
      showToast("success", "Analysis generated (local fallback)!");
    } catch (err) {
      if (loadingTimerRef.current) {
        window.clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      const fallback = runLocalAnalysis();
      setResult(fallback);
      setSource("Local fallback");
      setError("API request failed; local fallback was used.");
      setIsLoading(false);
      showToast("success", "Analysis generated (local fallback)!");
    }
  };

  const runLocalAnalysis = () => {
    const phrase = formatProblemPhrase(problem);
    const cat = activeCategory;

    // Persisted Data mappings
    const dataLogical = {
      general: {
        analysis: `When analyzing your consideration to ${phrase}, we must strip away the emotional noise and examine the core variables. Rationally, every decision is a calculation of probabilities, transaction costs, and opportunity costs. A common fallacy here is loss aversion: overvaluing what you might lose while underestimating the potential gains. We must look at the objective facts of your situation, the resources you have, and the statistical likelihood of success rather than your immediate anxiety.`,
        concerns: [
          "Status quo bias: staying in a mediocre situation because the cost of change feels more immediate than the cost of stagnation.",
          "Information asymmetry: making a major decision based on assumptions rather than concrete, verified facts.",
          "Sunk cost fallacy: continuing down a path simply because you have already invested time or money into it."
        ],
        questions: [
          "If you had to assign a percentage probability of success, what would it be and why?",
          "If you were advising a stranger in your exact position, what would your rational recommendation be?",
          "What is the cost of doing nothing for the next six months?"
        ]
      },
      career: {
        analysis: `Regarding your choice to ${phrase}, career shifts represent a calculation of professional leverage, financial runway, and skill acquisition. Logically, a career is a portfolio of skills. We must weigh the marketable value of what you will learn against the potential loss of stability. Examine if you have a sufficient financial runway, and separate the social pressure of corporate status from actual career growth.`,
        concerns: [
          "Relying on optimistic assumptions about client acquisition or market demand without initial testing.",
          "Ignoring the immediate loss of benefits, stable income, or career momentum without a clear transition plan.",
          "Overestimating the security of your current job: in the modern economy, the 'stable' path is often riskier than it appears."
        ],
        questions: [
          "What is your exact monthly burn rate, and how many months of runway do your savings provide?",
          "How will this move change your long-term market value and set of skills over the next 2-3 years?",
          "Can you run a low-risk micro-experiment (e.g. side gig, informational interviews) before making the full leap?"
        ]
      },
      money: {
        analysis: `Evaluating your financial proposal to ${phrase} requires a strict audit of capital allocation, cash flows, and compound returns. Every dollar spent today has a double cost: the cash itself, plus what that cash would have earned if invested in compounding assets over the next 10 years. Logically, we must verify if this purchase represents an appreciating asset, a depreciating asset, or a pure expense, and check if it fits your long-term savings goals.`,
        concerns: [
          "Focusing purely on the monthly payment or interest rate instead of the total cost of ownership.",
          "Emotionally reclassifying a luxury or convenience purchase as an absolute 'necessity' to justify it.",
          "Over-leveraging your savings, leaving you vulnerable to unexpected financial emergencies."
        ],
        questions: [
          "What is the total cost of ownership over 5 years (including maintenance, interest, and insurance)?",
          "If you invested this money at an 8% annual return instead, what would it be worth in 10 years?",
          "Could you achieve 80% of the utility of this purchase through a cheaper alternative or by renting/borrowing?"
        ]
      },
      social: {
        analysis: `Navigating your interpersonal choice to ${phrase} requires analyzing social dynamics, boundaries, and relationship incentives. Logically, relationships are sustained by patterns of behavior and clear communication. If a boundary is repeatedly violated, it is not a misunderstanding—it is a lack of boundary enforcement. We must analyze whether avoiding temporary conflict is causing long-term emotional debt.`,
        concerns: [
          "Conflict avoidance: choosing short-term peace at the expense of cumulative resentment.",
          "Mind-reading fallacy: assuming you know their intentions or feelings without direct, open dialogue.",
          "Expecting people to change their behavior without an explicit, calm boundary conversation."
        ],
        questions: [
          "Has this behavior occurred repeatedly (a pattern) or is it a rare, situational exception?",
          "What is the most objective, non-accusatory way you can state your feelings and request a change?",
          "What is the worst realistic outcome of having this conversation, and can you handle it?"
        ]
      },
      productivity: {
        analysis: `Regarding your plan to ${phrase}, time is your only non-renewable asset. Commitments of time must be audited with the same rigor as financial investments. Logically, to start doing something new, you must stop doing something else. We must identify what current activities you will deprioritize to fit this in, and verify if you have the mental energy—not just the hours—to execute.`,
        concerns: [
          "Planning Fallacy: underestimating how long tasks will take and overestimating your daily energy levels.",
          "Trying to add a major new commitment without cutting out any existing habits or obligations.",
          "Getting caught up in the 'busywork' of planning rather than taking direct action."
        ],
        questions: [
          "What specific activities or commitments will you drop to free up the required time?",
          "What is the single most important, high-leverage task that drives progress on this goal?",
          "How can you break this down into a 2-hour action that you can complete in the next 48 hours?"
        ]
      },
      health: {
        analysis: `Addressing your situation concerning to ${phrase} requires realizing that physical and cognitive well-being form the foundation of all your goals. When your body or mind is redlined, your decision-making, productivity, and emotional regulation deteriorate. Logically, taking time for recovery is not 'laziness'—it is a physiological requirement for sustained performance. We must identify the core stressor and look at biological leverage points (sleep, sunlight, movement, nutrition).`,
        concerns: [
          "The belief that you can 'push through' chronic fatigue or burnout without paying a major health price later.",
          "Treating symptoms (coffee, distractions, medication) rather than addressing the root cause of stress.",
          "Neglecting basic physical needs (sleep quality, consistent movement) while focusing on external problems."
        ],
        questions: [
          "Which of your foundational biological inputs (sleep, movement, hydration, nutrition) is currently most depleted?",
          "If you continue at your current stress levels for 6 more months, what is the logical impact on your health?",
          "What is the smallest, easiest health adjustment you can make today to increase your energy?"
        ]
      }
    };

    const dataFuture = {
      general: {
        analysis: `Close your eyes and step 10 years into the future. Imagine a wiser, older version of you looking back on this moment. From that altitude, the daily anxieties and details fade. What remains is legacy, growth, and regrets of inaction. Usually, we regret the risks we did not take far more than the failures we experienced. Your future self urges you to consider if choosing to ${phrase} aligns with the person you want to become, or if you are choosing safety over growth.`,
        concerns: [
          "Prioritizing short-term comfort and safety over long-term alignment and capability.",
          "Letting temporary embarrassment or social judgment dictate a major path in your life.",
          "Forgetting that a year of stagnation compounds just as quickly as a year of progress."
        ],
        questions: [
          "In 10 years, will you be glad you took this action, or will you have forgotten why you were so worried?",
          "How does this choice shape the story you will tell about your life a decade from now?",
          "What would the version of you who has already successfully navigated this dilemma advise you to do?"
        ]
      },
      career: {
        analysis: `Your 10-years-older self looks back at your choice to ${phrase} with a broader perspective on your career arc. A career is not a single job; it is a series of chapters. Your future self knows that skill acquisition, creative autonomy, and ownership are what matter in the long run. They ask whether you are staying in a comfortable chapter because you are afraid of the messy beginning of the next one.`,
        concerns: [
          "Staying in a dead-end role out of habit, delaying your career growth by years.",
          "Allowing fear of temporary income drops to keep you from building valuable equity or autonomy.",
          "Prioritizing external prestige over your internal sense of purpose and daily energy."
        ],
        questions: [
          "Will you regret not trying this career path when you look back at age 70?",
          "Does your current path allow you to build the compound skills needed for your long-term vision?",
          "If you make this change and fail, what is the worst career state you land in, and is it really that bad?"
        ]
      },
      money: {
        analysis: `From the perspective of 10 years out, your future self looks at the decision to ${phrase} through the lens of compound wealth and financial freedom. Money is stored time. Every financial decision either buys you future freedom or locks you into current labor. Your future self wants to know if this purchase will bring lasting value and security, or if it is just a temporary dopamine hit that delays your financial independence.`,
        concerns: [
          "Siphoning off capital that could compound into substantial wealth for your future security.",
          "Creating lifestyle inflation that forces you to work longer in jobs you may not love.",
          "Confusing material possessions with true security and self-worth."
        ],
        questions: [
          "Will this purchase still hold value, utility, or positive memory for you in 5 years?",
          "How many days of future freedom are you trading to buy this item today?",
          "Would your future self prefer to have this item now, or a larger financial cushion in your bank account?"
        ]
      },
      social: {
        analysis: `Looking back on your relationship choice to ${phrase}, your future self remembers who stood by you and how you handled conflict. In the long run, your self-respect and the quality of your core relationships are what dictate your quality of life. Your future self knows that clear, honest boundaries are the highest form of respect. They want you to act with dignity, avoiding petty fights but firmly protecting your peace of mind.`,
        concerns: [
          "Allowing toxic or draining relationships to consume years of your emotional energy.",
          "Damaging a valuable, long-term friendship over a temporary, emotional misunderstanding.",
          "Failing to speak your truth, leading to a long-term erosion of your self-esteem."
        ],
        questions: [
          "Will this relationship dynamic or conflict matter to you in 2 years, let alone 10?",
          "Are you keeping this person in your life because of who they are now, or who they used to be?",
          "How would you handle this situation if you wanted to set an example of self-respect for your future children?"
        ]
      },
      productivity: {
        analysis: `Your future self looks at your daily schedule and your decision to ${phrase} as the building blocks of your life. We are what we repeatedly do. Ten years of progress is just 3,650 days of small actions. Your future self knows that starting that project, book, or skill today will compound into expertise a decade from now. They urge you to start, even poorly, rather than waiting for the 'perfect' time that never comes.`,
        concerns: [
          "Allowing years to pass in a cycle of planning and procrastinating without ever launching.",
          "Letting daily distractions steal the focused time needed to build your life's work.",
          "Sacrificing your long-term goals for short-term entertainment and comfort."
        ],
        questions: [
          "If you dedicate 15 hours a week to this for 1 year, where will you be compared to if you don't?",
          "What is the version of you in 5 years going to wish you had started today?",
          "How can you make the daily habit of working on this so easy that you can't fail to stick to it?"
        ]
      },
      health: {
        analysis: `Regarding your physical well-being and choice to ${phrase}, your future self resides in the body you are building today. Every habit, hour of sleep, and stress response is a deposit or withdrawal from your health account. Your future self pleads with you to protect your energy. They remind you that you cannot enjoy career success or wealth if your body is broken. They encourage you to prioritize longevity, recovery, and daily physical vitality.`,
        concerns: [
          "Accumulating health debt (chronic stress, poor sleep, lack of movement) that becomes irreversible in your 40s or 50s.",
          "Letting work or social pressure consistently override your body's clear signals for rest.",
          "Believing that you can fix your health 'later' when you are less busy."
        ],
        questions: [
          "If you look back in 10 years, will you regret taking a week off to recover, or will you regret burning out?",
          "What is one lifestyle habit you are doing now that your future self is begging you to stop?",
          "How can you restructure your daily life to treat your health as a non-negotiable priority?"
        ]
      }
    };

    const dataRisk = {
      general: {
        analysis: `To assess the risk of your proposal to ${phrase}, we must look at the downside. Jeff Bezos popularized the concept of Type 1 decisions (irreversible, 'one-way doors') and Type 2 decisions (reversible, 'two-way doors'). If this is a one-way door, we must proceed with extreme caution. We need to evaluate the worst-case scenario, the probability of that scenario occurring, your margin of safety, and your concrete exit plan if things go sideways. Hope is not a strategy; we need defensive planning.`,
        concerns: [
          "Failing to identify the point of no return (where a decision becomes irreversible).",
          "Having no Plan B or contingency reserves, leaving you entirely dependent on the best-case scenario.",
          "Cascading risks: how a failure in this decision might impact other areas of your life (e.g. health, finances)."
        ],
        questions: [
          "Is this a one-way door or a two-way door? If it fails, how easily can you undo it?",
          "What is the absolute, realistic worst-case scenario, and what is your plan to survive it?",
          "Do you have a margin of safety (e.g., savings, back-up options) to absorb a 50% underperformance of your plans?"
        ]
      },
      career: {
        analysis: `The risk in your career proposal to ${phrase} revolves around income disruption, professional reputation, and opportunity cost. Logically, transitioning without validation is high-risk. If your freelance leads dry up, or your new business takes longer to monetize, how will you cover basic needs? We must look at the downside: losing corporate benefits, depleting your savings, and the friction of trying to re-enter the corporate job market if things don't work out.`,
        concerns: [
          "Burning professional bridges at your current job, making it impossible to return if needed.",
          "Relying on a few soft client leads that might flake or delay payment for months.",
          "Exhausting your financial runway before your new venture reaches sustainability."
        ],
        questions: [
          "If your income goes to zero for the first 3 months, how will you cover rent/mortgage and insurance?",
          "What is the exact trigger event (e.g. savings down to $5,000) that means 'the experiment has failed, time to get a job'?",
          "Can you keep your current job and validate your idea on weekends, or do you have to quit first?"
        ]
      },
      money: {
        analysis: `Analyzing the financial downside of your plan to ${phrase} requires looking at illiquidity, debt service, and cash flow strain. High interest rates compound your risk by increasing the cost of capital. If you buy a house or make a large purchase, you are locking in a fixed monthly outflow. If your income drops, this outflow becomes a massive anchor. We must check if this purchase leaves you 'house poor' or liquid-poor, with no cash to invest in opportunities or cover emergencies.`,
        concerns: [
          "Committing a huge portion of your net worth to an illiquid asset, making it hard to access cash in a crisis.",
          "Underestimating transaction costs (agent fees, closing costs, taxes) which immediately eat into your equity.",
          "Overestimating your long-term income stability, assuming your salary will only go up."
        ],
        questions: [
          "If you lost your primary source of income tomorrow, how many months could you afford this new obligation?",
          "What happens if interest rates stay high, or if asset values drop by 20% right after you buy?",
          "How much emergency cash will you have left in the bank after closing this deal?"
        ]
      },
      social: {
        analysis: `The risk in your interpersonal plan to ${phrase} is relationship fracture, awkwardness, or escalation of conflict. Difficult conversations can go wrong if handled with high emotion or poor timing. If you confront a friend or set a boundary, they may react defensively, withdraw, or gaslight you. We must assess if this relationship is resilient enough to handle honesty, and plan how you will maintain your composure if they lash out.`,
        concerns: [
          "Allowing pent-up emotions to make your delivery aggressive or blaming, rather than constructive.",
          "Losing a valuable friendship or professional connection over a relatively minor, fixable issue.",
          "The boundary conversation being turned against you, creating office or family drama."
        ],
        questions: [
          "Are you prepared for the possibility that they may not apologize and instead get angry or defensive?",
          "How can you frame the conversation around your feelings and the relationship's health rather than their character?",
          "If they react poorly and cut ties, can you accept that outcome as the cost of standing up for yourself?"
        ]
      },
      productivity: {
        analysis: `The risk in committing to ${phrase} is burnout, neglected relationships, and opportunity cost. Time is zero-sum. If you spend 15 hours a week on this project, that is 15 hours you cannot spend resting, exercising, or hanging out with loved ones. If the project fails or you lose steam, you may feel deep regret about the time wasted, and your relationships may have suffered from your neglect.`,
        concerns: [
          "Over-committing and failing, which damages your self-trust and confidence for future projects.",
          "Damaging your performance at your day job due to chronic fatigue and split focus.",
          "Isolating yourself from friends and family, leading to emotional loneliness and lack of support."
        ],
        questions: [
          "What specific relationships or self-care habits are most likely to suffer, and how will you protect them?",
          "What is your plan to prevent burnout if you don't see any positive results for the first 3 months?",
          "If you decide to quit this project in 2 months, how will you frame that choice so it feels like a pivot, not a failure?"
        ]
      },
      health: {
        analysis: `The risk in your situation regarding ${phrase} is physical collapse, cognitive decline, or long-term systemic damage. The human body is a biological machine; it cannot run on stress hormones indefinitely. If you ignore fatigue, lack of sleep, or mental health warnings, the risk is not just feeling tired—it is chronic inflammation, a weakened immune system, clinical burnout, and depression. We must treat your current symptoms as a high-priority warning light on your dashboard.`,
        concerns: [
          "Suffering a major health crisis (heart issues, panic attacks, clinical depression) that forces you to stop everything.",
          "Making critical mistakes in your work or relationships due to brain fog and emotional exhaustion.",
          "Developing unhealthy coping mechanisms (caffeine abuse, alcohol, binge eating) that create secondary problems."
        ],
        questions: [
          "What is the absolute red line in your health (e.g. chronic insomnia, chest pain) that will force you to see a doctor immediately?",
          "How is your current state of exhaustion affecting the quality of your decisions and your behavior toward others?",
          "What is the most critical, immediate health risk of continuing your current lifestyle, and how can you mitigate it tonight?"
        ]
      }
    };

    const dataOpportunity = {
      general: {
        analysis: `Now let's look at the upside. What if this goes right? The Opportunity Perspective focuses on growth, asymmetric payoffs, and positive tailwinds. An asymmetric payoff is a situation where the downside is capped and known (e.g. losing 6 months of savings), but the upside is virtually unlimited (e.g. career freedom, wealth, lifelong happiness). We must evaluate how choosing to ${phrase} opens new doors, builds valuable assets, and creates positive options that don't exist today.`,
        concerns: [
          "Fear-driven paralysis: letting the risk of minor losses prevent you from capturing life-changing gains.",
          "Status quo trap: failing to see that staying comfortable is actually a slow decline in options.",
          "Underestimating your capacity to adapt, learn, and pivot when faced with a new challenge."
        ],
        questions: [
          "What is the best possible, dream-scenario outcome if you succeed beyond expectations?",
          "What new doors, networks, or skills will this open for you, even if the primary goal is not fully achieved?",
          "How can you structure this decision so that even if you fail, you still win in terms of learning and growth?"
        ]
      },
      career: {
        analysis: `Looking at the upside of your career move to ${phrase}, this is your chance to build leverage, autonomy, and ownership. Starting a business or taking a new path has asymmetric upside: your downside is capped at returning to a job, but your upside is financial independence, control over your schedule, and the pride of building something. Even if the business fails, you will return to the job market with 10x the skills, strategic thinking, and confidence of a typical employee.`,
        concerns: [
          "Failing to see that the corporate ladder is often a slow, linear grind compared to the exponential growth of ownership.",
          "Under-pricing your own value and failing to sell your skills with confidence.",
          "Missing a window of high energy, low obligations, or market demand by waiting too long."
        ],
        questions: [
          "If this freelance or business venture succeeds, what does your ideal Tuesday look like in 3 years?",
          "What unique skills (sales, operations, product) will you learn by running your own show that you could never learn as an employee?",
          "How can you leverage your current network to land your first client or validation within 30 days?"
        ]
      },
      money: {
        analysis: `The opportunity in your financial decision to ${phrase} centers on wealth acceleration, asset appreciation, or strategic leverage. Real estate or investments can build long-term equity, hedge against inflation, and provide stability. If you buy a house or make an investment, you are converting cash into an asset that can build equity over time. We must look at the upside: locking in your housing cost, tax advantages, and building a foundation for long-term wealth.`,
        concerns: [
          "Letting short-term market fears prevent you from acquiring quality assets that will appreciate over decades.",
          "Failing to recognize that renting is a 100% loss of capital (sunk cost) while homeownership builds equity (savings).",
          "Missing out on matching employer contributions, tax write-offs, or compound interest cycles."
        ],
        questions: [
          "How does owning this asset change your net worth and stability in 10 years?",
          "Can you add value to this purchase (e.g. house hacking, upgrading a car, learning a skill) to increase its return?",
          "What is the strategic value of taking this step now rather than waiting for conditions that may never be perfect?"
        ]
      },
      social: {
        analysis: `The opportunity in choosing to ${phrase} is the creation of deep, authentic connections and a massive boost in your self-respect. When you speak honestly and set healthy boundaries, you filter your relationships. People who respect you will adjust and draw closer; people who were exploiting your lack of boundaries will fall away. This is a positive filter. By having this difficult conversation, you open the door to a mature, resilient relationship based on mutual respect rather than passive aggression.`,
        concerns: [
          "Accepting subpar treatment because you are afraid of being alone, which lowers your standards for all future relationships.",
          "Missing the chance to help your friend grow by failing to give them honest, constructive feedback.",
          "Allowing a relationship to rot from the inside out because you were too polite to save it."
        ],
        questions: [
          "How much closer and stronger could this relationship become if you successfully resolve this issue together?",
          "How will standing up for yourself in this situation increase your confidence in other areas of your life?",
          "What is the positive relationship culture you want to create in your life, and does this action set that standard?"
        ]
      },
      productivity: {
        analysis: `The opportunity in dedicating time to ${phrase} is the compound effect of creative focus. Working on a side project or skill creates a source of leverage outside your day job. It gives you a sense of purpose, a creative outlet, and a potential escape hatch. Even if it takes time and energy, the opportunity is finding your true flow, building a personal brand, and discovering what you are truly capable of when you are the boss.`,
        concerns: [
          "Underestimating the pride and energy you will gain from completing something of your own, which offsets the tiredness.",
          "Letting your free hours vanish into passive consumption (TV, scrolling) instead of active creation.",
          "Failing to see that the best time to build a project is when you have the safety net of a day job."
        ],
        questions: [
          "What is the absolute best-case scenario for this side project in 1 year if you stay consistent?",
          "What new professional opportunities, partnerships, or friendships will you attract by putting your work out there?",
          "How can you treat this 15 hours a week as a creative playground rather than another chore, so it energizes you?"
        ]
      },
      health: {
        analysis: `The opportunity in focusing on your well-being and choosing to ${phrase} is a complete reboot of your daily capacity. When your body is rested, hydrated, and energized, your baseline changes. You think faster, react calmer, and handle stress with ease. The opportunity is not just avoiding illness; it is achieving peak cognitive performance, emotional resilience, and waking up excited for the day. Rest is the ultimate productivity hack.`,
        concerns: [
          "Missing out on your full potential because you are operating at 50% battery life every day.",
          "Failing to see that a healthy lifestyle increases your daily focus, allowing you to get more done in less time.",
          "Undervaluing the simple joy of feeling physically light, clear-headed, and calm."
        ],
        questions: [
          "If you were operating at 100% energy and focus, how much faster could you solve your other life problems?",
          "What does a vibrant, healthy, and high-energy version of you look like, and how does that person start their day?",
          "What is one recovery habit (e.g. 8 hours sleep, morning walk) that will immediately elevate your mood tomorrow?"
        ]
      }
    };

    return {
      logical: dataLogical[cat] || dataLogical.general,
      future: dataFuture[cat] || dataFuture.general,
      risk: dataRisk[cat] || dataRisk.general,
      opportunity: dataOpportunity[cat] || dataOpportunity.general,
      categoryLabel: CATEGORIES[cat].label,
      problemText: problem,
      contextText: context
    };
  };

  // Generate plain text report structure
  const reportText = useMemo(() => {
    if (!result) return "";
    const timestamp = new Date().toLocaleString();
    return `==================================================
SECOND MIND PERSPECTIVES REPORT
Generated: ${timestamp}
==================================================

SITUATION / PROBLEM:
--------------------------------------------------
"${result.problemText}"

${result.contextText ? `CONTEXT:\n--------------------------------------------------\n"${result.contextText}"\n` : ""}
CLASSIFIED PERSPECTIVE CORE:
--------------------------------------------------
Category: ${result.categoryLabel}


==================================================
1. LOGICAL MIND (🧠)
==================================================
ANALYSIS:
${result.logical.analysis}

KEY CONCERNS:
${result.logical.concerns.map((c) => `* ${c}`).join("\n")}

QUESTIONS TO ASK YOURSELF:
${result.logical.questions.map((q) => `* ${q}`).join("\n")}


==================================================
2. FUTURE SELF (⏳)
==================================================
ANALYSIS:
${result.future.analysis}

KEY CONCERNS:
${result.future.concerns.map((c) => `* ${c}`).join("\n")}

QUESTIONS TO ASK YOURSELF:
${result.future.questions.map((q) => `* ${q}`).join("\n")}


==================================================
3. RISK PERSPECTIVE (🛡️)
==================================================
ANALYSIS:
${result.risk.analysis}

KEY CONCERNS:
${result.risk.concerns.map((c) => `* ${c}`).join("\n")}

QUESTIONS TO ASK YOURSELF:
${result.risk.questions.map((q) => `* ${q}`).join("\n")}


==================================================
4. OPPORTUNITY PERSPECTIVE (🚀)
==================================================
ANALYSIS:
${result.opportunity.analysis}

KEY CONCERNS:
${result.opportunity.concerns.map((c) => `* ${c}`).join("\n")}

QUESTIONS TO ASK YOURSELF:
${result.opportunity.questions.map((q) => `* ${q}`).join("\n")}

--------------------------------------------------
Generated client-side via Boring Tools - Second Mind.
==================================================`;
  }, [result]);

  const handleCopyReport = async () => {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
      showToast("success", "Report copied to clipboard!");
    } catch {
      showToast("error", "Copy failed. Please try again.");
    }
  };

  const handleDownloadReport = () => {
    if (!result || typeof window === "undefined") return;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const fileSafeProblem = result.problemText
      .slice(0, 20)
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    
    link.download = `second-mind-report-${fileSafeProblem}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showToast("success", "Report downloaded successfully.");
  };

  const toggleCard = (cardKey) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 font-sans">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700 font-bold">
            Psychology & Decisions
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-2">Second Mind</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Break mental blocks by analyzing your problems, decisions, or conflicts from four distinct cognitive viewpoints.
          </p>
        </div>

        {/* Form and Presets Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-6 items-start">
          
          {/* Left Panel: Inputs & Settings */}
          <div className="space-y-6">
            
            {/* Presets Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Load preset scenario</h2>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLoadPreset(p)}
                    className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-350 hover:bg-orange-50 hover:text-orange-850 transition text-left cursor-pointer active:scale-[0.98] inline-flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v1.5m-3-1.5h6m-3-13.5v1.5m3.536.964l-1.06 1.06m-8.95 0l-1.06-1.06M21 12h-1.5m-15 0H3m16.536 4.536l-1.06-1.06m-8.95 1.06l-1.06-1.06M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{p.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-950">Describe your dilemma</h2>
              
              {/* Problem Field */}
              <div className="space-y-2">
                <label htmlFor="problem-input" className="block text-sm font-semibold text-slate-700">
                  What is the problem or situation? <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="problem-input"
                  rows={4}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Should I quit my stable 9-to-5 job...?"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 text-sm leading-relaxed"
                />
              </div>

              {/* Context Field */}
              <div className="space-y-2">
                <label htmlFor="context-input" className="block text-sm font-semibold text-slate-700">
                  Optional Context (Feelings, variables, stakes)
                </label>
                <textarea
                  id="context-input"
                  rows={3}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="I have some savings but worry about stability..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 text-sm leading-relaxed"
                />
              </div>

              {/* Category Selector Override */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Cognitive Focus / Category
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("auto")}
                    className={`py-2 px-3 rounded-lg border font-semibold text-left transition flex items-center gap-1.5 ${
                      selectedCategory === "auto"
                        ? "border-orange-500 bg-orange-50 text-orange-800 animate-pulse"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 text-orange-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zM18 10.5l-.5 3-.5-3-3-.5 3-.5.5-3 .5 3 3 .5-3 .5zM19.07 4.93l-.21 1.25-.21-1.25-1.25-.21 1.25-.21.21-1.25.21 1.25 1.25.21-1.25.21z" />
                    </svg>
                    <span>Auto-Detect {selectedCategory === "auto" && `(${CATEGORIES[detectedCategory].label})`}</span>
                  </button>
                  {Object.entries(CATEGORIES).map(([catKey, catData]) => (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setSelectedCategory(catKey)}
                      className={`py-2 px-3 rounded-lg border font-semibold text-left transition ${
                        selectedCategory === catKey
                          ? "border-orange-500 bg-orange-50 text-orange-800"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      {catData.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white shadow-sm hover:bg-orange-600 transition active:scale-[0.98] cursor-pointer"
                >
                  Analyze Situation
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Scientific Note */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">How to use Second Mind</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                Psychological research shows that our brains rely on cognitive shortcuts when stressed. Looking at a challenge through structured, opposing lenses (Rational logic vs. Long-term projection, Cautious risk analysis vs. Opportunistic expansion) forces your brain to break free of binary choices and identify creative third options.
              </p>
            </div>

          </div>

          {/* Right Panel: Loading / Empty / Results */}
          <div className="space-y-6">
            
            {/* 1. Empty State */}
            {!isLoading && !result && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Awaiting your dilemma</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-2">
                  Input a situation on the left or load a preset. The engine will evaluate the scenario and structure four viewpoints.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md mt-6 text-left">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-indigo-600 text-sm font-bold">Logical Mind</span>
                    </div>
                    <span className="text-slate-500 text-xs leading-normal block">Fact-based assessments, trade-offs, biases.</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-amber-600 text-sm font-bold">Future Self</span>
                    </div>
                    <span className="text-slate-500 text-xs leading-normal block">10-year outlook, regrets, alignment.</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                      <span className="text-rose-600 text-sm font-bold">Risk Perspective</span>
                    </div>
                    <span className="text-slate-500 text-xs leading-normal block">Worst-case outcomes, Plan B, reversible gates.</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41a14.98 14.98 0 00-6.16 12.12c2.47-.3 4.8-1.5 6.58-3.41" />
                      </svg>
                      <span className="text-emerald-600 text-sm font-bold">Opportunity</span>
                    </div>
                    <span className="text-slate-500 text-xs leading-normal block">Upside, learning loops, asymmetric pays.</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Loading State */}
            {isLoading && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                {/* Beautiful custom double-ring spinner */}
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-orange-100 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 transition-all duration-300">Processing Angles</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-2 animate-pulse h-12">
                  {LOADING_STEPS[loadingStepIndex]}
                </p>
              </div>
            )}

            {/* 3. Results Section */}
            {result && (
              <div className="space-y-6">
                
                {/* Results Header */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-700">
                      <span>Perspective Core Loaded</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        {source === "Groq API" ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-orange-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                            </svg>
                            AI Generated
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Local Fallback
                          </>
                        )}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-950 mt-1">
                      Reframing: "{result.problemText.slice(0, 50)}{result.problemText.length > 50 ? '...' : ''}"
                    </h3>
                  </div>
                  <div className="shrink-0 flex gap-2">
                    <button
                      onClick={handleCopyReport}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-black text-white text-xs font-semibold shadow transition active:scale-[0.98] cursor-pointer"
                    >
                      Copy Report
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      className="px-3 py-1.5 rounded-lg border border-orange-500 bg-white hover:bg-orange-50 text-orange-600 text-xs font-semibold shadow transition active:scale-[0.98] cursor-pointer"
                    >
                      Download TXT
                    </button>
                  </div>
                </div>

                {/* Error Banner if Fallback is Active */}
                {error && (
                  <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200/60 rounded-xl p-3.5 flex flex-col gap-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700">Offline Fallback Engaged</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Perspective Cards */}
                <div className="space-y-4">

                  {/* Card 1: Logical Mind */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
                    <button
                      onClick={() => toggleCard("logical")}
                      className="w-full flex items-center justify-between p-5 text-left border-b border-slate-100 hover:bg-slate-50/50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-indigo-900">Logical Mind</h4>
                          <span className="text-xs text-indigo-500 font-medium">Objective rationality, probabilities, fallacies</span>
                        </div>
                      </div>
                      <div className="p-1 text-slate-400 hover:text-slate-700">
                        <svg className={`w-5 h-5 transform transition-transform duration-200 ${expandedCards.logical ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {expandedCards.logical && (
                      <div className="p-6 space-y-4 text-sm leading-relaxed border-t border-slate-50 bg-slate-50/30">
                        <div>
                          <h5 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-1.5 text-indigo-600">Reframed Analysis</h5>
                          <p className="text-slate-700">{result.logical.analysis}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-slate-800 uppercase tracking-wide text-xs text-indigo-600">Key Concerns</h5>
                            <ul className="list-disc list-inside text-slate-600 pl-1 space-y-1">
                              {result.logical.concerns.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-slate-800 uppercase tracking-wide text-xs text-indigo-600">Questions to Ask</h5>
                            <ul className="list-disc list-inside text-slate-600 pl-1 space-y-1">
                              {result.logical.questions.map((q, i) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Future Self */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
                    <button
                      onClick={() => toggleCard("future")}
                      className="w-full flex items-center justify-between p-5 text-left border-b border-slate-100 hover:bg-slate-50/50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-amber-900">Future Self (10 Years Out)</h4>
                          <span className="text-xs text-amber-500 font-medium">Long-term alignment, regrets, compounding effects</span>
                        </div>
                      </div>
                      <div className="p-1 text-slate-400 hover:text-slate-700">
                        <svg className={`w-5 h-5 transform transition-transform duration-200 ${expandedCards.future ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {expandedCards.future && (
                      <div className="p-6 space-y-4 text-sm leading-relaxed border-t border-slate-50 bg-slate-50/30">
                        <div>
                          <h5 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-1.5 text-amber-600">Reframed Analysis</h5>
                          <p className="text-slate-700">{result.future.analysis}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-slate-800 uppercase tracking-wide text-xs text-amber-600">Key Concerns</h5>
                            <ul className="list-disc list-inside text-slate-600 pl-1 space-y-1">
                              {result.future.concerns.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-slate-800 uppercase tracking-wide text-xs text-amber-600">Questions to Ask</h5>
                            <ul className="list-disc list-inside text-slate-600 pl-1 space-y-1">
                              {result.future.questions.map((q, i) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Risk Perspective */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
                    <button
                      onClick={() => toggleCard("risk")}
                      className="w-full flex items-center justify-between p-5 text-left border-b border-slate-100 hover:bg-slate-50/50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-rose-900">Risk Perspective (Defensive Mind)</h4>
                          <span className="text-xs text-rose-500 font-medium">Downside risk, survival margins, Plan B</span>
                        </div>
                      </div>
                      <div className="p-1 text-slate-400 hover:text-slate-700">
                        <svg className={`w-5 h-5 transform transition-transform duration-200 ${expandedCards.risk ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {expandedCards.risk && (
                      <div className="p-6 space-y-4 text-sm leading-relaxed border-t border-slate-50 bg-slate-50/30">
                        <div>
                          <h5 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-1.5 text-rose-600">Reframed Analysis</h5>
                          <p className="text-slate-700">{result.risk.analysis}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-slate-800 uppercase tracking-wide text-xs text-rose-600">Key Concerns</h5>
                            <ul className="list-disc list-inside text-slate-600 pl-1 space-y-1">
                              {result.risk.concerns.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-slate-800 uppercase tracking-wide text-xs text-rose-600">Questions to Ask</h5>
                            <ul className="list-disc list-inside text-slate-600 pl-1 space-y-1">
                              {result.risk.questions.map((q, i) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 4: Opportunity Perspective */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
                    <button
                      onClick={() => toggleCard("opportunity")}
                      className="w-full flex items-center justify-between p-5 text-left border-b border-slate-100 hover:bg-slate-50/50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-emerald-900">Opportunity Perspective (Offensive Mind)</h4>
                          <span className="text-xs text-emerald-500 font-medium">Asymmetric upside, options growth, learning loops</span>
                        </div>
                      </div>
                      <div className="p-1 text-slate-400 hover:text-slate-700">
                        <svg className={`w-5 h-5 transform transition-transform duration-200 ${expandedCards.opportunity ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {expandedCards.opportunity && (
                      <div className="p-6 space-y-4 text-sm leading-relaxed border-t border-slate-50 bg-slate-50/30">
                        <div>
                          <h5 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-1.5 text-emerald-600">Reframed Analysis</h5>
                          <p className="text-slate-700">{result.opportunity.analysis}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-slate-800 uppercase tracking-wide text-xs text-emerald-600">Key Concerns</h5>
                            <ul className="list-disc list-inside text-slate-600 pl-1 space-y-1">
                              {result.opportunity.concerns.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-slate-800 uppercase tracking-wide text-xs text-emerald-600">Questions to Ask</h5>
                            <ul className="list-disc list-inside text-slate-600 pl-1 space-y-1">
                              {result.opportunity.questions.map((q, i) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Back Link */}
                <div className="text-center pt-2">
                  <Link
                    href="/"
                    className="text-sm font-semibold text-slate-500 hover:text-orange-600 transition flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Boring Tools
                  </Link>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Floating Toast Notification */}
      {toast.message && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-3 text-sm shadow-xl font-semibold border transition-all duration-300 animate-fade-in-out ${
            toast.type === "error" ? "bg-red-600 text-white border-red-700" : "bg-slate-900 text-white border-slate-950"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      {/* Inline styles for custom animations */}
      <style jsx global>{`
        .animate-fade-in-out {
          animation: fadeInOut 2s ease-in-out forwards;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 12px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -12px); }
        }
      `}</style>
    </main>
  );
}

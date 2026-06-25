"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ComingSoon from "@/app/components/ComingSoon";

// Set to "live" to deploy and enable routing
const TOOL_STATUS = "upcoming";

// Presets data for quick onboarding
const PRESETS = [
  {
    title: "Quit job for startup",
    situation: "I have been offered a role at a fast-paced startup. My current corporate job is extremely stable and pays well, but it is incredibly boring and there is absolutely no room for growth or promotion.",
    problem: "Should I join the startup and leave my stable corporate job?",
    category: "career"
  },
  {
    title: "Buy home vs renting",
    situation: "Interest rates are currently high, and committing to a 30-year mortgage feels daunting. However, continuing to rent feels like I am throwing money away. I have a 10% down payment saved up.",
    problem: "Should I buy a home now or continue renting for another year?",
    category: "finance"
  },
  {
    title: "Confront friend boundaries",
    situation: "My close friend has canceled our plans at the last minute for the 4th time this month, usually with vague excuses. I value our long-term friendship, but I am starting to feel disrespected.",
    problem: "Should I confront my friend about their repeated cancellations?",
    category: "relationship"
  },
  {
    title: "Commit to side hustle",
    situation: "I feel exhausted after my regular work hours, but I have a strong desire to build a software product of my own. Pursuing this would require committing 15 hours of my free time every week.",
    problem: "Should I dedicate my evenings and weekends to building my side project?",
    category: "growth"
  }
];

const CATEGORIES = {
  general: {
    label: "General / Personal Growth",
    keywords: ["project", "time", "lazy", "relax", "focus", "priority", "schedule", "procrastinate", "goals", "learn", "study", "exam", "college", "school", "decision", "grow", "choice"]
  },
  career: {
    label: "Career & Business",
    keywords: ["job", "career", "quit", "resign", "promotion", "salary", "boss", "business", "startup", "company", "work", "colleague", "employee", "interview", "hire", "freelance", "corporate", "profession", "employer", "office"]
  },
  finance: {
    label: "Finance & Wealth",
    keywords: ["buy", "cost", "purchase", "invest", "save", "rent", "house", "car", "price", "money", "finance", "rates", "payment", "cheap", "expensive", "interest", "spend", "dollar", "rupee", "euro", "loan", "debt", "afford", "mortgage", "saving"]
  },
  relationship: {
    label: "Relationships & Social",
    keywords: ["friend", "relationship", "dating", "love", "ex", "break up", "confront", "boundary", "boundaries", "family", "marriage", "fight", "partner", "value", "respect", "disrespect", "conflict", "cancel", "spouse", "parent", "mother", "father"]
  },
  health: {
    label: "Health & Lifestyle",
    keywords: ["health", "fitness", "diet", "sleep", "anxiety", "stress", "tired", "burnout", "mental", "exhausted", "sick", "weight", "exercise", "recovery", "mind", "routine", "workout", "habits", "depressed"]
  }
};

const LOADING_STEPS = [
  "Attuning to your Future Self (5 years out)...",
  "Consulting your Best Friend's perspective...",
  "Channeling a Parent's protective wisdom...",
  "Recalling your Older Self (80 years old looking back)...",
  "Detaching emotions for the Neutral Observer...",
  "Synthesizing viewpoints and resolving cognitive biases...",
  "Structuring perspective cards..."
];

// Helper to extract the core phrase of the problem
function getProblemPhrase(prob) {
  let cleaned = prob.trim().replace(/[?.]/g, "");
  // Remove common question prefixes
  cleaned = cleaned.replace(/^(should i|should we|can i|would it be good to|is it good to|how to|how can i|to|do i)\s+/i, "");
  if (!cleaned) return "make this decision";
  cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
  return cleaned;
}

// Helper to swap pronouns (my -> your, etc.) so template outputs read naturally
function adjustPronouns(text) {
  return text
    .replace(/\bmy\b/g, "your")
    .replace(/\bme\b/g, "you")
    .replace(/\bi\b/g, "you")
    .replace(/\bmine\b/g, "yours")
    .replace(/\bmyself\b/g, "yourself")
    .replace(/\bi'm\b/g, "you're")
    .replace(/\bi am\b/g, "you are")
    .replace(/\bi've\b/g, "you've")
    .replace(/\bi have\b/g, "you have")
    .replace(/\bwe\b/g, "you")
    .replace(/\bus\b/g, "you")
    .replace(/\bour\b/g, "your");
}

// Complete library of templates for all perspectives and categories
const PERSPECTIVES_LIBRARY = {
  career: {
    future: {
      main: "In the 5-year arc of your professional life, the temporary comfort of staying in your current position will fade. What you will value most is the growth, new capabilities, and career adaptability you built by choosing to {phrase}.",
      concern: "Stagnation and skills obsolescence. The greatest risk is remaining in a dead-end role that offers security but slowly erodes your long-term marketability.",
      advice: "Take the path that maximizes learning and ownership. If you choose to {phrase}, focus on building a robust professional network and mastering skills that make you indispensable.",
      differentViewpoint: "Instead of focusing on 'What if I fail if I {phrase}?', ask 'What happens if I stay here for another 5 years and nothing changes?' The risk of inaction is often far greater than the risk of failure."
    },
    friend: {
      main: "I want you to feel excited about your work and valued for your skills. It's draining to watch you feel stuck or frustrated every single day when you have so much potential.",
      concern: "Burnout and lack of boundaries. New ventures or fast-paced roles can consume your entire personal life if you don't actively protect your time.",
      advice: "Gather objective information. Speak to people in similar roles or at that specific company. Validate the culture, negotiate hard for your true worth, and make sure you protect your mental health.",
      differentViewpoint: "You are framing this as a high-stakes, life-or-death choice. Look at it as an experiment. You can choose to {phrase}, and if it doesn't work, you'll still have valuable experience to leverage elsewhere."
    },
    parent: {
      main: "I want you to build a secure, stable life where you don't have to worry about bills and can support yourself. Stability is the foundation of long-term freedom.",
      concern: "Financial instability and loss of benefits. Startups and career transitions are highly unpredictable. If things go wrong, do you have a fallback?",
      advice: "Secure your runway first. Make sure you have at least 3-6 months of living expenses saved up before making a leap. Get all contract details, benefits, and equity promises in writing.",
      differentViewpoint: "While safety is important, true stability in the modern world comes from adaptability and continuous learning, not from holding on to a single job that might lay you off anyway."
    },
    older: {
      main: "When you look back from age 80, you won't remember the quiet, comfortable weeks at a boring job. You will remember the times you stepped out of your comfort zone, took a chance on yourself, and dared to {phrase}.",
      concern: "The heavy weight of regret. Regretting the things you *didn't* do out of fear is always more painful than regretting the mistakes you made while trying to grow.",
      advice: "Choose the path that gives you the best stories to tell. Life is short, and playing it safe is a quiet way of wasting it. Trust your capacity to recover and adapt.",
      differentViewpoint: "This career choice is just one chapter in your long life story. Even if it ends in failure, it will add depth, character, and invaluable wisdom to your journey."
    },
    observer: {
      main: "This is a classic decision under uncertainty, heavily influenced by status quo bias and loss aversion. You are over-indexing on the immediate cost of change relative to the chronic cost of stagnation.",
      concern: "Underestimating the risk of the status quo. You assume your current path is safe, but market dynamics and organizational shifts mean no role is truly permanent.",
      advice: "Conduct a pre-mortem. Assume you chose to {phrase} and it failed completely in 12 months. What caused the failure, and what is your recovery protocol? Capping your downside makes the decision rational.",
      differentViewpoint: "Frame this not as an emotional choice, but as purchasing a growth option. Calculate your financial runway and list the tangible skills you stand to gain, treating it as a portfolio optimization problem."
    }
  },
  finance: {
    future: {
      main: "Looking back from 5 years, financial independence and building solid assets matter far more than temporary material satisfaction or keeping up appearances. Your choice to {phrase} should serve your long-term wealth.",
      concern: "Illiquidity and high opportunity cost. Locking up significant capital or taking on heavy debt restricts your freedom to take career risks or invest in high-yield assets.",
      advice: "Prioritize cash flow. If you decide to {phrase}, ensure it fits cleanly into your budget without depleting your emergency reserve or stopping your regular investment habits.",
      differentViewpoint: "A major financial outlay can sometimes be an investment in your safety, productivity, or mental well-being. Analyze if this purchase is a liability that drains you, or a lever that saves time and energy."
    },
    friend: {
      main: "I want you to enjoy your money and live comfortably, but I don't want you to feel stressed about bills or debt every month. You shouldn't have to stretch yourself to the breaking point.",
      concern: "Lifestyle inflation and social comparison. Buying things because they fit a social script rather than because they offer genuine utility to your daily life.",
      advice: "Practice the 48-hour rule. Wait two full days before making the decision to {phrase}. If the desire is still strong and it doesn't cause financial anxiety, proceed with clear boundaries.",
      differentViewpoint: "Money is just a tool. If you have the savings and this will bring you daily utility, improve your health, or buy back your time, don't be so frugal that you compromise your quality of life."
    },
    parent: {
      main: "Money represents safety, shelter, and security for the future. You must manage your resources with strict discipline so you are never vulnerable in an emergency.",
      concern: "Over-leverage and high interest rates. Committing to large monthly payments or depleting your savings leaves you exposed to job loss or economic downturns.",
      advice: "Negotiate hard, compare all alternatives, and avoid high-interest consumer loans. If you choose to {phrase}, keep a separate, untouched emergency fund of at least 6 months.",
      differentViewpoint: "Sometimes, waiting too long to buy or invest out of fear of debt causes you to miss out on building equity or securing a stable home. Calculate the real numbers rather than relying on fear."
    },
    older: {
      main: "At age 80, your net worth down to the penny won't matter, nor will the luxury items you owned. You will value the freedom you secured and the experiences you shared with loved ones.",
      concern: "Spending your life worrying about money, or conversely, wasting your life working a job you hate just to pay off things you didn't really need.",
      advice: "Buy your freedom. Use your financial resources to purchase time, health, and memorable experiences. If you choose to {phrase}, make sure it leads to peace of mind, not status.",
      differentViewpoint: "Money can always be earned back, but time and youth cannot. If spending these funds now enables a meaningful life transition or protects your health, it is a wise use of capital."
    },
    observer: {
      main: "This is a quantitative resource allocation problem. You are comparing immediate consumption or capital locking against the future value of compounded investments.",
      concern: "Ignoring hidden costs. Purchases often have ongoing maintenance, taxes, insurance, and interest costs that are overlooked in the initial decision.",
      advice: "Create a detailed spreadsheet. Model the opportunity cost of this capital if invested at an 8% annual return over 10 years. Contrast this with the utility and value depreciation of the choice to {phrase}.",
      differentViewpoint: "Ground this purchase in labor. Calculate the exact number of post-tax working hours required to pay for the choice to {phrase}. This translates abstract numbers into physical life energy."
    }
  },
  relationship: {
    future: {
      main: "In 5 years, the anxiety of having this difficult conversation or establishing boundaries will be gone. What will remain is either a healthy, respectful dynamic or a highly toxic pattern that you allowed to continue.",
      concern: "Resentment accumulation. Avoiding short-term conflict in relationships always builds long-term resentment, which eventually destroys the connection anyway.",
      advice: "Communicate from a place of self-worth, not anger. If you choose to {phrase}, be clear about your boundaries and consistent in reinforcing them. Your future peace depends on it.",
      differentViewpoint: "Sometimes a relationship strain is just a temporary phase of stress. Look at the long-term history of this person's character, not just their recent behavior, before making a final choice."
    },
    friend: {
      main: "You deserve to be treated with respect, consistency, and care. It hurts me to see you feeling anxious, ignored, or taken for granted by someone you pour your energy into.",
      concern: "One-sided effort. You might be carrying the weight of this connection while the other person is coasting without regard for your feelings.",
      advice: "Have a candid, calm discussion. Explain how their behavior impacts you using 'I' statements. If you choose to {phrase}, see if they listen and adjust, or if they get defensive and blame you.",
      differentViewpoint: "People cannot read your mind. They might have no idea that their actions are hurting you. Give them a clear, explicit chance to understand your side before making assumptions."
    },
    parent: {
      main: "Surround yourself with people who treat you well, keep you safe, and have good character. A good support system is vital for your health and success.",
      concern: "Emotional drain and drama. Engaging in constant conflict or staying in toxic dynamics distracts you from your life goals and impacts your health.",
      advice: "Be patient but firm. Do not react impulsively in the heat of the moment. If you must {phrase}, do it calmly, privately, and with dignity. Protect your peace of mind.",
      differentViewpoint: "No one is perfect, and relationships require compromise and forgiveness. Ensure you are not throwing away a valuable connection over a minor misunderstanding or temporary friction."
    },
    older: {
      main: "At age 80, life is measured entirely by the quality of the connections you maintained and the love you shared. You will regret the years wasted on toxic relationships, and the words of love left unspoken.",
      concern: "Pride and grudges. Holding on to minor resentments or refusing to speak your truth out of pride is a waste of precious time.",
      advice: "Live authentically. Speak your truth with kindness. If you decide to {phrase}, let it be a step toward honesty and mutual respect. Do not waste years in silent frustration.",
      differentViewpoint: "Most interpersonal arguments are completely insignificant in the long run. Ask yourself: 'Will this matter on my deathbed?' If not, forgive easily, let go of the anger, but keep your self-respect."
    },
    observer: {
      main: "This is a scenario of boundary regulation and interpersonal conflict. Emotional high-arousal is currently clouding objective analysis of the other party's motives.",
      concern: "Fundamental attribution error. You may be attributing their behavior to malice or character flaws rather than situational constraints, leading to escalating tension.",
      advice: "De-escalate reactivity. Write down the objective facts of their behavior and its direct consequences. Communicate these facts neutrally, focusing on establishing boundary parameters rather than seeking validation.",
      differentViewpoint: "Every relationship has a 'price of admission.' Evaluate if this person's positive contribution to your life exceeds the emotional 'cost' of their flaws. Treat it as a utility comparison."
    }
  },
  health: {
    future: {
      main: "Your body and mind are the only house you have to live in. The health choices and stress management habits you establish today will dictate your quality of life in 5 and 10 years.",
      concern: "Systemic depletion. Overworking, ignoring symptoms, or skipping sleep is borrowing energy from your future self at a compounding, high interest rate.",
      advice: "Create sustainable systems. If you decide to {phrase}, focus on building it as a regular habit rather than an intense, short-term push. Consistency is key.",
      differentViewpoint: "Do not view health and wellness as a chore or punishment. Frame it as the ultimate form of self-respect. Protecting your health increases your capacity for everything else."
    },
    friend: {
      main: "I want you to feel strong, happy, and full of life. You've been carrying an immense load lately, and your physical and mental well-being must come before anything else.",
      concern: "Neglect of self-care. You are prioritizing everyone else's needs, work deadlines, or social obligations while neglecting your own basic physical requirements.",
      advice: "Take a step back and schedule rest. If you choose to {phrase}, make sure it includes regular sleep, proper nutrition, and unstructured downtime to decompress.",
      differentViewpoint: "You think you do not have the time to focus on your health right now. But if you burn out or get sick, you will be forced to make time. Health is an investment, not an expense."
    },
    parent: {
      main: "Your health is everything. If you don't have your health, you have nothing. Please take care of yourself, sleep well, and don't stress over things you can't change.",
      concern: "Ignoring warnings. Pushing through pain, chronic exhaustion, or high anxiety without professional support or lifestyle adjustment is dangerous.",
      advice: "Establish a stable, healthy routine. Listen to your body's signals. If you choose to {phrase}, do it gradually and consult a professional if you feel stuck.",
      differentViewpoint: "A structured, healthy routine provides its own form of safety and mental clarity. Taking care of your body is the first step in feeling secure and in control of your life."
    },
    older: {
      main: "At age 80, a functional, pain-free body and a sharp, peaceful mind are the only wealth that matters. You will thank yourself for every walk, every healthy meal, and every hour of sleep.",
      concern: "Trading health for status or money. It is a trade you will always regret, as wealth cannot buy back a worn-out body or peace of mind.",
      advice: "Treat your body like a cherished instrument, not a machine to be driven to failure. If you decide to {phrase}, let it be an act of love and preservation for your future self.",
      differentViewpoint: "Vitality is about movement and engagement. Don't be afraid to push your limits physically, but do it with respect for your recovery. Keep moving and let go of mental stress."
    },
    observer: {
      main: "This is a resource capacity problem. You are managing a biological system with finite energy reserves and feedback loops that signal exhaustion via physical and mental symptoms.",
      concern: "Neglecting system feedback. Overriding fatigue or anxiety with willpower or stimulants eventually leads to system failure (burnout, illness).",
      advice: "Treat biological metrics (sleep quality, activity levels, stress markers) as leading indicators of cognitive performance. Systematically adjust your schedule to optimize these inputs.",
      differentViewpoint: "View health not as a goal in itself, but as the capacity factor of your life. Improving your sleep and fitness increases your daily energy bandwidth, meaning the choice to {phrase} will actually feel easier."
    }
  },
  general: {
    future: {
      main: "In 5 years, the specific worries of this choice will be minor. What will define you is whether you stepped forward into growth or shrank back into your comfort zone.",
      concern: "Living by default. Letting safety, external expectations, or simple inertia dictate your life choices rather than active design and agency.",
      advice: "Choose the path of expansion. Ask which option will expose you to new ideas, build your personal capabilities, and make your world larger. Choose to {phrase}.",
      differentViewpoint: "Fear is a compass pointing toward growth. If the choice to {phrase} makes you nervous, it is usually because it is the exact catalyst you need for personal development."
    },
    friend: {
      main: "I believe in your potential and want you to grow, but I also want you to be kind to yourself. You have nothing to prove to anyone else, so do what is right for you.",
      concern: "Perfectionism and self-criticism. Putting so much pressure on yourself to make the 'perfect' choice that you paralyze yourself with anxiety.",
      advice: "Take a step forward with self-compassion. If you decide to {phrase}, give yourself permission to learn, to make mistakes, and to adjust your course as you go.",
      differentViewpoint: "You are overthinking this. In the grand scheme, it is just one experience. If you try to {phrase} and it fails, it's a great lesson. If you succeed, it's amazing. Just choose."
    },
    parent: {
      main: "I want you to be happy, safe, and lead a fulfilling life. You are smart, and I trust you to think through things and make a practical, sensible choice.",
      concern: "Impulsiveness or chasing illusions. Ensure you aren't running away from a temporary difficulty rather than running toward a genuine opportunity.",
      advice: "Break the decision down into manageable steps. If you are going to {phrase}, outline your plan, consult people you trust, and verify your assumptions.",
      differentViewpoint: "Growth is important, but don't lose sight of the good things you already have. Make sure you appreciate the present safety while planning your next step."
    },
    older: {
      main: "Looking back from 80, you will realize that life was a short, beautiful adventure. You will regret the risks you didn't take and the anxiety you wasted on trivial worries.",
      concern: "A life lived in the safe middle. Playing it so safe that you look back and wonder 'what if?' is the most painful form of regret.",
      advice: "Be bold. Say yes to growth. If you decide to {phrase}, do it with your whole heart and do not look back. Trust that you can handle whatever comes.",
      differentViewpoint: "Most of the things you worry about on a daily basis do not matter at all. Forgive your mistakes, let go of the small worries, take the leap, and enjoy the ride."
    },
    observer: {
      main: "The subject is facing an evolutionary decision point involving self-actualization. They are experiencing cognitive dissonance between safety and self-expression.",
      concern: "Choice paralysis. Trying to eliminate all risk leads to remaining in a sub-optimal state, which carries its own compounding opportunity cost.",
      advice: "Apply the regret-minimization framework. Identify the worst-case scenario and build a recovery plan. If the downside is survivable, proceed with the option that offers higher positive asymmetry.",
      differentViewpoint: "Delaying a decision is itself a choice to remain in the status quo. Frame this as a conscious trade-off of time rather than a passive waiting game."
    }
  }
};

export default function PerspectiveSwitcherPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="Perspective Switcher" />;
  }

  // Input states
  const [situation, setSituation] = useState("");
  const [problem, setProblem] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("auto"); // "auto" or key of CATEGORIES
  const [detectedCategory, setDetectedCategory] = useState("general");

  // Loading & generation states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimerRef = useRef(null);
  const loadingTimerRef = useRef(null);

  // Clean toast and timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (loadingTimerRef.current) window.clearInterval(loadingTimerRef.current);
    };
  }, []);

  // Auto-detect category based on problem and situation text
  useEffect(() => {
    if (!problem && !situation) {
      setDetectedCategory("general");
      return;
    }

    const combinedText = `${problem} ${situation}`.toLowerCase();
    let bestCategory = "general";
    let maxMatches = 0;

    Object.entries(CATEGORIES).forEach(([key, catInfo]) => {
      if (key === "general") return;
      let matches = 0;
      catInfo.keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        const count = (combinedText.match(regex) || []).length;
        matches += count;
      });
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = key;
      }
    });

    setDetectedCategory(bestCategory);
  }, [problem, situation]);

  const activeCategory = selectedCategory === "auto" ? detectedCategory : selectedCategory;

  const showToast = (type, message) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 2000);
  };

  const handlePresetClick = (preset) => {
    setSituation(preset.situation);
    setProblem(preset.problem);
    setSelectedCategory(preset.category);
    showToast("success", `Loaded preset: "${preset.title}"`);
  };

  const handleGenerate = () => {
    if (!problem.trim()) {
      showToast("error", "Please input a problem or question to analyze.");
      return;
    }
    if (!situation.trim()) {
      showToast("error", "Please explain the situation or context first.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setLoadingStepIndex(0);

    // Simulate loading steps dynamically
    let currentStep = 0;
    if (loadingTimerRef.current) window.clearInterval(loadingTimerRef.current);
    loadingTimerRef.current = window.setInterval(() => {
      currentStep++;
      if (currentStep < LOADING_STEPS.length) {
        setLoadingStepIndex(currentStep);
      } else {
        window.clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
        
        // Generate viewpoints locally
        const rawPhrase = getProblemPhrase(problem);
        const phrase = adjustPronouns(rawPhrase);
        const catData = PERSPECTIVES_LIBRARY[activeCategory] || PERSPECTIVES_LIBRARY.general;

        const formatViewpoint = (vp) => ({
          main: adjustPronouns(vp.main.replace(/{phrase}/g, phrase)),
          concern: adjustPronouns(vp.concern.replace(/{phrase}/g, phrase)),
          advice: adjustPronouns(vp.advice.replace(/{phrase}/g, phrase)),
          differentViewpoint: adjustPronouns(vp.differentViewpoint.replace(/{phrase}/g, phrase))
        });

        setResult({
          future: formatViewpoint(catData.future),
          friend: formatViewpoint(catData.friend),
          parent: formatViewpoint(catData.parent),
          older: formatViewpoint(catData.older),
          observer: formatViewpoint(catData.observer),
          categoryLabel: CATEGORIES[activeCategory].label,
          problemText: problem,
          situationText: situation
        });
        
        setIsLoading(false);
        showToast("success", "Perspectives generated successfully!");
      }
    }, 800);
  };

  const handleReset = () => {
    setSituation("");
    setProblem("");
    setSelectedCategory("auto");
    setResult(null);
    showToast("success", "Values reset.");
  };

  // Report text generator for Copy / Download
  const reportText = useMemo(() => {
    if (!result) return "";
    const timestamp = new Date().toLocaleString();

    return `==================================================
PERSPECTIVE SWITCHER REPORT
Generated: ${timestamp}
Category: ${result.categoryLabel}
==================================================

SITUATION:
${result.situationText}

PROBLEM / DILEMMA:
${result.problemText}

==================================================
VIEWPOINT 1: YOUR FUTURE SELF (5 Years Out)
--------------------------------------------------
* Main Thought: ${result.future.main}
* Core Concern: ${result.future.concern}
* Actionable Advice: ${result.future.advice}
* Alternative View: ${result.future.differentViewpoint}

==================================================
VIEWPOINT 2: YOUR BEST FRIEND
--------------------------------------------------
* Main Thought: ${result.friend.main}
* Core Concern: ${result.friend.concern}
* Actionable Advice: ${result.friend.advice}
* Alternative View: ${result.friend.differentViewpoint}

==================================================
VIEWPOINT 3: YOUR PARENT
--------------------------------------------------
* Main Thought: ${result.parent.main}
* Core Concern: ${result.parent.concern}
* Actionable Advice: ${result.parent.advice}
* Alternative View: ${result.parent.differentViewpoint}

==================================================
VIEWPOINT 4: YOUR OLDER SELF (80 Years Out)
--------------------------------------------------
* Main Thought: ${result.older.main}
* Core Concern: ${result.older.concern}
* Actionable Advice: ${result.older.advice}
* Alternative View: ${result.older.differentViewpoint}

==================================================
VIEWPOINT 5: NEUTRAL OBSERVER
--------------------------------------------------
* Main Thought: ${result.observer.main}
* Core Concern: ${result.observer.concern}
* Actionable Advice: ${result.observer.advice}
* Alternative View: ${result.observer.differentViewpoint}

==================================================
Generated client-side via Boring Tools.
==================================================`;
  }, [result]);

  const handleCopyReport = async () => {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
      showToast("success", "Report copied to clipboard.");
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
    link.download = `perspective-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("success", "Report downloaded successfully.");
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6 my-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Productivity Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Perspective Switcher</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Deconstruct complex dilemmas by examining them through five distinct personal and objective lenses. View your situation with clarity and overcome choice paralysis.
          </p>
        </div>

        {/* Presets */}
        {!result && !isLoading && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetClick(preset)}
                  className="p-3 text-left bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-xl transition text-sm group"
                >
                  <span className="font-semibold text-slate-700 group-hover:text-orange-700 block mb-1">{preset.title}</span>
                  <span className="text-xs text-slate-400 block line-clamp-2">{preset.problem}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Screen */}
        {!result && !isLoading && (
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600 font-bold">Input Details</p>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 font-sans">Describe the problem and context</h2>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="self-start inline-flex items-center justify-center rounded-full border border-slate-300 hover:border-orange-500 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-orange-600 transition"
              >
                Clear Inputs
              </button>
            </div>

            <div className="space-y-5">
              {/* Situation Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="situation">
                  The Situation / Context
                </label>
                <span className="text-xs text-slate-400">
                  Provide background details (e.g., resources, feelings, constraints, timeline).
                </span>
                <textarea
                  id="situation"
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="Example: I've saved up some money and want to pursue freelance, but my current job is very stable. I'm afraid of losing steady benefits..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>

              {/* Problem Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="problem">
                  The Dilemma / Question
                </label>
                <span className="text-xs text-slate-400">
                  What is the specific question you are trying to answer? (e.g. "Should I quit my job?")
                </span>
                <input
                  id="problem"
                  type="text"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Should I leave my job to start freelance?"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>

              {/* Category selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="category">
                  Analysis Theme
                </label>
                <span className="text-xs text-slate-400">
                  Choose how the perspectives should align, or let it auto-detect based on keywords.
                </span>
                <div className="relative">
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 bg-white appearance-none focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition cursor-pointer"
                  >
                    <option value="auto">Auto-detect ({CATEGORIES[detectedCategory]?.label || "General"})</option>
                    {Object.entries(CATEGORIES).map(([key, info]) => (
                      <option key={key} value={key}>{info.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full mt-2 inline-flex items-center justify-center rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Switch Perspectives
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 px-4 gap-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
              <div className="absolute w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l1.32-.33 1.32-.33M12 8a4 4 0 11-4 4 4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-slate-800 animate-pulse">Switching Viewpoints...</h3>
              <p className="text-sm text-slate-500 max-w-sm h-6 transition-all duration-300">
                {LOADING_STEPS[loadingStepIndex]}
              </p>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {result && !isLoading && (
          <div className="space-y-6">
            
            {/* Input Summary & Actions Header */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5 max-w-2xl">
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                  {result.categoryLabel}
                </span>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  "{result.problemText}"
                </h2>
                <p className="text-sm text-slate-500 line-clamp-2">
                  <span className="font-semibold text-slate-600">Context:</span> {result.situationText}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Report
                </button>
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 px-4 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
                >
                  Reset / Try Another
                </button>
              </div>
            </div>

            {/* Viewpoint Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Future Self */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden flex flex-col border-t-4 border-t-indigo-500">
                <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-indigo-50/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zM18 10.5l-.5 3-.5-3-3-.5 3-.5.5-3 .5 3 3 .5-3 .5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm">Your Future Self</h4>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">5-10 Years Horizon</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-4 text-sm">
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-700">Main Thought</h5>
                    <p className="text-slate-700 leading-relaxed font-medium">{result.future.main}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-red-600">Core Concern</h5>
                    <p className="text-slate-600 leading-relaxed">{result.future.concern}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-600">Actionable Advice</h5>
                    <p className="text-slate-600 leading-relaxed">{result.future.advice}</p>
                  </div>
                  <div className="space-y-1.5 mt-auto pt-2 border-t border-slate-100">
                    <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Alternative Lens</h5>
                    <p className="text-slate-500 italic leading-relaxed text-xs">{result.future.differentViewpoint}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Best Friend */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden flex flex-col border-t-4 border-t-sky-500">
                <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-sky-50/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                      <svg className="w-5 h-5 text-sky-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm">Your Best Friend</h4>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-sky-600">Empathy & Wellbeing</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-4 text-sm">
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-sky-700">Main Thought</h5>
                    <p className="text-slate-700 leading-relaxed font-medium">{result.friend.main}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-red-600">Core Concern</h5>
                    <p className="text-slate-600 leading-relaxed">{result.friend.concern}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-600">Actionable Advice</h5>
                    <p className="text-slate-600 leading-relaxed">{result.friend.advice}</p>
                  </div>
                  <div className="space-y-1.5 mt-auto pt-2 border-t border-slate-100">
                    <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Alternative Lens</h5>
                    <p className="text-slate-500 italic leading-relaxed text-xs">{result.friend.differentViewpoint}</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Parent */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden flex flex-col border-t-4 border-t-emerald-500">
                <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-emerald-50/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm">Your Parent</h4>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">Security & Stability</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-4 text-sm">
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-700">Main Thought</h5>
                    <p className="text-slate-700 leading-relaxed font-medium">{result.parent.main}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-red-600">Core Concern</h5>
                    <p className="text-slate-600 leading-relaxed">{result.parent.concern}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-600">Actionable Advice</h5>
                    <p className="text-slate-600 leading-relaxed">{result.parent.advice}</p>
                  </div>
                  <div className="space-y-1.5 mt-auto pt-2 border-t border-slate-100">
                    <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Alternative Lens</h5>
                    <p className="text-slate-500 italic leading-relaxed text-xs">{result.parent.differentViewpoint}</p>
                  </div>
                </div>
              </div>

              {/* Card 4: Older Self */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden flex flex-col border-t-4 border-t-amber-500 md:col-span-1 lg:col-span-1">
                <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-amber-50/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                      <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm">Your Older Self</h4>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600">Regret Minimization</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-4 text-sm">
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-amber-700">Main Thought</h5>
                    <p className="text-slate-700 leading-relaxed font-medium">{result.older.main}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-red-600">Core Concern</h5>
                    <p className="text-slate-600 leading-relaxed">{result.older.concern}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-600">Actionable Advice</h5>
                    <p className="text-slate-600 leading-relaxed">{result.older.advice}</p>
                  </div>
                  <div className="space-y-1.5 mt-auto pt-2 border-t border-slate-100">
                    <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Alternative Lens</h5>
                    <p className="text-slate-500 italic leading-relaxed text-xs">{result.older.differentViewpoint}</p>
                  </div>
                </div>
              </div>

              {/* Card 5: Neutral Observer */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden flex flex-col border-t-4 border-t-slate-500 md:col-span-2 lg:col-span-2">
                <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-slate-100/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17m0-17L4 7m8-4l8 4m-8 6h8M4 7v10m0-10l-2 3h4L4 7zm16 0v10m0-10l-2 3h4l-2-3zM4 17h16" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm">Neutral Observer</h4>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Rational & Detached</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-4 gap-4 text-sm">
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700">Main Thought</h5>
                    <p className="text-slate-700 leading-relaxed font-medium">{result.observer.main}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-red-600">Core Concern</h5>
                    <p className="text-slate-600 leading-relaxed">{result.observer.concern}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-600">Actionable Advice</h5>
                    <p className="text-slate-600 leading-relaxed">{result.observer.advice}</p>
                  </div>
                  <div className="space-y-1.5 md:col-span-2 mt-auto pt-2 border-t border-slate-100">
                    <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Alternative Lens</h5>
                    <p className="text-slate-500 italic leading-relaxed text-xs">{result.observer.differentViewpoint}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Back Home Navigation */}
            <div className="text-center pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-orange-600 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
            </div>

          </div>
        )}

      </div>

      {/* Toast notifications */}
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

      {/* Toast Animation Style */}
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

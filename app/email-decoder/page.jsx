"use client";

import { useState } from "react";

const presets = [
  {
    name: "🚨 Urgent Client",
    email: "Hi team, we need the final designs for the homepage redesign by tomorrow morning at 9 AM. I know we scheduled the review for Friday, but the client bumped up the meeting. This is critical as the contract renewal is on the line. Let me know once uploaded ASAP."
  },
  {
    name: "❌ Job Rejection",
    email: "Dear Candidate,\n\nThank you for taking the time to meet with us regarding the Software Engineer position. Unfortunately, we have decided to move forward with another candidate whose experience matches our current needs more closely.\n\nWe appreciate your interest and wish you the absolute best in your future endeavors."
  },
  {
    name: "📢 Cold Pitch (Spam)",
    email: "Hi there!\n\nI came across your profile and noticed you are in the tech sector. Our agency helps companies scale by utilizing AI-powered outreach. We recently helped a startup double their sales.\n\nWould you be open to a quick 10-minute call next Tuesday at 2 PM to explore synergy?"
  },
  {
    name: "🤝 Casual Catch-up",
    email: "Hey! Hope your week is going well. It's been way too long since we grabbed lunch. Are you free sometime next week to catch up? Let me know what days work for you, maybe we can hit that new taco place near your office. Cheers!"
  },
  {
    name: "🚀 Job Offer",
    email: "Hi,\n\nI am thrilled to offer you the position of Senior Developer. We were incredibly impressed by your technical interviews and cultural fit. We'd like to offer you a starting salary of $120,000, with a target start date of July 1st.\n\nPlease find the attached contract. Let us know if you can sign it by Friday."
  },
  {
    name: "😒 Passive-Aggressive",
    email: "Hi,\n\nJust following up on my email from last week. I know you're super busy, but the spreadsheet was due on Friday and I haven't received it yet. Without your numbers, I can't finish the group presentation. Let me know when I can expect this."
  }
];

function analyzeEmail(text) {
  if (!text || !text.trim()) return null;

  const cleanText = text.toLowerCase().trim();

  // Helper: split into sentences
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // 1. TONE CLASSIFICATION
  let scores = {
    professional: 0,
    friendly: 0,
    neutral: 1, // baseline
    urgent: 0,
    rejection: 0,
    opportunity: 0,
  };

  // Professional signals
  const profKeywords = [
    "dear", "sincerely", "regards", "best regards", "thank you for your time", "confirm receipt", "furthermore", 
    "please find", "in reference to", "attached", "respectfully", "cordially", "as discussed", "collaboration", 
    "per our conversation", "scheduled", "forwarded", "meeting agenda", "business", "projections", "action items",
    "following up", "review", "provide", "updates"
  ];
  profKeywords.forEach(k => {
    const matches = cleanText.split(k).length - 1;
    scores.professional += matches * 1.5;
  });

  // Friendly signals
  const friendlyKeywords = [
    "hope you're doing well", "hope you are well", "hey", "hi!", "cheers", "thanks!", "great to", "catch up", 
    "talk soon", "awesome", "lunch", "coffee", "happy to", "weekend", "joke", "haha", "smile", "😊", "thanks a ton",
    "fabulous", "wonderful", "glad", "excited", "looking forward to seeing", "chat soon", "pizza", "taco", "fun"
  ];
  friendlyKeywords.forEach(k => {
    const matches = cleanText.split(k).length - 1;
    scores.friendly += matches * 1.5;
  });

  // Urgent signals
  const urgentKeywords = [
    "asap", "urgent", "emergency", "immediately", "deadline", "by tomorrow", "soon as possible", "right away", 
    "critical", "important", "requires attention", "quick turnaround", "needs to be done today", "overdue", "delay",
    "no later than", "time-sensitive", "action required", "escalat", "important update", "bumped up"
  ];
  urgentKeywords.forEach(k => {
    const matches = cleanText.split(k).length - 1;
    scores.urgent += matches * 2.0;
  });

  // Rejection signals
  const rejectionKeywords = [
    "unfortunately", "regret to inform", "not moving forward", "other candidates", "selected another", "unable to", 
    "wish you the best", "decided to pass", "no longer", "position has been filled", "not selected", "thank you for your interest",
    "circumstances prevent", "cannot offer", "not a fit", "not the right fit", "do not have any openings", "unsuccessful",
    "declined"
  ];
  rejectionKeywords.forEach(k => {
    const matches = cleanText.split(k).length - 1;
    scores.rejection += matches * 2.5;
  });

  // Opportunity signals
  const opportunityKeywords = [
    "offer", "partnership", "collaboration", "interview", "hired", "interested in your", "proposal", "job opening", 
    "position", "career", "invest", "funding", "contract", "new client", "acquisition", "schedule a call", "revenue",
    "pitch", "project launch", "onboard", "welcome to the team", "signed contract", "salary", "formal offer"
  ];
  opportunityKeywords.forEach(k => {
    const matches = cleanText.split(k).length - 1;
    scores.opportunity += matches * 1.8;
  });

  // Determine highest tone score
  let primaryTone = "Neutral";
  let maxScore = scores.neutral;

  const tonesList = [
    { name: "Professional", score: scores.professional },
    { name: "Friendly", score: scores.friendly },
    { name: "Urgent", score: scores.urgent },
    { name: "Rejection", score: scores.rejection },
    { name: "Opportunity", score: scores.opportunity }
  ];

  tonesList.forEach(t => {
    if (t.score > maxScore) {
      maxScore = t.score;
      primaryTone = t.name;
    }
  });

  // 2. KEY POINTS EXTRACTION
  let extractedRequests = [];
  let extractedDeadlines = [];
  let extractedActions = [];

  // Match requests
  const requestTriggers = [
    "please", "could you", "would you", "can you", "would appreciate", "let me know", "ask", "request", 
    "need you to", "wondering if", "hope you can", "be sure to", "send me", "provide me", "let's schedule",
    "expect this", "due", "want"
  ];
  
  sentences.forEach(s => {
    const lowerS = s.toLowerCase();
    const isRequest = requestTriggers.some(trigger => lowerS.includes(trigger));
    if (isRequest) {
      if (s.length > 15 && s.length < 250 && !lowerS.includes("unsubscribe") && !lowerS.includes("view in browser")) {
        extractedRequests.push(s);
      }
    }
  });

  // Match deadlines
  const deadlineTriggers = [
    "by monday", "by tuesday", "by wednesday", "by thursday", "by friday", "by saturday", "by sunday",
    "due by", "deadline", "by tomorrow", "eod", "eow", "before end of", "by noon", "no later than",
    "target date", "timeline", "by next week", "until monday", "until tuesday", "until wednesday",
    "until thursday", "until friday", "by "
  ];
  
  const dateRegex = /(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{4}-\d{2}-\d{2}/gi;

  sentences.forEach(s => {
    const lowerS = s.toLowerCase();
    const hasDeadlineKeyword = deadlineTriggers.some(trigger => lowerS.includes(trigger));
    const hasDate = dateRegex.test(s);
    
    if (hasDeadlineKeyword || hasDate) {
      if (s.length > 10 && s.length < 250 && !lowerS.includes("copyright") && !lowerS.includes("privacy policy")) {
        extractedDeadlines.push(s);
      }
    }
  });

  // Extract required actions
  const actionVerbs = [
    "review", "submit", "send", "update", "check", "call", "reply", "confirm", "sign", "schedule", "provide",
    "let me know", "complete", "prepare", "test", "approve", "verify", "pay", "invoice", "meet", "upload"
  ];
  
  sentences.forEach(s => {
    const lowerS = s.toLowerCase();
    const containsActionVerb = actionVerbs.some(verb => lowerS.includes(verb));
    const isRequest = requestTriggers.some(trigger => lowerS.includes(trigger));
    
    if ((containsActionVerb && isRequest) || (containsActionVerb && lowerS.includes("need")) || (containsActionVerb && lowerS.includes("due"))) {
      let cleaned = s
        .replace(/^(?:hi|hello|hey|dear|thanks|thank you),?\s*/i, "")
        .replace(/^(?:please|could you|would you|can you|would appreciate if you could|i need you to|make sure to|be sure to|let me know once)\s+/i, "");
      
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      
      if (cleaned.length > 10 && cleaned.length < 200 && !extractedActions.includes(cleaned)) {
        extractedActions.push(cleaned);
      }
    }
  });

  // Defaults if empty
  if (extractedRequests.length === 0) {
    extractedRequests.push("No explicit requests found in the text.");
  }
  if (extractedDeadlines.length === 0) {
    extractedDeadlines.push("No specific deadline mentioned.");
  }
  if (extractedActions.length === 0) {
    if (primaryTone === "Rejection") {
      extractedActions.push("Acknowledge the decision and archive the email thread.");
    } else if (primaryTone === "Opportunity") {
      extractedActions.push("Review opportunity details and schedule a call or draft an acceptance/negotiation response.");
    } else if (primaryTone === "Urgent") {
      extractedActions.push("Address the immediate request and reply to confirm completion.");
    } else {
      extractedActions.push("Review and draft a brief reply at your convenience.");
    }
  }

  // 3. SUMMARY GENERATOR
  let summary = "";
  if (primaryTone === "Rejection") {
    summary = "This email is a formal notification that your proposal, job application, or request has been declined. The sender uses polite language to deliver the negative decision, noting that they are moving forward with other options.";
  } else if (primaryTone === "Urgent") {
    summary = "A high-priority, time-sensitive email demanding quick turnaround. The sender highlights pressing tasks, active deadlines, or an escalating situation that needs immediate resolution.";
  } else if (primaryTone === "Opportunity") {
    summary = "An email presenting an attractive new prospect, job offer, commercial proposal, or collaboration invite. The sender values your skills or profile and requests a meeting or call to discuss next steps.";
  } else if (primaryTone === "Friendly") {
    summary = "A warm, informal message aimed at catching up, checking in, or coordinating casual plans. The tone is relaxed and cooperative, without high pressure or strict transactional boundaries.";
  } else if (primaryTone === "Professional") {
    summary = "A standard business communication containing procedural updates, project information, or standard queries. It maintains clear boundaries and expects routine business response times.";
  } else {
    summary = "A brief informational notice, inquiry, or update. It contains straightforward details with standard urgency and no strong emotional indicators.";
  }

  // 4. HIDDEN MEANING (SUBTEXT)
  let hiddenMeaning = "";
  if (primaryTone === "Rejection") {
    hiddenMeaning = "The decision is solid and final. While the sender is expressing polite regret ('we were impressed', 'keep in touch'), they are trying to close the thread without invite for negotiation. Arguing or questioning the outcome is highly unlikely to change it.";
  } else if (primaryTone === "Urgent") {
    hiddenMeaning = "The sender is likely stressed, facing pressure from their own stakeholders, or disorganized. They are trying to pass their urgency onto you to clear their plate. Respond with a realistic delivery time rather than rushing blindly and making mistakes.";
  } else if (primaryTone === "Opportunity") {
    hiddenMeaning = "They are interested in what you can offer and are trying to sell you on the opportunity. However, they are also testing your responsiveness, enthusiasm, and professional boundaries during this initial stage.";
  } else if (primaryTone === "Friendly") {
    hiddenMeaning = "The sender prioritizes relationship-building and wants to maintain a positive, cooperative connection. The informal tone is used to soften any requests, making it harder for you to refuse them.";
  } else if (primaryTone === "Professional") {
    hiddenMeaning = "The sender wants to keep things transactional, clear, and efficient. They respect your time and expect the same in return. Focus purely on facts, details, and prompt resolution in your reply.";
  } else {
    hiddenMeaning = "The sender has no complex agenda. This is a direct, face-value communication. Respond simply and directly to any requests without reading into the phrasing.";
  }

  // 5. RECOMMENDED RESPONSE & TEMPLATES
  let recommendedResponse = "Reply";
  let templates = [];

  if (primaryTone === "Rejection") {
    recommendedResponse = "Wait";
    templates = [
      {
        title: "Professional Thank You",
        text: `Dear [Sender],\n\nThank you for letting me know about your decision. While I am disappointed, I really appreciated the opportunity to learn more about the role/project and speak with you.\n\nI wish you and the team the absolute best. Please feel free to keep my details on file for future opportunities.\n\nBest regards,\n[Your Name]`
      },
      {
        title: "Short & Sweet Pass",
        text: `Hi [Sender],\n\nThank you for the update and for your time throughout this process. I wish you all the best with the project/role.\n\nBest regards,\n[Your Name]`
      }
    ];
  } else if (primaryTone === "Urgent") {
    recommendedResponse = "Reply";
    templates = [
      {
        title: "Immediate Action & Timeframe",
        text: `Hi [Sender],\n\nI've received your request and am looking into it right now. I expect to have this completed and sent over to you by [Time, e.g., 4:00 PM today].\n\nI will keep you updated if I hit any roadblocks.\n\nBest,\n[Your Name]`
      },
      {
        title: "Negotiate Deadline",
        text: `Hi [Sender],\n\nI see this is urgent. Due to my current commitments, I won't be able to deliver this by [Requested Time]. However, I can prioritize it and have it ready for you by [Alternative Time, e.g., tomorrow at 10:00 AM].\n\nLet me know if that works, or if we need to adjust priorities.\n\nBest regards,\n[Your Name]`
      }
    ];
  } else if (primaryTone === "Opportunity") {
    recommendedResponse = "Reply";
    templates = [
      {
        title: "Interested (Schedule Call)",
        text: `Hi [Sender],\n\nThank you for reaching out! This opportunity sounds very exciting, and I'd love to learn more about it.\n\nI am available for a brief call next week. Do any of the following times work for you?\n- [Option 1, e.g., Tuesday at 2 PM EST]\n- [Option 2, e.g., Thursday at 11 AM EST]\n\nLooking forward to connecting.\n\nBest regards,\n[Your Name]`
      },
      {
        title: "Polite Pass",
        text: `Hi [Sender],\n\nThank you for thinking of me and reaching out. While this sounds like a great opportunity, I am currently at full capacity and unable to take on new projects/roles at this time.\n\nI would love to stay connected for future possibilities.\n\nBest regards,\n[Your Name]`
      }
    ];
  } else if (primaryTone === "Friendly") {
    recommendedResponse = "Reply";
    templates = [
      {
        title: "Warm Affirmation",
        text: `Hey [Sender],\n\nGreat to hear from you! I'd love to catch up. [Response to content, e.g., That day works perfectly for me / I'd love to grab coffee].\n\nLet's lock in [Time/Day]. Hope you have a great rest of your week!\n\nBest,\n[Your Name]`
      },
      {
        title: "Casual & Quick",
        text: `Hey [Sender],\n\nThanks for reaching out! Yes, that sounds awesome. I'm down for that. Let me know when and where and I'll be there.\n\nTalk soon,\n[Your Name]`
      }
    ];
  } else if (primaryTone === "Professional") {
    recommendedResponse = "Reply";
    templates = [
      {
        title: "Standard Action Complete",
        text: `Hi [Sender],\n\nThank you for the email. I have completed the requested task: [Action, e.g., updated the sheet / uploaded the files].\n\nPlease let me know if you need anything else.\n\nBest regards,\n[Your Name]`
      },
      {
        title: "Request for Clarification",
        text: `Hi [Sender],\n\nThank you for the update. To ensure I have all the details correct, could you clarify [specific point, e.g., which version to use / the target audience]?\n\nOnce I have your confirmation, I will proceed with the next steps.\n\nBest regards,\n[Your Name]`
      }
    ];
  } else {
    recommendedResponse = "Wait";
    templates = [
      {
        title: "Acknowledge Receipt",
        text: `Hi [Sender],\n\nThanks for sending this over. I have received the information and will keep you posted if any questions arise.\n\nBest regards,\n[Your Name]`
      }
    ];
  }

  // Double check if there are spam or cold sales pitch cues. If so, recommend Ignore!
  const spamTriggers = [
    "unsolicited", "cold outreach", "quick 10-minute call", "grow your business", "leads generator",
    "seo ranking", "link building", "agency scaling", "optimize your website", "synergy", "low price"
  ];
  const isSpam = spamTriggers.some(st => cleanText.includes(st));
  if (isSpam) {
    recommendedResponse = "Ignore";
    primaryTone = "Neutral";
    summary = "A cold sales outreach or automated promotional email pitching scaling, agency services, or products. The sender wants a short call to sell you their services.";
    hiddenMeaning = "This is a mass-outreach template sent to hundreds of contacts. The sender wants to get you on a call to pitch their services. Replying will mark your inbox as active, potentially leading to more spam. It is best to ignore or archive.";
    templates = [
      {
        title: "Silence (Recommended)",
        text: "[Do not reply. Archive the email or mark it as spam. Let them speak into the void.]"
      },
      {
        title: "Short & Polite Decline",
        text: `Hi [Sender],\n\nThank you for reaching out. We are not looking for [service/product] at this time. Please remove me from your list.\n\nBest,\n[Your Name]`
      }
    ];
  }

  return {
    tone: primaryTone,
    summary,
    requests: extractedRequests,
    deadlines: extractedDeadlines,
    actions: extractedActions,
    hiddenMeaning,
    recommendation: recommendedResponse,
    templates
  };
}

export default function EmailDecoder() {
  const [emailText, setEmailText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedText, setCopiedText] = useState("");
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState(null);
  const [error, setError] = useState("");
  const [source, setSource] = useState("Local Heuristics");

  const loadPreset = (preset) => {
    setEmailText(preset.email);
    setResult(null);
    setError("");
  };

  const handleClear = () => {
    setEmailText("");
    setResult(null);
    setCopiedText("");
    setCopiedTemplateIdx(null);
    setError("");
    setSource("Local Heuristics");
  };

  const handleAnalyze = async () => {
    if (!emailText.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("/api/email-decoder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailText }),
      });

      const payload = await response.json();

      if (response.ok && payload.tone && payload.summary) {
        setResult(payload);
        setSource("Groq AI API");
        return;
      }

      // API returned error
      const fallback = analyzeEmail(emailText);
      setResult(fallback);
      setSource("Local Heuristics");
      setError(payload?.error ? `Backend error (${payload.error}). Running local fallback analysis.` : "API error. Running local fallback analysis.");
    } catch (err) {
      // API call failed entirely (network or connection)
      const fallback = analyzeEmail(emailText);
      setResult(fallback);
      setSource("Local Heuristics");
      setError("Unable to connect to the backend server. Running local fallback analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, type, index = null) => {
    navigator.clipboard.writeText(text);
    if (type === "template") {
      setCopiedTemplateIdx(index);
      setTimeout(() => setCopiedTemplateIdx(null), 2000);
    } else {
      setCopiedText(type);
      setTimeout(() => setCopiedText(""), 2000);
    }
  };

  const getToneBadgeStyle = (tone) => {
    switch (tone) {
      case "Urgent":
        return "bg-rose-50 border-rose-200 text-rose-700 font-bold";
      case "Rejection":
        return "bg-red-50 border-red-200 text-red-700 font-bold";
      case "Opportunity":
        return "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold";
      case "Friendly":
        return "bg-amber-50 border-amber-200 text-amber-700 font-bold";
      case "Professional":
        return "bg-sky-50 border-sky-200 text-sky-700 font-bold";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700 font-bold";
    }
  };

  const getToneIcon = (tone) => {
    switch (tone) {
      case "Urgent": return "🚨";
      case "Rejection": return "❌";
      case "Opportunity": return "🚀";
      case "Friendly": return "🤝";
      case "Professional": return "💼";
      default: return "😐";
    }
  };

  const getRecommendationBadgeStyle = (rec) => {
    switch (rec) {
      case "Reply":
        return {
          bg: "bg-emerald-50 border-emerald-100 text-emerald-800",
          badge: "bg-emerald-500 text-white"
        };
      case "Follow Up":
        return {
          bg: "bg-sky-50 border-sky-100 text-sky-800",
          badge: "bg-sky-500 text-white"
        };
      case "Wait":
        return {
          bg: "bg-amber-50 border-amber-100 text-amber-800",
          badge: "bg-amber-500 text-white"
        };
      case "Ignore":
        return {
          bg: "bg-rose-50 border-rose-100 text-rose-800",
          badge: "bg-rose-500 text-white"
        };
      default:
        return {
          bg: "bg-slate-50 border-slate-100 text-slate-800",
          badge: "bg-slate-500 text-white"
        };
    }
  };

  const getRecommendationIcon = (rec) => {
    switch (rec) {
      case "Reply": return "💬";
      case "Follow Up": return "🔄";
      case "Wait": return "⏳";
      case "Ignore": return "🚫";
      default: return "✉️";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-5xl border border-slate-200 flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">Email Decoder</h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto font-sans">
            Decode subtext, detect tone, extract action items, and get response advice for any email. Runs 100% in-browser.
          </p>
          {result && <p className="text-xs text-slate-400 mt-1 font-sans">Analysis Source: {source}</p>}
        </div>

        {/* Presets Bar */}
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Load Sample Email:</span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(preset)}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-amber-500 hover:bg-orange-50 font-medium transition cursor-pointer font-sans"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          
          {/* Left Side: Input Textarea */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-2 h-full">
              <label className="text-sm font-semibold text-slate-800 flex justify-between font-sans">
                <span>Email Content</span>
                <span className="text-xs text-slate-400 font-normal">Paste email body below</span>
              </label>
              <textarea
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                rows={12}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-sm text-slate-900 placeholder:text-slate-400 font-sans resize-none flex-grow"
                placeholder="Paste the email message here..."
              />
            </div>

            {/* Actions Row */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!emailText.trim() || isLoading}
                className={`flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition shadow focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center justify-center gap-2 cursor-pointer font-sans ${
                  !emailText.trim() || isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white font-sans" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Scanning Email Structure...
                  </>
                ) : (
                  "Decode Email"
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer font-sans"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right Side: Results */}
          <div className="flex flex-col gap-4">
            
            {error && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2 shadow-sm font-sans font-medium">
                <span className="shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            {/* Awaiting State */}
            {!result && !isLoading && (
              <div className="h-full min-h-[300px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center gap-3">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-slate-700 text-base font-sans">Awaiting Decoding</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto font-sans">
                    Paste an email and click 'Decode Email' to unlock its true meaning, key metrics, and response tips.
                  </p>
                </div>
              </div>
            )}

            {/* Loading / Scanning Animation */}
            {isLoading && (
              <div className="h-full min-h-[300px] rounded-2xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center text-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-100 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin"></div>
                </div>
                <div className="flex flex-col gap-1 font-sans">
                  <h3 className="font-semibold text-slate-800 text-sm">Decoding tone and indicators...</h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Applying client-side analysis algorithms...
                  </p>
                </div>
              </div>
            )}

            {/* Analysis Result Display */}
            {result && !isLoading && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-5 shadow-sm font-sans">
                
                {/* Tone Badge Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-sans">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Analysis Result</span>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-sans ${getToneBadgeStyle(result.tone)}`}>
                    <span>{getToneIcon(result.tone)}</span>
                    <span className="capitalize">{result.tone} Tone</span>
                  </div>
                </div>

                {/* 1. Summary */}
                <div className="flex flex-col gap-1.5 font-sans">
                  <h3 className="text-sm font-bold text-slate-800 font-sans">1. Summary</h3>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-semibold font-sans">
                    {result.summary}
                  </p>
                </div>

                {/* 2. Key Points */}
                <div className="flex flex-col gap-3 font-sans">
                  <h3 className="text-sm font-bold text-slate-800 font-sans">2. Key Points</h3>
                  
                  <div className="grid grid-cols-1 gap-2.5 font-sans">
                    {/* Requests */}
                    <div className="border border-slate-100 p-3 rounded-xl bg-white flex flex-col gap-1 font-sans">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">📌 Requests</span>
                      <ul className="list-disc list-inside text-xs text-slate-700 flex flex-col gap-1 font-sans">
                        {result.requests.map((req, idx) => (
                          <li key={idx} className="leading-relaxed pl-1 font-sans">{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Deadlines */}
                    <div className="border border-slate-100 p-3 rounded-xl bg-white flex flex-col gap-1 font-sans">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">📅 Deadlines</span>
                      <ul className="list-disc list-inside text-xs text-slate-700 flex flex-col gap-1 font-sans">
                        {result.deadlines.map((dl, idx) => (
                          <li key={idx} className="leading-relaxed pl-1 font-sans">{dl}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Required Actions */}
                    <div className="border border-slate-100 p-3 rounded-xl bg-white flex flex-col gap-1 font-sans">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">⚙️ Required Actions</span>
                      <ul className="list-disc list-inside text-xs text-slate-700 flex flex-col gap-1 font-sans">
                        {result.actions.map((act, idx) => (
                          <li key={idx} className="leading-relaxed pl-1 font-sans">{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 3. Hidden Meaning */}
                <div className="flex flex-col gap-1.5 font-sans">
                  <h3 className="text-sm font-bold text-slate-800 font-sans">3. Hidden Meaning (Subtext)</h3>
                  <div className="text-xs text-slate-600 leading-relaxed bg-amber-50/50 p-3.5 rounded-xl border border-amber-100/50 flex gap-2 font-sans">
                    <span className="text-base leading-none">🧠</span>
                    <span className="font-sans">{result.hiddenMeaning}</span>
                  </div>
                </div>

                {/* 4. Recommended Response Advice */}
                <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 font-sans">
                  <div className="flex items-center justify-between font-sans">
                    <h3 className="text-sm font-bold text-slate-800 font-sans">4. Recommended Response</h3>
                    <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold font-sans ${getRecommendationBadgeStyle(result.recommendation).bg}`}>
                      <span>{getRecommendationIcon(result.recommendation)}</span>
                      <span className="font-sans">{result.recommendation} Strategy</span>
                    </div>
                  </div>

                  {/* Canned Templates */}
                  <div className="flex flex-col gap-2.5 font-sans">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-sans">Suggested Templates (Click to Copy):</span>
                    {result.templates.map((tmpl, idx) => (
                      <div
                        key={idx}
                        onClick={() => copyToClipboard(tmpl.text, "template", idx)}
                        className="group relative border border-slate-100 hover:border-amber-300 rounded-xl p-3 bg-white hover:bg-orange-50/10 transition flex flex-col gap-1.5 text-left cursor-pointer font-sans"
                      >
                        <div className="flex justify-between items-center font-sans">
                          <span className="text-[10px] font-bold text-slate-400 uppercase font-sans">{tmpl.title}</span>
                          <span className="text-[10px] font-bold text-amber-600 group-hover:text-amber-700 transition flex items-center gap-0.5 font-sans">
                            {copiedTemplateIdx === idx ? (
                              <span className="text-emerald-600 font-bold font-sans">Copied!</span>
                            ) : (
                              <>
                                <svg className="w-3 h-3 font-sans" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copy
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-mono bg-slate-50/50 p-2 rounded border border-slate-100/50 select-all whitespace-pre-wrap leading-relaxed font-sans">
                          {tmpl.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Copy Analysis Button */}
                <div className="border-t border-slate-100 pt-4 mt-2 font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      const fullReport = `EMAIL DECODER ANALYSIS REPORT\n=============================\n\nDetected Tone: ${result.tone}\n\nSummary:\n${result.summary}\n\nKey Points:\n- Requests: ${result.requests.join(" | ")}\n- Deadlines: ${result.deadlines.join(" | ")}\n- Actions: ${result.actions.join(" | ")}\n\nHidden Meaning (Subtext):\n${result.hiddenMeaning}\n\nRecommended Strategy: ${result.recommendation}`;
                      copyToClipboard(fullReport, "report");
                    }}
                    className="w-full text-xs py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm font-sans"
                  >
                    <svg className="w-4 h-4 font-sans" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {copiedText === "report" ? "Full Report Copied!" : "Copy Full Analysis Report"}
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

"use client";

import { useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const presets = [
  {
    name: "Angry Boss (Weekend)",
    message: "I need the updated financial projections by tomorrow morning. Why hasn't this been updated yet? We discussed this last Thursday.",
    context: "Sent on Sunday at 7 PM. I completed my part of the file, but my colleague hasn't updated their section yet.",
    relationship: "boss",
    vibe: "angry",
    urgency: "request",
    mood: "anxious",
  },
  {
    name: "Passive-Aggressive Ex",
    message: "Hey, I saw you were at that coffee shop we used to go to. Nice. Also, do you still have my green sweater or did you throw it away like everything else?",
    context: "We broke up 3 months ago. I do have the sweater but I'm trying to limit contact.",
    relationship: "ex",
    vibe: "passive",
    urgency: "question",
    mood: "annoyed",
  },
  {
    name: "Cold LinkedIn Pitch",
    message: "Hi there! I came across your profile and noticed you are in the tech sector. Our agency helps companies scale by utilizing AI-powered outreach. Would you be open to a quick 10-minute call next Tuesday at 2 PM?",
    context: "Received from a stranger on LinkedIn. I am not looking to hire any agencies.",
    relationship: "stranger",
    vibe: "promotional",
    urgency: "question",
    mood: "neutral",
  },
  {
    name: "Panicked Friend",
    message: "Oh my god, are you free right now?? I locked myself out of my apartment and my cat is inside with the stove on. Can you please come help me? My spare key is at your place!",
    context: "I am currently at work in the middle of a meeting, but my office is 10 minutes away from their place.",
    relationship: "friend",
    vibe: "urgent",
    urgency: "request",
    mood: "busy",
  },
];

const relationshipOptions = [
  { value: "boss", label: "💼 Boss / Client / Partner" },
  { value: "friend", label: "🤝 Friend / Family member" },
  { value: "crush", label: "❤️ Crush / Dating interest" },
  { value: "ex", label: "⚠️ Ex-partner / Toxic connection" },
  { value: "stranger", label: "👤 Stranger / Salesperson" },
  { value: "neutral", label: "😐 Neutral / Customer Support" },
];

const vibeOptions = [
  { value: "neutral", label: "😐 Neutral / Standard tone" },
  { value: "urgent", label: "🚨 Urgent / Panicked" },
  { value: "angry", label: "🔥 Angry / Confrontational" },
  { value: "passive", label: "😒 Passive-Aggressive" },
  { value: "casual", label: "💬 Casual / Meme / Friendly" },
  { value: "promotional", label: "📢 Sales Pitch / Spam" },
];

const urgencyOptions = [
  { value: "question", label: "❓ Explicit Question (Needs answer)" },
  { value: "request", label: "📋 Action Request (Needs task done)" },
  { value: "fyi", label: "ℹ️ FYI / Update / Statement" },
  { value: "vague", label: "🌀 Vague Check-in ('Hey', 'You there?')" },
];

const moodOptions = [
  { value: "neutral", label: "🧘 Calm / Neutral" },
  { value: "busy", label: "⚡ Busy / Tired" },
  { value: "annoyed", label: "😤 Annoyed / Frustrated" },
  { value: "anxious", label: "😰 Anxious / Stressed" },
];

export default function ShouldIReply() {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [relationship, setRelationship] = useState("neutral");
  const [vibe, setVibe] = useState("neutral");
  const [urgency, setUrgency] = useState("fyi");
  const [mood, setMood] = useState("neutral");

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedText, setCopiedText] = useState("");
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState(null);

  const loadPreset = (preset) => {
    setMessage(preset.message);
    setContext(preset.context);
    setRelationship(preset.relationship);
    setVibe(preset.vibe);
    setUrgency(preset.urgency);
    setMood(preset.mood);
    setResult(null);
  };

  const handleClear = () => {
    setMessage("");
    setContext("");
    setRelationship("neutral");
    setVibe("neutral");
    setUrgency("fyi");
    setMood("neutral");
    setResult(null);
    setCopiedText("");
    setCopiedTemplateIdx(null);
  };

  const handleAnalyze = () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setResult(null);

    // Simulate analysis loading for visual feedback
    setTimeout(() => {
      const evaluation = runAnalysisEngine();
      setResult(evaluation);
      setIsLoading(false);
    }, 600);
  };

  const runAnalysisEngine = () => {
    const msgText = message.toLowerCase().trim();
    
    let recommendation = "Reply later";
    let reasoningPoints = [];
    let nextAction = "";
    let templates = [];

    // Heuristics checks
    const hasQuestion = msgText.includes("?") || urgency === "question";
    const hasUrgency = msgText.includes("asap") || msgText.includes("urgent") || msgText.includes("emergency") || vibe === "urgent";

    // 1. IGNORE RULES
    if (vibe === "promotional" || relationship === "stranger") {
      recommendation = "Ignore";
      reasoningPoints = [
        "This looks like a promotional message, unsolicited sales pitch, or cold outreach.",
        "Replying to cold messages signals that your contact details are active, which usually leads to follow-up spam.",
        "Your attention is valuable. You are under no obligation to respond to unsolicited marketing or automated scripts."
      ];
      nextAction = "Archive or delete the message. If the sender is persistent, block their contact information.";
      templates = [
        {
          title: "Polite Pass",
          text: "Hi there, thanks for reaching out. We don't have a need for this solution at the moment, but I will let you know if things change."
        },
        {
          title: "Short Boundary",
          text: "No thank you. Please remove me from your outreach list."
        },
        {
          title: "Silence (Recommended)",
          text: "[Do not reply. Delete the message or archive the thread. Let them speak into the void.]"
        }
      ];
    } else if (relationship === "ex" && (vibe === "angry" || vibe === "passive" || mood === "annoyed" || mood === "anxious")) {
      recommendation = "Ignore";
      reasoningPoints = [
        "The message comes from an ex-partner or toxic connection and carries an angry or passive-aggressive tone.",
        "You indicated you are currently feeling " + moodOptions.find(o => o.value === mood)?.label.split(" ").slice(1).join(" ") + ". Engaging right now will likely compromise your peace of mind.",
        "Silence is a complete sentence. Engaging with toxic tones usually fuels circular arguments."
      ];
      nextAction = "Do not reply. Close the app, mute the notifications for this contact, and take a breather.";
      templates = [
        {
          title: "Strict Boundary",
          text: "I prefer not to discuss this. Let's keep our communication strictly limited to necessary and urgent logistical matters."
        },
        {
          title: "Cold Receipt",
          text: "Acknowledged."
        },
        {
          title: "Silence (Recommended)",
          text: "[Do not reply. Put the thread on mute or block. You don't owe them a reaction.]"
        }
      ];
    }
    // 2. REPLY NOW RULES
    else if ((relationship === "boss" && hasUrgency) || (relationship === "boss" && urgency === "request" && vibe !== "angry")) {
      recommendation = "Reply now";
      reasoningPoints = [
        "This is a high-priority sender (Boss/Client/Partner) with a time-sensitive request.",
        "A prompt response helps unblock workflows and demonstrates professionalism.",
        "Even if you don't have a complete answer, acknowledging the message helps manage expectations."
      ];
      nextAction = "Send a swift acknowledgment outlining when you will have the complete resolution.";
      templates = [
        {
          title: "Quick Acknowledgment",
          text: "Hi [Name], I received your message. I'm on it right now and will get back to you with an update in [Time]."
        },
        {
          title: "Direct Answer",
          text: "Hi [Name], regarding that: [Direct Answer]. Let me know if you need me to jump on a quick call to align."
        },
        {
          title: "Weekend/Off-hours Boundary",
          text: "Hi [Name], got it. I'm currently away from my desk, but I've noted this down and will address it first thing when I log back in on [Day] morning."
        }
      ];
    } else if (relationship === "friend" && vibe === "urgent" && urgency === "request") {
      recommendation = "Reply now";
      reasoningPoints = [
        "A close friend or family member is reaching out with an urgent action request.",
        "They likely need immediate support or quick coordination.",
        "A fast reply provides clarity and assistance when it matters most."
      ];
      nextAction = "Text back immediately to let them know whether or not you can assist.";
      templates = [
        {
          title: "Available to Help",
          text: "Hey! Just saw this. I can help you out. I'll head over / do that right away."
        },
        {
          title: "Unavailable but Supportive",
          text: "Hey! I'm tied up right now and can't jump in immediately, but I can assist in [Time] if that still helps?"
        },
        {
          title: "Quick Action Coordination",
          text: "Got it! [Action details, e.g., 'Key is under the mat / I will call them now']."
        }
      ];
    } else if (relationship === "crush" && vibe === "urgent") {
      recommendation = "Reply now";
      reasoningPoints = [
        "They are a primary romantic interest and the message requires prompt attention.",
        "Replying promptly keeps the momentum going and indicates they are a priority.",
        "Keep the energy positive, responsive, and brief."
      ];
      nextAction = "Send a warm and concise response right away.";
      templates = [
        {
          title: "Warm & Direct",
          text: "Hey! Just saw your text. Yes, absolutely, let's do that! Let me check the details and send them over."
        },
        {
          title: "Playful",
          text: "Hey! You timed that perfectly. I was just thinking about that. Count me in!"
        },
        {
          title: "Friendly Acknowledgment",
          text: "Hey! Tied up for another hour, but I'd love to. Let me text you the second I'm free!"
        }
      ];
    }
    // 3. NEEDS CLARIFICATION RULES
    else if (urgency === "vague" || (message.length < 15 && (msgText === "hey" || msgText === "hi" || msgText === "hello" || msgText === "you there" || msgText === "ping"))) {
      recommendation = "Needs clarification";
      reasoningPoints = [
        "The message is extremely vague, cryptic, or just a simple greeting with no context.",
        "Replying with a full answer is impossible because the sender has not stated their actual request.",
        "You don't need to play guessing games or invest energy anticipating their needs until they are explicit."
      ];
      nextAction = "Send a brief, friendly prompt asking them to share what they need.";
      templates = [
        {
          title: "Casual Query",
          text: "Hey! Hope you're doing well. What's on your mind?"
        },
        {
          title: "Professional Clarification",
          text: "Hi [Name], how can I help you today? Let me know the details and I'll get back to you as soon as I can."
        },
        {
          title: "Friendly & Short",
          text: "Hey! Got your ping. What's up?"
        }
      ];
    }
    // 4. REPLY LATER RULES
    else {
      recommendation = "Reply later";

      if (vibe === "angry") {
        reasoningPoints = [
          "The tone of the message is angry or confrontational.",
          "Replying immediately when emotions are running hot makes it easy to write something you will regret later.",
          "Waiting allows you to process the contents rationally and craft a calm, professional, and fact-focused reply."
        ];
        nextAction = "Cool down for 30-60 minutes. Draft your message in a separate text editor first, verify its tone, and send once ready.";
        templates = [
          {
            title: "Calm & Professional",
            text: "Hi [Name], I hear your concerns. Let me review the details of what happened so I can provide a constructive solution. I will follow up with you by [Time]."
          },
          {
            title: "Request for Call",
            text: "Hi [Name], thank you for sharing your feedback. I want to make sure we resolve this properly. Let's jump on a brief phone call tomorrow at [Time] to align."
          },
          {
            title: "Polite Acknowledgment",
            text: "Hi [Name], I've received your note. I'm investigating this issue and will follow up shortly once I have the facts."
          }
        ];
      } else if (vibe === "passive") {
        reasoningPoints = [
          "The sender is expressing passive-aggressive subtext or hidden criticism.",
          "Responding immediately might pull you into an emotional debate or validate their tone.",
          "Taking a break establishes a healthy boundary and keeps the conversation strictly functional."
        ];
        nextAction = "Wait a bit, then respond by focusing exclusively on the factual aspects of the message, ignoring the passive-aggressive tone completely.";
        templates = [
          {
            title: "Factual & Brief",
            text: "Hi [Name], thanks for the update. Regarding [Task], the current status is [Status]. Let me know if we need to adjust the plan."
          },
          {
            title: "Neutral Alignment",
            text: "Hi [Name], happy to address this. To make sure we are both on the same page, I'll proceed with [Action]. Let me know if that works."
          },
          {
            title: "Minimal Receipt",
            text: "Hi, got your message. Thanks for keeping me updated."
          }
        ];
      } else if (mood === "busy" || mood === "annoyed" || mood === "anxious") {
        reasoningPoints = [
          "You are currently feeling " + moodOptions.find(o => o.value === mood)?.label.split(" ").slice(1).join(" ") + ".",
          "Drafting responses while distracted, rushed, or stressed increases the chances of typos or unintentionally harsh wording.",
          "The message does not require instant response. It is perfectly fine to wait until you have the bandwidth."
        ];
        nextAction = "Set a reminder to reply to this message during your next designated admin block or break.";
        templates = [
          {
            title: "Polite Work Delay",
            text: "Hi [Name], I received your note. I'm currently focused on a time-sensitive task but will review this and respond fully by [Time / Tomorrow]."
          },
          {
            title: "Casual Friendly Delay",
            text: "Hey! Got your text. I'm tied up at the moment but will look into this and ping you back later tonight!"
          },
          {
            title: "Quick Holding Note",
            text: "Hey, thanks for reaching out! Got your message, will get back to you on this as soon as I'm free."
          }
        ];
      } else {
        // Default casual reply later
        reasoningPoints = [
          "This is a standard message with a neutral or casual tone.",
          "There is no urgent deadline, explicit emergency, or critical question attached.",
          "Replying within a few hours (or by the end of the day) is standard social etiquette and keeps your boundaries intact."
        ];
        nextAction = "No rush. Plan to reply during your next phone session or when you wrap up your current activity.";
        templates = [
          {
            title: "Friendly & Conversational",
            text: "Hey [Name]! Thanks for sending this over. Yes, I agree that [Opinion / Response]. Let me know what you think!"
          },
          {
            title: "Simple Approval",
            text: "Hey! Sounds great, let's go ahead with that. Let me know if you need anything else from my end."
          },
          {
            title: "Standard Professional",
            text: "Hi [Name], thank you for the update. I have reviewed the details and will keep this in mind as we move forward."
          }
        ];
      }
    }

    return {
      recommendation,
      reasoningPoints,
      nextAction,
      templates
    };
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

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case "Reply now":
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
          badge: "bg-emerald-500 text-white",
          iconColor: "text-emerald-500",
        };
      case "Reply later":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-800",
          badge: "bg-amber-500 text-white",
          iconColor: "text-amber-500",
        };
      case "Ignore":
        return {
          bg: "bg-rose-50 border-rose-200 text-rose-800",
          badge: "bg-rose-500 text-white",
          iconColor: "text-rose-500",
        };
      case "Needs clarification":
        return {
          bg: "bg-sky-50 border-sky-200 text-sky-800",
          badge: "bg-sky-500 text-white",
          iconColor: "text-sky-500",
        };
      default:
        return {
          bg: "bg-slate-50 border-slate-200 text-slate-800",
          badge: "bg-slate-500 text-white",
          iconColor: "text-slate-500",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-5xl border border-slate-200 flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Should I Reply?</h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Evaluate if, when, and how you should reply to a message based on relationship, tone, and context.
          </p>
        </div>

        {/* Presets Bar */}
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Presets:</span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(preset)}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-amber-500 hover:bg-orange-50 font-medium transition cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          
          {/* Left Side: Inputs */}
          <div className="flex flex-col gap-4">
            
            {/* Message Area */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800 flex justify-between">
                <span>The Message</span>
                <span className="text-xs text-slate-400 font-normal">Copy & paste here</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-sm text-slate-900 placeholder:text-slate-400"
                placeholder="Paste the text message, email, or DM here..."
              />
            </div>

            {/* Context Area */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800 flex justify-between">
                <span>Optional Context</span>
                <span className="text-xs text-slate-400 font-normal">Any extra details?</span>
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={2}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-sm text-slate-900 placeholder:text-slate-400"
                placeholder="e.g., Sent on a Sunday night, We went on one date, They are my landlord..."
              />
            </div>

            {/* Dropdown Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Who sent this?</label>
                <ThemedDropdown
                  ariaLabel="Select sender relationship"
                  value={relationship}
                  options={relationshipOptions}
                  onChange={setRelationship}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Message vibe/tone?</label>
                <ThemedDropdown
                  ariaLabel="Select message vibe"
                  value={vibe}
                  options={vibeOptions}
                  onChange={setVibe}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Action required?</label>
                <ThemedDropdown
                  ariaLabel="Select message urgency"
                  value={urgency}
                  options={urgencyOptions}
                  onChange={setUrgency}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">How are you feeling?</label>
                <ThemedDropdown
                  ariaLabel="Select your mood"
                  value={mood}
                  options={moodOptions}
                  onChange={setMood}
                />
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!message.trim() || isLoading}
                className={`flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition shadow focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center justify-center gap-2 cursor-pointer ${
                  !message.trim() || isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing Message...
                  </>
                ) : (
                  "Evaluate Message"
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
              >
                Clear
              </button>
            </div>

          </div>

          {/* Right Side: Verdict / Results */}
          <div className="flex flex-col gap-4">
            
            {!result && !isLoading && (
              <div className="h-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center gap-3">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-slate-700 text-base">Awaiting Evaluation</h3>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Paste a message, choose options, and hit 'Evaluate Message' to see the recommended strategy.
                  </p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center text-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-100 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin"></div>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-slate-800 text-sm">Consulting the boundaries guide...</h3>
                  <p className="text-xs text-slate-400">
                    Formulating the healthiest response rate...
                  </p>
                </div>
              </div>
            )}

            {result && !isLoading && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-5 shadow-sm">
                
                {/* Visual Recommendation badge */}
                <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${getRecommendationColor(result.recommendation).bg}`}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs uppercase tracking-wider opacity-75 font-semibold">Our Recommendation</span>
                    <span className="text-xl font-bold">{result.recommendation}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRecommendationColor(result.recommendation).badge}`}>
                    Verdict
                  </span>
                </div>

                {/* Reasoning */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">Why? (Reasoning)</h3>
                  <ul className="list-disc list-inside text-xs text-slate-600 flex flex-col gap-1.5 pl-1">
                    {result.reasoningPoints.map((point, index) => (
                      <li key={index} className="leading-relaxed">
                        <span className="text-slate-600 font-normal">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Next Action */}
                <div className="flex flex-col gap-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Next Action</h3>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{result.nextAction}</p>
                </div>

                {/* Canned Templates */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-slate-900">Canned Templates</h3>
                    <span className="text-[10px] text-slate-400">Click to copy</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {result.templates.map((tmpl, idx) => (
                      <div
                        key={idx}
                        className="group relative border border-slate-100 hover:border-amber-300 rounded-xl p-3 bg-white hover:bg-orange-50/20 transition flex flex-col gap-1 text-left"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-400 uppercase">{tmpl.title}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tmpl.text, "template", idx)}
                            className="text-[10px] font-semibold text-amber-600 hover:text-amber-700 transition flex items-center gap-1 cursor-pointer"
                          >
                            {copiedTemplateIdx === idx ? (
                              <span className="text-emerald-600 font-bold">Copied!</span>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 font-serif italic bg-slate-50/50 p-2 rounded border border-slate-100/50 select-all whitespace-pre-wrap">
                          {tmpl.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Actions */}
                <div className="border-t border-slate-100 pt-4 mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const fullReport = `Verdict: ${result.recommendation}\n\nReasoning:\n${result.reasoningPoints.map(p => `- ${p}`).join("\n")}\n\nSuggested Next Action:\n${result.nextAction}`;
                      copyToClipboard(fullReport, "report");
                    }}
                    className="flex-1 text-xs py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {copiedText === "report" ? "Report Copied!" : "Copy Full Report"}
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      <style jsx global>{`
        html { font-family: var(--font-geist-sans), 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}

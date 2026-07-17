"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import ComingSoon from "@/app/components/ComingSoon";

const TOOL_STATUS = "live";

// Preset Agent Workflows
const PRESETS = {
  "customer-support": {
    name: "Customer Support Agent",
    prompt: "An AI support agent that manages user requests, checks refund eligibility, and resolves active tickets.",
    architecture: "tool",
    tools: ["Ticket Database", "Email Client", "Refund Stripe API", "Slack Alerts"],
    memory: "Active ticket context, User subscription tier, Past support interactions",
    difficulty: "Medium",
    customSteps: [
      { id: "request", title: "User Request", desc: "User messages: 'Can I get a refund for my last invoice? I forgot to cancel.'" },
      { id: "planner", title: "Planner", desc: "Decomposes task: 1. Get customer ID, 2. Check billing records, 3. Validate refund policy (14-day limit), 4. Trigger refund if eligible." },
      { id: "memory", title: "Memory", desc: "Retrieves customer subscription tier (Pro, billing date: 5 days ago) and confirms no prior refunds." },
      { id: "retriever", title: "Retriever", desc: "Queries refund policy docs: 'Customers are eligible for refunds if requested within 14 days of invoice date.'" },
      { id: "reasoning", title: "Reasoning", desc: "Decides: The invoice was 5 days ago (within 14 days) and user tier is eligible. Next action: Call Refund API." },
      { id: "tools", title: "Tool Calling", desc: "Triggers Stripe Refund API for Invoice #8849. API returns status: 'SUCCESS'." },
      { id: "reflection", title: "Reflection", desc: "Double-checks transaction: Stripe refunded $29.00. Confirms invoice matches user account. Ready to reply." },
      { id: "response", title: "Final Response", desc: "Sends confirmation email: 'I have processed your refund of $29.00. It should reflect in 3-5 days.'" }
    ]
  },
  "research": {
    name: "Research Agent",
    prompt: "A competitor market intelligence agent that scrapes pricing data and drafts comprehensive summary reports.",
    architecture: "research",
    tools: ["Google Search API", "Web Scraper", "Notion API", "Database Writer"],
    memory: "Competitor list, Target metrics, Draft outlines, Search history",
    difficulty: "Hard",
    customSteps: [
      { id: "request", title: "User Request", desc: "Research request: 'Find pricing details for top 3 visualizer tools and compile a comparison table.'" },
      { id: "planner", title: "Planner", desc: "Builds query queue. Directs sequence: Search top tools -> Scrape prices -> Compare specs -> Draft markdown summary." },
      { id: "memory", title: "Memory", desc: "Loads target pricing parameters (monthly cost, annual discount, free tier limits)." },
      { id: "retriever", title: "Retriever", desc: "Finds local internal market templates and historical pricing categories." },
      { id: "reasoning", title: "Reasoning", desc: "Executes searches sequentially. Reviews scraper outputs to isolate numbers from pricing tables." },
      { id: "tools", title: "Tool Calling", desc: "Uses Google Search API for visualizers, then invokes Web Scraper on landing pages." },
      { id: "reflection", title: "Reflection", desc: "Validates facts: One tool listed '$0' but was actually a 7-day trial. Adjusts summary to represent trial correctly." },
      { id: "response", title: "Final Response", desc: "Publishes markdown comparison report to user's dashboard and writes data to marketing database." }
    ]
  },
  "coding": {
    name: "Coding Agent",
    prompt: "An autonomous developer agent that reads files, edits source code, runs test suites, and fixes bugs.",
    architecture: "coding",
    tools: ["File Reader/Writer", "Terminal execution", "Git commands", "Linter API"],
    memory: "Active branch, codebase files list, test history, linter settings",
    difficulty: "Expert",
    customSteps: [
      { id: "request", title: "User Request", desc: "Bug ticket: 'Fix the page layout crash in React 19 on the checkout screen.'" },
      { id: "planner", title: "Planner", desc: "Plan: 1. Locate checkout.jsx, 2. Run local server to view logs, 3. Repair hook dependencies, 4. Run linter, 5. Run test suite." },
      { id: "memory", title: "Memory", desc: "Recalls previous test failure logs and remembers that React 19 hook rules require specific ref management." },
      { id: "retriever", title: "Retriever", desc: "Searches project files for references to 'checkoutScreen' or 'paymentHook'." },
      { id: "reasoning", title: "Reasoning", desc: "Identifies that a useEffect ref callback is returning a clean-up function improperly. Code needs a refactor." },
      { id: "tools", title: "Tool Calling", desc: "Invokes File Editor to modify code in checkout.jsx line 144, then runs npm test in terminal." },
      { id: "reflection", title: "Reflection", desc: "Scans test runner stdout. 12/12 tests passed. Linter shows 0 warnings. Fix is verified." },
      { id: "response", title: "Final Response", desc: "Pushes git branch 'fix/react19-checkout-crash' and requests a developer code review." }
    ]
  },
  "travel": {
    name: "Travel Planner",
    prompt: "An agent that curates itineraries, checks hotel availability, and compiles travel guides.",
    architecture: "tool",
    tools: ["Hotel Booking API", "Weather API", "Google Maps Router", "PDF Generator"],
    memory: "User dietary requirements, Budget constraints, Flights schedule",
    difficulty: "Medium",
    customSteps: [
      { id: "request", title: "User Request", desc: "Plan a 3-day weekend trip to Tokyo with vegetarian dining options and a budget under $1000." },
      { id: "planner", title: "Planner", desc: "Breaks down: 1. Fetch weather forecast, 2. Find hotels, 3. Locate vegetarian restaurants in Shibuya, 4. Draft day-by-day map route." },
      { id: "memory", title: "Memory", desc: "Recalls user's preferred hotel brand and allergy details (no peanut oil)." },
      { id: "retriever", title: "Retriever", desc: "Pulls up city attraction indexes and travel guide PDFs stored in local cache." },
      { id: "reasoning", title: "Reasoning", desc: "Finds hotel for $150/night (total $450), leaving $550 for dining and entry tickets. Perfect for budget." },
      { id: "tools", title: "Tool Calling", desc: "Queries Weather API (predicts clear skies) and Hotel booking API (books room). Checks Maps API for commute times." },
      { id: "reflection", title: "Reflection", desc: "Checks itinerary: Shibuya route on Saturday has too many sites crammed in. Moves Meiji Shrine to Sunday morning to avoid fatigue." },
      { id: "response", title: "Final Response", desc: "Presents a custom 3-day Tokyo itinerary dashboard, complete with vegetarian pins and map links." }
    ]
  },
  "email": {
    name: "Email Assistant",
    prompt: "An inbox triage agent that reads incoming emails, categorizes urgency, drafts replies, and flags critical files.",
    architecture: "simple",
    tools: ["Email Client API", "Slack API", "Calendar Scheduler"],
    memory: "Priority sender lists, calendar schedule, corporate templates",
    difficulty: "Easy",
    customSteps: [
      { id: "request", title: "User Request", desc: "New email: 'Hi, can we reschedule our pricing sync to tomorrow at 2 PM? - Client'" },
      { id: "planner", title: "Planner", desc: "Goal: 1. Check current calendar availability, 2. Draft rescheduling reply, 3. Update calendar placeholder." },
      { id: "memory", title: "Memory", desc: "Reads client profile. Client is high-value tier. Priority response required." },
      { id: "retriever", title: "Retriever", desc: "Pulls calendar schedule for tomorrow from 1 PM to 4 PM." },
      { id: "reasoning", title: "Reasoning", desc: "Calendar is free at 2 PM. Tomorrow is Friday. Auto-accept is safe according to user preferences." },
      { id: "tools", title: "Tool Calling", desc: "Calls Calendar API to hold tomorrow 2:00-2:30 PM. Drafts email draft in Gmail Client." },
      { id: "reflection", title: "Reflection", desc: "Reviews email draft to ensure tone is professional and timezone (EST) is explicitly stated." },
      { id: "response", title: "Final Response", desc: "Replies: 'Yes, 2 PM EST tomorrow works. I have updated the invite.' Blocks calendar slot." }
    ]
  },
  "tutor": {
    name: "Personal Tutor",
    prompt: "A learning agent that explains complex physics or math concepts with custom quizzes and analogies.",
    architecture: "planning",
    tools: ["Wikipedia API", "LaTeX Parser", "Vector database"],
    memory: "Student learning speed, past quiz mistakes, active topic index",
    difficulty: "Medium",
    customSteps: [
      { id: "request", title: "User Request", desc: "Explain 'quantum superposition' like I am 12, then give me a 1-question quiz." },
      { id: "planner", title: "Planner", desc: "Plan: 1. Frame basic definition, 2. Create analogy (spinning coin), 3. Formulate multiple-choice question, 4. Wait for answer." },
      { id: "memory", title: "Memory", desc: "Recalls student prefers game development analogies and visual explanations." },
      { id: "retriever", title: "Retriever", desc: "Retrieves quantum computing basic notes and spin state descriptions from physics textbook index." },
      { id: "reasoning", title: "Reasoning", desc: "Formulates analogy: A coin spinning on a table is both heads and tails until you stop it with your hand. That's superposition." },
      { id: "tools", title: "Tool Calling", desc: "Calls LaTeX renderer to format wavefunction equations if student wants to unlock advanced formulas." },
      { id: "reflection", title: "Reflection", desc: "Verifies the quiz question is intuitive and doesn't require advanced linear algebra to solve." },
      { id: "response", title: "Final Response", desc: "Outputs the coin analogy, renders basic equations, and displays quiz: 'What causes a superposition state to collapse?'" }
    ]
  },
  "content-creator": {
    name: "Content Creator",
    prompt: "A social media writer agent that converts long articles into short viral threads with high-converting hooks.",
    architecture: "simple",
    tools: ["LinkedIn API", "Draft manager", "SEO Auditor"],
    memory: "Brand tone, past viral posts list, hashtag analytics",
    difficulty: "Easy",
    customSteps: [
      { id: "request", title: "User Request", desc: "Turn this 1000-word product launch article into a 5-part LinkedIn thread." },
      { id: "planner", title: "Planner", desc: "Flow: 1. Read post, 2. Identify 3 core hooks, 3. Draft 5 hooks, 4. Expand selected hook to 5 distinct bullets, 5. Append CTA." },
      { id: "memory", title: "Memory", desc: "Recalls that target reader base is early-stage founders and tone must be direct and contrarian." },
      { id: "retriever", title: "Retriever", desc: "Retrieves top 10 best-performing hooks from past month campaigns." },
      { id: "reasoning", title: "Reasoning", desc: "Decides: A hook highlighting 'cost savings' will perform best for this crowd. Drafts around 'why we killed SaaS tools'." },
      { id: "tools", title: "Tool Calling", desc: "Runs SEO auditor to verify word counts and readability index of drafts." },
      { id: "reflection", title: "Reflection", desc: "Reviews readability: Thread is clean, spaces look good on mobile screens. Removed 2 hashtags to look less spammy." },
      { id: "response", title: "Final Response", desc: "Displays ready-to-copy 5-part LinkedIn thread with hook templates." }
    ]
  },
  "discord-bot": {
    name: "Discord Bot Moderator",
    prompt: "A community safety agent that scans chat channels, monitors links, and silences spam accounts.",
    architecture: "tool",
    tools: ["Discord Guild API", "Spam Checker AI", "Mod logs DB"],
    memory: "Channel rules list, warnings count per user, trust score index",
    difficulty: "Medium",
    customSteps: [
      { id: "request", title: "User Request", desc: "Scans message: 'Hey join my server for FREE CRYPO COINS NOW!!! [link]'" },
      { id: "planner", title: "Planner", desc: "Plan: 1. Scan text for spam triggers, 2. Assess link safety, 3. Check sender warnings, 4. Issue warn or mute." },
      { id: "memory", title: "Memory", desc: "Checks user history: User 'cryptoGuy42' joined 4 minutes ago. Has 0 previous warnings." },
      { id: "retriever", title: "Retriever", desc: "Searches channel guidelines: 'No crypto advertising allowed without VIP tag.'" },
      { id: "reasoning", title: "Reasoning", desc: "This is high-confidence spam. Immediate action needed. Link domain is flagged on blacklist." },
      { id: "tools", title: "Tool Calling", desc: "Calls Discord API to delete the message and issue a 24-hour mute to the sender. Logs action in DB." },
      { id: "reflection", title: "Reflection", desc: "Verifies the mute API call was successful and logs the action under 'AutoMod Spam Guard'." },
      { id: "response", title: "Final Response", desc: "Auto-alerts channel chat: 'Message deleted. Muted user for spam. Maintain channel safety.'" }
    ]
  },
  "finance": {
    name: "Finance Assistant",
    prompt: "An analyst agent that parses stock prices, tracks company P&E ratios, and drafts portfolio suggestions.",
    architecture: "research",
    tools: ["Yahoo Finance API", "SEC filings scraper", "CSV calculator"],
    memory: "User investment targets, risk tolerance, current portfolio holdings",
    difficulty: "Hard",
    customSteps: [
      { id: "request", title: "User Request", desc: "Analyze AAPL stock performance over last 30 days and compare it to MSFT." },
      { id: "planner", title: "Planner", desc: "Workflow: 1. Pull historical price tables, 2. Calculate moving averages, 3. Compare growth curves, 4. Outline market drivers." },
      { id: "memory", title: "Memory", desc: "Recalls user is risk-averse and holds a tech-heavy index portfolio." },
      { id: "retriever", title: "Retriever", desc: "Searches local financial dictionary for current visualizer valuation templates." },
      { id: "reasoning", title: "Reasoning", desc: "AAPL price grew by 4.2% while MSFT grew by 1.8%. AAPL PE ratio is slightly lower, showing better short-term value." },
      { id: "tools", title: "Tool Calling", desc: "Triggers Yahoo Finance API for ticker quotes. Triggers CSV calculator to compute percentage returns." },
      { id: "reflection", title: "Reflection", desc: "Fact-checks MSFT dividend payout dates to confirm if they impacted pricing changes." },
      { id: "response", title: "Final Response", desc: "Displays comparison table showing 30-day gains, active moving averages, and a brief risk summary." }
    ]
  }
};

// Architecture layouts: nodes included in workflow
const ARCHITECTURES = {
  simple: {
    name: "Simple Agent",
    desc: "Direct prompt-to-response loop. Best for quick, predictable content creation and email sorting.",
    nodes: ["request", "reasoning", "llm", "response"]
  },
  rag: {
    name: "RAG Agent",
    desc: "Retrieval-Augmented Generation. Fetches relevant documents from a knowledge library before calling the LLM.",
    nodes: ["request", "memory", "retriever", "llm", "response"]
  },
  tool: {
    name: "Tool Agent",
    desc: "Empowers the LLM with integrations like search, database, and third-party APIs to take action.",
    nodes: ["request", "memory", "reasoning", "llm", "tools", "response"]
  },
  planning: {
    name: "Planning Agent",
    desc: "Uses structured planning (like Chain of Thought) to decompose problems before execution.",
    nodes: ["request", "planner", "reasoning", "llm", "response"]
  },
  research: {
    name: "Research Agent",
    desc: "A thorough cycle combining planning, search tools, vector memory, and self-reflection.",
    nodes: ["request", "planner", "memory", "retriever", "reasoning", "llm", "tools", "reflection", "response"]
  },
  coding: {
    name: "Coding Agent",
    desc: "Specialized for software development. Plans changes, edits code files, runs commands, and inspects warnings.",
    nodes: ["request", "planner", "reasoning", "tools", "reflection", "response"]
  },
  multi: {
    name: "Multi-Agent Network",
    desc: "Collaborative network of specialized agents communicating back and forth under a manager agent.",
    nodes: ["request", "manager-agent", "research-agent", "writer-agent", "reviewer-agent", "response"]
  }
};

// Node specifications (used for side-panel detail rendering)
const NODE_DETAILS = {
  request: {
    title: "User Request",
    beginnerTitle: "User Prompt / Goal",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    purpose: "Defines the goal, parameters, and constraints for the AI agent to accomplish.",
    whyExists: "Without an objective, the agent has no direction. It serves as the baseline target.",
    whenNeeded: "Always required for any agent workflow to start.",
    examples: ["'Scrape Amazon pricing for keyboards'", "'Draft a reply to Invoice #4481'"],
    mistakes: "Vague requests without parameters (e.g. 'Fix my code' instead of pointing to specific files).",
    practices: "Include clear formats, limitations, target audiences, and success criteria.",
    difficulty: "Easy",
    latency: "Immediate (0ms)"
  },
  planner: {
    title: "Planner",
    beginnerTitle: "Decision Maker",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    purpose: "Decomposes a complex objective into sequential tasks or execution loops.",
    whyExists: "LLMs perform poorly when asked to solve complex multi-step objectives in a single go.",
    whenNeeded: "Crucial for coding, research, and tasks requiring multiple independent tool usages.",
    examples: ["Chain of Thought (CoT), Plan-and-Solve frameworks, Tree of Thoughts (ToT)."],
    mistakes: "Planning too far in advance without adjusting for dynamic errors returned by tools.",
    practices: "Maintain an active checklist that updates dynamically after each tool output.",
    difficulty: "Medium",
    latency: "500ms - 1500ms"
  },
  memory: {
    title: "Memory",
    beginnerTitle: "AI Memory Library",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    purpose: "Stores and retrieves context about the conversation or general rules across steps.",
    whyExists: "Keeps track of variables, user preferences, and state history in long conversations.",
    whenNeeded: "Required for chatbots, multi-step code correction, or customized personal profiles.",
    examples: ["Short-term memory (session logs), Long-term memory (user database fields)."],
    mistakes: "Overloading memory with irrelevant text, exceeding context window token limits.",
    practices: "Use summaries to compress historical messages, store key facts in JSON formats.",
    difficulty: "Medium",
    latency: "200ms - 400ms"
  },
  retriever: {
    title: "Retriever",
    beginnerTitle: "Smart Search",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    purpose: "Fetches specific matches from external knowledge bases (RAG) using similarity algorithms.",
    whyExists: "LLMs do not know your private business data or updates published after their training date.",
    whenNeeded: "Querying documentation, user databases, manuals, or PDF reports.",
    examples: ["Vector DB searches, semantic queries, hybrid TF-IDF keyword indexing."],
    mistakes: "Retrieving outdated files or injecting massive documents without filtering sections.",
    practices: "Chunk documents into short paragraphs and index using modern vector embeddings.",
    difficulty: "Hard",
    latency: "300ms - 800ms"
  },
  reasoning: {
    title: "Reasoning",
    beginnerTitle: "Thinking Process",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    purpose: "The internal analysis engine that reviews inputs, memory, and facts to choose next action.",
    whyExists: "Enables logical deductions, calculations, and structured output planning.",
    whenNeeded: "Always required when the path to the answer isn't a direct copy-paste response.",
    examples: ["ReAct loop (Reasoning + Acting), reasoning models like OpenAI o1 / DeepSeek R1."],
    mistakes: "Skipping reasoning and jumping straight to text output, leading to math errors.",
    practices: "Enforce a structured scratchpad text block where the LLM must write down its math first.",
    difficulty: "Hard",
    latency: "800ms - 3000ms"
  },
  llm: {
    title: "LLM",
    beginnerTitle: "AI Brain",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    purpose: "The core language intelligence model that processes text vectors and generates responses.",
    whyExists: "Performs the actual translation from text vectors to semantic human language sentences.",
    whenNeeded: "Always required as the central compiler.",
    examples: ["Claude 3.5 Sonnet, GPT-4o, Llama-3, Gemini 1.5 Pro."],
    mistakes: "Using a massive expensive model for simple classification tasks.",
    practices: "Match prompt complexity to model size (e.g. use smaller fast models for routers).",
    difficulty: "Medium",
    latency: "500ms - 2000ms"
  },
  tools: {
    title: "Tool Calling",
    beginnerTitle: "Action Center",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    purpose: "Executes actual actions (writing databases, calling APIs, querying web portals).",
    whyExists: "Converts the AI from an offline writer to an active system capable of moving real data.",
    whenNeeded: "Updating CRM, deleting servers, checking live traffic, placing purchases.",
    examples: ["Database API, Google Calendar SDK, custom shell command scripts."],
    mistakes: "Giving the AI broad read/write keys to root directories without check gates.",
    practices: "Implement user-approval steps for write-actions, sanitize arguments carefully.",
    difficulty: "Medium",
    latency: "100ms - 1000ms"
  },
  reflection: {
    title: "Reflection",
    beginnerTitle: "Self-Review",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    purpose: "An evaluation step where the agent critiques its own work or test results for accuracy.",
    whyExists: "Catches formatting errors, code bugs, or factual hallucinations before showing the user.",
    whenNeeded: "High-accuracy domains (coding, medical parsing, tax summaries).",
    examples: ["Self-Correction loops, syntax compilation checkers, fact-checkers."],
    mistakes: "Infinite reflection loops where the AI keeps criticizing its output without stopping.",
    practices: "Cap the maximum reflection retries to 3 times, inject static schema validators.",
    difficulty: "Hard",
    latency: "500ms - 2000ms"
  },
  response: {
    title: "Final Response",
    beginnerTitle: "Answer Generated",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    purpose: "Delivers the formatted product, code, or answer back to the human client.",
    whyExists: "Marks the successful conclusion of the agent execution sequence.",
    whenNeeded: "Always required to deliver value.",
    examples: ["Markdown text, updated CSV files, API responses, slack notifications."],
    mistakes: "Returning ugly raw JSON or debug traces instead of clean markdown summaries.",
    practices: "Tailor formatting to the platform (e.g. bold highlights for Slack, table grid for reports).",
    difficulty: "Easy",
    latency: "Immediate (0ms)"
  },
  // Multi-agent node overrides
  "manager-agent": {
    title: "Manager Agent",
    beginnerTitle: "Team Captain AI",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    purpose: "Supervises the team, parses prompt, delegates to sub-agents, and checks final quality.",
    whyExists: "Orchestrates complex flows requiring different domain expertise in separate steps.",
    whenNeeded: "Software agencies, legal auditing boards, deep multi-source research tasks.",
    examples: ["LangGraph Supervisor layouts, CrewAI Manager roles."],
    mistakes: "Too many sub-agents talking at once, creating endless loops of conversation.",
    practices: "Enforce strict reporting structures. Sub-agents must talk only to the manager.",
    difficulty: "Hard",
    latency: "1000ms - 4000ms"
  },
  "research-agent": {
    title: "Research Agent",
    beginnerTitle: "Search Specialist AI",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5a2 2 0 01-2-2v-5m0 5a2 2 0 002 2h2m2 4h4m-2 0v-4" />
      </svg>
    ),
    purpose: "Focuses entirely on searching databases, reading manuals, and gathering raw parameters.",
    whyExists: "Specialization leads to cleaner searches without getting distracted by writing style.",
    whenNeeded: "Whenever external documents or google searches are required in bulk.",
    examples: ["Querying pricing data, looking up code compiler warnings, fetching laws."],
    mistakes: "Writing massive text summaries instead of providing raw concise fact tables.",
    practices: "Equip this agent with search tools, scrapers, and citation database buffers.",
    difficulty: "Medium",
    latency: "500ms - 2000ms"
  },
  "writer-agent": {
    title: "Writer Agent",
    beginnerTitle: "Copywriter AI",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    purpose: "Drafts reports, letters, essays, or code based on instructions from the Manager.",
    whyExists: "Keeps draft creation separate from editing, improving content flow and coherence.",
    whenNeeded: "Creating marketing letters, writing markdown reports, creating React code files.",
    examples: ["Drafting blogs, creating documentation, compiling SQL queries."],
    mistakes: "Hallucinating details that were not provided by the Research Agent.",
    practices: "Limit creativity temperature parameter, enforce strict references to research.",
    difficulty: "Medium",
    latency: "500ms - 1500ms"
  },
  "reviewer-agent": {
    title: "Reviewer Agent",
    beginnerTitle: "Editor / Auditor AI",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    purpose: "Audits the writer's outputs, matching them against client guidelines and correctness checks.",
    whyExists: "Acts as a quality assurance gate to reject and request retries if quality is low.",
    whenNeeded: "Whenever high quality, style guide compliance, or error-free outputs are mandatory.",
    examples: ["Linter automation, legal checklist compliance audit, readability scoring."],
    mistakes: "Approving bad outputs, or endlessly rejecting drafts without clear feedback directions.",
    practices: "Use a structured score (e.g. 1-10) and write down precise reasons for rejection.",
    difficulty: "Hard",
    latency: "800ms - 2500ms"
  }
};

// Component Library Glossary
const GLOSSARY = [
  { id: "llm", category: "Core", name: "LLM (Large Language Model)", desc: "The core statistical model trained on vast text data that calculates the most likely next word in a sequence.", analogy: "Like a highly sophisticated autocomplete on your smartphone, but trained on the entire internet.", example: "GPT-4o, Claude 3.5 Sonnet, Llama 3." },
  { id: "prompt", category: "Core", name: "Prompt", desc: "The textual input, instructions, and constraints sent to an LLM to guide its output.", analogy: "Instructions given to an actor before they walk onto a theatrical stage.", example: "'Act as a Python compiler. Output only valid JSON.'" },
  { id: "planner", category: "Architecture", name: "Planner", desc: "An architectural component that breaks down a complex goal into smaller steps before executing them.", analogy: "A project manager mapping out a Trello board before developers start writing lines of code.", example: "Decomposing 'Book travel' into: 1. Fetch flight, 2. Book hotel, 3. Send email." },
  { id: "memory", category: "Core", name: "Memory", desc: "The mechanism that allows an agent to persist facts, variables, and messages across multiple model invocations.", analogy: "A clipboard that the AI writes details on so it doesn't forget them when it switches tabs.", example: "Storing 'User name is Sarah' in a key-value store during a chat session." },
  { id: "context-window", category: "Core", name: "Context Window", desc: "The maximum capacity of text (measured in tokens) an LLM can parse and generate in a single query.", analogy: "The size of a student's desk. If the desk is full, they must discard old papers to make space for new ones.", example: "Gemini 1.5 Pro supporting up to 2 million tokens of active text context." },
  { id: "rag", category: "Systems", name: "RAG (Retrieval-Augmented Gen)", desc: "A method that searches documents in a database and injects relevant paragraphs into the prompt to prevent hallucinations.", analogy: "An open-book exam where the student searches the textbook for the correct answer instead of guessing.", example: "Searching a company HR handbook PDF and appending the matches to the chat prompt." },
  { id: "embeddings", category: "Systems", name: "Embeddings", desc: "Mathematical representations of words or sentences as arrays of numbers, showing semantic closeness.", analogy: "Representing recipes by coordinates on a flavor map (sweetness, spiciness, saltiness) to group similar foods.", example: "Converting 'King' and 'Queen' into similar arrays like [0.22, 0.81, -0.45] representing royalty." },
  { id: "vector-db", category: "Systems", name: "Vector Database", desc: "A database optimized for storing mathematical embeddings and performing rapid similarity searches.", analogy: "A library where books aren't sorted by title, but rather clustered in 3D space by topic similarity.", example: "Pinecone, Qdrant, Milvus, pgvector." },
  { id: "api", category: "Core", name: "API (Application Prog Interface)", desc: "A digital bridge allowing software programs to exchange structured actions and variables.", analogy: "A restaurant waiter taking your order to the kitchen and bringing back the hot meal.", example: "Sending Stripe a transaction ID to trigger an invoice cancellation." },
  { id: "tool-calling", category: "Architecture", name: "Tool Calling", desc: "The capability where an LLM writes down a structured command (like JSON) specifying which API to execute and what variables to pass.", analogy: "A smart mechanic selecting a wrench from their toolkit instead of using their bare hands.", example: "LLM outputting: { 'call': 'WeatherAPI', 'location': 'London' } to fetch local temperatures." },
  { id: "reflection", category: "Architecture", name: "Reflection / Self-Critique", desc: "A loop where the agent inspects its own work, checks assertions, or runs tests to verify output accuracy before delivery.", analogy: "A writer proofreading their draft twice before sending it to the editor.", example: "Checking if code compiles locally and editing the lines if compiler warnings are detected." },
  { id: "guardrails", category: "Systems", name: "Guardrails", desc: "Pre-processing or post-processing filters that block unsafe prompts or prevent the model from outputting sensitive details.", analogy: "Safety rails on a winding mountain road that prevent cars from sliding off the cliff.", example: "Blocking requests asking for passwords, or censoring output matching database credit card structures." },
  { id: "reasoning", category: "Architecture", name: "Reasoning Models", desc: "Models configured to output their detailed chain-of-thought steps before printing the final solution.", analogy: "A math student showing every single step of algebra on the whiteboard rather than just the final number.", example: "DeepSeek R1 or OpenAI o1 calculating moves in a chess match." },
  { id: "hallucination", category: "Core", name: "Hallucination", desc: "When an LLM generates facts, dates, links, or code libraries that look highly confident but are entirely made up.", analogy: "A confident salesperson making up a fake delivery date to secure a contract.", example: "AI suggesting a non-existent npm library called 'react-fast-visualizer-easy'." },
  { id: "fine-tuning", category: "Core", name: "Fine Tuning", desc: "Adapting a pre-trained model to specific formats, styles, or private vocabularies by training it on a smaller curated dataset.", analogy: "Sending a general doctor to a 6-month intensive training program to become a cardiology specialist.", example: "Training Llama-3 on a collection of historical court rulings to match legal style." },
  { id: "agent", category: "Systems", name: "AI Agent", desc: "An autonomous software loop powered by an LLM that runs planning, tool calls, and reflection to achieve a user goal.", analogy: "A smart robotic vacuum. You set a goal ('Clean floor'), and it navigates obstacles, uses tools (vacuum), and docks itself.", example: "An autonomous developer agent fixing git repository issues on its own." },
  { id: "workflow", category: "Systems", name: "AI Workflow", desc: "A predictable, hard-coded sequence of LLM prompts and API calls without autonomous decision loops.", analogy: "An assembly line conveyor belt. Code goes from Step A to Step B, with no deviation in direction.", example: "Translating a blog post to French, formatting it as HTML, and publishing it." }
];

export default function AIAgentVisualizerPage() {
  if (TOOL_STATUS === "upcoming") {
    return <ComingSoon toolName="AI Agent Visualizer" />;
  }

  // Core App States
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [selectedArch, setSelectedArch] = useState("tool");
  const [customInput, setCustomInput] = useState("");
  const [activePreset, setActivePreset] = useState("customer-support");
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Playback states
  const [playbackActive, setPlaybackActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1500); // ms per step
  const [logs, setLogs] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  // Advanced Mode simulated counters
  const [metrics, setMetrics] = useState({
    latency: 0,
    tokensIn: 0,
    tokensOut: 0,
    modelCalls: 0,
    apiCalls: 0,
    memoryUsage: 0
  });

  // Reference for graph container and download canvas
  const canvasRef = useRef(null);
  const playTimerRef = useRef(null);
  const logEndRef = useRef(null);

  // Load history/favorites from Local Storage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("ai-agent-visualizer-history");
      const savedFavorites = localStorage.getItem("ai-agent-visualizer-favorites");
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch (e) {
      console.error("Local storage read failure", e);
    }
  }, []);

  // Save history helper
  const saveHistoryToLocalStorage = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem("ai-agent-visualizer-history", JSON.stringify(newHistory));
  };

  // Save favorites helper
  const saveFavoritesToLocalStorage = (newFavs) => {
    setFavorites(newFavs);
    localStorage.setItem("ai-agent-visualizer-favorites", JSON.stringify(newFavs));
  };

  // Dynamic step compilation based on custom input or preset selection
  const currentWorkflowData = useMemo(() => {
    if (customInput.trim()) {
      // Generate a beautiful custom agent sequence dynamically
      const cleanInput = customInput.trim();
      const topic = cleanInput.replace(/i\s+want\s+an\s+ai\s+agent\s+that\s+/i, "")
                               .replace(/i\s+want\s+to\s+build\s+an\s+agent\s+/i, "")
                               .replace(/agent\s+that\s+/i, "")
                               .replace(/please\s+build\s+/i, "");

      const formattedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
      
      // Determine probable architecture
      let arch = "tool";
      if (cleanInput.toLowerCase().includes("research") || cleanInput.toLowerCase().includes("competitor") || cleanInput.toLowerCase().includes("market")) {
        arch = "research";
      } else if (cleanInput.toLowerCase().includes("code") || cleanInput.toLowerCase().includes("debug") || cleanInput.toLowerCase().includes("git")) {
        arch = "coding";
      } else if (cleanInput.toLowerCase().includes("team") || cleanInput.toLowerCase().includes("multi") || cleanInput.toLowerCase().includes("manager")) {
        arch = "multi";
      } else if (cleanInput.toLowerCase().includes("simple") || cleanInput.toLowerCase().includes("write") || cleanInput.toLowerCase().includes("draft")) {
        arch = "simple";
      }

      // Generate custom tools
      let tools = ["Database API", "Slack API", "Search API"];
      if (cleanInput.toLowerCase().includes("esports") || cleanInput.toLowerCase().includes("tournament")) {
        tools = ["Bracket Generator API", "Discord Webhook Bot", "Team DB"];
      } else if (cleanInput.toLowerCase().includes("travel")) {
        tools = ["Aviation flight index", "Hotel Booking SDK", "Google Maps"];
      } else if (cleanInput.toLowerCase().includes("legal")) {
        tools = ["DocuSign API", "SEC Filings Portal", "PDF OCR Scraper"];
      } else if (cleanInput.toLowerCase().includes("medical") || cleanInput.toLowerCase().includes("health")) {
        tools = ["EHR records lookup", "Medline index API", "Secure Calendly"];
      }

      // Generate custom memory description
      let memory = "System instructions, previous session tokens";
      if (cleanInput.toLowerCase().includes("esports")) {
        memory = "Tournament brackets structure, team registry constraints, seed positions";
      } else if (cleanInput.toLowerCase().includes("travel")) {
        memory = "User dietary restrictions, maximum flight budget, room choices";
      }

      // Compile custom steps
      const steps = [
        { id: "request", title: "User Request", desc: `Prompt: "${formattedTopic}"` },
        { id: "planner", title: "Planner", desc: `Analyzes: "${formattedTopic}". Splits target: 1. Load configuration, 2. Retrieve variables, 3. Call APIs, 4. Confirm compliance.` },
        { id: "memory", title: "Memory", desc: `Loads local storage buffers: ${memory}.` },
        { id: "retriever", title: "Retriever", desc: "Searches knowledge base for local document configurations and policy rules." },
        { id: "reasoning", title: "Reasoning", desc: `Calculates next step for ${topic}. Formulates tool call payload.` },
        { id: "tools", title: "Tool Calling", desc: `Invokes: [${tools.join(", ")}]. API return status: 200 OK.` },
        { id: "reflection", title: "Reflection", desc: `Validates agent results for "${formattedTopic}". Corrects small formatting errors.` },
        { id: "response", title: "Final Response", desc: `Delivers successful answer for "${formattedTopic}" back to user.` }
      ];

      return {
        name: "Custom AI Agent",
        prompt: cleanInput,
        architecture: arch,
        tools,
        memory,
        difficulty: "Dynamic",
        customSteps: steps
      };
    }

    // Default back to selected preset
    return PRESETS[activePreset] || PRESETS["customer-support"];
  }, [customInput, activePreset]);

  // Adjust active architecture mode when changing preset or custom input
  useEffect(() => {
    if (currentWorkflowData.architecture) {
      setSelectedArch(currentWorkflowData.architecture);
    }
  }, [currentWorkflowData]);

  // Nodes to draw based on current architecture
  const activeNodes = useMemo(() => {
    const archObj = ARCHITECTURES[selectedArch] || ARCHITECTURES["tool"];
    return archObj.nodes;
  }, [selectedArch]);

  // Filter steps to match active architecture nodes
  const executionSteps = useMemo(() => {
    const nodeSet = new Set(activeNodes);
    return currentWorkflowData.customSteps.filter(step => nodeSet.has(step.id));
  }, [currentWorkflowData, activeNodes]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, []);

  // Manage step-by-step playback simulation
  const startPlayback = () => {
    if (playbackActive) return;
    setPlaybackActive(true);
    setCurrentStepIndex(0);
    setLogs([`[0.0s] 🟢 Initiating agent workflow for: "${currentWorkflowData.name}"`]);
    setMetrics({
      latency: 0,
      tokensIn: 0,
      tokensOut: 0,
      modelCalls: 0,
      apiCalls: 0,
      memoryUsage: 0
    });

    const stepsCount = executionSteps.length;
    let index = 0;

    if (playTimerRef.current) clearInterval(playTimerRef.current);

    playTimerRef.current = setInterval(() => {
      index++;
      if (index >= stepsCount) {
        clearInterval(playTimerRef.current);
        setPlaybackActive(false);
        setLogs(prev => [
          ...prev,
          `[${(index * 0.4).toFixed(1)}s] ✅ Workflow complete! Final response served successfully.`
        ]);
        return;
      }
      
      setCurrentStepIndex(index);

      // Simulate log output
      const step = executionSteps[index];
      const timeTag = `[${(index * 0.4).toFixed(1)}s]`;
      
      let stepLog = `${timeTag} ⚙️ Processing [${step.title}] -> ${step.desc}`;
      if (step.id === "tools") {
        stepLog = `${timeTag} 🛠️ Triggering API Tools: [${currentWorkflowData.tools.join(", ")}]`;
      } else if (step.id === "reflection") {
        stepLog = `${timeTag} 🔍 Reviewing work: self-reflection validator checks passed.`;
      }
      
      setLogs(prev => [...prev, stepLog]);

      // Increment simulated advanced counters
      setMetrics(prev => {
        const isLlmCall = ["reasoning", "llm", "reflection", "planner"].includes(step.id);
        const isApiCall = step.id === "tools" || step.id === "retriever";
        return {
          latency: prev.latency + Math.floor(Math.random() * 400 + 200),
          tokensIn: prev.tokensIn + (isLlmCall ? Math.floor(Math.random() * 800 + 300) : 0),
          tokensOut: prev.tokensOut + (isLlmCall ? Math.floor(Math.random() * 150 + 50) : 0),
          modelCalls: prev.modelCalls + (isLlmCall ? 1 : 0),
          apiCalls: prev.apiCalls + (isApiCall ? 1 : 0),
          memoryUsage: Math.floor(Math.random() * 8 + 4)
        };
      });

    }, playbackSpeed);
  };

  const pausePlayback = () => {
    if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
    }
    setPlaybackActive(false);
  };

  const stopPlayback = () => {
    if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
    }
    setPlaybackActive(false);
    setCurrentStepIndex(-1);
    setLogs([]);
  };

  // Custom agent prompt handler
  const handleCustomAgentSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    // Save query to local storage history
    const entry = {
      id: Date.now().toString(),
      query: customInput.trim(),
      timestamp: new Date().toLocaleDateString()
    };
    const updatedHistory = [entry, ...history.slice(0, 9)];
    saveHistoryToLocalStorage(updatedHistory);
    
    // Stop any active simulations
    stopPlayback();
  };

  const handleFavoriteToggle = () => {
    const promptText = customInput.trim() || currentWorkflowData.prompt;
    const isFav = favorites.some(f => f.query === promptText);

    if (isFav) {
      const updated = favorites.filter(f => f.query !== promptText);
      saveFavoritesToLocalStorage(updated);
    } else {
      const entry = {
        id: Date.now().toString(),
        query: promptText,
        name: currentWorkflowData.name,
        timestamp: new Date().toLocaleDateString()
      };
      saveFavoritesToLocalStorage([...favorites, entry]);
    }
  };

  // Preset loading handler
  const loadPreset = (presetKey) => {
    setActivePreset(presetKey);
    setCustomInput("");
    stopPlayback();
  };

  // Tech stack builder output based on selected architectures
  const techStack = useMemo(() => {
    const stack = {
      frontend: "Next.js 15 (React 19, Tailwind CSS)",
      backend: "FastAPI / Python (Asynchronous routes)",
      database: "Supabase (PostgreSQL)",
      memory: "Redis (Short-term session storage)",
      llm: "Claude 3.5 Sonnet / gpt-4o-mini",
      framework: "LangGraph (Stateful graph routing)",
      deployment: "Vercel / Railway"
    };

    if (selectedArch === "simple") {
      stack.framework = "LangChain Core / Simple router";
      stack.memory = "Memory client buffer";
    } else if (selectedArch === "rag") {
      stack.memory = "Pinecone / Qdrant (Vector database)";
      stack.framework = "LlamaIndex (Structured retrieval)";
    } else if (selectedArch === "coding") {
      stack.backend = "NodeJS / Docker Sandbox environment";
      stack.framework = "Custom script runner / LangGraph";
    }

    return stack;
  }, [selectedArch]);

  // Glossary rendering search filters
  const filteredGlossary = useMemo(() => {
    return GLOSSARY.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  // Export functions
  const copyWorkflowJSON = () => {
    const payload = {
      name: currentWorkflowData.name,
      prompt: currentWorkflowData.prompt,
      architecture: selectedArch,
      tools: currentWorkflowData.tools,
      stepsCount: executionSteps.length,
      steps: executionSteps.map(s => ({ node: s.id, detail: s.desc }))
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    alert("Workflow JSON copied to clipboard!");
  };

  const downloadMarkdown = () => {
    const md = [
      `# AI Agent Workflow: ${currentWorkflowData.name}`,
      `Generated via BoringTools AI Agent Visualizer on ${new Date().toLocaleDateString()}`,
      "",
      `**Objective Prompt:** "${currentWorkflowData.prompt}"`,
      `**Architecture Model:** ${ARCHITECTURES[selectedArch]?.name || selectedArch}`,
      `**Difficulty Rating:** ${currentWorkflowData.difficulty}`,
      `**Tools Configured:** ${currentWorkflowData.tools.join(", ")}`,
      "",
      "## Workflow Execution Sequence",
      ...executionSteps.map((s, idx) => `${idx + 1}. **${s.title}** (${s.id}): ${s.desc}`),
      "",
      "---",
      "Created via BoringTools."
    ].join("\n");

    const element = document.createElement("a");
    const file = new Blob([md], {type: "text/markdown"});
    element.href = URL.createObjectURL(file);
    element.download = `${currentWorkflowData.name.toLowerCase().replace(/\s+/g, "-")}-workflow.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyTextWorkflow = () => {
    const text = [
      `AI Agent Workflow: ${currentWorkflowData.name}`,
      `Prompt: ${currentWorkflowData.prompt}`,
      `Architecture: ${selectedArch}`,
      "---",
      ...executionSteps.map((s, idx) => `[Step ${idx + 1}] ${s.title}: ${s.desc}`)
    ].join("\n");

    navigator.clipboard.writeText(text);
    alert("Plaintext workflow copied to clipboard!");
  };

  // PNG Canvas Generation (100% Client-Side Render)
  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Setup canvas dimension
    canvas.width = 1200;
    canvas.height = 630;
    
    // Background style
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title header
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("AI AGENT VISUALIZER", 50, 60);
    
    ctx.fillStyle = "#ea580c";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(selectedArch.toUpperCase() + " ARCHITECTURE", 50, 95);

    ctx.fillStyle = "#64748b";
    ctx.font = "italic 16px sans-serif";
    const promptStr = currentWorkflowData.prompt.length > 80 ? currentWorkflowData.prompt.slice(0, 80) + "..." : currentWorkflowData.prompt;
    ctx.fillText(`Objective: "${promptStr}"`, 50, 125);
    
    // Draw horizontal split line
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(1150, 150);
    ctx.stroke();

    // Renders nodes horizontally
    const len = executionSteps.length;
    const gap = (1100 - 50) / Math.max(1, len - 1);
    
    executionSteps.forEach((step, idx) => {
      const x = 70 + idx * gap;
      const y = 300;
      const width = 110;
      const height = 80;
      
      // Draw Node rounded rect
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 2;
      
      // Rounded rect helper
      ctx.beginPath();
      ctx.roundRect(x - width/2, y - height/2, width, height, 10);
      ctx.fill();
      ctx.stroke();
      
      // Text
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      
      // Split text on space to fit in card
      const words = step.title.split(" ");
      if (words.length > 1) {
        ctx.fillText(words[0], x, y - 5);
        ctx.fillText(words.slice(1).join(" "), x, y + 12);
      } else {
        ctx.fillText(step.title, x, y + 4);
      }

      ctx.fillStyle = "#64748b";
      ctx.font = "9px sans-serif";
      ctx.fillText(`Step ${idx + 1}`, x, y - 24);

      // Connecting arrow to next node
      if (idx < len - 1) {
        const nextX = 70 + (idx + 1) * gap;
        const startX = x + width/2 + 5;
        const endX = nextX - width/2 - 5;
        
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(endX - 8, y - 5);
        ctx.lineTo(endX, y);
        ctx.lineTo(endX - 8, y + 5);
        ctx.stroke();
      }
    });

    // Branding Footer
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("BoringTools AI Suite • Client-Side Export", 1150, 590);

    // Trigger download
    const link = document.createElement("a");
    link.download = `${currentWorkflowData.name.toLowerCase().replace(/\s+/g, "-")}-graph.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start p-4 font-sans antialiased text-slate-800 pb-20">
      
      {/* Download Canvas (Hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Container */}
      <div className="w-full max-w-6xl flex flex-col gap-8 my-4 sm:my-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Educational Suite</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">AI Agent Visualizer</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Understand how modern AI agents think, plan, use tools, remember information, and complete complex tasks through interactive visual workflows.
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Aesthetic View:</span>
            <button
              onClick={() => setBeginnerMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${!beginnerMode ? "bg-orange-600 border-orange-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              Developer Mode
            </button>
            <button
              onClick={() => setBeginnerMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${beginnerMode ? "bg-orange-600 border-orange-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              Beginner Mode
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadPNG}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition"
              title="Download PNG image of active workflow"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              PNG
            </button>
            <button
              onClick={downloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition"
              title="Export report as markdown (.md)"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Markdown
            </button>
            <button
              onClick={copyTextWorkflow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition"
              title="Copy text breakdown"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h6m-6 4h6" />
              </svg>
              Copy Text
            </button>
            <button
              onClick={copyWorkflowJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition"
              title="Copy schema JSON to clipboard"
            >
              JSON
            </button>
          </div>
        </div>

        {/* Quickstart Presets Grid */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Start Presets</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.keys(PRESETS).map((key) => {
              const item = PRESETS[key];
              const isSelected = activePreset === key && !customInput.trim();
              return (
                <button
                  key={key}
                  onClick={() => loadPreset(key)}
                  className={`p-3 text-left rounded-xl border text-sm transition-all flex flex-col justify-between h-20 ${isSelected ? "border-orange-500 bg-orange-50/50 shadow-sm ring-1 ring-orange-500" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"}`}
                >
                  <span className="font-bold text-slate-900 truncate w-full">{item.name}</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500">{item.difficulty}</span>
                </button>
              );
            })}
            
            {/* Custom Option Button */}
            <button
              onClick={() => {
                setCustomInput("I want an AI agent that manages esports tournaments.");
                setActivePreset("");
                stopPlayback();
              }}
              className={`p-3 text-left rounded-xl border text-sm transition-all flex flex-col justify-between h-20 bg-gradient-to-br ${customInput.trim() ? "from-orange-50 to-orange-100/50 border-orange-500 ring-1 ring-orange-500" : "from-slate-50 to-slate-100/50 border-slate-200 hover:border-slate-300"}`}
            >
              <span className="font-bold text-slate-900">Custom Agent</span>
              <span className="text-[10px] uppercase font-semibold text-orange-600">Build Yours</span>
            </button>
          </div>
        </div>

        {/* Custom Input Field */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
          <form onSubmit={handleCustomAgentSubmit} className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">Interactive Prompting</span>
                <h4 className="text-base font-bold text-slate-900">Instruct Your Custom AI Agent</h4>
              </div>
              <button
                type="button"
                onClick={handleFavoriteToggle}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-orange-500 transition"
                title="Favorite this custom prompt layout"
              >
                {favorites.some(f => f.query === (customInput.trim() || currentWorkflowData.prompt)) ? (
                  <svg className="w-5 h-5 text-orange-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.373-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="E.g., Travel Planning Agent or I want an AI agent that manages esports tournaments..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
              />
              <button
                type="submit"
                className="bg-slate-900 text-white font-semibold text-sm px-6 rounded-xl hover:bg-slate-800 transition"
              >
                Generate Workflow
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Type keywords like "research", "code", "esports" or "travel" to see the workflow components and tools adjust dynamically.
            </p>
          </form>
        </div>

        {/* Dynamic Sandbox Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Settings & Execution Panel (Left) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Architecture Selector */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Agent Architecture Model</h3>
              <div className="flex flex-col gap-2">
                {Object.keys(ARCHITECTURES).map((archKey) => {
                  const arch = ARCHITECTURES[archKey];
                  const isSelected = selectedArch === archKey;
                  return (
                    <button
                      key={archKey}
                      onClick={() => {
                        setSelectedArch(archKey);
                        stopPlayback();
                      }}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${isSelected ? "border-orange-500 bg-orange-50/30 text-orange-950 font-bold" : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 text-slate-600"}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span>{arch.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                      </div>
                      <p className="font-normal text-[10px] text-slate-400 leading-tight">{arch.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="bg-slate-900 text-white shadow-md rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold tracking-wider text-orange-400">Simulation Controls</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  Speed: {(playbackSpeed / 1000).toFixed(1)}s
                </span>
              </div>
              
              <div className="flex gap-2 justify-center items-center py-2">
                {playbackActive ? (
                  <button
                    onClick={pausePlayback}
                    className="p-3 bg-orange-600 text-white rounded-full hover:bg-orange-500 transition shadow"
                    title="Pause"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={startPlayback}
                    className="p-3 bg-orange-600 text-white rounded-full hover:bg-orange-500 transition shadow"
                    title="Play"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={stopPlayback}
                  className="p-3 bg-slate-800 text-slate-300 rounded-full hover:bg-slate-700 transition"
                  title="Stop"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                  </svg>
                </button>

                {/* Speed Slider */}
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="500"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="ml-4 w-24 accent-orange-500"
                />
              </div>

              {/* Progress Indicator */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-orange-500 h-1.5 transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / executionSteps.length) * 100}%` }}
                />
              </div>

              {/* Advanced mode statistics console */}
              {!beginnerMode && (
                <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Latency</span>
                    <span className="text-sm font-bold">{metrics.latency} ms</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Token Flow</span>
                    <span className="text-[11px] font-mono truncate text-orange-300">
                      In: {metrics.tokensIn} | Out: {metrics.tokensOut}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">AI Brain Calls</span>
                    <span className="text-sm font-bold">{metrics.modelCalls}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">API Integrations</span>
                    <span className="text-sm font-bold">{metrics.apiCalls}</span>
                  </div>
                </div>
              )}

              {/* Beginner mode statistics console */}
              {beginnerMode && (
                <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">AI Thinking Time</span>
                    <span className="text-sm font-bold">{(metrics.latency / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Words Processed</span>
                    <span className="text-sm font-bold">{Math.floor((metrics.tokensIn + metrics.tokensOut) * 0.75)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Execution logs terminal */}
            <div className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs rounded-2xl p-4 shadow flex flex-col h-60">
              <span className="text-[10px] text-orange-400 font-bold mb-2 uppercase border-b border-slate-800 pb-1.5">
                Live Execution Logs
              </span>
              <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
                {logs.length === 0 ? (
                  <p className="text-slate-500 italic">Click Play to begin the live sequence...</p>
                ) : (
                  logs.map((log, index) => (
                    <p key={index} className="leading-relaxed whitespace-pre-wrap">{log}</p>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>

          </div>

          {/* Graphical Node Canvas Area (Right) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* The Visual Node Graph Card */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 flex flex-col min-h-[460px] justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
              
              <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4 z-10">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Interactive Canvas</span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {currentWorkflowData.name} Workflow
                  </h3>
                  <p className="text-xs text-slate-500 italic">
                    Click any block node to see detailed documentation details.
                  </p>
                </div>
                
                {/* Visual Legend */}
                <div className="flex gap-3 text-[10px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-600" /> Active
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300" /> Idle
                  </span>
                </div>
              </div>

              {/* Graphic Flow Wrapper */}
              <div className="relative flex-1 flex flex-col items-center justify-center py-10 z-10">
                {selectedArch === "multi" ? (
                  // Multi Agent Specialized Graph Layout
                  <div className="flex flex-col gap-10 items-center w-full max-w-lg">
                    {/* Top User node */}
                    <button
                      onClick={() => setSelectedNode(NODE_DETAILS["request"])}
                      className={`relative flex items-center justify-center p-4 bg-white border-2 rounded-2xl shadow-sm transition-all duration-300 min-w-[130px] ${currentStepIndex === 0 ? "border-orange-600 ring-4 ring-orange-500/20 scale-105" : "border-slate-200 hover:border-slate-400"}`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <span className="text-orange-600 mb-1">{NODE_DETAILS["request"].icon}</span>
                        <span className="text-xs font-bold">{beginnerMode ? NODE_DETAILS["request"].beginnerTitle : NODE_DETAILS["request"].title}</span>
                      </div>
                    </button>

                    {/* SVG Connector down to Manager */}
                    <svg className="w-10 h-8 text-slate-300" viewBox="0 0 40 32">
                      <path d="M20 0 v32" stroke="currentColor" strokeWidth="2" strokeDasharray={playbackActive && currentStepIndex === 0 ? "4 4" : "0"} className={playbackActive && currentStepIndex === 0 ? "animate-[dash_2s_linear_infinite]" : ""} />
                    </svg>

                    {/* Manager Supervisor Node */}
                    <button
                      onClick={() => setSelectedNode(NODE_DETAILS["manager-agent"])}
                      className={`relative flex items-center justify-center p-4 bg-slate-900 text-white rounded-2xl shadow transition-all duration-300 min-w-[150px] ${currentStepIndex === 1 ? "ring-4 ring-orange-500/40 scale-105" : "hover:scale-102"}`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <span className="text-orange-400 mb-1">{NODE_DETAILS["manager-agent"].icon}</span>
                        <span className="text-xs font-bold">{beginnerMode ? NODE_DETAILS["manager-agent"].beginnerTitle : NODE_DETAILS["manager-agent"].title}</span>
                      </div>
                    </button>

                    {/* Sub-agents horizontal row */}
                    <div className="grid grid-cols-3 gap-6 w-full relative pt-6">
                      
                      {/* Researcher sub node */}
                      <button
                        onClick={() => setSelectedNode(NODE_DETAILS["research-agent"])}
                        className={`flex flex-col items-center p-3 bg-white border-2 rounded-2xl shadow-sm transition-all duration-300 ${currentStepIndex === 2 ? "border-orange-600 ring-4 ring-orange-500/20 scale-105" : "border-slate-200 hover:border-slate-400"}`}
                      >
                        <span className="text-orange-600 mb-1">{NODE_DETAILS["research-agent"].icon}</span>
                        <span className="text-xs font-bold">{beginnerMode ? NODE_DETAILS["research-agent"].beginnerTitle : NODE_DETAILS["research-agent"].title}</span>
                      </button>

                      {/* Writer sub node */}
                      <button
                        onClick={() => setSelectedNode(NODE_DETAILS["writer-agent"])}
                        className={`flex flex-col items-center p-3 bg-white border-2 rounded-2xl shadow-sm transition-all duration-300 ${currentStepIndex === 3 ? "border-orange-600 ring-4 ring-orange-500/20 scale-105" : "border-slate-200 hover:border-slate-400"}`}
                      >
                        <span className="text-orange-600 mb-1">{NODE_DETAILS["writer-agent"].icon}</span>
                        <span className="text-xs font-bold">{beginnerMode ? NODE_DETAILS["writer-agent"].beginnerTitle : NODE_DETAILS["writer-agent"].title}</span>
                      </button>

                      {/* Reviewer sub node */}
                      <button
                        onClick={() => setSelectedNode(NODE_DETAILS["reviewer-agent"])}
                        className={`flex flex-col items-center p-3 bg-white border-2 rounded-2xl shadow-sm transition-all duration-300 ${currentStepIndex === 4 ? "border-orange-600 ring-4 ring-orange-500/20 scale-105" : "border-slate-200 hover:border-slate-400"}`}
                      >
                        <span className="text-orange-600 mb-1">{NODE_DETAILS["reviewer-agent"].icon}</span>
                        <span className="text-xs font-bold">{beginnerMode ? NODE_DETAILS["reviewer-agent"].beginnerTitle : NODE_DETAILS["reviewer-agent"].title}</span>
                      </button>

                      {/* Message arrows from Manager to Subs */}
                      <div className="absolute inset-x-0 -top-8 flex justify-around pointer-events-none">
                        <svg className="w-12 h-8 text-slate-300" viewBox="0 0 48 32">
                          <path d="M48 0 L0 32" stroke="currentColor" strokeWidth="2" strokeDasharray={playbackActive && currentStepIndex === 1 ? "4 4" : "0"} />
                        </svg>
                        <svg className="w-2 h-8 text-slate-300" viewBox="0 0 8 32">
                          <path d="M4 0 L4 32" stroke="currentColor" strokeWidth="2" strokeDasharray={playbackActive && currentStepIndex === 1 ? "4 4" : "0"} />
                        </svg>
                        <svg className="w-12 h-8 text-slate-300" viewBox="0 0 48 32">
                          <path d="M0 0 L48 32" stroke="currentColor" strokeWidth="2" strokeDasharray={playbackActive && currentStepIndex === 1 ? "4 4" : "0"} />
                        </svg>
                      </div>
                    </div>

                    {/* SVG Connector down to Final Response */}
                    <svg className="w-10 h-8 text-slate-300" viewBox="0 0 40 32">
                      <path d="M20 0 v32" stroke="currentColor" strokeWidth="2" strokeDasharray={playbackActive && currentStepIndex === 4 ? "4 4" : "0"} />
                    </svg>

                    {/* Bottom Response node */}
                    <button
                      onClick={() => setSelectedNode(NODE_DETAILS["response"])}
                      className={`relative flex items-center justify-center p-4 bg-white border-2 rounded-2xl shadow-sm transition-all duration-300 min-w-[130px] ${currentStepIndex === 5 ? "border-orange-600 ring-4 ring-orange-500/20 scale-105" : "border-slate-200 hover:border-slate-400"}`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <span className="text-orange-600 mb-1">{NODE_DETAILS["response"].icon}</span>
                        <span className="text-xs font-bold">{beginnerMode ? NODE_DETAILS["response"].beginnerTitle : NODE_DETAILS["response"].title}</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  // Sequential Horizontal/Wrap Grid of nodes
                  <div className="flex flex-wrap gap-y-12 justify-center items-center w-full px-4">
                    {executionSteps.map((step, idx) => {
                      const isActive = currentStepIndex === idx;
                      const spec = NODE_DETAILS[step.id] || NODE_DETAILS["request"];
                      return (
                        <div key={step.id} className="flex items-center">
                          {/* Node Button */}
                          <button
                            onClick={() => setSelectedNode(spec)}
                            className={`group relative flex flex-col items-center justify-center p-4 bg-white border-2 rounded-2xl shadow-sm transition-all duration-300 w-32 h-28 ${isActive ? "border-orange-600 ring-4 ring-orange-500/20 scale-105 z-20" : "border-slate-200 hover:border-slate-400"}`}
                          >
                            <span className={`p-1.5 rounded-lg mb-1 transition-all ${isActive ? "bg-orange-100 text-orange-600" : "bg-slate-50 text-slate-600 group-hover:bg-slate-100"}`}>
                              {spec.icon}
                            </span>
                            <span className="text-xs font-bold text-center text-slate-800 line-clamp-2 leading-tight">
                              {beginnerMode ? spec.beginnerTitle : spec.title}
                            </span>
                            
                            {/* Pulse Halos */}
                            {isActive && (
                              <span className="absolute -inset-1 rounded-2xl border border-orange-500 animate-ping opacity-25 pointer-events-none" />
                            )}
                          </button>

                          {/* Connecting arrow with dashes */}
                          {idx < executionSteps.length - 1 && (
                            <div className="w-8 sm:w-12 h-6 flex items-center justify-center pointer-events-none">
                              <svg className="w-full h-2 text-slate-300 overflow-visible" viewBox="0 0 40 8">
                                <path
                                  d="M0 4 h40"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeDasharray={playbackActive && isActive ? "5 5" : "0"}
                                  className={playbackActive && isActive ? "animate-[dash_1.5s_linear_infinite]" : ""}
                                />
                                <path d="M36 1 l3 3 l-3 3" fill="none" stroke="currentColor" strokeWidth="2" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active step quick-desc footer */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 min-h-[72px] z-10 flex items-center">
                {currentStepIndex >= 0 && currentStepIndex < executionSteps.length ? (
                  <div className="flex gap-3">
                    <span className="text-orange-600 shrink-0 font-bold">Step {currentStepIndex + 1}:</span>
                    <p className="text-xs text-slate-600">{executionSteps[currentStepIndex].desc}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Click Play to step through the active agent execution path.</p>
                )}
              </div>
            </div>

            {/* Recommended Build Stack Suggestions */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">Developer Specs</span>
                  <h4 className="text-base font-bold text-slate-900">Recommended Build Stack</h4>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase font-bold">
                  Production ready
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Frontend</span>
                  <span className="text-xs font-bold text-slate-900 mt-1">{techStack.frontend}</span>
                </div>
                <div className="flex flex-col p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Backend</span>
                  <span className="text-xs font-bold text-slate-900 mt-1">{techStack.backend}</span>
                </div>
                <div className="flex flex-col p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Database & Vector</span>
                  <span className="text-xs font-bold text-slate-900 mt-1">{techStack.database} / {techStack.memory}</span>
                </div>
                <div className="flex flex-col p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Orchestration</span>
                  <span className="text-xs font-bold text-slate-900 mt-1">{techStack.framework}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Slide Drawer side panel */}
        {selectedNode && (
          <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col transition-all duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-orange-600">{selectedNode.icon}</span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {beginnerMode ? selectedNode.beginnerTitle : selectedNode.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content Drawer Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Purpose</span>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedNode.purpose}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Why it exists</span>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedNode.whyExists}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">When is it needed</span>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedNode.whenNeeded}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Real examples</span>
                <ul className="space-y-1">
                  {selectedNode.examples.map((ex, i) => (
                    <li key={i} className="text-xs text-slate-700 bg-slate-50 border border-slate-100 p-2 rounded-lg font-mono">
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Difficulty</span>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full">{selectedNode.difficulty}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Est. Latency</span>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full">{selectedNode.latency}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="bg-orange-50/50 border border-orange-100 p-3.5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 block mb-1">Common Mistake</span>
                  <p className="text-xs text-orange-950 leading-relaxed">{selectedNode.mistakes}</p>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">Best Practice</span>
                  <p className="text-xs text-emerald-950 leading-relaxed">{selectedNode.practices}</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* History / Favorites Panel */}
        {(history.length > 0 || favorites.length > 0) && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Saved Workflows</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Favorites */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Favorites</span>
                {favorites.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No favorites starred yet...</p>
                ) : (
                  <div className="space-y-1.5">
                    {favorites.map((fav) => (
                      <div key={fav.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-xl text-xs">
                        <button
                          onClick={() => {
                            setCustomInput(fav.query);
                            setActivePreset("");
                            stopPlayback();
                          }}
                          className="font-semibold text-slate-700 hover:text-orange-600 text-left truncate flex-1"
                        >
                          {fav.query}
                        </button>
                        <button
                          onClick={() => {
                            const updated = favorites.filter(f => f.id !== fav.id);
                            saveFavoritesToLocalStorage(updated);
                          }}
                          className="text-slate-400 hover:text-red-500 ml-2"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Queries */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Recent Searches</span>
                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No search history...</p>
                ) : (
                  <div className="space-y-1.5">
                    {history.map((hist) => (
                      <div key={hist.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-xl text-xs">
                        <button
                          onClick={() => {
                            setCustomInput(hist.query);
                            setActivePreset("");
                            stopPlayback();
                          }}
                          className="text-slate-600 hover:text-orange-600 text-left truncate flex-1"
                        >
                          {hist.query}
                        </button>
                        <button
                          onClick={() => {
                            const updated = history.filter(h => h.id !== hist.id);
                            saveHistoryToLocalStorage(updated);
                          }}
                          className="text-slate-400 hover:text-red-500 ml-2"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Interactive Comparison Block */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-1 items-start mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">Architectural Comparison</span>
            <h4 className="text-xl font-bold text-slate-900">Prompt vs. Workflow vs. AI Agent</h4>
            <p className="text-xs text-slate-500">Understand structural feedback loops and autonomy.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Prompt */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between h-80">
              <div className="space-y-3">
                <span className="px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-slate-200/60 rounded-full">Level 1: Static Prompt</span>
                <h5 className="font-bold text-slate-900 text-base">Single Shot Call</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Send query input directly to the LLM and get output back. Zero feedback loops, zero validation gates, and zero memory.
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/50 flex items-center justify-center text-xs font-mono text-slate-500">
                Prompt ──&gt; LLM ──&gt; Response
              </div>
            </div>

            {/* Workflow */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between h-80">
              <div className="space-y-3">
                <span className="px-2.5 py-1 text-[10px] font-bold text-orange-700 bg-orange-100/60 rounded-full">Level 2: AI Workflow</span>
                <h5 className="font-bold text-slate-900 text-base">Chains & Pipelines</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  A program routing data step-by-step through predetermined LLM calls (e.g. translate then summarize). No dynamic planning during runtime.
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/50 flex items-center justify-center text-[10px] font-mono text-slate-500 leading-none">
                Step 1 (LLM) ──&gt; Step 2 (LLM) ──&gt; Done
              </div>
            </div>

            {/* AI Agent */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between h-80">
              <div className="space-y-3">
                <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 rounded-full">Level 3: AI Agent</span>
                <h5 className="font-bold text-slate-900 text-base">Autonomous Loops</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The LLM decides which tools to call, inspects errors, corrects its code, and runs recursively until it determines the goal is completed.
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/50 flex items-center justify-center text-[10px] font-mono text-slate-500 leading-none">
                Planner 🔄 Tool Call 🔄 Reflection ──&gt; Done
              </div>
            </div>

          </div>
        </div>

        {/* AI Components dictionary Library */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">Glossary Index</span>
              <h4 className="text-xl font-bold text-slate-900">AI Agent Component Library</h4>
              <p className="text-xs text-slate-500">Search terminology and concepts.</p>
            </div>
            
            {/* Search inputs */}
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search glossary..."
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 w-full md:w-48"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="All">All Categories</option>
                <option value="Core">Core</option>
                <option value="Architecture">Architecture</option>
                <option value="Systems">Systems</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGlossary.map((card) => (
              <div key={card.id} className="border border-slate-200/80 rounded-2xl p-5 hover:border-slate-300 hover:shadow-sm transition-all duration-200 bg-slate-50/20">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-slate-900 leading-snug">{card.name}</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase font-bold">
                    {card.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{card.desc}</p>
                <div className="border-t border-slate-100 pt-3 space-y-1.5">
                  <p className="text-[11px] text-slate-500 leading-snug">
                    💡 <span className="font-semibold text-slate-700">Analogy:</span> {card.analogy}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    🔧 <span className="font-semibold text-slate-700">Example:</span> <span className="font-mono text-[10px] bg-white border border-slate-100 px-1 py-0.5 rounded">{card.example}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filteredGlossary.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-6">No matching components found for "{searchQuery}"</p>
          )}
        </div>

      </div>
    </div>
  );
}

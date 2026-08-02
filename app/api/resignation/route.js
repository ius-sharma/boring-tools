const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function normalize(text) {
  return String(text ?? "").trim();
}

function buildPrompt(params) {
  const {
    employeeName,
    companyName,
    position,
    recipientName,
    lastWorkingDay,
    noticePeriod,
    reason,
    letterType,
    includeHandover,
    handoverDetails,
  } = params;

  const styleGuidance = {
    formal: "strictly formal, traditional corporate language, very respectful",
    professional: "standard business professional, balanced, polite, and forward-looking",
    short: "brief, direct, strictly details-only, polite but highly concise",
    friendly: "warm, conversational, showing close rapport with the manager/team",
    grateful: "highly positive, expressing deep gratitude for opportunities, learning, and team support",
    minimalist: "minimal text, strictly stating resignation, last day, and notice period without fluff",
  };

  const recipient = recipientName || "Manager";

  const promptParts = [
    "You are an expert HR writing assistant. Your task is to write a high-quality, professional resignation letter.",
    `Employee Name: ${employeeName}`,
    `Recipient Name/Title: ${recipient}`,
    `Company Name: ${companyName}`,
    `Position: ${position}`,
    `Last Working Day: ${lastWorkingDay}`,
    `Notice Period: ${noticePeriod}`,
  ];

  if (reason) {
    promptParts.push(`Reason for Resignation: ${reason}`);
  }

  promptParts.push(`Style/Tone: ${styleGuidance[letterType] || styleGuidance.professional}`);

  if (includeHandover && handoverDetails) {
    promptParts.push(
      `Transition/Handover Info: Include a brief handover outline in the letter containing these details: "${handoverDetails}". Present it as a neat list or a clean summary block.`
    );
  }

  promptParts.push(
    "Ensure the letter strictly follows standard corporate letter format. At the top of the output, include:",
    "1. Current Date",
    "2. Recipient Name, Company Name",
    "3. Salutation (e.g. 'Dear [RecipientName],')",
    "At the bottom of the letter, include a professional sign-off and the employee name.",
    "Return ONLY valid JSON in this exact shape:",
    '{"letterText": "full text of the resignation letter, including date, salutations, body paragraphs, handover plan if applicable, and sign-off. Use newline characters (\\n) for formatting."}'
  );

  return promptParts.join("\n");
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

function buildLocalLetter(params) {
  const {
    employeeName,
    companyName,
    position,
    recipientName,
    lastWorkingDay,
    noticePeriod,
    reason,
    letterType,
    includeHandover,
    handoverDetails,
  } = params;

  const todayStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const recipient = recipientName || "Manager";

  const handoverBlock = includeHandover && handoverDetails 
    ? `\n\nTo facilitate a smooth departure, I have prepared a handover plan outlining my current responsibilities:\n${handoverDetails.split(/\r?\n/).map(line => `• ${line.trim()}`).filter(Boolean).join("\n")}`
    : "";

  const templates = {
    formal: `Please accept this letter as formal notification that I am resigning from my position as ${position} at ${companyName}. My last working day will be ${lastWorkingDay}, in accordance with my notice period of ${noticePeriod}.\n\n${reason ? `This decision is due to ${reason.trim()}.\n\n` : ""}Thank you for the opportunities that I have been given during my time at ${companyName}. I appreciate the support and guidance from the team.${handoverBlock}\n\nI will do my best to ensure a smooth transition of my responsibilities before my departure.`,
    
    short: `Please accept this letter as notification that I am resigning from my position as ${position} at ${companyName}. My last day of work will be ${lastWorkingDay}.\n\n${reason ? `My reason for resigning is ${reason.trim()}.\n\n` : ""}Thank you for the opportunity to work at ${companyName}. I wish the company and team the very best.${handoverBlock}`,
    
    friendly: `I'm writing to let you know that I've decided to move on from my role as ${position} at ${companyName}. My last day will be ${lastWorkingDay}, completing my ${noticePeriod} notice period.\n\n${reason ? `I've made this choice because ${reason.trim()}.\n\n` : ""}I want to thank you and everyone on the team for such a wonderful experience. I've really loved working here and will miss the great collaboration and memories we've shared.${handoverBlock}\n\nI'll make sure everything is wrapped up and handed over properly before my last day. Let's definitely stay in touch!`,

    grateful: `I am writing to notify you of my resignation from my position as ${position} at ${companyName}, with my final day being ${lastWorkingDay}.\n\nI want to express my deepest gratitude for the incredible support, mentorship, and professional growth opportunities I've experienced here. It has been a true privilege working with you and the entire team, and I am proud of what we have achieved together. ${reason ? `This decision is to allow me to ${reason.trim()}.\n\n` : ""}${handoverBlock}\n\nI am fully committed to assisting with the transition to ensure a seamless handoff of my tasks. Thank you again for everything.`,

    minimalist: `Please accept this letter as formal notification of my resignation from the position of ${position} at ${companyName}. As per my contract, my last working day will be ${lastWorkingDay}, following my notice period of ${noticePeriod}.\n\n${reason ? `Reason: ${reason.trim()}.\n\n` : ""}${handoverBlock}\n\nI will complete my outstanding duties to ensure a clean transition before my last day.`,
    
    professional: `I am writing to formally resign from my role as ${position} at ${companyName}. As per my contract, my last day of employment will be ${lastWorkingDay}, following my ${noticePeriod} notice period.\n\n${reason ? `This decision is due to ${reason.trim()}.\n\n` : ""}I would like to express my sincere gratitude for the professional development and growth opportunities I have had during my tenure. I have thoroughly enjoyed working with the team and appreciate the guidance I've received.${handoverBlock}\n\nDuring my remaining time, I will focus on completing outstanding tasks and assisting with the handover to ensure a seamless transition of my responsibilities.`
  };

  const body = templates[letterType] || templates.professional;

  return `${todayStr}

To:
${recipient}
${companyName}

Dear ${recipient},

${body}

Best regards,

${employeeName}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const employeeName = normalize(body?.employeeName) || "Jane Doe";
    const companyName = normalize(body?.companyName) || "InnovateTech Solutions";
    const position = normalize(body?.position) || "Senior Software Engineer";
    const recipientName = normalize(body?.recipientName) || "Manager";
    const lastWorkingDay = normalize(body?.lastWorkingDay);
    const noticePeriod = normalize(body?.noticePeriod) || "2 weeks";
    const reason = normalize(body?.reason);
    const letterType = ["formal", "professional", "short", "friendly", "grateful", "minimalist"].includes(body?.letterType) 
      ? body.letterType 
      : "professional";
    const includeHandover = Boolean(body?.includeHandover);
    const handoverDetails = normalize(body?.handoverDetails);

    const params = {
      employeeName,
      companyName,
      position,
      recipientName,
      lastWorkingDay,
      noticePeriod,
      reason,
      letterType,
      includeHandover,
      handoverDetails,
    };

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ letterText: buildLocalLetter(params), source: "Local Fallback" });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.6,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "You write professional resignation letters. Follow standard formatting guidelines. Ensure layout matches professional letter design.",
          },
          {
            role: "user",
            content: buildPrompt(params),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ letterText: buildLocalLetter(params), source: "AI Fallback (Groq error)" });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJson(content);

    if (!parsed?.letterText) {
      return Response.json({ letterText: buildLocalLetter(params), source: "AI Fallback (JSON parse error)" });
    }

    return Response.json({
      letterText: parsed.letterText,
      source: "Groq API",
    });
  } catch (error) {
    return Response.json(
      { error: "Unexpected resignation letter generation failure", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

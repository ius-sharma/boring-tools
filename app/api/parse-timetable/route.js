import { NextResponse } from "next/server";
import { extractText } from "unpdf";
import mammoth from "mammoth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// Robust Server PDF Text Extractor using unpdf
async function parsePdf(buffer) {
  try {
    const uint8Array = new Uint8Array(buffer);
    const { text } = await extractText(uint8Array, { mergePages: true });

    if (Array.isArray(text)) {
      return { text: text.join("\n") };
    }
    return { text: text || "" };
  } catch (err) {
    console.error("Server PDF parse error:", err);
    return { text: "" };
  }
}

// Robust Word .docx parser using Mammoth
async function extractDocxText(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (err) {
    console.error("DOCX mammoth extraction error:", err);
    return "";
  }
}

function safeParseJson(content) {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    const fenced =
      content.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] ||
      content.match(/```\s*([\s\S]*?)\s*```/)?.[1];
    if (!fenced) return null;
    try {
      return JSON.parse(fenced);
    } catch {
      return null;
    }
  }
}

// AI-Powered Timetable & Subject Extraction via Groq LLM
async function extractSubjectsWithLLM(rawText, apiKey) {
  if (!apiKey || !rawText || rawText.trim().length < 10) return null;

  const maxChars = 20000;
  const truncatedText =
    rawText.length > maxChars
      ? rawText.slice(0, maxChars) + "\n...[truncated for length]"
      : rawText;

  const prompt = `Analyze the following raw extracted text from a college or university timetable, syllabus, or student ERP report.
Extract all actual academic subjects / courses, their course codes, and their weekly day-wise schedule.

--- RAW DOCUMENT TEXT ---
${truncatedText}
--- END DOCUMENT TEXT ---

CRITICAL INSTRUCTIONS:
1. Extract only genuine academic subjects (e.g. "Data Structures & Algorithms", "Operating Systems", "Physics Lab", "Calculus").
2. DO NOT include professor/teacher names (e.g., "Dr. Sharma", "Prof. Verma"), room numbers ("LT-3", "Room 401"), lunch/recess breaks ("Lunch", "Recess", "Break"), or section labels ("Section A") as subjects.
3. Clean up subject names into proper Title Case.
4. Estimate realistic weekly lectures count (weeklyClasses: usually 2 to 5 per subject).
5. If the timetable text contains a day-wise schedule (Monday to Saturday), map clean subject names into the weeklySchedule object.
6. Return ONLY a valid JSON object matching this exact schema:
{
  "subjects": [
    {
      "name": "Data Structures & Algorithms",
      "code": "CS301",
      "weeklyClasses": 4,
      "isLab": false
    }
  ],
  "weeklySchedule": {
    "Monday": ["Subject 1", "Subject 2"],
    "Tuesday": ["Subject 2", "Subject 3"],
    "Wednesday": ["Subject 1"],
    "Thursday": ["Subject 3"],
    "Friday": ["Subject 1", "Subject 2"],
    "Saturday": []
  },
  "summary": "Brief 1-sentence description of detected semester or branch"
}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an expert academic schedule and timetable intelligence AI. You extract clean subject names, course codes, and weekly schedules from messy college documents into structured JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn("Groq LLM call failed with status", response.status);
      return null;
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    const parsed = safeParseJson(rawContent);

    if (parsed && Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
      let idx = 1;
      const formattedSubjects = parsed.subjects.map((s) => ({
        id: `sub-ai-${Date.now()}-${idx++}`,
        name: typeof s === "string" ? s.trim() : (s.name || s.subject || "Subject").trim(),
        code: s.code || "",
        attended: 0,
        total: 0,
        target: 75,
        medical: 0,
        weeklyClasses: Math.max(1, Math.min(8, parseInt(s.weeklyClasses) || 3)),
        source: "ai",
      }));

      return {
        subjects: formattedSubjects,
        weeklySchedule: parsed.weeklySchedule || null,
        summary: parsed.summary || "",
      };
    }
  } catch (err) {
    console.error("Groq extraction error:", err);
  }

  return null;
}

// Fallback Heuristic Keyword Subject Extractor
function extractSubjectsFallback(rawText) {
  if (!rawText || typeof rawText !== "string") return [];

  const knownKeywords = [
    "MATHEMATICS", "MATHS", "CALCULUS", "ALGEBRA", "LINEAR ALGEBRA",
    "DISCRETE MATHEMATICS", "NUMERICAL METHODS", "STATISTICS",
    "PHYSICS", "APPLIED PHYSICS", "ENGINEERING PHYSICS",
    "CHEMISTRY", "APPLIED CHEMISTRY", "ENGINEERING CHEMISTRY",
    "BIOLOGY", "BIOTECHNOLOGY", "MICROBIOLOGY",
    "DATA STRUCTURES", "ALGORITHMS", "DESIGN AND ANALYSIS OF ALGORITHMS",
    "DATABASE", "DBMS", "DATABASE MANAGEMENT",
    "NETWORKS", "COMPUTER NETWORKS", "DATA COMMUNICATION",
    "OPERATING SYSTEMS", "OPERATING SYSTEM",
    "COMPUTER SCIENCE", "COMPUTER ORGANIZATION", "COMPUTER ARCHITECTURE",
    "SOFTWARE ENGINEERING", "SOFTWARE TESTING",
    "WEB DEVELOPMENT", "WEB TECHNOLOGY", "WEB TECHNOLOGIES",
    "PYTHON", "PYTHON PROGRAMMING", "JAVA", "JAVA PROGRAMMING",
    "C PROGRAMMING", "C++ PROGRAMMING", "PROGRAMMING",
    "ELECTRONICS", "ANALOG ELECTRONICS", "DIGITAL ELECTRONICS",
    "CIRCUITS", "CIRCUIT THEORY", "ELECTRICAL CIRCUITS",
    "DIGITAL LOGIC", "DIGITAL LOGIC DESIGN",
    "MECHANICAL", "MECHANICS", "ENGINEERING MECHANICS",
    "THERMODYNAMICS", "FLUID MECHANICS", "HEAT TRANSFER",
    "CIVIL", "STRUCTURAL ANALYSIS", "SURVEYING",
    "ENGLISH", "TECHNICAL ENGLISH", "COMMUNICATION SKILLS",
    "COMMUNICATION", "PROFESSIONAL COMMUNICATION",
    "ECONOMICS", "ENGINEERING ECONOMICS", "MANAGERIAL ECONOMICS",
    "FINANCE", "FINANCIAL MANAGEMENT", "ACCOUNTING",
    "PROJECT", "MINI PROJECT", "MAJOR PROJECT",
    "SEMINAR", "WORKSHOP", "INTERNSHIP",
    "LAB", "PRACTICAL", "LABORATORY",
    "MACHINE LEARNING", "DEEP LEARNING",
    "ARTIFICIAL INTELLIGENCE", "AI",
    "CYBER SECURITY", "INFORMATION SECURITY",
    "CLOUD COMPUTING", "BIG DATA", "DATA SCIENCE",
    "INTERNET OF THINGS", "IOT",
    "COMPILER DESIGN", "THEORY OF COMPUTATION",
    "AUTOMATA", "FORMAL LANGUAGES",
    "SIGNALS AND SYSTEMS", "SIGNAL PROCESSING",
    "DIGITAL SIGNAL PROCESSING", "DSP",
    "MICROPROCESSOR", "MICROCONTROLLER",
    "VLSI", "VLSI DESIGN", "EMBEDDED SYSTEMS",
    "CONTROL SYSTEMS", "CONTROL ENGINEERING",
    "POWER SYSTEMS", "POWER ELECTRONICS",
    "ELECTROMAGNETIC", "ELECTROMAGNETIC THEORY",
    "ANTENNA", "COMMUNICATION ENGINEERING",
    "ENVIRONMENTAL SCIENCE", "ENVIRONMENTAL STUDIES",
    "MANAGEMENT", "PRINCIPLES OF MANAGEMENT",
    "MARKETING", "HUMAN RESOURCE", "ORGANIZATIONAL BEHAVIOR",
    "BUSINESS LAW", "CORPORATE LAW",
    "OPERATIONS RESEARCH", "SUPPLY CHAIN",
    "GRAPHICS", "ENGINEERING GRAPHICS", "ENGINEERING DRAWING",
  ];

  const lines = rawText.split(/[\r\n]+/);
  const subjectsMap = new Map();

  const codeRegex = /\b([A-Z]{1,4}[-\s]?\d{2,4}[A-Z]?)\b/gi;
  const codeMatches = rawText.match(codeRegex);
  if (codeMatches) {
    const uniqueCodes = [...new Set(codeMatches.map((c) => c.toUpperCase().replace(/\s+/g, "")))];
    uniqueCodes.forEach((code) => {
      if (!/^(AM|PM|IST|GMT|UTC|PDF|DOC|CSV|TXT|IMG|JPG|PNG|PAGE|DATE|TIME|SLOT|ROOM|YEAR|SEM)/i.test(code)) {
        subjectsMap.set(code, { name: code, count: 1, source: "code" });
      }
    });
  }

  const upperText = rawText.toUpperCase();
  knownKeywords.forEach((kw) => {
    if (upperText.includes(kw)) {
      const key = kw;
      if (!subjectsMap.has(key)) {
        const formattedName = kw
          .split(" ")
          .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
          .join(" ");
        subjectsMap.set(key, { name: formattedName, count: 1, source: "keyword" });
      }
    }
  });

  lines.forEach((line) => {
    const clean = line.trim();
    if (clean.length < 3 || clean.length > 80) return;
    if (/^(time|day|period|slot|room|hall|section|batch|semester|year|date|sr|no|s\.no|roll|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(clean)) return;
    if (/^\d+[\s.:)-]/.test(clean)) {
      const subjectPart = clean.replace(/^\d+[\s.:)-]+/, "").trim();
      if (subjectPart.length >= 4 && /[a-zA-Z]{3,}/.test(subjectPart)) {
        const words = subjectPart.split(/\s+/).filter((w) => w.length >= 2);
        if (words.length >= 1 && words.length <= 6) {
          const name = words.join(" ");
          const key = name.toUpperCase();
          if (!subjectsMap.has(key)) {
            subjectsMap.set(key, { name, count: 1, source: "line" });
          }
        }
      }
    }
  });

  const results = [];
  let idx = 1;
  subjectsMap.forEach((val) => {
    if (results.length < 15) {
      results.push({
        id: `sub-parsed-${Date.now()}-${idx++}`,
        name: val.name,
        source: val.source,
        attended: 0,
        total: 0,
        target: 75,
        medical: 0,
        weeklyClasses: Math.min(6, Math.max(1, val.count)),
      });
    }
  });

  return results;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    // 1. PDF Extraction using unpdf
    if (fileName.endsWith(".pdf")) {
      const pdfData = await parsePdf(buffer);
      extractedText = pdfData.text || "";
    }
    // 2. DOCX Extraction using Mammoth
    else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      extractedText = await extractDocxText(buffer);
    }
    // 3. Plain Text / CSV / JSON / ICS
    else if (
      fileName.endsWith(".txt") ||
      fileName.endsWith(".csv") ||
      fileName.endsWith(".json") ||
      fileName.endsWith(".ics")
    ) {
      extractedText = buffer.toString("utf-8");
    }
    // Unsupported
    else {
      return NextResponse.json(
        {
          extractedText: "",
          subjects: [],
          message: `Unsupported file type: ${file.name}. Use PDF, DOCX, TXT, or CSV.`,
        },
        { status: 200 }
      );
    }

    // Step 2: Try AI extraction with Groq LLM first
    const apiKey = process.env.GROQ_API_KEY;
    let aiResult = null;
    if (apiKey && extractedText.trim().length > 10) {
      aiResult = await extractSubjectsWithLLM(extractedText, apiKey);
    }

    let subjects = [];
    let weeklySchedule = null;
    let isAiExtracted = false;
    let summaryMessage = "";

    if (aiResult && aiResult.subjects && aiResult.subjects.length > 0) {
      subjects = aiResult.subjects;
      weeklySchedule = aiResult.weeklySchedule;
      isAiExtracted = true;
      summaryMessage = aiResult.summary || `AI accurately extracted ${subjects.length} subjects from ${file.name}`;
    } else {
      // Fallback to keyword heuristics
      subjects = extractSubjectsFallback(extractedText);
      summaryMessage = subjects.length > 0
        ? `Extracted ${subjects.length} candidate subjects from ${file.name}`
        : `Parsed ${file.name} successfully. If subjects were missed, use Quick Paste below.`;
    }

    return NextResponse.json({
      extractedText: extractedText.substring(0, 10000),
      subjects,
      weeklySchedule,
      isAiExtracted,
      message: summaryMessage,
      fileName: file.name,
      textLength: extractedText.length,
    });
  } catch (err) {
    console.error("Parse timetable API error:", err);
    return NextResponse.json(
      { error: "Failed to process file: " + err.message },
      { status: 500 }
    );
  }
}

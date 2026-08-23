import { withAuthAndQuota } from "../../../lib/auth/withAuthAndQuota";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function buildPrompt(documentText) {
  return [
    `Analyze the following extracted document text (from PDF, image OCR, invoice, receipt, contract, or form) and extract all key data entities with high precision into structured JSON.`,
    `---`,
    `DOCUMENT TEXT:`,
    documentText,
    `---`,
    `Instructions:`,
    `1. Extract "personalInfo":`,
    `   - "names": Array of full person names, authors, recipients, client names, or contact persons mentioned in the document.`,
    `   - "phones": Array of phone numbers, mobile numbers, or landline contact numbers (including country codes like +91, +1, +44).`,
    `   - "emails": Array of valid email addresses.`,
    `   - "addresses": Array of full physical, mailing, billing, or office addresses.`,
    `2. Extract "documentInfo":`,
    `   - "dates": Array of dates (e.g., invoice date, due date, contract date, birth date).`,
    `   - "ids": Array of document/tax/entity IDs (e.g. GSTIN, PAN, SSN, VAT, License, Member ID).`,
    `   - "invoiceNumbers": Array of invoice numbers or bill numbers.`,
    `   - "orderNumbers": Array of order numbers, PO numbers, or tracking numbers.`,
    `   - "referenceNumbers": Array of reference, account, or transaction numbers.`,
    `   - "importantBlocks": Array of 3 to 6 key summary statements or critical clauses from the document.`,
    `3. Extract "financialData":`,
    `   - "amounts": Array of monetary values mentioned (e.g., $150.00, ₹5,000, €45.90, £1,200).`,
    `   - "currencyValues": Array of price/cost figures with currency symbols or codes.`,
    `   - "totals": Array of grand total, net total, or final balance due amounts.`,
    `   - "taxValues": Array of tax, VAT, GST, HST, or fee amounts.`,
    `4. Extract "links": Array of website URLs, domain links, or social links.`,
    `5. Extract "keywords": Array of 8 to 15 key thematic words or labels representing the core subject of the document.`,
    `6. Return ONLY a valid JSON object matching this exact schema with no markdown fencing or commentary:`,
    `{`,
    `  "personalInfo": {`,
    `    "names": ["Name 1", "Name 2"],`,
    `    "phones": ["Phone 1", "Phone 2"],`,
    `    "emails": ["email1@example.com"],`,
    `    "addresses": ["Address 1"]`,
    `  },`,
    `  "documentInfo": {`,
    `    "dates": ["Date 1"],`,
    `    "ids": ["ID 1"],`,
    `    "invoiceNumbers": ["INV-001"],`,
    `    "orderNumbers": ["ORD-001"],`,
    `    "referenceNumbers": ["REF-001"],`,
    `    "importantBlocks": ["Summary sentence 1", "Summary sentence 2"]`,
    `  },`,
    `  "financialData": {`,
    `    "amounts": ["$100.00"],`,
    `    "currencyValues": ["$100.00 USD"],`,
    `    "totals": ["$100.00"],`,
    `    "taxValues": ["$10.00"]`,
    `  },`,
    `  "links": ["https://example.com"],`,
    `  "keywords": ["invoice", "payment", "services"]`,
    `}`
  ].join("\n");
}

function safeParseJson(content) {
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    const fenced = content.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] || content.match(/```\s*([\s\S]*?)\s*```/)?.[1];
    if (!fenced) return null;

    try {
      return JSON.parse(fenced);
    } catch {
      return null;
    }
  }
}

async function handlePost(request) {
  try {
    const body = await request.json();
    const { combinedText } = body;

    if (!combinedText || !combinedText.trim()) {
      return Response.json({ error: "No document text provided" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Groq API key not configured" }, { status: 503 });
    }

    const maxChars = 24000;
    const truncatedInput = combinedText.length > maxChars ? combinedText.slice(0, maxChars) + "\n...[truncated for length]" : combinedText;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.2,
        max_tokens: 2500,
        messages: [
          {
            role: "system",
            content: "You are an expert document data extractor. You analyze OCR, invoice, receipt, and contract text and output pure structured JSON extracting personal info, IDs, dates, financials, and links with high accuracy.",
          },
          {
            role: "user",
            content: buildPrompt(truncatedInput),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: "Groq request failed", details: errorText }, { status: 502 });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    const parsed = safeParseJson(rawContent);

    if (!parsed) {
      return Response.json({ error: "Failed to parse extracted document data" }, { status: 500 });
    }

    const ensureArray = (arr) => (Array.isArray(arr) ? arr.map(String).map((s) => s.trim()).filter(Boolean) : []);

    return Response.json({
      success: true,
      data: {
        personalInfo: {
          names: ensureArray(parsed.personalInfo?.names),
          phones: ensureArray(parsed.personalInfo?.phones),
          emails: ensureArray(parsed.personalInfo?.emails),
          addresses: ensureArray(parsed.personalInfo?.addresses),
        },
        documentInfo: {
          dates: ensureArray(parsed.documentInfo?.dates),
          ids: ensureArray(parsed.documentInfo?.ids),
          invoiceNumbers: ensureArray(parsed.documentInfo?.invoiceNumbers),
          orderNumbers: ensureArray(parsed.documentInfo?.orderNumbers),
          referenceNumbers: ensureArray(parsed.documentInfo?.referenceNumbers),
          importantBlocks: ensureArray(parsed.documentInfo?.importantBlocks),
        },
        financialData: {
          amounts: ensureArray(parsed.financialData?.amounts),
          currencyValues: ensureArray(parsed.financialData?.currencyValues),
          totals: ensureArray(parsed.financialData?.totals),
          taxValues: ensureArray(parsed.financialData?.taxValues),
        },
        links: ensureArray(parsed.links),
        keywords: ensureArray(parsed.keywords),
        importantBlocks: ensureArray(parsed.importantBlocks || parsed.documentInfo?.importantBlocks),
      },
    });
  } catch (error) {
    return Response.json({ error: "Server error extracting document data", details: error.message }, { status: 500 });
  }
}

export const POST = withAuthAndQuota({
  toolId: "document-data-extractor",
  costInCredits: 1,
  allowGuestTrial: true,
  guestCost: 1,
}, handlePost);

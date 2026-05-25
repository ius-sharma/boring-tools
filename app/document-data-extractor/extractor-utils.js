import { extractPhones } from "../pdf-intelligence-tool/phone-utils";

const STOP_WORDS = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "just",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "with",
  "would",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
]);

const PERSON_LABELS = /(?:^|\n)\s*(?:name|full name|customer|client|recipient|patient|issued to|bill to|ship to|sold to|contact person|prepared by|author|owner|account holder|attn|attention)\s*[:\-]\s*([^\n\r]+)/gim;
const ADDRESS_LABELS = /(?:^|\n)\s*(?:address|mailing address|billing address|shipping address|residential address|location|office address)\s*[:\-]\s*([^\n\r]+)/gim;
const ID_LABELS = /(?:invoice\s*(?:number|no\.?|#)?|order\s*(?:number|no\.?|#)?|reference\s*(?:number|no\.?|#)?|ref\s*(?:number|no\.?|#)?|id\s*(?:number|no\.?|#)?|document\s*(?:id|number|no\.?|#)?)\s*[:#\-\s]*([A-Z0-9][A-Z0-9/._-]{2,})/gim;
const MONEY_PATTERN = /(?:[$€£¥]|USD|EUR|GBP|INR|AUD|CAD|NZD|JPY|CHF|CNY|SGD|AED|SAR)\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d{1,3}(?:,\d{3})+(?:\.\d{2})?\s?(?:[$€£¥]|USD|EUR|GBP|INR|AUD|CAD|NZD|JPY|CHF|CNY|SGD|AED|SAR)/gi;
const DATE_PATTERNS = [
  /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
  /\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/g,
  /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\.?\s+\d{1,2}(?:,\s+\d{4})?\b/gi,
  /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\.?\s+\d{4}\b/gi,
];
const NAME_BLOCK_BLACKLIST = /(?:invoice|receipt|statement|order|reference|total|amount|date|phone|email|address|website|www\.|http|tax|balance|payment|company|limited|ltd|llc|inc|corp|co\.|pvt|gmbh|sarl|bank|department)/i;
const ADDRESS_SUFFIX = /\b(?:street|st\.?|avenue|ave\.?|road|rd\.?|lane|ln\.?|drive|dr\.?|boulevard|blvd\.?|court|ct\.?|place|pl\.?|terrace|trl\.?|parkway|pkwy\.?|way|suite|ste\.?|floor|fl\.?|po box|p\.?o\.? box|building|blk|sector|colony|district)\b/i;
const FINANCIAL_LABELS = [
  /(?:grand\s+total|amount\s+due|balance\s+due|total\s+amount|final\s+amount|net\s+amount)\s*[:\-\s]*([^(\n\r)]+)/i,
  /(?:subtotal|sub\s+total|tax\s+amount|sales\s+tax|vat|gst|hst|tax)\s*[:\-\s]*([^(\n\r)]+)/i,
  /(?:total|amount|price|cost|fee|payment|paid|balance)\s*[:\-\s]*([^(\n\r)]+)/i,
];
const KEYWORD_HINTS = ["invoice", "receipt", "payment", "tax", "total", "balance", "contact", "delivery", "shipping", "billing", "due", "reference", "order", "account", "website", "email", "phone", "address"];
const IMPORTANT_HINTS = ["invoice", "total", "balance", "amount due", "payment", "due date", "reference", "order", "receipt", "contact", "website", "email", "phone", "address", "tax"];

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
}

function splitLines(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toWords(value) {
  return normalizeWhitespace(value).toLowerCase().match(/[a-z0-9']+/g) || [];
}

function uniqueValues(values) {
  return Array.from(new Set((Array.isArray(values) ? values : []).map((value) => normalizeWhitespace(value)).filter(Boolean)));
}

function extractEmails(text) {
  return uniqueValues((String(text ?? "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map((value) => value.trim().toLowerCase()));
}

function extractUrls(text) {
  const matches = String(text ?? "").match(/(?:https?:\/\/|www\.)[\w\-._~:/?#@!$&'()*+,;=%]+/gi) || [];
  return uniqueValues(matches.map((value) => value.replace(/[),.;!?]+$/g, "")));
}

function extractDates(text) {
  const values = [];
  for (const pattern of DATE_PATTERNS) {
    values.push(...(String(text ?? "").match(pattern) || []));
  }
  return uniqueValues(values.map((value) => value.trim()));
}

function cleanCandidate(value) {
  return normalizeWhitespace(value).replace(/[|]+/g, " ").replace(/[,:;]+$/g, "").trim();
}

function extractLabeledValues(text, pattern) {
  const values = [];
  for (const match of String(text ?? "").matchAll(pattern)) {
    const value = cleanCandidate(match[1]);
    if (value) values.push(value);
  }
  return uniqueValues(values);
}

function looksLikePersonName(value) {
  const candidate = cleanCandidate(value);
  if (!candidate || candidate.length < 4 || candidate.length > 60) return false;
  if (NAME_BLOCK_BLACKLIST.test(candidate)) return false;
  if (/\d/.test(candidate)) return false;
  const words = candidate.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 4) return false;
  return words.every((word) => /^[A-Z][a-z'’-]+$/.test(word) || /^[A-Z]{2,}$/.test(word));
}

function extractNames(text, lines) {
  const values = extractLabeledValues(text, PERSON_LABELS);

  for (const line of lines) {
    const cleaned = cleanCandidate(line);
    if (!cleaned || NAME_BLOCK_BLACKLIST.test(cleaned) || /\d/.test(cleaned)) continue;

    const candidateMatches = cleaned.match(/\b([A-Z][a-z'’-]+(?:\s+[A-Z][a-z'’-]+){1,3})\b/g) || [];
    for (const candidate of candidateMatches) {
      if (looksLikePersonName(candidate)) {
        values.push(candidate);
      }
    }
  }

  return uniqueValues(values).slice(0, 12);
}

function lineLooksLikeAddress(line) {
  const cleaned = cleanCandidate(line);
  if (!cleaned || cleaned.length < 8 || cleaned.length > 140) return false;
  if (/\b(?:invoice|receipt|payment|tax|phone|email|website|contact|total|order|reference)\b/i.test(cleaned)) return false;
  if (/\d/.test(cleaned) && ADDRESS_SUFFIX.test(cleaned)) return true;
  if (/\b\d{5}(?:-\d{4})?\b/.test(cleaned)) return true;
  if (/\b[A-Za-z]+,\s*[A-Z]{2}\b/.test(cleaned)) return true;
  return ADDRESS_SUFFIX.test(cleaned);
}

function extractAddresses(text, lines) {
  const values = [];
  const labelMatches = extractLabeledValues(text, ADDRESS_LABELS);
  values.push(...labelMatches);

  for (let index = 0; index < lines.length; index += 1) {
    const line = cleanCandidate(lines[index]);
    if (!line) continue;

    if (!ADDRESS_LABELS.test(line)) {
      ADDRESS_LABELS.lastIndex = 0;
    }

    if (/^(?:address|mailing address|billing address|shipping address|residential address|location|office address)\s*[:\-]/i.test(line)) {
      const nextLines = [line.replace(/^(?:address|mailing address|billing address|shipping address|residential address|location|office address)\s*[:\-]\s*/i, "")];
      for (let offset = 1; offset <= 2; offset += 1) {
        const nextLine = lines[index + offset];
        if (nextLine && lineLooksLikeAddress(nextLine)) {
          nextLines.push(cleanCandidate(nextLine));
        }
      }
      const combined = cleanCandidate(nextLines.join(", "));
      if (combined) values.push(combined);
    }

    if (lineLooksLikeAddress(line)) {
      values.push(line);
    }
  }

  return uniqueValues(values).slice(0, 12);
}

function extractIdentifiers(text) {
  const values = {
    ids: [],
    invoiceNumbers: [],
    orderNumbers: [],
    referenceNumbers: [],
  };

  for (const match of String(text ?? "").matchAll(ID_LABELS)) {
    const value = cleanCandidate(match[1]);
    if (!value) continue;
    values.ids.push(value);

    const label = cleanCandidate(match[0]).toLowerCase();
    if (label.includes("invoice")) values.invoiceNumbers.push(value);
    else if (label.includes("order")) values.orderNumbers.push(value);
    else values.referenceNumbers.push(value);
  }

  const genericMatches = String(text ?? "").match(/\b(?:INV|INVOICE|ORD|ORDER|REF|REFERENCE|ID|DOC|DOCUMENT)[-_\/#:]?[A-Z0-9][A-Z0-9._/-]{2,}\b/gi) || [];
  for (const candidate of genericMatches) {
    const value = cleanCandidate(candidate);
    if (!value) continue;
    values.ids.push(value);
    if (/\b(?:INV|INVOICE)\b/i.test(value)) values.invoiceNumbers.push(value);
    else if (/\b(?:ORD|ORDER)\b/i.test(value)) values.orderNumbers.push(value);
    else values.referenceNumbers.push(value);
  }

  return {
    ids: uniqueValues(values.ids).slice(0, 16),
    invoiceNumbers: uniqueValues(values.invoiceNumbers).slice(0, 12),
    orderNumbers: uniqueValues(values.orderNumbers).slice(0, 12),
    referenceNumbers: uniqueValues(values.referenceNumbers).slice(0, 12),
  };
}

function cleanMoneyValue(value) {
  return cleanCandidate(value).replace(/\s+/g, " ");
}

function extractFinancialData(text, lines) {
  const amounts = uniqueValues((String(text ?? "").match(MONEY_PATTERN) || []).map((value) => cleanMoneyValue(value)));
  const totals = [];
  const taxValues = [];
  const currencyValues = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (!FINANCIAL_LABELS.some((pattern) => pattern.test(line))) {
      FINANCIAL_LABELS.forEach((pattern) => {
        pattern.lastIndex = 0;
      });
    }

    if (/\b(?:grand\s+total|amount\s+due|balance\s+due|total\s+amount|final\s+amount|net\s+amount)\b/i.test(lower)) {
      const match = line.match(MONEY_PATTERN);
      if (match) totals.push(cleanMoneyValue(match[0]));
    }

    if (/\b(?:subtotal|sub\s+total|tax\s+amount|sales\s+tax|vat|gst|hst|tax)\b/i.test(lower)) {
      const match = line.match(MONEY_PATTERN);
      if (match) taxValues.push(cleanMoneyValue(match[0]));
    }

    if (/\b(?:total|amount|price|cost|fee|payment|paid|balance)\b/i.test(lower)) {
      const match = line.match(MONEY_PATTERN);
      if (match) currencyValues.push(cleanMoneyValue(match[0]));
    }
  }

  const totalAmounts = uniqueValues(totals);
  const taxAmounts = uniqueValues(taxValues);
  const currencyAmounts = uniqueValues(currencyValues);

  return {
    amounts: amounts.slice(0, 24),
    currencyValues: currencyAmounts.length ? currencyAmounts.slice(0, 12) : amounts.slice(0, 12),
    totals: totalAmounts.slice(0, 12),
    taxValues: taxAmounts.slice(0, 12),
  };
}

function extractKeywords(text) {
  const counts = new Map();
  for (const word of toWords(text)) {
    if (word.length < 4 || STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 16)
    .map(([word]) => word);
}

function extractImportantTextBlocks(text) {
  const blocks = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/g)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter((block) => block.length >= 20);

  return blocks
    .map((block) => {
      const lower = block.toLowerCase();
      let score = 0;
      for (const hint of IMPORTANT_HINTS) {
        if (lower.includes(hint)) score += 3;
      }
      if (/\b\d{2,}\b/.test(block)) score += 2;
      if (MONEY_PATTERN.test(block)) score += 3;
      MONEY_PATTERN.lastIndex = 0;
      if (block.length < 50) score += 1;
      if (block === block.toUpperCase()) score += 1;
      return { block, score };
    })
    .sort((a, b) => b.score - a.score || b.block.length - a.block.length)
    .slice(0, 8)
    .map(({ block }) => block);
}

function countNumbers(text) {
  return (String(text ?? "").match(/\b\d+(?:\.\d+)?\b/g) || []).length;
}

function buildStatistics({ names, emails, phones, addresses, dates, links, identifiers, financialData, keywords, importantBlocks, fullText }) {
  const totalExtractedItems = [
    names,
    emails,
    phones,
    addresses,
    dates,
    links,
    identifiers.ids,
    identifiers.invoiceNumbers,
    identifiers.orderNumbers,
    identifiers.referenceNumbers,
    financialData.amounts,
    financialData.currencyValues,
    financialData.totals,
    financialData.taxValues,
    keywords,
    importantBlocks,
  ].reduce((sum, entry) => sum + (Array.isArray(entry) ? entry.length : 0), 0);

  const wordCount = toWords(fullText).length;
  const numberCount = countNumbers(fullText);
  const contactCount = names.length + emails.length + phones.length + addresses.length;

  return {
    totalExtractedItems,
    contactCount,
    datesCount: dates.length,
    linksCount: links.length,
    numbersCount: numberCount,
    wordCount,
  };
}

export function extractDocumentData({ fileSummaries = [], combinedText = "" }) {
  const fullText = normalizeWhitespace(combinedText);
  const lines = splitLines(combinedText);
  const emails = extractEmails(fullText);
  const phones = extractPhones(fullText);
  const names = extractNames(fullText, lines);
  const addresses = extractAddresses(fullText, lines);
  const dates = extractDates(fullText);
  const links = extractUrls(fullText);
  const identifiers = extractIdentifiers(fullText);
  const financialData = extractFinancialData(fullText, lines);
  const keywords = extractKeywords(fullText);
  const importantBlocks = extractImportantTextBlocks(combinedText);
  const statistics = buildStatistics({
    names,
    emails,
    phones,
    addresses,
    dates,
    links,
    identifiers,
    financialData,
    keywords,
    importantBlocks,
    fullText,
  });

  return {
    fileSummaries,
    fullText,
    personalInfo: {
      names,
      phones,
      emails,
      addresses,
    },
    documentInfo: {
      dates,
      ids: identifiers.ids,
      invoiceNumbers: identifiers.invoiceNumbers,
      orderNumbers: identifiers.orderNumbers,
      referenceNumbers: identifiers.referenceNumbers,
      importantBlocks,
    },
    financialData,
    links,
    keywords,
    importantBlocks,
    statistics,
  };
}

function formatList(items, emptyMessage = "None detected") {
  return Array.isArray(items) && items.length ? items : [emptyMessage];
}

function getFileLabel(fileSummary) {
  const sizeLabel = fileSummary?.sizeLabel ? ` • ${fileSummary.sizeLabel}` : "";
  const typeLabel = fileSummary?.type ? ` • ${fileSummary.type}` : "";
  return `${fileSummary?.name || "document"}${sizeLabel}${typeLabel}`;
}

function sectionBlock(title, items) {
  return [title, ...items.map((item) => `- ${item}`), ""].join("\n");
}

export function buildReportText(analysis) {
  const personal = analysis?.personalInfo || {};
  const documentInfo = analysis?.documentInfo || {};
  const financialData = analysis?.financialData || {};
  const stats = analysis?.statistics || {};
  const files = Array.isArray(analysis?.fileSummaries) ? analysis.fileSummaries : [];

  const fileSection = files.length
    ? files.map((entry) => `- ${getFileLabel(entry)}`).join("\n")
    : "- None";

  return [
    "# Document Data Extractor Report",
    "",
    "## Uploaded Files",
    fileSection,
    "",
    sectionBlock("## Personal Info", [
      `Names: ${formatList(personal.names).join(", ")}`,
      `Phone numbers: ${formatList(personal.phones).join(", ")}`,
      `Email addresses: ${formatList(personal.emails).join(", ")}`,
      `Addresses: ${formatList(personal.addresses).join(", ")}`,
    ]),
    sectionBlock("## Document Info", [
      `Dates: ${formatList(documentInfo.dates).join(", ")}`,
      `IDs: ${formatList(documentInfo.ids).join(", ")}`,
      `Invoice numbers: ${formatList(documentInfo.invoiceNumbers).join(", ")}`,
      `Order numbers: ${formatList(documentInfo.orderNumbers).join(", ")}`,
      `Reference numbers: ${formatList(documentInfo.referenceNumbers).join(", ")}`,
      `Important blocks: ${formatList(documentInfo.importantBlocks).join(" | ")}`,
    ]),
    sectionBlock("## Financial Data", [
      `Amounts: ${formatList(financialData.amounts).join(", ")}`,
      `Currency values: ${formatList(financialData.currencyValues).join(", ")}`,
      `Totals: ${formatList(financialData.totals).join(", ")}`,
      `Tax values: ${formatList(financialData.taxValues).join(", ")}`,
    ]),
    sectionBlock("## Links", [`Links: ${formatList(analysis?.links).join(", ")}`]),
    sectionBlock("## Keywords", [`Keywords: ${formatList(analysis?.keywords).join(", ")}`]),
    "## Raw Extracted Text",
    analysis?.fullText || "No readable text was extracted.",
    "",
    sectionBlock("## Statistics", [
      `Total extracted items: ${stats.totalExtractedItems || 0}`,
      `Contact count: ${stats.contactCount || 0}`,
      `Dates count: ${stats.datesCount || 0}`,
      `Links count: ${stats.linksCount || 0}`,
      `Numbers count: ${stats.numbersCount || 0}`,
      `Word count: ${stats.wordCount || 0}`,
    ]),
  ].join("\n");
}

export function buildJsonExport(analysis) {
  return JSON.stringify(
    {
      fileSummaries: analysis?.fileSummaries || [],
      personalInfo: analysis?.personalInfo || {},
      documentInfo: analysis?.documentInfo || {},
      financialData: analysis?.financialData || {},
      links: analysis?.links || [],
      keywords: analysis?.keywords || [],
      importantBlocks: analysis?.importantBlocks || [],
      statistics: analysis?.statistics || {},
      rawText: analysis?.fullText || "",
    },
    null,
    2
  );
}

export function buildPlainTextExport(analysis) {
  return [
    "Document Data Extractor",
    "",
    `Files: ${(analysis?.fileSummaries || []).length}`,
    `Names: ${formatList(analysis?.personalInfo?.names).join(", ")}`,
    `Phone numbers: ${formatList(analysis?.personalInfo?.phones).join(", ")}`,
    `Email addresses: ${formatList(analysis?.personalInfo?.emails).join(", ")}`,
    `Addresses: ${formatList(analysis?.personalInfo?.addresses).join(", ")}`,
    `Dates: ${formatList(analysis?.documentInfo?.dates).join(", ")}`,
    `IDs: ${formatList(analysis?.documentInfo?.ids).join(", ")}`,
    `Invoice numbers: ${formatList(analysis?.documentInfo?.invoiceNumbers).join(", ")}`,
    `Order numbers: ${formatList(analysis?.documentInfo?.orderNumbers).join(", ")}`,
    `Reference numbers: ${formatList(analysis?.documentInfo?.referenceNumbers).join(", ")}`,
    `Amounts: ${formatList(analysis?.financialData?.amounts).join(", ")}`,
    `Currency values: ${formatList(analysis?.financialData?.currencyValues).join(", ")}`,
    `Totals: ${formatList(analysis?.financialData?.totals).join(", ")}`,
    `Tax values: ${formatList(analysis?.financialData?.taxValues).join(", ")}`,
    `Links: ${formatList(analysis?.links).join(", ")}`,
    `Keywords: ${formatList(analysis?.keywords).join(", ")}`,
    "",
    "Raw Extracted Text",
    analysis?.fullText || "No readable text was extracted.",
  ].join("\n");
}

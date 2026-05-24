const PHONE_CONTEXT_KEYWORDS = [
  "phone",
  "tel",
  "telephone",
  "mobile",
  "cell",
  "contact",
  "whatsapp",
  "fax",
  "office",
  "support",
  "hotline",
  "call",
  "dial",
  "reach",
];

const PHONE_NEGATIVE_KEYWORDS = [
  "invoice",
  "order",
  "reference",
  "serial",
  "account",
  "page",
  "section",
  "figure",
  "table",
  "zip",
  "postal",
  "code",
  "amount",
  "price",
  "total",
  "date",
  "year",
  "id",
];

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
}

function phoneDigits(value) {
  return normalizeWhitespace(value).replace(/\D/g, "");
}

function normalizePhoneDisplay(value) {
  const clean = normalizeWhitespace(value).replace(/[),.;:!?]+$/g, "");
  if (!clean) return null;

  const extensionMatch = clean.match(/\b(?:ext\.?|extension|x)\s*(\d{1,6})$/i);
  let base = extensionMatch ? clean.slice(0, extensionMatch.index).trim() : clean;

  base = base.replace(/\s{2,}/g, " ").replace(/\s*([()\-./])\s*/g, "$1");
  base = base.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");

  if (base.startsWith("+")) {
    base = `+${base.slice(1).replace(/\+/g, "")}`;
  }

  const display = extensionMatch ? `${base} x${extensionMatch[1]}` : base;
  const digits = phoneDigits(display);

  if (digits.length < 8 || digits.length > 15) {
    return null;
  }

  return display;
}

function isDateLike(value) {
  return (
    /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(value) ||
    /^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(value) ||
    /^\d{4}$/.test(value)
  );
}

function scoreDisplay(value) {
  return [/[+]/.test(value), /[()\-./]/.test(value), /\b(?:ext\.?|extension|x)\b/i.test(value)]
    .reduce((score, flag, index) => score + (flag ? [2, 1, 1][index] : 0), 0) + (value.match(/\d/g) || []).length / 100;
}

function dedupePhones(values) {
  const map = new Map();

  for (const value of values) {
    const display = normalizePhoneDisplay(value);
    if (!display) continue;

    const key = phoneDigits(display);
    if (!key) continue;

    const current = map.get(key);
    if (!current || scoreDisplay(display) > scoreDisplay(current)) {
      map.set(key, display);
    }
  }

  return Array.from(map.values());
}

function hasPositiveContext(context) {
  const lower = normalizeWhitespace(context).toLowerCase();
  return PHONE_CONTEXT_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function hasNegativeContext(context) {
  const lower = normalizeWhitespace(context).toLowerCase();
  return PHONE_NEGATIVE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function hasLabelContext(before) {
  return /(?:phone|tel|telephone|mobile|cell|contact|whatsapp|fax|office|support|hotline|call|dial|reach)\s*(?:number|no\.?|#|:|\-|–|is|at)?\s*$/i.test(
    normalizeWhitespace(before)
  );
}

function isLikelyPhoneCandidate(candidate, contextBefore, contextAfter) {
  const display = normalizePhoneDisplay(candidate);
  if (!display) return false;

  const digits = phoneDigits(display);
  if (digits.length < 8 || digits.length > 15) return false;
  if (isDateLike(display)) return false;

  const before = normalizeWhitespace(contextBefore);
  const after = normalizeWhitespace(contextAfter);
  const context = `${before} ${after}`;
  const positiveContext = hasPositiveContext(context);
  const negativeContext = hasNegativeContext(context);
  const labelContext = hasLabelContext(before);
  const hasStructure = /[()+\-./]/.test(display) || /^\+/.test(display) || /\d\s+\d/.test(display);

  if (negativeContext && !positiveContext && !labelContext) return false;
  if (labelContext || positiveContext) return true;
  return hasStructure && digits.length >= 10 && !negativeContext;
}

export function extractPhones(text) {
  const source = normalizeWhitespace(text);
  if (!source) return [];

  const regex = /(?:\+?\d|\(\d)[\d()\s.-]{6,}\d(?:\s*(?:ext\.?|x|extension)\s*\d{1,6})?/gi;
  const values = [];

  for (const match of source.matchAll(regex)) {
    const candidate = match[0];
    const index = match.index ?? 0;
    const before = source.slice(Math.max(0, index - 60), index);
    const after = source.slice(index + candidate.length, Math.min(source.length, index + candidate.length + 60));

    if (!isLikelyPhoneCandidate(candidate, before, after)) continue;
    values.push(candidate);
  }

  return dedupePhones(values);
}

export function validatePhoneList(values, fallbackPhones = []) {
  const fallbackKeys = new Set((Array.isArray(fallbackPhones) ? fallbackPhones : []).map((value) => phoneDigits(value)).filter(Boolean));
  const validated = [];

  for (const value of Array.isArray(values) ? values : []) {
    const display = normalizePhoneDisplay(value);
    if (!display) continue;

    const key = phoneDigits(display);
    if (!key) continue;

    if (fallbackKeys.has(key)) {
      validated.push(display);
    }
  }

  return dedupePhones(validated);
}
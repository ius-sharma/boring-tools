export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_TIMEOUT_MS = 8000;
const TRUST_HEADERS = [
  "strict-transport-security",
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
];

const POSITIVE_PATTERNS = [
  /privacy policy/i,
  /terms of service/i,
  /contact us/i,
  /about us/i,
  /support/i,
  /refund/i,
  /address/i,
  /phone/i,
  /secure checkout/i,
  /https:\/\//i,
];

const NEGATIVE_PATTERNS = [
  /verify your account/i,
  /urgent/i,
  /act now/i,
  /limited time/i,
  /wire transfer/i,
  /crypto/i,
  /guaranteed/i,
  /free gift/i,
  /password required/i,
  /login to claim/i,
  /no risk/i,
  /congratulations you won/i,
];

function normalize(input) {
  return String(input ?? "").trim();
}

function safeHostname(hostname) {
  return hostname.toLowerCase();
}

function isPrivateAddress(hostname) {
  if (!hostname) return true;
  if (hostname === "localhost" || hostname.endsWith(".localhost")) return true;
  if (hostname === "127.0.0.1" || hostname === "::1") return true;
  if (/^10\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return true;
  if (/^0\./.test(hostname)) return true;
  if (/^169\.254\./.test(hostname)) return true;
  return false;
}

function normalizeUrl(rawUrl) {
  const trimmed = normalize(rawUrl);
  if (!trimmed) throw new Error("URL is required");

  let value = trimmed;
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  const parsed = new URL(value);
  if (!/^https?:$/.test(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported");
  }

  if (isPrivateAddress(safeHostname(parsed.hostname))) {
    throw new Error("Local and private network addresses are not allowed");
  }

  return parsed;
}

function analyzeDomain(url) {
  const host = safeHostname(url.hostname);
  const hostParts = host.split(".").filter(Boolean);
  const tld = hostParts.at(-1) || "";
  let score = 100;
  const signals = [];

  if (url.protocol === "http:") {
    score -= 25;
    signals.push("Uses HTTP instead of HTTPS.");
  } else {
    signals.push("Uses HTTPS.");
  }

  if (host.includes("xn--")) {
    score -= 15;
    signals.push("Punycode domain detected, which can hide lookalikes.");
  }

  if (hostParts.length >= 4) {
    score -= 8;
    signals.push("Many subdomain levels can be used to mimic trusted brands.");
  }

  if (host.includes("-") && hostParts.length >= 2) {
    score -= 4;
    signals.push("Hyphenated domains deserve extra scrutiny.");
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    score -= 30;
    signals.push("An IP address is being used instead of a normal domain name.");
  }

  if (["zip", "mov", "top", "xyz", "cam", "click", "quest", "gq", "tk"].includes(tld)) {
    score -= 8;
    signals.push(`The .${tld} extension is often abused, so verify the site carefully.`);
  }

  return { score: Math.max(0, score), signals };
}

function analyzeHeaders(headers) {
  let score = 0;
  const signals = [];

  for (const header of TRUST_HEADERS) {
    if (headers.get(header)) {
      score += header === "strict-transport-security" || header === "content-security-policy" ? 12 : 7;
      signals.push(`Has ${header.toUpperCase().replace(/-/g, " ")} header.`);
    }
  }

  if (!headers.get("content-security-policy")) {
    score -= 5;
  }

  if (!headers.get("x-frame-options")) {
    score -= 3;
  }

  return { score, signals };
}

function extractMeta(html, pattern) {
  const match = html.match(pattern);
  return match ? normalize(match[1].replace(/\s+/g, " ")) : "";
}

function extractVisibleText(html) {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");
  return stripped.slice(0, 12000);
}

function analyzeContent(html, context = "") {
  const signals = [];
  let score = 0;
  const text = `${extractVisibleText(html)} ${context}`;

  const title = extractMeta(html, /<title[^>]*>(.*?)<\/title>/i);
  if (title) {
    score += 6;
    signals.push(`Page title found: "${title}".`);
  } else {
    score -= 6;
    signals.push("No page title detected.");
  }

  const description = extractMeta(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  if (description) {
    score += 5;
    signals.push("Meta description present.");
  }

  const positiveCount = POSITIVE_PATTERNS.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
  const negativeCount = NEGATIVE_PATTERNS.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);

  if (positiveCount) {
    score += Math.min(positiveCount * 4, 12);
    signals.push("Found transparency and support signals in the visible content.");
  }

  if (negativeCount) {
    score -= Math.min(negativeCount * 10, 40);
    signals.push("Found urgency or pressure language that often appears on risky sites.");
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 40) {
    score -= 6;
    signals.push("Very little visible content was detected.");
  }

  if (/password|login|sign in/i.test(text) && !/about|support|contact/i.test(text)) {
    score -= 8;
    signals.push("Login or password prompts appear without strong support/transparency cues.");
  }

  if (/bitcoin|crypto|wallet|wire transfer/i.test(text)) {
    score -= 8;
    signals.push("Crypto or payment language detected; verify carefully before proceeding.");
  }

  return { score, signals, title, description };
}

function levelFromScore(score) {
  if (score >= 75) return "safe";
  if (score >= 45) return "caution";
  return "risk";
}

function verdictFromScore(score) {
  if (score >= 75) return "Reasonably trustworthy";
  if (score >= 45) return "Use caution";
  return "High risk or insufficient trust signals";
}

function buildRecommendations(score, url, analysis) {
  const recommendations = [];

  if (score < 75) {
    recommendations.push("Check the domain carefully before entering passwords or payment details.");
  }
  if (!url.hostname.startsWith("www.")) {
    recommendations.push("Confirm the exact brand domain matches the official source.");
  }
  if (!analysis.description) {
    recommendations.push("Look for a clear About, Contact, and Privacy Policy page.");
  }
  if (url.protocol === "http:") {
    recommendations.push("Avoid sending sensitive data over a non-HTTPS connection.");
  }
  if (score < 45) {
    recommendations.push("Search the domain name plus " + "scam" + " or " + "review" + " before trusting it.");
  }

  return recommendations.slice(0, 5);
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const mode = ["quick", "balanced", "deep"].includes(body?.mode) ? body.mode : "balanced";
    const parsedUrl = normalizeUrl(body?.url);
    const context = normalize(body?.context);

    const domainAnalysis = analyzeDomain(parsedUrl);
    let score = domainAnalysis.score;
    const signals = [...domainAnalysis.signals];
    let finalUrl = parsedUrl.toString();
    let html = "";
    let headers = new Headers();

    try {
      const response = await fetchWithTimeout(parsedUrl.toString(), {
        method: mode === "quick" ? "HEAD" : "GET",
        redirect: "follow",
        headers: {
          "User-Agent": "BoringToolsTrustChecker/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      finalUrl = response.url || finalUrl;
      headers = response.headers;
      const contentType = response.headers.get("content-type") || "";

      const headerAnalysis = analyzeHeaders(response.headers);
      score += headerAnalysis.score;
      signals.push(...headerAnalysis.signals);

      if (mode !== "quick" && contentType.includes("text/html")) {
        html = await response.text();
        const contentAnalysis = analyzeContent(html, context);
        score += contentAnalysis.score;
        signals.push(...contentAnalysis.signals);

        if (contentAnalysis.title) {
          signals.push(`Page title: ${contentAnalysis.title}`);
        }
        if (contentAnalysis.description) {
          signals.push(`Meta description: ${contentAnalysis.description}`);
        }
      } else {
        signals.push(mode === "quick" ? "Quick scan used HEAD only for speed." : "Content type was not HTML, so page text analysis was skipped.");
      }
    } catch (fetchError) {
      signals.push("Could not fetch the page directly, so this score is based on the URL alone.");
      signals.push(fetchError instanceof Error ? fetchError.message : "Fetch failed.");
      score -= 8;
    }

    if (context) {
      const contextSignals = [
        /money|payment|checkout|refund/i.test(context) ? "You mentioned payments or money, so double-check the merchant details." : "",
        /login|password|sign in/i.test(context) ? "You mentioned login or password prompts, which deserve extra caution." : "",
        /urgent|act now|limited time/i.test(context) ? "You noticed urgency language, which is a common trust warning sign." : "",
      ].filter(Boolean);
      score -= Math.min(contextSignals.length * 4, 12);
      signals.push(...contextSignals);
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    const level = levelFromScore(score);
    const verdict = verdictFromScore(score);
    const recommendations = buildRecommendations(score, parsedUrl, { description: html ? extractMeta(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i) : "" });

    return Response.json({
      verdict,
      score,
      level,
      summary: `${verdict}. ${level === "safe" ? "The site shows multiple trust signals." : level === "caution" ? "There are mixed signals, so verify before sharing anything sensitive." : "There are enough warning signs to treat this as suspicious until proven otherwise."}`,
      signals: Array.from(new Set(signals)).slice(0, 10),
      recommendations,
      details: {
        finalUrl,
        mode,
        contentType: headers.get("content-type") || "",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected trust-check failure" },
      { status: 400 }
    );
  }
}

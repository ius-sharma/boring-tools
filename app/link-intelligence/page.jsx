"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";

// ───────────────────────────────── SVG ICONS ─────────────────────────────────

const Icons = {
  search: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.3-4.3" /></svg>
  ),
  cart: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
  ),
  alertTriangle: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01" /></svg>
  ),
  fingerprint: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4M14 13.12c0 2.38-.16 4.72-.49 6.87M4.26 10.15a8 8 0 0 1 15.48 0M2.06 16a12.06 12.06 0 0 0 .82-3.96 8 8 0 0 1 16 0c0 1.15-.08 2.38-.24 3.59M6 16.1c.09-1.28.13-2.64.13-4.1 0-3.31 2.69-6 6-6s6 2.69 6 6c0 1.64-.08 3.14-.24 4.47M10 16.12c.06-.87.1-1.81.1-2.81 0-1.05.86-1.9 1.9-1.9s1.9.86 1.9 1.9c0 1.09-.05 2.13-.14 3.11" /></svg>
  ),
  mask: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.1 0-2 .6-2.5 1.3M12 8c1.1 0 2 .6 2.5 1.3M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0zm4 1c.5.5 1.5 1 2 1s1.5-.5 2-1m2 0c.5.5 1.5 1 2 1s1.5-.5 2-1" /></svg>
  ),
  link: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
  ),
  mail: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect width="20" height="16" x="2" y="4" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
  ),
  lock: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path strokeLinecap="round" d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
  ),
  lockOpen: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path strokeLinecap="round" d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
  ),
  shield: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
  shieldCheck: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" /></svg>
  ),
  shieldAlert: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" /></svg>
  ),
  shieldX: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path strokeLinecap="round" strokeLinejoin="round" d="m14.5 9.5-5 5m0-5 5 5" /></svg>
  ),
  zap: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
  ),
  layers: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m12 2 10 6.5v7L12 22 2 15.5v-7L12 2zM12 22v-6.5M22 8.5l-10 7-10-7" /></svg>
  ),
  shuffle: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H20m0 0-3-3m3 3-3 3M2 6h1.9c1.5 0 2.9.9 3.6 2.2M20 18h-3.9c-1.3 0-2.5-.6-3.3-1.7l-.9-1.2M20 18l-3-3m3 3-3 3" /></svg>
  ),
  ruler: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0zM14.5 12.5 12 10m5 2-1-1M7 9l2 2m-4-1 1 1" /></svg>
  ),
  keyRound: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg>
  ),
  flag: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zm0 7v-7" /></svg>
  ),
  linkSlash: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71M5.17 11.75 3.45 13.46a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.72-1.71M2 2l20 20" /><path strokeLinecap="round" d="M8.5 16h.01M15.5 8h.01" /></svg>
  ),
  sparkle: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" /></svg>
  ),
  copy: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path strokeLinecap="round" d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
  ),
  check: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" /></svg>
  ),
  circleCheck: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" /></svg>
  ),
  circleAlert: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" /></svg>
  ),
  circleX: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="m15 9-6 6m0-6 6 6" /></svg>
  ),
  broom: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m13 11 9-9M15.3 13.3a4.94 4.94 0 0 0-6.57-6.57L2.07 13.4a.5.5 0 0 0 .07.84l3.34 2a.5.5 0 0 0 .6-.07l1.3-1.3a.5.5 0 0 1 .72 0l1.04 1.04a.5.5 0 0 1 0 .72l-1.3 1.3a.5.5 0 0 0-.07.6l2 3.34a.5.5 0 0 0 .84.07z" /></svg>
  ),
  settings: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
  ),
  globe: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
  ),
  eye: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
  ),
  download: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3" /></svg>
  ),
  fileText: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" /><path strokeLinecap="round" d="M14 2v4a2 2 0 0 0 2 2h4M10 13h4m-4 4h4m-6-8h2" /></svg>
  ),
  type: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>
  ),
  cornerDownRight: (cls = "w-4 h-4") => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15 10 5 5-5 5" /><path strokeLinecap="round" d="M4 4v7a4 4 0 0 0 4 4h12" /></svg>
  ),
};

// Helper to render the right icon for a safety indicator
function SafetyIcon({ id, status }) {
  const cls = "w-4 h-4 shrink-0";
  if (status === "safe") return Icons.circleCheck(cls);
  if (status === "caution") return Icons.circleAlert(cls);

  // Risk icons by indicator type
  switch (id) {
    case "https": return Icons.lockOpen(cls);
    case "spoofing": return Icons.mask(cls);
    case "idn": return Icons.type(cls);
    case "brand": return Icons.zap(cls);
    case "sub": return Icons.layers(cls);
    case "redirect": return Icons.shuffle(cls);
    case "length": return Icons.ruler(cls);
    case "obfuscation": return Icons.keyRound(cls);
    case "tld": return Icons.flag(cls);
    case "shortener": return Icons.linkSlash(cls);
    default: return Icons.circleX(cls);
  }
}

// ───────────────────────────────── CONSTANTS ─────────────────────────────────

const PRESETS = [
  { name: "Clean Search", url: "https://www.google.com/search?q=boring+tools&hl=en", icon: "search" },
  { name: "Tracked Product", url: "https://www.amazon.com/dp/B08N5WRWNW?tag=boringtools-20&ref_=nav_em&utm_source=newsletter&utm_medium=email&utm_campaign=prime_day&fbclid=IwAR123456789abc&gclid=CjwKCA12345", icon: "cart" },
  { name: "Phishing Redirect", url: "http://signin.paypal.com.accounts-verify.security-update.xyz/login?redirect_to=https%3A%2F%2Fattacker.com%2Fsteal%3Fnext%3Dhttps%253A%252F%252Ffinal-drop.com%252Fcreds&token=dGhlc2UgYXJlIHZlcnkgc2VjcmV0IHRva2Vucw==&ref=affiliate_banner", icon: "alertTriangle" },
  { name: "IDN Homograph", url: "https://www.аpple.com/iphone-15?utm_source=twitter&utm_medium=social", icon: "fingerprint" },
  { name: "@ Authority Spoof", url: "https://google.com@attacker-site.com/login?u=https://microsoft.com", icon: "mask" },
  { name: "Shortener", url: "https://bit.ly/3xK9m2Q?utm_source=slack&fbclid=abc123", icon: "link" },
  { name: "Bulk Text", bulk: true, url: `Hey team, check these links:\nhttps://docs.google.com/spreadsheets/d/abc?utm_source=email&utm_campaign=q2\nAlso see https://www.notion.so/project?ref=slack&fbclid=xyz123\nand http://example.com/page?gclid=CjwKCAjw&msclkid=abc&tag=partner-20`, icon: "mail" },
];

function PresetIcon({ icon }) {
  const cls = "w-3.5 h-3.5";
  return Icons[icon] ? Icons[icon](cls) : Icons.link(cls);
}

const TRACKING_DICT = {
  utm_source: "Google Analytics — traffic source (e.g. newsletter, search engine)",
  utm_medium: "Google Analytics — marketing medium (e.g. email, cpc, social)",
  utm_campaign: "Google Analytics — specific campaign name or code",
  utm_term: "Google Analytics — paid search keywords",
  utm_content: "Google Analytics — A/B test or link variant identifier",
  utm_id: "Google Analytics — campaign code identifier",
  utm_source_platform: "Google Analytics — ad platform routing",
  utm_marketing_tactic: "Google Analytics — tactic classification",
  fbclid: "Facebook — click identifier for conversion tracking",
  gclid: "Google Ads — click identifier linking ads to sessions",
  gclsrc: "Google Ads — click source attributes",
  dclid: "DoubleClick — display network click tracking",
  msclkid: "Microsoft/Bing Ads — conversion tracking click ID",
  yclid: "Yahoo Gemini — advertising attribution",
  twclid: "Twitter/X — ad referral click tracking",
  ttclid: "TikTok — ad attribution and conversions",
  li_fat_id: "LinkedIn — insights conversion tracking",
  scid: "Snapchat — campaign referral tracker",
  _hsenc: "HubSpot — secure email click tracking",
  _hsmi: "HubSpot — email campaign run identifier",
  hsCtaTracking: "HubSpot — CTA click statistics",
  mc_cid: "Mailchimp — campaign interaction tracking",
  mc_eid: "Mailchimp — email address tracking ID",
  mkt_tok: "Marketo — email-to-lead profile connector",
  _kx: "Klaviyo — newsletter engagement tracking",
  s_kwcid: "Adobe Analytics — search keyword campaign ID",
  sg_event_id: "SendGrid — email click event identifier",
  tag: "Amazon — affiliate commission attribution tag",
  aff_id: "Affiliate tracking — partner commission ID",
  affiliate: "Affiliate tracking — partner commission ID",
  ref: "Referral — originating source or layout section",
  ref_: "Referral — originating source or layout section",
  ref_src: "Referral — client interface source",
  source: "Referrer — originating source context",
  click_id: "Ad network — generic conversion click ID",
  clickid: "Ad network — generic conversion click ID",
  pixel_id: "Pixel — conversion tracking script mapping",
  pixelid: "Pixel — conversion tracking script mapping",
  spm: "Alibaba SPM — page-context user tracking",
  ncid: "Verizon Media — campaign tracking parameter",
  cmpid: "Campaign ID — advertising campaign index",
  adid: "Ad ID — mobile/display placement tracking",
  _ga: "Google Analytics — cross-domain linker parameter",
  _gl: "Google Analytics 4 — cross-domain linker",
  igshid: "Instagram — share identifier tracking",
  si: "YouTube/Spotify — share tracking identifier",
};

const HIGH_RISK_TLDS = [".zip", ".mov", ".top", ".tk", ".cf", ".ml", ".ga", ".gq", ".fit", ".work", ".click", ".loan", ".win", ".racing", ".review", ".stream", ".party", ".cricket", ".science", ".date"];

const URL_SHORTENERS = ["bit.ly", "t.co", "tinyurl.com", "goo.gl", "shorte.st", "is.gd", "ow.ly", "cutt.ly", "rb.gy", "rebrand.ly", "short.io", "tiny.cc", "lnkd.in", "buff.ly", "dlvr.it", "v.gd", "qr.ae"];

const BRAND_TARGETS = [
  "paypal", "google", "apple", "amazon", "netflix", "facebook", "microsoft",
  "instagram", "twitter", "github", "linkedin", "chase", "bankofamerica",
  "wellsfargo", "steam", "discord", "dropbox", "spotify", "coinbase",
  "binance", "metamask", "opensea", "adobe", "salesforce", "stripe",
  "whatsapp", "telegram", "signal", "zoom", "slack", "notion",
];

// ─────────────────────────────── UTILITIES ───────────────────────────────────

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function isBase64Like(str) {
  if (typeof str !== "string" || str.length < 16) return false;
  return /^[a-zA-Z0-9+/]+={0,2}$/.test(str);
}

function extractDomainParts(hostname) {
  const parts = hostname.split(".");
  if (parts.length <= 2) return { registeredDomain: hostname, subdomain: "" };
  const last = parts[parts.length - 1];
  const prev = parts[parts.length - 2];
  const isDoubleTld = ["co", "com", "org", "net", "gov", "edu", "mil", "asn"].includes(prev) && last.length === 2;
  const count = isDoubleTld ? 3 : 2;
  if (parts.length > count) {
    return {
      registeredDomain: parts.slice(parts.length - count).join("."),
      subdomain: parts.slice(0, parts.length - count).join("."),
    };
  }
  return { registeredDomain: hostname, subdomain: "" };
}

function decodeRedirectChain(value, depth = 0, maxDepth = 3) {
  if (depth >= maxDepth || typeof value !== "string") return [];
  let decoded = value;
  try {
    let prev = "";
    for (let i = 0; i < 5 && decoded !== prev; i++) {
      prev = decoded;
      decoded = decodeURIComponent(decoded);
    }
  } catch { /* ignore */ }
  const urlMatch = decoded.match(/https?:\/\/[^\s"'<>]+/i);
  if (!urlMatch) return [];
  const found = urlMatch[0];
  const chain = [{ url: found, depth: depth + 1 }];
  try {
    const inner = new URL(found);
    for (const [, v] of inner.searchParams) {
      chain.push(...decodeRedirectChain(v, depth + 1, maxDepth));
    }
  } catch { /* not a parseable URL */ }
  return chain;
}

function extractUrlsFromText(text) {
  const regex = /https?:\/\/[^\s"'<>\]\)]+/gi;
  const matches = text.match(regex);
  if (!matches) return [];
  return [...new Set(matches)];
}

// ──────────────────────────────── ANALYZER ────────────────────────────────────

function analyzeUrl(inputString, customRules = []) {
  const trimmed = inputString.trim();
  if (!trimmed) return null;

  let urlString = trimmed;
  if (!/^[a-zA-Z0-9+-.]+:\/\//i.test(urlString) && !urlString.startsWith("//")) {
    urlString = "https://" + urlString;
  }

  let urlObj;
  try {
    urlObj = new URL(urlString);
  } catch {
    try {
      urlString = urlString.replace(":/", "://");
      urlObj = new URL(urlString);
    } catch {
      return { error: "Invalid URL. Check the format (e.g. example.com or https://example.com)." };
    }
  }

  const hostname = urlObj.hostname;
  const { registeredDomain, subdomain } = extractDomainParts(hostname);
  const protocol = urlObj.protocol;
  const host = urlObj.host;
  const path = urlObj.pathname;
  const hash = urlObj.hash;

  const searchParamsList = [];
  urlObj.searchParams.forEach((value, key) => {
    searchParamsList.push({ key, value, enabled: true });
  });

  const detectedTrackers = [];
  const allCustomKeys = new Set(customRules.map(r => r.toLowerCase()));

  searchParamsList.forEach((p) => {
    const isUtm = p.key.startsWith("utm_");
    const dictMatch = TRACKING_DICT[p.key.toLowerCase()];
    const isCustom = allCustomKeys.has(p.key.toLowerCase());

    if (isUtm || dictMatch || isCustom) {
      detectedTrackers.push({
        key: p.key, value: p.value,
        type: isCustom ? "Custom Rule" : isUtm ? "UTM Parameter" : "Tracking Identifier",
        description: dictMatch || (isCustom ? "Matched your custom stripping rule" : `Campaign tracker (${p.key})`),
      });
    }
  });

  const redirectChain = [];
  searchParamsList.forEach(({ key, value }) => {
    const nested = decodeRedirectChain(value);
    if (nested.length > 0) {
      redirectChain.push({ paramKey: key, chain: nested });
    }
  });

  const indicators = [];

  if (protocol === "https:") {
    indicators.push({ id: "https", name: "Connection Security", status: "safe", message: "Encrypted HTTPS connection." });
  } else if (protocol === "http:") {
    indicators.push({ id: "https", name: "Connection Security", status: "risk", message: "Insecure HTTP — data can be intercepted in transit." });
  } else if (["javascript:", "data:", "vbscript:"].includes(protocol)) {
    indicators.push({ id: "https", name: "Executable Protocol", status: "risk", message: `Dangerous ${protocol} protocol — executes code in your browser.` });
  } else {
    indicators.push({ id: "https", name: "Uncommon Protocol", status: "caution", message: `Non-standard protocol: ${protocol}` });
  }

  if (urlObj.username) {
    indicators.push({ id: "spoofing", name: "Authority Spoofing (@)", status: "risk", message: `'${urlObj.username}' appears before @, disguising destination. Actual host: ${hostname}` });
  } else {
    indicators.push({ id: "spoofing", name: "Authority Spoofing", status: "safe", message: "No @ spoofing detected." });
  }

  const isPunycode = hostname.startsWith("xn--") || /[^\x00-\x7F]/.test(hostname);
  if (isPunycode) {
    indicators.push({ id: "idn", name: "IDN Homograph Attack", status: "risk", message: "Non-ASCII characters detected in hostname — may impersonate a legitimate domain using lookalike letters." });
  } else {
    indicators.push({ id: "idn", name: "IDN Homograph", status: "safe", message: "Standard ASCII characters only." });
  }

  const domainBase = registeredDomain.split(".")[0].toLowerCase();
  let brandMatch = null;
  for (const brand of BRAND_TARGETS) {
    if (domainBase === brand) break;
    const dist = levenshtein(domainBase, brand);
    const containsBrand = domainBase.includes(brand) && domainBase !== brand;
    if ((dist > 0 && dist <= 2) || containsBrand) {
      brandMatch = { brand, distance: dist, contains: containsBrand };
      break;
    }
  }
  if (brandMatch) {
    indicators.push({ id: "brand", name: "Brand Impersonation", status: "risk", message: `Domain "${registeredDomain}" closely resembles "${brandMatch.brand}"${brandMatch.contains ? " (contains brand name)" : ` (edit distance: ${brandMatch.distance})`}. Likely typosquatting or phishing.` });
  } else {
    indicators.push({ id: "brand", name: "Brand Impersonation", status: "safe", message: "No known brand typosquatting detected." });
  }

  const subParts = subdomain ? subdomain.split(".").filter(p => p && p !== "www") : [];
  if (subParts.length > 2) {
    indicators.push({ id: "sub", name: "Subdomain Depth", status: "risk", message: `${subParts.length} subdomain levels — common phishing pattern to stack brand names.` });
  } else if (subParts.length === 2) {
    indicators.push({ id: "sub", name: "Subdomain Depth", status: "caution", message: `Multiple subdomains (${subParts.join(".")}). Verify the root domain.` });
  } else {
    indicators.push({ id: "sub", name: "Subdomain Depth", status: "safe", message: subdomain ? `Standard: ${subdomain}` : "No subdomains." });
  }

  const nestedUrls = [];
  searchParamsList.forEach(({ key, value }) => {
    const redirectKeys = ["redirect", "redirect_url", "redirect_to", "url", "next", "goto", "link", "destination", "dest", "to", "return_to", "return", "continue", "rurl", "u"];
    if (/https?:\/\//i.test(value) || (redirectKeys.includes(key.toLowerCase()) && value.length > 4)) {
      nestedUrls.push({ key, value });
    }
  });
  if (nestedUrls.length > 1) {
    indicators.push({ id: "redirect", name: "Open Redirect Risk", status: "risk", message: `${nestedUrls.length} redirect parameters detected (${nestedUrls.map(n => n.key).join(", ")}). Can chain to malicious destinations.` });
  } else if (nestedUrls.length === 1) {
    indicators.push({ id: "redirect", name: "Redirect Parameter", status: "caution", message: `'${nestedUrls[0].key}' redirects to an external URL. Verify the destination.` });
  } else {
    indicators.push({ id: "redirect", name: "Redirect Parameters", status: "safe", message: "No redirect parameters detected." });
  }

  const urlLen = trimmed.length;
  if (urlLen > 600) {
    indicators.push({ id: "length", name: "URL Length", status: "risk", message: `Extremely long (${urlLen} chars) — can hide payloads or tracking.` });
  } else if (urlLen > 200) {
    indicators.push({ id: "length", name: "URL Length", status: "caution", message: `Long URL (${urlLen} chars) — may contain hidden tracking.` });
  } else {
    indicators.push({ id: "length", name: "URL Length", status: "safe", message: `Normal length (${urlLen} chars).` });
  }

  const obfuscated = searchParamsList.filter(p => isBase64Like(p.value)).map(p => p.key);
  if (obfuscated.length > 0) {
    indicators.push({ id: "obfuscation", name: "Encoded Parameters", status: "caution", message: `Base64-like tokens: ${obfuscated.join(", ")}. May hide session IDs or credentials.` });
  } else {
    indicators.push({ id: "obfuscation", name: "Parameter Encoding", status: "safe", message: "No obfuscated parameters." });
  }

  const tld = "." + hostname.split(".").pop().toLowerCase();
  if (HIGH_RISK_TLDS.includes(tld)) {
    indicators.push({ id: "tld", name: "High-Risk TLD", status: "risk", message: `The TLD "${tld}" is heavily abused for spam and phishing campaigns.` });
  } else {
    indicators.push({ id: "tld", name: "Domain Extension", status: "safe", message: `Standard TLD (${tld}).` });
  }

  const isShortener = URL_SHORTENERS.some(s => hostname.toLowerCase() === s || hostname.toLowerCase().endsWith("." + s));
  if (isShortener) {
    indicators.push({ id: "shortener", name: "URL Shortener", status: "caution", message: `This is a shortened URL (${hostname}). The real destination is hidden — proceed with caution.` });
  } else {
    indicators.push({ id: "shortener", name: "URL Shortener", status: "safe", message: "Direct link, not shortened." });
  }

  let score = 100;
  indicators.forEach(ind => {
    if (ind.status === "risk") score -= 20;
    else if (ind.status === "caution") score -= 6;
  });
  if (detectedTrackers.length > 0) score -= Math.min(15, detectedTrackers.length * 3);
  score = Math.max(0, score);

  let verdict, verdictDetails, riskLevel;
  if (score >= 80) {
    verdict = "Clean & Safe";
    verdictDetails = "This link uses secure transport, standard structure, and has minimal tracking.";
    riskLevel = "safe";
  } else if (score >= 40) {
    verdict = "Needs Attention";
    verdictDetails = "Issues detected — tracking scripts, unusual structure, or redirect chains.";
    riskLevel = "caution";
  } else {
    verdict = "High Risk";
    verdictDetails = "Critical safety issues found. Do not enter credentials or personal data.";
    riskLevel = "risk";
  }

  return {
    urlOriginal: trimmed, urlParsed: urlString, domain: registeredDomain,
    subdomain: subdomain || "None", path, host, protocol, hash: hash || "None",
    searchParamsList, queryParametersCount: searchParamsList.length,
    detectedTrackers, indicators, redirectChain, brandMatch,
    score, verdict, verdictDetails, riskLevel,
  };
}

function buildCleanUrl(result, enabledKeys) {
  if (!result) return "";
  try {
    const urlObj = new URL(result.urlParsed);
    const clean = new URLSearchParams();
    result.searchParamsList.forEach(p => {
      if (enabledKeys.has(p.key)) {
        const isTracker = result.detectedTrackers.some(t => t.key === p.key);
        if (!isTracker) clean.append(p.key, p.value);
      }
    });
    return urlObj.protocol + "//" + urlObj.host + urlObj.pathname +
      (clean.toString() ? "?" + clean.toString() : "") + urlObj.hash;
  } catch { return result.urlOriginal; }
}

// ─────────────────────────────── COMPONENTS ───────────────────────────────────

function ScoreRing({ score, riskLevel }) {
  const radius = 36, stroke = 6, norm = radius + stroke;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = riskLevel === "safe" ? "#10b981" : riskLevel === "caution" ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg viewBox={`0 0 ${norm * 2} ${norm * 2}`} className="w-full h-full -rotate-90">
        <circle cx={norm} cy={norm} r={radius} fill="none" stroke="#1e293b" strokeWidth={stroke} />
        <circle cx={norm} cy={norm} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{score}</span>
        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">/ 100</span>
      </div>
    </div>
  );
}

function RedirectChainVisual({ chains }) {
  if (!chains || chains.length === 0) return null;
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">{Icons.shuffle("w-3.5 h-3.5 text-slate-400")} Redirect Chain Decoder</h3>
      {chains.map((chain, ci) => (
        <div key={ci} className="mb-3 last:mb-0">
          <p className="text-[11px] text-slate-500 mb-2 font-semibold">Via parameter: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-amber-700">{chain.paramKey}</code></p>
          <div className="flex flex-col gap-0">
            {chain.chain.map((hop, hi) => (
              <div key={hi} className="flex items-start gap-2">
                <div className="flex flex-col items-center shrink-0 w-5 pt-1">
                  <div className={`w-3 h-3 rounded-full border-2 ${hi === chain.chain.length - 1 ? "bg-rose-500 border-rose-400" : "bg-amber-500 border-amber-400"}`} />
                  {hi < chain.chain.length - 1 && <div className="w-px h-6 bg-slate-300" />}
                </div>
                <div className={`flex-1 p-2 rounded-lg text-xs font-mono break-all ${hi === chain.chain.length - 1 ? "bg-rose-50 border border-rose-100 text-rose-800" : "bg-amber-50/50 border border-amber-100 text-amber-800"}`}>
                  <span className="text-[9px] uppercase tracking-wider font-bold font-sans text-slate-400 mr-1">
                    {hi === chain.chain.length - 1 ? "Final Target" : `Hop ${hi + 1}`}
                  </span>
                  <br />
                  {hop.url}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────── MAIN COMPONENT ───────────────────────────────

export default function LinkIntelligence() {
  const [urlInput, setUrlInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [hoveredPart, setHoveredPart] = useState(null);

  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkResults, setBulkResults] = useState(null);

  const [enabledParams, setEnabledParams] = useState(new Set());

  const [customRules, setCustomRules] = useState([]);
  const [newRule, setNewRule] = useState("");
  const [showCustomPanel, setShowCustomPanel] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("link-intel-custom-rules");
      if (saved) setCustomRules(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveCustomRules = (rules) => {
    setCustomRules(rules);
    try { localStorage.setItem("link-intel-custom-rules", JSON.stringify(rules)); } catch { /* ignore */ }
  };

  const cleanUrl = useMemo(() => buildCleanUrl(result, enabledParams), [result, enabledParams]);

  useEffect(() => {
    if (!cleanUrl) { setQrDataUrl(""); return; }
    QRCode.toDataURL(cleanUrl, { width: 200, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(setQrDataUrl).catch(() => setQrDataUrl(""));
  }, [cleanUrl]);

  const handleClear = () => {
    setUrlInput(""); setResult(null); setError(""); setCopyStatus("");
    setQrDataUrl(""); setEnabledParams(new Set()); setHoveredPart(null);
    setBulkText(""); setBulkResults(null);
  };

  const handlePreset = (preset) => {
    if (preset.bulk) {
      setBulkMode(true); setBulkText(preset.url);
      setResult(null); setUrlInput(""); setBulkResults(null);
    } else {
      setBulkMode(false); setUrlInput(preset.url);
      setResult(null); setBulkResults(null); setBulkText("");
    }
    setError(""); setCopyStatus(""); setHoveredPart(null);
  };

  const handleAnalyze = () => {
    if (bulkMode) { handleBulkAnalyze(); return; }
    const trimmed = urlInput.trim();
    if (!trimmed) { setError("Enter a URL to analyze."); return; }
    setLoading(true); setError(""); setCopyStatus("");
    setTimeout(() => {
      const r = analyzeUrl(trimmed, customRules);
      if (r && r.error) { setError(r.error); setResult(null); }
      else {
        setResult(r);
        setEnabledParams(new Set(r.searchParamsList.map(p => p.key)));
      }
      setLoading(false);
    }, 300);
  };

  const handleBulkAnalyze = () => {
    const urls = extractUrlsFromText(bulkText);
    if (urls.length === 0) { setError("No URLs found in the text."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      const results = urls.map(u => {
        const r = analyzeUrl(u, customRules);
        if (!r || r.error) return { url: u, error: true, cleanUrl: u, trackersRemoved: 0, score: 0 };
        const allKeys = new Set(r.searchParamsList.map(p => p.key));
        const clean = buildCleanUrl(r, allKeys);
        return { url: u, cleanUrl: clean, trackersRemoved: r.detectedTrackers.length, score: r.score, riskLevel: r.riskLevel };
      });
      setBulkResults(results);
      setLoading(false);
    }, 300);
  };

  const toggleParam = (key) => {
    setEnabledParams(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus(""), 2000);
  };

  const buildReportText = () => {
    if (!result) return "";
    const safety = result.indicators.map(i => `  [${i.status.toUpperCase()}] ${i.name}: ${i.message}`).join("\n");
    const trackers = result.detectedTrackers.length
      ? result.detectedTrackers.map(t => `  • ${t.key}: ${t.description}`).join("\n") : "  None";
    return `LINK INTELLIGENCE REPORT\n${"═".repeat(44)}\nOriginal: ${result.urlOriginal}\nCleaned:  ${cleanUrl}\nScore:    ${result.score}/100 — ${result.verdict}\n\nDOMAIN: ${result.host} (${result.domain})\nSubdomain: ${result.subdomain} | Path: ${result.path} | Params: ${result.queryParametersCount}\n\nSAFETY CHECKS:\n${safety}\n\nTRACKERS:\n${trackers}\n${"═".repeat(44)}`;
  };

  const addCustomRule = () => {
    const key = newRule.trim().toLowerCase();
    if (!key || customRules.includes(key)) return;
    saveCustomRules([...customRules, key]);
    setNewRule("");
  };

  const urlParts = useMemo(() => {
    if (!result) return [];
    const parts = [];
    parts.push({ id: "protocol", label: "Protocol", text: result.protocol + "//", color: "teal" });
    if (result.subdomain && result.subdomain !== "None") {
      parts.push({ id: "subdomain", label: "Subdomain", text: result.subdomain + ".", color: "orange" });
    }
    parts.push({ id: "domain", label: "Domain", text: result.domain, color: "sky" });
    if (result.path && result.path !== "/") {
      parts.push({ id: "path", label: "Path", text: result.path, color: "violet" });
    }
    if (result.queryParametersCount > 0) {
      const paramStr = "?" + result.searchParamsList.map(p => `${p.key}=${p.value}`).join("&");
      parts.push({ id: "params", label: "Parameters", text: paramStr, color: "amber" });
    }
    if (result.hash && result.hash !== "None") {
      parts.push({ id: "hash", label: "Fragment", text: result.hash, color: "rose" });
    }
    return parts;
  }, [result]);

  const colorMap = {
    teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-800", highlight: "bg-teal-100" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", highlight: "bg-orange-100" },
    sky: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-800", highlight: "bg-sky-100" },
    violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-800", highlight: "bg-violet-100" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", highlight: "bg-amber-100" },
    rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-800", highlight: "bg-rose-100" },
  };

  // Copy button render helper
  const CopyBtn = ({ type, onClick }) => (
    <button onClick={onClick} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition shrink-0 cursor-pointer" title="Copy">
      {copyStatus === type ? Icons.check("w-4 h-4 text-emerald-500") : Icons.copy("w-4 h-4")}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10 sm:py-14 font-sans">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-amber-200/15 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-sky-200/15 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-violet-200/10 blur-3xl" />
          </div>

          <div className="relative px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

            {/* ────── Header ────── */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600 flex items-center gap-1.5">
                  {Icons.shield("w-3.5 h-3.5")} Privacy & Security
                </p>
                <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Link Intelligence</h1>
                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base max-w-xl">
                  Deconstruct URLs, expose trackers, detect phishing & impersonation, decode redirect chains, and generate safe shareable links. 100% client-side.
                </p>
              </div>
              <div className="flex gap-2 items-center shrink-0">
                <button onClick={() => { setBulkMode(false); setBulkResults(null); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${!bulkMode ? "bg-amber-500 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {Icons.link("w-3.5 h-3.5")} Single Link
                </button>
                <button onClick={() => { setBulkMode(true); setResult(null); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${bulkMode ? "bg-amber-500 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {Icons.fileText("w-3.5 h-3.5")} Bulk Cleaner
                </button>
                <button onClick={() => setShowCustomPanel(!showCustomPanel)} className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${showCustomPanel ? "bg-violet-500 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {Icons.settings("w-3.5 h-3.5")} Rules {customRules.length > 0 && <span className="ml-0.5 bg-white/20 px-1.5 rounded-full text-[10px]">{customRules.length}</span>}
                </button>
              </div>
            </div>

            {/* ────── Custom Rules Panel ────── */}
            {showCustomPanel && (
              <div className="mb-6 rounded-[1.5rem] border border-violet-200 bg-violet-50/30 p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-3 flex items-center gap-1.5">{Icons.settings("w-3.5 h-3.5")} Custom Stripping Rules</h3>
                <p className="text-xs text-slate-500 mb-3">Add parameter names you always want stripped from URLs. Saved locally in your browser.</p>
                <div className="flex gap-2 mb-3">
                  <input value={newRule} onChange={e => setNewRule(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustomRule()}
                    placeholder="e.g. session_id" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:ring-2 focus:ring-violet-400" />
                  <button onClick={addCustomRule} className="px-4 py-2 bg-violet-500 text-white rounded-xl text-xs font-bold hover:bg-violet-600 transition">Add</button>
                </div>
                {customRules.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {customRules.map((r, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-white border border-violet-200 rounded-full px-2.5 py-1 text-xs font-mono text-violet-800">
                        {r}
                        <button onClick={() => saveCustomRules(customRules.filter((_, j) => j !== i))} className="text-violet-400 hover:text-rose-500 text-sm leading-none ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No custom rules yet.</p>
                )}
              </div>
            )}

            {/* ────── Presets ────── */}
            <div className="flex flex-col gap-2 mb-6">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Samples:</span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p, i) => (
                  <button key={i} onClick={() => handlePreset(p)} type="button"
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-amber-500 hover:bg-amber-50/50 font-medium transition cursor-pointer flex items-center gap-1.5">
                    <PresetIcon icon={p.icon} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ────── Input ────── */}
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm mb-6">
              {bulkMode ? (
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">{Icons.fileText("w-4 h-4 text-slate-400")} Paste text containing URLs</label>
                  <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={5}
                    placeholder="Paste emails, chat logs, or any text with URLs. We'll find and clean them all."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500 resize-none" />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">{Icons.search("w-4 h-4 text-slate-400")} Paste Link to Scan</label>
                  <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                    placeholder="https://example.com/page?utm_source=newsletter&id=123"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500" />
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button onClick={handleAnalyze} disabled={loading || (bulkMode ? !bulkText.trim() : !urlInput.trim())}
                  className={`flex-1 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 transition shadow flex items-center justify-center gap-2 cursor-pointer ${(loading || (bulkMode ? !bulkText.trim() : !urlInput.trim())) ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {loading ? (
                    <><svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      {bulkMode ? "Extracting & Cleaning..." : "Analyzing..."}
                    </>
                  ) : (
                    <>{bulkMode ? Icons.broom("w-4 h-4") : Icons.eye("w-4 h-4")} {bulkMode ? "Extract & Clean URLs" : "Analyze Link"}</>
                  )}
                </button>
                <button onClick={handleClear} className="rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold px-6 py-3 transition">Clear</button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex gap-2 items-center mb-6">
                {Icons.alertTriangle("w-4 h-4 shrink-0 text-rose-500")}
                <span>{error}</span>
              </div>
            )}

            {/* ═══════════════════ BULK RESULTS ═══════════════════ */}
            {bulkMode && bulkResults && (
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">{Icons.broom("w-3.5 h-3.5")} Bulk Results — {bulkResults.length} URL(s)</h3>
                  <button onClick={() => copyToClipboard(bulkResults.map(r => r.cleanUrl).join("\n"), "bulk")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5">
                    {copyStatus === "bulk" ? <>{Icons.check("w-3.5 h-3.5")} Copied!</> : <>{Icons.copy("w-3.5 h-3.5")} Copy All Clean URLs</>}
                  </button>
                </div>
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
                  {bulkResults.map((r, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Original</p>
                          <p className="text-xs font-mono text-slate-500 break-all truncate">{r.url}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${r.riskLevel === 'safe' ? 'bg-emerald-100 text-emerald-700' : r.riskLevel === 'caution' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                          {r.score}/100
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-1">
                            Cleaned {r.trackersRemoved > 0 && `(${r.trackersRemoved} tracker${r.trackersRemoved > 1 ? "s" : ""} removed)`}
                          </p>
                          <p className="text-xs font-mono text-emerald-800 break-all">{r.cleanUrl}</p>
                        </div>
                        <CopyBtn type={`bulk-${i}`} onClick={() => copyToClipboard(r.cleanUrl, `bulk-${i}`)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════ SINGLE RESULT ═══════════════════ */}
            {!bulkMode && result && (
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

                {/* ─── LEFT COLUMN ─── */}
                <div className="flex flex-col gap-5">

                  {/* Interactive URL Exploder */}
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">{Icons.eye("w-3.5 h-3.5 text-slate-400")} Interactive URL Explorer</h3>
                    <p className="text-[10px] text-slate-400 mb-3">Hover over parts to highlight them in the raw URL below.</p>

                    <div className="flex flex-wrap gap-1 items-stretch mb-4">
                      {urlParts.map(part => {
                        const c = colorMap[part.color];
                        const isHovered = hoveredPart === part.id;
                        return (
                          <div key={part.id}
                            onMouseEnter={() => setHoveredPart(part.id)}
                            onMouseLeave={() => setHoveredPart(null)}
                            className={`border p-2 rounded-lg flex flex-col justify-between cursor-pointer transition-all duration-150 ${c.border} ${isHovered ? c.highlight + " scale-105 shadow-md" : c.bg}`}>
                            <span className={`text-[10px] font-semibold uppercase block ${c.text} opacity-70`}>{part.label}</span>
                            <span className={`text-xs font-mono font-bold mt-1 break-all ${c.text}`}>{part.text.length > 60 ? part.text.slice(0, 60) + "…" : part.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-slate-950 rounded-xl p-3 overflow-x-auto">
                      <code className="text-xs leading-relaxed">
                        {urlParts.map(part => {
                          const c = colorMap[part.color];
                          const isHovered = hoveredPart === part.id;
                          return (
                            <span key={part.id}
                              onMouseEnter={() => setHoveredPart(part.id)}
                              onMouseLeave={() => setHoveredPart(null)}
                              className={`transition-all duration-150 rounded px-0.5 cursor-pointer break-all ${isHovered ? c.highlight + " " + c.text + " font-bold" : "text-slate-300"}`}>
                              {part.text}
                            </span>
                          );
                        })}
                      </code>
                    </div>
                  </div>

                  {/* Domain Info */}
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">{Icons.globe("w-3.5 h-3.5 text-slate-400")} Domain Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Host Domain", value: result.domain, mono: true },
                        { label: "Subdomain", value: result.subdomain, mono: true, warn: result.subdomain !== "None" },
                        { label: "Path", value: result.path, mono: true, span: true },
                        { label: "Parameters", value: `${result.queryParametersCount} param(s)`, bold: true },
                        { label: "Protocol", value: result.protocol, mono: true },
                      ].map((item, i) => (
                        <div key={i} className={`bg-slate-50 p-3 rounded-xl border border-slate-100 ${item.span ? "col-span-2" : ""}`}>
                          <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">{item.label}</span>
                          <span className={`text-xs mt-1 block break-all ${item.mono ? "font-mono" : ""} ${item.bold ? "font-bold text-slate-800" : ""} ${item.warn ? "text-amber-700 font-semibold" : "text-slate-700"}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Parameter Table */}
                  {result.searchParamsList.length > 0 && (
                    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">{Icons.settings("w-3.5 h-3.5 text-slate-400")} Parameter Workshop</h3>
                      <p className="text-[10px] text-slate-400 mb-3">Toggle parameters on/off to customize your clean URL in real-time.</p>
                      <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 sticky top-0">
                              <th className="p-2 w-10 text-center">{Icons.check("w-3 h-3 text-slate-400 mx-auto")}</th>
                              <th className="p-2 font-semibold text-slate-500">Key</th>
                              <th className="p-2 font-semibold text-slate-500">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.searchParamsList.map((param, idx) => {
                              const isTracker = result.detectedTrackers.some(t => t.key === param.key);
                              const isEnabled = enabledParams.has(param.key);
                              return (
                                <tr key={idx} className={`border-b border-slate-100 transition ${isTracker ? "bg-rose-50/30" : "hover:bg-slate-50/50"}`}>
                                  <td className="p-2 text-center">
                                    <input type="checkbox" checked={isEnabled} onChange={() => toggleParam(param.key)}
                                      className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer accent-amber-500" />
                                  </td>
                                  <td className="p-2 font-mono font-semibold break-all">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={!isEnabled ? "line-through text-slate-300" : ""}>{param.key}</span>
                                      {isTracker && <span className="bg-rose-100 text-rose-600 border border-rose-200 text-[9px] px-1.5 rounded-full font-sans uppercase tracking-wide shrink-0">tracker</span>}
                                    </div>
                                  </td>
                                  <td className={`p-2 font-mono break-all select-all ${!isEnabled ? "line-through text-slate-300" : "text-slate-500"}`}>{param.value}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <RedirectChainVisual chains={result.redirectChain} />
                </div>

                {/* ─── RIGHT COLUMN ─── */}
                <div className="flex flex-col gap-5">

                  {/* Verdict Card */}
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          {Icons.shield("w-3 h-3")} Security Score
                        </span>
                        <h2 className="mt-3 text-xl font-bold">{result.verdict}</h2>
                        <p className="mt-1.5 text-xs leading-5 text-slate-400">{result.verdictDetails}</p>
                      </div>
                      <ScoreRing score={result.score} riskLevel={result.riskLevel} />
                    </div>

                    {result.brandMatch && (
                      <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex gap-2.5 items-start">
                        {Icons.zap("w-4 h-4 shrink-0 text-rose-300")}
                        <div>
                          <span className="font-bold uppercase text-[10px] tracking-wider block text-rose-300">Brand Impersonation Alert</span>
                          <span className="mt-1 block">Domain <strong className="text-white">{result.domain}</strong> closely resembles <strong className="text-white">{result.brandMatch.brand}</strong>. This is likely a phishing or typosquatting attempt.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Safety Indicators */}
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">{Icons.shieldCheck("w-3.5 h-3.5 text-slate-400")} Safety Indicators</h3>
                    <div className="flex flex-col gap-2">
                      {result.indicators.map((ind, i) => {
                        const bg = ind.status === "safe" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : ind.status === "caution" ? "bg-amber-50 border-amber-100 text-amber-800" : "bg-rose-50 border-rose-100 text-rose-900";
                        return (
                          <div key={i} className={`p-3 rounded-xl border text-xs flex gap-2.5 items-start ${bg}`}>
                            <SafetyIcon id={ind.id} status={ind.status} />
                            <div className="min-w-0">
                              <span className="font-bold block">{ind.name}</span>
                              <span className="opacity-80 break-words">{ind.message}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trackers */}
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">{Icons.eye("w-3.5 h-3.5 text-slate-400")} Tracking & Marketing Tags</h3>
                    {result.detectedTrackers.length === 0 ? (
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center text-xs text-emerald-800 font-semibold flex items-center justify-center gap-2">
                        {Icons.shieldCheck("w-4 h-4")} No trackers detected!
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        <span className="text-[10px] text-slate-500 font-medium">{result.detectedTrackers.length} tracker(s) found:</span>
                        {result.detectedTrackers.map((t, i) => (
                          <div key={i} className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs">
                            <div className="flex justify-between items-center">
                              <code className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">{t.key}</code>
                              <span className="text-[9px] font-bold text-amber-600 uppercase">{t.type}</span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-1">{t.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* URL Cleaner + QR */}
                  <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/20 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      {Icons.broom("w-5 h-5 text-emerald-700")}
                      <h3 className="font-bold text-emerald-900 text-base">Clean URL Output</h3>
                    </div>

                    <div className="mb-3">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Cleaned URL</span>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 break-all max-h-20 overflow-y-auto">{cleanUrl}</div>
                        <CopyBtn type="clean" onClick={() => copyToClipboard(cleanUrl, "clean")} />
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Markdown Link</span>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 break-all select-all">{`[Link](${cleanUrl})`}</div>
                        <CopyBtn type="md" onClick={() => copyToClipboard(`[Link](${cleanUrl})`, "md")} />
                      </div>
                    </div>

                    {qrDataUrl && (
                      <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-200 mb-4">
                        <img src={qrDataUrl} alt="QR code for clean URL" className="w-24 h-24 rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700">Scan Clean URL</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">QR code auto-generated from your cleaned link. No trackers included.</p>
                          <a href={qrDataUrl} download="clean-url-qr.png" className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition">
                            {Icons.download("w-3 h-3")} Download QR
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-emerald-100 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">Export full findings</span>
                      <button onClick={() => copyToClipboard(buildReportText(), "report")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5">
                        {copyStatus === "report" ? <>{Icons.check("w-3.5 h-3.5")} Copied!</> : <>{Icons.copy("w-3.5 h-3.5")} Copy Full Report</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ────── Empty State ────── */}
            {!result && !bulkResults && (
              <div className="min-h-[300px] rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  {Icons.search("w-7 h-7")}
                </div>
                <div className="max-w-md">
                  <h3 className="font-bold text-slate-700 text-lg">Paste a URL to get started</h3>
                  <p className="text-sm text-slate-500 mt-1">Use Single Link mode for deep analysis with interactive toggles, or switch to Bulk Cleaner to strip trackers from multiple URLs at once.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

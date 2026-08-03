export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { appendFile, mkdir, readFile } from "fs/promises";
import path from "path";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const DATA_DIR = path.join(process.cwd(), "data");
const SNAPSHOT_FILE = path.join(DATA_DIR, "social_analyzer_snapshots.jsonl");

// ─── Formatting helpers ───
function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function fmt(n) {
  if (n === undefined || n === null) return "N/A";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function parseCount(raw) {
  if (raw === undefined || raw === null || raw === "") return 0;
  if (typeof raw === "number") return Math.round(raw);
  const s = String(raw).replace(/,/g, "").trim();
  const m = s.match(/^([\d.]+)\s*([KkMmBb]?)/);
  if (!m) return 0;
  let n = parseFloat(m[1]);
  if (isNaN(n)) return 0;
  const u = m[2].toUpperCase();
  if (u === "B") return Math.round(n * 1_000_000_000);
  if (u === "M") return Math.round(n * 1_000_000);
  if (u === "K") return Math.round(n * 1_000);
  return Math.round(n);
}

function sanitize(input) {
  let v = (input ?? "").trim();
  if (v.startsWith("@")) v = v.slice(1);
  v = v.replace(/^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|youtube\.com|twitter\.com|x\.com|tiktok\.com|linkedin\.com\/in|linkedin\.com\/company)\/?/i, "");
  v = v.replace(/\/+$/, "");
  return v;
}

// ─── Layer 4: Snapshot store + Cache ───
async function readSnapshots() {
  try {
    const raw = await readFile(SNAPSHOT_FILE, "utf8");
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line) => {
        try {
          return [JSON.parse(line)];
        } catch {
          return [];
        }
      });
  } catch {
    return [];
  }
}

async function writeSnapshot(entry) {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(SNAPSHOT_FILE, `${JSON.stringify(entry)}\n`, "utf8");
  } catch (error) {
    console.error("Failed to write snapshot:", error);
  }
}

async function checkCache(username, platform) {
  const snapshots = await readSnapshots();
  const lowerUser = username.toLowerCase();
  const now = Date.now();
  // Find most recent live fetch
  const cacheEntry = snapshots
    .filter((s) => s.username === lowerUser && s.platform === platform && s.dataSource === "live")
    .sort((a, b) => new Date(b.fetchedAt) - new Date(a.fetchedAt))[0];

  if (cacheEntry) {
    const ageMs = now - new Date(cacheEntry.fetchedAt).getTime();
    if (ageMs < 24 * 60 * 60 * 1000) {
      return cacheEntry;
    }
  }
  return null;
}

async function getPreviousSnapshot(username, platform) {
  const snapshots = await readSnapshots();
  const lowerUser = username.toLowerCase();
  const previousEntries = snapshots
    .filter((s) => s.username === lowerUser && s.platform === platform)
    .sort((a, b) => new Date(b.fetchedAt) - new Date(a.fetchedAt));
  return previousEntries[0] || null;
}

// ─── Layer 1: Data Provider (server-side) ───
async function fetchPlatformStats(platform, username, token) {
  if (!token) {
    throw new Error(`Live fetch unavailable — APIFY_API_TOKEN is not configured. Please use Manual Mode.`);
  }

  let actorName = "";
  let runInput = {};

  if (platform === "instagram") {
    actorName = "apify~instagram-profile-scraper";
    runInput = {
      usernames: [username],
      maxPosts: 12
    };
  } else if (platform === "youtube") {
    actorName = "apify~youtube-scraper";
    runInput = {
      startUrls: [{ url: `https://www.youtube.com/@${username}` }],
      maxResults: 12
    };
  } else if (platform === "tiktok") {
    actorName = "clockworks~tiktok-scraper";
    runInput = {
      profiles: [username],
      resultsPerPage: 12
    };
  } else if (platform === "x") {
    actorName = "apidojo~tweet-scraper";
    runInput = {
      twitterHandles: [username],
      maxItems: 12
    };
  } else if (platform === "linkedin") {
    actorName = "various~linkedin-profile-scraper";
    runInput = {
      urls: [`https://www.linkedin.com/in/${username}`]
    };
  } else {
    throw new Error(`Platform ${platform} is not supported for live fetch.`);
  }

  let runRes;
  try {
    runRes = await fetch(`https://api.apify.com/v2/acts/${actorName}/runs?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(runInput)
    });
  } catch {
    throw new Error(`Live fetch failed: Connection to Apify failed. Check your internet connection.`);
  }

  if (!runRes.ok) {
    throw new Error(`Live fetch failed: Apify API rate limit exceeded or invalid token. Please use Manual Mode.`);
  }

  const runData = await runRes.json();
  const runId = runData?.data?.id;
  const datasetId = runData?.data?.defaultDatasetId;
  if (!runId || !datasetId) {
    throw new Error(`Live fetch failed: Failed to start scraper run. Please use Manual Mode.`);
  }

  let status = "RUNNING";
  const startTime = Date.now();
  const timeout = 90000;
  while (status === "RUNNING" || status === "READY") {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Live fetch failed: Scraping operation timed out. Please use Manual Mode.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    let statusRes;
    try {
      statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
    } catch {
      throw new Error(`Live fetch failed: Polling connection failed. Please use Manual Mode.`);
    }

    if (!statusRes.ok) {
      throw new Error(`Live fetch failed: Error checking status. Please use Manual Mode.`);
    }

    const statusData = await statusRes.json();
    status = statusData?.status || statusData?.data?.status;
    if (status === "SUCCEEDED") {
      break;
    }
    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Live fetch failed: Apify job ended with status ${status}. Please use Manual Mode.`);
    }
  }

  let itemsRes;
  try {
    itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);
  } catch {
    throw new Error(`Live fetch failed: Error loading scraped items. Please use Manual Mode.`);
  }

  if (!itemsRes.ok) {
    throw new Error(`Live fetch failed: Apify dataset read error. Please use Manual Mode.`);
  }

  const items = await itemsRes.json();
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(path.join(DATA_DIR, `debug_apify_${platform}_items.json`), JSON.stringify(items, null, 2), "utf8");
  } catch (e) {}

  if (!items || items.length === 0) {
    throw new Error(`${platform} profile not found, is private, or has no posts. Please use Manual Mode.`);
  }

  let followers = null;
  let following = null;
  let postsCount = null;
  let isVerified = false;
  let bio = "";
  let recentPosts = [];

  if (platform === "instagram") {
    const profile = items[0];
    if (!profile || profile.followersCount === undefined) {
      throw new Error(`Instagram profile not found, is private, or has no posts. Please use Manual Mode.`);
    }
    followers = profile.followersCount ?? null;
    following = profile.followsCount ?? null;
    postsCount = profile.postsCount ?? null;
    isVerified = !!profile.isVerified;
    bio = profile.biography ?? "";

    recentPosts = (profile.latestPosts || []).map(p => ({
      likes: p.likesCount ?? 0,
      comments: p.commentsCount ?? 0,
      views: p.videoViewCount ?? p.playsCount ?? p.likesCount ?? null,
      postedAt: p.timestamp ?? null
    })).slice(0, 12);
  } else if (platform === "youtube") {
    const first = items[0];
    if (!first) {
      throw new Error(`YouTube profile not found or has no videos. Please use Manual Mode.`);
    }
    followers = first.numberOfSubscribers ?? first.subscribers ?? first.subscriberCount ?? first.channelSubscribers ?? null;
    if (followers === null && first.channelInfo) {
      followers = first.channelInfo.subscribers ?? first.channelInfo.subscriberCount ?? null;
    }
    if (followers === null) {
      const withSubs = items.find(i => i.numberOfSubscribers != null || i.subscriberCount != null);
      if (withSubs) {
        followers = withSubs.numberOfSubscribers ?? withSubs.subscriberCount;
      }
    }
    following = 0;
    postsCount = first.channelVideosCount ?? first.videosCount ?? items.length;
    isVerified = !!(first.verified ?? first.channelInfo?.verified);
    bio = first.channelDescription ?? first.description ?? first.channelInfo?.description ?? "";

    recentPosts = items.map(p => ({
      likes: p.likes ?? p.likeCount ?? 0,
      comments: p.commentsCount ?? p.commentCount ?? 0,
      views: p.viewCount ?? p.views ?? p.likes ?? null,
      postedAt: p.publishDate ?? p.date ?? null
    })).slice(0, 12);
  } else if (platform === "tiktok") {
    const first = items[0];
    if (!first) {
      throw new Error(`TikTok profile not found or has no videos. Please use Manual Mode.`);
    }
    followers = first.authorStats?.followerCount ?? first.author?.fans ?? first.fansCount ?? null;
    following = first.authorStats?.followingCount ?? first.author?.following ?? first.followingCount ?? null;
    postsCount = first.authorStats?.videoCount ?? first.author?.videoCount ?? items.length;
    isVerified = !!(first.author?.verified ?? first.authorStats?.verified);
    bio = first.author?.signature ?? first.authorStats?.signature ?? "";

    recentPosts = items.map(p => ({
      likes: p.diggCount ?? p.likes ?? p.likesCount ?? 0,
      comments: p.commentCount ?? p.comments ?? p.commentsCount ?? 0,
      views: p.playCount ?? p.views ?? p.viewCount ?? null,
      postedAt: p.createTimeISO ?? p.date ?? null
    })).slice(0, 12);
  } else if (platform === "x") {
    const first = items[0];
    if (!first) {
      throw new Error(`X / Twitter profile not found or has no posts. Please use Manual Mode.`);
    }
    const user = first.user;
    if (user) {
      followers = user.followersCount ?? user.followers_count ?? user.followers ?? null;
      following = user.friendsCount ?? user.friends_count ?? user.friends ?? null;
      postsCount = user.statusesCount ?? user.statuses_count ?? null;
      isVerified = !!(user.isBlueVerified ?? user.verified);
      bio = user.description ?? "";
    }
    recentPosts = items.map(p => ({
      likes: p.likeCount ?? p.favoriteCount ?? 0,
      comments: p.replyCount ?? 0,
      views: p.viewCount ?? p.likes ?? null,
      postedAt: p.createdAt ?? null
    })).slice(0, 12);
  } else if (platform === "linkedin") {
    const first = items[0];
    if (!first) {
      throw new Error(`LinkedIn profile not found. Please use Manual Mode.`);
    }
    followers = first.connectionsCount ?? first.connections ?? first.followersCount ?? null;
    following = first.followingCount ?? null;
    postsCount = first.postsCount ?? 0;
    isVerified = !!first.verified;
    bio = first.about ?? first.summary ?? first.headline ?? "";

    recentPosts = (first.posts || []).map(p => ({
      likes: p.likes ?? p.reactions ?? 0,
      comments: p.comments ?? 0,
      views: p.views ?? null,
      postedAt: p.postedAt ?? null
    })).slice(0, 12);
  }

  if (followers === null) {
    throw new Error(`${platform} profile not found, is private, or has no public details. Please use Manual Mode.`);
  }

  return {
    username,
    followers,
    following: following ?? 0,
    postsCount: postsCount ?? 0,
    isVerified,
    bio,
    recentPosts
  };
}

// ─── Layer 2: Deterministic Metrics Engine ───
function getHealthyBand(followers) {
  if (followers < 10000) return { min: 4.0, max: 8.0 };
  if (followers < 100000) return { min: 2.5, max: 5.0 };
  if (followers < 1000000) return { min: 1.5, max: 3.0 };
  if (followers < 10000000) return { min: 1.0, max: 2.0 };
  return { min: 0.5, max: 1.5 };
}

function getERLabel(erVal, followers) {
  if (erVal === null || erVal === undefined) return "N/A";
  const { min, max } = getHealthyBand(followers);
  if (erVal > max) return "Excellent";
  if (erVal >= min) return "Healthy";
  if (erVal >= min * 0.6) return "Average";
  return "Low for this tier";
}

function calculateEngagementRate(followers, recentPosts) {
  if (!followers || followers <= 0 || !recentPosts || recentPosts.length === 0) {
    return null;
  }
  const totalLikes = recentPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = recentPosts.reduce((sum, p) => sum + (p.comments || 0), 0);
  const avgLikes = totalLikes / recentPosts.length;
  const avgComments = totalComments / recentPosts.length;
  return ((avgLikes + avgComments) / followers) * 100;
}

function calculateAuthenticityScore(stats) {
  const { followers, following, postsCount, isVerified, bio, recentPosts, hasProfilePic } = stats;
  let score = 0;

  if (isVerified) {
    score += 10;
  }

  const hasBio = bio && bio.trim().length > 0;
  const hasPic = hasProfilePic !== false;
  if (hasBio && hasPic) {
    score += 10;
  }

  const ratio = following > 0 ? (followers / following) : 0;
  if (ratio > 2 || followers > 1000000) {
    score += 10;
  }

  const erVal = calculateEngagementRate(followers, recentPosts);
  const erLabel = getERLabel(erVal, followers);
  if (erLabel === "Healthy" || erLabel === "Excellent") {
    score += 20;
  }

  let isConsistent = false;
  if (recentPosts && recentPosts.length >= 4) {
    const times = recentPosts
      .map(p => p.postedAt ? new Date(p.postedAt).getTime() : null)
      .filter(Boolean)
      .sort((a, b) => a - b);
    if (times.length >= 3) {
      const gaps = [];
      for (let i = 1; i < times.length; i++) {
        gaps.push((times[i] - times[i - 1]) / (1000 * 60 * 60 * 24));
      }
      const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
      const variance = gaps.reduce((sum, g) => sum + Math.pow(g - avgGap, 2), 0) / gaps.length;
      const stdDev = Math.sqrt(variance);
      if (stdDev < 7 || avgGap < 3) {
        isConsistent = true;
      }
    }
  } else if (postsCount > 10) {
    isConsistent = true;
  }
  if (isConsistent) {
    score += 15;
  }

  if (postsCount > 12) {
    score += 10;
  }

  if (postsCount === 0) {
    score -= 30;
  }
  if (followers > 0 && (!bio || bio.trim().length === 0) && postsCount === 0) {
    score -= 20;
  }

  return clamp(score);
}

function getVerdict(score) {
  if (score >= 80) return "Looks Authentic";
  if (score >= 60) return "Mostly Authentic";
  if (score >= 40) return "Mixed Signals";
  return "High Risk";
}

function generateDeterministicParts(platform, username, stats, authenticityScore, erVal, erLabel, growthVelocity, niche) {
  const { followers, following, postsCount, isVerified, bio } = stats;
  const verdict = getVerdict(authenticityScore);
  const score = authenticityScore;

  let aqScore = 50;
  const aqSignals = [];
  if (followers > 0 && following > 0) {
    const ratio = followers / following;
    if (ratio > 5) {
      aqScore += 20;
      aqSignals.push(`Excellent follower-to-following ratio of ${ratio.toFixed(1)}x indicates organic growth.`);
    } else if (ratio < 0.5) {
      aqScore -= 20;
      aqSignals.push("Account follows significantly more profiles than follow it, suggesting follow/unfollow tactics.");
    } else {
      aqScore += 5;
      aqSignals.push("Balanced ratio of followers to following.");
    }
  }
  if (isVerified) {
    aqScore += 20;
    aqSignals.push("Profile verified status adds high trust credibility.");
  }
  if (bio && bio.length > 0) {
    aqScore += 10;
    aqSignals.push("Complete profile biography indicates active maintenance.");
  }
  aqScore = clamp(aqScore);
  if (aqSignals.length === 0) aqSignals.push("Audience signals are stable.");

  let conScore = 50;
  const conSignals = [];
  if (postsCount === 0) {
    conScore = 10;
    conSignals.push("No posts found. Publishing activity is currently inactive.");
  } else if (postsCount > 100) {
    conScore += 30;
    conSignals.push(`Large content archive of ${postsCount} posts shows long-term creator commitment.`);
  } else {
    conScore += 15;
    conSignals.push(`Archive contains ${postsCount} published posts.`);
  }
  if (stats.recentPosts && stats.recentPosts.length >= 4) {
    conSignals.push("Recent posting timeline shows regular activity.");
  }
  conScore = clamp(conScore);
  if (conSignals.length === 0) conSignals.push("Posting consistency is normal.");

  let grScore = 50;
  const grSignals = [];
  if (followers >= 1000000) {
    grScore += 30;
    grSignals.push(`Mega-scale footprint of ${fmt(followers)} followers establishes massive organic recommendation weight.`);
  } else if (followers >= 100000) {
    grScore += 20;
    grSignals.push(`Significant audience size of ${fmt(followers)} supports compound viral distribution.`);
  } else if (followers >= 10000) {
    grScore += 10;
    grSignals.push("Solid foundation of mid-tier followers.");
  } else {
    grSignals.push("Early-stage community footprint.");
  }
  if (growthVelocity && !growthVelocity.includes("N/A")) {
    grSignals.push(`Historical snapshot change: ${growthVelocity}`);
  }
  grScore = clamp(grScore);
  if (grSignals.length === 0) grSignals.push("Audience scaling factors are active.");

  const sections = {
    audienceQuality: { score: aqScore, signals: aqSignals },
    consistency: { score: conScore, signals: conSignals },
    growth: { score: grScore, signals: grSignals }
  };

  const swot = {
    strengths: [
      isVerified ? "Verified checkmark confirms profile authenticity." : "Active profile configuration setup.",
      followers > 1000000 ? "Strong global audience reach potential." : "Targeted audience segment.",
      erLabel === "Excellent" || erLabel === "Healthy" ? "Stronger user-engagement rate than average for this tier." : "Active audience core exists."
    ],
    weaknesses: [
      postsCount < 12 ? "Low initial post library limit." : "Posting gaps require narrow scheduling.",
      erLabel === "Low for this tier" ? "Below average engagement rate indicates passive audience." : "Requires higher interactive focus."
    ],
    opportunities: [
      "Cross-promote content across trending platforms.",
      "Incorporate interactive Q&A structures in bio links.",
      "Explore partnerships with brand sponsors matching the niche."
    ],
    threats: [
      "Algorithm updates shifting feed recommendations.",
      "Plateauing reach due to change in user attention spans."
    ]
  };

  const nicheName = niche || "Other / General";
  const contentStrategy = {
    niche: nicheName,
    formatRecommendations: [
      platform === "instagram" ? "High-definition Reels (60%)" : "Short-form video formats (60%)",
      platform === "instagram" ? "Interactive Carousel sliders (30%)" : "Structured community updates (30%)",
      "Story updates with links (10%)"
    ],
    contentPillars: [
      `Behind-the-scenes processes in ${nicheName}`,
      `Educational checklists and micro-tips for ${nicheName}`,
      `User feedback sessions and FAQs`
    ],
    engagementTips: [
      "Include a direct question hook within first 3 seconds.",
      "Engage with comments immediately during the first hour of posting."
    ]
  };

  let streams = [];
  let scalingTips = [];
  if (followers >= 100000) {
    streams = [
      "High-ticket brand sponsorships and collaborations.",
      "Premium digital courses or member access programs.",
      "Merchandise or physical product brand extensions."
    ];
    scalingTips = [
      "Hire dedicated production support to increase weekly volume.",
      "Create automated funnel templates to capture email leads from bio links."
    ];
  } else {
    streams = [
      "Affiliate link referrals and micro-sponsorships.",
      "Digital templates, checklists, or e-books.",
      "Consulting or freelance services related to niche."
    ];
    scalingTips = [
      "Repurpose vertical videos to maximize multi-platform visibility.",
      "Run interactive community polls weekly to discover new content pillars."
    ];
  }
  const monetizationRoadmap = { streams, scalingTips };

  const recommendations = [
    `Maintain consistent scheduling, aiming for at least 3-4 posts per week.`,
    `Optimize profile description bio to focus on one clear value proposition.`,
    `Incorporate clear calls-to-action (CTAs) asking followers to save or share.`
  ];

  return {
    score,
    verdict,
    metrics: {
      engagementRate: erVal !== null ? `${erVal.toFixed(2)}%` : "N/A",
      qualityScore: `${authenticityScore}%`,
      activityRate: conScore >= 75 ? "High" : conScore >= 50 ? "Moderate" : "Low",
      growthVelocity
    },
    sections,
    swot,
    contentStrategy,
    monetizationRoadmap,
    recommendations
  };
}

// ─── Layer 3: Narrative Generator (LLM with Guardrails) ───
function getFallbackNarrative(stats, erVal, erLabel, authenticityScore, verdict) {
  const { followers, following, postsCount, username } = stats;
  const erStr = erVal !== null ? `${erVal.toFixed(2)}%` : "N/A";
  
  const summary = `The profile for @${username} has ${fmt(followers)} followers, ${fmt(following)} following, and ${fmt(postsCount)} posts. It shows an engagement rate of ${erStr} (${erLabel}) and an authenticity score of ${authenticityScore}/100, leading to an overall verdict of "${verdict}".`;
  const strengths = [
    stats.isVerified ? "Verified checkmark indicates authenticated profile status." : "Active profile configuration setup.",
    followers >= 100000 ? "Significant audience base supports high organic reach." : "Established targeted niche presence.",
    erLabel === "Excellent" || erLabel === "Healthy" ? "Strong relative engagement rate compared to other creators in this tier." : "Presence of organic community engagement."
  ];
  const improvements = [
    postsCount < 12 ? "Publish more initial post content to establish feed history." : "Ensure regular upload cadence to capture algorithmic feeds.",
    erLabel === "Low for this tier" ? "Optimize content titles and hooks to raise passive user engagement rate." : "Introduce more interactive caption prompts to trigger comments."
  ];

  return { summary, strengths, improvements };
}

function getNumericTokens(text) {
  if (!text) return [];
  const matches = text.match(/\b\d+(?:[\.,]\d+)?\s*(?:[KkMmBb%])?\b/g);
  return matches ? matches.map(m => m.trim()) : [];
}

function validateLLMNarrative(llmResponse, stats, erVal, erLabel, authenticityScore, verdict, growthVelocity) {
  const { followers, following, postsCount } = stats;

  let parsed;
  try {
    parsed = JSON.parse(llmResponse);
  } catch {
    return null;
  }

  const summary = parsed.summary || "";
  const strengths = Array.isArray(parsed.strengths) ? parsed.strengths : [];
  const improvements = Array.isArray(parsed.improvements) ? parsed.improvements : [];

  if (!summary || strengths.length === 0 || improvements.length === 0) {
    return null;
  }

  const allowlist = new Set();
  
  for (let i = 0; i <= 20; i++) {
    allowlist.add(String(i));
    allowlist.add(`${i}%`);
    allowlist.add(`${i}.0%`);
  }

  function addNumber(num) {
    if (num === null || num === undefined) return;
    const val = typeof num === "number" ? num : parseFloat(num);
    if (isNaN(val)) return;
    allowlist.add(String(val));
    allowlist.add(fmt(val));
    allowlist.add(fmt(val).toLowerCase());
    allowlist.add(String(Math.round(val)));
    allowlist.add(val.toLocaleString("en-US"));
  }

  addNumber(followers);
  addNumber(following);
  addNumber(postsCount);
  addNumber(authenticityScore);
  if (erVal !== null) {
    allowlist.add(`${erVal.toFixed(2)}%`);
    allowlist.add(`${erVal.toFixed(1)}%`);
    allowlist.add(erVal.toFixed(2));
    allowlist.add(erVal.toFixed(1));
    allowlist.add(String(Math.round(erVal)));
    allowlist.add(`${Math.round(erVal)}%`);
  }

  getNumericTokens(growthVelocity).forEach(tok => {
    allowlist.add(tok);
    allowlist.add(tok.toLowerCase());
  });

  const combinedText = [summary, ...strengths, ...improvements].join(" ");
  const llmTokens = getNumericTokens(combinedText);

  for (const token of llmTokens) {
    if (!allowlist.has(token) && !allowlist.has(token.toLowerCase())) {
      console.warn(`Disallowed number found in LLM narrative: "${token}"`);
      return null;
    }
  }

  return { summary, strengths, improvements };
}

// ─── API Router Handler ───
export async function POST(request) {
  try {
    const body = await request.json();
    const platform = body?.platform;
    const raw = body?.username;
    const isManual = !!body?.isManual;
    const manualData = body?.manualData || null;

    if (!platform || !["instagram", "youtube", "tiktok", "x", "linkedin"].includes(platform)) {
      return Response.json({ error: "Please select a platform (Instagram, YouTube, TikTok, X, or LinkedIn)." }, { status: 400 });
    }

    const username = sanitize(raw);
    if (!username || username.length < 1) {
      return Response.json({ error: "Please enter a valid username or handle." }, { status: 400 });
    }

    let stats = null;
    let dataSource = "live";
    let fetchedAt = new Date().toISOString();

    if (isManual) {
      dataSource = "manual";
      const followersNum = parseCount(manualData?.followers);
      const followingNum = parseCount(manualData?.following);
      const postsNum = parseCount(manualData?.posts);
      const avgViewsNum = parseCount(manualData?.averageViews);

      let recentPosts = [];
      if (avgViewsNum > 0) {
        recentPosts = Array.from({ length: Math.min(12, postsNum || 12) }, () => ({
          likes: Math.round(avgViewsNum * 0.95),
          comments: Math.round(avgViewsNum * 0.05),
          views: avgViewsNum,
          postedAt: new Date().toISOString()
        }));
      }

      stats = {
        username,
        followers: followersNum,
        following: followingNum,
        postsCount: postsNum,
        isVerified: !!manualData?.isVerified,
        bio: manualData?.bio || "",
        recentPosts
      };
    } else {
      // Check Cache
      const cached = await checkCache(username, platform);
      if (cached) {
        stats = cached.stats;
        dataSource = "live";
        fetchedAt = cached.fetchedAt;
      } else {
        const token = body?.userApifyToken || process.env.APIFY_API_TOKEN;
        try {
          stats = await fetchPlatformStats(platform, username, token);
        } catch (err) {
          return Response.json({ error: err instanceof Error ? err.message : "Live fetch failed." }, { status: 400 });
        }
      }
    }

    // Deterministic Metrics Engine computations
    const erVal = calculateEngagementRate(stats.followers, stats.recentPosts);
    const erLabel = getERLabel(erVal, stats.followers);
    const authenticityScore = calculateAuthenticityScore(stats);
    const verdict = getVerdict(authenticityScore);

    // Get previous snapshot for growthVelocity BEFORE writing the new snapshot
    const prevSnapshot = await getPreviousSnapshot(username, platform);
    let growthVelocity = "N/A (first audit — tracking starts now)";
    if (prevSnapshot && prevSnapshot.stats?.followers !== undefined) {
      const diff = stats.followers - prevSnapshot.stats.followers;
      const daysAgo = Math.max(1, Math.round((Date.now() - new Date(prevSnapshot.fetchedAt).getTime()) / (1000 * 60 * 60 * 24)));
      const formattedDiff = diff >= 0 ? `+${fmt(diff)}` : `-${fmt(Math.abs(diff))}`;
      growthVelocity = `${formattedDiff} followers since last audit (${daysAgo}d ago)`;
    }

    const report = generateDeterministicParts(platform, username, stats, authenticityScore, erVal, erLabel, growthVelocity, isManual ? manualData?.niche : "Tech & Gadgets");

    // Narrative Generation
    let narrative = null;
    let usingAI = false;
    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey) {
      const systemPrompt = `You are a professional social media report writer. 
Analyze the provided METRICS_JSON and generate a brief audit report narrative.
You MUST output ONLY a valid JSON object matching this exact structure:
{
  "summary": "Detailed narrative summary of the profile based strictly on metrics",
  "strengths": ["Strength 1 from metrics", "Strength 2 from metrics"],
  "improvements": ["Improvement 1 from metrics", "Improvement 2 from metrics"]
}

Rules:
1. Use ONLY the values present in METRICS_JSON.
2. NEVER mention any numbers or percentages not present in METRICS_JSON (including growth velocities or estimations). If you want to describe size, use words like "large", "small", "moderate", or refer to the exact values in the JSON.
3. If a field is null or missing, write "data unavailable".
4. Do not include markdown wraps (like \`\`\`json). Just return the raw JSON string.`;

      const userMessage = `Here is the METRICS_JSON for @${username}:
${JSON.stringify({
  username,
  platform,
  followers: fmt(stats.followers),
  following: fmt(stats.following),
  postsCount: fmt(stats.postsCount),
  engagementRate: erVal !== null ? `${erVal.toFixed(2)}%` : "N/A",
  erLabel,
  authenticityScore: `${authenticityScore}/100`,
  authenticityVerdict: verdict,
  growthVelocity
}, null, 2)}`;

      try {
        const response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: DEFAULT_MODEL,
            temperature: 0,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage }
            ],
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          const rawText = resJson?.choices?.[0]?.message?.content || "";
          narrative = validateLLMNarrative(rawText, stats, erVal, erLabel, authenticityScore, verdict, growthVelocity);
          if (narrative) {
            usingAI = true;
          }
        }
      } catch (err) {
        console.error("AI narrative generation failed:", err);
      }
    }

    if (!narrative) {
      narrative = getFallbackNarrative(stats, erVal, erLabel, authenticityScore, verdict);
    }

    // Merge narrative into deterministic report template
    report.summary = narrative.summary;
    report.swot.strengths = narrative.strengths;
    report.swot.weaknesses = narrative.improvements;

    // Save completed audit snapshot
    const entry = {
      username: username.toLowerCase(),
      platform,
      fetchedAt,
      dataSource,
      stats,
      metrics: {
        engagementRate: report.metrics.engagementRate,
        authenticityScore: report.score,
        verdict: report.verdict,
        activityRate: report.metrics.activityRate,
        growthVelocity: report.metrics.growthVelocity
      }
    };
    await writeSnapshot(entry);

    return Response.json({
      ...report,
      profileData: {
        username,
        followers: stats.followers,
        following: stats.following,
        posts: stats.postsCount,
        averageViews: stats.recentPosts && stats.recentPosts.length > 0 
          ? Math.round(stats.recentPosts.reduce((sum, p) => sum + (p.views || p.likes || 0), 0) / stats.recentPosts.length)
          : (isManual && manualData?.averageViews ? parseCount(manualData.averageViews) : 0),
        bio: stats.bio,
        isVerified: stats.isVerified,
        displayName: username
      },
      dataSource,
      fetchedAt,
      usingAI,
      usingEstimatedStats: false
    });

  } catch (err) {
    console.error("API handler error:", err);
    return Response.json({ error: err instanceof Error ? err.message : "Analysis failed." }, { status: 500 });
  }
}

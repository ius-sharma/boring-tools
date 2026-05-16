export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 12000;

// ─── Helpers ───

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function parseCount(raw) {
  if (!raw) return 0;
  const s = String(raw).replace(/,/g, "").trim();
  const m = s.match(/^([\d.]+)\s*([KkMmBb]?)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const u = m[2].toUpperCase();
  if (u === "B") return Math.round(n * 1_000_000_000);
  if (u === "M") return Math.round(n * 1_000_000);
  if (u === "K") return Math.round(n * 1_000);
  return Math.round(n);
}

function sanitize(input) {
  let v = (input ?? "").trim();
  if (v.startsWith("@")) v = v.slice(1);
  v = v.replace(/^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|youtube\.com)\/?/i, "");
  v = v.replace(/\/+$/, "");
  return v;
}

function verdict(score) {
  if (score >= 75) return "Looks Authentic";
  if (score >= 50) return "Mixed Signals";
  if (score >= 30) return "Questionable";
  return "Likely Spam-Heavy";
}

function makeSummary(score, platform) {
  if (score >= 75) return `This ${platform} account shows strong signs of organic, authentic growth.`;
  if (score >= 50) return `This ${platform} account has mixed signals — some metrics look good, others need attention.`;
  if (score >= 30) return `This ${platform} account raises several concerns. Review the signals below.`;
  return `This ${platform} account shows multiple red flags suggesting fake or spam-heavy activity.`;
}

function usernameHeuristics(username) {
  const signals = [];
  let delta = 0;
  if (/\d{4,}/.test(username)) { delta -= 8; signals.push("Username has long number sequences — common in bot accounts."); }
  if (/^[a-z][a-z0-9_.]{2,20}$/.test(username) && !/\d{3,}/.test(username)) { delta += 5; signals.push("Clean, readable username — looks authentic."); }
  if ((username.match(/_/g) || []).length >= 3) { delta -= 5; signals.push("Excessive underscores in username — often seen in spam accounts."); }
  if (username.length > 25) { delta -= 4; signals.push("Very long username — somewhat unusual."); }
  return { delta, signals };
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── Instagram (via Web Profile API with Sec-Fetch headers) ───

async function fetchInstagramData(username) {
  try {
    const res = await fetchWithTimeout(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          "X-IG-App-ID": "936619743392459",
          "Accept": "*/*",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Referer": `https://www.instagram.com/${username}/`,
        },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const user = json?.data?.user;
    if (!user) return null;

    return {
      followers: user.edge_followed_by?.count ?? 0,
      following: user.edge_follow?.count ?? 0,
      posts: user.edge_owner_to_timeline_media?.count ?? 0,
      displayName: user.full_name || "",
      isVerified: !!user.is_verified,
      isPrivate: !!user.is_private,
      bio: user.biography || "",
      hasProfilePic: !!user.profile_pic_url && !user.profile_pic_url.includes("default"),
      externalUrl: user.external_url || "",
    };
  } catch {
    return null;
  }
}

function analyzeInstagram(data, username) {
  const sections = {
    audienceQuality: { score: 50, signals: [] },
    consistency: { score: 50, signals: [] },
    growth: { score: 50, signals: [] },
  };
  const profileData = { followers: 0, following: 0, posts: 0, displayName: "", isVerified: false };

  if (!data) {
    sections.audienceQuality.signals.push("Could not fetch Instagram profile — the account may not exist or Instagram blocked the request.");
    const uH = usernameHeuristics(username);
    sections.audienceQuality.score = clamp(50 + uH.delta);
    if (uH.signals.length) sections.audienceQuality.signals.push(...uH.signals);
    sections.consistency.score = null;
    sections.consistency.signals.push("Posting data unavailable.");
    sections.growth.score = null;
    sections.growth.signals.push("Growth data unavailable.");
    return { score: null, verdict: "Could Not Fetch", summary: "Instagram blocked the request. Try again later or check the username.", sections, recommendations: ["Double-check the username and try again."], profileData };
  }

  Object.assign(profileData, {
    followers: data.followers,
    following: data.following,
    posts: data.posts,
    displayName: data.displayName,
    isVerified: data.isVerified,
  });

  if (data.isPrivate) {
    return {
      score: null,
      verdict: "Private Account",
      summary: "This account is private. Only limited info is available.",
      sections: {
        audienceQuality: { score: null, signals: [`Account is private with ${fmt(data.followers)} followers and following ${fmt(data.following)} accounts.`] },
        consistency: { score: null, signals: ["Cannot assess posting consistency for private accounts."] },
        growth: { score: null, signals: ["Growth signals unavailable for private accounts."] },
      },
      recommendations: ["Ask the creator to share their Instagram Insights for a full breakdown."],
      profileData,
    };
  }

  const { followers, following, posts } = data;

  // ── Audience Quality ──
  let aq = 65;

  if (followers > 0 && following > 0) {
    const r = followers / following;
    if (r > 50) { aq += 15; sections.audienceQuality.signals.push(`Excellent follower-to-following ratio (${fmt(followers)}:${fmt(following)}) — strong organic signal.`); }
    else if (r > 5) { aq += 8; sections.audienceQuality.signals.push(`Healthy follower-to-following ratio (${fmt(followers)}:${fmt(following)}).`); }
    else if (r < 0.5) { aq -= 12; sections.audienceQuality.signals.push(`Following more than followers (${fmt(following)} vs ${fmt(followers)}) — possible follow-for-follow.`); }
    else if (r >= 0.5 && r <= 1.5) { aq -= 3; sections.audienceQuality.signals.push(`Nearly 1:1 follower-following ratio — could indicate follow-for-follow strategy.`); }
    else { sections.audienceQuality.signals.push(`Balanced follower-to-following ratio (${fmt(followers)}:${fmt(following)}).`); }
  }

  if (followers > 10000 && posts < 10) {
    aq -= 25; sections.audienceQuality.signals.push(`Only ${posts} posts for ${fmt(followers)} followers — strong indicator of purchased followers.`);
  } else if (followers > 50000 && posts < 30) {
    aq -= 15; sections.audienceQuality.signals.push(`Low post count (${posts}) for ${fmt(followers)} followers — suspicious.`);
  } else if (posts > 0) {
    aq += 5; sections.audienceQuality.signals.push(`Post count (${fmt(posts)}) looks proportional to audience size.`);
  }

  if (following > 5000) { aq -= 10; sections.audienceQuality.signals.push(`Following ${fmt(following)} accounts — unusually high, could be spam behavior.`); }
  else if (following > 2000) { aq -= 5; sections.audienceQuality.signals.push(`Following ${fmt(following)} accounts — on the higher side.`); }

  if (data.isVerified) { aq += 15; sections.audienceQuality.signals.push("Verified account ✓ — strong trust signal."); }

  if (!data.displayName) { aq -= 5; sections.audienceQuality.signals.push("No display name set — less trustworthy appearance."); }
  if (!data.bio && followers > 100) { aq -= 5; sections.audienceQuality.signals.push("Empty bio — legitimate creators usually have a bio."); }
  if (!data.hasProfilePic) { aq -= 5; sections.audienceQuality.signals.push("No custom profile picture — default avatar."); }

  const uH = usernameHeuristics(username);
  aq += uH.delta;
  if (uH.signals.length) sections.audienceQuality.signals.push(...uH.signals);

  sections.audienceQuality.score = clamp(aq);

  // ── Consistency ──
  let con = 40;
  if (posts === 0) { con = 10; sections.consistency.signals.push("No posts found — the account appears inactive."); }
  else if (posts < 5) { con = 25; sections.consistency.signals.push(`Only ${posts} posts — too early to judge consistency.`); }
  else if (posts < 30) { con = 45; sections.consistency.signals.push(`${posts} posts — still growing. Keep posting regularly!`); }
  else if (posts < 100) { con = 60; sections.consistency.signals.push(`${posts} posts — solid content library.`); }
  else if (posts < 500) { con = 78; sections.consistency.signals.push(`${fmt(posts)} posts — great consistency!`); }
  else if (posts < 2000) { con = 88; sections.consistency.signals.push(`${fmt(posts)} posts — excellent volume!`); }
  else { con = 95; sections.consistency.signals.push(`${fmt(posts)}+ posts — exceptional content creator!`); }

  if (posts > 0) sections.consistency.signals.push("Pro tip: 3-5 posts per week is ideal for Instagram growth.");
  sections.consistency.score = clamp(con);

  // ── Growth ──
  let gr = 50;
  if (followers >= 1_000_000) { gr += 20; sections.growth.signals.push(`${fmt(followers)} followers — major creator territory.`); }
  else if (followers >= 100_000) { gr += 15; sections.growth.signals.push(`${fmt(followers)} followers — large and growing audience.`); }
  else if (followers >= 10_000) { gr += 10; sections.growth.signals.push(`${fmt(followers)} followers — growing well.`); }
  else if (followers >= 1_000) { gr += 5; sections.growth.signals.push(`${fmt(followers)} followers — building momentum.`); }
  else { sections.growth.signals.push(`${fmt(followers)} followers — early stage. Stay consistent and engage!`); }

  if (posts > 0 && followers > 100) {
    const contentDensity = posts / (followers / 1000);
    if (contentDensity > 5) { gr += 8; sections.growth.signals.push("Strong content density — engagement likely healthy."); }
    else if (contentDensity < 0.5 && followers > 1000) { gr -= 8; sections.growth.signals.push("Very low content relative to audience — may lose engagement over time."); }
  }

  if (data.externalUrl) { gr += 3; sections.growth.signals.push("Has an external link — sign of an active, professional creator."); }

  sections.growth.score = clamp(gr);

  // ── Overall ──
  const overall = Math.round(sections.audienceQuality.score * 0.45 + sections.consistency.score * 0.30 + sections.growth.score * 0.25);

  const recs = [];
  if (sections.audienceQuality.score < 60) recs.push("Audience quality seems low — avoid follow-for-follow and focus on genuine engagement.");
  if (sections.consistency.score < 50) recs.push("Post more consistently — aim for at least 3 times a week.");
  if (sections.growth.score < 50) recs.push("Focus on Reels and trending content to accelerate growth.");
  if (!data.bio) recs.push("Add a compelling bio — it's the first thing people see.");
  if (recs.length === 0) recs.push("Great account health! Keep creating quality content consistently.");

  return { score: overall, verdict: verdict(overall), summary: makeSummary(overall, "Instagram"), sections, recommendations: recs.slice(0, 5), profileData };
}

// ─── YouTube (via ytInitialData scraping) ───

async function fetchYouTubeData(handle) {
  try {
    const res = await fetchWithTimeout(`https://www.youtube.com/@${encodeURIComponent(handle)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const ytMatch = html.match(/var\s+ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/s);
    if (!ytMatch) return null;

    const jsonStr = ytMatch[1];

    // Subscriber count — try multiple patterns
    let subscribers = 0;
    
    // Pattern 1: From accessibility label (large channels): "29.6 million subscribers"
    let subAccessLabel = jsonStr.match(/"subscriberCountText":\s*\{[^}]*"accessibilityData":\s*\{[^}]*"label":\s*"([^"]+)"/);
    if (subAccessLabel) {
      const subText = subAccessLabel[1];
      const numMatch = subText.match(/([\d,.]+)\s*(million|billion|thousand|hundred)?/i);
      if (numMatch) {
        let num = parseFloat(numMatch[1].replace(/,/g, ""));
        const unit = (numMatch[2] || "").toLowerCase();
        if (unit === "billion") num *= 1_000_000_000;
        else if (unit === "million") num *= 1_000_000;
        else if (unit === "thousand") num *= 1_000;
        subscribers = Math.round(num);
      }
    }
    
    // Pattern 2: From simpleText (large channels): "29.6M subscribers"
    if (subscribers === 0) {
      const subSimple = jsonStr.match(/"subscriberCountText":\s*\{[^}]*"simpleText":\s*"([^"]+)"/);
      if (subSimple) {
        const subText = subSimple[1];
        const numMatch = subText.match(/([\d,.]+)\s*([kmb])?/i);
        if (numMatch) {
          let num = parseFloat(numMatch[1].replace(/,/g, ""));
          const unit = (numMatch[2] || "").toLowerCase();
          if (unit === "b") num *= 1_000_000_000;
          else if (unit === "m") num *= 1_000_000;
          else if (unit === "k") num *= 1_000;
          subscribers = Math.round(num);
        }
      }
    }
    
    // Pattern 3: For smaller channels - search for subscriber info in content or accessibilityLabel
    if (subscribers === 0) {
      const subContent = jsonStr.match(/"content":"([^"]*(?:\d+)\s*subscribers?[^"]*)"|"accessibilityLabel":"([^"]*(?:\d+)\s*subscribers?[^"]*)"/i);
      if (subContent) {
        const subText = subContent[1] || subContent[2];
        const numMatch = subText.match(/(\d+)\s*(?:million|thousand|k|m)?\s*subscribers?/i);
        if (numMatch) {
          let num = parseInt(numMatch[1], 10);
          if (subText.match(/million/i)) num *= 1_000_000;
          else if (subText.match(/thousand|k/i)) num *= 1_000;
          subscribers = num;
        }
      }
    }

    // Video count — try multiple patterns
    let videos = 0;
    
    // Pattern 1: From runs (large channels)
    const vidMatch = jsonStr.match(/"videoCountText":\s*\{[^}]*"runs":\s*\[\s*\{\s*"text":\s*"([\d,.]+)"/);
    if (vidMatch) {
      videos = parseInt(vidMatch[1].replace(/,/g, ""), 10) || 0;
    }
    
    // Pattern 2: From simpleText (large channels)
    if (videos === 0) {
      const vidSimple = jsonStr.match(/"videoCountText":\s*\{[^}]*"simpleText":\s*"([\d,.]+)"/);
      if (vidSimple) {
        videos = parseInt(vidSimple[1].replace(/,/g, ""), 10) || 0;
      }
    }
    
    // Pattern 3: For smaller channels - search for video count in content field
    if (videos === 0) {
      const vidContent = jsonStr.match(/"content":"([^"]*(?:\d+)\s*videos?[^"]*)"/i);
      if (vidContent) {
        const vidText = vidContent[1];
        const numMatch = vidText.match(/(\d+)\s*videos?/i);
        if (numMatch) {
          videos = parseInt(numMatch[1], 10);
        }
      }
    }

    // Total views
    let totalViews = 0;
    const viewMatch = jsonStr.match(/"viewCountText":\s*\{[^}]*"simpleText":\s*"([\d,.]+ views?)"/i);
    if (viewMatch) {
      totalViews = parseInt(viewMatch[1].replace(/[^0-9]/g, ""), 10) || 0;
    }

    // Channel name from og:title
    let displayName = "";
    const titleMatch = html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i)
                    || html.match(/content=["']([^"']+)["']\s+property=["']og:title["']/i);
    if (titleMatch) displayName = titleMatch[1];

    // Channel description from og:description
    let description = "";
    const descMatch = html.match(/property=["']og:description["']\s+content=["']([^"']+)["']/i)
                   || html.match(/content=["']([^"']+)["']\s+property=["']og:description["']/i);
    if (descMatch) description = descMatch[1];

    // Verified status
    const isVerified = /"BADGE_STYLE_TYPE_VERIFIED"/.test(jsonStr) || /"isVerified":\s*true/.test(jsonStr);

    // Join date
    let joinDate = "";
    const joinMatch = jsonStr.match(/"joinedDateText":\s*\{[^}]*"runs":\s*\[[^\]]*"text":\s*"([^"]+)"/);
    if (joinMatch) joinDate = joinMatch[1];
    if (!joinDate) {
      const joinSimple = jsonStr.match(/"joinedDateText":\s*\{[^}]*"simpleText":\s*"([^"]+)"/);
      if (joinSimple) joinDate = joinSimple[1];
    }

    return { subscribers, videos, totalViews, displayName, description, isVerified, joinDate };
  } catch {
    return null;
  }
}

function analyzeYouTube(data, handle) {
  const sections = {
    audienceQuality: { score: 50, signals: [] },
    consistency: { score: 50, signals: [] },
    growth: { score: 50, signals: [] },
  };
  const profileData = { subscribers: 0, videos: 0, totalViews: 0, displayName: "", isVerified: false, joinDate: "" };

  if (!data) {
    sections.audienceQuality.signals.push("Could not fetch YouTube channel — check the handle or try again later.");
    const uH = usernameHeuristics(handle);
    sections.audienceQuality.score = clamp(50 + uH.delta);
    if (uH.signals.length) sections.audienceQuality.signals.push(...uH.signals);
    sections.consistency.score = null;
    sections.consistency.signals.push("Channel data unavailable.");
    sections.growth.score = null;
    sections.growth.signals.push("Growth data unavailable.");
    return { score: null, verdict: "Could Not Fetch", summary: "Could not retrieve YouTube channel data.", sections, recommendations: ["Double-check the channel handle and try again."], profileData };
  }

  Object.assign(profileData, data);

  const { subscribers, videos, totalViews } = data;

  // ── Audience Quality ──
  let aq = 65;

  if (subscribers > 0 && videos > 0) {
    if (subscribers > 100_000 && videos < 5) {
      aq -= 25; sections.audienceQuality.signals.push(`Only ${videos} videos for ${fmt(subscribers)} subscribers — strong indicator of fake subs.`);
    } else if (subscribers > 50_000 && videos < 15) {
      aq -= 15; sections.audienceQuality.signals.push(`Low video count (${videos}) for ${fmt(subscribers)} subscribers — suspicious.`);
    } else {
      aq += 5; sections.audienceQuality.signals.push(`Video count (${videos}) seems proportional to ${fmt(subscribers)} subscribers.`);
    }
  } else if (subscribers > 0 && videos === 0) {
    aq -= 20; sections.audienceQuality.signals.push(`${fmt(subscribers)} subscribers with zero videos — very suspicious.`);
  }

  if (totalViews > 0 && subscribers > 0) {
    const viewsPerSub = totalViews / subscribers;
    if (viewsPerSub < 1) { aq -= 15; sections.audienceQuality.signals.push(`Very low views-to-subscriber ratio (${viewsPerSub.toFixed(1)}x) — most subs may be inactive or fake.`); }
    else if (viewsPerSub < 5) { aq -= 5; sections.audienceQuality.signals.push(`Below-average views per subscriber (${viewsPerSub.toFixed(1)}x).`); }
    else if (viewsPerSub > 50) { aq += 12; sections.audienceQuality.signals.push(`Excellent views-per-subscriber ratio (${viewsPerSub.toFixed(1)}x) — highly engaged audience.`); }
    else if (viewsPerSub > 10) { aq += 8; sections.audienceQuality.signals.push(`Strong views-per-subscriber ratio (${viewsPerSub.toFixed(1)}x).`); }
    else { aq += 3; sections.audienceQuality.signals.push(`Decent views-per-subscriber ratio (${viewsPerSub.toFixed(1)}x).`); }
  }

  if (data.isVerified) { aq += 15; sections.audienceQuality.signals.push("Verified channel ✓ — strong trust signal."); }

  if (!data.description || data.description.length < 20) { aq -= 5; sections.audienceQuality.signals.push("Channel has little or no description — less professional."); }

  const uH = usernameHeuristics(handle);
  aq += uH.delta;
  if (uH.signals.length) sections.audienceQuality.signals.push(...uH.signals);

  sections.audienceQuality.score = clamp(aq);

  // ── Consistency ──
  let con = 40;
  if (videos === 0) { con = 10; sections.consistency.signals.push("No videos found — channel appears inactive."); }
  else if (videos < 5) { con = 25; sections.consistency.signals.push(`Only ${videos} videos — too early to assess consistency.`); }
  else if (videos < 20) { con = 45; sections.consistency.signals.push(`${videos} videos — still building the content library.`); }
  else if (videos < 50) { con = 60; sections.consistency.signals.push(`${videos} videos — decent upload history.`); }
  else if (videos < 200) { con = 78; sections.consistency.signals.push(`${videos} videos — solid consistency!`); }
  else { con = 90; sections.consistency.signals.push(`${videos}+ videos — excellent content volume!`); }

  // Upload frequency from join date
  if (data.joinDate && videos > 0) {
    const dateStr = data.joinDate.replace(/^Joined\s*/i, "").trim();
    const joined = new Date(dateStr);
    if (!isNaN(joined.getTime())) {
      const days = Math.max(1, (Date.now() - joined.getTime()) / 86_400_000);
      const freq = days / videos;
      const years = (days / 365).toFixed(1);
      sections.consistency.signals.push(`Channel active for ~${years} years.`);
      if (freq <= 3) { con = Math.max(con, 92); sections.consistency.signals.push(`Uploads roughly every ${Math.round(freq)} day(s) — incredible pace!`); }
      else if (freq <= 7) { con = Math.max(con, 82); sections.consistency.signals.push("Uploads about once a week — great rhythm!"); }
      else if (freq <= 14) { con = Math.max(con, 68); sections.consistency.signals.push(`Uploads roughly every ${Math.round(freq)} days — decent frequency.`); }
      else if (freq <= 30) { sections.consistency.signals.push(`Uploads about once a month — try to increase frequency.`); }
      else { con = Math.min(con, 40); sections.consistency.signals.push(`Average gap of ${Math.round(freq)} days between uploads — quite irregular.`); }
    }
  }

  if (videos > 0) sections.consistency.signals.push("Pro tip: Upload at least once a week for optimal YouTube growth.");
  sections.consistency.score = clamp(con);

  // ── Growth ──
  let gr = 50;
  if (subscribers >= 10_000_000) { gr += 22; sections.growth.signals.push(`${fmt(subscribers)} subscribers — elite creator tier.`); }
  else if (subscribers >= 1_000_000) { gr += 18; sections.growth.signals.push(`${fmt(subscribers)} subscribers — top-tier creator.`); }
  else if (subscribers >= 100_000) { gr += 13; sections.growth.signals.push(`${fmt(subscribers)} subscribers — major creator.`); }
  else if (subscribers >= 10_000) { gr += 8; sections.growth.signals.push(`${fmt(subscribers)} subscribers — growing channel.`); }
  else if (subscribers >= 1_000) { gr += 4; sections.growth.signals.push(`${fmt(subscribers)} subscribers — building momentum.`); }
  else { sections.growth.signals.push(`${fmt(subscribers)} subscribers — early stage. Keep grinding!`); }

  if (totalViews >= 100_000_000) { gr += 12; sections.growth.signals.push(`${fmt(totalViews)} total views — massive reach.`); }
  else if (totalViews >= 10_000_000) { gr += 8; sections.growth.signals.push(`${fmt(totalViews)} total views — strong viewership.`); }
  else if (totalViews >= 1_000_000) { gr += 5; sections.growth.signals.push(`${fmt(totalViews)} total views — decent traction.`); }
  else if (totalViews > 0) { sections.growth.signals.push(`${fmt(totalViews)} total views — room to grow.`); }

  if (videos > 0 && totalViews > 0) {
    const avgViews = Math.round(totalViews / videos);
    sections.growth.signals.push(`Average ${fmt(avgViews)} views per video.`);
    if (avgViews > 100_000) gr += 10;
    else if (avgViews > 10_000) gr += 6;
    else if (avgViews > 1_000) gr += 3;
  }

  sections.growth.score = clamp(gr);

  // ── Overall ──
  const overall = Math.round(sections.audienceQuality.score * 0.40 + sections.consistency.score * 0.30 + sections.growth.score * 0.30);

  const recs = [];
  if (sections.audienceQuality.score < 60) recs.push("Subscriber quality seems low — focus on organic promotion over sub-for-sub.");
  if (sections.consistency.score < 50) recs.push("Upload more consistently — try to maintain a weekly schedule.");
  if (sections.growth.score < 50) recs.push("Create Shorts and optimize thumbnails and titles to boost growth.");
  if (!data.description || data.description.length < 50) recs.push("Write a detailed channel description — it helps with discoverability.");
  if (recs.length === 0) recs.push("Great channel health! Keep uploading quality content consistently.");

  return { score: overall, verdict: verdict(overall), summary: makeSummary(overall, "YouTube"), sections, recommendations: recs.slice(0, 5), profileData };
}

// ─── Handler ───

export async function POST(request) {
  try {
    const body = await request.json();
    const platform = body?.platform;
    const raw = body?.username;

    if (!platform || !["instagram", "youtube"].includes(platform)) {
      return Response.json({ error: "Please select a platform (Instagram or YouTube)." }, { status: 400 });
    }

    const username = sanitize(raw);
    if (!username || username.length < 1) {
      return Response.json({ error: "Please enter a valid username or handle." }, { status: 400 });
    }

    let result;
    if (platform === "instagram") {
      const data = await fetchInstagramData(username);
      result = analyzeInstagram(data, username);
    } else {
      const data = await fetchYouTubeData(username);
      result = analyzeYouTube(data, username);
    }

    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Analysis failed." }, { status: 500 });
  }
}

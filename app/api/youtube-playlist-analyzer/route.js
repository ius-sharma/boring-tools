import { NextResponse } from "next/server";
import { withAuthAndQuota } from "../../../lib/auth/withAuthAndQuota";

export const runtime = "nodejs";
export const maxDuration = 120;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function extractPlaylistId(input) {
  if (!input) return null;
  const cleanInput = input.trim();

  // Match list parameter in URL
  const listMatch = cleanInput.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (listMatch) return listMatch[1];

  // Match direct playlist URL
  const pathMatch = cleanInput.match(/youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/);
  if (pathMatch) return pathMatch[1];

  // If user pasted raw playlist ID (starts with PL, UU, LL, FL, RD, OLAK5uy, etc.)
  if (/^[a-zA-Z0-9_-]{10,60}$/.test(cleanInput)) {
    return cleanInput;
  }

  return null;
}

function parseDurationTextToSeconds(text) {
  if (!text) return 0;
  const cleanText = String(text).trim().replace(/[^\d:]/g, "");
  const parts = cleanText.split(":").map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

function parseISO8601Duration(duration) {
  if (!duration) return 0;
  const match = duration.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const days = parseInt(match[1] || 0, 10);
  const hours = parseInt(match[2] || 0, 10);
  const minutes = parseInt(match[3] || 0, 10);
  const seconds = parseInt(match[4] || 0, 10);
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

function formatSecondsToHMS(totalSeconds) {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const remainingSecs = secs % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${remainingSecs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${remainingSecs}s`;
  }
  return `${remainingSecs}s`;
}

function formatSecondsToDetailedText(totalSeconds) {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);

  if (hrs > 0 && mins > 0) {
    return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min${mins > 1 ? "s" : ""}`;
  } else if (hrs > 0) {
    return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  } else if (mins > 0) {
    return `${mins} min${mins > 1 ? "s" : ""}`;
  }
  return `${secs} sec${secs > 1 ? "s" : ""}`;
}

function extractLockupDuration(lockup) {
  const overlays = lockup?.contentImage?.thumbnailViewModel?.overlays || [];
  for (const ov of overlays) {
    const badges = ov?.thumbnailBottomOverlayViewModel?.badges || [];
    for (const b of badges) {
      const text = b?.thumbnailBadgeViewModel?.text;
      if (text && /^\d+(:\d+)+$/.test(text.trim())) {
        return text.trim();
      }
    }
  }
  return "0:00";
}

function extractVideosAndTokens(node, videoList, seenIds, playlistId) {
  let nextToken = null;

  function extractTokenFromObj(obj) {
    if (!obj || typeof obj !== "object") return null;
    if (obj.continuationItemRenderer) {
      return obj.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token || null;
    }
    if (obj.continuationItemViewModel) {
      return (
        obj.continuationItemViewModel.continuationCommand?.continuationCommand?.token ||
        obj.continuationItemViewModel.continuationCommand?.innertubeCommand?.continuationCommand?.token ||
        null
      );
    }
    return null;
  }

  function traverse(obj) {
    if (!obj || typeof obj !== "object") return;

    if (Array.isArray(obj)) {
      let arrayToken = null;
      for (const item of obj) {
        const t = extractTokenFromObj(item);
        if (t) {
          arrayToken = t;
        }
        traverse(item);
      }
      if (arrayToken && !nextToken) {
        nextToken = arrayToken;
      }
      return;
    }

    if (obj.playlistVideoRenderer) {
      const vr = obj.playlistVideoRenderer;
      if (vr.videoId && !seenIds.has(vr.videoId)) {
        seenIds.add(vr.videoId);
        const vId = vr.videoId;
        const vTitle = vr.title?.runs?.[0]?.text || vr.title?.simpleText || `Video #${videoList.length + 1}`;
        const durText = vr.lengthText?.simpleText || vr.lengthText?.runs?.[0]?.text || "0:00";
        const durSecs = parseInt(vr.lengthSeconds, 10) || parseDurationTextToSeconds(durText);
        const thumb = vr.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;

        videoList.push({
          index: videoList.length + 1,
          videoId: vId,
          title: vTitle,
          durationText: durText,
          durationSeconds: durSecs,
          thumbnail: thumb,
          url: `https://www.youtube.com/watch?v=${vId}&list=${playlistId}`,
        });
      }
      return;
    }

    if (obj.lockupViewModel) {
      const lm = obj.lockupViewModel;
      const vId = lm.contentId || lm.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
      if (vId && !seenIds.has(vId)) {
        seenIds.add(vId);
        const vTitle = lm.metadata?.lockupMetadataViewModel?.title?.content || `Video #${videoList.length + 1}`;
        const durText = extractLockupDuration(lm);
        const durSecs = parseDurationTextToSeconds(durText);
        const thumb = lm.contentImage?.thumbnailViewModel?.image?.sources?.[0]?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;

        videoList.push({
          index: videoList.length + 1,
          videoId: vId,
          title: vTitle,
          durationText: durText,
          durationSeconds: durSecs,
          thumbnail: thumb,
          url: `https://www.youtube.com/watch?v=${vId}&list=${playlistId}`,
        });
      }
      return;
    }

    const singleToken = extractTokenFromObj(obj);
    if (singleToken && !nextToken) {
      nextToken = singleToken;
      return;
    }

    for (const key of Object.keys(obj)) {
      if (key === "sidebar" || key === "engagementPanels") continue;
      traverse(obj[key]);
    }
  }

  traverse(node);
  return nextToken;
}

async function fetchPlaylistViaScrape(playlistId) {
  try {
    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) return null;
    const html = await res.text();

    if (
      html.includes("The playlist does not exist") ||
      html.includes("This playlist isn't available anymore")
    ) {
      return null;
    }

    const dataMatch = html.match(/var\s+ytInitialData\s*=\s*(\{.+?\});\s*(?:var|<\/script)/s);
    if (!dataMatch) return null;

    const ytData = JSON.parse(dataMatch[1]);

    let title = "YouTube Playlist";
    let channelName = "Creator";
    let thumbnailUrl = null;

    if (ytData?.metadata?.playlistMetadataRenderer?.title) {
      title = ytData.metadata.playlistMetadataRenderer.title;
    } else if (ytData?.header?.playlistHeaderRenderer?.title?.simpleText) {
      title = ytData.header.playlistHeaderRenderer.title.simpleText;
    } else if (ytData?.header?.playlistHeaderRenderer?.title?.runs?.[0]?.text) {
      title = ytData.header.playlistHeaderRenderer.title.runs[0].text;
    }

    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/);
    if (ogTitleMatch) {
      const ogTitle = ogTitleMatch[1].replace(/ - YouTube$/, "").trim();
      if (ogTitle && (title === "YouTube Playlist" || !title)) {
        title = ogTitle;
      }
    }

    if (ytData?.sidebar?.playlistSidebarRenderer?.items) {
      for (const item of ytData.sidebar.playlistSidebarRenderer.items) {
        const owner = item?.playlistSidebarSecondaryInfoRenderer?.videoOwner?.videoOwnerRenderer;
        if (owner?.title?.runs?.[0]?.text) {
          channelName = owner.title.runs[0].text;
          break;
        }
      }
    }

    const videoList = [];
    const seenIds = new Set();

    let nextContinuationToken = extractVideosAndTokens(ytData, videoList, seenIds, playlistId);

    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    const innertubeKey = apiKeyMatch ? apiKeyMatch[1] : "";
    const rawClientVersionMatch = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/);
    const rawClientVersion = rawClientVersionMatch ? rawClientVersionMatch[1] : "2.20260828.01.00";
    const clientVersion = rawClientVersion.split("-")[0];
    const visitorDataMatch = html.match(/"VISITOR_DATA":"([^"]+)"/);
    const visitorData = visitorDataMatch ? visitorDataMatch[1] : (ytData.responseContext?.visitorData || "");

    // Fetch continuation pages (up to 25 pages / ~2500 videos max)
    let pages = 0;
    while (nextContinuationToken && pages < 25 && innertubeKey) {
      pages++;
      const prevCount = videoList.length;
      const currentToken = nextContinuationToken;
      nextContinuationToken = null;

      try {
        const browseRes = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${innertubeKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "X-YouTube-Client-Name": "1",
            "X-YouTube-Client-Version": clientVersion,
            "Origin": "https://www.youtube.com",
            "Referer": `https://www.youtube.com/playlist?list=${playlistId}`,
          },
          body: JSON.stringify({
            context: {
              client: {
                clientName: "WEB",
                clientVersion: clientVersion,
                hl: "en",
                gl: "US",
                visitorData: visitorData || undefined,
              },
            },
            continuation: currentToken,
          }),
        });

        if (!browseRes.ok) break;
        const browseData = await browseRes.json();
        const token = extractVideosAndTokens(browseData, videoList, seenIds, playlistId);
        if (token) nextContinuationToken = token;

        if (videoList.length === prevCount) {
          break;
        }
      } catch {
        break;
      }
    }

    if (videoList.length > 0) {
      return {
        title,
        channelName,
        thumbnailUrl: thumbnailUrl || videoList[0]?.thumbnail,
        videos: videoList,
      };
    }

    return null;
  } catch (err) {
    console.error("fetchPlaylistViaScrape error:", err);
    return null;
  }
}

async function fetchPlaylistViaOfficialAPI(playlistId, apiKey) {
  try {
    const plRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
    );
    if (!plRes.ok) throw new Error(`Playlist meta fetch failed: ${plRes.status}`);
    const plData = await plRes.json();
    const plItem = plData.items?.[0];
    if (!plItem) return null;

    const title = plItem.snippet?.title || "YouTube Playlist";
    const channelName = plItem.snippet?.channelTitle || "Creator";
    const thumbnailUrl =
      plItem.snippet?.thumbnails?.high?.url ||
      plItem.snippet?.thumbnails?.medium?.url ||
      plItem.snippet?.thumbnails?.default?.url;

    const rawVideos = [];
    let pageToken = "";

    do {
      const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${
        pageToken ? `&pageToken=${pageToken}` : ""
      }`;
      const itemsRes = await fetch(itemsUrl);
      if (!itemsRes.ok) break;
      const itemsData = await itemsRes.json();
      const items = itemsData.items || [];

      for (const it of items) {
        const videoId = it.contentDetails?.videoId || it.snippet?.resourceId?.videoId;
        if (!videoId) continue;
        rawVideos.push({
          videoId,
          title: it.snippet?.title || `Video #${rawVideos.length + 1}`,
          thumbnail:
            it.snippet?.thumbnails?.high?.url ||
            it.snippet?.thumbnails?.medium?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`,
        });
      }

      pageToken = itemsData.nextPageToken;
    } while (pageToken && rawVideos.length < 1000);

    if (rawVideos.length === 0) return null;

    const videoIds = rawVideos.map((v) => v.videoId);
    const durationMap = new Map();

    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50);
      const vRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${chunk.join(",")}&key=${apiKey}`
      );
      if (vRes.ok) {
        const vData = await vRes.json();
        for (const v of vData.items || []) {
          const isoDur = v.contentDetails?.duration;
          const secs = parseISO8601Duration(isoDur);
          durationMap.set(v.id, {
            durationSeconds: secs,
            durationText: formatSecondsToHMS(secs),
          });
        }
      }
    }

    const videos = rawVideos.map((v, index) => {
      const durInfo = durationMap.get(v.videoId) || { durationSeconds: 0, durationText: "0:00" };
      return {
        index: index + 1,
        videoId: v.videoId,
        title: v.title,
        durationText: durInfo.durationText,
        durationSeconds: durInfo.durationSeconds,
        thumbnail: v.thumbnail,
        url: v.url,
      };
    });

    return {
      title,
      channelName,
      thumbnailUrl: thumbnailUrl || videos[0]?.thumbnail,
      videos,
    };
  } catch (err) {
    console.error("fetchPlaylistViaOfficialAPI error:", err);
    return null;
  }
}

function generateHeuristicConceptAnalysis(title, videos, channelName) {
  const titlesList = videos.map((v) => v.title.toLowerCase());
  const combinedText = (title + " " + titlesList.join(" ")).toLowerCase();

  // Domain Detection
  let domain = "General Learning";
  let skillLevel = "All Skill Levels";
  
  if (/react|javascript|js|node|python|css|html|frontend|backend|web|fullstack|nextjs|tailwind|typescript|code|programming|java|c\+\+|dsa/i.test(combinedText)) {
    domain = "Software Development & Coding";
  } else if (/machine learning|deep learning|ai|data science|python|neural|models|pandas|numpy|math|scikit/i.test(combinedText)) {
    domain = "Artificial Intelligence & Data Science";
  } else if (/finance|stock|invest|trading|money|crypto|business|marketing|accounting|startup/i.test(combinedText)) {
    domain = "Finance & Business";
  } else if (/editing|premiere|photoshop|design|figma|ui|ux|graphic|video editing|animation/i.test(combinedText)) {
    domain = "Design & Creative Media";
  } else if (/physics|chemistry|biology|math|calculus|algebra|science|history|exam|gate|jee|neet|upsc/i.test(combinedText)) {
    domain = "Academics & Competitive Exams";
  }

  // Infer Level
  if (/beginner|crash course|basics|introduction|intro|start|fundamental|scratch|from zero|101|for beginners/i.test(combinedText)) {
    skillLevel = "Beginner to Intermediate";
  } else if (/advanced|mastery|pro|architecture|expert|deep dive|performance/i.test(combinedText)) {
    skillLevel = "Intermediate to Advanced";
  }

  // Extract core concepts
  const coreConceptsSet = new Set();
  const stopWords = new Set(["how", "to", "in", "the", "a", "an", "and", "or", "for", "with", "of", "on", "at", "by", "from", "part", "video", "tutorial", "full", "course", "hindi", "english", "2024", "2025", "2026", "complete", "day", "episode", "ch", "chapter", "#1", "#2", "#3", "#4", "#5"]);

  videos.forEach((v) => {
    const cleanTitle = v.title
      .replace(/[^a-zA-Z0-9\s#\+\-\.]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()));

    for (let i = 0; i < cleanTitle.length; i++) {
      const word = cleanTitle[i];
      if (word.length >= 3) {
        coreConceptsSet.add(word.charAt(0).toUpperCase() + word.slice(1));
      }
    }
  });

  const topConcepts = Array.from(coreConceptsSet).slice(0, 10);
  if (topConcepts.length === 0) {
    topConcepts.push("Core Fundamentals", "Practical Workflow", "Key Techniques", "Implementation", "Projects & Practice");
  }

  // Modules
  const totalVids = videos.length;
  const moduleCount = Math.min(4, Math.max(2, Math.ceil(totalVids / 5)));
  const vidsPerMod = Math.ceil(totalVids / moduleCount);
  const modules = [];

  for (let m = 0; m < moduleCount; m++) {
    const startIdx = m * vidsPerMod;
    const endIdx = Math.min(totalVids, (m + 1) * vidsPerMod);
    if (startIdx >= totalVids) break;

    const modVideos = videos.slice(startIdx, endIdx);
    const modTopics = modVideos.map((v) => v.title).slice(0, 3);
    
    let modTitle = `Module ${m + 1}: `;
    if (m === 0) modTitle += "Foundations & Fundamentals";
    else if (m === moduleCount - 1) modTitle += "Advanced Concepts & Projects";
    else modTitle += `Core Topic Deep Dive (${m + 1})`;

    modules.push({
      moduleTitle: modTitle,
      videoRange: `Videos ${startIdx + 1} - ${endIdx}`,
      description: `Covers ${modTopics.join(", ").slice(0, 120)}...`,
      keyTopics: modTopics,
    });
  }

  return {
    domain,
    summary: `This playlist "${title}" by ${channelName} contains ${videos.length} videos focusing on ${domain.toLowerCase()}. It provides a structured learning path with comprehensive coverage.`,
    skillLevel,
    prerequisites: ["Basic curiosity and willingness to practice", "Familiarity with foundational concepts in " + domain],
    coreConcepts: topConcepts,
    modules,
    learningOutcomes: [
      `Master the core fundamentals of ${topConcepts.slice(0, 3).join(", ")}`,
      `Build practical understanding through step-by-step video instructions`,
      `Gain end-to-end hands-on clarity across all ${videos.length} topics`,
    ],
    studyTips: [
      "Watch at 1.25x or 1.5x speed to save up to 30-40% of overall time.",
      "Take hands-on notes or build mini-projects alongside videos for 2x retention.",
      "Break your watch schedule into 30-45 minute daily blocks rather than single-sitting binges.",
    ],
  };
}

async function analyzePlaylistWithAI(title, videos, channelName) {
  if (!process.env.GROQ_API_KEY) {
    return generateHeuristicConceptAnalysis(title, videos, channelName);
  }

  try {
    const videoTitlesSummary = videos
      .slice(0, 40)
      .map((v, i) => `${i + 1}. ${v.title} (${v.durationText})`)
      .join("\n");

    const prompt = `Analyze this YouTube playlist and return ONLY valid JSON:
Playlist Title: "${title}"
Creator: "${channelName}"
Total Videos: ${videos.length}
Sample Video List:
${videoTitlesSummary}

Required JSON Output format:
{
  "domain": "e.g. Web Development / Data Science / Finance / Music / General",
  "summary": "2-3 sentences concise overview of what this playlist teaches.",
  "skillLevel": "Beginner | Intermediate | Advanced | All Levels",
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "coreConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5", "Concept 6"],
  "modules": [
    {
      "moduleTitle": "Module 1: Title",
      "videoRange": "Videos 1-5",
      "description": "Brief description of what this module teaches.",
      "keyTopics": ["Topic A", "Topic B"]
    }
  ],
  "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3"],
  "studyTips": ["Tip 1", "Tip 2"]
}`;

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      return generateHeuristicConceptAnalysis(title, videos, channelName);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return generateHeuristicConceptAnalysis(title, videos, channelName);

    const parsed = JSON.parse(content);
    return {
      domain: parsed.domain || "General Learning",
      summary: parsed.summary || `Comprehensive playlist covering ${title}`,
      skillLevel: parsed.skillLevel || "All Skill Levels",
      prerequisites: parsed.prerequisites || ["Basic prerequisites"],
      coreConcepts: parsed.coreConcepts || ["Core Concepts"],
      modules: parsed.modules || [],
      learningOutcomes: parsed.learningOutcomes || [],
      studyTips: parsed.studyTips || [],
    };
  } catch (err) {
    console.error("AI Analysis error, using heuristic:", err);
    return generateHeuristicConceptAnalysis(title, videos, channelName);
  }
}

async function handlePost(req) {
  try {
    const body = await req.json();
    const inputUrl = body.url || body.playlistId;

    if (!inputUrl) {
      return NextResponse.json(
        { error: "Please provide a valid YouTube playlist URL or ID." },
        { status: 400 }
      );
    }

    const playlistId = extractPlaylistId(inputUrl);
    if (!playlistId) {
      return NextResponse.json(
        { error: "Invalid YouTube playlist URL or ID. Please check and try again." },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    let playlistData = null;

    // Strategy 1: YouTube Data API v3 (Official & Fast if key configured)
    if (apiKey) {
      try {
        playlistData = await fetchPlaylistViaOfficialAPI(playlistId, apiKey);
      } catch (err) {
        console.warn("Official API fetch failed, falling back to scraper:", err.message);
      }
    }

    // Strategy 2: Scraper engine (Robust, supports modern lockup layout & browse continuations)
    if (!playlistData || !playlistData.videos || playlistData.videos.length === 0) {
      try {
        playlistData = await fetchPlaylistViaScrape(playlistId);
      } catch (err) {
        console.error("Scraper fetch failed:", err.message);
      }
    }

    if (!playlistData || !playlistData.videos || playlistData.videos.length === 0) {
      return NextResponse.json(
        {
          error:
            "Unable to retrieve playlist videos. The playlist may be private, deleted, or unlisted without public access.",
        },
        { status: 404 }
      );
    }

    const { title, channelName, thumbnailUrl, videos } = playlistData;

    // Calculate Durations
    const totalSeconds = videos.reduce((acc, v) => acc + (v.durationSeconds || 0), 0);
    const missingDurationCount = videos.filter((v) => !v.durationSeconds).length;
    const avgSeconds = videos.length > 0 ? Math.round(totalSeconds / videos.length) : 0;
    const totalHoursFloat = (totalSeconds / 3600).toFixed(2);

    // Speed Calculations Matrix
    const speeds = [1.0, 1.25, 1.5, 1.75, 2.0];
    const speedMatrix = speeds.map((speed) => {
      const speedSeconds = totalSeconds / speed;
      const hoursSavedFloat = Math.max(0, ((totalSeconds - speedSeconds) / 3600)).toFixed(2);
      return {
        speed: `${speed}x`,
        speedMultiplier: speed,
        durationSeconds: speedSeconds,
        durationFormatted: formatSecondsToDetailedText(speedSeconds),
        durationHMS: formatSecondsToHMS(speedSeconds),
        hoursSaved: hoursSavedFloat,
        hoursSavedFormatted: hoursSavedFloat > 0 ? `${hoursSavedFloat} hrs saved` : "Baseline",
      };
    });

    // Realistic Study Mode (1.5x of baseline time due to taking notes & practicing)
    const studyModeSeconds = totalSeconds * 1.5;
    const studyModeFormatted = formatSecondsToDetailedText(studyModeSeconds);

    // AI / Heuristic Concept Extraction
    const conceptAnalysis = await analyzePlaylistWithAI(title, videos, channelName);

    return NextResponse.json({
      success: true,
      playlist: {
        id: playlistId,
        title,
        channelName,
        thumbnailUrl,
        totalVideos: videos.length,
        totalSeconds,
        totalHours: totalHoursFloat,
        totalHMS: formatSecondsToHMS(totalSeconds),
        totalFormatted: formatSecondsToDetailedText(totalSeconds),
        avgDurationFormatted: formatSecondsToDetailedText(avgSeconds),
        missingDurationCount,
      },
      speedMatrix,
      studyMode: {
        durationSeconds: studyModeSeconds,
        durationFormatted: studyModeFormatted,
        explanation: "Accounts for pausing, note-taking, and hands-on coding/practice.",
      },
      conceptAnalysis,
      videos,
    });
  } catch (error) {
    console.error("YouTube Playlist Analyzer Route Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while analyzing the playlist." },
      { status: 500 }
    );
  }
}

export const POST = withAuthAndQuota({
  toolId: "youtube-playlist-analyzer",
  costInCredits: 1,
  allowGuestTrial: true,
  guestCost: 1,
}, handlePost);

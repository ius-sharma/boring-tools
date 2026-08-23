import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
import { withAuthAndQuota } from "../../../lib/auth/withAuthAndQuota";

export const runtime = "nodejs";
export const maxDuration = 120;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

let innertube = null;

async function getInnertubeClient() {
  if (!innertube) {
    try {
      innertube = await Innertube.create({
        lang: "en",
        location: "US",
        retrieve_player: false,
      });
    } catch (e) {
      console.error("Failed to initialize Innertube client:", e);
      innertube = null;
    }
  }
  return innertube;
}

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
  if (/^[a-zA-Z0-9_-]{10,50}$/.test(cleanInput)) {
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

async function fetchPlaylistDataScrape(playlistId) {
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

    const dataMatch = html.match(/var\s+ytInitialData\s*=\s*(\{.+?\});\s*(?:var|<\/script)/s);
    if (!dataMatch) return null;

    const ytData = JSON.parse(dataMatch[1]);
    
    // Extract Title
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
      const ogTitle = ogTitleMatch[1].replace(/ - YouTube$/, "");
      if (ogTitle && (title === "YouTube Playlist" || !title)) {
        title = ogTitle;
      }
    }

    // Extract Channel Name
    if (ytData?.sidebar?.playlistSidebarRenderer?.items) {
      for (const item of ytData.sidebar.playlistSidebarRenderer.items) {
        const owner = item?.playlistSidebarSecondaryInfoRenderer?.videoOwner?.videoOwnerRenderer;
        if (owner?.title?.runs?.[0]?.text) {
          channelName = owner.title.runs[0].text;
          break;
        }
      }
    }

    // Extract Videos across all rendering structures (lockupViewModel & playlistVideoRenderer)
    const videoItems = [];
    const contents = ytData?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;

    if (Array.isArray(contents)) {
      contents.forEach((item) => {
        // Format 1: playlistVideoRenderer
        if (item.playlistVideoRenderer) {
          const vr = item.playlistVideoRenderer;
          if (!vr.videoId) return;

          const vId = vr.videoId;
          const vTitle = vr.title?.runs?.[0]?.text || vr.title?.simpleText || `Video #${videoItems.length + 1}`;
          const durText = vr.lengthText?.simpleText || vr.lengthText?.runs?.[0]?.text || "0:00";
          const durSecs = parseInt(vr.lengthSeconds) || parseDurationTextToSeconds(durText);
          const thumb = vr.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;

          videoItems.push({
            index: videoItems.length + 1,
            videoId: vId,
            title: vTitle,
            durationText: durText,
            durationSeconds: durSecs,
            thumbnail: thumb,
            url: `https://www.youtube.com/watch?v=${vId}&list=${playlistId}`,
          });
        }
        // Format 2: lockupViewModel (Modern YouTube layout)
        else if (item.lockupViewModel) {
          const lm = item.lockupViewModel;
          const vId = lm.contentId || lm.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
          if (!vId) return;

          const vTitle = lm.metadata?.lockupMetadataViewModel?.title?.content || `Video #${videoItems.length + 1}`;
          const durText = extractLockupDuration(lm);
          const durSecs = parseDurationTextToSeconds(durText);
          const thumb = lm.contentImage?.thumbnailViewModel?.image?.sources?.[0]?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;

          videoItems.push({
            index: videoItems.length + 1,
            videoId: vId,
            title: vTitle,
            durationText: durText,
            durationSeconds: durSecs,
            thumbnail: thumb,
            url: `https://www.youtube.com/watch?v=${vId}&list=${playlistId}`,
          });
        }
      });
    }

    // Recursive search fallback if main items array didn't match
    if (videoItems.length === 0) {
      const seenIds = new Set();
      function deepSearch(obj) {
        if (!obj || typeof obj !== "object") return;
        if (obj.videoId && typeof obj.videoId === "string" && !seenIds.has(obj.videoId)) {
          seenIds.add(obj.videoId);
          const vId = obj.videoId;
          const vTitle = obj.title?.runs?.[0]?.text || obj.title?.simpleText || obj.title || `Video #${videoItems.length + 1}`;
          const durText = obj.lengthText?.simpleText || obj.lengthText?.runs?.[0]?.text || "0:00";
          const durSecs = parseInt(obj.lengthSeconds) || parseDurationTextToSeconds(durText);
          
          videoItems.push({
            index: videoItems.length + 1,
            videoId: vId,
            title: typeof vTitle === "string" ? vTitle : `Video #${videoItems.length + 1}`,
            durationText: durText,
            durationSeconds: durSecs,
            thumbnail: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
            url: `https://www.youtube.com/watch?v=${vId}&list=${playlistId}`,
          });
          return;
        }
        for (const key of Object.keys(obj)) {
          if (Array.isArray(obj[key])) {
            obj[key].forEach((child) => deepSearch(child));
          } else if (typeof obj[key] === "object") {
            deepSearch(obj[key]);
          }
        }
      }
      deepSearch(ytData);
    }

    if (videoItems.length > 0) {
      return {
        title,
        channelName,
        thumbnailUrl: thumbnailUrl || videoItems[0]?.thumbnail,
        videos: videoItems,
      };
    }
    return null;
  } catch (err) {
    console.error("Scrape playlist error:", err);
    return null;
  }
}

async function fetchPlaylistDataInnertube(playlistId) {
  try {
    const yt = await getInnertubeClient();
    if (!yt) return null;

    const playlist = await yt.getPlaylist(playlistId);
    if (!playlist || !playlist.info) return null;

    const title = playlist.info.title || "YouTube Playlist";
    const channelName = playlist.info.author?.name || "Creator";
    const thumbnailUrl = playlist.info.thumbnails?.[0]?.url;

    const videos = [];
    if (playlist.videos && Array.isArray(playlist.videos)) {
      playlist.videos.forEach((v, index) => {
        if (!v.id) return;
        const durationSecs = v.duration?.seconds || parseDurationTextToSeconds(v.duration?.text);
        videos.push({
          index: index + 1,
          videoId: v.id,
          title: v.title?.text || `Video #${index + 1}`,
          durationText: v.duration?.text || formatSecondsToHMS(durationSecs),
          durationSeconds: durationSecs,
          thumbnail: v.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${v.id}&list=${playlistId}`,
        });
      });
    }

    if (videos.length > 0) {
      return {
        title,
        channelName,
        thumbnailUrl: thumbnailUrl || videos[0]?.thumbnail,
        videos,
      };
    }
    return null;
  } catch (err) {
    console.error("Innertube playlist fetch error:", err);
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

    // Strategy 1: YouTube Data API v3 (Official & Fast)
    if (apiKey) {
      try {
        playlistData = await fetchPlaylistViaOfficialAPI(playlistId, apiKey);
      } catch (err) {
        console.warn("Official API fetch failed, falling back to Innertube:", err.message);
      }
    }

    // Strategy 2: Innertube scraper (Robust fallback without API keys)
    if (!playlistData || playlistData.videos.length === 0) {
      try {
        playlistData = await fetchPlaylistViaInnertube(playlistId);
      } catch (err) {
        console.error("Innertube fetch also failed:", err.message);
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

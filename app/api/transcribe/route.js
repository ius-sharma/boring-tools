import { NextResponse } from "next/server";
import { Readable } from "stream";

export const runtime = "nodejs";
export const maxDuration = 300;
const YTDL_CORE_PROMISE = import("@distube/ytdl-core");
const INSTAGRAM_DIRECT_PROMISE = import("instagram-url-direct");

function parseYoutubeCookies() {
  const jsonRaw = process.env.YOUTUBE_COOKIES_JSON || process.env.YOUTUBE_COOKIES;
  const stringRaw = process.env.YOUTUBE_COOKIES_STRING;

  if (jsonRaw) {
    try {
      const parsed = JSON.parse(jsonRaw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore json parse error and try string format
    }
  }

  if (stringRaw && typeof stringRaw === "string") {
    return stringRaw
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const eq = item.indexOf("=");
        if (eq <= 0) return null;
        const name = item.slice(0, eq).trim();
        const value = item.slice(eq + 1).trim();
        return {
          name,
          value,
          domain: ".youtube.com",
          path: "/",
          secure: true,
          httpOnly: false,
          hostOnly: false,
          sameSite: "lax",
        };
      })
      .filter(Boolean);
  }

  return [];
}

function isYoutubeBotChallenge(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("sign in to confirm you're not a bot") ||
    message.includes("confirm you\u2019re not a bot") ||
    message.includes("status code: 403") ||
    message.includes("could not extract functions")
  );
}

async function getInvidiousAudioUrl(videoId) {
  const instanceListUrl = "https://api.invidious.io/instances.json?sort_by=type,users";
  const preferredHosts = ["inv.thepixora.com", "invidious.nerdvpn.de", "yewtu.be"];
  let hosts = [];

  try {
    const listResponse = await fetch(instanceListUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (listResponse.ok) {
      const instances = await listResponse.json();
      hosts = instances
        .filter((item) => item?.[1]?.api === true && item?.[1]?.type === "https")
        .map((item) => item[0])
        .slice(0, 120);
    }
  } catch {
    // fall back to static hosts
  }

  const prioritizedHosts = [
    ...preferredHosts,
    ...hosts.filter((host) => !preferredHosts.includes(host)),
  ];

  for (const host of prioritizedHosts) {
    const url = `https://${host}/api/v1/videos/${videoId}?local=true`;
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        redirect: "follow",
      });
      if (!response.ok) continue;
      const payload = await response.json();
      const formats = (payload?.adaptiveFormats || [])
        .filter(
          (format) =>
            String(format?.type || "").startsWith("audio") &&
            Number.isFinite(Number(format?.itag))
        )
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

      const fallbackItags = [251, 250, 249, 140];
      const candidateItags = [
        ...formats.map((format) => Number(format.itag)).filter(Boolean),
        ...fallbackItags,
      ];
      const uniqueItags = [...new Set(candidateItags)].slice(0, 6);

      for (const itag of uniqueItags) {
        const candidateUrl = `https://${host}/latest_version?id=${videoId}&itag=${itag}&local=true`;
        const probe = await fetch(candidateUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Referer: `https://${host}/`,
            Range: "bytes=0-65535",
          },
        });
        if (probe.ok) {
          probe.body?.cancel();
          return candidateUrl;
        }
        probe.body?.cancel();
      }
    } catch {
      // try next instance
    }
  }

  throw new Error("No working Invidious instance returned an audio stream");
}

// Helper: Extract YouTube video ID from URL (including Shorts)
function extractYouTubeId(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com")) {
      // Check for YouTube Shorts: youtube.com/shorts/ID
      if (urlObj.pathname.includes("/shorts/")) {
        return urlObj.pathname.split("/shorts/")[1];
      }
      // Regular YouTube: youtube.com/watch?v=ID
      return urlObj.searchParams.get("v");
    } else if (urlObj.hostname.includes("youtu.be")) {
      // Short links: youtu.be/ID
      return urlObj.pathname.slice(1);
    }
  } catch {
    return null;
  }
}

// Helper: Extract Instagram media ID from URL
function extractInstagramMediaId(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("instagram.com")) {
      // Match patterns: /p/ID/, /reel/ID/, /tv/ID/
      const match = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
      if (match) {
        return {
          id: match[2],
          type: match[1], // 'p', 'reel', or 'tv'
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

// Helper: Check if URL is Instagram
function isInstagramUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("instagram.com");
  } catch {
    return false;
  }
}

// Helper: Fetch YouTube transcript using youtube-transcript-api
async function getYouTubeTranscript(videoId) {
  try {
    const { YoutubeTranscript } = await import("youtube-transcript");
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const text = transcript.map((item) => item.text).join(" ");
    return text;
  } catch (error) {
    console.log("YouTube transcript not available, will use AI transcription");
    return null;
  }
}

// Helper: Get video title from YouTube
async function getYouTubeTitle(videoId) {
  try {
    const ytdl = (await YTDL_CORE_PROMISE).default;
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    return info?.videoDetails?.title || `Video-${videoId.substring(0, 8)}`;
  } catch {
    return `Video-${videoId.substring(0, 8)}`;
  }
}

async function transcribeAudioBufferWithGroq(audioBuffer) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error("Groq API key not configured. Please set GROQ_API_KEY in environment variables.");
  }

  const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" });
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.mp3");
  formData.append("model", "whisper-large-v3-turbo");

  const groqResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: formData,
  });

  if (!groqResponse.ok) {
    const error = await groqResponse.json();
    throw new Error(error.error?.message || "Groq transcription failed");
  }

  const result = await groqResponse.json();
  return result.text;
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function hasDirectPlayableUrl(format) {
  return typeof format?.url === "string" && /^https?:\/\//.test(format.url);
}

function pickBestYouTubeFormat(ytdl, info) {
  const directFormats = (info?.formats || []).filter(hasDirectPlayableUrl);
  const audioOnly = ytdl
    .filterFormats(directFormats, "audioonly")
    .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));

  if (audioOnly.length) return audioOnly[0];

  // Some bot-checked videos only expose muxed formats. These still contain audio for Whisper.
  const muxedWithAudio = directFormats
    .filter((format) => format?.hasAudio)
    .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));

  return muxedWithAudio[0] || null;
}

async function getPlayableYouTubeInfo(ytdl, videoUrl, agent) {
  const requestOptions = {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  };

  const clientSets = [["WEB"], ["WEB_EMBEDDED", "WEB"], ["IOS", "WEB"], ["ANDROID", "WEB"]];
  let lastError = null;

  for (const playerClients of clientSets) {
    try {
      const info = await ytdl.getInfo(videoUrl, {
        requestOptions,
        playerClients,
        ...(agent ? { agent } : {}),
      });

      const selectedFormat = pickBestYouTubeFormat(ytdl, info);
      if (selectedFormat) {
        return { info, selectedFormat, requestOptions };
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  throw new Error("Failed to find any playable formats");
}

async function getYouTubeAudioBuffer(videoUrl) {
  const ytdl = (await YTDL_CORE_PROMISE).default;

  try {
    const { info, selectedFormat } = await getPlayableYouTubeInfo(ytdl, videoUrl);
    const audioStream = ytdl.downloadFromInfo(info, {
      format: selectedFormat,
      highWaterMark: 1 << 25,
    });
    return await streamToBuffer(Readable.from(audioStream));
  } catch (error) {
    if (!isYoutubeBotChallenge(error) && !String(error?.message || "").includes("playable formats")) {
      throw error;
    }

    const cookies = parseYoutubeCookies();
    if (!cookies.length) {
      throw new Error(
        "Sign in to confirm you're not a bot. Add YOUTUBE_COOKIES_JSON (cookie array) in Vercel env to unlock YouTube audio extraction."
      );
    }

    const agent = ytdl.createAgent(cookies);
    const { info, selectedFormat } = await getPlayableYouTubeInfo(ytdl, videoUrl, agent);
    const audioStream = ytdl.downloadFromInfo(info, {
      format: selectedFormat,
      highWaterMark: 1 << 25,
      agent,
    });
    return await streamToBuffer(Readable.from(audioStream));
  }
}

async function getYouTubeAudioBufferViaInvidious(videoUrl) {
  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) {
    throw new Error("Unable to extract YouTube video ID for fallback");
  }

  const audioUrl = await getInvidiousAudioUrl(videoId);
  const audioOrigin = new URL(audioUrl).origin;
  return fetchBinaryFromUrl(
    audioUrl,
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: `${audioOrigin}/`,
      },
    },
    3
  );
}

async function fetchBinaryFromUrl(url, options = {}, retries = 1) {
  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Failed to fetch media (${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to fetch media");
}

// Helper: Extract audio from Instagram/video URL using pure JS fetch/streams
async function getInstagramTranscript(instagramUrl) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error(
      "Instagram transcription requires Groq API key. Please set GROQ_API_KEY in .env.local"
    );
  }

  try {
    const { instagramGetUrl } = await INSTAGRAM_DIRECT_PROMISE;
    const mediaData = await instagramGetUrl(instagramUrl);
    const mediaUrl =
      mediaData?.media_details?.find((item) => item?.type === "video")?.url ||
      mediaData?.media_details?.[0]?.url ||
      mediaData?.url_list?.find(Boolean);

    if (!mediaUrl) {
      throw new Error("Instagram media URL not found");
    }

    const audioBuffer = await fetchBinaryFromUrl(mediaUrl, {
      headers: {
        Referer: instagramUrl,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    return await transcribeAudioBufferWithGroq(audioBuffer);
  } catch (error) {
    throw new Error(
      `Instagram processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

async function getYouTubeAudioTranscript(videoUrl) {
  try {
    const audioBuffer = await getYouTubeAudioBuffer(videoUrl);
    return await transcribeAudioBufferWithGroq(audioBuffer);
  } catch (error) {
    try {
      const audioBuffer = await getYouTubeAudioBufferViaInvidious(videoUrl);
      return await transcribeAudioBufferWithGroq(audioBuffer);
    } catch (fallbackError) {
      throw new Error(
        `YouTube audio transcription failed: ${error instanceof Error ? error.message : "Unknown error"}. Invidious fallback failed: ${fallbackError instanceof Error ? fallbackError.message : "Unknown error"}`
      );
    }
  }
}

// Helper: Extract Instagram media title from URL or metadata
async function getInstagramTitle(mediaId, mediaType) {
  try {
    // Return a descriptive title based on media type
    const typeLabel = mediaType === "reel" ? "Reel" : "Video";
    return `Instagram ${typeLabel}-${mediaId.substring(0, 8)}`;
  } catch {
    return "Instagram Video";
  }
}

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Check if YouTube URL (including Shorts)
    const youtubeId = extractYouTubeId(url);
    if (youtubeId) {
      // Try to get YouTube transcript first
      const transcript = await getYouTubeTranscript(youtubeId);
      if (transcript) {
        const title = await getYouTubeTitle(youtubeId);
        return NextResponse.json({
          transcript,
          title,
          source: "youtube",
        });
      }

      // If captions are unavailable, fall back to audio transcription.
      try {
        const transcript = await getYouTubeAudioTranscript(url);
        const title = await getYouTubeTitle(youtubeId);
        return NextResponse.json({
          transcript,
          title,
          source: "youtube-audio",
        });
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "This YouTube video doesn't have available captions and audio transcription failed.",
          },
          { status: 400 }
        );
      }
    }

    // Check if Instagram URL (posts, reels, TV)
    if (isInstagramUrl(url)) {
      const mediaInfo = extractInstagramMediaId(url);
      if (!mediaInfo) {
        return NextResponse.json(
          {
            error:
              "Invalid Instagram URL. Please provide a valid Instagram post, reel, or TV video URL.",
          },
          { status: 400 }
        );
      }

      try {
        const transcript = await getInstagramTranscript(url);
        const title = await getInstagramTitle(
          mediaInfo.id,
          mediaInfo.type
        );
        return NextResponse.json({
          transcript,
          title,
          source: "instagram",
          mediaType: mediaInfo.type,
        });
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Failed to process Instagram video. Make sure the video is publicly accessible and contains audio.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Unsupported URL. Please provide a YouTube (including Shorts) or Instagram video URL (posts, reels, or TV).",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to transcribe video",
      },
      { status: 500 }
    );
  }
}

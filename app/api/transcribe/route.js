import { NextResponse } from "next/server";
import { Readable } from "stream";

export const runtime = "nodejs";
export const maxDuration = 300;
const YTDL_CORE_PROMISE = import("@distube/ytdl-core");
const INSTAGRAM_DIRECT_PROMISE = import("instagram-url-direct");

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

async function getYouTubeAudioBuffer(videoUrl) {
  const ytdl = (await YTDL_CORE_PROMISE).default;
  const audioStream = ytdl(videoUrl, {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  });

  return streamToBuffer(Readable.from(audioStream));
}

async function fetchBinaryFromUrl(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch media (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
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
    throw new Error(
      `YouTube audio transcription failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
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

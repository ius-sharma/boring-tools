import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

export const runtime = "nodejs";
export const maxDuration = 300;

const execFileAsync = promisify(execFile);
const YTDLP_RELEASE_TAG = process.env.YTDLP_RELEASE_TAG || "2026.03.17";

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
    // This would require YouTube Data API key, skipping for now
    return `Video-${videoId.substring(0, 8)}`;
  } catch {
    return "Video";
  }
}

async function ensureYtDlpBinary() {
  const os = await import("os");
  const path = await import("path");
  const fs = await import("fs/promises");

  const tempDir = path.join(os.tmpdir(), "boring-tools-ytdlp");
  const binaryName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
  const binaryPath = path.join(tempDir, binaryName);

  try {
    await fs.access(binaryPath);
    return binaryPath;
  } catch {}

  await fs.mkdir(tempDir, { recursive: true });

  const assetName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
  const downloadUrl = `https://github.com/yt-dlp/yt-dlp/releases/download/${YTDLP_RELEASE_TAG}/${assetName}`;
  const response = await fetch(downloadUrl, {
    headers: {
      "User-Agent": "boring-tools-transcriber",
      Accept: "application/octet-stream",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download yt-dlp (${response.status}) from ${downloadUrl}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(binaryPath, buffer, { mode: 0o755 });
  if (process.platform !== "win32") {
    await fs.chmod(binaryPath, 0o755);
  }

  return binaryPath;
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

async function downloadAudioBufferWithYtDlp(videoUrl, baseNamePrefix) {
  const os = await import("os");
  const path = await import("path");
  const fs = await import("fs/promises");

  const tempDir = os.tmpdir();
  const baseName = `${baseNamePrefix}-${Date.now()}`;
  const outputTemplate = path.join(tempDir, `${baseName}.%(ext)s`);

  const binaryPath = await ensureYtDlpBinary();
  await execFileAsync(binaryPath, [
    "-f",
    "bestaudio",
    "-x",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "192",
    "-o",
    outputTemplate,
    "--no-warnings",
    "--quiet",
    videoUrl,
  ], { windowsHide: true, maxBuffer: 20 * 1024 * 1024 });

  const files = await fs.readdir(tempDir);
  const match = files.find((f) => f.startsWith(baseName));
  if (!match) {
    throw new Error("Failed to find audio file produced by yt-dlp");
  }

  const audioPath = path.join(tempDir, match);
  const audioBuffer = await fs.readFile(audioPath);

  try {
    await fs.unlink(audioPath);
  } catch {}

  return audioBuffer;
}

// Helper: Extract audio from Instagram/video URL using bundled yt-dlp
async function getInstagramTranscript(instagramUrl) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error(
      "Instagram transcription requires Groq API key. Please set GROQ_API_KEY in .env.local"
    );
  }

  try {
    const audioBuffer = await downloadAudioBufferWithYtDlp(instagramUrl, "insta-audio");
    return await transcribeAudioBufferWithGroq(audioBuffer);
  } catch (error) {
    throw new Error(
      `Instagram processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

async function getYouTubeAudioTranscript(videoUrl) {
  try {
    const audioBuffer = await downloadAudioBufferWithYtDlp(videoUrl, "yt-audio");
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

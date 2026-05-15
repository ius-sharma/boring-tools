import { NextResponse } from "next/server";

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

// Helper: Find a usable yt-dlp command. Tries env override and several fallbacks.
async function findYtDlpCommand() {
  const { execSync } = await import("child_process");
  const candidates = [
    { raw: process.env.YT_DLP_PATH },
    { raw: "yt-dlp" },
    { raw: "yt-dlp.exe" },
    { raw: "npx yt-dlp" },
    { raw: "python -m yt_dlp" },
    { raw: "python3 -m yt_dlp" },
  ];

  for (const c of candidates) {
    if (!c.raw) continue;
    try {
      // Test the candidate by asking for its version
      // execSync with a string will run in a shell which allows compound commands like 'python -m yt_dlp'
      execSync(`${c.raw} --version`, { stdio: "pipe" });
      // Split into command and prefix args
      const parts = c.raw.split(/\s+/).filter(Boolean);
      const cmd = parts.shift();
      const argsPrefix = parts;
      return { cmd, argsPrefix };
    } catch (_) {
      // try next candidate
    }
  }

  return null;
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

// Helper: Transcribe using Groq Whisper API
async function transcribeWithGroq(audioUrl) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error(
      "Groq API key not configured. Please set GROQ_API_KEY in environment variables."
    );
  }

  try {
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error("Failed to fetch audio from video");
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" });

    const formData = new FormData();
    formData.append("file", audioBlob, "audio.mp3");
    formData.append("model", "whisper-large-v3-turbo");

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: formData,
      }
    );

    if (!groqResponse.ok) {
      const error = await groqResponse.json();
      throw new Error(error.error?.message || "Groq transcription failed");
    }

    const result = await groqResponse.json();
    return result.text;
  } catch (error) {
    throw new Error(
      `Groq transcription error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Helper: Extract audio from Instagram/video URL using yt-dlp (local only)
async function getInstagramTranscript(instagramUrl) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error(
      "Instagram transcription requires Groq API key. Please set GROQ_API_KEY in .env.local"
    );
  }

  try {
    // Discover yt-dlp command (allow override via YT_DLP_PATH env var)
    const finder = await findYtDlpCommand();
    if (!finder) {
      throw new Error(
        "yt-dlp is not installed or not found in PATH. Install it (npm install -g yt-dlp or winget install yt-dlp) or set YT_DLP_PATH in your environment to the yt-dlp command."
      );
    }

    // Extract audio from Instagram video/reel
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const execFileAsync = promisify(execFile);

    const os = await import("os");
    const path = await import("path");
    const fs = await import("fs/promises");

    const tempDir = os.tmpdir();
    const baseName = `insta-audio-${Date.now()}`;
    const outputTemplate = path.join(tempDir, `${baseName}.%(ext)s`);

    try {
      // Download audio using discovered yt-dlp command
      // Enhanced options for better Instagram Reels support
      const ytArgs = [
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
        instagramUrl,
      ];

      // If finder has prefix args (like ['-m','yt_dlp'] for python), include them
      const cmd = finder.cmd;
      const args = [...(finder.argsPrefix || []), ...ytArgs];

      await execFileAsync(cmd, args);

      // Find the downloaded file (match by baseName)
      const files = await fs.readdir(tempDir);
      const match = files.find((f) => f.startsWith(baseName));
      if (!match) {
        throw new Error("Failed to find audio file produced by yt-dlp");
      }

      const audioPath = path.join(tempDir, match);
      const audioBuffer = await fs.readFile(audioPath);

      // Send to Groq Whisper
      const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" });
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.mp3");
      formData.append("model", "whisper-large-v3-turbo");

      const groqResponse = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: formData,
        }
      );

      if (!groqResponse.ok) {
        const error = await groqResponse.json();
        throw new Error(error.error?.message || "Groq transcription failed");
      }

      const result = await groqResponse.json();

      // Cleanup temp file
      try {
        await fs.unlink(audioPath);
      } catch {}

      return result.text;
    } catch (error) {
      // Cleanup any matching temp files on error
      try {
        const files = await fs.readdir(tempDir);
        for (const f of files) {
          if (f.startsWith(baseName)) {
            try {
              await fs.unlink(path.join(tempDir, f));
            } catch {}
          }
        }
      } catch {}
      throw error;
    }
  } catch (error) {
    throw new Error(
      `Instagram processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
      // If no transcript available
      return NextResponse.json(
        {
          error:
            "This YouTube video doesn't have available captions. AI transcription for YouTube requires additional setup.",
        },
        { status: 400 }
      );
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

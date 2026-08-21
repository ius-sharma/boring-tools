import { NextResponse } from "next/server";
import { Innertube, Platform } from "youtubei.js";

export const runtime = "nodejs";
export const maxDuration = 300;
const INSTAGRAM_DIRECT_PROMISE = import("instagram-url-direct");

// Provide JS evaluator for youtubei.js URL deciphering
Platform.shim.eval = async (data) => {
  return new Function(data.output)();
};

let innertube = null;

function getCookieString() {
  const cookieStr = process.env.YOUTUBE_COOKIES_STRING || process.env.YOUTUBE_COOKIE;
  if (cookieStr && typeof cookieStr === "string") return cookieStr.trim();

  const jsonRaw = process.env.YOUTUBE_COOKIES_JSON || process.env.YOUTUBE_COOKIES;
  if (jsonRaw) {
    try {
      const parsed = JSON.parse(jsonRaw);
      if (Array.isArray(parsed)) {
        return parsed.map((c) => `${c.name}=${c.value}`).join("; ");
      }
    } catch {
      // ignore json parse error
    }
  }
  return "";
}

async function getInnertubeClient() {
  if (!innertube) {
    const cookie = getCookieString();
    innertube = await Innertube.create({
      lang: "en",
      location: "US",
      retrieve_player: true,
      ...(cookie ? { cookie } : {}),
    });
  }
  return innertube;
}

// Helper: Extract YouTube video ID from URL (including Shorts)
function extractYouTubeId(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com")) {
      if (urlObj.pathname.includes("/shorts/")) {
        return urlObj.pathname.split("/shorts/")[1].split(/[?#&]/)[0];
      }
      if (urlObj.pathname.includes("/embed/")) {
        return urlObj.pathname.split("/embed/")[1].split(/[?#&]/)[0];
      }
      return urlObj.searchParams.get("v");
    } else if (urlObj.hostname.includes("youtu.be")) {
      return urlObj.pathname.slice(1).split(/[?#&]/)[0];
    }
  } catch {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    return match ? match[1] : null;
  }
  return null;
}

// Helper: Extract Instagram media ID from URL
function extractInstagramMediaId(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("instagram.com")) {
      const match = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
      if (match) {
        return {
          id: match[2],
          type: match[1],
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

function isInstagramUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("instagram.com");
  } catch {
    return false;
  }
}

// Helper: Decode XML entities
function decodeXmlEntities(text) {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

// Layer 1: Strategy A - youtube-transcript npm package
async function fetchViaYoutubeTranscript(videoId) {
  try {
    const { YoutubeTranscript } = await import("youtube-transcript");
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (transcript && transcript.length > 0) {
      return transcript.map((item) => item.text).join(" ").trim();
    }
  } catch {
    // Continue to next method
  }
  return null;
}

// Layer 1: Strategy B - Innertube getTranscript
async function fetchViaInnertubeTranscript(videoId) {
  try {
    const yt = await getInnertubeClient();
    const info = await yt.getInfo(videoId);
    const transcriptInfo = await info.getTranscript();
    const segments =
      transcriptInfo?.transcript?.content?.body?.initial_segments || [];
    if (segments.length > 0) {
      const texts = segments
        .map((s) => s?.snippet?.text || s?.text || "")
        .filter(Boolean);
      if (texts.length > 0) {
        return texts.join(" ").trim();
      }
    }
  } catch {
    // Continue to next method
  }
  return null;
}

// Layer 1: Strategy C - Direct YouTube timedtext caption extraction
async function fetchViaDirectCaptions(videoId) {
  try {
    const response = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );
    if (!response.ok) return null;
    const html = await response.text();

    const playerMatch = html.match(
      /var\s+ytInitialPlayerResponse\s*=\s*(\{.+?\});\s*(?:var|<\/script)/s
    );
    if (!playerMatch) return null;

    const playerData = JSON.parse(playerMatch[1]);
    const captionTracks =
      playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
      return null;
    }

    const preferredTrack =
      captionTracks.find((t) => t.languageCode === "en" || t.languageCode === "hi") ||
      captionTracks[0];

    if (!preferredTrack?.baseUrl) return null;

    const captionRes = await fetch(preferredTrack.baseUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!captionRes.ok) return null;
    const xml = await captionRes.text();

    const textMatches = [...xml.matchAll(/<text[^>]*>([^<]*)<\/text>/g)];
    if (textMatches.length > 0) {
      return textMatches
        .map((m) => decodeXmlEntities(m[1]))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
  } catch {
    // Fallback
  }
  return null;
}

// Master Caption Fetcher
async function getYouTubeTranscript(videoId) {
  // Strategy 1: youtube-transcript
  let text = await fetchViaYoutubeTranscript(videoId);
  if (text) return text;

  // Strategy 2: Innertube getTranscript
  text = await fetchViaInnertubeTranscript(videoId);
  if (text) return text;

  // Strategy 3: Direct timedtext captions
  text = await fetchViaDirectCaptions(videoId);
  if (text) return text;

  return null;
}

// Helper: Get video title from YouTube
async function getYouTubeTitle(videoId) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.title) return data.title;
    }
  } catch {
    // try Innertube
  }

  try {
    const yt = await getInnertubeClient();
    const info = await yt.getInfo(videoId);
    return info?.basic_info?.title || `Video-${videoId.substring(0, 8)}`;
  } catch {
    return `Video-${videoId.substring(0, 8)}`;
  }
}

async function transcribeAudioBufferWithGroq(audioBuffer, filename = "audio.mp3", mimeType = "audio/mp3") {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error(
      "Groq API key not configured. Please set GROQ_API_KEY in environment variables."
    );
  }

  const audioBlob = new Blob([audioBuffer], { type: mimeType || "audio/mp3" });
  const formData = new FormData();
  formData.append("file", audioBlob, filename || "audio.mp3");
  formData.append("model", "whisper-large-v3-turbo");

  const groqResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: formData,
  });

  if (!groqResponse.ok) {
    const error = await groqResponse.json().catch(() => ({}));
    throw new Error(error.error?.message || `Groq transcription failed (HTTP ${groqResponse.status})`);
  }

  const result = await groqResponse.json();
  return result.text;
}

async function fetchBinaryFromUrl(url, options = {}, retries = 2) {
  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Failed to fetch media (HTTP ${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to fetch media");
}

// Layer 2: Innertube audio buffer extraction
async function getYouTubeAudioBufferViaInnertube(videoId) {
  const yt = await getInnertubeClient();
  const info = await yt.getInfo(videoId);

  const streamingData = info.streaming_data;
  const allFormats = [
    ...(streamingData?.formats || []),
    ...(streamingData?.adaptive_formats || []),
  ];

  const audioFormats = allFormats
    .filter((f) => f.has_audio)
    .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

  const audioOnly = audioFormats.filter((f) => !f.has_video);
  const selectedFormat = audioOnly[0] || audioFormats[0];

  if (!selectedFormat) {
    throw new Error("No audio format found in YouTube stream");
  }

  let downloadUrl = selectedFormat.url;
  if (!downloadUrl && typeof selectedFormat.decipher === "function") {
    downloadUrl = await selectedFormat.decipher(yt.session?.player);
  }

  if (!downloadUrl) {
    throw new Error("Could not decipher audio URL");
  }

  return await fetchBinaryFromUrl(downloadUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    },
  });
}

// Layer 3: Cobalt API Fallback
async function getYouTubeAudioBufferViaCobalt(videoUrl) {
  const cobaltInstances = [
    "https://api.cobalt.tools",
    "https://cobalt-api.kwiatekm.tokyo",
    "https://cobalt.api.scip.io",
  ];

  for (const instance of cobaltInstances) {
    try {
      const response = await fetch(`${instance}/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        body: JSON.stringify({
          url: videoUrl,
          downloadMode: "audio",
          audioFormat: "mp3",
        }),
      });

      if (!response.ok) continue;
      const data = await response.json();
      const streamUrl = data.url || data.audio;
      if (streamUrl) {
        return await fetchBinaryFromUrl(streamUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
      }
    } catch {
      // try next cobalt instance
    }
  }

  throw new Error("All Cobalt instances failed");
}

// Layer 3: Piped API Fallback
async function getYouTubeAudioBufferViaPiped(videoId) {
  const pipedInstances = [
    "https://pipedapi.kavin.rocks",
    "https://api.piped.privacydev.net",
    "https://piped-api.lunar.icu",
    "https://api.piped.projectsegfau.lt",
  ];

  for (const instance of pipedInstances) {
    try {
      const res = await fetch(`${instance}/streams/${videoId}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const audioStreams = (data.audioStreams || []).sort(
        (a, b) => (b.bitrate || 0) - (a.bitrate || 0)
      );

      if (audioStreams.length > 0 && audioStreams[0].url) {
        return await fetchBinaryFromUrl(audioStreams[0].url, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
      }
    } catch {
      // try next instance
    }
  }

  throw new Error("All Piped instances failed");
}

// Layer 3: Invidious Fallback
async function getYouTubeAudioBufferViaInvidious(videoId) {
  const invidiousHosts = [
    "invidious.nerdvpn.de",
    "inv.tux.pizza",
    "invidious.drgns.space",
    "yt.artemislena.eu",
    "inv.thepixora.com",
    "yewtu.be",
  ];

  for (const host of invidiousHosts) {
    try {
      const url = `https://${host}/api/v1/videos/${videoId}?local=true`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
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

      const candidateItags = [
        ...formats.map((format) => Number(format.itag)).filter(Boolean),
        251,
        250,
        140,
      ];
      const uniqueItags = [...new Set(candidateItags)].slice(0, 4);

      for (const itag of uniqueItags) {
        const candidateUrl = `https://${host}/latest_version?id=${videoId}&itag=${itag}&local=true`;
        const buffer = await fetchBinaryFromUrl(
          candidateUrl,
          {
            headers: {
              "User-Agent": "Mozilla/5.0",
              Referer: `https://${host}/`,
            },
          },
          1
        );
        if (buffer && buffer.length > 1000) {
          return buffer;
        }
      }
    } catch {
      // try next instance
    }
  }

  throw new Error("All Invidious instances failed");
}

// Master Audio Transcriber with Resilient Multi-Layer Fallback
async function getYouTubeAudioBufferViaStreamService(videoUrl) {
  try {
    const initRes = await fetch(
      `https://loader.to/ajax/download.php?format=mp3&url=${encodeURIComponent(videoUrl)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        },
      }
    );

    if (!initRes.ok) throw new Error("Stream service initialization failed");
    const initData = await initRes.json();
    const jobId = initData?.id;
    if (!jobId) throw new Error("No job ID returned from stream service");

    // Poll for download url (up to 30 attempts ~ 36 seconds max)
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1200));
      const progRes = await fetch(
        `https://loader.to/ajax/progress.php?id=${jobId}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      if (!progRes.ok) continue;
      const progData = await progRes.json();

      if (progData.download_url) {
        return await fetchBinaryFromUrl(progData.download_url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
      }

      if (
        progData.text &&
        (progData.text.toLowerCase().includes("unavailable") ||
          progData.text.toLowerCase().includes("removed"))
      ) {
        throw new Error(progData.text);
      }
    }
  } catch (err) {
    throw err instanceof Error ? err : new Error("Stream extraction failed");
  }

  throw new Error("Stream service timed out waiting for audio buffer");
}

async function getYouTubeAudioTranscript(videoUrl, videoId) {
  let lastError = null;

  // 1. Try High-Speed Cloud Stream Extractor (100% works on Vercel/Cloud IPs)
  try {
    const audioBuffer = await getYouTubeAudioBufferViaStreamService(videoUrl);
    return await transcribeAudioBufferWithGroq(audioBuffer);
  } catch (err) {
    lastError = err;
  }

  // 2. Try Innertube direct decipher
  try {
    const audioBuffer = await getYouTubeAudioBufferViaInnertube(videoId);
    return await transcribeAudioBufferWithGroq(audioBuffer);
  } catch (err) {
    lastError = err;
  }

  // 3. Try Invidious API
  try {
    const audioBuffer = await getYouTubeAudioBufferViaInvidious(videoId);
    return await transcribeAudioBufferWithGroq(audioBuffer);
  } catch (err) {
    lastError = err;
  }

  throw new Error(
    `Audio transcription failed: YouTube blocked direct audio extraction and fallback streamers were unreachable. (Detail: ${
      lastError instanceof Error ? lastError.message : "Stream unreachable"
    }). Tip: You can also upload the audio/video file directly!`
  );
}

// Instagram Audio Extraction with Multi-Layer Fallback
function getInstagramCookieString() {
  const cookieStr = process.env.INSTAGRAM_COOKIE || process.env.INSTAGRAM_COOKIES;
  if (cookieStr && typeof cookieStr === "string") return cookieStr.trim();
  if (process.env.INSTAGRAM_SESSIONID) {
    return `sessionid=${process.env.INSTAGRAM_SESSIONID}`;
  }
  return "";
}

async function getInstagramMediaUrlViaDirect(instagramUrl) {
  try {
    const { instagramGetUrl } = await INSTAGRAM_DIRECT_PROMISE;
    const mediaData = await instagramGetUrl(instagramUrl);
    const mediaUrl =
      mediaData?.media_details?.find((item) => item?.type === "video")?.url ||
      mediaData?.media_details?.[0]?.url ||
      mediaData?.url_list?.find(Boolean);
    return mediaUrl || null;
  } catch {
    return null;
  }
}

async function getInstagramMediaUrlViaGraphQL(shortcode) {
  try {
    const cookie = getInstagramCookieString();
    const res = await fetch("https://www.instagram.com/graphql/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "X-IG-App-ID": "936619743392459",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: new URLSearchParams({
        variables: JSON.stringify({ shortcode }),
        doc_id: "9510064595728286",
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const media = data?.data?.xdt_shortcode_media;
    if (media?.is_video && media?.video_url) {
      return media.video_url;
    }
  } catch {
    // fallback
  }
  return null;
}

async function getInstagramTranscript(instagramUrl) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error(
      "Instagram transcription requires Groq API key. Please set GROQ_API_KEY in environment variables."
    );
  }

  let lastError = null;

  // 1. Try High-Speed Cloud Stream Service (Loader.to)
  try {
    const audioBuffer = await getYouTubeAudioBufferViaStreamService(instagramUrl);
    return await transcribeAudioBufferWithGroq(audioBuffer, "instagram_audio.mp3", "audio/mp3");
  } catch (err) {
    lastError = err;
  }

  // 2. Try direct media URL extractors (GraphQL with cookie support + instagram-url-direct)
  try {
    const mediaInfo = extractInstagramMediaId(instagramUrl);
    let mediaUrl = null;

    if (mediaInfo?.id) {
      mediaUrl = await getInstagramMediaUrlViaGraphQL(mediaInfo.id);
    }

    if (!mediaUrl) {
      mediaUrl = await getInstagramMediaUrlViaDirect(instagramUrl);
    }

    if (mediaUrl) {
      const audioBuffer = await fetchBinaryFromUrl(mediaUrl, {
        headers: {
          Referer: instagramUrl,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
      });
      return await transcribeAudioBufferWithGroq(audioBuffer, "instagram_video.mp4", "video/mp4");
    }
  } catch (err) {
    lastError = err;
  }

  throw new Error(
    `Instagram server restricted automated download for this Reel. You can easily upload the video/audio file below to get your transcript instantly!`
  );
}

async function getInstagramTitle(mediaId, mediaType) {
  try {
    const typeLabel = mediaType === "reel" ? "Reel" : "Video";
    return `Instagram ${typeLabel}-${mediaId.substring(0, 8)}`;
  } catch {
    return "Instagram Video";
  }
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle Direct File Upload (Multipart Form Data)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || typeof file === "string") {
        return NextResponse.json(
          { error: "Audio or video file is required." },
          { status: 400 }
        );
      }

      // Check file size (Groq limit is 25MB)
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size exceeds 25MB limit. Please upload a smaller file or convert to compressed audio." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      const transcript = await transcribeAudioBufferWithGroq(
        audioBuffer,
        file.name || "uploaded-audio.mp3",
        file.type || "audio/mp3"
      );

      return NextResponse.json({
        transcript,
        title: file.name ? file.name.replace(/\.[^/.]+$/, "") : "Uploaded File",
        source: "file-upload",
      });
    }

    // Handle URL Transcription (JSON)
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Check if YouTube URL (including Shorts)
    const youtubeId = extractYouTubeId(url);
    if (youtubeId) {
      // 1. Try to get official / auto-generated captions first (Fastest, 0 bandwidth)
      const transcript = await getYouTubeTranscript(youtubeId);
      if (transcript) {
        const title = await getYouTubeTitle(youtubeId);
        return NextResponse.json({
          transcript,
          title,
          source: "youtube-captions",
        });
      }

      // 2. If captions unavailable, fallback to audio stream transcription via Groq AI
      try {
        const transcript = await getYouTubeAudioTranscript(url, youtubeId);
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
                : "This YouTube video has no available captions and audio extraction failed. Try uploading the audio/video file directly.",
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
          "Unsupported URL. Please provide a YouTube (including Shorts) or Instagram video URL, or switch to the 'Upload File' tab.",
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

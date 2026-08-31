import { NextResponse } from "next/server";
import { Innertube, Platform } from "youtubei.js";
import { withAuthAndQuota } from "../../../lib/auth/withAuthAndQuota";

export const runtime = "nodejs";
export const maxDuration = 300;
const INSTAGRAM_DIRECT_PROMISE = import("instagram-url-direct");

// Provide JS evaluator for youtubei.js URL deciphering
Platform.shim.eval = async (data) => {
  return new Function(data.output)();
};

const innertubeClients = new Map();

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

async function getInnertubeClient(client = "WEB") {
  if (!innertubeClients.has(client)) {
    const cookie = getCookieString();
    const instance = await Innertube.create({
      client,
      lang: "en",
      location: "US",
      retrieve_player: true,
      ...(cookie ? { cookie } : {}),
    });
    innertubeClients.set(client, instance);
  }
  return innertubeClients.get(client);
}

function resetInnertubeClients() {
  innertubeClients.clear();
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
      const match = url.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
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
  let lastError = null;
  const clients = ["WEB", "ANDROID", "IOS", "TV_EMBEDDED"];

  for (const client of clients) {
    try {
      const yt = await getInnertubeClient(client);
      const info = await yt.getInfo(videoId, { client });
      const streamingData = info.streaming_data;
      const allFormats = [
        ...(streamingData?.formats || []),
        ...(streamingData?.adaptive_formats || []),
      ];

      // Do not depend only on has_audio: YouTube responses from alternate
      // clients may omit that flag while still exposing an audio MIME type.
      const audioFormats = allFormats
        .filter((format) => {
          const mimeType = String(format?.mime_type || format?.type || "").toLowerCase();
          return format?.has_audio === true || mimeType.startsWith("audio/") ||
            (!format?.has_video && Boolean(format?.audio_quality));
        })
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

      const selectedFormats = [
        ...audioFormats.filter((format) => format.has_video === false),
        ...audioFormats.filter((format) => format.has_video !== false),
      ];

      if (selectedFormats.length === 0) {
        throw new Error(`No audio format found for YouTube client ${client}`);
      }

      for (const format of selectedFormats) {
        try {
          const downloadUrl = typeof format.decipher === "function"
            ? await format.decipher(yt.session?.player)
            : format.url;
          if (!downloadUrl) continue;

          const audioBuffer = await fetchBinaryFromUrl(downloadUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            },
          });
          if (audioBuffer.length > 1000) return audioBuffer;
        } catch (error) {
          lastError = error;
        }
      }
    } catch (error) {
      lastError = error;
    }
  }

  resetInnertubeClients();
  throw lastError instanceof Error
    ? lastError
    : new Error("No usable YouTube audio format found");
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
  const staticHosts = [
    "inv.tux.pizza",
    "invidious.nerdvpn.de",
    "invidious.drgns.space",
    "yt.artemislena.eu",
    "yewtu.be",
  ];
  let discoveredHosts = [];

  try {
    const response = await fetch("https://api.invidious.io/instances.json?sort_by=type,users", {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) {
      const instances = await response.json();
      discoveredHosts = instances
        .filter((item) => item?.[1]?.api === true && item?.[1]?.type === "https")
        .map((item) => item[0]);
    }
  } catch {
    // Continue with the known static list.
  }

  const hosts = [...new Set([...staticHosts, ...discoveredHosts])].slice(0, 80);
  let lastError = null;

  for (const host of hosts) {
    try {
      const response = await fetch(`https://${host}/api/v1/videos/${videoId}?local=true`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) continue;

      const payload = await response.json();
      const formats = [
        ...(payload?.adaptiveFormats || []),
        ...(payload?.formatStreams || []),
      ]
        .filter((format) => {
          const type = String(format?.type || format?.mimeType || "").toLowerCase();
          return type.startsWith("audio/") && format?.url;
        })
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

      for (const format of formats) {
        try {
          const buffer = await fetchBinaryFromUrl(format.url, {
            headers: {
              "User-Agent": "Mozilla/5.0",
              Referer: `https://${host}/`,
            },
          }, 1);
          if (buffer.length > 1000) return buffer;
        } catch (error) {
          lastError = error;
        }
      }

      // Some older instances expose audio only through latest_version.
      const candidateItags = [
        ...formats.map((format) => Number(format.itag)).filter(Boolean),
        251, 250, 140,
      ];
      for (const itag of [...new Set(candidateItags)].slice(0, 6)) {
        try {
          const buffer = await fetchBinaryFromUrl(
            `https://${host}/latest_version?id=${videoId}&itag=${itag}&local=true`,
            {
              headers: {
                "User-Agent": "Mozilla/5.0",
                Referer: `https://${host}/`,
              },
            },
            1
          );
          if (buffer.length > 1000) return buffer;
        } catch (error) {
          lastError = error;
        }
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? new Error(`No working Invidious instance returned an audio stream: ${lastError.message}`)
    : new Error("No working Invidious instance returned an audio stream");
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
        signal: AbortSignal.timeout(12000),
      }
    );

    if (!initRes.ok) throw new Error("Stream service initialization failed");
    const initData = await initRes.json();
    const jobId = initData?.id;
    if (!jobId) throw new Error("No job ID returned from stream service");

    // Poll for a download URL for up to ~30 seconds
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const progRes = await fetch(
        `https://loader.to/ajax/progress.php?id=${jobId}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: AbortSignal.timeout(8000),
        }
      );

      if (!progRes.ok) continue;
      const progData = await progRes.json();

      if (progData.download_url) {
        return await fetchBinaryFromUrl(
          progData.download_url,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          },
          2,
          60000
        );
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

function shortcodeToInstagramPk(shortcode) {
  if (!shortcode || typeof shortcode !== "string") return null;
  try {
    let id = BigInt(0);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    for (let i = 0; i < shortcode.length; i++) {
      const char = shortcode[i];
      const val = BigInt(alphabet.indexOf(char));
      if (val === BigInt(-1)) return null;
      id = id * BigInt(64) + val;
    }
    return id.toString();
  } catch {
    return null;
  }
}

async function getInstagramMediaUrlsViaDirect(instagramUrl) {
  try {
    const { instagramGetUrl } = await INSTAGRAM_DIRECT_PROMISE;
    const mediaData = await instagramGetUrl(instagramUrl, { retries: 2, delay: 700 });
    const urls = [
      ...(mediaData?.media_details || [])
        .filter((item) => item?.type === "video" && item?.url)
        .map((item) => item.url),
      ...(mediaData?.url_list || []).filter(Boolean),
    ];
    return [...new Set(urls)];
  } catch {
    return [];
  }
}

function normalizeInstagramMediaUrl(value) {
  if (!value || typeof value !== "string") return null;
  const normalized = decodeXmlEntities(value)
    .replace(/\\\\\//g, "/")
    .replace(/\\u0026/gi, "&")
    .replace(/\\u002F/gi, "/")
    .replace(/\\u003D/gi, "=")
    .replace(/\\u003F/gi, "?");
  return normalized.startsWith("http") ? normalized : null;
}

async function getInstagramMediaUrlsViaMobileApi(shortcode) {
  const pk = shortcodeToInstagramPk(shortcode);
  if (!pk) return [];
  try {
    const cookie = getInstagramCookieString();
    const res = await fetch(`https://i.instagram.com/api/v1/media/${pk}/info/`, {
      headers: {
        "User-Agent":
          "Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2400; Xiaomi; M2012K11AC; alioth; qcom; en_US; 455243105)",
        "X-IG-App-ID": "936619743392459",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const item = data?.items?.[0];
    const urls = [];

    if (item?.video_versions?.length) {
      for (const v of item.video_versions) {
        if (v?.url) urls.push(v.url);
      }
    }

    if (item?.carousel_media?.length) {
      for (const cm of item.carousel_media) {
        for (const v of cm?.video_versions || []) {
          if (v?.url) urls.push(v.url);
        }
      }
    }

    return [...new Set(urls.map(normalizeInstagramMediaUrl).filter(Boolean))];
  } catch {
    return [];
  }
}

async function getInstagramMediaUrlsViaGraphQL(shortcode) {
  const docIds = [
    "9510064595728286",
    "8845758582119845",
    "7393437144078837",
    "1001786164500042",
  ];

  const cookie = getInstagramCookieString();

  for (const docId of docIds) {
    try {
      const res = await fetch("https://www.instagram.com/graphql/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          "X-IG-App-ID": "936619743392459",
          "X-ASBD-ID": "129477",
          "X-IG-WWW-Claim": "0",
          "X-Requested-With": "XMLHttpRequest",
          Referer: `https://www.instagram.com/p/${shortcode}/`,
          Origin: "https://www.instagram.com",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: new URLSearchParams({
          variables: JSON.stringify({ shortcode }),
          doc_id: docId,
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const media = data?.data?.xdt_shortcode_media;
      const urls = [];
      if (media?.is_video && media?.video_url) urls.push(media.video_url);
      for (const edge of media?.edge_sidecar_to_children?.edges || []) {
        if (edge?.node?.is_video && edge?.node?.video_url) {
          urls.push(edge.node.video_url);
        }
      }
      const valid = [...new Set(urls.map(normalizeInstagramMediaUrl).filter(Boolean))];
      if (valid.length > 0) return valid;
    } catch {
      // Continue to next docId
    }
  }
  return [];
}

async function getInstagramMediaUrlsViaApify(instagramUrl) {
  const token = process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN;
  if (!token) return [];

  try {
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directUrls: [instagramUrl],
          resultsType: "posts",
          resultsLimit: 1,
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!runRes.ok) return [];
    const items = await runRes.json();
    const urls = [];
    for (const item of items) {
      if (item?.videoUrl) urls.push(item.videoUrl);
      for (const child of item?.childPosts || []) {
        if (child?.videoUrl) urls.push(child.videoUrl);
      }
    }
    return [...new Set(urls.map(normalizeInstagramMediaUrl).filter(Boolean))];
  } catch {
    return [];
  }
}

async function getInstagramMediaUrlsViaPage(instagramUrl) {
  try {
    const response = await fetch(instagramUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        ...(getInstagramCookieString()
          ? { Cookie: getInstagramCookieString() }
          : {}),
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return [];
    const html = await response.text();
    const candidates = [];
    const patterns = [
      /<meta[^>]+property=["']og:video(?::secure_url)?["'][^>]+content=["']([^"']+)["']/gi,
      /["']video_url["']\s*:\s*["']([^"']+)["']/gi,
      /["']playback_url["']\s*:\s*["']([^"']+)["']/gi,
      /https?:\\?\/\\?\/[^"'\\s<>]+?\.mp4[^"'\\s<>]*/gi,
    ];
    for (const pattern of patterns) {
      for (const match of html.matchAll(pattern)) {
        const value = normalizeInstagramMediaUrl(match[1] || match[0]);
        if (value) candidates.push(value);
      }
    }
    return [...new Set(candidates)];
  } catch {
    return [];
  }
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

  // 2. Try Apify Actor if API token exists
  try {
    const apifyUrls = await getInstagramMediaUrlsViaApify(instagramUrl);
    for (const mediaUrl of apifyUrls) {
      try {
        const videoBuffer = await fetchBinaryFromUrl(mediaUrl, {}, 2, 60000);
        return await transcribeAudioBufferWithGroq(
          videoBuffer,
          "instagram_video.mp4",
          "video/mp4"
        );
      } catch (err) {
        lastError = err;
      }
    }
  } catch (err) {
    lastError = err;
  }

  // 3. Try multi-layer direct media extractors (Mobile API + GraphQL + Direct + Page Scraper)
  try {
    const mediaInfo = extractInstagramMediaId(instagramUrl);
    const mediaUrls = [];

    if (mediaInfo?.id) {
      mediaUrls.push(...(await getInstagramMediaUrlsViaMobileApi(mediaInfo.id)));
      mediaUrls.push(...(await getInstagramMediaUrlsViaGraphQL(mediaInfo.id)));
    }

    mediaUrls.push(...(await getInstagramMediaUrlsViaDirect(instagramUrl)));
    mediaUrls.push(...(await getInstagramMediaUrlsViaPage(instagramUrl)));
    const uniqueMediaUrls = [...new Set(mediaUrls)];

    if (uniqueMediaUrls.length === 0) {
      throw new Error("Instagram media URL not found");
    }

    for (const mediaUrl of uniqueMediaUrls) {
      try {
        const videoBuffer = await fetchBinaryFromUrl(
          mediaUrl,
          {
            headers: {
              Referer: instagramUrl,
              Accept: "video/mp4,video/webm,video/*;q=0.9,*/*;q=0.8",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            },
          },
          2,
          60000
        );
        return await transcribeAudioBufferWithGroq(
          videoBuffer,
          "instagram_video.mp4",
          "video/mp4"
        );
      } catch (err) {
        lastError = err;
      }
    }
  } catch (err) {
    lastError = err;
  }

  throw new Error(
    `Instagram server restricted automated download for this Reel. (Tip: Meta blocks server IP scraping on unauthenticated links. You can add INSTAGRAM_SESSIONID in .env.local for 100% bypass, or upload the audio/video file directly below!)`
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

async function handlePost(request) {
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

export const POST = withAuthAndQuota({
  toolId: "transcribe",
  costInCredits: 2,
  allowGuestTrial: true,
  guestCost: 1,
}, handlePost);

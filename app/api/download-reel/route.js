import { NextResponse } from "next/server";

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

function getInstagramCookieString() {
  const cookieStr = process.env.INSTAGRAM_COOKIE || process.env.INSTAGRAM_COOKIES;
  if (cookieStr && typeof cookieStr === "string") return cookieStr.trim();
  if (process.env.INSTAGRAM_SESSIONID) {
    return `sessionid=${process.env.INSTAGRAM_SESSIONID}`;
  }
  return "";
}

async function getUrlsViaYtDlp(url) {
  try {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);
    const ytdlpCommand = process.env.YT_DLP_PATH || "python -m yt_dlp";
    const { stdout } = await execAsync(`${ytdlpCommand} -g "${url}"`, { timeout: 20000 });
    const urls = stdout
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    return urls;
  } catch {
    return [];
  }
}

async function resolveInstagramVideoUrl(instagramUrl) {
  // Method 1: Local / Server yt-dlp Engine
  const ytdlpUrls = await getUrlsViaYtDlp(instagramUrl);
  if (ytdlpUrls.length > 0) {
    return ytdlpUrls[0];
  }

  const mediaInfo = extractInstagramMediaId(instagramUrl);
  const shortcode = mediaInfo?.id;
  const candidateUrls = [];

  // Method 2: Mobile App API
  if (shortcode) {
    const pk = shortcodeToInstagramPk(shortcode);
    if (pk) {
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
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          const data = await res.json();
          const item = data?.items?.[0];
          for (const v of item?.video_versions || []) {
            if (v?.url) candidateUrls.push(v.url);
          }
        }
      } catch {
        // continue
      }
    }
  }

  // Method 3: Multi-DocID GraphQL
  if (candidateUrls.length === 0 && shortcode) {
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
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          const data = await res.json();
          const media = data?.data?.xdt_shortcode_media;
          if (media?.video_url) candidateUrls.push(media.video_url);
          for (const edge of media?.edge_sidecar_to_children?.edges || []) {
            if (edge?.node?.video_url) candidateUrls.push(edge.node.video_url);
          }
          if (candidateUrls.length > 0) break;
        }
      } catch {
        // continue
      }
    }
  }

  // Method 4: Apify Scraper Actor (if token configured)
  if (candidateUrls.length === 0) {
    const token = process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN;
    if (token) {
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
            signal: AbortSignal.timeout(25000),
          }
        );

        if (runRes.ok) {
          const items = await runRes.json();
          for (const item of items) {
            if (item?.videoUrl) candidateUrls.push(item.videoUrl);
          }
        }
      } catch {
        // continue
      }
    }
  }

  const validUrls = [...new Set(candidateUrls.map(normalizeInstagramMediaUrl).filter(Boolean))];
  return validUrls[0] || null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Valid Instagram URL is required" }, { status: 400 });
    }

    const videoUrl = await resolveInstagramVideoUrl(url.trim());

    if (!videoUrl) {
      return NextResponse.json(
        {
          error:
            "Unable to automatically resolve direct video stream for this Reel. Please upload the video/audio file directly to transcribe!",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      videoUrl,
      title: "Instagram Reel",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to resolve video stream" },
      { status: 500 }
    );
  }
}

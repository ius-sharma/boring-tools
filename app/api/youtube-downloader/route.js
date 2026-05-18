import { NextResponse } from "next/server";
import { Innertube, Platform } from "youtubei.js";

export const runtime = "nodejs";
export const maxDuration = 300;

// Provide JS evaluator so youtubei.js can decipher YouTube stream URLs
Platform.shim.eval = async (data) => {
  return new Function(data.output)();
};

// Reuse Innertube instance across requests
let innertube = null;

async function getInnertubeClient() {
  if (!innertube) {
    innertube = await Innertube.create({
      lang: "en",
      location: "US",
      retrieve_player: true,
    });
  }
  return innertube;
}

function extractVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
}

// Reliable metadata via YouTube oEmbed (works everywhere)
async function getOembedData(videoId) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || null,
      channelName: data.author_name || null,
    };
  } catch {
    return null;
  }
}

// Scrape YouTube page for ALL data: metadata + formats + streaming data
async function scrapeYouTubePageData(videoId) {
  try {
    const res = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );
    if (!res.ok) return {};
    const html = await res.text();

    let result = { formats: [] };

    // Extract ytInitialPlayerResponse (contains videoDetails + streamingData)
    const playerMatch = html.match(
      /var\s+ytInitialPlayerResponse\s*=\s*(\{.+?\});\s*(?:var|<\/script)/s
    );
    if (playerMatch) {
      try {
        const playerData = JSON.parse(playerMatch[1]);

        // Video details (title, author, description, duration)
        const vd = playerData?.videoDetails;
        if (vd) {
          result.title = vd.title || null;
          result.channelName = vd.author || null;
          result.description = vd.shortDescription || null;
          result.duration = parseInt(vd.lengthSeconds) || 0;
          result.isLiveContent = vd.isLiveContent || false;
        }

        // Captions
        const captionTracks =
          playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (captionTracks && captionTracks.length > 0) {
          result.hasCaptions = true;
        }

        // Streaming data - extract format info
        const sd = playerData?.streamingData;
        if (sd) {
          const allRawFormats = [
            ...(sd.formats || []),
            ...(sd.adaptiveFormats || []),
          ];

          result.formats = allRawFormats
            .filter((f) => f.width && f.height) // video formats only
            .map((f) => ({
              itag: String(f.itag),
              quality: f.qualityLabel || `${f.height}p` || "Unknown",
              hasVideo: true,
              hasAudio: !!f.audioQuality,
              mimeType: f.mimeType || "video/mp4",
              fps: f.fps || 30,
              bitrate: f.bitrate || 0,
              filesize: f.contentLength
                ? parseInt(f.contentLength)
                : 0,
              filesizeApprox: f.contentLength
                ? parseInt(f.contentLength)
                : f.approxDurationMs && f.bitrate
                  ? Math.floor(
                      (f.bitrate * parseInt(f.approxDurationMs)) / 8000
                    )
                  : 0,
            }))
            .filter(
              (f, i, arr) =>
                arr.findIndex((x) => x.quality === f.quality) === i
            )
            .sort((a, b) => {
              const aRes = parseInt(a.quality) || 0;
              const bRes = parseInt(b.quality) || 0;
              return bRes - aRes;
            })
            .slice(0, 8);
        }
      } catch (e) {
        console.error("Failed to parse ytInitialPlayerResponse:", e.message);
      }
    }

    // Fallback: extract title from meta tags
    if (!result.title) {
      const titleMatch = html.match(
        /<meta\s+name="title"\s+content="([^"]*?)"/
      );
      if (titleMatch) result.title = titleMatch[1];
    }

    return result;
  } catch (e) {
    console.error("Page scrape error:", e.message);
    return {};
  }
}

// Check if yt-dlp is available on the system (local dev)
let ytdlpAvailable = null;
async function isYtdlpAvailable() {
  if (ytdlpAvailable !== null) return ytdlpAvailable;
  try {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);
    await execAsync("yt-dlp --version");
    ytdlpAvailable = true;
  } catch {
    ytdlpAvailable = false;
  }
  return ytdlpAvailable;
}

async function getVideoInfo(videoId) {
  // Fetch oEmbed + page scrape + innertube ALL in parallel
  const [oembed, pageScrape, innertubeResult] = await Promise.allSettled([
    getOembedData(videoId),
    scrapeYouTubePageData(videoId),
    (async () => {
      const yt = await getInnertubeClient();
      return await yt.getInfo(videoId);
    })(),
  ]);

  const oembedData = oembed.status === "fulfilled" ? oembed.value : null;
  const pageData = pageScrape.status === "fulfilled" ? pageScrape.value : {};

  let innertubeDetails = {};
  let innertubeFormats = [];

  if (innertubeResult.status === "fulfilled" && innertubeResult.value) {
    const info = innertubeResult.value;
    innertubeDetails = info.basic_info || {};

    // Extract formats from innertube
    const streamingData = info.streaming_data;
    const allFormats = [
      ...(streamingData?.formats || []),
      ...(streamingData?.adaptive_formats || []),
    ];

    innertubeFormats = allFormats
      .filter((f) => f.has_video)
      .map((f) => ({
        itag: String(f.itag),
        quality: f.quality_label || `${f.height}p` || "Unknown",
        hasVideo: f.has_video,
        hasAudio: f.has_audio,
        mimeType: f.mime_type || "video/mp4",
        fps: f.fps || 30,
        bitrate: f.bitrate || 0,
        filesize: f.content_length ? parseInt(f.content_length) : 0,
        filesizeApprox: f.content_length
          ? parseInt(f.content_length)
          : f.approx_duration_ms && f.bitrate
            ? Math.floor((f.bitrate * parseInt(f.approx_duration_ms)) / 8000)
            : 0,
      }))
      .filter(
        (f, i, arr) => arr.findIndex((x) => x.quality === f.quality) === i
      )
      .sort((a, b) => {
        const aRes = parseInt(a.quality) || 0;
        const bRes = parseInt(b.quality) || 0;
        return bRes - aRes;
      })
      .slice(0, 8);
  } else {
    console.error(
      "youtubei.js failed:",
      innertubeResult.reason?.message
    );
    innertube = null;
  }

  // Merge metadata: innertube > pageScrape > oembed
  const title =
    innertubeDetails.title ||
    pageData.title ||
    oembedData?.title ||
    "Unknown";
  const channelName =
    innertubeDetails.author ||
    innertubeDetails.channel?.name ||
    pageData.channelName ||
    oembedData?.channelName ||
    "Unknown";
  const description =
    innertubeDetails.short_description || pageData.description || "";
  const duration =
    innertubeDetails.duration || pageData.duration || 0;

  // Use innertube formats first, fallback to page scrape formats
  const formats =
    innertubeFormats.length > 0
      ? innertubeFormats
      : pageData.formats || [];

  // Best thumbnail: try innertube first (highest res), then known URL patterns
  let bestThumbnail = "";
  const innertubeThumb = innertubeDetails.thumbnail || [];
  if (Array.isArray(innertubeThumb) && innertubeThumb.length > 0) {
    const sorted = [...innertubeThumb].sort(
      (a, b) => (b.width || 0) - (a.width || 0)
    );
    bestThumbnail = sorted[0]?.url || "";
  }
  if (!bestThumbnail) {
    // Use hqdefault (always exists) rather than maxresdefault (may 404)
    bestThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  // Captions
  const hasCaptions = pageData.hasCaptions || false;

  // If no title from ANY source, video is unavailable
  if (title === "Unknown" && !oembedData && !pageData.title) {
    throw new Error("This video is unavailable or private.");
  }

  return {
    videoId,
    title,
    description,
    duration,
    channelName,
    thumbnail: bestThumbnail,
    formats,
    captions: hasCaptions ? "Available" : "Not Available",
    isLiveContent: innertubeDetails.is_live || pageData.isLiveContent || false,
  };
}

// Download via yt-dlp (local dev only)
async function downloadViaYtdlp(videoId, itag) {
  const { spawn } = await import("child_process");
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  return new Promise((resolve) => {
    const proc = spawn("yt-dlp", [
      "--remote-components",
      "ejs:github",
      "-f",
      itag,
      "-o",
      "-",
      "--no-part",
      "--no-cache-dir",
      url,
    ]);

    const headers = {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="video-${videoId}.mp4"`,
      "Transfer-Encoding": "chunked",
    };

    const stream = new ReadableStream({
      start(controller) {
        proc.stdout.on("data", (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        proc.stdout.on("end", () => {
          controller.close();
        });

        proc.stderr.on("data", (data) => {
          console.error("yt-dlp stderr:", data.toString());
        });

        proc.on("error", (err) => {
          try {
            controller.error(err);
          } catch (_) {}
        });

        proc.on("close", (code) => {
          if (code !== 0) {
            try {
              controller.error(new Error(`yt-dlp exited with code ${code}`));
            } catch (_) {}
          }
        });
      },
    });

    resolve(new NextResponse(stream, { headers }));
  });
}

// Download via youtubei.js decipher (fallback)
async function downloadViaYoutubei(videoId, itag) {
  const yt = await getInnertubeClient();
  const info = await yt.getInfo(videoId);

  const streamingData = info.streaming_data;
  const allFormats = [
    ...(streamingData?.formats || []),
    ...(streamingData?.adaptive_formats || []),
  ];

  const format = allFormats.find((f) => String(f.itag) === String(itag));

  if (!format) {
    throw new Error("Format not found");
  }

  let downloadUrl = format.url;
  if (!downloadUrl && typeof format.decipher === "function") {
    downloadUrl = await format.decipher(yt.session?.player);
  }

  if (!downloadUrl) {
    throw new Error(
      "Could not generate download URL. YouTube blocks automated downloads from cloud servers."
    );
  }

  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error(
      "YouTube blocked the download request. This is a limitation of cloud-hosted servers."
    );
  }

  const headers = {
    "Content-Type": format.mime_type || "video/mp4",
    "Content-Disposition": `attachment; filename="video-${videoId}.mp4"`,
  };

  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    headers["Content-Length"] = contentLength;
  }

  return new NextResponse(response.body, { headers });
}

async function handleDownload(videoId, itag) {
  if (await isYtdlpAvailable()) {
    return await downloadViaYtdlp(videoId, itag);
  }

  try {
    return await downloadViaYoutubei(videoId, itag);
  } catch (err) {
    console.error("youtubei.js download failed:", err.message);
    innertube = null;
    throw new Error(
      "Direct video download is not available on this server. YouTube blocks downloads from cloud servers. Please use the video info to download via other tools like yt-dlp."
    );
  }
}

export async function POST(request) {
  try {
    const { url, action, itag } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    if (action === "getInfo") {
      try {
        const videoInfo = await getVideoInfo(videoId);
        return NextResponse.json(videoInfo);
      } catch (err) {
        console.error("Failed to get video info:", err.message);
        return NextResponse.json(
          {
            error:
              err.message ||
              "Failed to fetch video information. Please check if URL is valid.",
          },
          { status: 400 }
        );
      }
    }

    if (action === "download") {
      if (!itag) {
        return NextResponse.json(
          { error: "Format ID is required" },
          { status: 400 }
        );
      }

      try {
        return await handleDownload(videoId, itag);
      } catch (err) {
        console.error("Download failed:", err.message);
        return NextResponse.json(
          { error: err.message || "Failed to download video" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("YouTube Downloader Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const reqUrl = new URL(request.url);
    const params = reqUrl.searchParams;
    const url = params.get("url");
    const itag = params.get("itag");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    if (!itag) {
      return NextResponse.json(
        { error: "Format ID is required" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    try {
      return await handleDownload(videoId, itag);
    } catch (err) {
      console.error("GET download failed:", err?.message);
      return NextResponse.json(
        { error: err?.message || "Failed to download" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("YouTube Downloader GET Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

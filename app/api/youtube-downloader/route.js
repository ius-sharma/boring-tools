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

async function getVideoInfoViaYoutubei(videoId) {
  try {
    const yt = await getInnertubeClient();
    const info = await yt.getInfo(videoId);

    const details = info.basic_info;

    const streamingData = info.streaming_data;
    const allFormats = [
      ...(streamingData?.formats || []),
      ...(streamingData?.adaptive_formats || []),
    ];

    const formats = allFormats
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

    // Get best thumbnail - pick the LARGEST one
    const thumbnails = details.thumbnail || [];
    let bestThumbnail = "";
    if (Array.isArray(thumbnails) && thumbnails.length > 0) {
      const sorted = [...thumbnails].sort(
        (a, b) => (b.width || 0) - (a.width || 0)
      );
      bestThumbnail = sorted[0]?.url || "";
    } else if (thumbnails?.url) {
      bestThumbnail = thumbnails.url;
    }

    if (!bestThumbnail) {
      bestThumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }

    const hasCaptions =
      info.captions?.caption_tracks && info.captions.caption_tracks.length > 0;

    return {
      videoId: details.id || videoId,
      title: details.title || "Unknown",
      description: details.short_description || "",
      duration: details.duration || 0,
      channelName: details.author || details.channel?.name || "Unknown",
      thumbnail: bestThumbnail,
      formats: formats,
      captions: hasCaptions ? "Available" : "Not Available",
      isLiveContent: details.is_live || false,
    };
  } catch (err) {
    console.error("youtubei.js error:", err.message);
    innertube = null;
    throw new Error(`Failed to fetch video: ${err.message}`);
  }
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

// Download via youtubei.js decipher (fallback for Vercel)
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

  // Try to decipher URL
  let downloadUrl = format.url;
  if (!downloadUrl && typeof format.decipher === "function") {
    downloadUrl = await format.decipher(yt.session?.player);
  }

  if (!downloadUrl) {
    throw new Error(
      "Could not generate download URL. YouTube blocks automated downloads from cloud servers."
    );
  }

  // Proxy the download through our server
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
  // Try yt-dlp first (works locally)
  if (await isYtdlpAvailable()) {
    return await downloadViaYtdlp(videoId, itag);
  }

  // Try youtubei.js decipher (may work on some servers)
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
        const videoInfo = await getVideoInfoViaYoutubei(videoId);
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

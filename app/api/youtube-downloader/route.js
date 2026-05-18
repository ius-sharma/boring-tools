import { NextResponse } from "next/server";
import { Readable } from "stream";
import ytdl from "ytdl-core";

export const runtime = "nodejs";
export const maxDuration = 300;

async function getVideoInfoViaYtdl(url) {
  try {
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;

    const formats = info.formats
      .filter((f) => f.hasVideo || f.hasAudio)
      .map((f) => ({
        itag: String(f.itag),
        quality: f.qualityLabel || `${f.height}p` || "Unknown",
        hasVideo: f.hasVideo,
        hasAudio: f.hasAudio,
        mimeType: f.mimeType || "video/mp4",
        fps: f.fps || 30,
        bitrate: f.bitrate || 0,
        filesize: f.contentLength ? parseInt(f.contentLength) : 0,
        filesizeApprox: f.contentLength ? parseInt(f.contentLength) : 0,
        audioBitrate: f.audioBitrate || 0,
      }))
      .filter((f, i, arr) => arr.findIndex((x) => x.quality === f.quality) === i)
      .sort((a, b) => {
        const aRes = parseInt(a.quality) || 0;
        const bRes = parseInt(b.quality) || 0;
        return bRes - aRes;
      })
      .slice(0, 8);

    return {
      videoId: videoDetails.videoId,
      title: videoDetails.title,
      description: videoDetails.shortDescription || "",
      duration: parseInt(videoDetails.lengthSeconds) || 0,
      channelName: videoDetails.author?.name || "Unknown",
      thumbnail: videoDetails.thumbnails?.[videoDetails.thumbnails.length - 1]?.url || "",
      formats: formats,
      captions: info.captions && info.captions.length > 0 ? "Available" : "Not Available",
      isLiveContent: videoDetails.isLiveContent || false,
    };
  } catch (err) {
    console.error("ytdl-core error:", err.message);
    throw new Error(`Failed to fetch video: ${err.message}`);
  }
}


export async function POST(request) {
  try {
    const { url, action, itag } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Extract video ID from various YouTube URL formats
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    if (!videoIdMatch) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    if (action === "getInfo") {
      try {
        const videoInfo = await getVideoInfoViaYtdl(url);
        return NextResponse.json(videoInfo);
      } catch (err) {
        console.error("Failed to get video info:", err.message);
        return NextResponse.json(
          { 
            error: err.message || "Failed to fetch video information. Please check if URL is valid and video is accessible." 
          },
          { status: 400 }
        );
      }
    }

    if (action === "download") {
      if (!itag) {
        return NextResponse.json({ error: "Format ID is required" }, { status: 400 });
      }

      try {
        const info = await ytdl.getInfo(url);
        const format = info.formats.find((f) => String(f.itag) === String(itag));

        if (!format) {
          return NextResponse.json({ error: "Format not found" }, { status: 400 });
        }

        const stream = ytdl.downloadFromInfo(info, { format });
        let body = stream;
        
        try {
          body = Readable.toWeb(stream);
        } catch (e) {
          console.warn("Could not convert stream to web stream", e?.message);
        }

        const headers = {
          "Content-Type": format.mimeType || "video/mp4",
          "Content-Disposition": `attachment; filename="video-${videoIdMatch[1]}.mp4"`,
        };

        return new NextResponse(body, { headers });
      } catch (err) {
        console.error("Failed to download:", err.message);
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
      return NextResponse.json({ error: "Format ID is required" }, { status: 400 });
    }

    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    const id = videoIdMatch ? videoIdMatch[1] : "video";

    try {
      const info = await ytdl.getInfo(url);
      const format = info.formats.find((f) => String(f.itag) === String(itag));

      if (!format) {
        return NextResponse.json({ error: "Format not found" }, { status: 400 });
      }

      const stream = ytdl.downloadFromInfo(info, { format });
      let body = stream;
      
      try {
        body = Readable.toWeb(stream);
      } catch (e) {
        console.warn("Could not convert stream to web stream in GET", e?.message);
      }

      const headers = {
        "Content-Type": format.mimeType || "video/mp4",
        "Content-Disposition": `attachment; filename="video-${id}.mp4"`,
      };

      return new NextResponse(body, { headers });
    } catch (err) {
      console.error("GET download failed:", err?.message);
      return NextResponse.json({ error: err?.message || "Failed to download" }, { status: 500 });
    }
  } catch (error) {
    console.error("YouTube Downloader GET Error:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { Readable } from "stream";
import play from "play-dl";

export const runtime = "nodejs";
export const maxDuration = 300;

async function getVideoInfoViaPlayDl(url) {
  try {
    const video = await play.video_info(url);

    // Extract available formats/qualities
    const formats = (video.format || [])
      .map((f, idx) => ({
        itag: String(idx),
        quality: f.quality_label || `${f.height}p` || "Unknown",
        hasVideo: !!f.video_codec,
        hasAudio: !!f.audio_codec,
        mimeType: f.mime_type || "video/mp4",
        fps: f.fps || 30,
        bitrate: f.bitrate || 0,
        filesize: f.content_length ? parseInt(f.content_length) : 0,
        filesizeApprox: f.content_length ? parseInt(f.content_length) : 0,
      }))
      .filter((f, i, arr) => arr.findIndex((x) => x.quality === f.quality) === i)
      .sort((a, b) => {
        const aRes = parseInt(a.quality) || 0;
        const bRes = parseInt(b.quality) || 0;
        return bRes - aRes;
      })
      .slice(0, 8);

    return {
      videoId: video.video_id,
      title: video.title || "",
      description: video.description || "",
      duration: video.duration || 0,
      channelName: video.channel?.name || "Unknown",
      thumbnail: video.thumbnails?.length ? video.thumbnails[0].url : "",
      formats: formats,
      captions: video.live ? "Not Available" : "Available",
      isLiveContent: video.live || false,
    };
  } catch (err) {
    console.error("play-dl error:", err.message);
    throw new Error(`Failed to fetch video: ${err.message}`);
  }
}


export async function POST(request) {
  try {
    const { url, action } = await request.json();

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
        const videoInfo = await getVideoInfoViaPlayDl(url);
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
      try {
        // play-dl streams the video directly
        const stream = await play.stream(url);

        let body = stream.stream;
        try {
          body = Readable.toWeb(body);
        } catch (e) {
          console.warn("Could not convert stream to web stream", e?.message);
        }

        const headers = {
          "Content-Type": "video/mp4",
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

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    const id = videoIdMatch ? videoIdMatch[1] : "video";

    try {
      const stream = await play.stream(url);
      let body = stream.stream;
      
      try {
        body = Readable.toWeb(body);
      } catch (e) {
        console.warn("Could not convert stream to web stream in GET", e?.message);
      }

      const headers = {
        "Content-Type": "video/mp4",
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

import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { Readable } from "stream";
import fs from "fs";
import { promises as fsPromises } from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

const execFilePromise = promisify(execFile);

export const runtime = "nodejs";
export const maxDuration = 300;

async function getVideoInfoViaYtDlp(url) {
  try {
    // Try to get info using yt-dlp command
    const { stdout } = await execFilePromise("yt-dlp", [
      "--dump-json",
      "--no-warnings",
      url,
    ]);

    const videoData = JSON.parse(stdout);

    return {
      videoId: videoData.id,
      title: videoData.title,
      description: videoData.description || "",
      duration: videoData.duration || 0,
      channelName: videoData.uploader || videoData.channel || "Unknown",
      thumbnail: videoData.thumbnail || "",
      formats: videoData.formats
        ?.filter((f) => f.format_note && !f.format_note.includes("storyboard"))
        .map((f) => ({
          itag: f.format_id,
          quality: f.format_note || f.height ? `${f.height}p` : "Unknown",
          hasVideo: f.vcodec !== "none",
          hasAudio: f.acodec !== "none",
          mimeType: f.mime_type || "video/mp4",
          fps: f.fps || 30,
          bitrate: f.bitrate || 0,
          filesize: f.filesize || 0,
          filesizeApprox: f.filesize_approx || 0,
          audioBitrate: f.abr || 0,
        }))
        .filter((f) => f.hasVideo || f.hasAudio)
        .filter((f, i, arr) => arr.findIndex((x) => x.quality === f.quality) === i)
        .sort((a, b) => {
          const aRes = parseInt(a.quality) || 0;
          const bRes = parseInt(b.quality) || 0;
          return bRes - aRes;
        })
        .slice(0, 8) || [],
      captions: videoData.subtitles ? "Available" : "Not Available",
      isLiveContent: videoData.is_live || false,
    };
  } catch (err) {
    console.error("yt-dlp error:", err.message);
    throw new Error(`Failed to fetch video: ${err.message}`);
  }
}

function formatBytes(bytes) {
  if (!bytes || Number.isNaN(bytes)) return "Unknown size";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

async function downloadVideoViaYtDlp(url, formatId, preferMerge = false) {
  try {
    // Stream mode: spawn yt-dlp and return its stdout as the stream.
    return new Promise((resolve, reject) => {
      let args;
      if (preferMerge) {
        args = ["-f", `${formatId}+bestaudio/best`, "--merge-output-format", "mp4", "-o", "-", "--no-warnings", url];
      } else {
        args = ["-f", formatId, "-o", "-", "--no-warnings", url];
      }

      const child = execFile("yt-dlp", args, { maxBuffer: 1024 * 1024 * 10 });

      let errorOutput = "";

      // Collect stderr for diagnostics but do not buffer stdout to avoid memory blowup
      child.stderr?.on("data", (data) => {
        errorOutput += data.toString();
      });

      child.on("error", (err) => {
        reject(new Error(`Failed to start download: ${err.message}`));
      });

      // Resolve immediately with the stdout stream. Caller will consume it.
      if (!child.stdout) {
        reject(new Error("yt-dlp did not provide a stdout stream"));
        return;
      }

      // Attach a listener to propagate child exit errors if they happen before consumer finishes
      child.on("close", (code, signal) => {
        if (code !== 0) {
          const msg = errorOutput || `Exit code ${code}${signal ? ` signal ${signal}` : ""}`;
          // emit error on the stdout stream to help consumers detect it
          try {
            child.stdout.emit && child.stdout.emit('error', new Error(msg));
          } catch (_) {}
        }
      });

      resolve({ stream: child.stdout, mimeType: "video/mp4" });
    });
  } catch (err) {
    throw new Error(`Download error: ${err.message}`);
  }
}

async function downloadToTempFile(url, formatId, preferMerge = false) {
  const tmpDir = os.tmpdir();
  const filename = `yt-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.mp4`;
  const outPath = path.join(tmpDir, filename);

  return new Promise((resolve, reject) => {
    let args;
    if (preferMerge) {
      args = ["-f", `${formatId}+bestaudio/best`, "--merge-output-format", "mp4", "-o", outPath, "--no-warnings", url];
    } else {
      args = ["-f", formatId, "-o", outPath, "--no-warnings", url];
    }

    const child = execFile("yt-dlp", args, { maxBuffer: 1024 * 1024 * 10 });

    let stderr = "";
    child.stderr?.on("data", (d) => (stderr += d.toString()));

    child.on("error", (err) => reject(new Error(`yt-dlp failed: ${err.message}`)));

    child.on("close", async (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp exit ${code}: ${stderr || "unknown"}`));
        return;
      }

      try {
        const stat = await fsPromises.stat(outPath);
        resolve({ path: outPath, size: stat.size });
      } catch (e) {
        reject(new Error(`Failed to access downloaded file: ${e.message}`));
      }
    });
  });
}

export async function POST(request) {
  try {
    const { url, action, itag, hasAudio } = await request.json();

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
        const videoInfo = await getVideoInfoViaYtDlp(url);
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
        const videoInfo = await getVideoInfoViaYtDlp(url);
        const selectedFormat = videoInfo.formats.find((format) => String(format.itag) === String(itag));
        const { stream, mimeType } = await downloadVideoViaYtDlp(url, itag, !hasAudio);

        const estimatedSize = selectedFormat
          ? Number(selectedFormat.filesize || selectedFormat.filesizeApprox || 0)
          : 0;

        // Try streaming first; if that fails, download to a temp file and serve it with Content-Length
        try {
          let body = stream;
          try {
            body = Readable.toWeb(stream);
          } catch (e) {
            console.warn("Could not convert stream to web stream, falling back to node stream response", e?.message);
          }

          const headers = {
            "Content-Type": mimeType,
            "Content-Disposition": `attachment; filename="video-${videoIdMatch[1]}.mp4"`,
          };

          // Do NOT set Content-Length for the direct streaming response; let it be chunked.
          return new NextResponse(body, { headers });
        } catch (streamErr) {
          console.warn("Stream approach failed, falling back to temp file:", streamErr?.message);
        }

        // Fallback: download to temp file then stream file with Content-Length header
        const tmp = await downloadToTempFile(url, itag, !hasAudio);
        const fileStream = fs.createReadStream(tmp.path);
        const headers = {
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="video-${videoIdMatch[1]}.mp4"`,
          "Content-Length": String(tmp.size),
        };

        fileStream.on("close", () => {
          fsPromises.unlink(tmp.path).catch(() => {});
        });

        let bodyStream = fileStream;
        try {
          bodyStream = Readable.toWeb(fileStream);
        } catch (e) {
          console.warn("Could not convert file stream to web stream", e?.message);
        }

        return new NextResponse(bodyStream, { headers });
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
    const hasAudio = params.get("hasAudio") === "true";

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    if (!itag) {
      return NextResponse.json({ error: "Format ID is required" }, { status: 400 });
    }

    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    const id = videoIdMatch ? videoIdMatch[1] : "video";

    try {
      // Use same try/fallback behavior as POST: try streaming first, then temp-file fallback.
      // For browser-initiated GET downloads, use the temp-file path to ensure
      // a stable Content-Length header is provided. This avoids intermittent
      // browser "Failed - Network error" issues caused by streamed responses
      // that may close prematurely or be misinterpreted by some clients.
      const tmp = await downloadToTempFile(url, itag, !hasAudio);
      const fileStream = fs.createReadStream(tmp.path);
      const headers = {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="video-${id}.mp4"`,
        "Content-Length": String(tmp.size),
      };

      fileStream.on("close", () => {
        fsPromises.unlink(tmp.path).catch(() => {});
      });

      let bodyStream = fileStream;
      try {
        bodyStream = Readable.toWeb(fileStream);
      } catch (e) {
        console.warn("Could not convert file stream to web stream", e?.message);
      }

      return new NextResponse(bodyStream, { headers });
    } catch (err) {
      console.error("GET download failed:", err?.message);
      return NextResponse.json({ error: err?.message || "Failed to download" }, { status: 500 });
    }
  } catch (error) {
    console.error("YouTube Downloader GET Error:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}

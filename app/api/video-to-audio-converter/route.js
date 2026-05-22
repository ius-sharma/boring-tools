import { NextResponse } from "next/server";
import ffmpegPath from "ffmpeg-static";
import { createReadStream, createWriteStream } from "fs";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { spawn } from "child_process";

export const runtime = "nodejs";
export const maxDuration = 300;

const ENABLED = true;
const MAX_UPLOAD_SIZE_BYTES = 4 * 1024 * 1024;
const MAX_UPLOAD_SIZE_LABEL = "4 MB";

const SUPPORTED_FORMATS = {
  mp3: {
    extension: "mp3",
    mimeType: "audio/mpeg",
    args: ["-c:a", "libmp3lame"],
    acceptsBitrate: true,
  },
  m4a: {
    extension: "m4a",
    mimeType: "audio/mp4",
    args: ["-c:a", "aac", "-movflags", "+faststart"],
    acceptsBitrate: true,
  },
  wav: {
    extension: "wav",
    mimeType: "audio/wav",
    args: ["-c:a", "pcm_s16le"],
    acceptsBitrate: false,
  },
  flac: {
    extension: "flac",
    mimeType: "audio/flac",
    args: ["-c:a", "flac"],
    acceptsBitrate: false,
  },
};

const SUPPORTED_BITRATES = new Set(["96", "128", "160", "192", "256", "320"]);

function sanitizeBaseName(name) {
  return String(name || "uploaded-video")
    .replace(/\.[^.]+$/, "")
    .replace(/[<>:\"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "uploaded-video";
}

function getErrorMessage(error) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Unable to process the uploaded video.";
}

function isPayloadTooLargeError(error) {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("payload too large") ||
    message.includes("function_payload_too_large") ||
    message.includes("413") ||
    message.includes("request entity too large")
  );
}

function getUploadTooLargeMessage() {
  return `File too large. The hosted converter accepts files up to ${MAX_UPLOAD_SIZE_LABEL}. Use a smaller file or run the app locally for larger uploads.`;
}

async function saveUploadedFile(file, targetPath) {
  await pipeline(Readable.fromWeb(file.stream()), createWriteStream(targetPath));
}

function runFfmpeg(inputPath, outputPath, formatConfig, bitrate) {
  if (!ffmpegPath) {
    return Promise.reject(
      new Error("FFmpeg binary is not available for this platform.")
    );
  }

  const audioArgs = [...formatConfig.args];
  if (formatConfig.acceptsBitrate) {
    audioArgs.push("-b:a", `${bitrate}k`);
  }

  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-nostdin",
    "-y",
    "-i",
    inputPath,
    "-map",
    "0:a:0",
    "-vn",
    ...audioArgs,
    outputPath,
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = "";

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("error", (error) => reject(error));

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const cleaned = stderr.trim();
      reject(
        new Error(
          cleaned || `FFmpeg exited with code ${code}. The file may not contain an audio track.`
        )
      );
    });
  });
}

export async function POST(request) {
  if (!ENABLED) {
    return NextResponse.json({ error: "Tool is currently unavailable." }, { status: 404 });
  }
  let tempDir = null;
  let streamCreated = false;

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: getUploadTooLargeMessage() },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const requestedFormat = String(formData.get("format") || "mp3").toLowerCase();
    const requestedBitrate = String(formData.get("bitrate") || "192");

    if (!file || typeof file === "string" || typeof file.stream !== "function") {
      return NextResponse.json(
        { error: "Please upload a video file first." },
        { status: 400 }
      );
    }

    if (!(file.type?.startsWith("video/") || file.type?.startsWith("audio/"))) {
      return NextResponse.json(
        { error: "Please upload a valid video or audio file." },
        { status: 400 }
      );
    }

    if (typeof file.size === "number" && file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: getUploadTooLargeMessage() },
        { status: 413 }
      );
    }

    const formatConfig = SUPPORTED_FORMATS[requestedFormat];
    if (!formatConfig) {
      return NextResponse.json(
        { error: "Unsupported output format." },
        { status: 400 }
      );
    }

    const bitrate = SUPPORTED_BITRATES.has(requestedBitrate)
      ? requestedBitrate
      : "192";

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "boring-tools-audio-"));

    const fileName = sanitizeBaseName(file.name || "uploaded-video");
    const inputExtension = path.extname(file.name || "") || ".mp4";
    const inputPath = path.join(tempDir, `input${inputExtension}`);
    const outputPath = path.join(tempDir, `${fileName}.${formatConfig.extension}`);

    await saveUploadedFile(file, inputPath);
    await runFfmpeg(inputPath, outputPath, formatConfig, bitrate);

    const outputStats = await fs.stat(outputPath);
    const outputStream = createReadStream(outputPath);
    const cleanup = async () => {
      if (tempDir) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        tempDir = null;
      }
    };

    outputStream.on("close", cleanup);
    outputStream.on("error", cleanup);
    streamCreated = true;

    return new NextResponse(Readable.toWeb(outputStream), {
      headers: {
        "Content-Type": formatConfig.mimeType,
        "Content-Disposition": `attachment; filename="${fileName}.${formatConfig.extension}"`,
        "Content-Length": String(outputStats.size),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Video to audio conversion failed:", error);

    if (isPayloadTooLargeError(error)) {
      return NextResponse.json(
        { error: getUploadTooLargeMessage() },
        { status: 413 }
      );
    }

    const message = getErrorMessage(error);
    if (message.includes("matches no streams") || message.includes("does not contain any stream")) {
      return NextResponse.json(
        {
          error: "No audio track was found in this file. Try a different video or extract from a file that contains audio.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  } finally {
    if (tempDir && !streamCreated) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const binDir = path.join(rootDir, "node_modules", "yt-dlp-exec", "bin");
const binaryName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
const binaryPath = path.join(binDir, binaryName);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadBinary(targetPath) {
  const releaseTag = process.env.YTDLP_RELEASE_TAG || "2026.03.17";
  const assetName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
  const url = `https://github.com/yt-dlp/yt-dlp/releases/download/${releaseTag}/${assetName}`;

  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  const response = await fetch(url, {
    headers: {
      "User-Agent": "boring-tools-build-script",
      Accept: "application/octet-stream",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download yt-dlp (${response.status}) from ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(targetPath, buffer, { mode: 0o755 });

  if (process.platform !== "win32") {
    await fs.chmod(targetPath, 0o755);
  }
}

async function main() {
  if (await exists(binaryPath)) {
    return;
  }

  // On Windows the package postinstall usually provides yt-dlp.exe; on Linux/Vercel
  // we download the matching standalone binary here so serverless deploys don't
  // fail with ENOENT when yt-dlp-exec tries to spawn the executable.
  await downloadBinary(binaryPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
import fs from "fs";
import path from "path";
import https from "https";
import crypto from "crypto";

const TARGET_DIR = path.resolve("public/fonts/handwriting");
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 11 handwriting fonts used in BoringTools
const fontFamilies = [
  "Caveat:wght@400;700",
  "Dancing+Script:wght@400;700",
  "Homemade+Apple",
  "Indie+Flower",
  "Reenie+Beanie",
  "Shadows+Into+Light",
  "Architects+Daughter",
  "Patrick+Hand",
  "Gochi+Hand",
  "Sacramento",
  "Marck+Script",
];

const cssUrl = `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f}`).join("&")}&display=swap`;

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(fetchText(res.headers.location));
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }
    ).on("error", reject);
  });
}

function downloadBinary(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(downloadBinary(res.headers.location, destPath));
        }
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on("finish", () => {
          fileStream.close();
          resolve();
        });
      }
    ).on("error", reject);
  });
}

async function run() {
  console.log("Fetching Google Fonts CSS from:", cssUrl);
  const rawCss = await fetchText(cssUrl);

  const urlRegex = /url\((https:\/\/[^)]+)\)/g;
  let match;
  const urls = new Set();
  while ((match = urlRegex.exec(rawCss)) !== null) {
    urls.add(match[1]);
  }

  console.log(`Found ${urls.size} unique font file URLs to download.`);

  const urlMap = new Map();
  let counter = 1;

  for (const remoteUrl of urls) {
    // Derive a clean, readable name from url
    const urlHash = crypto.createHash("md5").update(remoteUrl).digest("hex").slice(0, 8);
    const parsedPath = path.basename(new URL(remoteUrl).pathname);
    const ext = path.extname(parsedPath) || ".woff2";
    const fileName = `font-${counter++}-${urlHash}${ext}`;
    const localFilePath = path.join(TARGET_DIR, fileName);

    console.log(`Downloading (${counter - 1}/${urls.size}): ${remoteUrl} -> ${fileName}`);
    await downloadBinary(remoteUrl, localFilePath);
    urlMap.set(remoteUrl, `/fonts/handwriting/${fileName}`);
  }

  // Replace all remote URLs in rawCss with local paths
  let localizedCss = rawCss;
  for (const [remoteUrl, localUrl] of urlMap.entries()) {
    localizedCss = localizedCss.replaceAll(remoteUrl, localUrl);
  }

  const cssPath = path.join(TARGET_DIR, "fonts.css");
  fs.writeFileSync(cssPath, localizedCss, "utf8");

  // Clean up any extraneous or old font files in TARGET_DIR
  const currentFiles = fs.readdirSync(TARGET_DIR);
  for (const f of currentFiles) {
    if (f !== "fonts.css" && !f.startsWith("font-")) {
      fs.unlinkSync(path.join(TARGET_DIR, f));
    }
  }

  console.log(`\nSuccessfully wrote ${cssPath} with all local assets and cleaned up extra files!`);
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

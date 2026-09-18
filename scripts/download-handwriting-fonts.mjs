import fs from "fs";
import path from "path";
import https from "https";

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

  const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
  let match;
  let localCss = "";

  const downloadedMap = new Map();

  while ((match = fontFaceRegex.exec(rawCss)) !== null) {
    const block = match[1];

    const familyMatch = block.match(/font-family:\s*['"]?([^'";]+)['"]?/i);
    const styleMatch = block.match(/font-style:\s*([^;]+);/i);
    const weightMatch = block.match(/font-weight:\s*([^;]+);/i);
    const srcMatch = block.match(/src:\s*url\((https:\/\/[^)]+)\)\s*format\(['"]?([^'"]+)['"]?\)/i);

    if (familyMatch && srcMatch) {
      const family = familyMatch[1].trim();
      const style = styleMatch ? styleMatch[1].trim() : "normal";
      const weight = weightMatch ? weightMatch[1].trim() : "400";
      const remoteUrl = srcMatch[1].trim();
      const format = srcMatch[2].trim();

      const safeFamilyName = family.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const safeFileName = `${safeFamilyName}-${weight}-${style}.${format === "woff2" ? "woff2" : "woff"}`;
      const localFilePath = path.join(TARGET_DIR, safeFileName);
      const publicUrl = `/fonts/handwriting/${safeFileName}`;

      if (!downloadedMap.has(remoteUrl)) {
        console.log(`Downloading font: ${family} (${weight}, ${style}) -> ${safeFileName}`);
        await downloadBinary(remoteUrl, localFilePath);
        downloadedMap.set(remoteUrl, publicUrl);
      }

      localCss += `@font-face {
  font-family: '${family}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  src: url('${downloadedMap.get(remoteUrl)}') format('${format}');
}

`;
    }
  }

  const cssPath = path.join(TARGET_DIR, "fonts.css");
  fs.writeFileSync(cssPath, localCss, "utf8");
  console.log(`Successfully generated ${cssPath} with ${downloadedMap.size} fonts.`);
}

run().catch((err) => {
  console.error("Failed to download fonts:", err);
  process.exit(1);
});

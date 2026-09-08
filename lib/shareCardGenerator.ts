"use client";

export type CardType = "roast" | "reaction" | "typing";
export type CardTheme = "white" | "dark" | "sunset" | "mint";

export interface RoastCardData {
  type: "roast";
  todo: string;
  roast: string;
  action: string;
  level: string;
}

export interface ReactionCardData {
  type: "reaction";
  timeMs: number;
  rating: string;
  percentile?: string;
  mode?: string;
}

export interface TypingCardData {
  type: "typing";
  wpm: number;
  accuracy: number;
  rank: string;
  chars?: number;
}

export type ShareCardData = RoastCardData | ReactionCardData | TypingCardData;

export interface ThemeConfig {
  id: CardTheme;
  name: string;
  bgGradStart: string;
  bgGradEnd: string;
  outerBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  verifiedBg: string;
  verifiedText: string;
  verifiedBorder: string;
  footerLine: string;
  footerText: string;
}

export const THEME_CONFIGS: Record<CardTheme, ThemeConfig> = {
  white: {
    id: "white",
    name: "Core White",
    bgGradStart: "#ffffff",
    bgGradEnd: "#f8fafc",
    outerBorder: "#e2e8f0",
    textPrimary: "#0f172a",
    textSecondary: "#334155",
    textMuted: "#64748b",
    accent: "#ea580c",
    cardBg: "#f8fafc",
    cardBorder: "#e2e8f0",
    badgeBg: "#fff7ed",
    badgeText: "#c2410c",
    badgeBorder: "#fed7aa",
    verifiedBg: "#f1f5f9",
    verifiedText: "#475569",
    verifiedBorder: "#cbd5e1",
    footerLine: "#f1f5f9",
    footerText: "#64748b",
  },
  dark: {
    id: "dark",
    name: "Dark Slate",
    bgGradStart: "#090d16",
    bgGradEnd: "#0f172a",
    outerBorder: "rgba(255, 255, 255, 0.09)",
    textPrimary: "#ffffff",
    textSecondary: "#e2e8f0",
    textMuted: "#94a3b8",
    accent: "#f97316",
    cardBg: "rgba(255, 255, 255, 0.04)",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    badgeBg: "rgba(249, 115, 22, 0.15)",
    badgeText: "#fb923c",
    badgeBorder: "rgba(249, 115, 22, 0.35)",
    verifiedBg: "rgba(255, 255, 255, 0.06)",
    verifiedText: "#94a3b8",
    verifiedBorder: "rgba(255, 255, 255, 0.12)",
    footerLine: "rgba(255, 255, 255, 0.08)",
    footerText: "#64748b",
  },
  sunset: {
    id: "sunset",
    name: "Warm Sunset",
    bgGradStart: "#fffaf5",
    bgGradEnd: "#ffedd5",
    outerBorder: "#fed7aa",
    textPrimary: "#431407",
    textSecondary: "#7c2d12",
    textMuted: "#9a3412",
    accent: "#ea580c",
    cardBg: "#ffffff",
    cardBorder: "#fed7aa",
    badgeBg: "#ea580c",
    badgeText: "#ffffff",
    badgeBorder: "#ea580c",
    verifiedBg: "#ffffff",
    verifiedText: "#9a3412",
    verifiedBorder: "#fed7aa",
    footerLine: "#fed7aa",
    footerText: "#9a3412",
  },
  mint: {
    id: "mint",
    name: "Fresh Mint",
    bgGradStart: "#f0fdf4",
    bgGradEnd: "#dcfce7",
    outerBorder: "#bbf7d0",
    textPrimary: "#064e3b",
    textSecondary: "#065f46",
    textMuted: "#047857",
    accent: "#059669",
    cardBg: "#ffffff",
    cardBorder: "#bbf7d0",
    badgeBg: "#059669",
    badgeText: "#ffffff",
    badgeBorder: "#059669",
    verifiedBg: "#ffffff",
    verifiedText: "#047857",
    verifiedBorder: "#bbf7d0",
    footerLine: "#bbf7d0",
    footerText: "#047857",
  },
};

/**
 * Wraps text into multiple lines given a max width on canvas context.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Draws rounded rectangle on canvas
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const FONT_SANS = "system-ui, -apple-system, sans-serif";
const FONT_MONO = "monospace";

let cachedLogoImg: HTMLImageElement | null = null;

/**
 * Loads the official BoringTools logo image from /boringtools-logo.png
 */
function getLogoImage(): Promise<HTMLImageElement> {
  if (cachedLogoImg && cachedLogoImg.complete && cachedLogoImg.naturalWidth > 0) {
    return Promise.resolve(cachedLogoImg);
  }
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Window not available"));
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      cachedLogoImg = img;
      resolve(img);
    };
    img.onerror = (err) => reject(err);
    img.src = "/boringtools-logo.png";
  });
}

/**
 * Generates an aesthetic branded share card as a PNG data URL.
 * Defaults to "white" (Core BoringTools theme).
 */
export async function generateShareCard(
  data: ShareCardData,
  themeId: CardTheme = "white"
): Promise<string> {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  const theme = THEME_CONFIGS[themeId] || THEME_CONFIGS.white;

  // 1. Background Fill
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, theme.bgGradStart);
  bgGrad.addColorStop(1, theme.bgGradEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle accent ambient glow in top-right
  if (themeId === "dark") {
    const glow = ctx.createRadialGradient(width * 0.82, 110, 10, width * 0.82, 110, 420);
    glow.addColorStop(0, "rgba(249, 115, 22, 0.14)");
    glow.addColorStop(1, "rgba(249, 115, 22, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  } else if (themeId === "white") {
    const glow = ctx.createRadialGradient(width * 0.88, 90, 10, width * 0.88, 90, 360);
    glow.addColorStop(0, "rgba(234, 88, 12, 0.05)");
    glow.addColorStop(1, "rgba(234, 88, 12, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Outer Card Border Frame
  ctx.strokeStyle = theme.outerBorder;
  ctx.lineWidth = 2;
  roundRect(ctx, 36, 36, width - 72, height - 72, 24);
  ctx.stroke();

  // 3. Top Header: Official BoringTools Brand Logo & Category
  const headerY = 88;
  const leftMargin = 76;
  const logoW = 34;
  const logoH = 38;
  const logoY = headerY - 28;

  try {
    const logoImg = await getLogoImage();
    if (logoImg.naturalWidth === 1024) {
      // Crop to the crisp BT monogram inside the 1024x1024 image
      ctx.drawImage(logoImg, 320, 270, 380, 424, leftMargin, logoY, logoW, logoH);
    } else {
      ctx.drawImage(logoImg, leftMargin, logoY, logoW, logoH);
    }
  } catch (err) {
    // Fallback if logo fails to load
    ctx.fillStyle = theme.accent;
    roundRect(ctx, leftMargin, headerY - 24, 32, 32, 8);
    ctx.fill();
  }

  // Logo text
  ctx.font = `bold 24px ${FONT_SANS}`;
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText("BoringTools", leftMargin + logoW + 12, headerY);

  const logoWidth = ctx.measureText("BoringTools").width;
  ctx.font = `500 15px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText("• 100% In-Browser & Private", leftMargin + logoW + 12 + logoWidth + 14, headerY);

  // Top Right "Verified Result" Pill Badge
  const badgeText = "VERIFIED RESULT";
  ctx.font = `bold 12px ${FONT_SANS}`;
  const badgeWidth = ctx.measureText(badgeText).width + 36;
  const badgeX = width - leftMargin - badgeWidth;
  const badgeY = headerY - 20;

  ctx.fillStyle = theme.verifiedBg;
  roundRect(ctx, badgeX, badgeY, badgeWidth, 34, 17);
  ctx.fill();
  ctx.strokeStyle = theme.verifiedBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Green verified dot
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(badgeX + 16, badgeY + 17, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = theme.verifiedText;
  ctx.font = `bold 12px ${FONT_SANS}`;
  ctx.fillText(badgeText, badgeX + 26, badgeY + 21);

  // 4. Content Rendering Based On Type
  const contentStartY = 150;
  const contentWidth = width - leftMargin * 2;

  if (data.type === "roast") {
    // Mode Tag
    const modeText = `TODO ROAST • ${data.level.toUpperCase()} MODE`;
    ctx.font = `bold 12px ${FONT_SANS}`;
    const modeWidth = ctx.measureText(modeText).width + 24;
    ctx.fillStyle = theme.badgeBg;
    roundRect(ctx, leftMargin, contentStartY, modeWidth, 28, 14);
    ctx.fill();
    ctx.strokeStyle = theme.badgeBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.badgeText;
    ctx.fillText(modeText, leftMargin + 12, contentStartY + 18);

    // Pending Task Card
    const taskBoxY = contentStartY + 40;
    const taskBoxHeight = 74;
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, leftMargin, taskBoxY, contentWidth, taskBoxHeight, 14);
    ctx.fill();
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.textMuted;
    ctx.font = `bold 11px ${FONT_SANS}`;
    ctx.fillText("PENDING TASK:", leftMargin + 20, taskBoxY + 26);

    ctx.fillStyle = theme.textPrimary;
    ctx.font = `600 19px ${FONT_SANS}`;
    const todoLines = wrapText(ctx, data.todo, contentWidth - 44);
    ctx.fillText(todoLines[0] || data.todo, leftMargin + 20, taskBoxY + 52);

    // Roast Blockquote Area
    const roastStartY = taskBoxY + taskBoxHeight + 24;
    ctx.fillStyle = theme.accent;
    roundRect(ctx, leftMargin, roastStartY, 4, 94, 2);
    ctx.fill();

    ctx.fillStyle = theme.textPrimary;
    ctx.font = `bold 26px ${FONT_SANS}`;
    const roastLines = wrapText(ctx, `"${data.roast}"`, contentWidth - 36);
    let currentRoastY = roastStartY + 26;
    roastLines.slice(0, 3).forEach((line) => {
      ctx.fillText(line, leftMargin + 24, currentRoastY);
      currentRoastY += 36;
    });

    // Action Item Pill Box
    const actionY = 460;
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, leftMargin, actionY, contentWidth, 54, 12);
    ctx.fill();
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.accent;
    ctx.font = `bold 12px ${FONT_SANS}`;
    ctx.fillText("ACTION:", leftMargin + 20, actionY + 32);

    ctx.fillStyle = theme.textSecondary;
    ctx.font = `500 16px ${FONT_SANS}`;
    const actionLines = wrapText(ctx, data.action, contentWidth - 140);
    ctx.fillText(actionLines[0] || data.action, leftMargin + 85, actionY + 32);
  } else if (data.type === "reaction") {
    // Benchmark Mode Tag
    const tagText = "HUMAN BENCHMARK • REACTION TIME";
    ctx.font = `bold 12px ${FONT_SANS}`;
    const tagWidth = ctx.measureText(tagText).width + 24;
    ctx.fillStyle = theme.badgeBg;
    roundRect(ctx, leftMargin, contentStartY, tagWidth, 28, 14);
    ctx.fill();
    ctx.strokeStyle = theme.badgeBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.badgeText;
    ctx.fillText(tagText, leftMargin + 12, contentStartY + 18);

    // Giant Milliseconds Display
    const statY = contentStartY + 145;
    const timeStr = String(data.timeMs);
    ctx.fillStyle = theme.textPrimary;
    ctx.font = `bold 96px ${FONT_MONO}`;
    ctx.fillText(timeStr, leftMargin, statY);

    const timeWidth = ctx.measureText(timeStr).width;
    ctx.fillStyle = theme.accent;
    ctx.font = `bold 34px ${FONT_SANS}`;
    const msX = Math.max(leftMargin + timeWidth + 24, leftMargin + 240);
    ctx.fillText("ms", msX, statY - 14);

    // Bento stat boxes
    const bentoY = statY + 36;
    const bentoHeight = 84;
    const bentoW1 = (contentWidth - 24) * 0.55;
    const bentoW2 = (contentWidth - 24) * 0.45;

    // Box 1: Rating
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, leftMargin, bentoY, bentoW1, bentoHeight, 16);
    ctx.fill();
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.textMuted;
    ctx.font = `bold 12px ${FONT_SANS}`;
    ctx.fillText("PERFORMANCE RATING", leftMargin + 24, bentoY + 30);

    ctx.fillStyle = theme.accent;
    ctx.font = `bold 24px ${FONT_SANS}`;
    ctx.fillText(data.rating, leftMargin + 24, bentoY + 62);

    // Box 2: Percentile
    const box2X = leftMargin + bentoW1 + 24;
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, box2X, bentoY, bentoW2, bentoHeight, 16);
    ctx.fill();
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.textMuted;
    ctx.font = `bold 12px ${FONT_SANS}`;
    ctx.fillText("GLOBAL PERCENTILE", box2X + 24, bentoY + 30);

    ctx.fillStyle = theme.textPrimary;
    ctx.font = `bold 22px ${FONT_SANS}`;
    ctx.fillText(data.percentile || "Top Reflex Speed ⚡", box2X + 24, bentoY + 62);
  } else if (data.type === "typing") {
    // Benchmark Mode Tag
    const tagText = "KEYBOARD BENCHMARK • TYPING SPEED";
    ctx.font = `bold 12px ${FONT_SANS}`;
    const tagWidth = ctx.measureText(tagText).width + 24;
    ctx.fillStyle = theme.badgeBg;
    roundRect(ctx, leftMargin, contentStartY, tagWidth, 28, 14);
    ctx.fill();
    ctx.strokeStyle = theme.badgeBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.badgeText;
    ctx.fillText(tagText, leftMargin + 12, contentStartY + 18);

    // Giant WPM Display
    const statY = contentStartY + 145;
    const wpmStr = String(data.wpm);
    ctx.fillStyle = theme.textPrimary;
    ctx.font = `bold 96px ${FONT_MONO}`;
    ctx.fillText(wpmStr, leftMargin, statY);

    const wpmWidth = ctx.measureText(wpmStr).width;
    ctx.fillStyle = theme.accent;
    ctx.font = `bold 34px ${FONT_SANS}`;
    const wpmX = Math.max(leftMargin + wpmWidth + 24, leftMargin + 180);
    ctx.fillText("WPM", wpmX, statY - 14);

    // Bento Row with 3 Cards (Accuracy, Rank, Total Chars)
    const bentoY = statY + 36;
    const bentoHeight = 84;
    const gap = 16;
    const cardW = (contentWidth - gap * 2) / 3;

    // Card 1: Accuracy
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, leftMargin, bentoY, cardW, bentoHeight, 16);
    ctx.fill();
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.textMuted;
    ctx.font = `bold 12px ${FONT_SANS}`;
    ctx.fillText("ACCURACY", leftMargin + 20, bentoY + 30);

    ctx.fillStyle = theme.accent;
    ctx.font = `bold 26px ${FONT_MONO}`;
    ctx.fillText(`${data.accuracy}%`, leftMargin + 20, bentoY + 62);

    // Card 2: Rank
    const card2X = leftMargin + cardW + gap;
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, card2X, bentoY, cardW, bentoHeight, 16);
    ctx.fill();
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.textMuted;
    ctx.font = `bold 12px ${FONT_SANS}`;
    ctx.fillText("SPEED RANK", card2X + 20, bentoY + 30);

    ctx.fillStyle = theme.textPrimary;
    ctx.font = `bold 22px ${FONT_SANS}`;
    ctx.fillText(data.rank, card2X + 20, bentoY + 62);

    // Card 3: Chars or Status
    const card3X = leftMargin + (cardW + gap) * 2;
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, card3X, bentoY, cardW, bentoHeight, 16);
    ctx.fill();
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.textMuted;
    ctx.font = `bold 12px ${FONT_SANS}`;
    ctx.fillText("KEYSTROKES", card3X + 20, bentoY + 30);

    ctx.fillStyle = theme.textPrimary;
    ctx.font = `bold 22px ${FONT_MONO}`;
    ctx.fillText(`${data.chars ?? "Verified"}`, card3X + 20, bentoY + 62);
  }

  // 5. Bottom Separator Line & Branded Footer
  const footerLineY = height - 88;
  ctx.strokeStyle = theme.footerLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftMargin, footerLineY);
  ctx.lineTo(width - leftMargin, footerLineY);
  ctx.stroke();

  // Footer Left
  const footerTextY = height - 54;
  ctx.fillStyle = theme.footerText;
  ctx.font = `500 14px ${FONT_SANS}`;
  ctx.fillText("Free & Private in your browser at:", leftMargin, footerTextY);

  const freeTextWidth = ctx.measureText("Free & Private in your browser at:").width;
  ctx.fillStyle = theme.accent;
  ctx.font = `bold 15px ${FONT_SANS}`;
  ctx.fillText("boringtoolsai.com", leftMargin + freeTextWidth + 8, footerTextY);

  // Footer Right Tag
  const rightTag = "100% Client-Side";
  ctx.font = `600 13px ${FONT_SANS}`;
  const rightTagWidth = ctx.measureText(rightTag).width;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText(rightTag, width - leftMargin - rightTagWidth, footerTextY);

  return canvas.toDataURL("image/png");
}


/**
 * Downloads a dataUrl to user device.
 */
export function downloadCardImage(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Prepares Twitter/X share URL with encoded intent text and link.
 */
export function getTwitterShareUrl(text: string, url: string = "https://www.boringtoolsai.com"): string {
  const shareText = encodeURIComponent(`${text}\n\nTest yourself on: `);
  const shareUrl = encodeURIComponent(url);
  return `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
}

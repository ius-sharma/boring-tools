"use client";

export type CardType = "roast" | "reaction" | "typing";

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

/**
 * Generates an aesthetic branded share card as a PNG data URL.
 */
export async function generateShareCard(data: ShareCardData): Promise<string> {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  // 1. Background Gradient (Dark Tech Luxury)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#090d16");
  bgGrad.addColorStop(0.5, "#0f172a");
  bgGrad.addColorStop(1, "#090d16");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient glow
  const glow = ctx.createRadialGradient(width * 0.8, 100, 10, width * 0.8, 100, 450);
  glow.addColorStop(0, "rgba(249, 115, 22, 0.15)");
  glow.addColorStop(1, "rgba(249, 115, 22, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Card Border Frame
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  roundRect(ctx, 32, 32, width - 64, height - 64, 24);
  ctx.stroke();

  // Top Header: BoringTools Logo & Category
  ctx.font = "bold 26px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("BoringTools", 72, 88);

  ctx.font = "500 16px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("• 100% In-Browser & Privacy-First", 236, 88);

  // Right Top Tag
  ctx.fillStyle = "rgba(249, 115, 22, 0.15)";
  roundRect(ctx, width - 240, 62, 168, 36, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(249, 115, 22, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#fb923c";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("VERIFIED RESULT", width - 156, 85);
  ctx.textAlign = "left";

  // Content rendering based on card type
  if (data.type === "roast") {
    // Badge
    ctx.fillStyle = "#ea580c";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`TODO ROAST • ${data.level.toUpperCase()} MODE`, 72, 160);

    // Todo box
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    roundRect(ctx, 72, 184, width - 144, 76, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px sans-serif";
    ctx.fillText("Pending Task:", 96, 216);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 22px sans-serif";
    const todoLines = wrapText(ctx, data.todo, width - 220);
    ctx.fillText(todoLines[0] || data.todo, 96, 244);

    // Roast Text
    ctx.fillStyle = "#f97316";
    ctx.font = "bold 36px serif";
    ctx.fillText('“', 72, 310);

    ctx.fillStyle = "#f1f5f9";
    ctx.font = "bold 32px sans-serif";
    const roastLines = wrapText(ctx, data.roast, width - 200);
    let startY = 320;
    roastLines.slice(0, 3).forEach((line) => {
      ctx.fillText(line, 96, startY);
      startY += 44;
    });

    // Action item
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("Recommended Action:", 96, 470);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "18px sans-serif";
    ctx.fillText(data.action, 280, 470);
  } else if (data.type === "reaction") {
    // Reaction Speed card
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("HUMAN BENCHMARK • REACTION TIME", 72, 160);

    // Giant Milliseconds
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 110px monospace";
    ctx.fillText(`${data.timeMs}`, 72, 290);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText("ms", 72 + ctx.measureText(`${data.timeMs}`).width + 16, 290);

    // Rating Badge
    ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
    roundRect(ctx, 72, 330, 420, 56, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(data.rating, 96, 366);

    if (data.percentile) {
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "18px sans-serif";
      ctx.fillText(data.percentile, 72, 430);
    }
  } else if (data.type === "typing") {
    // Typing Speed card
    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("KEYBOARD BENCHMARK • TYPING SPEED", 72, 160);

    // Giant WPM
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 110px monospace";
    ctx.fillText(`${data.wpm}`, 72, 290);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText("WPM", 72 + ctx.measureText(`${data.wpm}`).width + 16, 290);

    // Accuracy & Rank
    ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
    roundRect(ctx, 72, 330, 320, 56, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
    ctx.stroke();

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(`Accuracy: ${data.accuracy}%`, 96, 366);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "20px sans-serif";
    ctx.fillText(`Rank: ${data.rank}`, 420, 366);
  }

  // Bottom Footer
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(72, height - 90);
  ctx.lineTo(width - 72, height - 90);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = "14px sans-serif";
  ctx.fillText("Try it yourself free with zero login:", 72, height - 56);

  ctx.fillStyle = "#f97316";
  ctx.font = "bold 15px sans-serif";
  ctx.fillText("boringtoolsai.com", 336, height - 56);

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

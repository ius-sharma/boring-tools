import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);
const mammoth = require("mammoth");
const WordExtractor = require("word-extractor");

const PAPER_SIZES = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
};

function safeBaseName(name) {
  return String(name || "document")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "document";
}

function getOutputName(fileName) {
  return `${safeBaseName(fileName)}.pdf`;
}

function normalizePdfText(value) {
  const replacements = new Map([
    ["→", "->"],
    ["←", "<-"],
    ["↔", "<->"],
    ["⇒", "=>"],
    ["⇐", "<="],
    ["⇔", "<=>"],
    ["“", '"'],
    ["”", '"'],
    ["‘", "'"],
    ["’", "'"],
    ["‚", ","],
    ["„", '"'],
    ["—", "-"],
    ["–", "-"],
    ["−", "-"],
    ["…", "..."],
    ["•", "-"],
    ["·", "."],
    ["×", "x"],
    ["÷", "/"],
    ["✓", "[x]"],
    ["✔", "[x]"],
    ["✕", "x"],
    ["✖", "x"],
    ["©", "(c)"],
    ["®", "(r)"],
    ["™", "TM"],
    ["°", "deg"],
    ["µ", "u"],
    ["∞", "infinity"],
    ["§", "section"],
    ["¶", "paragraph"],
    ["€", "EUR"],
    ["£", "GBP"],
    ["¥", "JPY"],
    ["₹", "INR"],
  ]);

  const normalized = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  let sanitized = "";

  for (const character of normalized) {
    if (replacements.has(character)) {
      sanitized += replacements.get(character);
      continue;
    }

    const codePoint = character.codePointAt(0) || 0;
    if (codePoint === 9 || codePoint === 10 || codePoint === 13 || (codePoint >= 32 && codePoint <= 126)) {
      sanitized += character;
      continue;
    }

    if (/\s/u.test(character)) {
      sanitized += " ";
      continue;
    }

    sanitized += "?";
  }

  return sanitized;
}

function wrapText(text, font, fontSize, maxWidth) {
  const safeText = normalizePdfText(text);
  const words = safeText.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(nextLine, fontSize) <= maxWidth) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
      currentLine = word;
      continue;
    }

    let fragment = "";
    for (const character of word) {
      const nextFragment = fragment + character;
      if (font.widthOfTextAtSize(nextFragment, fontSize) <= maxWidth || fragment.length === 0) {
        fragment = nextFragment;
      } else {
        lines.push(fragment);
        fragment = character;
      }
    }

    currentLine = fragment;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

async function saveTempUpload(file) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "boring-tools-doc-to-pdf-"));
  const tempPath = path.join(tempDir, `${randomUUID()}-${safeBaseName(file.name)}${path.extname(file.name) || ".bin"}`);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(tempPath, buffer);
  return { tempDir, tempPath, buffer };
}

async function extractTextFromDocument({ file, tempPath, buffer }) {
  const fileName = String(file.name || "").toLowerCase();
  const mimeType = String(file.type || "").toLowerCase();

  if (fileName.endsWith(".docx") || mimeType.includes("officedocument.wordprocessingml.document")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  if (fileName.endsWith(".doc") || mimeType.includes("msword")) {
    const extractor = new WordExtractor();
    const document = await extractor.extract(tempPath);
    if (typeof document?.getBody === "function") {
      return document.getBody() || "";
    }
    return String(document?.body || document?.text || "");
  }

  throw new Error("Please upload a DOC or DOCX file.");
}

async function buildPdf({ text, title, paperSize }) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const safeTitle = normalizePdfText(title);
  const pageSize = PAPER_SIZES[paperSize] || PAPER_SIZES.A4;
  const margin = 48;
  const fontSize = 11;
  const lineHeight = 16;
  const contentWidth = pageSize[0] - margin * 2;
  const contentTop = pageSize[1] - margin - 40;
  const contentBottom = margin + 28;
  const accent = rgb(0.95, 0.52, 0.17);

  let page = pdfDoc.addPage(pageSize);

  const drawHeader = () => {
    page.drawText("DOC to PDF Converter", {
      x: margin,
      y: pageSize[1] - margin + 6,
      size: 9,
      font: boldFont,
      color: accent,
    });

    page.drawText(safeTitle, {
      x: margin,
      y: pageSize[1] - margin - 10,
      size: 15,
      font: boldFont,
      color: rgb(0.08, 0.11, 0.16),
    });

    page.drawText("Generated from Word document text", {
      x: margin,
      y: pageSize[1] - margin - 26,
      size: 8.5,
      font,
      color: rgb(0.42, 0.48, 0.58),
    });

    page.drawLine({
      start: { x: margin, y: pageSize[1] - margin - 34 },
      end: { x: pageSize[0] - margin, y: pageSize[1] - margin - 34 },
      thickness: 1,
      color: rgb(0.92, 0.92, 0.95),
    });
  };

  const addNewPage = () => {
    page = pdfDoc.addPage(pageSize);
    drawHeader();
    return pageSize[1] - margin - 40;
  };

  let cursorY = contentTop;
  drawHeader();

  const paragraphs = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const safeParagraphs = paragraphs.map((paragraph) => normalizePdfText(paragraph));

  if (safeParagraphs.length === 1 && !safeParagraphs[0].trim()) {
    page.drawText("No readable text was found in this document.", {
      x: margin,
      y: cursorY,
      size: fontSize,
      font,
      color: rgb(0.25, 0.3, 0.38),
    });
  } else {
    for (const paragraph of safeParagraphs) {
      if (!paragraph.trim()) {
        cursorY -= lineHeight * 0.7;
        if (cursorY < contentBottom) {
          cursorY = addNewPage();
        }
        continue;
      }

      const lines = wrapText(paragraph, font, fontSize, contentWidth);

      for (const line of lines) {
        if (cursorY < contentBottom) {
          cursorY = addNewPage();
        }

        page.drawText(line, {
          x: margin,
          y: cursorY,
          size: fontSize,
          font,
          color: rgb(0.14, 0.17, 0.22),
        });

        cursorY -= lineHeight;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function POST(request) {
  let tempDir = "";

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const paperSize = String(formData.get("paperSize") || "A4");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload a DOC or DOCX file." }, { status: 400 });
    }

    const supported = /\.(docx?|DOCX?)$/i.test(file.name || "") || /msword|officedocument\.wordprocessingml\.document/i.test(file.type || "");
    if (!supported) {
      return NextResponse.json({ error: "Only DOC and DOCX files are supported." }, { status: 400 });
    }

    const saved = await saveTempUpload(file);
    tempDir = saved.tempDir;

    const text = await extractTextFromDocument({ file, tempPath: saved.tempPath, buffer: saved.buffer });
    const pdfBuffer = await buildPdf({ text, title: safeBaseName(file.name), paperSize });
    const pdfName = getOutputName(file.name);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not convert the document.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
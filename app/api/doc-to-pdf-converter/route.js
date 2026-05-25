import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeBaseName(name) {
  return String(name || "document")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "document";
}

function getOutputName(fileName) {
  return `${safeBaseName(fileName)}.pdf`;
}

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      ...options,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk || "");
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk || "");
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr || stdout || `Command failed: ${command} ${args.join(" ")}`));
    });
  });
}

function getLibreOfficeCandidates() {
  const envPath = process.env.LIBREOFFICE_PATH;
  const candidates = [];

  if (envPath) {
    candidates.push(envPath);
  }

  if (process.platform === "win32") {
    candidates.push(
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
      "soffice.exe",
      "soffice"
    );
  } else {
    candidates.push("soffice", "libreoffice");
  }

  return candidates;
}

function toPdfPath(inputPath) {
  return `${inputPath.replace(/\.[^.]+$/, "")}.pdf`;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function convertViaLibreOffice({ inputPath, outputDir }) {
  const candidates = getLibreOfficeCandidates();
  const expectedPdfPath = path.join(outputDir, path.basename(toPdfPath(inputPath)));

  for (const executable of candidates) {
    try {
      await runCommand(executable, [
        "--headless",
        "--nologo",
        "--nolockcheck",
        "--nodefault",
        "--nofirststartwizard",
        "--convert-to",
        "pdf:writer_pdf_Export",
        "--outdir",
        outputDir,
        inputPath,
      ]);

      if (await fileExists(expectedPdfPath)) {
        return { pdfPath: expectedPdfPath, engine: `LibreOffice (${path.basename(executable)})` };
      }
    } catch {
      // Try next candidate.
    }
  }

  throw new Error("LibreOffice conversion unavailable.");
}

function escapePowerShell(value) {
  return String(value || "").replace(/'/g, "''");
}

async function convertViaWordAutomation({ inputPath, outputDir }) {
  if (process.platform !== "win32") {
    throw new Error("MS Word automation is only available on Windows.");
  }

  const expectedPdfPath = path.join(outputDir, path.basename(toPdfPath(inputPath)));
  const psScript = [
    "$ErrorActionPreference = 'Stop'",
    "$word = New-Object -ComObject Word.Application",
    "$word.Visible = $false",
    "$word.DisplayAlerts = 0",
    `$inputPath = '${escapePowerShell(inputPath)}'`,
    `$outputPath = '${escapePowerShell(expectedPdfPath)}'`,
    "$doc = $word.Documents.Open($inputPath, $false, $true)",
    "$wdFormatPDF = 17",
    "$doc.SaveAs([ref]$outputPath, [ref]$wdFormatPDF)",
    "$doc.Close()",
    "$word.Quit()",
  ].join("; ");

  await runCommand("powershell", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", psScript]);

  if (!(await fileExists(expectedPdfPath))) {
    throw new Error("MS Word did not produce a PDF output.");
  }

  return { pdfPath: expectedPdfPath, engine: "Microsoft Word Automation" };
}

async function saveTempUpload(file) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "boring-tools-doc-to-pdf-"));
  const tempPath = path.join(tempDir, `${randomUUID()}-${safeBaseName(file.name)}${path.extname(file.name) || ".bin"}`);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(tempPath, buffer);
  return { tempDir, tempPath };
}

async function convertDocToPdf({ inputPath, outputDir }) {
  const failures = [];

  try {
    return await convertViaLibreOffice({ inputPath, outputDir });
  } catch (error) {
    failures.push(`LibreOffice: ${error instanceof Error ? error.message : "failed"}`);
  }

  try {
    return await convertViaWordAutomation({ inputPath, outputDir });
  } catch (error) {
    failures.push(`MS Word: ${error instanceof Error ? error.message : "failed"}`);
  }

  const details = failures.join(" | ");
  throw new Error(
    `High-fidelity DOC/DOCX conversion is unavailable on this server. Install LibreOffice or run on Windows with Microsoft Word installed. Details: ${details}`
  );
}

export async function POST(request) {
  let tempDir = "";

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload a DOC or DOCX file." }, { status: 400 });
    }

    const supported = /\.(docx?|DOCX?)$/i.test(file.name || "") || /msword|officedocument\.wordprocessingml\.document/i.test(file.type || "");
    if (!supported) {
      return NextResponse.json({ error: "Only DOC and DOCX files are supported." }, { status: 400 });
    }

    const saved = await saveTempUpload(file);
    tempDir = saved.tempDir;

    const converted = await convertDocToPdf({ inputPath: saved.tempPath, outputDir: saved.tempDir });
    const pdfBuffer = await fs.readFile(converted.pdfPath);
    const pdfName = getOutputName(file.name);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfName}"`,
        "Cache-Control": "no-store",
        "X-Conversion-Engine": converted.engine,
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
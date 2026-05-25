import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CLOUDCONVERT_API_BASE = "https://api.cloudconvert.com/v2";
const CLOUDCONVERT_JOB_TIMEOUT_MS = 8 * 60 * 1000;
const CLOUDCONVERT_POLL_INTERVAL_MS = 1500;

function safeBaseName(name) {
  return String(name || "document")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "document";
}

function getOutputName(fileName) {
  return `${safeBaseName(fileName)}.pdf`;
}

function getInputFormat(fileName) {
  return String(fileName || "").toLowerCase().endsWith(".doc") ? "doc" : "docx";
}

function getCloudConvertApiKey() {
  return String(process.env.CLOUDCONVERT_API_KEY || "").trim();
}

async function cloudConvertRequest(pathname, { apiKey, method = "GET", body } = {}) {
  const response = await fetch(`${CLOUDCONVERT_API_BASE}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const apiMessage = data?.message || data?.error || data?.errors?.[0]?.message || `CloudConvert request failed with status ${response.status}`;
    throw new Error(apiMessage);
  }

  return data;
}

function getTask(job, taskName) {
  return Array.isArray(job?.tasks) ? job.tasks.find((task) => task.name === taskName) : undefined;
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadToCloudConvert({ uploadTask, file, fileBuffer }) {
  const form = uploadTask?.result?.form;
  if (!form?.url) {
    throw new Error("CloudConvert upload form is missing.");
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(form.parameters || {})) {
    formData.append(key, String(value));
  }

  formData.append(
    "file",
    new Blob([fileBuffer], { type: file.type || "application/octet-stream" }),
    file.name || `${randomUUID()}.docx`
  );

  const response = await fetch(form.url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`CloudConvert upload failed with status ${response.status}`);
  }
}

async function waitForCloudConvertJobCompletion({ apiKey, jobId }) {
  const deadline = Date.now() + CLOUDCONVERT_JOB_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const response = await cloudConvertRequest(`/jobs/${jobId}`, { apiKey });
    const job = response?.data;

    if (!job) {
      throw new Error("CloudConvert returned an empty job response.");
    }

    if (job.status === "finished") {
      return job;
    }

    if (job.status === "error" || job.status === "failed") {
      const task = Array.isArray(job.tasks) ? job.tasks.find((entry) => entry.status === "error" || entry.status === "failed") : null;
      const message = task?.message || task?.result?.errors?.[0]?.message || job.message || "CloudConvert conversion failed.";
      throw new Error(message);
    }

    await wait(CLOUDCONVERT_POLL_INTERVAL_MS);
  }

  throw new Error("CloudConvert conversion timed out.");
}

async function convertViaCloudConvert({ file, apiKey }) {
  const inputFormat = getInputFormat(file.name);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const jobResponse = await cloudConvertRequest("/jobs", {
    apiKey,
    method: "POST",
    body: {
      tasks: {
        "import-file": {
          operation: "import/upload",
        },
        "convert-file": {
          operation: "convert",
          input: "import-file",
          input_format: inputFormat,
          output_format: "pdf",
        },
        "export-file": {
          operation: "export/url",
          input: "convert-file",
        },
      },
    },
  });

  const job = jobResponse?.data;
  if (!job) {
    throw new Error("CloudConvert job creation failed.");
  }

  await uploadToCloudConvert({
    uploadTask: getTask(job, "import-file"),
    file,
    fileBuffer,
  });

  const finishedJob = await waitForCloudConvertJobCompletion({ apiKey, jobId: job.id });
  const exportTask = getTask(finishedJob, "export-file");
  const pdfUrl = exportTask?.result?.files?.[0]?.url;

  if (!pdfUrl) {
    throw new Error("CloudConvert did not return a PDF download URL.");
  }

  const pdfResponse = await fetch(pdfUrl);
  if (!pdfResponse.ok) {
    throw new Error(`Could not download converted PDF (${pdfResponse.status}).`);
  }

  const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
  return { pdfBuffer, engine: "CloudConvert" };
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

function escapePowerShell(value) {
  return String(value || "").replace(/'/g, "''");
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

async function convertViaLocalOffice({ inputPath, outputDir }) {
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
    `High-fidelity DOC/DOCX conversion is unavailable locally. Install LibreOffice or run on Windows with Microsoft Word installed. Details: ${details}`
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

    const cloudConvertApiKey = getCloudConvertApiKey();

    if (cloudConvertApiKey) {
      const converted = await convertViaCloudConvert({ file, apiKey: cloudConvertApiKey });
      const pdfName = getOutputName(file.name);

      return new NextResponse(converted.pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${pdfName}"`,
          "Cache-Control": "no-store",
          "X-Conversion-Engine": converted.engine,
        },
      });
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "DOC to PDF conversion is not configured for this deployment. Set CLOUDCONVERT_API_KEY to enable high-fidelity online conversion.",
        },
        { status: 500 }
      );
    }

    const saved = await saveTempUpload(file);
    tempDir = saved.tempDir;

    const converted = await convertViaLocalOffice({ inputPath: saved.tempPath, outputDir: saved.tempDir });
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
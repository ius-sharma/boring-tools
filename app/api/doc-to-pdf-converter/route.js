import path from "node:path";
import { pathToFileURL } from "node:url";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const converterConfigSchema = z.object({
  wasmPath: z.string().min(1),
  verbose: z.boolean(),
});

function safeBaseName(name) {
  return String(name || "document")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "document";
}

function getOutputName(fileName) {
  return `${safeBaseName(fileName)}.pdf`;
}

let converterPromise;

function getWasmPath() {
  return process.env.LIBREOFFICE_WASM_PATH || path.join(process.cwd(), "node_modules", "@matbee", "libreoffice-converter", "wasm");
}

async function getConverter() {
  if (!converterPromise) {
    converterPromise = (async () => {
      const converterModulePath = path.join(process.cwd(), "node_modules", "@matbee", "libreoffice-converter", "dist", "server.cjs");
      const { createWorkerConverter } = await import(/* webpackIgnore: true */ pathToFileURL(converterModulePath).href);
      const converterConfig = converterConfigSchema.parse({
        wasmPath: getWasmPath(),
        verbose: false,
      });
      return createWorkerConverter(converterConfig);
    })();
  }

  return converterPromise;
}

async function saveTempUpload(file) {
  return Buffer.from(await file.arrayBuffer());
}

export async function POST(request) {
  try {
    // On Vercel serverless deployments the LibreOffice WASM runtime makes
    // the serverless function exceed the unzipped 250 MB limit. To keep
    // production deployments stable we return 503 by default when running
    // on Vercel. You can override this by setting `ALLOW_LIBREOFFICE=1`
    // in the Vercel environment if you deploy a custom build that can
    // accommodate the runtime (not recommended on shared serverless).
    if (process.env.VERCEL && process.env.ALLOW_LIBREOFFICE !== "1") {
      return NextResponse.json({ error: "DOC-to-PDF conversion is disabled on this deployment to avoid Vercel serverless size limits." }, { status: 503 });
    }
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload a DOC or DOCX file." }, { status: 400 });
    }

    const supported = /\.(docx?|DOCX?)$/i.test(file.name || "") || /msword|officedocument\.wordprocessingml\.document/i.test(file.type || "");
    if (!supported) {
      return NextResponse.json({ error: "Only DOC and DOCX files are supported." }, { status: 400 });
    }

    const inputBuffer = await saveTempUpload(file);
    const converter = await getConverter();
    const converted = await converter.convert(inputBuffer, { outputFormat: "pdf" });
    const pdfBuffer = Buffer.from(converted.data);
    const pdfName = getOutputName(file.name);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfName}"`,
        "Cache-Control": "no-store",
        "X-Conversion-Engine": "LibreOffice WASM",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not convert the document.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
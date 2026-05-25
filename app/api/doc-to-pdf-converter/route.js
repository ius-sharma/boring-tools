import path from "node:path";
import { pathToFileURL } from "node:url";
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

let converterPromise;

function getWasmPath() {
  return process.env.LIBREOFFICE_WASM_PATH || path.join(process.cwd(), "node_modules", "@matbee", "libreoffice-converter", "wasm");
}

async function getConverter() {
  if (!converterPromise) {
    const converterModulePath = path.join(
      process.cwd(),
      "node_modules",
      "@matbee",
      "libreoffice-converter",
      "dist",
      "server.cjs"
    );
    converterPromise = (async () => {
      const { createWorkerConverter } = await import(/* webpackIgnore: true */ pathToFileURL(converterModulePath).href);
      return createWorkerConverter({
        wasmPath: getWasmPath(),
        verbose: false,
      });
    })();
  }

  return converterPromise;
}

async function saveTempUpload(file) {
  return Buffer.from(await file.arrayBuffer());
}

export async function POST(request) {
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
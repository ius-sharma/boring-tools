// Copies the LibreOffice WASM bundle from node_modules into public/wasm/
// so the browser-based DOC to PDF converter can load the engine as static
// assets. Run automatically via `postinstall`, or manually with:
//   node scripts/setup-wasm.mjs
//
// The WASM bundle (~250 MB) is intentionally NOT committed to Git; this
// script rebuilds public/wasm on every fresh install and on CI.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkgDir = path.join(root, "node_modules", "@matbee", "libreoffice-converter");
const wasmDir = path.join(pkgDir, "wasm");
const outDir = path.join(root, "public", "wasm");

const required = ["soffice.wasm", "soffice.data", "soffice.js"];

const pkgExists = fs.existsSync(path.join(pkgDir, "package.json"));
if (!pkgExists) {
  console.error(
    "setup-wasm: @matbee/libreoffice-converter is not installed. Run `npm install` first."
  );
  process.exit(1);
}

if (!fs.existsSync(wasmDir)) {
  console.error("setup-wasm: wasm directory missing at", wasmDir);
  process.exit(1);
}

const missing = required.filter((f) => !fs.existsSync(path.join(wasmDir, f)));
if (missing.length > 0) {
  console.error("setup-wasm: missing required WASM files:", missing.join(", "));
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

// Copy only the files the browser worker actually needs.
const filesToCopy = [
  { name: "soffice.wasm", dir: wasmDir },
  { name: "soffice.data", dir: wasmDir },
  { name: "soffice.js", dir: wasmDir },
  { name: "soffice.worker.js", dir: wasmDir },
  // The browser worker module ships in dist, not in wasm/.
  { name: "browser.worker.global.js", dir: path.join(pkgDir, "dist") },
].map(({ name, dir }) => ({
  src: path.join(dir, name),
  dest: path.join(outDir, name),
}));

for (const { src, dest } of filesToCopy) {
  if (!fs.existsSync(src)) continue;
  fs.copyFileSync(src, dest);
  console.log(`setup-wasm: copied ${path.basename(dest)} (${(fs.statSync(dest).size / 1024 / 1024).toFixed(1)} MB)`);
}

console.log("setup-wasm: done — WASM engine is served from /wasm/");

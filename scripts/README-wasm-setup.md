# WASM Setup for DOC to PDF Converter (browser-based)

The DOC to PDF Converter now runs entirely in the browser using LibreOffice compiled to WebAssembly (~250 MB). The engine files are **not committed to Git** — they are copied from `node_modules` into `public/wasm/` by the postinstall script.

## How it works

1. `npm install` runs `postinstall` → `node scripts/setup-wasm.mjs`
2. The script copies `soffice.wasm`, `soffice.data`, `soffice.js`, `soffice.worker.js` (from `node_modules/@matbee/libreoffice-converter/wasm/`) and `browser.worker.global.js` (from `dist/`) into `public/wasm/`.
3. Next.js serves them as static assets at `/wasm/*`.
4. The page (`app/doc-to-pdf-converter/page.jsx`) loads the engine via `@matbee/libreoffice-converter/browser`.

## Manual commands

```bash
node scripts/setup-wasm.mjs        # copy WASM into public/wasm
rm -rf public/wasm                 # clean the generated folder
```

## Deployment (Vercel)

Vercel runs `postinstall` automatically, so `public/wasm` is built during deployment. Note that Vercel's free plan has a **100 MB static asset limit** — if a build fails because of the WASM size, options are:

- Upgrade the Vercel plan, or
- Host the WASM files on a CDN (e.g., Cloudflare R2 or a GitHub Release) and change the paths in `app/doc-to-pdf-converter/page.jsx` via `createWasmPaths("https://your-cdn.example.com/wasm/")`.

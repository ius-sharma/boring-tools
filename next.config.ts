import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    proxyClientMaxBodySize: "4mb",
  },
  async headers() {
    return [
      {
        // SharedArrayBuffer is required by the browser-side LibreOffice WASM engine
        // (DOC to PDF Converter). Scoped to this page only so other tools'
        // third-party assets (flags, TMDB images, AdSense) are not affected by COEP.
        // Both the converter page and the WASM engine files need cross-origin
        // isolation; keeping this scoped so other tools' third-party assets are untouched.
        source: "/(doc-to-pdf-converter|wasm)/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/support",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/help",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/manage-subscription",
        destination: "/billing",
        permanent: true,
      },
      {
        source: "/subscription",
        destination: "/billing",
        permanent: true,
      },
      {
        source: "/account",
        destination: "/billing",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

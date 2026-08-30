import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Remove source maps in production to reduce bundle overhead and protect code structure */
  productionBrowserSourceMaps: false,

  /* Disable X-Powered-By header for security and clean headers */
  poweredByHeader: false,

  /* Enable compression for production responses */
  compress: true,

  /* React Strict Mode */
  reactStrictMode: true,

  /* Compiler optimizations: remove debug console statements in production */
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  experimental: {
    proxyClientMaxBodySize: "4mb",
    optimizePackageImports: ["@vercel/analytics", "marked", "zod"],
  },

  async headers() {
    return [
      {
        // SharedArrayBuffer is required by the browser-side LibreOffice WASM engine
        // (DOC to PDF Converter). Scoped to this page only so other tools'
        // third-party assets (flags, TMDB images, AdSense) are not affected by COEP.
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

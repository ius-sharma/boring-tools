import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    proxyClientMaxBodySize: "4mb",
  },
  outputFileTracingIncludes: {
    "/api/doc-to-pdf-converter": ["./node_modules/zod/**/*"],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    proxyClientMaxBodySize: "4mb",
  },
  serverExternalPackages: ["ffmpeg-static"],
};

export default nextConfig;

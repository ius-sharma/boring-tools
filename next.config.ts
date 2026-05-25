import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    proxyClientMaxBodySize: "4mb",
  },
  serverExternalPackages: ["ffmpeg-static", "@matbee/libreoffice-converter"],
};

export default nextConfig;

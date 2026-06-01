import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["youtube-dl-exec", "ffmpeg-static"],
  outputFileTracingIncludes: {
    "/api/download": [
      "./node_modules/youtube-dl-exec/bin/**/*",
      "./node_modules/ffmpeg-static/**/*",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
};

export default nextConfig;

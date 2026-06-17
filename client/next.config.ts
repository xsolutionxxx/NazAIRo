import type { NextConfig } from "next";

const RAILWAY_URL =
  process.env.RAILWAY_API_URL ||
  "https://nazairo-production.up.railway.app";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "nazairo-production.up.railway.app" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${RAILWAY_URL}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${RAILWAY_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;

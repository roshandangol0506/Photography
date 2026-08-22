import type { NextConfig } from "next";

// The Express API serves both the JSON endpoints and the uploaded image
// derivatives. Both hosts are read from env so dev and production differ only
// by configuration.
const apiOrigin = new URL(
  process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:3001",
);

const nextConfig: NextConfig = {
  // Self-hosted next to Express, so ship a standalone server bundle.
  output: "standalone",

  images: {
    // The stored derivatives are already WebP; AVIF is the extra win Next's
    // optimizer adds on top.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: apiOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: apiOrigin.hostname,
        port: apiOrigin.port || undefined,
        pathname: "/uploads/**",
      },
    ],
    // Matches the layouts actually used: full-bleed, half, third, quarter and
    // thumbnails. Fewer entries means fewer variants to generate and cache.
    deviceSizes: [640, 828, 1080, 1200, 1920, 2048],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async rewrites() {
    // Keeps uploaded images on a same-origin path so next/image never needs a
    // cross-origin fetch, and the API host stays an implementation detail.
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiOrigin.origin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;

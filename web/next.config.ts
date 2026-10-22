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
    // WebP only, deliberately - AVIF is removed.
    //
    // Two reasons, both measured. AVIF costs 5-6x more encode time (1.5s vs
    // 0.27s cold for a 1920px frame), and because optimization happens on
    // first request, that delay is spent staring at the blur placeholder.
    // Second, the stored derivatives are ALREADY WebP, so WebP-to-WebP at a
    // higher quality than the source is a near-transparent re-encode, whereas
    // WebP-to-AVIF is a cross-codec generation loss.
    // Smaller files are not worth either cost on a photography portfolio.
    formats: ["image/webp"],
    // Next 16 only honours qualities listed here - anything else silently
    // falls back to 75. These photographs are the product, and the optimizer
    // is a SECOND lossy pass over an already-lossy WebP, so it runs high
    // enough that the re-encode stays visually transparent.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: apiOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: apiOrigin.hostname,
        port: apiOrigin.port || undefined,
        pathname: "/uploads/**",
      },
    ],
    // Capped at 2048 deliberately: the largest stored derivative is wider than
    // this, so every request the browser makes is satisfied by DOWNSCALING.
    // Advertising a width the source cannot supply is what makes a photograph
    // look soft - the browser scales the shortfall back up.
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

import type { MetadataRoute } from "next";
import { getPhotos } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5173";

/**
 * Public pages plus every published photograph. Admin routes are deliberately
 * absent - they are excluded in robots.ts too and must never be indexed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/gallery`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },
  ];

  // perpage is deliberately high: a sitemap wants every photo, not a page of
  // them. The API caps the response, so very large archives would need
  // pagination here.
  const photos = await getPhotos({ perpage: 1000 });

  const photoRoutes: MetadataRoute.Sitemap = (photos?.photos ?? []).map(
    (photo) => ({
      url: `${SITE_URL}/photo/${photo.slug}`,
      lastModified: photo.createdAt ? new Date(photo.createdAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }),
  );

  return [...staticRoutes, ...photoRoutes];
}

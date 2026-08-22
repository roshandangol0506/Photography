import "server-only";
import { apiGet, type PaginationMeta } from "@/lib/server-api";
import type {
  ActiveCategory,
  Award,
  Collection,
  Photo,
  RelatedPhoto,
  SiteSettings,
  Testimonial,
} from "@/types/content";

/**
 * Typed server fetchers, one per public endpoint. Tagged so an admin mutation
 * can invalidate exactly the pages that depend on the changed record.
 */

export const TAGS = {
  settings: "settings",
  photos: "photos",
  categories: "categories",
  collections: "collections",
  awards: "awards",
  testimonials: "testimonials",
} as const;

interface PhotoListParams {
  page?: number;
  perpage?: number;
  search?: string;
  category?: string;
  collection?: string;
  tag?: string;
  featured?: boolean;
  uncategorized?: boolean;
}

export function getSettings() {
  return apiGet<SiteSettings>("/settings", {
    tags: [TAGS.settings],
    revalidate: 300,
  });
}

export function getPhotos(query: PhotoListParams = {}) {
  return apiGet<{ photos: Photo[]; pagination: PaginationMeta }>("/photos", {
    query: query as Record<string, string | number | boolean | undefined>,
    tags: [TAGS.photos],
    revalidate: 120,
  });
}

export function getBackgroundPhotos() {
  return apiGet<Photo[]>("/photos/background", {
    tags: [TAGS.photos],
    revalidate: 300,
  });
}

export function getSideScrollPhotos() {
  return apiGet<Photo[]>("/photos/sidescroll", {
    tags: [TAGS.photos],
    revalidate: 300,
  });
}

export function getPhotoBySlug(slug: string) {
  // No caching: this endpoint increments the view counter, so a cached
  // response would silently stop counting views.
  return apiGet<{ photo: Photo; related: RelatedPhoto[] }>(`/photos/${slug}`, {
    revalidate: 0,
  });
}

export function getActiveCategories() {
  return apiGet<ActiveCategory[]>("/categories/active", {
    tags: [TAGS.categories],
    revalidate: 300,
  });
}

export function getActiveCollections() {
  return apiGet<Collection[]>("/collections/active", {
    tags: [TAGS.collections],
    revalidate: 300,
  });
}

export function getActiveAwards() {
  return apiGet<Award[]>("/awards/active", {
    tags: [TAGS.awards],
    revalidate: 300,
  });
}

export function getActiveTestimonials() {
  return apiGet<Testimonial[]>("/testimonials/active", {
    tags: [TAGS.testimonials],
    revalidate: 300,
  });
}

"use client";

import { useState } from "react";
import { api } from "@/lib/client-api";
import { GalleryFrame, MASONRY_CLASS } from "./GalleryFrame";
import type { Photo } from "@/types/content";
import type { ApiResponse, PaginationMeta } from "@/lib/shared-types";

interface LoadMoreProps {
  /** Query the server already used for page 1. */
  params: Record<string, string | number | boolean | undefined>;
  perpage: number;
  totalPages: number;
}

/**
 * Appends pages 2..n beneath a server-rendered first page.
 *
 * The first page stays server-rendered so it is indexable and counts toward
 * the LCP; only the extra pages are fetched in the browser. Nothing is
 * re-downloaded - this renders alongside the server markup, not over it.
 */
export function LoadMore({ params, perpage, totalPages }: LoadMoreProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = page < totalPages;
  if (!hasMore && photos.length === 0) return null;

  const loadNext = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const { data } = await api.get<
        ApiResponse<{ photos: Photo[]; pagination: PaginationMeta }>
      >("/photos", { params: { ...params, page: page + 1, perpage } });
      setPhotos((current) => [...current, ...data.data.photos]);
      setPage((current) => current + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {photos.length > 0 && (
        <div className={`${MASONRY_CLASS} mt-6`}>
          {photos.map((photo) => (
            <GalleryFrame key={photo._id} photo={photo} />
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={loadNext}
          disabled={loading}
          className="mt-8 cursor-pointer border-2 border-md-divider bg-transparent px-6 py-3 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors duration-200 hover:border-md-red hover:text-md-red disabled:opacity-60"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </>
  );
}

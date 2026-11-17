import type { Metadata } from "next";
import { getActiveCategories, getPhotos } from "@/lib/content";
import {
  CinematicStory,
  type StoryScene,
} from "@/components/public/sections/CinematicStory";
import type { Photo } from "@/types/content";

/**
 * Scratch page for viewing the ink-blot carousel in isolation.
 *
 * The archive as the gallery page groups it - one scene per series, from the
 * API - on the cinematic story's stage: one scroll moves to the next series
 * with its clip-path reveal, a click inks in the series' next photograph.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the carousel has been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Ink blot preview",
  robots: { index: false, follow: false },
};

/** Photos per series. Each mounted carousel preloads all of its own. */
const PER_SERIES = 12;

function toSlide(photo: Photo) {
  const { large, medium, thumb } = photo.images;
  return {
    image: large || medium || thumb,
    title: photo.title,
    caption: photo.location || undefined,
    alt: [photo.title, photo.location, photo.category?.name]
      .filter(Boolean)
      .join(" — "),
  };
}

export default async function InkBlotPreviewPage() {
  const categories = (await getActiveCategories()) ?? [];

  // Same grouping as /gallery: one band per series, plus anything with no
  // series so the whole archive is here. Fetched in parallel.
  const bands = await Promise.all([
    ...categories.map(async (item) => ({
      eyebrow: item.country || "Series",
      title: item.name,
      result: await getPhotos({ category: item.slug, perpage: PER_SERIES }),
    })),
    (async () => ({
      eyebrow: "Everything else",
      title: "Unsorted",
      result: await getPhotos({ uncategorized: true, perpage: PER_SERIES }),
    }))(),
  ]);

  const scenes: StoryScene[] = bands.flatMap((band) => {
    const photos = band.result?.photos ?? [];
    if (photos.length === 0) return [];
    const total = band.result?.pagination.total ?? photos.length;
    return [
      {
        kind: "gallery" as const,
        eyebrow: band.eyebrow,
        title: band.title,
        subtitle: `${total} photograph${total === 1 ? "" : "s"}`,
        slides: photos.map(toSlide),
      },
    ];
  });

  if (scenes.length === 0) {
    return (
      <p className="m-0 px-9 pt-[160px] pb-[90px] text-center text-small text-md-600">
        No photographs have been published yet.
      </p>
    );
  }

  return <CinematicStory scenes={scenes} />;
}

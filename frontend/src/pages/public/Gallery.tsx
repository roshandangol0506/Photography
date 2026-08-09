import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useInfinitePublicPhotos, type Photo } from "@/api/photos";
import { useActiveCategories } from "@/api/categories";
import { useDebounce } from "@/hooks/useDebounce";
import { useSeo } from "@/hooks/useSeo";
import { LikeButton } from "@/components/public/LikeButton";
import { CommentCount } from "@/components/public/CommentCount";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { photoSrcSet } from "@/lib/image";

const SECTION_CLASS = "px-9 max-[900px]:px-5";
const KICKER_CLASS = "text-[11px] tracking-[0.2em] text-md-red uppercase";

// Masonry via CSS columns, so every photograph keeps its own aspect ratio and
// nothing is cropped.
const MASONRY_CLASS =
  "columns-3 gap-6 max-[1200px]:columns-2 max-[640px]:columns-1";

function Frame({ photo }: { photo: Photo }) {
  return (
    <div className="md-photo mb-6 break-inside-avoid">
      <div className="relative overflow-hidden">
        {/* h-auto over ProgressiveImage's h-full: the box takes the image's
            own dimensions, so portraits stay portrait and landscapes stay
            landscape with no cropping. */}
        <ProgressiveImage
          src={photo.images.medium}
          srcSet={photoSrcSet(photo.images)}
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          blurDataURL={photo.images.blurDataURL}
          alt={photo.title}
          className="w-full"
          imgClassName="h-auto"
        />

        {/* Covers the frame so the whole photo opens the detail page, while
            the like and comment controls above it stay independent. */}
        <Link
          to={`/photo/${photo.slug}`}
          aria-label={`View ${photo.title}`}
          className="absolute inset-0"
        />

        <span className="md-cap pointer-events-none absolute bottom-3 left-3 bg-md-ink px-[10px] py-[7px] text-[10px] tracking-[0.14em] text-md-light uppercase">
          {photo.location || photo.title}
        </span>

        <div className="md-like absolute right-3 bottom-3 z-10 flex items-center gap-3">
          <LikeButton
            photoId={photo._id}
            likeCount={photo.likeCount}
            size="sm"
            className="cursor-pointer text-[10px] tracking-[0.14em] text-md-light uppercase"
          />
          <CommentCount
            slug={photo.slug}
            count={photo.commentCount}
            className="text-[10px] tracking-[0.14em] text-md-light uppercase"
          />
        </div>
      </div>

      <p className="mt-3 mb-0 text-[11px] tracking-[0.08em] uppercase">
        {photo.title}
      </p>
    </div>
  );
}

function Skeleton({ count = 6 }: { count?: number }) {
  const heights = [320, 240, 380, 280, 340, 260];
  return (
    <div className={MASONRY_CLASS} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="mb-6 break-inside-avoid bg-md-300"
          style={{ height: heights[i % heights.length] }}
        />
      ))}
    </div>
  );
}

/**
 * One band per series, holding every photograph in it. Each band owns its own
 * paged query so the page never has to load the whole archive at once, and
 * pulls the next page in as the band scrolls into view.
 */
function PhotoBand({
  title,
  kicker,
  params,
}: {
  title: string;
  kicker: string;
  params: Parameters<typeof useInfinitePublicPhotos>[0];
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfinitePublicPhotos(params);

  const photos = data?.pages.flatMap((page) => page.photos) ?? [];
  const total = data?.pages[0]?.pagination.total ?? 0;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!isLoading && photos.length === 0) return null;

  return (
    <section className={`${SECTION_CLASS} pt-[60px] pb-[60px]`}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className={KICKER_CLASS}>{kicker}</span>
          <h2 className="mt-[10px] mb-0 font-bold tracking-[-0.025em] text-[clamp(24px,3.2vw,44px)] leading-none">
            {title}
          </h2>
        </div>
        <span className="text-[11px] tracking-[0.16em] text-md-600 uppercase">
          {total} {total === 1 ? "photograph" : "photographs"}
        </span>
      </div>

      <div className="mt-10">
        {isLoading ? (
          <Skeleton count={3} />
        ) : (
          <div className={MASONRY_CLASS}>
            {photos.map((photo) => (
              <Frame key={photo._id} photo={photo} />
            ))}
          </div>
        )}
      </div>

      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <p className="m-0 py-4 text-center text-[11px] tracking-[0.16em] text-md-600 uppercase">
          Loading more…
        </p>
      )}
    </section>
  );
}

export default function Gallery() {
  useSeo({
    title: "Gallery",
    description: "Browse the full photography archive.",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";
  const activeCollection = searchParams.get("collection") ?? "";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: categories } = useActiveCategories();
  const series = categories ?? [];

  // Bands are the resting state; any filter or search collapses the page into
  // a single flat result set.
  const flat = Boolean(debouncedSearch || activeCategory || activeCollection);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: activeCategory || undefined,
      collection: activeCollection || undefined,
    }),
    [debouncedSearch, activeCategory, activeCollection],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfinitePublicPhotos(filters);

  const photos = useMemo(
    () => data?.pages.flatMap((page) => page.photos) ?? [],
    [data],
  );
  const total = data?.pages[0]?.pagination.total ?? 0;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!flat) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [flat, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set("category", slug);
    else next.delete("category");
    next.delete("collection");
    setSearchParams(next, { replace: true });
  };

  const clearAll = () => {
    setSearch("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const activeName =
    series.find((item) => item.slug === activeCategory)?.name ?? "";

  return (
    <div className="modernist bg-md-ground text-md-fg">
      <section className={`${SECTION_CLASS} pt-[70px] pb-[50px]`}>
        <span className={KICKER_CLASS}>Archive</span>
        <h1 className="mt-[18px] mb-0 font-extrabold tracking-[-0.03em] text-[clamp(34px,5.4vw,84px)] leading-[0.94]">
          The gallery.
        </h1>
        <p className="mt-8 mb-0 max-w-[620px] text-[15px] leading-[1.75] text-md-700">
          Every photograph in the archive, grouped by series. Search by title,
          series, collection, location or tag — or open any frame for its full
          story.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <label className="flex flex-1 items-center gap-3 border-2 border-md-divider px-4 py-3 focus-within:border-md-red max-[640px]:w-full">
            <Search className="h-4 w-4 flex-none text-md-600" />
            <span className="sr-only">Search photographs</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, series, collection, location or tag…"
              className="w-full border-0 bg-transparent font-[inherit] text-[14px] text-md-fg outline-none"
            />
          </label>

          {series.length > 0 && (
            <label className="flex items-center gap-3 border-2 border-md-divider px-4 py-3 max-[640px]:w-full">
              <span className="sr-only">Filter by series</span>
              <select
                value={activeCategory}
                onChange={(event) => setCategory(event.target.value)}
                className="cursor-pointer border-0 bg-transparent font-[inherit] text-[13px] font-semibold tracking-[0.1em] text-md-fg uppercase outline-none"
              >
                <option value="">All series</option>
                {series.map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {flat && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex cursor-pointer items-center gap-2 border-2 border-md-divider bg-transparent px-4 py-3 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors duration-200 hover:border-md-red hover:text-md-red max-[640px]:w-full max-[640px]:justify-center"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </section>

      {flat ? (
        <section className={`${SECTION_CLASS} pb-[90px]`}>
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-md-divider pt-6">
            <h2 className="m-0 font-bold tracking-[-0.02em] text-[clamp(20px,2.4vw,32px)] leading-none">
              {activeName || (debouncedSearch ? "Search results" : "All work")}
            </h2>
            {!isLoading && (
              <span className="text-[11px] tracking-[0.16em] text-md-600 uppercase">
                {total} {total === 1 ? "photograph" : "photographs"}
              </span>
            )}
          </div>

          <div className="mt-10">
            {isLoading ? (
              <Skeleton />
            ) : photos.length === 0 ? (
              <p className="m-0 py-16 text-center text-[14px] text-md-600">
                Nothing matched that. Try a different title, series or location.
              </p>
            ) : (
              <div className={MASONRY_CLASS}>
                {photos.map((photo) => (
                  <Frame key={photo._id} photo={photo} />
                ))}
              </div>
            )}
          </div>

          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <p className="m-0 py-6 text-center text-[11px] tracking-[0.16em] text-md-600 uppercase">
              Loading more…
            </p>
          )}
        </section>
      ) : (
        <div className="pb-[70px]">
          {series.map((category) => (
            <PhotoBand
              key={category._id}
              title={category.name}
              kicker={category.country || "Series"}
              params={{ category: category.slug }}
            />
          ))}

          {/* Anything with no series assigned, so the gallery holds the whole
              archive rather than only what has been categorised. */}
          <PhotoBand
            title="Unsorted"
            kicker="Everything else"
            params={{ uncategorized: true }}
          />

          {series.length === 0 && (
            <section className={`${SECTION_CLASS} pb-[90px]`}>
              <Skeleton />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

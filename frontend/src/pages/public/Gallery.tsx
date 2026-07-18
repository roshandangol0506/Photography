import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfinitePublicPhotos } from "@/api/photos";
import { useActiveCategories } from "@/api/categories";
import { useDebounce } from "@/hooks/useDebounce";
import { useSeo } from "@/hooks/useSeo";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { PhotoCard } from "@/components/public/PhotoCard";
import { PhotoViewer } from "@/components/public/PhotoViewer/PhotoViewer";

export default function Gallery() {
  useSeo({
    title: "Gallery",
    description: "Browse the full photography collection.",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";
  const activeCollection = searchParams.get("collection") ?? "";
  const activePhoto = searchParams.get("photo");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: categories } = useActiveCategories();

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
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set("category", slug);
    else next.delete("category");
    next.delete("collection");
    setSearchParams(next, { replace: true });
  };

  const openPhoto = useCallback(
    (photoSlug: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("photo", photoSlug);
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const closePhoto = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("photo");
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const navigatePhoto = useCallback(
    (photoSlug: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("photo", photoSlug);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Portfolio
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Gallery
        </h1>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("")}
            aria-pressed={!activeCategory && !activeCollection}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              !activeCategory && !activeCollection
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            All
          </button>
          {categories?.map((category) => (
            <button
              type="button"
              key={category._id}
              onClick={() => setCategory(category.slug)}
              aria-pressed={activeCategory === category.slug}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                activeCategory === category.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
        <Input
          placeholder="Search photos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <p className="py-20 text-center text-muted-foreground">Loading...</p>
      ) : photos.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          No photos found
        </p>
      ) : (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo._id}
              photo={photo}
              onClick={() => openPhoto(photo.slug)}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Loading more...
        </p>
      )}

      {activePhoto && (
        <PhotoViewer
          slug={activePhoto}
          slugList={photos.map((p) => p.slug)}
          onClose={closePhoto}
          onNavigate={navigatePhoto}
        />
      )}
    </div>
  );
}

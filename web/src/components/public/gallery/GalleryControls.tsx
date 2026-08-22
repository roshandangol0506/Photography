"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { ActiveCategory } from "@/types/content";

/**
 * Search and series filter. Both write to the URL rather than to local state,
 * so the server re-renders the results and every filtered view is a real,
 * shareable, indexable address.
 */
export function GalleryControls({
  categories,
}: {
  categories: ActiveCategory[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "";
  const activeSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(activeSearch);

  // Debounced so typing does not fire a navigation per keystroke.
  useEffect(() => {
    if (search === activeSearch) return;
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (search) next.set("search", search);
      else next.delete("search");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, activeSearch, pathname, router, searchParams]);

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (slug) next.set("category", slug);
    else next.delete("category");
    next.delete("collection");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const filtered = Boolean(activeCategory || activeSearch);

  return (
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

      {categories.length > 0 && (
        <label className="flex items-center gap-3 border-2 border-md-divider px-4 py-3 max-[640px]:w-full">
          <span className="sr-only">Filter by series</span>
          <select
            value={activeCategory}
            onChange={(event) => setCategory(event.target.value)}
            className="cursor-pointer border-0 bg-transparent font-[inherit] text-[13px] font-semibold tracking-[0.1em] text-md-fg uppercase outline-none"
          >
            <option value="">All series</option>
            {categories.map((category) => (
              <option key={category._id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {filtered && (
        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="inline-flex cursor-pointer items-center gap-2 border-2 border-md-divider bg-transparent px-4 py-3 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors duration-200 hover:border-md-red hover:text-md-red max-[640px]:w-full max-[640px]:justify-center"
        >
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      )}
    </div>
  );
}

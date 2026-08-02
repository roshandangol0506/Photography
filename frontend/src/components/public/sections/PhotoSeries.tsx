import { useState } from "react";
import { Link } from "react-router-dom";
import { useActiveCategories, type ActiveCategory } from "@/api/categories";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { cn } from "@/lib/utils";

const LIST_COLOR = "rgba(32,30,29,.7)";
const PREVIEW_SLOTS = 2;

interface CountryGroup {
  country: string;
  series: ActiveCategory[];
  frames: number;
}

// Bands follow the order categories are already sorted in, so a country first
// appearing at order 0 leads. Series with no country assigned have no band to
// sit in and are left out.
function groupByCountry(categories: ActiveCategory[]): CountryGroup[] {
  const groups = new Map<string, CountryGroup>();

  categories.forEach((category) => {
    const country = category.country?.trim();
    if (!country) return;

    const group = groups.get(country) ?? { country, series: [], frames: 0 };
    group.series.push(category);
    group.frames += category.photoCount;
    groups.set(country, group);
  });

  return [...groups.values()];
}

function Preview({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="h-[84px] flex-1 overflow-hidden grayscale">
      {src ? (
        <ProgressiveImage
          src={src}
          sizes="(max-width: 900px) 50vw, 200px"
          alt={alt}
          className="h-full w-full"
        />
      ) : (
        <div className="h-full w-full bg-md-300" aria-hidden="true" />
      )}
    </div>
  );
}

function SeriesBand({ group, last }: { group: CountryGroup; last: boolean }) {
  // Hovering a series name swaps the band's leading preview to that series'
  // cover; the trailing slot stays put as the band's constant.
  const [hovered, setHovered] = useState<ActiveCategory | null>(null);

  const defaults = group.series.slice(0, PREVIEW_SLOTS);
  const lead = hovered ?? defaults[0];
  const trail = defaults[1];

  return (
    <div
      className={cn(
        "grid grid-cols-[96px_1fr] items-start gap-4 border-t-2 border-md-divider pt-3 max-[900px]:grid-cols-1",
        last && "border-b-2 pb-3",
      )}
    >
      <div>
        <p className="m-0 text-[18px] font-bold tracking-[-0.02em]">
          {group.country}
        </p>
        <p className="mt-[3px] mb-0 text-[10px] tracking-[0.16em] text-md-600 uppercase">
          {group.frames} frames
        </p>
      </div>

      <div className="flex gap-[10px]">
        <Preview src={lead?.coverImage} alt={lead?.name ?? group.country} />
        <Preview src={trail?.coverImage} alt={trail?.name ?? group.country} />

        <div
          className="flex-1 text-[10px] leading-[1.7]"
          style={{ color: LIST_COLOR }}
        >
          {group.series.map((series) => (
            <Link
              key={series._id}
              to={`/gallery?category=${series.slug}`}
              onMouseEnter={() => setHovered(series)}
              onMouseLeave={() => setHovered(null)}
              className="block transition-colors duration-200 hover:text-md-red"
            >
              {series.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PhotoSeries() {
  const { data, isLoading } = useActiveCategories();
  const groups = groupByCountry(data ?? []);

  if (!isLoading && groups.length === 0) return null;

  return (
    <section id="series" className="px-9 pt-[110px]">
      <span className="text-[11px] tracking-[0.2em] text-md-red uppercase">
        03 &mdash; Photo series
      </span>

      <div className="mt-[18px] flex flex-col gap-[18px]">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[96px_1fr] items-start gap-4 border-t-2 border-md-divider pt-3 max-[900px]:grid-cols-1"
                aria-hidden="true"
              >
                <div className="h-[18px] w-20 bg-md-300" />
                <div className="flex gap-[10px]">
                  <div className="h-[84px] flex-1 bg-md-300" />
                  <div className="h-[84px] flex-1 bg-md-300" />
                  <div className="flex-1" />
                </div>
              </div>
            ))
          : groups.map((group, i) => (
              <SeriesBand
                key={group.country}
                group={group}
                last={i === groups.length - 1}
              />
            ))}
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { getActiveCategories, getPhotos, getSettings } from "@/lib/content";
import { GalleryControls } from "@/components/public/gallery/GalleryControls";
import { LoadMore } from "@/components/public/gallery/LoadMore";
import {
  GalleryFrame,
  MASONRY_CLASS,
} from "@/components/public/gallery/GalleryFrame";
import type { ActiveCategory } from "@/types/content";

const SECTION_CLASS = "px-9 max-[900px]:px-5";
const KICKER_CLASS = "text-[11px] tracking-[0.2em] text-md-red uppercase";
const PER_PAGE = 12;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const site = settings?.siteTitle ?? "Photography";
  const description = `Every photograph in the ${site} archive, grouped by series.`;

  return {
    title: "Gallery",
    description,
    alternates: { canonical: "/gallery" },
    openGraph: { type: "website", title: `Gallery — ${site}`, description },
  };
}

function Header({ categories }: { categories: ActiveCategory[] }) {
  return (
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
      <GalleryControls categories={categories} />
    </section>
  );
}

type PageProps = {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    search?: string;
  }>;
};

export default async function GalleryPage({ searchParams }: PageProps) {
  const { category = "", collection = "", search = "" } = await searchParams;
  const categories = (await getActiveCategories()) ?? [];

  // Any filter or search collapses the bands into one flat result set.
  const filtered = Boolean(category || collection || search);

  if (filtered) {
    const params = {
      category: category || undefined,
      collection: collection || undefined,
      search: search || undefined,
    };
    const result = await getPhotos({ ...params, perpage: PER_PAGE });
    const photos = result?.photos ?? [];
    const activeName =
      categories.find((item) => item.slug === category)?.name ?? "";

    return (
      <div className="modernist text-md-fg">
        <Header categories={categories} />

        <section className={`${SECTION_CLASS} pb-[90px]`}>
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-md-divider pt-6">
            <h2 className="m-0 font-bold tracking-[-0.02em] text-[clamp(20px,2.4vw,32px)] leading-none">
              {activeName || (search ? "Search results" : "All work")}
            </h2>
            <span className="text-[11px] tracking-[0.16em] text-md-600 uppercase">
              {result?.pagination.total ?? 0} photographs
            </span>
          </div>

          {photos.length === 0 ? (
            <p className="m-0 py-16 text-center text-[14px] text-md-600">
              Nothing matched that. Try a different title, series or location.
            </p>
          ) : (
            <div className="mt-10">
              <div className={MASONRY_CLASS}>
                {photos.map((photo, i) => (
                  <GalleryFrame
                    key={photo._id}
                    photo={photo}
                    priority={i < 2}
                  />
                ))}
              </div>
              <LoadMore
                params={params}
                perpage={PER_PAGE}
                totalPages={result?.pagination.totalPages ?? 1}
              />
            </div>
          )}
        </section>
      </div>
    );
  }

  // Resting state: one band per series, plus anything with no series assigned
  // so the gallery holds the whole archive. Fetched in parallel.
  const bands = await Promise.all([
    ...categories.map(async (item) => ({
      title: item.name,
      kicker: item.country || "Series",
      params: { category: item.slug },
      result: await getPhotos({ category: item.slug, perpage: PER_PAGE }),
    })),
    (async () => ({
      title: "Unsorted",
      kicker: "Everything else",
      params: { uncategorized: true },
      result: await getPhotos({ uncategorized: true, perpage: PER_PAGE }),
    }))(),
  ]);

  return (
    <div className="modernist text-md-fg">
      <Header categories={categories} />

      <div className="pb-[70px]">
        {bands.map((band, bandIndex) => {
          const photos = band.result?.photos ?? [];
          if (photos.length === 0) return null;

          return (
            <section
              key={band.title}
              className={`${SECTION_CLASS} pt-[60px] pb-[60px]`}
            >
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <span className={KICKER_CLASS}>{band.kicker}</span>
                  <h2 className="mt-[10px] mb-0 font-bold tracking-[-0.025em] text-[clamp(24px,3.2vw,44px)] leading-none">
                    {band.title}
                  </h2>
                </div>
                <span className="text-[11px] tracking-[0.16em] text-md-600 uppercase">
                  {band.result?.pagination.total ?? 0} photographs
                </span>
              </div>

              <div className="mt-10">
                <div className={MASONRY_CLASS}>
                  {photos.map((photo, i) => (
                    <GalleryFrame
                      key={photo._id}
                      photo={photo}
                      // Only the first band's opening frames are eager.
                      priority={bandIndex === 0 && i < 2}
                    />
                  ))}
                </div>
                <LoadMore
                  params={band.params}
                  perpage={PER_PAGE}
                  totalPages={band.result?.pagination.totalPages ?? 1}
                />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { usePublicPhotos } from "@/api/photos";
import { MdReveal } from "@/components/public/MdReveal";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { photoSrcSet } from "@/lib/image";

// The triptych is staggered and the middle frame is the taller anchor of the
// row, so column position - not the photo - decides offset and aspect.
const COLUMNS = [
  { paddingTop: 130, aspect: "4 / 5" },
  { paddingTop: 0, aspect: "3 / 4" },
  { paddingTop: 66, aspect: "4 / 5" },
];

const SIZES = "(max-width: 900px) 100vw, 33vw";

function column(index: number) {
  return COLUMNS[index % COLUMNS.length];
}

export function FeaturedPhotos() {
  const { data, isLoading } = usePublicPhotos({ featured: true, perpage: 3 });
  const photos = data?.photos ?? [];

  if (!isLoading && photos.length === 0) return null;

  return (
    <section id="work" className="px-9 pt-[110px] pb-10">
      <div className="flex flex-wrap items-end justify-between gap-8 border-b-2 border-md-divider pb-5">
        <div>
          <span className="text-[11px] tracking-[0.2em] text-md-red uppercase">
            01 &mdash; Featured
          </span>
          <MdReveal>
            <h2 className="mt-[14px] font-bold tracking-[-0.025em] text-[clamp(30px,4.4vw,62px)] leading-none">
              Selected frames
            </h2>
          </MdReveal>
        </div>
        <p className="m-0 max-w-[330px] text-[13px] leading-[1.65] text-md-700">
          Curated by the photographer from the featured set.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-3 items-start gap-[52px] max-[900px]:grid-cols-1">
        {isLoading
          ? COLUMNS.map((col, i) => (
              <div
                key={i}
                className="max-[900px]:pt-0"
                style={{ paddingTop: col.paddingTop }}
              >
                <div
                  className="bg-md-300"
                  style={{ aspectRatio: col.aspect }}
                  aria-hidden="true"
                />
              </div>
            ))
          : photos.map((photo, i) => {
              const col = column(i);
              return (
                <MdReveal key={photo._id}>
                  <Link
                    to={`/gallery?photo=${photo.slug}`}
                    className="md-photo block max-[900px]:pt-0"
                    style={{ paddingTop: col.paddingTop }}
                  >
                    <figure className="m-0 flex flex-col gap-[14px]">
                      <div className="flex justify-between text-[10px] tracking-[0.16em] text-md-600 uppercase">
                        <span>{photo.location}</span>
                        <span>{photo.category?.name}</span>
                      </div>

                      <div
                        className="relative overflow-hidden grayscale"
                        style={{ aspectRatio: col.aspect }}
                      >
                        <ProgressiveImage
                          src={photo.images.medium}
                          srcSet={photoSrcSet(photo.images)}
                          sizes={SIZES}
                          blurDataURL={photo.images.blurDataURL}
                          alt={photo.title}
                          className="h-full w-full"
                        />
                        <span className="md-cap pointer-events-none absolute bottom-3 left-3 bg-md-red px-[10px] py-[7px] text-[10px] font-semibold tracking-[0.18em] text-md-light uppercase">
                          View
                        </span>
                      </div>

                      <figcaption className="flex justify-between gap-4 text-[11px] leading-[1.5] tracking-[0.08em] uppercase">
                        <span>{photo.title}</span>
                        <span className="text-md-500">
                          {String(i + 1).padStart(3, "0")}
                        </span>
                      </figcaption>
                    </figure>
                  </Link>
                </MdReveal>
              );
            })}
      </div>
    </section>
  );
}

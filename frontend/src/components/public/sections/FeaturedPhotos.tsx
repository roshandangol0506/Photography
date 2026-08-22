import { Link } from "react-router-dom";
import { usePublicPhotos } from "@/api/photos";
import { LikeButton } from "@/components/public/LikeButton";
import { CommentCount } from "@/components/public/CommentCount";
import { MdReveal } from "@/components/public/MdReveal";
import { SectionHeading } from "@/components/public/SectionHeading";
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
      <SectionHeading
        kicker="Featured"
        title="Selected frames"
        lead="Curated by the photographer from the featured set."
      />

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
                  <figure
                    className="md-photo m-0 flex flex-col gap-[14px] max-[900px]:pt-0"
                    style={{ paddingTop: col.paddingTop }}
                  >
                    <div className="flex justify-between text-[10px] tracking-[0.16em] text-md-600 uppercase">
                      <span>{photo.location}</span>
                      <span>{photo.category?.name}</span>
                    </div>

                    <div
                      className="relative overflow-hidden"
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

                      {/* The link covers the frame so the whole photo opens
                          the detail page, while the heart sits above it. */}
                      <Link
                        to={`/photo/${photo.slug}`}
                        aria-label={`View ${photo.title}`}
                        className="absolute inset-0"
                      />

                      <span className="md-cap pointer-events-none absolute bottom-3 left-3 bg-md-red px-[10px] py-[7px] text-[10px] font-semibold tracking-[0.18em] text-md-light uppercase">
                        View
                      </span>

                      <div className="md-like absolute right-3 bottom-3 z-10 flex items-center gap-3">
                        <LikeButton
                          photoId={photo._id}
                          likeCount={photo.likeCount}
                          size="sm"
                          className="cursor-pointer text-[10px] font-semibold tracking-[0.18em] text-md-light uppercase"
                        />
                        <CommentCount
                          slug={photo.slug}
                          count={photo.commentCount}
                          className="text-[10px] font-semibold tracking-[0.18em] text-md-light! uppercase"
                        />
                      </div>
                    </div>

                    <figcaption className="flex justify-between gap-4 text-[11px] leading-[1.5] tracking-[0.08em] uppercase">
                      <span>{photo.title}</span>
                      <span className="text-md-500">
                        {String(i + 1).padStart(3, "0")}
                      </span>
                    </figcaption>
                  </figure>
                </MdReveal>
              );
            })}
      </div>
    </section>
  );
}

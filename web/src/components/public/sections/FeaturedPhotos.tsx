import Link from "next/link";
import { LikeButton } from "@/components/public/LikeButton";
import { CommentCount } from "@/components/public/CommentCount";
import { MdReveal } from "@/components/public/MdReveal";
import { SectionHeading } from "@/components/public/SectionHeading";
import { PhotoImage } from "@/components/public/PhotoImage";
import { PhotoFrame } from "@/components/public/PhotoFrame";
import type { Photo } from "@/types/content";

// The triptych is staggered and the middle frame is the taller anchor of the
// row, so column position - not the photo - decides offset and aspect.
const COLUMNS = [
  { paddingTop: 130, aspect: "4 / 5" },
  { paddingTop: 0, aspect: "3 / 4" },
  { paddingTop: 66, aspect: "4 / 5" },
];

// The columns are 33vw wide but 4/5 and 3/4 tall, and object-cover scales a
// landscape source to the taller edge - so it is drawn wider than its column.
const SIZES = "(max-width: 900px) 100vw, 55vw";

function column(index: number) {
  return COLUMNS[index % COLUMNS.length];
}

/**
 * Server Component. Only the like control is interactive, so the grid, the
 * captions and the links all render as static HTML.
 */
export function FeaturedPhotos({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) return null;

  return (
    <section id="work" className="px-9 pt-[110px] pb-10">
      <SectionHeading
        kicker="01 — Featured"
        title="Selected frames"
        lead="Curated by the photographer from the featured set."
      />

      <div className="mt-16 grid grid-cols-3 items-start gap-[52px] max-[900px]:grid-cols-1">
        {photos.map((photo, i) => {
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

                <PhotoFrame
                  className="overflow-hidden"
                  style={{ aspectRatio: col.aspect }}
                >
                  <PhotoImage
                    images={photo.images}
                    alt={photo.title}
                    sizes={SIZES}
                    fill
                    className="object-cover"
                  />

                  {/* Covers the frame so the whole photo opens the detail
                      page, while the controls above it stay independent. */}
                  <Link
                    href={`/photo/${photo.slug}`}
                    aria-label={`View ${photo.title}`}
                    className="absolute inset-0 z-[2]"
                  />

                  <span className="md-cap pointer-events-none absolute bottom-3 left-3 z-[2] bg-md-red px-[10px] py-[7px] text-[10px] font-semibold tracking-[0.18em] text-md-light uppercase">
                    View
                  </span>

                  <div className="md-like absolute right-3 bottom-3 z-[3] flex items-center gap-3">
                    <LikeButton
                      photoId={photo._id}
                      likeCount={photo.likeCount}
                      size="sm"
                      className="cursor-pointer text-[10px] font-semibold tracking-[0.18em] text-md-light uppercase"
                    />
                    <CommentCount
                      slug={photo.slug}
                      count={photo.commentCount}
                      className="text-[10px] font-semibold tracking-[0.18em] text-md-light uppercase"
                    />
                  </div>
                </PhotoFrame>

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

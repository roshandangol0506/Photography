import Link from "next/link";
import { LikeButton } from "@/components/public/LikeButton";
import { CommentCount } from "@/components/public/CommentCount";
import { MdReveal } from "@/components/public/MdReveal";
import { SectionHeading } from "@/components/public/SectionHeading";
import { PhotoImage } from "@/components/public/PhotoImage";
import { PhotoFrame } from "@/components/public/PhotoFrame";
import type { Photo } from "@/types/content";
import { cn } from "@/lib/utils";

// Deliberately asymmetric: two wide frames anchor rows one and two, and cells
// 3 and 6 drop 56px to break the baseline.
const CELLS = [
  { span: true, aspect: "3 / 2", drop: false },
  { span: false, aspect: "3 / 4", drop: false },
  { span: false, aspect: "3 / 4", drop: true },
  { span: false, aspect: "3 / 4", drop: false },
  { span: true, aspect: "3 / 2", drop: false },
  { span: false, aspect: "3 / 4", drop: true },
];

const cell = (index: number) => CELLS[index % CELLS.length];

function cellClass(index: number) {
  const { span, drop } = cell(index);
  return cn(
    span && "col-span-2",
    drop && "mt-[56px]",
    "max-[900px]:col-span-1 max-[900px]:mt-0",
  );
}

// `sizes` must describe the width the image is DRAWN at, not the width of the
// box it peeks through. The 3/2 cells match the usual source aspect, so drawn
// width == cell width. The 3/4 cells are taller than a landscape source, so
// object-cover scales to fit the HEIGHT and the image is drawn ~2x the cell
// width, with the overflow cropped. Declaring the cell width there made every
// upright frame fetch a file half the resolution it needed.
const sizes = (index: number) =>
  cell(index).span
    ? "(max-width: 900px) 100vw, 50vw"
    : "(max-width: 900px) 100vw, 50vw";

export function RecentWorks({
  photos,
  total,
}: {
  photos: Photo[];
  total: number;
}) {
  if (photos.length === 0) return null;

  return (
    <section id="archive" className="px-9 pt-[110px] pb-10">
      <SectionHeading kicker="04 — Recent works" title="The archive">
        <Link
          href="/gallery"
          className="mt-6 inline-block border-b border-md-500 pb-1.5 text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 hover:text-md-red"
        >
          All {total} photographs &rarr;
        </Link>
      </SectionHeading>

      <div className="mt-[52px] grid auto-rows-auto grid-cols-4 gap-9 max-[900px]:grid-cols-1">
        {photos.map((photo, i) => (
          <MdReveal key={photo._id} className={cellClass(i)}>
            <PhotoFrame
              className="md-photo overflow-hidden"
              style={{ aspectRatio: cell(i).aspect }}
            >
              <PhotoImage
                images={photo.images}
                alt={photo.title}
                sizes={sizes(i)}
                fill
                className="object-cover"
              />

              <Link
                href={`/photo/${photo.slug}`}
                aria-label={`View ${photo.title}`}
                className="absolute inset-0 z-[2]"
              />

              <span className="md-cap pointer-events-none absolute bottom-3 left-3 z-[2] bg-md-ink px-[10px] py-[7px] text-[10px] tracking-[0.14em] text-md-light uppercase">
                {photo.location || photo.title}
              </span>

              <div className="md-like absolute right-3 bottom-3 z-[3] flex items-center gap-3">
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
            </PhotoFrame>
          </MdReveal>
        ))}
      </div>
    </section>
  );
}

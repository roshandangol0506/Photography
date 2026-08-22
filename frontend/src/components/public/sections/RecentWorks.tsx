import { Link } from "react-router-dom";
import { usePublicPhotos } from "@/api/photos";
import { LikeButton } from "@/components/public/LikeButton";
import { CommentCount } from "@/components/public/CommentCount";
import { MdReveal } from "@/components/public/MdReveal";
import { SectionHeading } from "@/components/public/SectionHeading";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { photoSrcSet } from "@/lib/image";
import { cn } from "@/lib/utils";

// The grid is deliberately asymmetric: two wide frames anchor rows one and
// two, and cells 3 and 6 drop 56px to break the baseline.
const CELLS = [
  { span: true, aspect: "3 / 2", drop: false },
  { span: false, aspect: "3 / 4", drop: false },
  { span: false, aspect: "3 / 4", drop: true },
  { span: false, aspect: "3 / 4", drop: false },
  { span: true, aspect: "3 / 2", drop: false },
  { span: false, aspect: "3 / 4", drop: true },
];

function cell(index: number) {
  return CELLS[index % CELLS.length];
}

function cellClass(index: number) {
  const { span, drop } = cell(index);
  return cn(
    span && "col-span-2",
    drop && "mt-[56px]",
    "max-[900px]:col-span-1 max-[900px]:mt-0",
  );
}

function sizes(index: number) {
  return cell(index).span
    ? "(max-width: 900px) 100vw, 50vw"
    : "(max-width: 900px) 100vw, 25vw";
}

export function RecentWorks() {
  const { data, isLoading } = usePublicPhotos({ perpage: 6 });
  const photos = data?.photos ?? [];
  const total = data?.pagination.total ?? 0;

  if (!isLoading && photos.length === 0) return null;

  return (
    <section id="archive" className="px-9 pt-[110px] pb-10">
      <SectionHeading kicker="Recent works" title="The archive">
        <Link
          to="/gallery"
          className="mt-6 inline-block border-b border-md-500 pb-1.5 text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 hover:text-md-red"
        >
          All {total} photographs &rarr;
        </Link>
      </SectionHeading>

      <div className="mt-[52px] grid auto-rows-auto grid-cols-4 gap-9 max-[900px]:grid-cols-1">
        {isLoading
          ? CELLS.map((item, i) => (
              <div key={i} className={cellClass(i)} aria-hidden="true">
                <div
                  className="w-full bg-md-300"
                  style={{ aspectRatio: item.aspect }}
                />
              </div>
            ))
          : photos.map((photo, i) => (
              <MdReveal key={photo._id} className={cellClass(i)}>
                <div
                  className="md-photo relative overflow-hidden"
                  style={{ aspectRatio: cell(i).aspect }}
                >
                  <ProgressiveImage
                    src={photo.images.medium}
                    srcSet={photoSrcSet(photo.images)}
                    sizes={sizes(i)}
                    blurDataURL={photo.images.blurDataURL}
                    alt={photo.title}
                    className="h-full w-full"
                  />

                  {/* Covers the frame so the whole photo stays clickable
                      while the heart above it stays independent. */}
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
                      className="text-[10px] tracking-[0.14em] text-md-light! uppercase"
                    />
                  </div>
                </div>
              </MdReveal>
            ))}
      </div>
    </section>
  );
}

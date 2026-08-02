import { Link } from "react-router-dom";
import { usePublicPhotos } from "@/api/photos";
import { MdReveal } from "@/components/public/MdReveal";
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
      <div className="flex flex-wrap items-end justify-between gap-8 border-b-2 border-md-divider pb-5">
        <div>
          <span className="text-[11px] tracking-[0.2em] text-md-red uppercase">
            04 &mdash; Recent works
          </span>
          <MdReveal>
            <h2 className="mt-[14px] font-bold tracking-[-0.025em] text-[clamp(30px,4.4vw,62px)] leading-none">
              The archive
            </h2>
          </MdReveal>
        </div>
        <Link
          to="/gallery"
          className="border-b border-md-500 pb-1.5 text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 hover:text-md-red"
        >
          All {total} photographs &rarr;
        </Link>
      </div>

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
                <Link
                  to={`/gallery?photo=${photo.slug}`}
                  className="md-photo relative block overflow-hidden grayscale"
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
                  <span className="md-cap absolute bottom-3 left-3 bg-md-ink px-[10px] py-[7px] text-[10px] tracking-[0.14em] text-md-light uppercase">
                    {photo.location || photo.title}
                  </span>
                </Link>
              </MdReveal>
            ))}
      </div>
    </section>
  );
}

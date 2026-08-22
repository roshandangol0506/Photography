import Link from "next/link";
import { LikeButton } from "@/components/public/LikeButton";
import { CommentCount } from "@/components/public/CommentCount";
import { PhotoImage } from "@/components/public/PhotoImage";
import { PhotoFrame } from "@/components/public/PhotoFrame";
import type { Photo } from "@/types/content";

export const MASONRY_CLASS =
  "columns-3 gap-6 max-[1200px]:columns-2 max-[640px]:columns-1";

/**
 * One masonry cell. No "use client" directive: rendered from the server on
 * first paint, and reused inside the client load-more list where it becomes
 * part of that bundle.
 */
export function GalleryFrame({
  photo,
  priority = false,
}: {
  photo: Photo;
  priority?: boolean;
}) {
  const alt = [photo.title, photo.location, photo.category?.name]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="md-photo mb-6 break-inside-avoid">
      <PhotoFrame className="overflow-hidden">
        {/* Intrinsic sizing keeps portraits portrait and landscapes
            landscape; nothing is cropped. */}
        <PhotoImage
          images={photo.images}
          alt={alt}
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          width={1200}
          height={800}
          priority={priority}
          className="h-auto w-full"
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

      <p className="mt-3 mb-0 text-[11px] tracking-[0.08em] uppercase">
        {photo.title}
      </p>
    </div>
  );
}

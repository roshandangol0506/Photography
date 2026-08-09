import { Link, useParams } from "react-router-dom";
import { Eye, MessageCircle } from "lucide-react";
import { usePhotoBySlug } from "@/api/photos";
import { useSeo } from "@/hooks/useSeo";
import { LikeButton } from "@/components/public/LikeButton";
import { PhotoComments } from "@/components/public/PhotoComments";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { photoSrcSet } from "@/lib/image";

const LABEL_CLASS = "m-0 text-[10px] tracking-[0.2em] text-md-600 uppercase";
const VALUE_CLASS = "mt-1.5 mb-0 text-[14px]";

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className={LABEL_CLASS}>{label}</p>
      <p className={VALUE_CLASS}>{value}</p>
    </div>
  );
}

export default function PhotoDetail() {
  const { slug } = useParams();
  const { data, isLoading } = usePhotoBySlug(slug);

  const photo = data?.photo;
  useSeo(
    photo
      ? {
          title: photo.title,
          description: photo.description,
          image: photo.images.large,
        }
      : undefined,
  );

  return (
    <div className="modernist min-h-screen bg-md-ground text-md-fg">
      {isLoading && (
        <div
          className="w-full bg-md-300"
          style={{ height: "clamp(320px, 60vh, 720px)" }}
          aria-hidden="true"
        />
      )}

      {!isLoading && !photo && (
        <div className="px-9 py-24 text-center">
          <h1 className="m-0 font-bold tracking-[-0.025em] text-[clamp(28px,4vw,52px)] leading-none">
            Photograph not found
          </h1>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-4 bg-md-ink px-5 py-4 text-[12px] font-semibold tracking-[0.16em] text-md-light uppercase transition-colors duration-200 hover:bg-md-red"
          >
            Back to home <span>&rarr;</span>
          </Link>
        </div>
      )}

      {photo && (
        <>
          {/* No srcSet, no height cap: the largest stored variant renders at
              its own intrinsic pixel size, only shrinking when the viewport is
              narrower than the photograph. Nothing is cropped or upscaled. */}
          <div className="flex justify-center bg-md-ink px-9 py-10 max-[900px]:px-4 max-[900px]:py-5">
            <img
              src={photo.images.large}
              alt={photo.title}
              className="h-auto max-w-full"
            />
          </div>

          <div className="grid grid-cols-[1.2fr_0.8fr] gap-16 px-9 py-[70px] max-[900px]:grid-cols-1 max-[900px]:gap-10 max-[900px]:px-5 max-[900px]:py-10">
            <div>
              {photo.category?.name && (
                <span className="text-[11px] tracking-[0.2em] text-md-red uppercase">
                  {photo.category.name}
                </span>
              )}
              <h1 className="mt-[14px] mb-0 font-bold tracking-[-0.025em] text-[clamp(30px,4.4vw,62px)] leading-none">
                {photo.title}
              </h1>

              {photo.description && (
                <p className="mt-7 mb-0 max-w-[560px] text-[15px] leading-[1.75] text-md-700">
                  {photo.description}
                </p>
              )}

              <div className="mt-9 flex flex-wrap items-center gap-7 border-t-2 border-md-divider pt-6">
                <LikeButton
                  photoId={photo._id}
                  likeCount={photo.likeCount}
                  className="text-[13px] tracking-[0.14em] uppercase"
                />
                <span className="inline-flex items-center gap-2 text-[13px] tracking-[0.14em] text-md-600 uppercase">
                  <MessageCircle className="h-4 w-4" /> {photo.commentCount}
                </span>
                <span className="inline-flex items-center gap-2 text-[13px] tracking-[0.14em] text-md-600 uppercase">
                  <Eye className="h-4 w-4" /> {photo.viewCount} views
                </span>
              </div>

              {photo.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {photo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border-2 border-md-divider px-3 py-1.5 text-[10px] tracking-[0.16em] text-md-700 uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-7 border-t-2 border-md-divider pt-6 max-[900px]:pt-6">
              <Detail label="Location" value={photo.location} />
              <Detail label="Taken" value={formatDate(photo.dateTaken)} />
              <Detail label="Camera" value={photo.camera} />
              <Detail label="Lens" value={photo.lens} />
              <Detail label="Series" value={photo.category?.name} />
              <Detail
                label="Collections"
                value={
                  photo.collections.length > 0
                    ? photo.collections.map((item) => item.name).join(", ")
                    : undefined
                }
              />
            </div>
          </div>

          <PhotoComments photoId={photo._id} />

          {data.related.length > 0 && (
            <div className="border-t-2 border-md-divider px-9 py-[70px] max-[900px]:px-5 max-[900px]:py-10">
              <span className="text-[11px] tracking-[0.2em] text-md-red uppercase">
                More from this series
              </span>
              <div className="mt-9 grid grid-cols-4 gap-9 max-[900px]:grid-cols-2 max-[900px]:gap-4">
                {data.related.slice(0, 4).map((item) => (
                  <Link
                    key={item._id}
                    to={`/photo/${item.slug}`}
                    className="md-photo block overflow-hidden"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <ProgressiveImage
                        src={item.images.medium}
                        srcSet={photoSrcSet(item.images)}
                        sizes="(max-width: 900px) 50vw, 25vw"
                        blurDataURL={item.images.blurDataURL}
                        alt={item.title}
                        className="h-full w-full"
                      />
                    </div>
                    <p className="mt-3 mb-0 text-[11px] tracking-[0.08em] uppercase">
                      {item.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

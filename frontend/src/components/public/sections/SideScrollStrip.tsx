import { useSideScrollPhotos } from "@/api/photos";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";

export function SideScrollStrip() {
  const { data: photos } = useSideScrollPhotos();

  if (!photos || photos.length === 0) return null;

  const loopPhotos = [...photos, ...photos];

  return (
    <section className="overflow-hidden border-y border-border py-8">
      <div className="animate-marquee flex w-max gap-4">
        {loopPhotos.map((photo, i) => (
          <div
            key={`${photo._id}-${i}`}
            className="h-48 w-72 shrink-0 overflow-hidden rounded-xl"
          >
            <ProgressiveImage
              src={photo.images.medium}
              blurDataURL={photo.images.blurDataURL}
              alt={photo.title}
              className="h-full w-full"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

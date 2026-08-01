import { useSideScrollPhotos } from "@/api/photos";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { photoSrcSet } from "@/lib/image";

function formatDateTaken(dateTaken?: string | null) {
  if (!dateTaken) return "";
  const date = new Date(dateTaken);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function SideScrollStrip() {
  const { data: photos } = useSideScrollPhotos();

  if (!photos || photos.length === 0) return null;

  const loopPhotos = [...photos, ...photos];

  return (
    <section className="overflow-hidden border-y border-border py-8">
      <div className="animate-marquee flex w-max gap-6">
        {loopPhotos.map((photo, i) => {
          const cameraLens = [photo.camera, photo.lens]
            .filter(Boolean)
            .join(" + ");
          const dateLabel = formatDateTaken(photo.dateTaken);

          return (
            <div key={`${photo._id}-${i}`} className="w-72 shrink-0">
              <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-foreground">
                <span className="truncate">{photo.title}</span>
                {photo.category?.name && (
                  <span className="shrink-0 text-muted-foreground">
                    {photo.category.name}
                  </span>
                )}
              </div>

              <div className="h-48 w-72 overflow-hidden rounded-xl">
                <ProgressiveImage
                  src={photo.images.medium}
                  srcSet={photoSrcSet(photo.images)}
                  sizes="288px"
                  blurDataURL={photo.images.blurDataURL}
                  alt={photo.title}
                  className="h-full w-full"
                />
              </div>

              {(cameraLens || dateLabel) && (
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span className="truncate">{cameraLens}</span>
                  <span className="shrink-0">{dateLabel}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

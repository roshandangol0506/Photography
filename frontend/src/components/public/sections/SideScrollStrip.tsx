import { useReducedMotion } from "framer-motion";
import { useSideScrollPhotos } from "@/api/photos";
import { useTheme } from "@/hooks/useTheme";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { photoSrcSet } from "@/lib/image";
import { cn } from "@/lib/utils";

// Mixed frame sizes with alternating alignment, cycled across the strip.
const FRAMES = [
  { width: 300, height: 390, bottom: false },
  { width: 430, height: 290, bottom: true },
  { width: 260, height: 340, bottom: false },
  { width: 390, height: 260, bottom: true },
];

export function SideScrollStrip() {
  const { settings } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const { data: photos, isLoading } = useSideScrollPhotos();

  if (!isLoading && (!photos || photos.length === 0)) return null;

  const animate = settings.animationsEnabled && !prefersReducedMotion;
  // Duplicated so the -50% translation lands back on an identical frame.
  const loop = photos ? [...photos, ...photos] : [];

  return (
    <section className="md-marquee mt-[90px] overflow-hidden bg-md-ink">
      <div className="flex items-baseline justify-between px-9 py-[22px] text-md-light">
        <span className="text-[11px] tracking-[0.2em] uppercase">
          06 &mdash; On the road
        </span>
        <span
          className="text-[11px] tracking-[0.14em] uppercase max-[900px]:hidden"
          style={{ color: "rgba(248,244,244,.6)" }}
        >
          Hover to pause
        </span>
      </div>

      <div
        className={cn(
          "flex w-max gap-[26px] px-[26px] pb-[30px]",
          animate && !isLoading && "md-marquee-track",
        )}
      >
        {isLoading
          ? FRAMES.map((frame, i) => (
              <div
                key={i}
                className={cn(
                  "flex-none",
                  frame.bottom && "self-end",
                )}
                style={{
                  width: frame.width,
                  height: frame.height,
                  background: "rgba(248,244,244,.12)",
                }}
                aria-hidden="true"
              />
            ))
          : loop.map((photo, i) => {
              const frame = FRAMES[i % FRAMES.length];
              return (
                <div
                  key={`${photo._id}-${i}`}
                  className={cn("flex-none", frame.bottom && "self-end")}
                  style={{ width: frame.width, height: frame.height }}
                >
                  <ProgressiveImage
                    src={photo.images.medium}
                    srcSet={photoSrcSet(photo.images)}
                    sizes={`${frame.width}px`}
                    blurDataURL={photo.images.blurDataURL}
                    alt={photo.title}
                    className="h-full w-full"
                  />
                </div>
              );
            })}
      </div>
    </section>
  );
}

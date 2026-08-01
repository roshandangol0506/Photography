import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePublicPhotos } from "@/api/photos";
import { SectionReveal } from "@/components/public/SectionReveal";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { photoSrcSet } from "@/lib/image";

const VISIBLE_THUMBNAILS = 3;
const SPRING = { type: "spring", stiffness: 300, damping: 32 } as const;

const SMALL_IMAGE_CLASS =
  "h-20 w-20 shrink-0 overflow-hidden sm:h-28 sm:w-28 md:h-40 md:w-40 lg:h-56 lg:w-56 xl:h-72 xl:w-72";

/**
 * Manual FLIP (First-Last-Invert-Play) shared-element animation.
 *
 * Framer Motion's `layoutId` shared-layout projection is unreliable in this
 * project's exact React/Framer Motion version combination (verified via
 * isolated testing: the transition freezes mid-animation regardless of DOM
 * structure). This hook reimplements the same visual effect by hand: it
 * measures every tracked element's bounding box before and after a render,
 * and animates the delta with Framer Motion's plain numeric spring tweening
 * (`animate()`), which is a separate code path from the buggy layout
 * projector. The result is the same "same element travels + resizes between
 * positions" effect, driven manually instead of automatically.
 */
function useFlipGroup(dependency: unknown) {
  const nodesRef = useRef(new Map<string, HTMLElement>());
  const prevRectsRef = useRef(new Map<string, DOMRect>());
  const stopFnsRef = useRef(new Map<string, () => void>());

  const registerRef = (id: string) => (el: HTMLElement | null) => {
    if (el) nodesRef.current.set(id, el);
    else nodesRef.current.delete(id);
  };

  useLayoutEffect(() => {
    // Stop any in-flight animations and clear their transforms so the
    // "natural" (post-render) position can be measured accurately.
    stopFnsRef.current.forEach((stop) => stop());
    stopFnsRef.current.clear();
    nodesRef.current.forEach((el) => {
      el.style.transform = "";
    });

    const newRects = new Map<string, DOMRect>();
    nodesRef.current.forEach((el, id) => {
      newRects.set(id, el.getBoundingClientRect());
    });

    nodesRef.current.forEach((el, id) => {
      const prev = prevRectsRef.current.get(id);
      const next = newRects.get(id);
      if (!prev || !next || prev.width === 0 || next.width === 0) return;

      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      const scaleX = prev.width / next.width;
      const scaleY = prev.height / next.height;

      if (
        Math.abs(dx) < 0.5 &&
        Math.abs(dy) < 0.5 &&
        Math.abs(scaleX - 1) < 0.01 &&
        Math.abs(scaleY - 1) < 0.01
      ) {
        return;
      }

      el.style.transformOrigin = "top left";
      el.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;

      const controls = animate(1, 0, {
        ...SPRING,
        onUpdate: (progress) => {
          const curDx = dx * progress;
          const curDy = dy * progress;
          const curScaleX = 1 + (scaleX - 1) * progress;
          const curScaleY = 1 + (scaleY - 1) * progress;
          el.style.transform = `translate(${curDx}px, ${curDy}px) scale(${curScaleX}, ${curScaleY})`;
        },
        onComplete: () => {
          el.style.transform = "";
          el.style.transformOrigin = "";
          stopFnsRef.current.delete(id);
        },
      });
      stopFnsRef.current.set(id, () => controls.stop());
    });

    prevRectsRef.current = newRects;
  }, [dependency]);

  return registerRef;
}

export function FeaturedPhotos() {
  const { data } = usePublicPhotos({ featured: true, perpage: 8 });
  const photos = data?.photos ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  // Keyed on the active photo's id (not activeIndex) because `photos` loads
  // asynchronously: the first render with photos.length > 0 still has
  // activeIndex === 0, so an effect keyed on activeIndex alone would never
  // re-run to capture the real initial rects once refs actually attach.
  const registerRef = useFlipGroup(photos[activeIndex]?._id ?? null);

  if (photos.length === 0) return null;

  const goToIndex = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, photos.length - 1)));
  };

  // Clicking the LEFT chevron retires the current photo (it travels down
  // below the "Trusted by Hundreds" label, shrinking to thumbnail size) and
  // grows the next one up into the large position. The RIGHT chevron
  // reverses it. Every photo keeps its identity (matched by _id) across the
  // three roles (active / retired / thumbnail), so the FLIP animation above
  // treats a role change as the same photo moving + resizing continuously.
  const handleChevronLeft = () => goToIndex(activeIndex + 1);
  const handleChevronRight = () => goToIndex(activeIndex - 1);

  const active = photos[activeIndex];
  const retired = activeIndex > 0 ? photos[activeIndex - 1] : null;
  const thumbnails = photos.slice(
    activeIndex + 1,
    activeIndex + 1 + VISIBLE_THUMBNAILS,
  );

  return (
    <section className="mx-auto max-w-[100rem] px-4 py-20 sm:px-6 sm:py-24 lg:py-36">
      <div className="flex items-start gap-3 sm:gap-6 md:gap-10 lg:gap-16">
        <button
          type="button"
          onClick={handleChevronLeft}
          disabled={activeIndex >= photos.length - 1}
          aria-label="Show next featured photo"
          className="shrink-0 self-center rounded-full border border-border p-1.5 text-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30 sm:p-2"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <div className="relative flex w-20 shrink-0 flex-col items-center self-stretch sm:w-28 md:w-40 lg:w-56 xl:w-72">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 pt-2 sm:pt-4">
            <SectionReveal>
              <p className="text-center text-xs font-medium uppercase tracking-widest text-primary sm:text-sm">
                Featured
              </p>
              <h2 className="mt-1 text-center text-lg font-bold uppercase leading-[1.1] tracking-tight text-foreground sm:text-xl md:text-2xl">
                Trusted by Hundreds
              </h2>
            </SectionReveal>
          </div>

          <div className="flex h-full w-full items-center justify-center">
            {retired && (
              <div
                key={retired._id}
                ref={registerRef(retired._id)}
                className={SMALL_IMAGE_CLASS}
              >
                <ProgressiveImage
                  src={retired.images.thumb}
                  blurDataURL={retired.images.blurDataURL}
                  alt={retired.title}
                  className="h-full w-full"
                />
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 sm:gap-6 md:gap-10 lg:gap-16">
            <div className="w-40 shrink-0 sm:w-56 md:w-72 lg:w-96 xl:w-md">
              <Link
                to={`/gallery?photo=${active.slug}`}
                ref={registerRef(active._id)}
                className="block overflow-hidden rounded-xl"
              >
                <ProgressiveImage
                  src={active.images.medium}
                  srcSet={photoSrcSet(active.images)}
                  sizes="(max-width: 640px) 40vw, (max-width: 1024px) 56vw, 448px"
                  blurDataURL={active.images.blurDataURL}
                  alt={active.title}
                  className="aspect-3/4"
                  imgClassName="transition-transform duration-500 hover:scale-105"
                />
              </Link>
              <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">
                {active.description || active.title}
              </p>
            </div>

            {thumbnails.map((photo, i) => (
              <button
                key={photo._id}
                type="button"
                ref={registerRef(photo._id)}
                onClick={() =>
                  goToIndex(photos.findIndex((p) => p._id === photo._id))
                }
                aria-label={`Show ${photo.title}`}
                className={`${SMALL_IMAGE_CLASS} rounded-xl opacity-80 transition-opacity hover:opacity-100 ${
                  i === 0 ? "" : i === 1 ? "hidden sm:block" : "hidden md:block"
                }`}
              >
                <ProgressiveImage
                  src={photo.images.thumb}
                  blurDataURL={photo.images.blurDataURL}
                  alt={photo.title}
                  className="h-full w-full"
                />
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleChevronRight}
          disabled={activeIndex === 0}
          aria-label="Show previous featured photo"
          className="shrink-0 self-center rounded-full border border-border p-1.5 text-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30 sm:p-2"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </section>
  );
}

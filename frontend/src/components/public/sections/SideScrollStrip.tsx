import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { useSideScrollPhotos } from "@/api/photos";
import { useTheme } from "@/hooks/useTheme";
import { photoSrcSet } from "@/lib/image";

// Every frame is the same height and takes whatever width its own aspect
// ratio gives it, so landscapes stay landscape and portraits stay portrait.
const FRAME_HEIGHT = "clamp(280px, 40vw, 560px)";

// Seconds for the strip to travel one full copy of the photo list. Matches
// the handoff's 46s loop.
const LOOP_SECONDS = 46;

// Only used before the photos arrive, where there is no real ratio to honour.
const SKELETON_RATIOS = ["3 / 2", "2 / 3", "4 / 3", "3 / 4"];

export function SideScrollStrip() {
  const { settings } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const { data: photos, isLoading } = useSideScrollPhotos();

  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const animate = settings.animationsEnabled && !prefersReducedMotion;
  const hasPhotos = Boolean(photos && photos.length > 0);

  useEffect(() => {
    if (!animate || !hasPhotos) return;
    const el = trackRef.current;
    if (!el) return;

    let frame = 0;
    let last = performance.now();

    const step = (now: number) => {
      const elapsed = now - last;
      last = now;

      // The list is rendered twice, so one copy is half the scrollable width.
      const half = el.scrollWidth / 2;
      if (half > 0) {
        if (!dragging.current) {
          el.scrollLeft += (elapsed / 1000) * (half / LOOP_SECONDS);
        }
        // Wrap in both directions so a backwards drag loops just as cleanly.
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        else if (el.scrollLeft <= 0) el.scrollLeft += half;
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [animate, hasPhotos]);

  if (!isLoading && !hasPhotos) return null;

  const loop = photos ? [...photos, ...photos] : [];

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    dragging.current = true;
    dragStartX.current = event.clientX;
    dragStartScroll.current = el.scrollLeft;
    el.setPointerCapture(event.pointerId);
  };

  const onDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!dragging.current || !el) return;
    el.scrollLeft =
      dragStartScroll.current - (event.clientX - dragStartX.current);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!dragging.current || !el) return;
    dragging.current = false;
    if (el.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className="mt-[90px] bg-md-ink py-10">
      <div className="flex items-baseline justify-between px-9 py-10 text-md-light">
        <span className="text-[11px] tracking-[0.2em] uppercase">
          06 &mdash; On the road
        </span>
        <span
          className="text-[11px] tracking-[0.14em] uppercase max-[900px]:hidden"
          style={{ color: "rgba(248,244,244,.6)" }}
        >
          Drag to explore
        </span>
      </div>

      <div
        ref={trackRef}
        className="md-strip flex cursor-grab items-center gap-7 overflow-x-auto px-[26px] pb-15 select-none active:cursor-grabbing"
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {isLoading
          ? SKELETON_RATIOS.map((ratio, i) => (
              <div
                key={i}
                className="flex-none"
                style={{
                  height: FRAME_HEIGHT,
                  aspectRatio: ratio,
                  background: "rgba(248,244,244,.12)",
                }}
                aria-hidden="true"
              />
            ))
          : loop.map((photo, i) => (
              <img
                key={`${photo._id}-${i}`}
                src={photo.images.medium}
                srcSet={photoSrcSet(photo.images)}
                sizes="(max-width: 900px) 90vw, 40vw"
                alt={photo.title}
                loading={i === 0 ? "eager" : "lazy"}
                draggable={false}
                className="w-auto max-w-none flex-none"
                style={{ height: FRAME_HEIGHT }}
              />
            ))}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Photo } from "@/types/content";
import Image from "next/image";
import { useSite } from "@/components/providers/SiteProvider";

// Every frame is the same height and takes whatever width its own aspect
// ratio gives it, so landscapes stay landscape and portraits stay portrait.
const FRAME_HEIGHT = "clamp(280px, 40vw, 560px)";

// Seconds for the strip to travel one full copy of the photo list. Matches
// the handoff's 46s loop.
const LOOP_SECONDS = 46;


export function SideScrollStrip({ photos }: { photos: Photo[] }) {
  const { settings } = useSite();
  const prefersReducedMotion = useReducedMotion();

  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const animate = settings.animationsEnabled && !prefersReducedMotion;
  const hasPhotos = photos.length > 0;

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

  if (!hasPhotos) return null;

  const loop = [...photos, ...photos];

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
        {loop.map((photo, i) => (
          // Width is intentionally intrinsic so landscapes stay landscape and
          // portraits stay portrait. next/image needs *some* dimensions, so
          // 0/0 plus a style override is the documented escape hatch for
          // images whose ratio is not known ahead of time - the srcset still
          // comes from `sizes`.
          <Image
            quality={90}
            key={`${photo._id}-${i}`}
            src={photo.images.large}
            alt={photo.title}
            width={0}
            height={0}
            sizes="(max-width: 900px) 90vw, 40vw"
            priority={i === 0}
            draggable={false}
            className="max-w-none flex-none select-none"
            style={{ height: FRAME_HEIGHT, width: "auto" }}
          />
        ))}
      </div>
    </section>
  );
}

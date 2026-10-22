"use client";

import "./cinematic.css";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image, { getImageProps } from "next/image";
import { MoveLeft, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CinematicSlide {
  /** The photograph. */
  image: string;
  alt?: string;
  heading?: string;
  subtitle?: string;
  description?: string;
  /** 0-1 darkening over the photograph, for legible copy. */
  overlay?: number;
  /** CSS object-position for the photograph, e.g. "50% 30%". */
  focus?: string;
}

interface CinematicSliderProps {
  slides: CinematicSlide[];
  /** Length of one step in ms; every timing is a share of it. */
  duration?: number;
  /** False shows changes instantly (the site-wide animations switch). */
  animate?: boolean;
  /** Visually hidden page heading, since slide headings are h2s. */
  pageHeading?: string;
  label?: string;
  id?: string;
  className?: string;
}

type Direction = 1 | -1;

interface View {
  /**
   * Position along the strip. Unbounded, so it keeps counting past the end
   * of the list: frame k shows slides[k mod count], and k's parity decides
   * wide or narrow, which keeps the pair on screen alternating even when the
   * list wraps round on an odd count.
   */
  pos: number;
  /** The position whose copy is on its way out. */
  previous: number | null;
  direction: Direction;
  entering: boolean;
}

/** Frames on odd positions are wide, even ones narrow: the pair alternates. */
const isWide = (k: number) => Math.abs(k % 2) === 1;

// Slots relative to `pos`: -1 waits off the left edge (for a step back),
// 0 is the left photo, 1 the right photo, 2 waits off the right edge.
const SLOTS = [-1, 0, 1, 2] as const;

// The picture is drawn at exactly its slot width (43% / 27%; 47% / 29% on
// phones) and only ever clipped, never scaled, so these are the real widths.
const WIDE_SIZES = "(max-width: 600px) 47vw, 43vw";
const NARROW_SIZES = "(max-width: 600px) 29vw, 27vw";

// The textured backdrop. The original is a ~17MB camera-size file, so it goes
// through the image optimizer (2048px WebP) rather than straight to CSS.
const BACKGROUND = `url("${
  getImageProps({ src: "/blackBg2.jpg", alt: "", width: 2048, height: 1365 })
    .props.src
}")`;

// The arrow's lean inside the 200px cursor ring: at most 28px off centre (the
// 22px arrow stays well inside), reached at 24px of pointer travel per event;
// eased 18% of the way each frame, and released after 80ms without movement.
const ARROW_MAX_PX = 28;
const ARROW_FULL_SPEED = 24;
const ARROW_EASE = 0.18;
const ARROW_IDLE_MS = 80;

const SWIPE_MIN_PX = 50;
// A swipe can still end in a click on the zone under the finger.
const SWIPE_CLICK_GUARD_MS = 500;
const REDUCED_MS = 320;
// Copy lines start one after another (rule, heading, subtitle, description).
const LINE_STAGGER_MS = 30;

/**
 * How long one step takes end to end, from the timeline in cinematic.css:
 * the photos are done by 90% of the duration, the last line of copy (three
 * staggers in, running 85%) just after; the incoming backdrop lands with the
 * photos at 88%. Navigation stays locked until all of it is done, so a new
 * step never restarts anything mid-flight or snaps the backdrop into place.
 */
function settleTime(duration: number, motion: "full" | "reduced" | "off") {
  if (motion === "off") return 0;
  if (motion === "reduced") return REDUCED_MS;
  return (
    Math.round(
      Math.max(duration * 0.9 + 3 * LINE_STAGGER_MS, duration * 0.88),
    ) + 40
  );
}

const wrap = (index: number, count: number) =>
  ((index % count) + count) % count;
const pad = (value: number) => String(value).padStart(2, "0");

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);
  return reduced;
}

/**
 * Full-screen hero after the Slider Revolution module on
 * stockphotographynepal.com: two photographs side by side, one wide and one
 * narrow, on a strip. Stepping forward slides the right photo into the left
 * slot, pushes the left one off the left edge and brings the next photo in
 * from the right edge; the copy for the new left photo travels in from the
 * far right. The left half of the frame steps back, the right half forward.
 *
 * The photo crossing the screen squeezes as it goes: its trailing edge darts
 * in first, then its leading edge travels and it unfolds back to full width
 * on arrival; the leaving photo folds into its screen edge and the arriving
 * one unfolds out of the other (see cinematic.css).
 *
 * Every frame is keyed by its absolute strip position, so a step is just a
 * change of slot: CSS moves the same nodes, already loaded, to their new
 * places.
 */
export function CinematicSlider({
  slides,
  duration = 1100,
  animate = true,
  pageHeading,
  label = "Featured photographs",
  id,
  className,
}: CinematicSliderProps) {
  const count = slides.length;
  const reduced = usePrefersReducedMotion();
  const motion = !animate ? "off" : reduced ? "reduced" : "full";
  const settle = settleTime(duration, motion);

  const [view, setView] = useState<View>(() => ({
    pos: 0,
    previous: null,
    direction: 1,
    // The first slide's copy slides in on load, like every later one.
    entering: animate,
  }));

  const rootRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  // Arrow drift inside the ring: last pointer position, the offset the
  // movement asks for (target) and the offset currently drawn, all in px.
  const drift = useRef({
    lastX: 0,
    lastY: 0,
    tracking: false,
    lastMove: 0,
    tx: 0,
    ty: 0,
    x: 0,
    y: 0,
    raf: 0,
  });
  const busy = useRef(animate);
  const timer = useRef<number | undefined>(undefined);
  const frame = useRef(0);
  const inView = useRef(true);
  const lastSwipe = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Release the lock once the entrance on load has finished. Re-timed if the
  // reduced-motion preference arrives after mount, so the short version does
  // not sit behind the full-length lock.
  const intro = useRef(animate);
  useEffect(() => {
    if (!intro.current) return;
    const done = window.setTimeout(() => {
      intro.current = false;
      busy.current = false;
      setView((state) => ({ ...state, entering: false }));
    }, settle);
    return () => window.clearTimeout(done);
  }, [settle]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  const go = useCallback(
    (direction: Direction) => {
      if (busy.current || count < 2) return;
      busy.current = true;
      setView((state) => ({
        pos: state.pos + direction,
        previous: state.pos,
        direction,
        entering: true,
      }));
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setView((state) => ({ ...state, previous: null, entering: false }));
        busy.current = false;
      }, settle);
    },
    [count, settle],
  );

  // Arrow keys work page-wide while the hero fills most of the screen, but
  // never steal them from a field or from a modifier shortcut.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.intersectionRatio >= 0.5;
      },
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(root);

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (!inView.current || event.defaultPrevented) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
          target.closest("[role='dialog']"))
      )
        return;
      event.preventDefault();
      go(event.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [go]);

  // The arrow inside the cursor ring leans the way the mouse is moving and
  // settles back to the centre when it stops. Eased once a frame, and only
  // while there is something to animate.
  const stepDrift = useCallback(() => {
    const d = drift.current;
    // No movement for a moment: the mouse has stopped, so let go of the lean.
    if (performance.now() - d.lastMove > ARROW_IDLE_MS) {
      d.tx = 0;
      d.ty = 0;
    }
    d.x += (d.tx - d.x) * ARROW_EASE;
    d.y += (d.ty - d.y) * ARROW_EASE;
    const settled =
      d.tx === 0 && d.ty === 0 && Math.abs(d.x) < 0.1 && Math.abs(d.y) < 0.1;
    if (settled) {
      d.x = 0;
      d.y = 0;
    }
    if (arrowRef.current)
      arrowRef.current.style.transform = `translate3d(${d.x.toFixed(2)}px, ${d.y.toFixed(2)}px, 0)`;
    d.raf = settled ? 0 : requestAnimationFrame(stepDrift);
  }, []);

  useEffect(() => {
    const d = drift.current;
    return () => cancelAnimationFrame(d.raf);
  }, []);

  // Mouse only: the custom cursor and the parallax both follow it. Written
  // straight to the DOM once a frame, so moving the mouse never re-renders.
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Direction of travel since the last event. Normalised, so a diagonal
    // leans no further than a straight move; scaled by speed and capped, so
    // the arrow never leaves the ring.
    const d = drift.current;
    if (d.tracking && !reduced) {
      const dx = event.clientX - d.lastX;
      const dy = event.clientY - d.lastY;
      const speed = Math.hypot(dx, dy);
      if (speed > 0.5) {
        const lean = Math.min(speed / ARROW_FULL_SPEED, 1) * ARROW_MAX_PX;
        d.tx = (dx / speed) * lean;
        d.ty = (dy / speed) * lean;
        d.lastMove = performance.now();
        if (!d.raf) d.raf = requestAnimationFrame(stepDrift);
      }
    }
    d.lastX = event.clientX;
    d.lastY = event.clientY;
    d.tracking = true;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      root.dataset.cursor = "on";
      root.dataset.side = x < rect.width / 2 ? "prev" : "next";
      root.style.setProperty(
        "--cine-mx",
        ((x / rect.width - 0.5) * 2).toFixed(3),
      );
      root.style.setProperty(
        "--cine-my",
        ((y / rect.height - 0.5) * 2).toFixed(3),
      );
      if (cursorRef.current)
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  };

  const onPointerLeave = () => {
    const root = rootRef.current;
    if (!root) return;
    cancelAnimationFrame(frame.current);
    // Re-centre the arrow, and measure afresh next time the mouse comes in
    // rather than from wherever it left.
    const d = drift.current;
    d.tracking = false;
    d.tx = 0;
    d.ty = 0;
    if (!d.raf) d.raf = requestAnimationFrame(stepDrift);
    root.dataset.cursor = "off";
    root.style.setProperty("--cine-mx", "0");
    root.style.setProperty("--cine-my", "0");
  };

  // Touch and pen: a horizontal swipe steps, a vertical one scrolls the page
  // (touch-action: pan-y), and a tap falls through to the zone buttons.
  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") return;
    touchStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.2)
      return;
    lastSwipe.current = performance.now();
    go(dx < 0 ? 1 : -1);
  };

  const onZone = (direction: Direction) => {
    if (performance.now() - lastSwipe.current < SWIPE_CLICK_GUARD_MS) return;
    go(direction);
  };

  if (!count) return null;

  const index = wrap(view.pos, count);
  const current = slides[index];

  return (
    <section
      ref={rootRef}
      id={id}
      className={cn("cine", className)}
      style={
        {
          "--cine-d": `${duration}ms`,
          "--cine-bg": BACKGROUND,
        } as CSSProperties
      }
      data-dir={view.direction === 1 ? "next" : "prev"}
      data-motion={motion}
      data-busy={view.entering}
      // True only while a step runs (not the entrance on load): it switches
      // on the squeeze for the photo crossing the screen.
      data-stepping={view.previous !== null}
      aria-roledescription="carousel"
      aria-label={label}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (touchStart.current = null)}
    >
      {pageHeading && <h1 className="sr-only">{pageHeading}</h1>}

      {/* Backdrop: on each step an identical layer slides in over the old
          one, which drifts away beneath it. Keyed like the copy, so the
          current layer is the same node that then plays its exit. */}
      <div className="cine-bg" aria-hidden="true">
        {view.previous !== null && (
          <div
            key={`bg-${view.previous}`}
            className="cine-bg-layer"
            data-state="leave"
          />
        )}
        <div
          key={`bg-${view.pos}`}
          className="cine-bg-layer"
          data-state={view.previous !== null ? "enter" : "idle"}
        />
      </div>

      <div className="cine-strip">
        {SLOTS.map((slot) => {
          const k = view.pos + slot;
          const slide = slides[wrap(k, count)];
          const wide = isWide(k);
          const onScreen = slot === 0 || slot === 1;
          return (
            <div
              // Keyed by strip position, not slot: the node that was the
              // right photo stays the same node as it becomes the left one.
              key={k}
              className="cine-shot"
              data-slot={slot}
              data-wide={wide}
              aria-hidden={!onScreen || undefined}
            >
              <div className="cine-px" style={depth(wide ? -1 : 1)}>
                {/* The window is the full strip, clipped to this photo's
                    edges; the picture inside is pinned to the leading one. */}
                <div className="cine-window">
                  <div className="cine-pic">
                    <Image
                      src={slide.image}
                      alt={onScreen ? (slide.alt ?? "") : ""}
                      fill
                      sizes={wide ? WIDE_SIZES : NARROW_SIZES}
                      quality={90}
                      // Off-screen frames load now, not when they arrive.
                      loading={view.pos === 0 && onScreen ? undefined : "eager"}
                      preload={view.pos === 0 && onScreen}
                      className="cine-img"
                      style={
                        slide.focus
                          ? { objectPosition: slide.focus }
                          : undefined
                      }
                    />
                    <div
                      className="cine-shade"
                      style={
                        { "--shade": slide.overlay ?? 0.35 } as CSSProperties
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cine-copy">
        <div className="cine-px" style={depth(-2)}>
          {/* Same key the copy had while it was current, so it is the same
              node that now plays its exit. */}
          {view.previous !== null && (
            <Copy
              key={`copy-${view.previous}`}
              slide={slides[wrap(view.previous, count)]}
              state="leave"
            />
          )}
          <Copy
            key={`copy-${view.pos}`}
            slide={current}
            state={view.entering ? "enter" : "idle"}
          />
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="cine-zone cine-zone--prev"
            aria-label="Previous slide"
            onClick={() => onZone(-1)}
          />
          <button
            type="button"
            className="cine-zone cine-zone--next"
            aria-label="Next slide"
            onClick={() => onZone(1)}
          />
          {/* Outer element only follows the pointer; the ring inside does
              any scaling, so a size change can never move the position. */}
          <div ref={cursorRef} className="cine-cursor" aria-hidden="true">
            <div className="cine-cursor-ring">
              {/* Only this moves: it leans with the mouse inside the ring. */}
              <div ref={arrowRef} className="cine-cursor-arrow">
                <MoveLeft className="cine-cursor-prev" strokeWidth={1.5} />
                <MoveRight className="cine-cursor-next" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          <p className="cine-count" aria-hidden="true">
            {pad(index + 1)} <span>/</span> {pad(count)}
          </p>
        </>
      )}

      <p className="sr-only" aria-live="polite">
        {`Slide ${index + 1} of ${count}${current.heading ? `: ${current.heading}` : ""}`}
      </p>
    </section>
  );
}

function Copy({
  slide,
  state,
}: {
  slide: CinematicSlide;
  state: "enter" | "idle" | "leave";
}) {
  if (!slide.heading && !slide.subtitle && !slide.description) return null;
  return (
    <div
      className="cine-lines"
      data-state={state}
      aria-hidden={state === "leave" || undefined}
    >
      <span className="cine-line cine-rule" style={line(0)} />
      {slide.heading && (
        <h2 className="cine-line cine-heading" style={line(1)}>
          {slide.heading}
        </h2>
      )}
      {slide.subtitle && (
        <p className="cine-line cine-subtitle" style={line(2)}>
          {slide.subtitle}
        </p>
      )}
      {slide.description && (
        <p className="cine-line cine-desc" style={line(3)}>
          {slide.description}
        </p>
      )}
    </div>
  );
}

/** Parallax weight: the two photos drift against each other, copy further. */
const depth = (k: number) => ({ "--k": k }) as CSSProperties;

/** Stagger slot for a line of copy. */
const line = (i: number) => ({ "--i": i }) as CSSProperties;

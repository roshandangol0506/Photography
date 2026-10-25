"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scriptFont } from "@/lib/fonts";

// Adapted from the 21st.dev "3D parallax unfurling gallery":
// - The component was its own h-screen scroll box. On a page that traps the
//   wheel inside it, so it now follows the page's scroll instead.
// - Images come in as a prop rather than a hard-coded Unsplash list.
// - The isReady / onLoad bookkeeping is gone: it set state nothing read.
// - `preserve-3d` (not a Tailwind v4 class) is `transform-3d`, and the
//   pointer cursor is dropped since the cards do not link anywhere.
// - Visitors who prefer reduced motion get a flat, still grid.
// - No background of its own: the site's blackBg.jpg backdrop shows through.
// - The banner no longer widens (or rounds, or draws a border); it is full
//   screen from the start. Tailwind's base styles give every element a
//   currentColor border, so the old animated border width showed as grey.
// - The edge shadow runs the other way from the original: none at first,
//   deepening with the scroll up to VIGNETTE_MAX.
// - A "Stories unfolding" title, in the style of the Projects location
//   heading, comes in on the first stretch of scrolling.

type Range = [number, number];

// Title timing, on the section's 0-1 progress.
const SUBTITLE_IN: Range = [0, 0.1];
const TITLE_IN: Range = [0.04, 0.15];
// The edge shadow reaches its full strength by halfway through the section.
const VIGNETTE_IN: Range = [0, 0.5];
const VIGNETTE_MAX = 0.75;

/** 0 before `range`, 1 after it, linear between. */
const ramp = ([start, end]: Range) => (v: number) =>
  Math.min(Math.max((v - start) / (end - start), 0), 1);

export interface UnfurlingGalleryImage {
  /** Ready-to-load URL. Run large originals through getImageProps first. */
  src: string;
  alt?: string;
}

interface ParallaxUnfurlingGalleryProps {
  /** Dealt round-robin into four columns; 12-16 fills them well. */
  images: UnfurlingGalleryImage[];
  /**
   * Hold the last screen in place once the section has finished, so the
   * section after it slides up over it instead of the two scrolling past
   * each other. Give that next section a higher z-index and its own
   * background, and wrap both in one parent: the hold lasts until the
   * parent ends.
   */
  holdUnderNext?: boolean;
  /**
   * The site cursor's state over each card (data-pointer, see lib/cursor),
   * e.g. "click" for the "Click me" circle.
   */
  cardPointer?: string;
}

const ImageCard = ({
  src,
  alt,
  pointer,
}: UnfurlingGalleryImage & { pointer?: string }) => (
  <div
    data-pointer={pointer}
    className="relative h-[200px] w-full shrink-0 bg-[#111] transition-transform duration-300 will-change-transform backface-hidden transform-3d hover:scale-[1.02] sm:h-[300px] md:h-[400px]">
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover opacity-80 transition-opacity duration-300 hover:opacity-100"
    />
  </div>
);

const Column = ({
  images,
  column,
  y,
  pointer,
}: {
  images: UnfurlingGalleryImage[];
  column: number;
  y?: MotionValue<string>;
  pointer?: string;
}) => (
  <motion.div
    style={y ? { y } : undefined}
    className="pointer-events-auto flex w-[22vw] min-w-[200px] flex-col gap-4 md:gap-6"
  >
    {images.map((image, index) => (
      <ImageCard key={`col${column}-${index}`} {...image} pointer={pointer} />
    ))}
  </motion.div>
);

export function ParallaxUnfurlingGallery({
  images,
  holdUnderNext = false,
  cardPointer,
}: ParallaxUnfurlingGalleryProps) {
  const containerRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Four columns, each listed twice so the parallax never runs out of cards.
  const columns = [0, 1, 2, 3].map((c) => {
    const base = images.filter((_, i) => i % 4 === c);
    return [...base, ...base];
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  });

  // The edge shadow starts at nothing and deepens as the visitor scrolls,
  // stopping at VIGNETTE_MAX so the edges never go fully black.
  const vignette = useTransform(
    smoothProgress,
    (v) => VIGNETTE_MAX * ramp(VIGNETTE_IN)(v),
  );

  // The title arrives on the first stretch of scrolling: "Stories" rises 20px as it
  // fades in, then "unfolding" slides up out of its clip a beat behind.
  // Function transforms on purpose: given ranges, framer-motion can hand
  // opacity to the browser's scroll timeline, which has left it stuck at 0.
  const subtitleIn = ramp(SUBTITLE_IN);
  const titleIn = ramp(TITLE_IN);
  const subtitleOpacity = useTransform(smoothProgress, subtitleIn);
  const subtitleY = useTransform(smoothProgress, (v) => 20 * (1 - subtitleIn(v)));
  const titleOpacity = useTransform(smoothProgress, titleIn);
  const titleY = useTransform(smoothProgress, (v) => `${100 * (1 - titleIn(v))}%`);

  // 3D matrix animations
  const rotateY = useTransform(smoothProgress, [0.15, 1], [-45, -8]);
  const rotateX = useTransform(smoothProgress, [0.15, 1], [25, 4]);
  const rotateZ = useTransform(smoothProgress, [0.15, 1], [15, 2]);
  const translateZ = useTransform(smoothProgress, [0.15, 1], [-800, 0]);

  // Column parallax
  const columnY = [
    useTransform(smoothProgress, [0.15, 1], ["0%", "-40%"]),
    useTransform(smoothProgress, [0.15, 1], ["-40%", "10%"]),
    useTransform(smoothProgress, [0.15, 1], ["0%", "-40%"]),
    useTransform(smoothProgress, [0.15, 1], ["-30%", "20%"]),
  ];

  return (
    <section
      ref={containerRef}
      className={`${holdUnderNext ? "sticky" : "relative"} w-full ${reduced ? "h-screen" : "h-[600vh]"}`}
      // Sticky with its bottom edge at the bottom of the screen: the section
      // scrolls normally until its last screen is showing, then stays put.
      style={holdUnderNext ? { top: reduced ? 0 : "-500vh" } : undefined}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="relative mx-auto flex h-full w-full max-w-[1920px] items-center justify-center overflow-hidden backface-hidden transform-3d">
          {/* Behind the photo grid, so the cards pass over it as they
              unfurl. Inset past the edge shadows so they do not dim it. */}
          <h2 className="pointer-events-none absolute top-1/2 left-[max(9vw,10rem)] flex -translate-y-1/2 flex-col items-start text-[#f5f5f5] max-sm:left-6">
            <motion.span
              style={
                reduced
                  ? { opacity: subtitleOpacity }
                  : { opacity: subtitleOpacity, y: subtitleY }
              }
              // The script's tail tucks down over the capitals.
              className={`${scriptFont.className} relative z-10 mb-[-0.32em] block text-[clamp(3.25rem,6.4vw,8rem)] leading-[1.2]`}
            >
              Stories
            </motion.span>
            {/* pb gives the capitals' feet room inside the clip. */}
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span
                style={
                  reduced
                    ? { opacity: titleOpacity }
                    : { opacity: titleOpacity, y: titleY }
                }
                className="block text-[clamp(2.75rem,5.6vw,7rem)] leading-none font-normal tracking-[0.02em] uppercase"
              >
                unfolding
              </motion.span>
            </span>
          </h2>

          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ perspective: "1000px" }}
          >
            {/* Edge shadow: none at first, deepening with the scroll. */}
            <motion.div
              aria-hidden="true"
              style={{ opacity: reduced ? VIGNETTE_MAX : vignette }}
              className="absolute inset-0 z-20"
            >
              <div className="absolute inset-0 shadow-[inset_0_100px_150px_-50px_rgba(0,0,0,1),inset_0_-100px_150px_-50px_rgba(0,0,0,1)]" />
              <div className="absolute inset-0 shadow-[inset_150px_0_150px_-50px_rgba(0,0,0,1),inset_-150px_0_150px_-50px_rgba(0,0,0,1)]" />
            </motion.div>

            {/* Parallax image grid */}
            <motion.div
              style={
                reduced
                  ? undefined
                  : {
                      rotateX,
                      rotateY,
                      rotateZ,
                      z: translateZ,
                      transformStyle: "preserve-3d",
                    }
              }
              className="flex h-[150vh] w-[120vw] origin-center items-center justify-center gap-4 will-change-transform backface-hidden md:gap-6"
            >
              {columns.map((column, c) => (
                <Column
                  key={c}
                  column={c}
                  images={column}
                  y={reduced ? undefined : columnY[c]}
                  pointer={cardPointer}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

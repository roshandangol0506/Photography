"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scriptFont } from "@/lib/fonts";
import { OVERLAP_VH, READ_VH } from "./zoomParallaxTiming";

const TITLE = "Step into the frame";
const PARAGRAPH =
  "Every photograph holds a moment worth a closer look. Keep scrolling, and let the festivals, faces and mountain light of Nepal draw you in.";

type Range = [number, number];

// The intro's text stays pinned while the visitor scrolls READ_VH, then for
// another OVERLAP_VH while the photographs slide up over it.
const PINNED_VH = READ_VH + OVERLAP_VH;

/** A stretch of the pinned scroll, given in vh, as 0-1 progress. */
const vh = (start: number, end: number): Range => [
  start / PINNED_VH,
  end / PINNED_VH,
];

// Nothing shows at 0, so the text only arrives once the visitor starts to
// scroll, and it builds slowly over most of the reading stretch. The title is
// uncovered left to right...
const TITLE_IN = vh(6, 58);
// ...and the paragraph follows, its letters rising one after another out of
// a clipping edge, left to right, brightening from grey as they settle. It
// has settled well before the photographs arrive at READ_VH.
const PARAGRAPH_IN = vh(22, 106);
// How long each letter takes. Long and overlapping, so the rise reads as a
// wave rather than letters popping in.
const LETTER_SPAN = 19 / PINNED_VH;

/** 0 before `range`, 1 after it, linear between. */
const ramp = ([start, end]: Range) => (v: number) =>
  Math.min(Math.max((v - start) / (end - start), 0), 1);

/** Gentle start and finish, so each letter settles rather than stops. */
const ease = (t: number) => 1 - (1 - t) ** 3;

// All scroll-driven values are function transforms on purpose: given ranges,
// framer-motion can hand opacity to the browser's scroll timeline, which has
// left it stuck at 0 elsewhere on the site.

/** The title and paragraph that lead into the zoom parallax. */
export function ZoomParallaxIntro() {
  const wrapper = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: progress } = useScroll({
    target: wrapper,
    offset: ["start start", "end end"],
  });

  return (
    // A sticky screen pinned for PINNED_VH of scrolling.
    <div ref={wrapper} className="relative" style={{ height: `${100 + PINNED_VH}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6 text-center text-[#f5f5f5]">
        {/* Radial spotlight */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -top-1/2 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 rounded-full",
            "bg-[radial-gradient(ellipse_at_center,--theme(--color-foreground/.1),transparent_50%)]",
            "blur-[30px]",
          )}
        />
        <Title progress={progress} reduced={reduced} />
        <Paragraph progress={progress} reduced={reduced} />
      </div>
    </div>
  );
}

/** Uncovered left to right by a moving clip edge. */
function Title({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const reveal = ramp(TITLE_IN);
  // The clip reaches past the box on every side, so the script's swashes are
  // never trimmed once it is fully open.
  const clipPath = useTransform(
    progress,
    (v) => `inset(-40% ${100 - 115 * ease(reveal(v))}% -40% -15%)`,
  );
  const opacity = useTransform(progress, (v) => Math.min(reveal(v) * 4, 1));

  return (
    <motion.h2
      style={reduced ? { opacity } : { clipPath }}
      className={`${scriptFont.className} relative text-[clamp(3.25rem,6.4vw,8rem)] leading-[1.2]`}
    >
      {TITLE}
    </motion.h2>
  );
}

/**
 * Each letter rises out of its word's clipping box, a little after the one
 * before it, and brightens from grey to white as it settles.
 */
function Paragraph({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const words = PARAGRAPH.split(" ");
  const letters = PARAGRAPH.replace(/ /g, "").length;
  const [start, end] = PARAGRAPH_IN;
  // Spread the letters' start points so the last one finishes at `end`.
  const step = (end - start - LETTER_SPAN) / (letters - 1);
  let index = 0;

  return (
    <p
      aria-label={PARAGRAPH}
      className={`${scriptFont.className} relative mx-auto mt-4 max-w-176 text-[clamp(1.6rem,2.4vw,2.6rem)] leading-[1.35]`}
    >
      {words.map((word, w) => (
        // One clipping box per word, so words wrap whole and every letter
        // rises from the line it sits on. pb/-mb give descenders room.
        <span
          key={w}
          aria-hidden="true"
          className="mb-[-0.25em] inline-block overflow-hidden pb-[0.25em] align-bottom"
        >
          {Array.from(word).map((char) => {
            const from = start + step * index++;
            return (
              <Letter
                key={from}
                char={char}
                range={[from, from + LETTER_SPAN]}
                progress={progress}
                reduced={reduced}
              />
            );
          })}
          {w < words.length - 1 && " "}
        </span>
      ))}
    </p>
  );
}

function Letter({
  char,
  range,
  progress,
  reduced,
}: {
  char: string;
  range: Range;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const reveal = ramp(range);
  const y = useTransform(progress, (v) => `${110 * (1 - ease(reveal(v)))}%`);
  // Grey while it rises, white once it has settled; nothing before it starts.
  const opacity = useTransform(progress, (v) => {
    const t = reveal(v);
    return t === 0 ? 0 : 0.45 + 0.4 * ease(t);
  });

  return (
    <motion.span
      style={reduced ? { opacity } : { opacity, y }}
      className="inline-block"
    >
      {char}
    </motion.span>
  );
}

"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  interpolate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { OrbitGallery } from "@/components/ui/cosmos-3d-orbit-gallery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scriptFont as script } from "@/lib/fonts";

// The demo's original quote, laid out in the reference's four slots.
const COPY = {
  lead: "The cosmos is within us. We are made of star-stuff.",
  title: "Cosmos",
  subtitle: "Carl Sagan",
  close: "We are a way for the universe to know itself.",
};

type Range = [number, number];

// The section's scrolling layer, in svh. Its height is the section's height:
// the lead paragraph, a long gap while the title has the stage, then the
// closing paragraph. The closing block is short, so when the pin lets go the
// paragraph is still in the lower third, level with where the Cosmos title
// sat, under the ring rather than across it.
const LEAD_BLOCK = 80;
const GAP = 215;
const CLOSE_BLOCK = 35;
const SECTION = LEAD_BLOCK + GAP + CLOSE_BLOCK;

// One timeline for everything, placed in svh of scrolling. 0 is the
// section's top edge entering at the bottom of the screen; at 100 it reaches
// the top and the frame pins; at SECTION the section's bottom edge reaches
// the bottom of the screen and the pin lets go.
const at = (svh: number) => svh / SECTION;
// The ring straightens out from its arrival pose as the pin takes hold.
const SETTLE: Range = [at(82), at(155)];
// Title: rises 20svh into place once the lead paragraph has mostly gone...
const TITLE_IN: Range = [at(132), at(155)];
// ...holds, then drifts up 9svh and dims, and is gone just as the closing
// paragraph comes up from the bottom (at LEAD_BLOCK + GAP = 295svh).
const TITLE_LIFT: Range = [at(238), at(277)];
const TITLE_GONE = at(290);
const titleFade = interpolate(
  [TITLE_IN[0], TITLE_IN[1], TITLE_LIFT[0], TITLE_LIFT[1], TITLE_GONE],
  [0, 1, 1, 0.5, 0],
);
// How fast the ring turns, in radians per svh of scrolling. It turns for as
// long as any of the section is on screen, including the final screen as the
// section scrolls away, so it never stops dead when the pin lets go.
const TURN_PER_SVH = (Math.PI * 0.85) / 330;
const TURN = TURN_PER_SVH * (SECTION + 100);
// The ring also rocks in the screen plane as it turns: right side down and
// left up, back through level to left down and right up, and so on. One
// continuous angle on the same timeline as the turn, so it runs both ways
// with the scroll. Starting at +TILT keeps it continuous with the arrival
// pose (rolled right side up), so the first swing is right side down.
// TILT_CYCLES full rocks over the timeline: four half-swings, the last
// finishing as the section leaves the top of the screen.
const TILT = (12 * Math.PI) / 180;
const TILT_CYCLES = 1;

/**
 * "Cosmos": a pinned, scroll-driven ring of photographs, with a lead
 * paragraph, a script title and a closing paragraph carried over it. The
 * ring turns and rocks with the scroll and keeps orbiting as the section
 * scrolls away.
 */
export function OrbitShowcase({ images }: { images: string[] }) {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress: progress } = useScroll({
    target: section,
    offset: ["start end", "end end"],
  });

  // The ring's own timeline runs on until the section's bottom edge has left
  // the top of the screen, so it keeps orbiting while the section scrolls off.
  const { scrollYProgress: orbit } = useScroll({
    target: section,
    offset: ["start end", "end start"],
  });
  const turn = useTransform(orbit, (v) => v * TURN);
  const roll = useTransform(
    orbit,
    (v) => TILT * Math.cos(v * Math.PI * 2 * TILT_CYCLES),
  );
  const settle = useTransform(progress, SETTLE, [0, 1]);
  // Reduced motion: the ring holds one settled pose.
  const stillTurn = useMotionValue(TURN * 0.5);
  const settled = useMotionValue(1);

  // A function transform on purpose: given ranges, framer-motion hands
  // opacity to the browser's scroll timeline, which left this one stuck at 0.
  const titleOpacity = useTransform(progress, titleFade);
  const titleY = useTransform(
    progress,
    [TITLE_IN[0], TITLE_IN[1], TITLE_LIFT[0], TITLE_LIFT[1]],
    ["20svh", "0svh", "0svh", "-9svh"],
  );

  return (
    <section ref={section} className="relative text-[#989898]">
      {/* Pinned layers: the ring and the title. */}
      {/* The frame carries the site's blackBg.jpg itself (the layout sets
          --site-bg), so the section is opaque where it shows: when it slides
          up over the section before it, it covers it rather than showing it
          through. Once pinned it lines up exactly with the site backdrop. */}
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-(image:--site-bg) bg-cover bg-center">
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ fov: 50, near: 0.1, far: 100 }}
          // Nothing in the scene is interactive, so the canvas lets every
          // pointer and touch through to the page: no drag, no wheel zoom.
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <Suspense fallback={null}>
            <OrbitGallery
              images={images}
              turn={reduced ? stillTurn : turn}
              settle={reduced ? settled : settle}
              roll={reduced ? undefined : roll}
            />
          </Suspense>
        </Canvas>

        <motion.div
          style={
            reduced
              ? { opacity: titleOpacity }
              : { opacity: titleOpacity, y: titleY }
          }
          className="pointer-events-none absolute inset-x-0 bottom-[6svh] flex flex-col items-center px-6 text-center"
        >
          <h2
            className={`${script.className} text-[clamp(3.75rem,8vw,10rem)] leading-[1.15] text-white`}
          >
            {COPY.title}
          </h2>
          <Words
            text={COPY.subtitle}
            // Follows the title in, a beat behind.
            range={[TITLE_IN[1] - 0.02, TITLE_IN[1] + 0.03]}
            progress={progress}
            className="mt-1 max-w-[18rem] font-(family-name:--font-archivo) text-[12px] leading-normal font-medium tracking-[0.12em] text-[#969696] uppercase"
          />
        </motion.div>
      </div>

      {/* Scrolling layer: rides over the pinned frame like normal content. */}
      <div className="relative mt-[-100svh]">
        <div
          style={{ height: `${LEAD_BLOCK}svh` }}
          className="px-6 pt-[22svh] md:pl-[16.667%]"
        >
          <Paragraph text={COPY.lead} reduced={reduced} />
        </div>
        <div style={{ height: `${GAP}svh` }} />
        <div
          style={{ height: `${CLOSE_BLOCK}svh` }}
          className="flex justify-end px-6 md:justify-start md:pl-[66.667%]"
        >
          <Paragraph text={COPY.close} reduced={reduced} />
        </div>
      </div>
    </section>
  );
}

/**
 * A large uppercase paragraph, uncovered character by character as it scrolls
 * up the screen. Each character fades over a long, overlapping stretch, so the
 * reveal reads as a soft edge sweeping through the text rather than typing.
 */
function Paragraph({ text, reduced }: { text: string; reduced: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    // Over the first quarter-screen after its top edge comes into view, so
    // it is whole by the time it is properly on screen.
    offset: ["start 1", "start 0.75"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  const words = text.split(" ");
  const total = text.replace(/ /g, "").length;
  let index = 0;

  return (
    <motion.p
      ref={ref}
      style={reduced ? undefined : { y }}
      aria-label={text}
      className="w-full text-[clamp(1.5rem,2.2vw,2.75rem)] leading-[1.07] tracking-[0.01em] uppercase md:w-[26vw] md:min-w-[18rem]"
    >
      {words.map((word, w) => (
        // Words stay whole when the line wraps.
        <span
          key={w}
          aria-hidden="true"
          className="inline-block whitespace-nowrap"
        >
          {Array.from(word).map((char) => {
            const start = (index++ / total) * 0.7;
            return reduced ? (
              char
            ) : (
              <Char
                key={start}
                char={char}
                range={[start, start + 0.3]}
                progress={scrollYProgress}
              />
            );
          })}
          {w < words.length - 1 && " "}
        </span>
      ))}
    </motion.p>
  );
}

function Char({
  char,
  range,
  progress,
}: {
  char: string;
  range: Range;
  progress: MotionValue<number>;
}) {
  const opacity = useFadeIn(progress, range);
  return <motion.span style={{ opacity }}>{char}</motion.span>;
}

/**
 * 0 before `range`, 1 after it, linear between. A function transform, like
 * the title's fade, so the browser's scroll timeline never takes it over.
 */
function useFadeIn(progress: MotionValue<number>, [start, end]: Range) {
  return useTransform(progress, (v) =>
    Math.min(Math.max((v - start) / (end - start), 0), 1),
  );
}

/** A short line whose words fade in one after another over `range`. */
function Words({
  text,
  range,
  progress,
  className,
}: {
  text: string;
  range: Range;
  progress: MotionValue<number>;
  className: string;
}) {
  const words = text.split(" ");
  const span = range[1] - range[0];
  const step = span / (words.length + 1);

  return (
    <p className={className} aria-label={text}>
      {words.map((word, i) => (
        <Word
          key={i}
          word={word}
          range={[range[0] + i * step, range[0] + i * step + step * 2]}
          progress={progress}
          last={i === words.length - 1}
        />
      ))}
    </p>
  );
}

function Word({
  word,
  range,
  progress,
  last,
}: {
  word: string;
  range: Range;
  progress: MotionValue<number>;
  last: boolean;
}) {
  const opacity = useFadeIn(progress, range);
  return (
    <motion.span aria-hidden="true" style={{ opacity }}>
      {word}
      {!last && " "}
    </motion.span>
  );
}

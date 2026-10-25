"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scriptFont } from "@/lib/fonts";
import { EnquiryForm } from "@/components/public/EnquiryForm";
import { Building2 } from "lucide-react";

/**
 * The five pins, in percent of the map image itself (not of the screen):
 * x from the image's left edge, y from its top edge. Because they are pinned
 * to the image they stay on the same spot at every screen size, however the
 * image is cropped. Placeholders: spread across the middle of the map, which
 * is the part every screen shape shows, and above the lower part of the
 * screen where the panel sits on phones.
 */
export const LOCATION_PINS = [
  { name: "Jawalakhel", x: 46.1, y: 44.8 },
  { name: "Lagankhel", x: 50.8, y: 57.0 },
  { name: "Tribhuvan University", x: 28.2, y: 30.4 },
  { name: "Baneshwor", x: 59.4, y: 19.5 },
  { name: "Ekantakuna", x: 42, y: 56 },
  { name: "Ajay Maharjan Studio", x: 49.5, y: 80.5, office: true },
];

// The enquiry panel that rises in after the pins: two small labels across
// its top, a heading in the section's script-over-capitals style, a line of
// introduction, then the contact form.
const PANEL = {
  label: "Contact",
  tag: "Enquiries",
  script: "Get in",
  title: "touch",
  intro:
    "Planning a shoot, a print or a journey through Nepal? Tell us about it.",
};

// The map in /public. Its pixel size sets the aspect ratio the map is laid
// out at, so update it if the file is replaced.
const MAP = { src: "/map.jpeg", width: 1553, height: 672 };
const MAP_RATIO = MAP.width / MAP.height;

// Which part of the map stays in frame when the screen crops it, as with CSS
// object-position: 0 is the left/top edge, 1 the right/bottom edge. Narrow
// screens crop the sides hard, so this keeps the ring road in view.
const MAP_FOCUS = { x: 0.5, y: 0.55 };

// ---------------------------------------------------------------------------
// The scroll timeline, in svh of scrolling. 0 is the section's top edge
// entering at the bottom of the screen; at 100 it reaches the top and the
// frame pins; at SECTION the pin lets go. Every stage is placed on this one
// scale, so they always run in this order and scroll back in reverse.
// ---------------------------------------------------------------------------
const SECTION = 560;

// Stage 1: the heading rises in as the section arrives ("location" a beat
// behind "Projects"). The map is held dim and slightly enlarged.
const SUBTITLE_IN = svh(60, 88);
const TITLE_IN = svh(68, 100);
// Stage 2: the heading holds. 130svh of scrolling with nothing changing but
// the page, so it takes several deliberate scrolls to move on.
// Stage 3: the camera pulls back. The map zooms out and brightens while the
// heading fades where it stands.
const ZOOM_OUT = svh(230, 330);
const TITLE_OUT = svh(240, 310);
// Stage 4: once the zoom-out has finished, the pins come in one by one.
const PINS_AT = 335 / SECTION;
// Stage 5: the panel rises from below the screen, then holds while its
// progress line fills until the pin lets go.
const PANEL_IN = svh(360, 450);
const PANEL_HOLD = svh(450, SECTION);

// The map behind the heading: dimmed (as on the reference, a black layer over
// it) and enlarged, so the zoom-out reads as the camera pulling back.
const MAP_DIM_START = 0.55;
const MAP_DIM_END = 0.2;
const MAP_ZOOM_START = 1.15;

type Range = [number, number];

/** A range on the timeline, given in svh of scrolling. */
function svh(start: number, end: number): Range {
  return [start / SECTION, end / SECTION];
}

/** 0 before `range`, 1 after it, linear between. */
const ramp =
  ([start, end]: Range) =>
  (v: number) =>
    Math.min(Math.max((v - start) / (end - start), 0), 1);

/** Gentle in and out, for the stages that should feel like camera moves. */
const ease = (t: number) => t * t * (3 - 2 * t);

// The scroll-driven values below are all function transforms on purpose:
// given ranges, framer-motion can hand opacity to the browser's scroll
// timeline, which has left it stuck at 0 elsewhere on this page.

/**
 * "Projects location": a full-screen dark map pinned for several screens of
 * scrolling. The heading appears and holds, the map pulls back and brightens,
 * five pins come in, and an information panel rises up on the right.
 */
export function ProjectsLocation() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: progress } = useScroll({
    target: section,
    offset: ["start end", "end end"],
  });

  return (
    <section
      ref={section}
      aria-labelledby="projects-location-title"
      className="relative bg-black"
      style={{ height: `${SECTION}svh` }}
    >
      {/* `container-type: size` lets the map size itself to this frame. */}
      <div className="sticky top-0 h-svh w-full overflow-hidden @container-size">
        <MapSurface progress={progress} reduced={reduced} />
        <Title progress={progress} reduced={reduced} />
        <Panel progress={progress} reduced={reduced} />
      </div>
    </section>
  );
}

function MapSurface({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const zoomOut = ramp(ZOOM_OUT);
  const dim = useTransform(
    progress,
    (v) => MAP_DIM_START + (MAP_DIM_END - MAP_DIM_START) * ease(zoomOut(v)),
  );
  const scale = useTransform(
    progress,
    (v) => MAP_ZOOM_START + (1 - MAP_ZOOM_START) * ease(zoomOut(v)),
  );

  // The pins come in on a switch rather than with the scroll, so each one
  // plays its full entrance (as on the reference) and they all arrive as a
  // set. Scrolling back above the point sends them out again.
  const [pinsShown, setPinsShown] = useState(false);
  useEffect(() => setPinsShown(progress.get() >= PINS_AT), [progress]);
  useMotionValueEvent(progress, "change", (v) => setPinsShown(v >= PINS_AT));

  // The map is laid out like an <img> with object-fit: cover, but as a real
  // box with the image's aspect ratio, so the pins can be placed in percent
  // of the image and stay on their spots however the screen crops it.
  const width = `max(100cqw, calc(100cqh * ${MAP_RATIO}))`;
  const height = `calc(${width} / ${MAP_RATIO})`;
  const surface: CSSProperties = {
    width,
    height,
    left: `calc((100cqw - ${width}) * ${MAP_FOCUS.x})`,
    top: `calc((100cqh - ${height}) * ${MAP_FOCUS.y})`,
  };

  return (
    <motion.div
      style={reduced ? undefined : { scale }}
      className="absolute inset-0 origin-[50%_55%]"
    >
      <div className="absolute" style={surface}>
        <Image
          src={MAP.src}
          alt=""
          fill
          // The file is only 1553px wide, so the optimizer serves it at full
          // size; high quality keeps the fine roads crisp.
          sizes={`(max-aspect-ratio: ${MAP.width}/${MAP.height}) ${Math.ceil(MAP_RATIO * 100)}vh, 100vw`}
          quality={90}
          draggable={false}
          className="pointer-events-none select-none"
        />
        {/* The dim sits over the map but under the pins, so they stay
            crisp while the streets are held back. */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: dim }}
          className="pointer-events-none absolute inset-0 bg-black"
        />
        <ul aria-label="Locations">
          {LOCATION_PINS.map((pin, i) => (
            <Pin
              key={pin.name}
              {...pin}
              index={i}
              shown={pinsShown}
              reduced={reduced}
            />
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/**
 * The reference's pin: a hairline ring over a darkened disc with a point at
 * its centre, here with the place name beside it. The studio's pin (`office`)
 * is a filled disc with a building icon and a brighter label instead. It enters by growing from
 * a third of its size as it fades in, the label rising a few pixels.
 */
function Pin({
  name,
  x,
  y,
  office = false,
  index,
  shown,
  reduced,
}: {
  name: string;
  x: number;
  y: number;
  office?: boolean;
  index: number;
  shown: boolean;
  reduced: boolean;
}) {
  // Staggered on the way in, all together on the way out.
  const delay = shown ? `${index * 120}ms` : "0ms";
  const transition: CSSProperties = {
    transitionDuration: "1s",
    transitionTimingFunction: "cubic-bezier(.7,0,.3,1)",
    transitionDelay: delay,
  };

  return (
    <li className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <span
        aria-hidden="true"
        style={{
          ...transition,
          opacity: shown ? 1 : 0,
          scale: shown || reduced ? 1 : 0.3,
        }}
        className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[0.7px] border-[#f5f5f5] transition-[opacity,scale] ${
          office
            ? "size-[clamp(1.9rem,2.2vw,2.5rem)] bg-[#f5f5f5] text-[#191919] shadow-[0_0_0_6px_rgba(245,245,245,0.12)]"
            : "size-[clamp(1.25rem,1.5vw,1.75rem)] bg-black/50"
        }`}
      >
        {office ? (
          <Building2 strokeWidth={1.5} className="size-[55%]" />
        ) : (
          <span className="size-0.75 rounded-full bg-[#f5f5f5]" />
        )}
      </span>
      <span
        style={{
          ...transition,
          opacity: shown ? 1 : 0,
          translate: shown || reduced ? "0 -50%" : "0 calc(-50% + 8px)",
        }}
        className={`absolute font-(family-name:--font-archivo) text-[13px] leading-none tracking-[0.02em] whitespace-nowrap transition-[opacity,translate] ${
          office
            ? "left-[clamp(1.4rem,1.6vw,1.9rem)] font-medium text-[#f5f5f5]"
            : "left-[clamp(1rem,1.2vw,1.4rem)] text-[#a8a8a8]"
        }`}
      >
        {name}
      </span>
    </li>
  );
}

function Title({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const subtitleIn = ramp(SUBTITLE_IN);
  const titleIn = ramp(TITLE_IN);
  const titleOut = ramp(TITLE_OUT);

  const opacity = useTransform(progress, (v) => 1 - titleOut(v));
  const subtitleOpacity = useTransform(progress, subtitleIn);
  const subtitleY = useTransform(progress, (v) => 20 * (1 - subtitleIn(v)));
  const titleOpacity = useTransform(progress, titleIn);
  // Rises out of its clipping box rather than fading on the spot.
  const titleY = useTransform(progress, (v) => `${100 * (1 - titleIn(v))}%`);

  return (
    <motion.h2
      id="projects-location-title"
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 top-[45%] flex -translate-y-1/2 flex-col items-center px-6 text-center text-[#f5f5f5]"
    >
      <motion.span
        style={
          reduced
            ? { opacity: subtitleOpacity }
            : { opacity: subtitleOpacity, y: subtitleY }
        }
        // The script's long tail tucks down over the capitals, as on the
        // reference.
        className={`${scriptFont.className} relative z-10 mb-[-0.32em] block text-[clamp(3.25rem,6.4vw,8rem)] leading-[1.2]`}
      >
        Projects
      </motion.span>
      {/* pb gives the capitals' feet room inside the clip. */}
      <span className="block overflow-hidden pb-[0.06em]">
        <motion.span
          style={
            reduced
              ? { opacity: titleOpacity }
              : { opacity: titleOpacity, y: titleY }
          }
          className="block font-(family-name:--font-gilda) text-[clamp(2.75rem,5.6vw,7rem)] leading-none font-normal tracking-[0.02em] uppercase"
        >
          location
        </motion.span>
      </span>
    </motion.h2>
  );
}

/**
 * The reference's location card, holding the enquiry form: a flat dark panel
 * down the right-hand side (a sheet along the bottom on phones), starting
 * below the site's fixed navbar rather than at the top edge, with two small
 * labels across the top, a heading in the middle, the form at the foot and a
 * hairline progress line.
 * It rises in from below the screen after the pins.
 */
function Panel({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const rise = ramp(PANEL_IN);
  const hold = ramp(PANEL_HOLD);
  // Fully below the screen at the start: 100% of its own height plus the gap
  // under it.
  const y = useTransform(
    progress,
    (v) =>
      `calc(${(1 - ease(rise(v))) * 100}% + ${(1 - ease(rise(v))) * 6}svh)`,
  );
  const opacity = useTransform(progress, (v) => Math.min(rise(v) * 2, 1));
  const line = useTransform(progress, hold);

  return (
    <motion.aside
      aria-label="Send an enquiry"
      style={reduced ? { opacity } : { opacity, y }}
      className="absolute inset-x-4 bottom-4 flex flex-col justify-between bg-[#191919] p-5 pb-10 text-[#f5f5f5] md:inset-x-auto md:top-26 md:right-[1.6vw] md:bottom-[4svh] md:w-[29vw] md:min-w-[18rem] md:pb-[clamp(3.5rem,8svh,5rem)]"
    >
      <div className="flex justify-between font-(family-name:--font-archivo) text-[11px] leading-none font-medium tracking-[0.12em] text-[#767676] uppercase md:text-[12px]">
        <p>{PANEL.label}</p>
        <p>{PANEL.tag}</p>
      </div>

      {/* The section's own heading style, script over capitals, scaled to
          the panel. Left out on phones, where the sheet has to stay below
          the pins. */}
      <div className="my-8 hidden flex-col items-center text-center md:flex">
        <h3 className="flex flex-col items-center">
          <span
            className={`${scriptFont.className} relative z-10 mb-[-0.3em] block text-[clamp(2.4rem,3.4vw,4rem)] leading-[1.2]`}
          >
            {PANEL.script}
          </span>
          <span className="block text-[clamp(1.9rem,2.7vw,3.2rem)] leading-none font-normal tracking-[0.06em] uppercase">
            {PANEL.title}
          </span>
        </h3>
        <p className="mt-4 max-w-76 font-(family-name:--font-archivo) text-[13px] leading-normal text-[#a8a8a8]">
          {PANEL.intro}
        </p>
      </div>

      {/* Tighter spacing on phones, so the sheet stays below the pins. */}
      <EnquiryForm className="mt-5 max-md:gap-3.5 md:mt-0 md:px-[clamp(0rem,1.6vw,2rem)]" />

      {/* Fills as the reader scrolls through the panel's stage. */}
      <div className="absolute inset-x-5 bottom-5 h-px bg-white/20">
        <motion.div
          style={{ scaleX: line }}
          className="h-px origin-left bg-[#f5f5f5]"
        />
      </div>
    </motion.aside>
  );
}

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── the corridor ────────────────────────────────────────────────
 * Two rails of cards stream out of the centre toward the screen's
 * edges, as on the reference (melius.com). Measured from it at
 * 1902px, in `cqw`:
 *
 * - A flat band through the middle: cards ~5.6 tall, sliding sideways
 *   over a black ribbon that runs ±12 either side of the centre.
 * - Past the band each card is ~1.55x the height of the one inside
 *   it, yet barely wider (~8-10), so the outer cards turn into tall
 *   slices. Neighbours meet edge to edge.
 * - Each card is a mild trapezoid: its outer edge ~5-12% taller.
 *
 * So the path is authored in screen space - centre x, height, width
 * and slant along the way (PROFILE) - and each sampled point is
 * solved back into a pose in a real perspective: depth for the
 * height, a turn about Y for the slant, a horizontal crop for the
 * width. The crop is a scaleX on the card with the inverse on its
 * photo (folding in the turn's foreshortening too), so the window
 * narrows while the photo keeps its proportions. Everything is a
 * transform, so it all runs on the compositor.
 *
 * Cards touch, so a card's speed is its own width per `speed / cards`
 * seconds: slow through the band, faster as it grows - slide first,
 * then grow, as the reference moves. A card is born at the centre
 * seam at a fraction of its size, tucked behind the card ahead of
 * it, and swells to full size over its first beat while it slides
 * off the seam, so it emerges from the middle growing and the middle
 * is never left uncovered; it dies with its inner edge past the
 * frame. Neighbours overlap a hair rather than leave a seam of
 * backdrop. Every length is `cqw`, a percentage of the container's
 * width, so the composition keeps its proportions at any size.
 * ─────────────────────────────────────────────────────────────── */

/** World geometry of the corridor. Lengths are `cqw`. */
export type CorridorPath = {
  /** Strength of the projection. Lower turns the cards harder. @default 60 */
  perspective?: number;
  /** Width of a card's full frame, before the crop narrows it. @default 23 */
  cardWidth?: number;
  /** Card height in world units. @default 25 */
  cardHeight?: number;
  /** Corner radius applied to each card. @default 0.3 */
  cardRadius?: number;
  /**
   * On-screen gap between neighbouring cards; negative overlaps them, so no
   * sliver of backdrop ever shows between two. @default -0.1
   */
  gap?: number;
  /** Keyframe stops used to trace the path. Raise only if motion looks faceted. @default 48 */
  stops?: number;
};

const PATH: Required<CorridorPath> = {
  perspective: 60,
  cardWidth: 23,
  cardHeight: 25,
  cardRadius: 0.3,
  gap: -0.1,
  stops: 48,
};

/**
 * The reference's corridor in screen space, right rail: a card's centre x,
 * then its height, width and slant (inner edge height / outer edge height)
 * there. Measured at 1902 x 1033; past the last row it keeps growing.
 */
const PROFILE: readonly (readonly [number, number, number, number])[] = [
  [0, 5.5, 5.1, 1],
  [6, 5.6, 5.2, 1],
  [10.5, 6.0, 5.6, 0.99],
  [15.7, 8.6, 7.6, 0.975],
  [24, 13.7, 8.9, 0.95],
  [33.3, 21.8, 9.8, 0.925],
  [43.1, 32.9, 9.8, 0.88],
  [53, 47, 9.8, 0.85],
  [63, 63, 9.8, 0.82],
];

/** Turns past this read as a sliver; the slant gives way first. */
const MAX_TURN = (70 * Math.PI) / 180;
/** Narrowest crop: the photo's counter-scale grows as 1 / crop. */
const MIN_CROP = 0.06;

/** Height, width and slant at screen x; height interpolates geometrically. */
function profileAt(x: number) {
  const t = PROFILE;
  let i = 1;
  while (i < t.length - 1 && x > t[i][0]) i++;
  const [x0, h0, w0, r0] = t[i - 1];
  const [x1, h1, w1, r1] = t[i];
  const f = (Math.max(x, 0) - x0) / (x1 - x0);
  return {
    h: h0 * Math.pow(h1 / h0, f),
    w: w0 + (w1 - w0) * Math.min(f, 1),
    r: r0 + (r1 - r0) * Math.min(f, 1),
  };
}

type Pose = {
  /** Lateral offset and depth of the card's centre. */
  rail: number;
  z: number;
  /** Turn about Y, radians; the outer edge comes toward the viewer. */
  turn: number;
  /** Share of the card's width left showing. */
  crop: number;
};

/**
 * The pose that draws a card centred at screen x with this height, width and
 * slant. Depth comes straight from the height; then, for a trial turn, the
 * crop is bisected until the projected edges are `w` apart, and the turn is
 * bisected until the edges' heights have the slant.
 */
function solvePose(
  x: number,
  h: number,
  w: number,
  r: number,
  p: Required<CorridorPath>,
): Pose {
  const P = p.perspective;
  const z = P * (1 - p.cardHeight / h);
  const inner = x - w / 2;
  const fit = (turn: number) => {
    const c = Math.cos(turn);
    const s = Math.sin(turn);
    const edges = (crop: number) => {
      const a = (crop * p.cardWidth) / 2;
      // Pin the inner edge, then see where the outer one lands.
      const rail = (inner * (P - z + a * s)) / P + a * c;
      const outer = ((rail + a * c) * P) / (P - z - a * s);
      return { rail, a, width: outer - inner };
    };
    let lo = MIN_CROP;
    let hi = 1;
    if (edges(1).width <= w) lo = 1;
    else
      for (let k = 0; k < 32; k++) {
        const m = (lo + hi) / 2;
        if (edges(m).width < w) lo = m;
        else hi = m;
      }
    const e = edges(lo);
    return {
      rail: e.rail,
      crop: lo,
      slant: (P - z - e.a * s) / (P - z + e.a * s),
    };
  };
  let lo = 0;
  let hi = MAX_TURN;
  for (let k = 0; k < 32; k++) {
    const m = (lo + hi) / 2;
    if (fit(m).slant > r) lo = m;
    else hi = m;
  }
  const f = fit(lo);
  return { rail: f.rail, z, turn: lo, crop: f.crop };
}

/**
 * A newborn's share of its size, which it swells from over its first beat of
 * life (1 / cards), eased out so the growth is quick at first and lands
 * softly. It never lags the card ahead moving off, so the seam stays covered.
 */
const BIRTH_SCALE = 0.45;
const birthGrowth = (f: number) =>
  BIRTH_SCALE + (1 - BIRTH_SCALE) * (1 - (1 - f) * (1 - f));

/** A whole card's width with its outer edge at e. */
function widthAt(e: number) {
  let w = profileAt(e).w;
  for (let k = 0; k < 3; k++) w = profileAt(Math.max(e - w / 2, 0)).w;
  return w;
}

/**
 * Where a card shows over its life, u = 0 (born) to 1 (gone): its centre x,
 * visible width and its size against a whole card there. Cards touch, so the
 * outer edge advances one card width (plus the gap) per 1 / cards of life,
 * integrated from the seam. A newborn is scaled down whole - not cropped -
 * and sits against the seam, its outer part behind the card ahead, until it
 * has grown into its place.
 */
function trackOf(cards: number, p: Required<CorridorPath>) {
  const steps = 1200;
  // Never negative: the two rails' newborns must not overlap each other.
  const seam = Math.max(p.gap, 0.1) / 2;
  const edges: number[] = [];
  let e = seam;
  for (let k = 0; k <= steps; k++) {
    edges.push(e);
    e += (cards * (widthAt(e) + p.gap)) / steps;
  }
  return (u: number) => {
    const f = Math.min(Math.max(u, 0), 1) * steps;
    const k = Math.min(Math.floor(f), steps - 1);
    const outer = edges[k] + (edges[k + 1] - edges[k]) * (f - k);
    const size = birthGrowth(Math.min(Math.max(u, 0) * cards, 1));
    const w = widthAt(outer) * size;
    const inner = Math.max(seam, outer - w);
    return { x: inner + w / 2, w, size };
  };
}

/** A card's own transform for a pose, and its photo's counter-scale. */
const cardTransform = (q: Pose, dir: 1 | -1) =>
  `translate3d(${(dir * q.rail).toFixed(3)}cqw,0,${q.z.toFixed(3)}cqw) ` +
  `rotateY(${((-dir * q.turn * 180) / Math.PI).toFixed(3)}deg) scaleX(${q.crop.toFixed(4)})`;
// The photo widens by the crop and by the turn's foreshortening, so it reads
// at its own proportions inside the narrowed, turned window.
const photoTransform = (q: Pose) =>
  `scaleX(${(1 / (q.crop * Math.cos(q.turn))).toFixed(4)})`;

/* ── the entrance ────────────────────────────────────────────────
 * Timed off the reference, from the moment it starts:
 *
 * 1. A black bow tie - narrow waist, tall flared ends - grows out of
 *    a dash at the centre, fast at first and settling exponentially
 *    (time constant ~0.55s), its height trailing its width.
 * 2. At SPLIT the corridor - every card already in its place, photo
 *    on it, the ribbon behind the band - zooms up out of the axis on
 *    top of the bow tie: a miniature of the finished gallery that
 *    roughly doubles in size every 0.1s, then lands softly at full
 *    size ~0.6s later. The bow tie holds its full size behind it and
 *    goes once the gallery has grown out to its ends.
 *
 * Nothing contracts and nothing is rearranged: the zoom is one 2D
 * scale over the projected corridor, so its gapless layout, its
 * perspective and the endless motion (running from SPLIT) all carry
 * straight through, and at scale 1 there is nothing to hand over.
 * The photos are decoded while the bow tie grows, so not one card
 * paints blank as they appear.
 * ─────────────────────────────────────────────────────────────── */

/** Seconds from the cue to the split: the bow tie's growth. */
export const INTRO_SPLIT = 2.4;
/** Time constant of the growth, seconds. */
const GROW_TAU = 0.55;
/** Seconds the corridor takes to zoom up to full size. */
const ZOOM = 0.6;
/** The corridor's size as the zoom starts: a speck at the centre. */
const ZOOM_FROM = 0.035;
/**
 * The zoom's size at progress t. Interpolated on a log scale, so equal steps
 * multiply the size - the reference's steady doubling - eased out only near
 * the end for the landing.
 */
const zoomAt = (t: number) => ZOOM_FROM ** Math.pow(1 - t, 1.3);
/** When the bow tie goes, seconds after the split, and how quickly. */
const BOW_FADE_AT = 0.36;
const BOW_FADE = 0.12;

type Bow = { half: number; waist: number; end: number; radius: number };
/** The bow tie as it finishes growing: ±27 wide, waist 5.3, ends 10.1. */
const BOW: Bow = { half: 27, waist: 2.65, end: 5.05, radius: 0.9 };
/** The ribbon the band rides on: barely pinched, just taller than the band. */
const RIBBON: Bow = { half: 12.2, waist: 2.8, end: 3.0, radius: 0.35 };

/** Outline of a bow tie centred on the origin. */
function bowPath({ half: hw, waist: mh, end: eh, radius: r }: Bow) {
  const f = (v: number) => v.toFixed(2);
  return (
    `M${f(-hw)} ${f(-eh + r)}Q${f(-hw)} ${f(-eh)} ${f(-hw + r)} ${f(-eh)}` +
    `C${f(-hw * 0.6)} ${f(-mh)} ${f(-hw * 0.3)} ${f(-mh)} 0 ${f(-mh)}` +
    `C${f(hw * 0.3)} ${f(-mh)} ${f(hw * 0.6)} ${f(-mh)} ${f(hw - r)} ${f(-eh)}` +
    `Q${f(hw)} ${f(-eh)} ${f(hw)} ${f(-eh + r)}L${f(hw)} ${f(eh - r)}` +
    `Q${f(hw)} ${f(eh)} ${f(hw - r)} ${f(eh)}` +
    `C${f(hw * 0.6)} ${f(mh)} ${f(hw * 0.3)} ${f(mh)} 0 ${f(mh)}` +
    `C${f(-hw * 0.3)} ${f(mh)} ${f(-hw * 0.6)} ${f(mh)} ${f(-hw + r)} ${f(eh)}` +
    `Q${f(-hw)} ${f(eh)} ${f(-hw)} ${f(eh - r)}Z`
  );
}

/** Exponential settle, normalised to land on 1 at the end. */
const settle = (k: number) => (t: number) =>
  (1 - Math.exp(-k * t)) / (1 - Math.exp(-k));
const growX = settle(INTRO_SPLIT / GROW_TAU);
// The height trails: the reference opens as a thin dash.
const growY = (t: number) => Math.pow(growX(t), 1.6);

export type StreamImage = {
  src: string;
  /** Only used if you drop the decorative treatment; the corridor is aria-hidden. */
  alt?: string;
};

export type ImageStreamHeroProps = {
  /**
   * Images cycled onto the rails. Both rails run the same sequence, so the
   * corridor reads as one mirrored stream. Used for any rail that has no
   * list of its own.
   */
  images?: StreamImage[];
  /**
   * Images for the left rail only, so the two sides stop mirroring each
   * other. With more images than `cards`, each card takes the next one in
   * the sequence every time it is reborn at the centre, so all of them come
   * through.
   */
  leftImages?: StreamImage[];
  /** Images for the right rail only. See `leftImages`. */
  rightImages?: StreamImage[];
  /**
   * Cards on each rail at once, the newest unrolling at the centre. Cards
   * touch, so this sets how far out the corridor runs before a card dies;
   * below 8 the outermost card dies on screen.
   * @default 8
   */
  cards?: number;
  /**
   * Seconds for one card to travel the whole corridor. Over `cards`, it is
   * the beat between cards: 0.95s on the reference.
   * @default 7.6
   */
  speed?: number;
  /**
   * Vertical placement of the corridor's axis, as a percentage of height.
   * @default 47
   */
  axis?: number;
  /** Override any part of the corridor geometry. Merged over the defaults. */
  path?: CorridorPath;
  /**
   * Play the entrance on load: a black bow tie grows at the centre, then the
   * corridor zooms up out of it before the endless motion carries on.
   * @default true
   */
  intro?: boolean;
  /**
   * Starts the entrance from outside, so it can run in step with other
   * motion (a preloader, a heading). Left undefined, the entrance starts by
   * itself once the photos are decoded.
   */
  play?: boolean;
  /** Content rendered above the corridor. */
  children?: React.ReactNode;
  className?: string;
};

/** Start the entrance once the photos are decoded, but never wait longer than this. */
const INTRO_WAIT_MS = 1200;

export function ImageStreamHero({
  images = [],
  leftImages,
  rightImages,
  cards = 8,
  speed = 7.6,
  axis = 47,
  path,
  intro = true,
  play,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & ImageStreamHeroProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const right = `ish-r-${id}`;
  const left = `ish-l-${id}`;
  const photo = `ish-p-${id}`;
  const card = `ish-c-${id}`;
  const zoom = `ish-z-${id}`;

  const p = React.useMemo(() => ({ ...PATH, ...path }), [path]);

  // The endless path, sampled: pose and screen x at each keyframe stop.
  const corridor = React.useMemo(() => {
    const track = trackOf(cards, p);
    const at = (u: number) => {
      const { x, w, size } = track(u);
      const { h, r } = profileAt(x);
      return { x, h: h * size, w, pose: solvePose(x, h * size, w, r, p) };
    };
    const stops = Array.from({ length: p.stops + 1 }, (_, s) => {
      const u = s / p.stops;
      return { u, ...at(u) };
    });
    const slots = Array.from({ length: cards }, (_, i) => at(i / cards));
    return { stops, slots };
  }, [cards, p]);

  // Hold the entrance until the photos are decoded, capped, so a slow network
  // never holds the hero back. A `play` from outside replaces this.
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [decoded, setDecoded] = React.useState(!intro);
  const ready = !intro || (play ?? decoded);
  const controlled = play !== undefined;
  React.useEffect(() => {
    if (!intro || controlled) return;
    let settled = false;
    const start = () => {
      if (settled) return;
      settled = true;
      setDecoded(true);
    };
    const cap = window.setTimeout(start, INTRO_WAIT_MS);
    const imgs = [...(stageRef.current?.querySelectorAll("img") ?? [])];
    Promise.all(imgs.map((img) => img.decode().catch(() => {}))).then(start);
    return () => {
      settled = true;
      window.clearTimeout(cap);
    };
  }, [intro, controlled]);

  // "wait" until ready, "grow" while the bow tie grows, "split" from the
  // zoom on. Without the entrance - or under reduced motion - it goes
  // straight to the finished corridor, `still`, with nothing animating in.
  const [phase, setPhase] = React.useState<"wait" | "grow" | "split">(
    intro ? "wait" : "split",
  );
  const [still, setStill] = React.useState(!intro);
  React.useEffect(() => {
    if (!intro || !ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      setPhase("split");
      return;
    }
    setPhase("grow");
    // The cards show their photos the moment they appear, so decode them now,
    // while the bow tie grows: a downloaded but undecoded photo can paint
    // blank for a frame.
    for (const img of stageRef.current?.querySelectorAll("img") ?? []) {
      img.decode().catch(() => {});
    }
    const t = window.setTimeout(() => setPhase("split"), INTRO_SPLIT * 1000);
    return () => window.clearTimeout(t);
  }, [intro, ready]);
  const split = phase === "split";
  const animated = !still;

  // Every card's place on the path is its negative delay, measured from one
  // shared start, so the cards only touch while their animations share that
  // start. They do when they all mount and resume together; anything that
  // starts one apart - a card mounted later, a hot reload, a tab the browser
  // held back - would open gaps and overlaps. So once the corridor runs, every
  // card's and photo's animation is pinned to one start time - after every
  // render, which is rare here, so a hot reload that changes nothing else is
  // caught too.
  React.useEffect(() => {
    const stage = stageRef.current;
    if (!split || still || !stage) return;
    const names = new Set([right, left, photo]);
    const anims = stage
      .getAnimations({ subtree: true })
      .filter(
        (a): a is CSSAnimation =>
          "animationName" in a && names.has((a as CSSAnimation).animationName),
      );
    let live = true;
    Promise.all(anims.map((a) => a.ready)).then(() => {
      if (!live) return;
      // The start most of them share; a stray one joins the rest.
      const votes = new Map<number, number>();
      for (const a of anims) {
        const t = Number(a.startTime);
        if (Number.isFinite(t)) votes.set(t, (votes.get(t) ?? 0) + 1);
      }
      const start = [...votes].sort((m, n) => n[1] - m[1])[0]?.[0];
      if (start === undefined) return;
      for (const a of anims) if (Number(a.startTime) !== start) a.startTime = start;
    }, () => {});
    return () => {
      live = false;
    };
  });

  const css = React.useMemo(() => {
    const { stops } = corridor;
    const rail = (dir: 1 | -1, name: string) =>
      `@keyframes ${name}{${stops
        .map(
          (s) =>
            `${(s.u * 100).toFixed(2)}%{transform:${cardTransform(s.pose, dir)}}`,
        )
        .join("")}}`;
    const counter = `@keyframes ${photo}{${stops
      .map((s) => `${(s.u * 100).toFixed(2)}%{transform:${photoTransform(s.pose)}}`)
      .join("")}}`;
    // A CSS animation, not a JS one, so the browser draws the photos for the
    // size they grow to rather than the speck they start as, and it starts in
    // the same frame as the cards'.
    const ZOOM_STOPS = 24;
    const zoomIn = `@keyframes ${zoom}{${Array.from({ length: ZOOM_STOPS + 1 }, (_, k) => {
      const t = k / ZOOM_STOPS;
      return `${(t * 100).toFixed(2)}%{transform:scale(${zoomAt(t).toFixed(4)})}`;
    }).join("")}}`;
    return (
      rail(1, right) +
      rail(-1, left) +
      counter +
      zoomIn +
      // Pausing rather than disabling keeps the corridor whole: every card is
      // already dropped mid-flight by its negative delay, so it freezes as a
      // finished still instead of collapsing onto the centre.
      `@media(prefers-reduced-motion:reduce){.${card},.${card} img{animation-play-state:paused!important}.${zoom}{animation:none!important}}`
    );
  }, [corridor, right, left, photo, card, zoom]);

  // A card takes the next photo in its rail's sequence each time it is reborn.
  // Slot i starts on photo i and is reborn every `cards` births, so on its
  // k-th life it shows photo i - k * cards: each newborn continues the stream
  // inward from the one before. Written straight to the <img>, so no render.
  const reborn = (
    e: React.AnimationEvent<HTMLDivElement>,
    list: StreamImage[],
    i: number,
  ) => {
    if (e.target !== e.currentTarget || list.length <= cards) return;
    const el = e.currentTarget;
    const lap = Number(el.dataset.lap ?? 0) + 1;
    el.dataset.lap = String(lap);
    const n = list.length;
    const next = list[(((i - lap * cards) % n) + n) % n];
    const img = el.querySelector("img");
    if (img && next) img.src = next.src;
  };

  const running = animated && split ? "running" : "paused";

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      {...props}
      style={{ containerType: "inline-size", ...props.style }}
    >
      <style>{css}</style>

      {/* The bow tie, behind the corridor: grows at the centre, holds its full
          size through the split, and goes once the corridor zooming up over
          it has reached its ends. A zero-size box on the axis, so it grows
          from that point. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-0 w-0"
        style={{ left: "50%", top: `${axis}%` }}
        initial={false}
        animate={
          still
            ? { scaleX: 1, scaleY: 1, opacity: 0 }
            : phase === "wait"
              ? { scaleX: 0, scaleY: 0, opacity: 1 }
              : { scaleX: 1, scaleY: 1, opacity: split ? 0 : 1 }
        }
        transition={
          still
            ? { duration: 0 }
            : {
                scaleX: { duration: INTRO_SPLIT, ease: growX },
                scaleY: { duration: INTRO_SPLIT, ease: growY },
                opacity: { duration: BOW_FADE, delay: BOW_FADE_AT, ease: "linear" },
              }
        }
      >
        <svg
          className="absolute overflow-visible"
          style={{ left: "-30cqw", top: "-8cqw", width: "60cqw", height: "16cqw" }}
          viewBox="-30 -8 60 16"
        >
          <path fill="#000" d={bowPath(BOW)} />
        </svg>
      </motion.div>

      {/* The corridor. In the entrance it zooms up out of the axis whole - a
          2D scale over the projected scene - and is hidden until then. */}
      <div
        aria-hidden
        className={cn(zoom, "pointer-events-none absolute inset-0")}
        style={{
          perspective: `${p.perspective}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          transformOrigin: `50% ${axis}%`,
          visibility: split ? "visible" : "hidden",
          ...(animated && {
            animation: `${zoom} ${ZOOM}s linear both`,
            animationPlayState: running,
          }),
        }}
      >
        {/* The ribbon the band rides on, behind every card. */}
        <div
          className="absolute h-0 w-0"
          style={{ left: "50%", top: `${axis}%` }}
        >
          <svg
            className="absolute overflow-visible"
            style={{ left: "-30cqw", top: "-8cqw", width: "60cqw", height: "16cqw" }}
            viewBox="-30 -8 60 16"
          >
            <path fill="#000" d={bowPath(RIBBON)} />
          </svg>
        </div>

        <div
          ref={stageRef}
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {(
            [
              [right, rightImages ?? images, 1],
              [left, leftImages ?? images, -1],
            ] as const
          ).map(([name, rail, dir]) =>
            Array.from({ length: cards }, (_, i) => {
              const img = rail[i % Math.max(rail.length, 1)];
              // Where the endless animation starts this card. A running
              // animation always overrides it; it only shows if animations
              // are stripped (the site's global reduced-motion rule does
              // that), leaving the corridor as a finished still.
              const rest = corridor.slots[i].pose;
              return (
                <div
                  key={`${name}-${i}`}
                  className={cn(card, "absolute overflow-hidden")}
                  onAnimationIteration={(e) => reborn(e, rail, i)}
                  style={{
                    left: "50%",
                    top: `${axis}%`,
                    width: `${p.cardWidth}cqw`,
                    height: `${p.cardHeight}cqw`,
                    marginLeft: `${-p.cardWidth / 2}cqw`,
                    marginTop: `${-p.cardHeight / 2}cqw`,
                    borderRadius: `${p.cardRadius}cqw`,
                    // Under the photo; only seen if one fails to load.
                    background: "#000",
                    transform: cardTransform(rest, dir),
                    animation: `${name} ${speed}s linear infinite`,
                    // Negative delay drops each card mid-flight, so the
                    // corridor is already full on the first frame.
                    animationDelay: `${-(i * speed) / cards}s`,
                    // Held on that first frame until the split, so every
                    // load opens on the same arrangement.
                    animationPlayState: running,
                    backfaceVisibility: "hidden",
                  }}
                >
                  {img ? (
                    <img
                      src={img.src}
                      alt={img.alt ?? ""}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                      draggable={false}
                      style={{
                        transform: photoTransform(rest),
                        // The counter-scale, in lockstep with the card.
                        animation: `${photo} ${speed}s linear infinite`,
                        animationDelay: `${-(i * speed) / cards}s`,
                        animationPlayState: running,
                      }}
                    />
                  ) : null}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

export default ImageStreamHero;

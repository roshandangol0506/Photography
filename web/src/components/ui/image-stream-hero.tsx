"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── the corridor ────────────────────────────────────────────────
 * Two rails of cards ride from far behind the screen toward the
 * viewer. Perspective alone does the work that looks like two
 * animations: as a card's z grows it gets bigger *and* its screen x
 * sweeps outward from the vanishing point, because the projection
 * scales position and size by the same factor.
 *
 * Three things shape it, and each one fixes a specific artefact:
 *
 * 1. Depth is authored as *apparent size*, geometrically — each card
 *    is a constant ratio bigger than the one behind it, all the way
 *    out. Spacing a straight z-range evenly instead makes the near
 *    cards tear apart from each other as the projection blows up.
 * 2. The rails open hard in the first stretch and then hold
 *    (`fan` > 1). That opening cancels the — still slow — growth back
 *    there, so the ribbon leaves the centre as a flat band, bends
 *    once, and only then runs out on the diagonal. Parallel rails
 *    project to a straight cone with no bend at all.
 * 3. Neither end of the loop is ever on screen. A card dies with its
 *    inner edge past 50cqw, clear of the container's edge. And it is
 *    born *across* the axis — `railBirth` is negative, so the newest
 *    card starts on the far side and sweeps back through the centre.
 *    That plugs the throat: the axis stays covered at every instant,
 *    and a newborn lands behind cards that already cover it, so it
 *    needs no fade in. Birthing on its own side instead leaves a hole
 *    at dead centre that blinks open once every cycle.
 *
 * Every length is in `cqw` — a percentage of the container's width —
 * so the whole corridor keeps its proportions at any size. The
 * defaults were fitted numerically against a reference recording's
 * card-height and edge-position profile, not eyeballed.
 * ─────────────────────────────────────────────────────────────── */

/**
 * Geometry of the corridor. Every length is `cqw`, a percentage of the
 * container's width, so the shape is resolution-independent.
 *
 * These interact: the ribbon only stays solid while consecutive cards
 * overlap, which needs `exitHeight / birthHeight` spread over enough
 * `cards`. Raising `exitHeight`, dropping `cards`, or pulling `railExit`
 * in all push toward a visible tear near the frame edge.
 */
export type CorridorPath = {
  /** Strength of the projection. Lower is a wider-angle, more dramatic rush. @default 30 */
  perspective?: number;
  /** Card width in world units. @default 18 */
  cardWidth?: number;
  /** Card height in world units. @default 25 */
  cardHeight?: number;
  /** Corner radius applied to each card. @default 0.4 */
  cardRadius?: number;
  /** On-screen card height at the waist, where a card is born. @default 2.6 */
  birthHeight?: number;
  /** On-screen card height as a card leaves the frame. @default 46 */
  exitHeight?: number;
  /**
   * Lateral offset at birth. Negative starts the card across the axis so the
   * centre never opens up — see note 3 above. @default -11
   */
  railBirth?: number;
  /** Lateral offset once the rails have finished opening. @default 44 */
  railExit?: number;
  /** How front-loaded the opening is. >1 opens early then holds. @default 3.3 */
  fan?: number;
  /** Y-rotation at birth, degrees. @default 6 */
  turnBirth?: number;
  /** Y-rotation at exit, degrees. @default 28 */
  turnExit?: number;
  /** Keyframe stops used to trace the curve. Raise only if motion looks faceted. @default 24 */
  stops?: number;
};

const PATH: Required<CorridorPath> = {
  perspective: 30,
  cardWidth: 18,
  cardHeight: 25,
  cardRadius: 0.4,
  birthHeight: 2.6,
  exitHeight: 46,
  railBirth: -11,
  railExit: 44,
  fan: 3.3,
  turnBirth: 6,
  turnExit: 28,
  stops: 24,
};

/** Where a card is at progress u (0 = born, 1 = gone) along the corridor. */
function along(u: number, p: Required<CorridorPath>) {
  // Geometric in apparent size, so consecutive cards keep a constant size
  // ratio and the ribbon stays solid at both ends.
  const scale =
    (p.birthHeight / p.cardHeight) * Math.pow(p.exitHeight / p.birthHeight, u);
  const z = p.perspective * (1 - 1 / scale);
  const rail = p.railExit - (p.railExit - p.railBirth) * Math.pow(1 - u, p.fan);
  const turn = p.turnBirth + (p.turnExit - p.turnBirth) * u;
  return { scale, z, rail, turn };
}

/* ── the entrance ────────────────────────────────────────────────
 * On load the corridor starts gathered into a small cluster round the
 * centre and bursts outward into place, nearest-the-centre cards first.
 *
 * It never touches a card's own transform - that belongs to the endless
 * keyframes. Each card sits in a preserve-3d wrapper that carries a one-off
 * offset in corridor space, (dx, 0, dz), animating to zero. Under the
 * projection a card at depth z is drawn s = P / (P - z) times its size and
 * its x is scaled by the same s, so the start offset is solved per card:
 * pushed back to z' where it draws at SIZE * s, and across to x' where
 * x' * s' = GATHER * x * s - i.e. at GATHER of its real distance from the
 * centre. As the offset eases to zero each card lands exactly where the
 * endless animation has it, and that animation runs underneath the whole
 * time, so there is nothing to hand over and no frame where anything snaps.
 * ─────────────────────────────────────────────────────────────── */

/** Cards start at this share of their real distance from the centre. */
const INTRO_GATHER = 0.12;
/**
 * Cards start at this share of their real size: pushed back along the
 * corridor's depth, so the gathered cluster reads as a compact ribbon rather
 * than a pile of full-size near cards. 1 keeps every card at its size.
 */
const INTRO_SIZE = 0.4;
/** Start once the photos are decoded, but never wait longer than this. */
const INTRO_WAIT_MS = 1200;
/** Seconds each card takes to travel out. */
const INTRO_DURATION = 1.4;
/** Seconds before the first (most central) card moves. */
const INTRO_FIRST = 0.1;
/** Seconds between successive cards, ordered from the centre outward. */
const INTRO_STAGGER = 0.04;
/** Fast off the mark, long soft landing. */
const INTRO_EASE = "cubic-bezier(0.19, 1, 0.22, 1)";

/** Sample the path once so the CSS keyframes trace the real curve. */
function keyframes(dir: 1 | -1, name: string, p: Required<CorridorPath>) {
  const steps: string[] = [];
  for (let s = 0; s <= p.stops; s++) {
    const u = s / p.stops;
    const { z, rail, turn } = along(u, p);
    steps.push(
      `${(u * 100).toFixed(2)}%{transform:translate3d(${(dir * rail).toFixed(
        2,
      )}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)}`,
    );
  }
  return `@keyframes ${name}{${steps.join("")}}`;
}

export type StreamImage = {
  src: string;
  /** Only used if you drop the decorative treatment; the corridor is aria-hidden. */
  alt?: string;
};

export type ImageStreamHeroProps = {
  /**
   * Images cycled onto the rails. Both rails run the same sequence, so the
   * corridor reads as one mirrored stream. Fewer than `cards` simply repeat.
   * Used for any rail that has no list of its own.
   */
  images?: StreamImage[];
  /**
   * Images for the left rail only, so the two sides stop mirroring each
   * other. A card keeps its image for good, so set `cards` to at least the
   * list's length or the tail of the list never appears.
   */
  leftImages?: StreamImage[];
  /** Images for the right rail only. See `leftImages`. */
  rightImages?: StreamImage[];
  /**
   * Cards on each rail at once. More cards means a denser corridor, not a
   * faster one — spacing is derived from this and `speed`. Drop it far below
   * the default and consecutive cards grow too fast to stay overlapped near
   * the exit, which tears a gap in the ribbon.
   * @default 9
   */
  cards?: number;
  /**
   * Seconds for one card to travel the whole corridor.
   * @default 18
   */
  speed?: number;
  /**
   * Vertical placement of the corridor's axis, as a percentage of height.
   * @default 55
   */
  axis?: number;
  /** Override any part of the corridor geometry. Merged over the defaults. */
  path?: CorridorPath;
  /**
   * Play the entrance on load: the cards start gathered at the centre and
   * scatter out to their places before the endless motion carries on.
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

export function ImageStreamHero({
  images = [],
  leftImages,
  rightImages,
  cards = 9,
  speed = 18,
  axis = 55,
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
  const card = `ish-c-${id}`;
  const gather = `ish-g-${id}`;
  const scatter = `ish-s-${id}`;

  const p = React.useMemo(() => ({ ...PATH, ...path }), [path]);

  // The entrance, per card slot (both rails mirror each other). Slot i starts
  // the page at progress i / cards - that is its negative delay - so where it
  // really is on screen is known: x = rail at depth z, drawn `scale` times.
  // Slots are ranked by that on-screen distance, so the most central cards
  // set off first and the outermost last.
  const entrance = React.useMemo(() => {
    const P = p.perspective;
    const slots = Array.from({ length: cards }, (_, i) => {
      const { rail, scale, z } = along(i / cards, p);
      const startScale = INTRO_SIZE * scale;
      const startZ = P * (1 - 1 / startScale);
      const startX = (INTRO_GATHER * rail * scale) / startScale;
      return {
        dx: startX - rail,
        dz: startZ - z,
        onScreen: Math.abs(rail * scale),
      };
    });
    const rank: number[] = [];
    slots
      .map((s, i) => [s.onScreen, i] as const)
      .sort((a, b) => a[0] - b[0])
      .forEach(([, i], r) => (rank[i] = r));
    return slots.map((s, i) => ({
      dx: s.dx,
      dz: s.dz,
      delay: INTRO_FIRST + rank[i] * INTRO_STAGGER,
    }));
  }, [cards, p]);

  // Hold the entrance (cards hidden, offsets paused) until the photos are
  // decoded, so it never plays out over empty cards - capped, so a slow
  // network never holds the hero back. A `play` from outside replaces this.
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

  const css = React.useMemo(
    () =>
      `${keyframes(1, right, p)}${keyframes(-1, left, p)}` +
      `@keyframes ${scatter}{from{transform:translate3d(var(--ish-dx),0,var(--ish-dz))}to{transform:translate3d(0,0,0)}}` +
      // Pausing rather than disabling keeps the corridor whole: every card is
      // already dropped mid-flight by its negative delay, so it freezes as a
      // finished still instead of collapsing onto the axis. The entrance is
      // skipped outright: the cards are simply in place, shown at once.
      `@media(prefers-reduced-motion:reduce){.${card}{animation-play-state:paused!important;opacity:1!important}.${gather}{animation:none!important}}`,
    [right, left, card, gather, scatter, p],
  );

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      {...props}
      style={{ containerType: "inline-size", ...props.style }}
    >
      <style>{css}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          perspective: `${p.perspective}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
        }}
      >
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
              // Without a list of its own, each rail walks the shared
              // sequence, so the left side mirrors the right at every depth.
              const img = rail[i % Math.max(rail.length, 1)];
              // Where the endless animation starts this card. A running
              // animation always overrides it; it only shows if animations
              // are stripped (the site's global reduced-motion rule does
              // that), leaving the corridor as a finished still instead of
              // every card collapsed onto the axis.
              const rest = along(i / cards, p);
              return (
                // The entrance wrapper: preserve-3d so the card inside keeps
                // its depth; its shift eases from the centre to zero.
                <div
                  key={`${name}-${i}`}
                  className={gather}
                  style={
                    {
                      position: "absolute",
                      inset: 0,
                      transformStyle: "preserve-3d",
                      ...(intro && {
                        "--ish-dx": `${(dir * entrance[i].dx).toFixed(2)}cqw`,
                        "--ish-dz": `${entrance[i].dz.toFixed(2)}cqw`,
                        animation: `${scatter} ${INTRO_DURATION}s ${INTRO_EASE} ${entrance[i].delay.toFixed(2)}s both`,
                        animationPlayState: ready ? "running" : "paused",
                      }),
                    } as React.CSSProperties
                  }
                >
                <div
                  className={cn(card, "absolute overflow-hidden")}
                  style={{
                    left: "50%",
                    top: `${axis}%`,
                    width: `${p.cardWidth}cqw`,
                    height: `${p.cardHeight}cqw`,
                    marginLeft: `${-p.cardWidth / 2}cqw`,
                    marginTop: `${-p.cardHeight / 2}cqw`,
                    borderRadius: `${p.cardRadius}cqw`,
                    transform: `translate3d(${(dir * rest.rail).toFixed(2)}cqw,0,${rest.z.toFixed(2)}cqw) rotateY(${(-dir * rest.turn).toFixed(2)}deg)`,
                    animation: `${name} ${speed}s linear infinite`,
                    // Negative delay drops each card mid-flight, so the
                    // corridor is already full on the first frame.
                    animationDelay: `${-(i * speed) / cards}s`,
                    // Held on that first frame until the entrance starts:
                    // the entrance offsets are solved for exactly this
                    // spot, and a card left running behind a long preloader
                    // drifts - the outermost ones even wrap round to birth,
                    // across the axis - so they'd scatter from the wrong side.
                    ...(intro && {
                      animationPlayState: ready ? "running" : "paused",
                    }),
                    backfaceVisibility: "hidden",
                    // Hidden until the entrance can start. On the card, not
                    // the wrapper: opacity on a preserve-3d wrapper would
                    // flatten the corridor's depth.
                    ...(intro && {
                      opacity: ready ? 1 : 0,
                      transition: "opacity .45s ease",
                    }),
                  }}
                >
                  {img ? (
                    <img
                      src={img.src}
                      alt={img.alt ?? ""}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : null}
                </div>
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

"use client";

import "./scroll-expansion.css";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scriptFont } from "@/lib/fonts";
import {
  hflowBusy,
  hflowNeighbour,
  hflowSlide,
  type HflowEnterDetail,
} from "@/lib/hflow";

// The calligraphic "Expansive": the site's shared script (lib/fonts).
const script = scriptFont;

// Photos from /public, both through next/image so the full-size originals
// are resized by the optimizer on the way out.
const MEDIA = {
  src: "/2.jpg",
  background: "/6.jpg",
};

const COPY = {
  tenets: "Tenets",
  intro:
    "How does a home make it to the Sobha Privy Collection? We set our own benchmarks to make certain it was a rigorous process. We call them the Privy Collection Tenets, and each one defines a unique and unmistakable aspect that must be satisfied.",
  subtitle: "Expansive",
  title: "Spaces",
  text: "We have pushed beyond conventional boundaries in more ways than one. A Privy home features grand palatial spaces where luxury and convenience converge with equal elegance and finesse. Even in the heart of the bustling city you require a private, expansive retreat. Whether perched on a soaring tower in the sky or within an oasis of greenery, each home redefines the notion of scale.",
};

/** How long the entrance runs; input is held until it lands. */
const ENTRANCE_MS = 1300;
/**
 * TENETS fills the card's width (less its 1.4cqw insets) at the reference
 * artwork's proportions: a font size of 112/440 of that width, widened to
 * fit. "TENETS" in Gilda Display is 3.795em wide.
 */
const TITLE_EM = (97.2 * 112) / 440;
const TITLE_STRETCH = 97.2 / (TITLE_EM * 3.795);
/** A pause this long between wheel events ends one gesture. */
const GESTURE_GAP_MS = 180;
/** Time constant of the wheel's glide through the track, ms. */
const GLIDE_MS = 90;
/** How long the finished composition rests before scrolling on hands over. */
const END_DWELL_MS = 450;
/** Touch travel that counts as a swipe off either end, px. */
const SWIPE_PX = 8;

/* ── the sequence ────────────────────────────────────────────────
 * After the reference's Tenets → Expansive Spaces card. One card, the
 * full width of the screen and taller than it, holds everything:
 * TENETS along its top, the photo's frame in its middle, the intro along
 * its bottom. The frame carries "Expansive SPACES" hanging off its left
 * edge and the description beside its right edge.
 *
 *   lead     the background alone
 *   rise     the card, at a third of its size, rides up from below the
 *            fold at scrolling speed until it is centred
 *   expand   pinned there, it grows to full size (easeInOutQuad), so its
 *            surface takes over the screen and TENETS and the intro leave
 *            past the edges. The intro counter-scales so its type keeps
 *            one size on screen. The photo opens from a portrait strip
 *            to the full landscape frame, settling from a slight zoom,
 *            and the frame's title and text fade up over the second half
 *   hold     the finished composition rests before the page moves on
 *
 * The card's surface is the site's backdrop texture (blackBg.jpg), held
 * still on screen: a screen-sized layer inside the card is counter-scaled
 * and counter-moved against it, so the card opens like a window onto the
 * site's own background instead of carrying a stretching copy of it, and
 * at full size it is that background, seamless with the sections around.
 *
 * The scale, counter-scale, strip and zoom values are the reference's
 * own (its landingExpansiveCard* parallax patterns), and lengths are in
 * cqw of the card - the card is the screen's width - as its layout is in
 * vw. Every value comes from the scroll position through the track.
 * ─────────────────────────────────────────────────────────────── */

type Size = { w: number; h: number };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeInOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/** The sequence's lengths for a stage of this size, in px. */
function plan({ w, h }: Size) {
  // Side by side needs the room; narrower screens stack the frame's text.
  const wide = w >= 1024;
  // The card's starting scale (the reference's 480/1440 on desktop).
  const start = wide ? 1 / 3 : 0.62;
  // Portrait (the reference's 4:5), and at least the screen's height, so its
  // white covers the screen at full size. TENETS and the intro have faded by
  // then wherever they would still show.
  const cardH = Math.max(w / 0.8, h * 1.04);
  // From card top just below the fold to card centred.
  const travel = h / 2 + (cardH * start) / 2 + 8;
  const lead = h * 0.08;
  const expand = h;
  const hold = h * 0.35;
  return {
    wide,
    start,
    cardH,
    travel,
    lead,
    expand,
    distance: lead + travel + expand + hold,
  };
}
type Plan = ReturnType<typeof plan>;

/** Everything that moves, at progress `p` through the track. */
function sceneAt(p: number, at: Plan) {
  const s = p * at.distance;
  const risen = clamp01((s - at.lead) / at.travel);
  const q = clamp01((s - at.lead - at.travel) / at.expand);
  const e = easeInOutQuad(q);
  return {
    /** Card centre below the stage centre, px. Linear: it scrolls up. */
    y: (1 - risen) * at.travel,
    scale: at.start + (1 - at.start) * e,
    introScale: 1 + (at.start - 1) * e,
    /** TENETS and the intro, gone once they are off screen anyway. */
    intro: 1 - clamp01((q - 0.55) / 0.3),
    /** The photo's side strips, % of the frame's width. */
    strip: 26.66 * (1 - e),
    zoom: 1.25 - 0.25 * e,
    content: clamp01((q - 0.5) / 0.5),
  };
}

function useScene<T>(
  p: MotionValue<number>,
  at: Plan,
  pick: (s: ReturnType<typeof sceneAt>) => T,
) {
  // The transformer is re-read on every render, so a new size takes effect
  // as soon as it renders.
  return useTransform(p, (v) => pick(sceneAt(v, at)));
}

/**
 * The scroll-driven Tenets → Expansive Spaces section.
 *
 * Placed straight after CinematicStory, it takes part in the story's scene
 * transitions: it opts in with data-cinematic-entry, so scrolling on from the
 * story's last scene drives the page here as a scene change and fires
 * "cinematic:enter" - the background fades up over the texture (see
 * scroll-expansion.css). Scrolling up from its start hands back to the story
 * the same way, via "cinematic:return", when the story accepts it.
 *
 * Its end is linked to the section after it (data-hflow, see lib/hflow): a
 * fresh scroll from the finished composition slides that one in from the
 * right, and sliding back lands here finished.
 */
export function ScrollExpansion() {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [entering, setEntering] = useState(false);

  // The stage's size, which every length is worked out from. State rather
  // than a motion value: it changes rarely, and a render recomputes every
  // transform at once.
  const [size, setSize] = useState<Size>({ w: 1440, h: 900 });
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const read = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);
  const at = plan(size);

  // Progress through the track. `held` pins it to the end while arriving
  // back from the next section; reduced motion shows the end throughout.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const held = useMotionValue(0);
  const finished = useMotionValue(1);
  const live = useTransform([scrollYProgress, held], ([p, h]: number[]) =>
    Math.max(p, h),
  );
  const progress = reduced ? finished : live;

  const cardY = useScene(progress, at, (s) => s.y);
  const cardScale = useScene(progress, at, (s) => s.scale);
  // The backdrop layer undoes the card's move and scale, so it stays put.
  const surfaceY = useScene(progress, at, (s) => -s.y / s.scale);
  const surfaceScale = useScene(progress, at, (s) => 1 / s.scale);
  const introScale = useScene(progress, at, (s) => s.introScale);
  const intro = useScene(progress, at, (s) => s.intro);
  const clipPath = useScene(
    progress,
    at,
    (s) => `inset(0% ${s.strip}% 0% ${s.strip}%)`,
  );
  const zoom = useScene(progress, at, (s) => s.zoom);
  const content = useScene(progress, at, (s) => s.content);

  // The story's hand-off: play the entrance, and hold input until it has
  // landed and the gesture that caused it has died away.
  const quiet = useRef({ on: false, last: 0 });
  const enteringRef = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: number | undefined;
    const onEnter = () => {
      setEntering(true);
      enteringRef.current = true;
      quiet.current.on = true;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setEntering(false);
        enteringRef.current = false;
      }, ENTRANCE_MS);
    };
    el.addEventListener("cinematic:enter", onEnter);
    return () => {
      el.removeEventListener("cinematic:enter", onEnter);
      window.clearTimeout(timer);
    };
  }, []);

  // Sliding back in from the next section. hflow brings this section's top
  // into view and leaves the page there, but it was left at its end: so for
  // the slide, show the finished composition at the top (stage unpinned to
  // the top, progress held at the end), then in one frame move the page to
  // the end and pin the stage again - the same picture, so nothing moves.
  useEffect(() => {
    const root = ref.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;
    let raf = 0;
    let stop = () => {};
    const onEnter = (e: Event) => {
      if ((e as CustomEvent<HflowEnterDetail>).detail?.from !== -1) return;
      held.set(1);
      stage.style.position = "absolute";
      stage.style.top = "0px";
      const land = () => {
        if (hflowBusy()) {
          raf = requestAnimationFrame(land);
          return;
        }
        const r = track.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + r.bottom - stage.offsetHeight);
        stage.style.position = "";
        stage.style.top = "";
        // Let go once scrolling reports the end too - which it may already:
        // the page was past this section before the slide, so its progress
        // can read the end throughout and never change.
        if (scrollYProgress.get() >= 0.995) {
          held.set(0);
          return;
        }
        stop = scrollYProgress.on("change", (v) => {
          if (v < 0.995) return;
          held.set(0);
          stop();
        });
      };
      raf = requestAnimationFrame(land);
    };
    root.addEventListener("hflow:enter", onEnter);
    return () => {
      root.removeEventListener("hflow:enter", onEnter);
      cancelAnimationFrame(raf);
      stop();
    };
  }, [held, scrollYProgress]);

  // Inside the track, scrolling is the page's own. Only a fresh gesture off
  // either end, with somewhere to go, is handed over; the gesture that
  // carried the page to an end stops there rather than running on past it,
  // so the composition always finishes before the page moves on.
  useEffect(() => {
    if (reduced) return;
    const root = ref.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    const above = () => {
      const prev = root.previousElementSibling as HTMLElement | null;
      return prev?.dataset.cinematicReturn === "on" ? prev : null;
    };
    const canExitDown = () => !!hflowNeighbour(root, 1) && !hflowBusy();
    const exitUp = () => {
      above()?.dispatchEvent(new CustomEvent("cinematic:return"));
      return true;
    };
    const exitDown = () => {
      const next = hflowNeighbour(root, 1);
      // The pinned stage is what is on screen, so it is what leaves.
      return !!next && hflowSlide(stage, next);
    };

    const holding = (e: Event) => {
      const q = quiet.current;
      if (!enteringRef.current && !q.on) return false;
      const now = performance.now();
      if (!enteringRef.current && now - q.last > GESTURE_GAP_MS) {
        q.on = false;
        return false;
      }
      q.last = now;
      if (e.cancelable) e.preventDefault();
      return true;
    };

    /** Where the track is: pinned on screen, and at either end. */
    const where = () => {
      const r = track.getBoundingClientRect();
      const screen = stage.offsetHeight;
      return {
        r,
        screen,
        pinned: r.top <= 1 && r.bottom >= screen - 1,
        atStart: Math.abs(r.top) <= 1,
        atEnd: Math.abs(r.bottom - screen) <= 1,
      };
    };

    // Wheel scrolling through the track is driven from here, not left to
    // the browser: its smooth scrolling queues each notch onto a target that
    // is already ahead of the page, so a quick scroll ran straight past the
    // end into the next section before anything could stop it. Here the
    // target is ours and clamped to the track, so the page always comes to
    // rest on the finished composition. The page still really scrolls, so
    // the sequence stays tied to the scroll position.
    const drive = { target: null as number | null, at: 0, t: 0, raf: 0 };
    const glide = (now: number) => {
      if (drive.target === null) return;
      // Moved by something else (the scrollbar, keys, a slide): let go.
      if (Math.abs(window.scrollY - drive.at) > 2) {
        drive.target = null;
        return;
      }
      const dt = Math.min(64, now - drive.t);
      drive.t = now;
      const next =
        drive.at + (drive.target - drive.at) * (1 - Math.exp(-dt / GLIDE_MS));
      const done = Math.abs(drive.target - next) < 0.5;
      drive.at = done ? drive.target : next;
      window.scrollTo(0, drive.at);
      if (done) drive.target = null;
      else drive.raf = requestAnimationFrame(glide);
    };
    const glideTo = (y: number) => {
      if (drive.target === null) {
        drive.at = window.scrollY;
        drive.t = performance.now();
        drive.raf = requestAnimationFrame(glide);
      }
      drive.target = y;
    };

    // At an end, a fresh gesture hands over at once; one still running from
    // before hands over once the page has rested there for END_DWELL_MS, so
    // the finished composition is always seen, but scrolling on doesn't
    // have to stop and start again.
    const gesture = { last: 0, abs: 0, restedAt: 0 };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || holding(e)) return;
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const d = e.deltaY * unit;
      if (!d || Math.abs(e.deltaX) * unit > Math.abs(d)) return;
      const now = performance.now();
      const abs = Math.abs(d);
      // A pause, or a new swipe re-accelerating out of a decaying tail.
      const fresh =
        now - gesture.last > GESTURE_GAP_MS ||
        (abs >= 20 && abs > gesture.abs * 2.5);
      gesture.last = now;
      gesture.abs = abs;

      const { r, screen, pinned } = where();
      if (!pinned) return;
      const start = r.top + window.scrollY;
      const end = start + track.offsetHeight - screen;
      const base = drive.target ?? window.scrollY;
      const edge =
        d > 0 && base >= end - 0.5
          ? { at: end, can: canExitDown(), exit: exitDown }
          : d < 0 && base <= start + 0.5
            ? { at: start, can: !!above(), exit: exitUp }
            : null;

      if (!edge) {
        gesture.restedAt = 0;
        e.preventDefault();
        glideTo(Math.min(end, Math.max(start, base + d)));
        return;
      }
      const resting =
        drive.target === null && Math.abs(window.scrollY - edge.at) <= 1;
      // Nowhere to hand over to: once at rest, the page simply scrolls on.
      if (!edge.can) {
        if (!resting) e.preventDefault();
        return;
      }
      e.preventDefault();
      if (!resting) return;
      if (!gesture.restedAt) gesture.restedAt = now;
      if (fresh || now - gesture.restedAt >= END_DWELL_MS) {
        gesture.restedAt = 0;
        edge.exit();
      }
    };

    let touch: { y: number; atStart: boolean; atEnd: boolean } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      const w = where();
      touch = w.pinned
        ? { y: e.touches[0].clientY, atStart: w.atStart, atEnd: w.atEnd }
        : null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (holding(e) || !touch || e.touches.length > 1) return;
      const dy = touch.y - e.touches[0].clientY;
      if (Math.abs(dy) < SWIPE_PX) return;
      const handled =
        dy < 0
          ? touch.atStart && !!above() && exitUp()
          : touch.atEnd && canExitDown() && exitDown();
      if (handled && e.cancelable) e.preventDefault();
      touch = null;
    };
    const onTouchEnd = () => {
      touch = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    return () => {
      cancelAnimationFrame(drive.raf);
      drive.target = null;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [reduced]);

  const { wide } = at;

  return (
    <div
      ref={ref}
      className="sx-section"
      data-cinematic-entry=""
      // Linked to the section after it: that one slides in sideways.
      data-hflow=""
      data-entering={entering}
    >
      {/* The track: its height is the scroll distance the sequence takes.
          Nothing above the sticky stage may clip overflow, or it stops
          sticking. Reduced motion: one screen, shown finished. */}
      <div
        ref={trackRef}
        className="relative"
        style={{ height: reduced ? "100svh" : size.h + at.distance }}
      >
        <div
          ref={stageRef}
          className="sticky top-0 h-[100svh] w-full overflow-hidden"
        >
          <div className="sx-bg absolute inset-0">
            <Image
              src={MEDIA.background}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
          </div>

          {/* The card. Laid out at full size - the stage's width, centred -
              and scaled; its children measure in cqw of it. */}
          <motion.div
            className="sx-card absolute inset-x-0 overflow-hidden bg-[#0d0d0c] text-[#f5f5f5] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)]"
            style={{
              top: (size.h - at.cardH) / 2,
              height: at.cardH,
              y: cardY,
              scale: cardScale,
              containerType: "inline-size",
            }}
          >
            {/* Its surface: the site's backdrop (--site-bg, set by the public
                layout), one screen in size and centred on the screen - its
                move and scale are the card's own, undone. */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-0 w-full"
              style={{
                top: (at.cardH - size.h) / 2,
                height: size.h,
                y: surfaceY,
                scale: surfaceScale,
                background:
                  "var(--site-bg, none) center / cover no-repeat, #0d0d0c",
              }}
            />
            <motion.h2
              className="absolute inset-x-[1.4cqw] top-[1.4cqw] m-0"
              style={{ opacity: intro }}
            >
              <span className="sr-only">{COPY.tenets}</span>
              {/* Stretched to the card's width, as the reference's title
                  artwork is: sized to its proportions (85 tall for 440
                  wide), then widened to fill. */}
              <span
                aria-hidden
                className="block origin-left whitespace-nowrap uppercase leading-[0.9]"
                style={{
                  fontFamily: "var(--font-gilda), Georgia, serif",
                  fontSize: `${TITLE_EM}cqw`,
                  transform: `scaleX(${TITLE_STRETCH})`,
                }}
              >
                {COPY.tenets}
              </span>
            </motion.h2>

            <motion.p
              className={
                wide
                  ? "absolute inset-x-[8.3cqw] bottom-[4.2cqw] m-0 text-center text-[2.4cqw] font-medium leading-[1.25] text-[#b4b4b4]"
                  : "absolute inset-x-[7cqw] bottom-[6cqw] m-0 text-center text-[20px] font-medium leading-[1.25] text-[#b4b4b4]"
              }
              style={{
                scale: introScale,
                opacity: intro,
                transformOrigin: "50% 100%",
                fontFamily: "var(--font-archivo), sans-serif",
              }}
            >
              {COPY.intro}
            </motion.p>

            {/* The photo's frame, 3:2, in the middle of the card. */}
            <div
              className={
                wide
                  ? "absolute left-1/2 top-1/2 aspect-[3/2] w-[50cqw] -translate-x-1/2 -translate-y-1/2"
                  : "absolute left-1/2 top-1/2 aspect-[3/2] w-[88cqw] -translate-x-1/2 -translate-y-1/2"
              }
            >
              <motion.div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath, scale: zoom }}
              >
                <Image
                  src={MEDIA.src}
                  alt=""
                  fill
                  sizes={wide ? "50vw" : "90vw"}
                  className="object-cover"
                  draggable={false}
                />
              </motion.div>

              {/* Desktop: hangs off the frame's left edge, overlapping it by
                  1em. Narrow: sits on top of the frame. */}
              <motion.h3
                className={
                  wide
                    ? "absolute right-[calc(100%-1em)] top-0 m-0 whitespace-nowrap text-[7.6cqw] font-normal"
                    : "absolute bottom-[calc(100%+2cqw)] left-0 m-0 whitespace-nowrap text-[clamp(40px,12cqw,84px)] font-normal"
                }
                style={{ opacity: content }}
              >
                <span
                  className={`${script.className} relative -mt-[0.55em] block text-[0.87em] leading-none text-[#9a9a9a]`}
                >
                  {COPY.subtitle}
                </span>{" "}
                <span
                  className="block pl-[0.7em] text-[0.72em] uppercase leading-none tracking-[0.02em]"
                  style={{
                    fontFamily: "var(--font-gilda), Georgia, serif",
                    paddingTop: wide ? "0.4cqw" : "0.5cqw",
                  }}
                >
                  {COPY.title}
                </span>
              </motion.h3>

              {/* Desktop: a narrow column beside the frame's right edge,
                  level with its foot. Narrow: under the frame. */}
              <motion.p
                className={
                  wide
                    ? "absolute bottom-0 left-[calc(100%+1.6cqw)] m-0 w-[10.6cqw] min-w-[140px] text-[clamp(11px,0.8cqw,16px)] leading-[1.35] text-[#bdbdbd]"
                    : "absolute left-0 right-0 top-[calc(100%+4cqw)] m-0 text-[clamp(13px,3.6cqw,17px)] leading-[1.45] text-[#bdbdbd]"
                }
                style={{
                  opacity: content,
                  fontFamily: "var(--font-archivo), sans-serif",
                }}
              >
                {COPY.text}
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

"use client";

import "./cinematic-story.css";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";
import { STORY_SCENES } from "./cinematicStory";

export interface StoryPanel {
  image: string;
  alt?: string;
  title: string;
  subtitle?: string;
  /** CSS object-position, e.g. "50% 30%". */
  focus?: string;
}

export type StoryScene =
  | { kind: "intro"; eyebrow?: string; text: string; cta?: string }
  | { kind: "pair"; panels: [StoryPanel, StoryPanel] }
  | { kind: "trio"; panels: [StoryPanel, StoryPanel, StoryPanel] }
  | {
      kind: "feature";
      panels: [StoryPanel, StoryPanel];
      link?: { label: string; href: string };
    };

type Motion = "full" | "reduced" | "off";
type Direction = 1 | -1;
type SceneState = "current" | "enter" | "leave" | "hidden";

interface View {
  idx: number;
  /** The scene on its way out while a change runs. */
  from: number | null;
  dir: Direction;
  /** Replaying the current scene's entrance with nothing leaving: arriving
      back from the section below. */
  entering?: boolean;
}

/** One scene change, ms. Every stage of the choreography is a share of it. */
const DURATION = 1300;
/**
 * When the last thing lands (the last title: starts at 58% + two staggers,
 * runs 34%), plus a frame or two. Input is locked until then.
 */
const SETTLE = Math.round(DURATION * 0.92) + 2 * 80 + 40;
const REDUCED_MS = 380;
/** A pause this long between wheel events ends one gesture. */
const GESTURE_GAP_MS = 180;
const SWIPE_MIN_PX = 40;
/**
 * The hand-off to/from the section below (one that opts in with
 * data-cinematic-entry): the page is driven one screen in this long, easing
 * in and out, while that section plays its entrance on the story's timings.
 */
const HANDOFF_MS = Math.round(DURATION * 0.75);

/** Drive the page to `to` over `ms`, easing in and out. Returns a cancel. */
function tweenScroll(to: number, ms: number, done?: () => void) {
  const from = window.scrollY;
  const start = performance.now();
  const ease = (p: number) =>
    p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  let raf = 0;
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / ms);
    window.scrollTo(0, from + (to - from) * ease(p));
    if (p < 1) raf = requestAnimationFrame(tick);
    else done?.();
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/** Rendered widths per layout slot, for the optimizer. */
const SIZES: Record<Exclude<StoryScene["kind"], "intro">, string[]> = {
  pair: ["(max-width: 700px) 100vw, 50vw", "(max-width: 700px) 100vw, 50vw"],
  trio: ["100vw", "50vw", "50vw"],
  feature: ["(max-width: 700px) 100vw, 50vw", "50vw"],
};

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
const pad = (n: number) => String(n).padStart(2, "0");

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

function isEditable(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return (
    !!el &&
    (el.isContentEditable ||
      /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) ||
      !!el.closest("[role='dialog']"))
  );
}

/**
 * Full-screen story section after the scroll choreography of
 * stockphotographynepal.com: a pinned stage of scenes, one scroll gesture per
 * scene. On each change the current composition accelerates out of frame
 * while the next one's photos rise in as narrow masked windows that open to
 * their full panels, staggered, settling from a slight zoom; titles rise
 * last behind their own masks. Upward reverses all of it.
 *
 * The section is N screens tall with a sticky stage, and the page's scroll
 * position is kept on the scene being shown - so the scrollbar, find-in-page
 * and plain native scrolling keep working, and at the first/last scene a
 * scroll outward simply carries on down (or up) the page.
 */
export function CinematicStory({
  scenes = STORY_SCENES,
}: {
  scenes?: StoryScene[];
}) {
  const count = scenes.length;
  const { settings } = useSite();
  const reduced = usePrefersReducedMotion();
  const motion: Motion = !settings.animationsEnabled
    ? "off"
    : reduced
      ? "reduced"
      : "full";
  const lockMs =
    motion === "full" ? SETTLE : motion === "reduced" ? REDUCED_MS : 0;

  const [view, setView] = useState<View>({ idx: 0, from: null, dir: 1 });
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef(0);
  const locked = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const gesture = useRef({ lastT: 0, lastAbs: 0, used: false });
  const touch = useRef<{ y: number; engaged: boolean; used: boolean } | null>(
    null,
  );

  /** Height of one scene's worth of scroll: the stage's own height. */
  const stageHeight = () =>
    stageRef.current?.offsetHeight || window.innerHeight;

  /** True while the stage is pinned, i.e. the section fills the screen. */
  const engaged = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return false;
    const r = section.getBoundingClientRect();
    return r.top <= 1 && r.bottom >= stageHeight() - 1;
  }, []);

  /** The scene the page's scroll position points at. */
  const sceneFromScroll = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return 0;
    const top = section.getBoundingClientRect().top;
    return clamp(Math.round(-top / stageHeight()), 0, count - 1);
  }, [count]);

  /** Put the page's scroll position on scene i; the stage is sticky, so this
      moves nothing on screen - it keeps scroll and scene in step. */
  const alignScroll = useCallback((i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + i * stageHeight(), behavior: "instant" });
  }, []);

  const syncRef = useRef<() => void>(() => {});

  /** Play the change to scene `to`. Returns false if there is nothing to do. */
  const go = useCallback(
    (to: number) => {
      const from = idxRef.current;
      if (to === from || to < 0 || to >= count) return false;
      locked.current = true;
      idxRef.current = to;
      setView({ idx: to, from, dir: to > from ? 1 : -1 });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        locked.current = false;
        setView((v) => ({ ...v, from: null }));
        // Native scrolling may have moved on while we were locked.
        syncRef.current();
      }, lockMs);
      return true;
    },
    [count, lockMs],
  );

  /** Follow native scrolling: scrollbar drags, reduced motion, keyboard Home
      / End, find-in-page. Off screen, jump silently so the scene you scroll
      back into is already the right one. */
  const sync = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const want = sceneFromScroll();
    const r = section.getBoundingClientRect();
    const onScreen = r.bottom > 0 && r.top < window.innerHeight;
    if (!onScreen) {
      if (want !== idxRef.current && !locked.current) {
        idxRef.current = want;
        setView({ idx: want, from: null, dir: 1 });
      }
      return;
    }
    if (!locked.current && want !== idxRef.current) go(want);
  }, [go, sceneFromScroll]);
  syncRef.current = sync;

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sync]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /** A gesture asks to move one scene. Handled -> true (caller cancels the
      native scroll); at the first/last scene -> false, the page scrolls on. */
  const step = useCallback(
    (dir: Direction) => {
      const to = idxRef.current + dir;
      if (to < 0 || to >= count) return false;
      alignScroll(to);
      go(to);
      return true;
    },
    [alignScroll, count, go],
  );

  // ── hand-off to the section below ──────────────────────────────────
  // Past the last scene, instead of letting the page scroll on, drive it one
  // screen down to the next section - if that section opts in with
  // data-cinematic-entry - and tell it to play its entrance. The feature
  // scene leaves upward as the page moves; the next one rises in.
  const tween = useRef<(() => void) | null>(null);
  useEffect(() => () => tween.current?.(), []);

  const nextSection = () => {
    const next = sectionRef.current?.nextElementSibling as HTMLElement | null;
    return next?.hasAttribute("data-cinematic-entry") ? next : null;
  };

  const handoffDown = useCallback(() => {
    const next = nextSection();
    if (!next || idxRef.current !== count - 1) return false;
    locked.current = true;
    next.dispatchEvent(new CustomEvent("cinematic:enter"));
    tween.current?.();
    tween.current = tweenScroll(
      next.getBoundingClientRect().top + window.scrollY,
      HANDOFF_MS,
      () => {
        locked.current = false;
      },
    );
    return true;
  }, [count]);

  // And back: the section below asks to return (scrolling up from its start).
  // Drive the page back onto the last scene and replay that scene's entrance,
  // coming down from above.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || motion !== "full") return;
    const onReturn = () => {
      if (locked.current) return;
      const last = count - 1;
      locked.current = true;
      idxRef.current = last;
      setView({ idx: last, from: null, dir: -1, entering: true });
      tween.current?.();
      tween.current = tweenScroll(
        section.getBoundingClientRect().top +
          window.scrollY +
          last * stageHeight(),
        HANDOFF_MS,
      );
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        locked.current = false;
        setView((v) => ({ ...v, entering: false }));
      }, SETTLE);
    };
    section.addEventListener("cinematic:return", onReturn);
    return () => section.removeEventListener("cinematic:return", onReturn);
  }, [count, motion]);

  // Wheel and trackpad. One physical gesture is a stream of events: it ends
  // after a short pause, or when a fresh swipe re-accelerates out of a
  // decaying momentum tail. Each gesture may move at most one scene.
  useEffect(() => {
    if (motion !== "full") return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const abs = Math.abs(e.deltaY) * unit;
      if (abs === 0 || Math.abs(e.deltaX) * unit > abs) return;

      const g = gesture.current;
      const now = performance.now();
      const fresh =
        now - g.lastT > GESTURE_GAP_MS ||
        (g.used && !locked.current && abs >= 20 && abs > g.lastAbs * 2.5);
      g.lastT = now;
      g.lastAbs = abs;
      if (fresh) g.used = false;

      if (!engaged()) {
        // Began on the page above/below: once it carries into the stage,
        // its leftover momentum must not also skip the first scene.
        g.used = true;
        return;
      }
      if (locked.current || g.used) {
        e.preventDefault();
        return;
      }
      const dir: Direction = e.deltaY > 0 ? 1 : -1;
      if (step(dir) || (dir === 1 && handoffDown())) {
        e.preventDefault();
        g.used = true;
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [engaged, handoffDown, motion, step]);

  // Touch: one swipe, one scene; at the ends the page scrolls on natively.
  useEffect(() => {
    if (motion !== "full") return;
    const onStart = (e: TouchEvent) => {
      touch.current = {
        y: e.touches[0].clientY,
        engaged: engaged(),
        used: false,
      };
    };
    const onMove = (e: TouchEvent) => {
      const t = touch.current;
      if (!t || !t.engaged || e.touches.length > 1) return;
      const dy = t.y - e.touches[0].clientY;
      if (Math.abs(dy) < 6) return;
      const dir: Direction = dy > 0 ? 1 : -1;
      if (locked.current || t.used) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      const to = idxRef.current + dir;
      const handoff = to >= count && dir === 1 && !!nextSection();
      if ((to < 0 || to >= count) && !handoff) return; // page scrolls on
      if (e.cancelable) e.preventDefault();
      if (Math.abs(dy) >= SWIPE_MIN_PX) {
        t.used = true;
        if (handoff) handoffDown();
        else step(dir);
      }
    };
    const onEnd = () => {
      touch.current = null;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [count, engaged, motion, step]);

  // Keyboard: arrows, Page Up/Down and Space step scenes while pinned.
  useEffect(() => {
    if (motion !== "full") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (isEditable(e.target) || !engaged()) return;
      let dir: Direction | 0 = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown") dir = 1;
      else if (e.key === "ArrowUp" || e.key === "PageUp") dir = -1;
      else if (e.key === " ") {
        // Space on a focused control is that control's own business.
        if ((e.target as HTMLElement)?.closest?.("a, button")) return;
        dir = e.shiftKey ? -1 : 1;
      }
      if (!dir) return;
      if (locked.current) {
        e.preventDefault();
        return;
      }
      if (step(dir)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [engaged, motion, step]);

  if (!count) return null;

  const stateOf = (i: number): SceneState =>
    view.from === i
      ? "leave"
      : i === view.idx
        ? view.from !== null
          ? "enter"
          : "current"
        : "hidden";

  return (
    <section
      ref={sectionRef}
      className="story"
      style={
        {
          "--story-n": count,
          "--story-d": `${DURATION}ms`,
        } as CSSProperties
      }
      data-dir={view.dir === 1 ? "down" : "up"}
      data-motion={motion}
      aria-label="Selected work"
    >
      <div ref={stageRef} className="story-stage">
        {scenes.map((scene, i) => {
          const state = stateOf(i);
          const live = state === "current" || state === "enter";
          return (
            <div
              key={i}
              className={`story-scene story-scene--${scene.kind}`}
              data-state={state}
              aria-hidden={!live || undefined}
              inert={!live || undefined}
            >
              {scene.kind === "intro" ? (
                <Intro
                  scene={scene}
                  onNext={() => {
                    if (!locked.current) step(1);
                  }}
                />
              ) : (
                <>
                  {scene.panels.map((panel, p) => (
                    <figure
                      key={p}
                      className="story-panel"
                      style={{ "--i": p } as CSSProperties}
                    >
                      <div className="story-pic">
                        <Image
                          src={panel.image}
                          alt={panel.alt ?? ""}
                          fill
                          sizes={SIZES[scene.kind][p]}
                          quality={90}
                          className="story-img"
                          style={
                            panel.focus
                              ? { objectPosition: panel.focus }
                              : undefined
                          }
                        />
                      </div>
                      <figcaption className="story-cap">
                        <span className="story-mask">
                          <span className="story-title">{panel.title}</span>
                        </span>
                        {panel.subtitle && (
                          <span className="story-mask">
                            <span className="story-sub">{panel.subtitle}</span>
                          </span>
                        )}
                      </figcaption>
                    </figure>
                  ))}
                  {scene.kind === "feature" && scene.link && (
                    <div
                      className="story-panel story-panel--link"
                      style={{ "--i": 2 } as CSSProperties}
                    >
                      <span className="story-mask">
                        <Link href={scene.link.href} className="story-link">
                          {scene.link.label}
                          <ArrowRight aria-hidden="true" strokeWidth={1.5} />
                        </Link>
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        <p className="story-count" aria-hidden="true">
          {pad(view.idx + 1)} <span>/</span> {pad(count)}
        </p>
        <span className="story-cue" aria-hidden="true">
          Scroll
        </span>
      </div>
    </section>
  );
}

function Intro({
  scene,
  onNext,
}: {
  scene: Extract<StoryScene, { kind: "intro" }>;
  onNext: () => void;
}) {
  return (
    <div className="story-intro">
      {scene.eyebrow && (
        <span className="story-mask" style={{ "--i": 0 } as CSSProperties}>
          <span className="story-rise story-eyebrow">{scene.eyebrow}</span>
        </span>
      )}
      <span className="story-mask" style={{ "--i": 1 } as CSSProperties}>
        <p className="story-rise story-lede">{scene.text}</p>
      </span>
      {scene.cta && (
        <span className="story-mask" style={{ "--i": 2 } as CSSProperties}>
          <button
            type="button"
            className="story-rise story-cta"
            onClick={onNext}
          >
            {scene.cta}
            <ArrowDownRight aria-hidden="true" strokeWidth={1.5} />
          </button>
        </span>
      )}
    </div>
  );
}

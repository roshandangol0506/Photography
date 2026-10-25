"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/* ── the preloader ───────────────────────────────────────────────
 * A hairline along the bottom edge that sweeps left to right, with the
 * percentage riding at its tip, as on the reference. The bar and the
 * number are written straight to the DOM from one rAF loop, so a frame
 * of progress never costs a React render.
 *
 * The progress is real: each hero photo, the site backdrop and the
 * fonts count as one step, and a failed request counts as done, so a
 * broken photo can't strand it. Two limits shape what's shown:
 *
 * - It never runs ahead of the clock (SWEEP_MS for 0 → 100), so a warm
 *   cache still reads as a deliberate sweep rather than a flash.
 * - It never waits past MAX_WAIT_MS, so a request that hangs without
 *   ever failing can't hold the page back either.
 * ─────────────────────────────────────────────────────────────── */

/** Shortest possible sweep from 0 to 100. */
const SWEEP_MS = 1500;
/** Past this the loader finishes, whatever is still in flight. */
const MAX_WAIT_MS = 7000;
/** Seconds the shown progress takes to settle on the real one. */
const SMOOTHING = 0.18;
/** Rest on 100% for a beat before letting go. */
const HOLD_MS = 220;
/**
 * Seconds the panel takes to fade off the hero. Eased out, so it thins
 * quickly and the entrance, which starts with it, is seen from its first
 * moments: the cluster of photos shows through as the panel dissolves.
 */
const FADE_S = 0.8;
const FADE_EASE = [0.22, 1, 0.36, 1] as const;

/** The site backdrop, as the public layout sets it on `.site-backdrop`. */
function backdropSrc() {
  const el = document.querySelector(".site-backdrop");
  const bg = el && getComputedStyle(el).getPropertyValue("--site-bg");
  return bg?.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
}

/** Keys that scroll the page, held off while the loader is up. */
const SCROLL_KEYS = new Set([
  " ",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

export type HeroLoaderProps = {
  /** Image URLs the hero can't open without. */
  assets: string[];
  /** Called once, as the panel starts to fade: the cue for the entrance. */
  onReveal: () => void;
};

export function HeroLoader({ assets, onReveal }: HeroLoaderProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  // Read through a ref, so a new callback identity never restarts the load.
  const reveal = useRef(onReveal);
  useEffect(() => {
    reveal.current = onReveal;
  });
  const [sources] = useState(assets);

  useEffect(() => {
    // Reduced motion: no sweep, no fade. The hero is simply there.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal.current();
      setGone(true);
      return;
    }

    // Wheel, touch and keys rather than overflow: hidden, which drops the
    // scrollbar and would resize the corridor the moment it came back.
    const block = (e: Event) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key)) e.preventDefault();
    };
    const opts = { passive: false } as const;
    window.addEventListener("wheel", block, opts);
    window.addEventListener("touchmove", block, opts);
    window.addEventListener("keydown", blockKeys);
    const unblock = () => {
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
    };

    // Same URLs as the cards, so these fill the cache the cards read from.
    const urls = [...sources, backdropSrc()].filter(Boolean) as string[];
    const total = urls.length + 1;
    let loaded = 0;
    const step = () => {
      loaded++;
    };
    const imgs = urls.map((src) => {
      const img = new Image();
      img.onload = img.onerror = step;
      img.src = src;
      return img;
    });
    document.fonts.ready.then(step, step);

    let raf = 0;
    let hold = 0;
    let shown = 0;
    let last = performance.now();
    const t0 = last;
    const frame = (now: number) => {
      const elapsed = now - t0;
      const real = elapsed >= MAX_WAIT_MS ? 1 : loaded / total;
      const target = Math.min(real, elapsed / SWEEP_MS, 1);
      // Frame-rate independent ease toward the target: quick on a big
      // jump, soft as it closes in.
      const dt = (now - last) / 1000;
      last = now;
      shown += (target - shown) * (1 - Math.exp(-dt / SMOOTHING));
      if (target === 1 && shown > 0.998) shown = 1;

      const pct = Math.round(shown * 100);
      if (barRef.current) {
        barRef.current.style.transform = `translateX(${(shown - 1) * 100}%)`;
      }
      if (numRef.current) {
        numRef.current.textContent = `${pct}%`;
        // Rides the tip, but never slides off the left edge at 0%.
        numRef.current.style.left = `max(${shown * 100}%, 3rem)`;
      }

      if (shown < 1) {
        raf = requestAnimationFrame(frame);
        return;
      }
      hold = window.setTimeout(() => {
        unblock();
        setLeaving(true);
        reveal.current();
      }, HOLD_MS);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hold);
      unblock();
      for (const img of imgs) img.onload = img.onerror = null;
    };
  }, [sources]);

  if (gone) return null;

  return (
    <motion.div
      aria-hidden
      data-hero-loader
      // Above the navbar (z-90) and the chat widget (z-100).
      className="fixed inset-0 z-[110] overflow-hidden bg-[#0d0d0c]"
      initial={false}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: FADE_S, ease: FADE_EASE }}
      onAnimationComplete={() => leaving && setGone(true)}
      style={{ pointerEvents: leaving ? "none" : "auto" }}
    >
      <div className="absolute inset-x-0 bottom-0 h-[3px]">
        <div
          ref={barRef}
          className="h-full w-full"
          style={{
            transform: "translateX(-100%)",
            background:
              "linear-gradient(90deg, rgba(248,244,244,0.04), rgba(248,244,244,0.6))",
          }}
        />
        <span
          ref={numRef}
          className="absolute bottom-4 -translate-x-full pr-1.5 font-(family-name:--font-archivo) text-xs tabular-nums tracking-wide text-md-light/60"
          style={{ left: "3rem" }}
        >
          0%
        </span>
      </div>
    </motion.div>
  );
}

/**
 * Horizontal flow between stacked sections.
 *
 * Neighbouring page sections that carry `data-hflow` are linked: instead of
 * scrolling down to the next one, it slides in from the right while the
 * current one slides out to the left (and the other way round going back).
 *
 * The sections stay stacked in the document; the slide is a visual stand-in.
 * The incoming section is lifted up into the viewport (translateY by the
 * distance between the two) and both slide horizontally. On the last frame
 * the page's scroll position jumps to the incoming section and both
 * transforms are dropped in the same frame - which describes exactly the
 * same picture, so nothing moves. Afterwards the page really is at the new
 * section, and scrollbars, anchors and its own scroll effects carry on.
 *
 * While it runs, and until the gesture that started it has died away, wheel,
 * touch and scrolling keys are swallowed so momentum can't run on into the
 * next section's own scrolling.
 */

/** Length of the slide - the cinematic slider's own step. */
export const HFLOW_MS = 1100;
/** The slider's travel curve: under way at once, a long soft landing. */
export const HFLOW_EASE = "cubic-bezier(0.3, 0.4, 0.1, 1)";
/** A pause this long between input events ends the gesture. */
const QUIET_MS = 180;

const SCROLL_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "ArrowLeft",
  "ArrowRight",
  "PageDown",
  "PageUp",
  " ",
  "Home",
  "End",
]);

export interface HflowEnterDetail {
  /** 1: arriving from the right (going forward); -1: from the left. */
  from: 1 | -1;
}

let running = false;

/** True while a slide is in progress. */
export const hflowBusy = () => running;

/** The linked section after (dir 1) or before (dir -1) `el`, if any. */
export function hflowNeighbour(el: HTMLElement | null, dir: 1 | -1) {
  const next = (
    dir === 1 ? el?.nextElementSibling : el?.previousElementSibling
  ) as HTMLElement | null;
  return next?.hasAttribute("data-hflow") ? next : null;
}

/** Swallow scrolling input until released and then quiet for QUIET_MS. */
function holdInput() {
  let releasing = false;
  let timer: number | undefined;
  const opts = { capture: true, passive: false } as const;
  const stop = () => {
    window.removeEventListener("wheel", block, opts);
    window.removeEventListener("touchmove", block, opts);
    window.removeEventListener("keydown", keys, opts);
  };
  const rearm = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(stop, QUIET_MS);
  };
  function block(e: Event) {
    if (e.cancelable) e.preventDefault();
    // Capture on window runs before every other listener; stopping here keeps
    // the sections' own handlers from acting on the leftover gesture.
    e.stopImmediatePropagation();
    if (releasing) rearm();
  }
  function keys(e: KeyboardEvent) {
    if (SCROLL_KEYS.has(e.key)) block(e);
  }
  window.addEventListener("wheel", block, opts);
  window.addEventListener("touchmove", block, opts);
  window.addEventListener("keydown", keys, opts);
  return () => {
    releasing = true;
    rearm();
  };
}

/**
 * Slide from `from` (on screen, top at the top of the viewport) to `to`.
 * Fires "hflow:enter" on `to` as it starts, with HflowEnterDetail plus any
 * `detail` given. Returns false if a slide is already running.
 */
export function hflowSlide(
  from: HTMLElement,
  to: HTMLElement,
  detail: Record<string, unknown> = {},
) {
  if (running) return false;
  running = true;

  const dy = to.getBoundingClientRect().top - from.getBoundingClientRect().top;
  const dir: 1 | -1 = dy > 0 ? 1 : -1;
  const release = holdInput();

  // Clip, don't scroll: the off-screen half of the slide must not add a
  // horizontal scrollbar (and clip, unlike hidden, keeps sticky working).
  const root = document.documentElement;
  const overflowX = root.style.overflowX;
  root.style.overflowX = "clip";

  to.dispatchEvent(
    new CustomEvent<HflowEnterDetail>("hflow:enter", {
      detail: { from: dir, ...detail },
    }),
  );

  // When the page's scroll position moves to `to`: at the end by default, or
  // at the start if `to` draws itself from the scroll position
  // (data-hflow-scroll) - then it is in its true state for the whole slide
  // and nothing re-draws at the swap. Whichever section is not at the page's
  // scroll position is held in view by the vertical part of its transform.
  const early = to.hasAttribute("data-hflow-scroll");
  if (early) window.scrollTo(0, window.scrollY + dy);
  const fromY = early ? dy : 0;
  const toY = early ? 0 : -dy;

  const timing = { duration: HFLOW_MS, easing: HFLOW_EASE, fill: "forwards" as const };
  const out = from.animate(
    [
      { transform: `translate3d(0, ${fromY}px, 0)` },
      { transform: `translate3d(${-dir * 100}vw, ${fromY}px, 0)` },
    ],
    timing,
  );
  const into = to.animate(
    [
      { transform: `translate3d(${dir * 100}vw, ${toY}px, 0)` },
      { transform: `translate3d(0, ${toY}px, 0)` },
    ],
    timing,
  );

  into.finished
    .catch(() => {})
    .then(() => {
      // Same frame: move the page to `to` (if not already) and drop both
      // transforms - the same picture, so nothing moves.
      if (!early) window.scrollTo(0, window.scrollY + dy);
      out.cancel();
      into.cancel();
      root.style.overflowX = overflowX;
      running = false;
      release();
    });
  return true;
}

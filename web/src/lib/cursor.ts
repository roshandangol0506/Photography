/**
 * Shared state for the site's custom cursor (components/public/cursor).
 *
 * Which cursor shows is decided by the page itself: the nearest ancestor of
 * the element under the pointer that carries `data-pointer` sets the state.
 *
 *   data-pointer="view"     the expanded circle reading "View project"
 *   data-pointer="click"    the expanded circle reading "Click me"
 *   data-pointer="hide"     no custom cursor: the area draws its own
 *   data-pointer="default"  back to the plain ring inside one of the above
 *
 * Links and buttons get a slightly wider ring on their own, and text fields
 * keep the system caret.
 *
 * The tone - how far the ring has darkened - is pushed in every frame by
 * whatever is darkening it (the Venom button's goo). Reads are by polling
 * from the cursor's own animation frame, so nothing re-renders.
 */

export type PointerMode = "view" | "click" | "hide" | "default";

/** Hold a tone this long without a fresh value, then fade back to none. */
const TONE_TTL_MS = 200;

let tone = 0;
let toneAt = 0;

/** How dark the ring should be, 0 (white) to 1 (black). Call every frame. */
export function setCursorTone(value: number) {
  tone = Math.min(1, Math.max(0, value));
  toneAt = performance.now();
}

/** The tone to aim for now: the last one pushed, or none once it is stale. */
export function cursorToneTarget(now = performance.now()) {
  return now - toneAt > TONE_TTL_MS ? 0 : tone;
}

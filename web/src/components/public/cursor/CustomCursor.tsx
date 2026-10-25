"use client";

import "./custom-cursor.css";

import { useEffect, useRef } from "react";
import { cursorToneTarget, type PointerMode } from "@/lib/cursor";

/** Labels for the expanded circle, by data-pointer value. */
const LABELS: Partial<Record<PointerMode, string>> = {
  view: "View project",
  click: "Click me",
};

/**
 * What decides the state, nearest first. `.cine-zone` is the cinematic
 * slider, which draws its own cursor ring; text fields keep the caret.
 */
const REGION =
  '[data-pointer], .cine-zone, input, textarea, select, [contenteditable="true"], a[href], button, [role="button"], label, summary';
const EDITABLE = 'input, textarea, select, [contenteditable="true"]';

/** Time constants of the follow, ms: the dot is all but on the pointer, the ring trails. */
const DOT_MS = 28;
const RING_MS = 95;
const TONE_MS = 120;
/** Re-check what is under a still pointer this often - sections slide under it. */
const RECHECK_MS = 180;

type Mode = PointerMode | "link";

function modeOf(el: Element | null): Mode {
  const region = el?.closest?.(REGION);
  if (!region) return "default";
  const pointer = region.getAttribute("data-pointer");
  if (pointer) return pointer as PointerMode;
  if (region.matches(".cine-zone") || region.matches(EDITABLE)) return "hide";
  return "link";
}

/**
 * The site's cursor: a white ring with a red centre that follows the mouse,
 * opening into a labelled red circle over areas marked data-pointer (see
 * lib/cursor). One instance for the whole site, mounted in the public
 * layout.
 *
 * Only for a real mouse: on touch screens nothing is drawn and the system
 * cursor is left alone. Position and tone are written straight to the DOM
 * from one animation frame loop, so moving the mouse never re-renders.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop = () => {};

    const run = () => {
      const root = rootRef.current;
      const ring = ringRef.current;
      const dot = dotRef.current;
      const label = labelRef.current;
      if (!root || !ring || !dot || !label) return () => {};
      document.documentElement.classList.add("cc-on");

      const p = { x: -100, y: -100, seen: false };
      const dotAt = { x: -100, y: -100 };
      const ringAt = { x: -100, y: -100 };
      let tone = 0;
      let mode: Mode = "default";
      let raf = 0;
      let last = performance.now();

      const setMode = (next: Mode) => {
        if (next === mode) return;
        mode = next;
        root.dataset.mode = next;
        const text = LABELS[next as PointerMode];
        // Keep the last label while the circle closes, so it fades out
        // rather than going blank first.
        if (text) label.textContent = text;
      };
      const resolve = () => {
        if (p.seen) setMode(modeOf(document.elementFromPoint(p.x, p.y)));
      };

      const frame = (now: number) => {
        const dt = Math.min(64, now - last);
        last = now;
        const k = (ms: number) => (still.matches ? 1 : 1 - Math.exp(-dt / ms));
        dotAt.x += (p.x - dotAt.x) * k(DOT_MS);
        dotAt.y += (p.y - dotAt.y) * k(DOT_MS);
        ringAt.x += (p.x - ringAt.x) * k(RING_MS);
        ringAt.y += (p.y - ringAt.y) * k(RING_MS);
        tone += (cursorToneTarget(now) - tone) * k(TONE_MS);
        dot.style.transform = `translate3d(${dotAt.x}px, ${dotAt.y}px, 0)`;
        ring.style.transform = `translate3d(${ringAt.x}px, ${ringAt.y}px, 0)`;
        root.style.setProperty("--tone", tone.toFixed(3));
        raf = requestAnimationFrame(frame);
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        p.x = e.clientX;
        p.y = e.clientY;
        if (!p.seen) {
          // First sighting: start on the pointer rather than gliding in
          // from a corner.
          p.seen = true;
          dotAt.x = ringAt.x = p.x;
          dotAt.y = ringAt.y = p.y;
          root.dataset.shown = "true";
        }
        setMode(modeOf(e.target as Element));
      };
      const onDown = (e: PointerEvent) => {
        if (e.pointerType === "mouse") root.dataset.pressed = "true";
      };
      const onUp = () => {
        root.dataset.pressed = "false";
      };
      const onLeave = () => {
        p.seen = false;
        root.dataset.shown = "false";
      };
      // Scrolling moves the page under a still pointer.
      let scrollRaf = 0;
      const onScroll = () => {
        cancelAnimationFrame(scrollRaf);
        scrollRaf = requestAnimationFrame(resolve);
      };
      const recheck = window.setInterval(resolve, RECHECK_MS);

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("blur", onLeave);
      document.documentElement.addEventListener("mouseleave", onLeave);
      raf = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(raf);
        cancelAnimationFrame(scrollRaf);
        window.clearInterval(recheck);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("blur", onLeave);
        document.documentElement.removeEventListener("mouseleave", onLeave);
        document.documentElement.classList.remove("cc-on");
        root.dataset.shown = "false";
      };
    };

    // A mouse can come and go (a tablet with a trackpad), so follow it.
    const sync = () => {
      stop();
      stop = fine.matches ? run() : () => {};
    };
    sync();
    fine.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="cc"
      data-mode="default"
      data-shown="false"
      data-pressed="false"
      aria-hidden="true"
    >
      <div ref={ringRef} className="cc-pos">
        <div className="cc-ring" />
      </div>
      <div ref={dotRef} className="cc-pos">
        <div className="cc-dot" />
        <span ref={labelRef} className="cc-label" />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  HFLOW_EASE,
  hflowBusy,
  hflowNeighbour,
  hflowSlide,
} from "@/lib/hflow";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** How far out (in vw) the items start, beyond the section's own slide. */
const ITEM_OFFSET_VW = 45;
/** Each item's slide; the first starts ITEM_DELAY_MS into the section's. */
const ITEM_MS = 1000;
const ITEM_DELAY_MS = 120;
/** Extra delay per item (its `--i`). */
const ITEM_STAGGER_MS = 70;
/** A pause this long between wheel events ends one gesture. */
const GESTURE_GAP_MS = 180;

/**
 * Puts any section into the page's horizontal flow (lib/hflow), for sections
 * that have no flow handling of their own - here the hero gallery.
 *
 * - It slides in sideways from the linked section before it. Children marked
 *   `.flow-item` (with a `--i` index) follow in from the same side, starting
 *   further out and staggered, so they land a beat after the section - the
 *   cinematic slider strip's layered feel.
 * - A fresh scroll up while it sits at the top of the screen slides the
 *   linked section before it back in from the left. Anywhere further down,
 *   scrolling is the section's own business and stays native.
 */
export function FlowPanel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onEnter = (e: Event) => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const side = (e as CustomEvent<{ from: 1 | -1 }>).detail?.from ?? 1;
      for (const item of el.querySelectorAll<HTMLElement>(".flow-item")) {
        const i = Number(item.style.getPropertyValue("--i")) || 0;
        // Added to the item's own translate rather than replacing it: the
        // gallery cells' scroll effect sets translate and transform inline,
        // and an animation of either would override it until it ended.
        item.animate(
          [
            { translate: `${side * ITEM_OFFSET_VW}vw 0` },
            { translate: "0 0" },
          ],
          {
            duration: ITEM_MS,
            delay: ITEM_DELAY_MS + i * ITEM_STAGGER_MS,
            easing: HFLOW_EASE,
            fill: "backwards",
            composite: "add",
          },
        );
      }
    };
    el.addEventListener("hflow:enter", onEnter);
    return () => el.removeEventListener("hflow:enter", onEnter);
  }, []);

  // Back to the section before: only a gesture that *starts* with this panel
  // parked at the top, so scrolling up through the gallery doesn't fly
  // straight past its top into the slider.
  useEffect(() => {
    if (reduced) return;
    const g = { lastT: 0, used: false };
    const atTop = () => {
      const top = ref.current?.getBoundingClientRect().top;
      return top !== undefined && Math.abs(top) <= 2;
    };
    const back = () => {
      const here = ref.current;
      const prev = hflowNeighbour(here, -1);
      return !!here && !!prev && hflowSlide(here, prev);
    };
    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      if (now - g.lastT > GESTURE_GAP_MS) g.used = false;
      g.lastT = now;
      if (!atTop()) {
        g.used = true;
        return;
      }
      if (e.deltaY >= 0 || g.used || hflowBusy()) return;
      g.used = true;
      if (back()) e.preventDefault();
    };
    let touch: { y: number; engaged: boolean; used: boolean } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touch = { y: e.touches[0].clientY, engaged: atTop(), used: false };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touch?.engaged || touch.used) return;
      if (e.touches[0].clientY - touch.y < 40) return; // finger down = scroll up
      touch.used = true;
      if (back() && e.cancelable) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "PageUp") return;
      if (e.defaultPrevented || !atTop()) return;
      if (back()) e.preventDefault();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      className="flow-panel"
      data-hflow=""
      // Its content (the gallery) is drawn from the page's scroll position,
      // so the page moves to it at the start of a slide (lib/hflow).
      data-hflow-scroll=""
    >
      {children}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  HFLOW_EASE,
  HFLOW_MS,
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
/** Easing of the driven scroll up through the panel (ScrollExpansion's). */
const GLIDE_MS = 90;
/** How long after upward input a scroll over the top is still put back. */
const MOMENTUM_MS = 1200;
/** After sliding back, the slide's own jump up the page is left alone. */
const HFLOW_GUARD_MS = HFLOW_MS + 400;

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
  //
  // Scrolling up through the panel is driven from here, not left to the
  // browser (as in ScrollExpansion): its smooth scrolling queues each wheel
  // notch onto a target already ahead of the page, so a quick scroll was
  // committed past the panel's top before anything could stop it, and even
  // a slow one could drift over on the last notch's animation. Here the
  // target is ours and can't pass the top, so the page comes to rest exactly
  // there at any speed; the gesture that brought it ends there, and the next
  // one slides the section before back in - from that exact spot, which the
  // slide's measurements depend on. The page still really scrolls, so the
  // gallery's scroll effects run as before. Scrolling down stays native.
  useEffect(() => {
    if (reduced) return;
    const g = { lastT: 0, used: false, upAt: 0 };
    let slidAt = 0;
    const topOf = () => ref.current?.getBoundingClientRect().top;
    const atTop = () => {
      const top = topOf();
      return top !== undefined && Math.abs(top) <= 2;
    };
    /** Scroll by `up` px would cross the panel's top, or it is in view. */
    const crossing = (up: number) => {
      const top = topOf();
      return top !== undefined && top + up > 2 && top < window.innerHeight;
    };
    /** The viewport is somewhere inside the panel (or its top is in view). */
    const inside = () => {
      const r = ref.current?.getBoundingClientRect();
      return !!r && r.top < window.innerHeight && r.bottom > window.innerHeight;
    };
    const park = () => {
      drive.target = null;
      const top = topOf();
      if (top) window.scrollTo({ top: window.scrollY + top, behavior: "instant" });
    };
    const back = () => {
      const here = ref.current;
      const prev = hflowNeighbour(here, -1);
      if (!here || !prev) return false;
      park();
      if (!hflowSlide(here, prev)) return false;
      slidAt = performance.now();
      return true;
    };

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

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      const now = performance.now();
      if (now - g.lastT > GESTURE_GAP_MS) g.used = false;
      g.lastT = now;
      if (e.deltaY >= 0 || hflowBusy()) {
        if (!atTop()) g.used = true;
        return;
      }
      g.upAt = now;
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const up = -e.deltaY * unit;
      const top = topOf();
      if (top === undefined || !inside()) {
        g.used = true; // further down the page: native
        return;
      }
      e.preventDefault();
      if (Math.abs(top) <= 2 && drive.target === null) {
        // Parked at the top: hold the rest of a used gesture, so it doesn't
        // run on up; a fresh one slides the section before back in.
        if (g.used) return;
        g.used = true;
        back();
        return;
      }
      if (top > 2) {
        // Past the top already (a fling or the scrollbar left it there).
        park();
        g.used = true;
        return;
      }
      // Inside the panel: glide up, never past its top.
      g.used = true;
      const start = window.scrollY + top;
      const base = drive.target ?? window.scrollY;
      glideTo(Math.max(start, base - up));
    };

    // Safety net: momentum the browser had already queued before the panel
    // took over (a fling up from the section below) can still carry the page
    // over the top. While upward input is recent, a scroll that crosses it is
    // put back on it. The slide's own jump, and scrollbar drags, are left be.
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const rising = y < lastY;
      lastY = y;
      const now = performance.now();
      if (!rising || hflowBusy() || now - slidAt < HFLOW_GUARD_MS) return;
      if (now - g.upAt > MOMENTUM_MS) return;
      const top = topOf();
      if (top !== undefined && top > 2 && top < window.innerHeight) park();
    };
    let touch: { y: number; engaged: boolean; used: boolean } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touch = { y: e.touches[0].clientY, engaged: atTop(), used: false };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touch) return;
      const pulled = e.touches[0].clientY - touch.y; // finger down = scroll up
      // The fling that follows can coast over the top; the scroll guard
      // catches it.
      if (pulled > 0) g.upAt = performance.now();
      if (!touch.engaged) {
        // Dragging up past the top stops on it, as the wheel does; the next
        // swipe slides back.
        if (pulled > 0 && crossing(pulled)) {
          if (e.cancelable) e.preventDefault();
          park();
          touch.engaged = touch.used = true;
        }
        return;
      }
      if (touch.used) {
        if (pulled > 0 && e.cancelable) e.preventDefault();
        return;
      }
      if (pulled < 40) return;
      touch.used = true;
      if (back() && e.cancelable) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "PageUp") return;
      if (e.defaultPrevented) return;
      if (!atTop()) {
        // A key step that would cross the top lands on it instead.
        const step = e.key === "PageUp" ? window.innerHeight * 0.9 : 80;
        if (!crossing(step)) return;
        e.preventDefault();
        park();
        return;
      }
      if (back()) e.preventDefault();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(drive.raf);
      drive.target = null;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
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

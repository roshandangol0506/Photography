"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type {
  FocusEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  Ref,
} from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Symbiote, type SymbioteIntensity } from "./venom-symbiote";
import "./venom-button.css";

export type VenomButtonProps = {
  /** @default "Let's Collaborate" */
  label?: string;
  /** Renders a link when set, a button otherwise. */
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** How many strands, how far they reach, how hard they writhe. @default "default" */
  intensity?: SymbioteIntensity;
  className?: string;
};

/**
 * A glossy black pill with a living symbiote underneath: strands reach out
 * from whichever side faces the pointer and close round it, flare all round
 * the button on hover or keyboard focus, and flinch back on a press. See
 * venom-symbiote.ts for how the strands move.
 *
 * The strands are drawn on a canvas that reaches well past the button,
 * clipped at the viewport's sides so it never widens the page. It can still
 * reach below the button's container, so give that container
 * overflow: hidden if it sits at the very end of the page.
 */
export function VenomButton({
  label = "Let's Collaborate",
  href,
  onClick,
  intensity = "default",
  className,
}: VenomButtonProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLElement>(null);
  const engineRef = useRef<Symbiote | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const surface = surfaceRef.current;
    if (!root || !canvas || !surface) return;

    const engine = new Symbiote(canvas, {
      intensity,
      coarse: window.matchMedia("(pointer: coarse)").matches,
    });
    engineRef.current = engine;

    // The canvas reaches `margin` past the button each way, except where
    // that would cross the viewport's left or right edge.
    const layout = () => {
      const w = surface.offsetWidth;
      const h = surface.offsetHeight;
      const m = engine.margin;
      const rect = root.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const left = Math.min(Math.max(rect.left, 0), m);
      const right = Math.min(Math.max(vw - rect.right, 0), m);
      canvas.style.left = `${-left}px`;
      canvas.style.top = `${-m}px`;
      canvas.style.width = `${w + left + right}px`;
      canvas.style.height = `${h + 2 * m}px`;
      engine.resize(w + left + right, h + 2 * m, { x: left, y: m, w, h });
      if (reduced) engine.still();
    };
    layout();
    const resizer = new ResizeObserver(layout);
    resizer.observe(root);
    window.addEventListener("resize", layout);

    if (reduced) {
      return () => {
        resizer.disconnect();
        window.removeEventListener("resize", layout);
        engine.destroy();
        engineRef.current = null;
      };
    }

    // Written straight to the DOM once a frame, so nothing re-renders.
    let transform = "";
    let hx = "";
    let hy = "";
    engine.onFrame = (f) => {
      const next =
        `translate3d(${f.tugX.toFixed(2)}px, ${f.tugY.toFixed(2)}px, 0) ` +
        `scale(${(1 - 0.045 * f.squash + 0.012 * f.engage).toFixed(4)}, ` +
        `${(1 - 0.11 * f.squash).toFixed(4)})`;
      if (next !== transform) surface.style.transform = transform = next;
      const nx = `${f.hx.toFixed(1)}%`;
      const ny = `${f.hy.toFixed(1)}%`;
      if (nx !== hx) surface.style.setProperty("--vb-hx", (hx = nx));
      if (ny !== hy) surface.style.setProperty("--vb-hy", (hy = ny));
    };

    // Tracked on the window, not the button: the strands notice the pointer
    // well before it arrives. A finger only counts while it is down.
    const move = (e: PointerEvent) => engine.pointer(e.clientX, e.clientY);
    const up = (e: PointerEvent) => {
      engine.release();
      if (e.pointerType !== "mouse") engine.leave();
    };
    const out = (e: PointerEvent) => {
      if (!e.relatedTarget) engine.leave();
    };
    const blur = () => {
      engine.release();
      engine.leave();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("pointerout", out);
    window.addEventListener("blur", blur);

    // Only alive while it, or its reach, is on screen.
    const watcher = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? engine.start() : engine.stop()),
      { rootMargin: `${engine.margin}px` },
    );
    watcher.observe(root);

    return () => {
      watcher.disconnect();
      resizer.disconnect();
      window.removeEventListener("resize", layout);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("pointerout", out);
      window.removeEventListener("blur", blur);
      engine.destroy();
      engineRef.current = null;
      surface.style.transform = "";
    };
  }, [intensity, reduced]);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button === 0) engineRef.current?.press();
  };

  // The flinch is cosmetic and runs alongside the real action, never in
  // place of it. detail is 0 when the keyboard activated it.
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (event.detail === 0) engineRef.current?.pulse();
    onClick?.(event);
  };

  // Keyboard focus rouses it as hover does; a mouse click's focus doesn't.
  const onFocus = (event: FocusEvent<HTMLElement>) =>
    engineRef.current?.focus(event.currentTarget.matches(":focus-visible"));
  const onBlur = () => engineRef.current?.focus(false);

  const surface = {
    className: "venom-surface",
    onPointerDown,
    onClick: handleClick,
    onFocus,
    onBlur,
    children: <span className="venom-label">{label}</span>,
  };

  return (
    <div ref={rootRef} className={cn("relative isolate inline-flex", className)}>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-0 w-0"
      />
      {href ? (
        <Link
          ref={surfaceRef as Ref<HTMLAnchorElement>}
          href={href}
          {...surface}
        />
      ) : (
        <button
          ref={surfaceRef as Ref<HTMLButtonElement>}
          type="button"
          {...surface}
        />
      )}
    </div>
  );
}

export default VenomButton;

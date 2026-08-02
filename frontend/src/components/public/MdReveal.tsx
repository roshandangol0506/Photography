import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

interface MdRevealProps {
  children: ReactNode;
  className?: string;
}

const TRANSITION =
  "opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)";

/**
 * Scroll reveal for the modernist home page: opacity 0 -> 1 and
 * translateY(26px) -> 0, on the handoff's exact curve and observer bounds.
 *
 * Separate from SectionReveal, which the rest of the public site uses with
 * different timings.
 */
export function MdReveal({ children, className }: MdRevealProps) {
  const { settings } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const animate = settings.animationsEnabled && !prefersReducedMotion;

  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!animate) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setShown(true);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);

    // Fail-safe: an anchor jump lands past the observer's viewport window,
    // which would otherwise strand everything above the fold at opacity 0.
    const sweep = () => {
      if (el.getBoundingClientRect().top < window.innerHeight) setShown(true);
    };
    window.addEventListener("scroll", sweep, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", sweep);
    };
  }, [animate]);

  if (!animate) return <div className={className}>{children}</div>;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(26px)",
        transition: TRANSITION,
      }}
    >
      {children}
    </div>
  );
}

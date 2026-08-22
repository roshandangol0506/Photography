"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useSite } from "@/components/providers/SiteProvider";

const TRANSITION =
  "opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)";

/**
 * Scroll reveal, ported from the Vite app unchanged: opacity 0 -> 1 and
 * translateY(26px) -> 0 on the handoff's curve and observer bounds.
 */
export function MdReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { settings } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const animate = settings.animationsEnabled;

  useEffect(() => {
    if (!animate) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setShown(true);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);

    // An anchor jump lands past the observer's window, which would otherwise
    // strand everything above the fold at opacity 0.
    const sweep = () => {
      if (element.getBoundingClientRect().top < window.innerHeight) {
        setShown(true);
      }
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

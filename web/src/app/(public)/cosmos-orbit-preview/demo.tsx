"use client";

import type { ReactNode } from "react";
import ReactLenis from "lenis/react";
import "lenis/dist/lenis.css";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Inertia scrolling, as on the reference. The scroll position is still the
 * page's own, so sticky pinning and the scroll timelines work unchanged.
 */
export default function CosmosOrbitDemo({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return reduced ? children : <ReactLenis root>{children}</ReactLenis>;
}

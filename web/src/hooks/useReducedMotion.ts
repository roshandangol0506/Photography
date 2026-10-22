"use client";

import { useEffect, useState } from "react";

/**
 * The visitor's prefers-reduced-motion setting, safe for server rendering.
 *
 * False on the server and on the first client render, so the hydrated HTML
 * matches what the server sent; the real value arrives straight after mount
 * and follows any later change. (framer-motion's useReducedMotion reads the
 * media query during the first render, which makes reduced-motion visitors'
 * first client render disagree with the server HTML.)
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  return reduced;
}

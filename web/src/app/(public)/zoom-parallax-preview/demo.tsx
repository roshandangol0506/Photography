"use client";

import ReactLenis from "lenis/react";
import "lenis/dist/lenis.css";
import type { ZoomParallaxImage } from "@/components/ui/zoom-parallax";
import { ZoomParallaxSection } from "@/components/public/sections/ZoomParallaxSection";

/**
 * The landing page's zoom parallax section, with Lenis smooth scrolling as
 * the 21st.dev demo had it (via the `lenis` package rather than the
 * deprecated @studio-freight/lenis).
 */
export default function ZoomParallaxDemo({
  images,
}: {
  images: ZoomParallaxImage[];
}) {
  return (
    <ReactLenis root>
      <main className="min-h-screen w-full">
        <ZoomParallaxSection images={images} />
        <div className="h-[50vh]" />
      </main>
    </ReactLenis>
  );
}

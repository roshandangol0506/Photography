"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type CSSProperties } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Adapted from the 21st.dev "zoom parallax":
// - Each tile's placement is an inline style rather than a string of
//   `[&>div]:!top-[..]` arbitrary variants, so no !important is needed.
// - Images past the seventh are dropped: there are only seven placements, and
//   the rest would all stack on the centre tile.
// - The '/placeholder.svg' fallback is gone; this project has no such file.
// - Visitors who prefer reduced motion get the collage without the zoom.

export interface ZoomParallaxImage {
  /** Ready-to-load URL. Run large originals through getImageProps first. */
  src: string;
  alt?: string;
}

interface ZoomParallaxProps {
  /** Up to 7 images. The first is the centre tile that ends up full-screen. */
  images: ZoomParallaxImage[];
}

// Offsets from the centre tile (25vh x 25vw by default), one per image.
const PLACEMENTS: CSSProperties[] = [
  {},
  { top: "-30vh", left: "5vw", height: "30vh", width: "35vw" },
  { top: "-10vh", left: "-25vw", height: "45vh", width: "20vw" },
  { left: "27.5vw", height: "25vh", width: "25vw" },
  { top: "27.5vh", left: "5vw", height: "25vh", width: "20vw" },
  { top: "27.5vh", left: "-22.5vw", height: "25vh", width: "30vw" },
  { top: "22.5vh", left: "25vw", height: "15vh", width: "15vw" },
];

export function ZoomParallax({ images }: ZoomParallaxProps) {
  const container = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

  return (
    <div ref={container} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {images.slice(0, PLACEMENTS.length).map(({ src, alt }, index) => (
          <motion.div
            key={index}
            style={reduced ? undefined : { scale: scales[index] }}
            className="absolute top-0 flex h-full w-full items-center justify-center"
          >
            <div
              className="relative h-[25vh] w-[25vw]"
              style={PLACEMENTS[index]}
            >
              <img
                src={src}
                alt={alt || `Parallax image ${index + 1}`}
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

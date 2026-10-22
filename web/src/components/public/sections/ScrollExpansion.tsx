"use client";

import "./scroll-expansion.css";

import { useEffect, useRef, useState } from "react";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { hflowNeighbour, hflowSlide } from "@/lib/hflow";

// Photos from /public. ScrollExpandMedia draws both with next/image, so the
// full-size originals are resized by the optimizer on the way out.
const MEDIA = {
  src: "/2.jpg",
  background: "/6.jpg",
  title: "Dynamic Image Showcase",
  date: "Himalayan Light",
  scrollToExpand: "Scroll to Expand Demo",
};

/** How long the entrance runs; input is held until it lands. */
const ENTRANCE_MS = 1300;

/**
 * The scroll-to-expand image section.
 *
 * Placed straight after CinematicStory, it takes part in the story's scene
 * transitions: it opts in with data-cinematic-entry, so scrolling on from the
 * story's last scene drives the page here as a scene change and fires
 * "cinematic:enter" - the background photo fades up over the texture, the
 * photo rises in as a masked window that opens out, and the title follows
 * (see scroll-expansion.css). Scrolling up from its collapsed start hands
 * back to the story the same way, via "cinematic:return".
 */
export function ScrollExpansion() {
  const ref = useRef<HTMLDivElement>(null);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: number | undefined;
    const onEnter = () => {
      setEntering(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setEntering(false), ENTRANCE_MS);
    };
    el.addEventListener("cinematic:enter", onEnter);
    return () => {
      el.removeEventListener("cinematic:enter", onEnter);
      window.clearTimeout(timer);
    };
  }, []);

  /** Hand back to the section above, if it takes part in transitions. */
  const exitUp = () => {
    const prev = ref.current?.previousElementSibling as HTMLElement | null;
    if (prev?.dataset.cinematicReturn !== "on") return false;
    prev.dispatchEvent(new CustomEvent("cinematic:return"));
    return true;
  };

  /** Fully expanded and scrolling on: slide the next linked section in
      from the right (lib/hflow), rather than scrolling down to it. */
  const exitDown = () => {
    const here = ref.current;
    const next = hflowNeighbour(here, 1);
    return !!here && !!next && hflowSlide(here, next);
  };

  return (
    <div
      ref={ref}
      className="sx-section min-h-screen"
      data-cinematic-entry=""
      // Linked to the section after it: that one slides in sideways.
      data-hflow=""
      data-entering={entering}
    >
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={MEDIA.src}
        bgImageSrc={MEDIA.background}
        title={MEDIA.title}
        date={MEDIA.date}
        scrollToExpand={MEDIA.scrollToExpand}
        entering={entering}
        onExitUp={exitUp}
        onExitDown={exitDown}
      />
    </div>
  );
}

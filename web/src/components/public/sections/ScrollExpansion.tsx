"use client";

import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";

// Photos from /public. ScrollExpandMedia draws both with next/image, so the
// full-size originals are resized by the optimizer on the way out.
const MEDIA = {
  src: "/2.jpg",
  background: "/6.jpg",
  title: "Dynamic Image Showcase",
  date: "Himalayan Light",
  scrollToExpand: "Scroll to Expand Demo",
};

/** The scroll-to-expand image section. */
export function ScrollExpansion() {
  return (
    <div className="min-h-screen">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={MEDIA.src}
        bgImageSrc={MEDIA.background}
        title={MEDIA.title}
        date={MEDIA.date}
        scrollToExpand={MEDIA.scrollToExpand}
      />
    </div>
  );
}

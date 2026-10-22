"use client";

import { useRef } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { PhotoFrame } from "@/components/public/PhotoFrame";
import { hflowNeighbour, hflowSlide } from "@/lib/hflow";
import { CinematicSlider } from "./CinematicSlider";
import { CINEMATIC_SLIDES } from "./cinematicSlides";

/**
 * The layered slider as a section of its own (it used to be hero style E).
 * Photos and copy come from cinematicSlides.ts; the site-wide "Animations"
 * switch still applies.
 *
 * It sits in the page's horizontal flow (data-hflow, see lib/hflow): it
 * slides in sideways from the section before it, scrolling moves one slide
 * at a time, and past the last slide the next linked section slides in from
 * the right - past the first, the one before slides back in from the left.
 */
export function CinematicSliderSection() {
  const { settings } = useSite();
  const ref = useRef<HTMLDivElement>(null);

  const onEdge = (dir: 1 | -1) => {
    const here = ref.current;
    const neighbour = hflowNeighbour(here, dir);
    return !!here && !!neighbour && hflowSlide(here, neighbour);
  };

  return (
    <div ref={ref} data-hflow="">
      <PhotoFrame className="block">
        <CinematicSlider
          id="stories"
          slides={CINEMATIC_SLIDES}
          animate={settings.animationsEnabled}
          label="Photo stories"
          onEdge={onEdge}
        />
      </PhotoFrame>
    </div>
  );
}

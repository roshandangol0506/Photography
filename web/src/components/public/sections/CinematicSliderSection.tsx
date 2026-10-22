"use client";

import { useSite } from "@/components/providers/SiteProvider";
import { PhotoFrame } from "@/components/public/PhotoFrame";
import { CinematicSlider } from "./CinematicSlider";
import { CINEMATIC_SLIDES } from "./cinematicSlides";

/**
 * The layered, click-left/right slider as a section of its own (it used to
 * be hero style E). Photos and copy come from cinematicSlides.ts; the
 * site-wide "Animations" switch still applies.
 */
export function CinematicSliderSection() {
  const { settings } = useSite();
  return (
    <PhotoFrame className="block">
      <CinematicSlider
        id="stories"
        slides={CINEMATIC_SLIDES}
        animate={settings.animationsEnabled}
        label="Photo stories"
      />
    </PhotoFrame>
  );
}

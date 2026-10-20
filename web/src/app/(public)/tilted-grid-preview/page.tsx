import type { Metadata } from "next";
import {
  TiltedGridHero,
  type TiltedGridImage,
} from "@/components/ui/tilted-grid-hero";

/**
 * Scratch page for viewing the curved-row hero in isolation.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the hero has been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Tilted grid preview",
  robots: { index: false, follow: false },
};

// Stock stand-ins until the hero is fed from the CMS. Landscape 16:9 crops to
// match the default tile shape; plain <img> tags, so no remotePatterns entry.
const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=960&h=540&q=80`;

const IMAGES: TiltedGridImage[] = [
  { src: unsplash("1506905925346-21bda4d32df4"), alt: "Mountain range above the clouds" },
  { src: unsplash("1469474968028-56623f02e42e"), alt: "Hiker on a rock above a hazy valley" },
  { src: unsplash("1501785888041-af3ef285b470"), alt: "Alpine lake beneath peaks" },
  { src: unsplash("1500530855697-b586d89ba3ee"), alt: "Road through a red-rock canyon" },
  { src: unsplash("1441974231531-c6227db76b6e"), alt: "Light through a forest canopy" },
  { src: unsplash("1470071459604-3b5ec3a7fe05"), alt: "Road through green highlands under low cloud" },
  { src: unsplash("1507525428034-b723cf961d3e"), alt: "Waves on a beach at sunrise" },
  { src: unsplash("1464822759023-fed622ff2c3b"), alt: "Snow-capped mountain ridge" },
  { src: unsplash("1494500764479-0c8f2919a3d8"), alt: "Lone tree standing in a lake at violet dusk" },
  { src: unsplash("1426604966848-d7adac402bff"), alt: "Granite cliff above a pine meadow" },
];

export default function TiltedGridPreviewPage() {
  return (
    <TiltedGridHero
      images={IMAGES}
      className="h-screen min-h-[620px] w-full bg-md-ink"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between pt-32 pb-16 text-center text-md-light">
        <div className="px-6">
          <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-6xl">
            Every frame,
            <br />
            brought into focus.
          </h1>
        </div>
        <p className="max-w-md text-balance px-6 text-sm text-md-light/80">
          Images curve in from one edge, flatten out at the centre, then fade
          away round the other.
        </p>
      </div>
    </TiltedGridHero>
  );
}

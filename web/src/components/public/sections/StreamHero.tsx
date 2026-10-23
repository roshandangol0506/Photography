import { getImageProps } from "next/image";
import {
  ImageStreamHero,
  type StreamImage,
} from "@/components/ui/image-stream-hero";
import { VenomButton } from "@/components/ui/venom-button";

// The photos in /public are numbered 1.jpg, 2.jpg, ... Several are full-size
// camera originals (up to ~23 MB), so each goes through the Next image
// optimizer rather than straight to the browser. A 540px display width gives a
// 1080px source, which still covers the largest card on a 2x screen.
const photo = (n: number): StreamImage => ({
  src: getImageProps({
    src: `/${n}.jpg`,
    alt: "",
    width: 540,
    height: 540,
  }).props.src,
});

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => photo(from + i));

const LEFT = range(1, 10);
const RIGHT = range(11, 20);

/**
 * The landing page hero: the image-stream corridor, left rail 1-10 and right
 * rail 11-20, with the photos scattering out from the centre on load.
 * Carries id="top" for the navbar logo link.
 */
export function StreamHero() {
  return (
    <ImageStreamHero
      id="top"
      leftImages={LEFT}
      rightImages={RIGHT}
      // One card per photo, so every photo on each side is on screen.
      cards={10}
      className="h-screen min-h-[620px] w-full"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between pt-32 pb-16 text-center text-md-light">
        <div className="px-6">
          <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-6xl">
            Your work,
            <br />
            front and centre.
          </h1>
        </div>
        <div className="flex flex-col items-center gap-10">
          <VenomButton href="/contact" />
          <p className="max-w-md text-balance px-6 text-sm text-md-light/80">
            A hero that leads with the images instead of describing them. Swap
            in your own and the corridor rebuilds around them.
          </p>
        </div>
      </div>
    </ImageStreamHero>
  );
}

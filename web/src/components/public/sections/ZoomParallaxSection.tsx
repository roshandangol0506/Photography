import { getImageProps } from "next/image";
import {
  ZoomParallax,
  type ZoomParallaxImage,
} from "@/components/ui/zoom-parallax";
import { ZoomParallaxIntro } from "./ZoomParallaxIntro";
import { OVERLAP_VH } from "./zoomParallaxTiming";

// Photos from /public, through the Next image optimizer: several are
// full-size camera originals. A 1024px width asks for the 2048px source, the
// largest the config allows, because the centre tile zooms to fill the screen.
// The centre (first) photo is one of the high-resolution originals for that
// reason.
const photo = (n: number): ZoomParallaxImage => ({
  src: getImageProps({
    src: `/${n}.jpg`,
    alt: "",
    width: 1024,
    height: 1024,
    quality: 90,
  }).props.src,
});

const IMAGES = [6, 1, 2, 3, 4, 5, 7].map(photo);

/**
 * The "Step into the frame" intro, then the zoom parallax sliding up over it
 * while the intro's text holds still. No Lenis of its own: smooth scrolling
 * is a page-wide choice for the page to make.
 */
export function ZoomParallaxSection({ images = IMAGES }: { images?: ZoomParallaxImage[] }) {
  return (
    <section className="w-full text-md-light">
      <ZoomParallaxIntro />
      {/* Pulled up over the intro's last pinned screen, and above it. */}
      <div className="relative z-10" style={{ marginTop: `-${OVERLAP_VH}vh` }}>
        <ZoomParallax images={images} />
      </div>
    </section>
  );
}

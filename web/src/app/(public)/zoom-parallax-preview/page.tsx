import type { Metadata } from "next";
import { getImageProps } from "next/image";
import type { ZoomParallaxImage } from "@/components/ui/zoom-parallax";
import ZoomParallaxDemo from "./demo";

/**
 * Scratch page for viewing the zoom parallax in isolation.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the section has been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Zoom parallax preview",
  robots: { index: false, follow: false },
};

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

export default function ZoomParallaxPreviewPage() {
  return <ZoomParallaxDemo images={IMAGES} />;
}

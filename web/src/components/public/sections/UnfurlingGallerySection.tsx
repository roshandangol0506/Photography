import { getImageProps } from "next/image";
import {
  ParallaxUnfurlingGallery,
  type UnfurlingGalleryImage,
} from "@/components/ui/3d-parallax-unfurling-gallery";

// Photos from /public, through the Next image optimizer: several are
// full-size camera originals. Cards are at most ~420px wide (22vw of a
// 1920px screen), so a 600px width gives a 1200px source for 2x screens.
const photo = (n: number): UnfurlingGalleryImage => ({
  src: getImageProps({ src: `/${n}.jpg`, alt: "", width: 600, height: 600 })
    .props.src,
});

const IMAGES = Array.from({ length: 14 }, (_, i) => photo(9 + i));

/**
 * The 3D unfurling gallery with photos 9-22. With `holdUnderNext`, its last
 * screen stays in place for the next section to slide up over.
 */
export function UnfurlingGallerySection({
  holdUnderNext = false,
}: {
  holdUnderNext?: boolean;
}) {
  return <ParallaxUnfurlingGallery images={IMAGES} holdUnderNext={holdUnderNext} />;
}

import { getImageProps } from "next/image";
import { OrbitShowcase } from "./OrbitShowcase";

// Photos from /public, through the Next image optimizer: several are
// full-size camera originals, and each one becomes a GPU texture. The photo
// nearest the camera spans over half a desktop screen, so a 1024px width asks
// for the 2048px source, the largest the config allows.
const photo = (n: number) =>
  getImageProps({ src: `/${n}.jpg`, alt: "", width: 1024, height: 1024 })
    .props.src;

// Ten landscape frames: few enough that the near side of the ring shows two
// large photos at a time with the far side visible between them.
const IMAGES = [2, 16, 8, 1, 14, 7, 18, 20, 5, 22].map(photo);

/** The "Cosmos" orbit showcase with its photographs. */
export function OrbitShowcaseSection() {
  return <OrbitShowcase images={IMAGES} />;
}

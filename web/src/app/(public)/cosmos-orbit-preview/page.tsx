import type { Metadata } from "next";
import { getImageProps } from "next/image";
import CosmosOrbitDemo from "./demo";

/**
 * Scratch page for viewing the cosmos orbit gallery in isolation.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the section has been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Cosmos orbit preview",
  robots: { index: false, follow: false },
};

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

export default function CosmosOrbitPreviewPage() {
  return <CosmosOrbitDemo images={IMAGES} />;
}

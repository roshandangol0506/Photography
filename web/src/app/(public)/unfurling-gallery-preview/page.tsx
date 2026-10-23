import type { Metadata } from "next";
import { UnfurlingGallerySection } from "@/components/public/sections/UnfurlingGallerySection";

/**
 * Scratch page for viewing the 3D unfurling gallery in isolation.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the section has been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Unfurling gallery preview",
  robots: { index: false, follow: false },
};

export default function UnfurlingGalleryPreviewPage() {
  return <UnfurlingGallerySection />;
}

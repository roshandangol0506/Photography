import type { Metadata } from "next";
import DemoPhotos from "./demo";

/**
 * Scratch page for viewing the ink-blot carousel in isolation.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the carousel has been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Ink blot preview",
  robots: { index: false, follow: false },
};

export default function InkBlotPreviewPage() {
  return <DemoPhotos />;
}

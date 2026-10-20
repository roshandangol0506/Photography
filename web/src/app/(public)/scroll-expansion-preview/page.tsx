import type { Metadata } from "next";
import ScrollExpansionDemo from "./demo";

/**
 * Scratch page for viewing the scroll-expansion hero in isolation.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the hero has been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Scroll expansion preview",
  robots: { index: false, follow: false },
};

export default function ScrollExpansionPreviewPage() {
  return <ScrollExpansionDemo />;
}

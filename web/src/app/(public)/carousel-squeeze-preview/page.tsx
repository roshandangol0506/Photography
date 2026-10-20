import type { Metadata } from "next";
import SqueezeCarouselDemo from "./demo";

/**
 * Scratch page for viewing the squeeze carousel in isolation.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the carousel has been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Squeeze carousel preview",
  robots: { index: false, follow: false },
};

export default function SqueezeCarouselPreviewPage() {
  // Top padding clears the fixed site navbar.
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pt-32 pb-20">
      <SqueezeCarouselDemo />
    </section>
  );
}

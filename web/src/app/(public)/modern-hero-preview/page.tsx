import type { Metadata } from "next";
import { SmoothScrollHero } from "@/components/ui/modern-hero";

/**
 * Scratch page for viewing the parallax "modern hero" in isolation.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the hero has been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Modern hero preview",
  robots: { index: false, follow: false },
};

export default function ModernHeroPreviewPage() {
  return <SmoothScrollHero />;
}

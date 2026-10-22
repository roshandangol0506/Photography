import type { Metadata } from "next";
import {
  HeroDemo1,
  HeroDemo2,
  HeroDemo3,
} from "@/components/public/sections/HeroGallery";

/**
 * Scratch page for viewing the bento scroll hero in isolation.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the hero has been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Hero gallery preview",
  robots: { index: false, follow: false },
};

// One layout per visit: each demo's text block is `position: fixed` until its
// own section has scrolled past, so stacking them would overlay all three at
// once on first paint.
const DEMOS = { "1": HeroDemo1, "2": HeroDemo2, "3": HeroDemo3 };

export default async function HeroGalleryPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ layout?: string }>;
}) {
  const { layout } = await searchParams;
  const Demo = DEMOS[layout as keyof typeof DEMOS] ?? HeroDemo1;
  return <Demo />;
}

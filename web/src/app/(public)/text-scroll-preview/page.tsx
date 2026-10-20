import type { Metadata } from "next";
import { Skiper31 } from "@/components/ui/text-scroll-animation";

/**
 * Scratch page for viewing the scroll-driven text animation in isolation.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the section has been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Text scroll preview",
  robots: { index: false, follow: false },
};

export default function TextScrollPreviewPage() {
  // `relative` anchors the component's absolutely-positioned "Scroll to see
  // more" hint to this section rather than to the page.
  return (
    <div className="relative">
      <Skiper31 />
    </div>
  );
}

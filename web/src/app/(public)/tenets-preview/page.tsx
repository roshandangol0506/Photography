import type { Metadata } from "next";
import { TenetsSlider } from "@/components/public/sections/TenetsSlider";

/**
 * Scratch page for viewing the Tenets slider in isolation.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the section has been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Tenets preview",
  robots: { index: false, follow: false },
};

export default function TenetsPreviewPage() {
  return (
    <div className="modernist bg-md-ground text-md-fg">
      <TenetsSlider />
    </div>
  );
}

import type { Metadata } from "next";
import { ScrollExpansion } from "@/components/public/sections/ScrollExpansion";

/**
 * Scratch page for viewing the scroll-expansion section in isolation. The
 * section itself now lives in ScrollExpansion, which the home page also uses.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list).
 */
export const metadata: Metadata = {
  title: "Scroll expansion preview",
  robots: { index: false, follow: false },
};

export default function ScrollExpansionPreviewPage() {
  return <ScrollExpansion />;
}

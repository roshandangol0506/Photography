import type { Metadata } from "next";
import { StreamHero } from "@/components/public/sections/StreamHero";

/**
 * Scratch page for viewing the image-stream hero in isolation. The hero
 * itself now lives in StreamHero, which the home page also uses.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list).
 */
export const metadata: Metadata = {
  title: "Image stream preview",
  robots: { index: false, follow: false },
};

export default function ImageStreamPreviewPage() {
  return <StreamHero />;
}

import type { Metadata } from "next";
import { OrbitShowcaseSection } from "@/components/public/sections/OrbitShowcaseSection";
import { ProjectsLocation } from "@/components/public/sections/ProjectsLocation";
import CosmosOrbitDemo from "./demo";

/**
 * Scratch page for viewing the cosmos orbit showcase and the Projects
 * location section in isolation, with Lenis smooth scrolling.
 *
 * Not linked from anywhere and not in the sitemap (that file is an explicit
 * list). Delete this route once the sections have been placed on a real page.
 */
export const metadata: Metadata = {
  title: "Cosmos orbit preview",
  robots: { index: false, follow: false },
};

export default function CosmosOrbitPreviewPage() {
  return (
    <CosmosOrbitDemo>
      <OrbitShowcaseSection />
      <ProjectsLocation />
    </CosmosOrbitDemo>
  );
}

import type { Metadata } from "next";
import {
  getActiveAwards,
  getActiveCategories,
  getActiveCollections,
  getActiveTestimonials,
  getPhotos,
  getSettings,
  getSideScrollPhotos,
} from "@/lib/content";
import { StreamHero } from "@/components/public/sections/StreamHero";
import { FeaturedPhotos } from "@/components/public/sections/FeaturedPhotos";
import { CinematicStory } from "@/components/public/sections/CinematicStory";
import { ScrollExpansion } from "@/components/public/sections/ScrollExpansion";
import { CinematicSliderSection } from "@/components/public/sections/CinematicSliderSection";
import { HeroDemo1 as HeroGallery } from "@/components/public/sections/HeroGallery";
import { SmoothScrollHero } from "@/components/ui/modern-hero";
import { Skiper31 as TextScroll } from "@/components/ui/text-scroll-animation";
import { AboutSection } from "@/components/public/sections/AboutSection";
import { RecentWorks } from "@/components/public/sections/RecentWorks";
import { AwardsTimeline } from "@/components/public/sections/AwardsTimeline";
import { PhotoSeries } from "@/components/public/sections/PhotoSeries";
import { CollectionShowcase } from "@/components/public/sections/CollectionShowcase";
import { SideScrollStrip } from "@/components/public/sections/SideScrollStrip";
import { TestimonialsCarousel } from "@/components/public/sections/TestimonialsCarousel";
import { ContactSection } from "@/components/public/sections/ContactSection";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings?.siteTitle ?? "Photography Portfolio";
  const description = settings?.seo?.metaDescription || settings?.tagline || "";

  return {
    // Home overrides the layout's "%s | site" template with its own absolute
    // title, which is the convention for a site's front page.
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      title,
      description,
      images: settings?.seo?.ogImage ? [settings.seo.ogImage] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Server Component. Every section's data is fetched here in parallel and
 * passed down, so the page ships complete HTML and only the genuinely
 * interactive leaves carry JavaScript.
 */
export default async function HomePage() {
  // Fetched in parallel: each section is independent, so waterfalling them
  // would add latency for no reason.
  const [
    settings,
    featured,
    recent,
    awards,
    categories,
    collections,
    strip,
    testimonials,
  ] = await Promise.all([
    getSettings(),
    getPhotos({ featured: true, perpage: 3 }),
    getPhotos({ perpage: 6 }),
    getActiveAwards(),
    getActiveCategories(),
    getActiveCollections(),
    getSideScrollPhotos(),
    getActiveTestimonials(),
  ]);

  return (
    <>
      <StreamHero />
      {/* <FeaturedPhotos photos={featured?.photos ?? []} /> */}
      <CinematicStory />
      <ScrollExpansion />
      <CinematicSliderSection />
      <SmoothScrollHero />
      <HeroGallery />
      {/* `relative` anchors the section's "Scroll to see more" hint to it.
          No Lenis here: it would take over scrolling for the whole page. */}
      <div className="relative">
        <TextScroll smooth={false} />
      </div>
      {settings && <AboutSection settings={settings} />}
      <PhotoSeries categories={categories ?? []} />
      <RecentWorks
        photos={recent?.photos ?? []}
        total={recent?.pagination.total ?? 0}
      />
      <CollectionShowcase collections={collections ?? []} />
      <AwardsTimeline awards={awards ?? []} />
      <SideScrollStrip photos={strip ?? []} />
      <TestimonialsCarousel testimonials={testimonials ?? []} />
      <ContactSection />
    </>
  );
}

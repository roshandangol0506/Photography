import { useSeo } from "@/hooks/useSeo";
import { Hero } from "@/components/public/sections/Hero";
import { FeaturedPhotos } from "@/components/public/sections/FeaturedPhotos";
import { PhotoSeries } from "@/components/public/sections/PhotoSeries";
import { CollectionShowcase } from "@/components/public/sections/CollectionShowcase";
import { RecentWorks } from "@/components/public/sections/RecentWorks";
import { SideScrollStrip } from "@/components/public/sections/SideScrollStrip";
import { AwardsTimeline } from "@/components/public/sections/AwardsTimeline";
import { TestimonialsCarousel } from "@/components/public/sections/TestimonialsCarousel";
import { AboutSection } from "@/components/public/sections/AboutSection";
import { ContactSection } from "@/components/public/sections/ContactSection";

export default function Home() {
  useSeo();

  return (
    <div className="modernist bg-md-ground text-md-fg">
      <Hero />
      <FeaturedPhotos />
      <AboutSection />
      <PhotoSeries />
      <RecentWorks />
      <CollectionShowcase />
      <AwardsTimeline />
      <SideScrollStrip />
      <TestimonialsCarousel />
      <ContactSection />
    </div>
  );
}

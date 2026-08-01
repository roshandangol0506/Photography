import { useSeo } from "@/hooks/useSeo";
import { Hero } from "@/components/public/sections/Hero";
import { FeaturedPhotos } from "@/components/public/sections/FeaturedPhotos";
import { CategoriesShowcase } from "@/components/public/sections/CategoriesShowcase";
import { RecentWorks } from "@/components/public/sections/RecentWorks";
import { SideScrollStrip } from "@/components/public/sections/SideScrollStrip";
import { AwardsTimeline } from "@/components/public/sections/AwardsTimeline";
import { TestimonialsCarousel } from "@/components/public/sections/TestimonialsCarousel";
import { AboutSection } from "@/components/public/sections/AboutSection";
import { ContactSection } from "@/components/public/sections/ContactSection";
import { Footer } from "@/components/public/Footer";

export default function Home() {
  useSeo();

  return (
    <div className="-mt-24">
      <div className="fixed inset-0 z-0">
        <Hero />
      </div>
      <div className="h-screen" aria-hidden="true" />
      <div className="relative z-10 bg-background">
        <FeaturedPhotos />
        <AboutSection />
        <CategoriesShowcase />
        <RecentWorks />
        <AwardsTimeline />
        <SideScrollStrip />
        <TestimonialsCarousel />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}

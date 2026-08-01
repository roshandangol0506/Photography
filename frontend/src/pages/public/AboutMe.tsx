import { useTheme } from "@/hooks/useTheme";
import { useSeo } from "@/hooks/useSeo";
import { SectionReveal } from "@/components/public/SectionReveal";
import { AwardsTimeline } from "@/components/public/sections/AwardsTimeline";
import { TestimonialsCarousel } from "@/components/public/sections/TestimonialsCarousel";
import { ContactSection } from "@/components/public/sections/ContactSection";

export default function AboutMe() {
  const { settings } = useTheme();
  const { about } = settings;

  useSeo({
    title: "About Me",
    description: about?.description || "Learn more about the photographer.",
    image: about?.image,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionReveal className="mb-14 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          About Me
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {about?.title || "Behind the Camera"}
        </h1>
      </SectionReveal>

      <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
        <SectionReveal>
          {about?.image ? (
            <img
              src={about.image}
              alt={about.title || "About"}
              loading="lazy"
              className="aspect-4/5 h-full w-full rounded-2xl object-cover md:aspect-auto"
            />
          ) : (
            <div className="aspect-4/5 w-full rounded-2xl bg-muted md:aspect-auto md:h-full" />
          )}
        </SectionReveal>

        <SectionReveal delay={0.15}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div>
              {about?.description && (
                <p className="whitespace-pre-line text-muted-foreground">
                  {about.description}
                </p>
              )}
              {Boolean(about?.experienceYears) && (
                <div className="mt-6 inline-flex items-baseline gap-2 rounded-xl border border-border px-4 py-3">
                  <span className="text-3xl font-semibold text-primary">
                    {about.experienceYears}+
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Years of experience
                  </span>
                </div>
              )}
            </div>
          </div>
        </SectionReveal>
      </div>

      <AwardsTimeline />
      <TestimonialsCarousel />
      <ContactSection />
    </div>
  );
}

import { useTheme } from "@/hooks/useTheme";
import { SectionReveal } from "@/components/public/SectionReveal";

export function AboutSection() {
  const { settings } = useTheme();
  const { about } = settings;

  if (!about?.title && !about?.description && !about?.image) return null;

  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <SectionReveal>
          {about.image ? (
            <img
              src={about.image}
              alt={about.title || "About"}
              loading="lazy"
              className="aspect-4/5 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="aspect-4/5 w-full rounded-2xl bg-muted" />
          )}
        </SectionReveal>
        <SectionReveal delay={0.15}>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            About Me
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {about.title || "Behind the Camera"}
          </h2>
          {about.description && (
            <p className="mt-4 whitespace-pre-line text-muted-foreground">
              {about.description}
            </p>
          )}
          {Boolean(about.experienceYears) && (
            <div className="mt-6 inline-flex items-baseline gap-2 rounded-xl border border-border px-4 py-3">
              <span className="text-3xl font-semibold text-primary">
                {about.experienceYears}+
              </span>
              <span className="text-sm text-muted-foreground">
                Years of experience
              </span>
            </div>
          )}
        </SectionReveal>
      </div>
    </section>
  );
}

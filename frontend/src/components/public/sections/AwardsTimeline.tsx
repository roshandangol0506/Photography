import { Award as AwardIcon } from "lucide-react";
import { useActiveAwards } from "@/api/awards";
import { SectionReveal } from "@/components/public/SectionReveal";

export function AwardsTimeline() {
  const { data: awards } = useActiveAwards();

  if (!awards || awards.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <SectionReveal className="mb-14 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Recognition
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Awards &amp; Achievements
        </h2>
      </SectionReveal>

      <div className="relative space-y-10 border-l border-border pl-8">
        {awards.map((award, i) => (
          <SectionReveal
            key={award._id}
            delay={i * 0.08}
            className="relative"
          >
            <span className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-primary">
              <AwardIcon className="h-4 w-4" />
            </span>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-semibold text-primary">
                {award.year}
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                {award.title}
              </h3>
            </div>
            {award.organization && (
              <p className="text-sm text-muted-foreground">
                {award.organization}
              </p>
            )}
            {award.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {award.description}
              </p>
            )}
            {award.image && (
              <img
                src={award.image}
                alt={award.title}
                loading="lazy"
                className="mt-3 h-24 w-24 rounded-lg object-cover"
              />
            )}
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}

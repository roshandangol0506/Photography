import { MdReveal } from "@/components/public/MdReveal";
import { SectionHeading } from "@/components/public/SectionHeading";
import type { Award } from "@/types/content";
import { cn } from "@/lib/utils";

/** Fully static - no interaction, so no JavaScript ships for this section. */
export function AwardsTimeline({ awards }: { awards: Award[] }) {
  const sorted = [...awards].sort((a, b) => b.year - a.year);
  if (sorted.length === 0) return null;

  return (
    <section id="awards" className="px-9 pt-[110px] pb-10 max-[900px]:px-5">
      <SectionHeading kicker="05 — Recognition" title="Awards & selections" />

      {/* Each entry takes one side in turn, so the list zigzags down the page
          instead of reading as a ruled ledger. */}
      <div className="mx-auto mt-16 grid max-w-[1100px] grid-cols-2 gap-x-16 gap-y-14 max-[900px]:grid-cols-1 max-[900px]:gap-y-10">
        {sorted.map((award, i) => (
          <MdReveal
            key={award._id}
            className={cn(
              i % 2 === 0 ? "col-start-1" : "col-start-2",
              "max-[900px]:col-start-1",
            )}
          >
            <p className="m-0 text-[11px] tracking-[0.16em] text-md-red uppercase">
              {award.year}
              {award.organization && ` — ${award.organization}`}
            </p>
            <h3 className="mt-3 mb-0 font-bold tracking-[-0.02em] text-[clamp(20px,2.2vw,30px)] leading-[1.2]">
              {award.title}
            </h3>
            {award.description && (
              <p className="mt-3 mb-0 max-w-[420px] text-[14px] leading-[1.7] text-md-700">
                {award.description}
              </p>
            )}
          </MdReveal>
        ))}
      </div>
    </section>
  );
}

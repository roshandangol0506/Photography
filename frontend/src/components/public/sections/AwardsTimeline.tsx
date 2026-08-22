import { useActiveAwards } from "@/api/awards";
import { MdReveal } from "@/components/public/MdReveal";
import { SectionHeading } from "@/components/public/SectionHeading";
import { cn } from "@/lib/utils";

const SKELETON_ROWS = 3;

export function AwardsTimeline() {
  const { data, isLoading } = useActiveAwards();
  const awards = [...(data ?? [])].sort((a, b) => b.year - a.year);

  if (!isLoading && awards.length === 0) return null;

  return (
    <section id="awards" className="px-9 pt-[110px] pb-10 max-[900px]:px-5">
      <SectionHeading kicker="Recognition" title="Awards & selections" />

      {/* Two columns with each entry taking one side in turn, so the list
          zigzags down the page instead of reading as a ruled ledger. */}
      <div className="mx-auto mt-16 grid max-w-[1100px] grid-cols-2 gap-x-16 gap-y-14 max-[900px]:grid-cols-1 max-[900px]:gap-y-10">
        {isLoading
          ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "space-y-3",
                  i % 2 === 0 ? "col-start-1" : "col-start-2",
                  "max-[900px]:col-start-1",
                )}
                aria-hidden="true"
              >
                <div className="h-[11px] w-24 bg-md-300" />
                <div className="h-[28px] w-3/4 bg-md-300" />
                <div className="h-[11px] w-1/2 bg-md-300" />
              </div>
            ))
          : awards.map((award, i) => (
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

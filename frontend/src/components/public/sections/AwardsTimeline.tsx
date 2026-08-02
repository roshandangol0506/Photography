import { useActiveAwards } from "@/api/awards";
import { MdReveal } from "@/components/public/MdReveal";
import { cn } from "@/lib/utils";

const SKELETON_ROWS = 3;

export function AwardsTimeline() {
  const { data, isLoading } = useActiveAwards();
  const awards = [...(data ?? [])].sort((a, b) => b.year - a.year);

  if (!isLoading && awards.length === 0) return null;

  return (
    <section
      id="awards"
      className="mt-[70px] border-t-2 border-md-divider px-9 pt-[110px] pb-10"
    >
      <span className="text-[11px] tracking-[0.2em] text-md-red uppercase">
        05 &mdash; Recognition
      </span>

      <div className="mt-11 grid grid-cols-[0.9fr_1.1fr] items-start gap-16 max-[900px]:grid-cols-1">
        <MdReveal>
          <h2 className="m-0 font-bold tracking-[-0.025em] text-[clamp(28px,3.6vw,54px)] leading-none">
            <span className="block">Awards &amp;</span>
            <span className="block">selections</span>
          </h2>
        </MdReveal>

        <ul className="m-0 list-none p-0">
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-baseline gap-8 border-t-2 border-md-divider py-6",
                    i === SKELETON_ROWS - 1 && "border-b-2",
                  )}
                  aria-hidden="true"
                >
                  <span className="h-[34px] min-w-[110px] bg-md-300" />
                  <span className="flex-1">
                    <span className="block h-[14px] w-2/3 bg-md-300" />
                    <span className="mt-1 block h-[11px] w-1/3 bg-md-300" />
                  </span>
                </li>
              ))
            : null}
          {awards.map((award, i) => (
            <MdReveal key={award._id}>
              <li
                className={cn(
                  "flex items-baseline gap-8 border-t-2 border-md-divider py-6",
                  i === awards.length - 1 && "border-b-2",
                )}
              >
                <span className="min-w-[110px] font-bold tracking-[-0.02em] text-[clamp(22px,2.4vw,34px)]">
                  {award.year}
                </span>
                <span className="flex-1">
                  <span className="block text-[14px] font-semibold">
                    {award.title}
                  </span>
                  {award.organization && (
                    <span className="mt-1 block text-[11px] tracking-[0.14em] text-md-600 uppercase">
                      {award.organization}
                    </span>
                  )}
                </span>
              </li>
            </MdReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

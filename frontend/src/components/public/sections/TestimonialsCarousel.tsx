import { useState } from "react";
import { useActiveTestimonials } from "@/api/testimonials";
import { MdReveal } from "@/components/public/MdReveal";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { cn } from "@/lib/utils";

export function TestimonialsCarousel() {
  const { data, isLoading } = useActiveTestimonials();
  const testimonials = data ?? [];
  const [index, setIndex] = useState(0);

  if (!isLoading && testimonials.length === 0) return null;

  const active = testimonials[index % testimonials.length];

  return (
    <section id="tours" className="px-9 pt-[110px] pb-10">
      <span className="text-[11px] tracking-[0.2em] text-md-red uppercase">
        07 &mdash; Testimonials
      </span>

      {isLoading ? (
        <div
          className="mt-11 grid grid-cols-2 items-end gap-16 max-[900px]:grid-cols-1"
          aria-hidden="true"
        >
          <div className="aspect-square bg-md-300" />
          <div>
            <div className="h-[34px] w-full bg-md-300" />
            <div className="mt-2 h-[34px] w-4/5 bg-md-300" />
            <div className="mt-8 flex items-center gap-4 border-t-2 border-md-divider pt-[18px]">
              <div className="h-[52px] w-[52px] flex-none bg-md-300" />
              <div className="flex-1">
                <div className="h-[12px] w-1/2 bg-md-300" />
                <div className="mt-1 h-[11px] w-1/3 bg-md-300" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-11 grid grid-cols-2 items-end gap-16 max-[900px]:grid-cols-1">
          <MdReveal className="md-photo overflow-hidden grayscale">
            <div className="aspect-square">
              {active.image ? (
                <ProgressiveImage
                  src={active.image}
                  sizes="(max-width: 900px) 100vw, 50vw"
                  alt={active.name}
                  className="h-full w-full"
                />
              ) : (
                <div className="h-full w-full bg-md-300" aria-hidden="true" />
              )}
            </div>
          </MdReveal>

          <MdReveal>
            <blockquote className="m-0 font-semibold tracking-[-0.02em] text-[clamp(20px,2.3vw,34px)] leading-[1.22] text-pretty">
              &ldquo;{active.message}&rdquo;
            </blockquote>

            <div className="mt-8 flex items-center gap-4 border-t-2 border-md-divider pt-[18px]">
              <div className="h-[52px] w-[52px] flex-none grayscale">
                {active.avatar ? (
                  <ProgressiveImage
                    src={active.avatar}
                    sizes="52px"
                    alt={active.name}
                    className="h-full w-full"
                  />
                ) : (
                  <div className="h-full w-full bg-md-300" aria-hidden="true" />
                )}
              </div>
              <div>
                <p className="m-0 text-[12px] font-bold tracking-[0.14em] uppercase">
                  {active.name}
                </p>
                {active.role && (
                  <p className="mt-1 mb-0 text-[11px] tracking-[0.12em] text-md-600 uppercase">
                    {active.role}
                  </p>
                )}
              </div>
            </div>

            {/* The dashes double as the only control the design offers, so they
              are buttons rather than the mock's inert spans. */}
            <div className="mt-[26px] flex gap-[10px]">
              {testimonials.map((testimonial, i) => (
                <button
                  key={testimonial._id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={cn(
                    "h-[2px] w-[34px] cursor-pointer appearance-none border-0 p-0",
                    i === index ? "bg-md-red" : "bg-md-400",
                  )}
                />
              ))}
            </div>
          </MdReveal>
        </div>
      )}
    </section>
  );
}

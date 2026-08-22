"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { Testimonial } from "@/types/content";
import { useSite } from "@/components/providers/SiteProvider";
import { MdReveal } from "@/components/public/MdReveal";
import { SectionHeading } from "@/components/public/SectionHeading";
import Image from "next/image";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;

const ARROW_CLASS =
  "flex h-11 w-11 flex-none cursor-pointer items-center justify-center bg-transparent p-0 transition-colors duration-200 hover:border-md-red hover:text-md-red";

export function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const { settings } = useSite();
  const prefersReducedMotion = useReducedMotion();
  const count = testimonials.length;
  const [index, setIndex] = useState(0);
  // Bumped on a manual jump so autoplay restarts from the chosen slide.
  const [restart, setRestart] = useState(0);

  const animate = settings.animationsEnabled && !prefersReducedMotion;

  useEffect(() => {
    if (!animate || count < 2) return;
    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % count),
      AUTOPLAY_MS,
    );
    return () => clearInterval(timer);
  }, [animate, count, restart]);

  if (count === 0) return null;

  const active = testimonials[index % testimonials.length];

  const goTo = (next: number) => {
    if (count === 0) return;
    setIndex(((next % count) + count) % count);
    setRestart((prev) => prev + 1);
  };

  return (
    <section id="tours" className="px-9 pt-[110px] pb-10">
      <SectionHeading
        title="Testimonials"
        lead="What People Say About My Work"
      />

      <div className="relative">
        {" "}
        {count > 1 && (
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Show previous testimonial"
            className={cn(
              ARROW_CLASS,
              "absolute top-1/2 left-0 z-10 -translate-y-1/2",
            )}
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
        )}
        <div className="relative mt-11 grid grid-cols-2 items-end gap-16 max-[900px]:grid-cols-1 px-20">
          <MdReveal className="md-photo overflow-hidden">
            <div className="relative aspect-5/4.5">
              {active.image ? (
                <Image
                  src={active.image}
                  alt={active.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className="object-cover select-none"
                  draggable={false}
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
              <div className="relative h-[52px] w-[52px] flex-none">
                {active.avatar ? (
                  <Image
                    src={active.avatar}
                    alt={active.name}
                    fill
                    sizes="52px"
                    className="object-cover select-none"
                    draggable={false}
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
        {count > 1 && (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Show next testimonial"
            className={cn(
              ARROW_CLASS,
              "absolute top-1/2 right-0 z-10 -translate-y-1/2",
            )}
          >
            <ChevronRight className="h-10 w-10" />
          </button>
        )}
      </div>
    </section>
  );
}

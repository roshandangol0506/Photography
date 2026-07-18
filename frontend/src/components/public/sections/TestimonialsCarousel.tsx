import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Star } from "lucide-react";
import { useActiveTestimonials } from "@/api/testimonials";
import { SectionReveal } from "@/components/public/SectionReveal";

export function TestimonialsCarousel() {
  const { data: testimonials } = useActiveTestimonials();
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "center" }, [
    Autoplay({ delay: 4500, stopOnMouseEnter: true, stopOnInteraction: false }),
  ]);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <SectionReveal className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Testimonials
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          What Clients Say
        </h2>
      </SectionReveal>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className="flex-[0_0_100%] px-2 sm:flex-[0_0_50%]"
            >
              <div className="flex h-full flex-col items-center rounded-2xl border border-border bg-card p-8 text-center">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    loading="lazy"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div className="mt-3 flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4"
                      fill={i < testimonial.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  &ldquo;{testimonial.message}&rdquo;
                </p>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  {testimonial.name}
                </p>
                {testimonial.role && (
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

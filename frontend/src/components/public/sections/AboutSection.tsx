import { Link } from "react-router-dom";
import { ArrowRight, Mouse } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { SectionReveal } from "@/components/public/SectionReveal";

// Image and the detail blurbs beneath it share this width so their edges line up.
const IMAGE_WIDTH_CLASS = "mx-auto w-[70%]";

export function AboutSection() {
  const { settings } = useTheme();
  const { about } = settings;

  if (!about?.title && !about?.description && !about?.image) return null;

  const location = settings.contactDetails?.location;

  return (
    <section
      id="about"
      className="relative flex min-h-screen flex-col px-4 sm:px-6 lg:px-44"
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        About &mdash; 01
      </p>

      <div className="grid flex-1 grid-cols-1 gap-10 lg:mt-0 lg:grid-cols-2">
        {/* Text column — lead paragraph starts at the top, display headline anchors the bottom */}
        <SectionReveal className="order-2 flex flex-col justify-end lg:order-1 lg:justify-between lg:pb-16">
          <div className="ml-auto w-full max-w-lg">
            <p className="text-right text-sm font-semibold text-foreground sm:text-base">
              Get to know the person behind the lens
            </p>
            {about.description && (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                {about.description}
              </p>
            )}
          </div>

          <div className="mt-12 lg:mt-0">
            <h2 className="text-2xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-6xl">
              {about.title || "Behind the Camera"}
              {settings.tagline && (
                <span className="block text-muted-foreground">
                  {settings.tagline}
                </span>
              )}
            </h2>

            <div className="mt-8 flex items-end justify-between gap-6">
              <Link
                to="/about"
                className="inline-flex items-center gap-3 rounded-md bg-foreground px-6 py-4 text-sm font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90"
              >
                Book a Tour
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div
                className="hidden flex-col items-center gap-1 text-muted-foreground sm:flex"
                aria-hidden="true"
              >
                <span className="text-xs uppercase tracking-[0.2em]">
                  Scroll
                </span>
                <Mouse className="h-5 w-5" />
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* Image column — single portrait with the two detail blurbs beneath it */}
        <SectionReveal
          delay={0.1}
          className="order-1 flex flex-col justify-start gap-6 lg:order-2 lg:pb-16"
        >
          {about.image ? (
            <img
              src={about.image}
              alt={about.title || "About"}
              loading="lazy"
              className={`aspect-7/9 rounded-sm object-cover ${IMAGE_WIDTH_CLASS}`}
            />
          ) : (
            <div
              className={`aspect-7/9 rounded-sm bg-muted ${IMAGE_WIDTH_CLASS}`}
            />
          )}

          {(Boolean(about.experienceYears) || location) && (
            <div className={`grid grid-cols-2 gap-6 ${IMAGE_WIDTH_CLASS}`}>
              {Boolean(about.experienceYears) && (
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {about.experienceYears}+ Years of Experience
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Shooting weddings, portraits and stories worth keeping
                  </p>
                </div>
              )}
              {location && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    Based in {location}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Available worldwide for commissioned work
                  </p>
                </div>
              )}
            </div>
          )}
        </SectionReveal>
      </div>
    </section>
  );
}

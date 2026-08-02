import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { MdReveal } from "@/components/public/MdReveal";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";

const DEFAULT_HEADING = "Hey, I'm\nAjay Maharjan.";
const DEFAULT_DESCRIPTION =
  "The camera became a bridge — to people, to festivals, to traditions I would never otherwise have met. Every frame is a chance to learn.";

export function AboutSection() {
  const { settings } = useTheme();
  const about = settings.about;

  if (!about?.image && !about?.description) return null;

  const heading = (about.title || DEFAULT_HEADING).split("\n");

  return (
    <section
      id="about"
      className="mt-[70px] border-t-2 border-md-divider px-9 pt-[80px] pb-10"
    >
      <span className="text-[11px] tracking-[0.2em] text-md-red uppercase">
        02 &mdash; About
      </span>

      <div className="mt-12 grid grid-cols-2 items-end gap-[72px] max-[900px]:grid-cols-1">
        <MdReveal className="md-photo overflow-hidden">
          <div className="aspect-6/5">
            {about.image ? (
              <ProgressiveImage
                src={about.image}
                sizes="(max-width: 900px) 100vw, 50vw"
                alt={settings.siteTitle}
                className="h-full w-full"
              />
            ) : (
              <div className="h-full w-full bg-md-300" aria-hidden="true" />
            )}
          </div>
        </MdReveal>

        <div className="grid grid-cols-[0.75fr_1fr] items-end gap-10 max-[900px]:grid-cols-1">
          <MdReveal>
            <div className="aspect-[5/6] overflow-hidden">
              {about.portraitImage ? (
                <ProgressiveImage
                  src={about.portraitImage}
                  sizes="(max-width: 900px) 100vw, 25vw"
                  alt={settings.siteTitle}
                  className="h-full w-full"
                />
              ) : (
                <div className="h-full w-full bg-md-300" aria-hidden="true" />
              )}
            </div>
            <div className="mt-[14px] border-t-2 border-md-divider pt-3">
              <p className="m-0 text-[12px] font-bold tracking-[0.16em] uppercase">
                {settings.siteTitle}
              </p>
              <p className="mt-[5px] mb-0 text-[11px] tracking-[0.12em] text-md-600 uppercase">
                Photographer &mdash; {about.experienceYears ?? 0} yrs
              </p>
            </div>
          </MdReveal>

          <MdReveal>
            <h2 className="m-0 font-bold tracking-[-0.025em] text-[clamp(28px,3.6vw,54px)] leading-none">
              {heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-6 mb-0 max-w-[360px] text-[12px] leading-[1.85] tracking-[0.09em] text-md-700 uppercase">
              {about.description || DEFAULT_DESCRIPTION}
            </p>
            <Link
              to="/about"
              className="mt-7 inline-flex items-center gap-4 bg-md-ink px-5 py-4 text-[12px] font-semibold tracking-[0.16em] text-md-light! uppercase transition-colors duration-200 hover:bg-md-red hover:text-md-light!"
            >
              Learn more <span>&rarr;</span>
            </Link>
          </MdReveal>
        </div>
      </div>
    </section>
  );
}

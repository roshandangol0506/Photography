import { Link } from "react-router-dom";
import { useActiveCategories } from "@/api/categories";
import { usePublicPhotos } from "@/api/photos";
import { useSeo } from "@/hooks/useSeo";
import { useTheme } from "@/hooks/useTheme";
import { MdReveal } from "@/components/public/MdReveal";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { AwardsTimeline } from "@/components/public/sections/AwardsTimeline";
import { TestimonialsCarousel } from "@/components/public/sections/TestimonialsCarousel";

const DEFAULT_HEADLINE = "Ten years\nbehind the camera.";
const DEFAULT_LEAD =
  "I photograph the moments that sit between the big ones — the quiet minute before a festival begins, the glance across a crowded street, the light that only lasts a second.";
const DEFAULT_DESCRIPTION =
  "The camera became a bridge — to people, to festivals, to traditions I would never otherwise have met. Every frame is a chance to learn.";

// Editorial copy for the page; not CMS-backed yet.
const APPROACH = [
  {
    title: "Watch first",
    body: "I rarely raise the camera in the first hour. Understanding how a place moves — where people gather, where the light falls — is what makes the frame that follows worth keeping.",
  },
  {
    title: "Stay close",
    body: "Documentary work is built on trust, not on long lenses. I introduce myself, I come back the next day, and I send the photographs to the people in them.",
  },
  {
    title: "Print it",
    body: "A photograph is finished when it exists on paper. Everything in the archive is graded with a print in mind, not a screen.",
  },
];

const SECTION_CLASS = "px-9 max-[900px]:px-5";
const KICKER_CLASS = "text-[11px] tracking-[0.2em] text-md-red uppercase";
const H2_CLASS =
  "mt-[14px] mb-0 font-bold tracking-[-0.025em] text-[clamp(28px,3.6vw,54px)] leading-none";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="m-0 font-bold tracking-[-0.02em] text-[clamp(30px,3.4vw,48px)] leading-none">
        {value}
      </p>
      <p className="mt-2 mb-0 text-[11px] tracking-[0.16em] text-md-600 uppercase">
        {label}
      </p>
    </div>
  );
}

export default function AboutMe() {
  const { settings } = useTheme();
  const about = settings.about;
  const { data: photoData } = usePublicPhotos({ perpage: 1 });
  const { data: categories } = useActiveCategories();

  useSeo({
    title: "About",
    description: about?.description || "Learn more about the photographer.",
    image: about?.image,
  });

  const headline = (about?.title || DEFAULT_HEADLINE).split("\n");
  const totalPhotos = photoData?.pagination.total ?? 0;
  const series = categories ?? [];
  const countries = new Set(
    series.map((item) => item.country?.trim()).filter(Boolean),
  );

  return (
    <div className="modernist bg-md-ground text-md-fg">
      <section className={`${SECTION_CLASS} pt-[70px] pb-10`}>
        <span className={KICKER_CLASS}>About</span>
        <h1 className="mt-[18px] mb-0 font-extrabold tracking-[-0.03em] text-[clamp(34px,5.4vw,84px)] leading-[0.94]">
          {headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-8 mb-0 max-w-[620px] text-[15px] leading-[1.75] text-md-700">
          {settings.tagline || DEFAULT_LEAD}
        </p>
      </section>

      <section className={`${SECTION_CLASS} pb-[70px]`}>
        <div className="grid grid-cols-[1.15fr_0.85fr] items-end gap-[72px] max-[900px]:grid-cols-1 max-[900px]:gap-10">
          <MdReveal className="md-photo overflow-hidden">
            <div className="aspect-[4/3]">
              {about?.image ? (
                <ProgressiveImage
                  src={about.image}
                  sizes="(max-width: 900px) 100vw, 60vw"
                  alt={settings.siteTitle}
                  className="h-full w-full"
                />
              ) : (
                <div className="h-full w-full bg-md-300" aria-hidden="true" />
              )}
            </div>
          </MdReveal>

          <MdReveal>
            <p className="m-0 text-[15px] leading-[1.8] whitespace-pre-line text-md-700">
              {about?.description || DEFAULT_DESCRIPTION}
            </p>
            <div className="mt-8 border-t-2 border-md-divider pt-5">
              <p className="m-0 text-[12px] font-bold tracking-[0.16em] uppercase">
                {settings.siteTitle}
              </p>
              <p className="mt-[5px] mb-0 text-[11px] tracking-[0.12em] text-md-600 uppercase">
                {settings.contactDetails?.location || "Documentary & travel"}
              </p>
            </div>
          </MdReveal>
        </div>
      </section>

      <section
        className={`${SECTION_CLASS} border-t-2 border-md-divider py-[60px]`}
      >
        <div className="grid grid-cols-4 gap-10 max-[900px]:grid-cols-2">
          <Stat
            value={`${about?.experienceYears ?? 0}+`}
            label="Years shooting"
          />
          <Stat value={String(totalPhotos)} label="Photographs published" />
          <Stat value={String(series.length)} label="Photo series" />
          <Stat value={String(countries.size)} label="Countries" />
        </div>
      </section>

      <section
        className={`${SECTION_CLASS} border-t-2 border-md-divider pt-[70px] pb-[70px]`}
      >
        <span className={KICKER_CLASS}>How I work</span>
        <h2 className={H2_CLASS}>Three rules I keep.</h2>

        <div className="mt-12 grid grid-cols-3 gap-[52px] max-[900px]:grid-cols-1 max-[900px]:gap-10">
          {APPROACH.map((item, i) => (
            <MdReveal key={item.title}>
              <span className="text-[11px] tracking-[0.16em] text-md-500 uppercase">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 mb-0 text-[20px] font-bold tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="mt-3 mb-0 text-[14px] leading-[1.75] text-md-700">
                {item.body}
              </p>
            </MdReveal>
          ))}
        </div>
      </section>

      {about?.portraitImage && (
        <section className={`${SECTION_CLASS} pb-[70px]`}>
          <div className="grid grid-cols-[0.8fr_1.2fr] items-center gap-[72px] max-[900px]:grid-cols-1 max-[900px]:gap-10">
            <MdReveal className="md-photo overflow-hidden">
              <div className="aspect-[3/4]">
                <ProgressiveImage
                  src={about.portraitImage}
                  sizes="(max-width: 900px) 100vw, 40vw"
                  alt={settings.siteTitle}
                  className="h-full w-full"
                />
              </div>
            </MdReveal>

            <MdReveal>
              <span className={KICKER_CLASS}>In the field</span>
              <h2 className={H2_CLASS}>
                <span className="block">Most of the archive</span>
                <span className="block">was made on foot.</span>
              </h2>
              <p className="mt-7 mb-0 max-w-[520px] text-[15px] leading-[1.8] text-md-700">
                Festivals in Kathmandu, colour in Mathura, fishermen on Inle
                Lake — the work is slow, and it is walked. If you would like a
                print, a commission, or a place on one of the street photography
                walks, the door is open.
              </p>
              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-4 bg-md-ink px-5 py-4 text-[12px] font-semibold tracking-[0.16em] text-md-light uppercase transition-colors duration-200 hover:bg-md-red"
              >
                Get in touch <span>&rarr;</span>
              </Link>
            </MdReveal>
          </div>
        </section>
      )}

      {series.length > 0 && (
        <section
          className={`${SECTION_CLASS} border-t-2 border-md-divider pt-[70px] pb-[70px]`}
        >
          <span className={KICKER_CLASS}>The work</span>
          <h2 className={H2_CLASS}>Series in the archive.</h2>
          <ul className="mt-10 m-0 list-none p-0">
            {series.map((item) => (
              <li key={item._id} className="border-t-2 border-md-divider">
                <Link
                  to={`/gallery?category=${item.slug}`}
                  className="flex items-baseline gap-7 py-5 transition-colors duration-200 hover:text-md-red max-[900px]:flex-wrap max-[900px]:gap-3"
                >
                  <span className="text-[clamp(18px,2.2vw,28px)] font-bold tracking-[-0.02em]">
                    {item.name}
                  </span>
                  {item.country && (
                    <span className="text-[11px] tracking-[0.14em] text-md-600 uppercase">
                      {item.country}
                    </span>
                  )}
                  <span className="ml-auto text-[11px] tracking-[0.14em] text-md-500 uppercase">
                    {item.photoCount} frames
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AwardsTimeline />
      <TestimonialsCarousel />
    </div>
  );
}

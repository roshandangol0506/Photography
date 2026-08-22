import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";
import { useTheme } from "@/hooks/useTheme";
import { MdReveal } from "@/components/public/MdReveal";
import { AwardsTimeline } from "@/components/public/sections/AwardsTimeline";
import { TestimonialsCarousel } from "@/components/public/sections/TestimonialsCarousel";

const SECTION_CLASS = "px-9 max-[900px]:px-5";

// Two-column rhythm from the reference: heading in a fixed left rail, body and
// photograph sharing the right column.
const RAIL_CLASS =
  "grid grid-cols-[220px_1fr] gap-x-14 gap-y-12 max-[900px]:grid-cols-1 max-[900px]:gap-y-6";
const RAIL_TITLE_CLASS =
  "m-0 text-[clamp(22px,2.4vw,30px)] font-normal tracking-[-0.01em] leading-tight";
const BODY_CLASS = "m-0 max-w-[640px] text-[14px] leading-[1.75] text-md-700";

const HERO_LEAD =
  "I'm Ajay Maharjan, a Kathmandu-based photographer with over a decade of experience capturing the human spirit through portraiture, travel, and documentary photography.";

// Editorial copy for the page; not CMS-backed yet.
const BLOCKS = [
  {
    title: "My Mission",
    image: "/about1.jpg",
    paragraphs: [
      "My journey as a photographer has allowed me to explore various genres, from intimate portraits to breathtaking landscapes and everything in between. I thrive on the diversity that photography offers.",
      "Though naturally introverted, photography has become my language — one that lets me form genuine connections and tell human-centered stories with honesty and empathy.",
    ],
  },
  {
    title: "My Story",
    image: "/about2.jpg",
    paragraphs: [
      "My work blends emotion, light, and storytelling, rooted in a deep respect for the people and cultures I photograph. I've had the privilege of working as a consultant photographer for the World Health Organization (WHO) Nepal since 2020, and have collaborated with leading organizations including UNFPA, UNHCR, KOICA, UNOPS, UNODC, AUR, USP, ICIMOD, and The Asia Foundation.",
      "My photographs have supported powerful campaigns and documentation efforts across Nepal.",
    ],
  },
  {
    title: "Teaching & Tours",
    image: "/about3.jpg",
    paragraphs: [
      "As a mentor at Nikon Nepal and founder of Photo Venture Nepal, I also conduct photography workshops and lead immersive photo tours through Kathmandu's vibrant streets, guiding others to see beyond the surface and connect deeply with their subjects.",
    ],
  },
];

export default function AboutMe() {
  const { settings } = useTheme();

  useSeo({
    title: "About",
    description: settings.about?.description || HERO_LEAD,
    image: settings.about?.image,
  });

  return (
    <div className="modernist bg-md-ground text-md-fg">
      <section className="relative h-screen min-h-[620px] overflow-hidden bg-md-ink">
        <img
          src="/about.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "rgba(20,19,18,.42)" }}
        />

        <div className="relative flex h-full items-center justify-center px-9 text-md-light max-[900px]:flex-col max-[900px]:gap-8 max-[900px]:px-5">
          <h1 className="m-0 text-center font-normal tracking-[-0.02em] text-[clamp(52px,9vw,132px)] leading-none">
            About
          </h1>
          {/* Sits to the right of the wordmark on desktop, beneath it below. */}
          <p className="absolute right-9 m-0 max-w-[290px] text-[13px] leading-[1.65] max-[900px]:static max-[900px]:max-w-[420px] max-[900px]:text-center">
            {HERO_LEAD}
          </p>
        </div>
      </section>

      {BLOCKS.map((block) => (
        <section
          key={block.title}
          className={`${SECTION_CLASS} pt-[90px] max-[900px]:pt-[60px]`}
        >
          <div className={RAIL_CLASS}>
            <h2 className={RAIL_TITLE_CLASS}>{block.title}</h2>

            <div className="flex flex-col gap-5">
              {block.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className={BODY_CLASS}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Empty rail cell so the photograph lines up under the body. */}
            <div className="max-[900px]:hidden" aria-hidden="true" />

            <MdReveal className="md-photo overflow-hidden">
              <img
                src={block.image}
                alt={block.title}
                loading="lazy"
                className="h-auto w-full"
              />
            </MdReveal>
          </div>
        </section>
      ))}

      <div className="mt-[70px]">
        <AwardsTimeline />
        <TestimonialsCarousel />
      </div>

      <section className={`${SECTION_CLASS} pt-[90px] pb-[110px] text-center`}>
        <h2 className="m-0 font-normal tracking-[-0.02em] text-[clamp(30px,4.4vw,58px)] leading-none">
          Let's work together
        </h2>
        <p className="mx-auto mt-6 mb-0 max-w-[520px] text-[14px] leading-[1.75] text-md-700">
          Commissions, prints, workshops and photo tours — tell me what you have
          in mind and I will come back to you personally.
        </p>
        <Link
          to="/contact"
          className="mt-9 inline-flex items-center gap-4 border-2 border-md-divider px-6 py-4 text-[12px] font-semibold tracking-[0.16em] uppercase transition-colors duration-200 hover:border-md-red hover:text-md-red"
        >
          Get in touch <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>
    </div>
  );
}

"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { MapPin } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getImageProps } from "next/image";
import { useRef } from "react";

// Adapted from the 21st.dev "modern hero":
// - The component's own fixed <Nav> is dropped: the site layout already
//   renders HomeNavbar over the top edge, and the two would stack.
// - react-icons are swapped for lucide-react, which the project already uses.
// - The unused ReactLenis import is gone, so lenis is not a dependency.
// - The parallax photos come from /public; the centre image is still Unsplash.

const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

/**
 * A photo from /public, sent through the Next image optimizer: some originals
 * are full-size camera files, far too heavy to hand the browser directly.
 * `width` is the most the image is shown at; the source comes back at twice
 * that for 2x screens.
 */
const photo = (n: number, width: number) =>
  getImageProps({ src: `/${n}.jpg`, alt: "", width, height: width }).props.src;

export const SmoothScrollHero = () => {
  return (
    <div className="bg-zinc-950">
      <Hero />
      <Schedule />
    </div>
  );
};

const SECTION_HEIGHT = 1500;

const Hero = () => {
  return (
    <div
      style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
      className="relative w-full"
    >
      <CenterImage />

      <ParallaxImages />

      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-zinc-950/0 to-zinc-950" />
    </div>
  );
};

const CenterImage = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  // How far the page has scrolled into this hero (0 until its top reaches
  // the top of the screen). The reveal used to read scrollY directly, which
  // only worked with the hero at the very top of the page.
  const scrolled = useTransform(scrollY, (y) => {
    const hero = ref.current?.parentElement;
    return hero ? Math.max(0, -hero.getBoundingClientRect().top) : y;
  });

  const clip1 = useTransform(scrolled, [0, 1500], [25, 0]);
  const clip2 = useTransform(scrolled, [0, 1500], [75, 100]);

  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  const backgroundSize = useTransform(
    scrolled,
    [0, SECTION_HEIGHT + 500],
    ["170%", "100%"],
  );
  const opacity = useTransform(
    scrolled,
    [SECTION_HEIGHT, SECTION_HEIGHT + 500],
    [1, 0],
  );

  // Reduced motion: the photo shown whole and still, no scroll-driven reveal.
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className="sticky top-0 h-screen w-full"
      style={{
        ...(reduced
          ? { backgroundSize: "cover" }
          : { clipPath, backgroundSize, opacity }),
        backgroundImage: `url(${photo(16, 4800)})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

const ParallaxImages = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[200px]">
      {/* Widths are each slot's share of the 1024px column. */}
      <ParallaxImg
        src={photo(4, 680)}
        alt="A sharp Himalayan peak rising above a sea of cloud, in black and white"
        start={-200}
        end={200}
        className="w-1/3"
      />
      <ParallaxImg
        src={photo(18, 1580)}
        alt="A masked dancer in a red and gold costume performing in a brick-built square"
        start={200}
        end={-250}
        className="mx-auto w-2/3"
      />
      <ParallaxImg
        src={photo(2, 960)}
        alt="A snow-dusted Himalayan peak against a deep blue sky"
        start={-200}
        end={200}
        className="ml-auto w-1/3"
      />
      <ParallaxImg
        src={photo(12, 1260)}
        alt="A masked festival dancer surrounded by a crowd holding umbrellas"
        start={0}
        end={-500}
        className="ml-24 w-5/12"
      />
    </div>
  );
};

interface ParallaxImgProps {
  className?: string;
  alt: string;
  src: string;
  start: number;
  end: number;
}

const ParallaxImg = ({ className, alt, src, start, end }: ParallaxImgProps) => {
  const ref = useRef<HTMLImageElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);

  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;
  // Reduced motion: the photos sit still in the flow, no parallax.
  const reduced = useReducedMotion();

  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      ref={ref}
      style={reduced ? undefined : { transform, opacity }}
    />
  );
};

const Schedule = () => {
  return (
    <section
      id="launch-schedule"
      className="mx-auto max-w-5xl px-4 py-48 text-white"
    >
      <motion.h2
        initial={{ y: 48, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.75 }}
        className="mb-20 text-4xl font-black uppercase text-zinc-50"
      >
        Launch Schedule
      </motion.h2>
      <ScheduleItem title="NG-21" date="Dec 9th" location="Florida" />
      <ScheduleItem title="Starlink" date="Dec 20th" location="Texas" />
      <ScheduleItem title="Starlink" date="Jan 13th" location="Florida" />
      <ScheduleItem title="Turksat 6A" date="Feb 22nd" location="Florida" />
      <ScheduleItem title="NROL-186" date="Mar 1st" location="California" />
      <ScheduleItem title="GOES-U" date="Mar 8th" location="California" />
      <ScheduleItem title="ASTRA 1P" date="Apr 8th" location="Texas" />
    </section>
  );
};

interface ScheduleItemProps {
  title: string;
  date: string;
  location: string;
}

const ScheduleItem = ({ title, date, location }: ScheduleItemProps) => {
  return (
    <motion.div
      initial={{ y: 48, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.75 }}
      className="mb-9 flex items-center justify-between border-b border-zinc-800 px-3 pb-9"
    >
      <div>
        <p className="mb-1.5 text-xl text-zinc-50">{title}</p>
        <p className="text-sm uppercase text-zinc-500">{date}</p>
      </div>
      <div className="flex items-center gap-1.5 text-end text-sm uppercase text-zinc-500">
        <p>{location}</p>
        <MapPin className="size-4" />
      </div>
    </motion.div>
  );
};

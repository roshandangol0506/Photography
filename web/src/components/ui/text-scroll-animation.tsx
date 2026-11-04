"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import ReactLenis from "lenis/react";
// Lenis's recommended base styles. Every rule is scoped to `html.lenis`, which
// only exists while a Lenis instance is mounted, so this is inert elsewhere.
import "lenis/dist/lenis.css";
import React, { useRef, type SVGProps } from "react";
import { cn } from "@/lib/utils";
import {
  BehanceIcon,
  FacebookIcon,
  FiveHundredPxIcon,
  InstagramIcon,
  TwitterIcon,
  YouTubeIcon,
} from "@/components/icons/SocialIcons";

type CharacterProps = {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: any;
};

const CharacterV1 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}: CharacterProps) => {
  const isSpace = char === " ";
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );
  // Reduced motion: letters in their resting place, no scroll travel.
  const reduced = useReducedMotion();

  return (
    <motion.span
      className={cn("inline-block text-md-red", isSpace && "w-4")}
      style={reduced ? undefined : { x, rotateX }}
    >
      {char}
    </motion.span>
  );
};

const CharacterV2 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}: CharacterProps) => {
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);
  const y = useTransform(
    scrollYProgress,
    [0, 0.5],
    [Math.abs(distanceFromCenter) * 50, 0],
  );
  const reduced = useReducedMotion();

  return (
    <motion.img
      src={char}
      alt=""
      className="h-16 w-16 shrink-0 object-contain will-change-transform"
      style={reduced ? undefined : { x, scale, y, transformOrigin: "center" }}
    />
  );
};

/** CharacterV3's scatter: fanned out, tilted and lifted, gathering by 0.5. */
function useV3Motion(
  scrollYProgress: CharacterProps["scrollYProgress"],
  distanceFromCenter: number,
) {
  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 90, 0],
  );
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.5],
    [-Math.abs(distanceFromCenter) * 20, 0],
  );
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);
  return { x, rotate, y, scale, transformOrigin: "center" };
}

const CharacterV3 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}: CharacterProps) => {
  const style = useV3Motion(scrollYProgress, index - centerIndex);
  const reduced = useReducedMotion();

  return (
    <motion.img
      src={char}
      alt=""
      className="h-16 w-16 shrink-0 object-contain will-change-transform"
      style={reduced ? undefined : style}
    />
  );
};

type SocialLink = {
  label: string;
  href: string;
  Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
};

// Placeholders: swap each "#" for the profile's real address.
const SOCIAL_LINKS: SocialLink[] = [
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "Twitter", href: "#", Icon: TwitterIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "YouTube", href: "#", Icon: YouTubeIcon },
  { label: "Behance", href: "#", Icon: BehanceIcon },
  { label: "500px", href: "#", Icon: FiveHundredPxIcon },
];

/**
 * A social link in CharacterV3's place: the same 64px tile and the same
 * scatter, with the brand mark in the text colour, turning red on hover.
 * The hover colour is `!`: `.modernist a` (globals.css) sets every link's
 * colour outside the layers, which outranks a plain utility.
 */
const SocialLinkV3 = ({
  link,
  index,
  centerIndex,
  scrollYProgress,
}: {
  link: SocialLink;
  index: number;
  centerIndex: number;
  scrollYProgress: CharacterProps["scrollYProgress"];
}) => {
  const style = useV3Motion(scrollYProgress, index - centerIndex);
  const reduced = useReducedMotion();
  const { Icon } = link;

  return (
    <motion.a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.label}
      className="flex h-16 w-16 shrink-0 items-center justify-center text-md-light transition-colors duration-200 will-change-transform hover:text-md-red! focus-visible:text-md-red!"
      style={reduced ? undefined : style}
    >
      <Icon aria-hidden="true" className="size-10" />
    </motion.a>
  );
};

/**
 * `smooth` wraps the page in Lenis smooth scrolling, as the original did. Turn
 * it off when the section sits on a page with other scroll-driven sections:
 * Lenis takes over scrolling for the whole page, not just this section.
 */
const Skiper31 = ({ smooth = true }: { smooth?: boolean } = {}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const targetRef3 = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({ target: targetRef });
  const { scrollYProgress: scrollYProgress3 } = useScroll({
    target: targetRef3,
  });

  const text = "see more from ";
  const characters = text.split("");
  const centerIndex = Math.floor(characters.length / 2);

  const iconCenterIndex = Math.floor(SOCIAL_LINKS.length / 2);

  const content = (
    // A section, not <main>: the site layout already provides the page's
    // one <main>.
    <section className="w-full">
      {/* Шапка-подсказка */}
      <div className="top-22 absolute left-1/2 z-10 grid -translate-x-1/2 content-start justify-items-center gap-6 text-center text-md-light">
        <span className="subtitle relative max-w-[12ch] text-md-600 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-transparent after:to-md-500 after:content-['']">
          Scroll to see more
        </span>
      </div>

      {/* Блок 1 — текст */}
      <div
        ref={targetRef}
        className="relative box-border flex h-[210vh] items-center justify-center gap-[2vw] overflow-hidden p-[2vw]"
      >
        <div
          className="w-full max-w-4xl text-center font-title text-title-1 font-semibold uppercase text-md-light"
          style={{ perspective: "500px" }}
        >
          {characters.map((char, index) => (
            <CharacterV1
              key={index}
              char={char}
              index={index}
              centerIndex={centerIndex}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>

      <div
        ref={targetRef3}
        className="relative -mt-[95vh] box-border flex h-[210vh] flex-col items-center justify-center gap-[2vw] overflow-hidden p-[2vw]"
      >
        <p className="flex items-center justify-center gap-3 font-title text-title-3 font-medium text-md-light">
          <Bracket className="h-12" />
          <span>Beyond the Frame, Discover More</span>
          <Bracket className="h-12 scale-x-[-1]" />
        </p>

        <div
          className="flex flex-wrap items-center justify-center gap-8"
          style={{ perspective: "500px" }}
        >
          {SOCIAL_LINKS.map((link, index) => (
            <SocialLinkV3
              key={link.label}
              link={link}
              index={index}
              centerIndex={iconCenterIndex}
              scrollYProgress={scrollYProgress3}
            />
          ))}
        </div>
      </div>
    </section>
  );

  return smooth ? <ReactLenis root>{content}</ReactLenis> : content;
};

export { CharacterV1, CharacterV2, CharacterV3, Skiper31 };

const Bracket = ({ className }: { className: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 27 78"
      className={className}
    >
      <path
        fill="currentColor"
        d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
      />
    </svg>
  );
};

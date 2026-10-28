"use client";

import { useCallback, useEffect, useState } from "react";
import { getImageProps } from "next/image";
import { MotionConfig, motion, type Variants } from "framer-motion";
import {
  ImageStreamHero,
  type StreamImage,
} from "@/components/ui/image-stream-hero";
import { VenomButton } from "@/components/venom-button";
import { setCursorTone } from "@/lib/cursor";
import { HeroLoader } from "./HeroLoader";

// The photos in /public are numbered 1.jpg, 2.jpg, ... Several are full-size
// camera originals (up to ~23 MB), so each goes through the Next image
// optimizer rather than straight to the browser. A 540px display width gives a
// 1080px source, which still covers the largest card on a 2x screen.
const photo = (n: number): StreamImage => ({
  src: getImageProps({
    src: `/${n}.jpg`,
    alt: "",
    width: 540,
    height: 540,
  }).props.src,
});

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => photo(from + i));

const LEFT = range(1, 10);
const RIGHT = range(11, 20);
/** What the loader waits on: every photo on both rails. */
const ASSETS = [...LEFT, ...RIGHT].map((p) => p.src);

/* ── the entrance ────────────────────────────────────────────────
 * One cue, `play`, starts all three at once as the loader fades: the
 * photos scatter out from the centre, the heading rises out of its
 * line masks, and the paragraph lifts out of its own. Timings follow
 * the reference: 1.4s on a long soft curve, characters 20ms apart.
 * ─────────────────────────────────────────────────────────────── */

/** The reference's title curve: brisk start, very long settle. */
const EASE = [0.29, 0.52, 0.5, 1] as const;
const DURATION = 1.4;
/** Seconds between characters, and between the heading's two lines. */
const CHAR_STAGGER = 0.02;
const LINE_STAGGER = 0.12;

const HEADING = ["Your work,", "front and centre."];

// Each line starts a line-height and more below its mask, slightly
// enlarged, and settles from its top-left corner.
const line: Variants = {
  hidden: { y: "120%", scale: 1.25 },
  shown: (l: number) => ({
    y: 0,
    scale: 1,
    transition: { duration: DURATION, ease: EASE, delay: l * LINE_STAGGER },
  }),
};

// Inside the line, each character trails a little further below the one
// before, so the line arrives as a soft wave rather than a slab.
const char: Variants = {
  hidden: (c: { i: number; l: number }) => ({
    opacity: 0,
    y: `${c.i * 10}%`,
    rotate: 2,
  }),
  shown: (c: { i: number; l: number }) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: DURATION,
      ease: EASE,
      delay: c.i * CHAR_STAGGER + c.l * LINE_STAGGER,
    },
  }),
};

const rise: Variants = {
  hidden: { y: "110%", opacity: 0 },
  shown: {
    y: 0,
    opacity: 1,
    // In step with the photos, which leave the centre 0.1s in.
    transition: { duration: DURATION, ease: EASE, delay: 0.1 },
  },
};

/** The heading, split into masked lines of characters for the reveal. */
function RevealHeading() {
  return (
    <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-6xl">
      <span className="sr-only">{HEADING.join(" ")}</span>
      {HEADING.map((text, l) => {
        let i = 0;
        return (
          // The mask. Padded and pulled back by the same amount, so
          // descenders aren't clipped and the line box keeps its height.
          <span
            key={text}
            aria-hidden
            className="-my-[0.12em] block overflow-hidden py-[0.12em]"
          >
            <motion.span
              data-hero-reveal
              custom={l}
              variants={line}
              className="inline-block origin-top-left"
            >
              {text.split(" ").map((word, w) => (
                <span key={w}>
                  {w > 0 && " "}
                  <span className="inline-block whitespace-nowrap">
                    {[...word].map((ch) => (
                      <motion.span
                        key={i}
                        data-hero-reveal
                        custom={{ i: i++, l }}
                        variants={char}
                        className="inline-block"
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </span>
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </h1>
  );
}

/**
 * True with a real mouse. Then the site's own cursor is the pointer, so the
 * Venom button stops drawing its glove and darkens that cursor instead; on
 * touch screens, where there is no cursor, it keeps the glove. False on the
 * server and the first render, so hydration matches.
 */
function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const read = () => setFine(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);
  return fine;
}

/**
 * The landing page hero: the image-stream corridor, left rail 1-10 and right
 * rail 11-20, behind a preloader that hands over to one synchronised entrance.
 * The preloader runs every time the hero mounts - a reload, or coming back to
 * the page inside the app - so the page always opens the same way.
 * Carries id="top" for the navbar logo link.
 */
export function StreamHero() {
  const [play, setPlay] = useState(false);
  const finePointer = useFinePointer();

  const reveal = useCallback(() => setPlay(true), []);

  // The page opens on the loader, so it opens at the top too: left to the
  // browser, a reload mid-page restores the scroll and the entrance plays
  // out of sight. Reduced motion has no entrance to miss, so it keeps its
  // place.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const prev = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  return (
    <>
      <HeroLoader assets={ASSETS} onReveal={reveal} />
      {/* Without JavaScript nothing would ever lift the loader or the
          reveal, so both stand down. */}
      <noscript>
        <style>
          {
            "[data-hero-loader]{display:none!important}[data-hero-reveal]{opacity:1!important;transform:none!important}"
          }
        </style>
      </noscript>
      <ImageStreamHero
        id="top"
        leftImages={LEFT}
        rightImages={RIGHT}
        // One card per photo, so every photo on each side is on screen.
        cards={10}
        play={play}
        className="h-screen min-h-[620px] w-full"
      >
        {/* "user": under reduced motion the text skips the movement and
            simply fades in. */}
        <MotionConfig reducedMotion="user">
          <motion.div
            initial="hidden"
            animate={play ? "shown" : "hidden"}
            className="relative z-10 flex h-full flex-col items-center justify-between pt-32 pb-16 text-center text-md-light"
          >
            <div className="px-6">
              <RevealHeading />
            </div>
            {/* A fixed-height box, so the button above it can be placed at a
                known distance from the bottom however many lines the text
                wraps to. The inner span is the mask the text rises out of. */}
            <p className="h-24 max-w-md text-balance px-6 text-sm text-md-light/80">
              <span className="block overflow-hidden pb-1">
                <motion.span data-hero-reveal variants={rise} className="block">
                  A hero that leads with the images instead of describing them.
                  Swap in your own and the corridor rebuilds around them.
                </motion.span>
              </span>
            </p>
          </motion.div>
        </MotionConfig>
        {/* The venom stage covers the whole hero, so its tendrils can reach over
            the text and the photos. Its button sits 1.5rem above the paragraph:
            pb-16 (4rem) + the paragraph's h-24 (6rem) + 1.5rem = 11.5rem. */}
        <VenomButton
          height="100%"
          // With a mouse, the goo darkens the site cursor - ring and all -
          // the way it creeps over the glove on touch screens.
          cursor={finePointer ? "native" : "glove"}
          onReach={finePointer ? setCursorTone : undefined}
          className="absolute inset-0 z-20 items-end rounded-none pb-[11.5rem]"
        />
      </ImageStreamHero>
    </>
  );
}

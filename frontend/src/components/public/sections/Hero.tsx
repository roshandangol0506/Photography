import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { useBackgroundPhotos } from "@/api/photos";
import { useTheme } from "@/hooks/useTheme";
import { ProgressiveImage } from "@/components/public/ProgressiveImage";
import { photoSrcSet } from "@/lib/image";
import { cn } from "@/lib/utils";

// Copy falls back to the handoff mock so an unconfigured CMS still renders
// the design exactly; every string below is admin-editable.
const DEFAULT_EYEBROW = "Kathmandu, Nepal — documentary & travel";
const DEFAULT_HEADLINE = "Ten years\non the street.";
const DEFAULT_TAGLINE =
  "Festivals, faces and the quiet minutes in between — photographed across Nepal, India and Myanmar.";
const DEFAULT_CTA = "Enter the archive";
const DEFAULT_SPEED_MS = 5200;

const HERO_STYLES = ["slide", "gradient", "futuristic", "photography"] as const;

type HeroStyle = (typeof HERO_STYLES)[number];

// Anything unrecognised (including the old "fade"/"zoom" values) falls through
// to the shipped look.
function heroStyle(value?: string): HeroStyle {
  return HERO_STYLES.includes(value as HeroStyle)
    ? (value as HeroStyle)
    : "photography";
}

interface FrameArgs {
  style: HeroStyle;
  isActive: boolean;
  /** The frame being replaced, still on screen for the duration of the move. */
  isPrevious: boolean;
  animate: boolean;
  speed: number;
  /** Alternates every slide so a restartable animation can re-trigger. */
  tick: number;
}

// Slow enough to read as cinematic; eased in and out rather than linear.
const SLIDE_MS = 1400;
const SLIDE_EASING = "cubic-bezier(.76,0,.24,1)";

/** Per-style presentation for one background frame. */
function frameStyle({
  style,
  isActive,
  isPrevious,
  animate,
  speed,
  tick,
}: FrameArgs): CSSProperties {
  const opacity = isActive ? 1 : 0;
  if (!animate) return { opacity };

  switch (style) {
    // A - a curtain reveal. The outgoing frame stays on top and is clipped
    // away from its right edge inwards, so its left edge never moves and the
    // incoming frame - already sitting underneath, stationary - is uncovered
    // progressively. Nothing translates, so there is no gap at any point.
    case "slide": {
      if (isPrevious) {
        return {
          opacity: 1,
          zIndex: 2,
          clipPath: "inset(0 100% 0 0)",
          WebkitClipPath: "inset(0 100% 0 0)",
          transition: `clip-path ${SLIDE_MS}ms ${SLIDE_EASING}, -webkit-clip-path ${SLIDE_MS}ms ${SLIDE_EASING}`,
        };
      }
      // The active frame waits underneath fully drawn; frames not in play sit
      // at the same un-clipped state so they are ready to become previous.
      return {
        opacity: isActive ? 1 : 0,
        zIndex: isActive ? 1 : 0,
        clipPath: "inset(0 0 0 0)",
        WebkitClipPath: "inset(0 0 0 0)",
        transition: "none",
      };
    }

    // B - the incoming frame is revealed under a soft-edged mask sweeping
    // left to right; the outgoing one simply waits underneath it.
    case "gradient":
      return {
        opacity: isActive || isPrevious ? 1 : 0,
        zIndex: isActive ? 2 : 1,
        animation: isActive
          ? `md-hero-mask-${tick % 2 === 0 ? "a" : "b"} 1.4s cubic-bezier(.16,1,.3,1) forwards`
          : undefined,
      };

    // C - the incoming frame resolves out of a blur as it settles.
    case "futuristic":
      return {
        opacity,
        transform: isActive ? "scale(1)" : "scale(1.14)",
        filter: isActive ? "blur(0px)" : "blur(20px)",
        transition:
          "opacity .9s ease, transform 1.5s cubic-bezier(.16,1,.3,1), filter 1.5s ease",
      };

    // D - the shipped look: long slow scale under a soft crossfade.
    default:
      return {
        opacity,
        transform: isActive ? "scale(1.05)" : "scale(1)",
        transition: `opacity 1.8s ease, transform ${Math.round(speed * 1.8)}ms linear`,
      };
  }
}

const SCRIM =
  "linear-gradient(180deg,rgba(20,19,18,.62) 0%,rgba(20,19,18,.18) 38%,rgba(20,19,18,.72) 100%)";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function fillStyle(
  bar: number,
  active: number,
  animate: boolean,
  speed: number,
  restart: number,
): CSSProperties {
  if (bar < active) {
    return {
      inset: "0 0 0 0",
      background: "rgba(248,244,244,.55)",
      transition: "inset .5s ease",
    };
  }
  if (bar > active) {
    return {
      inset: "0 100% 0 0",
      background: "#f8f4f4",
      transition: "inset .5s ease",
    };
  }
  if (!animate) return { inset: "0 0 0 0", background: "#ec3013" };
  const keyframes = restart % 2 === 0 ? "md-hero-fill-a" : "md-hero-fill-b";
  return {
    background: "#ec3013",
    animation: `${keyframes} ${speed}ms linear forwards`,
  };
}

export function Hero() {
  const { settings } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const { data: photos } = useBackgroundPhotos();

  // `previous` keeps the outgoing frame on screen for the length of the move;
  // `tick` flips the restartable mask animation on every change.
  const [slide, setSlide] = useState({ current: 0, previous: -1, tick: 0 });
  // Bumped on a manual jump so the autoplay timer and the progress fill both
  // restart from that slide.
  const [restart, setRestart] = useState(0);

  const animate = settings.animationsEnabled && !prefersReducedMotion;
  const speed = settings.heroSettings?.autoplaySpeedMs || DEFAULT_SPEED_MS;
  const style = heroStyle(settings.heroSettings?.transitionStyle);
  const count = photos?.length ?? 0;

  useEffect(() => {
    if (!animate || count < 2) return;
    const timer = setInterval(
      () =>
        setSlide((state) => ({
          current: (state.current + 1) % count,
          previous: state.current,
          tick: state.tick + 1,
        })),
      speed,
    );
    return () => clearInterval(timer);
  }, [animate, count, speed, restart]);

  // Clamp rather than reset in an effect: the photo list can shrink under a
  // stale index when the admin unflags a hero image.
  const active = count > 0 ? slide.current % count : 0;
  const previous =
    count > 0 && slide.previous >= 0 ? slide.previous % count : -1;

  const heroSettings = settings.heroSettings;
  const headline = (heroSettings?.headline || DEFAULT_HEADLINE).split("\n");
  const tagline = settings.tagline || DEFAULT_TAGLINE;

  const goTo = (next: number) => {
    setSlide((state) => ({
      current: next,
      previous: state.current,
      tick: state.tick + 1,
    }));
    setRestart((prev) => prev + 1);
  };

  return (
    <section
      id="top"
      className="relative h-screen min-h-[620px] overflow-hidden bg-md-ink"
    >
      <div className="absolute inset-0" style={{ filter: "contrast(1.04)" }}>
        {photos?.map((photo, i) => (
          <div
            key={photo._id}
            className={cn(
              "absolute inset-0",
              style === "gradient" && i === active && animate && "md-hero-mask",
            )}
            style={frameStyle({
              style,
              isActive: i === active,
              isPrevious: i === previous,
              animate,
              speed,
              tick: slide.tick,
            })}
          >
            <ProgressiveImage
              src={photo.images.large}
              srcSet={photoSrcSet(photo.images)}
              sizes="100vw"
              blurDataURL={photo.images.blurDataURL}
              alt={photo.title}
              className="h-full w-full"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Gradient wipe that re-runs on every slide change. */}
      {style === "futuristic" && animate && count > 1 && (
        <div
          key={`sweep-${slide.tick}`}
          className="md-hero-sweep pointer-events-none absolute inset-0 z-[2]"
          aria-hidden="true"
        />
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: SCRIM }}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-9 pb-[82px] text-md-light">
        <div className="mb-[22px] flex items-center gap-[14px]">
          <span className="h-[2px] w-[52px] bg-md-red" />
          <span className="text-[11px] tracking-[0.2em] uppercase">
            {heroSettings?.eyebrow || DEFAULT_EYEBROW}
          </span>
        </div>

        <h1
          className="m-0 font-extrabold"
          style={{
            fontSize: "clamp(44px,8.4vw,132px)",
            lineHeight: 0.88,
            letterSpacing: "-.035em",
            maxWidth: "min(14em,calc(100% - 150px))",
          }}
        >
          {headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        <div className="mt-[38px] flex flex-wrap items-end justify-between gap-10">
          <p
            className="m-0 max-w-[440px] text-[14px]"
            style={{ lineHeight: 1.7, color: "rgba(248,244,244,.8)" }}
          >
            {tagline}
          </p>
          <div className="pointer-events-auto flex items-end gap-9">
            <a
              href="#archive"
              className="inline-flex items-center gap-[18px] bg-md-light px-[22px] py-[17px] text-[12px] font-semibold tracking-[0.18em] text-md-ink! uppercase transition-colors duration-200 hover:bg-md-red hover:text-md-light!"
            >
              {heroSettings?.ctaLabel || DEFAULT_CTA} <span>&rarr;</span>
            </a>
            {count > 0 && (
              <div className="flex items-center gap-[14px] max-[900px]:hidden">
                <span className="text-[12px] font-semibold tracking-[0.16em]">
                  {pad(active + 1)} / {pad(count)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-[10px] px-3 py-2">
          {photos?.map((photo, i) => (
            <button
              key={photo._id}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === active}
              aria-label={`Show hero image ${i + 1}`}
              className="w-[clamp(28px,7vw,64px)] flex-none cursor-pointer appearance-none border-0 bg-transparent py-2"
            >
              <span
                className="relative block h-[3px] overflow-hidden"
                style={{ background: "rgba(248,244,244,.32)" }}
              >
                <span
                  className="absolute"
                  style={fillStyle(i, active, animate, speed, restart)}
                />
              </span>
            </button>
          ))}
        </div>
      )}

      <div
        className="absolute top-1/2 right-9 origin-center -translate-y-1/2 rotate-90 text-[10px] tracking-[0.3em] uppercase max-[900px]:hidden"
        style={{ color: "rgba(248,244,244,.6)" }}
      >
        Scroll
      </div>
    </section>
  );
}

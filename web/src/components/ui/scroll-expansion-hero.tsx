"use client";

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
  TouchEvent,
  WheelEvent,
} from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Progress at or below this counts as fully collapsed. Progress moves in
 * float steps (0.09 a wheel notch), so collapsing again lands on ~1e-17, not
 * 0 - which would cost an extra, invisible notch before the page moves on.
 */
const COLLAPSED = 0.001;

interface ScrollExpandMediaProps {
  mediaType?: "video" | "image";
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
  /**
   * True while a cinematic hand-off is bringing this section in: input is
   * held until the entrance has played and the gesture that caused it has
   * died away, so its momentum doesn't start the expansion.
   */
  entering?: boolean;
  /**
   * Scrolling up from the collapsed start: return true to take that over
   * (e.g. hand back to the section above with its own transition).
   */
  onExitUp?: () => boolean;
  /**
   * Scrolling down once fully expanded (a fresh gesture, not the tail of the
   * one that finished the expansion): return true to take that over, e.g. by
   * sliding on to the next section. Otherwise the page scrolls on.
   */
  onExitDown?: () => boolean;
}

const ScrollExpandMedia = ({
  mediaType = "video",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
  entering = false,
  onExitUp,
  onExitDown,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  // Adapted to sit anywhere on a page, not only at its top: everything below
  // is measured against this section's own top edge rather than scrollY 0.
  // `lastTop` tells a scroll *into* the section from above (hold it there
  // until it has expanded) from arriving from below (show it expanded).
  const lastTop = useRef<number | null>(null);
  /** Distance of the section's top from the viewport's top, in px. */
  const sectionTop = () =>
    sectionRef.current?.getBoundingClientRect().top ?? Infinity;
  /** The section is parked at the top of the screen. */
  const atTop = () => Math.abs(sectionTop()) <= 5;

  // Reduced motion: show the finished, expanded state and leave scrolling
  // alone - no scroll-jacking for people who have asked for less motion.
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!reduced) return;
    setScrollProgress(1);
    setMediaFullyExpanded(true);
    setShowContent(true);
  }, [reduced]);

  // Holds input through a hand-off: on while `entering`, then until a short
  // pause in wheel events shows the incoming gesture has ended.
  const quiet = useRef({ on: false, last: 0 });
  useEffect(() => {
    if (entering) quiet.current.on = true;
  }, [entering]);
  const held = (e: { cancelable: boolean; preventDefault(): void }) => {
    const q = quiet.current;
    if (!entering && !q.on) return false;
    const now = performance.now();
    if (!entering && now - q.last > 180) {
      q.on = false;
      return false;
    }
    q.last = now;
    if (e.cancelable) e.preventDefault();
    return true;
  };

  useEffect(() => {
    if (reduced) return;
    const handleWheel = (e: WheelEvent) => {
      if (held(e)) return;
      if (mediaFullyExpanded && e.deltaY < 0 && atTop()) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (mediaFullyExpanded && e.deltaY > 0 && atTop()) {
        if (onExitDown?.()) e.preventDefault();
      } else if (!mediaFullyExpanded) {
        // Only while parked at the top, and scrolling up from fully collapsed
        // hands control back to the page.
        if (!atTop()) return;
        if (e.deltaY < 0 && scrollProgress <= COLLAPSED) {
          if (onExitUp?.()) e.preventDefault();
          return;
        }
        e.preventDefault();
        const scrollDelta = e.deltaY * 0.0009;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1,
        );
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
          // The rest of this gesture must not also carry on past the
          // expanded photo: hold input until it has died away.
          quiet.current.on = true;
          quiet.current.last = performance.now();
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (held(e)) return;
      if (!touchStartY) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (mediaFullyExpanded && deltaY < -20 && atTop()) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (mediaFullyExpanded && deltaY > 20 && atTop()) {
        if (onExitDown?.()) e.preventDefault();
      } else if (!mediaFullyExpanded) {
        if (!atTop()) return;
        if (deltaY < 0 && scrollProgress <= COLLAPSED) {
          if (onExitUp?.()) e.preventDefault();
          return;
        }
        e.preventDefault();
        // Increase sensitivity for mobile, especially when scrolling back
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005; // Higher sensitivity for scrolling back
        const scrollDelta = deltaY * scrollFactor;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1,
        );
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
          // The rest of this gesture must not also carry on past the
          // expanded photo: hold input until it has died away.
          quiet.current.on = true;
          quiet.current.last = performance.now();
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }

        setTouchStartY(touchY);
      }
    };

    const handleTouchEnd = (): void => {
      setTouchStartY(0);
    };

    const handleScroll = (): void => {
      const top = sectionTop();
      const previous = lastTop.current;
      lastTop.current = top;
      const height = sectionRef.current?.offsetHeight ?? 0;
      if (mediaFullyExpanded || top >= 0 || top <= -height) return;
      if (previous !== null && previous >= 0) {
        // Scrolled down into it before it expanded: hold it at the top.
        window.scrollTo(0, window.scrollY + top);
      } else {
        // Arrived from below (or loaded part-way down): it has been passed,
        // so show it finished rather than yanking the page back up.
        setScrollProgress(1);
        setMediaFullyExpanded(true);
        setShowContent(true);
      }
    };

    window.addEventListener("wheel", handleWheel as unknown as EventListener, {
      passive: false,
    });
    window.addEventListener("scroll", handleScroll as EventListener);
    window.addEventListener(
      "touchstart",
      handleTouchStart as unknown as EventListener,
      { passive: false },
    );
    window.addEventListener(
      "touchmove",
      handleTouchMove as unknown as EventListener,
      { passive: false },
    );
    window.addEventListener("touchend", handleTouchEnd as EventListener);

    return () => {
      window.removeEventListener(
        "wheel",
        handleWheel as unknown as EventListener,
      );
      window.removeEventListener("scroll", handleScroll as EventListener);
      window.removeEventListener(
        "touchstart",
        handleTouchStart as unknown as EventListener,
      );
      window.removeEventListener(
        "touchmove",
        handleTouchMove as unknown as EventListener,
      );
      window.removeEventListener("touchend", handleTouchEnd as EventListener);
    };
  }, [scrollProgress, mediaFullyExpanded, touchStartY, reduced, entering, onExitUp, onExitDown]);

  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const mediaWidth = 300 + scrollProgress * (isMobileState ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150);

  const firstWord = title ? title.split(" ")[0] : "";
  const restOfTitle = title ? title.split(" ").slice(1).join(" ") : "";

  return (
    <div
      ref={sectionRef}
      className="transition-colors duration-700 ease-in-out overflow-x-hidden"
    >
      <section className="relative flex flex-col items-center justify-start min-h-[100dvh]">
        <div className="relative w-full flex flex-col items-center min-h-[100dvh]">
          <motion.div
            className="sem-bg absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <Image
              src={bgImageSrc}
              alt="Background"
              width={1920}
              height={1080}
              className="w-screen h-screen"
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
              priority
            />
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>

          <div className="container mx-auto flex flex-col items-center justify-start relative z-10">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">
              <div
                className="sem-media absolute z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-none rounded-2xl"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: "95vw",
                  maxHeight: "85vh",
                  boxShadow: "0px 0px 50px rgba(0, 0, 0, 0.3)",
                }}
              >
                {mediaType === "video" ? (
                  mediaSrc.includes("youtube.com") ? (
                    <div className="relative w-full h-full pointer-events-none">
                      <iframe
                        width="100%"
                        height="100%"
                        src={
                          mediaSrc.includes("embed")
                            ? mediaSrc +
                              (mediaSrc.includes("?") ? "&" : "?") +
                              "autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1"
                            : mediaSrc.replace("watch?v=", "embed/") +
                              "?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=" +
                              mediaSrc.split("v=")[1]
                        }
                        className="w-full h-full rounded-xl"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <div
                        className="absolute inset-0 z-10"
                        style={{ pointerEvents: "none" }}
                      ></div>

                      <motion.div
                        className="absolute inset-0 bg-black/30 rounded-xl"
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full pointer-events-none">
                      <video
                        src={mediaSrc}
                        poster={posterSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover rounded-xl"
                        controls={false}
                        disablePictureInPicture
                        disableRemotePlayback
                      />
                      <div
                        className="absolute inset-0 z-10"
                        style={{ pointerEvents: "none" }}
                      ></div>

                      <motion.div
                        className="absolute inset-0 bg-black/30 rounded-xl"
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  )
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={mediaSrc}
                      alt={title || "Media content"}
                      width={1280}
                      height={720}
                      className="w-full h-full object-cover rounded-xl"
                    />

                    <motion.div
                      className="absolute inset-0 bg-black/50 rounded-xl"
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 0.7 - scrollProgress * 0.3 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}

                <div className="flex flex-col items-center text-center relative z-10 mt-4 transition-none">
                  {date && (
                    <p
                      className="text-2xl text-blue-200"
                      style={{ transform: `translateX(-${textTranslateX}vw)` }}
                    >
                      {date}
                    </p>
                  )}
                  {scrollToExpand && (
                    <p
                      className="text-blue-200 font-medium text-center"
                      style={{ transform: `translateX(${textTranslateX}vw)` }}
                    >
                      {scrollToExpand}
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`sem-title flex items-center justify-center text-center gap-4 w-full relative z-10 transition-none flex-col ${
                  textBlend ? "mix-blend-difference" : "mix-blend-normal"
                }`}
              >
                <motion.h2
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-200 transition-none"
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {firstWord}
                </motion.h2>
                <motion.h2
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-blue-200 transition-none"
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {restOfTitle}
                </motion.h2>
              </div>
            </div>

            <motion.section
              className="flex flex-col w-full px-8 py-10 md:px-16 lg:py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;

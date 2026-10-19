/**
 * Scroll-driven horizontal slider - framework-free DOM module.
 *
 * One vertical scroll drives everything. The section is a tall spacer; its
 * inner stage is sticky, and the track inside translates horizontally as the
 * spacer scrolls past. Every derived effect (card scale, cross-fade, image
 * parallax) reads the SAME progress value, so nothing can drift out of sync
 * and there are no observers beyond the ones needed for measurement.
 */

const LERP = 0.1;
/** Peak parallax offset of a full-bleed image, in percent of its own width. */
const PARALLAX = 8;
const DESKTOP = "(min-width: 1024px)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const RESIZE_DEBOUNCE = 150;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Remap a slice of the master progress back onto 0..1. */
const seg = (p: number, start: number, end: number) =>
  clamp01((p - start) / (end - start));

export function initTenets(root: HTMLElement): () => void {
  const stickyEl = root.querySelector<HTMLElement>(".tenets__sticky");
  const trackEl = root.querySelector<HTMLElement>(".tenets__track");
  if (!stickyEl || !trackEl) return () => {};

  // Re-bound as non-nullable so the closures below read cleanly.
  const sticky: HTMLElement = stickyEl;
  const track: HTMLElement = trackEl;

  const panels = Array.from(track.querySelectorAll<HTMLElement>(".panel"));
  const card = root.querySelector<HTMLElement>(".panel__card");
  const cardBody = root.querySelector<HTMLElement>(".panel__card-body");
  const cardTitle = root.querySelector<HTMLElement>(".panel__media-title");
  const parallax = Array.from(
    root.querySelectorAll<HTMLElement>("[data-parallax]"),
  );

  // The track travels one panel-width per segment, and there are (n - 1)
  // segments for n panels - the first panel starts on screen and the last
  // finishes on screen.
  const segments = Math.max(1, panels.length - 1);
  const span = 1 / segments;

  const desktop = window.matchMedia(DESKTOP);
  const reduced = window.matchMedia(REDUCED);

  let top = 0;
  let range = 1;
  let distance = 0;
  let scrollY = window.scrollY;
  let current = 0;
  let applied = -1;
  let raf = 0;
  let running = false;
  let resizeTimer = 0;

  function measure() {
    top = root.getBoundingClientRect().top + window.scrollY;
    // The usable scroll range is the spacer minus one viewport: progress hits
    // 1 exactly when the sticky stage is about to unpin.
    range = Math.max(1, root.offsetHeight - window.innerHeight);
    // clientWidth, not innerWidth - innerWidth includes the vertical
    // scrollbar, which would leave the last panel short of flush.
    distance = Math.max(0, track.scrollWidth - sticky.clientWidth);
    // Hand the true stage width back to CSS so panels match it exactly.
    root.style.setProperty("--tenets-vw", `${sticky.clientWidth}px`);
    applied = -1;
  }

  function apply(p: number) {
    track.style.transform = `translate3d(${(-p * distance).toFixed(2)}px,0,0)`;

    if (card) {
      // The intro card grows into place over the first panel, finishing a
      // little before the panel leaves so it reads as settled, not still moving.
      const introP = seg(p, 0, span * 0.7);
      card.style.transform = `scale(${(0.33 + 0.67 * introP).toFixed(4)})`;
      if (cardBody) cardBody.style.opacity = (1 - introP).toFixed(3);
      if (cardTitle) cardTitle.style.opacity = introP.toFixed(3);
    }

    for (const img of parallax) {
      const i = Number(img.dataset.panel ?? 0);
      // A panel is on screen while the track is between the panel before it
      // and the panel after it - a two-segment window centred on the panel.
      const localP = clamp01((p - (i - 1) * span) / (2 * span));
      // Runs opposite the track so the image drifts against the scroll.
      const shift = (localP - 0.5) * 2 * PARALLAX;
      img.style.transform = `translate3d(${shift.toFixed(2)}%,0,0)`;
    }
  }

  function frame() {
    const target = clamp01((scrollY - top) / range);
    current += (target - current) * LERP;
    if (Math.abs(target - current) < 0.0005) current = target;
    // Skip the DOM write once the value has settled; the loop keeps running
    // so the next scroll is picked up on the very next frame.
    if (Math.abs(current - applied) > 0.0001) {
      apply(current);
      applied = current;
    }
    raf = requestAnimationFrame(frame);
  }

  function reset() {
    root.style.removeProperty("--tenets-vw");
    track.style.transform = "";
    if (card) card.style.transform = "";
    if (cardBody) cardBody.style.opacity = "";
    if (cardTitle) cardTitle.style.opacity = "";
    for (const img of parallax) img.style.transform = "";
  }

  function start() {
    if (running) return;
    running = true;
    root.dataset.tenetsActive = "true";
    measure();
    scrollY = window.scrollY;
    // Jump straight to the correct position rather than easing in from zero
    // when the section is already part-scrolled (a reload mid-section).
    current = clamp01((scrollY - top) / range);
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    delete root.dataset.tenetsActive;
    reset();
  }

  function sync() {
    if (desktop.matches && !reduced.matches) start();
    else stop();
  }

  const onScroll = () => {
    scrollY = window.scrollY;
  };

  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (running) measure();
    }, RESIZE_DEBOUNCE);
  };

  const observer = new ResizeObserver(() => {
    if (running) measure();
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  desktop.addEventListener("change", sync);
  reduced.addEventListener("change", sync);
  observer.observe(track);
  sync();

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    desktop.removeEventListener("change", sync);
    reduced.removeEventListener("change", sync);
    observer.disconnect();
    window.clearTimeout(resizeTimer);
    stop();
  };
}

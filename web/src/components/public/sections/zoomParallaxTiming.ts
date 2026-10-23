// Shared by the intro (a client component) and the section (a server
// component). It lives in its own plain module because a server component
// that imports a value from a "use client" file gets a client reference, not
// the value itself.

/** How long the intro's text sits on its own, in vh of scrolling. */
export const READ_VH = 160;

/**
 * How long the photographs take to slide up over the pinned text, in vh of
 * scrolling. The section pulls the photographs up by this much, so they start
 * rising just as the reading stretch ends and cover the screen exactly as the
 * intro's pin lets go.
 */
export const OVERLAP_VH = 100;

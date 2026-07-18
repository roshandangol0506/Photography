interface PhotoImageVariants {
  thumb: string;
  medium: string;
  large: string;
}

export function photoSrcSet(images: PhotoImageVariants): string {
  return `${images.thumb} 400w, ${images.medium} 1200w, ${images.large} 2000w`;
}

// Grid sections cap out around max-w-7xl (1280px); beyond that the column
// width stops growing, so the widest breakpoint is a fixed px value rather
// than an unbounded vw (which would over-fetch the "large" variant on very
// wide viewports).
export const GRID_SIZES =
  "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px";

export const RECENT_WORKS_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px";

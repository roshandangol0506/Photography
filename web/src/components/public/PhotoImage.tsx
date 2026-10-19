import Image from "next/image";
import type { PhotoImages } from "@/types/content";
import { cn } from "@/lib/utils";

interface PhotoImageProps {
  images: PhotoImages;
  alt: string;
  /**
   * Which stored derivative to request. Never the original - none is kept.
   *
   * Defaults to `large` on purpose. next/image downscales server-side, so the
   * browser still receives exactly the width its slot needs; sourcing from the
   * widest derivative costs the visitor nothing and stops the optimizer from
   * being asked for more pixels than the source actually has.
   */
  variant?: "thumb" | "medium" | "large";
  sizes: string;
  /** Only for a genuine LCP element; everything else stays lazy. */
  priority?: boolean;
  /** Fills its positioned parent instead of using intrinsic dimensions. */
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
}

/**
 * Every public photograph goes through here.
 *
 * Protection layer one: the context menu is suppressed and dragging is
 * disabled, which stops casual "Save image as...". This is a deterrent, not
 * security - a browser must receive an image to display it.
 *
 * Protection layer three - the one that actually matters - is upstream: the
 * backend only ever stores 400/1200/2000px WebP derivatives, so there is no
 * original for this component to leak.
 */
export function PhotoImage({
  images,
  alt,
  variant = "large",
  sizes,
  priority = false,
  fill = false,
  width,
  height,
  className,
  quality = 90,
}: PhotoImageProps) {
  // Fall back down the chain: a record processed before a variant existed
  // should still render rather than pointing next/image at undefined.
  const src = images[variant] || images.large || images.medium || images.thumb;

  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes}
      quality={quality}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      placeholder={images.blurDataURL ? "blur" : "empty"}
      blurDataURL={images.blurDataURL || undefined}
      draggable={false}
      className={cn("select-none", className)}
      {...(fill
        ? { fill: true }
        : { width: width ?? 1200, height: height ?? 800 })}
    />
  );
}

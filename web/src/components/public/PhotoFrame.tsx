"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Protection layers one and two for a displayed photograph.
 *
 * A transparent sibling sits over the image so a long-press or right-click
 * lands on an empty element rather than the <img>. It is `pointer-events-none`
 * so links, hover zoom and the like/comment controls underneath keep working -
 * the overlay intercepts nothing except the context menu, which is handled on
 * the wrapper itself.
 *
 * This is deterrence. The real protection is that only derivatives exist.
 */
export function PhotoFrame({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("relative", className)}
      style={style}
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] select-none"
      />
    </div>
  );
}

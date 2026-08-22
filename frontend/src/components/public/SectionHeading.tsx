import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  kicker?: ReactNode;
  title?: ReactNode;
  /** Optional lead paragraph, centred under the title. */
  lead?: ReactNode;
  align?: "center" | "left";
  className?: string;
  children?: ReactNode;
}

/**
 * Shared section header. Replaces the ruled header rows the sections used to
 * carry, so nothing draws a line between sections any more - the vertical
 * rhythm alone does the separating.
 */
export function SectionHeading({
  kicker,
  title,
  lead,
  align = "center",
  className,
  children,
}: SectionHeadingProps) {
  const centred = align === "center";

  return (
    <div className={cn(centred && "text-center", className)}>
      <span className="text-[14px] font-bold tracking-[0.2em] uppercase">
        {kicker}
      </span>

      {title && (
        <h2 className="mt-[14px] mb-0 tracking-[2px] text-[clamp(30px,4.4vw,62px)] text-md-red leading-none uppercase">
          {title}
        </h2>
      )}

      {lead && (
        <p
          className={cn(
            "mt-5 mb-0 max-w-[520px] text-[13px] leading-[1.65] text-md-700",
            centred && "mx-auto",
          )}
        >
          {lead}
        </p>
      )}

      {children}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Collection } from "@/types/content";
import { useSite } from "@/components/providers/SiteProvider";
import { cn } from "@/lib/utils";

const BAND_HEIGHT = "clamp(420px, 56vw, 720px)";

// Sits over the photograph so the white type holds at any exposure.
const SCRIM =
  "linear-gradient(180deg,rgba(20,19,18,.30) 0%,rgba(20,19,18,.12) 40%,rgba(20,19,18,.78) 100%)";

const DIVIDER = "rgba(248,244,244,.35)";

const TITLE_CLASS =
  "m-0 font-bold tracking-[0.18em] text-[clamp(14px,1.4vw,20px)] uppercase";

const BUTTON_CLASS =
  "inline-flex items-center gap-3 border border-current px-4 py-[10px] text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors duration-200 hover:bg-md-light hover:text-md-ink";

function CollectionCopy({
  collection,
  revealed,
  animate,
}: {
  collection: Collection;
  revealed: boolean;
  animate: boolean;
}) {
  // The description leads and the button follows a beat later; without motion
  // both simply sit in their final state.
  const base = animate
    ? {
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(16px)",
      }
    : { opacity: revealed ? 1 : 0 };

  return (
    // The 0fr -> 1fr row animates the block's own height, so a collapsed
    // column reserves no space and the titles stay pinned to the bottom.
    <div
      className={cn("grid", !revealed && "pointer-events-none")}
      style={{
        gridTemplateRows: revealed ? "1fr" : "0fr",
        transition: animate
          ? "grid-template-rows .5s cubic-bezier(.16,1,.3,1)"
          : undefined,
      }}
      aria-hidden={!revealed}
    >
      <div className="overflow-hidden">
        <div className="pb-5">
          {collection.description && (
            <p
              className="m-0 max-w-[360px] text-[13px] leading-[1.7]"
              style={{
                ...base,
                transition: animate
                  ? "opacity .45s ease, transform .45s cubic-bezier(.16,1,.3,1)"
                  : undefined,
                color: "rgba(248,244,244,.85)",
              }}
            >
              {collection.description}
            </p>
          )}
          <Link
            href={`/gallery?collection=${collection.slug}`}
            tabIndex={revealed ? undefined : -1}
            className={cn(BUTTON_CLASS, "mt-5")}
            style={{
              ...base,
              transition: animate
                ? "opacity .45s ease .12s, transform .45s cubic-bezier(.16,1,.3,1) .12s, background-color .2s ease, color .2s ease"
                : undefined,
            }}
          >
            View More <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CollectionShowcase({
  collections: source,
}: {
  collections: Collection[];
}) {
  const { settings } = useSite();
  const prefersReducedMotion = useReducedMotion();

  // Which column is being hovered. Null is the resting state: the first
  // collection's photograph shows, but no column is expanded.
  const [hovered, setHovered] = useState<number | null>(null);

  const collections = source.filter(
    (collection) => collection.isBackgroundList,
  );

  if (collections.length === 0) return null;

  const animate = settings.animationsEnabled && !prefersReducedMotion;
  const active = hovered ?? 0;

  return (
    <section
      className="relative overflow-hidden text-md-light"
      style={{ height: BAND_HEIGHT }}
      onMouseLeave={() => setHovered(null)}
    >
      {/* Every cover is mounted and cross-faded rather than swapped, so the
          browser has them decoded before the first hover. */}
      {collections.map((collection, i) => (
        <div
          key={collection._id}
          className="absolute inset-0"
          style={{
            opacity: i === active ? 1 : 0,
            transition: animate ? "opacity .6s ease" : undefined,
          }}
          aria-hidden="true"
        >
          {collection.coverImage && (
            <Image
              quality={90}
              src={collection.coverImage}
              alt=""
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-cover select-none"
              draggable={false}
            />
          )}
        </div>
      ))}

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: SCRIM }}
      />

      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${collections.length}, minmax(0, 1fr))`,
        }}
      >
        {collections.map((collection, i) => (
          <div
            key={collection._id}
            onMouseEnter={() => setHovered(i)}
            // Touch has no hover, so a tap expands the column instead.
            onClick={() => setHovered(i)}
            className="relative flex flex-col justify-end px-8 pb-8 max-[900px]:px-4 max-[900px]:pb-5"
            style={i > 0 ? { borderLeft: `1px solid ${DIVIDER}` } : undefined}
          >
            <CollectionCopy
              collection={collection}
              revealed={hovered === i}
              animate={animate}
            />
            <h3 className={TITLE_CLASS}>{collection.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

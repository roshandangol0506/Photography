"use client";

import {
  Children,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { initTenets } from "./tenets";

/**
 * The only client component in the section.
 *
 * Panels arrive as `children`, so they are rendered on the server and passed
 * in as an already-built tree - none of that markup ships to the browser as
 * JavaScript. All this component contributes is the wrapper elements and the
 * effect that starts the vanilla scroll module.
 */
export function TenetsStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return initTenets(ref.current);
  }, []);

  return (
    <section
      ref={ref}
      className="tenets"
      aria-labelledby="tenets-title"
      // Height math is driven off the real panel count, so adding or removing
      // a panel cannot leave the spacer the wrong length.
      style={
        { "--tenets-panels": Children.count(children) } as CSSProperties
      }
    >
      <div className="tenets__sticky">
        <div className="tenets__track">{children}</div>
      </div>
    </section>
  );
}

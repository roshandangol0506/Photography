import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#series", label: "Photo series" },
  { href: "#about", label: "About" },
  { href: "#archive", label: "Archive" },
  { href: "#tours", label: "Tours" },
];

// The nav sits transparent over the hero and turns to solid ground once the
// hero has scrolled past; 90px of lead-in so the swap lands before the seam.
const SOLID_OFFSET = 90;

export function HomeNavbar() {
  const { settings } = useTheme();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setSolid(window.scrollY > window.innerHeight - SOLID_OFFSET);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[90] flex flex-wrap items-center justify-between gap-8 border-b-2 px-9",
        "transition-[background-color,border-color,padding,color] duration-[450ms] ease-[ease]",
        solid
          ? "border-md-divider bg-md-ground py-[14px] text-md-ink"
          : "border-transparent bg-transparent py-5 text-md-light",
      )}
    >
      <a href="#top" className="flex items-baseline gap-3 text-inherit">
        <span className="text-[14px] font-bold tracking-[0.26em] uppercase">
          {settings.siteTitle || "Ajay Maharjan"}
        </span>
      </a>

      <nav className="flex items-center gap-[34px] text-inherit max-[900px]:gap-[18px]">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[11px] font-medium tracking-[0.18em] text-inherit uppercase transition-colors duration-200 hover:text-md-red"
          >
            {link.label}
          </a>
        ))}
        <a
          href="#contact"
          className="border border-current px-4 py-[10px] text-[11px] font-semibold tracking-[0.18em] text-inherit uppercase transition-colors duration-200 hover:text-md-red"
        >
          Get in touch
        </a>
      </nav>
    </header>
  );
}

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
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
  const { settings, isDark, toggleDark } = useTheme();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setSolid(window.scrollY > window.innerHeight - SOLID_OFFSET);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrolled past the hero in light mode is the only state where the bar goes
  // light. Everywhere else - over the hero, or scrolled in dark mode - the
  // background stays dark, so the light mark is the right one.
  const onLightBar = solid && !isDark;
  const logo = onLightBar ? settings.logoDark || settings.logo : settings.logo;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[90] flex flex-wrap items-center justify-between gap-8 border-b-2 px-9",
        "transition-[background-color,border-color,padding,color] duration-[450ms] ease-[ease]",
        solid
          ? "border-md-divider bg-md-ground py-[14px] text-md-fg"
          : "border-transparent bg-transparent py-5 text-md-light",
      )}
    >
      <a href="#top" className="flex items-center gap-3 text-inherit">
        {logo ? (
          <img src={logo} alt={settings.siteTitle} className="h-16 w-auto" />
        ) : (
          <span className="text-[14px] font-bold tracking-[0.26em] uppercase">
            {settings.siteTitle || "Ajay Maharjan"}
          </span>
        )}
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
        <button
          type="button"
          onClick={toggleDark}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={isDark}
          className="cursor-pointer border-0 bg-transparent p-0 text-inherit transition-colors duration-200 hover:text-md-red"
        >
          {isDark ? (
            <Sun className="h-[15px] w-[15px]" />
          ) : (
            <Moon className="h-[15px] w-[15px]" />
          )}
        </button>
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

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

// `route` entries are real pages; `href` entries jump to a section of the
// home page and are plain anchors so they work from any route.
const LINKS: { label: string; route?: string; href?: string }[] = [
  { label: "Home", route: "/" },
  { label: "Photo series", href: "/#series" },
  { label: "About", route: "/about" },
  { label: "Archive", href: "/#archive" },
  { label: "Tours", href: "/#tours" },
];

// The nav sits transparent over the hero and turns to solid ground once the
// hero has scrolled past; 90px of lead-in so the swap lands before the seam.
const SOLID_OFFSET = 90;

// Below this the four section links collapse into the hamburger panel; it is
// the same breakpoint the section grids collapse at.
const MOBILE_QUERY = "(max-width: 900px)";

const LINK_CLASS =
  "text-[11px] font-medium tracking-[0.18em] text-inherit uppercase transition-colors duration-200 hover:text-md-red";

interface HomeNavbarProps {
  /**
   * True only on the home page, where the bar floats transparently over the
   * full-bleed hero before turning solid. Every other page has content at the
   * top of the viewport, so the bar starts solid.
   */
  overHero?: boolean;
}

export function HomeNavbar({ overHero = false }: HomeNavbarProps) {
  const { settings, isDark, toggleDark } = useTheme();
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () =>
      setScrolledPastHero(window.scrollY > window.innerHeight - SOLID_OFFSET);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  const solid = !overHero || scrolledPastHero;

  // Growing past the breakpoint reveals the links inline, so an open panel
  // would be a stray duplicate menu.
  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setMenuOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Scrolled past the hero in light mode is the only state where the bar goes
  // light. Everywhere else - over the hero, or scrolled in dark mode - the
  // background stays dark, so the light mark is the right one.
  const onLightBar = solid && !isDark;
  const logo = onLightBar ? settings.logoDark || settings.logo : settings.logo;

  return (
    <header
      className={cn(
        "modernist fixed inset-x-0 top-0 z-[90] flex items-center justify-between gap-8 border-b-2 px-9 max-[900px]:gap-4 max-[900px]:px-5",
        "transition-[background-color,border-color,padding,color] duration-[450ms] ease-[ease]",
        solid
          ? "border-md-divider bg-md-ground py-[14px] text-md-fg"
          : "border-transparent bg-transparent py-5 text-md-light",
      )}
    >
      <a href="#top" className="flex items-center gap-3 text-inherit">
        {logo ? (
          <img
            src={logo}
            alt={settings.siteTitle}
            className="h-16 w-auto max-[900px]:h-9"
          />
        ) : (
          <span className="text-[14px] font-bold tracking-[0.26em] uppercase max-[900px]:text-[12px]">
            {settings.siteTitle || "Ajay Maharjan"}
          </span>
        )}
      </a>

      <nav className="flex items-center gap-[34px] text-inherit max-[900px]:gap-4">
        <div className="flex items-center gap-[34px] max-[900px]:hidden">
          {LINKS.map((link) =>
            link.route ? (
              <Link key={link.label} to={link.route} className={LINK_CLASS}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className={LINK_CLASS}>
                {link.label}
              </a>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="hidden cursor-pointer border-0 bg-transparent p-0 text-inherit transition-colors duration-200 hover:text-md-red max-[900px]:block"
        >
          {menuOpen ? (
            <X className="h-[22px] w-[22px]" />
          ) : (
            <Menu className="h-[22px] w-[22px]" />
          )}
        </button>

        <button
          type="button"
          onClick={toggleDark}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={isDark}
          className="cursor-pointer border-0 bg-transparent p-0 text-inherit transition-colors duration-200 hover:text-md-red"
        >
          {isDark ? (
            <Sun className="h-[15px] w-[15px] max-[900px]:h-[18px] max-[900px]:w-[18px]" />
          ) : (
            <Moon className="h-[15px] w-[15px] max-[900px]:h-[18px] max-[900px]:w-[18px]" />
          )}
        </button>

        <Link
          to="/contact"
          className="border border-current px-4 py-[10px] text-[11px] font-semibold tracking-[0.18em] text-inherit uppercase transition-colors duration-200 hover:text-md-red max-[900px]:px-3 max-[900px]:py-2 max-[900px]:text-[10px]"
        >
          Get in touch
        </Link>
      </nav>

      {/* The bar is transparent over the hero, so the panel carries its own
          ground rather than inheriting one. */}
      {menuOpen && (
        <div className="absolute inset-x-0 top-full hidden flex-col border-b-2 border-md-divider bg-md-ground text-md-fg max-[900px]:flex">
          {LINKS.map((link) => {
            const panelClass =
              "border-t-2 border-md-divider px-5 py-4 text-[11px] font-medium tracking-[0.18em] uppercase transition-colors duration-200 hover:text-md-red";
            return link.route ? (
              <Link
                key={link.label}
                to={link.route}
                onClick={() => setMenuOpen(false)}
                className={panelClass}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={panelClass}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}

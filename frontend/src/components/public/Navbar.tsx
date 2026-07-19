import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

interface NavItem {
  to: string;
  label: string;
  area: string;
}

// Top-to-bottom order in the stacked layout.
const LEFT_LINKS: NavItem[] = [
  { to: "/", label: "Home", area: "l1" },
  { to: "/gallery", label: "Gallery", area: "l2" },
  { to: "/#about", label: "About", area: "l3" },
];

const RIGHT_LINKS: NavItem[] = [
  { to: "/#contact", label: "Contact", area: "r1" },
  { to: "/#categories", label: "Categories", area: "r2" },
  { to: "/gallery", label: "Search", area: "r3" },
];

const ALL_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS];

const GRID_AREAS_STACKED = `"l1 logo r1" "l2 logo r2" "l3 logo r3"`;
// Right column collapses in reverse (bottom item lands closest to the logo).
const GRID_AREAS_ROW = `"l1 l2 l3 logo r3 r2 r1"`;

const LAYOUT_TRANSITION = {
  type: "spring",
  stiffness: 1000,
  damping: 200,
} as const;

export function Navbar() {
  const { settings, isDark, toggleDark } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const animate = settings.animationsEnabled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 py-3 shadow-sm backdrop-blur-md"
          : "bg-transparent py-6",
      )}
    >
      <div className="mx-auto max-w-[100rem] px-4 sm:px-6">
        <motion.div
          layout={animate}
          transition={animate ? LAYOUT_TRANSITION : undefined}
          className="hidden md:grid md:items-center"
          style={{
            gridTemplateAreas: scrolled ? GRID_AREAS_ROW : GRID_AREAS_STACKED,
            gridTemplateColumns: scrolled ? "repeat(7, auto)" : "1fr auto 1fr",
            columnGap: scrolled ? "7rem" : "3rem",
            rowGap: scrolled ? 0 : "0.2rem",
            justifyContent: scrolled ? "center" : "normal",
          }}
        >
          {LEFT_LINKS.map((link) => (
            <motion.div
              key={link.label}
              layout={animate}
              transition={animate ? LAYOUT_TRANSITION : undefined}
              style={{ gridArea: link.area, justifySelf: "start" }}
            >
              <NavLink
                to={link.to}
                className="text-xs font-medium uppercase tracking-widest text-foreground/80 transition-colors hover:text-foreground"
              >
                {link.label}
              </NavLink>
            </motion.div>
          ))}

          <motion.div
            layout={animate}
            transition={animate ? LAYOUT_TRANSITION : undefined}
            style={{
              gridArea: "logo",
              justifySelf: "center",
              alignSelf: "center",
            }}
          >
            <Link to="/" className="flex items-center gap-2">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.siteTitle}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : null}
              <span className="text-lg font-bold uppercase tracking-widest text-foreground">
                {settings.siteTitle}
              </span>
            </Link>
          </motion.div>

          {RIGHT_LINKS.map((link) => (
            <motion.div
              key={link.label}
              layout={animate}
              transition={animate ? LAYOUT_TRANSITION : undefined}
              style={{ gridArea: link.area, justifySelf: "end" }}
            >
              <NavLink
                to={link.to}
                className="text-xs font-medium uppercase tracking-widest text-foreground/80 transition-colors hover:text-foreground"
              >
                {link.label}
              </NavLink>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex items-center justify-between md:hidden">
          <Link to="/" className="flex items-center gap-2">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt={settings.siteTitle}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : null}
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {settings.siteTitle}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDark}
              aria-label="Toggle theme"
              className="rounded-full p-2 text-foreground/70 hover:bg-accent hover:text-accent-foreground"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="rounded-full p-2 text-foreground hover:bg-accent"
            >
              <span className="relative block h-4 w-5">
                <Menu
                  className={cn(
                    "absolute inset-0 h-4 w-5 transition-all duration-200",
                    mobileOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
                  )}
                />
                <X
                  className={cn(
                    "absolute inset-0 h-4 w-5 transition-all duration-200",
                    mobileOpen
                      ? "rotate-0 opacity-100"
                      : "-rotate-90 opacity-0",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={toggleDark}
        aria-label="Toggle theme"
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full p-2 text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground md:block sm:right-6"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div
        className={cn(
          "absolute inset-x-0 top-full overflow-hidden transition-[max-height] duration-300 md:hidden",
          mobileOpen ? "max-h-80" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 border-t border-border bg-background/95 px-4 py-4 shadow-lg backdrop-blur-md">
          {ALL_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

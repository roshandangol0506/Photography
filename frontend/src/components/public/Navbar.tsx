import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/#about", label: "About" },
  { to: "/#contact", label: "Contact" },
];

export function Navbar() {
  const { settings, isDark, toggleDark } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 py-3 shadow-sm backdrop-blur-md"
          : "bg-transparent py-6",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
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

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleDark}
            aria-label="Toggle theme"
            className="rounded-full p-2 text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <Link
            to="/gallery"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            View Gallery
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
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
                  mobileOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-x-0 top-full overflow-hidden transition-[max-height] duration-300 md:hidden",
          mobileOpen ? "max-h-64" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 border-t border-border bg-background/95 px-4 py-4 shadow-lg backdrop-blur-md">
          {NAV_LINKS.map((link) => (
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

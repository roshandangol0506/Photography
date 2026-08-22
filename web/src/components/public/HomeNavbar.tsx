"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";
import { cn } from "@/lib/utils";

const LINKS: { label: string; route?: string; href?: string }[] = [
  { label: "Home", route: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "Photo series", href: "/#series" },
  { label: "About", route: "/about" },
  { label: "Archive", href: "/#archive" },
  { label: "Tours", href: "/#tours" },
];

const SOLID_OFFSET = 90;

const MOBILE_QUERY = "(max-width: 900px)";

const LINK_CLASS =
  "md-navlink text-[11px] font-medium tracking-[0.18em] text-inherit uppercase transition-colors duration-200 hover:text-md-red";

interface HomeNavbarProps {
  overHero?: boolean;
}

export function HomeNavbar({ overHero = false }: HomeNavbarProps) {
  const { settings, isDark, toggleDark } = useSite();
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

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setMenuOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

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
          <Image
            src={logo}
            alt={settings.siteTitle}
            width={0}
            height={0}
            sizes="200px"
            priority
            className="h-16 w-auto max-[900px]:h-9"
            style={{ width: "auto" }}
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
              <Link key={link.label} href={link.route} className={LINK_CLASS}>
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
          className="md-navlink cursor-pointer border-0 bg-transparent p-0 text-inherit transition-colors duration-200 hover:text-md-red"
        >
          {isDark ? (
            <Sun className="h-[15px] w-[15px] max-[900px]:h-[18px] max-[900px]:w-[18px]" />
          ) : (
            <Moon className="h-[15px] w-[15px] max-[900px]:h-[18px] max-[900px]:w-[18px]" />
          )}
        </button>

        <Link
          href="/contact"
          className="border border-current hover:border-md-red px-4 py-[10px] text-[11px] font-semibold tracking-[0.18em] text-inherit uppercase transition-colors duration-200 hover:text-md-red! max-[900px]:px-3 max-[900px]:py-2 max-[900px]:text-[10px]"
        >
          Get in touch
        </Link>
      </nav>

      {menuOpen && (
        <div className="absolute inset-x-0 top-full hidden flex-col border-b-2 border-md-divider bg-md-ground text-md-fg max-[900px]:flex">
          {LINKS.map((link) => {
            const panelClass =
              "border-t-2 border-md-divider px-5 py-4 text-[11px] font-medium tracking-[0.18em] uppercase transition-colors duration-200 hover:text-md-red";
            return link.route ? (
              <Link
                key={link.label}
                href={link.route}
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

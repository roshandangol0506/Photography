"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";

const LINKS: { label: string; route?: string; href?: string }[] = [
  { label: "Home", route: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "Photo series", href: "/#series" },
  { label: "About", route: "/about" },
  { label: "Archive", href: "/#archive" },
  { label: "Tours", href: "/#tours" },
];

const MOBILE_QUERY = "(max-width: 900px)";

const LINK_CLASS =
  "md-navlink text-label font-medium text-inherit uppercase transition-colors duration-200 hover:text-md-red";

/**
 * The site's fixed bar. Transparent all the way down the page - it never
 * turns solid on scroll - so the photographs and sections run up under it.
 */
export function HomeNavbar() {
  const { settings } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setMenuOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // The site is always dark, so the bar never turns light: the light-ground
  // logo variant (logoDark) isn't needed.
  const logo = settings.logo;

  return (
    <header
      className="modernist fixed inset-x-0 top-0 z-[90] flex items-center justify-between gap-8 bg-transparent px-9 py-5 text-md-light max-[900px]:gap-4 max-[900px]:px-5"
    >
      <a href="#top" className="flex items-center gap-3 text-inherit">
        {logo ? (
          <Image
            quality={90}
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
          <span className="text-small font-bold tracking-[0.26em] uppercase max-[900px]:text-label">
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

        <Link
          href="/contact"
          className="border border-current hover:border-md-red px-4 py-[10px] text-label font-semibold text-inherit uppercase transition-colors duration-200 hover:text-md-red! max-[900px]:px-3 max-[900px]:py-2"
        >
          Get in touch
        </Link>
      </nav>

      {menuOpen && (
        <div className="absolute inset-x-0 top-full hidden flex-col border-b-2 border-md-divider bg-md-ground text-md-fg max-[900px]:flex">
          {LINKS.map((link) => {
            const panelClass =
              "border-t-2 border-md-divider px-5 py-4 text-label font-medium uppercase transition-colors duration-200 hover:text-md-red";
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

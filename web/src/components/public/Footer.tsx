import Link from "next/link";
import Image from "next/image";
import type { ActiveCategory, SiteSettings } from "@/types/content";

const PAGES = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Archive" },
  { to: "/about", label: "About" },
];

const SERIES_COLUMN_LIMIT = 3;

const HEADING_CLASS = "subtitle mb-[14px] text-md-600";

export function Footer({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: ActiveCategory[];
}) {
  const year = new Date().getFullYear();

  const series = categories.slice(0, SERIES_COLUMN_LIMIT);

  const socials = [
    { href: settings.socialLinks?.instagram, label: "Instagram" },
    { href: settings.socialLinks?.facebook, label: "Facebook" },
    { href: settings.socialLinks?.youtube, label: "YouTube" },
    { href: settings.socialLinks?.behance, label: "Behance" },
  ].filter((social) => Boolean(social.href));

  return (
    <footer className="modernist border-t-2 border-md-divider px-9 pt-16 pb-[34px] text-md-light">
      <div
        className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-11 border-b-2 border-md-divider pb-11 max-[900px]:grid-cols-1"
      >
        <div>
          {settings.logo ? (
            <Image
              quality={90}
              src={settings.logo}
              alt={settings.siteTitle}
              width={0}
              height={0}
              sizes="240px"
              className="h-20 w-auto"
              style={{ width: "auto" }}
            />
          ) : (
            <p className="m-0 text-body font-bold tracking-[0.26em] uppercase">
              {settings.siteTitle}
            </p>
          )}
          {settings.footerText && (
            <p className="mt-[14px] mb-0 max-w-[320px] text-small text-md-700">
              {settings.footerText}
            </p>
          )}
        </div>

        <div>
          <p className={HEADING_CLASS}>
            Pages
          </p>
          <div className="flex flex-col gap-[9px] text-small">
            {PAGES.map((page) => (
              <Link key={page.label} href={page.to} className="hover:text-md-red">
                {page.label}
              </Link>
            ))}
          </div>
        </div>

        {series.length > 0 && (
          <div>
            <p className={HEADING_CLASS}>
              Series
            </p>
            <div className="flex flex-col gap-[9px] text-small">
              {series.map((category) => (
                <Link
                  key={category._id}
                  href={`/gallery?category=${category.slug}`}
                  className="hover:text-md-red"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {socials.length > 0 && (
          <div>
            <p className={HEADING_CLASS}>
              Elsewhere
            </p>
            <div className="flex flex-col gap-[9px] text-small">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-md-red"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="subtitle flex flex-wrap justify-between gap-6 pt-[22px] text-md-600">
        <span>
          &copy; {year} {settings.siteTitle}
        </span>
        {settings.tagline && <span>{settings.tagline}</span>}
      </div>
    </footer>
  );
}

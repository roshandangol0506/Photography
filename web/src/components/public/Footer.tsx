import Link from "next/link";
import Image from "next/image";
import type { ActiveCategory, SiteSettings } from "@/types/content";

const PAGES = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Archive" },
  { to: "/about", label: "About" },
];

const SERIES_COLUMN_LIMIT = 3;

const HEADING_CLASS = "mb-[14px] text-[10px] tracking-[0.2em] uppercase";
const MUTED = "rgba(248,244,244,.55)";

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
    <footer className="modernist bg-md-ink px-9 pt-16 pb-[34px] text-md-light">
      <div
        className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-11 border-b-2 pb-11 max-[900px]:grid-cols-1"
        style={{ borderBottomColor: "rgba(248,244,244,.2)" }}
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
            <p className="m-0 text-[15px] font-bold tracking-[0.26em] uppercase">
              {settings.siteTitle}
            </p>
          )}
          {settings.footerText && (
            <p
              className="mt-[14px] mb-0 max-w-[320px] text-[13px] leading-[1.7]"
              style={{ color: "rgba(248,244,244,.65)" }}
            >
              {settings.footerText}
            </p>
          )}
        </div>

        <div>
          <p className={HEADING_CLASS} style={{ color: MUTED }}>
            Pages
          </p>
          <div className="flex flex-col gap-[9px] text-[13px]">
            {PAGES.map((page) => (
              <Link key={page.label} href={page.to} className="hover:text-md-red">
                {page.label}
              </Link>
            ))}
          </div>
        </div>

        {series.length > 0 && (
          <div>
            <p className={HEADING_CLASS} style={{ color: MUTED }}>
              Series
            </p>
            <div className="flex flex-col gap-[9px] text-[13px]">
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
            <p className={HEADING_CLASS} style={{ color: MUTED }}>
              Elsewhere
            </p>
            <div className="flex flex-col gap-[9px] text-[13px]">
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

      <div
        className="flex flex-wrap justify-between gap-6 pt-[22px] text-[11px] tracking-[0.14em] uppercase"
        style={{ color: MUTED }}
      >
        <span>
          &copy; {year} {settings.siteTitle}
        </span>
        {settings.tagline && <span>{settings.tagline}</span>}
      </div>
    </footer>
  );
}

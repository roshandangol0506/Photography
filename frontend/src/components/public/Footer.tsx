import { Link } from "react-router-dom";
import { MapPin, Mail, Phone } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  BehanceIcon,
} from "@/components/icons/SocialIcons";

const QUICK_LINKS = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/#about", label: "About" },
  { to: "/#contact", label: "Contact" },
];

export function Footer() {
  const { settings } = useTheme();
  const { socialLinks, contactDetails } = settings;
  const year = new Date().getFullYear();

  const socials = [
    { href: socialLinks.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: socialLinks.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: socialLinks.youtube, label: "YouTube", Icon: YoutubeIcon },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-foreground">
            {settings.siteTitle}
          </p>
          {settings.tagline && (
            <p className="mt-2 text-sm text-muted-foreground">
              {settings.tagline}
            </p>
          )}
          {(socials.length > 0 || socialLinks.behance) && (
            <div className="mt-4 flex items-center gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              {socialLinks.behance && (
                <a
                  href={socialLinks.behance}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Behance"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <BehanceIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Quick Links</p>
          <ul className="mt-4 space-y-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Contact</p>
          <ul className="mt-4 space-y-3">
            {contactDetails.email && (
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" /> {contactDetails.email}
              </li>
            )}
            {contactDetails.phone && (
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" /> {contactDetails.phone}
              </li>
            )}
            {contactDetails.location && (
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {contactDetails.location}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">
          {settings.footerText ||
            `© ${year} ${settings.siteTitle}. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}

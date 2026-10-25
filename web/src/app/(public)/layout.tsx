import type { CSSProperties } from "react";
import { getImageProps } from "next/image";
import { getActiveCategories, getSettings } from "@/lib/content";
import { SiteProvider } from "@/components/providers/SiteProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { HomeNavbar } from "@/components/public/HomeNavbar";
import { Footer } from "@/components/public/Footer";
import { WhatsAppWidget } from "@/components/public/WhatsAppWidget";
import { AwardBadge } from "@/components/public/AwardBadge";
import { CustomCursor } from "@/components/public/cursor/CustomCursor";

// The site's backdrop, behind every public page. The original is a ~17MB
// camera file, so it goes through the image optimizer - at the same size as
// the cinematic sections' copy of it, so the browser fetches it once.
const BACKDROP = `url("${
  getImageProps({ src: "/blackBg.jpg", alt: "", width: 2048, height: 1365 })
    .props.src
}")`;

/**
 * Server Component: settings and categories are fetched here and handed to
 * the client provider as props, so every public page ships complete HTML on
 * the first response rather than waiting on a client-side request.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getActiveCategories(),
  ]);

  // Fail the build loudly rather than prerendering a 404 and caching it: an
  // unreachable API is a deploy fault, and silently shipping empty pages is
  // far worse than a build that refuses to finish.
  if (!settings) {
    throw new Error(
      "Unable to load site settings from the API. Is the Express server running and API_BASE_URL/API_KEY correct?",
    );
  }

  return (
    <QueryProvider>
      <SiteProvider settings={settings}>
        {/* `dark` from the server, so the first paint is already light-on-dark
            (SiteProvider adds it to <html> too, for portals). */}
        <div
          className="modernist dark site-backdrop flex min-h-screen flex-col text-md-fg"
          style={{ "--site-bg": BACKDROP } as CSSProperties}
        >
          <HomeNavbar overHero />
          <main className="flex-1">{children}</main>
          <AwardBadge />
          <WhatsAppWidget />
          <CustomCursor />
          <Footer settings={settings} categories={categories ?? []} />
        </div>
      </SiteProvider>
    </QueryProvider>
  );
}

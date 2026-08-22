import { getActiveCategories, getSettings } from "@/lib/content";
import { SiteProvider } from "@/components/providers/SiteProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { HomeNavbar } from "@/components/public/HomeNavbar";
import { Footer } from "@/components/public/Footer";
import { WhatsAppWidget } from "@/components/public/WhatsAppWidget";

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
        <div className="modernist flex min-h-screen flex-col bg-md-ground text-md-fg">
          <HomeNavbar overHero />
          <main className="flex-1">{children}</main>
          <WhatsAppWidget />
          <Footer settings={settings} categories={categories ?? []} />
        </div>
      </SiteProvider>
    </QueryProvider>
  );
}

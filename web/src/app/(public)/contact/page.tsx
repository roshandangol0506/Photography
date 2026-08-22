import type { Metadata } from "next";
import { getActiveCategories, getSettings } from "@/lib/content";
import { ContactPageContent } from "@/components/public/ContactPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const site = settings?.siteTitle ?? "the studio";
  const description = `Book a session with ${site} — commissions, prints and street photography walks.`;

  return {
    title: "Contact",
    description,
    alternates: { canonical: "/contact" },
    openGraph: { type: "website", title: `Contact ${site}`, description },
  };
}

/**
 * Server shell: the categories are fetched here, and only the booking form
 * below carries client state.
 */
export default async function ContactPage() {
  const categories = await getActiveCategories();
  return <ContactPageContent categories={categories ?? []} />;
}

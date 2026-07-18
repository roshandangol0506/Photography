import { useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

interface SeoOptions {
  title?: string;
  description?: string;
  image?: string;
}

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  if (!content) return () => {};

  const existing = document.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  const previousContent = existing?.getAttribute("content") ?? null;

  let el = existing;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);

  return () => {
    if (previousContent === null) {
      el.remove();
    } else {
      el.setAttribute("content", previousContent);
    }
  };
}

export function useSeo({ title, description, image }: SeoOptions = {}) {
  const { settings } = useTheme();
  const siteTitle = settings.siteTitle;
  const metaDescription = settings.seo?.metaDescription;
  const tagline = settings.tagline;
  const ogImage = settings.seo?.ogImage;

  useEffect(() => {
    const previousTitle = document.title;
    const finalTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    document.title = finalTitle;

    const finalDescription = description || metaDescription || tagline || "";
    const finalImage = image || ogImage || "";

    const restoreFns = [
      setMetaTag("name", "description", finalDescription),
      setMetaTag("property", "og:title", finalTitle),
      setMetaTag("property", "og:description", finalDescription),
      setMetaTag("property", "og:type", "website"),
      setMetaTag("property", "og:image", finalImage),
    ];

    return () => {
      document.title = previousTitle;
      restoreFns.forEach((restore) => restore());
    };
  }, [title, description, image, siteTitle, metaDescription, tagline, ogImage]);
}

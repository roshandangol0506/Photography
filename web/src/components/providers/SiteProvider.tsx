"use client";

import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import type { SiteSettings } from "@/types/content";

interface SiteContextValue {
  settings: SiteSettings;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSite must be used within SiteProvider");
  return context;
}

/**
 * Replaces the Vite app's ThemeProvider, which fetched settings itself and
 * returned null until they arrived - meaning nothing rendered server-side or
 * on first paint. Settings now come in as props from a Server Component, so
 * the markup is complete before any JavaScript runs.
 *
 * The public site is always dark, on the textured backdrop (see the public
 * layout). The layout's wrapper carries `dark` from the server; this also
 * puts it on <html> while a public page is open, for what renders outside the
 * wrapper (dialogs portalled to <body>), and takes it off again on the way
 * out so the dashboard keeps its own theme.
 */
export function SiteProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    return () => root.classList.remove("dark");
  }, []);

  return (
    <SiteContext.Provider value={{ settings }}>{children}</SiteContext.Provider>
  );
}

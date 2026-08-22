"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { SiteSettings } from "@/types/content";

interface SiteContextValue {
  settings: SiteSettings;
  isDark: boolean;
  toggleDark: () => void;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "theme";

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSite must be used within SiteProvider");
  return context;
}

/**
 * Replaces the Vite app's ThemeProvider, which fetched settings itself and
 * returned null until they arrived - meaning nothing rendered server-side or
 * on first paint. Settings now come in as props from a Server Component, so
 * the markup is complete before any JavaScript runs; this provider only owns
 * the theme toggle.
 */
export function SiteProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: ReactNode;
}) {
  const [isDark, setIsDark] = useState(settings.darkModeDefault);

  // Runs after hydration: localStorage is not available on the server, so the
  // stored preference is applied on the client and the server-rendered markup
  // stays deterministic.
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark") setIsDark(true);
    else if (stored === "light") setIsDark(false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Public palette from the dashboard. Inline properties outrank the `.dark`
  // rule, so in dark mode they are cleared rather than overwritten.
  useEffect(() => {
    const root = document.documentElement;
    const tokens: Record<string, string | undefined> = {
      "--md-red": settings.themeColors?.siteAccent,
      "--md-ground": settings.themeColors?.siteBackground,
      "--md-fg": settings.themeColors?.siteText,
    };

    if (isDark) {
      Object.keys(tokens).forEach((name) => root.style.removeProperty(name));
      return;
    }

    Object.entries(tokens).forEach(([name, value]) => {
      if (value) root.style.setProperty(name, value);
    });
  }, [settings.themeColors, isDark]);

  const toggleDark = () =>
    setIsDark((previous) => {
      const next = !previous;
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
      return next;
    });

  return (
    <SiteContext.Provider value={{ settings, isDark, toggleDark }}>
      {children}
    </SiteContext.Provider>
  );
}

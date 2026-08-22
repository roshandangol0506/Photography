import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePublicSettings, type SiteSettings } from "@/api/settings";
import { ThemeContext } from "./theme-context";

const THEME_STORAGE_KEY = "theme";

function ThemeProviderInner({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: ReactNode;
}) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return settings.darkModeDefault;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", settings.themeColors.primary);
    root.style.setProperty("--secondary", settings.themeColors.secondary);
    root.style.setProperty("--accent", settings.themeColors.accent);
    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--accent");
    };
  }, [settings.themeColors]);

  // Public-site palette. Inline properties outrank the `.dark` rule, so in
  // dark mode they are cleared rather than overwritten - that keeps the dark
  // theme exactly as designed no matter what the dashboard is set to.
  useEffect(() => {
    const root = document.documentElement;
    const tokens = {
      "--md-red": settings.themeColors.siteAccent,
      "--md-ground": settings.themeColors.siteBackground,
      "--md-fg": settings.themeColors.siteText,
    };

    if (isDark) {
      Object.keys(tokens).forEach((name) => root.style.removeProperty(name));
      return;
    }

    Object.entries(tokens).forEach(([name, value]) => {
      if (value) root.style.setProperty(name, value);
    });

    return () => {
      Object.keys(tokens).forEach((name) => root.style.removeProperty(name));
    };
  }, [settings.themeColors, isDark]);

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ settings, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: settings, isLoading } = usePublicSettings();

  if (isLoading || !settings) {
    return null;
  }

  return <ThemeProviderInner settings={settings}>{children}</ThemeProviderInner>;
}

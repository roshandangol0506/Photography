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

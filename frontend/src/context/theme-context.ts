import { createContext } from "react";
import type { SiteSettings } from "@/api/settings";

export interface ThemeContextValue {
  settings: SiteSettings;
  isDark: boolean;
  toggleDark: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);

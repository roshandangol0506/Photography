import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse } from "./types";

export interface SiteSettings {
  _id: string;
  siteTitle: string;
  tagline?: string;
  logo?: string;
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    behance?: string;
  };
  contactDetails: {
    email?: string;
    phone?: string;
    location?: string;
    mapEmbedUrl?: string;
  };
  footerText?: string;
  heroSettings: {
    autoplaySpeedMs: number;
    transitionStyle: string;
  };
  about: {
    title?: string;
    description?: string;
    image?: string;
    experienceYears?: number;
  };
  animationsEnabled: boolean;
  maintenanceMode: boolean;
  darkModeDefault: boolean;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings", "admin"],
    queryFn: async () => {
      const { data } =
        await api.get<ApiResponse<SiteSettings>>("/settings/admin");
      return data.data;
    },
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["settings", "public"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SiteSettings>>("/settings");
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<SiteSettings>) => {
      const { data } = await api.put<ApiResponse<SiteSettings>>(
        "/settings/admin",
        body,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

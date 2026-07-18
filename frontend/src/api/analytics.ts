import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, PaginationMeta } from "./types";

export interface AnalyticsOverview {
  totalPhotos: number;
  totalVisitors: number;
  totalLikes: number;
  totalComments: number;
  totalCollections: number;
  totalAwards: number;
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AnalyticsOverview>>(
        "/analytics/overview",
      );
      return data.data;
    },
  });
}

export interface ChartPoint {
  date: string;
  count: number;
}

export interface ChartParams {
  metric: "visitors" | "likes" | "comments" | "photos";
  range: "daily" | "weekly" | "monthly" | "yearly";
  from?: string;
  to?: string;
}

export function useAnalyticsChart(params: ChartParams) {
  return useQuery({
    queryKey: ["analytics", "chart", params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ChartPoint[]>>(
        "/analytics/chart",
        { params },
      );
      return data.data;
    },
  });
}

export interface TopLikedPhoto {
  _id: string;
  title: string;
  slug: string;
  images: { thumb: string };
  likeCount: number;
}

export function useTopLikedPhotos(limit = 5) {
  return useQuery({
    queryKey: ["likes", "top", limit],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TopLikedPhoto[]>>(
        "/likes/admin/top",
        { params: { limit } },
      );
      return data.data;
    },
  });
}

export interface RecentLike {
  _id: string;
  photo: { _id: string; title: string; slug: string; images: { thumb: string } };
  visitorId: string;
  createdAt: string;
}

export function useRecentLikes(params: { page?: number; perpage?: number }) {
  return useQuery({
    queryKey: ["likes", "recent", params],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ likes: RecentLike[]; pagination: PaginationMeta }>
      >("/likes/admin/recent", { params });
      return data.data;
    },
  });
}

export async function downloadAnalyticsExport(
  params: ChartParams,
): Promise<void> {
  const response = await api.get("/analytics/export", {
    params,
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = `analytics-${params.metric}-${params.range}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

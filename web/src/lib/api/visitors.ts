"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/client-api";
import type { ApiResponse, PaginationMeta } from "@/lib/shared-types";

export interface Visitor {
  _id: string;
  uniqueId: string;
  name?: string | null;
  visitCount: number;
  firstVisit: string;
  lastVisit: string;
  device?: string;
  browser?: string;
  platform?: string;
}

export interface VisitorListParams {
  page?: number;
  perpage?: number;
  search?: string;
  device?: string;
  browser?: string;
  platform?: string;
}

// Side-effect free lookup so a returning visitor keeps the name they gave.
export function useVisitorProfile(uniqueId: string | null) {
  return useQuery({
    queryKey: ["visitors", "profile", uniqueId],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ uniqueId: string; name: string | null }>
      >(`/visitors/profile/${uniqueId}`);
      return data.data;
    },
    enabled: Boolean(uniqueId),
    staleTime: 5 * 60_000,
  });
}

export function useVisitors(params: VisitorListParams) {
  return useQuery({
    queryKey: ["visitors", params],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ visitors: Visitor[]; pagination: PaginationMeta }>
      >("/visitors", { params });
      return data.data;
    },
  });
}

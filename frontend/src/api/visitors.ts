import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, PaginationMeta } from "./types";

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

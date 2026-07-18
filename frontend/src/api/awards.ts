import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, PaginationMeta } from "./types";

export interface Award {
  _id: string;
  title: string;
  organization?: string;
  year: number;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface AwardListParams {
  page?: number;
  perpage?: number;
  search?: string;
}

export interface AwardInput {
  title: string;
  organization?: string;
  year: number;
  description?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
}

export function useAwards(params: AwardListParams) {
  return useQuery({
    queryKey: ["awards", params],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ awards: Award[]; pagination: PaginationMeta }>
      >("/awards", { params });
      return data.data;
    },
  });
}

export function useActiveAwards() {
  return useQuery({
    queryKey: ["awards", "active"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Award[]>>("/awards/active");
      return data.data;
    },
  });
}

export function useCreateAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: AwardInput) => {
      const { data } = await api.post<ApiResponse<Award>>("/awards", body);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: AwardInput }) => {
      const { data } = await api.put<ApiResponse<Award>>(
        `/awards/${id}`,
        body,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
  });
}

export function useDeleteAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/awards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

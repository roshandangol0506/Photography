import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, PaginationMeta } from "./types";

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface CollectionListParams {
  page?: number;
  perpage?: number;
  search?: string;
}

export interface CollectionInput {
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  order?: number;
  isActive?: boolean;
}

export function useCollections(params: CollectionListParams) {
  return useQuery({
    queryKey: ["collections", params],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ collections: Collection[]; pagination: PaginationMeta }>
      >("/collections", { params });
      return data.data;
    },
  });
}

export function useActiveCollections() {
  return useQuery({
    queryKey: ["collections", "active"],
    queryFn: async () => {
      const { data } =
        await api.get<ApiResponse<Collection[]>>("/collections/active");
      return data.data;
    },
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CollectionInput) => {
      const { data } = await api.post<ApiResponse<Collection>>(
        "/collections",
        body,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: CollectionInput;
    }) => {
      const { data } = await api.put<ApiResponse<Collection>>(
        `/collections/${id}`,
        body,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/collections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

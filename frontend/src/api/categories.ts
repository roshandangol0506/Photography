import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, PaginationMeta } from "./types";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryListParams {
  page?: number;
  perpage?: number;
  search?: string;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  order?: number;
  isActive?: boolean;
}

export function useCategories(params: CategoryListParams) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ categories: Category[]; pagination: PaginationMeta }>
      >("/categories", { params });
      return data.data;
    },
  });
}

export function useActiveCategories() {
  return useQuery({
    queryKey: ["categories", "active"],
    queryFn: async () => {
      const { data } =
        await api.get<ApiResponse<Category[]>>("/categories/active");
      return data.data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CategoryInput) => {
      const { data } = await api.post<ApiResponse<Category>>(
        "/categories",
        body,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: CategoryInput }) => {
      const { data } = await api.put<ApiResponse<Category>>(
        `/categories/${id}`,
        body,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

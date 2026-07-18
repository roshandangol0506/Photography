import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, PaginationMeta } from "./types";

export interface Testimonial {
  _id: string;
  name: string;
  role?: string;
  avatar?: string;
  message: string;
  rating: number;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface TestimonialListParams {
  page?: number;
  perpage?: number;
  search?: string;
}

export interface TestimonialInput {
  name: string;
  role?: string;
  avatar?: string;
  message: string;
  rating?: number;
  order?: number;
  isActive?: boolean;
}

export function useTestimonials(params: TestimonialListParams) {
  return useQuery({
    queryKey: ["testimonials", params],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ testimonials: Testimonial[]; pagination: PaginationMeta }>
      >("/testimonials", { params });
      return data.data;
    },
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: TestimonialInput) => {
      const { data } = await api.post<ApiResponse<Testimonial>>(
        "/testimonials",
        body,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: TestimonialInput;
    }) => {
      const { data } = await api.put<ApiResponse<Testimonial>>(
        `/testimonials/${id}`,
        body,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
}

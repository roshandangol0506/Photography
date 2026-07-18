import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, PaginationMeta } from "./types";

export interface PhotoRef {
  _id: string;
  name: string;
  slug: string;
}

export interface Photo {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  images: {
    thumb: string;
    medium: string;
    large: string;
    blurDataURL: string;
  };
  category?: PhotoRef | null;
  collections: PhotoRef[];
  tags: string[];
  camera?: string;
  lens?: string;
  location?: string;
  dateTaken?: string | null;
  isBackground: boolean;
  isSideScroll: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isHome: boolean;
  visibility: "draft" | "published" | "archive";
  order: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface PhotoListParams {
  page?: number;
  perpage?: number;
  search?: string;
  category?: string;
  visibility?: string;
  tag?: string;
}

export interface PublicPhotoListParams {
  page?: number;
  perpage?: number;
  search?: string;
  category?: string;
  collection?: string;
  tag?: string;
  featured?: boolean;
  trending?: boolean;
}

export function usePublicPhotos(params: PublicPhotoListParams) {
  return useQuery({
    queryKey: ["photos", "public", params],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ photos: Photo[]; pagination: PaginationMeta }>
      >("/photos", { params });
      return data.data;
    },
  });
}

export function useBackgroundPhotos() {
  return useQuery({
    queryKey: ["photos", "background"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Photo[]>>(
        "/photos/background",
      );
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useSideScrollPhotos() {
  return useQuery({
    queryKey: ["photos", "sidescroll"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Photo[]>>(
        "/photos/sidescroll",
      );
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useAdminPhotos(params: PhotoListParams) {
  return useQuery({
    queryKey: ["photos", "admin", params],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ photos: Photo[]; pagination: PaginationMeta }>
      >("/photos/admin", { params });
      return data.data;
    },
  });
}

export function useAdminPhoto(id: string | undefined) {
  return useQuery({
    queryKey: ["photos", "admin", "detail", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Photo>>(
        `/photos/admin/${id}`,
      );
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export interface PhotoFormValues {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  collections?: string[];
  tags?: string[];
  camera?: string;
  lens?: string;
  location?: string;
  dateTaken?: string;
  isBackground?: boolean;
  isSideScroll?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isHome?: boolean;
  visibility?: string;
  order?: number;
  image?: File | null;
}

function toFormData(values: PhotoFormValues): FormData {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "image") {
      if (value instanceof File) formData.append("image", value);
      return;
    }
    if (Array.isArray(value)) {
      formData.append(key, value.join(","));
      return;
    }
    formData.append(key, String(value));
  });
  return formData;
}

export function useCreatePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: PhotoFormValues) => {
      const { data } = await api.post<ApiResponse<Photo>>(
        "/photos/admin",
        toFormData(values),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdatePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: PhotoFormValues;
    }) => {
      const { data } = await api.put<ApiResponse<Photo>>(
        `/photos/admin/${id}`,
        toFormData(values),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/photos/admin/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

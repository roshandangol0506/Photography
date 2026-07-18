import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse } from "./types";

export function useLikeStatus(photoId: string | undefined, visitorId: string | null) {
  return useQuery({
    queryKey: ["likes", "status", photoId, visitorId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ liked: boolean }>>(
        `/likes/${photoId}/status`,
        { params: { visitorId } },
      );
      return data.data;
    },
    enabled: Boolean(photoId) && Boolean(visitorId),
  });
}

export function useLikePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      photoId,
      visitorId,
    }: {
      photoId: string;
      visitorId: string;
    }) => {
      const { data } = await api.post<
        ApiResponse<{ liked: boolean; likeCount: number }>
      >(`/likes/${photoId}`, { visitorId });
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["likes", "status", variables.photoId] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

export function useUnlikePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      photoId,
      visitorId,
    }: {
      photoId: string;
      visitorId: string;
    }) => {
      const { data } = await api.delete<
        ApiResponse<{ liked: boolean; likeCount: number }>
      >(`/likes/${photoId}`, { params: { visitorId } });
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["likes", "status", variables.photoId] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

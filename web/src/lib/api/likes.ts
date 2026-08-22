"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/client-api";
import type { ApiResponse } from "@/lib/shared-types";

export function useLikeStatus(
  photoId: string | undefined,
  visitorId: string | null,
) {
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

type LikeArgs = { photoId: string; visitorId: string };

function useLikeMutation(remove: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ photoId, visitorId }: LikeArgs) => {
      const path = `/likes/${photoId}`;
      const { data } = remove
        ? await api.delete<ApiResponse<{ liked: boolean; likeCount: number }>>(
            path,
            { params: { visitorId } },
          )
        : await api.post<ApiResponse<{ liked: boolean; likeCount: number }>>(
            path,
            { visitorId },
          );
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["likes", "status", variables.photoId],
      });
    },
  });
}

export const useLikePhoto = () => useLikeMutation(false);
export const useUnlikePhoto = () => useLikeMutation(true);

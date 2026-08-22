"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/client-api";
import type { ApiResponse, PaginationMeta } from "@/lib/shared-types";

export interface Comment {
  _id: string;
  parent?: string | null;
  visitorId: string;
  name: string;
  content: string;
  isAdminReply?: boolean;
  likeCount: number;
  likedByMe?: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  replies?: Comment[];
}

interface PublicCommentParams {
  visitorId?: string | null;
  sort?: "recent" | "oldest";
}

export function usePublicComments(
  photoId: string,
  params: PublicCommentParams = {},
) {
  return useQuery({
    queryKey: ["comments", "public", photoId, params],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ comments: Comment[]; pagination: PaginationMeta }>
      >(`/comments/${photoId}`, { params });
      return data.data;
    },
  });
}

export interface CreateCommentInput {
  visitorId: string;
  name: string;
  content: string;
  parent?: string;
}

export function useCreateComment(photoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateCommentInput) => {
      const { data } = await api.post<ApiResponse<Comment>>(
        `/comments/${photoId}`,
        body,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", "public", photoId],
      });
    },
  });
}

export function useLikeComment(photoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
      visitorId,
    }: {
      commentId: string;
      visitorId: string;
    }) => {
      const { data } = await api.post<
        ApiResponse<{ liked: boolean; likeCount: number }>
      >(`/comments/${commentId}/like`, { visitorId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", "public", photoId],
      });
    },
  });
}

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

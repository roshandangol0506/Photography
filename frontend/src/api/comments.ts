import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, PaginationMeta } from "./types";

export interface Comment {
  _id: string;
  photo: { _id: string; title: string; slug: string } | string;
  parent?: string | null;
  visitorId: string;
  name: string;
  content: string;
  isAdminReply?: boolean;
  likeCount: number;
  // Server-computed for the requesting visitor; `likedBy` never leaves the API.
  likedByMe?: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  replies?: Comment[];
}

export interface CommentListParams {
  page?: number;
  perpage?: number;
  status?: string;
  search?: string;
}

export interface PublicCommentParams {
  page?: number;
  perpage?: number;
  visitorId?: string | null;
  sort?: "recent" | "oldest";
}

export function usePublicComments(
  photoId: string | undefined,
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
    enabled: Boolean(photoId),
  });
}

export interface CreateCommentInput {
  visitorId: string;
  name: string;
  content: string;
  parent?: string;
}

export function useCreateComment(photoId: string | undefined) {
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
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useLikeComment(photoId: string | undefined) {
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

export function useReplyToComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data } = await api.post<ApiResponse<Comment>>(
        `/comments/admin/${id}/reply`,
        { content },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useAdminComments(params: CommentListParams) {
  return useQuery({
    queryKey: ["comments", "admin", params],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ comments: Comment[]; pagination: PaginationMeta }>
      >("/comments/admin", { params });
      return data.data;
    },
  });
}

export function useUpdateCommentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch<ApiResponse<Comment>>(
        `/comments/admin/${id}/status`,
        { status },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/comments/admin/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

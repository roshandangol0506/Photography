import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, PaginationMeta } from "./types";

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

export interface MessageListParams {
  page?: number;
  perpage?: number;
  status?: string;
  search?: string;
}

export function useMessages(params: MessageListParams) {
  return useQuery({
    queryKey: ["messages", params],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ messages: ContactMessage[]; pagination: PaginationMeta }>
      >("/messages", { params });
      return data.data;
    },
  });
}

export function useUpdateMessageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch<ApiResponse<ContactMessage>>(
        `/messages/${id}/status`,
        { status },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

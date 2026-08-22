"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/client-api";
import type { ApiResponse } from "@/lib/shared-types";

export interface MessageInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export function useCreateMessage() {
  return useMutation({
    mutationFn: async (body: MessageInput) => {
      const { data } = await api.post<ApiResponse<unknown>>("/messages", body);
      return data.data;
    },
  });
}

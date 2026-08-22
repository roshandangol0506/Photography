"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/client-api";
import type { ApiResponse } from "@/lib/shared-types";

export interface CreateLeadInput {
  fullName: string;
  email: string;
  phone?: string;
  description?: string;
  bookingDate?: string;
  category?: string;
}

export function useCreateLead() {
  return useMutation({
    mutationFn: async (body: CreateLeadInput) => {
      const { data } = await api.post<ApiResponse<unknown>>("/leads", body);
      return data.data;
    },
  });
}

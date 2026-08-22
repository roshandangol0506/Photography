"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/client-api";
import type { ApiResponse, PaginationMeta } from "@/lib/shared-types";

export type LeadType = "book_a_demo" | "contact";
export type LeadStatus = "pending" | "completed" | "rejected";

export interface Lead {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  description?: string;
  type: LeadType;
  status: LeadStatus;
  bookingDate?: string | null;
  category?: { _id: string; name: string; slug: string } | null;
  createdAt: string;
}

export interface LeadListParams {
  page?: number;
  perpage?: number;
  search?: string;
  status?: string;
  type?: string;
}

export interface CreateLeadInput {
  fullName: string;
  email: string;
  phone?: string;
  description?: string;
  bookingDate?: string;
  category?: string;
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateLeadInput) => {
      const { data } = await api.post<ApiResponse<Lead>>("/leads", body);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useLeads(params: LeadListParams) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ leads: Lead[]; pagination: PaginationMeta }>
      >("/leads", { params });
      return data.data;
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { data } = await api.patch<ApiResponse<Lead>>(
        `/leads/${id}/status`,
        { status },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useSendLeadMail() {
  return useMutation({
    mutationFn: async ({
      id,
      subject,
      message,
    }: {
      id: string;
      subject: string;
      message: string;
    }) => {
      const { data } = await api.post<ApiResponse<Lead>>(`/leads/${id}/mail`, {
        subject,
        message,
      });
      return data.data;
    },
  });
}

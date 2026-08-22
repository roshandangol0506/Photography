"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/client-api";
import type { ApiResponse } from "@/lib/shared-types";

export interface UploadResult {
  url: string;
  key: string;
}

export function useUploadAsset() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<ApiResponse<UploadResult>>(
        "/uploads",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.data;
    },
  });
}

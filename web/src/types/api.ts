export interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  perpage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

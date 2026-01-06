export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}

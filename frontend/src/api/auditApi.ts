import { baseApi } from "./baseApi";
import type { ApiResponse } from "../types/api.types";
import type { AuditLog, AuditLogFilters, PagedResult } from "../types/audit.types";

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<ApiResponse<PagedResult<AuditLog>>, AuditLogFilters>({
      query: (filters) => {
        // Build params object, ensuring dates are properly formatted
        const params: Record<string, string | number | undefined> = {
          page: filters.page || 1,
          pageSize: filters.pageSize || 20,
        };

        // Add optional filters only if they have values
        if (filters.entityType) {
          params.entityType = filters.entityType;
        }
        if (filters.action) {
          params.action = filters.action;
        }
        if (filters.userId) {
          params.userId = filters.userId;
        }
        if (filters.branchId) {
          params.branchId = filters.branchId;
        }

        // Date filters - ensure they are in YYYY-MM-DD format
        // The date input already returns YYYY-MM-DD string format
        if (filters.fromDate) {
          params.fromDate = filters.fromDate;
        }
        if (filters.toDate) {
          params.toDate = filters.toDate;
        }

        return {
          url: "/audit-logs",
          params,
        };
      },
      providesTags: ["AuditLogs"],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;

import { baseApi } from "./baseApi";
import { DailyReport, SalesReport } from "../types/report.types";
import { ApiResponse } from "../types/api.types";

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // التقرير اليومي
    getDailyReport: builder.query<ApiResponse<DailyReport>, string | undefined>({
      query: (date) => ({
        url: "/reports/daily",
        params: date ? { date } : undefined,
      }),
      providesTags: ["Reports"],
    }),

    // تقرير المبيعات
    getSalesReport: builder.query<
      ApiResponse<SalesReport>,
      { fromDate: string; toDate: string }
    >({
      query: ({ fromDate, toDate }) => ({
        url: "/reports/sales",
        params: { fromDate, toDate },
      }),
      providesTags: ["Reports"],
    }),
  }),
});

export const { useGetDailyReportQuery, useGetSalesReportQuery } = reportsApi;

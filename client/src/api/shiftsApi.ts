import { baseApi } from "./baseApi";
import {
  Shift,
  OpenShiftRequest,
  CloseShiftRequest,
} from "../types/shift.types";
import { ApiResponse } from "../types/api.types";

export const shiftsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // جلب الوردية الحالية
    getCurrentShift: builder.query<ApiResponse<Shift | null>, void>({
      query: () => "/shifts/current",
      providesTags: [{ type: "Shifts", id: "CURRENT" }],
    }),

    // جلب كل الورديات
    getShifts: builder.query<ApiResponse<Shift[]>, void>({
      query: () => "/shifts",
      providesTags: ["Shifts"],
    }),

    // جلب وردية واحدة
    getShift: builder.query<ApiResponse<Shift>, number>({
      query: (id) => `/shifts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Shifts", id }],
    }),

    // فتح وردية
    openShift: builder.mutation<ApiResponse<Shift>, OpenShiftRequest>({
      query: (data) => ({
        url: "/shifts/open",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Shifts"],
    }),

    // إغلاق وردية
    closeShift: builder.mutation<ApiResponse<Shift>, CloseShiftRequest>({
      query: (data) => ({
        url: "/shifts/close",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Shifts"],
    }),
  }),
});

export const {
  useGetCurrentShiftQuery,
  useGetShiftsQuery,
  useGetShiftQuery,
  useOpenShiftMutation,
  useCloseShiftMutation,
} = shiftsApi;

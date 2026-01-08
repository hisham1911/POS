import { baseApi } from "./baseApi";
import { ApiResponse } from "../types/api.types";
import {
  LowStockProduct,
  LowStockResponse,
  StockHistoryPagedResult,
  StockHistoryQueryParams,
  StockAdjustmentRequest,
  StockAdjustResponse,
  CurrentStockResponse,
} from "../types/inventory.types";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // جلب المنتجات منخفضة المخزون
    getLowStockProducts: builder.query<LowStockResponse, void>({
      query: () => "/inventory/low-stock",
      providesTags: [{ type: "Inventory", id: "LOW_STOCK" }],
    }),

    // جلب سجل حركة المخزون لمنتج
    getProductStockHistory: builder.query<
      ApiResponse<{ data: StockHistoryPagedResult }>,
      StockHistoryQueryParams
    >({
      query: ({ productId, page = 1, pageSize = 20 }) => ({
        url: `/inventory/products/${productId}/history`,
        params: { page, pageSize },
      }),
      providesTags: (_result, _error, { productId }) => [
        { type: "Inventory", id: `HISTORY_${productId}` },
      ],
    }),

    // جلب المخزون الحالي لمنتج
    getCurrentStock: builder.query<ApiResponse<CurrentStockResponse>, number>({
      query: (productId) => `/inventory/products/${productId}/stock`,
      providesTags: (_result, _error, productId) => [
        { type: "Inventory", id: `STOCK_${productId}` },
        { type: "Products", id: productId },
      ],
    }),

    // تعديل المخزون يدويًا
    adjustProductStock: builder.mutation<
      ApiResponse<StockAdjustResponse>,
      { productId: number; data: StockAdjustmentRequest }
    >({
      query: ({ productId, data }) => ({
        url: `/inventory/products/${productId}/adjust`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Inventory", id: `STOCK_${productId}` },
        { type: "Inventory", id: `HISTORY_${productId}` },
        { type: "Inventory", id: "LOW_STOCK" },
        { type: "Products", id: productId },
        { type: "Products", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetLowStockProductsQuery,
  useGetProductStockHistoryQuery,
  useGetCurrentStockQuery,
  useAdjustProductStockMutation,
} = inventoryApi;

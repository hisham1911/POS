import { baseApi } from "./baseApi";
import {
  Order,
  CreateOrderRequest,
  CompleteOrderRequest,
} from "../types/order.types";
import { ApiResponse } from "../types/api.types";

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // جلب كل الطلبات
    getOrders: builder.query<ApiResponse<Order[]>, void>({
      query: () => "/orders",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Orders" as const,
                id,
              })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),

    // جلب طلب واحد
    getOrder: builder.query<ApiResponse<Order>, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Orders", id }],
    }),

    // جلب طلبات اليوم
    getTodayOrders: builder.query<ApiResponse<Order[]>, void>({
      query: () => "/orders/today",
      providesTags: [{ type: "Orders", id: "LIST" }],
    }),

    // إنشاء طلب جديد
    createOrder: builder.mutation<ApiResponse<Order>, CreateOrderRequest>({
      query: (order) => ({
        url: "/orders",
        method: "POST",
        body: order,
      }),
      invalidatesTags: [{ type: "Orders", id: "LIST" }, "Shifts"],
    }),

    // إضافة عنصر للطلب
    addOrderItem: builder.mutation<
      ApiResponse<Order>,
      {
        orderId: number;
        item: { productId: number; quantity: number; notes?: string };
      }
    >({
      query: ({ orderId, item }) => ({
        url: `/orders/${orderId}/items`,
        method: "POST",
        body: item,
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "Orders", id: orderId },
      ],
    }),

    // حذف عنصر من الطلب
    removeOrderItem: builder.mutation<
      ApiResponse<Order>,
      { orderId: number; itemId: number }
    >({
      query: ({ orderId, itemId }) => ({
        url: `/orders/${orderId}/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "Orders", id: orderId },
      ],
    }),

    // إكمال الطلب
    completeOrder: builder.mutation<
      ApiResponse<Order>,
      { orderId: number; data: CompleteOrderRequest }
    >({
      query: ({ orderId, data }) => ({
        url: `/orders/${orderId}/complete`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "Orders", id: orderId },
        { type: "Orders", id: "LIST" },
        "Shifts",
      ],
    }),

    // إلغاء الطلب
    cancelOrder: builder.mutation<
      ApiResponse<boolean>,
      { orderId: number; reason?: string }
    >({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/cancel`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "Orders", id: orderId },
        { type: "Orders", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetTodayOrdersQuery,
  useCreateOrderMutation,
  useAddOrderItemMutation,
  useRemoveOrderItemMutation,
  useCompleteOrderMutation,
  useCancelOrderMutation,
} = ordersApi;

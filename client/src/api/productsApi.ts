import { baseApi } from "./baseApi";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/product.types";
import { ApiResponse } from "../types/api.types";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // جلب كل المنتجات
    getProducts: builder.query<ApiResponse<Product[]>, void>({
      query: () => "/products",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Products" as const,
                id,
              })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),

    // جلب منتج واحد
    getProduct: builder.query<ApiResponse<Product>, number>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Products", id }],
    }),

    // جلب منتجات حسب التصنيف
    getProductsByCategory: builder.query<ApiResponse<Product[]>, number>({
      query: (categoryId) => `/products?categoryId=${categoryId}`,
      providesTags: [{ type: "Products", id: "LIST" }],
    }),

    // إضافة منتج
    createProduct: builder.mutation<ApiResponse<Product>, CreateProductRequest>({
      query: (product) => ({
        url: "/products",
        method: "POST",
        body: product,
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),

    // تحديث منتج
    updateProduct: builder.mutation<
      ApiResponse<Product>,
      { id: number; data: UpdateProductRequest }
    >({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
      ],
    }),

    // حذف منتج
    deleteProduct: builder.mutation<ApiResponse<boolean>, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetProductsByCategoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;

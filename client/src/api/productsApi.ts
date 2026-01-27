import { baseApi } from "./baseApi";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductsQueryParams,
} from "../types/product.types";
import { ApiResponse } from "../types/api.types";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // جلب كل المنتجات مع الفلاتر
    getProducts: builder.query<ApiResponse<Product[]>, ProductsQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.categoryId !== undefined && params.categoryId !== null) {
          queryParams.append('categoryId', params.categoryId.toString());
        }
        if (params?.search !== undefined && params.search !== null && params.search.trim() !== '') {
          queryParams.append('search', params.search.trim());
        }
        if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
        if (params?.lowStock !== undefined) queryParams.append('lowStock', params.lowStock.toString());
        
        const queryString = queryParams.toString();
        return `/products${queryString ? `?${queryString}` : ''}`;
      },
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
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;

import { baseApi } from "./baseApi";
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from "../types/supplier.types";
import { ApiResponse } from "../types/api.types";

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all suppliers
    getSuppliers: builder.query<ApiResponse<Supplier[]>, void>({
      query: () => "/suppliers",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Suppliers" as const,
                id,
              })),
              { type: "Suppliers", id: "LIST" },
            ]
          : [{ type: "Suppliers", id: "LIST" }],
    }),

    // Get single supplier
    getSupplier: builder.query<ApiResponse<Supplier>, number>({
      query: (id) => `/suppliers/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Suppliers", id }],
    }),

    // Create supplier
    createSupplier: builder.mutation<ApiResponse<Supplier>, CreateSupplierRequest>({
      query: (supplier) => ({
        url: "/suppliers",
        method: "POST",
        body: supplier,
      }),
      invalidatesTags: [{ type: "Suppliers", id: "LIST" }],
    }),

    // Update supplier
    updateSupplier: builder.mutation<
      ApiResponse<Supplier>,
      { id: number; data: UpdateSupplierRequest }
    >({
      query: ({ id, data }) => ({
        url: `/suppliers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Suppliers", id },
        { type: "Suppliers", id: "LIST" },
      ],
    }),

    // Delete supplier
    deleteSupplier: builder.mutation<ApiResponse<boolean>, number>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Suppliers", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;

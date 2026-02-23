import { baseApi } from "./baseApi";
import { ApiResponse } from "../types/api.types";
import {
  PermissionInfo,
  UserPermissions,
  UpdatePermissionsRequest,
} from "../types/permission.types";

export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // جلب كل الصلاحيات المتاحة مع الوصف
    getAvailablePermissions: builder.query<
      ApiResponse<PermissionInfo[]>,
      void
    >({
      query: () => "/permissions/available",
      providesTags: [{ type: "Permissions", id: "AVAILABLE" }],
    }),

    // جلب كل الكاشيرات مع صلاحياتهم
    getAllCashierPermissions: builder.query<
      ApiResponse<UserPermissions[]>,
      void
    >({
      query: () => "/permissions/users",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ userId }) => ({
                type: "Permissions" as const,
                id: userId,
              })),
              { type: "Permissions", id: "LIST" },
            ]
          : [{ type: "Permissions", id: "LIST" }],
    }),

    // جلب صلاحيات مستخدم معين
    getUserPermissions: builder.query<ApiResponse<UserPermissions>, number>({
      query: (userId) => `/permissions/user/${userId}`,
      providesTags: (_result, _error, userId) => [
        { type: "Permissions", id: userId },
      ],
    }),

    // تحديث صلاحيات مستخدم
    updateUserPermissions: builder.mutation<
      ApiResponse<{ message: string }>,
      { userId: number; data: UpdatePermissionsRequest }
    >({
      query: ({ userId, data }) => ({
        url: `/permissions/user/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Permissions", id: userId },
        { type: "Permissions", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAvailablePermissionsQuery,
  useGetAllCashierPermissionsQuery,
  useGetUserPermissionsQuery,
  useUpdateUserPermissionsMutation,
} = permissionsApi;

import { baseApi } from "./baseApi";
import { ApiResponse } from "../types/api.types";
import {
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
  ToggleUserStatusRequest,
} from "../types/user.types";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<ApiResponse<UserDto[]>, void>({
      query: () => "/users",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Users" as const,
                id,
              })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getUser: builder.query<ApiResponse<UserDto>, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),

    createUser: builder.mutation<ApiResponse<UserDto>, CreateUserRequest>({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "Users", id: "LIST" },
        { type: "Permissions", id: "LIST" },
      ],
    }),

    updateUser: builder.mutation<
      ApiResponse<UserDto>,
      { id: number; data: UpdateUserRequest }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<ApiResponse<boolean>, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
        { type: "Permissions", id: "LIST" },
      ],
    }),

    toggleUserStatus: builder.mutation<
      ApiResponse<boolean>,
      { id: number; data: ToggleUserStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}/toggle-status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
} = usersApi;

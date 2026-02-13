import { baseApi } from './baseApi';
import type {
  CreateTenantRequest,
  CreateTenantResponse,
  SetTenantStatusRequest,
  SystemTenantSummary,
} from '../types/system';

export const systemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTenants: builder.query<
      { success: boolean; data: SystemTenantSummary[]; message?: string },
      void
    >({
      query: () => ({
        url: '/system/tenants',
        method: 'GET',
      }),
    }),
    createTenant: builder.mutation<
      { success: boolean; data: CreateTenantResponse; message: string },
      CreateTenantRequest
    >({
      query: (data) => ({
        url: '/system/tenants',
        method: 'POST',
        body: data,
      }),
    }),
    setTenantStatus: builder.mutation<
      { success: boolean; data: boolean; message: string },
      { tenantId: number; body: SetTenantStatusRequest }
    >({
      query: ({ tenantId, body }) => ({
        url: `/system/tenants/${tenantId}/status`,
        method: 'PATCH',
        body,
      }),
    }),
  }),
});

export const { useGetTenantsQuery, useCreateTenantMutation, useSetTenantStatusMutation } = systemApi;

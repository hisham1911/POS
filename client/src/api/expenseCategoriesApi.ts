import { baseApi } from './baseApi';
import type {
  ExpenseCategory,
  CreateExpenseCategoryRequest,
  UpdateExpenseCategoryRequest,
} from '../types/expense.types';
import type { ApiResponse } from '../types/api.types';

export const expenseCategoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all expense categories
    getExpenseCategories: builder.query<ApiResponse<ExpenseCategory[]>, void>({
      query: () => '/expense-categories',
      providesTags: ['ExpenseCategories'],
    }),

    // Get expense category by ID
    getExpenseCategoryById: builder.query<ApiResponse<ExpenseCategory>, number>({
      query: (id) => `/expense-categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ExpenseCategory', id }],
    }),

    // Create expense category
    createExpenseCategory: builder.mutation<ApiResponse<ExpenseCategory>, CreateExpenseCategoryRequest>({
      query: (category) => ({
        url: '/expense-categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['ExpenseCategories'],
    }),

    // Update expense category
    updateExpenseCategory: builder.mutation<
      ApiResponse<ExpenseCategory>,
      { id: number; category: UpdateExpenseCategoryRequest }
    >({
      query: ({ id, category }) => ({
        url: `/expense-categories/${id}`,
        method: 'PUT',
        body: category,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ExpenseCategory', id },
        'ExpenseCategories',
      ],
    }),

    // Delete expense category
    deleteExpenseCategory: builder.mutation<ApiResponse<boolean>, number>({
      query: (id) => ({
        url: `/expense-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExpenseCategories'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExpenseCategoriesQuery,
  useGetExpenseCategoryByIdQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
} = expenseCategoriesApi;

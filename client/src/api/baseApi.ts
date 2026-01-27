import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  retry,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

// API Response type from backend
interface ApiErrorResponse {
  success: boolean;
  message?: string;
  errorCode?: string;
}

// Base query with auth header and branch header
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    const branchId = state.branch?.currentBranch?.id;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (branchId) {
      headers.set("X-Branch-Id", branchId.toString());
    }
    return headers;
  },
});

// Base query with global error handling and retry logic
const baseQueryWithReauth = retry(
  async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error) {
      const error = result.error as FetchBaseQueryError;

      // Network error (offline) - retry
      if (error.status === "FETCH_ERROR") {
        toast.error("لا يوجد اتصال بالإنترنت");
        // Retry will happen automatically
        return result;
      }

      // Timeout error - retry
      if (error.status === "TIMEOUT_ERROR") {
        toast.error("انتهت مهلة الاتصال، حاول مرة أخرى");
        // Retry will happen automatically
        return result;
      }

      // 401 Unauthorized - Token expired (don't retry)
      if (error.status === 401) {
        api.dispatch({ type: "auth/logout" });
        window.location.href = "/login";
        retry.fail(error); // Don't retry auth errors
        return result;
      }

      // 403 Forbidden / 400 Bad Request / 409 Conflict - Show backend message (don't retry)
      if (error.status === 403 || error.status === 400 || error.status === 409) {
        const errorData = error.data as ApiErrorResponse | undefined;
        const message = errorData?.message || "حدث خطأ في الطلب";

        // Handle specific error codes
        if (errorData?.errorCode === "NO_OPEN_SHIFT") {
          toast.error("يجب فتح وردية قبل إنشاء طلب");
        } else if (errorData?.errorCode === "SHIFT_CONCURRENCY_CONFLICT") {
          toast.error("تم تعديل الوردية من مستخدم آخر، يرجى تحديث الصفحة");
          // Invalidate shift cache to force refetch
          api.dispatch({ type: "api/invalidateTags", payload: ["Shifts"] });
        } else if (errorData?.errorCode === "SHIFT_BRANCH_MISMATCH") {
          toast.error("الوردية لا تنتمي للفرع الحالي");
        } else if (errorData?.errorCode === "INSUFFICIENT_STOCK") {
          toast.error(message, { duration: 5000 });
          // Invalidate products cache to get updated stock
          api.dispatch({ type: "api/invalidateTags", payload: ["Products"] });
        } else {
          toast.error(message);
        }
        retry.fail(error); // Don't retry client errors
        return result;
      }

      // 500 Server Error - retry
      if (error.status === 500) {
        toast.error("حدث خطأ في الخادم، حاول مرة أخرى");
        // Retry will happen automatically
        return result;
      }
    }

    return result;
  },
  {
    maxRetries: 3, // Retry up to 3 times
  }
);

// Create the base API
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Products",
    "Categories",
    "Orders",
    "Shifts",
    "User",
    "Branches",
    "Tenant",
    "AuditLogs",
    "Reports",
    "Customers",
    "Inventory",
    "Suppliers",
  ],
  endpoints: () => ({}),
});

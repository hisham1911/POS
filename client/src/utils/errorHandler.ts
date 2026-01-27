import { toast } from "react-hot-toast";

// Error codes from backend
export const ERROR_CODES = {
  NO_OPEN_SHIFT: "NO_OPEN_SHIFT",
  PRODUCT_INACTIVE: "PRODUCT_INACTIVE",
  ORDER_EMPTY: "ORDER_EMPTY",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  INVALID_QUANTITY: "INVALID_QUANTITY",
  INVALID_PRICE: "INVALID_PRICE",
  ORDER_NOT_EDITABLE: "ORDER_NOT_EDITABLE",
  CUSTOMER_NOT_FOUND: "CUSTOMER_NOT_FOUND",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

// Arabic error messages
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.NO_OPEN_SHIFT]: "يجب فتح وردية أولاً قبل إنشاء طلبات",
  [ERROR_CODES.PRODUCT_INACTIVE]: "المنتج غير متاح حالياً",
  [ERROR_CODES.ORDER_EMPTY]: "لا يمكن إنشاء طلب فارغ",
  [ERROR_CODES.INSUFFICIENT_STOCK]: "الكمية المتاحة غير كافية",
  [ERROR_CODES.INVALID_QUANTITY]: "الكمية المدخلة غير صحيحة",
  [ERROR_CODES.INVALID_PRICE]: "السعر المدخل غير صحيح",
  [ERROR_CODES.ORDER_NOT_EDITABLE]: "لا يمكن تعديل هذا الطلب",
  [ERROR_CODES.CUSTOMER_NOT_FOUND]: "العميل غير موجود",
  [ERROR_CODES.PRODUCT_NOT_FOUND]: "المنتج غير موجود",
  [ERROR_CODES.CATEGORY_NOT_FOUND]: "التصنيف غير موجود",
  [ERROR_CODES.UNAUTHORIZED]: "يجب تسجيل الدخول أولاً",
  [ERROR_CODES.FORBIDDEN]: "ليس لديك صلاحية للقيام بهذا الإجراء",
  [ERROR_CODES.VALIDATION_ERROR]: "البيانات المدخلة غير صحيحة",
};

// Default error messages by status code
const STATUS_MESSAGES: Record<number, string> = {
  400: "طلب غير صحيح",
  401: "يجب تسجيل الدخول أولاً",
  403: "ليس لديك صلاحية للقيام بهذا الإجراء",
  404: "العنصر المطلوب غير موجود",
  409: "حدث تعارض في البيانات",
  500: "حدث خطأ في الخادم",
  503: "الخدمة غير متاحة حالياً",
};

interface ApiError {
  status?: number;
  data?: {
    message?: string;
    errorCode?: string;
    errors?: Record<string, string[]>;
  };
}

/**
 * Handle API errors and show user-friendly messages
 */
export function handleApiError(error: any): string {
  // Log error for debugging
  console.error("API Error:", error);

  // Check if it's an API error with response
  const apiError = error as ApiError;

  // Check for error code
  if (apiError.data?.errorCode) {
    const message = ERROR_MESSAGES[apiError.data.errorCode];
    if (message) {
      return message;
    }
  }

  // Check for custom message from backend
  if (apiError.data?.message) {
    return apiError.data.message;
  }

  // Check for validation errors
  if (apiError.data?.errors) {
    const firstError = Object.values(apiError.data.errors)[0];
    if (firstError && firstError.length > 0) {
      return firstError[0];
    }
  }

  // Check for status code
  if (apiError.status) {
    const message = STATUS_MESSAGES[apiError.status];
    if (message) {
      return message;
    }
  }

  // Network error
  if (error.message === "Network Error" || error.message === "Failed to fetch") {
    return "فشل الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت";
  }

  // Default error message
  return "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى";
}

/**
 * Show error toast with user-friendly message
 */
export function showErrorToast(error: any) {
  const message = handleApiError(error);
  toast.error(message);
}

/**
 * Log error for debugging (can be sent to error tracking service)
 */
export function logError(error: any, context?: string) {
  const timestamp = new Date().toISOString();
  const errorData = {
    timestamp,
    context,
    error: {
      message: error.message,
      stack: error.stack,
      ...error,
    },
  };

  console.error("Error Log:", errorData);

  // TODO: Send to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === "production") {
  //   sendToErrorTracking(errorData);
  // }
}

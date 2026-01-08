// نسبة الضريبة (ضريبة القيمة المضافة المصرية)
export const TAX_RATE = 14;

// حالات الطلب
export const ORDER_STATUS = {
  Draft: { label: "مسودة", color: "gray" },
  Pending: { label: "في الانتظار", color: "warning" },
  Completed: { label: "مكتمل", color: "success" },
  Cancelled: { label: "ملغي", color: "danger" },
  Refunded: { label: "مسترجع", color: "danger" },
} as const;

// طرق الدفع
export const PAYMENT_METHODS = {
  Cash: { label: "نقدي", icon: "💵" },
  Card: { label: "بطاقة", icon: "💳" },
  Fawry: { label: "فوري", icon: "💳" },
} as const;

// صلاحيات المستخدمين
export const USER_ROLES = {
  Admin: { label: "مدير", color: "primary" },
  Cashier: { label: "كاشير", color: "gray" },
} as const;

// رسائل الأخطاء
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "حدث خطأ في الاتصال بالخادم",
  UNAUTHORIZED: "غير مصرح لك بالوصول",
  NOT_FOUND: "العنصر غير موجود",
  SERVER_ERROR: "حدث خطأ في الخادم",
  VALIDATION_ERROR: "يرجى التحقق من البيانات المدخلة",
} as const;

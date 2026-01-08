namespace KasserPro.Application.Common;

/// <summary>
/// Standardized error codes for the application
/// Format: DOMAIN_ERROR_TYPE (e.g., ORDER_NOT_FOUND)
/// </summary>
public static class ErrorCodes
{
    // General Errors (1000-1099)
    public const string VALIDATION_ERROR = "VALIDATION_ERROR";
    public const string NOT_FOUND = "NOT_FOUND";
    public const string UNAUTHORIZED = "UNAUTHORIZED";
    public const string FORBIDDEN = "FORBIDDEN";
    public const string CONFLICT = "CONFLICT";
    public const string INTERNAL_ERROR = "INTERNAL_ERROR";

    // Tenant Errors (1100-1199)
    public const string TENANT_NOT_FOUND = "TENANT_NOT_FOUND";
    public const string TENANT_INACTIVE = "TENANT_INACTIVE";

    // Branch Errors (1200-1299)
    public const string BRANCH_NOT_FOUND = "BRANCH_NOT_FOUND";
    public const string BRANCH_INACTIVE = "BRANCH_INACTIVE";

    // User Errors (1300-1399)
    public const string USER_NOT_FOUND = "USER_NOT_FOUND";
    public const string USER_INACTIVE = "USER_INACTIVE";
    public const string INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
    public const string INVALID_PIN = "INVALID_PIN";

    // Product Errors (1400-1499)
    public const string PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND";
    public const string PRODUCT_INACTIVE = "PRODUCT_INACTIVE";
    public const string PRODUCT_OUT_OF_STOCK = "PRODUCT_OUT_OF_STOCK";
    public const string INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK";

    // Category Errors (1500-1599)
    public const string CATEGORY_NOT_FOUND = "CATEGORY_NOT_FOUND";
    public const string CATEGORY_HAS_PRODUCTS = "CATEGORY_HAS_PRODUCTS";

    // Order Errors (1600-1699)
    public const string ORDER_NOT_FOUND = "ORDER_NOT_FOUND";
    public const string ORDER_ALREADY_COMPLETED = "ORDER_ALREADY_COMPLETED";
    public const string ORDER_ALREADY_CANCELLED = "ORDER_ALREADY_CANCELLED";
    public const string ORDER_INVALID_STATE_TRANSITION = "ORDER_INVALID_STATE_TRANSITION";
    public const string ORDER_EMPTY = "ORDER_EMPTY";
    public const string ORDER_ITEM_NOT_FOUND = "ORDER_ITEM_NOT_FOUND";
    public const string ORDER_CANNOT_MODIFY = "ORDER_CANNOT_MODIFY";

    // Payment Errors (1700-1799)
    public const string PAYMENT_NOT_FOUND = "PAYMENT_NOT_FOUND";
    public const string PAYMENT_INSUFFICIENT = "PAYMENT_INSUFFICIENT";
    public const string PAYMENT_INVALID_METHOD = "PAYMENT_INVALID_METHOD";
    public const string PAYMENT_OVERPAYMENT_LIMIT = "PAYMENT_OVERPAYMENT_LIMIT";

    // Shift Errors (1800-1899)
    public const string SHIFT_NOT_FOUND = "SHIFT_NOT_FOUND";
    public const string SHIFT_ALREADY_OPEN = "SHIFT_ALREADY_OPEN";
    public const string SHIFT_ALREADY_CLOSED = "SHIFT_ALREADY_CLOSED";
    public const string NO_OPEN_SHIFT = "NO_OPEN_SHIFT";
    public const string SHIFT_BRANCH_MISMATCH = "SHIFT_BRANCH_MISMATCH";
    public const string SHIFT_CONCURRENCY_CONFLICT = "SHIFT_CONCURRENCY_CONFLICT";

    // System Errors (1900-1999)
    public const string SYSTEM_INTERNAL_ERROR = "SYSTEM_INTERNAL_ERROR";

    // Idempotency Errors (1900-1999)
    public const string DUPLICATE_REQUEST = "DUPLICATE_REQUEST";
}

/// <summary>
/// Arabic error messages mapped to error codes
/// </summary>
public static class ErrorMessages
{
    private static readonly Dictionary<string, string> Messages = new()
    {
        // General
        { ErrorCodes.VALIDATION_ERROR, "خطأ في البيانات المدخلة" },
        { ErrorCodes.NOT_FOUND, "العنصر غير موجود" },
        { ErrorCodes.UNAUTHORIZED, "غير مصرح لك بالوصول" },
        { ErrorCodes.FORBIDDEN, "ليس لديك صلاحية لهذا الإجراء" },
        { ErrorCodes.CONFLICT, "تعارض في البيانات" },
        { ErrorCodes.INTERNAL_ERROR, "حدث خطأ داخلي" },

        // Tenant
        { ErrorCodes.TENANT_NOT_FOUND, "المستأجر غير موجود" },
        { ErrorCodes.TENANT_INACTIVE, "المستأجر غير نشط" },

        // Branch
        { ErrorCodes.BRANCH_NOT_FOUND, "الفرع غير موجود" },
        { ErrorCodes.BRANCH_INACTIVE, "الفرع غير نشط" },

        // User
        { ErrorCodes.USER_NOT_FOUND, "المستخدم غير موجود" },
        { ErrorCodes.USER_INACTIVE, "المستخدم غير نشط" },
        { ErrorCodes.INVALID_CREDENTIALS, "بيانات الدخول غير صحيحة" },
        { ErrorCodes.INVALID_PIN, "رمز PIN غير صحيح" },

        // Product
        { ErrorCodes.PRODUCT_NOT_FOUND, "المنتج غير موجود" },
        { ErrorCodes.PRODUCT_INACTIVE, "المنتج غير نشط" },
        { ErrorCodes.PRODUCT_OUT_OF_STOCK, "المنتج غير متوفر" },
        { ErrorCodes.INSUFFICIENT_STOCK, "الكمية المطلوبة غير متوفرة" },

        // Category
        { ErrorCodes.CATEGORY_NOT_FOUND, "الفئة غير موجودة" },
        { ErrorCodes.CATEGORY_HAS_PRODUCTS, "لا يمكن حذف فئة تحتوي على منتجات" },

        // Order
        { ErrorCodes.ORDER_NOT_FOUND, "الطلب غير موجود" },
        { ErrorCodes.ORDER_ALREADY_COMPLETED, "الطلب مكتمل بالفعل" },
        { ErrorCodes.ORDER_ALREADY_CANCELLED, "الطلب ملغي بالفعل" },
        { ErrorCodes.ORDER_INVALID_STATE_TRANSITION, "لا يمكن تغيير حالة الطلب" },
        { ErrorCodes.ORDER_EMPTY, "الطلب فارغ" },
        { ErrorCodes.ORDER_ITEM_NOT_FOUND, "عنصر الطلب غير موجود" },
        { ErrorCodes.ORDER_CANNOT_MODIFY, "لا يمكن تعديل الطلب" },

        // Payment
        { ErrorCodes.PAYMENT_NOT_FOUND, "الدفعة غير موجودة" },
        { ErrorCodes.PAYMENT_INSUFFICIENT, "المبلغ المدفوع غير كافي" },
        { ErrorCodes.PAYMENT_INVALID_METHOD, "طريقة الدفع غير صالحة" },
        { ErrorCodes.PAYMENT_OVERPAYMENT_LIMIT, "المبلغ المدفوع يتجاوز الحد المسموح" },

        // Shift
        { ErrorCodes.SHIFT_NOT_FOUND, "الوردية غير موجودة" },
        { ErrorCodes.SHIFT_ALREADY_OPEN, "يوجد وردية مفتوحة بالفعل" },
        { ErrorCodes.SHIFT_ALREADY_CLOSED, "الوردية مغلقة بالفعل" },
        { ErrorCodes.NO_OPEN_SHIFT, "لا توجد وردية مفتوحة" },
        { ErrorCodes.SHIFT_BRANCH_MISMATCH, "الوردية المفتوحة لا تنتمي للفرع الحالي" },
        { ErrorCodes.SHIFT_CONCURRENCY_CONFLICT, "تم إغلاق الوردية بواسطة مستخدم آخر" },

        // System
        { ErrorCodes.SYSTEM_INTERNAL_ERROR, "حدث خطأ في النظام" },

        // Idempotency
        { ErrorCodes.DUPLICATE_REQUEST, "طلب مكرر" }
    };

    public static string Get(string code) => Messages.TryGetValue(code, out var msg) ? msg : code;
}

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
    
    // Customer Errors (1750-1799)
    public const string CUSTOMER_CREDIT_LIMIT_EXCEEDED = "CUSTOMER_CREDIT_LIMIT_EXCEEDED";

    // Shift Errors (1800-1899)
    public const string SHIFT_NOT_FOUND = "SHIFT_NOT_FOUND";
    public const string SHIFT_ALREADY_OPEN = "SHIFT_ALREADY_OPEN";
    public const string SHIFT_ALREADY_CLOSED = "SHIFT_ALREADY_CLOSED";
    public const string NO_OPEN_SHIFT = "NO_OPEN_SHIFT";
    public const string SHIFT_BRANCH_MISMATCH = "SHIFT_BRANCH_MISMATCH";
    public const string SHIFT_CONCURRENCY_CONFLICT = "SHIFT_CONCURRENCY_CONFLICT";
    public const string SHIFT_FORCE_CLOSE_REASON_REQUIRED = "SHIFT_FORCE_CLOSE_REASON_REQUIRED";
    public const string SHIFT_FORCE_CLOSE_UNAUTHORIZED = "SHIFT_FORCE_CLOSE_UNAUTHORIZED";
    public const string SHIFT_HANDOVER_INVALID_USER = "SHIFT_HANDOVER_INVALID_USER";
    public const string SHIFT_USER_HAS_OPEN_SHIFT = "SHIFT_USER_HAS_OPEN_SHIFT";
    public const string SHIFT_HANDOVER_NOT_FOUND = "SHIFT_HANDOVER_NOT_FOUND";
    public const string SHIFT_INACTIVITY_WARNING = "SHIFT_INACTIVITY_WARNING";
    public const string SHIFT_ALREADY_FORCE_CLOSED = "SHIFT_ALREADY_FORCE_CLOSED";
    public const string SHIFT_CANNOT_HANDOVER_CLOSED = "SHIFT_CANNOT_HANDOVER_CLOSED";
    public const string SHIFT_HANDOVER_USER_REQUIRED = "SHIFT_HANDOVER_USER_REQUIRED";
    public const string SHIFT_HANDOVER_TO_SAME_USER = "SHIFT_HANDOVER_TO_SAME_USER";
    public const string SHIFT_ALREADY_HANDED_OVER = "SHIFT_ALREADY_HANDED_OVER";
    public const string SHIFT_INACTIVE_TOO_LONG = "SHIFT_INACTIVE_TOO_LONG";
    public const string SHIFT_WARNING_12_HOURS = "SHIFT_WARNING_12_HOURS";
    public const string SHIFT_CRITICAL_24_HOURS = "SHIFT_CRITICAL_24_HOURS";

    // System Errors (1900-1999)
    public const string SYSTEM_INTERNAL_ERROR = "SYSTEM_INTERNAL_ERROR";

    // Idempotency Errors (1900-1999)
    public const string DUPLICATE_REQUEST = "DUPLICATE_REQUEST";
    
    // Purchase Invoice Errors (5000-5099)
    public const string PURCHASE_INVOICE_NOT_FOUND = "PURCHASE_INVOICE_NOT_FOUND";
    public const string PURCHASE_INVOICE_EMPTY = "PURCHASE_INVOICE_EMPTY";
    public const string PURCHASE_INVOICE_INVALID_QUANTITY = "PURCHASE_INVOICE_INVALID_QUANTITY";
    public const string PURCHASE_INVOICE_INVALID_PRICE = "PURCHASE_INVOICE_INVALID_PRICE";
    public const string PURCHASE_INVOICE_NOT_EDITABLE = "PURCHASE_INVOICE_NOT_EDITABLE";
    public const string PURCHASE_INVOICE_NOT_DELETABLE = "PURCHASE_INVOICE_NOT_DELETABLE";
    public const string PURCHASE_INVOICE_ALREADY_CONFIRMED = "PURCHASE_INVOICE_ALREADY_CONFIRMED";
    public const string PURCHASE_INVOICE_ALREADY_CANCELLED = "PURCHASE_INVOICE_ALREADY_CANCELLED";
    public const string PAYMENT_INVALID_AMOUNT = "PAYMENT_INVALID_AMOUNT";
    public const string PAYMENT_EXCEEDS_DUE = "PAYMENT_EXCEEDS_DUE";
    
    // Supplier Product Errors (5100-5199)
    public const string SUPPLIER_NOT_FOUND = "SUPPLIER_NOT_FOUND";
    public const string SUPPLIER_PRODUCT_ALREADY_LINKED = "SUPPLIER_PRODUCT_ALREADY_LINKED";
    public const string SUPPLIER_PRODUCT_NOT_FOUND = "SUPPLIER_PRODUCT_NOT_FOUND";
    
    // Expense Errors (5200-5299)
    public const string EXPENSE_NOT_FOUND = "EXPENSE_NOT_FOUND";
    public const string EXPENSE_CATEGORY_NOT_FOUND = "EXPENSE_CATEGORY_NOT_FOUND";
    public const string EXPENSE_NOT_EDITABLE = "EXPENSE_NOT_EDITABLE";
    public const string EXPENSE_NOT_DELETABLE = "EXPENSE_NOT_DELETABLE";
    public const string EXPENSE_ALREADY_APPROVED = "EXPENSE_ALREADY_APPROVED";
    public const string EXPENSE_ALREADY_PAID = "EXPENSE_ALREADY_PAID";
    public const string EXPENSE_ALREADY_REJECTED = "EXPENSE_ALREADY_REJECTED";
    public const string EXPENSE_NOT_APPROVED = "EXPENSE_NOT_APPROVED";
    public const string EXPENSE_INVALID_AMOUNT = "EXPENSE_INVALID_AMOUNT";
    public const string EXPENSE_REJECTION_REASON_REQUIRED = "EXPENSE_REJECTION_REASON_REQUIRED";
    public const string EXPENSE_ATTACHMENT_TOO_LARGE = "EXPENSE_ATTACHMENT_TOO_LARGE";
    public const string EXPENSE_ATTACHMENT_INVALID_TYPE = "EXPENSE_ATTACHMENT_INVALID_TYPE";
    public const string EXPENSE_CATEGORY_IN_USE = "EXPENSE_CATEGORY_IN_USE";
    public const string EXPENSE_CATEGORY_IS_SYSTEM = "EXPENSE_CATEGORY_IS_SYSTEM";
    public const string EXPENSE_CATEGORY_ALREADY_EXISTS = "EXPENSE_CATEGORY_ALREADY_EXISTS";
    public const string EXPENSE_CATEGORY_SYSTEM = "EXPENSE_CATEGORY_SYSTEM";
    public const string EXPENSE_CATEGORY_HAS_EXPENSES = "EXPENSE_CATEGORY_HAS_EXPENSES";
    public const string EXPENSE_ALREADY_PROCESSED = "EXPENSE_ALREADY_PROCESSED";
    
    // Cash Register Errors (5300-5399)
    public const string CASH_REGISTER_INSUFFICIENT_BALANCE = "CASH_REGISTER_INSUFFICIENT_BALANCE";
    public const string CASH_REGISTER_TRANSACTION_NOT_FOUND = "CASH_REGISTER_TRANSACTION_NOT_FOUND";
    public const string CASH_REGISTER_INVALID_AMOUNT = "CASH_REGISTER_INVALID_AMOUNT";
    public const string CASH_REGISTER_ALREADY_RECONCILED = "CASH_REGISTER_ALREADY_RECONCILED";
    public const string CASH_REGISTER_NOT_RECONCILED = "CASH_REGISTER_NOT_RECONCILED";
    public const string CASH_REGISTER_TRANSFER_SAME_BRANCH = "CASH_REGISTER_TRANSFER_SAME_BRANCH";
    public const string CASH_REGISTER_RECONCILIATION_REQUIRED = "CASH_REGISTER_RECONCILIATION_REQUIRED";
    public const string CASH_REGISTER_INVALID_TYPE = "CASH_REGISTER_INVALID_TYPE";
    public const string CASH_REGISTER_SAME_BRANCH = "CASH_REGISTER_SAME_BRANCH";
    public const string SHIFT_NOT_OPEN = "SHIFT_NOT_OPEN";
    
    // Branch Inventory Errors (7000-7099)
    public const string INVENTORY_NOT_FOUND = "INVENTORY_NOT_FOUND";
    public const string INVENTORY_INVALID_QUANTITY = "INVENTORY_INVALID_QUANTITY";
    public const string INVENTORY_INSUFFICIENT_STOCK = "INVENTORY_INSUFFICIENT_STOCK";
    public const string INVENTORY_TRANSFER_SAME_BRANCH = "INVENTORY_TRANSFER_SAME_BRANCH";
    public const string INVENTORY_TRANSFER_NOT_FOUND = "INVENTORY_TRANSFER_NOT_FOUND";
    public const string INVENTORY_TRANSFER_ALREADY_APPROVED = "INVENTORY_TRANSFER_ALREADY_APPROVED";
    public const string INVENTORY_TRANSFER_NOT_APPROVED = "INVENTORY_TRANSFER_NOT_APPROVED";
    public const string INVENTORY_TRANSFER_ALREADY_COMPLETED = "INVENTORY_TRANSFER_ALREADY_COMPLETED";
    public const string INVENTORY_TRANSFER_ALREADY_CANCELLED = "INVENTORY_TRANSFER_ALREADY_CANCELLED";
    public const string BRANCH_PRICE_NOT_FOUND = "BRANCH_PRICE_NOT_FOUND";
    public const string BRANCH_PRICE_ALREADY_EXISTS = "BRANCH_PRICE_ALREADY_EXISTS";
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
        
        // Customer
        { ErrorCodes.CUSTOMER_CREDIT_LIMIT_EXCEEDED, "تجاوز حد الائتمان المسموح للعميل" },

        // Shift
        { ErrorCodes.SHIFT_NOT_FOUND, "الوردية غير موجودة" },
        { ErrorCodes.SHIFT_ALREADY_OPEN, "يوجد وردية مفتوحة بالفعل" },
        { ErrorCodes.SHIFT_ALREADY_CLOSED, "الوردية مغلقة بالفعل" },
        { ErrorCodes.NO_OPEN_SHIFT, "لا توجد وردية مفتوحة" },
        { ErrorCodes.SHIFT_BRANCH_MISMATCH, "الوردية المفتوحة لا تنتمي للفرع الحالي" },
        { ErrorCodes.SHIFT_CONCURRENCY_CONFLICT, "تم إغلاق الوردية بواسطة مستخدم آخر" },
        { ErrorCodes.SHIFT_FORCE_CLOSE_REASON_REQUIRED, "يجب إدخال سبب الإغلاق القسري" },
        { ErrorCodes.SHIFT_FORCE_CLOSE_UNAUTHORIZED, "غير مصرح لك بإغلاق الوردية قسرياً" },
        { ErrorCodes.SHIFT_HANDOVER_INVALID_USER, "المستخدم المستلم غير صالح" },
        { ErrorCodes.SHIFT_USER_HAS_OPEN_SHIFT, "المستخدم لديه وردية مفتوحة بالفعل" },
        { ErrorCodes.SHIFT_HANDOVER_NOT_FOUND, "تسليم الوردية غير موجود" },
        { ErrorCodes.SHIFT_INACTIVITY_WARNING, "تحذير: الوردية غير نشطة منذ فترة طويلة" },
        { ErrorCodes.SHIFT_WARNING_12_HOURS, "⚠️ تحذير: الوردية مفتوحة منذ أكثر من 12 ساعة. يُنصح بإغلاقها وفتح وردية جديدة" },
        { ErrorCodes.SHIFT_CRITICAL_24_HOURS, "🚨 تحذير شديد: الوردية مفتوحة منذ أكثر من 24 ساعة! يجب إغلاقها فوراً" },

        // System
        { ErrorCodes.SYSTEM_INTERNAL_ERROR, "حدث خطأ في النظام" },

        // Idempotency
        { ErrorCodes.DUPLICATE_REQUEST, "طلب مكرر" },
        
        // Purchase Invoice
        { ErrorCodes.PURCHASE_INVOICE_NOT_FOUND, "فاتورة الشراء غير موجودة" },
        { ErrorCodes.PURCHASE_INVOICE_EMPTY, "فاتورة الشراء فارغة" },
        { ErrorCodes.PURCHASE_INVOICE_INVALID_QUANTITY, "الكمية غير صحيحة" },
        { ErrorCodes.PURCHASE_INVOICE_INVALID_PRICE, "السعر غير صحيح" },
        { ErrorCodes.PURCHASE_INVOICE_NOT_EDITABLE, "لا يمكن تعديل فاتورة الشراء" },
        { ErrorCodes.PURCHASE_INVOICE_NOT_DELETABLE, "لا يمكن حذف فاتورة الشراء" },
        { ErrorCodes.PURCHASE_INVOICE_ALREADY_CONFIRMED, "فاتورة الشراء مؤكدة بالفعل" },
        { ErrorCodes.PURCHASE_INVOICE_ALREADY_CANCELLED, "فاتورة الشراء ملغاة بالفعل" },
        { ErrorCodes.PAYMENT_INVALID_AMOUNT, "مبلغ الدفعة غير صحيح" },
        { ErrorCodes.PAYMENT_EXCEEDS_DUE, "مبلغ الدفعة يتجاوز المبلغ المستحق" },
        
        // Supplier Product
        { ErrorCodes.SUPPLIER_NOT_FOUND, "المورد غير موجود" },
        { ErrorCodes.SUPPLIER_PRODUCT_ALREADY_LINKED, "المنتج مرتبط بالمورد بالفعل" },
        { ErrorCodes.SUPPLIER_PRODUCT_NOT_FOUND, "العلاقة بين المورد والمنتج غير موجودة" },
        
        // Expense
        { ErrorCodes.EXPENSE_NOT_FOUND, "المصروف غير موجود" },
        { ErrorCodes.EXPENSE_CATEGORY_NOT_FOUND, "تصنيف المصروف غير موجود" },
        { ErrorCodes.EXPENSE_NOT_EDITABLE, "لا يمكن تعديل المصروف" },
        { ErrorCodes.EXPENSE_NOT_DELETABLE, "لا يمكن حذف المصروف" },
        { ErrorCodes.EXPENSE_ALREADY_APPROVED, "المصروف موافق عليه بالفعل" },
        { ErrorCodes.EXPENSE_ALREADY_PAID, "المصروف مدفوع بالفعل" },
        { ErrorCodes.EXPENSE_ALREADY_REJECTED, "المصروف مرفوض بالفعل" },
        { ErrorCodes.EXPENSE_NOT_APPROVED, "المصروف غير موافق عليه" },
        { ErrorCodes.EXPENSE_INVALID_AMOUNT, "مبلغ المصروف غير صحيح" },
        { ErrorCodes.EXPENSE_REJECTION_REASON_REQUIRED, "يجب إدخال سبب الرفض" },
        { ErrorCodes.EXPENSE_ATTACHMENT_TOO_LARGE, "حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)" },
        { ErrorCodes.EXPENSE_ATTACHMENT_INVALID_TYPE, "نوع الملف غير مسموح (JPG, PNG, PDF فقط)" },
        { ErrorCodes.EXPENSE_CATEGORY_IN_USE, "لا يمكن حذف تصنيف مستخدم في مصروفات" },
        { ErrorCodes.EXPENSE_CATEGORY_IS_SYSTEM, "لا يمكن حذف تصنيف النظام" },
        { ErrorCodes.EXPENSE_CATEGORY_ALREADY_EXISTS, "تصنيف المصروف موجود بالفعل" },
        { ErrorCodes.EXPENSE_CATEGORY_SYSTEM, "لا يمكن تعديل تصنيف النظام" },
        { ErrorCodes.EXPENSE_CATEGORY_HAS_EXPENSES, "لا يمكن حذف تصنيف يحتوي على مصروفات" },
        { ErrorCodes.EXPENSE_ALREADY_PROCESSED, "المصروف تمت معالجته بالفعل" },
        
        // Cash Register
        { ErrorCodes.CASH_REGISTER_INSUFFICIENT_BALANCE, "رصيد الخزينة غير كافٍ" },
        { ErrorCodes.CASH_REGISTER_TRANSACTION_NOT_FOUND, "معاملة الخزينة غير موجودة" },
        { ErrorCodes.CASH_REGISTER_INVALID_AMOUNT, "مبلغ المعاملة غير صحيح" },
        { ErrorCodes.CASH_REGISTER_ALREADY_RECONCILED, "تم تسوية الخزينة بالفعل" },
        { ErrorCodes.CASH_REGISTER_NOT_RECONCILED, "لم يتم تسوية الخزينة" },
        { ErrorCodes.CASH_REGISTER_TRANSFER_SAME_BRANCH, "لا يمكن التحويل لنفس الفرع" },
        { ErrorCodes.CASH_REGISTER_RECONCILIATION_REQUIRED, "يجب تسوية الخزينة قبل إغلاق الوردية" },
        { ErrorCodes.CASH_REGISTER_INVALID_TYPE, "نوع المعاملة غير صحيح" },
        { ErrorCodes.CASH_REGISTER_SAME_BRANCH, "لا يمكن التحويل لنفس الفرع" },
        { ErrorCodes.SHIFT_NOT_OPEN, "الوردية غير مفتوحة" },
        
        // Branch Inventory
        { ErrorCodes.INVENTORY_NOT_FOUND, "المخزون غير موجود" },
        { ErrorCodes.INVENTORY_INVALID_QUANTITY, "الكمية غير صحيحة" },
        { ErrorCodes.INVENTORY_INSUFFICIENT_STOCK, "الكمية المتوفرة في المخزون غير كافية" },
        { ErrorCodes.INVENTORY_TRANSFER_SAME_BRANCH, "لا يمكن نقل المخزون لنفس الفرع" },
        { ErrorCodes.INVENTORY_TRANSFER_NOT_FOUND, "عملية النقل غير موجودة" },
        { ErrorCodes.INVENTORY_TRANSFER_ALREADY_APPROVED, "عملية النقل موافق عليها بالفعل" },
        { ErrorCodes.INVENTORY_TRANSFER_NOT_APPROVED, "عملية النقل غير موافق عليها" },
        { ErrorCodes.INVENTORY_TRANSFER_ALREADY_COMPLETED, "عملية النقل مكتملة بالفعل" },
        { ErrorCodes.INVENTORY_TRANSFER_ALREADY_CANCELLED, "عملية النقل ملغاة بالفعل" },
        { ErrorCodes.BRANCH_PRICE_NOT_FOUND, "سعر الفرع غير موجود" },
        { ErrorCodes.BRANCH_PRICE_ALREADY_EXISTS, "سعر الفرع موجود بالفعل" }
    };

    public static string Get(string code) => Messages.TryGetValue(code, out var msg) ? msg : code;
}

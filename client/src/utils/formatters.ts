// تنسيق العملة
export const formatCurrency = (amount: number, currency = "SAR"): string => {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// تنسيق بسيط للريال
export const formatPrice = (amount: number): string => {
  return `${amount.toFixed(2)} ر.س`;
};

// تنسيق التاريخ
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

// تنسيق التاريخ والوقت
export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// تنسيق الوقت فقط
export const formatTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// تنسيق الأرقام
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("ar-SA").format(num);
};

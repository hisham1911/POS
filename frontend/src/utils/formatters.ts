// Cairo timezone for Egypt (Version: 2026-02-21-v2)
const TIMEZONE = "Africa/Cairo";

/**
 * Parse date string from API (assumes UTC if no timezone specified)
 * Backend stores DateTime.UtcNow but JSON doesn't include 'Z' suffix
 */
const parseApiDate = (date: string | Date): Date => {
  if (date instanceof Date) return date;
  
  // Backend sends dates in UTC format like "2024-01-15T05:00:00"
  // We need to treat them as UTC by adding 'Z' suffix
  const dateStr = date.toString();
  
  // If no timezone info, assume UTC and add 'Z'
  if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.match(/[+-]\d{2}:\d{2}$/)) {
    return new Date(dateStr + 'Z');
  }
  
  return new Date(dateStr);
};

/**
 * Format date with Cairo timezone using toLocaleString
 * Use this instead of new Date().toLocaleString() directly
 */
export const formatDateTimeFull = (date: string | Date): string => {
  const parsed = parseApiDate(date);
  return parsed.toLocaleString("ar-EG", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Format date only with Cairo timezone
 * Use this instead of new Date().toLocaleDateString() directly
 */
export const formatDateOnly = (date: string | Date): string => {
  return parseApiDate(date).toLocaleDateString("ar-EG", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// تنسيق العملة
export const formatCurrency = (amount: number, currency = "EGP"): string => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// تنسيق بسيط للجنيه
export const formatPrice = (amount: number): string => {
  return `${amount.toFixed(2)} ج.م`;
};

// تنسيق التاريخ (Cairo timezone)
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TIMEZONE,
  }).format(parseApiDate(date));
};

// تنسيق التاريخ والوقت (Cairo timezone)
export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  }).format(parseApiDate(date));
};

// تنسيق التاريخ والوقت المختصر (Cairo timezone)
export const formatDateTimeShort = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-EG", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  }).format(parseApiDate(date));
};

// تنسيق الوقت فقط (Cairo timezone)
export const formatTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  }).format(parseApiDate(date));
};

// تنسيق الوقت النسبي (منذ X دقائق)
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = parseApiDate(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  
  return formatDateTime(date);
};

// تنسيق الأرقام
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("ar-EG").format(num);
};

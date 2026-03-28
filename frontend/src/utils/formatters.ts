import { APP_PREFERENCES_KEY, defaultPreferences, type AppLanguage } from "@/lib/preferences";

const TIMEZONE = "Africa/Cairo";

const parseApiDate = (date: string | Date): Date => {
  if (date instanceof Date) return date;

  const dateStr = date.toString();
  if (!dateStr.endsWith("Z") && !dateStr.includes("+") && !dateStr.match(/[+-]\d{2}:\d{2}$/)) {
    return new Date(`${dateStr}Z`);
  }

  return new Date(dateStr);
};

const getStoredPreferences = () => {
  const fallback = defaultPreferences();

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(APP_PREFERENCES_KEY);
    if (!raw) return fallback;

    return {
      ...fallback,
      ...JSON.parse(raw),
    };
  } catch {
    return fallback;
  }
};

const getFormattingContext = () => {
  const preferences = getStoredPreferences();
  const language = preferences.language ?? "en";
  const numberingSystem = preferences.useArabicNumerals ? "arab" : "latn";
  const baseLocale = language === "ar" ? "ar-EG" : "en-US";

  return {
    language,
    locale: `${baseLocale}-u-nu-${numberingSystem}`,
  };
};

const formatWithDateTime = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions,
) => {
  const parsed = parseApiDate(date);
  const { locale } = getFormattingContext();

  return new Intl.DateTimeFormat(locale, {
    timeZone: TIMEZONE,
    ...options,
  }).format(parsed);
};

export const formatDateTimeFull = (date: string | Date): string =>
  formatWithDateTime(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const formatDateOnly = (date: string | Date): string =>
  formatWithDateTime(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export const formatCurrency = (amount: number, currency = "EGP"): string => {
  const { locale } = getFormattingContext();

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPrice = (amount: number): string => {
  const { language } = getFormattingContext();
  const currencyLabel = language === "ar" ? "ج.م" : "EGP";
  return `${formatNumber(amount.toFixed(2))} ${currencyLabel}`;
};

export const formatDate = (date: string | Date): string =>
  formatWithDateTime(date, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatDateTime = (date: string | Date): string =>
  formatWithDateTime(date, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDateTimeShort = (date: string | Date): string =>
  formatWithDateTime(date, {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatTime = (date: string | Date): string =>
  formatWithDateTime(date, {
    hour: "2-digit",
    minute: "2-digit",
  });

const relativeTimeCopy: Record<
  AppLanguage,
  {
    now: string;
    minutes: (value: string) => string;
    hours: (value: string) => string;
    days: (value: string) => string;
  }
> = {
  ar: {
    now: "الآن",
    minutes: (value) => `منذ ${value} دقيقة`,
    hours: (value) => `منذ ${value} ساعة`,
    days: (value) => `منذ ${value} يوم`,
  },
  en: {
    now: "Now",
    minutes: (value) => `${value} min ago`,
    hours: (value) => `${value} hr ago`,
    days: (value) => `${value} d ago`,
  },
};

export const formatRelativeTime = (date: string | Date): string => {
  const { language } = getFormattingContext();
  const copy = relativeTimeCopy[language];
  const now = new Date();
  const then = parseApiDate(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return copy.now;
  if (diffMins < 60) return copy.minutes(formatNumber(diffMins));
  if (diffHours < 24) return copy.hours(formatNumber(diffHours));
  if (diffDays < 7) return copy.days(formatNumber(diffDays));

  return formatDateTime(date);
};

export const formatNumber = (num: number | string): string => {
  const { locale } = getFormattingContext();
  const numericValue = typeof num === "string" ? Number(num) : num;

  return new Intl.NumberFormat(locale).format(Number.isFinite(numericValue) ? numericValue : 0);
};

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import {
  APP_PREFERENCES_KEY,
  defaultPreferences,
  getSidebarCss,
  getWallpaperCss,
  resolveThemeTokens,
  type AppLanguage,
  type AppPreferences,
  type AppThemeId,
  type CustomThemeConfig,
  type ThemeTokens
} from "@/lib/preferences";
import i18n from "@/i18n";

interface AppPreferencesContextValue {
  preferences: AppPreferences;
  resolvedTheme: ThemeTokens;
  wallpaperCss: string;
  sidebarCss: string;
  setTheme: (themeId: AppThemeId) => void;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
  setWallpaperPreset: (wallpaperId: string) => void;
  setCustomWallpaper: (dataUrl: string | null) => void;
  setSidebarImage: (dataUrl: string | null) => void;
  setAvatarImage: (dataUrl: string | null) => void;
  setUseArabicNumerals: (value: boolean) => void;
  updateCustomTheme: (patch: Partial<CustomThemeConfig>) => void;
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

const applyThemeToDocument = (
  theme: ThemeTokens,
  preferences: AppPreferences,
  wallpaperCss: string,
  sidebarCss: string
) => {
  const root = document.documentElement;
  const entries: Array<[string, string]> = [
    ["--background", theme.background],
    ["--foreground", theme.foreground],
    ["--card", theme.card],
    ["--card-foreground", theme.cardForeground],
    ["--popover", theme.popover],
    ["--popover-foreground", theme.popoverForeground],
    ["--primary", theme.primary],
    ["--primary-foreground", theme.primaryForeground],
    ["--secondary", theme.secondary],
    ["--secondary-foreground", theme.secondaryForeground],
    ["--accent", theme.accent],
    ["--accent-foreground", theme.accentForeground],
    ["--muted", theme.muted],
    ["--muted-foreground", theme.mutedForeground],
    ["--destructive", theme.destructive],
    ["--destructive-foreground", theme.destructiveForeground],
    ["--success", theme.success],
    ["--success-foreground", theme.successForeground],
    ["--warning", theme.warning],
    ["--warning-foreground", theme.warningForeground],
    ["--border", theme.border],
    ["--input", theme.input],
    ["--ring", theme.ring],
    ["--sidebar-background", theme.sidebarBackground],
    ["--sidebar-foreground", theme.sidebarForeground],
    ["--sidebar-border", theme.sidebarBorder],
    ["--sidebar-accent", theme.sidebarAccent],
    ["--shadow-color", theme.shadowColor],
    ["--wallpaper-image", wallpaperCss],
    ["--sidebar-image", sidebarCss]
  ];

  entries.forEach(([key, value]) => root.style.setProperty(key, value));
  root.setAttribute("dir", preferences.language === "ar" ? "rtl" : "ltr");
  root.setAttribute("lang", preferences.language);
  root.dataset.theme = preferences.themeId;
  root.dataset.language = preferences.language;
  root.dataset.numerals = preferences.useArabicNumerals ? "arab" : "latn";
  root.style.colorScheme =
    preferences.themeId === "dark" ||
    (preferences.themeId === "custom" && preferences.customTheme.mode === "dark")
      ? "dark"
      : "light";
};

export const AppPreferencesProvider = ({ children }: PropsWithChildren) => {
  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    try {
      const parsed = localStorage.getItem(APP_PREFERENCES_KEY);
      if (!parsed) {
        return defaultPreferences();
      }

      const stored = JSON.parse(parsed);
      return {
        ...defaultPreferences(),
        ...stored,
        customTheme: {
          ...defaultPreferences().customTheme,
          ...stored.customTheme
        }
      };
    } catch {
      return defaultPreferences();
    }
  });

  const resolvedTheme = useMemo(() => resolveThemeTokens(preferences), [preferences]);
  const wallpaperCss = useMemo(() => getWallpaperCss(preferences), [preferences]);
  const sidebarCss = useMemo(() => getSidebarCss(preferences), [preferences]);

  useEffect(() => {
    localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    applyThemeToDocument(resolvedTheme, preferences, wallpaperCss, sidebarCss);
  }, [preferences, resolvedTheme, sidebarCss, wallpaperCss]);

  useEffect(() => {
    void i18n.changeLanguage(preferences.language);
  }, [preferences.language]);

  const updatePreferences = useCallback((updater: (current: AppPreferences) => AppPreferences) => {
    setPreferences((current) => updater(current));
  }, []);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      preferences,
      resolvedTheme,
      wallpaperCss,
      sidebarCss,
      setTheme: (themeId) => updatePreferences((current) => ({ ...current, themeId })),
      setLanguage: (language) => updatePreferences((current) => ({ ...current, language })),
      toggleLanguage: () =>
        updatePreferences((current) => ({
          ...current,
          language: current.language === "ar" ? "en" : "ar"
        })),
      setWallpaperPreset: (wallpaperId) =>
        updatePreferences((current) => ({
          ...current,
          wallpaperId,
          customWallpaper: null
        })),
      setCustomWallpaper: (customWallpaper) =>
        updatePreferences((current) => ({
          ...current,
          customWallpaper
        })),
      setSidebarImage: (sidebarImage) =>
        updatePreferences((current) => ({
          ...current,
          sidebarImage
        })),
      setAvatarImage: (avatarImage) =>
        updatePreferences((current) => ({
          ...current,
          avatarImage
        })),
      setUseArabicNumerals: (useArabicNumerals) =>
        updatePreferences((current) => ({
          ...current,
          useArabicNumerals
        })),
      updateCustomTheme: (patch) =>
        updatePreferences((current) => ({
          ...current,
          customTheme: {
            ...current.customTheme,
            ...patch
          }
        }))
    }),
    [preferences, resolvedTheme, wallpaperCss, sidebarCss, updatePreferences]
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
};

export const useAppPreferences = () => {
  const context = useContext(AppPreferencesContext);

  if (!context) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  }

  return context;
};

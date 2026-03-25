export type AppLanguage = "en" | "ar";
export type ThemeMode = "light" | "dark";
export type AppThemeId = "light" | "dark" | "ocean" | "desert" | "custom";

export interface ThemeTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  border: string;
  input: string;
  ring: string;
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarBorder: string;
  sidebarAccent: string;
  shadowColor: string;
}

export interface CustomThemeConfig {
  mode: ThemeMode;
  primary: string;
  accent: string;
  background: string;
  surface: string;
}

export interface AppPreferences {
  themeId: AppThemeId;
  language: AppLanguage;
  useArabicNumerals: boolean;
  wallpaperId: string;
  customWallpaper: string | null;
  sidebarImage: string | null;
  avatarImage: string | null;
  customTheme: CustomThemeConfig;
}

export interface WallpaperPreset {
  id: string;
  name: string;
  description: string;
  backgroundImage: string;
}

export const APP_PREFERENCES_KEY = "tajerpro.preferences.v2";

const builtInThemes: Record<Exclude<AppThemeId, "custom">, ThemeTokens> = {
  light: {
    background: "40 60% 99%",
    foreground: "224 32% 16%",
    card: "0 0% 100%",
    cardForeground: "224 32% 16%",
    popover: "0 0% 100%",
    popoverForeground: "224 32% 16%",
    primary: "145 63% 42%",
    primaryForeground: "0 0% 100%",
    secondary: "38 97% 61%",
    secondaryForeground: "224 32% 16%",
    accent: "196 85% 49%",
    accentForeground: "0 0% 100%",
    muted: "40 33% 96%",
    mutedForeground: "220 12% 42%",
    destructive: "0 80% 59%",
    destructiveForeground: "0 0% 100%",
    success: "145 63% 42%",
    successForeground: "0 0% 100%",
    warning: "35 95% 57%",
    warningForeground: "224 32% 16%",
    border: "38 33% 88%",
    input: "38 33% 88%",
    ring: "196 85% 49%",
    sidebarBackground: "40 41% 98%",
    sidebarForeground: "224 32% 16%",
    sidebarBorder: "38 33% 88%",
    sidebarAccent: "38 97% 61%",
    shadowColor: "222 47% 11%",
  },
  dark: {
    background: "224 37% 9%",
    foreground: "45 40% 96%",
    card: "223 30% 13%",
    cardForeground: "45 40% 96%",
    popover: "223 30% 13%",
    popoverForeground: "45 40% 96%",
    primary: "145 66% 52%",
    primaryForeground: "224 37% 9%",
    secondary: "40 95% 63%",
    secondaryForeground: "224 37% 9%",
    accent: "192 90% 55%",
    accentForeground: "224 37% 9%",
    muted: "223 22% 18%",
    mutedForeground: "220 12% 72%",
    destructive: "0 74% 60%",
    destructiveForeground: "45 40% 96%",
    success: "145 66% 52%",
    successForeground: "224 37% 9%",
    warning: "40 95% 63%",
    warningForeground: "224 37% 9%",
    border: "223 17% 26%",
    input: "223 17% 26%",
    ring: "192 90% 55%",
    sidebarBackground: "223 30% 12%",
    sidebarForeground: "45 40% 96%",
    sidebarBorder: "223 17% 26%",
    sidebarAccent: "40 95% 63%",
    shadowColor: "220 60% 2%",
  },
  ocean: {
    background: "204 100% 98%",
    foreground: "222 55% 18%",
    card: "0 0% 100%",
    cardForeground: "222 55% 18%",
    popover: "0 0% 100%",
    popoverForeground: "222 55% 18%",
    primary: "198 85% 45%",
    primaryForeground: "0 0% 100%",
    secondary: "191 91% 56%",
    secondaryForeground: "222 55% 18%",
    accent: "222 94% 60%",
    accentForeground: "0 0% 100%",
    muted: "200 44% 95%",
    mutedForeground: "213 21% 41%",
    destructive: "0 80% 59%",
    destructiveForeground: "0 0% 100%",
    success: "160 71% 40%",
    successForeground: "0 0% 100%",
    warning: "43 96% 57%",
    warningForeground: "222 55% 18%",
    border: "199 40% 86%",
    input: "199 40% 86%",
    ring: "222 94% 60%",
    sidebarBackground: "203 86% 97%",
    sidebarForeground: "222 55% 18%",
    sidebarBorder: "199 40% 86%",
    sidebarAccent: "191 91% 56%",
    shadowColor: "214 70% 18%",
  },
  desert: {
    background: "37 63% 97%",
    foreground: "20 26% 18%",
    card: "34 57% 98%",
    cardForeground: "20 26% 18%",
    popover: "34 57% 98%",
    popoverForeground: "20 26% 18%",
    primary: "22 83% 49%",
    primaryForeground: "0 0% 100%",
    secondary: "43 92% 62%",
    secondaryForeground: "20 26% 18%",
    accent: "156 41% 39%",
    accentForeground: "0 0% 100%",
    muted: "38 48% 92%",
    mutedForeground: "25 14% 41%",
    destructive: "0 75% 58%",
    destructiveForeground: "0 0% 100%",
    success: "156 41% 39%",
    successForeground: "0 0% 100%",
    warning: "43 92% 62%",
    warningForeground: "20 26% 18%",
    border: "35 38% 84%",
    input: "35 38% 84%",
    ring: "22 83% 49%",
    sidebarBackground: "36 55% 95%",
    sidebarForeground: "20 26% 18%",
    sidebarBorder: "35 38% 84%",
    sidebarAccent: "43 92% 62%",
    shadowColor: "18 35% 14%",
  },
};

export const wallpaperPresets: WallpaperPreset[] = [
  {
    id: "confetti-forest",
    name: "Confetti Forest",
    description: "Playful mint, apricot, and sky orbs.",
    backgroundImage:
      "radial-gradient(circle at 12% 18%, rgba(255, 211, 128, 0.72), transparent 30%), radial-gradient(circle at 78% 12%, rgba(64, 190, 255, 0.55), transparent 28%), radial-gradient(circle at 82% 78%, rgba(118, 255, 182, 0.48), transparent 24%), linear-gradient(135deg, #fffaf0 0%, #f2fff8 47%, #eff7ff 100%)",
  },
  {
    id: "beach-glow",
    name: "Beach Glow",
    description: "Warm sunrise gradients with soft wave energy.",
    backgroundImage:
      "radial-gradient(circle at top right, rgba(255, 230, 141, 0.58), transparent 28%), radial-gradient(circle at bottom left, rgba(255, 166, 119, 0.48), transparent 32%), linear-gradient(145deg, #fff8e7 0%, #ffe9d6 40%, #e4f7ff 100%)",
  },
  {
    id: "midnight-splash",
    name: "Midnight Splash",
    description: "Dark studio atmosphere with neon aqua edges.",
    backgroundImage:
      "radial-gradient(circle at 18% 22%, rgba(84, 215, 255, 0.38), transparent 26%), radial-gradient(circle at 88% 15%, rgba(110, 255, 214, 0.26), transparent 28%), radial-gradient(circle at 72% 78%, rgba(255, 205, 116, 0.16), transparent 22%), linear-gradient(145deg, #0f172a 0%, #111827 45%, #172554 100%)",
  },
  {
    id: "oasis",
    name: "Oasis",
    description: "Fresh aquatic mesh with soft breeze colors.",
    backgroundImage:
      "radial-gradient(circle at 15% 20%, rgba(121, 255, 222, 0.42), transparent 25%), radial-gradient(circle at 84% 14%, rgba(122, 202, 255, 0.48), transparent 27%), radial-gradient(circle at 60% 72%, rgba(255, 255, 255, 0.65), transparent 18%), linear-gradient(135deg, #effcff 0%, #e8fff8 44%, #f6fff0 100%)",
  },
  {
    id: "citrus-party",
    name: "Citrus Party",
    description: "Bold Duolingo-style punch with juicy highlights.",
    backgroundImage:
      "radial-gradient(circle at 10% 15%, rgba(255, 215, 102, 0.7), transparent 24%), radial-gradient(circle at 84% 18%, rgba(61, 204, 151, 0.55), transparent 28%), radial-gradient(circle at 74% 76%, rgba(255, 130, 166, 0.34), transparent 24%), linear-gradient(140deg, #f7fff2 0%, #fef8ec 50%, #eff8ff 100%)",
  },
  {
    id: "desert-dusk",
    name: "Desert Dusk",
    description: "Apricot, sand, and sage for warm spaces.",
    backgroundImage:
      "radial-gradient(circle at 15% 20%, rgba(255, 194, 118, 0.55), transparent 26%), radial-gradient(circle at 82% 24%, rgba(126, 180, 146, 0.32), transparent 30%), radial-gradient(circle at 68% 74%, rgba(255, 246, 214, 0.8), transparent 20%), linear-gradient(145deg, #fff7ee 0%, #f8ead8 45%, #f2f3e8 100%)",
  },
  {
    id: "berry-fizz",
    name: "Berry Fizz",
    description: "Crisp berry tones with playful contrast pops.",
    backgroundImage:
      "radial-gradient(circle at 18% 18%, rgba(255, 168, 208, 0.52), transparent 28%), radial-gradient(circle at 78% 12%, rgba(128, 190, 255, 0.45), transparent 28%), radial-gradient(circle at 80% 78%, rgba(255, 221, 157, 0.32), transparent 22%), linear-gradient(140deg, #fff7fb 0%, #f2f7ff 45%, #fff9f1 100%)",
  },
  {
    id: "minty-paper",
    name: "Minty Paper",
    description: "Soft paper-like calm with mint and ivory.",
    backgroundImage:
      "radial-gradient(circle at 12% 20%, rgba(151, 255, 206, 0.28), transparent 26%), radial-gradient(circle at 86% 18%, rgba(197, 239, 255, 0.34), transparent 28%), linear-gradient(145deg, #fffffc 0%, #f6fff9 50%, #f9fbff 100%)",
  },
  {
    id: "violet-night",
    name: "Violet Night",
    description: "Rich dusk background for dark theme lovers.",
    backgroundImage:
      "radial-gradient(circle at 20% 15%, rgba(122, 123, 255, 0.34), transparent 24%), radial-gradient(circle at 78% 18%, rgba(255, 140, 214, 0.24), transparent 26%), radial-gradient(circle at 80% 78%, rgba(74, 222, 255, 0.18), transparent 20%), linear-gradient(140deg, #140f2d 0%, #1e1b4b 48%, #111827 100%)",
  },
  {
    id: "sunset-foam",
    name: "Sunset Foam",
    description: "Peach horizon balanced with cool sea foam.",
    backgroundImage:
      "radial-gradient(circle at 14% 16%, rgba(255, 181, 138, 0.5), transparent 28%), radial-gradient(circle at 82% 14%, rgba(123, 244, 220, 0.36), transparent 30%), radial-gradient(circle at 72% 78%, rgba(255, 238, 205, 0.6), transparent 20%), linear-gradient(145deg, #fff8f5 0%, #fff0e5 42%, #e9fff8 100%)",
  }
];

export const defaultPreferences = (): AppPreferences => ({
  themeId: "light",
  language: "en",
  useArabicNumerals: false,
  wallpaperId: wallpaperPresets[0].id,
  customWallpaper: null,
  sidebarImage: null,
  avatarImage: null,
  customTheme: {
    mode: "light",
    primary: "#34a853",
    accent: "#0ea5e9",
    background: "#fffaf0",
    surface: "#ffffff"
  }
});

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const hexToRgb = (hex: string) => {
  const sanitized = hex.replace("#", "");
  const normalized =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((char) => char + char)
          .join("")
      : sanitized;

  const int = Number.parseInt(normalized, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;

const mixHex = (hexA: string, hexB: string, weight = 0.5) => {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);

  return rgbToHex({
    r: a.r * (1 - weight) + b.r * weight,
    g: a.g * (1 - weight) + b.g * weight,
    b: a.b * (1 - weight) + b.b * weight
  });
};

const rgbToHslChannels = ({ r, g, b }: { r: number; g: number; b: number }) => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case red:
        h = 60 * (((green - blue) / delta) % 6);
        break;
      case green:
        h = 60 * ((blue - red) / delta + 2);
        break;
      default:
        h = 60 * ((red - green) / delta + 4);
        break;
    }
  }

  if (h < 0) h += 360;

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const hexToHslChannels = (hex: string) => rgbToHslChannels(hexToRgb(hex));

const getContrastColor = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.58 ? "#111827" : "#ffffff";
};

export const resolveThemeTokens = (preferences: AppPreferences): ThemeTokens => {
  if (preferences.themeId !== "custom") {
    return builtInThemes[preferences.themeId];
  }

  const { customTheme } = preferences;
  const foreground = customTheme.mode === "dark" ? "#f8fafc" : "#1f2937";
  const muted =
    customTheme.mode === "dark"
      ? mixHex(customTheme.background, "#ffffff", 0.08)
      : mixHex(customTheme.background, "#0f172a", 0.06);
  const border =
    customTheme.mode === "dark"
      ? mixHex(customTheme.background, "#ffffff", 0.16)
      : mixHex(customTheme.background, "#1f2937", 0.12);
  const sidebarBg =
    customTheme.mode === "dark"
      ? mixHex(customTheme.background, "#020617", 0.15)
      : mixHex(customTheme.surface, customTheme.primary, 0.06);

  return {
    background: hexToHslChannels(customTheme.background),
    foreground: hexToHslChannels(foreground),
    card: hexToHslChannels(customTheme.surface),
    cardForeground: hexToHslChannels(foreground),
    popover: hexToHslChannels(customTheme.surface),
    popoverForeground: hexToHslChannels(foreground),
    primary: hexToHslChannels(customTheme.primary),
    primaryForeground: hexToHslChannels(getContrastColor(customTheme.primary)),
    secondary: hexToHslChannels(mixHex(customTheme.primary, customTheme.accent, 0.4)),
    secondaryForeground: hexToHslChannels(getContrastColor(mixHex(customTheme.primary, customTheme.accent, 0.4))),
    accent: hexToHslChannels(customTheme.accent),
    accentForeground: hexToHslChannels(getContrastColor(customTheme.accent)),
    muted: hexToHslChannels(muted),
    mutedForeground: hexToHslChannels(customTheme.mode === "dark" ? "#cbd5e1" : "#475569"),
    destructive: hexToHslChannels("#ef4444"),
    destructiveForeground: hexToHslChannels("#ffffff"),
    success: hexToHslChannels(mixHex(customTheme.primary, "#22c55e", 0.45)),
    successForeground: hexToHslChannels("#ffffff"),
    warning: hexToHslChannels("#f59e0b"),
    warningForeground: hexToHslChannels("#111827"),
    border: hexToHslChannels(border),
    input: hexToHslChannels(border),
    ring: hexToHslChannels(customTheme.accent),
    sidebarBackground: hexToHslChannels(sidebarBg),
    sidebarForeground: hexToHslChannels(foreground),
    sidebarBorder: hexToHslChannels(border),
    sidebarAccent: hexToHslChannels(mixHex(customTheme.primary, customTheme.accent, 0.55)),
    shadowColor: customTheme.mode === "dark" ? "220 60% 2%" : "222 47% 11%"
  };
};

export const getWallpaperCss = (preferences: AppPreferences) => {
  if (preferences.customWallpaper) {
    return `url("${preferences.customWallpaper}")`;
  }

  return (
    wallpaperPresets.find((preset) => preset.id === preferences.wallpaperId)
      ?.backgroundImage ?? wallpaperPresets[0].backgroundImage
  );
};

export const getSidebarCss = (preferences: AppPreferences) => {
  if (preferences.sidebarImage) {
    return `linear-gradient(180deg, rgba(15, 23, 42, 0.52), rgba(15, 23, 42, 0.72)), url("${preferences.sidebarImage}")`;
  }

  return "linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(15, 23, 42, 0.04))";
};

export const toLocalizedNumber = (
  value: number | string,
  language: AppLanguage,
  useArabicNumerals: boolean
) => {
  const locale =
    language === "ar" && useArabicNumerals
      ? "ar-EG-u-nu-arab"
      : language === "ar"
        ? "ar-EG"
        : "en-US";

  return new Intl.NumberFormat(locale).format(Number(value));
};

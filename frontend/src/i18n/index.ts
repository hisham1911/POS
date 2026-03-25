import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "@/locales/ar.json";
import en from "@/locales/en.json";

const getInitialLanguage = () => {
  try {
    const stored = localStorage.getItem("tajerpro.preferences.v2");
    return stored ? JSON.parse(stored).language ?? "en" : "en";
  } catch {
    return "en";
  }
};

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar }
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;

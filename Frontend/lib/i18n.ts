"use client"

import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import en from "@/locales/en/translation.json"
import vi from "@/locales/vi/translation.json"

export type AppLanguage = "vi" | "en"

export const LANG_STORAGE_KEY = "lang"
export const DEFAULT_LANGUAGE: AppLanguage = "vi"

export function getStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE
  const stored = localStorage.getItem(LANG_STORAGE_KEY)
  return stored === "en" || stored === "vi" ? stored : DEFAULT_LANGUAGE
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    // Always start with the same default on server and first client render.
    // LanguageProvider syncs localStorage after hydration to avoid mismatch.
    lng: DEFAULT_LANGUAGE,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  })
}

export default i18n

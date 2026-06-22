"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useTranslation } from "react-i18next"
import {
  getStoredLanguage,
  LANG_STORAGE_KEY,
  DEFAULT_LANGUAGE,
  type AppLanguage,
} from "@/lib/i18n"

type LanguageContextType = {
  language: AppLanguage
  setLanguage: (lang: AppLanguage) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE)

  useEffect(() => {
    const stored = getStoredLanguage()
    setLanguageState(stored)
    document.documentElement.lang = stored
    if (i18n.language !== stored) {
      void i18n.changeLanguage(stored)
    }
  }, [i18n])

  const setLanguage = (lang: AppLanguage) => {
    if (lang === language) return
    localStorage.setItem(LANG_STORAGE_KEY, lang)
    setLanguageState(lang)
    i18n.changeLanguage(lang, () => {
      window.location.reload()
    })
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

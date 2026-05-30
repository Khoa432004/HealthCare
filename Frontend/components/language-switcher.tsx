"use client"

import { useLanguage } from "@/contexts/language-context"
import type { AppLanguage } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type LanguageSwitcherProps = {
  className?: string
}

function languageClass(active: boolean) {
  return cn(
    "cursor-pointer select-none",
    active ? "text-brand-7 font-semibold" : "text-gray-500 font-normal"
  )
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()

  const renderOption = (lang: AppLanguage, flagClass: string, label: string) => (
    <span
      role="button"
      tabIndex={0}
      className={languageClass(language === lang)}
      onClick={() => setLanguage(lang)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          setLanguage(lang)
        }
      }}
    >
      <span className={flagClass} /> {label}
    </span>
  )

  return (
    <div className={cn("flex items-center justify-center gap-2 text-sm w-full py-2.5", className)}>
      {renderOption("en", "fi fi-gb", "En")}
      <span className="text-gray-300">|</span>
      {renderOption("vi", "fi fi-vn", "Vi")}
    </div>
  )
}

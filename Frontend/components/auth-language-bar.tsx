"use client"

import { LanguageSwitcher } from "@/components/language-switcher"

export function AuthLanguageBar() {
  return (
    <div className="absolute top-4 right-4 z-20">
      <LanguageSwitcher className="bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-sm" />
    </div>
  )
}

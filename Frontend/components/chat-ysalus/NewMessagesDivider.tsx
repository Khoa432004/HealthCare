"use client"

import { useTranslation } from "react-i18next"

export function NewMessagesDivider() {
  const { t } = useTranslation()
  return (
    <div className="my-3 flex w-full shrink-0 items-center gap-3 px-1" role="separator" aria-label={t("newMessages")}>
      <div className="h-px flex-1 bg-brand-4/35" />
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-brand-7">{t("newMessages")}</span>
      <div className="h-px flex-1 bg-brand-4/35" />
    </div>
  )
}

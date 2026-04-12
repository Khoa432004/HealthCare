"use client"

import { ChevronRight, Sparkles } from "lucide-react"

interface ChatAiHighlightBannerProps {
  onClick: () => void
  /** Khi phòng AI đang mở ở panel bên phải */
  isActive?: boolean
}

export function ChatAiHighlightBanner({ onClick, isActive = false }: ChatAiHighlightBannerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full shrink-0 text-left rounded-xl overflow-hidden border shadow-theme-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-6 focus-visible:ring-offset-2 transition hover:opacity-[0.98] active:scale-[0.99] ${
        isActive ? "ring-2 ring-white/90 border-white/50" : "border-brand-6/40"
      }`}
    >
      <div className="relative flex items-start gap-3 p-3.5 sm:p-4 pb-4 bg-gradient-to-br from-brand-7 via-brand-6 to-brand-4 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_20%_20%,white,transparent_55%)]"
          aria-hidden
        />
        <div className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
          <Sparkles className="h-5 w-5 text-white" strokeWidth={2} aria-hidden />
        </div>
        <div className="relative min-w-0 flex-1 py-0.5">
          <p className="text-sm font-semibold tracking-tight leading-snug">Chat với trợ lý AI</p>
          <p className="text-[11px] sm:text-xs text-white/85 mt-1 leading-relaxed">
            Gợi ý nhanh, hỏi đáp chung — bấm để mở phòng chat giống chat bác sĩ–bệnh nhân.
          </p>
        </div>
        <ChevronRight
          className="relative mt-1.5 h-5 w-5 shrink-0 text-white/90 transition group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>
    </button>
  )
}

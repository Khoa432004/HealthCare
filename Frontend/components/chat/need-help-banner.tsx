"use client"

import { MessageCircle } from "lucide-react"

interface NeedHelpBannerProps {
  title?: string
  description?: string
  onChatClick?: () => void
}

export function NeedHelpBanner({
  title = "Need help? Chat with the Admin now!",
  description,
  onChatClick,
}: NeedHelpBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] h-[130px] p-4 border border-white/70 bg-white/70 flex flex-col justify-between cursor-pointer transition-smooth hover:shadow-soft-md"
      style={{ backgroundColor: "rgba(255,255,255,0.68)", borderColor: "rgba(255,255,255,0.68)" }}
      onClick={onChatClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onChatClick?.()}
    >
      <div className="flex items-start justify-between gap-3 pr-10">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-normal text-[#0b0c0c]/80 leading-tight mb-0.5">
            {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, ".")}
          </p>
          <h3 className="text-base font-semibold text-[#0b0c0c] leading-tight" style={{ lineHeight: 1.4 }}>
            {title}
          </h3>
          {description && (
            <p className="text-sm font-normal text-[#0b0c0c]/80 line-clamp-2 mt-0.5" style={{ lineHeight: 1.5 }}>
              {description}
            </p>
          )}
        </div>
        <div
          className="absolute top-4 right-4 w-9 h-8 rounded-full flex items-center justify-center border border-[#2ad9ff] shadow-md rotate-[13deg]"
          style={{ backgroundColor: "#16a1bd" }}
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
      </div>
      {/* Decorative illustration - optional img if /clean-female-doctor.png exists */}
      <div className="absolute bottom-0 right-10 w-24 h-[131px] rounded-b-lg overflow-hidden pointer-events-none bg-[#b7e2eb]/30" />
    </div>
  )
}

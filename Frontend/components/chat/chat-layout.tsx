"use client"

import { YsalusChatPage } from "@/components/chat-ysalus"
import type { ChatRole } from "@/types/chat"

interface ChatLayoutProps {
  role: ChatRole
  /** Kept for API compatibility; Ysalus V2 UI does not render this banner. */
  showNeedHelpBanner?: boolean
  /** Kept for API compatibility; inbox category pills match ysalus (not filtered). */
  allowedFilters?: unknown
}

export function ChatLayout({ role }: ChatLayoutProps) {
  return (
    <div className="flex flex-1 min-h-0 h-full w-full">
      <YsalusChatPage role={role} />
    </div>
  )
}

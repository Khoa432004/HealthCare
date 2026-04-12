"use client"

import { YsalusChatPage } from "@/components/chat-ysalus"
import type { ChatRole, InboxFilter } from "@/types/chat"

interface ChatLayoutProps {
  role: ChatRole
  /** Kept for API compatibility; Ysalus V2 UI does not render this banner. */
  showNeedHelpBanner?: boolean
  /** Inbox pills: chỉ hiển thị các filter này (ví dụ patient: all+doctor). Không truyền = all + patient + doctor (không có nurse/receptionist). */
  allowedFilters?: InboxFilter[]
}

export function ChatLayout({ role, allowedFilters }: ChatLayoutProps) {
  return (
    <div className="flex flex-1 min-h-0 h-full w-full">
      <YsalusChatPage role={role} inboxAllowedFilters={allowedFilters} />
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChatInboxPanel } from "./chat-inbox-panel"
import { ChatConversationPanel } from "./chat-conversation-panel"
import type { Conversation, InboxFilter } from "@/types/chat"

interface ChatLayoutProps {
  role: "ADMIN" | "DOCTOR" | "PATIENT"
  /** Show "Need help? Chat with Admin" banner (default: true for Patient, true for Admin/Doctor too) */
  showNeedHelpBanner?: boolean
  /** For Patient: only show relevant filters e.g. ["all", "doctor"]. For Doctor: ["all", "patient"]. For Admin: all. */
  allowedFilters?: InboxFilter[]
}

export function ChatLayout({
  role,
  showNeedHelpBanner = true,
  allowedFilters,
}: ChatLayoutProps) {
  const [selected, setSelected] = useState<Conversation | null>(null)

  return (
    <div className="flex flex-1 min-h-0 rounded-t-[20px] overflow-hidden shadow-soft-lg">
      <div className="w-[360px] min-w-[280px] max-w-[40%] flex-shrink-0 border-r border-[#b7e2eb]/50">
        <ChatInboxPanel
          role={role}
          selectedId={selected?.id ?? null}
          onSelectConversation={setSelected}
          showNeedHelpBanner={showNeedHelpBanner}
          allowedFilters={allowedFilters}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <ChatConversationPanel conversation={selected} />
      </div>
    </div>
  )
}

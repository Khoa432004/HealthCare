"use client"

import { useState, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NeedHelpBanner } from "./need-help-banner"
import { ChatFilterTabs } from "./chat-filter-tabs"
import { ChatInboxItem } from "./chat-inbox-item"
import type { Conversation, InboxFilter } from "@/types/chat"

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    participantName: "YSalus Admin",
    participantType: "admin",
    lastMessage: "Hello, how can I help you today?",
    lastMessageTime: "02.08.24",
    unreadCount: 2,
    isPinned: true,
    isOnline: true,
  },
  {
    id: "2",
    participantName: "Pham Linh",
    participantType: "patient",
    subtitle: "ID1234 • Female • 21 y.o.",
    lastMessage: "Hello Dr. Patel, I've been managing my ...",
    lastMessageTime: "12:00",
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: "3",
    participantName: "Nguyen Van Nam",
    participantType: "patient",
    subtitle: "ID5678 • Male • 35 y.o.",
    lastMessage: "Thank you for the prescription.",
    lastMessageTime: "11:45",
    unreadCount: 2,
    isOnline: false,
  },
]

interface ChatInboxPanelProps {
  role: "ADMIN" | "DOCTOR" | "PATIENT"
  selectedId: string | null
  onSelectConversation: (conv: Conversation) => void
  /** For Patient: show "Need help? Chat with Admin" banner */
  showNeedHelpBanner?: boolean
  /** Filters to show (by role). If not set, all filters shown. */
  allowedFilters?: InboxFilter[]
}

export function ChatInboxPanel({
  role,
  selectedId,
  onSelectConversation,
  showNeedHelpBanner = true,
  allowedFilters,
}: ChatInboxPanelProps) {
  const [filter, setFilter] = useState<InboxFilter>("all")

  const conversations = useMemo(() => {
    if (filter === "all") return MOCK_CONVERSATIONS
    return MOCK_CONVERSATIONS.filter((c) => c.participantType === filter)
  }, [filter])

  return (
    <div className="flex flex-col h-full bg-[#ceebf2] rounded-tl-[20px] overflow-hidden">
      <div className="p-4 space-y-4 flex-shrink-0">
        {showNeedHelpBanner && (
          <NeedHelpBanner
            title="Need help? Chat with the Admin now!"
            onChatClick={() => {
              const adminConv = MOCK_CONVERSATIONS.find((c) => c.participantType === "admin")
              if (adminConv) onSelectConversation(adminConv)
            }}
          />
        )}
        <div>
          <h2 className="text-base font-semibold text-[#0b0c0c] mb-3">Inbox</h2>
          <ChatFilterTabs value={filter} onChange={setFilter} allowedFilters={allowedFilters} />
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-0">
          {conversations.map((conv) => (
            <ChatInboxItem
              key={conv.id}
              conversation={conv}
              isSelected={selectedId === conv.id}
              onClick={() => onSelectConversation(conv)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

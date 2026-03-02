"use client"

import { cn } from "@/lib/utils"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Conversation } from "@/types/chat"

interface ChatInboxItemProps {
  conversation: Conversation
  isSelected?: boolean
  onClick?: () => void
}

export function ChatInboxItem({ conversation, isSelected, onClick }: ChatInboxItemProps) {
  const initials = conversation.participantName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex gap-3 p-4 rounded-[20px] text-left transition-smooth hover:bg-white/50",
        isSelected && "bg-white/70 shadow-soft"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11 rounded-full">
          <AvatarImage src={conversation.avatarUrl} alt={conversation.participantName} />
          <AvatarFallback className="rounded-full bg-[#16a1bd] text-white text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        {conversation.isOnline && (
          <span
            className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#04DE4E] border-2 border-white"
            aria-hidden
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[#0b0c0c] truncate">
              {conversation.participantName}
            </p>
            {conversation.subtitle && (
              <p className="text-xs text-[#0b0c0c]/80 truncate">{conversation.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-medium text-[#0b0c0c]/80">
              {conversation.lastMessageTime}
            </span>
            {conversation.isPinned && (
              <Star className="w-4 h-4 fill-[#0b0c0c] text-[#0b0c0c]" aria-hidden />
            )}
            {conversation.unreadCount != null && conversation.unreadCount > 0 && (
              <span
                className="min-w-[16px] h-4 px-1 rounded-full bg-[#ff4f5d] text-[10px] font-semibold text-white flex items-center justify-center"
                aria-label={`${conversation.unreadCount} unread`}
              >
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm font-medium text-[#0b0c0c] truncate mt-0.5">
          {conversation.lastMessage}
        </p>
      </div>
    </button>
  )
}

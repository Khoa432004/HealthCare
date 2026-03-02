"use client"

import { cn } from "@/lib/utils"
import { FileText, Download } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Message } from "@/types/chat"

interface ChatMessageBubbleProps {
  message: Message
  showAvatar?: boolean
  avatarUrl?: string
}

export function ChatMessageBubble({ message, showAvatar = true, avatarUrl }: ChatMessageBubbleProps) {
  const initials = message.senderName
    ?.split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?"

  if (message.isOwn) {
    return (
      <div className="flex justify-end px-4 py-1">
        <div
          className="max-w-[80%] rounded-[20px] px-4 py-3 border border-[#b7e2eb]"
          style={{ backgroundColor: "rgba(183,226,235,0.7)" }}
        >
          {message.attachment ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[#0b0c0c]">
                <FileText className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium truncate max-w-[200px]">
                  {message.attachment.name}
                </span>
                <span className="text-xs text-[#5d5d5d] shrink-0">{message.attachment.size}</span>
              </div>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-white/50 transition-colors"
                aria-label="Download"
              >
                <Download className="w-4 h-4 text-[#0b0c0c]" />
              </button>
            </div>
          ) : (
            <p className="text-sm font-medium text-[#0b0c0c] leading-[1.5]">{message.content}</p>
          )}
          <p className="text-[10px] font-medium text-[#0b0c0c]/80 mt-1 text-right">
            {message.time}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 items-start px-4 py-1">
      {showAvatar ? (
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarImage src={avatarUrl} alt={message.senderName} />
            <AvatarFallback className="rounded-full bg-[#16a1bd] text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {message.isOnline && (
            <span
              className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#04DE4E] border-2 border-white"
              aria-hidden
            />
          )}
        </div>
      ) : (
        <div className="w-10 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        {message.senderName && (
          <div className="mb-1">
            <p className="text-sm font-semibold text-[#0b0c0c]">{message.senderName}</p>
            <div className="flex items-center gap-1 text-xs text-[#0b0c0c]/80">
              {message.senderRole && <span>{message.senderRole}</span>}
              {message.senderSpecialty && (
                <>
                  <span className="w-0.5 h-0.5 rounded-full bg-[#0b0c0c]" />
                  <span>{message.senderSpecialty}</span>
                </>
              )}
            </div>
          </div>
        )}
        <div
          className={cn(
            "rounded-[20px] px-4 py-3 relative",
            "bg-white/70 border border-white/20"
          )}
        >
          <p className="text-sm font-medium text-[#0b0c0c] leading-[1.5]">{message.content}</p>
          <p className="text-[10px] font-medium text-[#0b0c0c]/80 mt-1 text-right">{message.time}</p>
        </div>
      </div>
    </div>
  )
}

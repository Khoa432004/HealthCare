"use client"

import { useState } from "react"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessageBubble } from "./chat-message-bubble"
import { ChatInputBar } from "./chat-input-bar"
import type { Conversation, Message } from "@/types/chat"

const MOCK_MESSAGES: Message[] = [
  {
    id: "m1",
    senderId: "p1",
    senderName: "Pham Linh",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
    time: "11:30",
    isOwn: false,
    isOnline: true,
  },
  {
    id: "m2",
    senderId: "me",
    content: "Hello Dr. Patel, I've been managing my ...",
    time: "11:32",
    isOwn: true,
    attachment: { name: "Hello Dr. Patel, I've been managi...", size: "5.7MB" },
  },
  {
    id: "m3",
    senderId: "p1",
    senderName: "Pham Linh",
    content: "Thank you for the update.",
    time: "11:35",
    isOwn: false,
    isOnline: true,
  },
]

interface ChatConversationPanelProps {
  conversation: Conversation | null
}

export function ChatConversationPanel({ conversation }: ChatConversationPanelProps) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-tr-[20px] text-[#899091]">
        <p className="text-sm font-medium">Select a conversation</p>
        <p className="text-xs mt-1">Choose from the inbox to start chatting</p>
      </div>
    )
  }

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        senderId: "me",
        content: text,
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        isOwn: true,
      },
    ])
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-tr-[20px] overflow-hidden min-w-0">
      {/* Chat header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#e5f5f8] flex-shrink-0">
        <div>
          <h3 className="text-base font-semibold text-[#0b0c0c]">{conversation.participantName}</h3>
          {conversation.subtitle && (
            <p className="text-xs text-[#899091] mt-0.5">{conversation.subtitle}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" aria-label="More options">
          <MoreVertical className="w-5 h-5 text-[#0b0c0c]" />
        </Button>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="py-4">
          <div className="text-center mb-4">
            <span className="text-sm font-semibold text-[#0b0c0c]/80">Today</span>
          </div>
          {messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              showAvatar={!msg.isOwn}
              avatarUrl={conversation.avatarUrl}
            />
          ))}
          <div className="flex items-center justify-center gap-5 my-5">
            <div className="flex-1 h-px bg-[#899091]" />
            <span className="text-xs font-medium text-[#0b0c0c]">new message</span>
            <div className="flex-1 h-px bg-[#899091]" />
          </div>
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInputBar onSend={handleSend} onAttach={() => {}} />
    </div>
  )
}

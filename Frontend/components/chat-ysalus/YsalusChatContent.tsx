"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, MoreVertical } from "lucide-react"
import { formatDateWithSuffix } from "./dateTime.util"
import { YsalusAvatar } from "./YsalusAvatar"
import type { ChatMessageResponse, ChatMessagesGroupByDate, ChatMessageType, SelectedChatType } from "./types"
import { YsalusChatInput } from "./YsalusChatInput"
import {
  fetchChatMessagesGrouped,
  sendChatMessage,
  type ChatMessageGroupDto,
  type ChatRealtimePayload,
} from "@/services/chat-messaging.service"
import { webSocketService } from "@/services/websocket.service"
import { YsalusLoading } from "./YsalusLoading"

interface YsalusChatContentProps {
  selectedChat: SelectedChatType
  setSelectedChat: (value: SelectedChatType | null) => void
  currentUserId: string
}

function genderLabel(g?: string) {
  if (!g) return ""
  return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
}

function mapApiToGroups(groups: ChatMessageGroupDto[]): ChatMessagesGroupByDate[] {
  return groups.map((g) => ({
    date: g.date,
    messages: g.messages.map((m) => ({
      id: m.id,
      content: m.content,
      type: (m.type as ChatMessageType) || "text",
      creator: { id: m.creator.id },
      createdAt: new Date(m.createdAt).getTime(),
    })),
  }))
}

function isSameThread(payload: ChatRealtimePayload, open: SelectedChatType) {
  const a = open.senderId
  const b = open.receiverId
  return (
    (payload.senderId === a && payload.receiverId === b) ||
    (payload.senderId === b && payload.receiverId === a)
  )
}

function flattenIds(groups: ChatMessagesGroupByDate[] | null) {
  const s = new Set<string>()
  if (!groups) return s
  groups.forEach((g) => g.messages.forEach((m) => s.add(m.id)))
  return s
}

function dayKeyFromCreatedAt(createdAt: number) {
  const d = new Date(createdAt)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function appendMessage(groups: ChatMessagesGroupByDate[], msg: ChatMessageResponse): ChatMessagesGroupByDate[] {
  const key = dayKeyFromCreatedAt(typeof msg.createdAt === "number" ? msg.createdAt : Date.now())
  const next = [...groups]
  const idx = next.findIndex((g) => g.date === key)
  if (idx >= 0) {
    const g = next[idx]!
    next[idx] = { ...g, messages: [...g.messages, msg] }
  } else {
    next.push({ date: key, messages: [msg] })
    next.sort((a, b) => a.date.localeCompare(b.date))
  }
  return next
}

export function YsalusChatContent({ selectedChat, setSelectedChat, currentUserId }: YsalusChatContentProps) {
  const selectedChatRef = useRef(selectedChat)
  selectedChatRef.current = selectedChat

  const [chatMessagesGroupByDateData, setChatMessagesGroupByDateData] = useState<ChatMessagesGroupByDate[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLUListElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setChatMessagesGroupByDateData(null)
    setLoadError(null)
    ;(async () => {
      try {
        const raw = await fetchChatMessagesGrouped(selectedChat.receiverId, currentUserId)
        if (!cancelled) setChatMessagesGroupByDateData(raw.length ? mapApiToGroups(raw) : [])
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load messages")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedChat.receiverId, currentUserId])

  useEffect(() => {
    webSocketService.connect()
    const dest = `/topic/chat/${currentUserId}`
    return webSocketService.subscribe(dest, (payload: ChatRealtimePayload) => {
      const open = selectedChatRef.current
      if (!open || !isSameThread(payload, open)) return
      setChatMessagesGroupByDateData((prev) => {
        if (prev == null) return prev
        const ids = flattenIds(prev)
        if (ids.has(payload.id)) return prev
        const msg: ChatMessageResponse = {
          id: payload.id,
          content: payload.content,
          type: (payload.type as ChatMessageType) || "text",
          creator: { id: payload.senderId },
          createdAt: Date.now(),
        }
        return appendMessage(prev, msg)
      })
    })
  }, [currentUserId])

  const handleSendMessage = useCallback(
    async (content: string) => {
      const text = content.trim()
      if (!text) return
      try {
        const id = await sendChatMessage(selectedChat.receiverId, text, currentUserId)
        const msg: ChatMessageResponse = {
          id,
          content: text,
          type: "text",
          creator: { id: currentUserId },
          createdAt: Date.now(),
        }
        setChatMessagesGroupByDateData((prev) => {
          const base = prev ?? []
          const ids = flattenIds(base)
          if (ids.has(id)) return base
          if (base.length === 0) return [{ date: dayKeyFromCreatedAt(msg.createdAt as number), messages: [msg] }]
          return appendMessage(base, msg)
        })
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Send failed")
      }
    },
    [selectedChat.receiverId, currentUserId]
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessagesGroupByDateData])

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-indicator">
        <div className="w-full flex items-start gap-4">
          <ChevronLeft
            className="block md:hidden m-auto size-5 cursor-pointer"
            onClick={() => setSelectedChat(null)}
          />
          <YsalusAvatar
            src={selectedChat.receiverAvatar ? selectedChat.receiverAvatar : ""}
            alt={selectedChat.receiverName}
            size="large"
            className="flex-shrink-0"
            status={selectedChat.isReceiverOnline ? "online" : "none"}
          />
          <div className="flex-1 flex flex-col items-start overflow-hidden gap-1">
            <span className="text-gray-800 font-semibold truncate">{selectedChat.receiverName}</span>
            {selectedChat.receiverGender && (
              <span className="flex-1 truncate text-xs font-medium text-gray-500">
                {`${genderLabel(selectedChat.receiverGender)} • ${selectedChat.receiverAge} y.o.`}
              </span>
            )}
          </div>
        </div>
        <MoreVertical className="size-5 cursor-pointer" />
      </div>
      {loadError && <p className="px-4 py-2 text-xs text-error-400">{loadError}</p>}
      {chatMessagesGroupByDateData === null && (
        <YsalusLoading className="h-svh place-content-center" message="Please wait for minutes" />
      )}
      {chatMessagesGroupByDateData && (
        <ul
          ref={scrollRef}
          className="w-full flex-1 flex flex-col overflow-y-auto custom-scrollbar px-4 pb-4"
        >
          {chatMessagesGroupByDateData.map((item) => (
            <li key={item.date} className="w-full flex flex-col gap-4 mt-4">
              <span className="text-gray-400 text-xs text-center">
                {formatDateWithSuffix(new Date(item.date + "T12:00:00"))}
              </span>
              {(() => {
                const grouped: ChatMessageResponse[][] = []
                let lastSender: string | null = null
                let currentGroup: ChatMessageResponse[] = []

                item.messages.forEach((msg) => {
                  if (msg.creator.id === lastSender) {
                    currentGroup.push(msg)
                  } else {
                    if (currentGroup.length) grouped.push(currentGroup)
                    currentGroup = [msg]
                    lastSender = msg.creator.id
                  }
                })
                if (currentGroup.length) grouped.push(currentGroup)

                return grouped.map((group, groupIdx) => {
                  const isMe = group[0]!.creator.id === currentUserId
                  return (
                    <div
                      key={groupIdx}
                      className={`flex ${isMe ? "justify-end" : "items-end justify-start gap-2"}`}
                    >
                      {!isMe && (
                        <YsalusAvatar
                          src={selectedChat.receiverAvatar ? selectedChat.receiverAvatar : ""}
                          alt={selectedChat.receiverName}
                          size="small"
                          className="flex-shrink-0"
                          status={selectedChat.isReceiverOnline ? "online" : "none"}
                        />
                      )}
                      <div className="flex flex-col items-start gap-1 max-w-[70%]">
                        {!isMe && (
                          <span className="text-xs text-gray-500 font-medium">{selectedChat.receiverName}</span>
                        )}

                        {group.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-xl text-gray-900 text-sm font-medium ${
                              isMe
                                ? "bg-brand-1 rounded-br-none self-end"
                                : "bg-gray-100 rounded-bl-none"
                            }`}
                          >
                            {msg.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              })()}
            </li>
          ))}
          <div className="h-0 w-full" ref={bottomRef} />
        </ul>
      )}
      <YsalusChatInput className="border-t" onSend={handleSendMessage} />
    </div>
  )
}

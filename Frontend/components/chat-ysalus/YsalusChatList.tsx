"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import { MessageCircle, Users, Stethoscope, UserRound, FileText } from "lucide-react"
import { YsalusAvatar } from "./YsalusAvatar"
import { YsalusLabel } from "./YsalusLabel"
import { formatDateWithSuffix } from "./dateTime.util"
import type { SelectedChatType } from "./types"
import type { ChatRole } from "@/types/chat"
import { fetchChatPeers, type ChatPeerDto } from "@/services/chat-messaging.service"

const categories: { icon: ReactNode; label: string }[] = [
  { icon: <MessageCircle className="size-5 fill-current" />, label: "all" },
  { icon: <Users className="size-4" />, label: "patient" },
  { icon: <Stethoscope className="size-4" />, label: "doctor" },
  { icon: <UserRound className="size-4" />, label: "nurse" },
  { icon: <FileText className="size-4" />, label: "receptionist" },
]

const labelDisplay: Record<string, string> = {
  all: "All",
  patient: "Patient",
  doctor: "Doctor",
  nurse: "Nurse",
  receptionist: "Receptionist",
}

function genderLabel(g?: string) {
  if (!g) return ""
  return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
}

function peerToSelected(peer: ChatPeerDto, senderId: string): SelectedChatType {
  return {
    senderId,
    receiverId: peer.id,
    receiverName: peer.fullName,
    receiverAvatar: peer.avatarUrl ?? null,
    receiverGender: peer.gender || undefined,
    receiverAge: peer.age ?? undefined,
    isReceiverOnline: false,
    lastMessage: " ",
    lastDate: new Date(),
  }
}

interface YsalusChatListProps {
  role: ChatRole
  currentUserId: string
  setSelectedChat: (value: SelectedChatType) => void
}

export function YsalusChatList({ role: _role, currentUserId, setSelectedChat }: YsalusChatListProps) {
  const [selectedCat, setSelectedCat] = useState<string>(categories[0]!.label)
  const [peers, setPeers] = useState<ChatPeerDto[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchChatPeers()
        if (!cancelled) setPeers(data)
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load inbox")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const formatChats = useMemo(
    () => peers.map((p) => peerToSelected(p, currentUserId)),
    [peers, currentUserId]
  )

  const renderCategory = (icon: ReactNode, title: string) => {
    return (
      <div
        key={title}
        className={`flex items-center gap-1 py-1 px-3 rounded-full cursor-pointer ${
          selectedCat === title
            ? "bg-brand-05 border border-brand-6 text-brand-6"
            : "bg-gray-100 text-gray-500"
        }`}
        onClick={() => setSelectedCat(title)}
      >
        {icon}
        <span className="text-sm font-medium">{labelDisplay[title] ?? title}</span>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative flex flex-col overflow-hidden p-2 gap-4">
      <img src="/images/chat_banner.webp" alt="" />
      <YsalusLabel className="text-md font-semibold">Inbox</YsalusLabel>
      {loadError && <p className="text-xs text-error-400 px-1">{loadError}</p>}
      <div className="flex flex-wrap gap-2">
        {categories.map((e) => renderCategory(e.icon, e.label))}
      </div>
      <ul className="w-full h-full flex flex-col overflow-auto custom-scrollbar">
        {formatChats.map((item, index) => (
          <li
            key={item.receiverId}
            className="flex flex-col"
            onClick={() => {
              setSelectedChat(item)
            }}
          >
            <div className="w-full flex flex-col items-start overflow-hidden gap-2 rounded-xl px-2 py-3 hover:bg-gray-100 text-sm cursor-pointer">
              <div className="w-full flex items-start gap-2">
                <YsalusAvatar
                  src={item.receiverAvatar ? item.receiverAvatar : ""}
                  alt={item.receiverName}
                  size="large"
                  className="flex-shrink-0"
                  status={item.isReceiverOnline ? "online" : "none"}
                />
                <div className="flex-1 flex flex-col overflow-hidden items-start gap-1">
                  <div className="w-full flex items-center justify-between gap-1">
                    <span className="text-gray-800 font-semibold truncate">{item.receiverName}</span>
                    <span className="hidden md:block text-xs whitespace-nowrap">
                      {formatDateWithSuffix(item.lastDate)}
                    </span>
                  </div>
                  {item.receiverGender != null && item.receiverAge != null && (
                    <span className="flex-1 truncate text-xs font-medium text-gray-500">
                      {genderLabel(item.receiverGender)} • {item.receiverAge} y.o.
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full flex items-center justify-between gap-4">
                <p className="flex-1 truncate text-sm font-medium">{item.lastMessage.trim() || "\u00a0"}</p>
                <span className="block md:hidden text-xs whitespace-nowrap">
                  {formatDateWithSuffix(item.lastDate)}
                </span>
              </div>
            </div>
            {index < formatChats.length - 1 && <hr className="border-indicator" />}
          </li>
        ))}
      </ul>
    </div>
  )
}

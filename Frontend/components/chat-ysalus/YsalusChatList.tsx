"use client"

import { type ReactNode, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { MessageCircle, Shield, Stethoscope, Users } from "lucide-react"
import { YsalusAvatar } from "./YsalusAvatar"
import { YsalusLabel } from "./YsalusLabel"
import { formatDateWithSuffix } from "./dateTime.util"
import {
  AI_ASSISTANT_RECEIVER_ID,
  createAiAssistantSelection,
  isAdminReceiver,
  type SelectedChatType,
} from "./types"
import type { ChatRole, InboxFilter } from "@/types/chat"
import { fetchChatPeers, type ChatPeerDto } from "@/services/chat-messaging.service"
import { ChatAiHighlightBanner } from "./ChatAiHighlightBanner"
import {
  clearChatPendingForPeer,
  getChatPendingVersion,
  getPeerConversationActivityTs,
  getPendingCountForPeer,
  subscribeChatPending,
} from "@/lib/chat-inbox-pending"

/** Không có nurse/receptionist — không dùng trong inbox Ysalus. */
const INBOX_CATEGORY_DEFS: { icon: ReactNode; filter: InboxFilter }[] = [
  { icon: <MessageCircle className="size-5 fill-current" />, filter: "all" },
  { icon: <Users className="size-4" />, filter: "patient" },
  { icon: <Stethoscope className="size-4" />, filter: "doctor" },
]

const labelDisplay: Record<InboxFilter, string> = {
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
  const activityTs = getPeerConversationActivityTs(peer.id)
  return {
    senderId,
    receiverId: peer.id,
    receiverName: peer.fullName,
    receiverAvatar: peer.avatarUrl ?? null,
    receiverGender: peer.gender || undefined,
    receiverAge: peer.age ?? undefined,
    receiverRole: peer.role,
    isReceiverOnline: false,
    lastMessage: " ",
    lastDate: activityTs > 0 ? new Date(activityTs) : new Date(),
  }
}

interface YsalusChatListProps {
  role: ChatRole
  /** Giới hạn pill (vd patient: all, doctor). Không truyền = hiện all + patient + doctor. */
  inboxAllowedFilters?: InboxFilter[]
  currentUserId: string
  selectedReceiverId: string | null
  setSelectedChat: (value: SelectedChatType) => void
}

const ROLES_WITHOUT_INBOX_FILTERS: ChatRole[] = ["NURSE", "RECEPTIONIST"]

export function YsalusChatList({
  role,
  inboxAllowedFilters,
  currentUserId,
  selectedReceiverId,
  setSelectedChat,
}: YsalusChatListProps) {
  const visibleCategories = useMemo(() => {
    if (inboxAllowedFilters?.length) {
      return INBOX_CATEGORY_DEFS.filter((c) => inboxAllowedFilters.includes(c.filter))
    }
    return INBOX_CATEGORY_DEFS
  }, [inboxAllowedFilters])

  const showInboxCategoryFilters =
    !ROLES_WITHOUT_INBOX_FILTERS.includes(role) && visibleCategories.length > 0

  const [selectedCat, setSelectedCat] = useState<InboxFilter>("all")

  useEffect(() => {
    const first = visibleCategories[0]?.filter
    if (!first) return
    setSelectedCat((prev) => (visibleCategories.some((c) => c.filter === prev) ? prev : first))
  }, [visibleCategories])
  const [peers, setPeers] = useState<ChatPeerDto[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const pendingVersion = useSyncExternalStore(subscribeChatPending, getChatPendingVersion, () => 0)
  void pendingVersion

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

  const sortedPeers = useMemo(() => {
    void pendingVersion
    return [...peers].sort((a, b) => {
      const ta = getPeerConversationActivityTs(a.id)
      const tb = getPeerConversationActivityTs(b.id)
      if (tb !== ta) return tb - ta
      return a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" })
    })
  }, [peers, pendingVersion])

  const formatChats = useMemo(
    () => sortedPeers.map((p) => peerToSelected(p, currentUserId)),
    [sortedPeers, currentUserId, pendingVersion]
  )

  const renderCategory = (icon: ReactNode, filter: InboxFilter) => {
    return (
      <div
        key={filter}
        className={`flex items-center gap-1 py-1 px-3 rounded-full cursor-pointer ${
          selectedCat === filter
            ? "bg-brand-05 border border-brand-6 text-brand-6"
            : "bg-gray-100 text-gray-500"
        }`}
        onClick={() => setSelectedCat(filter)}
      >
        {icon}
        <span className="text-sm font-medium">{labelDisplay[filter]}</span>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 w-full relative flex flex-col overflow-hidden p-2 gap-4">
      <div className="shrink-0 flex flex-col gap-4">
        <ChatAiHighlightBanner
          isActive={selectedReceiverId === AI_ASSISTANT_RECEIVER_ID}
          onClick={() => setSelectedChat(createAiAssistantSelection(currentUserId))}
        />
        <YsalusLabel className="text-md font-semibold">Inbox</YsalusLabel>
        {loadError && <p className="text-xs text-error-400 px-1">{loadError}</p>}
        {showInboxCategoryFilters && (
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((e) => renderCategory(e.icon, e.filter))}
          </div>
        )}
      </div>
      <ul className="min-h-0 flex-1 w-full flex flex-col overflow-y-auto custom-scrollbar">
        {formatChats.map((item, index) => {
          const adminRow = isAdminReceiver(item)
          const rowSelected = selectedReceiverId === item.receiverId
          const peerPending = getPendingCountForPeer(item.receiverId)
          return (
          <li
            key={item.receiverId}
            className="flex flex-col"
            onClick={() => {
              clearChatPendingForPeer(item.receiverId)
              setSelectedChat(item)
            }}
          >
            <div
              className={`w-full flex flex-col items-start overflow-hidden gap-2 rounded-xl px-2 py-3 text-sm cursor-pointer transition-colors ${
                adminRow
                  ? rowSelected
                    ? "border border-amber-300/90 bg-gradient-to-br from-brand-05 to-amber-50/90 ring-2 ring-brand-6/35 shadow-sm"
                    : "border border-amber-200/90 bg-gradient-to-br from-amber-50/95 via-white to-amber-50/50 shadow-sm hover:border-amber-300 hover:from-amber-50"
                  : rowSelected
                    ? "bg-brand-05 ring-1 ring-brand-6/30"
                    : "hover:bg-gray-100"
              }`}
            >
              <div className="w-full flex items-start gap-2">
                <YsalusAvatar
                  src={item.receiverAvatar ? item.receiverAvatar : ""}
                  alt={item.receiverName}
                  size="large"
                  className={`flex-shrink-0 ${adminRow ? "ring-2 ring-amber-400/70 ring-offset-2 ring-offset-amber-50/80" : ""}`}
                  status={item.isReceiverOnline ? "online" : "none"}
                />
                <div className="flex-1 flex flex-col overflow-hidden items-start gap-1">
                  <div className="w-full flex items-center justify-between gap-1">
                    <span className="min-w-0 flex items-center gap-1.5">
                      {adminRow && (
                        <Shield className="size-4 shrink-0 text-amber-700" strokeWidth={2} aria-hidden />
                      )}
                      <span className={`font-semibold truncate ${adminRow ? "text-amber-950" : "text-gray-800"}`}>
                        {item.receiverName}
                      </span>
                      {peerPending > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-error-400 px-1.5 text-[10px] font-bold text-white">
                          {peerPending > 9 ? "9+" : peerPending}
                        </span>
                      )}
                      {adminRow && (
                        <span className="shrink-0 rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Admin
                        </span>
                      )}
                    </span>
                    <span className="hidden md:block text-xs whitespace-nowrap">
                      {formatDateWithSuffix(item.lastDate)}
                    </span>
                  </div>
                  {adminRow && (
                    <span className="text-xs font-medium text-amber-800/90">Kênh hỗ trợ & liên hệ quản trị</span>
                  )}
                  {!adminRow && item.receiverGender != null && item.receiverAge != null && (
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
          )
        })}
      </ul>
    </div>
  )
}

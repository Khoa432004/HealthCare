"use client"

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { ChevronLeft, Phone, Search, Sparkles, Video, X } from "lucide-react"
import { sendAiChatMessage } from "@/services/ai-chat.service"
import {
  fetchChatMessagesGrouped,
  fetchChatPeers,
  sendChatMessage,
  type ChatMessageGroupDto,
  type ChatPeerDto,
  type ChatRealtimePayload,
} from "@/services/chat-messaging.service"
import { webSocketService } from "@/services/websocket.service"
import { authService } from "@/services/auth.service"
import { formatDateWithSuffix } from "@/components/chat-ysalus/dateTime.util"
import { YsalusAvatar } from "@/components/chat-ysalus/YsalusAvatar"
import { YsalusChatInput } from "@/components/chat-ysalus/YsalusChatInput"
import { NewMessagesDivider } from "@/components/chat-ysalus/NewMessagesDivider"
import { AI_ASSISTANT_RECEIVER_ID } from "@/components/chat-ysalus/types"
import { useAiFloatingChatContext } from "@/components/ai-floating-chat-context"
import {
  clearChatPendingForPeer,
  getChatPendingVersion,
  getPeerConversationActivityTs,
  getPendingCountForPeer,
  setOpenPeerThreadForInbox,
  subscribeChatPending,
  touchPeerConversationOrder,
  totalChatPendingCount,
} from "@/lib/chat-inbox-pending"
import {
  ensureReadTailInitialized,
  getFirstUnreadOtherMessageId,
  getLastReadTailId,
  peerThreadKey,
  setLastReadTailId,
} from "@/lib/chat-read-state"
import { cn } from "@/lib/utils"

function newBubbleMsgId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const AI_BUBBLE_THREAD_KEY = "ai:bubble"

/** Icon bubble giống ysalus-web `ChatBubble` (SVG gốc). */
function YsalusBubbleChatIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6 text-white", className)}
      aria-hidden
    >
      <path
        d="M6 4.4541C5.44305 4.4541 4.90847 4.67453 4.51465 5.06836L4.37598 5.22266C4.06964 5.59639 3.90039 6.06625 3.90039 6.55371V19.3467L3.90625 19.4346C3.91922 19.5221 3.95138 19.6065 4.00098 19.6807C4.06694 19.7792 4.16093 19.856 4.27051 19.9014C4.38011 19.9467 4.50088 19.9578 4.61719 19.9346C4.70442 19.9171 4.78657 19.8807 4.85742 19.8281L4.9248 19.7705L7.77734 16.917C7.92502 16.7693 8.11915 16.6787 8.3252 16.6582L8.41406 16.6533H18C18.557 16.6533 19.0915 16.4329 19.4854 16.0391C19.8792 15.6452 20.0996 15.1107 20.0996 14.5537V6.55371C20.0996 5.99676 19.8792 5.46219 19.4854 5.06836L19.3311 4.92969C18.9573 4.62335 18.4875 4.4541 18 4.4541H6Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.2"
      />
      <path
        d="M11.066 9.31369C10.8712 9.01034 10.5832 8.77841 10.2453 8.65275C9.90743 8.5271 9.53788 8.51451 9.19221 8.61688C8.84654 8.71925 8.54343 8.93105 8.32845 9.22044C8.11346 9.50983 7.99821 9.86119 8.00002 10.2217C8.0002 10.5202 8.08055 10.8132 8.23266 11.0701C8.38478 11.327 8.60309 11.5383 8.86478 11.682C9.12647 11.8256 9.42194 11.8964 9.72032 11.8868C10.0187 11.8773 10.309 11.7878 10.561 11.6277C10.43 12.0167 10.186 12.4317 9.78402 12.8477C9.70711 12.9273 9.66495 13.0341 9.66683 13.1448C9.6687 13.2554 9.71446 13.3608 9.79402 13.4377C9.87359 13.5146 9.98045 13.5568 10.0911 13.5549C10.2017 13.553 10.3071 13.5073 10.384 13.4277C11.87 11.8877 11.677 10.2137 11.066 9.31569V9.31369ZM15.066 9.31369C14.8712 9.01034 14.5832 8.77841 14.2453 8.65275C13.9074 8.5271 13.5379 8.51451 13.1922 8.61688C12.8465 8.71925 12.5434 8.93105 12.3284 9.22044C12.1135 9.50983 11.9982 9.86119 12 10.2217C12.0002 10.5202 12.0805 10.8132 12.2327 11.0701C12.3848 11.327 12.6031 11.5383 12.8648 11.682C13.1265 11.8256 13.4219 11.8964 13.7203 11.8868C14.0187 11.8773 14.309 11.7878 14.561 11.6277C14.43 12.0167 14.186 12.4317 13.784 12.8477C13.7071 12.9273 13.665 13.0341 13.6668 13.1448C13.6687 13.2554 13.7145 13.3608 13.794 13.4377C13.8736 13.5146 13.9804 13.5568 14.0911 13.5549C14.2017 13.553 14.3071 13.5073 14.384 13.4277C15.87 11.8877 15.677 10.2137 15.066 9.31569V9.31369Z"
        fill="#0D6171"
      />
    </svg>
  )
}

type BubbleView = "inbox" | "ai" | "peer"

type AiMsg = { id: string; from: "me" | "bot"; text: string; at: number }

type PeerLine = { id: string; content: string; creatorId: string; createdAt: string }

type PeerDayBlock = { dayKey: string; dateLabel: string; messages: PeerLine[] }

function flattenGroups(groups: ChatMessageGroupDto[]): PeerLine[] {
  const out: PeerLine[] = []
  for (const g of groups) {
    for (const m of g.messages) {
      out.push({
        id: m.id,
        content: m.content,
        creatorId: m.creator.id,
        createdAt: typeof m.createdAt === "string" ? m.createdAt : String(m.createdAt),
      })
    }
  }
  return out.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

function dayKeyFromIso(iso: string) {
  try {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  } catch {
    return iso
  }
}

function groupPeerLinesByDay(lines: PeerLine[]): PeerDayBlock[] {
  if (lines.length === 0) return []
  const byDay = new Map<string, PeerLine[]>()
  for (const m of lines) {
    const dk = dayKeyFromIso(m.createdAt)
    if (!byDay.has(dk)) byDay.set(dk, [])
    byDay.get(dk)!.push(m)
  }
  const keys = [...byDay.keys()].sort((a, b) => a.localeCompare(b))
  return keys.map((dk) => {
    const msgs = byDay.get(dk)!
    const first = msgs[0]!
    return {
      dayKey: dk,
      dateLabel: formatDateWithSuffix(new Date(first.createdAt)),
      messages: msgs,
    }
  })
}

function aiMessageGroups(messages: AiMsg[]): AiMsg[][] {
  const out: AiMsg[][] = []
  for (const m of messages) {
    const last = out[out.length - 1]
    if (!last || last[0]!.from !== m.from) out.push([m])
    else last.push(m)
  }
  return out
}

function isSameThreadWs(payload: ChatRealtimePayload, me: string, peerId: string) {
  return (
    (payload.senderId === me && payload.receiverId === peerId) ||
    (payload.senderId === peerId && payload.receiverId === me)
  )
}

function peerRoleLabel(role: ChatPeerDto["role"]) {
  if (role === "ADMIN") return "Quản trị viên"
  if (role === "DOCTOR") return "Bác sĩ"
  return "Liên hệ"
}

export default function ChatWidget() {
  const { suppressed } = useAiFloatingChatContext()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<BubbleView>("inbox")
  const [searchQuery, setSearchQuery] = useState("")

  const [peers, setPeers] = useState<ChatPeerDto[]>([])
  const [peersLoading, setPeersLoading] = useState(false)

  const [selectedPeer, setSelectedPeer] = useState<ChatPeerDto | null>(null)
  const [peerLines, setPeerLines] = useState<PeerLine[]>([])
  const [peerLoadError, setPeerLoadError] = useState<string | null>(null)
  const [peerSending, setPeerSending] = useState(false)

  const [aiMessages, setAiMessages] = useState<AiMsg[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [peerReadEpoch, setPeerReadEpoch] = useState(0)
  const [aiReadEpoch, setAiReadEpoch] = useState(0)
  const [aiBubbleUnread, setAiBubbleUnread] = useState(0)
  const lastBubbleBotIdRef = useRef<string | null>(null)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLUListElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const userId = authService.getUserInfo()?.id ?? null

  const pendingVersion = useSyncExternalStore(subscribeChatPending, getChatPendingVersion, () => 0)
  void pendingVersion
  const wsPendingTotal = totalChatPendingCount()

  const selectedPeerRef = useRef<ChatPeerDto | null>(null)
  selectedPeerRef.current = selectedPeer

  const toggle = useCallback(() => {
    setOpen((v) => !v)
  }, [])

  useEffect(() => {
    if (!open) {
      setView("inbox")
      setSelectedPeer(null)
      setPeerLines([])
      setPeerLoadError(null)
      setSearchQuery("")
    }
  }, [open])

  useEffect(() => {
    if (open && view === "peer" && selectedPeer) {
      setOpenPeerThreadForInbox(selectedPeer.id)
      clearChatPendingForPeer(selectedPeer.id)
    } else {
      setOpenPeerThreadForInbox(null)
    }
  }, [open, view, selectedPeer?.id])

  useEffect(() => {
    if (open && view === "ai") setAiBubbleUnread(0)
  }, [open, view])

  useEffect(() => {
    const last = aiMessages[aiMessages.length - 1]
    if (!last || last.from !== "bot") return
    if (last.id === lastBubbleBotIdRef.current) return
    if (open && view === "ai") {
      lastBubbleBotIdRef.current = last.id
      return
    }
    lastBubbleBotIdRef.current = last.id
    setAiBubbleUnread((n) => n + 1)
  }, [aiMessages, open, view])

  useEffect(() => {
    if (!open || !userId) {
      if (!open) setPeers([])
      return
    }
    let cancelled = false
    ;(async () => {
      setPeersLoading(true)
      try {
        const data = await fetchChatPeers()
        if (!cancelled) setPeers(data)
      } catch {
        if (!cancelled) setPeers([])
      } finally {
        if (!cancelled) setPeersLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, userId])

  useEffect(() => {
    if (!open || view !== "peer" || !selectedPeer || !userId) return
    let cancelled = false
    setPeerLoadError(null)
    ;(async () => {
      try {
        const groups = await fetchChatMessagesGrouped(selectedPeer.id, userId)
        if (!cancelled) setPeerLines(flattenGroups(groups))
      } catch (e) {
        if (!cancelled) {
          setPeerLines([])
          setPeerLoadError(e instanceof Error ? e.message : "Không tải được tin nhắn")
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, view, selectedPeer, userId])

  useEffect(() => {
    if (!open || view !== "peer" || !userId) return
    const peerId = selectedPeerRef.current?.id
    if (!peerId) return
    webSocketService.connect()
    const dest = `/topic/chat/${userId}`
    const unsub = webSocketService.subscribe(dest, (payload: ChatRealtimePayload) => {
      const openPeer = selectedPeerRef.current
      if (!openPeer || !isSameThreadWs(payload, userId, openPeer.id)) return
      setPeerLines((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev
        const line: PeerLine = {
          id: payload.id,
          content: payload.content,
          creatorId: payload.senderId,
          createdAt: new Date().toISOString(),
        }
        return [...prev, line].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      })
    })
    return unsub
  }, [open, view, userId])

  useEffect(() => {
    if (!open) return
    if (view === "inbox") searchInputRef.current?.focus()
  }, [open, view])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [view, aiMessages, peerLines, open])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return
      const t = e.target as Node
      if (panelRef.current?.contains(t) || buttonRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  const filteredPeers = useMemo(() => {
    void pendingVersion
    const q = searchQuery.trim().toLowerCase()
    const base = !q ? peers : peers.filter((p) => p.fullName.toLowerCase().includes(q))
    return [...base].sort((a, b) => {
      const ta = getPeerConversationActivityTs(a.id)
      const tb = getPeerConversationActivityTs(b.id)
      if (tb !== ta) return tb - ta
      return a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" })
    })
  }, [peers, searchQuery, pendingVersion])

  const showAiInList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return ["ai", "trợ", "tro", "assistant", "trợ lý", "tro ly"].some((k) => q.includes(k))
  }, [searchQuery])

  const peerDayBlocks = useMemo(() => groupPeerLinesByDay(peerLines), [peerLines])

  const peerFlatRead = useMemo(() => {
    return [...peerLines]
      .map((m) => ({
        id: m.id,
        creatorId: m.creatorId,
        createdAt: new Date(m.createdAt).getTime(),
      }))
      .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
  }, [peerLines])

  useEffect(() => {
    if (!userId || !selectedPeer || view !== "peer") return
    if (peerFlatRead.length === 0) return
    const key = peerThreadKey(selectedPeer.id)
    ensureReadTailInitialized(userId, key, peerFlatRead)
    setPeerReadEpoch((e) => e + 1)
  }, [userId, selectedPeer?.id, view, peerFlatRead])

  const firstPeerUnreadId = useMemo(() => {
    if (!userId || !selectedPeer) return null
    const tail = getLastReadTailId(userId, peerThreadKey(selectedPeer.id))
    return getFirstUnreadOtherMessageId(peerFlatRead, userId, tail)
  }, [userId, selectedPeer, peerFlatRead, peerReadEpoch])

  const peerMarkTailIfNearBottom = useCallback(() => {
    if (!userId || !selectedPeer || !scrollRef.current || peerFlatRead.length === 0) return
    const el = scrollRef.current
    const key = peerThreadKey(selectedPeer.id)
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      const latestId = peerFlatRead[peerFlatRead.length - 1]!.id
      if (getLastReadTailId(userId, key) !== latestId) {
        setLastReadTailId(userId, key, latestId)
        setPeerReadEpoch((e) => e + 1)
      }
    }
  }, [userId, selectedPeer, peerFlatRead])

  useEffect(() => {
    if (view !== "peer") return
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", peerMarkTailIfNearBottom, { passive: true })
    const id = requestAnimationFrame(() => peerMarkTailIfNearBottom())
    return () => {
      cancelAnimationFrame(id)
      el.removeEventListener("scroll", peerMarkTailIfNearBottom)
    }
  }, [view, peerMarkTailIfNearBottom, peerLines.length])

  const aiFlatRead = useMemo(() => {
    if (!userId) return [] as { id: string; creatorId: string; createdAt: number }[]
    return [...aiMessages]
      .map((m) => ({
        id: m.id,
        creatorId: m.from === "me" ? userId : AI_ASSISTANT_RECEIVER_ID,
        createdAt: m.at,
      }))
      .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
  }, [aiMessages, userId])

  useEffect(() => {
    if (!userId || view !== "ai") return
    if (aiFlatRead.length === 0) return
    ensureReadTailInitialized(userId, AI_BUBBLE_THREAD_KEY, aiFlatRead)
    setAiReadEpoch((e) => e + 1)
  }, [userId, view, aiFlatRead])

  const firstAiUnreadId = useMemo(() => {
    if (!userId) return null
    const tail = getLastReadTailId(userId, AI_BUBBLE_THREAD_KEY)
    return getFirstUnreadOtherMessageId(aiFlatRead, userId, tail)
  }, [userId, aiFlatRead, aiReadEpoch])

  const aiMarkTailIfNearBottom = useCallback(() => {
    if (!userId || !scrollRef.current || aiFlatRead.length === 0) return
    const el = scrollRef.current
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      const latestId = aiFlatRead[aiFlatRead.length - 1]!.id
      if (getLastReadTailId(userId, AI_BUBBLE_THREAD_KEY) !== latestId) {
        setLastReadTailId(userId, AI_BUBBLE_THREAD_KEY, latestId)
        setAiReadEpoch((e) => e + 1)
      }
    }
  }, [userId, aiFlatRead])

  useEffect(() => {
    if (view !== "ai") return
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", aiMarkTailIfNearBottom, { passive: true })
    const id = requestAnimationFrame(() => aiMarkTailIfNearBottom())
    return () => {
      cancelAnimationFrame(id)
      el.removeEventListener("scroll", aiMarkTailIfNearBottom)
    }
  }, [view, aiMarkTailIfNearBottom, aiMessages.length])

  const sendAi = useCallback(async (raw: string) => {
    const text = raw.trim()
    if (!text || aiLoading) return
    const userMsg: AiMsg = { id: newBubbleMsgId(), from: "me", text, at: Date.now() }
    setAiMessages((prev) => [...prev, userMsg])
    setAiLoading(true)
    try {
      const reply = await sendAiChatMessage(text)
      setAiMessages((prev) => [
        ...prev,
        { id: newBubbleMsgId(), from: "bot", text: reply, at: Date.now() },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gửi tin thất bại"
      setAiMessages((prev) => [...prev, { id: newBubbleMsgId(), from: "bot", text: msg, at: Date.now() }])
    } finally {
      setAiLoading(false)
    }
  }, [aiLoading])

  const sendPeer = useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || peerSending || !selectedPeer || !userId) return
      setPeerSending(true)
      try {
        const id = await sendChatMessage(selectedPeer.id, text, userId)
        setPeerLines((prev) => {
          if (prev.some((m) => m.id === id)) return prev
          return [
            ...prev,
            {
              id,
              content: text,
              creatorId: userId,
              createdAt: new Date().toISOString(),
            },
          ]
        })
        touchPeerConversationOrder(selectedPeer.id)
      } catch (e) {
        setPeerLoadError(e instanceof Error ? e.message : "Gửi thất bại")
      } finally {
        setPeerSending(false)
      }
    },
    [peerSending, selectedPeer, userId]
  )

  if (suppressed) return null

  const threadHeader = (opts: {
    title: string
    avatar: ReactNode
    showCallButtons?: boolean
    onBack: () => void
  }) => (
    <div className="flex shrink-0 items-center justify-between p-2">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <button
          type="button"
          className="shrink-0 cursor-pointer rounded-full p-1 text-gray-500 transition hover:bg-gray-100"
          aria-label="Quay lại danh sách"
          onClick={opts.onBack}
        >
          <ChevronLeft className="size-4" />
        </button>
        {opts.avatar}
        <span className="truncate text-sm font-semibold text-gray-800">{opts.title}</span>
      </div>
      {opts.showCallButtons ? (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled
            title="Gọi thoại (sắp có)"
            className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-brand-7 bg-brand-05 opacity-50"
            aria-hidden
          >
            <Phone className="size-5 text-brand-7" />
          </button>
          <button
            type="button"
            disabled
            title="Gọi video (sắp có)"
            className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-brand-7 bg-brand-05 opacity-50"
            aria-hidden
          >
            <Video className="size-5 text-brand-7" />
          </button>
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="fixed bottom-6 right-6 z-[100]" aria-live="polite">
      <div className="relative flex flex-col items-end">
        {open && (
          <div
            ref={panelRef}
            className="absolute bottom-14 right-0 z-[101] flex max-h-[min(480px,75vh)] w-[min(100vw-2rem,450px)] min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xl"
          >
            {view === "inbox" && (
              <div className="flex min-h-0 flex-1 flex-col p-2">
                <div className="flex shrink-0 items-center justify-between overflow-hidden px-2 py-4">
                  <h5 className="text-base font-semibold text-gray-800">{formatDateWithSuffix(new Date())}</h5>
                  <button
                    type="button"
                    className="cursor-pointer text-gray-500 transition hover:text-gray-800"
                    aria-label="Đóng"
                    onClick={() => setOpen(false)}
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="m-2 flex shrink-0 items-center gap-2 rounded-3xl bg-gray-100 px-3 py-2 text-sm text-gray-900">
                  <Search className="size-5 shrink-0 text-gray-500" aria-hidden />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm trong danh sách…"
                    className="min-w-0 flex-1 bg-transparent placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
                <ul className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
                  {showAiInList && (
                    <li className="flex flex-col">
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-3 text-sm hover:bg-gray-100"
                        onClick={() => setView("ai")}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-05 ring-1 ring-brand-1">
                          <Sparkles className="size-5 text-brand-6" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden text-left">
                          <p className="mb-1 block font-semibold text-gray-800">Trợ lý AI</p>
                          <div className="flex items-center justify-between gap-2">
                            <p className="flex-1 truncate text-sm text-gray-500">Gợi ý nhanh, hỏi đáp chung</p>
                          </div>
                        </div>
                      </button>
                      <hr className="border-indicator" />
                    </li>
                  )}
                  {!userId && (
                    <li className="px-2 py-2 text-xs text-gray-500">
                      Đăng nhập để xem danh sách chat với bác sĩ / quản trị.
                    </li>
                  )}
                  {userId && peersLoading && (
                    <li className="px-2 py-4 text-center text-xs text-gray-500">Đang tải danh sách…</li>
                  )}
                  {userId &&
                    !peersLoading &&
                    filteredPeers.map((p, index) => {
                      const rowPending = getPendingCountForPeer(p.id)
                      return (
                      <li key={p.id} className="flex flex-col">
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-3 text-sm hover:bg-gray-100"
                          onClick={() => {
                            clearChatPendingForPeer(p.id)
                            setSelectedPeer(p)
                            setView("peer")
                          }}
                        >
                          <YsalusAvatar src={p.avatarUrl ?? ""} alt={p.fullName} size="medium" status="none" />
                          <div className="min-w-0 flex-1 overflow-hidden text-left">
                            <div className="mb-1 flex items-center gap-2">
                              <p className="block min-w-0 flex-1 truncate font-semibold text-gray-800">{p.fullName}</p>
                              {rowPending > 0 ? (
                                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-error-400 px-1.5 text-[10px] font-bold text-white">
                                  {rowPending > 9 ? "9+" : rowPending}
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="flex-1 truncate text-sm text-gray-500">{peerRoleLabel(p.role)}</p>
                            </div>
                          </div>
                        </button>
                        {index < filteredPeers.length - 1 ? <hr className="border-indicator" /> : null}
                      </li>
                      )
                    })}
                  {userId &&
                    !peersLoading &&
                    filteredPeers.length === 0 &&
                    (searchQuery.trim() ? (
                      <li className="px-2 py-4 text-center text-xs text-gray-500">Không có liên hệ khớp tìm kiếm.</li>
                    ) : (
                      <li className="px-2 py-4 text-center text-xs text-gray-500">
                        Chưa có bác sĩ hoặc liên hệ nào từ hệ thống.
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {view === "ai" && (
              <div className="flex min-h-0 flex-1 flex-col p-2">
                {threadHeader({
                  title: "Trợ lý AI",
                  showCallButtons: false,
                  onBack: () => setView("inbox"),
                  avatar: (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-05 ring-1 ring-brand-1">
                      <Sparkles className="size-5 text-brand-6" aria-hidden />
                    </div>
                  ),
                })}
                <ul
                  ref={scrollRef}
                  className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-2"
                >
                  {aiMessages.length === 0 && (
                    <li className="text-center text-xs text-gray-400">
                      Hỏi về lịch khám, ứng dụng, hoặc câu hỏi chung — tin nhắn xử lý bởi AI.
                    </li>
                  )}
                  {aiMessageGroups(aiMessages).map((grp, gi) => (
                    <li key={`ai-g-${gi}`} className="flex flex-col gap-2">
                      {grp[0]?.from === "bot" ? (
                        <p className="text-xs font-medium text-gray-500">Trợ lý AI</p>
                      ) : null}
                      {grp.map((m) => (
                        <div key={m.id} className="flex w-full flex-col gap-1">
                          {m.id === firstAiUnreadId ? <NewMessagesDivider /> : null}
                          <div
                            className={cn(
                              "flex w-full",
                              m.from === "me" ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[80%] whitespace-pre-wrap break-words p-2 text-sm font-medium text-gray-900",
                                "rounded-xl",
                                m.from === "me"
                                  ? "rounded-br-none bg-brand-1"
                                  : "rounded-bl-none bg-gray-100"
                              )}
                            >
                              {m.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
                <YsalusChatInput
                  className="shrink-0 border-t border-gray-100 !p-2"
                  placeholder="Nhập tin nhắn…"
                  onSend={(c) => void sendAi(c)}
                  disabled={aiLoading}
                  isMultiple={false}
                />
              </div>
            )}

            {view === "peer" && selectedPeer && userId && (
              <div className="flex min-h-0 flex-1 flex-col p-2">
                {threadHeader({
                  title: selectedPeer.fullName,
                  showCallButtons: true,
                  onBack: () => {
                    setView("inbox")
                    setSelectedPeer(null)
                    setPeerLines([])
                  },
                  avatar: (
                    <YsalusAvatar
                      src={selectedPeer.avatarUrl ?? ""}
                      alt={selectedPeer.fullName}
                      size="medium"
                      status="none"
                    />
                  ),
                })}
                <ul
                  ref={scrollRef}
                  className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-2"
                >
                  {peerLoadError && (
                    <li className="text-center text-xs text-error-400">{peerLoadError}</li>
                  )}
                  {!peerLoadError && peerLines.length === 0 && (
                    <li className="text-center text-xs text-gray-500">Chưa có tin nhắn. Gửi tin bên dưới.</li>
                  )}
                  {!peerLoadError &&
                    peerDayBlocks.map((block) => (
                      <li key={block.dayKey} className="flex flex-col gap-2">
                        <p className="text-center text-xs text-gray-400">{block.dateLabel}</p>
                        {block.messages.map((m, i) => {
                          const isMe = m.creatorId === userId
                          const prev = i > 0 ? block.messages[i - 1]! : null
                          const showPeerName = !isMe && (!prev || prev.creatorId !== m.creatorId)
                          return (
                            <div key={m.id} className="flex flex-col gap-1">
                              {showPeerName ? (
                                <p className="text-xs font-medium text-gray-500">{selectedPeer.fullName}</p>
                              ) : null}
                              {m.id === firstPeerUnreadId ? <NewMessagesDivider /> : null}
                              <div className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                <div
                                  className={cn(
                                    "max-w-[80%] whitespace-pre-wrap break-words p-2 text-sm font-medium text-gray-900",
                                    "rounded-xl",
                                    isMe ? "rounded-br-none bg-brand-1" : "rounded-bl-none bg-gray-100"
                                  )}
                                >
                                  {m.content}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </li>
                    ))}
                </ul>
                <YsalusChatInput
                  className="shrink-0 border-t border-gray-100 !p-2"
                  placeholder="Nhập tin nhắn…"
                  onSend={(c) => void sendPeer(c)}
                  disabled={peerSending}
                  isMultiple={false}
                />
              </div>
            )}
          </div>
        )}

        <button
          ref={buttonRef}
          type="button"
          title={open ? "Đóng" : "Chat nhanh"}
          aria-expanded={open}
          onClick={toggle}
          className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand-7 text-white shadow-md transition hover:bg-brand-6 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-6 focus-visible:ring-offset-2"
        >
          {(wsPendingTotal > 0 || aiBubbleUnread > 0) && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error-400 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {wsPendingTotal + aiBubbleUnread > 9 ? "9+" : wsPendingTotal + aiBubbleUnread}
            </span>
          )}
          <YsalusBubbleChatIcon />
        </button>
      </div>
    </div>
  )
}

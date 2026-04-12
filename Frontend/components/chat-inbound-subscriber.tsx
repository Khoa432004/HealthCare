"use client"

import { useEffect, useState } from "react"
import { STORAGE_KEYS } from "@/lib/api-config"
import { authService } from "@/services/auth.service"
import { webSocketService } from "@/services/websocket.service"
import { incrementChatPendingIfNeeded, touchPeerConversationOrder } from "@/lib/chat-inbox-pending"
import type { ChatRealtimePayload } from "@/services/chat-messaging.service"

/** Một subscription STOMP `/topic/chat/{userId}` — badge/pending realtime. */
export function ChatInboundSubscriber() {
  const [userId, setUserId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : (authService.getUserInfo()?.id ?? null)
  )

  /** Đăng nhập cùng tab không gửi `storage` — cần poll / focus / tab khác. */
  useEffect(() => {
    const readId = () => authService.getUserInfo()?.id ?? null

    const sync = () => {
      setUserId((prev) => {
        const next = readId()
        return prev === next ? prev : next
      })
    }

    sync()

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === STORAGE_KEYS.USER_INFO || e.key === STORAGE_KEYS.ACCESS_TOKEN) {
        sync()
      }
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("focus", sync)
    document.addEventListener("visibilitychange", sync)

    const interval = window.setInterval(sync, 2000)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("focus", sync)
      document.removeEventListener("visibilitychange", sync)
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    webSocketService.connect()
    const dest = `/topic/chat/${userId}`
    return webSocketService.subscribe(dest, (payload: ChatRealtimePayload) => {
      if (!payload || typeof payload !== "object") return
      const otherPeerId =
        payload.senderId === userId ? payload.receiverId : payload.senderId
      if (otherPeerId && otherPeerId !== userId) {
        touchPeerConversationOrder(otherPeerId)
      }
      if (payload.receiverId !== userId) return
      incrementChatPendingIfNeeded(payload.senderId, userId, payload.id)
    })
  }, [userId])

  /** Khi quay lại tab, thử bắt lại socket (sleep/mobile hay đứt mạng). */
  useEffect(() => {
    if (!userId) return
    const onVis = () => {
      if (document.visibilityState === "visible") {
        webSocketService.connect()
      }
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [userId])

  return null
}

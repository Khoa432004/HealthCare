import type { ChatMessagesGroupByDate } from "@/components/chat-ysalus/types"

const PREFIX = "healthcare:chatRead:v1"

export function readThreadStorageKey(meId: string, threadKey: string) {
  return `${PREFIX}:${meId}:${threadKey}`
}

/** Cursor = id tin **mới nhất** đã xem (mọi tin sau mốc này là “mới” nếu từ đối phương/AI). */
export function getLastReadTailId(meId: string, threadKey: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(readThreadStorageKey(meId, threadKey))
    if (!raw) return null
    const o = JSON.parse(raw) as { tailId?: string }
    return typeof o.tailId === "string" ? o.tailId : null
  } catch {
    return null
  }
}

export function setLastReadTailId(meId: string, threadKey: string, tailId: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(readThreadStorageKey(meId, threadKey), JSON.stringify({ tailId }))
  } catch {
    /* quota / private mode */
  }
}

export function peerThreadKey(peerId: string) {
  return `peer:${peerId}`
}

export function flattenChatAscending(groups: ChatMessagesGroupByDate[]) {
  const all: { id: string; creatorId: string; createdAt: number }[] = []
  for (const g of groups) {
    for (const m of g.messages) {
      const createdAt = typeof m.createdAt === "number" ? m.createdAt : Date.now()
      all.push({ id: m.id, creatorId: m.creator.id, createdAt })
    }
  }
  all.sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
  return all
}

/** Khởi tạo mốc đọc = tin cuối (lần đầu mở thread, không coi cả lịch sử là “mới”). */
export function ensureReadTailInitialized(
  meId: string,
  threadKey: string,
  flat: { id: string }[]
) {
  if (flat.length === 0) return
  const tail = getLastReadTailId(meId, threadKey)
  if (!tail) {
    setLastReadTailId(meId, threadKey, flat[flat.length - 1]!.id)
    return
  }
  const idx = flat.findIndex((m) => m.id === tail)
  if (idx < 0) {
    setLastReadTailId(meId, threadKey, flat[flat.length - 1]!.id)
  }
}

/** Id tin đầu tiên từ “đối phương” (khác meId) nằm sau tail trong timeline; null = không có tin mới. */
export function getFirstUnreadOtherMessageId(
  flat: { id: string; creatorId: string }[],
  meId: string,
  tailId: string | null
): string | null {
  if (!tailId || flat.length === 0) return null
  const idx = flat.findIndex((m) => m.id === tailId)
  if (idx < 0) return null
  for (let j = idx + 1; j < flat.length; j++) {
    if (flat[j]!.creatorId !== meId) return flat[j]!.id
  }
  return null
}

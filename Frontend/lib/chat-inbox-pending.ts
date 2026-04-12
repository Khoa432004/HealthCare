/**
 * Đếm tin đến (WS) khi user không đang mở thread với người gửi — dùng badge inbox + bubble.
 * Không persist: F5 reset (chấp nhận được; tin “đã đọc” vẫn theo chat-read-state).
 */

const listeners = new Set<() => void>()
let version = 0
const pending: Record<string, number> = {}

/** Thời điểm có hoạt động chat gần nhất với từng peer — dùng sort inbox (mới nhất lên đầu). */
const peerConversationActivity: Record<string, number> = {}

/** Tránh đếm trùng nếu STOMP gửi lặp cùng một message id. */
const seenInboundMessageIds = new Set<string>()

/** Peer đang mở thread (màn chat module hoặc bubble peer); null = không có thread peer đang xem. */
let openPeerThreadId: string | null = null

function emit() {
  version++
  listeners.forEach((l) => l())
}

export function subscribeChatPending(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getChatPendingVersion() {
  return version
}

export function getPendingCountForPeer(peerId: string) {
  return pending[peerId] ?? 0
}

export function getPeerConversationActivityTs(peerId: string) {
  return peerConversationActivity[peerId] ?? 0
}

/** Gọi khi có tin gửi/nhận với peer (WS hoặc gửi thành công) để đẩy hàng lên đầu inbox. */
export function touchPeerConversationOrder(peerId: string) {
  if (!peerId) return
  peerConversationActivity[peerId] = Date.now()
  emit()
}

export function totalChatPendingCount() {
  return Object.values(pending).reduce((a, b) => a + b, 0)
}

export function setOpenPeerThreadForInbox(peerId: string | null) {
  openPeerThreadId = peerId
}

export function incrementChatPendingIfNeeded(senderId: string, meId: string, messageId?: string) {
  if (!senderId || senderId === meId) return
  if (senderId === openPeerThreadId) return
  if (messageId) {
    if (seenInboundMessageIds.has(messageId)) return
    seenInboundMessageIds.add(messageId)
    if (seenInboundMessageIds.size > 400) {
      seenInboundMessageIds.clear()
    }
  }
  pending[senderId] = (pending[senderId] ?? 0) + 1
  emit()
}

export function clearChatPendingForPeer(peerId: string) {
  if (!pending[peerId]) return
  delete pending[peerId]
  emit()
}

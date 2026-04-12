import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"

export interface ChatPeerDto {
  id: string
  fullName: string
  gender: string
  age: number | null
  avatarUrl: string | null
}

export interface ChatMessageCreatorDto {
  id: string
  fullName?: string
  gender?: string
}

export interface ChatMessageItemDto {
  id: string
  content: string
  type: string
  creator: ChatMessageCreatorDto
  createdAt: string
}

export interface ChatMessageGroupDto {
  date: string
  messages: ChatMessageItemDto[]
}

export interface ChatRealtimePayload {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: string
}

export async function fetchChatPeers(): Promise<ChatPeerDto[]> {
  const res = (await apiClient.get<{ success: boolean; data: ChatPeerDto[] }>(API_ENDPOINTS.CHAT.PEERS)) as {
    success: boolean
    data: ChatPeerDto[]
  }
  if (!res?.success || !Array.isArray(res.data)) return []
  return res.data
}

export async function fetchChatMessagesGrouped(receiverId: string, senderId: string): Promise<ChatMessageGroupDto[]> {
  const res = (await apiClient.post<{ success: boolean; data: ChatMessageGroupDto[] }>(
    API_ENDPOINTS.CHAT.MESSAGES_GROUP_BY_DATE,
    { receiverId, senderId }
  )) as { success: boolean; data: ChatMessageGroupDto[] }
  if (!res?.success || !Array.isArray(res.data)) return []
  return res.data
}

export async function sendChatMessage(receiverId: string, content: string, senderId: string): Promise<string> {
  const res = (await apiClient.post<{ success: boolean; data: { id: string } }>(API_ENDPOINTS.CHAT.MESSAGES, {
    receiverId,
    content,
    type: "text",
    senderId,
  })) as { success: boolean; data: { id: string } }
  if (!res?.success || !res.data?.id) throw new Error("Send message failed")
  return res.data.id
}

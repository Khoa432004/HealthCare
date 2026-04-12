export type SelectedChatType = {
  senderId: string
  receiverId: string
  receiverName: string
  receiverAvatar: string | null
  receiverGender?: string
  receiverAge?: number
  /** ADMIN | DOCTOR | … — từ API peers */
  receiverRole?: string
  isReceiverOnline: boolean
  lastMessage: string
  lastDate: Date
}

/** Virtual peer id — không gọi API chat 1-1 với id này. */
export const AI_ASSISTANT_RECEIVER_ID = "__healthcare_ai_assistant__"

export function isAiAssistantChat(chat: SelectedChatType): boolean {
  return chat.receiverId === AI_ASSISTANT_RECEIVER_ID
}

export function isAdminReceiver(chat: SelectedChatType): boolean {
  return chat.receiverRole?.toUpperCase() === "ADMIN"
}

export function createAiAssistantSelection(senderId: string): SelectedChatType {
  return {
    senderId,
    receiverId: AI_ASSISTANT_RECEIVER_ID,
    receiverName: "Trợ lý AI",
    receiverAvatar: null,
    isReceiverOnline: true,
    lastMessage: " ",
    lastDate: new Date(),
  }
}

export type ChatMessageType = "text" | "image" | "video" | "mix"

export type ChatMessageResponse = {
  id: string
  content: string
  type: ChatMessageType
  creator: { id: string }
  createdAt: Date | number
}

export type ChatMessagesGroupByDate = {
  date: string
  messages: ChatMessageResponse[]
}

export type SelectedChatType = {
  senderId: string
  receiverId: string
  receiverName: string
  receiverAvatar: string | null
  receiverGender?: string
  receiverAge?: number
  isReceiverOnline: boolean
  lastMessage: string
  lastDate: Date
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

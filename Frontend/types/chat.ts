export type ChatRole = "ADMIN" | "DOCTOR" | "PATIENT" | "NURSE" | "RECEPTIONIST"

export type ConversationParticipantType = "patient" | "doctor" | "nurse" | "receptionist" | "admin" | "ysalus"

export interface Conversation {
  id: string
  participantName: string
  participantType: ConversationParticipantType
  /** e.g. "ID1234 • Female • 21 y.o." or "Cardiology" */
  subtitle?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount?: number
  isPinned?: boolean
  isOnline?: boolean
  avatarUrl?: string
}

export interface Message {
  id: string
  senderId: string
  senderName?: string
  senderRole?: string
  senderSpecialty?: string
  content: string
  time: string
  isOwn: boolean
  isOnline?: boolean
  /** File attachment info */
  attachment?: { name: string; size: string }
}

export type InboxFilter = "all" | "patient" | "doctor" | "nurse" | "receptionist"

export const INBOX_FILTERS: { id: InboxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "patient", label: "Patient" },
  { id: "doctor", label: "Doctor" },
  { id: "nurse", label: "Nurse" },
  { id: "receptionist", label: "Receptionist" },
]

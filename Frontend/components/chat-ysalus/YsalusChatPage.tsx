"use client"

import { useEffect, useState } from "react"
import { YsalusChatList } from "./YsalusChatList"
import { YsalusChatContent } from "./YsalusChatContent"
import type { SelectedChatType } from "./types"
import type { ChatRole, InboxFilter } from "@/types/chat"
import { authService } from "@/services/auth.service"

interface YsalusChatPageProps {
  role: ChatRole
  inboxAllowedFilters?: InboxFilter[]
}

export function YsalusChatPage({ role, inboxAllowedFilters }: YsalusChatPageProps) {
  const [selectedChat, setSelectedChat] = useState<SelectedChatType | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const u = authService.getUserInfo()
    setCurrentUserId(u?.id ?? null)
    setSelectedChat(null)
  }, [role])

  if (!currentUserId) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-gray-500 p-4">
        Sign in to use chat.
      </div>
    )
  }

  return (
    <>
      <div className="h-full w-full hidden md:grid grid-cols-6 rounded-2xl overflow-hidden">
        <div className="h-full min-h-0 col-span-6 md:col-span-2 border border-r-0 border-brand-1 rounded-l-2xl bg-gradient-to-br from-brand-05 via-brand-1 to-brand-05 overflow-auto py-2">
          <YsalusChatList
            role={role}
            inboxAllowedFilters={inboxAllowedFilters}
            currentUserId={currentUserId}
            selectedReceiverId={selectedChat?.receiverId ?? null}
            setSelectedChat={setSelectedChat}
          />
        </div>
        <div className="hidden md:block col-span-4 bg-white overflow-auto">
          {selectedChat && (
            <YsalusChatContent
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              currentUserId={currentUserId}
            />
          )}
        </div>
      </div>
      <div className="h-full w-full block md:hidden rounded-2xl overflow-hidden">
        {selectedChat === null ? (
          <div className="h-full min-h-0 border border-brand-1 rounded-2xl bg-gradient-to-br from-brand-05 via-brand-1 to-brand-05 overflow-auto py-2">
            <YsalusChatList
              role={role}
              inboxAllowedFilters={inboxAllowedFilters}
              currentUserId={currentUserId}
              selectedReceiverId={null}
              setSelectedChat={setSelectedChat}
            />
          </div>
        ) : (
          <div className="h-full bg-white overflow-auto">
            <YsalusChatContent
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </div>
    </>
  )
}

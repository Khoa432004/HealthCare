"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MessageSquare, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DoctorUserMenu } from "@/components/doctor-user-menu"
import DoctorSidebar from "@/components/doctor-sidebar"
import { PageHeaderTitleRow } from "@/components/page-header-title-row"
import { ChatLayout } from "@/components/chat"
import { authService } from "@/services/auth.service"
import { AuthGuard } from "@/components/auth-guard"
import { SuppressAiFloatingChat } from "@/components/ai-floating-chat-context"
import type { InboxFilter } from "@/types/chat"

function DoctorChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        fullName: user.fullName || "Doctor",
        role: user.role || "DOCTOR",
      })
    }
  }, [])

  const getInitials = (name: string): string => {
    if (!name) return "DR"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      authService.clearAuthData()
      router.push("/login")
    }
  }

  const allowedFilters: InboxFilter[] = ["all", "patient"]
  const initialReceiverId = searchParams.get("peerId")

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#E8F5F1" }}>
      <SuppressAiFloatingChat />
      <DoctorSidebar />

      <div className="flex-1 flex flex-col overflow-hidden" style={{ paddingTop: "12px" }}>
        <header
          className="bg-white py-3 mx-3 mb-3 flex-shrink-0"
          style={{ borderRadius: "14px", paddingLeft: "24px", paddingRight: "20px" }}
        >
          <div className="flex items-center justify-between">
            <PageHeaderTitleRow
              role="doctor"
              icon={MessageSquare}
              title="Chats"
              iconClassName="text-[#007A94]"
              titleClassName="text-lg"
            />

            <div className="flex items-center space-x-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 bg-gray-50 border-gray-200 h-9 text-sm"
                />
              </div>
              <NotificationBell />
              <DoctorUserMenu userInfo={userInfo} />
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0 px-3 pb-3">
          <ChatLayout
            role="DOCTOR"
            showNeedHelpBanner={false}
            allowedFilters={allowedFilters}
            initialReceiverId={initialReceiverId}
          />
        </main>
      </div>
    </div>
  )
}

export default function DoctorChatPage() {
  return (
    <AuthGuard allowedRoles={["DOCTOR"]}>
      <DoctorChatContent />
    </AuthGuard>
  )
}

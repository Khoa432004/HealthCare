"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MessageSquare, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PatientSidebar } from "@/components/patient-sidebar"
import { ChatLayout } from "@/components/chat"
import { authService } from "@/services/auth.service"
import { AuthGuard } from "@/components/auth-guard"
import type { InboxFilter } from "@/types/chat"

function PatientChatContent() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        fullName: user.fullName || "Patient",
        role: user.role || "PATIENT",
      })
    }
  }, [])

  const getInitials = (name: string): string => {
    if (!name) return "PT"
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

  const allowedFilters: InboxFilter[] = ["all", "doctor"]

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#e5f5f8" }}>
      <PatientSidebar />

      <div className="flex-1 flex flex-col overflow-hidden" style={{ paddingTop: "12px" }}>
        <header
          className="bg-white py-3 mx-3 mb-3 flex-shrink-0"
          style={{ borderRadius: "14px", paddingLeft: "24px", paddingRight: "20px" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#16a1bd]" />
              <h1 className="text-lg font-semibold text-gray-900">Chats</h1>
            </div>

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="text-xs">
                        {userInfo ? getInitials(userInfo.fullName) : "PT"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-xs font-medium">{userInfo?.fullName || "Patient"}</p>
                      <p className="text-[10px] text-gray-500">Bệnh nhân</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push("/patient-profile")}>
                    <User className="mr-2 h-3.5 w-3.5" />
                    <span className="text-sm">My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    <span className="text-sm">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0 px-3 pb-3">
          <ChatLayout role="PATIENT" showNeedHelpBanner={true} allowedFilters={allowedFilters} />
        </main>
      </div>
    </div>
  )
}

export default function PatientChatPage() {
  return (
    <AuthGuard allowedRoles={["PATIENT"]}>
      <PatientChatContent />
    </AuthGuard>
  )
}

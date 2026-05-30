"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import { Search, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { Input } from "@/components/ui/input"
import { PatientSidebar } from "@/components/patient-sidebar"
import { PatientUserMenu } from "@/components/patient-user-menu"
import { PageHeaderTitleRow } from "@/components/page-header-title-row"
import { ChatLayout } from "@/components/chat"
import { authService } from "@/services/auth.service"
import { AuthGuard } from "@/components/auth-guard"
import { SuppressAiFloatingChat } from "@/components/ai-floating-chat-context"
import type { InboxFilter } from "@/types/chat"

function PatientChatContent() {
  const { t } = useTranslation()
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

  const allowedFilters: InboxFilter[] = ["all", "doctor"]

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#E8F5F1" }}>
      <SuppressAiFloatingChat />
      <PatientSidebar />

      <div className="flex-1 flex flex-col overflow-hidden" style={{ paddingTop: "12px" }}>
        <header
          className="bg-white py-3 mx-3 mb-3 flex-shrink-0"
          style={{ borderRadius: "14px", paddingLeft: "24px", paddingRight: "20px" }}
        >
          <div className="flex items-center justify-between">
            <PageHeaderTitleRow
              role="patient"
              icon={MessageSquare}
              title={t("chats")}
              iconClassName="text-[#007A94]"
              titleClassName="text-lg"
            />

            <div className="flex items-center space-x-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  type="search"
                  placeholder={t("searchPlaceholder")}
                  className="pl-9 bg-gray-50 border-gray-200 h-9 text-sm"
                />
              </div>
              <NotificationBell />
              <PatientUserMenu
                userInfo={userInfo}
                triggerClassName="flex items-center gap-2 h-9 px-2"
                contentClassName="w-48"
              />
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

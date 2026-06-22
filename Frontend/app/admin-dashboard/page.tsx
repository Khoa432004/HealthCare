"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminOverview } from "@/components/admin-overview"
import { UserManagementTable } from "@/components/user-management-table"
import { CanceledAppointmentsTable } from "@/components/canceled-appointments-table"
import { DoctorPayrollTable } from "@/components/doctor-payroll-table"
import { NotificationManagement } from "@/components/notification-management"
import { ExamPackageRequestsTable } from "@/components/exam-package-requests-table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import { AdminUserMenu } from "@/components/admin-user-menu"
import { authService } from "@/services/auth.service"
import { AuthGuard } from "@/components/auth-guard"
import { ChatLayout } from "@/components/chat"
import { useAiFloatingChatContext } from "@/components/ai-floating-chat-context"
import { useTranslation } from "react-i18next"

type TabType =
  | "overview"
  | "users"
  | "statistics"
  | "notifications"
  | "refunds"
  | "cancellations"
  | "revenue"
  | "doctors"
  | "chats"
  | "exam-packages"

function AdminDashboardContent() {
  const { setSuppressed } = useAiFloatingChatContext()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        fullName: user.fullName || 'Admin',
        role: user.role || 'ADMIN'
      })
    }
  }, [])

  useEffect(() => {
    setSuppressed(activeTab === "chats")
    return () => setSuppressed(false)
  }, [activeTab, setSuppressed])

  // Helper function to get role display name
  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      ADMIN: 'Quản trị viên',
      CLINIC_ADMIN: 'Quản trị phòng khám',
      DOCTOR: 'Bác sĩ',
      PATIENT: 'Bệnh nhân'
    }
    return roleMap[role.toUpperCase()] || 'Người dùng'
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview />
      case "users":
        return <UserManagementTable />
      case "exam-packages":
        return <ExamPackageRequestsTable />
      case "statistics":
        return <div className="p-4">{t("statisticsComingSoon")}</div>
      case "notifications":
        return <NotificationManagement />
      case "refunds":
        return <div className="p-4">{t("refundsComingSoon")}</div>
      case "cancellations":
        return <CanceledAppointmentsTable />
      case "revenue":
        return <DoctorPayrollTable />
      case "doctors":
        return <div className="p-4">{t("doctorsComingSoon")}</div>
      case "chats":
        return (
          <div className="h-[calc(100vh-120px)] min-h-[500px]">
            <ChatLayout role="ADMIN" />
          </div>
        )
      default:
        return <AdminOverview />
    }
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#E8F5F1' }}>
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ paddingTop: '16px' }}>
        {/* Top Navigation */}
        <header className="bg-white px-6 py-4 mx-4 mb-4" style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder={t("searchLabel")}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <NotificationBell />
              
              {/* User Menu */}
              <AdminUserMenu
                userInfo={userInfo}
                roleLabel={userInfo ? getRoleDisplayName(userInfo.role) : undefined}
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-6 pb-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AuthGuard allowedRoles={['ADMIN', 'CLINIC_ADMIN']}>
      <AdminDashboardContent />
    </AuthGuard>
  )
}

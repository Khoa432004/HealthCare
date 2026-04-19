"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  FileText,
  LogOut,
  Search,
  User,
} from "lucide-react"

import { AuthGuard } from "@/components/auth-guard"
import { HealthMetricsTab } from "@/components/medical-records/health-metrics-tab"
import { MedicalHistoryTab } from "@/components/medical-records/medical-history-tab"
import { NotificationBell } from "@/components/notification-bell"
import { PatientSidebar } from "@/components/patient-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authService } from "@/services/auth.service"

function getInitials(name?: string) {
  if (!name) return "PT"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function MetricsContent() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{
    id: string
    fullName: string
    role: string
  } | null>(null)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        id: user.id || "",
        fullName: user.fullName || "Patient",
        role: user.role || "PATIENT",
      })
    }
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error("Logout error", err)
      authService.clearAuthData()
    } finally {
      router.push("/login")
    }
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#e5f5f8" }}>
      <PatientSidebar />

      <div
        className="flex-1 flex flex-col overflow-y-auto"
        style={{ paddingTop: "12px" }}
      >
        {/* Header */}
        <header
          className="bg-white py-3 mx-3 mb-3"
          style={{
            borderRadius: "14px",
            paddingLeft: "24px",
            paddingRight: "20px",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-700" />
                <h1 className="text-lg font-semibold text-gray-900">Metrics</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm..."
                  className="pl-9 bg-gray-50 border-gray-200 h-9 text-sm"
                />
              </div>

              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-9 px-2"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="text-xs">
                        {getInitials(userInfo?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-xs font-medium">
                        {userInfo?.fullName || "Patient"}
                      </p>
                      <p className="text-[10px] text-gray-500">Bệnh nhân</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => router.push("/patient-profile")}
                  >
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

        {/* Body */}
        <div className="flex-1 px-4 pb-6">
          <div className="glass rounded-2xl shadow-soft-md border-white/50 p-4 mb-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-base font-semibold bg-gradient-to-r from-[#16a1bd] to-[#0d6171] bg-clip-text text-transparent">
                  Metrics
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Theo dõi chỉ số sức khỏe và tiền sử khám bệnh đã ghi nhận.
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="bg-white/80 backdrop-blur border border-white/60 shadow-soft h-11">
              <TabsTrigger value="metrics" className="gap-2">
                <Activity className="w-4 h-4" />
                Chỉ số sức khỏe
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <FileText className="w-4 h-4" />
                Lịch sử khám
              </TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="mt-4">
              {userInfo?.id ? (
                <HealthMetricsTab
                  patientId={userInfo.id}
                  patientName={userInfo.fullName}
                />
              ) : (
                <PlaceholderMessage text="Đang lấy thông tin người dùng..." />
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {userInfo?.id ? (
                <MedicalHistoryTab patientId={userInfo.id} />
              ) : (
                <PlaceholderMessage text="Đang lấy thông tin người dùng..." />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function PlaceholderMessage({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-white/70 border border-white/60 shadow-soft p-10 text-center text-sm text-gray-500">
      {text}
    </div>
  )
}

export default function HealthTrackingPage() {
  return (
    <AuthGuard allowedRoles={["PATIENT"]}>
      <MetricsContent />
    </AuthGuard>
  )
}

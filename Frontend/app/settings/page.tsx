"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Settings as SettingsIcon, Search } from "lucide-react"
import DoctorSidebar from "@/components/doctor-sidebar"
import { PageHeaderTitleRow } from "@/components/page-header-title-row"
import { AuthGuard } from "@/components/auth-guard"
import { NotificationBell } from "@/components/notification-bell"
import { DoctorUserMenu } from "@/components/doctor-user-menu"
import { WorkPlanSettingsPanel } from "@/components/doctor-settings/work-plan-settings-panel"
import { PackageProgramPanel } from "@/components/doctor-settings/package-program-panel"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authService } from "@/services/auth.service"

type SettingsTab = "work-plan" | "package-program"

function SettingsPageContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userInfo, setUserInfo] = useState<{ fullName?: string } | null>(null)

  const tabParam = searchParams.get("tab")
  const activeTab: SettingsTab =
    tabParam === "package-program" ? "package-program" : "work-plan"

  useEffect(() => {
    setUserInfo(authService.getUserInfo())
  }, [])

  const handleTabChange = (value: string) => {
    const next = value === "package-program" ? "package-program" : "work-plan"
    router.replace(`/settings?tab=${next}`, { scroll: false })
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#E8F5F1" }}>
      <DoctorSidebar />

      <div className="flex-1 flex flex-col overflow-y-auto" style={{ paddingTop: "16px" }}>
        <header
          className="bg-white py-4 mx-4 mb-4"
          style={{ borderRadius: "16px", paddingLeft: "32px", paddingRight: "24px" }}
        >
          <div className="flex items-center justify-between">
            <PageHeaderTitleRow role="doctor" icon={SettingsIcon} title={t("settings")} />

            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder={t("searchPlaceholder")}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
              <NotificationBell />
              <DoctorUserMenu userInfo={userInfo} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="glass border-white/50 shadow-soft-md rounded-none w-full justify-start h-auto p-0 mb-6">
              <TabsTrigger
                value="work-plan"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#007A94] data-[state=active]:bg-transparent data-[state=active]:text-[#007A94] px-4 py-3 transition-all duration-300"
              >
                {t("workPlanTab")}
              </TabsTrigger>
              <TabsTrigger
                value="package-program"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#007A94] data-[state=active]:bg-transparent data-[state=active]:text-[#007A94] px-4 py-3 transition-all duration-300"
              >
                {t("packageProgramTab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="work-plan" className="mt-0">
              <WorkPlanSettingsPanel />
            </TabsContent>

            <TabsContent value="package-program" className="mt-0">
              <PackageProgramPanel />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AuthGuard allowedRoles={["DOCTOR", "ADMIN", "CLINIC_ADMIN"]}>
      <Suspense fallback={null}>
        <SettingsPageContent />
      </Suspense>
    </AuthGuard>
  )
}

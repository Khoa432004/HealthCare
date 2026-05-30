"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Activity, Search } from "lucide-react"

import { AuthGuard } from "@/components/auth-guard"
import { PatientMetricsSection } from "@/components/medical-records/patient-metrics/PatientMetricsSection"
import { NotificationBell } from "@/components/notification-bell"
import { PatientSidebar } from "@/components/patient-sidebar"
import { PatientUserMenu } from "@/components/patient-user-menu"
import { PageHeaderTitleRow } from "@/components/page-header-title-row"
import { Input } from "@/components/ui/input"
import { authService } from "@/services/auth.service"
import DoctorSidebar from "@/components/doctor-sidebar"

function MetricsContent() {
  const router = useRouter()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [userInfo, setUserInfo] = useState<{
    id: string
    fullName: string
    role: string
  } | null>(null)
  const [trackingTarget, setTrackingTarget] = useState<{
    patientId: string
    patientName: string
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

  useEffect(() => {
    const fromQueryId = (searchParams.get("patientId") || "").trim()
    const fromQueryName = (searchParams.get("patientName") || "").trim()
    if (fromQueryId) {
      setTrackingTarget({
        patientId: fromQueryId,
        patientName: fromQueryName || "Patient",
      })
    } else {
      setTrackingTarget(null)
    }
  }, [searchParams])

  const isDoctor = String(userInfo?.role || "").toUpperCase() === "DOCTOR"
  const displayedPatientId = isDoctor
    ? trackingTarget?.patientId || ""
    : userInfo?.id || ""
  const displayedPatientName = isDoctor
    ? trackingTarget?.patientName || "Patient"
    : userInfo?.fullName || "Patient"

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#E8F5F1" }}>
      {isDoctor ? <DoctorSidebar /> : <PatientSidebar />}

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
            <PageHeaderTitleRow
              role={isDoctor ? "doctor" : "patient"}
              icon={Activity}
              title={t("metrics")}
              titleClassName="text-lg"
            />

            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
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

        {/* Body */}
        <div className="flex-1 px-4 pb-6">
          {displayedPatientId ? (
            <PatientMetricsSection
              patientId={displayedPatientId}
              patientName={displayedPatientName}
            />
          ) : (
            <PlaceholderMessage
              text={
                isDoctor
                  ? t("selectPatientFromMonitoring")
                  : t("loadingUserInfo")
              }
            />
          )}
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
    <AuthGuard allowedRoles={["PATIENT", "DOCTOR"]}>
      <MetricsContent />
    </AuthGuard>
  )
}

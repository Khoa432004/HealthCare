"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, FileText, LogOut, Search, User, ChevronRight as RowChevron } from "lucide-react"
import { format } from "date-fns"

import { AuthGuard } from "@/components/auth-guard"
import { MedicalReportPopup } from "@/components/pdf/MedicalReportPopup"
import { NotificationBell } from "@/components/notification-bell"
import { PageHeaderTitleRow } from "@/components/page-header-title-row"
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
import { authService } from "@/services/auth.service"
import {
  medicalHistoryService,
  type MedicalExaminationHistorySummaryDto,
} from "@/services/medical-history.service"

const PAGE_SIZE = 10

function getInitials(name?: string) {
  if (!name) return "PT"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function formatDateTimeDisplay(start?: string) {
  if (!start) return { date: "N/A", time: "" }
  const startDate = new Date(start)
  return {
    date: format(startDate, "dd/MM/yyyy"),
    time: format(startDate, "HH:mm"),
  }
}

function resolveFormatType(
  record: MedicalExaminationHistorySummaryDto
): "online" | "clinic" {
  const raw = (record.formatType || "").toLowerCase()
  if (raw.includes("clinic") || raw.includes("hospital")) return "clinic"
  return "online"
}

function FormatTypeBadge({ type }: { type: "online" | "clinic" }) {
  if (type === "clinic") {
    return (
      <span className="inline-flex w-fit max-w-full items-center justify-center rounded-full border border-[#7fd4b8] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5fbf9f] whitespace-nowrap">
        At clinic / hospital
      </span>
    )
  }

  return (
    <span className="inline-flex w-fit items-center justify-center rounded-full border border-[#7ec8e3] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5eb8d9] whitespace-nowrap">
      Online
    </span>
  )
}

function EhrContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userInfo, setUserInfo] = useState<{
    id: string
    fullName: string
    role: string
  } | null>(null)
  const [records, setRecords] = useState<MedicalExaminationHistorySummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [reportPopupOpen, setReportPopupOpen] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)

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
    const fetchRecords = async () => {
      try {
        setLoading(true)
        const user = authService.getUserInfo()
        if (!user?.id) return
        const data = await medicalHistoryService.getHistory(user.id)
        setRecords(data)
      } catch (error) {
        console.error("Failed to fetch EHR data:", error)
        setRecords([])
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    const reportId = (searchParams.get("report") || "").trim()
    if (!reportId) return
    setSelectedAppointmentId(reportId)
    setReportPopupOpen(true)
  }, [searchParams])

  const handleReportPopupChange = (open: boolean) => {
    setReportPopupOpen(open)
    if (!open) {
      setSelectedAppointmentId(null)
      if (searchParams.get("report")) {
        router.replace("/patient-emr")
      }
    }
  }

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return records
    return records.filter((record) => {
      const doctorCode = (record.doctorCode || "").toLowerCase()
      const specialty = (record.doctorSpecialty || "").toLowerCase()
      return (
        record.doctor.toLowerCase().includes(q) ||
        doctorCode.includes(q) ||
        specialty.includes(q) ||
        (record.clinic || "").toLowerCase().includes(q) ||
        (record.diagnosis || "").toLowerCase().includes(q)
      )
    })
  }, [records, search])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE))
  const paginatedRecords = filteredRecords.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

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

  const handleViewDetail = (id: string) => {
    setSelectedAppointmentId(id)
    setReportPopupOpen(true)
  }

  return (
    <div className="flex h-screen bg-[#E8F5F1]">
      <PatientSidebar />

      <div className="flex-1 flex flex-col overflow-hidden pt-3 px-3 pb-3 min-w-0">
        <header className="bg-white py-3 px-6 rounded-2xl mb-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <PageHeaderTitleRow
              role="patient"
              icon={FileText}
              title="EHR"
              titleClassName="text-lg"
            />

            <div className="flex items-center gap-3">
              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="text-xs">
                        {getInitials(userInfo?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-medium">
                        {userInfo?.fullName || "Patient"}
                      </p>
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

        <div className="bg-white rounded-2xl flex-1 min-h-0 flex flex-col overflow-hidden border border-[#d6e7ec]">
          <div className="shrink-0 flex flex-col gap-3 border-b border-[#e6eef2] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Examination history</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Click a row to view the medical report
              </p>
            </div>
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctor, specialty..."
                className="h-9 pl-9 bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto px-3 py-2">
            <div className="overflow-hidden rounded-xl border border-[#dce9ee]">
              <table className="w-full table-fixed">
                <thead className="sticky top-0 z-[1] bg-[#eef5f8]">
                  <tr className="text-[13px] font-semibold text-gray-900">
                    <th className="text-left px-4 py-3 w-[42%]">Doctor Name</th>
                    <th className="text-center px-4 py-3 w-[28%]">Format type</th>
                    <th className="text-right px-4 py-3 w-[22%]">Date &amp; Time</th>
                    <th className="w-[8%]" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16 text-sm text-gray-500">
                        Đang tải dữ liệu EHR...
                      </td>
                    </tr>
                  ) : paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16 text-sm text-gray-500">
                        Chưa có lịch sử khám bệnh
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record) => {
                      const { date, time } = formatDateTimeDisplay(record.date)
                      const formatType = resolveFormatType(record)
                      const doctorCode =
                        record.doctorCode ||
                        (record.doctorId
                          ? `DR${record.doctorId.slice(0, 4).toUpperCase()}`
                          : "")
                      const doctorMeta = [doctorCode, record.doctorSpecialty]
                        .filter(Boolean)
                        .join(" • ")

                      return (
                        <tr
                          key={record.id}
                          className="group border-b border-[#edf2f5] last:border-b-0 hover:bg-[#f8fcfd] cursor-pointer transition-colors"
                          onClick={() => handleViewDetail(record.id)}
                        >
                          <td className="px-4 py-3.5 align-middle">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="h-9 w-9 shrink-0 border border-[#e6eef2]">
                                <AvatarImage src="/professional-doctor-avatar.png" />
                                <AvatarFallback className="bg-[#e8f4f7] text-[#007A94] text-[10px]">
                                  {getInitials(record.doctor)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {record.doctor}
                                </p>
                                {doctorMeta ? (
                                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    {doctorMeta}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            <div className="flex justify-center">
                              <FormatTypeBadge type={formatType} />
                            </div>
                          </td>
                          <td className="px-4 py-3.5 align-middle text-right">
                            <p className="text-sm font-semibold text-gray-900">{date}</p>
                            {time ? (
                              <p className="text-xs text-gray-500 mt-0.5">{time}</p>
                            ) : null}
                          </td>
                          <td className="px-2 py-3.5 align-middle text-right">
                            <RowChevron className="h-4 w-4 text-[#007A94] opacity-0 transition-opacity group-hover:opacity-100" />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="shrink-0 px-5 py-3 flex items-center justify-between text-sm text-gray-600 border-t border-[#e6eef2] bg-[#fbfeff]">
            <p>
              {filteredRecords.length > 0
                ? `Showing ${(page - 1) * PAGE_SIZE + 1} - ${Math.min(page * PAGE_SIZE, filteredRecords.length)} of ${filteredRecords.length} items`
                : "Showing 0 - 0 of 0 items"}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-500"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
                const value = idx + 1
                const isActive = value === page
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPage(value)}
                    className={`h-7 min-w-7 rounded-full px-2 text-xs transition-colors ${
                      isActive
                        ? "bg-[#007A94] text-white font-semibold"
                        : "text-gray-500 hover:bg-[#EDF7F4]"
                    }`}
                  >
                    {value}
                  </button>
                )
              })}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-500"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MedicalReportPopup
        appointmentId={selectedAppointmentId}
        open={reportPopupOpen}
        onOpenChange={handleReportPopupChange}
      />
    </div>
  )
}

export default function PatientEhrPage() {
  return (
    <AuthGuard allowedRoles={["PATIENT"]}>
      <EhrContent />
    </AuthGuard>
  )
}

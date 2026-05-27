"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, MoreVertical, Search } from "lucide-react"
import DoctorSidebar from "@/components/doctor-sidebar"
import { PageHeaderTitleRow } from "@/components/page-header-title-row"
import { AuthGuard } from "@/components/auth-guard"
import { NotificationBell } from "@/components/notification-bell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DoctorUserMenu } from "@/components/doctor-user-menu"
import { Input } from "@/components/ui/input"
import { authService } from "@/services/auth.service"
import { patientExamPackageService } from "@/services/patient-exam-package.service"

type MonitoringStatus = "active" | "upcoming" | "pending" | "inactive"

type ActivePackagePatient = {
  purchaseId: string
  patientId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  packageId: string
  packageName: string
  durationDays: number
  priceVnd: number
  purchaseDate: string
  expirationDate: string
  status: string
  remainingMessages: number
  remainingSessions: number
}

type MonitoringPatientRow = {
  patientId: string
  patientName: string
  packageType: string
  status: MonitoringStatus
  remainingDays: string
  startDate: string
  endDate: string
  progressPercent: number
}

const STATUS_TABS = [{ key: "all", label: "All Patients" }] as const
const PAGE_SIZE = 10

function formatDateShort(date: string): string {
  if (!date) return "N/A"
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return "N/A"
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

function calcRemainingDays(expirationDate: string): number {
  if (!expirationDate) return 0
  const diff = new Date(expirationDate).getTime() - Date.now()
  if (Number.isNaN(diff)) return 0
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function DoctorMonitoringContent() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null)
  const [patientPackages, setPatientPackages] = useState<ActivePackagePatient[]>([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"all">("all")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        fullName: user.fullName || "Doctor",
        role: user.role || "DOCTOR",
      })
    }
  }, [])

  useEffect(() => {
    const loadActivePatients = async () => {
      setLoading(true)
      try {
        const data = await patientExamPackageService.getMyActivePatients()
        setPatientPackages(data || [])
      } catch (err) {
        console.error("Error loading active patient packages:", err)
        setPatientPackages([])
      } finally {
        setLoading(false)
      }
    }
    loadActivePatients()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [activeTab, search])

  const getInitials = (name: string): string => {
    if (!name) return "DR"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push("/login")
    } catch {
      authService.clearAuthData()
      router.push("/login")
    }
  }

  const handleViewPatientTracking = (row: MonitoringPatientRow) => {
    if (!row.patientId || row.patientId === "N/A") return
    const params = new URLSearchParams({
      patientId: row.patientId,
      patientName: row.patientName,
    })
    router.push(`/health-tracking?${params.toString()}`)
  }

  const rows = useMemo<MonitoringPatientRow[]>(() => {
    return patientPackages
      .map((pkg) => {
        const remaining = calcRemainingDays(pkg.expirationDate)
        const elapsed = Math.max(0, (pkg.durationDays || 0) - remaining)
        const progressPercent = pkg.durationDays > 0
          ? Math.min(100, Math.round((elapsed / pkg.durationDays) * 100))
          : 0
        const normalized = String(pkg.status || "").toLowerCase()
        const status: MonitoringStatus =
          normalized === "active"
            ? "active"
            : normalized === "pending"
              ? "pending"
              : normalized === "upcoming"
                ? "upcoming"
                : "inactive"
        return {
          patientId: pkg.patientId || "N/A",
          patientName: pkg.patientName || "N/A",
          packageType: pkg.packageName || `Gói ${pkg.durationDays} ngày`,
          status,
          remainingDays: String(remaining),
          startDate: formatDateShort(pkg.purchaseDate),
          endDate: formatDateShort(pkg.expirationDate),
          progressPercent,
        }
      })
      .sort((a, b) => a.patientName.localeCompare(b.patientName))
  }, [patientPackages])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const q = search.trim().toLowerCase()
      const matchedSearch = q.length === 0 || row.patientName.toLowerCase().includes(q) || row.patientId.toLowerCase().includes(q)
      return matchedSearch
    })
  }, [rows, search])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const paginatedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statusLabel = (status: MonitoringStatus) => {
    if (status === "active") return "ACTIVE"
    if (status === "upcoming") return "UP COMING"
    if (status === "pending") return "PENDING"
    return "COMPLETED"
  }

  const statusTone = (status: MonitoringStatus) => {
    if (status === "active") return "text-emerald-600 border-emerald-200 bg-emerald-50"
    if (status === "upcoming") return "text-sky-600 border-sky-200 bg-sky-50"
    if (status === "pending") return "text-amber-600 border-amber-200 bg-amber-50"
    return "text-slate-500 border-slate-200 bg-slate-50"
  }

  const formatDate = (date: string) => date || "N/A"

  const getPackageProgress = (row: MonitoringPatientRow) => {
    const width = `${row.progressPercent}%`
    if (row.status === "active") return { width, color: "bg-[#24b36b]" }
    if (row.status === "upcoming") return { width, color: "bg-[#36b9a2]" }
    if (row.status === "pending") return { width, color: "bg-[#ef476f]" }
    return { width, color: "bg-[#cfd6dc]" }
  }

  return (
    <div className="flex h-screen bg-[#E8F5F1]">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col overflow-y-auto pt-3 px-3 pb-3">
        <header className="bg-white py-3 px-6 rounded-2xl mb-3">
          <div className="flex items-center justify-between gap-3">
            <PageHeaderTitleRow
              role="doctor"
              title="Monitoring"
              titleClassName="text-lg"
            />
            <div className="flex items-center gap-3">
              <div className="relative w-[280px] hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="h-9 pl-9"
                />
              </div>
              <NotificationBell />
              <DoctorUserMenu
                userInfo={userInfo}
                triggerClassName="flex items-center gap-2 h-9 px-2"
              />
            </div>
          </div>
        </header>

        <div className="bg-white rounded-2xl flex-1 min-h-0 flex flex-col overflow-hidden border border-[#d6e7ec]">
          <div className="shrink-0 border-b border-[#d6e7ec] bg-[#edf6f9]">
            <div className="px-5 pt-2.5 flex flex-wrap gap-5 text-sm">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-[#007A94] text-[#007A94] font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-white p-2">
            <div className="overflow-hidden rounded-xl border border-[#dce9ee]">
            <table className="w-full min-w-[980px]">
              <thead className="bg-[#0f6f84] text-white sticky top-0 z-[1]">
                <tr className="text-[13px] font-semibold">
                  <th className="text-left px-4 py-3.5">Patient Name</th>
                  <th className="text-left px-4 py-3.5">Package Type</th>
                  <th className="text-left px-4 py-3.5">Status</th>
                  <th className="text-center px-4 py-3.5">Remaining Days</th>
                  <th className="text-center px-4 py-3.5">Start Date</th>
                  <th className="text-center px-4 py-3.5">End Date</th>
                  <th className="text-right px-4 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-sm text-gray-500">
                      Loading monitoring data...
                    </td>
                  </tr>
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-sm text-gray-500">
                      Chưa có bệnh nhân nào đang sử dụng gói của bạn
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => (
                    <tr
                      key={row.patientId}
                      className="border-b border-[#edf2f5] hover:bg-[#f8fcfd] cursor-pointer"
                      onClick={() => handleViewPatientTracking(row)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-[#e2f2f6] text-[#007A94] text-xs">
                              {getInitials(row.patientName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{row.patientName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-800">{row.packageType}</p>
                        <div className="mt-2 h-1.5 w-[140px] rounded-full bg-[#e6ebef]">
                          <div
                            className={`h-1.5 rounded-full ${getPackageProgress(row).color}`}
                            style={{ width: getPackageProgress(row).width }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${statusTone(row.status)}`}>
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-gray-700">{row.remainingDays}</td>
                      <td className="px-4 py-4 text-sm text-center text-gray-700">{formatDate(row.startDate)}</td>
                      <td className="px-4 py-4 text-sm text-center text-gray-700">{formatDate(row.endDate)}</td>
                      <td className="px-4 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleViewPatientTracking(row)
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>

          <div className="shrink-0 px-5 py-3 flex items-center justify-between text-sm text-gray-600 border-t border-[#e6eef2] bg-[#fbfeff]">
            <p>
              {filteredRows.length > 0
                ? `Showing ${(page - 1) * PAGE_SIZE + 1} - ${Math.min(page * PAGE_SIZE, filteredRows.length)} of ${filteredRows.length} items`
                : "Showing 0 - 0 of 0 items"}
            </p>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(3, totalPages) }).map((_, idx) => {
                const value = idx + 1
                const isActive = value === page
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPage(value)}
                    className={`h-6 min-w-6 rounded-md px-1 text-xs ${
                      isActive ? "bg-[#d9edf3] text-[#007A94] font-semibold" : "text-gray-500 hover:bg-[#EDF7F4]"
                    }`}
                  >
                    {value}
                  </button>
                )
              })}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MonitoringPage() {
  return (
    <AuthGuard allowedRoles={["DOCTOR"]}>
      <DoctorMonitoringContent />
    </AuthGuard>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, LogOut, MoreVertical, Search, User } from "lucide-react"
import DoctorSidebar from "@/components/doctor-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { NotificationBell } from "@/components/notification-bell"
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
import { userService, type User } from "@/services/user.service"

type MonitoringStatus = "active" | "upcoming" | "pending" | "inactive"

type MonitoringPatientRow = {
  patientId: string
  patientName: string
  packageType: string
  status: MonitoringStatus
  remainingDays: string
  startDate: Date | null
  endDate: Date | null
}

const STATUS_TABS: Array<{ key: "all" | MonitoringStatus; label: string }> = [
  { key: "all", label: "All Patients" },
  { key: "active", label: "Active Packages" },
  { key: "upcoming", label: "Upcoming Appointments" },
  { key: "pending", label: "Pending" },
  { key: "inactive", label: "Inactive" },
]

const PAGE_SIZE = 10

function DoctorMonitoringContent() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null)
  const [patients, setPatients] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]["key"]>("all")
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
    const loadPatients = async () => {
      setLoading(true)
      try {
        const size = 100
        let currentPage = 1
        let totalPages = 1
        const collected: User[] = []

        do {
          const response = await userService.getAllUsers({
            page: currentPage,
            size,
            roleName: "PATIENT",
          })
          const patientOnly = (response.content ?? []).filter(
            (user) => String(user.role || "").toUpperCase() === "PATIENT",
          )
          collected.push(...patientOnly)
          totalPages = response.totalPages || 1
          currentPage += 1
        } while (currentPage <= totalPages)

        setPatients(collected)
      } finally {
        setLoading(false)
      }
    }
    loadPatients()
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
    return patients
      .map((patient) => {
        const normalizedStatus = String(patient.status || "").toUpperCase()
        const status: MonitoringStatus =
          normalizedStatus === "ACTIVE"
            ? "active"
            : normalizedStatus === "PENDING"
              ? "pending"
              : "inactive"

        return {
          patientId: patient.id || "N/A",
          patientName: patient.fullName || "N/A",
          packageType: "N/A",
          status,
          remainingDays: "N/A",
          startDate: null,
          endDate: null,
        }
      })
      .sort((a, b) => a.patientName.localeCompare(b.patientName))
  }, [patients])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchedTab = activeTab === "all" ? true : row.status === activeTab
      const q = search.trim().toLowerCase()
      const matchedSearch = q.length === 0 || row.patientName.toLowerCase().includes(q) || row.patientId.toLowerCase().includes(q)
      return matchedTab && matchedSearch
    })
  }, [rows, activeTab, search])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const paginatedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statusLabel = (status: MonitoringStatus) => {
    if (status === "active") return "ACTIVE"
    if (status === "upcoming") return "UPCOMING"
    if (status === "pending") return "PENDING"
    return "COMPLETED"
  }

  const statusTone = (status: MonitoringStatus) => {
    if (status === "active") return "text-emerald-600 border-emerald-200 bg-emerald-50"
    if (status === "upcoming") return "text-sky-600 border-sky-200 bg-sky-50"
    if (status === "pending") return "text-amber-600 border-amber-200 bg-amber-50"
    return "text-slate-500 border-slate-200 bg-slate-50"
  }

  const formatDate = (date: Date | null) => {
    if (!date || Number.isNaN(date.getTime())) return "N/A"
    return new Intl.DateTimeFormat("vi-VN").format(date)
  }

  const getPackageProgress = (row: MonitoringPatientRow) => {
    if (row.status === "active") return { width: "72%", color: "bg-[#24b36b]" }
    if (row.status === "upcoming") return { width: "42%", color: "bg-[#36b9a2]" }
    if (row.status === "pending") return { width: "56%", color: "bg-[#ef476f]" }
    return { width: "0%", color: "bg-[#cfd6dc]" }
  }

  return (
    <div className="flex h-screen bg-[#e5f5f8]">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col overflow-y-auto pt-3 px-3 pb-3">
        <header className="bg-white py-3 px-6 rounded-2xl mb-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold text-gray-900">Monitoring</h1>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="/clean-female-doctor.png" />
                      <AvatarFallback className="text-xs">{userInfo ? getInitials(userInfo.fullName) : "DR"}</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-xs font-medium">{userInfo?.fullName || "Doctor"}</p>
                      <p className="text-[10px] text-gray-500">Bác sĩ</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push("/my-profile")}>
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

        <div className="bg-white rounded-2xl flex-1 overflow-hidden border border-[#d6e7ec]">
          <div className="px-0 pt-0 border-b border-[#d6e7ec] bg-[#e5f3f7]">
            <div className="px-5 pt-3 flex flex-wrap gap-5 text-sm">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-[#0d8fae] text-[#0d8fae] font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
            </div>
          </div>

          <div className="overflow-auto bg-white">
            <table className="w-full min-w-[980px]">
              <thead className="bg-[#0d6f83] text-white">
                <tr className="text-[13px]">
                  <th className="text-left px-4 py-3">Patient Name</th>
                  <th className="text-left px-4 py-3">Package Type</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-center px-4 py-3">Remaining Days</th>
                  <th className="text-center px-4 py-3">Start Date</th>
                  <th className="text-center px-4 py-3">End Date</th>
                  <th className="text-right px-4 py-3"></th>
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
                      No patient data available
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => (
                    <tr
                      key={row.patientId}
                      className="border-b border-[#edf2f5] hover:bg-[#f8fcfd] cursor-pointer"
                      onClick={() => handleViewPatientTracking(row)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-[#e2f2f6] text-[#0d8fae] text-xs">
                              {getInitials(row.patientName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{row.patientName}</p>
                            <p className="text-xs text-gray-500">ID1234 • Chronic Condition</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-gray-800">{row.packageType}</p>
                        <div className="mt-2 h-1.5 w-[140px] rounded-full bg-[#e6ebef]">
                          <div
                            className={`h-1.5 rounded-full ${getPackageProgress(row).color}`}
                            style={{ width: getPackageProgress(row).width }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${statusTone(row.status)}`}>
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-center text-gray-700">{row.remainingDays}</td>
                      <td className="px-4 py-3.5 text-sm text-center text-gray-700">{formatDate(row.startDate)}</td>
                      <td className="px-4 py-3.5 text-sm text-center text-gray-700">{formatDate(row.endDate)}</td>
                      <td className="px-4 py-3.5 text-right">
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

          <div className="px-5 py-3 flex items-center justify-between text-sm text-gray-600 border-t border-[#e6eef2]">
            <p>
              {filteredRows.length > 0
                ? `Showing ${(page - 1) * PAGE_SIZE + 1} - ${Math.min(page * PAGE_SIZE, filteredRows.length)} of ${filteredRows.length} items`
                : "Showing 0 - 0 of 0 items"}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs px-2 py-1 rounded-md bg-[#d9edf3] text-[#0d8fae]">
                {page}/{totalPages}
              </span>
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

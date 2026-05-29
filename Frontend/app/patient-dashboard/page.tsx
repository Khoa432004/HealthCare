"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
  Plus,
  ClipboardList,
  LineChart,
  FlaskConical,
  Pill,
  Clock,
  Droplets,
  HeartPulse,
  Activity,
  TestTube2,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PatientSidebar } from "@/components/patient-sidebar"
import { PageHeaderTitleRow } from "@/components/page-header-title-row"
import PatientAppointmentsSidebar from "@/components/patient-appointments-sidebar"
import { authService } from "@/services/auth.service"
import {
  dashboardService,
  type PatientDashboardCurrentPlan,
  type PatientDashboardMedicineItem,
  type PatientDashboardOverview,
} from "@/services/dashboard.service"
import { patientExamPackageService } from "@/services/patient-exam-package.service"
import {
  medicalHistoryService,
  type Prescription,
} from "@/services/medical-history.service"
import { AuthGuard } from "@/components/auth-guard"

const MEDICINE_DEFAULT_TIMES = ["09:00", "11:00", "15:00", "21:00"]

function formatMealRelation(relation?: string): string {
  const map: Record<string, string> = {
    before: "Before meal",
    after: "After meal",
    with: "With meal",
    "before-meal": "Before meal",
    "after-meal": "After meal",
    "with-food": "With meal",
    anytime: "Anytime",
  }
  return map[(relation ?? "").toLowerCase()] ?? "With meal"
}

function formatMedicationDosage(prescription: Prescription): string {
  const dosage = prescription.dosage?.trim() ?? ""
  if (!dosage) return "N/A"

  const lower = dosage.toLowerCase()
  if (
    lower.includes("mg") ||
    lower.includes("ml") ||
    lower.includes("viên") ||
    lower.includes("tablet") ||
    lower.includes("capsule")
  ) {
    return dosage
  }

  const unitMap: Record<string, string> = {
    capsule: "viên nang",
    liquid: "ml",
    powder: "gói",
    injection: "ống",
  }
  const unit = unitMap[(prescription.medicationType ?? "").toLowerCase()] ?? "viên"
  return `${dosage} ${unit}`
}

function isPrescriptionActiveToday(prescription: Prescription, today: Date): boolean {
  let startDate: Date | null = null
  if (prescription.startDay) {
    startDate = new Date(prescription.startDay)
    startDate.setHours(0, 0, 0, 0)
  }

  if (startDate && startDate > today) return false
  if (!prescription.duration || prescription.duration <= 0) return true
  if (!startDate) return true

  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + prescription.duration)
  return endDate >= today
}

async function fetchTodayMedicinesFromHistory(
  patientId: string
): Promise<PatientDashboardMedicineItem[]> {
  const history = await medicalHistoryService.getHistory(patientId)
  if (!history.length) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result: PatientDashboardMedicineItem[] = []
  const seenDrugNames = new Set<string>()
  let timeIndex = 0

  for (const appointment of history.slice(0, 8)) {
    try {
      const details = await medicalHistoryService.getDetailHistory(appointment.id)
      const detail = details[0]
      if (!detail?.prescriptions?.length) continue

      for (const prescription of detail.prescriptions) {
        if (!prescription.name || seenDrugNames.has(prescription.name.toLowerCase())) {
          continue
        }
        if (!isPrescriptionActiveToday(prescription, today)) continue

        seenDrugNames.add(prescription.name.toLowerCase())
        result.push({
          time: MEDICINE_DEFAULT_TIMES[Math.min(timeIndex, MEDICINE_DEFAULT_TIMES.length - 1)],
          drugName: prescription.name,
          dosage: formatMedicationDosage(prescription),
          instruction: formatMealRelation(prescription.mealRelation),
          status: "Take",
        })
        timeIndex++
        if (result.length >= 12) return result
      }
    } catch (error) {
      console.warn("Failed to load prescriptions for appointment", appointment.id, error)
    }
  }

  return result
}

function buildCurrentPlanFromPackages(
  packages: Awaited<ReturnType<typeof patientExamPackageService.getMyPackages>>
): PatientDashboardCurrentPlan | null {
  if (!packages.length) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const activePackage =
    packages.find((pkg) => {
      const status = (pkg.status ?? "").toLowerCase()
      if (status !== "active") return false
      if (!pkg.expirationDate) return true
      const expiration = new Date(pkg.expirationDate)
      expiration.setHours(23, 59, 59, 999)
      return expiration >= today
    }) ?? packages[0]

  if (!activePackage?.packageName) return null

  const startDate = activePackage.purchaseDate
    ? new Date(activePackage.purchaseDate)
    : new Date()
  const endDate = activePackage.expirationDate
    ? new Date(activePackage.expirationDate)
    : new Date(startDate.getTime() + (activePackage.durationDays || 0) * 86400000)

  const totalDays = Math.max(
    1,
    activePackage.durationDays ||
      Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)
  )
  const daysLeft =
    activePackage.remainingDays > 0
      ? activePackage.remainingDays
      : Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / 86400000))
  const elapsedDays = Math.max(0, totalDays - daysLeft)
  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100))

  const statusLabel = (activePackage.status ?? "active")
    .charAt(0)
    .toUpperCase() + (activePackage.status ?? "active").slice(1).toLowerCase()

  return {
    title: activePackage.packageName,
    status: statusLabel,
    progressPercent,
    daysLeft,
    appointmentSummary: "",
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  }
}

function PatientDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(
    null
  )
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null)
  const [overview, setOverview] = useState<PatientDashboardOverview | null>(null)
  const [currentPlan, setCurrentPlan] = useState<PatientDashboardCurrentPlan | null>(null)
  const [todayMedicines, setTodayMedicines] = useState<PatientDashboardMedicineItem[]>([])
  const [search, setSearch] = useState("")
  const [medicineStatus, setMedicineStatus] = useState<Record<string, string>>({})

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        fullName: user.fullName || "Patient",
        role: user.role || "PATIENT",
      })
    }
  }, [])

  useEffect(() => {
    try {
      const payment = searchParams?.get("payment")
      const orderInfo = searchParams?.get("orderInfo")
      if (payment) {
        if (payment === "success") {
          setPaymentMessage(
            `Thanh toán thành công${orderInfo ? ` — ${decodeURIComponent(orderInfo)}` : ""}`
          )
        } else if (payment === "fail") {
          setPaymentMessage(
            `Thanh toán thất bại${orderInfo ? ` — ${decodeURIComponent(orderInfo)}` : ""}`
          )
        }
        router.replace("/patient-dashboard")
      }
    } catch (e) {
      console.error("Error handling payment query params", e)
    }
  }, [searchParams, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = authService.getUserInfo()
        const patientId = user?.id

        const [overviewData, packages, historyMedicines] = await Promise.all([
          dashboardService.getPatientOverview(),
          patientExamPackageService.getMyPackages(),
          patientId
            ? fetchTodayMedicinesFromHistory(patientId).catch(() => [] as PatientDashboardMedicineItem[])
            : Promise.resolve([] as PatientDashboardMedicineItem[]),
        ])

        setOverview(overviewData)
        setCurrentPlan(
          buildCurrentPlanFromPackages(packages) ?? overviewData.currentPlan ?? null
        )
        setTodayMedicines(
          historyMedicines.length > 0 ? historyMedicines : overviewData.todayMedicines ?? []
        )
      } catch (error) {
        console.error("Failed to fetch patient dashboard data:", error)
      }
    }
    fetchDashboardData()
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

  const toggleMedicineStatus = (key: string, currentStatus: string) => {
    setMedicineStatus((prev) => ({
      ...prev,
      [key]: currentStatus === "Take" || currentStatus === "Taking" ? "Un-take" : "Take",
    }))
  }

  const quickActions = [
    { title: "Book Appointment", icon: Calendar, href: "/patient-calendar/booking" },
    { title: "Add Measurement", icon: Plus, href: "/health-tracking" },
    { title: "View Metrics Log", icon: LineChart, href: "/health-tracking" },
    { title: "Health Test", icon: FlaskConical, href: "/health-tracking" },
  ]

  const metricIconMap: Record<string, typeof Activity> = {
    "Blood Glucose": Droplets,
    Hematocrit: Activity,
    Ketone: TestTube2,
    "Heart Rate": HeartPulse,
  }

  const metricToneMap: Record<string, string> = {
    High: "text-red-600 bg-red-50 border-red-100",
    Low: "text-amber-600 bg-amber-50 border-amber-100",
    Upper: "text-orange-600 bg-orange-50 border-orange-100",
    Normal: "text-emerald-600 bg-emerald-50 border-emerald-100",
    "N/A": "text-slate-600 bg-slate-50 border-slate-100",
  }

  const latestMeasurements = overview?.metricCards ?? []
  const hasCurrentPlan = Boolean(currentPlan?.title)

  const medicinePlans = todayMedicines.filter((item) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        item.drugName.toLowerCase().includes(q) ||
        item.dosage.toLowerCase().includes(q) ||
        item.instruction.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#E8F5F1" }}>
      <PatientSidebar />

      <div className="flex-1 flex flex-col overflow-y-auto" style={{ paddingTop: "12px" }}>
        <header
          className="bg-white py-3 mx-3 mb-3"
          style={{ borderRadius: "14px", paddingLeft: "24px", paddingRight: "20px" }}
        >
          <div className="flex items-center justify-between">
            <PageHeaderTitleRow
              role="patient"
              icon={LayoutDashboard}
              title="Dashboard"
              titleClassName="text-lg"
            />

            <div className="flex items-center space-x-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search medicines..."
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

        {paymentMessage ? (
          <div className="mx-3 mb-3 p-3 rounded-lg shadow-sm bg-gradient-to-r from-green-50 to-green-100 border border-green-200 flex items-start justify-between">
            <div className="text-sm font-medium text-green-800">{paymentMessage}</div>
            <button
              type="button"
              onClick={() => setPaymentMessage(null)}
              className="text-sm text-green-700 font-semibold ml-4"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <div className="flex-1 flex">
          <div className="flex-1 px-4 pb-4">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 mb-4">
              {quickActions.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.title} href={item.href}>
                    <div className="h-[38px] bg-gradient-to-b from-[#2aa8c6] to-[#007A94] rounded-lg px-4 flex items-center justify-between hover:opacity-95 transition-smooth">
                      <span className="text-[12px] font-medium text-white">{item.title}</span>
                      <Icon className="w-3.5 h-3.5 text-white/90" />
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="space-y-4">
              <section className="bg-[#d5e5eb] rounded-xl border border-[#c8dbe2] p-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[12px] font-semibold text-[#0f172a]">Latest Measurements</h3>
                  <Link
                    href="/health-tracking"
                    className="text-[11px] text-[#0f172a] inline-flex items-center gap-1"
                  >
                    See Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-2">
                  {latestMeasurements.length > 0 ? (
                    latestMeasurements.map((item) => {
                      const Icon = metricIconMap[item.name] ?? Activity
                      const tone = metricToneMap[item.status] ?? metricToneMap.Normal
                      return (
                        <div key={item.name} className={`rounded-xl border p-2.5 bg-white ${tone}`}>
                          <div className="flex items-start justify-between">
                            <Icon className="w-3.5 h-3.5" />
                            <Badge className="bg-white/90 text-[9px] text-gray-700 border-0 h-4">
                              {item.status}
                            </Badge>
                          </div>
                          <p className="mt-1.5 text-[10px] font-medium opacity-90">{item.name}</p>
                          <div className="mt-1 flex items-end gap-1">
                            <span className="text-[18px] font-semibold leading-none">
                              {item.value}
                            </span>
                            <span className="text-[10px] opacity-80">{item.unit}</span>
                          </div>
                          <p className="mt-1 text-[9px] opacity-80">{item.deltaText}</p>
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-full rounded-xl border border-dashed border-[#b6ccd4] bg-white p-4 text-center text-xs text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-[#d5e5eb] rounded-xl border border-[#c8dbe2] p-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[12px] font-semibold text-[#0f172a]">Current Plan</h3>
                  <Link
                    href="/patient-purchased-packages"
                    className="text-[11px] text-[#0f172a] inline-flex items-center gap-1"
                  >
                    See Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="bg-white rounded-xl border border-[#d6edf2] p-3">
                  {hasCurrentPlan ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-[#e9f7fb] flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-[#007A94]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0f172a]">{currentPlan?.title}</p>
                          <p className="text-xs text-gray-500">
                            {currentPlan?.status ?? "Unknown"}
                            {currentPlan?.daysLeft != null
                              ? ` - ${currentPlan.daysLeft} days left`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5">
                          <span>Completed</span>
                          <span>{currentPlan?.progressPercent ?? 0}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#dff2f7]">
                          <div
                            className="h-full rounded-full bg-[#007A94]"
                            style={{ width: `${currentPlan?.progressPercent ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-5 text-center text-xs text-gray-500">No data available</div>
                  )}
                </div>
              </section>

              <section className="bg-[#d5e5eb] rounded-xl border border-[#c8dbe2] p-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[12px] font-semibold text-[#0f172a]">Today&apos;s Medicines</h3>
                  <Link
                    href="/patient-emr"
                    className="text-[11px] text-[#0f172a] inline-flex items-center gap-1"
                  >
                    See Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="overflow-x-auto bg-white rounded-xl border border-[#d6edf2]">
                  <table className="w-full min-w-[740px]">
                    <thead className="border-b border-[#e5eff3]">
                      <tr className="text-center text-[10px] text-gray-500">
                        <th className="px-4 py-3 font-medium">Time</th>
                        <th className="px-4 py-3 font-medium">Drug Name</th>
                        <th className="px-4 py-3 font-medium">Dosage</th>
                        <th className="px-4 py-3 font-medium">Instructions</th>
                        <th className="px-4 py-3 font-medium text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicinePlans.length > 0 ? (
                        medicinePlans.map((plan, idx) => {
                          const key = `${plan.drugName}-${plan.time}-${idx}`
                          const status = medicineStatus[key] ?? plan.status
                          const isTaken = status === "Take" || status === "Taking"
                          return (
                            <tr
                              key={key}
                              className="border-b border-[#eff5f7] last:border-b-0"
                            >
                              <td className="px-4 py-3 text-[11px] text-gray-700 text-center">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-[#007A94]" />
                                  {plan.time}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[11px] font-medium text-[#0f172a]">
                                {plan.drugName}
                              </td>
                              <td className="px-4 py-3 text-[11px] text-gray-700 text-center">
                                {plan.dosage}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge className="bg-[#dff5fa] text-[#0e8cac] border-0 text-[9px] h-5">
                                  {plan.instruction.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Button
                                  type="button"
                                  onClick={() => toggleMedicineStatus(key, status)}
                                  className={`h-7 px-4 text-[10px] rounded-full ${
                                    isTaken
                                      ? "bg-[#007A94] hover:bg-[#0c83a0] text-white"
                                      : "bg-white border border-[#007A94] hover:bg-[#ecf7fa] text-[#007A94]"
                                  }`}
                                >
                                  <Pill className="w-3.5 h-3.5 mr-1.5" />
                                  {status}
                                </Button>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-xs text-gray-500">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>

          <PatientAppointmentsSidebar
            pendingAppointment={overview?.pendingAppointment ?? null}
            weeklyAppointments={overview?.weeklyAppointments ?? []}
          />
        </div>
      </div>
    </div>
  )
}

export default function PatientDashboard() {
  return (
    <AuthGuard allowedRoles={["PATIENT"]}>
      <PatientDashboardContent />
    </AuthGuard>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LayoutDashboard, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DoctorSidebar from "@/components/doctor-sidebar"
import DoctorMetricsCards from "@/components/doctor-metrics-cards"
import AppointmentStatusChart from "@/components/appointment-status-chart"
import AppointmentTrendChart from "@/components/appointment-trend-chart"
import CriticalCasesTable from "@/components/critical-cases-table"
import TodayAppointmentsSidebar from "@/components/today-appointments-sidebar"
import { authService } from "@/services/auth.service"
import { AuthGuard } from "@/components/auth-guard"
import { doctorStatisticsService, type DoctorStatistics } from "@/services/doctor-statistics.service"
import { appointmentService, type Appointment } from "@/services/appointment.service"

type DashboardPeriod = "today" | "last7days" | "thisMonth"

function DoctorDashboardContent() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null)
  const [statistics, setStatistics] = useState<DoctorStatistics | null>(null)
  const [yesterdayStatistics, setYesterdayStatistics] = useState<DoctorStatistics | null>(null)
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([])
  const [previousMonthAppointments, setPreviousMonthAppointments] = useState<Appointment[]>([])
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>("thisMonth")

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        fullName: user.fullName || 'Doctor',
        role: user.role || 'DOCTOR'
      })
    }
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      const now = new Date()
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
      const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0)
      const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      const startLast7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0)
      const startPrev7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13, 0, 0, 0)
      const endPrev7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 23, 59, 59)

      const currentRange =
        selectedPeriod === "today"
          ? { start: startToday, end: endToday }
          : selectedPeriod === "last7days"
            ? { start: startLast7Days, end: endToday }
            : { start: startMonth, end: endMonth }
      const previousRange =
        selectedPeriod === "today"
          ? { start: new Date(startToday.getTime() - 24 * 60 * 60 * 1000), end: new Date(endToday.getTime() - 24 * 60 * 60 * 1000) }
          : selectedPeriod === "last7days"
            ? { start: startPrev7Days, end: endPrev7Days }
            : { start: startPrevMonth, end: endPrevMonth }

      const isSameLocalDate = (iso: string, date: Date) => {
        const d = new Date(iso)
        return (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
        )
      }

      const results = await Promise.allSettled([
        doctorStatisticsService.getDoctorStatistics({ period: "today" }),
        doctorStatisticsService.getDoctorStatistics({ period: "yesterday" }),
        appointmentService.getMyAppointments(currentRange.start.toISOString(), currentRange.end.toISOString()),
        appointmentService.getMyAppointments(previousRange.start.toISOString(), previousRange.end.toISOString()),
        appointmentService.getMyAppointments(startToday.toISOString(), endToday.toISOString()),
      ])

      const [statsResult, yesterdayStatsResult, monthResult, previousMonthResult, todayResult] = results

      if (statsResult.status === "fulfilled") {
        setStatistics(statsResult.value)
      } else {
        console.error("Failed to fetch doctor statistics:", statsResult.reason)
      }
      if (yesterdayStatsResult.status === "fulfilled") {
        setYesterdayStatistics(yesterdayStatsResult.value)
      } else {
        console.error("Failed to fetch yesterday statistics:", yesterdayStatsResult.reason)
      }

      const monthRes = monthResult.status === "fulfilled" ? monthResult.value : []
      if (monthResult.status !== "fulfilled") {
        console.error("Failed to fetch month appointments:", monthResult.reason)
      }
      setMonthAppointments(monthRes)
      const previousMonthRes = previousMonthResult.status === "fulfilled" ? previousMonthResult.value : []
      if (previousMonthResult.status !== "fulfilled") {
        console.error("Failed to fetch previous month appointments:", previousMonthResult.reason)
      }
      setPreviousMonthAppointments(previousMonthRes)

      const todayFromApi = todayResult.status === "fulfilled" ? todayResult.value : []
      if (todayResult.status !== "fulfilled") {
        console.error("Failed to fetch today appointments:", todayResult.reason)
      }

      const todayFiltered = todayFromApi.filter((item) => isSameLocalDate(item.scheduledStart, now))
      const computedToday = monthRes.filter((item) => isSameLocalDate(item.scheduledStart, now))
      setTodayAppointments(todayFiltered.length > 0 ? todayFiltered : computedToday)
    }

    fetchDashboardData()
  }, [selectedPeriod])

  // Helper function to get initials from fullName
  const getInitials = (name: string): string => {
    if (!name) return 'DR'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear local data and redirect anyway
      authService.clearAuthData()
      router.push('/login')
    }
  }

  const monthStatusCounts = monthAppointments.reduce(
    (acc, item) => {
      const status = String(item.status || "").toUpperCase()
      if (status === "IN_PROCESS" || status === "IN-PROCESS") acc.inProcess += 1
      if (status === "SCHEDULED" || status === "UPCOMING" || status === "UPCOMMING") acc.upcomming += 1
      if (status === "COMPLETED") acc.completed += 1
      if (status === "CANCELED" || status === "CANCEL") acc.cancel += 1
      return acc
    },
    { inProcess: 0, upcomming: 0, completed: 0, cancel: 0 },
  )

  const totalMonthAppointments = monthAppointments.length
  const totalPreviousMonthAppointments = previousMonthAppointments.length
  const totalConsultationMinutes = monthAppointments.reduce((acc, item) => {
    const start = new Date(item.scheduledStart).getTime()
    const end = new Date(item.scheduledEnd).getTime()
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return acc
    return acc + Math.round((end - start) / (1000 * 60))
  }, 0)
  const averageConsultationMinutes =
    totalMonthAppointments > 0
      ? Math.round(totalConsultationMinutes / totalMonthAppointments)
      : 0
  const previousMonthConsultationMinutes = previousMonthAppointments.reduce((acc, item) => {
    const start = new Date(item.scheduledStart).getTime()
    const end = new Date(item.scheduledEnd).getTime()
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return acc
    return acc + Math.round((end - start) / (1000 * 60))
  }, 0)
  const previousAverageConsultationMinutes =
    totalPreviousMonthAppointments > 0
      ? Math.round(previousMonthConsultationMinutes / totalPreviousMonthAppointments)
      : 0

  const percentageChange = (current: number, previous: number) => {
    if (previous <= 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }
  const appointmentsChange = percentageChange(totalMonthAppointments, totalPreviousMonthAppointments)
  const consultationChange = percentageChange(averageConsultationMinutes, previousAverageConsultationMinutes)
  const totalPatientsToday = statistics?.totalPatientsToday || 0
  const totalPatientsYesterday = yesterdayStatistics?.totalPatientsToday || 0
  const uniquePatientsCurrentPeriod = new Set(monthAppointments.map((a) => a.patientId).filter(Boolean)).size
  const uniquePatientsPreviousPeriod = new Set(previousMonthAppointments.map((a) => a.patientId).filter(Boolean)).size
  const patientsTodayChange =
    selectedPeriod === "today"
      ? percentageChange(totalPatientsToday, totalPatientsYesterday)
      : percentageChange(uniquePatientsCurrentPeriod, uniquePatientsPreviousPeriod)
  const comparisonText =
    selectedPeriod === "today" ? "vs yesterday" : selectedPeriod === "last7days" ? "vs previous 7 days" : "vs last month"

  const dashboardMetrics = [
    {
      title: "Total Appointments",
      value: String(totalMonthAppointments),
      unit: "visits",
      change: `${Math.abs(appointmentsChange).toFixed(1)}%`,
      changeText: comparisonText,
      trend: appointmentsChange >= 0 ? ("up" as const) : ("down" as const),
      chartData: [totalPreviousMonthAppointments, 0, 0, totalMonthAppointments],
    },
    {
      title: "Consultation Time",
      value: String(averageConsultationMinutes),
      unit: "min",
      change: `${Math.abs(consultationChange).toFixed(1)}%`,
      changeText: comparisonText,
      trend: consultationChange >= 0 ? ("up" as const) : ("down" as const),
      chartData: [previousAverageConsultationMinutes, 0, 0, averageConsultationMinutes],
    },
    {
      title: selectedPeriod === "today" ? "Total Patients Today" : "Total Patients",
      value: String(selectedPeriod === "today" ? totalPatientsToday : uniquePatientsCurrentPeriod),
      unit: "patients",
      change: `${Math.abs(patientsTodayChange).toFixed(1)}%`,
      changeText: selectedPeriod === "today" ? "vs yesterday" : comparisonText,
      trend: patientsTodayChange >= 0 ? ("up" as const) : ("down" as const),
      chartData:
        selectedPeriod === "today"
          ? [totalPatientsYesterday, 0, 0, totalPatientsToday]
          : [uniquePatientsPreviousPeriod, 0, 0, uniquePatientsCurrentPeriod],
    },
  ]

  const statusChartData = [
    { name: "In-process", value: monthStatusCounts.inProcess, color: "#2563eb" },
    { name: "upcomming", value: monthStatusCounts.upcomming, color: "#F59E0B" },
    { name: "completed", value: monthStatusCounts.completed, color: "#16a34a" },
    { name: "cancel", value: monthStatusCounts.cancel, color: "#EF4444" },
  ]

  const inProcessAppointments = monthAppointments.filter((item) => {
    const status = String(item.status || "").toUpperCase()
    return status === "IN_PROCESS" || status === "IN-PROCESS"
  })

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const daysInCurrentPeriod =
    selectedPeriod === "thisMonth" ? new Date(currentYear, currentMonth + 1, 0).getDate() : selectedPeriod === "last7days" ? 7 : 1
  const currentMonthRevenueData = Array.from({ length: daysInCurrentPeriod }).map((_, index) => {
    const day = index + 1
    return { day, appointment: 0, package: 0 }
  })

  const previousMonthRevenueDataMap = new Map<number, number>()
  monthAppointments.forEach((item) => {
    const start = new Date(item.scheduledStart)
    const durationMinutes = Math.max(0, Math.round((new Date(item.scheduledEnd).getTime() - start.getTime()) / 60000))
    const baseRevenue = durationMinutes * 10000

    if (selectedPeriod === "thisMonth") {
      if (start.getFullYear() === currentYear && start.getMonth() === currentMonth) {
        const dayIndex = start.getDate() - 1
        if (currentMonthRevenueData[dayIndex]) {
          currentMonthRevenueData[dayIndex].appointment += baseRevenue
        }
      }
    } else if (selectedPeriod === "last7days") {
      const dayIndex = Math.floor((start.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).getTime()) / (24 * 60 * 60 * 1000))
      if (dayIndex >= 0 && dayIndex < currentMonthRevenueData.length) {
        currentMonthRevenueData[dayIndex].appointment += baseRevenue
      }
    } else {
      currentMonthRevenueData[0].appointment += baseRevenue
    }
  })
  previousMonthAppointments.forEach((item) => {
    const start = new Date(item.scheduledStart)
    const durationMinutes = Math.max(0, Math.round((new Date(item.scheduledEnd).getTime() - start.getTime()) / 60000))
    const baseRevenue = durationMinutes * 10000
    const day = start.getDate()
    previousMonthRevenueDataMap.set(day, (previousMonthRevenueDataMap.get(day) || 0) + baseRevenue)
  })

  const totalRevenueCurrentMonth = currentMonthRevenueData.reduce((sum, item) => sum + item.appointment, 0)
  const totalRevenuePreviousMonth = Array.from(previousMonthRevenueDataMap.values()).reduce(
    (sum, value) => sum + value,
    0,
  )
  const revenueChangePercent =
    totalRevenuePreviousMonth > 0
      ? ((totalRevenueCurrentMonth - totalRevenuePreviousMonth) / totalRevenuePreviousMonth) * 100
      : 0

  return (
    <div className="flex h-screen bg-[#e5f5f8]">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col overflow-y-auto pt-3 px-3 pb-3">
        <header className="bg-white py-3 px-6 rounded-2xl mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-gray-700" />
              <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as DashboardPeriod)}>
                <SelectTrigger className="h-8 w-40 ml-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="/clean-female-doctor.png" />
                      <AvatarFallback className="text-xs">{userInfo ? getInitials(userInfo.fullName) : 'DR'}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-xs font-medium">{userInfo?.fullName || 'Doctor'}</p>
                      <p className="text-[10px] text-gray-500">Bác sĩ</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push('/my-profile')}>
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

        <div className="flex-1 h-full flex flex-col xl:grid xl:grid-cols-8 gap-4 overflow-auto xl:overflow-hidden no-scrollbar">
          <div className="xl:h-full flex flex-col gap-4 xl:col-span-6 xl:min-h-0">
            <div className="flex-1 min-h-0 overflow-auto no-scrollbar rounded-2xl">
              <div id="dashboard-overview" className="flex flex-col gap-3">
                <DoctorMetricsCards metrics={dashboardMetrics} />

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-stretch">
                  <div id="appointment-status-breakdown" className="xl:col-span-4 h-full">
                    <AppointmentStatusChart data={statusChartData} />
                  </div>
                  <div id="revenue-chart" className="xl:col-span-8 h-full">
                    <AppointmentTrendChart
                      data={currentMonthRevenueData}
                      totalRevenue={totalRevenueCurrentMonth}
                      revenueChangePercent={revenueChangePercent}
                      comparisonText={comparisonText}
                    />
                  </div>
                </div>

                <div id="top-critical-cases">
                  <CriticalCasesTable inProcessAppointments={inProcessAppointments} />
                </div>
              </div>
            </div>
          </div>
          <div id="calendar-view" className="xl:h-full rounded-2xl xl:col-span-2 xl:overflow-auto no-scrollbar min-w-[280px]">
            <TodayAppointmentsSidebar appointmentsData={todayAppointments} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DoctorDashboard() {
  return (
    <AuthGuard allowedRoles={['DOCTOR']}>
      <DoctorDashboardContent />
    </AuthGuard>
  )
}

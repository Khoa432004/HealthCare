"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, LayoutDashboard, Calendar, User, LogOut, Plus, ClipboardList, LineChart, FlaskConical, Pill, Clock, Droplets, HeartPulse, Activity, TestTube2, ChevronRight } from "lucide-react"
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip } from "recharts"
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
import PatientAppointmentsSidebar from "@/components/patient-appointments-sidebar"
import { authService } from "@/services/auth.service"
import { dashboardService, type PatientDashboardOverview } from "@/services/dashboard.service"
import { AuthGuard } from "@/components/auth-guard"

function PatientDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null)
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null)
  const [overview, setOverview] = useState<PatientDashboardOverview | null>(null)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        fullName: user.fullName || 'Patient',
        role: user.role || 'PATIENT'
      })
    }
  }, [])

  // Show payment result notification if frontend was redirected with payment query
  useEffect(() => {
    try {
      const payment = searchParams?.get('payment')
      const orderInfo = searchParams?.get('orderInfo')
      if (payment) {
        if (payment === 'success') {
          setPaymentMessage(`Thanh toán thành công${orderInfo ? ` — ${decodeURIComponent(orderInfo)}` : ''}`)
        } else if (payment === 'fail') {
          setPaymentMessage(`Thanh toán thất bại${orderInfo ? ` — ${decodeURIComponent(orderInfo)}` : ''}`)
        }

        // Remove query params from URL without reloading page
        // replace to same path without query
        router.replace('/patient-dashboard')
      }
    } catch (e) {
      console.error('Error handling payment query params', e)
    }
  }, [searchParams, router])

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await dashboardService.getPatientOverview()
        setOverview(data)
      } catch (error) {
        console.error("Failed to fetch patient dashboard overview:", error)
      }
    }
    fetchOverview()
  }, [])

  // Helper function to get initials from fullName
  const getInitials = (name: string): string => {
    if (!name) return 'PT'
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

  const quickActions = [
    { title: "Book Appointment", icon: Calendar, href: "/patient-calendar/booking" },
    { title: "Add Measurement", icon: Plus, href: "/patient-medical-records" },
    { title: "View Metrics Log", icon: LineChart, href: "/patient-medical-records" },
    { title: "Health Test", icon: FlaskConical, href: "/patient-medical-records" },
  ]

  const metricIconMap: Record<string, any> = {
    "Blood Glucose": Droplets,
    "Hematocrit": Activity,
    "Ketone": TestTube2,
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
  const metricsTrendData = overview?.glucoseTrend ?? []
  const medicinePlans = overview?.todayMedicines ?? []
  const currentPlan = overview?.currentPlan
  const hasCurrentPlan = Boolean(currentPlan?.title)


  return (
    <div className="flex h-screen" style={{ backgroundColor: '#e5f5f8' }}>
      <PatientSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ paddingTop: '12px' }}>
        <header className="bg-white py-3 mx-3 mb-3" style={{ borderRadius: '14px', paddingLeft: '24px', paddingRight: '20px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4 text-gray-700" />
                <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input 
                  type="search"
                  placeholder="Search..." 
                  className="pl-9 bg-gray-50 border-gray-200 h-9 text-sm" 
                />
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="text-xs">{userInfo ? getInitials(userInfo.fullName) : 'PT'}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-xs font-medium">{userInfo?.fullName || 'Patient'}</p>
                      <p className="text-[10px] text-gray-500">Bệnh nhân</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push('/patient-profile')}>
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

        {/* Inline payment notification banner */}
        {paymentMessage && (
          <div className="mx-3 mb-3 p-3 rounded-lg shadow-sm bg-gradient-to-r from-green-50 to-green-100 border border-green-200 flex items-start justify-between">
            <div className="text-sm font-medium text-green-800">{paymentMessage}</div>
            <div>
              <button
                onClick={() => setPaymentMessage(null)}
                className="text-sm text-green-700 font-semibold ml-4"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="flex-1 flex">
          {/* Main Dashboard Area */}
          <div className="flex-1 px-4 pb-4">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 mb-4">
              {quickActions.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.title} href={item.href}>
                    <div className="h-[38px] bg-gradient-to-b from-[#2aa8c6] to-[#0d8fae] rounded-lg px-4 flex items-center justify-between hover:opacity-95 transition-smooth">
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
                  <button className="text-[11px] text-[#0f172a] inline-flex items-center gap-1">
                    See Details <ChevronRight className="w-3 h-3" />
                  </button>
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
                            <Badge className="bg-white/90 text-[9px] text-gray-700 border-0 h-4">{item.status}</Badge>
                          </div>
                          <p className="mt-1.5 text-[10px] font-medium opacity-90">{item.name}</p>
                          <div className="mt-1 flex items-end gap-1">
                            <span className="text-[18px] font-semibold leading-none">{item.value}</span>
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
                <div className="mt-3 rounded-xl border border-[#cfe0e7] bg-[#f2f8fa] p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[11px] font-semibold text-[#0f172a]">Blood Glucose</p>
                      <p className="text-[10px] text-gray-500">Last 30 days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-[#0f172a] leading-none">
                        {latestMeasurements.find((m) => m.name === "Blood Glucose")?.value ?? 0}
                        <span className="text-xs font-medium text-gray-500"> mg/dL</span>
                      </p>
                      <p className="text-[10px] text-gray-500">Average</p>
                    </div>
                  </div>
                  {metricsTrendData.length > 0 ? (
                    <div className="h-24 rounded-lg bg-white border border-[#e8f1f4] px-2 py-1.5">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={metricsTrendData} margin={{ top: 6, right: 6, left: -26, bottom: 0 }}>
                          <XAxis
                            dataKey="day"
                            tick={{ fontSize: 9, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis hide domain={["dataMin - 12", "dataMax + 12"]} />
                          <Tooltip
                            cursor={{ stroke: "#d5e5eb", strokeWidth: 1 }}
                            contentStyle={{ borderRadius: 8, borderColor: "#d6edf2", fontSize: 11 }}
                            formatter={(value: number) => [`${value} mg/dL`, "Blood Glucose"]}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#0d8fae"
                            strokeWidth={2}
                            dot={{ r: 2.8, strokeWidth: 1.5, fill: "#0d8fae", stroke: "#ffffff" }}
                            activeDot={{ r: 4 }}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-24 rounded-lg bg-white border border-dashed border-[#b6ccd4] flex items-center justify-center text-xs text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-[#d5e5eb] rounded-xl border border-[#c8dbe2] p-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[12px] font-semibold text-[#0f172a]">Current Plan</h3>
                  <button className="text-[11px] text-[#0f172a] inline-flex items-center gap-1">
                    See Details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-[#d6edf2] p-3">
                  {hasCurrentPlan ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-[#e9f7fb] flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-[#16a1bd]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0f172a]">{currentPlan?.title}</p>
                          <p className="text-xs text-gray-500">
                            {currentPlan?.status ?? "Unknown"}{currentPlan?.daysLeft ? ` - ${currentPlan.daysLeft} days left` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5">
                          <span>Completed</span>
                          <span>{currentPlan?.progressPercent ?? 0}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#dff2f7]">
                          <div className="h-full rounded-full bg-[#16a1bd]" style={{ width: `${currentPlan?.progressPercent ?? 0}%` }} />
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
                  <button className="text-[11px] text-[#0f172a] inline-flex items-center gap-1">
                    See Details <ChevronRight className="w-3 h-3" />
                  </button>
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
                        medicinePlans.map((plan, idx) => (
                          <tr key={`${plan.drugName}-${idx}`} className="border-b border-[#eff5f7] last:border-b-0">
                            <td className="px-4 py-3 text-[11px] text-gray-700 text-center">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#16a1bd]" />
                                {plan.time}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[11px] font-medium text-[#0f172a]">{plan.drugName}</td>
                            <td className="px-4 py-3 text-[11px] text-gray-700 text-center">{plan.dosage}</td>
                            <td className="px-4 py-3 text-center">
                              <Badge className="bg-[#dff5fa] text-[#0e8cac] border-0 text-[9px] h-5">{plan.instruction.toUpperCase()}</Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button className={`h-7 px-4 text-[10px] rounded-full ${plan.status === "Taking" || plan.status === "Take" ? "bg-[#0d8fae] hover:bg-[#0c83a0] text-white" : "bg-white border border-[#0d8fae] hover:bg-[#ecf7fa] text-[#0d8fae]"}`}>
                                <Pill className="w-3.5 h-3.5 mr-1.5" />
                                {plan.status}
                              </Button>
                            </td>
                          </tr>
                        ))
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
    <AuthGuard allowedRoles={['PATIENT']}>
      <PatientDashboardContent />
    </AuthGuard>
  )
}

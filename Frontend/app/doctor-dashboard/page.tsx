"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Bell, ChevronRight, LayoutDashboard, Calendar, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import DoctorSidebar from "@/components/doctor-sidebar"
import DoctorMetricsCards from "@/components/doctor-metrics-cards"
import AppointmentStatusChart from "@/components/appointment-status-chart"
import AppointmentTrendChart from "@/components/appointment-trend-chart"
import CriticalCasesTable from "@/components/critical-cases-table"
import TodayAppointmentsSidebar from "@/components/today-appointments-sidebar"
import PatientReviews from "@/components/patient-reviews"
import { LoadingSpinner, PageLoadingSpinner } from "@/components/loading-spinner"
import { authService } from "@/services/auth.service"

export default function DoctorDashboard() {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    // Simulate initial data loading
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Simulate API calls for dashboard data
        await new Promise(resolve => setTimeout(resolve, 800))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const notifications = [
    {
      title: "tracto-curia-sunt",
      message: "Terebro taedium alius debitis concedo velit acervus.",
      time: "15 min ago",
    },
    {
      title: "decet-at-tubineus",
      message: "Basium cilicium at odit tenetur coma thalassinus quia derelinquo voluptatem.",
      time: "15 min ago",
    },
    {
      title: "aestas-substantia-claro",
      message: "Dolorum vicinus blandior alienus.",
      time: "15 min ago",
    },
    {
      title: "ventito-verecundia-decens",
      message: "Vester coniecto adeptio.",
      time: "15 min ago",
    },
  ]

  if (isLoading) {
    return <PageLoadingSpinner />
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#e5f5f8' }}>
      <DoctorSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="glass border-b border-white/50 px-6 py-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl shadow-soft-md">
                <div className="w-5 h-5 gradient-primary rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-[#16a1bd]">Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input placeholder="Search..." className="pl-12 w-80 glass border-white/50 hover:bg-white transition-all" />
              </div>

              {/* Notifications - Updated to match calendar style */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative gradient-primary text-white hover:opacity-90 shadow-soft hover:shadow-soft-md transition-smooth"
                  >
                    <Bell className="w-5 h-5" />
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full pulse-soft shadow-soft"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96">
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-4">Notifications</h3>
                    <div className="space-y-4">
                      {notifications.map((notif, index) => (
                        <div key={index} className="pb-4 border-b last:border-0">
                          <h4 className="font-medium text-sm mb-1">{notif.title}</h4>
                          <p className="text-sm text-gray-600 mb-1">{notif.message}</p>
                          <span className="text-xs text-gray-400">• {notif.time}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-4">
                      Read All Notifications
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu - Updated to match calendar style */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl hover:bg-white/50 transition-smooth">
                    <Avatar className="w-9 h-9 ring-2 ring-white shadow-soft">
                      <AvatarImage src="/clean-female-doctor.png" />
                      <AvatarFallback className="gradient-primary text-white font-semibold">LH</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                      <p className="text-sm font-semibold text-gray-700">Lê Thị Tuyết Hoa</p>
                      <p className="text-xs text-gray-500">Doctor</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-white/50 shadow-soft-lg">
                  <div className="px-3 py-3 border-b border-white/50">
                    <p className="font-semibold text-gray-900">Lê Thị Tuyết Hoa</p>
                    <p className="text-xs text-gray-500 font-medium">Doctor</p>
                  </div>
                  <Link href="/my-profile">
                    <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 hover:bg-white/50 transition-smooth">
                      <User className="w-4 h-4 text-[#16a1bd]" />
                      <span className="font-medium">My Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 hover:bg-white/50 transition-smooth">
                      <Settings className="w-4 h-4 text-[#16a1bd]" />
                      <span className="font-medium">Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="border-white/50" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 transition-smooth cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Dashboard Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <DoctorMetricsCards />

            {/* Charts and Updates Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1">
                <AppointmentStatusChart />
              </div>

              <div className="lg:col-span-2">
                <div className="glass rounded-3xl shadow-soft-lg border-white/50 p-6 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-[#16a1bd] to-[#16a1bd] bg-clip-text text-transparent">New Update</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 glass rounded-2xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium">New Chats</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="gradient-primary border-0 shadow-soft">
                          12+
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 glass rounded-2xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium">Order Reviews - Lab Test</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="gradient-primary border-0 shadow-soft">
                          2+
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 glass rounded-2xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium">Order Reviews - Medical Imaging</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 glass rounded-2xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium">Notification</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="gradient-primary border-0 shadow-soft">
                          20+
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CriticalCasesTable />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <AppointmentTrendChart />

              <PatientReviews />
            </div>
          </div>

          <TodayAppointmentsSidebar />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, ChevronRight, LayoutDashboard, User, Settings, LogOut } from "lucide-react"
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
import DoctorSidebar from "@/components/doctor-sidebar"
import DoctorMetricsCards from "@/components/doctor-metrics-cards"
import AppointmentStatusChart from "@/components/appointment-status-chart"
import AppointmentTrendChart from "@/components/appointment-trend-chart"
import CriticalCasesTable from "@/components/critical-cases-table"
import TodayAppointmentsSidebar from "@/components/today-appointments-sidebar"
import PatientReviews from "@/components/patient-reviews"
import { authService } from "@/services/auth.service"
import { AuthGuard } from "@/components/auth-guard"

function DoctorDashboardContent() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        fullName: user.fullName || 'Doctor',
        role: user.role || 'DOCTOR'
      })
    }
  }, [])

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

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#e5f5f8' }}>
      <DoctorSidebar />

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
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-3.5 w-3.5" />
                    <span className="text-sm">Settings</span>
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

        {/* Dashboard Content */}
        <div className="flex-1 flex">
          {/* Main Dashboard Area */}
          <div className="flex-1 px-4 pb-4">
            <DoctorMetricsCards />

            {/* Charts and Updates Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-1">
                <AppointmentStatusChart />
              </div>

              <div className="lg:col-span-2">
                <div className="glass rounded-2xl shadow-soft-lg border-white/50 p-4 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold bg-gradient-to-r from-[#16a1bd] to-[#16a1bd] bg-clip-text text-transparent">New Update</h3>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium text-sm">New Chats</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="gradient-primary border-0 shadow-soft text-xs h-5">
                          12+
                        </Badge>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium text-sm">Order Reviews - Lab Test</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="gradient-primary border-0 shadow-soft text-xs h-5">
                          2+
                        </Badge>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium text-sm">Order Reviews - Medical Imaging</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium text-sm">Notification</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="gradient-primary border-0 shadow-soft text-xs h-5">
                          20+
                        </Badge>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CriticalCasesTable />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
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

export default function DoctorDashboard() {
  return (
    <AuthGuard allowedRoles={['DOCTOR']}>
      <DoctorDashboardContent />
    </AuthGuard>
  )
}

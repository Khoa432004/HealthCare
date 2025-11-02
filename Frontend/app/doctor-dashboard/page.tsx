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
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ paddingTop: '16px' }}>
        <header className="bg-white py-4 mx-4 mb-4" style={{ borderRadius: '16px', paddingLeft: '32px', paddingRight: '24px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  type="search"
                  placeholder="Search..." 
                  className="pl-10 bg-gray-50 border-gray-200" 
                />
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/clean-female-doctor.png" />
                      <AvatarFallback>{userInfo ? getInitials(userInfo.fullName) : 'DR'}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{userInfo?.fullName || 'Doctor'}</p>
                      <p className="text-xs text-gray-500">Bác sĩ</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push('/my-profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                    </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 flex">
          {/* Main Dashboard Area */}
          <div className="flex-1 px-6 pb-6">
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

export default function DoctorDashboard() {
  return (
    <AuthGuard allowedRoles={['DOCTOR']}>
      <DoctorDashboardContent />
    </AuthGuard>
  )
}

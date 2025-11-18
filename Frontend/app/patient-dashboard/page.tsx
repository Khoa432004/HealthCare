"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Bell, ChevronRight, LayoutDashboard, Calendar, User, LogOut, Activity, FileText, Heart, MessageSquare, Settings } from "lucide-react"
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
import PatientMetricsCards from "@/components/patient-metrics-cards"
import { HealthMetricsChart } from "@/components/health-metrics-chart"
import { LatestMeasurements } from "@/components/latest-measurements"
import PatientAppointmentsSidebar from "@/components/patient-appointments-sidebar"
import MedicalHistoryTable from "@/components/medical-history-table"
import { authService } from "@/services/auth.service"
import { AuthGuard } from "@/components/auth-guard"

function PatientDashboardContent() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        fullName: user.fullName || 'Patient',
        role: user.role || 'PATIENT'
      })
    }
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

        {/* Dashboard Content */}
        <div className="flex-1 flex">
          {/* Main Dashboard Area */}
          <div className="flex-1 px-4 pb-4">
            <PatientMetricsCards />

            {/* Charts and Updates Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-1">
                <HealthMetricsChart />
              </div>

              <div className="lg:col-span-2">
                <div className="glass rounded-2xl shadow-soft-lg border-white/50 p-4 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold bg-gradient-to-r from-[#16a1bd] to-[#16a1bd] bg-clip-text text-transparent">Health Updates</h3>
                </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium text-sm">New Lab Results</span>
                        <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="gradient-primary border-0 shadow-soft text-xs h-5">
                          3
                          </Badge>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                          </div>

                    <div className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium text-sm">Upcoming Appointments</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="gradient-primary border-0 shadow-soft text-xs h-5">
                          2
                        </Badge>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium text-sm">Medication Reminders</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium text-sm">Health Tips</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="gradient-primary border-0 shadow-soft text-xs h-5">
                          5
                        </Badge>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <MedicalHistoryTable />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  <LatestMeasurements />

              <div className="glass rounded-2xl shadow-soft-lg border-white/50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold bg-gradient-to-r from-[#16a1bd] to-[#16a1bd] bg-clip-text text-transparent">Quick Actions</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/patient-calendar/booking">
                    <Button className="h-16 flex flex-col items-center justify-center glass hover:bg-white transition-smooth w-full">
                      <Calendar className="w-5 h-5 mb-1.5 text-[#16a1bd]" />
                      <span className="text-xs font-medium">Book Appointment</span>
                    </Button>
                  </Link>
                  <Button className="h-16 flex flex-col items-center justify-center glass hover:bg-white transition-smooth">
                    <MessageSquare className="w-5 h-5 mb-1.5 text-[#16a1bd]" />
                    <span className="text-xs font-medium">Chat with Doctor</span>
                  </Button>
                  <Button className="h-16 flex flex-col items-center justify-center glass hover:bg-white transition-smooth">
                    <FileText className="w-5 h-5 mb-1.5 text-[#16a1bd]" />
                    <span className="text-xs font-medium">View Reports</span>
                  </Button>
                  <Button className="h-16 flex flex-col items-center justify-center glass hover:bg-white transition-smooth">
                    <Activity className="w-5 h-5 mb-1.5 text-[#16a1bd]" />
                    <span className="text-xs font-medium">Health Tracking</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <PatientAppointmentsSidebar />
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

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Bell, ChevronRight, LayoutDashboard, Calendar, User, LogOut, Activity, FileText, Heart, MessageSquare, Settings } from "lucide-react"
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
import { PatientSidebar } from "@/components/patient-sidebar"
import PatientMetricsCards from "@/components/patient-metrics-cards"
import { HealthMetricsChart } from "@/components/health-metrics-chart"
import { LatestMeasurements } from "@/components/latest-measurements"
import PatientAppointmentsSidebar from "@/components/patient-appointments-sidebar"
import MedicalHistoryTable from "@/components/medical-history-table"
import { authService } from "@/services/auth.service"

export default function PatientDashboard() {
  const router = useRouter()

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
              <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>TE</AvatarFallback>
              </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">Test stag patient</p>
                      <p className="text-xs text-gray-500">Patient</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push('/patient-profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
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
            <PatientMetricsCards />

            {/* Charts and Updates Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1">
                <HealthMetricsChart />
              </div>

              <div className="lg:col-span-2">
                <div className="glass rounded-3xl shadow-soft-lg border-white/50 p-6 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-[#16a1bd] to-[#16a1bd] bg-clip-text text-transparent">Health Updates</h3>
                </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 glass rounded-2xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium">New Lab Results</span>
                        <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="gradient-primary border-0 shadow-soft">
                          3
                          </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                          </div>

                    <div className="flex items-center justify-between p-4 glass rounded-2xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium">Upcoming Appointments</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="gradient-primary border-0 shadow-soft">
                          2
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 glass rounded-2xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium">Medication Reminders</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 glass rounded-2xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                      <span className="text-gray-700 font-medium">Health Tips</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="gradient-primary border-0 shadow-soft">
                          5
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <MedicalHistoryTable />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <LatestMeasurements />

              <div className="glass rounded-3xl shadow-soft-lg border-white/50 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-[#16a1bd] to-[#16a1bd] bg-clip-text text-transparent">Quick Actions</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/patient-calendar/booking">
                    <Button className="h-20 flex flex-col items-center justify-center glass hover:bg-white transition-smooth w-full">
                      <Calendar className="w-6 h-6 mb-2 text-[#16a1bd]" />
                      <span className="text-sm font-medium">Book Appointment</span>
                    </Button>
                  </Link>
                  <Button className="h-20 flex flex-col items-center justify-center glass hover:bg-white transition-smooth">
                    <MessageSquare className="w-6 h-6 mb-2 text-[#16a1bd]" />
                    <span className="text-sm font-medium">Chat with Doctor</span>
                  </Button>
                  <Button className="h-20 flex flex-col items-center justify-center glass hover:bg-white transition-smooth">
                    <FileText className="w-6 h-6 mb-2 text-[#16a1bd]" />
                    <span className="text-sm font-medium">View Reports</span>
                  </Button>
                  <Button className="h-20 flex flex-col items-center justify-center glass hover:bg-white transition-smooth">
                    <Activity className="w-6 h-6 mb-2 text-[#16a1bd]" />
                    <span className="text-sm font-medium">Health Tracking</span>
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

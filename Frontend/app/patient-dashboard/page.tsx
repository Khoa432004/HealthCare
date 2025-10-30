"use client"

import { useState } from "react"
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
  const [showNotifications, setShowNotifications] = useState(false)

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

  const notifications = [
    {
      title: "Appointment Reminder",
      message: "Your appointment with Dr. Phạm Linh is scheduled for tomorrow at 2:00 PM.",
      time: "15 min ago",
    },
    {
      title: "Lab Results Available",
      message: "Your blood test results from last week are now available for review.",
      time: "1 hour ago",
    },
    {
      title: "Medication Reminder",
      message: "Don't forget to take your morning medication at 8:00 AM.",
      time: "2 hours ago",
    },
    {
      title: "Health Check-up",
      message: "Your monthly health check-up is due next week.",
      time: "1 day ago",
    },
  ]

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#e5f5f8' }}>
      <PatientSidebar />

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

              {/* Notifications */}
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

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl hover:bg-white/50 transition-smooth">
                    <Avatar className="w-9 h-9 ring-2 ring-white shadow-soft">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="gradient-primary text-white font-semibold">TE</AvatarFallback>
              </Avatar>
                    <div className="hidden md:block">
                      <p className="text-sm font-semibold text-gray-700">Test stag patient</p>
                      <p className="text-xs text-gray-500">Patient</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-white/50 shadow-soft-lg">
                  <div className="px-3 py-3 border-b border-white/50">
                    <p className="font-semibold text-gray-900">Test stag patient</p>
                    <p className="text-xs text-gray-500 font-medium">Patient</p>
                  </div>
                  <DropdownMenuItem 
                    onClick={() => router.push('/patient-profile')}
                    className="flex items-center space-x-3 px-3 py-2 hover:bg-white/50 transition-smooth cursor-pointer"
                  >
                      <User className="w-4 h-4 text-[#16a1bd]" />
                      <span className="font-medium">My Profile</span>
                    </DropdownMenuItem>
                  
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

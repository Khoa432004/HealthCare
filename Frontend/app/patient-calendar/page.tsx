"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Calendar, ChevronLeft, ChevronRight, Filter, Plus, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authService } from "@/services/auth.service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PatientSidebar } from "@/components/patient-sidebar"
import { CalendarMonthView } from "@/components/calendar-month-view"
import { CalendarWeekView } from "@/components/calendar-week-view"
import { CalendarDayView } from "@/components/calendar-day-view"
import { LoadingSpinner } from "@/components/loading-spinner"

type ViewMode = "month" | "week" | "day"

export default function PatientCalendar() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)) // October 1, 2025
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)
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
      authService.clearAuthData()
      router.push('/login')
    }
  }

  const handleCreateAppointment = async () => {
    setIsCreatingAppointment(true)
    try {
      // Simulate creating appointment
      await new Promise(resolve => setTimeout(resolve, 800))
      // Show success message
      alert('Appointment booked successfully!')
    } catch (error) {
      console.error('Error creating appointment:', error)
    } finally {
      setIsCreatingAppointment(false)
    }
  }

  const [filters, setFilters] = useState({
    upcoming: false,
    pending: false,
    cancelled: false,
    completed: false,
  })

  const getDateRangeText = () => {
    if (viewMode === "month") {
      return `${currentDate.toLocaleString("default", { month: "long" })} 1 - 31, ${currentDate.getFullYear()}`
    } else if (viewMode === "week") {
      return "October 6 - 12, 2025"
    } else {
      return `${currentDate.toLocaleString("default", { month: "long" })} 10, ${currentDate.getFullYear()}`
    }
  }

  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
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
                <Calendar className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-semibold text-gray-900">My Calendar</h1>
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
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>{userInfo ? getInitials(userInfo.fullName) : 'PT'}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{userInfo?.fullName || 'Patient'}</p>
                      <p className="text-xs text-gray-500">Bệnh nhân</p>
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

        {/* Calendar Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Calendar Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  className="glass border-[#16a1bd] text-[#16a1bd] hover:gradient-primary hover:text-white rounded-xl transition-smooth"
                  onClick={goToToday}
                >
                  Today
                </Button>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={navigatePrevious}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="text-sm font-medium min-w-[200px] text-center">{getDateRangeText()}</span>
                  <Button variant="ghost" size="icon" onClick={navigateNext}>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DropdownMenu open={showFilterDropdown} onOpenChange={setShowFilterDropdown}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl border-[#16a1bd] glass hover:bg-white/50 transition-smooth">
                      <Filter className="w-4 h-4 text-[#16a1bd]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="p-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="upcoming"
                          checked={filters.upcoming}
                          onCheckedChange={(checked) => setFilters({ ...filters, upcoming: checked as boolean })}
                        />
                        <label htmlFor="upcoming" className="text-sm cursor-pointer">
                          Up coming
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pending"
                          checked={filters.pending}
                          onCheckedChange={(checked) => setFilters({ ...filters, pending: checked as boolean })}
                        />
                        <label htmlFor="pending" className="text-sm cursor-pointer">
                          Pending
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cancelled"
                          checked={filters.cancelled}
                          onCheckedChange={(checked) => setFilters({ ...filters, cancelled: checked as boolean })}
                        />
                        <label htmlFor="cancelled" className="text-sm cursor-pointer">
                          Cancelled
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="completed"
                          checked={filters.completed}
                          onCheckedChange={(checked) => setFilters({ ...filters, completed: checked as boolean })}
                        />
                        <label htmlFor="completed" className="text-sm cursor-pointer">
                          Completed
                        </label>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                  <SelectTrigger className="w-32 glass border-[#16a1bd] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>

                <Link href="/patient-calendar/booking">
                  <Button className="gradient-primary hover:opacity-90 text-white rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-smooth">
                    <Plus className="w-4 h-4 mr-2" />
                    Book appointment
                  </Button>
                </Link>
              </div>
            </div>

            {/* Calendar View */}
            <div className="flex-1 overflow-auto">
              {viewMode === "month" && <CalendarMonthView currentDate={currentDate} />}
              {viewMode === "week" && <CalendarWeekView currentDate={currentDate} />}
              {viewMode === "day" && <CalendarDayView currentDate={currentDate} />}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

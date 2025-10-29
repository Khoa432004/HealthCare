"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Bell, Calendar, ChevronLeft, ChevronRight, Filter, Plus, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { LoadingSpinner, PageLoadingSpinner } from "@/components/loading-spinner"

type ViewMode = "month" | "week" | "day"

export default function PatientCalendar() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)) // October 1, 2025
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Simulate API calls for calendar data
        await new Promise(resolve => setTimeout(resolve, 900))
      } catch (error) {
        console.error('Error loading calendar data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

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
  ]

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


  if (isLoading) {
    return <PageLoadingSpinner />
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#e5f5f8' }}>
      <PatientSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b px-6 py-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl shadow-soft-md">
                <div className="w-5 h-5 gradient-primary rounded-lg flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-[#16a1bd]">My calendar</h1>
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
                  <Link href="/patient-profile">
                    <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 hover:bg-white/50 transition-smooth">
                      <User className="w-4 h-4 text-[#16a1bd]" />
                      <span className="font-medium">My Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  
                  <DropdownMenuSeparator className="border-white/50" />
                  <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 transition-smooth">
                    <span className="font-medium">Logout</span>
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

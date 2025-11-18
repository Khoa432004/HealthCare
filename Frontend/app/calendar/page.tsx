"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Filter, ChevronLeft, ChevronRight, Plus, Calendar, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authService } from "@/services/auth.service"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import DoctorSidebar from "@/components/doctor-sidebar"
import { CalendarMonthView } from "@/components/calendar-month-view"
import { CalendarWeekView } from "@/components/calendar-week-view"
import { CalendarDayView } from "@/components/calendar-day-view"
import { NewAppointmentModal } from "@/components/new-appointment-modal"
import { LoadingSpinner } from "@/components/loading-spinner"
import { appointmentService, Appointment } from "@/services/appointment.service"
import { ErrorBanner } from "@/components/error-banner"
import { useToast } from "@/hooks/use-toast"

type ViewMode = "month" | "week" | "day"

export default function CalendarPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [currentDate, setCurrentDate] = useState(new Date()) // Current month
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [filterDropdownError, setFilterDropdownError] = useState(false)

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
      authService.clearAuthData()
      router.push('/login')
    }
  }

  const handleCreateAppointment = () => {
    // Simply open the modal - the actual creation will happen inside the modal
    setShowAppointmentModal(true)
  }
  // Initialize filters with fallback: all statuses selected (show all)
  const [filters, setFilters] = useState({
    upcoming: false,
    pending: false,
    cancelled: false,
    completed: false,
  })
  const [filtersInitialized, setFiltersInitialized] = useState(false)

  // Initialize filters on mount (2.B - fallback to all statuses)
  useEffect(() => {
    try {
      // Try to load from localStorage or use fallback
      const savedFilters = localStorage.getItem('calendar-filters')
      if (savedFilters) {
        try {
          const parsed = JSON.parse(savedFilters)
          setFilters(parsed)
        } catch (e) {
          // If parsing fails, use fallback (all false = show all)
          setFilters({
            upcoming: false,
            pending: false,
            cancelled: false,
            completed: false,
          })
        }
      } else {
        // Fallback: all false (show all appointments)
        setFilters({
          upcoming: false,
          pending: false,
          cancelled: false,
          completed: false,
        })
      }
      setFiltersInitialized(true)
    } catch (error) {
      console.error('Error initializing filters:', error)
      // Fallback values
      setFilters({
        upcoming: false,
        pending: false,
        cancelled: false,
        completed: false,
      })
      setFiltersInitialized(true)
    }
  }, [])

  // Save filters to localStorage when they change
  useEffect(() => {
    if (filtersInitialized) {
      try {
        localStorage.setItem('calendar-filters', JSON.stringify(filters))
      } catch (error) {
        console.error('Error saving filters:', error)
      }
    }
  }, [filters, filtersInitialized])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false)

  // Filter appointments based on selected filters
  const getFilteredAppointments = (): Appointment[] => {
    try {
      // If no filters are selected, show all appointments (3.A validation handled separately)
      const hasActiveFilter = Object.values(filters).some(value => value === true)
      if (!hasActiveFilter) {
        return appointments
      }

      return appointments.filter((appointment) => {
        const status = appointment.status?.toUpperCase()

        // Map appointment status to filter categories
        if (status === 'SCHEDULED' || status === 'IN_PROCESS') {
          return filters.upcoming
        }
        if (status === 'CANCELED') {
          return filters.cancelled
        }
        if (status === 'COMPLETED') {
          return filters.completed
        }
        // Default/unknown status goes to pending
        return filters.pending
      })
    } catch (error) {
      console.error('Error filtering appointments:', error)
      // On error, show all appointments
      return appointments
    }
  }

  // Handle filter change - allow unchecking last filter to clear all
  const handleFilterChange = (filterKey: keyof typeof filters, checked: boolean) => {
    try {
      const newFilters = { ...filters, [filterKey]: checked }
      
      // If unchecking and this was the last selected filter, clear all
      if (!checked) {
        const otherFiltersSelected = Object.entries(newFilters)
          .filter(([key, value]) => key !== filterKey && value === true)
          .length > 0
        
        if (!otherFiltersSelected) {
          // This was the last selected filter, clear all
          setFilters({
            upcoming: false,
            pending: false,
            cancelled: false,
            completed: false,
          })
          setFilterError(null)
          return
        }
      }

      setFilterError(null)
      setFilters(newFilters)
    } catch (error) {
      console.error('Error changing filter:', error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bộ lọc. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  // Handle filter dropdown open (2.A)
  const handleFilterDropdownOpen = (open: boolean) => {
    try {
      setShowFilterDropdown(open)
      setFilterDropdownError(false)
      if (open) {
        setFilterError(null)
      }
    } catch (error) {
      console.error('Error opening filter dropdown:', error)
      setFilterDropdownError(true)
      toast({
        title: "Lỗi",
        description: "Không thể mở bộ lọc. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }
  const [error, setError] = useState<{
    type: 'permission' | 'initialization' | 'data'
    message: string
  } | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [calendarInitialized, setCalendarInitialized] = useState(false)

  // Check permission on mount
  useEffect(() => {
    const checkPermission = () => {
      try {
        const user = authService.getUserInfo()
        if (!user) {
          setHasPermission(false)
          setError({
            type: 'permission',
            message: 'Bạn không có quyền truy cập Lịch khám.'
          })
          return
        }

        const userRole = user.role?.toUpperCase()
        if (userRole !== 'DOCTOR') {
          setHasPermission(false)
          setError({
            type: 'permission',
            message: 'Bạn không có quyền truy cập Lịch khám.'
          })
          return
        }

        setHasPermission(true)
      } catch (err) {
        console.error('Error checking permission:', err)
        setHasPermission(false)
        setError({
          type: 'permission',
          message: 'Bạn không có quyền truy cập Lịch khám.'
        })
      }
    }

    checkPermission()
  }, [])

  // Initialize calendar UI
  useEffect(() => {
    if (hasPermission === false) return

    try {
      // Simulate calendar initialization
      if (typeof window !== 'undefined') {
        setCalendarInitialized(true)
        setError(null)
      }
    } catch (err) {
      console.error('Error initializing calendar:', err)
      setCalendarInitialized(false)
      setError({
        type: 'initialization',
        message: 'Không thể khởi tạo lịch.'
      })
    }
  }, [hasPermission])

  // Fetch appointments when currentDate or viewMode changes
  useEffect(() => {
    if (!hasPermission || !calendarInitialized) return

    const fetchAppointments = async () => {
      try {
        setIsLoadingAppointments(true)
        setError(null)
        
        // Calculate date range for current month/week/day
        const startDate = new Date(currentDate)
        const endDate = new Date(currentDate)
        
        if (viewMode === "month") {
          startDate.setDate(1)
          startDate.setHours(0, 0, 0, 0)
          const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          endDate.setDate(lastDay.getDate())
          endDate.setHours(23, 59, 59, 999)
        } else if (viewMode === "week") {
          const dayOfWeek = startDate.getDay()
          const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday as first day
          startDate.setDate(startDate.getDate() + diff)
          startDate.setHours(0, 0, 0, 0)
          endDate.setDate(startDate.getDate() + 6)
          endDate.setHours(23, 59, 59, 999)
        } else {
          startDate.setHours(0, 0, 0, 0)
          endDate.setHours(23, 59, 59, 999)
        }
        
        const fetchedAppointments = await appointmentService.getAppointmentsByDateRange(
          startDate.toISOString(),
          endDate.toISOString()
        )
        
        setAppointments(fetchedAppointments)
      } catch (error: any) {
        console.error("Error fetching appointments:", error)
        
        // Check if it's a network error (3.B)
        if (!navigator.onLine || error.message?.includes('network') || error.message?.includes('fetch')) {
          toast({
            title: "Mất kết nối mạng",
            description: "Mất kết nối mạng. Vui lòng thử lại.",
            variant: "destructive",
          })
        } else {
          // Check if filters are applied (4.A)
          const hasActiveFilter = Object.values(filters).some(value => value === true)
          if (hasActiveFilter) {
            setError({
              type: 'data',
              message: 'Không thể tải dữ liệu lịch theo bộ lọc.'
            })
          } else {
            setError({
              type: 'data',
              message: 'Không thể tải dữ liệu lịch.'
            })
          }
        }
        
        setAppointments([])
      } finally {
        setIsLoadingAppointments(false)
      }
    }

    fetchAppointments()
  }, [currentDate, viewMode, hasPermission, calendarInitialized, filters, toast])

  const getDateRangeText = () => {
    if (viewMode === "month") {
      const monthName = currentDate.toLocaleString("default", { month: "long" })
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
      return `${monthName} 1 - ${lastDay}, ${currentDate.getFullYear()}`
    } else if (viewMode === "week") {
      const startOfWeek = new Date(currentDate)
      const dayOfWeek = startOfWeek.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      startOfWeek.setDate(startOfWeek.getDate() + diff)
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6)
      
      const startMonth = startOfWeek.toLocaleString("default", { month: "short" })
      const startDay = startOfWeek.getDate()
      const endMonth = endOfWeek.toLocaleString("default", { month: "short" })
      const endDay = endOfWeek.getDate()
      const year = startOfWeek.getFullYear()
      
      if (startMonth === endMonth && startOfWeek.getFullYear() === endOfWeek.getFullYear()) {
        return `${startMonth} ${startDay} - ${endDay}, ${year}`
      } else {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
      }
    } else {
      const monthName = currentDate.toLocaleString("default", { month: "long" })
      const day = currentDate.getDate()
      return `${monthName} ${day}, ${currentDate.getFullYear()}`
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

  // Get count of active filters
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value === true).length
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
                <Calendar className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
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
                  {/* <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    </DropdownMenuItem> */}
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

        {/* Calendar Controls */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="glass border-[#16a1bd] text-[#16a1bd] hover:gradient-primary hover:text-white rounded-xl transition-smooth bg-transparent"
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
              <DropdownMenu 
                open={showFilterDropdown && !filterDropdownError} 
                onOpenChange={handleFilterDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl border-[#16a1bd] glass hover:bg-white/50 transition-smooth bg-transparent relative"
                    disabled={filterDropdownError}
                  >
                    <Filter className="w-4 h-4 text-[#16a1bd]" />
                    {getActiveFilterCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#16a1bd] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="p-2 space-y-2">
                    <div className="flex items-center justify-between px-2 pb-2 border-b">
                      <span className="text-sm font-semibold text-gray-700">Filter by Status</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="upcoming"
                        checked={filters.upcoming}
                        onCheckedChange={(checked) => handleFilterChange('upcoming', checked as boolean)}
                      />
                      <label htmlFor="upcoming" className="text-sm cursor-pointer">
                        Up coming
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pending"
                        checked={filters.pending}
                        onCheckedChange={(checked) => handleFilterChange('pending', checked as boolean)}
                      />
                      <label htmlFor="pending" className="text-sm cursor-pointer">
                        Pending
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cancelled"
                        checked={filters.cancelled}
                        onCheckedChange={(checked) => handleFilterChange('cancelled', checked as boolean)}
                      />
                      <label htmlFor="cancelled" className="text-sm cursor-pointer">
                        Cancelled
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="completed"
                        checked={filters.completed}
                        onCheckedChange={(checked) => handleFilterChange('completed', checked as boolean)}
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

              <Button
                className="gradient-primary hover:opacity-90 text-white rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-smooth"
                onClick={handleCreateAppointment}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-6">
            <ErrorBanner 
              message={error.message} 
              onClose={() => setError(null)}
              type="error"
            />
          </div>
        )}

        {/* Calendar View */}
        <div className="flex-1 overflow-auto p-6">
          {hasPermission === false ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Bạn không có quyền truy cập Lịch khám.
                </p>
                <Button
                  onClick={() => router.push('/doctor-dashboard')}
                  className="gradient-primary text-white"
                >
                  Quay về Dashboard
                </Button>
              </div>
            </div>
          ) : !calendarInitialized ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Không thể khởi tạo lịch.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="gradient-primary text-white"
                >
                  Tải lại trang
                </Button>
              </div>
            </div>
          ) : isLoadingAppointments ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {viewMode === "month" && (
                <CalendarMonthView 
                  currentDate={currentDate} 
                  appointments={getFilteredAppointments()}
                  userRole="DOCTOR"
                />
              )}
              {viewMode === "week" && (
                <CalendarWeekView 
                  currentDate={currentDate}
                  appointments={getFilteredAppointments()}
                  userRole="DOCTOR"
                />
              )}
              {viewMode === "day" && (
                <CalendarDayView 
                  currentDate={currentDate}
                  appointments={getFilteredAppointments()}
                  userRole="DOCTOR"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showAppointmentModal && (
        <NewAppointmentModal 
          onClose={() => setShowAppointmentModal(false)}
          onSuccess={() => {
            setShowAppointmentModal(false)
            // Refresh appointments after successful creation
            const fetchAppointments = async () => {
              try {
                setIsLoadingAppointments(true)
                const startDate = new Date(currentDate)
                const endDate = new Date(currentDate)
                
                if (viewMode === "month") {
                  startDate.setDate(1)
                  startDate.setHours(0, 0, 0, 0)
                  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
                  endDate.setDate(lastDay.getDate())
                  endDate.setHours(23, 59, 59, 999)
                } else if (viewMode === "week") {
                  const dayOfWeek = startDate.getDay()
                  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                  startDate.setDate(startDate.getDate() + diff)
                  startDate.setHours(0, 0, 0, 0)
                  endDate.setDate(startDate.getDate() + 6)
                  endDate.setHours(23, 59, 59, 999)
                } else {
                  startDate.setHours(0, 0, 0, 0)
                  endDate.setHours(23, 59, 59, 999)
                }
                
                const fetchedAppointments = await appointmentService.getAppointmentsByDateRange(
                  startDate.toISOString(),
                  endDate.toISOString()
                )
                
                setAppointments(fetchedAppointments)
              } catch (error) {
                console.error("Error refreshing appointments:", error)
              } finally {
                setIsLoadingAppointments(false)
              }
            }
            fetchAppointments()
          }}
        />
      )}
    </div>
  )
}

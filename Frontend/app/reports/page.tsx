"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, LayoutDashboard, User, Settings, LogOut, RefreshCw, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DoctorUserMenu } from "@/components/doctor-user-menu"
import DoctorSidebar from "@/components/doctor-sidebar"
import { PageHeaderTitleRow } from "@/components/page-header-title-row"
import { authService } from "@/services/auth.service"
import { AuthGuard } from "@/components/auth-guard"
import { doctorStatisticsService, DoctorStatisticsFilter, DoctorStatistics } from "@/services/doctor-statistics.service"
import DoctorStatisticsKPICards from "@/components/doctor-statistics-kpi-cards"
import PendingReportsTable from "@/components/pending-reports-table"
import StatisticsFilter from "@/components/statistics-filter"

function ReportsContent() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null)
  const [statistics, setStatistics] = useState<DoctorStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<DoctorStatisticsFilter>({ period: 'today' })
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        fullName: user.fullName || 'Doctor',
        role: user.role || 'DOCTOR'
      })
    }
  }, [])

  useEffect(() => {
    loadStatistics()
  }, [filter])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const data = await doctorStatisticsService.getDoctorStatistics(filter)
      setStatistics(data)
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilter: DoctorStatisticsFilter) => {
    setFilter(newFilter)
    setShowFilter(false)
  }

  const handleRefresh = () => {
    loadStatistics()
  }

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

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#E8F5F1' }}>
      <DoctorSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ paddingTop: '12px' }}>
        <header className="bg-white py-3 mx-3 mb-3" style={{ borderRadius: '14px', paddingLeft: '24px', paddingRight: '20px' }}>
          <div className="flex items-center justify-between">
            <PageHeaderTitleRow
              role="doctor"
              icon={LayoutDashboard}
              title="Báo cáo"
              titleClassName="text-lg"
            />

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
              <DoctorUserMenu userInfo={userInfo} />
            </div>
          </div>
        </header>

        {/* Statistics Content */}
        <div className="flex-1 px-4 pb-4">
          {/* Filter Toolbar */}
          <div className="bg-white rounded-2xl shadow-soft-lg border-white/50 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilter(!showFilter)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Lọc</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                {filter.period === 'today' && 'Hôm nay'}
                {filter.period === 'yesterday' && 'Hôm qua'}
                {filter.period === 'last7days' && '7 ngày gần đây'}
                {filter.period === 'thisMonth' && 'Tháng này'}
                {filter.period === 'custom' && `${filter.fromDate} - ${filter.toDate}`}
              </div>
            </div>

            {/* Filter Panel */}
            {showFilter && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <StatisticsFilter
                  currentFilter={filter}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}
          </div>

          {/* KPI Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : statistics ? (
            <>
              <DoctorStatisticsKPICards statistics={statistics} />
              
              {/* Pending Reports Table */}
              <div className="mt-4 bg-white rounded-2xl shadow-soft-lg border-white/50 p-4">
                <h2 className="text-base font-semibold mb-4" style={{ color: '#007A94' }}>
                  Ca khám chờ hoàn thành báo cáo
                </h2>
                <PendingReportsTable 
                  appointments={statistics.pendingReports}
                  onAppointmentClick={(appointmentId) => {
                    // Navigate to appointment detail page with medical report tab (UC-06)
                    router.push(`/calendar/appointment/${appointmentId}?tab=medical-report`)
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Không có dữ liệu</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Reports() {
  return (
    <AuthGuard allowedRoles={['DOCTOR']}>
      <ReportsContent />
    </AuthGuard>
  )
}


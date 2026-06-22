'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Loader2 } from 'lucide-react'
import { dashboardService, type DashboardStats, type DashboardFilter } from '@/services/dashboard.service'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

export function AdminOverview() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<DashboardFilter['period']>('week')
  const [customFromDate, setCustomFromDate] = useState('')
  const [customToDate, setCustomToDate] = useState('')
  const { toast } = useToast()

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      const filter: DashboardFilter = {
        period,
        ...(period === 'custom' && {
          fromDate: customFromDate,
          toDate: customToDate,
        }),
      }
      const data = await dashboardService.getDashboardStats(filter)
      setStats(data)
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('dashboardLoadFailed'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (period !== 'custom') {
      loadDashboardStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  const handlePeriodChange = (value: string) => {
    setPeriod(value as DashboardFilter['period'])
    if (value !== 'custom') {
      setCustomFromDate('')
      setCustomToDate('')
    }
  }

  const handleApplyCustomDate = () => {
    if (period === 'custom' && customFromDate && customToDate) {
      loadDashboardStats()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getPeriodLabel = () => {
    switch (period) {
      case 'today':
        return t('todayPeriod')
      case 'week':
        return t('thisWeek')
      case 'month':
        return t('thisMonth')
      case 'year':
        return t('thisYear')
      case 'custom':
        return t('custom')
      default:
        return t('thisWeek')
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('systemOverview')}</h2>
          <p className="text-muted-foreground">{t('statisticsDashboard')}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('selectTime')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t('todayPeriod')}</SelectItem>
              <SelectItem value="week">{t('thisWeek')}</SelectItem>
              <SelectItem value="month">{t('thisMonth')}</SelectItem>
              <SelectItem value="year">{t('thisYear')}</SelectItem>
              <SelectItem value="custom">{t('custom')}</SelectItem>
            </SelectContent>
          </Select>

          {period === 'custom' && (
            <>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="fromDate" className="text-xs">{t('fromDate')}</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={customFromDate}
                    onChange={(e) => setCustomFromDate(e.target.value)}
                    className="w-[150px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="toDate" className="text-xs">{t('toDate')}</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={customToDate}
                    onChange={(e) => setCustomToDate(e.target.value)}
                    className="w-[150px]"
                  />
                </div>
                <Button onClick={handleApplyCustomDate} className="mt-5">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('apply')}
                </Button>
              </div>
            </>
          )}

          {period !== 'custom' && (
            <Button onClick={loadDashboardStats} variant="outline">
              {t('refresh')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsersCard', 'Total Users')}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">{t('totalUsersDesc', 'Total users')}</p>
          </CardContent>
        </Card>

        {/* Pending Doctors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pendingDoctorsCard', 'Pending Doctors')}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingDoctors || 0}</div>
            <p className="text-xs text-muted-foreground">{t('awaitingApproval', 'Awaiting approval')}</p>
          </CardContent>
        </Card>

        {/* Total Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalAppointmentsCard', 'Total Appointments')} - {getPeriodLabel()}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('completed')}: {stats?.completedAppointments || 0} | {t('cancelled')}: {stats?.canceledAppointments || 0}
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('revenue')} - {getPeriodLabel()}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">{t('fromPaidAppointments', 'From paid appointments')}</p>
          </CardContent>
        </Card>

        {/* Doctor Salaries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('doctorSalariesCard', 'Doctor Salaries')} - {getPeriodLabel()}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <line x1="12" x2="12" y1="2" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats?.doctorSalaries || 0)}
            </div>
            <p className="text-xs text-muted-foreground">{t('percentOfRevenue85', '85% of revenue')}</p>
          </CardContent>
        </Card>

        {/* Platform Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('platformProfitCard', 'Platform Profit')} - {getPeriodLabel()}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats?.platformProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">{t('percentOfRevenue15', '15% of revenue')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t('appointmentAnalysis')} - {getPeriodLabel()}</CardTitle>
          <CardDescription>{t('appointmentStatusOverview', 'Overview of appointment statuses')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{t('scheduled')}</span>
              <span className="text-2xl font-bold text-blue-600">{stats?.scheduledAppointments || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{t('completed')}</span>
              <span className="text-2xl font-bold text-green-600">{stats?.completedAppointments || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{t('cancelled')}</span>
              <span className="text-2xl font-bold text-red-600">{stats?.canceledAppointments || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


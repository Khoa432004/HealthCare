"use client"

import { Users, CheckCircle2, Clock, DollarSign } from "lucide-react"
import { DoctorStatistics } from "@/services/doctor-statistics.service"

interface DoctorStatisticsKPICardsProps {
  statistics: DoctorStatistics
}

export default function DoctorStatisticsKPICards({ statistics }: DoctorStatisticsKPICardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const kpiCards = [
    {
      title: "Tổng BN hôm nay",
      value: statistics.totalPatientsToday,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Ca khám đã hoàn thành",
      value: statistics.completedAppointments,
      icon: CheckCircle2,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Ca khám chờ báo cáo",
      value: statistics.pendingReportAppointments,
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Doanh thu trong ngày",
      value: formatCurrency(statistics.dailyRevenue),
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {kpiCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-soft-lg border-white/50 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-5 h-5 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} style={{ color: card.color.includes('blue') ? '#3b82f6' : card.color.includes('green') ? '#10b981' : card.color.includes('orange') ? '#f97316' : '#a855f7' }} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}


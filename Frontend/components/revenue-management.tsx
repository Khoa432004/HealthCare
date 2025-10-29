"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Users,
  Stethoscope,
  CreditCard,
  Banknote,
  Receipt
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function RevenueManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedView, setSelectedView] = useState("overview")

  // Mock data for revenue metrics
  const revenueMetrics = [
    {
      title: "Total Revenue",
      value: "₫2,450,000,000",
      change: "+12.5%",
      trend: "up",
      period: "this month"
    },
    {
      title: "Consultation Fees",
      value: "₫1,200,000,000",
      change: "+8.3%",
      trend: "up",
      period: "this month"
    },
    {
      title: "Lab Tests",
      value: "₫850,000,000",
      change: "+15.7%",
      trend: "up",
      period: "this month"
    },
    {
      title: "Pharmacy Sales",
      value: "₫400,000,000",
      change: "-2.1%",
      trend: "down",
      period: "this month"
    }
  ]

  // Mock data for revenue by doctor
  const doctorRevenue = [
    {
      doctor: "Dr. Phạm Linh",
      specialty: "General Medicine",
      appointments: 245,
      revenue: 245000000,
      avgPerVisit: 1000000,
      change: "+8.2%"
    },
    {
      doctor: "Dr. Lê Minh",
      specialty: "Dentistry",
      appointments: 189,
      revenue: 283500000,
      avgPerVisit: 1500000,
      change: "+12.1%"
    },
    {
      doctor: "Dr. Hoàng Nam",
      specialty: "Laboratory",
      appointments: 156,
      revenue: 187200000,
      avgPerVisit: 1200000,
      change: "+5.4%"
    },
    {
      doctor: "Dr. Nguyễn Hoa",
      specialty: "Cardiology",
      appointments: 98,
      revenue: 196000000,
      avgPerVisit: 2000000,
      change: "+18.7%"
    },
    {
      doctor: "Dr. Trần Văn Đức",
      specialty: "Orthopedics",
      appointments: 134,
      revenue: 268000000,
      avgPerVisit: 2000000,
      change: "+3.2%"
    }
  ]

  // Mock data for payment methods
  const paymentMethods = [
    { method: "Bank Transfer", amount: 1470000000, percentage: 60, color: "bg-blue-500" },
    { method: "Credit Card", amount: 735000000, percentage: 30, color: "bg-green-500" },
    { method: "Cash", amount: 245000000, percentage: 10, color: "bg-yellow-500" }
  ]

  // Mock data for recent transactions
  const recentTransactions = [
    {
      id: "TXN001",
      patient: "Nguyễn Văn A",
      doctor: "Dr. Phạm Linh",
      service: "General Consultation",
      amount: 500000,
      method: "Bank Transfer",
      date: "2025-01-15",
      status: "completed"
    },
    {
      id: "TXN002",
      patient: "Trần Thị B",
      doctor: "Dr. Lê Minh",
      service: "Dental Treatment",
      amount: 1500000,
      method: "Credit Card",
      date: "2025-01-15",
      status: "completed"
    },
    {
      id: "TXN003",
      patient: "Lê Văn C",
      doctor: "Dr. Hoàng Nam",
      service: "Lab Test Package",
      amount: 800000,
      method: "Cash",
      date: "2025-01-14",
      status: "pending"
    },
    {
      id: "TXN004",
      patient: "Phạm Thị D",
      doctor: "Dr. Nguyễn Hoa",
      service: "Cardiology Consultation",
      amount: 2000000,
      method: "Bank Transfer",
      date: "2025-01-14",
      status: "completed"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white/70 border-white/50">
                <Calendar className="w-4 h-4 mr-2" />
                {selectedPeriod === "month" ? "This Month" : selectedPeriod === "week" ? "This Week" : "This Year"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedPeriod("week")}>This Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod("month")}>This Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod("year")}>This Year</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white/70 border-white/50">
                {selectedView === "overview" ? <BarChart3 className="w-4 h-4 mr-2" /> : <PieChart className="w-4 h-4 mr-2" />}
                {selectedView === "overview" ? "Overview" : "Detailed"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedView("overview")}>Overview</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedView("detailed")}>Detailed View</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white/70 border-white/50">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueMetrics.map((metric, index) => (
          <Card key={index} className="p-6 hover-lift shadow-soft border-white/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">{metric.title}</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent mb-2">
                  {metric.value}
                </p>
                <div className="flex items-center gap-1">
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-semibold ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {metric.change}
                  </span>
                  <span className="text-sm text-gray-500">vs last {metric.period.split(' ')[1]}</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payment Methods Chart */}
        <Card className="p-6 shadow-soft border-white/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Revenue by Payment Method
            </h3>
          </div>
          
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${method.color}`}></div>
                  <span className="font-medium">{method.method}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">₫{method.amount.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-gray-900">{method.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-gray-100 rounded-full h-2">
            <div className="flex h-2">
              <div className="bg-blue-500 rounded-l-full" style={{ width: '60%' }}></div>
              <div className="bg-green-500" style={{ width: '30%' }}></div>
              <div className="bg-yellow-500 rounded-r-full" style={{ width: '10%' }}></div>
            </div>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6 shadow-soft border-white/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Recent Transactions
            </h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{transaction.patient}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{transaction.id}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {transaction.doctor} • {transaction.service}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{transaction.date}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{transaction.method}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#1d2939]">
                    ₫{transaction.amount.toLocaleString()}
                  </div>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Doctor Revenue Table */}
      <Card className="p-6 shadow-soft border-white/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Revenue by Doctor
          </h3>
          <Button variant="outline" size="sm" className="bg-white/70 border-white/50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Doctor</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Specialty</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Appointments</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Revenue</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg/Visit</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Change</th>
              </tr>
            </thead>
            <tbody>
              {doctorRevenue.map((doctor, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="font-medium">{doctor.doctor}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{doctor.specialty}</td>
                  <td className="py-4 px-4 text-right font-medium">{doctor.appointments}</td>
                  <td className="py-4 px-4 text-right font-semibold text-emerald-600">
                    ₫{doctor.revenue.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    ₫{doctor.avgPerVisit.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-green-600 font-semibold text-sm">{doctor.change}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

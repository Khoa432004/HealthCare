"use client"

import { TrendingUp, TrendingDown, Heart, Activity, Calendar, FileText } from "lucide-react"

const metrics = [
  {
    title: "Health Score",
    value: "85",
    unit: "%",
    change: "+5%",
    changeText: "vs last month",
    trend: "up",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-100"
  },
  {
    title: "Active Medications",
    value: "3",
    unit: "meds",
    change: "0",
    changeText: "vs last month",
    trend: "stable",
    icon: Activity,
    color: "text-blue-500",
    bgColor: "bg-blue-100"
  },
  {
    title: "Upcoming Appointments",
    value: "2",
    unit: "appointments",
    change: "+1",
    changeText: "vs last month",
    trend: "up",
    icon: Calendar,
    color: "text-green-500",
    bgColor: "bg-green-100"
  },
  {
    title: "Lab Reports",
    value: "12",
    unit: "reports",
    change: "+3",
    changeText: "vs last month",
    trend: "up",
    icon: FileText,
    color: "text-purple-500",
    bgColor: "bg-purple-100"
  },
]

export default function PatientMetricsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {metrics.map((metric, index) => (
        <div key={index} className="glass rounded-3xl shadow-soft-md border-white/50 p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${metric.bgColor}`}>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
            {metric.trend === "up" ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : metric.trend === "down" ? (
              <TrendingDown className="w-5 h-5 text-red-500" />
            ) : (
              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
            )}
          </div>

          <h3 className="text-sm font-semibold text-gray-600 mb-2">{metric.title}</h3>

          <div className="flex items-baseline space-x-2 mb-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent">{metric.value}</span>
            <span className="text-sm text-gray-500 font-medium">{metric.unit}</span>
          </div>

          <div className="flex items-center space-x-1">
            <span className={`text-sm font-semibold ${
              metric.trend === "up" ? "text-green-600" : 
              metric.trend === "down" ? "text-red-600" : 
              "text-gray-600"
            }`}>
              {metric.change}
            </span>
            <span className="text-sm text-gray-500">{metric.changeText}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

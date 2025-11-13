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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {metrics.map((metric, index) => (
        <div key={index} className="glass rounded-2xl shadow-soft-md border-white/50 p-4 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl ${metric.bgColor}`}>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            {metric.trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : metric.trend === "down" ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            )}
          </div>

          <h3 className="text-xs font-semibold text-gray-600 mb-2">{metric.title}</h3>

          <div className="flex items-baseline space-x-1.5 mb-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent">{metric.value}</span>
            <span className="text-xs text-gray-500 font-medium">{metric.unit}</span>
          </div>

          <div className="flex items-center space-x-1">
            <span className={`text-xs font-semibold ${
              metric.trend === "up" ? "text-green-600" : 
              metric.trend === "down" ? "text-red-600" : 
              "text-gray-600"
            }`}>
              {metric.change}
            </span>
            <span className="text-xs text-gray-500">{metric.changeText}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

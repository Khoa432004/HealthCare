"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricItem {
  title: string
  value: string
  unit: string
  change: string
  changeText: string
  trend: "up" | "down"
  chartData: number[]
}

const defaultMetrics: MetricItem[] = [
  {
    title: "Total Appointments",
    value: "65",
    unit: "visits",
    change: "8%",
    changeText: "vs last month",
    trend: "up",
    chartData: [40, 45, 38, 50, 48, 55, 52, 60, 58, 65],
  },
  {
    title: "Consultation Time",
    value: "12",
    unit: "min",
    change: "20%",
    changeText: "vs last month",
    trend: "up",
    chartData: [15, 14, 16, 13, 14, 12, 13, 11, 12, 12],
  },
  {
    title: "Total Patients Today",
    value: "17",
    unit: "patients",
    change: "15%",
    changeText: "vs yesterday",
    trend: "down",
    chartData: [20, 22, 19, 21, 20, 18, 19, 17, 18, 17],
  },
  {
    title: "Patient Renewals",
    value: "25",
    unit: "patients",
    change: "7 ppl",
    changeText: "vs last month",
    trend: "up",
    chartData: [18, 20, 19, 22, 21, 23, 22, 24, 23, 25],
  },
]

interface DoctorMetricsCardsProps {
  metrics?: MetricItem[]
}

export default function DoctorMetricsCards({ metrics = defaultMetrics }: DoctorMetricsCardsProps) {
  const gridColsClass =
    metrics.length >= 4
      ? "lg:grid-cols-4"
      : metrics.length === 3
        ? "lg:grid-cols-3"
        : metrics.length === 2
          ? "lg:grid-cols-2"
          : "lg:grid-cols-1"

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${gridColsClass} gap-4 mb-4`}>
      {metrics.map((metric, index) => (
        <div key={index} className="glass rounded-2xl shadow-soft-md border-white/50 p-4 hover-lift">
          <h3 className="text-xs font-semibold text-gray-600 mb-2">{metric.title}</h3>

          <div className="flex items-baseline space-x-1.5 mb-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent">{metric.value}</span>
            <span className="text-xs text-gray-500 font-medium">{metric.unit}</span>
          </div>

          <div className="flex items-center space-x-1 mb-3">
            {metric.trend === "up" ? (
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            )}
            <span className={`text-xs font-semibold ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {metric.change}
            </span>
            <span className="text-xs text-gray-500">{metric.changeText}</span>
          </div>

          <div className="h-12 flex items-end justify-between space-x-1">
            {metric.chartData.map((value, i) => {
              const maxValue = Math.max(...metric.chartData)
              const height = (value / maxValue) * 100
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t-lg transition-all duration-300 hover:scale-110 ${metric.trend === "up" ? "bg-gradient-to-t from-green-400 to-green-200 shadow-soft" : "bg-gradient-to-t from-red-400 to-red-200 shadow-soft"}`}
                  style={{ height: `${height}%` }}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

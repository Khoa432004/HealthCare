"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"

interface RevenuePoint {
  day: number
  appointment: number
  package: number
}

interface AppointmentTrendChartProps {
  data?: RevenuePoint[]
  totalRevenue?: number
  revenueChangePercent?: number
  comparisonText?: string
}

const defaultData: RevenuePoint[] = Array.from({ length: 31 }).map((_, index) => ({
  day: index + 1,
  appointment: 0,
  package: 0,
}))

export default function AppointmentTrendChart({
  data = defaultData,
  totalRevenue = 0,
  revenueChangePercent = 0,
  comparisonText,
}: AppointmentTrendChartProps) {
  const { t } = useTranslation()
  const isDown = revenueChangePercent < 0
  const resolvedComparisonText = comparisonText ?? t("vsPreviousMonth")

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.day}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-700">{entry.name}:</span>
              <span className="font-semibold text-gray-900">{entry.value.toLocaleString()} {t("vnd")}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full min-h-[520px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("revenue")}</h3>

      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">{totalRevenue.toLocaleString()}</span>
          <span className="text-sm font-medium text-gray-500">{t("vnd")}</span>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <Badge
            variant="outline"
            className={
              isDown
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-green-50 text-green-600 border-green-200"
            }
          >
            {isDown ? "↓" : "↑"} {Math.abs(revenueChangePercent).toFixed(1)}%
          </Badge>
          <span className="text-sm text-gray-500">{resolvedComparisonText}</span>
        </div>
      </div>

      <div className="h-64 flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#9ca3af"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickFormatter={(value) => `${value / 1000}K`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#d1d5db", strokeDasharray: "5 5" }} />
            <Line
              type="monotone"
              dataKey="appointment"
              stroke="#007A94"
              strokeWidth={2}
              dot={{ fill: "#007A94", r: 3 }}
              activeDot={{ r: 6, fill: "#007A94" }}
              name={t("appointmentLegend")}
            />
            <Line
              type="monotone"
              dataKey="package"
              stroke="#9ca3af"
              strokeWidth={2}
              dot={{ fill: "#9ca3af", r: 3 }}
              activeDot={{ r: 6, fill: "#9ca3af" }}
              name={t("packageLegend")}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#007A94]" />
          <span className="text-sm text-gray-700">{t("appointmentLegend")}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-sm text-gray-700">{t("packageLegend")}</span>
        </div>
      </div>
    </div>
  )
}

"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Badge } from "@/components/ui/badge"

const generateData = () => {
  const data = []
  for (let i = 0; i <= 30; i++) {
    data.push({
      day: i,
      appointment: Math.floor(Math.random() * 500000) + 500000,
      package: Math.floor(Math.random() * 500000) + 300000,
    })
  }
  return data
}

const data = generateData()

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.day}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-700">{entry.name}:</span>
            <span className="font-semibold text-gray-900">{(entry.value / 1000).toFixed(0)}K</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AppointmentTrendChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Status Breakdown</h3>

      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">50,000,000</span>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            ↓ 12%
          </Badge>
          <span className="text-sm text-gray-500">vs Previous Month</span>
        </div>
      </div>

      <div className="h-64">
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
              stroke="#16a1bd"
              strokeWidth={2}
              dot={{ fill: "#16a1bd", r: 3 }}
              activeDot={{ r: 6, fill: "#16a1bd" }}
              name="Appointment"
            />
            <Line
              type="monotone"
              dataKey="package"
              stroke="#9ca3af"
              strokeWidth={2}
              dot={{ fill: "#9ca3af", r: 3 }}
              activeDot={{ r: 6, fill: "#9ca3af" }}
              name="Package"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#16a1bd]" />
          <span className="text-sm text-gray-700">Appointment</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-sm text-gray-700">Package</span>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"

const data = [
  { day: 1, sys: 120, dia: 80 },
  { day: 2, sys: 115, dia: 75 },
  { day: 3, sys: 125, dia: 85 },
  { day: 4, sys: 130, dia: 90 },
  { day: 5, sys: 118, dia: 78 },
  { day: 6, sys: 122, dia: 82 },
  { day: 7, sys: 128, dia: 88 },
  { day: 8, sys: 135, dia: 95 },
  { day: 9, sys: 140, dia: 100 },
  { day: 10, sys: 132, dia: 92 },
  { day: 11, sys: 125, dia: 85 },
  { day: 12, sys: 120, dia: 80 },
  { day: 13, sys: 115, dia: 75 },
  { day: 14, sys: 118, dia: 78 },
  { day: 15, sys: 122, dia: 82 },
  { day: 16, sys: 128, dia: 88 },
  { day: 17, sys: 135, dia: 95 },
  { day: 18, sys: 140, dia: 100 },
  { day: 19, sys: 132, dia: 92 },
  { day: 20, sys: 125, dia: 85 },
  { day: 21, sys: 120, dia: 80 },
  { day: 22, sys: 115, dia: 75 },
  { day: 23, sys: 118, dia: 78 },
  { day: 24, sys: 122, dia: 82 },
  { day: 25, sys: 128, dia: 88 },
  { day: 26, sys: 135, dia: 95 },
  { day: 27, sys: 140, dia: 100 },
  { day: 28, sys: 132, dia: 92 },
  { day: 29, sys: 125, dia: 85 },
  { day: 30, sys: 120, dia: 80 },
  { day: 31, sys: 115, dia: 75 },
]

export function HealthMetricsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Blood Pressure Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
              <YAxis domain={[40, 160]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
              <Line
                type="monotone"
                dataKey="sys"
                stroke="#ff6b6b"
                strokeWidth={2}
                dot={{ fill: "#ff6b6b", strokeWidth: 2, r: 4 }}
                name="SYS"
              />
              <Line
                type="monotone"
                dataKey="dia"
                stroke="#4ecdc4"
                strokeWidth={2}
                dot={{ fill: "#4ecdc4", strokeWidth: 2, r: 4 }}
                name="DIA"
              />
              <Legend verticalAlign="bottom" height={36} iconType="line" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-8 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Upper</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

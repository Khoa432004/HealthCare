'use client'

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

export function BusinessReports() {
  const reports = [
    { title: "Monthly Revenue", value: "₫125,000,000", change: "+15.3%", trend: "up" },
    { title: "New Patients", value: "1,234", change: "+8.7%", trend: "up" },
    { title: "Appointment Rate", value: "89.5%", change: "-2.1%", trend: "down" },
    { title: "Patient Satisfaction", value: "4.8/5.0", change: "+0.3", trend: "up" },
  ]

  return (
    <Card className="p-6 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Metrics</h3>
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.title} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm text-gray-600 mb-1">{report.title}</p>
              <p className="text-2xl font-bold text-gray-900">{report.value}</p>
            </div>
            <div className={`flex items-center gap-1 ${report.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {report.trend === "up" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span className="font-semibold">{report.change}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

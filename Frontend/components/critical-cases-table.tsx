"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ChevronRight, FileText } from "lucide-react"

const criticalCases = [
  {
    id: "PA0011",
    name: "Test patient 2",
    initials: "TE",
    condition: "Hypertension, Arthritis",
    result: "-- mg/dL",
    status: "Low",
    statusColor: "orange",
    mealTime: "Before meal",
  },
  {
    id: "PA0010",
    name: "Test stag patient",
    initials: "TE",
    condition: "Hypertension",
    result: "-- mg/dL",
    status: "High",
    statusColor: "orange",
    mealTime: "After meal",
  },
  {
    id: "PA0008",
    name: "HIHI",
    initials: "HI",
    condition: "Diabetes, Asthma, Hypertensi...",
    result: "-- mg/dL",
    status: "Low",
    statusColor: "orange",
    mealTime: "Before meal",
  },
  {
    id: "PA0007",
    name: "Nguyễn Văn Nam",
    initials: "NG",
    condition: "Hypertension, Arthritis, Asthm...",
    result: "-- mg/dL",
    status: "High",
    statusColor: "orange",
    mealTime: "After meal",
  },
  {
    id: "PA0006",
    name: "Nguyễn Thị Minh Châu",
    initials: "NG",
    condition: "Hypertension, Arthritis, Stoma...",
    result: "-- mg/dL",
    status: "Low",
    statusColor: "orange",
    mealTime: "Before meal",
  },
]

export default function CriticalCasesTable() {
  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl shadow-soft-lg border-white/50 p-6 hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-[#16a1bd] to-[#0d6171] bg-clip-text text-transparent">Top Critical Cases</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="glass border-white/50 hover:bg-white transition-smooth">
              BP
            </Badge>
            <Badge className="gradient-primary border-0 shadow-soft">BG</Badge>
            <Badge variant="outline" className="glass border-white/50 hover:bg-white transition-smooth">
              KET
            </Badge>
            <Badge variant="outline" className="glass border-white/50 hover:bg-white transition-smooth">
              Hct
            </Badge>
            <Badge variant="outline" className="glass border-white/50 hover:bg-white transition-smooth">
              UA
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-[#16a1bd] hover:bg-white/50 transition-smooth">
            See details <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/50 glass rounded-t-xl">
                <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">ID Account</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Patient</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Chronic conditions</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Result</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm"></th>
              </tr>
            </thead>
            <tbody>
              {criticalCases.map((case_, index) => (
                <tr key={index} className="border-b border-white/30 hover:bg-white/50 transition-smooth">
                  <td className="py-4 px-4 text-sm text-gray-700 font-medium">{case_.id}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-9 h-9 gradient-primary ring-2 ring-white shadow-soft">
                        <AvatarFallback className="text-xs font-semibold text-white gradient-primary">{case_.initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-gray-900">{case_.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{case_.condition}</td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">{case_.result}</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col space-y-1.5">
                      <Badge
                        className={`${case_.status === "Low" ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-orange-100 text-orange-700 border-orange-200"} w-fit shadow-soft`}
                      >
                        {case_.status}
                      </Badge>
                      <Badge className="gradient-primary text-white w-fit text-xs border-0 shadow-soft">
                        🍽️ {case_.mealTime}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Button variant="ghost" size="sm" className="rounded-xl hover:bg-white transition-smooth">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass rounded-3xl shadow-soft-lg border-white/50 p-6 hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-[#16a1bd] to-[#0d6171] bg-clip-text text-transparent">Pending Diagnostics</h3>
          <Button variant="ghost" size="sm" className="text-[#16a1bd] hover:bg-white/50 transition-smooth">
            See details <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ID Account</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Chronic conditions</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Reason</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm"></th>
              </tr>
            </thead>
          </table>
          <div className="py-16 flex flex-col items-center justify-center text-gray-400">
            <FileText className="w-12 h-12 mb-3" />
            <span className="text-sm">No data available</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl shadow-soft-lg border-white/50 p-6 hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-[#16a1bd] to-[#0d6171] bg-clip-text text-transparent">New Appointment</h3>
          <Button variant="ghost" size="sm" className="text-[#16a1bd] hover:bg-white/50 transition-smooth">
            See details <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ID Account</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Chronic conditions</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm"></th>
              </tr>
            </thead>
          </table>
          <div className="py-16 flex flex-col items-center justify-center text-gray-400">
            <FileText className="w-12 h-12 mb-3" />
            <span className="text-sm">No data available</span>
          </div>
        </div>
      </div>
    </div>
  )
}

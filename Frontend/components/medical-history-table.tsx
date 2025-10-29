"use client"

import { useState } from "react"
import { Search, Filter, Calendar, FileText, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function MedicalHistoryTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const medicalHistory = [
    {
      id: "MH001",
      date: "2025-01-15",
      type: "Consultation",
      doctor: "Dr. Phạm Linh",
      specialty: "General Medicine",
      diagnosis: "Hypertension - Controlled",
      status: "completed",
      notes: "Blood pressure within normal range. Continue current medication.",
      files: 2
    },
    {
      id: "MH002",
      date: "2025-01-10",
      type: "Lab Test",
      doctor: "Dr. Hoàng Nam",
      specialty: "Laboratory",
      diagnosis: "Blood Test Results",
      status: "completed",
      notes: "All values within normal range. No follow-up required.",
      files: 3
    },
    {
      id: "MH003",
      date: "2025-01-08",
      type: "Imaging",
      doctor: "Dr. Nguyễn Hoa",
      specialty: "Radiology",
      diagnosis: "Chest X-ray - Normal",
      status: "completed",
      notes: "No abnormalities detected. Clear lung fields.",
      files: 1
    },
    {
      id: "MH004",
      date: "2025-01-05",
      type: "Consultation",
      doctor: "Dr. Lê Minh",
      specialty: "Dentistry",
      diagnosis: "Dental Cleaning",
      status: "completed",
      notes: "Regular cleaning completed. No cavities found.",
      files: 1
    },
    {
      id: "MH005",
      date: "2025-01-02",
      type: "Follow-up",
      doctor: "Dr. Phạm Linh",
      specialty: "General Medicine",
      diagnosis: "Medication Review",
      status: "completed",
      notes: "Medication adjusted based on latest test results.",
      files: 2
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Consultation":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{type}</Badge>
      case "Lab Test":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">{type}</Badge>
      case "Imaging":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">{type}</Badge>
      case "Follow-up":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{type}</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const filteredHistory = medicalHistory.filter(record => {
    const matchesSearch = record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || record.type.toLowerCase() === filterType.toLowerCase()
    return matchesSearch && matchesFilter
  })

  return (
    <div className="glass rounded-3xl shadow-soft-lg border-white/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#16a1bd] to-[#16a1bd] bg-clip-text text-transparent">
          Medical History
        </h3>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search records..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-white/70 border-white/50"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white/70 border-white/50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterType("all")}>All Types</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("consultation")}>Consultation</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("lab test")}>Lab Test</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("imaging")}>Imaging</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("follow-up")}>Follow-up</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Doctor</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Diagnosis</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Files</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((record) => (
              <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {getTypeBadge(record.type)}
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{record.doctor}</p>
                    <p className="text-sm text-gray-500">{record.specialty}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{record.diagnosis}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{record.notes}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(record.status)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-1" />
                    {record.files}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" />
                        Download Files
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}

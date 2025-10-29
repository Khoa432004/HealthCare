"use client"

import { useState } from "react"
import { X, Smile, Calendar, Plus, Pill, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NewAppointmentModalProps {
  onClose: () => void
}

export function NewAppointmentModal({ onClose }: NewAppointmentModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "Online",
    patient: "",
    doctor: "Lê Thị Tuyết Hoa",
    reason: "",
    symptomsOnset: "",
    symptomsSeverity: "",
    medications: "",
    notes: "",
  })

  const [showError, setShowError] = useState(false)

  const handleCreate = () => {
    if (!formData.title || !formData.date || !formData.patient) {
      setShowError(true)
      return
    }
    // Handle appointment creation
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-[#16a1bd]">NEW APPOINTMENT</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <Input
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          {/* Date and Time */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <Input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>

          {/* Location */}
          <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Clinic">Clinic</SelectItem>
              <SelectItem value="Hospital">Hospital</SelectItem>
            </SelectContent>
          </Select>

          {/* Doctor */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Doctor</label>
            <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-[#16a1bd] rounded-full flex items-center justify-center text-white text-sm">
                LT
              </div>
              <span className="text-sm">{formData.doctor} (Doctor)</span>
            </div>
          </div>

          {/* Patient */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Patient</label>
            <Select value={formData.patient} onValueChange={(value) => setFormData({ ...formData, patient: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient1">Nguyễn Văn A</SelectItem>
                <SelectItem value="patient2">Trần Thị B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Details */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-4">Details</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Smile className="w-5 h-5 text-[#16a1bd] mt-2" />
                <Input
                  placeholder="Reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-[#16a1bd] mt-2" />
                <Input
                  placeholder="Symptoms onset"
                  value={formData.symptomsOnset}
                  onChange={(e) => setFormData({ ...formData, symptomsOnset: e.target.value })}
                />
              </div>

              <div className="flex items-start space-x-3">
                <Plus className="w-5 h-5 text-[#16a1bd] mt-2" />
                <Input
                  placeholder="Symptoms severity"
                  value={formData.symptomsSeverity}
                  onChange={(e) => setFormData({ ...formData, symptomsSeverity: e.target.value })}
                />
              </div>

              <div className="flex items-start space-x-3">
                <Pill className="w-5 h-5 text-[#16a1bd] mt-2" />
                <Input
                  placeholder="Medications being used"
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                />
              </div>

              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-[#16a1bd] mt-2" />
                <Textarea
                  placeholder="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {showError && (
            <div className="flex items-center space-x-2 text-red-500 text-sm">
              <span className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center">!</span>
              <span>Please complete all required fields before proceeding</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end">
          <Button className="bg-[#16a1bd] hover:bg-[#0d6171] text-white px-8" onClick={handleCreate}>
            Create
          </Button>
        </div>
      </div>
    </div>
  )
}

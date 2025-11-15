"use client"

import { useState, useEffect } from "react"
import { X, Smile, Calendar, Plus, Pill, FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { PatientSearch } from "@/components/patient-search"
import { authService } from "@/services/auth.service"
import { userService } from "@/services/user.service"

interface NewAppointmentModalProps {
  onClose: () => void
  onSuccess?: () => void
}

export function NewAppointmentModal({ onClose, onSuccess }: NewAppointmentModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    patientId: "",
    patientName: "",
    doctor: "",
    reason: "",
    symptomsOnset: "",
    symptomsSeverity: "",
    medications: "",
    notes: "",
  })

  const [showError, setShowError] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [doctorTitle, setDoctorTitle] = useState<string>("")
  const [doctorName, setDoctorName] = useState<string>("")
  const [isLoadingDoctorInfo, setIsLoadingDoctorInfo] = useState(true)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [sessionDuration, setSessionDuration] = useState<number>(30) // Default 30 minutes

  // Load doctor info and work schedule when modal opens
  useEffect(() => {
    const loadDoctorInfo = async () => {
      try {
        setIsLoadingDoctorInfo(true)
        
        // Get current user info
        const user = authService.getUserInfo()
        if (user) {
          setDoctorName(user.fullName || "")
          
          // Get professional info to get title
          try {
            const professionalInfo = await userService.getProfessionalInfo()
            if (professionalInfo?.title) {
              setDoctorTitle(professionalInfo.title)
            }
          } catch (error) {
            console.error("Error loading professional info:", error)
            // If professional info fails, just use name without title
          }

          // Get work schedule to get session duration from doctor_schedule_rule table
          try {
            const workSchedule = await userService.getWorkSchedule()
            if (workSchedule?.sessionDuration) {
              setSessionDuration(workSchedule.sessionDuration)
              console.log(`Loaded session duration from doctor_schedule_rule: ${workSchedule.sessionDuration} minutes`)
            } else {
              console.warn("Work schedule returned but no sessionDuration found, using default 30 minutes")
            }
          } catch (error) {
            console.error("Error loading work schedule from doctor_schedule_rule:", error)
            // If work schedule fails, use default 30 minutes
            console.log("Using default session duration: 30 minutes")
          }
        }
      } catch (error) {
        console.error("Error loading doctor info:", error)
      } finally {
        setIsLoadingDoctorInfo(false)
      }
    }

    loadDoctorInfo()
  }, [])

  // Update current date/time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format current date/time for display
  const formatCurrentDateTime = (): string => {
    const date = currentDateTime.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const time = currentDateTime.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    return `${date} - ${time}`
  }

  // Calculate end time based on start time and session duration
  const calculateEndTime = (startTime: string): string => {
    if (!startTime) return ""
    
    // Parse start time (HH:MM format)
    const [hours, minutes] = startTime.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return ""
    
    // Create date object for today with start time
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    
    // Add session duration (in minutes)
    const endDate = new Date(startDate.getTime() + sessionDuration * 60000)
    
    // Format as HH:MM
    const endHours = endDate.getHours().toString().padStart(2, '0')
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0')
    
    return `${endHours}:${endMinutes}`
  }

  // Handle start time change - auto calculate end time using session_minutes from doctor_schedule_rule
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value
    const calculatedEndTime = calculateEndTime(newStartTime)
    
    if (calculatedEndTime) {
      console.log(`Auto-calculated end time: ${newStartTime} + ${sessionDuration} minutes = ${calculatedEndTime}`)
    }
    
    setFormData({
      ...formData,
      startTime: newStartTime,
      endTime: calculatedEndTime,
    })
  }

  // Fill current date/time into form
  const handleFillCurrentDateTime = () => {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD format
    const timeStr = now.toTimeString().slice(0, 5) // HH:MM format
    
    // Calculate end time using session duration
    const calculatedEndTime = calculateEndTime(timeStr)
    
    setFormData({
      ...formData,
      date: dateStr,
      startTime: timeStr,
      endTime: calculatedEndTime,
    })
    
    toast({
      title: "Đã điền",
      description: `Đã tự động điền ngày giờ hiện tại vào form (Session: ${sessionDuration} phút)`,
    })
  }

  // Helper function to get initials from fullName
  const getInitials = (name: string): string => {
    if (!name) return 'DR'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Format doctor display name: "Title + Name"
  const getDoctorDisplayName = (): string => {
    if (isLoadingDoctorInfo) {
      return "Loading..."
    }
    if (doctorTitle && doctorName) {
      return `${doctorTitle} ${doctorName}`
    }
    return doctorName || "Doctor"
  }

  const handleCreate = async () => {
    // Validate required fields
    if (!formData.title || !formData.date || !formData.patientId) {
      setShowError(true)
      return
    }

    setIsCreating(true)
    setShowError(false)

    try {
      // TODO: Replace with actual API call when backend is ready
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Show success toast
      toast({
        title: "Thành công",
        description: "Đã tạo lịch hẹn thành công!",
      })

      // Call onSuccess callback to refresh appointments and close modal
      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo lịch hẹn. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#16a1bd]">NEW APPOINTMENT</h2>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isCreating}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          {/* Current Date/Time Display */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-[#16a1bd]" />
            <span>{formatCurrentDateTime()}</span>
          </div>
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
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-700">Date & Time</label>
                <span className="text-xs text-gray-500">
                  (Session: {sessionDuration} phút)
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFillCurrentDateTime}
                className="text-xs"
              >
                <Clock className="w-3 h-3 mr-1" />
                Use Current Time
              </Button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={handleStartTimeChange}
                  placeholder="Start time"
                />
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  placeholder="End time"
                />
              </div>
              {formData.startTime && formData.endTime && (
                <p className="text-xs text-gray-500 italic">
                  * End time được tự động tính từ start time + {sessionDuration} phút
                </p>
              )}
            </div>
          </div>

          {/* Doctor */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Doctor</label>
            <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
              {isLoadingDoctorInfo ? (
                <div className="flex items-center space-x-2 w-full">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-gray-500">Loading doctor info...</span>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 bg-[#16a1bd] rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getInitials(doctorName)}
                  </div>
                  <span className="text-sm">{getDoctorDisplayName()}</span>
                </>
              )}
            </div>
          </div>

          {/* Patient Search */}
          <PatientSearch
            value={formData.patientName}
            onSelect={(patientId, patientName) => {
              setFormData({ ...formData, patientId, patientName })
            }}
          />

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
        <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            className="bg-[#16a1bd] hover:bg-[#0d6171] text-white px-8" 
            onClick={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" className="text-white" />
                <span>Creating...</span>
              </div>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

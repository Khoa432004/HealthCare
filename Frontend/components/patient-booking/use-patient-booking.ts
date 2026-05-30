"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config"
import { appointmentService } from "@/services/appointment.service"
import { authService } from "@/services/auth.service"
import type {
  BookingFilters,
  BookingFormData,
  BookingFormat,
  BookingStep,
  DoctorDetail,
  DoctorSummary,
  TimeSlot,
  WorkSchedule,
} from "./types"
import { formatArrayFieldDisplay, normalizeStringList, resolveAppointmentCost, toApiFormatType } from "./utils"

const DEFAULT_FORM: BookingFormData = {
  appointmentReason: "",
  appointmentDetails: "",
  symptomStartDate: "",
  symptomSeverity: "",
  medication: "",
  agreeToShare: false,
}

const DEFAULT_FILTERS: BookingFilters = {
  specialty: "",
  costRange: "all",
  experience: "all",
}

export function usePatientBooking() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ fullName: string; id: string } | null>(null)
  const [currentStep, setCurrentStep] = useState<BookingStep>(1)
  const [appointmentFormat, setAppointmentFormat] = useState<BookingFormat>("online")
  const [searchQuery, setSearchQuery] = useState("")
  const [doctors, setDoctors] = useState<DoctorSummary[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)
  const [selectedDoctorData, setSelectedDoctorData] = useState<DoctorDetail | null>(null)
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule | null>(null)
  const [filters, setFilters] = useState<BookingFilters>(DEFAULT_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [monthOffset, setMonthOffset] = useState(0)
  const [formData, setFormData] = useState<BookingFormData>(DEFAULT_FORM)
  const [confirmTerms, setConfirmTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({ fullName: user.fullName || "Patient", id: user.id })
    }
  }, [])

  useEffect(() => {
    const loadDoctors = async () => {
      setIsLoadingDoctors(true)
      try {
        const params = new URLSearchParams()
        if (searchQuery.trim()) params.append("search", searchQuery.trim())
        const endpoint = `${API_ENDPOINTS.DOCTORS.GET_ALL_AVAILABLE}${
          params.toString() ? `?${params.toString()}` : ""
        }`
        const summaryRes = await apiClient.get<DoctorSummary[]>(endpoint)
        const list = (Array.isArray(summaryRes) ? summaryRes : []).map((doc) => ({
          ...doc,
          specialty: formatArrayFieldDisplay(doc.specialty),
        }))
        setDoctors(list)
        if (list.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(list[0].id)
        }
      } catch (error) {
        console.error("Failed to load doctors:", error)
        setDoctors([])
      } finally {
        setIsLoadingDoctors(false)
      }
    }
    loadDoctors()
  }, [searchQuery])

  useEffect(() => {
    if (!selectedDoctorId) {
      setSelectedDoctorData(null)
      return
    }

    setWorkSchedule(null)
    setAvailableSlots([])
    setSelectedDate("")
    setSelectedSlot(null)

    const fetchDoctorDetail = async () => {
      try {
        const data = await apiClient.get<DoctorDetail>(
          API_ENDPOINTS.DOCTORS.GET_BY_ID(selectedDoctorId)
        )
        setSelectedDoctorData({
          ...data,
          specialty: formatArrayFieldDisplay(data.specialty),
          conditions: normalizeStringList(data.conditions),
        })
      } catch (error) {
        console.error("Failed to load doctor detail:", error)
        setSelectedDoctorData(null)
      }
    }

    const loadSchedule = async () => {
      try {
        const sched = await apiClient.get<WorkSchedule>(
          API_ENDPOINTS.DOCTORS.WORK_SCHEDULE(selectedDoctorId)
        )
        setWorkSchedule(sched)
      } catch (error) {
        console.error("Failed to load work schedule:", error)
        setWorkSchedule(null)
      }
    }

    fetchDoctorDetail()
    loadSchedule()
  }, [selectedDoctorId])

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDoctorId || !selectedDate) {
        setAvailableSlots([])
        setSelectedSlot(null)
        return
      }

      try {
        setIsLoadingSlots(true)
        const response = await appointmentService.getAvailableSlots(
          selectedDoctorId,
          selectedDate
        )
        setAvailableSlots(response.availableSlots ?? [])
        setSelectedSlot(null)
      } catch (error) {
        console.error("Failed to load available slots:", error)
        setAvailableSlots([])
        setSelectedSlot(null)
      } finally {
        setIsLoadingSlots(false)
      }
    }

    loadSlots()
  }, [selectedDoctorId, selectedDate])

  const appointmentCost = useMemo(
    () => resolveAppointmentCost(workSchedule, selectedDoctorData),
    [workSchedule, selectedDoctorData]
  )

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const q = searchQuery.toLowerCase()
      const docSpecialties = normalizeStringList(doc.specialty)
      const specialtyText = docSpecialties.join(", ").toLowerCase()
      const matchesSearch =
        doc.name.toLowerCase().includes(q) ||
        specialtyText.includes(q) ||
        doc.clinic.toLowerCase().includes(q)

      const matchesSpecialty =
        !filters.specialty ||
        docSpecialties.some(
          (s) => s.toLowerCase() === filters.specialty.toLowerCase()
        )

      const costNum = Number(String(doc.cost).replace(/[^0-9]/g, "")) || doc.appointmentCost || 0
      const matchesCost =
        filters.costRange === "all" ||
        (filters.costRange === "under500k" && costNum < 500000) ||
        (filters.costRange === "500k-1m" && costNum >= 500000 && costNum <= 1000000) ||
        (filters.costRange === "over1m" && costNum > 1000000)

      const expNum = parseInt(doc.experience, 10) || 0
      const matchesExp =
        filters.experience === "all" ||
        (filters.experience === "under5" && expNum < 5) ||
        (filters.experience === "5-10" && expNum >= 5 && expNum <= 10) ||
        (filters.experience === "over10" && expNum > 10)

      return matchesSearch && matchesSpecialty && matchesCost && matchesExp
    })
  }, [doctors, searchQuery, filters])

  const specialtyOptions = useMemo(() => {
    const items = doctors.flatMap((d) => normalizeStringList(d.specialty))
    return Array.from(new Set(items)).sort((a, b) => a.localeCompare(b, "vi"))
  }, [doctors])

  const canProceedStep2 = Boolean(
    selectedDate &&
      selectedSlot &&
      formData.appointmentReason.trim() &&
      formData.appointmentDetails.trim() &&
      formData.symptomStartDate.trim() &&
      formData.symptomSeverity.trim() &&
      formData.medication.trim() &&
      formData.agreeToShare
  )

  const handleFormChange = useCallback((field: keyof BookingFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleTopBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => Math.max(1, s - 1) as BookingStep)
      return
    }
    router.push("/patient-calendar")
  }, [currentStep, router])

  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && !selectedDoctorId) return
    if (currentStep === 2 && !canProceedStep2) return
    setCurrentStep((prev) => Math.min(prev + 1, 3) as BookingStep)
  }, [currentStep, selectedDoctorId, canProceedStep2])

  const handlePreviousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as BookingStep)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout()
      router.push("/login")
    } catch {
      authService.clearAuthData()
      router.push("/login")
    }
  }, [router])

  const handleConfirmAppointment = useCallback(async () => {
    if (!selectedDoctorId || !selectedSlot || !confirmTerms) return

    const orderTotal = appointmentCost
    if (orderTotal <= 0) {
      alert("Không xác định được phí khám. Vui lòng chọn bác sĩ khác hoặc thử lại.")
      return
    }

    try {
      setIsSubmitting(true)
      const reasonParts = [
        formData.appointmentReason.trim(),
        formData.appointmentDetails.trim(),
      ].filter(Boolean)

      const appointmentData = {
        doctorId: selectedDoctorId,
        scheduledStart: selectedSlot.startTime,
        scheduledEnd: selectedSlot.endTime,
        reason: reasonParts.join(" | "),
        symptomsOns: formData.symptomStartDate,
        symptomsSever: formData.symptomSeverity,
        currentMedication: formData.medication,
        formatType: toApiFormatType(appointmentFormat),
        totalAmount: orderTotal,
      }

      localStorage.setItem("pendingAppointment", JSON.stringify(appointmentData))

      const orderInfo = `Thanh toan lich kham - BS ${selectedDoctorData?.name ?? selectedDoctorId}`
      const submitUrl = `${API_BASE_URL}${API_ENDPOINTS.VNPAY.PAYMENT(orderTotal, orderInfo)}`
      window.location.href = submitUrl
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error"
      alert(`Không thể kết nối tới cổng thanh toán. Vui lòng thử lại!\nChi tiết: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    selectedDoctorId,
    selectedSlot,
    confirmTerms,
    appointmentCost,
    formData,
    selectedDoctorData?.name,
    appointmentFormat,
  ])

  return {
    userInfo,
    currentStep,
    appointmentFormat,
    setAppointmentFormat,
    searchQuery,
    setSearchQuery,
    doctors,
    isLoadingDoctors,
    selectedDoctorId,
    setSelectedDoctorId,
    selectedDoctorData,
    workSchedule,
    filters,
    setFilters,
    filterOpen,
    setFilterOpen,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    availableSlots,
    isLoadingSlots,
    monthOffset,
    setMonthOffset,
    formData,
    confirmTerms,
    setConfirmTerms,
    isSubmitting,
    appointmentCost,
    filteredDoctors,
    specialtyOptions,
    canProceedStep2,
    handleFormChange,
    handleTopBack,
    handleNextStep,
    handlePreviousStep,
    handleLogout,
    handleConfirmAppointment,
  }
}

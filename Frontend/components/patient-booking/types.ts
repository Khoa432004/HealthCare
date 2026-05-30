export type BookingStep = 1 | 2 | 3

export type BookingFormat = "online" | "offline"

export interface DoctorSummary {
  id: string
  name: string
  specialty: string
  rating: number
  reviews: number
  clinic: string
  cost: string
  appointmentCost?: number
  availableTimes: string[]
  experience: string
  consultations: string
  title: string
}

export interface CertificateItem {
  year: string
  title: string
}

export interface DoctorDetail {
  id: string
  name: string
  specialty: string
  rating: number
  reviews: number
  clinic: string
  province: string
  cost: string
  appointmentCost?: number
  experience: string
  consultations: string
  workplace_name: string
  conditions: string[]
  certificates: CertificateItem[]
}

export interface WorkScheduleDay {
  weekday: number
  enabled: boolean
  timeSlots?: Array<{ startTime: string; endTime: string }>
}

export interface WorkSchedule {
  sessionDuration?: number
  appointmentCost?: number
  days?: WorkScheduleDay[]
}

export interface TimeSlot {
  startTime: string
  endTime: string
  displayTime: string
}

export interface BookingFormData {
  appointmentReason: string
  appointmentDetails: string
  symptomStartDate: string
  symptomSeverity: string
  medication: string
  agreeToShare: boolean
}

export interface BookingFilters {
  specialty: string
  costRange: string
  experience: string
}

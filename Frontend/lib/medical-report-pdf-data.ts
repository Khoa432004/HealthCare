import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"
import { medicalReportService } from "@/services/medical-report.service"
import type { MedicalReport, PrescriptionItem } from "@/types/medical-report"

type HistoryDetail = {
  id: string
  patientId: string
  doctor: string
  clinic: string
  doctorMajor: string
  date: string
  timeIn: string
  timeOut: string
  patientName: string | null
  gender: string | null
  birthDateTime: string | null
  reason: string
  diagnosis: string
  clinicalDiagnosis?: Array<{ signType: string; signValue?: string; value?: string; unit: string }>
  treatment: string
  notes: string
  prescriptions?: PrescriptionItem[]
}

function mapMedicationsFromReport(
  medications: NonNullable<Awaited<ReturnType<typeof medicalReportService.getByAppointmentId>>>["medications"]
): PrescriptionItem[] {
  if (!medications?.length) return []
  return medications.map((med) => ({
    name: med.medicationName,
    dosage: med.dosage,
    medicationType: med.medicationType,
    mealRelation: med.mealRelation,
    duration: med.durationDays ?? 0,
    startDay: med.startDate || "",
    note: med.note || "",
  }))
}

export async function fetchMedicalReportForPdf(
  appointmentId: string
): Promise<MedicalReport> {
  const [historyResponse, reportData] = await Promise.all([
    apiClient.get<HistoryDetail[]>(
      API_ENDPOINTS.PATIENTS.GET_MEDICAL_HISTORY_DETAIL(appointmentId)
    ),
    medicalReportService.getByAppointmentId(appointmentId),
  ])

  const history = Array.isArray(historyResponse) ? historyResponse[0] : undefined

  if (!history && !reportData) {
    throw new Error("Không tìm thấy báo cáo y khoa")
  }

  const clinicalDiagnosis =
    history?.clinicalDiagnosis?.map((item) => ({
      signType: item.signType,
      signValue: item.signValue ?? item.value ?? "",
      unit: item.unit,
    })) ??
    reportData?.vitalSigns?.map((item) => ({
      signType: item.signType,
      signValue: item.value,
      unit: item.unit,
    })) ??
    []

  const prescriptions =
    history?.prescriptions?.length
      ? history.prescriptions
      : mapMedicationsFromReport(reportData?.medications)

  return {
    id: history?.id || reportData?.id || appointmentId,
    patientId: history?.patientId || "",
    doctor: history?.doctor || "",
    clinic: reportData?.clinic || history?.clinic || "",
    doctorMajor: history?.doctorMajor || "",
    date: history?.date || reportData?.completedAt || new Date().toISOString(),
    timeIn: history?.timeIn || history?.date || "",
    timeOut: history?.timeOut || history?.date || "",
    patientName: history?.patientName ?? null,
    gender: history?.gender ?? null,
    birthDateTime: history?.birthDateTime ?? null,
    reason: history?.reason || "",
    diagnosis: reportData?.diagnosis || history?.diagnosis || "",
    clinicalDiagnosis,
    treatment: reportData?.recommendation || history?.treatment || "",
    notes: reportData?.note || history?.notes || "",
    prescriptions,
    icdCode: reportData?.icdCode,
    province: reportData?.province,
    chronicConditions: reportData?.chronicConditions,
    illness: reportData?.illness,
    medicalExam: reportData?.medicalExam,
    coverage: reportData?.coverage,
    followUpDate: reportData?.followUpDate,
  }
}

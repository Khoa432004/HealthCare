// app/appointment/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Download, Eye, User, Calendar, Stethoscope, FileText, Pill, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"
interface PrescriptionItem {
  name: string
  dosage: string
  medicationType: string
  mealRelation: string
  duration: number
  startDay: string
  note: string
}
interface ClinicalDiagnosis {
  signType: string
  signValue: string 
  unit: string
}

interface MedicalReport {
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
  clinicalDiagnosis: ClinicalDiagnosis[]
  treatment: string
  notes: string
  prescriptions: PrescriptionItem[]
}

export default function MedicalReportDetail() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<MedicalReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const appointmentId = params.id as string

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        setError(null)

        const data: MedicalReport[] = await apiClient.get(
          API_ENDPOINTS.PATIENTS.GET_MEDICAL_HISTORY_DETAIL(appointmentId)
        )

        if (data.length === 0) throw new Error("Không tìm thấy báo cáo")

        setReport(data[0])
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối")
        console.error("API Error:", err)
      } finally {
        setLoading(false)
      }
    }

    if (appointmentId) fetchReport()
  }, [appointmentId])

  const handleDownloadPDF = () => {
    alert(`Tải PDF báo cáo ${appointmentId}`)
  }

  // const handleViewPrescription = () => {
  //   router.push(`/prescription/${appointmentId}`)
  
  // }

  if (loading) return <ReportSkeleton />
  if (error) return <ErrorState message={error} />
  if (!report) return <ErrorState message="Không tìm thấy dữ liệu" />

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/patient-medical-examination-history")}
          className="mb-6 text-[#16a1bd] hover:text-[#0d6171]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {/* Header */}
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#16a1bd] to-[#0d6171] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Báo Cáo Y Khoa</CardTitle>
                  <p className="text-sm opacity-90">Mã cuộc hẹn: {appointmentId}</p>
                </div>
              </div>
              <Badge className="bg-green-600 text-white">Đã hoàn thành</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Doctor Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {report.doctor.split(" ").pop()?.[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#16a1bd]">{"BS. "+report.doctor  }</h3>
                <p className="text-sm text-gray-600">{report.doctorMajor}</p>
                <p className="text-sm flex items-center gap-1 mt-1">
                  <FileText className="w-3.5 h-3.5" />
                  {report.clinic}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Ngày khám</p>
                <p className="font-medium">{format(new Date(report.date), "dd/MM/yyyy")}</p>
              </div>
              <div>
                <p className="text-gray-500">Giờ bắt đầu</p>
                <p className="font-medium">{format(new Date(report.timeIn), "HH:mm")}</p>
              </div>
              <div>
                <p className="text-gray-500">Giờ kết thúc</p>
                <p className="font-medium">{format(new Date(report.timeOut), "HH:mm")}</p>
              </div>
              <div>
                <p className="text-gray-500">Trạng thái</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Hoàn thành
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin bệnh nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Họ tên</p>
                <p className="font-medium">{report.patientName || "Chưa cập nhật"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Giới tính</p>
                <p className="font-medium">{report.gender || "Chưa cập nhật"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày sinh</p>
                <p className="font-medium">
                  {report.birthDateTime 
                    ? format(new Date(`${report.birthDateTime}T00:00:00`), "dd/MM/yyyy")
                    : "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã bệnh nhân</p>
                <p className="font-medium">{report.patientId}</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div>
              <p className="text-sm text-gray-500 mb-1">Lý do khám / Triệu chứng</p>
              <p className="text-gray-800">{report.reason}</p>
            </div>
          </CardContent>
        </Card>

        {/* Medical Report */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Báo cáo y khoa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Chẩn đoán</p>
              <p className="bg-blue-50 p-3 rounded-lg">
                {report.diagnosis}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Kết quả khám lâm sàng</p>
              <p className="text-gray-800 whitespace-pre-wrap">
                {report.clinicalDiagnosis && report.clinicalDiagnosis.length > 0
                  ? report.clinicalDiagnosis.map(
                      cd => `${cd.signType}: ${cd.signValue} ${cd.unit}`)
                      .join(", ")
                  : "Không có"}
              </p>
            </div>
 
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Chỉ định / Hướng dẫn điều trị</p>
              <p className="text-gray-800 whitespace-pre-wrap">{report.treatment}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Ghi chú bác sĩ</p>
              <p className="text-gray-800 italic">{report.notes}</p>
            </div>
          </CardContent>
        </Card>

        {/* Prescription */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Đơn thuốc
              </CardTitle>
              <Button size="sm" asChild>
                <Link href={`/prescription/${appointmentId}`}>
                  <Eye className="w-4 h-4 mr-1" />
                  Xem chi tiết
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.prescriptions.length > 0 ? (
                report.prescriptions.map((med, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-[#16a1bd] rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-gray-600">
                          {med.dosage} • 
                          {
                            med.mealRelation === "before" ? "Trước" :
                            med.mealRelation === "after" ? "Sau" :
                            med.mealRelation === "with" ? "Cùng với" :
                            "Cùng"
                          } bữa ăn • 
                          {med.duration} ngày
                        </p>
                      {med.note && <p className="text-xs text-gray-500 mt-1">{med.note}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Không có đơn thuốc</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={handleDownloadPDF} className="bg-[#16a1bd] hover:bg-[#0d6171]">
            <Download className="w-5 h-5 mr-2" />
            Tải PDF Báo Cáo
          </Button>
        </div>
      </div>
    </div>
  )
}

// Loading Skeleton
function ReportSkeleton() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-12 w-32" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

// Error State
function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  )
}
// app/appointment/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { Eye, User, Calendar, Stethoscope, FileText, Pill, AlertCircle, ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config"
import { authService } from "@/services/auth.service"

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

interface DrugInfo {
  name: string
  genericName: string
  category: string
  form: string
  strength: string
  manufacturer: string
  indications: string
  contraindications: string
  sideEffects: string
  dosage: string
  warning: string
  storage: string
}

export default function MedicalReportDetail() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<MedicalReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>("PATIENT")

  // Drug sidebar states
  const [selectedDrug, setSelectedDrug] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null)
  const [drugImage, setDrugImage] = useState<string | null>(null)
  const [loadingDrug, setLoadingDrug] = useState(false)
  const [loadingImage, setLoadingImage] = useState(false)

  const appointmentId = params.id as string

  // Back link theo role
  const backHref = userRole?.toUpperCase() === "DOCTOR"
    ? `/calendar/appointment/${appointmentId}`
    : "/patient-emr"

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user?.role) setUserRole(user.role)
  }, [])

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

  const getMealText = (relation: string) => {
    switch (relation) {
      case "before": return "Trước bữa ăn"
      case "after": return "Sau bữa ăn"
      case "with": return "Cùng bữa ăn"
      default: return "Không xác định"
    }
  }

  const handleDrugClick = async (drugName: string) => {
    setLoadingDrug(true)
    setLoadingImage(true)
    setSidebarOpen(true)
    setDrugInfo(null)
    setDrugImage(null)

    // === 1. GỌI FDA API ===
    try {
      const fdaRes = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drugName}"&limit=1`
      )
      const fdaData = await fdaRes.json()

      if (fdaData.results && fdaData.results.length > 0) {
        const result = fdaData.results[0]

        let extracted: DrugInfo = {
          name: result.openfda.brand_name?.[0] || drugName,
          genericName: result.openfda.generic_name?.[0] || "Không rõ",
          category: "Thuốc kê đơn (OTC)",
          form: result.openfda.route?.[0] || "Không rõ",
          strength: result.active_ingredient?.[0]?.match(/\d+ ?mg|\d+ ?g/)?.[0] || "Không rõ",
          manufacturer: result.openfda.manufacturer_name?.[0] || "Không rõ",
          indications: result.indications_and_usage?.[0] || "Không có thông tin",
          contraindications: result.contraindications?.[0] || "Không có thông tin",
          sideEffects: result.adverse_reactions?.[0] || "Không có thông tin",
          dosage: result.dosage_and_administration?.[0] || "Theo chỉ định bác sĩ",
          warning: result.warnings?.[0]?.split("Do not use")[0]?.trim() || "Xem kỹ hướng dẫn",
          storage: result.storage_and_handling?.[0] || "Nơi khô ráo, nhiệt độ phòng"
        }

        // === CALL TRANSLATION API ===
        try {
          const fieldsToTranslate = [
            extracted.category,
            extracted.form,
            extracted.indications,
            extracted.contraindications,
            extracted.sideEffects,
            extracted.dosage,
            extracted.warning,
            extracted.storage
          ]

          const translateRes = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: fieldsToTranslate })
          })

          if (translateRes.ok) {
            const { translated } = await translateRes.json()
            if (Array.isArray(translated) && translated.length === 8) {
              extracted = {
                ...extracted,
                category: translated[0],
                form: translated[1],
                indications: translated[2],
                contraindications: translated[3],
                sideEffects: translated[4],
                dosage: translated[5],
                warning: translated[6],
                storage: translated[7]
              }
            }
          }
        } catch (transErr) {
          console.error("Translation error:", transErr)
        }

        setDrugInfo(extracted)
      } else {
        throw new Error("Không tìm thấy thông tin thuốc")
      }
    } catch (err) {
      console.error("FDA API Error:", err)
      setDrugInfo({
        name: drugName,
        genericName: "Lỗi kết nối",
        category: "—",
        form: "—",
        strength: "—",
        manufacturer: "FDA",
        indications: "Không thể tải dữ liệu từ FDA.",
        contraindications: "—",
        sideEffects: "—",
        dosage: "—",
        warning: "Kiểm tra mạng hoặc tên thuốc.",
        storage: "—"
      })
    } finally {
      setLoadingDrug(false)
    }

    // === 2. GỌI GOOGLE IMAGE SEARCH QUA BACKEND PROXY ===
    try {
      setLoadingImage(true)
      const imageRes = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.DRUG.IMAGE_SEARCH(drugName)}`
      )
      const imageData = await imageRes.json()

      if (imageData.error) {
        console.error("Google API Error Details:", imageData.error.message)
        setDrugImage(null)
        setLoadingImage(false)
        return
      }

      setLoadingImage(false)

      if (imageData.items && imageData.items.length > 0) {
        const imageUrl = imageData.items[0].image?.thumbnailLink || imageData.items[0].link
        setDrugImage(imageUrl)
      } else {
        setDrugImage(null)
      }
    } catch (err) {
      console.error("Network Error:", err)
      setDrugImage(null)
      setLoadingImage(false)
    }
  }

  if (loading) return <ReportSkeleton />
  if (error) return <ErrorState message={error} />
  if (!report) return <ErrorState message="Không tìm thấy dữ liệu" />

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center text-[#007A94] hover:text-[#005566] font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>

          {/* Header */}
          <Card className="mb-6 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#007A94] to-[#005566] text-white">
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
                  <h3 className="text-xl font-bold text-[#007A94]">{"BS. " + report.doctor}</h3>
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
                <p className="bg-blue-50 p-3 rounded-lg">{report.diagnosis}</p>
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

          {/* Prescription - Dạng bảng giống trang prescription/[id] */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-[#007A94]" />
                  Đơn thuốc
                </div>
                <Button size="sm" asChild>
                  <Link href={`/prescription/${appointmentId}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    Xem chi tiết
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.prescriptions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên thuốc</TableHead>
                      <TableHead>Dạng thuốc</TableHead>
                      <TableHead>Liều/Hàm lượng</TableHead>
                      <TableHead>Buổi uống</TableHead>
                      <TableHead>Ngày bắt đầu</TableHead>
                      <TableHead>Thời lượng</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead className="text-right">Xem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.prescriptions.map((med, i) => (
                      <TableRow
                        key={i}
                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleDrugClick(med.name)}
                      >
                        <TableCell className="font-medium text-[#007A94]">{med.name}</TableCell>
                        <TableCell>{med.medicationType}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{getMealText(med.mealRelation)}</TableCell>
                        <TableCell>
                          {med.startDay
                            ? format(new Date(med.startDay), "dd/MM")
                            : "—"}
                        </TableCell>
                        <TableCell>{med.duration} ngày</TableCell>
                        <TableCell>
                          {med.note ? (
                            <span className="text-xs text-amber-700 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {med.note}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDrugClick(med.name)
                            }}
                          >
                            <Eye className="w-4 h-4 text-[#007A94]" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-4">Không có đơn thuốc</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Sidebar - Chi tiết thuốc */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
          {loadingDrug ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#007A94]" />
              <p className="text-sm text-gray-500">Đang tải thông tin từ FDA...</p>
            </div>
          ) : drugInfo ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between text-xl">
                  <span className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    {drugInfo.name}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </SheetTitle>
              </SheetHeader>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200 shadow-md mt-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Thông tin cơ bản</h4>

                  {/* Ảnh thuốc */}
                  <div className="mb-4">
                    {loadingImage ? (
                      <div className="w-full h-48 bg-gray-100 border-2 border-dashed rounded-xl flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007A94]" />
                      </div>
                    ) : drugImage ? (
                      <img
                        src={drugImage}
                        alt={drugInfo?.name}
                        className="w-full h-48 object-contain rounded-lg border bg-white shadow-sm"
                        onError={() => setDrugImage(null)}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-50 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 text-xs">
                        Không tìm thấy hình ảnh
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tên generic:</span>
                      <span className="font-medium">{drugInfo?.genericName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nhóm thuốc:</span>
                      <span className="font-medium">{drugInfo?.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dạng bào chế:</span>
                      <span className="font-medium">{drugInfo?.form}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hàm lượng:</span>
                      <span className="font-medium">{drugInfo?.strength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hãng sản xuất:</span>
                      <span className="font-medium">{drugInfo?.manufacturer}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Chỉ định</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{drugInfo.indications}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Chống chỉ định</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{drugInfo.contraindications}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Tác dụng phụ</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{drugInfo.sideEffects}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Liều dùng</h4>
                    <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">{drugInfo.dosage}</p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Cảnh báo
                    </h4>
                    <p className="text-amber-700 text-xs">{drugInfo.warning}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Bảo quản</h4>
                    <p className="text-gray-600 text-xs">{drugInfo.storage}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">Chọn một thuốc để xem chi tiết</div>
          )}
        </SheetContent>
      </Sheet>
    </>
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
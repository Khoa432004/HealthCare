"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Pill, Eye, X, AlertCircle, Calendar, User, Stethoscope, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  birthDateTime: string 
  reason: string
  diagnosis: string
  clinicalDiagnosis: ClinicalDiagnosis[]
  treatment: string
  notes: string
  prescriptions: PrescriptionItem[]
}

interface FDADrugResult {
  openfda: {
    brand_name?: string[]
    generic_name?: string[]
    manufacturer_name?: string[]
    route?: string[]
  }
  indications_and_usage?: string[]
  warnings?: string[]
  dosage_and_administration?: string[]
  contraindications?: string[]
  adverse_reactions?: string[] 
  storage_and_handling?: string[]
  inactive_ingredient?: string[]
  active_ingredient?: string[]
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

export default function PrescriptionDetail() {
  const params = useParams()
  const [selectedDrug, setSelectedDrug] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [report, setReport] = useState<MedicalReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const appointmentId = params.id as string
  const [DrugInfo, setDrugInfo] = useState<DrugInfo | null>(null)
  const [drugImage, setDrugImage] = useState<string | null>(null)
  const [loadingDrug, setLoadingDrug] = useState(false)
  const [loadingImage, setLoadingImage] = useState(false)
  
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

        const extracted: DrugInfo = {
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

    // === 2. GỌI GOOGLE IMAGE SEARCH API ===
    try {
      const imageRes = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=AIzaSyC20kSptZrjxPuDfP0lQJNvlksFxaW3wJ4&cx=55f84a4d793454627&searchType=image&q=${encodeURIComponent(drugName)}&num=1`
      )
      const imageData = await imageRes.json()

      if (imageData.items && imageData.items.length > 0) {
        const imageUrl = imageData.items[0].link
        setDrugImage(imageUrl)
      } else {
        setDrugImage(null)
      }
    } catch (err) {
      console.error("Google Image API Error:", err)
      setDrugImage(null)
    } finally {
      setLoadingImage(false)
    }
  }

  const getMealText = (relation: string) => {
    switch (relation) {
      case "before": return "Trước bữa ăn"
      case "after": return "Sau bữa ăn"
      case "with": return "Cùng bữa ăn"
      default: return "Không xác định"
    }
  }

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

  if (loading) return <ReportSkeleton />
  if (error) return <ErrorState message={error} />
  if (!report) return <ErrorState message="Không tìm thấy dữ liệu" />
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link
              href={`/patient-medical-examination-history/${appointmentId}`}            
              className="mb-6 inline-flex items-center text-[#16a1bd] hover:text-[#0d6171] font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>

          {/* Header */}
          <Card className="mb-6 overflow-hidden shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#16a1bd] to-[#0d6171] text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Pill className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Đơn Thuốc Chi Tiết</CardTitle>
                    <p className="text-sm opacity-90">Mã khám: {appointmentId}</p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white text-lg px-4 py-1">Đã kê đơn</Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Thông tin bác sĩ & cơ sở */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="w-5 h-5 text-[#16a1bd]" />
                Thông tin bác sĩ & cơ sở
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Tên & Học vị</p>
                  <p className="font-semibold text-[#16a1bd]">{'BS. ' + report.doctor}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ngày kê đơn</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {format(new Date(report.date), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Cơ sở khám</p>
                  <p className="font-medium">{report.clinic}</p>
                </div>
                <div>
                  <p className="text-gray-500">Mã khám</p>
                  <p className="font-mono font-medium">{appointmentId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin bệnh nhân */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-[#16a1bd]" />
                Thông tin bệnh nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Họ tên</p>
                  <p className="font-semibold">{report.patientName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Giới tính, Năm sinh</p>
                  <p className="font-medium">{report.gender}, {format(new Date(report.birthDateTime), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <p className="text-gray-500">Mã hồ sơ bệnh án</p>
                  <p className="font-mono font-medium">{report.patientId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danh sách thuốc - Dạng bảng */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-[#16a1bd]" />
                  Danh sách thuốc
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                      <TableCell className="font-medium text-[#16a1bd]">{med.name}</TableCell>
                      <TableCell>{med.medicationType}</TableCell>
                      <TableCell>{med.dosage}</TableCell>
                      <TableCell>{getMealText(med.mealRelation)}</TableCell>
                      <TableCell>{format(new Date(med.startDay), "dd/MM")}</TableCell>
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
                          <Eye className="w-4 h-4 text-[#16a1bd]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Sidebar - Chi tiết thuốc */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
          {loadingDrug ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#16a1bd]" />
              <p className="text-sm text-gray-500">Đang tải thông tin từ FDA...</p>
            </div>
          ) : DrugInfo ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between text-xl">
                  <span className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    {DrugInfo.name}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </SheetTitle>
              </SheetHeader>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200 shadow-md">                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Thông tin cơ bản</h4>
                  
                  {/* Hiển thị ảnh thuốc */}
                  <div className="mb-4">
                    {loadingImage ? (
                      <div className="w-full h-48 bg-gray-100 border-2 border-dashed rounded-xl flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16a1bd]" />
                      </div>
                    ) : drugImage ? (
                      <img
                        src={drugImage}
                        alt={DrugInfo?.name}
                        className="w-full h-48 object-contain rounded-lg border bg-white shadow-sm"
                        onError={() => setDrugImage(null)}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-50 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 text-xs">
                        Không tìm thấy hình ảnh
                      </div>
                    )}
                  </div>

                  {/* Danh sách thông tin */}
                  <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tên generic:</span>
                        <span className="font-medium">{DrugInfo?.genericName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nhóm thuốc:</span>
                        <span className="font-medium">{DrugInfo?.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dạng bào chế:</span>
                        <span className="font-medium">{DrugInfo?.form}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Hàm lượng:</span>
                        <span className="font-medium">{DrugInfo?.strength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Hãng sản xuất:</span>
                        <span className="font-medium">{DrugInfo?.manufacturer}</span>
                      </div>
                    </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Chỉ định</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">{DrugInfo.indications}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Chống chỉ định</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">{DrugInfo.contraindications}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Tác dụng phụ</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">{DrugInfo.sideEffects}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Liều dùng</h4>
                  <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">{DrugInfo.dosage}</p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Cảnh báo
                  </h4>
                  <p className="text-amber-700 text-xs">{DrugInfo.warning}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Bảo quản</h4>
                  <p className="text-gray-600 text-xs">{DrugInfo.storage}</p>
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
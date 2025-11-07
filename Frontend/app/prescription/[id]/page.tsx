// app/prescription/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Pill, Eye, X, Info, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Giả lập dữ liệu chi tiết thuốc (trong thực tế sẽ gọi API)
const mockDrugDetails: Record<string, any> = {
  "Paracetamol": {
    name: "Paracetamol",
    genericName: "Acetaminophen",
    category: "Giảm đau, hạ sốt",
    form: "Viên nén",
    strength: "500mg",
    manufacturer: "Công ty Dược phẩm ABC",
    indications: "Giảm đau nhẹ đến trung bình, hạ sốt, đau đầu, đau cơ, đau răng.",
    contraindications: "Quá mẫn với paracetamol, suy gan nặng.",
    sideEffects: "Hiếm gặp: phát ban, buồn nôn, tổn thương gan (liều cao).",
    dosage: "Người lớn: 500mg - 1g/lần, cách nhau 4-6 giờ, tối đa 4g/ngày.",
    warning: "Không dùng quá liều. Tránh rượu bia khi dùng thuốc.",
    storage: "Nơi khô ráo, dưới 30°C, tránh ánh sáng."
  },
  "Amoxicillin": {
    name: "Amoxicillin",
    genericName: "Amoxicillin trihydrate",
    category: "Kháng sinh nhóm Penicillin",
    form: "Viên nang",
    strength: "500mg",
    manufacturer: "Công ty Dược XYZ",
    indications: "Nhiễm khuẩn đường hô hấp, tai mũi họng, tiết niệu, da và mô mềm.",
    contraindications: "Dị ứng với penicillin, nhiễm virus (như bạch cầu đơn nhân).",
    sideEffects: "Tiêu chảy, buồn nôn, phát ban, phản ứng dị ứng.",
    dosage: "500mg x 3 lần/ngày, trong 7-10 ngày.",
    warning: "Hoàn thành liệu trình. Báo bác sĩ nếu có tiêu chảy nặng.",
    storage: "Bảo quản nơi khô mát, tránh ẩm."
  },
  "Omeprazole": {
    name: "Omeprazole",
    genericName: "Omeprazole",
    category: "Ức chế bơm proton (PPI)",
    form: "Viên nang phóng thích chậm",
    strength: "20mg",
    manufacturer: "Công ty Dược phẩm 123",
    indications: "Loét dạ dày tá tràng, trào ngược dạ dày thực quản (GERD), hội chứng Zollinger-Ellison.",
    contraindications: "Quá mẫn với omeprazole hoặc các PPI khác.",
    sideEffects: "Đau đầu, buồn nôn, tiêu chảy, táo bón.",
    dosage: "20mg x 1 lần/ngày trước bữa ăn, trong 4-8 tuần.",
    warning: "Dùng dài ngày có thể giảm magie máu. Theo dõi nếu dùng >1 năm.",
    storage: "Nơi khô ráo, nhiệt độ phòng."
  }
}

interface PrescriptionItem {
  name: string
  dosage: string
  medicationType: string
  mealRelation: string
  duration: number
  startDay: string
  note: string
}

interface MedicalReport {
  id: string
  prescriptions: PrescriptionItem[]
  doctor: string
  clinic: string
  date: string
  patientName: string | null
}

export default function PrescriptionDetail() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<MedicalReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDrug, setSelectedDrug] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const appointmentId = params.id as string

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setLoading(true)
        const res = await fetch(
          `http://localhost:8080/api/doctors/medicalexaminationhistory/detail/${appointmentId}`
        )
        if (!res.ok) throw new Error("Không thể tải đơn thuốc")
        const data: MedicalReport[] = await res.json()
        if (data.length === 0) throw new Error("Không tìm thấy đơn thuốc")
        setReport(data[0])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (appointmentId) fetchPrescription()
  }, [appointmentId])

  const handleDrugClick = (drugName: string) => {
    const details = mockDrugDetails[drugName] || {
      name: drugName,
      genericName: "Chưa có thông tin",
      category: "Không xác định",
      indications: "Chưa có dữ liệu chi tiết.",
      dosage: "Theo chỉ định bác sĩ.",
      warning: "Tham khảo ý kiến dược sĩ."
    }
    setSelectedDrug(details)
    setSidebarOpen(true)
  }

  if (loading) return <PrescriptionSkeleton />
  if (error) return <ErrorState message={error} />
  if (!report) return <ErrorState message="Không tìm thấy dữ liệu" />

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
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
                    <Pill className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Chi Tiết Đơn Thuốc</CardTitle>
                    <p className="text-sm opacity-90">Mã cuộc hẹn: {appointmentId}</p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white">Đã kê đơn</Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Doctor & Clinic Info */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Bác sĩ kê đơn</p>
                  <p className="font-medium">BS. {report.doctor}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phòng khám</p>
                  <p className="font-medium">{report.clinic}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ngày kê</p>
                  <p className="font-medium">{format(new Date(report.date), "dd/MM/yyyy")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient */}
          {report.patientName && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Bệnh nhân: {report.patientName}</CardTitle>
              </CardHeader>
            </Card>
          )}

          {/* Prescription List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Danh sách thuốc
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.prescriptions.length > 0 ? (
                <div className="space-y-3">
                  {report.prescriptions.map((med, i) => (
                    <div
                      key={i}
                      onClick={() => handleDrugClick(med.name)}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-[#16a1bd]"
                    >
                      <div className="w-2 h-2 bg-[#16a1bd] rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-[#16a1bd]">{med.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">{med.dosage}</span> •{" "}
                          {med.mealRelation === "before" ? "Trước" :
                           med.mealRelation === "after" ? "Sau" :
                           med.mealRelation === "with" ? "Cùng với" : "Cùng"} bữa ăn •{" "}
                          <span className="font-medium">{med.duration} ngày</span>
                        </p>
                        {med.note && (
                          <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {med.note}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#16a1bd] hover:text-[#0d6171]"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDrugClick(med.name)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Không có thuốc nào được kê</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Sidebar - Drug Details */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedDrug && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    {selectedDrug.name}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Thông tin cơ bản</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tên generic:</span>
                      <span className="font-medium">{selectedDrug.genericName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nhóm thuốc:</span>
                      <span className="font-medium">{selectedDrug.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dạng bào chế:</span>
                      <span className="font-medium">{selectedDrug.form}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hàm lượng:</span>
                      <span className="font-medium">{selectedDrug.strength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hãng sản xuất:</span>
                      <span className="font-medium">{selectedDrug.manufacturer}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Chỉ định</h4>
                  <p className="text-sm text-gray-700">{selectedDrug.indications}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Chống chỉ định</h4>
                  <p className="text-sm text-gray-700">{selectedDrug.contraindications}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Tác dụng phụ</h4>
                  <p className="text-sm text-gray-700">{selectedDrug.sideEffects}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Liều dùng tham khảo</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selectedDrug.dosage}</p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm text-amber-800 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Cảnh báo
                  </h4>
                  <p className="text-sm text-amber-700">{selectedDrug.warning}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Bảo quản</h4>
                  <p className="text-sm text-gray-700">{selectedDrug.storage}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

// Skeleton & Error
function PrescriptionSkeleton() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-12 w-32" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

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
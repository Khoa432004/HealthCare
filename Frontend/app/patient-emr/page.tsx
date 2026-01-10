"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PatientSidebar } from "@/components/patient-sidebar"
import Link from "next/link"
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { userService, PersonalInfoDetailResponse } from "@/services/user.service";
import { medicalHistoryService, MedicalExaminationHistorySummaryDto, MedicalExaminationHistoryDetailDto } from "@/services/medical-history.service";

import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  AlertCircle,
  Pill,
  Syringe,
  FileText,
  Activity,
  Calendar,
  ClipboardList,
  History,
  CreditCard as PaymentIcon,
} from "lucide-react";

const Index = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoDetailResponse | null>(null);
  const [history, setHistory] = useState<MedicalExaminationHistorySummaryDto[]>([]);
  const [latestRecord, setLatestRecord] = useState<MedicalExaminationHistoryDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Personal Info
        const info = await userService.getPatientPersonalInfo();
        setPersonalInfo(info);

        // 2. Fetch History List
        if (info && info.userId) {
          const historyData = await medicalHistoryService.getHistory(info.userId);
          setHistory(historyData);

          // 3. Fetch Latest Details if history exists
          if (historyData.length > 0) {
            // Assuming historyData is naturally ordered or we take the first one
            const latestId = historyData[0].id;
            const details = await medicalHistoryService.getDetailHistory(latestId);
            if (details && details.length > 0) {
              setLatestRecord(details[0]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch EMR data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateAge = (dobString?: string) => {
    if (!dobString) return "N/A";
    const dob = new Date(dobString);
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#e5f5f8]">
        <p className="text-lg font-medium text-primary">Đang tải dữ liệu hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#e5f5f8' }}>
      <PatientSidebar />      {/* Header */}

      <main className="container mx-auto px-6 py-8 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Link href="/patient-medical-examination-history">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <History className="mr-2 h-4 w-4" />
                Lịch sử khám bệnh
              </Button>
            </Link>
            <Link href="/patient-payment-history">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <CreditCard className="mr-2 h-4 w-4" />
                Lịch sử thanh toán
              </Button>
            </Link>
          </div>
          {/* Thông tin cá nhân */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Họ và tên</p>
                      <p className="text-base font-semibold">{personalInfo?.fullName || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tuổi / Ngày sinh</p>
                      <p className="text-base">
                        {calculateAge(personalInfo?.dateOfBirth)} tuổi
                        {personalInfo?.dateOfBirth ? ` (${format(new Date(personalInfo.dateOfBirth), "dd/MM/yyyy")})` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                      <p className="text-base">{personalInfo?.phoneNumber || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-base">{personalInfo?.email || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Địa chỉ</p>
                      <p className="text-base">{personalInfo?.address || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bảo hiểm y tế</p>
                      <p className="text-base font-semibold">Chưa cập nhật</p>
                      <p className="text-sm text-muted-foreground">--/--/----</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lịch sử y tế */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Lịch sử y tế
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-destructive" />
                    <h4 className="font-semibold">Tiền sử bệnh (Gần nhất)</h4>
                  </div>
                  <div className="space-y-2 pl-6">
                    {latestRecord?.diagnosis ? (
                      <div className="flex items-start gap-2">
                        <span className="text-destructive mt-1">•</span>
                        <p>{latestRecord.diagnosis}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Chưa có dữ liệu chẩn đoán gần nhất.</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <h4 className="font-semibold">Dị ứng</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-6">
                    <span className="text-sm text-muted-foreground">Chưa có dữ liệu dị ứng.</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="h-4 w-4 text-accent" />
                    <h4 className="font-semibold">Thuốc đang sử dụng (Toa gần nhất)</h4>
                  </div>
                  <div className="space-y-3 pl-6">
                    {latestRecord?.prescriptions && latestRecord.prescriptions.length > 0 ? (
                      latestRecord.prescriptions.map((script, idx) => (
                        <div key={idx} className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{script.name} {script.dosage}</p>
                            <p className="text-sm text-muted-foreground">
                              {script.duration} ngày - {script.note || `HDSD: ${script.mealRelation}`}
                            </p>
                          </div>
                          <Badge variant="outline">{script.medicationType}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Không có đơn thuốc gần nhất.</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Syringe className="h-4 w-4 text-success" />
                    <h4 className="font-semibold">Lịch sử tiêm chủng</h4>
                  </div>
                  <div className="space-y-2 pl-6">
                    <span className="text-sm text-muted-foreground">Chưa có dữ liệu tiêm chủng.</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kết quả khám và xét nghiệm */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Kết quả khám và xét nghiệm (Gần nhất)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Chẩn đoán hiện tại</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    {latestRecord ? (
                      <>
                        <p className="font-medium text-destructive">{latestRecord.diagnosis}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {latestRecord.clinicalDiagnosis && latestRecord.clinicalDiagnosis.length > 0 ?
                            latestRecord.clinicalDiagnosis.map(v => `${v.signType}: ${v.value} ${v.unit}`).join(" | ")
                            : "Không có chỉ số sinh hiệu."}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
                    )}

                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Kết quả xét nghiệm</h4>
                  <div className="space-y-3">
                    {latestRecord?.clinicalDiagnosis && latestRecord.clinicalDiagnosis.length > 0 ? (
                      latestRecord.clinicalDiagnosis.map((vital, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded">
                          <div>
                            <p className="font-medium">{vital.signType}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{vital.value} {vital.unit}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Chưa có kết quả xét nghiệm chi tiết.</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Hình ảnh y khoa</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Chưa có hình ảnh y khoa.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kế hoạch điều trị */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Kế hoạch điều trị
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Phác đồ điều trị</h4>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    {latestRecord?.treatment ? (
                      <p className="font-medium">{latestRecord.treatment}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Không có thông tin điều trị.</p>
                    )}
                    {latestRecord?.notes && (
                      <ul className="space-y-1 text-sm text-muted-foreground pl-4">
                        <li>• {latestRecord.notes}</li>
                      </ul>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Đơn thuốc hiện tại</h4>
                  <div className="space-y-3">
                    {latestRecord?.prescriptions && latestRecord.prescriptions.length > 0 ? (
                      latestRecord.prescriptions.map((script, idx) => (
                        <div key={idx} className="p-4 border border-border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{script.name} {script.dosage}</p>
                              <p className="text-sm text-muted-foreground">{script.medicationType}</p>
                            </div>
                            <Badge>{script.duration} ngày</Badge>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">Liều dùng:</span> {script.note || script.mealRelation}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Không có đơn thuốc.</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Lịch tái khám</h4>
                  <div className="flex items-center gap-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-lg">Theo lịch hẹn của bác sĩ</p>
                      <p className="text-sm text-muted-foreground">Vui lòng kiểm tra lại với phòng khám</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ghi chú của bác sĩ - Lịch sử các lần khám */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Ghi chú của bác sĩ (Lịch sử)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((record, idx) => (
                  <div key={record.id} className={`pl-4 py-2 ${idx !== history.length - 1 ? "border-l-4 border-primary" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{record.doctor}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.date ? format(new Date(record.date), "dd/MM/yyyy - HH:mm") : "N/A"}
                        </p>
                      </div>
                      <Badge variant="outline">{record.clinic}</Badge>
                    </div>
                    <p className="text-sm mt-2">
                      <span className="font-semibold">Lý do khám:</span> {record.reason} <br />
                      {record.diagnosis && <span><span className="font-semibold">Chẩn đoán:</span> {record.diagnosis}<br /></span>}
                      {record.notes && <span><span className="font-semibold">Ghi chú:</span> {record.notes}</span>}
                    </p>
                    {idx !== history.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-sm text-muted-foreground">Chưa có lịch sử khám bệnh.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;

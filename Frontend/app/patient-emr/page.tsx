import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PatientSidebar } from "@/components/patient-sidebar"
import Link from "next/link"

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
} from "lucide-react";

const Index = () => {
  return (
    <div className="flex h-screen" style={{ backgroundColor: '#e5f5f8' }}>
      <PatientSidebar />      {/* Header */}
      {/* <header className="border-b border-border bg-card top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Hồ Sơ Bệnh Án Điện Tử</h1>
              <p className="text-sm text-muted-foreground">Mã BN: P001</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <History className="mr-2 h-4 w-4" />
              Lịch sử khám bệnh
            </Button>
          </div>
        </div>
      </header> */}

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <Link href="/patient-medical-examination-history">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <History className="mr-2 h-4 w-4" />
                Lịch sử khám bệnh
            </Button>
          </Link>
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
                      <p className="text-base font-semibold">Nguyễn Văn An</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tuổi / Ngày sinh</p>
                      <p className="text-base">45 tuổi (15/03/1980)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                      <p className="text-base">0912 345 678</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-base">nguyenvanan@email.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Địa chỉ</p>
                      <p className="text-base">123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bảo hiểm y tế</p>
                      <p className="text-base font-semibold">DN4012345678901</p>
                      <p className="text-sm text-muted-foreground">Hạn: 31/12/2025</p>
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
                    <h4 className="font-semibold">Tiền sử bệnh</h4>
                  </div>
                  <div className="space-y-2 pl-6">
                    <div className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <p>Cao huyết áp (chẩn đoán 2020)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <p>Tiểu đường type 2 (chẩn đoán 2022)</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <h4 className="font-semibold">Dị ứng</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-6">
                    <Badge variant="destructive">Penicillin</Badge>
                    <Badge variant="destructive">Hải sản</Badge>
                    <Badge variant="destructive">Phấn hoa</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="h-4 w-4 text-accent" />
                    <h4 className="font-semibold">Thuốc đang sử dụng</h4>
                  </div>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Metformin 500mg</p>
                        <p className="text-sm text-muted-foreground">2 viên/ngày - Sáng và tối sau ăn</p>
                      </div>
                      <Badge variant="outline">Đều đặn</Badge>
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Losartan 50mg</p>
                        <p className="text-sm text-muted-foreground">1 viên/ngày - Sáng trước ăn</p>
                      </div>
                      <Badge variant="outline">Đều đặn</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Syringe className="h-4 w-4 text-success" />
                    <h4 className="font-semibold">Lịch sử tiêm chủng</h4>
                  </div>
                  <div className="space-y-2 pl-6">
                    <div className="flex items-start justify-between">
                      <p>Vắc-xin COVID-19 (Pfizer)</p>
                      <span className="text-sm text-muted-foreground">15/01/2024</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <p>Vắc-xin cúm mùa</p>
                      <span className="text-sm text-muted-foreground">10/10/2024</span>
                    </div>
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
                Kết quả khám và xét nghiệm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Chẩn đoán hiện tại</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium text-destructive">Tăng huyết áp độ II - E11</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Huyết áp: 150/95 mmHg | Đường huyết: 8.5 mmol/L
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Kết quả xét nghiệm (10/11/2025)</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                      <div>
                        <p className="font-medium">HbA1c</p>
                        <p className="text-sm text-muted-foreground">Đường huyết trung bình</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-warning">7.2%</p>
                        <p className="text-xs text-muted-foreground">BT: {"<6.5%"}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                      <div>
                        <p className="font-medium">Cholesterol toàn phần</p>
                        <p className="text-sm text-muted-foreground">Chỉ số lipid máu</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">4.8 mmol/L</p>
                        <p className="text-xs text-muted-foreground">BT: {"<5.2"}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                      <div>
                        <p className="font-medium">Creatinine</p>
                        <p className="text-sm text-muted-foreground">Chức năng thận</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">88 μmol/L</p>
                        <p className="text-xs text-muted-foreground">BT: 62-106</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Hình ảnh y khoa</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">X-quang ngực</p>
                          <p className="text-sm text-muted-foreground">05/11/2025</p>
                        </div>
                      </div>
                      <Badge variant="outline">Xem</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Siêu âm bụng</p>
                          <p className="text-sm text-muted-foreground">20/10/2025</p>
                        </div>
                      </div>
                      <Badge variant="outline">Xem</Badge>
                    </div>
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
                    <p className="font-medium">Kiểm soát đường huyết và huyết áp</p>
                    <ul className="space-y-1 text-sm text-muted-foreground pl-4">
                      <li>• Duy trì chế độ ăn uống ít đường, ít muối</li>
                      <li>• Tập thể dục 30 phút/ngày, 5 ngày/tuần</li>
                      <li>• Theo dõi đường huyết hàng ngày</li>
                      <li>• Đo huyết áp 2 lần/ngày (sáng - tối)</li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Đơn thuốc hiện tại</h4>
                  <div className="space-y-3">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Metformin 500mg</p>
                          <p className="text-sm text-muted-foreground">Viên nén bao phim</p>
                        </div>
                        <Badge>60 viên</Badge>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">Liều dùng:</span> 2 viên/ngày (1 viên sáng, 1 viên tối) sau bữa ăn
                      </p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Losartan 50mg</p>
                          <p className="text-sm text-muted-foreground">Viên nén</p>
                        </div>
                        <Badge>30 viên</Badge>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">Liều dùng:</span> 1 viên/ngày vào buổi sáng trước bữa ăn
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Lịch tái khám</h4>
                  <div className="flex items-center gap-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-lg">20/12/2025 - 09:00</p>
                      <p className="text-sm text-muted-foreground">BS. Trần Văn Bình - Phòng khám Tim Mạch</p>
                      <p className="text-sm mt-1">Kiểm tra định kỳ và đánh giá kết quả điều trị</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ghi chú của bác sĩ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Ghi chú của bác sĩ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">BS. Trần Văn Bình</p>
                      <p className="text-sm text-muted-foreground">10/11/2025 - 14:30</p>
                    </div>
                    <Badge variant="default">Khám định kỳ</Badge>
                  </div>
                  <p className="text-sm mt-2">
                    Bệnh nhân đến khám theo lịch hẹn. Tình trạng chung ổn định. Huyết áp đo được 150/95 mmHg,
                    cao hơn mục tiêu điều trị. Đường huyết lúc đói 8.5 mmol/L. Bệnh nhân cho biết có tuân thủ
                    dùng thuốc nhưng chế độ ăn chưa được kiểm soát tốt. Tư vấn bệnh nhân về chế độ dinh dưỡng,
                    tăng cường vận động. Duy trì phác đồ điều trị hiện tại, hẹn tái khám sau 6 tuần.
                  </p>
                </div>

                <Separator />

                <div className="border-l-4 border-accent pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">BS. Lê Thị Cẩm</p>
                      <p className="text-sm text-muted-foreground">25/09/2025 - 10:15</p>
                    </div>
                    <Badge variant="secondary">Tái khám</Badge>
                  </div>
                  <p className="text-sm mt-2">
                    Bệnh nhân tái khám sau 2 tháng điều trị. Kết quả xét nghiệm HbA1c giảm từ 8.1% xuống 7.2%,
                    cho thấy đường huyết được kiểm soát tốt hơn. Huyết áp ổn định ở mức 135/85 mmHg. Bệnh nhân
                    không có triệu chứng bất thường. Tiếp tục duy trì phác đồ điều trị và theo dõi định kỳ.
                  </p>
                </div>

                <Separator />

                <div className="border-l-4 border-muted pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">BS. Nguyễn Hoàng Dũng</p>
                      <p className="text-sm text-muted-foreground">15/07/2025 - 16:00</p>
                    </div>
                    <Badge variant="outline">Khám lần đầu</Badge>
                  </div>
                  <p className="text-sm mt-2">
                    Bệnh nhân đến khám với triệu chứng mệt mỏi, đi tiểu nhiều, khát nước. Tiền sử gia đình có
                    người mắc tiểu đường. Kết quả xét nghiệm cho thấy đường huyết lúc đói 12.3 mmol/L, HbA1c 8.1%.
                    Chẩn đoán tiểu đường type 2. Bắt đầu phác đồ điều trị với Metformin, tư vấn chế độ ăn uống
                    và vận động. Hẹn tái khám sau 1 tháng để đánh giá hiệu quả điều trị.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;

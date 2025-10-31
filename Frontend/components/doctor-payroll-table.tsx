"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, DollarSign, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { payrollService, DoctorPayroll } from "@/services/payroll.service"

export function DoctorPayrollTable() {
  const { toast } = useToast()
  const [payrolls, setPayrolls] = useState<DoctorPayroll[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  
  // Current month/year for filter
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  
  const [settleDialog, setSettleDialog] = useState<{ open: boolean; payroll: DoctorPayroll | null }>({
    open: false,
    payroll: null,
  })
  const [settling, setSettling] = useState(false)
  const [settleNote, setSettleNote] = useState("")
  const [confirmNoAdjustments, setConfirmNoAdjustments] = useState(false)

  const loadPayrolls = async () => {
    setLoading(true)
    try {
      const response = await payrollService.getDoctorPayrolls(selectedYear, selectedMonth, search)
      setPayrolls(response || [])
    } catch (error: any) {
      console.error("Error loading payrolls:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách bảng lương",
        variant: "destructive",
      })
      setPayrolls([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayrolls()
  }, [selectedYear, selectedMonth])

  const handleSearch = () => {
    loadPayrolls()
  }

  const handleSettle = async () => {
    if (!settleDialog.payroll) return

    // Validate confirmation
    if (!confirmNoAdjustments) {
      toast({
        title: "Lỗi",
        description: "Vui lòng xác nhận không có điều chỉnh thêm",
        variant: "destructive",
      })
      return
    }

    setSettling(true)
    try {
      await payrollService.settlePayroll({
        doctorId: settleDialog.payroll.doctorId,
        year: selectedYear,
        month: selectedMonth,
        note: settleNote,
      })

      toast({
        title: "Thành công",
        description: `Tất toán lương thành công cho ${settleDialog.payroll.doctorName}`,
      })

      setSettleDialog({ open: false, payroll: null })
      setSettleNote("")
      setConfirmNoAdjustments(false)
      loadPayrolls()
    } catch (error: any) {
      console.error("Error settling payroll:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xử lý thanh toán lương",
        variant: "destructive",
      })
    } finally {
      setSettling(false)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === 0) return "0 ₫"
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "settled":
        return <Badge className="bg-green-500">Đã thanh toán</Badge>
      case "unsettled":
        return <Badge variant="outline">Chưa thanh toán</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bảng lương bác sĩ</h2>
          <p className="text-sm text-gray-500">
            Quản lý và thanh toán lương cho bác sĩ ({payrolls.length} bác sĩ)
          </p>
        </div>
      </div>

      {/* Filter: Year & Month */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Chọn tháng/năm</label>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tìm kiếm"}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bác sĩ</TableHead>
              <TableHead className="text-center">Số lịch khám</TableHead>
              <TableHead className="text-right">Tổng doanh thu</TableHead>
              <TableHead className="text-right">Phí nền tảng (15%)</TableHead>
              <TableHead className="text-right">Lương bác sĩ (Net)</TableHead>
              <TableHead className="text-center">Trạng thái thanh toán</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : payrolls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Không có dữ liệu cho tháng này
                </TableCell>
              </TableRow>
            ) : (
              payrolls.map((payroll) => (
                <TableRow key={payroll.doctorId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payroll.doctorName}</div>
                      <div className="text-xs text-gray-500">{payroll.email}</div>
                      <div className="text-xs text-gray-500">{payroll.phoneNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{payroll.completedAppointments}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(payroll.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(payroll.platformFee)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {formatCurrency(payroll.doctorSalary)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(payroll.paymentStatus)}
                  </TableCell>
                  <TableCell className="text-center">
                    {payroll.canSettle && payroll.paymentStatus.toLowerCase() === "unsettled" && payroll.totalRevenue > 0 ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSettleDialog({ open: true, payroll })}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Xác nhận tất toán
                      </Button>
                    ) : payroll.totalRevenue === 0 ? (
                      <span className="text-xs text-gray-500">Không có lương để thực hiện thanh toán</span>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Settle Dialog */}
      <Dialog 
        open={settleDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setSettleNote("")
            setConfirmNoAdjustments(false)
          }
          setSettleDialog({ open, payroll: null })
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {settleDialog.payroll && `Xác nhận tất toán lương — ${settleDialog.payroll.doctorName} — ${monthNames[selectedMonth - 1]}/${selectedYear}`}
            </DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra và xác nhận thông tin trước khi tất toán
            </DialogDescription>
          </DialogHeader>
          {settleDialog.payroll && (
            <div className="space-y-3 py-4">
              {/* Số lịch khám */}
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Số lịch khám</span>
                <span className="text-sm text-gray-600">{settleDialog.payroll.completedAppointments}</span>
              </div>

              {/* Tổng doanh thu */}
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Tổng doanh thu (Gross)</span>
                <span className="text-sm font-semibold">{formatCurrency(settleDialog.payroll.totalRevenue)}</span>
              </div>

              {/* Refunds */}
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Hoàn tiền</span>
                <span className="text-sm text-red-600">{formatCurrency(settleDialog.payroll.refunds)}</span>
              </div>

              {/* Phí nền tảng */}
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Phí nền tảng (15%)</span>
                <span className="text-sm text-red-600">{formatCurrency(settleDialog.payroll.platformFee)}</span>
              </div>

              {/* Lương bác sĩ Net */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold">Lương bác sĩ (Net)</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(settleDialog.payroll.doctorSalary)}</span>
              </div>

              {/* Note field */}
              <div className="space-y-2 pt-4">
                <Label htmlFor="settleNote" className="text-sm font-medium">
                  Ghi chú (tùy chọn)
                </Label>
                <Textarea
                  id="settleNote"
                  placeholder="Nhập ghi chú nếu có..."
                  value={settleNote}
                  onChange={(e) => setSettleNote(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Confirmation checkbox */}
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="confirmNoAdjustments"
                  checked={confirmNoAdjustments}
                  onCheckedChange={(checked) => setConfirmNoAdjustments(checked as boolean)}
                />
                <Label
                  htmlFor="confirmNoAdjustments"
                  className="text-sm font-normal cursor-pointer leading-5"
                >
                  Tôi xác nhận không có điều chỉnh thêm cho kỳ này.
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSettleDialog({ open: false, payroll: null })
              setSettleNote("")
              setConfirmNoAdjustments(false)
            }}>
              Hủy
            </Button>
            <Button onClick={handleSettle} disabled={settling || !confirmNoAdjustments}>
              {settling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


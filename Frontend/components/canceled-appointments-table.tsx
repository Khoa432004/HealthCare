"use client"

import { useState, useEffect } from "react"
import { Search, RefreshCw, DollarSign, Calendar, User, Phone, FileText, Clock, Loader2 } from "lucide-react"
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
import { canceledAppointmentService, CanceledAppointment } from "@/services/canceled-appointment.service"

export function CanceledAppointmentsTable() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<CanceledAppointment[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [refundDialog, setRefundDialog] = useState<{ open: boolean; appointment: CanceledAppointment | null }>({
    open: false,
    appointment: null,
  })
  const [refunding, setRefunding] = useState(false)
  const [refundReason, setRefundReason] = useState("")
  const [sendNotification, setSendNotification] = useState(true)

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const response = await canceledAppointmentService.getCanceledAppointments(search, page, 10)
      setAppointments(response.content || [])
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
    } catch (error: any) {
      console.error("Error loading canceled appointments:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách cuộc hẹn đã hủy",
        variant: "destructive",
      })
      // Set empty state on error
      setAppointments([])
      setTotalPages(0)
      setTotalElements(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [page])

  const handleSearch = () => {
    setPage(0)
    loadAppointments()
  }

  const handleRefund = async () => {
    if (!refundDialog.appointment || !refundDialog.appointment.paymentId) return

    // Validate lý do hoàn tiền
    if (!refundReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do hoàn tiền",
        variant: "destructive",
      })
      return
    }

    setRefunding(true)
    try {
      await canceledAppointmentService.processRefund({
        paymentId: refundDialog.appointment.paymentId,
        appointmentId: refundDialog.appointment.appointmentId,
        refundReason: refundReason,
      })

      toast({
        title: "Thành công",
        description: sendNotification 
          ? "Hoàn tiền thành công. Thông báo đã được gửi đến bệnh nhân."
          : "Hoàn tiền thành công",
      })

      setRefundDialog({ open: false, appointment: null })
      setRefundReason("")
      setSendNotification(true)
      loadAppointments()
    } catch (error: any) {
      console.error("Error processing refund:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xử lý hoàn tiền",
        variant: "destructive",
      })
    } finally {
      setRefunding(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes} ${day}/${month}/${year}`
  }
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A"
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-500">Đã thanh toán</Badge>
      case "refunded":
        return <Badge className="bg-blue-500">Đã hoàn tiền</Badge>
      case "pending":
        return <Badge variant="outline">Chờ thanh toán</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAppointmentStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "scheduled":
        return <Badge className="bg-blue-500">Đã lên lịch</Badge>
      case "completed":
        return <Badge className="bg-green-500">Hoàn thành</Badge>
      case "canceled":
        return <Badge variant="destructive">Đã hủy</Badge>
      case "in_process":
        return <Badge className="bg-yellow-500">Đang diễn ra</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Filter appointments by status (client-side for better UX)
  const filteredAppointments = statusFilter === "all" 
    ? appointments 
    : appointments.filter(apt => apt.appointmentStatus?.toLowerCase() === statusFilter)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý cuộc hẹn</h2>
          <p className="text-sm text-gray-500">
            Xem và quản lý tất cả các cuộc hẹn trong hệ thống ({totalElements} tổng số)
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          Tất cả
        </Button>
        <Button 
          variant={statusFilter === "scheduled" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("scheduled")}
        >
          Đã lên lịch
        </Button>
        <Button 
          variant={statusFilter === "in_process" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("in_process")}
        >
          Đang diễn ra
        </Button>
        <Button 
          variant={statusFilter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("completed")}
        >
          Hoàn thành
        </Button>
        <Button 
          variant={statusFilter === "canceled" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("canceled")}
        >
          Đã hủy
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm theo mã, bác sĩ, bệnh nhân, SĐT, trạng thái..."
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
              <TableHead>Mã cuộc hẹn</TableHead>
              <TableHead>Thời gian khám</TableHead>
              <TableHead>Bác sĩ</TableHead>
              <TableHead>Bệnh nhân</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Không có cuộc hẹn nào
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((appointment) => (
                <TableRow key={appointment.appointmentId}>
                  <TableCell className="font-mono text-xs">
                    {appointment.appointmentId.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(appointment.scheduledStart)}</div>
                      <div className="text-gray-500 text-xs">
                        đến {formatTime(appointment.scheduledEnd)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.doctorName}</TableCell>
                  <TableCell>
                    <div>
                      <div>{appointment.patientName}</div>
                      <div className="text-xs text-gray-500">{appointment.patientPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getAppointmentStatusBadge(appointment.appointmentStatus || "unknown")}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {appointment.cancellationReason && (
                      <>
                        <div className="truncate text-sm" title={appointment.cancellationReason}>
                          {appointment.cancellationReason}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.canceledBy === "DOCTOR" && "Bởi: Bác sĩ"}
                          {appointment.canceledBy === "PATIENT" && "Bởi: Bệnh nhân"}
                          {!["DOCTOR", "PATIENT"].includes(appointment.canceledBy) && appointment.canceledBy !== "Không rõ" && `Bởi: ${appointment.canceledBy}`}
                        </div>
                      </>
                    )}
                    {!appointment.cancellationReason && <span className="text-gray-400 text-sm">-</span>}
                  </TableCell>
                  <TableCell>{getPaymentStatusBadge(appointment.paymentStatus)}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(appointment.totalAmount)}
                  </TableCell>
                  <TableCell>
                    {/* Hiển thị nút Hoàn tiền khi: appointment canceled + payment pending */}
                    {appointment.paymentId && 
                     appointment.appointmentStatus?.toLowerCase() === "canceled" &&
                     appointment.paymentStatus.toLowerCase() === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRefundDialog({ open: true, appointment })}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Hoàn tiền
                      </Button>
                    )}
                    {/* Đã hoàn tiền xong */}
                    {appointment.paymentStatus.toLowerCase() === "refunded" && (
                      <span className="text-xs text-green-600 font-medium">✓ Đã hoàn tiền</span>
                    )}
                    {/* Đã thanh toán */}
                    {appointment.paymentStatus.toLowerCase() === "paid" && (
                      <span className="text-xs text-gray-600">Đã thanh toán</span>
                    )}
                    {/* Không có thanh toán */}
                    {appointment.paymentStatus === "No payment" && (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Trang {page + 1} / {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1 || loading}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Refund Dialog */}
      <Dialog 
        open={refundDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setRefundReason("")
            setSendNotification(true)
          }
          setRefundDialog({ open, appointment: null })
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận hoàn tiền</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hoàn tiền cho cuộc hẹn này không?
            </DialogDescription>
          </DialogHeader>
          {refundDialog.appointment && (
            <div className="space-y-4 py-4">
              {/* Thông tin bệnh nhân */}
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Bệnh nhân</div>
                  <div className="text-sm text-gray-600">{refundDialog.appointment.patientName}</div>
                  <div className="text-xs text-gray-500">{refundDialog.appointment.patientPhone}</div>
                </div>
              </div>

              {/* Số tiền hoàn */}
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Số tiền hoàn</div>
                  <div className="text-lg text-red-600 font-bold">
                    {formatCurrency(refundDialog.appointment.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Lý do hủy cuộc hẹn */}
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Lý do hủy cuộc hẹn</div>
                  <div className="text-sm text-gray-600">{refundDialog.appointment.cancellationReason || "Không có lý do"}</div>
                </div>
              </div>

              {/* Lý do hoàn tiền (input) */}
              <div className="space-y-2">
                <Label htmlFor="refundReason" className="text-sm font-medium">
                  Lý do hoàn tiền <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="refundReason"
                  placeholder="Nhập lý do hoàn tiền..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Checkbox gửi thông báo */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendNotification"
                  checked={sendNotification}
                  onCheckedChange={(checked) => setSendNotification(checked as boolean)}
                />
                <Label
                  htmlFor="sendNotification"
                  className="text-sm font-normal cursor-pointer"
                >
                  Gửi thông báo đến bệnh nhân: "Lịch hẹn đã được hoàn tiền thành công"
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialog({ open: false, appointment: null })}>
              Hủy
            </Button>
            <Button onClick={handleRefund} disabled={refunding}>
              {refunding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận hoàn tiền"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


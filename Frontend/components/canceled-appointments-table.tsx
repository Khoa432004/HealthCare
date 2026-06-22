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
import { useTranslation } from "react-i18next"

export function CanceledAppointmentsTable() {
  const { t } = useTranslation()
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
        title: t("error"),
        description: error.message || t("loadAppointmentsFailed", "Unable to load appointments"),
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
        title: t("error"),
        description: t("refundReasonRequired", "Please enter a refund reason"),
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
        title: t("success"),
        description: sendNotification 
          ? t("refundSuccessNotified", "Refund successful. Notification sent to patient.")
          : t("refundSuccess", "Refund successful"),
      })

      setRefundDialog({ open: false, appointment: null })
      setRefundReason("")
      setSendNotification(true)
      loadAppointments()
    } catch (error: any) {
      console.error("Error processing refund:", error)
      toast({
        title: t("error"),
        description: error.message || t("refundFailed", "Unable to process refund"),
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
        return <Badge className="bg-green-500">{t("paid")}</Badge>
      case "refunded":
        return <Badge className="bg-blue-500">{t("refunded", "Refunded")}</Badge>
      case "pending":
        return <Badge variant="outline">{t("pending")}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAppointmentStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "scheduled":
        return <Badge className="bg-blue-500">{t("scheduled")}</Badge>
      case "completed":
        return <Badge className="bg-green-500">{t("completed")}</Badge>
      case "canceled":
        return <Badge variant="destructive">{t("cancelled")}</Badge>
      case "in_process":
        return <Badge className="bg-yellow-500">{t("inProgress")}</Badge>
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
          <h2 className="text-2xl font-bold text-gray-900">{t("appointmentManagement")}</h2>
          <p className="text-sm text-gray-500">
            {t("appointmentManagementDesc", "Manage all appointments in the system")} ({totalElements})
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
          {t("all")}
        </Button>
        <Button 
          variant={statusFilter === "scheduled" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("scheduled")}
        >
          {t("scheduledTab")}
        </Button>
        <Button 
          variant={statusFilter === "in_process" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("in_process")}
        >
          {t("inProgressTab")}
        </Button>
        <Button 
          variant={statusFilter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("completed")}
        >
          {t("completed")}
        </Button>
        <Button 
          variant={statusFilter === "canceled" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("canceled")}
        >
          {t("cancelled")}
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("search")}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("appointmentId")}</TableHead>
              <TableHead>{t("examTime")}</TableHead>
              <TableHead>{t("doctor")}</TableHead>
              <TableHead>{t("patient")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("reason")}</TableHead>
              <TableHead>{t("payment", "Payment")}</TableHead>
              <TableHead>{t("amount", "Amount")}</TableHead>
              <TableHead>{t("actions")}</TableHead>
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
                  {t("noAppointments", "No appointments")}
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
                        {t("toLabel", "to")} {formatTime(appointment.scheduledEnd)}
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
                          {appointment.canceledBy === "DOCTOR" && `${t("by", "By")}: ${t("doctor")}`}
                          {appointment.canceledBy === "PATIENT" && `${t("by", "By")}: ${t("patient")}`}
                          {!["DOCTOR", "PATIENT"].includes(appointment.canceledBy) && appointment.canceledBy !== "Không rõ" && `${t("by", "By")}: ${appointment.canceledBy}`}
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
                        {t("refund")}
                      </Button>
                    )}
                    {/* Đã hoàn tiền xong */}
                    {appointment.paymentStatus.toLowerCase() === "refunded" && (
                      <span className="text-xs text-green-600 font-medium">✓ {t("refunded", "Refunded")}</span>
                    )}
                    {/* Đã thanh toán */}
                    {appointment.paymentStatus.toLowerCase() === "paid" && (
                      <span className="text-xs text-gray-600">{t("paid")}</span>
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
            {t("page", "Page")} {page + 1} / {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
            >
              {t("previous", "Previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1 || loading}
            >
              {t("next")}
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
            <DialogTitle>{t("confirmRefund")}</DialogTitle>
            <DialogDescription>
              {t("confirmRefundDesc", "Are you sure you want to refund this appointment?")}
            </DialogDescription>
          </DialogHeader>
          {refundDialog.appointment && (
            <div className="space-y-4 py-4">
              {/* Thông tin bệnh nhân */}
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{t("patient")}</div>
                  <div className="text-sm text-gray-600">{refundDialog.appointment.patientName}</div>
                  <div className="text-xs text-gray-500">{refundDialog.appointment.patientPhone}</div>
                </div>
              </div>

              {/* Số tiền hoàn */}
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{t("refundAmount", "Refund amount")}</div>
                  <div className="text-lg text-red-600 font-bold">
                    {formatCurrency(refundDialog.appointment.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Lý do hủy cuộc hẹn */}
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{t("cancelReason")}</div>
                  <div className="text-sm text-gray-600">{refundDialog.appointment.cancellationReason || t("noReason", "No reason")}</div>
                </div>
              </div>

              {/* Lý do hoàn tiền (input) */}
              <div className="space-y-2">
                <Label htmlFor="refundReason" className="text-sm font-medium">
                  {t("refundReason")} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="refundReason"
                  placeholder={t("enterRefundReason", "Enter refund reason...")}
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
                  {t("notifyPatient")}
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialog({ open: false, appointment: null })}>
              {t("cancel")}
            </Button>
            <Button onClick={handleRefund} disabled={refunding}>
              {refunding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("processing")}
                </>
              ) : (
                t("confirmRefund")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


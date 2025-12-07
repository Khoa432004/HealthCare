"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PatientSidebar } from "@/components/patient-sidebar"
import Link from "next/link"
import { ArrowLeft, Calendar, DollarSign, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"

interface PaymentHistoryItem {
  id: string
  appointmentId: string
  amount: number
  totalAmount: number
  discount?: number
  tax?: number
  method: string // e.g., "VNPAY"
  status: string // e.g., "PAID", "PENDING", "FAILED"
  paymentTime?: string // ISO datetime
  refundedAt?: string
  refundReason?: string
}

interface AppointmentInfo {
  id: string
  doctorName?: string
  specialty?: string
  scheduledStart?: string
  reason?: string
}

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
  const [appointments, setAppointments] = useState<Map<string, AppointmentInfo>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPaymentHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch user's appointments first (to get associated appointment details)
        const appointmentsRes: any = await apiClient.get(API_ENDPOINTS.APPOINTMENTS.MY_APPOINTMENTS)
        const appointmentList = Array.isArray(appointmentsRes) ? appointmentsRes : (appointmentsRes?.data || [])

        // Build a map of appointment ID to appointment info
        const appointmentMap = new Map<string, AppointmentInfo>()
        appointmentList.forEach((apt: any) => {
          appointmentMap.set(apt.id, {
            id: apt.id,
            doctorName: apt.doctorName || apt.doctorFullName,
            specialty: apt.doctorSpecialties,
            scheduledStart: apt.scheduledStart,
            reason: apt.reason,
          })
        })
        setAppointments(appointmentMap)

        // Fetch payments via a new endpoint or mock data
        // For now, we'll try to fetch from a payments list endpoint if it exists
        try {
          const paymentsRes: any = await apiClient.get("/api/v1/payments/my-payments")
          const paymentsList = Array.isArray(paymentsRes) ? paymentsRes : (paymentsRes?.data || [])
          setPayments(paymentsList)
        } catch (payErr) {
          // If endpoint doesn't exist, show mock data or empty state
          console.warn("Payment history endpoint not available:", payErr)
          setPayments([])
        }
      } catch (err: any) {
        console.error("Error loading payment history:", err)
        setError(err.message || "Failed to load payment history")
      } finally {
        setIsLoading(false)
      }
    }

    loadPaymentHistory()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "pending"
    if (statusLower === "paid") {
      return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Đã thanh toán</Badge>
    } else if (statusLower === "pending") {
      return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="w-3 h-3" /> Đang xử lý</Badge>
    } else if (statusLower === "failed") {
      return <Badge className="bg-red-100 text-red-800 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Thất bại</Badge>
    }
    return <Badge>{status}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A"
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <PatientSidebar />

      <main className="flex-1 overflow-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/patient-emr">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lịch sử thanh toán</h1>
              <p className="text-sm text-gray-600 mt-1">Xem chi tiết tất cả các giao dịch thanh toán của bạn</p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin mb-4">
                    <Clock className="w-8 h-8 text-primary mx-auto" />
                  </div>
                  <p className="text-gray-600">Đang tải lịch sử thanh toán...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-start gap-3 py-4">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Lỗi</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && !error && payments.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">Chưa có giao dịch thanh toán</p>
                <p className="text-sm text-gray-500 mt-1">Những thanh toán của bạn sẽ hiển thị ở đây</p>
              </CardContent>
            </Card>
          )}

          {/* Payments List */}
          {!isLoading && !error && payments.length > 0 && (
            <div className="space-y-4">
              {payments.map((payment) => {
                const appointmentInfo = appointments.get(payment.appointmentId)
                return (
                  <Card key={payment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-6">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Appointment Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {appointmentInfo?.doctorName ? `Khám với ${appointmentInfo.doctorName}` : "Khám bệnh"}
                              </p>
                              {appointmentInfo?.specialty && (
                                <p className="text-sm text-gray-600 mt-1">{appointmentInfo.specialty}</p>
                              )}
                              {appointmentInfo?.scheduledStart && (
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(appointmentInfo.scheduledStart)}</span>
                                </div>
                              )}
                              {appointmentInfo?.reason && (
                                <p className="text-sm text-gray-600 mt-1 italic">Lý do: {appointmentInfo.reason}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Payment Details */}
                        <div className="text-right space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Số tiền</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.totalAmount)}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {getStatusBadge(payment.status)}
                            <p className="text-xs text-gray-500">
                              {payment.method || "VNPAY"} • {formatDate(payment.paymentTime)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      {(payment.discount || payment.tax) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-sm">
                          {payment.discount && (
                            <div>
                              <p className="text-gray-600">Giảm giá</p>
                              <p className="font-semibold text-red-600">-{formatCurrency(payment.discount)}</p>
                            </div>
                          )}
                          {payment.tax && (
                            <div>
                              <p className="text-gray-600">Thuế</p>
                              <p className="font-semibold">{formatCurrency(payment.tax)}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-600">Số gốc</p>
                            <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                          </div>
                        </div>
                      )}

                      {/* Refund Info */}
                      {payment.refundedAt && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                          <p className="font-medium text-yellow-900">Đã hoàn tiền</p>
                          <p className="text-yellow-800 text-xs mt-1">Ngày hoàn: {formatDate(payment.refundedAt)}</p>
                          {payment.refundReason && (
                            <p className="text-yellow-800 text-xs mt-1">Lý do: {payment.refundReason}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default PaymentHistoryPage

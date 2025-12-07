"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function PaymentResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const payment = searchParams?.get("payment")
  const orderInfo = searchParams?.get("orderInfo")

  useEffect(() => {
    // If no payment param, redirect to dashboard
    if (!payment) {
      router.replace("/patient-dashboard")
      return
    }

    // If payment was successful, create the appointment
    if (payment === "success") {
      createAppointment()
    }
  }, [payment, router])

  const createAppointment = async () => {
    try {
      setIsCreatingAppointment(true)
      setError(null)

      // Retrieve appointment details from localStorage
      const appointmentData = localStorage.getItem("pendingAppointment")
      if (!appointmentData) {
        setError("Appointment data not found. Please try booking again.")
        setIsCreatingAppointment(false)
        return
      }

      const data = JSON.parse(appointmentData)

      // Extract VNPay params (if any) and include them in booking request so backend can persist Payment atomically
      const vnpTransactionNo = searchParams?.get("vnp_TransactionNo")
      const vnpTxnRef = searchParams?.get("vnp_TxnRef")
      const vnpPayDate = searchParams?.get("vnp_PayDate")
      const vnpAmount = searchParams?.get("vnp_Amount")

      // VNPay amount is multiplied by 100 in the VNPay request
      // Fallback to stored appointment totalAmount if VNPay didn't provide amount
      const totalAmount = vnpAmount ? Number(vnpAmount) / 100 : (data.totalAmount ?? null)

      // Try to parse VNPay pay date to an ISO datetime if possible; otherwise leave null
      let paymentTime = null
      if (vnpPayDate) {
        try {
          // VNPay typically returns vnp_PayDate in format yyyyMMddHHmmss
          const s = vnpPayDate
          if (/^\d{14}$/.test(s)) {
            const y = s.substring(0, 4)
            const m = s.substring(4, 6)
            const d = s.substring(6, 8)
            const hh = s.substring(8, 10)
            const mm = s.substring(10, 12)
            const ss = s.substring(12, 14)
            paymentTime = `${y}-${m}-${d}T${hh}:${mm}:${ss}+07:00`
          }
        } catch (err) {
          console.warn('Failed to parse vnp_PayDate', err)
        }
      }

      // Call the backend API to create appointment (and optionally persist payment)
      const response = await fetch("http://localhost:8080/api/v1/appointments/book-from-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          doctorId: data.doctorId,
          scheduledStart: data.scheduledStart,
          scheduledEnd: data.scheduledEnd,
          reason: data.reason,
          symptomsOns: data.symptomsOns,
          symptomsSever: data.symptomsSever,
          currentMedication: data.currentMedication,
          // payment fields
          totalAmount,
          method: vnpTransactionNo ? "vnpay" : undefined,
          status: vnpTransactionNo ? "paid" : undefined,
          transactionId: vnpTransactionNo || undefined,
          transactionRef: vnpTxnRef || undefined,
          paymentTime: paymentTime || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create appointment")
      }

      // Parse created appointment to get its id
      const respBody = await response.json()
      const appointment = respBody?.data
      const appointmentId = appointment?.id

      // previously we used a separate /payments endpoint; now payment info is included in booking request

      // Clear the stored appointment data
      localStorage.removeItem("pendingAppointment")

      // Show success and allow redirect
      setError(null)
    } catch (err: any) {
      console.error("Error creating appointment:", err)
      setError(err.message || "Failed to create appointment. Please contact support.")
    } finally {
      setIsCreatingAppointment(false)
    }
  }

  const message = payment === "success"
    ? `Thanh toán thành công${orderInfo ? ` — ${decodeURIComponent(orderInfo)}` : ''}`
    : `Thanh toán thất bại${orderInfo ? ` — ${decodeURIComponent(orderInfo)}` : ''}`

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-2">Kết quả thanh toán</h2>
        <div className={`p-4 rounded-md mb-4 ${payment === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message}
        </div>

        {isCreatingAppointment && (
          <div className="p-4 rounded-md mb-4 bg-blue-50 border border-blue-200 text-blue-800">
            Creating appointment... please wait.
          </div>
        )}

        {error && (
          <div className="p-4 rounded-md mb-4 bg-red-50 border border-red-200 text-red-800">
            {error}
          </div>
        )}

        {!isCreatingAppointment && payment === "success" && !error && (
          <div className="p-4 rounded-md mb-4 bg-green-50 border border-green-200 text-green-800">
            Appointment created successfully! Redirecting to dashboard...
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={() => router.push('/patient-dashboard')} disabled={isCreatingAppointment}>
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.push('/login?redirect=%2Fpatient-dashboard')} disabled={isCreatingAppointment}>
            Login
          </Button>
        </div>
      </div>
    </div>
  )
}

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

      // Call the backend API to create appointment
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

      // If VNPay params exist in URL, create payment record
      const vnpTransactionNo = searchParams?.get("vnp_TransactionNo")
      const vnpTxnRef = searchParams?.get("vnp_TxnRef")
      const vnpPayDate = searchParams?.get("vnp_PayDate")
      const vnpAmount = searchParams?.get("vnp_Amount")

      if (appointmentId && vnpTransactionNo) {
        try {
          // VNPay amount is multiplied by 100 in the VNPay request
          const totalAmount = vnpAmount ? Number(vnpAmount) / 100 : null

          await fetch("http://localhost:8080/api/v1/payments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify({
              appointmentId,
              totalAmount,
              method: "vnpay",
              status: "paid",
              transactionId: vnpTransactionNo,
              transactionRef: vnpTxnRef,
            }),
          })
        } catch (payErr) {
          console.error("Failed to persist payment record:", payErr)
        }
      }

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

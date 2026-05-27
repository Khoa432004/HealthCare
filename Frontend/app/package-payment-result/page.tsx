"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/api-config"

function PackagePaymentResultContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const payment = searchParams?.get("payment")
    const orderInfo = searchParams?.get("orderInfo")

    useEffect(() => {
        // If no payment param, redirect to dashboard
        if (!payment) {
            router.replace("/patient-dashboard")
            return
        }

        // If payment was successful, create the package purchase
        if (payment === "success") {
            createPackagePurchase()
        }
    }, [payment, router])

    const createPackagePurchase = async () => {
        try {
            setIsProcessing(true)
            setError(null)

            // Retrieve package purchase details from localStorage
            const packageData = localStorage.getItem("pendingPackagePurchase")
            if (!packageData) {
                setError("Package data not found. Please try purchasing again.")
                setIsProcessing(false)
                return
            }

            const data = JSON.parse(packageData)

            // Extract VNPay params (if any)
            const vnpTransactionNo = searchParams?.get("vnp_TransactionNo")
            const vnpTxnRef = searchParams?.get("vnp_TxnRef")
            const vnpPayDate = searchParams?.get("vnp_PayDate")
            const vnpAmount = searchParams?.get("vnp_Amount")

            // VNPay amount is multiplied by 100 in the VNPay request
            // Fallback to stored package priceVnd if VNPay didn't provide amount
            const totalAmount = vnpAmount ? Number(vnpAmount) / 100 : (data.priceVnd ?? null)

            // Try to parse VNPay pay date to an ISO datetime if possible
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

            // Call the backend API to create package purchase
            const response = await fetch(`${API_BASE_URL}/api/v1/patient-packages/purchase-from-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({
                    doctorId: data.doctorId,
                    packageId: data.packageId,
                    packageName: data.packageName,
                    priceVnd: data.priceVnd,
                    durationDays: data.durationDays,
                    patientId: data.patientId,
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
                throw new Error(errorData.message || "Failed to process package purchase")
            }

            // Parse response
            const respBody = await response.json()
            const purchaseResult = respBody?.data

            // Clear the stored package data
            localStorage.removeItem("pendingPackagePurchase")

            // Show success and allow redirect
            setError(null)
        } catch (err: any) {
            console.error("Error creating package purchase:", err)
            setError(err.message || "Failed to complete package purchase. Please contact support.")
        } finally {
            setIsProcessing(false)
        }
    }

    const message = payment === "success"
        ? `Thanh toán thành công${orderInfo ? ` — ${decodeURIComponent(orderInfo)}` : ''}`
        : `Thanh toán thất bại${orderInfo ? ` — ${decodeURIComponent(orderInfo)}` : ''}`

    return (
        <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-10">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-2">Kết quả thanh toán gói khám</h2>
                <div className={`p-4 rounded-md mb-4 ${payment === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                    {message}
                </div>

                {isProcessing && (
                    <div className="p-4 rounded-md mb-4 bg-blue-50 border border-blue-200 text-blue-800">
                        Processing your package purchase... please wait.
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-md mb-4 bg-red-50 border border-red-200 text-red-800">
                        {error}
                    </div>
                )}

                {!isProcessing && payment === "success" && !error && (
                    <div className="p-4 rounded-md mb-4 bg-green-50 border border-green-200 text-green-800">
                        Package purchase completed successfully! Redirecting to dashboard...
                    </div>
                )}

                <div className="flex gap-3">
                    <Button onClick={() => router.push('/patient-purchased-packages')} disabled={isProcessing}>
                        View My Packages
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/patient-dashboard')} disabled={isProcessing}>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function PackagePaymentResultPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PackagePaymentResultContent />
        </Suspense>
    )
}

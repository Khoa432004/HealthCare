"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/api-config"
import { AuthLanguageBar } from "@/components/auth-language-bar"

function PackagePaymentResultContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { t } = useTranslation()
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const payment = searchParams?.get("payment")
    const orderInfo = searchParams?.get("orderInfo")

    useEffect(() => {
        if (!payment) {
            router.replace("/patient-dashboard")
            return
        }

        if (payment === "success") {
            createPackagePurchase()
        }
    }, [payment, router])

    const createPackagePurchase = async () => {
        try {
            setIsProcessing(true)
            setError(null)

            const packageData = localStorage.getItem("pendingPackagePurchase")
            if (!packageData) {
                setError(t("packageDataNotFound"))
                setIsProcessing(false)
                return
            }

            const data = JSON.parse(packageData)
            const vnpTransactionNo = searchParams?.get("vnp_TransactionNo")
            const vnpTxnRef = searchParams?.get("vnp_TxnRef")
            const vnpPayDate = searchParams?.get("vnp_PayDate")
            const vnpAmount = searchParams?.get("vnp_Amount")
            const totalAmount = vnpAmount ? Number(vnpAmount) / 100 : (data.priceVnd ?? null)

            let paymentTime = null
            if (vnpPayDate) {
                try {
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
                throw new Error(errorData.message || t("packagePurchaseFailed"))
            }

            localStorage.removeItem("pendingPackagePurchase")
            setError(null)
        } catch (err: any) {
            console.error("Error creating package purchase:", err)
            setError(err.message || t("packagePurchaseFailed"))
        } finally {
            setIsProcessing(false)
        }
    }

    const message = payment === "success"
        ? `${t("paymentSuccess")}${orderInfo ? ` — ${decodeURIComponent(orderInfo)}` : ''}`
        : `${t("paymentFailed")}${orderInfo ? ` — ${decodeURIComponent(orderInfo)}` : ''}`

    return (
        <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-10 relative">
            <AuthLanguageBar />
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-2">{t("paymentResult")}</h2>
                <div className={`p-4 rounded-md mb-4 ${payment === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                    {message}
                </div>

                {isProcessing && (
                    <div className="p-4 rounded-md mb-4 bg-blue-50 border border-blue-200 text-blue-800">
                        {t("processingOrder")}
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-md mb-4 bg-red-50 border border-red-200 text-red-800">
                        {error}
                    </div>
                )}

                {!isProcessing && payment === "success" && !error && (
                    <div className="p-4 rounded-md mb-4 bg-green-50 border border-green-200 text-green-800">
                        {t("packagePurchaseSuccess")}
                    </div>
                )}

                <div className="flex gap-3">
                    <Button onClick={() => router.push('/patient-purchased-packages')} disabled={isProcessing}>
                        {t("viewMyPackages")}
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/patient-dashboard')} disabled={isProcessing}>
                        {t("goToDashboard")}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function PackagePaymentResultPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">{" "}</div>}>
            <PackagePaymentResultContent />
        </Suspense>
    )
}

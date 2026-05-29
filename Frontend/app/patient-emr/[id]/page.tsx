"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { AuthGuard } from "@/components/auth-guard"

function RedirectToEhrPopup() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.id as string

  useEffect(() => {
    if (appointmentId) {
      router.replace(`/patient-emr?report=${appointmentId}`)
    } else {
      router.replace("/patient-emr")
    }
  }, [appointmentId, router])

  return (
    <div className="flex h-screen items-center justify-center bg-[#E8F5F1] text-sm text-gray-500">
      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      Đang mở báo cáo y khoa...
    </div>
  )
}

export default function PatientMedicalReportRedirectPage() {
  return (
    <AuthGuard allowedRoles={["PATIENT"]}>
      <RedirectToEhrPopup />
    </AuthGuard>
  )
}

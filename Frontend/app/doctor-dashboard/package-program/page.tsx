"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"

function PackageProgramRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/settings?tab=package-program")
  }, [router])

  return null
}

export default function DoctorPackageProgramPage() {
  return (
    <AuthGuard allowedRoles={["DOCTOR"]}>
      <PackageProgramRedirect />
    </AuthGuard>
  )
}

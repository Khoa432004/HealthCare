"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth.service"
import { AuthPageHeader } from "@/components/auth-page-header"
import { AuthLanguageBar } from "@/components/auth-language-bar"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const validateEmail = (email: string): boolean => {
    if (!email || email.trim() === "") {
      setEmailError(t("emailRequired"))
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError(t("emailInvalid"))
      return false
    }
    setEmailError(null)
    return true
  }

  const handleForgotPassword = async () => {
    setError(null)
    setEmailError(null)
    setSuccess(null)

    if (!validateEmail(email)) {
      return
    }

    setIsLoading(true)

    try {
      await authService.forgetPassword(email)
      setSuccess(t("otpSentSuccess"))

      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`)
      }, 2000)
    } catch (error: any) {
      console.error("Forget password error:", error)
      const errorMessage = error.message || ""
      if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("không tồn tại")) {
        setError(t("accountNotFound"))
      } else if (errorMessage.toLowerCase().includes("pending")) {
        setError(t("accountPendingApproval"))
      } else if (errorMessage.toLowerCase().includes("inactive") || errorMessage.toLowerCase().includes("bị khóa")) {
        setError(t("accountLocked"))
      } else if (errorMessage.toLowerCase().includes("email") || errorMessage.toLowerCase().includes("gửi")) {
        setError(t("otpSendFailed"))
      } else {
        setError(errorMessage || t("resetEmailFailed"))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen h-screen bg-[url('/login-background.png')] bg-cover bg-center relative overflow-hidden">
      <AuthLanguageBar />
      <div className="hidden md:block absolute top-4 bottom-4 left-4 right-[52%] bg-white/70 rounded-3xl"></div>

      <div className="w-full h-full px-4 sm:px-5 md:px-0 py-4 sm:py-5 md:py-0 relative z-10">
        <div className="grid md:grid-cols-2 gap-0 items-center h-full">
          <div className="w-full h-full flex items-center justify-center order-1">
            <div className="w-full max-w-full md:max-w-lg lg:max-w-xl px-5 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 md:py-8 rounded-2xl bg-white/70 md:bg-transparent overflow-y-auto max-h-[90vh] md:max-h-full flex flex-col items-center">
              <div className="space-y-5 sm:space-y-6 md:space-y-5 lg:space-y-6 mx-auto w-full max-w-md flex flex-col items-center">
                <AuthPageHeader
                  title={t("forgotPasswordTitle")}
                  description={t("forgotPasswordSubtitle")}
                />

                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="w-full space-y-3.5 sm:space-y-4 md:space-y-3.5">
                  <div className="space-y-1.5 md:space-y-1.5">
                    <Label htmlFor="email" className="text-slate-700 font-semibold text-sm md:text-xs lg:text-[13px]">
                      {t("email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setEmailError(null)
                      }}
                      placeholder={t("enterEmail")}
                      className={`bg-white/70 backdrop-blur-sm border-white/50 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11 md:h-9 lg:h-9 text-base md:text-sm lg:text-sm rounded-lg ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      disabled={isLoading}
                      required
                    />
                    {emailError && (
                      <p className="text-sm text-red-600">{emailError}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                    <Link href="/login" className="flex-1">
                      <Button
                        variant="outline"
                        className="inline-flex items-center justify-center rounded-lg truncate font-bold select-none w-full px-4 h-12 md:h-10 lg:h-10 text-base md:text-sm lg:text-sm bg-white/70 backdrop-blur-sm border-2 border-[#007A94] text-[#007A94] hover:bg-[#007A94] hover:text-white transition-all duration-300 hover:scale-[1.02]"
                        disabled={isLoading}
                      >
                        {t("backToLogin")}
                      </Button>
                    </Link>
                    <Button
                      onClick={handleForgotPassword}
                      disabled={isLoading || !email}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg truncate transition font-bold select-none px-4 h-12 md:h-10 lg:h-10 text-base md:text-sm lg:text-sm bg-[#005566] text-white shadow-md hover:bg-[#0a4d5a] disabled:bg-gray-300"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="text-white" />
                          <span>{t("processing")}</span>
                        </>
                      ) : (
                        t("sendOtp")
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex relative order-2 justify-center items-end h-full pr-8 lg:pr-12">
            <div className="relative w-full h-full flex items-end justify-center">
              <img
                src="/clean-female-doctor.png"
                alt="Bác sĩ chuyên nghiệp"
                className="w-full h-auto object-contain object-bottom max-h-[95vh] scale-110 lg:scale-[1.2] transition-all duration-500 hover:scale-[1.15] lg:hover:scale-[1.25]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

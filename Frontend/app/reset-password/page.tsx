"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { authService } from "@/services/auth.service"
import { AuthPageHeader } from "@/components/auth-page-header"
import { AuthLanguageBar } from "@/components/auth-language-bar"

function ResetPasswordForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(900)
  const [canResend, setCanResend] = useState(false)
  
  const [fieldErrors, setFieldErrors] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Get email from URL params if available
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }))
    }
  }, [searchParams])

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleResendOTP = async () => {
    if (!formData.email) {
      setError(t("emailRequired"))
      return
    }

    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      await authService.forgetPassword(formData.email)
      setSuccess(t("newOtpSent", "Mã OTP mới đã được gửi đến email của bạn!"))
      setTimeLeft(900) // Reset timer to 15 minutes
      setCanResend(false)
    } catch (error: any) {
      console.error("Resend OTP error:", error)
      setError(error.message || t("resendOtpFailed", "Không thể gửi lại mã OTP. Vui lòng thử lại."))
    } finally {
      setIsLoading(false)
    }
  }

  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    setFieldErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const validateForm = (): boolean => {
    let isValid = true
    const newFieldErrors = { otp: "", newPassword: "", confirmPassword: "" }

    // Validate OTP
    if (!formData.otp || formData.otp.trim() === "") {
      newFieldErrors.otp = t("otpRequired", "Vui lòng nhập mã OTP.")
      isValid = false
    } else if (formData.otp.length !== 6) {
      newFieldErrors.otp = t("otpMustBe6Digits", "Mã OTP phải có 6 chữ số.")
      isValid = false
    }

    // Validate new password
    if (!formData.newPassword || formData.newPassword.trim() === "") {
      newFieldErrors.newPassword = t("fieldRequired", "Vui lòng nhập trường này.")
      isValid = false
    }

    // Validate confirm password
    if (!formData.confirmPassword || formData.confirmPassword.trim() === "") {
      newFieldErrors.confirmPassword = t("fieldRequired", "Vui lòng nhập trường này.")
      isValid = false
    } else if (formData.newPassword !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = t("passwordsNoMatch")
      isValid = false
    }

    setFieldErrors(newFieldErrors)
    return isValid
  }

  const handleResetPassword = async () => {
    // Clear previous errors
    setError(null)
    
    // Validate form
    if (!validateForm()) {
      return
    }

    setSuccess(null)
    setIsLoading(true)

    try {
      await authService.resetPassword(formData.email, formData.otp, formData.newPassword)
      setSuccess(t("passwordResetSuccessRedirect", "Mật khẩu đã được đặt lại thành công! Đang chuyển đến trang đăng nhập..."))
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      console.error("Reset password error:", error)
      // Map backend error messages to user-friendly messages
      const errorMessage = error.message || ""
      if (errorMessage.toLowerCase().includes("otp") && errorMessage.toLowerCase().includes("sai") || 
          errorMessage.toLowerCase().includes("invalid") && errorMessage.toLowerCase().includes("otp")) {
        setError(t("otpIncorrect", "Mã OTP không chính xác."))
      } else if (errorMessage.toLowerCase().includes("otp") && errorMessage.toLowerCase().includes("hết hạn") ||
                 errorMessage.toLowerCase().includes("expired")) {
        setError(t("otpExpiredResend", "Mã OTP hết hạn. Vui lòng gửi lại OTP."))
      } else {
        setError(errorMessage || t("resetPasswordFailed", "Không thể đặt lại mật khẩu. Vui lòng kiểm tra mã OTP và thử lại."))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen h-screen bg-[url('/login-background.png')] bg-cover bg-center relative overflow-hidden">
      <AuthLanguageBar />
      {/* White overlay for desktop - covers left half */}
      <div className="hidden md:block absolute top-4 bottom-4 left-4 right-[52%] bg-white/70 rounded-3xl"></div>

      <div className="w-full h-full px-4 sm:px-5 md:px-0 py-4 sm:py-5 md:py-0 relative z-10">
        <div className="grid md:grid-cols-2 gap-0 items-center h-full">
          {/* Left Content - Reset Password Form */}
          <div className="w-full h-full flex items-center justify-center order-1">
            <div className="w-full max-w-full md:max-w-lg lg:max-w-xl px-5 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 md:py-8 rounded-2xl bg-white/70 md:bg-transparent overflow-y-auto max-h-[90vh] md:max-h-full flex flex-col items-center">
              <div className="space-y-4 sm:space-y-5 md:space-y-4 lg:space-y-5 mx-auto w-full max-w-md flex flex-col items-center">
                <AuthPageHeader
                  title={t("createNewPassword")}
                  description={t("enterOtpNewPassword")}
                />

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Success Alert */}
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
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="example@email.com"
                      className="bg-white/70 backdrop-blur-sm border-white/50 rounded-lg px-3 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11 md:h-9 lg:h-9 text-base md:text-sm lg:text-sm"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-1.5 md:space-y-1.5">
                    <Label htmlFor="otp" className="text-slate-700 font-semibold text-sm md:text-xs lg:text-[13px]">
                      {t("otp")}
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      value={formData.otp}
                      onChange={(e) => handleInputChange("otp", e.target.value)}
                      placeholder={t("enterOtp6Digits", "Nhập mã OTP 6 số")}
                      maxLength={6}
                      className={`bg-white/70 backdrop-blur-sm border-white/50 rounded-lg px-3 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11 md:h-9 lg:h-9 text-base md:text-sm lg:text-sm ${fieldErrors.otp ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                      required
                    />
                    {fieldErrors.otp && (
                      <p className="text-sm text-red-600">{fieldErrors.otp}</p>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm md:text-xs">
                        <span className="text-slate-600">
                          {t("otpValidFor", "Mã OTP còn hiệu lực:")} <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
                        </span>
                        {canResend && (
                          <span className="text-red-600 font-semibold">{t("otpExpired")}</span>
                        )}
                      </div>
                      {canResend && (
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={isLoading}
                          className="w-full text-[#007A94] hover:text-[#005566] font-semibold transition-colors duration-200 underline text-sm md:text-xs"
                        >
                          {isLoading ? t("sending", "Đang gửi...") : t("resendOtp")}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-1.5">
                    <Label htmlFor="newPassword" className="text-slate-700 font-semibold text-sm md:text-xs lg:text-[13px]">
                      {t("newPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        placeholder={t("enterNewPassword", "Nhập mật khẩu mới")}
                        className={`bg-white/70 backdrop-blur-sm border-white/50 rounded-lg px-3 pr-10 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11 md:h-9 lg:h-9 text-base md:text-sm lg:text-sm ${fieldErrors.newPassword ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 md:right-2.5 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-800"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5 md:w-4 md:h-4" /> : <Eye className="w-5 h-5 md:w-4 md:h-4" />}
                      </button>
                    </div>
                    {fieldErrors.newPassword && (
                      <p className="text-sm text-red-600">{fieldErrors.newPassword}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 md:space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold text-sm md:text-xs lg:text-[13px]">
                      {t("confirmNewPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder={t("enterConfirmPassword", "Nhập lại mật khẩu mới")}
                        className={`bg-white/70 backdrop-blur-sm border-white/50 rounded-lg px-3 pr-10 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11 md:h-9 lg:h-9 text-base md:text-sm lg:text-sm ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 md:right-2.5 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-800"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5 md:w-4 md:h-4" /> : <Eye className="w-5 h-5 md:w-4 md:h-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                    )}
                    {!fieldErrors.confirmPassword && formData.confirmPassword && passwordsMatch && (
                      <p className="text-sm text-green-600">{t("passwordMatch")}</p>
                    )}
                  </div>

                  <div className="text-sm md:text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg">
                    <p className="font-semibold">{t("passwordMustContain", "Mật khẩu phải chứa:")}</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>{t("passwordRuleMin6", "Ít nhất 6 ký tự")}</li>
                      <li>{t("passwordRuleUppercase", "Một chữ hoa")}</li>
                      <li>{t("passwordRuleLowercase", "Một chữ thường")}</li>
                      <li>{t("passwordRuleNumber", "Một số")}</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                    <Link href="/forgot-password" className="flex-1">
                      <Button
                        variant="outline"
                        className="inline-flex items-center justify-center rounded-lg truncate font-bold select-none w-full px-4 h-12 md:h-10 lg:h-10 text-base md:text-sm lg:text-sm bg-white/70 backdrop-blur-sm border-2 border-[#007A94] text-[#007A94] hover:bg-[#007A94] hover:text-white transition-all duration-300 hover:scale-[1.02]"
                        disabled={isLoading}
                      >
                        {t("back")}
                      </Button>
                    </Link>
                    <Button
                      onClick={handleResetPassword}
                      className="flex-1 inline-flex items-center justify-center rounded-lg truncate transition font-bold select-none w-full px-4 h-12 md:h-10 lg:h-10 text-base md:text-sm lg:text-sm bg-[#005566] hover:bg-[#0a4d5a] text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <LoadingSpinner size="sm" className="text-white" />
                          <span>{t("processing")}</span>
                        </div>
                      ) : (
                        t("resetPasswordBtn")
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image - Hidden on mobile */}
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

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">{t("loading")}</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}

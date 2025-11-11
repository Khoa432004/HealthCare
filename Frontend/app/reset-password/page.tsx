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
import { authService } from "@/services/auth.service"

function ResetPasswordForm() {
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
      setError("Vui lòng nhập email")
      return
    }

    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      await authService.forgetPassword(formData.email)
      setSuccess("Mã OTP mới đã được gửi đến email của bạn!")
      setTimeLeft(900) // Reset timer to 15 minutes
      setCanResend(false)
    } catch (error: any) {
      console.error("Resend OTP error:", error)
      setError(error.message || "Không thể gửi lại mã OTP. Vui lòng thử lại.")
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
      newFieldErrors.otp = "Vui lòng nhập mã OTP."
      isValid = false
    } else if (formData.otp.length !== 6) {
      newFieldErrors.otp = "Mã OTP phải có 6 chữ số."
      isValid = false
    }

    // Validate new password
    if (!formData.newPassword || formData.newPassword.trim() === "") {
      newFieldErrors.newPassword = "Vui lòng nhập trường này."
      isValid = false
    }

    // Validate confirm password
    if (!formData.confirmPassword || formData.confirmPassword.trim() === "") {
      newFieldErrors.confirmPassword = "Vui lòng nhập trường này."
      isValid = false
    } else if (formData.newPassword !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = "Mật khẩu nhập lại không khớp."
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
      setSuccess("Mật khẩu đã được đặt lại thành công! Đang chuyển đến trang đăng nhập...")
      
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
        setError("Mã OTP không chính xác.")
      } else if (errorMessage.toLowerCase().includes("otp") && errorMessage.toLowerCase().includes("hết hạn") ||
                 errorMessage.toLowerCase().includes("expired")) {
        setError("Mã OTP hết hạn. Vui lòng gửi lại OTP.")
      } else {
        setError(errorMessage || "Không thể đặt lại mật khẩu. Vui lòng kiểm tra mã OTP và thử lại.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-[url('/login-background.png')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute top-4 bottom-4 left-4 right-1/2 bg-white/70 rounded-3xl sm:rounded-[2.5rem]"></div>

      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 relative z-10 h-full">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-center h-full">
          {/* Left Content - Reset Password Form */}
          <div className="space-y-5 sm:space-y-6 max-w-md mx-auto lg:mx-0 order-2 lg:order-1 w-full">
            <div className="flex items-center space-x-2 mb-4 sm:mb-5">
              <span className="text-2xl sm:text-3xl font-bold text-[#16a1bd]">Bác sỹ</span>
              <span className="text-2xl sm:text-3xl font-bold text-[#16a1bd]">ơi</span>
              <div className="w-2 h-2 bg-[#fe2f2f] rounded-full ml-1"></div>
            </div>

            <div className="space-y-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#0b0c0c]">Tạo Mật Khẩu Mới</h1>
              <p className="text-[#09404c] text-xs">Nhập mã OTP và mật khẩu mới của bạn</p>
            </div>

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

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-[#0b0c0c] font-medium text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="example@email.com"
                    className="bg-white/80 border-0 rounded-xl px-3 py-2 text-[#0b0c0c] placeholder:text-[#09404c]/60 focus:ring-2 focus:ring-[#16a1bd] focus:ring-offset-0 h-9 text-sm"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="otp" className="text-[#0b0c0c] font-medium text-sm">
                    Mã OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={formData.otp}
                    onChange={(e) => handleInputChange("otp", e.target.value)}
                    placeholder="Nhập mã OTP 6 số"
                    maxLength={6}
                    className={`bg-white/80 border-0 rounded-xl px-3 py-2 text-[#0b0c0c] placeholder:text-[#09404c]/60 focus:ring-2 focus:ring-[#16a1bd] focus:ring-offset-0 h-9 text-sm ${fieldErrors.otp ? 'border border-red-500' : ''}`}
                    disabled={isLoading}
                    required
                  />
                  {fieldErrors.otp && (
                    <p className="text-xs text-red-500">{fieldErrors.otp}</p>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#09404c]">
                        Mã OTP còn hiệu lực: <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
                      </span>
                      {canResend && (
                        <span className="text-red-600 font-semibold text-xs">Mã OTP đã hết hạn</span>
                      )}
                    </div>
                    {canResend && (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="w-full text-[#16a1bd] hover:text-[#0d6171] font-semibold transition-colors duration-200 underline text-xs"
                      >
                        {isLoading ? "Đang gửi..." : "Gửi lại OTP"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="newPassword" className="text-[#0b0c0c] font-medium text-sm">
                    Mật khẩu mới
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      className={`bg-white/80 border-0 rounded-xl px-3 py-2 pr-10 text-[#0b0c0c] placeholder:text-[#09404c]/60 focus:ring-2 focus:ring-[#16a1bd] focus:ring-offset-0 h-9 text-sm ${fieldErrors.newPassword ? 'border border-red-500' : ''}`}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#09404c] hover:text-[#0b0c0c]"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.newPassword && (
                    <p className="text-xs text-red-500">{fieldErrors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-[#0b0c0c] font-medium text-sm">
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className={`bg-white/80 border-0 rounded-xl px-3 py-2 pr-10 text-[#0b0c0c] placeholder:text-[#09404c]/60 focus:ring-2 focus:ring-[#16a1bd] focus:ring-offset-0 h-9 text-sm ${fieldErrors.confirmPassword ? 'border border-red-500' : ''}`}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#09404c] hover:text-[#0b0c0c]"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                  )}
                  {!fieldErrors.confirmPassword && formData.confirmPassword && passwordsMatch && (
                    <p className="text-xs text-green-500">Mật khẩu khớp</p>
                  )}
                </div>

                <div className="text-xs text-[#09404c] space-y-1">
                  <p>Mật khẩu phải chứa:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
                    <li>Ít nhất 6 ký tự</li>
                    <li>Một chữ hoa</li>
                    <li>Một chữ thường</li>
                    <li>Một số</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3">
                <Link href="/forgot-password" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-2 border-[#16a1bd] text-[#16a1bd] hover:bg-[#16a1bd] hover:text-white rounded-xl py-2 font-semibold transition-colors duration-200 text-sm h-9"
                    disabled={isLoading}
                  >
                    Quay lại
                  </Button>
                </Link>
                <Button
                  onClick={handleResetPassword}
                  className="flex-1 bg-[#0d6171] hover:bg-[#09404c] text-white rounded-xl py-2 font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm h-9"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" className="text-white" />
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end h-full">
            <div className="relative z-10 w-full max-w-md lg:max-w-full h-full">
              <div className="relative h-full flex items-end">
                <img
                  src="/clean-female-doctor.png"
                  alt="Bác sĩ chuyên nghiệp"
                  className="w-full h-auto object-contain max-h-[500px] sm:max-h-[700px] lg:max-h-[100vh] scale-125 lg:scale-150 transition-all duration-500 hover:scale-[1.3] lg:hover:scale-[1.6]"
                />
                {/* Image overlay gradient to blend with background */}
                <div className="absolute inset-0 bg-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}

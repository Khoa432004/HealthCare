"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth.service"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const validateEmail = (email: string): boolean => {
    // Check if empty
    if (!email || email.trim() === "") {
      setEmailError("Vui lòng nhập Email.")
      return false
    }
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError("Email không đúng định dạng.")
      return false
    }
    setEmailError(null)
    return true
  }

  const handleForgotPassword = async () => {
    // Clear previous errors
    setError(null)
    setEmailError(null)
    setSuccess(null)

    // Validate email
    if (!validateEmail(email)) {
      return
    }

    setIsLoading(true)

    try {
      await authService.forgetPassword(email)
      setSuccess("Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email!")
      
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`)
      }, 2000)
    } catch (error: any) {
      console.error("Forget password error:", error)
      // Map backend error messages to user-friendly messages
      const errorMessage = error.message || ""
      if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("không tồn tại")) {
        setError("Tài khoản chưa tồn tại.")
      } else if (errorMessage.toLowerCase().includes("pending")) {
        setError("Hồ sơ đang chờ phê duyệt.")
      } else if (errorMessage.toLowerCase().includes("inactive") || errorMessage.toLowerCase().includes("bị khóa")) {
        setError("Tài khoản đang bị khóa.")
      } else if (errorMessage.toLowerCase().includes("email") || errorMessage.toLowerCase().includes("gửi")) {
        setError("Không thể gửi mã xác thực. Vui lòng thử lại.")
      } else {
        setError(errorMessage || "Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại.")
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
          {/* Left Content - Forgot Password Form */}
          <div className="space-y-5 sm:space-y-6 max-w-xl mx-auto lg:mx-0 order-2 lg:order-1 w-full">
            {/* Logo */}
            <div className="flex items-center space-x-2 mb-4 sm:mb-5">
              <span className="text-2xl sm:text-3xl font-bold text-[#16a1bd]">Bác sỹ</span>
              <span className="text-2xl sm:text-3xl font-bold text-[#16a1bd]">ơi</span>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full ml-1 shadow-soft pulse-soft"></div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Khôi phục mật khẩu</h1>
              <p className="text-sm text-slate-600 leading-relaxed">Nhập email của bạn để nhận mã OTP khôi phục mật khẩu</p>
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

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 font-semibold text-xs">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError(null) // Clear error on input change
                  }}
                  placeholder="Nhập email của bạn"
                  className={`bg-white/70 backdrop-blur-sm border-white/50 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-9 text-sm rounded-xl ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isLoading}
                  required
                />
                {emailError && (
                  <p className="text-xs text-red-500">{emailError}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                <Link href="/login" className="flex-1">
                  <Button
                    variant="outline"
                    className="inline-flex items-center justify-center rounded-full truncate font-semibold select-none w-full px-4 py-3 text-sm h-auto bg-white/70 backdrop-blur-sm border-2 border-[#16a1bd] text-[#16a1bd] hover:bg-[#16a1bd] hover:text-white transition-all duration-300 hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    Quay lại đăng nhập
                  </Button>
                </Link>
                <Button
                  onClick={handleForgotPassword}
                  disabled={isLoading || !email}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full truncate transition font-semibold select-none px-4 py-3 text-sm bg-[#0d6171] text-white shadow-md hover:bg-[#0a4d5a] disabled:bg-gray-300 h-auto"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="text-white" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    "Gửi mã OTP"
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

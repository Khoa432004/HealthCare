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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleForgotPassword = async () => {
    setError(null)
    setSuccess(null)
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
      setError(error.message || "Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[url('https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ6ftjDHMlNJtTSwjvNsy9RY_8tOmPhiLCphPfGLmXGAtvoqhsB')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute top-4 bottom-4 left-4 right-1/2 bg-white/70 rounded-3xl sm:rounded-[2.5rem]"></div>

      <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl hidden md:block animate-pulse"></div>
      <div
        className="absolute top-32 right-32 w-20 h-20 bg-cyan-200/40 rounded-full blur-2xl hidden lg:block animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-20 right-20 w-24 h-24 bg-teal-200/35 rounded-full blur-3xl hidden md:block animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-10 left-20 w-28 h-28 bg-slate-200/20 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "3s" }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 py-3 lg:py-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-center min-h-[calc(100vh-1.5rem)] lg:min-h-[calc(100vh-2rem)]">
          <div className="space-y-5 sm:space-y-6 max-w-xl mx-auto lg:mx-0 order-2 lg:order-1">
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="bg-white/70 backdrop-blur-sm border-white/50 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-9 text-sm rounded-xl"
                  disabled={isLoading}
                  required
                />
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
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full truncate transition font-semibold select-none px-4 py-3 text-sm bg-[#16a1bd] text-white shadow-md hover:bg-[#0d6171] disabled:bg-gray-300 h-auto"
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

        <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="relative z-10 w-full max-w-md lg:max-w-full">
            <div className="relative">
              <img
                src="/clean-female-doctor.png"
                alt="Bác sĩ chuyên nghiệp"
                className="w-full h-auto object-contain max-h-[400px] sm:max-h-[500px] lg:max-h-none rounded-3xl sm:rounded-[2.5rem] shadow-soft-xl hover:shadow-soft-2xl transition-all duration-500 hover:scale-[1.05]"
              />
              {/* Image overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-3xl sm:rounded-[2.5rem]"></div>
            </div>
          </div>
          {/* Background decorative circles */}
          <div className="absolute -top-8 -right-8 lg:-top-12 lg:-right-12 w-32 h-32 lg:w-40 lg:h-40 bg-blue-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <div
            className="absolute -bottom-6 -left-6 w-24 h-24 bg-cyan-200/25 rounded-full blur-2xl -z-10 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div className="absolute top-1/2 -left-4 w-20 h-20 sm:w-28 sm:h-28 bg-slate-200/20 rounded-full blur-xl -z-10"></div>
        </div>
      </div>
    </div>
  </div>
)
}

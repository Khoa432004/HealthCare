"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { authService } from "@/services/auth.service"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // Call login API
      const response = await authService.login({ email, password })
      
      if (response.data) {
        console.log("Login successful:", response.message)
        
        // Get user role and redirect to appropriate dashboard
        const userRole = response.data.user.role
        const dashboardRoute = authService.getDashboardRoute(userRole)
        
        // Redirect to dashboard
        router.push(dashboardRoute)
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu.")
    } finally {
      setIsLoading(false)
    }
  }


  return (
  <div className="w-full max-w-lg h-full flex flex-col justify-center rounded-xl m-4 p-6 md:p-8 bg-transparent">
    <div className="space-y-6 sm:space-y-8 mx-auto">
      {/* Logo and Header */}
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center space-x-3">
          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#16a1bd]">Bác sỹ</span>
          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#16a1bd]">ơi</span>
          <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full ml-1.5 shadow-soft pulse-soft"></div>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Chào mừng trở lại!</h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">Đăng nhập để tiếp tục hành trình chăm sóc sức khỏe</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/70 backdrop-blur-sm border-white/50 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11 text-base"
            placeholder="Nhập email của bạn"
            required
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">
            Mật khẩu
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/70 backdrop-blur-sm border-white/50 pr-12 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11 text-base"
              placeholder="Nhập mật khẩu của bạn"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition-all duration-300 hover:scale-110"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-[#16a1bd] hover:text-[#0d6171] text-base font-medium underline transition-all duration-300 hover:translate-x-1 inline-block"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full bg-[#16a1bd] hover:bg-[#0d6171] text-white font-bold text-base h-11 shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" className="text-white" />
              <span>Đang đăng nhập...</span>
            </div>
          ) : (
            "Đăng nhập"
          )}
        </Button>

        {/* Sign Up Link */}
        <div className="text-center text-slate-600 text-sm">
          Chưa có tài khoản?{" "}
          <Link href="/signup" className="text-[#16a1bd] hover:text-[#0d6171] font-semibold underline transition-all duration-300">
            Đăng ký ngay
          </Link>
        </div>
      </form>
    </div>
  </div>
);

}

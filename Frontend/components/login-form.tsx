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
import { FirstLoginPasswordModal } from "@/components/first-login-password-modal"

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false)
  const [loggedInUserEmail, setLoggedInUserEmail] = useState<string>("")
  
  // Get redirect URL from query params
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('redirect')
    }
    return null
  }
  
  // Form validation errors
  const [emailError, setEmailError] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")

  const validateForm = (): boolean => {
    let isValid = true
    
    // Clear previous errors
    setEmailError("")
    setPasswordError("")
    setError(null)
    
    // Validate email
    if (!email || email.trim() === "") {
      setEmailError("Vui lòng nhập Email.")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email không đúng định dạng.")
      isValid = false
    }
    
    // Validate password
    if (!password || password.trim() === "") {
      setPasswordError("Vui lòng nhập Mật khẩu.")
      isValid = false
    }
    
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await authService.login({ email, password })
      
      if (response.data) {
        if (response.data.user.firstLoginRequired && response.data.user.role === 'DOCTOR') {
          setLoggedInUserEmail(response.data.user.email)
          setShowFirstLoginModal(true)
          setIsLoading(false)
          return
        }
        
        const userRole = response.data.user.role
        const redirectUrl = getRedirectUrl()
        const targetRoute = redirectUrl || authService.getDashboardRoute(userRole)
        
        try {
          setTimeout(() => {
            router.push(targetRoute)
          }, 100)
        } catch (navError) {
          console.error("Navigation error:", navError)
          setError("Lỗi điều hướng. Vui lòng thử lại.")
          setIsLoading(false)
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu.")
      setIsLoading(false)
    }
  }

  const handleFirstLoginSuccess = () => {
    setShowFirstLoginModal(false)
    const userInfo = authService.getUserInfo()
    if (userInfo) {
      const redirectUrl = getRedirectUrl()
      const targetRoute = redirectUrl || authService.getDashboardRoute(userInfo.role)
      
      try {
        setTimeout(() => {
          router.push(targetRoute)
        }, 100)
      } catch (navError) {
        console.error("Navigation error:", navError)
        setError("Lỗi điều hướng. Vui lòng thử lại.")
      }
    }
  }

  const handleFirstLoginError = (errorMessage: string) => {
  }

  return (
  <div className="w-full max-w-full md:max-w-lg lg:max-w-xl h-full flex flex-col justify-center px-5 py-8 sm:px-6 sm:py-10 md:pl-12 lg:pl-16 md:pr-8 lg:pr-10 md:py-8 rounded-2xl bg-white/70 md:bg-transparent overflow-y-auto max-h-[90vh] md:max-h-full">
    <div className="space-y-5 sm:space-y-6 md:space-y-5 lg:space-y-6 mx-auto w-full max-w-md md:max-w-full">
      {/* Logo and Header */}
      <div className="space-y-3 sm:space-y-3 md:space-y-2 lg:space-y-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-3xl sm:text-4xl md:text-[36px] lg:text-[40px] font-bold text-[#16a1bd]">Bác sỹ</span>
          <span className="text-3xl sm:text-4xl md:text-[36px] lg:text-[40px] font-bold text-[#16a1bd]">ơi</span>
          <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full ml-1 sm:ml-1.5 shadow-soft pulse-soft"></div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-[24px] lg:text-[26px] font-bold text-slate-800">Chào mừng trở lại!</h1>
        <p className="text-base sm:text-lg md:text-[15px] lg:text-base text-slate-600 leading-relaxed">Đăng nhập để tiếp tục hành trình chăm sóc sức khỏe</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 md:space-y-3.5">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <div className="space-y-1.5 md:space-y-1.5">
          <Label htmlFor="email" className="text-slate-700 font-semibold text-sm md:text-xs lg:text-[13px]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError("")
              setError(null)
            }}
            className={`bg-white/70 backdrop-blur-sm text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:border-blue-500 h-11 md:h-9 lg:h-9 text-base md:text-sm lg:text-sm ${
              emailError ? "border-red-500 focus:ring-red-500" : "border-white/50 focus:ring-blue-500"
            }`}
            placeholder="Nhập email của bạn"
          />
          {emailError && (
            <p className="text-sm text-red-600">{emailError}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 md:space-y-1.5">
          <Label htmlFor="password" className="text-slate-700 font-semibold text-sm md:text-xs lg:text-[13px]">
            Mật khẩu
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError("")
                setError(null)
              }}
              className={`bg-white/70 backdrop-blur-sm pr-10 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:border-blue-500 h-11 md:h-9 lg:h-9 text-base md:text-sm lg:text-sm ${
                passwordError ? "border-red-500 focus:ring-red-500" : "border-white/50 focus:ring-blue-500"
              }`}
              placeholder="Nhập mật khẩu của bạn"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 md:right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition-all duration-300 hover:scale-110"
            >
              {showPassword ? <EyeOff className="w-5 h-5 md:w-4 md:h-4 lg:w-4 lg:h-4" /> : <Eye className="w-5 h-5 md:w-4 md:h-4 lg:w-4 lg:h-4" />}
            </button>
          </div>
          {passwordError && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right pt-0.5">
          <Link
            href="/forgot-password"
            className="text-[#16a1bd] hover:text-[#0d6171] text-base md:text-xs lg:text-sm font-medium underline transition-all duration-300 hover:translate-x-1 inline-block"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full bg-[#0d6171] hover:bg-[#16a1bd] text-white font-bold text-base md:text-sm lg:text-sm h-12 md:h-10 lg:h-10 shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
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
        <div className="text-center text-slate-600 text-sm md:text-xs lg:text-[13px] pt-1">
          Chưa có tài khoản?{" "}
          <Link href="/signup" className="text-[#16a1bd] hover:text-[#0d6171] font-semibold underline transition-all duration-300">
            Đăng ký ngay
          </Link>
        </div>
      </form>

      {/* First Login Password Change Modal */}
      <FirstLoginPasswordModal
        open={showFirstLoginModal}
        email={loggedInUserEmail}
        onSuccess={handleFirstLoginSuccess}
        onError={handleFirstLoginError}
      />
    </div>
  </div>
);

}

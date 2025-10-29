"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Eye, EyeOff } from "lucide-react"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [username, setUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const router = useRouter()

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const validatePasswords = () => {
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long")
      return false
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return false
    }
    setPasswordError("")
    return true
  }

  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async () => {
    const otpCode = otp.join("")
    if (otpCode.length !== 6 || !username || !newPassword || !confirmPassword) return

    if (!validatePasswords()) return

    setIsLoading(true)
    try {
      const resetData = {
        username: username,
        otp: otpCode,
        newPassword: newPassword,
      }

      console.log("Resetting password with data:", resetData)

      // Here you would make the API call to /api/auth/reset-password
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(resetData)
      // })

      // if (response.ok) {
      //   router.push('/login?message=Password reset successfully')
      // }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For now, just log and redirect
      alert("Password reset successfully!")
      router.push("/login")
    } catch (error) {
      console.error("Error resetting password:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      console.log("Resending OTP for username:", username)
      // Here you would make an API call to resend OTP
      // const response = await fetch('/api/auth/resend-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username })
      // })
    } catch (error) {
      console.error("Error resending OTP:", error)
    }
  }

  const isFormValid = otp.join("").length === 6 && username && newPassword && confirmPassword && !passwordError

return (
  <div className="min-h-screen bg-[url('https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ6ftjDHMlNJtTSwjvNsy9RY_8tOmPhiLCphPfGLmXGAtvoqhsB')] bg-cover bg-center relative overflow-hidden">
    {/* Background trắng bên trái: top-4 bottom-4 left-4 right-1/2 (cách lề trái, trên, dưới 4 đơn vị và rộng 50%) */}
    <div className="absolute top-4 bottom-4 left-4 right-1/2 bg-white/70 rounded-3xl sm:rounded-[2.5rem]"></div>

    {/* Background decorative elements */}
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
      {/* Grid container: items-center để căn giữa theo chiều dọc */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-center min-h-[calc(100vh-1.5rem)] lg:min-h-[calc(100vh-2rem)]">
        {/* Left Content - Combined OTP and Password Reset Form */}
        {/* max-w-lg để mở rộng kích thước, lg:mt-8 đã bị loại bỏ */}
        <div className="space-y-4 sm:space-y-5 max-w-lg mx-auto lg:mx-0">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl font-bold text-[#16a1bd]">Bác sỹ</span>
            <span className="text-xl sm:text-2xl font-bold text-[#16a1bd]">ơi</span>
            <div className="w-1.5 h-1.5 bg-[#fe2f2f] rounded-full ml-1"></div>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-base sm:text-lg font-bold text-[#0b0c0c]">Reset Password</h1>
            <p className="text-[#09404c] text-xs">Enter the verification code and your new password</p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div className="space-y-2.5">
              <div className="space-y-1">
                <Label htmlFor="username" className="text-[#0b0c0c] font-medium text-xs">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="bg-white/80 border-0 rounded-xl px-3 py-2 text-[#0b0c0c] placeholder:text-[#09404c]/60 focus:ring-2 focus:ring-[#16a1bd] focus:ring-offset-0 h-8 text-xs"
                />
              </div>

              <Label className="text-[#0b0c0c] font-medium text-xs">Enter verification code</Label>

              {/* OTP Input Fields */}
              <div className="flex space-x-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-10 text-center text-sm font-semibold bg-white/80 border border-gray-300 rounded-lg text-[#0b0c0c] focus:ring-2 focus:ring-[#16a1bd] focus:border-[#16a1bd] focus:outline-none"
                  />
                ))}
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-xs text-[#09404c]">
                  Didn't receive the code?{" "}
                  <button
                    onClick={handleResendOTP}
                    className="text-[#16a1bd] font-medium hover:underline text-xs"
                    disabled={!username}
                  >
                    Resend OTP
                  </button>
                </p>
              </div>

              <div className="space-y-2.5 pt-2.5 border-t border-gray-200">
                <div className="space-y-1">
                  <Label htmlFor="newPassword" className="text-[#0b0c0c] font-medium text-xs">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        if (passwordError) validatePasswords()
                      }}
                      placeholder="Enter new password"
                      className="bg-white/80 border-0 rounded-xl px-3 py-2 pr-8 text-[#0b0c0c] placeholder:text-[#09404c]/60 focus:ring-2 focus:ring-[#16a1bd] focus:ring-offset-0 h-8 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#09404c] hover:text-[#0b0c0c]"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-[#0b0c0c] font-medium text-xs">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (passwordError) validatePasswords()
                      }}
                      placeholder="Confirm new password"
                      className="bg-white/80 border-0 rounded-xl px-3 py-2 pr-8 text-[#0b0c0c] placeholder:text-[#09404c]/60 focus:ring-2 focus:ring-[#16a1bd] focus:ring-offset-0 h-8 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#09404c] hover:text-[#0b0c0c]"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2.5">
              <Link href="/forgot-password" className="flex-1">
                <Button
                  variant="outline"
                  className="**inline-flex items-center justify-center rounded-full truncate font-semibold select-none w-full px-4 py-3 text-sm h-auto** bg-transparent border-2 border-[#16a1bd] text-[#16a1bd] hover:bg-[#16a1bd] hover:text-white transition-colors duration-200"
                >
                  Back
                </Button>
              </Link>
              <Button
                onClick={handleResetPassword}
                disabled={!isFormValid || isLoading}
                className="flex-1 **inline-flex items-center justify-center rounded-full truncate transition font-semibold select-none w-full px-4 py-3 text-sm h-auto** bg-[#0d6171] hover:bg-[#09404c] text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-1">
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Content - Dashboard Preview */}
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

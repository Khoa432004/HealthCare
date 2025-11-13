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

      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Password reset successfully!")
      router.push("/login")
    } catch (error) {
      console.error("Error resetting password:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
  }

  const isFormValid = otp.join("").length === 6 && username && newPassword && confirmPassword && !passwordError

return (
  <div className="min-h-screen h-screen bg-[url('/login-background.png')] bg-cover bg-center relative overflow-hidden">
    {/* White overlay for desktop - covers left half */}
    <div className="hidden md:block absolute top-4 bottom-4 left-4 right-[52%] bg-white/70 rounded-3xl"></div>

    <div className="w-full h-full px-4 sm:px-5 md:px-0 py-4 sm:py-5 md:py-0 relative z-10">
      <div className="grid md:grid-cols-2 gap-0 items-center h-full">
        {/* Left Content - Combined OTP and Password Reset Form */}
        <div className="w-full h-full flex items-center justify-center md:justify-start order-1">
          <div className="w-full max-w-full md:max-w-lg lg:max-w-xl px-5 py-8 sm:px-6 sm:py-10 md:pl-12 lg:pl-16 md:pr-8 lg:pr-10 md:py-8 rounded-2xl bg-white/70 md:bg-transparent overflow-y-auto max-h-[90vh] md:max-h-full">
            <div className="space-y-3.5 sm:space-y-4 md:space-y-3.5 lg:space-y-4 mx-auto w-full max-w-md md:max-w-full">
              {/* Logo */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-3xl sm:text-4xl md:text-[36px] lg:text-[40px] font-bold text-[#16a1bd]">Bác sỹ</span>
                <span className="text-3xl sm:text-4xl md:text-[36px] lg:text-[40px] font-bold text-[#16a1bd]">ơi</span>
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full ml-1 sm:ml-1.5 shadow-soft pulse-soft"></div>
              </div>

              {/* Header */}
              <div className="space-y-1.5 md:space-y-1">
                <h1 className="text-2xl sm:text-3xl md:text-[24px] lg:text-[26px] font-bold text-slate-800">Reset Password</h1>
                <p className="text-base sm:text-lg md:text-[15px] lg:text-base text-slate-600">Enter the verification code and your new password</p>
              </div>

              {/* Form */}
              <div className="space-y-3 sm:space-y-3.5 md:space-y-3">
                <div className="space-y-2.5 md:space-y-2">
                  <div className="space-y-1.5 md:space-y-1.5">
                    <Label htmlFor="username" className="text-slate-700 font-semibold text-sm md:text-xs lg:text-[13px]">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="bg-white/70 backdrop-blur-sm border-white/50 rounded-lg px-3 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11 md:h-9 lg:h-9 text-base md:text-sm lg:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 md:space-y-1.5">
                    <Label className="text-slate-700 font-semibold text-sm md:text-xs lg:text-[13px]">Enter verification code</Label>

                    {/* OTP Input Fields */}
                    <div className="flex space-x-2 justify-between">
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
                          className="w-12 h-12 md:w-10 md:h-10 text-center text-base md:text-sm font-semibold bg-white/70 backdrop-blur-sm border border-gray-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                      ))}
                    </div>

                    {/* Resend OTP */}
                    <div className="text-center pt-1">
                      <p className="text-sm md:text-xs text-slate-600">
                        Didn't receive the code?{" "}
                        <button
                          onClick={handleResendOTP}
                          className="text-[#16a1bd] font-medium hover:underline"
                          disabled={!username}
                        >
                          Resend OTP
                        </button>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 md:space-y-2 pt-2 border-t border-gray-200">
                    <div className="space-y-1.5 md:space-y-1.5">
                      <Label htmlFor="newPassword" className="text-slate-700 font-semibold text-sm md:text-xs lg:text-[13px]">
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
                          className="bg-white/70 backdrop-blur-sm border-white/50 rounded-lg px-3 pr-10 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11 md:h-9 lg:h-9 text-base md:text-sm lg:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 md:right-2.5 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-800"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5 md:w-4 md:h-4" /> : <Eye className="w-5 h-5 md:w-4 md:h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold text-sm md:text-xs lg:text-[13px]">
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
                          className="bg-white/70 backdrop-blur-sm border-white/50 rounded-lg px-3 pr-10 text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11 md:h-9 lg:h-9 text-base md:text-sm lg:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 md:right-2.5 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-800"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5 md:w-4 md:h-4" /> : <Eye className="w-5 h-5 md:w-4 md:h-4" />}
                        </button>
                      </div>
                    </div>

                    {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                  <Link href="/forgot-password" className="flex-1">
                    <Button
                      variant="outline"
                      className="inline-flex items-center justify-center rounded-lg truncate font-bold select-none w-full px-4 h-12 md:h-10 lg:h-10 text-base md:text-sm lg:text-sm bg-white/70 backdrop-blur-sm border-2 border-[#16a1bd] text-[#16a1bd] hover:bg-[#16a1bd] hover:text-white transition-all duration-300 hover:scale-[1.02]"
                    >
                      Back
                    </Button>
                  </Link>
                  <Button
                    onClick={handleResetPassword}
                    disabled={!isFormValid || isLoading}
                    className="flex-1 inline-flex items-center justify-center rounded-lg truncate transition font-bold select-none w-full px-4 h-12 md:h-10 lg:h-10 text-base md:text-sm lg:text-sm bg-[#0d6171] hover:bg-[#0a4d5a] text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
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
          </div>
        </div>

        {/* Right Content - Doctor Image - Hidden on mobile */}
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

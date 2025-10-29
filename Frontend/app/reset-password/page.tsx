"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    username: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })

  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleResetPassword = async () => {
    if (!passwordsMatch || formData.newPassword.length < 8) return

    try {
      const resetData = {
        username: formData.username,
        otp: formData.otp,
        newPassword: formData.newPassword,
      }

      console.log("Submitting password reset:", resetData)
      // Here you would make the API call to /api/auth/reset-password
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(resetData)
      // })

      // Redirect to login on success
      console.log("Password reset successful")
    } catch (error) {
      console.error("Error resetting password:", error)
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

      <div className="container mx-auto px-4 sm:px-6 py-4 lg:py-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)]">
          <div className="space-y-5 sm:space-y-6 max-w-md mx-auto lg:mx-0 lg:mt-12 order-2 lg:order-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-5">
              <span className="text-2xl sm:text-3xl font-bold text-[#16a1bd]">Bác sỹ</span>
              <span className="text-2xl sm:text-3xl font-bold text-[#16a1bd]">ơi</span>
              <div className="w-2 h-2 bg-[#fe2f2f] rounded-full ml-1"></div>
            </div>

            <div className="space-y-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#0b0c0c]">Create New Password</h1>
              <p className="text-[#09404c] text-xs">Enter your new password to complete the reset process</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-[#0b0c0c] font-medium text-sm">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="admin"
                    className="bg-white/80 border-0 rounded-xl px-3 py-2 text-[#0b0c0c] placeholder:text-[#09404c]/60 focus:ring-2 focus:ring-[#16a1bd] focus:ring-offset-0 h-9 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="otp" className="text-[#0b0c0c] font-medium text-sm">
                    OTP Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={formData.otp}
                    onChange={(e) => handleInputChange("otp", e.target.value)}
                    placeholder="577928"
                    className="bg-white/80 border-0 rounded-xl px-3 py-2 text-[#0b0c0c] placeholder:text-[#09404c]/60 focus:ring-2 focus:ring-[#16a1bd] focus:ring-offset-0 h-9 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="newPassword" className="text-[#0b0c0c] font-medium text-sm">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      placeholder="Admin@123"
                      className="bg-white/80 border-0 rounded-xl px-3 py-2 pr-10 text-[#0b0c0c] placeholder:text-[#09404c]/60 focus:ring-2 focus:ring-[#16a1bd] focus:ring-offset-0 h-9 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#09404c] hover:text-[#0b0c0c]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-[#0b0c0c] font-medium text-sm">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                      className="bg-white/80 border-0 rounded-xl px-3 py-2 pr-10 text-[#0b0c0c] placeholder:text-[#09404c]/60 focus:ring-2 focus:ring-[#16a1bd] focus:ring-offset-0 h-9 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#09404c] hover:text-[#0b0c0c]"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formData.confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                  {passwordsMatch && formData.confirmPassword && (
                    <p className="text-xs text-green-500">Passwords match</p>
                  )}
                </div>

                <div className="text-xs text-[#09404c] space-y-1">
                  <p>Password must contain:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3">
                <Link href="/verify-otp" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-2 border-[#16a1bd] text-[#16a1bd] hover:bg-[#16a1bd] hover:text-white rounded-xl py-2 font-semibold transition-colors duration-200 text-sm h-9"
                  >
                    Back
                  </Button>
                </Link>
                <Button
                  onClick={handleResetPassword}
                  className="flex-1 bg-[#0d6171] hover:bg-[#09404c] text-white rounded-xl py-2 font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm h-9"
                  disabled={!passwordsMatch || formData.newPassword.length < 8 || !formData.username || !formData.otp}
                >
                  Reset Password
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

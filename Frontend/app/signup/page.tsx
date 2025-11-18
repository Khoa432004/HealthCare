"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<string>("")
  const router = useRouter()

  const handleContinue = () => {
    if (selectedRole === "doctor") {
      router.push("/signup/doctor")
    } else if (selectedRole === "patient") {
      router.push("/signup/patient")
    }
  }

  return (
    <div className="min-h-screen h-screen bg-[url('/login-background.png')] bg-cover bg-center relative overflow-hidden">
      {/* White overlay for desktop - covers left half */}
      <div className="hidden md:block absolute top-4 bottom-4 left-4 right-[52%] bg-white/70 rounded-3xl"></div>

      <div className="w-full h-full px-4 sm:px-5 md:px-0 py-4 sm:py-5 md:py-0 relative z-10">
        <div className="grid md:grid-cols-2 gap-0 items-center h-full">
          {/* Left side - Role selection form */}
          <div className="w-full h-full flex items-center justify-center md:justify-start order-1">
            <div className="w-full max-w-full md:max-w-lg lg:max-w-xl px-5 py-8 sm:px-6 sm:py-10 md:pl-12 lg:pl-16 md:pr-8 lg:pr-10 md:py-8 rounded-2xl bg-white/70 md:bg-transparent overflow-y-auto max-h-[90vh] md:max-h-full">
              <div className="space-y-5 sm:space-y-6 md:space-y-5 lg:space-y-6 mx-auto w-full max-w-md md:max-w-full">
                <div className="space-y-2 sm:space-y-2 md:space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl md:text-[24px] lg:text-[26px] font-bold text-slate-800">Bắt đầu hành trình!</h1>
                  <p className="text-base sm:text-lg md:text-[15px] lg:text-base text-slate-600 leading-relaxed">Chọn vai trò của bạn để tạo tài khoản</p>
                </div>

                <div className="space-y-3.5 sm:space-y-4 md:space-y-3.5">
                  <div className="space-y-1.5 md:space-y-1.5">
                    <label className="text-sm md:text-xs lg:text-[13px] font-semibold text-slate-700">
                      Vui lòng chọn vai trò của bạn <span className="text-red-500">*</span>
                    </label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-full h-11 md:h-9 lg:h-9 bg-white/70 backdrop-blur-sm border-white/50 rounded-lg text-slate-800 text-base md:text-sm lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Bác sĩ</SelectItem>
                        <SelectItem value="patient">Bệnh nhân</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleContinue}
                    disabled={!selectedRole}
                    className="w-full h-12 md:h-10 lg:h-10 bg-[#0d6171] hover:bg-[#0a4d5a] text-white rounded-lg font-bold text-base md:text-sm lg:text-sm shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp tục
                  </Button>

                  <div className="text-center text-sm md:text-xs lg:text-[13px] text-slate-600 pt-1">
                    Đã có tài khoản?{" "}
                    <Link
                      href="/login"
                      className="text-[#16a1bd] hover:text-[#0d6171] font-semibold underline transition-all duration-300"
                    >
                      Đăng nhập
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Doctor image - Hidden on mobile */}
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

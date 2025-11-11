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
    <div className="h-screen bg-[url('/login-background.png')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute top-4 bottom-4 left-4 right-1/2 bg-white/70 rounded-3xl sm:rounded-[2.5rem]"></div>

      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 relative z-10 h-full">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-center h-full">
          {/* Left side - Role selection form */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="w-full max-w-md bg-transparent rounded-3xl p-6 lg:p-8">
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Bắt đầu hành trình!</h1>
                  <p className="text-base text-slate-600 leading-relaxed">Chọn vai trò của bạn để tạo tài khoản</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Vui lòng chọn vai trò của bạn <span className="text-red-500">*</span>
                    </label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-full h-10 bg-white/70 backdrop-blur-sm border-white/50 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
                    className="w-full h-10 bg-[#0d6171] hover:bg-[#0a4d5a] text-white rounded-xl font-bold text-base shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp tục
                  </Button>

                  <div className="text-center text-sm text-slate-600">
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

          {/* Right side - Logo */}
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

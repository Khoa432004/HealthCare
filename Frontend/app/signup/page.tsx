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
    } else if (selectedRole === "clinic-admin") {
      router.push("/signup/clinic-admin")
    } else if (selectedRole === "patient") {
      router.push("/signup/patient")
    }
  }

  return (
    <div className="min-h-screen bg-[url('https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ6ftjDHMlNJtTSwjvNsy9RY_8tOmPhiLCphPfGLmXGAtvoqhsB')] bg-cover bg-center relative overflow-hidden">
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

      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-center min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2rem)]">
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
                        <SelectItem value="clinic-admin">Quản trị phòng khám</SelectItem>
                        <SelectItem value="doctor">Bác sĩ</SelectItem>
                        <SelectItem value="patient">Bệnh nhân</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleContinue}
                    disabled={!selectedRole}
                    className="w-full h-10 bg-[#16a1bd] hover:bg-[#0d6171] text-white rounded-xl font-bold text-base shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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

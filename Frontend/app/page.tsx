'use client'

import { ArrowRight, Stethoscope, Grid3X3, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#b7e2eb] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl hidden md:block animate-pulse"></div>
      <div className="absolute top-32 right-32 w-20 h-20 bg-cyan-200/40 rounded-full blur-2xl hidden lg:block animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-teal-200/35 rounded-full blur-3xl hidden md:block animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-10 w-40 h-40 bg-blue-100/25 rounded-full blur-3xl hidden lg:block"></div>
      <div className="absolute bottom-10 left-20 w-28 h-28 bg-slate-200/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '3s'}}></div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)]">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-7 order-2 lg:order-1">
            {/* Header */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">Welcome to</h1>
              <div className="flex items-center space-x-2">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#16a1bd]">Bác sỹ</span>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#16a1bd]">ơi</span>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full ml-1 shadow-soft pulse-soft"></div>
              </div>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
                Nền tảng chăm sóc sức khỏe thông minh, kết nối bác sĩ và bệnh nhân một cách dễ dàng
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4 sm:space-y-5">
              {/* Healthcare Anywhere Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 flex items-start space-x-4 sm:space-x-5 shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 border border-white/50 hover:scale-[1.02]">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-3 sm:p-4 flex-shrink-0 shadow-soft-md">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-1 sm:mb-2">
                    Chăm sóc sức khỏe mọi lúc mọi nơi
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Thiết lập phòng khám di động, xây dựng lịch khám và gói dịch vụ một cách chủ động
                  </p>
                </div>
              </div>

              {/* Easy Management Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 flex items-start space-x-4 sm:space-x-5 shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 border border-white/50 hover:scale-[1.02]">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-3 sm:p-4 flex-shrink-0 shadow-soft-md">
                  <Grid3X3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-1 sm:mb-2">
                    Quản lý dễ dàng
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Mở rộng tiếp cận bệnh nhân, quản lý bệnh nhân dễ dàng và hiệu quả trên nền tảng số
                  </p>
                </div>
              </div>

              {/* Change for Development Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 flex items-start space-x-4 sm:space-x-5 shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 border border-white/50 hover:scale-[1.02]">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-3 sm:p-4 flex-shrink-0 shadow-soft-md">
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-1 sm:mb-2">
                    Đổi mới để phát triển
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Tham gia phong trào, đổi mới dịch vụ y tế, tạo ra nhiều giá trị hơn cho cộng đồng
                  </p>
                </div>
              </div>
            </div>

            {/* Get Started Button */}
            <div className="pt-3 sm:pt-4">
              <Link href="/login">
                <Button size="lg" className="bg-[#16a1bd] hover:bg-[#0d6171] text-white px-8 sm:px-10 py-3 sm:py-4 font-bold text-base sm:text-lg flex items-center space-x-3 w-full sm:w-auto shadow-soft-lg hover:shadow-soft-xl group transition-all duration-300 hover:scale-[1.05]">
                  <span>Bắt đầu ngay</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative z-10 w-full max-w-xs sm:max-w-sm lg:max-w-full">
              <div className="relative">
                <img
                  src="/confident-asian-doctor.png"
                  alt="Bác sĩ chuyên nghiệp"
                  className="w-full h-auto object-contain max-h-[250px] sm:max-h-[300px] lg:max-h-[400px] rounded-3xl sm:rounded-[2.5rem] shadow-soft-xl hover:shadow-soft-2xl transition-all duration-500 hover:scale-[1.05]"
                />
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-3xl sm:rounded-[2.5rem]"></div>
              </div>
            </div>
            {/* Background decorative circles */}
            <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 lg:-top-12 lg:-right-12 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-blue-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-20 h-20 sm:w-24 sm:h-24 bg-cyan-200/25 rounded-full blur-2xl -z-10 animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 -left-2 w-16 h-16 sm:w-20 sm:h-20 bg-slate-200/20 rounded-full blur-xl -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

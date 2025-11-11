'use client'

import { ArrowRight, Stethoscope, Grid3X3, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >

      <div className="w-full pl-2 sm:pl-3 pr-4 sm:pr-6 py-2 sm:py-3 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch h-[calc(100vh-1rem)] sm:h-[calc(100vh-1.5rem)] md:gap-4 lg:gap-6">
          {/* Left Panel - Content Section */}
          <div className="flex flex-col justify-center space-y-6 sm:space-y-8 w-full md:w-1/2 rounded-2xl p-6 sm:p-8 md:p-10 h-full overflow-y-auto" style={{ backgroundColor: 'rgba(255, 255, 255, 0.68)' }}>
            {/* Header Section */}
            <div className="space-y-3 sm:space-y-4">
              <h1
                className="text-center font-semibold text-[#131313]"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '40px',
                  lineHeight: '48px',
                  letterSpacing: '0px',
                }}
              >
                Welcome to
              </h1>
            </div>

            {/* Feature Cards Section */}
            <div className="space-y-5 w-full mx-auto" style={{ maxWidth: '490px' }}>
              {/* Healthcare Anywhere Card */}
              <div className="bg-[#FCFEFF] rounded-2xl p-5 flex items-start space-x-5 border shadow-sm hover:shadow-md transition-all duration-300 w-full" style={{ borderColor: 'rgba(183, 226, 235, 0.68)' }}>
                <div className="bg-[#16a1bd] rounded-full p-3 sm:p-4 flex-shrink-0">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-black text-base sm:text-lg mb-2">
                    Chăm sóc sức khỏe mọi lúc mọi nơi
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Thiết lập phòng khám di động, xây dựng lịch khám và gói dịch vụ một cách chủ động
                  </p>
                </div>
              </div>

              {/* Easy Management Card */}
              <div className="bg-[#FCFEFF] rounded-2xl p-5 flex items-start space-x-5 border shadow-sm hover:shadow-md transition-all duration-300 w-full" style={{ borderColor: 'rgba(183, 226, 235, 0.68)' }}>
                <div className="bg-[#16a1bd] rounded-full p-3 sm:p-4 flex-shrink-0">
                  <Grid3X3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-black text-base sm:text-lg mb-2">
                    Quản lý dễ dàng
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Mở rộng tiếp cận bệnh nhân, quản lý bệnh nhân dễ dàng và hiệu quả trên nền tảng số
                  </p>
                </div>
              </div>

              {/* Change for Development Card */}
              <div className="bg-[#FCFEFF] rounded-2xl p-5 flex items-start space-x-5 border shadow-sm hover:shadow-md transition-all duration-300 w-full" style={{ borderColor: 'rgba(183, 226, 235, 0.68)' }}>
                <div className="bg-[#16a1bd] rounded-full p-3 sm:p-4 flex-shrink-0">
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-black text-base sm:text-lg mb-2">
                    Đổi mới để phát triển
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Tham gia phong trào, đổi mới dịch vụ y tế, tạo ra nhiều giá trị hơn cho cộng đồng
                  </p>
                </div>
              </div>
            </div>

            {/* Get Started Button */}
            <div className="pt-4 sm:pt-6 flex justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-[#0d6171] hover:bg-[#0a4d5a] text-white px-8 sm:px-10 py-3 sm:py-4 font-bold text-base sm:text-lg flex items-center space-x-3 rounded-xl shadow-md hover:shadow-lg group transition-all duration-300">
                  <span>Bắt đầu ngay</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Panel - Doctor Image Section */}
          <div className="relative w-full md:w-1/2 h-full rounded-2xl overflow-hidden">
            <div className="relative w-full h-full flex items-end justify-center">
              <img
                src="/page-doctor.png"
                alt="Bác sĩ chuyên nghiệp"
                className="block bg-transparent"
                style={{ 
                  filter: 'drop-shadow(0 4px 12px rgba(183, 226, 235, 0.4))',
                  width: '130%',
                  height: 'auto',
                  maxWidth: 'none',
                  objectFit: 'contain',
                  objectPosition: 'bottom',
                  marginBottom: '0',
                  mixBlendMode: 'multiply',
                  transform: 'scaleX(-1)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

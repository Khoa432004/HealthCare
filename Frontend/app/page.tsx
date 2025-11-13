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
      {/* Main Container */}
      <div className="w-full px-4 sm:px-5 md:px-5 lg:px-6 py-4 sm:py-5 md:py-4 relative z-10">
        <div className="flex flex-col md:flex-row gap-0 md:gap-5 lg:gap-6 items-stretch min-h-[calc(100vh-2rem)] md:h-[calc(100vh-2rem)]">
          
          {/* Left Panel - Content Section */}
          <div 
            className="flex flex-col justify-center py-8 px-5 sm:py-10 sm:px-6 md:py-7 md:px-7 lg:py-8 lg:px-8 w-full md:w-1/2 lg:w-[48%] rounded-2xl space-y-6 sm:space-y-7 md:space-y-6 lg:space-y-7 overflow-y-auto" 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.68)' }}
          >
            {/* Header Section */}
            <div className="space-y-2">
              <h1
                className="text-center font-semibold text-[#131313] text-3xl sm:text-4xl md:text-[32px] lg:text-[36px] leading-snug sm:leading-tight md:leading-[40px] lg:leading-[44px]"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                Welcome to
              </h1>
            </div>

            {/* Feature Cards Section */}
            <div className="space-y-4 sm:space-y-4 md:space-y-4 w-full mx-auto max-w-full md:max-w-[450px] lg:max-w-[460px]">
              {/* Healthcare Anywhere Card */}
              <div 
                className="bg-[#FCFEFF] rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-4 flex items-start space-x-4 border shadow-sm hover:shadow-md transition-all duration-300 w-full" 
                style={{ borderColor: 'rgba(183, 226, 235, 0.68)' }}
              >
                <div className="bg-[#16a1bd] rounded-full p-3 sm:p-3.5 md:p-3.5 flex-shrink-0">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-black text-base sm:text-lg md:text-base lg:text-[17px] mb-2">
                    Chăm sóc sức khỏe mọi lúc mọi nơi
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-[15px] md:text-[13px] leading-relaxed">
                    Thiết lập phòng khám di động, xây dựng lịch khám và gói dịch vụ một cách chủ động
                  </p>
                </div>
              </div>

              {/* Easy Management Card */}
              <div 
                className="bg-[#FCFEFF] rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-4 flex items-start space-x-4 border shadow-sm hover:shadow-md transition-all duration-300 w-full" 
                style={{ borderColor: 'rgba(183, 226, 235, 0.68)' }}
              >
                <div className="bg-[#16a1bd] rounded-full p-3 sm:p-3.5 md:p-3.5 flex-shrink-0">
                  <Grid3X3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-black text-base sm:text-lg md:text-base lg:text-[17px] mb-2">
                    Quản lý dễ dàng
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-[15px] md:text-[13px] leading-relaxed">
                    Mở rộng tiếp cận bệnh nhân, quản lý bệnh nhân dễ dàng và hiệu quả trên nền tảng số
                  </p>
                </div>
              </div>

              {/* Change for Development Card */}
              <div 
                className="bg-[#FCFEFF] rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-4 flex items-start space-x-4 border shadow-sm hover:shadow-md transition-all duration-300 w-full" 
                style={{ borderColor: 'rgba(183, 226, 235, 0.68)' }}
              >
                <div className="bg-[#16a1bd] rounded-full p-3 sm:p-3.5 md:p-3.5 flex-shrink-0">
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-black text-base sm:text-lg md:text-base lg:text-[17px] mb-2">
                    Đổi mới để phát triển
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-[15px] md:text-[13px] leading-relaxed">
                    Tham gia phong trào, đổi mới dịch vụ y tế, tạo ra nhiều giá trị hơn cho cộng đồng
                  </p>
                </div>
              </div>
            </div>

            {/* Get Started Button */}
            <div className="pt-4 sm:pt-5 md:pt-5 flex justify-center">
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-[#0d6171] hover:bg-[#0a4d5a] text-white px-8 sm:px-10 md:px-9 py-3 sm:py-3.5 md:py-3.5 font-bold text-base sm:text-lg md:text-base lg:text-[17px] flex items-center space-x-2 sm:space-x-3 rounded-xl shadow-md hover:shadow-lg group transition-all duration-300"
                >
                  <span>Bắt đầu ngay</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Panel - Doctor Image Section */}
          <div className="hidden md:flex relative w-full md:w-1/2 lg:w-[48%] rounded-2xl overflow-hidden">
            <div className="relative w-full h-full flex items-end justify-center">
              <img
                src="/page-doctor.png"
                alt="Bác sĩ chuyên nghiệp"
                className="block bg-transparent w-full md:w-[120%] lg:w-[110%] h-auto object-contain object-bottom"
                style={{ 
                  filter: 'drop-shadow(0 4px 12px rgba(183, 226, 235, 0.4))',
                  maxWidth: 'none',
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

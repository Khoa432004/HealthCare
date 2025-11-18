'use client'

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen h-screen bg-[url('/login-background.png')] bg-cover bg-center relative overflow-hidden">
      {/* White overlay for desktop - covers left half */}
      <div className="hidden md:block absolute top-4 bottom-4 left-4 right-[52%] bg-white/70 rounded-3xl"></div>

      <div className="w-full h-full px-4 sm:px-5 md:px-0 py-4 sm:py-5 md:py-0 relative z-10">
        <div className="grid md:grid-cols-2 gap-0 items-center h-full">
          {/* Left Content - Login Form */}
          <div className="w-full h-full flex items-center justify-center md:justify-start order-1">
            <LoginForm />
          </div>

          {/* Right Image - Hidden on mobile */}
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
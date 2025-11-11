'use client'

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="h-screen bg-[url('/login-background.png')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute top-4 bottom-4 left-4 right-1/2 bg-white/70 rounded-3xl sm:rounded-[2.5rem]"></div>

      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 relative z-10 h-full">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-center h-full">
          {/* Left Content - Login Form */}
          <div className="space-y-8 order-2 lg:order-1 w-full">
            <LoginForm />
          </div>

          {/* Right Image */}
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
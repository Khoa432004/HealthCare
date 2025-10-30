'use client'

import { SignUpForm } from "@/components/signup-form"

export default function DoctorSignUpPage() {
  return (
    <div className="min-h-screen bg-[#b7e2eb] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-white/20 rounded-full hidden lg:block"></div>
      <div className="absolute top-32 right-32 w-12 h-12 bg-white/30 rounded-full hidden lg:block"></div>
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/25 rounded-full hidden lg:block"></div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-3xl lg:max-w-4xl">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  )
}

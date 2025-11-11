'use client'

import { SignUpForm } from "@/components/signup-form"

export default function DoctorSignUpPage() {
  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center relative overflow-hidden">
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

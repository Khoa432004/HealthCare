"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PatientSignUpPage() {
  return (
    <div className="min-h-screen bg-[#b7e2eb] relative overflow-hidden">
      <div className="absolute top-10 right-10 w-20 h-20 bg-white/20 rounded-full hidden lg:block"></div>
      <div className="absolute top-32 right-32 w-12 h-12 bg-white/30 rounded-full hidden lg:block"></div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <div className="mb-8">
              <Link href="/signup" className="text-[#16a1bd] hover:text-[#0d6171] font-semibold">
                ← Back to role selection
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-[#0b0c0c] mb-8">Patient Registration</h1>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input placeholder="Enter your full name" className="h-12" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" placeholder="Enter your email" className="h-12" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input placeholder="Enter phone number" className="h-12" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth</label>
                  <Input type="date" className="h-12" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input type="password" placeholder="Create a password" className="h-12" />
              </div>

              <Button className="w-full h-12 bg-[#16a1bd] hover:bg-[#0d6171] text-white rounded-xl font-semibold">
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

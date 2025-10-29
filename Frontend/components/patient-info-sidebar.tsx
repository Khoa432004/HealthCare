"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Settings, User, Phone, MapPin, Ruler, Scale, Droplet, Calculator, Plus } from "lucide-react"

export function PatientInfoSidebar() {
  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Patient Profile */}
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src="/clean-female-doctor.png" />
            <AvatarFallback>PL</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Pham Linh</h3>
            <p className="text-sm text-gray-500">Female</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Current Appointment */}
        <Card className="bg-[#16a1bd] text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Appointment</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">11:30 - 12:00 AM</span>
              </div>
            </div>
            <h4 className="font-semibold">Medical Review - Pham Linh</h4>
            <p className="text-sm opacity-90 mt-1">20/06/2025</p>
          </CardContent>
        </Card>

        {/* Package */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Package</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">3 months</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-[#16a1bd] border-[#16a1bd] bg-transparent">
                  Prolong
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 border-red-500 bg-transparent">
                  Cancel
                </Button>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-[#16a1bd] h-2 rounded-full" style={{ width: "60%" }}></div>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Personal info</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="text-sm font-medium">Female</p>
              </div>
              <div className="ml-auto">
                <p className="text-sm text-gray-500">Date of birth</p>
                <p className="text-sm font-medium">01/05/1987</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="text-sm font-medium">079085123456</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-sm font-medium">123 Nguyen Hue St., District 1, Ho Chi Minh City, Vietnam</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Info */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Medical info</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Ruler className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Height</p>
                <p className="text-sm font-medium">165 cm</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Weight</p>
                <p className="text-sm font-medium">60 kg</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Droplet className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Blood Type</p>
                <p className="text-sm font-medium">B+</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">BMI</p>
                <p className="text-sm font-medium">22.05</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chronic Conditions */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Chronic Conditions</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-gray-600">
              ANXIETY
            </Badge>
            <Badge variant="outline" className="text-gray-600">
              DEPRESSION
            </Badge>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs bg-transparent">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Allergies */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Allergies</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-gray-600">
              FISH
            </Badge>
            <Badge variant="outline" className="text-gray-600">
              AVOCADO
            </Badge>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs bg-transparent">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

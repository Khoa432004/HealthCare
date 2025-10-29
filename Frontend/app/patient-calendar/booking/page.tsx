"use client"
import { Map } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Bell, User, Settings, Calendar, Stethoscope, Clock, MapPin, CheckCircle, ChevronLeft, ChevronRight, Filter, Star, Building, Users, DollarSign, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PatientSidebar } from "@/components/patient-sidebar"
import { LoadingSpinner, PageLoadingSpinner } from "@/components/loading-spinner"

type AppointmentType = "online" | "clinic" | "home"
type Step = 1 | 2 | 3

export default function BookingPage() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("clinic")
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [selectedClinic, setSelectedClinic] = useState<string | null>("clinic1")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 800))
      } catch (error) {
        console.error('Error loading booking data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const notifications = [
    {
      title: "Appointment Reminder",
      message: "Your appointment with Dr. Phạm Linh is scheduled for tomorrow at 2:00 PM.",
      time: "15 min ago",
    },
    {
      title: "Lab Results Available",
      message: "Your blood test results from last week are now available for review.",
      time: "1 hour ago",
    },
    {
      title: "Medication Reminder",
      message: "Don't forget to take your morning medication at 8:00 AM.",
      time: "2 hours ago",
    },
  ]

  const clinics = [
    {
      id: "clinic1",
      name: "Hoàn Mỹ Medical Center",
      specialty: "Cardiology",
      rating: 4.5,
      reviews: 120,
      location: "Hoàn Mỹ Medical Center (Province)",
      province: "Đà Nẵng",
      hours: "07:00 - 17:00",
      cost: "500,000 VND / visit",
      address: "291 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng, Việt Nam",
      established: "15 years",
      staff: "120 specialists"
    },
    {
      id: "clinic2",
      name: "Vinmec International Hospital",
      specialty: "General Medicine",
      province: "Đà Nẵng",
      rating: 4.8,
      reviews: 230,
      location: "Vinmec International Hospital (Province)",
      hours: "08:00 - 20:00",
      cost: "600,000 VND / visit",
      address: "458 Minh Khai, Hai Bà Trưng, Hà Nội, Việt Nam",
      established: "20 years",
      staff: "200 specialists"
    },
    {
      id: "clinic3",
      name: "FV Hospital",
      specialty: "Multi-specialty",
      rating: 4.6,
      reviews: 180,
      location: "FV Hospital (Province)",
      province: "Đà Nẵng",
      hours: "07:30 - 21:00",
      cost: "550,000 VND / visit",
      address: "6 Nguyễn Lương Bằng, Tân Phú, TP.HCM, Việt Nam",
      established: "25 years",
      staff: "150 specialists"
    },
    {
      id: "clinic4",
      name: "Hue Central Hospital",
      specialty: "Specialty Care",
      rating: 4.4,
      reviews: 140,
      location: "Hue Central Hospital (Province)",
      province: "Đà Nẵng",
      hours: "06:30 - 18:00",
      cost: "400,000 VND / visit",
      address: "16 Lê Lợi, Phú Nhuận, Huế, Việt Nam",
      established: "30 years",
      staff: "180 specialists"
    }
  ]

  const doctors = [
    {
      id: "doc1",
      name: "TS. BS Le Tuyet Hoa",
      specialty: "D001. Cardiovascular",
      rating: 4.4,
      reviews: 128,
      availableTimes: ["10:00", "10:30", "11:00", "12:30", "14:00"]
    },
    {
      id: "doc2",
      name: "PGS. TS Nguyen Van Binh",
      specialty: "D002. Neurology",
      rating: 4.7,
      reviews: 95,
      availableTimes: ["09:00", "11:30", "15:00"]
    },
    {
      id: "doc3",
      name: "BS. Tran Thi Lan",
      specialty: "D003. Dermatology",
      rating: 4.2,
      reviews: 63,
      availableTimes: ["10:00", "13:00", "17:30"]
    }
  ]

  const selectedClinicData = clinics.find(clinic => clinic.id === selectedClinic)

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedDoctor) return
    if (currentStep === 2 && (!selectedDate || !selectedTime)) return
    setCurrentStep(prev => Math.min(prev + 1, 3) as Step)
  }

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1) as Step)
  }

  if (isLoading) {
    return <PageLoadingSpinner />
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
  <PatientSidebar />

  {/* Main Content */}
  <div className="flex-1 flex flex-col overflow-hidden">
  <header className="border-b border-white/50 px-6 py-4 shadow-soft">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl shadow-soft-md">
          <div className="w-5 h-5 gradient-primary rounded-lg flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-[#16a1bd]">My calendar</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          {/* Đã thêm z-10 để đảm bảo biểu tượng nằm trên ô input */}
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
          <Input placeholder="Search..." className="pl-12 w-80 glass border-white/50 hover:bg-white transition-all" />
        </div>

        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative gradient-primary text-white hover:opacity-90 shadow-soft hover:shadow-soft-md transition-smooth"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full pulse-soft shadow-soft"></div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96">
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-4">Notifications</h3>
              <div className="space-y-4">
                {notifications.map((notif, index) => (
                  <div key={index} className="pb-4 border-b last:border-0">
                    <h4 className="font-medium text-sm mb-1">{notif.title}</h4>
                    <p className="text-sm text-gray-600 mb-1">{notif.message}</p>
                    <span className="text-xs text-gray-400">• {notif.time}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                Read All Notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl hover:bg-white/50 transition-smooth">
              <Avatar className="w-9 h-9 ring-2 ring-white shadow-soft">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="gradient-primary text-white font-semibold">TE</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-700">Test stag patient</p>
                <p className="text-xs text-gray-500">Patient</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass border-white/50 shadow-soft-lg">
            <div className="px-3 py-3 border-b border-white/50">
              <p className="font-semibold text-gray-900">Test stag patient</p>
              <p className="text-xs text-gray-500 font-medium">Patient</p>
            </div>
            <Link href="/patient-profile">
              <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 hover:bg-white/50 transition-smooth">
                <User className="w-4 h-4 text-[#16a1bd]" />
                <span className="font-medium">My Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 hover:bg-white/50 transition-smooth">
                <Settings className="w-4 h-4 text-[#16a1bd]" />
                <span className="font-medium">Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="border-white/50" />
            <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 transition-smooth">
              <span className="font-medium">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>

    {/* Booking Content */}
    <div className="flex-1 flex gap-6 h-full px-6">
      {/* Left Column - Medical Centers */}
      <div className="flex-1 h-full overflow-y-auto p-3 bg-white rounded-2xl shadow-lg [scrollbar-width:none] [-ms-overflow-style:none]">
        <Link
          href="/patient-calendar"
          className="flex items-center space-x-2 text-[#16a1bd] hover:text-[#0d6171] transition-smooth"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-400" />
          <span className="text-base inline text-neutral-400 font-semibold">Back</span>
        </Link>
        <span className="text-1rem font-bold text-[#0d6171]">Set a new appointment</span>
        {/* Steps Progress */}
        <div className="flex items-center justify-center space-x-8 mb-8">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? "bg-[#16a1bd] text-white" : "bg-gray-300 text-gray-600"
              }`}
            >
              <Stethoscope className="w-5 h-5" />
            </div>
            <p
              className={`mt-2 text-sm font-medium ${
                currentStep >= 1 ? "text-[#16a1bd] font-bold" : "text-gray-500"
              }`}
            >
              Step 1 Pick Doctor
            </p>
          </div>
          <div
            className={`h-0.5 w-16 ${currentStep > 1 ? "bg-[#16a1bd]" : "bg-gray-300"} transition-all`}
          ></div>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? "bg-[#16a1bd] text-white" : "bg-gray-300 text-gray-600"
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <p
              className={`mt-2 text-sm font-medium ${
                currentStep >= 2 ? "text-[#16a1bd] font-bold" : "text-gray-500"
              }`}
            >
              Step 2 Details
            </p>
          </div>
          <div
            className={`h-0.5 w-16 ${currentStep > 2 ? "bg-[#16a1bd]" : "bg-gray-300"} transition-all`}
          ></div>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? "bg-[#16a1bd] text-white" : "bg-gray-300 text-gray-600"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
            </div>
            <p
              className={`mt-2 text-sm font-medium ${
                currentStep >= 3 ? "text-[#16a1bd] font-bold" : "text-gray-500"
              }`}
            >
              Step 3 Confirm
            </p>
          </div>
        </div>

        {/* Appointment Type Selection */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-1 bg-white border border-[#16a1bd] rounded-full flex gap-1 w-full max-w-lg mx-auto">
            <Button
              variant={appointmentType === "online" ? "default" : "ghost"}
              onClick={() => setAppointmentType("online")}
              className={`
                flex-1 rounded-full px-6 py-2 h-auto text-sm transition-colors duration-200
                ${
                  appointmentType === "online"
                    ? "bg-[#16a1bd] hover:bg-[#0d6171] text-white font-semibold"
                    : "bg-transparent text-gray-600 hover:bg-gray-50/50 font-medium"
                }
              `}
            >
              Online
            </Button>
            <Button
              variant={appointmentType === "clinic" ? "default" : "ghost"}
              onClick={() => setAppointmentType("clinic")}
              className={`
                flex-1 rounded-full px-6 py-2 h-auto text-sm transition-colors duration-200
                ${
                  appointmentType === "clinic"
                    ? "bg-[#16a1bd] hover:bg-[#0d6171] text-white font-semibold"
                    : "bg-transparent text-gray-800 hover:bg-gray-50/50 font-medium"
                }
              `}
            >
              At Clinic
            </Button>
            <Button
              variant={appointmentType === "home" ? "default" : "ghost"}
              onClick={() => setAppointmentType("home")}
              className={`
                flex-1 rounded-full px-6 py-2 h-auto text-sm transition-colors duration-200
                ${
                  appointmentType === "home"
                    ? "bg-[#16a1bd] hover:bg-[#0d6171] text-white font-semibold"
                    : "bg-transparent text-gray-800 hover:bg-gray-50/50 font-medium"
                }
              `}
            >
              At Home
            </Button>
          </div>
        </div>

        {/* Our Specialists Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Our Specialists</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                <Input placeholder="Search..." className="pl-12 w-64 glass border-white/50" />
              </div>
              <Button variant="outline" size="icon" className="glass border-white/50 shadow-soft">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Medical Centers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                className={`rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg border-2 shadow-md 
                  ${
                    selectedClinic === clinic.id
                      ? "border-[#16a1bd] bg-[#e5f5f8]"
                      : "border-transparent bg-white"
                  }`}
                onClick={() => setSelectedClinic(clinic.id)}
              >
                {/* Logo/Tên & Xếp hạng */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 flex-shrink-0">
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfmMBltEBalEtEqWZ_SAmkCbK3BauD5ZpokA&s"
                        alt={clinic.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                        {clinic.name}
                      </h3>
                      <p className="text-sm text-gray-600">{clinic.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-base text-gray-700 font-medium whitespace-nowrap">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span>
                      {clinic.rating} ({clinic.reviews})
                    </span>
                  </div>
                </div>

                {/* Địa chỉ, Giờ làm việc, Chi phí */}
                <div className="space-y-4">
                  {/* Province/Địa chỉ */}
                  <div className="flex items-center justify-between text-base text-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#16a1bd] flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 leading-none">Province</p>
                        <span className="font-medium">{clinic.province}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-200/50 rounded-lg flex items-center justify-center text-[#16a1bd]">
                      <Map className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Giờ làm việc */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#16a1bd] flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 leading-none">Working hours</p>
                      <span className="font-medium">{clinic.hours}</span>
                    </div>
                  </div>

                  {/* Chi phí */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#16a1bd] flex items-center justify-center text-white flex-shrink-0">
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 16 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4"
                      >
                        <path
                          d="M8 2.5C7.50555 2.5 7.0222 2.64662 6.61107 2.92133C6.19995 3.19603 5.87952 3.58648 5.6903 4.04329C5.50108 4.50011 5.45157 5.00277 5.54804 5.48773C5.6445 5.97268 5.8826 6.41814 6.23223 6.76777C6.58186 7.1174 7.02732 7.3555 7.51227 7.45196C7.99723 7.54843 8.49989 7.49892 8.95671 7.3097C9.41352 7.12048 9.80397 6.80005 10.0787 6.38893C10.3534 5.9778 10.5 5.49445 10.5 5C10.5 4.33696 10.2366 3.70107 9.76777 3.23223C9.29893 2.76339 8.66304 2.5 8 2.5ZM8 6.5C7.70333 6.5 7.41332 6.41203 7.16664 6.2472C6.91997 6.08238 6.72771 5.84811 6.61418 5.57403C6.50065 5.29994 6.47094 4.99834 6.52882 4.70736C6.5867 4.41639 6.72956 4.14912 6.93934 3.93934C7.14912 3.72956 7.41639 3.5867 7.70736 3.52882C7.99834 3.47094 8.29994 3.50065 8.57403 3.61418C8.84811 3.72771 9.08238 3.91997 9.2472 4.16664C9.41203 4.41332 9.5 4.70333 9.5 5C9.5 5.39782 9.34196 5.77936 9.06066 6.06066C8.77936 6.34196 8.39782 6.5 8 6.5ZM15 0.5H1C0.867392 0.5 0.740215 0.552679 0.646447 0.646447C0.552678 0.740215 0.5 0.867392 0.5 1V9C0.5 9.13261 0.552678 9.25979 0.646447 9.35355C0.740215 9.44732 0.867392 9.5 1 9.5H15C15.1326 9.5 15.2598 9.44732 15.3536 9.35355C15.4473 9.25979 15.5 9.13261 15.5 9V1C15.5 0.867392 15.4473 0.740215 15.3536 0.646447C15.2598 0.552679 15.1326 0.5 15 0.5ZM1.5 1.5H2.83562C2.57774 2.09973 2.09973 2.57775 1.5 2.83563V1.5ZM1.5 8.5V7.16438C2.09973 7.42226 2.57774 7.90027 2.83562 8.5H1.5ZM14.5 8.5H13.1644C13.4223 7.90027 13.9003 7.42226 14.5 7.16438V8.5ZM14.5 6.10312C13.9323 6.271 13.4155 6.57825 12.9969 6.99689C12.5782 7.41553 12.271 7.93225 12.1031 8.5H3.89687C3.729 7.93225 3.42175 7.41553 3.00311 6.99689C2.58447 6.57825 2.06775 6.271 1.5 6.10312V3.89687C2.06775 3.729 2.58447 3.42175 3.00311 3.00311C3.42175 2.58447 3.729 2.06775 3.89687 1.5H12.1031C12.271 2.06775 12.5782 2.58447 12.9969 3.00311C13.4155 3.42175 13.9323 3.729 14.5 3.89687V6.10312ZM14.5 2.83563C13.9003 2.57775 13.4223 2.09973 13.1644 1.5H14.5V2.83563Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 leading-none">Cost from (₫)</p>
                      <span className="font-bold text-gray-900">{clinic.cost}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="glass border-white/50 shadow-soft"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="glass border-white/50 shadow-soft"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">Page 1 of 100</span>
            </div>
            <Button className="bg-[#16a1bd] hover:bg-[#0d6171] text-white shadow-soft hover:shadow-soft-md transition-smooth">
              Next
            </Button>
          </div>
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="w-80 h-full bg-white border-l border-gray-200 p-6 rounded-2xl overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] ">
        {/* Selected Hospital Details */}
        {selectedClinicData && (
          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {selectedClinicData.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {selectedClinicData.specialty}
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>
                  {selectedClinicData.rating} ({selectedClinicData.reviews})
                </span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Building className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">Establish</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedClinicData.established}
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">Staff</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedClinicData.staff}
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-xs text-gray-600">Cost</p>
                <p className="text-sm font-semibold text-gray-900">500,000 VND</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-3 mb-4">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600">{selectedClinicData.address}</p>
            </div>

            {/* Map */}
            <div className="relative bg-gray-100 rounded-xl h-32 mb-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-700 font-medium">Google Maps</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-2 right-2 bg-white border-gray-200 shadow-sm"
              >
                View larger map
              </Button>
            </div>
          </div>
        )}

        {/* Our Specialists */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900">Our Specialists</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                className="pl-10 w-32 text-sm bg-gray-50 border-gray-200"
              />
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>

          <div className="space-y-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`bg-white rounded-xl border border-gray-200 p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedDoctor === doctor.id ? "ring-2 ring-[#16a1bd]" : ""
                }`}
                onClick={() => setSelectedDoctor(doctor.id)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                      DR
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{doctor.name}</h4>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>
                        {doctor.rating} ({doctor.reviews})
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Available Today</p>
                  <div className="flex flex-wrap gap-2">
                    {doctor.availableTimes.map((time) => (
                      <Button
                        key={time}
                        size="sm"
                        variant="outline"
                        className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTime(time);
                        }}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-gray-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-gray-200"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">Page 1 of 100</span>
            </div>
          </div>
        </div>
      </div>
    </div>  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  </div>
</div>

  )

}

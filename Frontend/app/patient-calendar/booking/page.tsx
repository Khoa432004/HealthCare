"use client"
import { useState, useEffect } from "react"
import type React from "react"

import Link from "next/link"
import {
  Search,
  Bell,
  User,
  Settings,
  Calendar,
  Stethoscope,
  Clock,
  MapPin,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Star,
  Users,
  DollarSign,
  ArrowLeft,
  Upload,
} from "lucide-react"
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
import { PageLoadingSpinner } from "@/components/loading-spinner"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"

interface DoctorSummaryDto {
  id: string
  name: string
  specialty: string
  rating: number
  reviews: number
  clinic: string
  cost: string
  availableTimes: string[]
  experience: string
  consultations: string
  title: string
}

interface CertificateDto {
  year: string
  title: string
}

interface DoctorDetailDto {
  id: string
  name: string
  specialty: string
  rating: number
  reviews: number
  clinic: string
  province: string
  cost: string
  experience: string
  consultations: string
  workplace_name: string
  conditions: string[]
  certificates: CertificateDto[]
}

type Step = 1 | 2 | 3

export default function BookingPage() {
  const [isLoadingSpecialists, setIsLoadingSpecialists] = useState(false)////////////


  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<Record<string, string | null>>({})
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [doctors, setDoctors] = useState<DoctorSummaryDto[]>([])
  const [selectedDoctorData, setSelectedDoctorData] = useState<DoctorDetailDto | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    province: "",
    specialty: "",
    costRange: "all", // all, under500k, 500k-1m, over1m
    experience: "all", // all, under5, 5-10, over10
  })
  const [formData, setFormData] = useState({
    whoNeedsVisit: "",
    appointmentReason: "",
    appointmentDetails: "",
    symptomStartDate: "",
    symptomSeverity: "",
    medication: "",
    agreeToShare: false,
  })
  const [fileName, setFileName] = useState("No file chosen")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 800))
      } catch (error) {
        console.error("Error loading booking data:", error)
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

  useEffect(() => {/////////////////////
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 800))
      } catch (error) {
        console.error("Error loading booking data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])



  useEffect(() => {
    const loadDoctors = async () => {
      setIsLoadingSpecialists(true) // Chỉ loading phần specialists
      try {
        const endpoint = searchQuery 
          ? `${API_ENDPOINTS.DOCTORS.GET_ALL}?search=${encodeURIComponent(searchQuery)}`
          : API_ENDPOINTS.DOCTORS.GET_ALL
        
        const summaryRes: DoctorSummaryDto[] = await apiClient.get(endpoint)
        setDoctors(Array.isArray(summaryRes) ? summaryRes : [])

        if (summaryRes.length > 0 && !selectedDoctor) {
          setSelectedDoctor(summaryRes[0].id)
        }
      } catch (error: any) {
        console.error("Lỗi kết nối đến backend:", error)
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.warn("Unauthorized: Token không hợp lệ hoặc thiếu.")
        }
        setDoctors([])
      } finally {
        setIsLoadingSpecialists(false)
      }
    }

    loadDoctors()
  }, [searchQuery])

  useEffect(() => {
    if (!selectedDoctor) {
      setSelectedDoctorData(null)
      return
    }

    const fetchDoctorDetail = async () => {
      try {
        const data: DoctorDetailDto = await apiClient.get(API_ENDPOINTS.DOCTORS.GET_BY_ID(selectedDoctor))
        setSelectedDoctorData(data)
      } catch (err) {
        console.error(err)
        setSelectedDoctorData(null)
      }
    }

    fetchDoctorDetail()
  }, [selectedDoctor])

  const handleNextStep = () => {
    if (currentStep === 1 && (!selectedDoctor || !selectedTime)) return
    if (currentStep === 2 && (!selectedDate || !selectedTime)) return
    setCurrentStep((prev) => Math.min(prev + 1, 3) as Step)
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step)
  }

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  const handleConfirmAppointment = () => {
    console.log("Appointment confirmed with data:", {
      selectedDoctor,
      selectedDate,
      selectedTime,
      formData,
    })
    // TODO: Send confirmation to backend
  }

  const filteredDoctors = doctors
  .filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clinic.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSpecialty = !filters.specialty || doc.specialty === filters.specialty

    const costNum = parseInt(doc.cost.replace(/[^0-9]/g, "")) || 0
    const matchesCost =
      filters.costRange === "all" ||
      (filters.costRange === "under500k" && costNum < 500000) ||
      (filters.costRange === "500k-1m" && costNum >= 500000 && costNum <= 1000000) ||
      (filters.costRange === "over1m" && costNum > 1000000)

    const expNum = parseInt(doc.experience) || 0
    const matchesExp =
      filters.experience === "all" ||
      (filters.experience === "under5" && expNum < 5) ||
      (filters.experience === "5-10" && expNum >= 5 && expNum <= 10) ||
      (filters.experience === "over10" && expNum > 10)

    return matchesSearch && matchesSpecialty && matchesCost && matchesExp
  })

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
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                <Input
                  placeholder="Search..."
                  className="pl-12 w-80 glass border-white/50 hover:bg-white transition-all"
                />
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
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl hover:bg-white/50 transition-smooth"
                  >
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
          {/* Left Column */}
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
              <div className={`h-0.5 w-16 ${currentStep > 1 ? "bg-[#16a1bd]" : "bg-gray-300"} transition-all`}></div>
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
              <div className={`h-0.5 w-16 ${currentStep > 2 ? "bg-[#16a1bd]" : "bg-gray-300"} transition-all`}></div>
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

            <div className="flex items-center space-x-4 mb-8">
              <div className="p-1 bg-white border border-[#16a1bd] rounded-full flex gap-1 w-full max-w-lg mx-auto">
                <Button
                  className={`
                    flex-1 rounded-full px-6 py-2 h-auto text-sm transition-colors duration-200
                    bg-[#16a1bd] hover:bg-[#0d6171] text-white font-semibold
                  `}
                >
                  At Clinic
                </Button>
              </div>
            </div>

            {currentStep === 1 ? (
              // STEP 1: Our Specialists
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Our Specialists</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 w-64 glass border-white/50"
                      />
                    </div>
                      <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="glass border-white/50 shadow-soft bg-transparent">
                            <Filter className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 p-4 space-y-4">
                          {/* Specialty */}
                          <div>
                            <label className="text-xs font-medium text-gray-700">Chuyên khoa</label>
                            <select
                              value={filters.specialty}
                              onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                              className="mt-1 w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a1bd]"
                            >
                              <option value="">Tất cả</option>
                              {Array.from(new Set(doctors.map(d => d.specialty))).map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>

                          {/* Cost Range */}
                          <div>
                            <label className="text-xs font-medium text-gray-700">Mức giá</label>
                            <select
                              value={filters.costRange}
                              onChange={(e) => setFilters({ ...filters, costRange: e.target.value })}
                              className="mt-1 w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a1bd]"
                            >
                              <option value="all">Tất cả</option>
                              <option value="under500k">Dưới 500.000đ</option>
                              <option value="500k-1m">500.000đ - 1.000.000đ</option>
                              <option value="over1m">Trên 1.000.000đ</option>
                            </select>
                          </div>

                          {/* Experience */}
                          <div>
                            <label className="text-xs font-medium text-gray-700">Kinh nghiệm</label>
                            <select
                              value={filters.experience}
                              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                              className="mt-1 w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a1bd]"
                            >
                              <option value="all">Tất cả</option>
                              <option value="under5">Dưới 5 năm</option>
                              <option value="5-10">5 - 10 năm</option>
                              <option value="over10">Trên 10 năm</option>
                            </select>
                          </div>

                          {/* Reset Button */}
                          <Button
                            onClick={() => setFilters({ province: "", specialty: "", costRange: "all", experience: "all" })}
                            variant="outline"
                            className="w-full"
                          >
                            Xóa bộ lọc
                          </Button>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {filteredDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg border-2 shadow-md 
                        ${
                          selectedDoctor === doctor.id ? "border-[#16a1bd] bg-[#e5f5f8]" : "border-transparent bg-white"
                        }`}
                      onClick={() => setSelectedDoctor(doctor.id)}
                    >
                      {/* Doctor Name & Rating */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback className="bg-[#16a1bd] text-white">{doctor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                              {doctor.name}
                            </h3>
                            <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-base text-gray-700 font-medium whitespace-nowrap">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span>
                            {doctor.rating} ({doctor.reviews})
                          </span>
                        </div>
                      </div>

                      {/* Clinic & Cost Info */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#16a1bd] flex-shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 leading-none">Province</p>
                            <span className="font-medium">{doctor.clinic}</span>
                          </div>
                        </div>

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
                            <p className="text-sm text-gray-500 leading-none">Cost from (đ)</p>
                            <span className="font-bold text-gray-900">{doctor.cost}</span>
                          </div>
                        </div>
                      </div>

                      {/* Available Times */}
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Available Today</p>
                        <div className="flex flex-wrap gap-2">
                          {doctor.availableTimes.map((time) => (
                            <button
                              key={time}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTime((prev) => ({
                                  ...prev,
                                  [doctor.id]: time,
                                }))
                                setSelectedDoctor(doctor.id)
                              }}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                selectedTime[doctor.id] === time
                                  ? "bg-[#16a1bd] text-white"
                                  : "bg-blue-50 text-[#16a1bd] hover:bg-blue-100"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="glass border-white/50 shadow-soft bg-transparent">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="glass border-white/50 shadow-soft bg-transparent">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600">Page 1 of 100</span>
                  </div>
                  <Button
                    onClick={handleNextStep}
                    disabled={!selectedDoctor || !selectedTime[selectedDoctor || ""]}
                    className="bg-[#16a1bd] hover:bg-[#0d6171] text-white shadow-soft hover:shadow-soft-md transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : currentStep === 2 ? (
              // STEP 2: Details Form
              <div className="mb-8">
                <div className="space-y-6">
                  {/* Who needs a visit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Who needs a visit?... <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.whoNeedsVisit}
                      onChange={(e) => handleFormChange("whoNeedsVisit", e.target.value)}
                      className="w-full px-4 py-3 border border-cyan-200 rounded-lg focus:outline-none focus:border-[#16a1bd] bg-white"
                    >
                      <option value="">Select option</option>
                      <option value="myself">For myself</option>
                      <option value="family">For family member</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Date and Visiting Hours */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 border border-cyan-200 rounded-lg focus:outline-none focus:border-[#16a1bd]"
                        placeholder="DD/MM/YYYY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Visiting Hours <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={selectedDoctor ? selectedTime[selectedDoctor] || "" : ""}
                        readOnly
                        className="w-full px-4 py-3 border border-cyan-200 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Appointment Reason */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      What is the reason for the appointment? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.appointmentReason}
                      onChange={(e) => handleFormChange("appointmentReason", e.target.value)}
                      className="w-full px-4 py-3 border border-cyan-200 rounded-lg focus:outline-none focus:border-[#16a1bd]"
                    />
                  </div>

                  {/* Describe Details */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Describe details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.appointmentDetails}
                      onChange={(e) => handleFormChange("appointmentDetails", e.target.value)}
                      className="w-full px-4 py-3 border border-cyan-200 rounded-lg focus:outline-none focus:border-[#16a1bd] resize-none"
                      rows={4}
                    />
                  </div>

                  {/* When did you start feeling the symptoms */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      When did you start feeling the symptoms? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.symptomStartDate}
                      onChange={(e) => handleFormChange("symptomStartDate", e.target.value)}
                      className="w-full px-4 py-3 border border-cyan-200 rounded-lg focus:outline-none focus:border-[#16a1bd]"
                    />
                  </div>

                  {/* How severe are the symptoms */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      How severe are the symptoms? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.symptomSeverity}
                      onChange={(e) => handleFormChange("symptomSeverity", e.target.value)}
                      className="w-full px-4 py-3 border border-cyan-200 rounded-lg focus:outline-none focus:border-[#16a1bd]"
                    />
                  </div>

                  {/* Have you taken any medication */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Have you taken any medication? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.medication}
                      onChange={(e) => handleFormChange("medication", e.target.value)}
                      className="w-full px-4 py-3 border border-cyan-200 rounded-lg focus:outline-none focus:border-[#16a1bd]"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Do you have any documents to share? <span className="text-red-500">*</span>
                    </label>
                    <label className="w-full px-4 py-3 border border-cyan-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between">
                      <span className="text-gray-600">{fileName}</span>
                      <Upload className="w-4 h-4 text-[#16a1bd]" />
                      <input type="file" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>

                  {/* Agree to share checkbox */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={formData.agreeToShare}
                      onChange={(e) => handleFormChange("agreeToShare", e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#16a1bd] cursor-pointer mt-1"
                    />
                    <label htmlFor="agree" className="text-sm text-gray-700 cursor-pointer">
                      I agree to share my medical data with the Doctor / Clinic
                    </label>
                  </div>

                  {/* Navigation Buttons */}
                  <div className=" bottom-4 left-0 right-0 bg-white border-t-2 border-cyan-200 p-5 pb-8 -mx-3 mt-10 shadow-2xl z-50 rounded-t-3xl">
                    <div className="flex gap-6 justify-center max-w-2xl mx-auto">
                      <Button 
                        onClick={handlePreviousStep}
                        variant="outline"
                        className="px-12 py-4 text-lg font-bold border-2 border-[#16a1bd] text-[#16a1bd] hover:bg-[#16a1bd] hover:text-white transition-all rounded-xl"
                      >
                        ← Back
                      </Button>
                      <Button
                        onClick={handleNextStep}
                        disabled={!selectedDate || !selectedTime[selectedDoctor!]}
                        className="px-12 py-4 text-lg font-bold bg-[#16a1bd] hover:bg-[#0d6171] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all **rounded-xl**"                      >
                        Next →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // STEP 3: Confirm Appointment
              <div className="mb-8">
                <div className="space-y-6">
                  {/* Appointment Summary Card */}
                  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-6 flex items-start justify-between border border-cyan-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#16a1bd] rounded-full flex items-center justify-center text-white">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">You're booking an</p>
                        <p className="text-lg font-semibold text-gray-900">Online Appointment</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">30 min</p>
                      <p className="text-base font-bold text-red-600">
                        {selectedDate || "Date not selected"},{" "}
                        {selectedDoctor ? selectedTime[selectedDoctor] || "Time not selected" : "Time not selected"}
                      </p>
                    </div>
                  </div>

                  {/* Patient Section */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-4">Patient</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback className="bg-blue-100 text-[#16a1bd]">NT</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">Nguyen Van Tung</p>
                        <p className="text-sm text-gray-500">PA0010 · Cardiovascular</p>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Section */}
                  {selectedDoctorData && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 mb-4">Doctor</p>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback className="bg-[#16a1bd] text-white">
                              {selectedDoctorData.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">{selectedDoctorData.name}</p>
                            <p className="text-sm text-gray-500">{selectedDoctorData.specialty}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-[#16a1bd]">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Clinic</p>
                            <p className="font-semibold text-gray-900 text-sm">{selectedDoctorData.workplace_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-[#16a1bd]">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Province</p>
                            <p className="font-semibold text-gray-900 text-sm">{selectedDoctorData.province}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Details Section with Reasons */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-4">Details</p>
                    <div className="space-y-3">
                      {[
                        { icon: "❓", title: "Reason", value: formData.appointmentReason || "Trống" },
                        { icon: "⚕️", title: "Reason", value: formData.appointmentDetails || "Trống" },
                        {
                          icon: "⚙️",
                          title: "Reason",
                          value: formData.symptomStartDate || "Trống",
                        },
                        { icon: "🔧", title: "Reason", value: formData.symptomSeverity || "Trống" },
                        { icon: "📊", title: "Reason", value: formData.medication || "None" },
                      ].map((item, index) => (
                        <div key={index} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[#16a1bd] flex-shrink-0">
                            <div className="w-3 h-3 rounded-full bg-[#16a1bd]"></div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Promotion Code */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-4">Promotion Code</p>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Code"
                        className="flex-1 px-4 py-2 border border-cyan-200 rounded-lg focus:outline-none focus:border-[#16a1bd]"
                      />
                      <Button className="bg-[#16a1bd] hover:bg-[#0d6171] text-white px-6 rounded-full font-semibold">
                        Ap...
                      </Button>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                        <span className="text-gray-700 font-medium">Appointment fee</span>
                        <span className="font-semibold text-gray-900">572,250 đ</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium">Application fee</span>
                          <svg
                            className="w-4 h-4 text-gray-400 cursor-help"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-900">572,250 đ</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                        <span className="text-gray-700 font-medium">Discount</span>
                        <span className="font-semibold text-gray-900">572,250 đ</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                        <span className="text-gray-700 font-medium">Tax included, where applicable</span>
                        <span className="font-semibold text-gray-900">572,250 đ</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-900 font-bold">Total cost</span>
                        <span className="text-lg font-bold text-red-600">572,250 đ</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-4">Payment method</p>
                    <div className="space-y-3">
                      {[
                        { id: "momo", label: "MOMO", icon: "💳" },
                        { id: "vnpay", label: "VNPAY", icon: "💳" },
                        { id: "google", label: "GOOGLE PAY", icon: "🔵" },
                        { id: "cash", label: "CASH AFTER VISIT", icon: "💵" },
                      ].map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{method.icon}</span>
                            <span className="font-medium text-gray-900">{method.label}</span>
                          </div>
                          <input type="radio" name="payment" className="w-5 h-5 cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200">
                    <input
                      type="checkbox"
                      id="confirm-terms"
                      className="w-5 h-5 rounded border-gray-300 text-[#16a1bd] cursor-pointer mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="confirm-terms" className="text-sm text-gray-700 cursor-pointer">
                      I confirm{" "}
                      <Link href="#" className="text-[#16a1bd] hover:underline font-semibold">
                        Privacy Policy and Term of Use
                      </Link>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center pt-4">
                    <Button
                      onClick={handlePreviousStep}
                      variant="outline"
                      className="px-8 py-3 bg-transparent border border-gray-300"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleConfirmAppointment}
                      className="px-16 py-3 bg-gray-300 hover:bg-gray-400 text-gray-500 rounded-full font-semibold cursor-not-allowed"
                      disabled
                    >
                      Confirm And Pay
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Doctor Details */}
          <div className="w-80 h-full bg-white border-l border-gray-200 p-6 rounded-2xl overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none]">
            {selectedDoctorData && (
              <div>
                <div className="text-center mb-6">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-[#16a1bd] text-white text-lg">
                      {selectedDoctorData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{selectedDoctorData.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{selectedDoctorData.specialty}</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">
                      {selectedDoctorData.rating} ({selectedDoctorData.reviews})
                    </span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-4 h-4 text-[#16a1bd]" />
                    </div>
                    <p className="text-xs text-gray-600">Experience</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedDoctorData.experience}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Users className="w-4 h-4 text-[#16a1bd]" />
                    </div>
                    <p className="text-xs text-gray-600">Consultations</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedDoctorData.consultations}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <DollarSign className="w-4 h-4 text-[#16a1bd]" />
                    </div>
                    <p className="text-xs text-gray-600">Cost</p>
                    <p className="text-sm font-semibold text-gray-900">890,000đ</p>
                  </div>
                </div>

                {/* Treatment Conditions */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Treatment of conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctorData.conditions.map((condition) => (
                      <Badge
                        key={condition}
                        variant="outline"
                        className="rounded-full border-[#16a1bd] text-[#16a1bd] hover:bg-blue-50 text-xs"
                      >
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Experience and Certificates */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Experience and certificates</h3>
                  <div className="space-y-4">
                    {selectedDoctorData.certificates.map((cert, index) => (
                      <div key={index} className="flex gap-3">
                        <div
                          className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${index === 0 ? "bg-[#16a1bd]" : "bg-blue-200"}`}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{cert.year}</p>
                          <p className="text-sm text-gray-500">{cert.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

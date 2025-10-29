"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Bell, ChevronLeft, User, Settings, Calendar, MapPin, Activity, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DoctorSidebar from "@/components/doctor-sidebar"
import MedicalReportTab from "@/components/medical-report-tab"

interface AppointmentDetailPageProps {
  params: {
    id: string
  }
}

// Sample appointment data
const APPOINTMENT_DATA = {
  id: "94",
  title: "Sale Demo",
  date: "Tuesday, 14 October",
  time: "03:00 - 03:30",
  status: "upcoming",
  tags: ["Up Upcoming", "At Clinic"],
  doctor: {
    name: "Lê Thị Tuyết Hoa",
    gender: "Female",
  },
  patient: {
    name: "Nguyễn Văn Nam",
    gender: "Male",
    id: "9223456435",
    dateOfBirth: "29-07-2025",
    address: "Đường số 1, An Bìen, An Giang, Vietnam",
    height: "189 cm",
    weight: "67 kg",
    bloodType: "B+",
    bmi: "22 kg/m²",
    chronicConditions: ["HYPERTENSION", "ARTHRITIS", "ASTHMA", "DIABETES", "CARDIOVASCULAR DISEASE"],
  },
  details: {
    reason: "test",
    symptomsOnset: "test",
    symptomsSeverity: "test",
    medicationsBeingUsed: "test",
  },
}

export default function AppointmentDetailPage({ params }: AppointmentDetailPageProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeTab, setActiveTab] = useState("appointment-details")

  const notifications = [
    {
      title: "tracto-curia-sunt",
      message: "Terebro taedium alius debitis concedo velit acervus.",
      time: "15 min ago",
    },
    {
      title: "decet-at-tubineus",
      message: "Basium cilicium at odit tenetur coma thalassinus quia derelinquo voluptatem.",
      time: "15 min ago",
    },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <DoctorSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="glass border-b border-white/50 px-6 py-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/calendar">
                <Button variant="ghost" size="icon" className="hover:bg-white/50">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl shadow-soft-md">
                <div className="w-5 h-5 gradient-primary rounded-lg flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                </div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-[#16a1bd] to-[#0d6171] bg-clip-text text-transparent">
                  Appointment #{APPOINTMENT_DATA.id}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search..."
                  className="pl-12 w-80 glass border-white/50 hover:bg-white transition-all"
                />
              </div>

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
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl hover:bg-white/50 transition-smooth"
                  >
                    <Avatar className="w-9 h-9 ring-2 ring-white shadow-soft">
                      <AvatarImage src="/clean-female-doctor.png" />
                      <AvatarFallback className="gradient-primary text-white font-semibold">LH</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                      <p className="text-sm font-semibold text-gray-700">Lê Thị Tuyết Hoa</p>
                      <p className="text-xs text-gray-500">Doctor</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-white/50 shadow-soft-lg">
                  <div className="px-3 py-3 border-b border-white/50">
                    <p className="font-semibold text-gray-900">Lê Thị Tuyết Hoa</p>
                    <p className="text-xs text-gray-500 font-medium">Doctor</p>
                  </div>
                  <Link href="/my-profile">
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

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Appointment Details (2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm">
              {/* Status Tags */}
              <div className="flex gap-2 mb-6">
                {APPOINTMENT_DATA.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className={`${
                      tag.includes("Upcoming") ? "bg-cyan-100 text-cyan-700" : "bg-green-100 text-green-700"
                    } rounded-full px-4 py-1.5 text-sm font-medium`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Appointment Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{APPOINTMENT_DATA.title}</h2>
              <p className="text-gray-600 mb-6">
                {APPOINTMENT_DATA.date} • {APPOINTMENT_DATA.time}
              </p>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent border-b border-gray-300 rounded-none h-auto p-0 mb-6">
                  <TabsTrigger
                    value="appointment-details"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none px-6 pb-3 font-medium"
                  >
                    Appointment Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="medical-report"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none px-6 pb-3 font-medium"
                  >
                    Medical Report
                  </TabsTrigger>
                  <TabsTrigger
                    value="appointment"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none px-6 pb-3 font-medium"
                  >
                    Appointment
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="appointment-details" className="mt-0">
                  <div className="space-y-6">
                    {/* Patient Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient</h3>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gray-300 text-gray-600 font-bold">
                            {APPOINTMENT_DATA.patient.name.split(" ")[0][0]}
                            {APPOINTMENT_DATA.patient.name.split(" ")[1][0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">{APPOINTMENT_DATA.patient.name}</p>
                          <p className="text-sm text-gray-600">{APPOINTMENT_DATA.patient.gender}</p>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor</h3>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gray-300 text-gray-600 font-bold">
                            {APPOINTMENT_DATA.doctor.name.split(" ")[0][0]}
                            {APPOINTMENT_DATA.doctor.name.split(" ")[1][0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">{APPOINTMENT_DATA.doctor.name}</p>
                          <p className="text-sm text-gray-600">{APPOINTMENT_DATA.doctor.gender}</p>
                        </div>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                              <svg
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-4 text-teal-600"
                              >
                                <path
                                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            Reason
                          </label>
                          <p className="text-gray-900 font-medium">{APPOINTMENT_DATA.details.reason}</p>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                              <svg
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-4 text-teal-600"
                              >
                                <path
                                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            Symptoms onset
                          </label>
                          <p className="text-gray-900 font-medium">{APPOINTMENT_DATA.details.symptomsOnset}</p>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                              <svg
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-4 text-teal-600"
                              >
                                <path
                                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            Symptoms severity
                          </label>
                          <p className="text-gray-900 font-medium">{APPOINTMENT_DATA.details.symptomsSeverity}</p>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                              <svg
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-4 text-teal-600"
                              >
                                <path
                                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            Medications being used
                          </label>
                          <p className="text-gray-900 font-medium">{APPOINTMENT_DATA.details.medicationsBeingUsed}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="medical-report" className="mt-0">
                  <MedicalReportTab />
                </TabsContent>

                <TabsContent value="appointment" className="mt-0">
                  <div className="text-center py-12">
                    <p className="text-gray-500">Appointment details</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Patient Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Patient Header */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xl font-bold">
                        {APPOINTMENT_DATA.patient.name.split(" ")[0][0]}
                        {APPOINTMENT_DATA.patient.name.split(" ")[1][0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{APPOINTMENT_DATA.patient.name}</h3>
                      <p className="text-sm text-gray-500">{APPOINTMENT_DATA.patient.gender}</p>
                    </div>
                  </div>
                  <Link href={`/patient/${APPOINTMENT_DATA.patient.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Button className="gradient-primary text-white rounded-full px-4 py-2 text-sm">
                      Go to patient profile
                    </Button>
                  </Link>
                </div>

                {/* Personal Info */}
                <div className="py-6 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Personal info</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="rounded-full bg-[#e5f5f8] flex items-center justify-center h-10 w-10">
                        <svg
                          width="1em"
                          height="1em"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="size-5 text-[#128197]"
                        >
                          <path
                            d="M18.8719 3.81324C18.871 3.80435 18.8693 3.79573 18.8681 3.78696C18.8665 3.77555 18.8651 3.76411 18.8629 3.75278C18.8608 3.74255 18.858 3.7326 18.8555 3.72253C18.8531 3.71284 18.8509 3.70311 18.848 3.6935C18.845 3.68362 18.8413 3.67408 18.8378 3.66439C18.8344 3.65482 18.8313 3.64516 18.8274 3.63574C18.8236 3.62674 18.8192 3.61812 18.8151 3.60931C18.8105 3.59962 18.8062 3.58985 18.8011 3.58035C18.7966 3.57192 18.7915 3.56395 18.7866 3.55575C18.781 3.54644 18.7758 3.53698 18.7697 3.5279C18.7637 3.51905 18.7571 3.5107 18.7508 3.50219C18.7449 3.49437 18.7395 3.48636 18.7332 3.47873C18.7214 3.46427 18.7087 3.45046 18.6956 3.43711C18.6943 3.43578 18.6932 3.43433 18.6919 3.43303C18.6904 3.4315 18.6887 3.43028 18.6872 3.42876C18.6741 3.41587 18.6605 3.40343 18.6462 3.39172C18.6388 3.38565 18.6311 3.38039 18.6235 3.37474C18.6147 3.36818 18.6061 3.36139 18.597 3.35529C18.5882 3.34941 18.5791 3.3443 18.5701 3.33892C18.5616 3.33385 18.5533 3.32851 18.5445 3.32378C18.5355 3.31897 18.5263 3.31493 18.5171 3.31058C18.5078 3.30615 18.4986 3.3015 18.489 3.29753C18.4803 3.29395 18.4715 3.29109 18.4627 3.28792C18.4522 3.28411 18.4418 3.28014 18.4311 3.27686C18.4226 3.27434 18.414 3.27247 18.4055 3.2703C18.3943 3.26744 18.3832 3.26431 18.3718 3.26206C18.3623 3.26019 18.3528 3.25916 18.3433 3.25771C18.3326 3.25611 18.3221 3.25416 18.3113 3.25309C18.2955 3.25157 18.2797 3.25107 18.2638 3.25069C18.2592 3.25061 18.2547 3.25 18.25 3.25H15.125C14.9592 3.25 14.8003 3.31585 14.6831 3.43306C14.5658 3.55027 14.5 3.70924 14.5 3.875C14.5 4.04076 14.5658 4.19973 14.6831 4.31694C14.8003 4.43415 14.9592 4.5 15.125 4.5H16.7411L14.8322 6.40887C14.2026 5.86831 13.455 5.48283 12.6494 5.28336C11.8439 5.08389 11.0028 5.07599 10.1937 5.26028C9.38454 5.44457 8.62984 5.81593 7.99014 6.34456C7.35044 6.8732 6.84352 7.5444 6.51007 8.30433C6.17662 9.06426 6.02778 9.89314 6.07778 10.7218C6.12778 11.5505 6.37389 12.3545 6.79639 13.0733C7.21889 13.7921 7.80389 14.4011 8.50639 14.8533C9.20889 15.3055 10.0051 15.5883 10.8276 15.6783C11.6501 15.7683 12.4801 15.6627 13.2551 15.3708C14.0301 15.0789 14.7226 14.6108 15.2876 14.0033L17.1964 15.9122C17.3136 16.0294 17.4725 16.0952 17.6383 16.0952C17.8041 16.0952 17.963 16.0294 18.0802 15.9122C18.1974 15.795 18.2632 15.6361 18.2632 15.4703C18.2632 15.3045 18.1974 15.1456 18.0802 15.0284L16.1714 13.1195C16.7789 12.3445 17.247 11.4521 17.539 10.4971C17.831 9.54206 17.9366 8.53706 17.8466 7.54456C17.7566 6.55206 17.4738 5.59581 17.0216 4.74331C16.5694 3.89081 15.9604 3.15831 15.2416 2.59081C14.5228 2.02331 13.7188 1.63706 12.8901 1.45581C12.0614 1.27456 11.2051 1.30706 10.3876 1.55206C9.57014 1.79706 8.82764 2.24706 8.21889 2.85581C7.61014 3.46456 7.16014 4.20706 6.91514 5.02456C6.67014 5.84206 6.63764 6.69831 6.81889 7.52706C6.99389 8.29206 7.35639 9.00706 7.87764 9.61581L5.96889 11.5246C5.85169 11.6418 5.78589 11.8007 5.78589 11.9665C5.78589 12.1323 5.85169 12.2912 5.96889 12.4084C6.08609 12.5256 6.24495 12.5914 6.41076 12.5914C6.57657 12.5914 6.73543 12.5256 6.85264 12.4084L8.76139 10.4996C9.53639 11.1071 10.4288 11.5752 11.3838 11.8671C12.3388 12.1591 13.3438 12.2646 14.3363 12.1746C15.3288 12.0846 16.2851 11.8021 17.1376 11.3496C17.9901 10.8971 18.7226 10.2881 19.2901 9.56906C19.8576 8.85006 20.2438 8.04606 20.4251 7.21831C20.6063 6.39056 20.5738 5.53456 20.3288 4.71706C20.0838 3.89956 19.6338 3.15706 19.0263 2.54831C18.4188 1.93956 17.6763 1.48956 16.8588 1.24456C16.0413 0.999562 15.1851 0.967062 14.3563 1.14831Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Gender</p>
                        <p className="text-sm font-medium text-gray-900">{APPOINTMENT_DATA.patient.gender}</p>
                      </div>
                      <div className="rounded-full bg-[#e5f5f8] flex items-center justify-center h-10 w-10">
                        <svg
                          width="1em"
                          height="1em"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="size-5 text-[#128197]"
                        >
                          <path
                            d="M8.83537 15.7924C9.29881 15.4358 9.86841 15.2449 10.4531 15.2501H13.5469C14.1262 15.2501 14.7101 15.4301 15.1646 15.7924C15.6259 16.158 15.9375 16.7002 15.9375 17.3212V17.7814C15.9375 18.0051 15.8486 18.2197 15.6904 18.378C15.5321 18.5362 15.3175 18.6251 15.0938 18.6251C14.87 18.6251 14.6554 18.5362 14.4971 18.378C14.3389 18.2197 14.25 18.0051 14.25 17.7814V17.3201C14.25 17.2909 14.2365 17.2099 14.1161 17.1142C13.9508 16.9946 13.7508 16.9325 13.5469 16.9376H10.4531C10.2492 16.9325 10.0492 16.9946 9.88387 17.1142C9.7635 17.2099 9.75 17.2909 9.75 17.3212V17.7814C9.75 18.0051 9.66111 18.2197 9.50287 18.378C9.34464 18.5362 9.13003 18.6251 8.90625 18.6251C8.68247 18.6251 8.46786 18.5362 8.30963 18.378C8.15139 18.2197 8.0625 18.0051 8.0625 17.7814V17.3201C8.0625 16.7014 8.37412 16.158 8.83537 15.7924Z"
                            fill="currentColor"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 9.0625C11.2541 9.0625 10.5387 9.35882 10.0113 9.88626C9.48382 10.4137 9.1875 11.1291 9.1875 11.875C9.1875 12.6209 9.48382 13.3363 10.0113 13.8637C10.5387 14.3912 11.2541 14.6875 12 14.6875C12.7459 14.6875 13.4613 14.3912 13.9887 13.8637C14.5162 13.3363 14.8125 12.6209 14.8125 11.875C14.8125 11.1291 14.5162 10.4137 13.9887 9.88626C13.4613 9.35882 12.7459 9.0625 12 9.0625ZM10.875 11.875C10.875 11.5766 10.9935 11.2905 11.2045 11.0795C11.4155 10.8685 11.7016 10.75 12 10.75C12.2984 10.75 12.5845 10.8685 12.7955 11.0795C13.0065 11.2905 13.125 11.5766 13.125 11.875C13.125 12.1734 13.0065 12.4595 12.7955 12.6705C12.5845 12.8815 12.2984 13 12 13C11.7016 13 11.4155 12.8815 11.2045 12.6705C10.9935 12.4595 10.875 12.1734 10.875 11.875Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">ID</p>
                        <p className="text-sm font-medium text-gray-900">{APPOINTMENT_DATA.patient.id}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Date of birth</p>
                        <p className="text-sm font-medium text-gray-900">{APPOINTMENT_DATA.patient.dateOfBirth}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-900">{APPOINTMENT_DATA.patient.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Info */}
                <div className="py-6 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Medical info</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Height</p>
                        <p className="text-sm font-medium text-gray-900">{APPOINTMENT_DATA.patient.height}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Weight</p>
                        <p className="text-sm font-medium text-gray-900">{APPOINTMENT_DATA.patient.weight}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Droplets className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Blood type</p>
                        <p className="text-sm font-medium text-gray-900">{APPOINTMENT_DATA.patient.bloodType}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">BMI</p>
                        <p className="text-sm font-medium text-gray-900">{APPOINTMENT_DATA.patient.bmi}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="py-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Chronic conditions</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {APPOINTMENT_DATA.patient.chronicConditions.map((condition, index) => (
                      <Badge
                        key={index}
                        className="bg-teal-100 text-teal-800 hover:bg-teal-100 rounded-full px-4 py-1.5 text-sm font-medium"
                      >
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

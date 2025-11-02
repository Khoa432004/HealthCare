"use client"

import { useState } from "react"
import {
  Search,
  Bell,
  User,
  Calendar,
  MapPin,
  Activity,
  Droplets,
  UserCheck,
  Menu,
  Home,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddChronicModal } from "@/components/add-chronic-modal"
import { AddAllergiesModal } from "@/components/add-allergies-modal"
import { PatientSidebar } from "@/components/patient-sidebar"
function PatientProfileContent() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [showChronicModal, setShowChronicModal] = useState(false)
  const [showAllergiesModal, setShowAllergiesModal] = useState(false)
  const [chronicConditions, setChronicConditions] = useState<string[]>(["HYPERTENSION"])
  const [allergies, setAllergies] = useState<string[]>(["EGGS", "MILK", "PEANUTS"])

  const notifications = [
    {
      title: "Profile Update",
      message: "Your profile has been successfully updated.",
      time: "2 hours ago",
    },
    {
      title: "Medical Record",
      message: "New medical record has been added to your profile.",
      time: "1 day ago",
    },
  ]

  return (
        <div className="flex h-screen" style={{ backgroundColor: '#e5f5f8' }}>
      <PatientSidebar />
    <div className="min-h-screen flex" style={{ backgroundColor: "#e5f5f8" }}>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 px-6 py-4 shadow-soft">
          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl shadow-soft-md">
                <div className="w-5 h-5 gradient-primary rounded-lg flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-[#16a1bd]">My Profile</h1>
              </div>  
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search..."
                  className="pl-12 w-80 bg-white border-gray-200 rounded-full focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Notifications */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative bg-gradient-to-br from-teal-500 to-cyan-600 text-white hover:opacity-90 rounded-full"
                  >
                    <Bell className="w-5 h-5" />
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
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

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 bg-white/50 px-4 py-2 rounded-full hover:bg-white/80"
                  >
                    <Avatar className="w-9 h-9 ring-2 ring-white">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-semibold">
                        TE
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">TE</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-3 border-b">
                    <p className="font-semibold text-gray-900">Test stag patient</p>
                    <p className="text-xs text-gray-500">Patient</p>
                  </div>
                  <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2">
                    <User className="w-4 h-4 text-teal-600" />
                    <span className="font-medium">My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 text-red-600">
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-transparent border-b border-gray-300 rounded-none h-auto p-0">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none px-6 pb-3 font-medium"
                >
                  Personal
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none px-6 pb-3 font-medium"
                >
                  My Orders
                </TabsTrigger>
              </TabsList>

              <Button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`${
                  isEditMode
                    ? "bg-gray-500 hover:bg-gray-600"
                    : "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                } text-white rounded-full px-6`}
              >
                {isEditMode ? "Cancel" : "Edit"}
              </Button>
            </div>

            <TabsContent value="personal" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Form (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm">
                  {/* CONTAINER CHÍNH: Flex ngang cho Avatar và Form */}
                  <div className="flex gap-8">
                    
                    {/* === KHỐI 1: AVATAR LỚN (Fixed size) === */}
                    <div className="flex-shrink-0 pt-1">
                      <Avatar className="w-32 h-32">
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-3xl font-bold">TE</AvatarFallback>
                      </Avatar>
                    </div>

                    {/* === KHỐI 2: CÁC TRƯỜNG NHẬP LIỆU (Flex-1) === */}
                    <div className="flex-1">
                      
                      {/* Hàng 1: Full name & Company (2 cột) */}
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                          <Input
                            defaultValue="Test stag patient"
                            className="border-gray-300 rounded-lg"
                            disabled={!isEditMode}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                          <Input placeholder="" className="border-gray-300 rounded-lg" disabled={!isEditMode} />
                        </div>
                      </div>

                      {/* Hàng 2: Gender & Identification number (2 cột) */}
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                          <Select defaultValue="male" disabled={!isEditMode}>
                            <SelectTrigger className="border-gray-300 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Identification number</label>
                          <Input defaultValue="4657657657" className="border-gray-300 rounded-lg" disabled={!isEditMode} />
                        </div>
                      </div>
                  
                      
                    </div>
                  </div>
                  {/* Hàng 3: Date of birth, Phone, Marital, Ethnicity (4 cột) */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {/* Date of birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of birth</label>
                      <div className="relative">
                        <Input
                          type="text"
                          defaultValue="27-06-1988"
                          className="border-gray-300 rounded-lg"
                          disabled={!isEditMode}
                        />
                        {/* Icon Calendar */}
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Phone number */}
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                      <div className="flex space-x-2">
                        <Select defaultValue="+84" disabled={!isEditMode}>
                          <SelectTrigger className="w-20 border-gray-300 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="vietnam">
                              <div className="flex items-center space-x-2">
                                <img
                                  src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/vn.svg"
                                  alt="Vietnam Flag"
                                  className="w-5 h-4 rounded-sm shadow-sm"
                                />
                                <span>Vietnam</span>
                              </div>
                            </SelectItem>

                            <SelectItem value="usa">
                              <div className="flex items-center space-x-2">
                                <img
                                  src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/us.svg"
                                  alt="USA Flag"
                                  className="w-5 h-4 rounded-sm shadow-sm"
                                />
                                <span>United States</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          defaultValue="9434545"
                          className="flex-1 border-gray-300 rounded-lg"
                          disabled={!isEditMode}
                        />
                      </div>
                    </div>
                    
                    {/* Marital status */}
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marital status</label>
                      <Select defaultValue="prefer-not-to-say" disabled={!isEditMode}>
                        <SelectTrigger className="border-gray-300 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Ethnicity */}
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ethnicity</label>
                      <Input defaultValue="Kinh" className="border-gray-300 rounded-lg" disabled={!isEditMode} />
                    </div>
                  </div>
                  {/* Hàng 4: Email (Chiếm toàn bộ chiều ngang form) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      defaultValue="test.patient@gmail.com"
                      className="border-gray-300 rounded-lg"
                      disabled={!isEditMode}
                    />
                  </div>

                  {/* Khu vực Address */}
                  <div className="mt-8">
                    <h4 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-3">Address</h4>

                    {/* Hàng 5: Country, State, District, Zip (4 cột) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <Select defaultValue="vietnam" disabled={!isEditMode}>
                          <SelectTrigger className="border-gray-300 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vietnam">Vietnam</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State / Province</label>
                        <Select defaultValue="ho-chi-minh" disabled={!isEditMode}>
                          <SelectTrigger className="border-gray-300 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ho-chi-minh">Ho Chi Minh</SelectItem>
                            <SelectItem value="hanoi">Hanoi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">District / Ward</label>
                        <Select defaultValue="an-dong" disabled={!isEditMode}>
                          <SelectTrigger className="border-gray-300 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="an-dong">An Dong</SelectItem>
                            <SelectItem value="district-1">District 1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Zip / Postal Code</label>
                        <Input placeholder="" className="border-gray-300 rounded-lg" disabled={!isEditMode} />
                      </div>
                    </div>

                    {/* Hàng 6: Address Line 1 & 2 (2 cột) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                        <Input defaultValue="Street 1" className="border-gray-300 rounded-lg" disabled={!isEditMode} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                        <Input placeholder="" className="border-gray-300 rounded-lg" disabled={!isEditMode} />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    {/* Patient Header */}
                    <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xl font-bold">TE</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">Test stag patient</h3>
                        <p className="text-sm text-gray-500">Male</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-teal-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </Button>
                    </div>

                    {/* Personal Info */}
                    <div className="py-6 border-b border-gray-100">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Personal info</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className ="rounded-full bg-[#e5f5f8] flex items-center justify-center h-10 w-10 max-w-10 undefined">
                            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className ="size-5 text-[#128197]"><path d="M18.8719 3.81324C18.871 3.80435 18.8693 3.79573 18.8681 3.78696C18.8665 3.77555 18.8651 3.76411 18.8629 3.75278C18.8608 3.74255 18.858 3.7326 18.8555 3.72253C18.8531 3.71284 18.8509 3.70311 18.848 3.6935C18.845 3.68362 18.8413 3.67408 18.8378 3.66439C18.8344 3.65482 18.8313 3.64516 18.8274 3.63574C18.8236 3.62674 18.8192 3.61812 18.8151 3.60931C18.8105 3.59962 18.8062 3.58985 18.8011 3.58035C18.7966 3.57192 18.7915 3.56395 18.7866 3.55575C18.781 3.54644 18.7758 3.53698 18.7697 3.5279C18.7637 3.51905 18.7571 3.5107 18.7508 3.50219C18.7449 3.49437 18.7395 3.48636 18.7332 3.47873C18.7214 3.46427 18.7087 3.45046 18.6956 3.43711C18.6943 3.43578 18.6932 3.43433 18.6919 3.43303C18.6904 3.4315 18.6887 3.43028 18.6872 3.42876C18.6741 3.41587 18.6605 3.40343 18.6462 3.39172C18.6388 3.38565 18.6311 3.38039 18.6235 3.37474C18.6147 3.36818 18.6061 3.36139 18.597 3.35529C18.5882 3.34941 18.5791 3.3443 18.5701 3.33892C18.5616 3.33385 18.5533 3.32851 18.5445 3.32378C18.5355 3.31897 18.5263 3.31493 18.5171 3.31058C18.5078 3.30615 18.4986 3.3015 18.489 3.29753C18.4803 3.29395 18.4715 3.29109 18.4627 3.28792C18.4522 3.28411 18.4418 3.28014 18.4311 3.27686C18.4226 3.27434 18.414 3.27247 18.4055 3.2703C18.3943 3.26744 18.3832 3.26431 18.3718 3.26206C18.3623 3.26019 18.3528 3.25916 18.3433 3.25771C18.3326 3.25611 18.3221 3.25416 18.3113 3.25309C18.2955 3.25157 18.2797 3.25107 18.2638 3.25069C18.2592 3.25061 18.2547 3.25 18.25 3.25H15.125C14.9592 3.25 14.8003 3.31585 14.6831 3.43306C14.5658 3.55027 14.5 3.70924 14.5 3.875C14.5 4.04076 14.5658 4.19973 14.6831 4.31694C14.8003 4.43415 14.9592 4.5 15.125 4.5H16.7411L14.8322 6.40887C14.2026 5.86831 13.455 5.48283 12.6494 5.28336C11.8439 5.08389 11.0028 5.07599 10.1937 5.26028C9.38454 5.44457 8.62984 5.81593 7.99014 6.34456C7.35044 6.8732 6.84352 7.5444 6.51007 8.30433C6.17662 9.06425 6.0259 9.89175 6.07001 10.7204C6.11412 11.5491 6.35183 12.356 6.76407 13.0762C7.1763 13.7964 7.7516 14.41 8.44381 14.8678C9.13602 15.3255 9.92587 15.6146 10.75 15.712V17.3125H8.875C8.70924 17.3125 8.55027 17.3783 8.43306 17.4956C8.31585 17.6128 8.25 17.7717 8.25 17.9375C8.25 18.1033 8.31585 18.2622 8.43306 18.3794C8.55027 18.4967 8.70924 18.5625 8.875 18.5625H10.75V20.125C10.75 20.2908 10.8158 20.4497 10.9331 20.5669C11.0503 20.6842 11.2092 20.75 11.375 20.75C11.5408 20.75 11.6997 20.6842 11.8169 20.5669C11.9342 20.4497 12 20.2908 12 20.125V18.5625H13.875C14.0408 18.5625 14.1997 18.4967 14.3169 18.3794C14.4342 18.2622 14.5 18.1033 14.5 17.9375C14.5 17.7717 14.4342 17.6128 14.3169 17.4956C14.1997 17.3783 14.0408 17.3125 13.875 17.3125H12V15.712C12.9189 15.604 13.7937 15.2576 14.5374 14.7072C15.2812 14.1568 15.8681 13.4215 16.24 12.5743C16.6119 11.7271 16.7558 10.7973 16.6575 9.87729C16.5591 8.95727 16.222 8.07895 15.6794 7.32944L17.625 5.38391V7C17.625 7.16576 17.6908 7.32473 17.8081 7.44194C17.9253 7.55915 18.0842 7.625 18.25 7.625C18.4158 7.625 18.5747 7.55915 18.6919 7.44194C18.8092 7.32473 18.875 7.16576 18.875 7V3.87519C18.875 3.85451 18.8739 3.83384 18.8719 3.81324ZM11.375 14.5C10.5715 14.5 9.78607 14.2617 9.118 13.8153C8.44992 13.369 7.92922 12.7345 7.62174 11.9922C7.31426 11.2498 7.23381 10.433 7.39056 9.64495C7.54731 8.8569 7.93423 8.13303 8.50238 7.56488C9.07053 6.99673 9.7944 6.60981 10.5824 6.45306C11.3705 6.29631 12.1873 6.37676 12.9297 6.68424C13.672 6.99172 14.3065 7.51242 14.7528 8.1805C15.1992 8.84857 15.4375 9.63401 15.4375 10.4375C15.4363 11.5146 15.0079 12.5472 14.2463 13.3088C13.4847 14.0704 12.4521 14.4988 11.375 14.5Z" fill="currentColor"></path><path d="M10.6512 20.125V18.6621H8.87577C8.68349 18.6621 8.49904 18.5862 8.36308 18.4502C8.22711 18.3142 8.15116 18.1298 8.15116 17.9375C8.15116 17.7452 8.22711 17.5608 8.36308 17.4248C8.49904 17.2888 8.68349 17.2129 8.87577 17.2129V17.3125L8.7537 17.3242C8.63338 17.3482 8.52142 17.4071 8.43339 17.4951L8.35624 17.5908C8.2882 17.6928 8.25077 17.8131 8.25077 17.9375L8.26249 18.0596C8.28644 18.1799 8.34536 18.2919 8.43339 18.3799C8.52142 18.4679 8.63338 18.5268 8.7537 18.5508L8.87577 18.5625H10.7508V20.125L10.7625 20.2471C10.7864 20.3674 10.8454 20.4794 10.9334 20.5674C11.0214 20.6554 11.1334 20.7143 11.2537 20.7383L11.3758 20.75C11.5002 20.75 11.6205 20.7126 11.7225 20.6445L11.8182 20.5674C11.9062 20.4794 11.9651 20.3674 11.9891 20.2471L12.0008 20.125V18.5625H13.8758L13.9978 18.5508C14.0782 18.5348 14.1543 18.5025 14.2225 18.457L14.3182 18.3799C14.4062 18.2919 14.4651 18.1799 14.4891 18.0596L14.5008 17.9375C14.5008 17.8131 14.4633 17.6928 14.3953 17.5908L14.3182 17.4951C14.2301 17.4071 14.1182 17.3482 13.9978 17.3242L13.8758 17.3125V17.2129C14.0681 17.2129 14.2525 17.2888 14.3885 17.4248C14.5244 17.5608 14.6004 17.7452 14.6004 17.9375C14.6004 18.1298 14.5244 18.3142 14.3885 18.4502C14.2525 18.5862 14.0681 18.6621 13.8758 18.6621H12.1004V20.125C12.1004 20.3173 12.0244 20.5017 11.8885 20.6377C11.7525 20.7737 11.5681 20.8496 11.3758 20.8496C11.1835 20.8496 10.999 20.7737 10.8631 20.6377C10.7271 20.5017 10.6512 20.3173 10.6512 20.125ZM14.4012 3.875C14.4012 3.68272 14.4771 3.49827 14.6131 3.3623C14.749 3.22634 14.9335 3.15039 15.1258 3.15039V3.25C14.96 3.25 14.8006 3.31541 14.6834 3.43262L14.6062 3.52832C14.5382 3.63028 14.5008 3.75061 14.5008 3.875L14.5125 3.99707C14.5364 4.11739 14.5954 4.22936 14.6834 4.31738C14.7714 4.40541 14.8834 4.46433 15.0037 4.48828L15.1258 4.5H16.742L14.8328 6.40918L14.5916 6.21387C14.0978 5.83772 13.5418 5.55133 12.949 5.36719L12.6502 5.2832C11.8447 5.08375 11.0033 5.07646 10.1941 5.26074L9.89335 5.33789C9.19819 5.53967 8.55068 5.88223 7.99101 6.34473L7.75761 6.5498C7.2275 7.0428 6.8023 7.63978 6.51054 8.30469L6.39433 8.59277C6.1428 9.27146 6.0325 9.99574 6.07108 10.7207C6.11523 11.5492 6.35231 12.3561 6.76444 13.0762C7.17666 13.7964 7.75198 14.4104 8.44413 14.8682C9.13633 15.3259 9.92664 15.6146 10.7508 15.7119V17.3125H8.87577V17.2129H10.6512V15.7979C9.84339 15.6889 9.06995 15.4012 8.38944 14.9512C7.68429 14.4849 7.0985 13.8597 6.67851 13.126C6.2585 12.3922 6.01544 11.5699 5.9705 10.7256C5.92559 9.88135 6.08001 9.03785 6.41972 8.26367C6.75945 7.48967 7.27594 6.80604 7.92753 6.26758C8.57925 5.72905 9.34833 5.35083 10.1726 5.16309C10.9969 4.9754 11.854 4.98333 12.6746 5.18652C13.4648 5.38226 14.1988 5.7554 14.825 6.27441L16.5008 4.59961H15.1258C14.9335 4.59961 14.749 4.52366 14.6131 4.3877C14.4771 4.25173 14.4012 4.06728 14.4012 3.875ZM15.3387 10.4375C15.3387 9.65391 15.106 8.88789 14.6707 8.23633C14.2353 7.58473 13.6164 7.07628 12.8924 6.77637C12.1683 6.47645 11.371 6.39789 10.6023 6.55078C9.8338 6.70372 9.12811 7.08165 8.57401 7.63574C8.01992 8.18983 7.64199 8.89553 7.48905 9.66406C7.33616 10.4327 7.41473 11.23 7.71464 11.9541C8.01456 12.6781 8.523 13.297 9.1746 13.7324C9.82617 14.1677 10.5922 14.4004 11.3758 14.4004V14.5L11.076 14.4893C10.4777 14.445 9.89683 14.2681 9.3748 13.9727L9.11894 13.8154C8.53447 13.4249 8.06263 12.8903 7.74784 12.2656L7.62284 11.9922C7.35377 11.3426 7.2581 10.6359 7.34355 9.94141L7.3914 9.64453C7.52859 8.95518 7.84194 8.31498 8.29862 7.78516L8.50273 7.56445C8.99984 7.06733 9.61658 6.7093 10.2908 6.52246L10.5828 6.45312C11.3709 6.29637 12.1881 6.37709 12.9305 6.68457C13.6727 6.99206 14.3073 7.51263 14.7537 8.18066C15.2 8.84871 15.4383 9.63408 15.4383 10.4375L15.4334 10.6387C15.3826 11.6425 14.9609 12.5945 14.2469 13.3086L14.1014 13.4473C13.3564 14.1221 12.3857 14.4989 11.3758 14.5V14.4004C12.4263 14.3992 13.4337 13.9811 14.1766 13.2383C14.873 12.5418 15.2832 11.6128 15.3328 10.6338L15.3387 10.4375ZM17.5262 7V5.625L15.8094 7.34082C16.3332 8.08895 16.6604 8.9572 16.7576 9.86621C16.8578 10.8036 16.7107 11.7511 16.3318 12.6143C15.9529 13.4774 15.3552 14.2263 14.5975 14.7871C13.8635 15.3302 13.0043 15.6765 12.1004 15.7979V17.2129H13.8758V17.3125H12.0008V15.7119C12.8049 15.6174 13.5754 15.3408 14.2537 14.9043L14.5379 14.707C15.1887 14.2254 15.7199 13.6026 16.0916 12.8867L16.241 12.5742C16.5664 11.833 16.7166 11.0285 16.6834 10.2227L16.658 9.87695C16.5596 8.95706 16.2229 8.07851 15.6805 7.3291L17.6258 5.38379V7L17.6375 7.12207C17.6614 7.24239 17.7204 7.35436 17.8084 7.44238C17.8964 7.53041 18.0084 7.58933 18.1287 7.61328L18.2508 7.625C18.3752 7.625 18.4955 7.58757 18.5975 7.51953L18.6932 7.44238C18.7812 7.35436 18.8401 7.24239 18.8641 7.12207L18.8758 7V3.875L18.8728 3.81348L18.8689 3.78711L18.8641 3.75293L18.8562 3.72266L18.8484 3.69336L18.8387 3.66406L18.8279 3.63574C18.8242 3.62683 18.8203 3.6181 18.8162 3.60938L18.8016 3.58008C18.7971 3.57178 18.7917 3.56375 18.7869 3.55566L18.7703 3.52832L18.7517 3.50195L18.7342 3.47852L18.6961 3.4375L18.6932 3.43262C18.6917 3.43113 18.6898 3.43018 18.6883 3.42871L18.6473 3.3916L18.6238 3.375L18.5975 3.35547L18.5711 3.33887L18.5457 3.32422L18.5184 3.31055L18.49 3.29785L18.4637 3.28809C18.4532 3.28427 18.4422 3.28062 18.4314 3.27734L18.406 3.27051L18.3728 3.26172L18.3445 3.25781L18.3123 3.25293L18.2644 3.25098L18.2508 3.25V3.15039H18.2674L18.3221 3.15332L18.3592 3.15918L18.3924 3.16406L18.3914 3.16504C18.4065 3.16801 18.4234 3.17177 18.4314 3.17383L18.4305 3.1748L18.4607 3.18066V3.18164L18.4969 3.19434L18.4978 3.19336C18.5027 3.19511 18.5168 3.2004 18.5281 3.20508L18.5603 3.21973V3.2207L18.5926 3.23535L18.6219 3.25293L18.6531 3.27246L18.6844 3.29492L18.7107 3.31445L18.7576 3.35742L18.7557 3.35547C18.7566 3.35628 18.76 3.35885 18.7635 3.3623L18.7674 3.36719C18.7821 3.38218 18.7972 3.39791 18.8113 3.41504L18.8318 3.44238L18.8533 3.47266L18.8728 3.50488L18.8904 3.5332L18.906 3.56641L18.9207 3.59766L18.9441 3.66406V3.66504L18.9529 3.69824L18.9617 3.7334L18.9676 3.77246V3.77344L18.9725 3.80371L18.9754 3.875V7C18.9754 7.19228 18.8994 7.37673 18.7635 7.5127C18.6275 7.64866 18.4431 7.72461 18.2508 7.72461C18.0585 7.72461 17.874 7.64866 17.7381 7.5127C17.6021 7.37673 17.5262 7.19228 17.5262 7ZM18.2508 3.15039V3.25H15.1258V3.15039H18.2508Z" fill="currentColor">
                            </path></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Gender</p>
                            <p className="text-sm font-medium text-gray-900">Male</p>
                          </div>
                          <div className ="rounded-full bg-[#e5f5f8] flex items-center justify-center h-10 w-10 max-w-10 undefined">
                              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5 text-[#128197]"><path d="M8.83537 15.7924C9.29881 15.4358 9.86841 15.2449 10.4531 15.2501H13.5469C14.1262 15.2501 14.7101 15.4301 15.1646 15.7924C15.6259 16.158 15.9375 16.7002 15.9375 17.3212V17.7814C15.9375 18.0051 15.8486 18.2197 15.6904 18.378C15.5321 18.5362 15.3175 18.6251 15.0938 18.6251C14.87 18.6251 14.6554 18.5362 14.4971 18.378C14.3389 18.2197 14.25 18.0051 14.25 17.7814V17.3201C14.25 17.2909 14.2365 17.2099 14.1161 17.1142C13.9508 16.9946 13.7508 16.9325 13.5469 16.9376H10.4531C10.2492 16.9325 10.0492 16.9946 9.88387 17.1142C9.7635 17.2099 9.75 17.2909 9.75 17.3212V17.7814C9.75 18.0051 9.66111 18.2197 9.50287 18.378C9.34464 18.5362 9.13003 18.6251 8.90625 18.6251C8.68247 18.6251 8.46786 18.5362 8.30963 18.378C8.15139 18.2197 8.0625 18.0051 8.0625 17.7814V17.3201C8.0625 16.7014 8.37412 16.158 8.83537 15.7924Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M12 9.0625C11.2541 9.0625 10.5387 9.35882 10.0113 9.88626C9.48382 10.4137 9.1875 11.1291 9.1875 11.875C9.1875 12.6209 9.48382 13.3363 10.0113 13.8637C10.5387 14.3912 11.2541 14.6875 12 14.6875C12.7459 14.6875 13.4613 14.3912 13.9887 13.8637C14.5162 13.3363 14.8125 12.6209 14.8125 11.875C14.8125 11.1291 14.5162 10.4137 13.9887 9.88626C13.4613 9.35882 12.7459 9.0625 12 9.0625ZM10.875 11.875C10.875 11.5766 10.9935 11.2905 11.2045 11.0795C11.4155 10.8685 11.7016 10.75 12 10.75C12.2984 10.75 12.5845 10.8685 12.7955 11.0795C13.0065 11.2905 13.125 11.5766 13.125 11.875C13.125 12.1734 13.0065 12.4595 12.7955 12.6705C12.5845 12.8815 12.2984 13 12 13C11.7016 13 11.4155 12.8815 11.2045 12.6705C10.9935 12.4595 10.875 12.1734 10.875 11.875Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M8.90625 4C8.13 4 7.5 4.63 7.5 5.40625V6.25H5.53125C4.85992 6.25 4.21609 6.51668 3.74139 6.99139C3.26668 7.46609 3 8.10992 3 8.78125L3 18.3438C3 19.0151 3.26668 19.6589 3.74139 20.1336C4.21609 20.6083 4.85992 20.875 5.53125 20.875H18.4688C19.1401 20.875 19.7839 20.6083 20.2586 20.1336C20.7333 19.6589 21 19.0151 21 18.3438V8.78125C21 8.10992 20.7333 7.46609 20.2586 6.99139C19.7839 6.51668 19.1401 6.25 18.4688 6.25H16.5V5.40625C16.5 4.63 15.87 4 15.0938 4H8.90625ZM16.2188 7.9375C15.9622 8.2795 15.5539 8.5 15.0938 8.5H8.90625C8.44613 8.5 8.03775 8.2795 7.78125 7.9375H5.53125C5.30747 7.9375 5.09286 8.02639 4.93463 8.18463C4.77639 8.34286 4.6875 8.55747 4.6875 8.78125V18.3438C4.6875 18.8095 5.0655 19.1875 5.53125 19.1875H18.4688C18.6925 19.1875 18.9071 19.0986 19.0654 18.9404C19.2236 18.7821 19.3125 18.5675 19.3125 18.3438V8.78125C19.3125 8.55747 19.2236 8.34286 19.0654 8.18463C18.9071 8.02639 18.6925 7.9375 18.4688 7.9375H16.2188ZM14.8125 6.8125H9.1875V5.6875H14.8125V6.8125Z" fill="currentColor"></path></svg>
                            </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">ID</p>
                            <p className="text-sm font-medium text-gray-900">4657657657</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Date of birth</p>
                            <p className="text-sm font-medium text-gray-900">27-06-1988</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="text-sm font-medium text-gray-900">Street 1, An Dong, Ho Chi Minh, Vietnam</p>
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
                            <p className="text-sm font-medium text-gray-900">179 cm</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Weight</p>
                            <p className="text-sm font-medium text-gray-900">56 kg</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <Droplets className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Blood type</p>
                            <p className="text-sm font-medium text-gray-900">B+</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">BMI</p>
                            <p className="text-sm font-medium text-gray-900">0 kg/m²</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chronic Conditions */}
                    <div className="py-6 border-b border-gray-100">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Chronic conditions</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {chronicConditions.map((condition, index) => (
                          <Badge
                            key={index}
                            className="bg-teal-100 text-teal-800 hover:bg-teal-100 rounded-full px-4 py-1.5 text-sm font-medium"
                          >
                            {condition}
                          </Badge>
                        ))}
                        <Button
                          size="sm"
                          className="bg-teal-100 text-teal-700 hover:bg-teal-200 rounded-full px-4 py-1.5 h-auto text-sm font-medium"
                          onClick={() => setShowChronicModal(true)}
                        >
                          ADD +
                        </Button>
                      </div>
                    </div>

                    {/* Allergies */}
                    <div className="pt-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Allergies</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {allergies.map((allergy, index) => (
                          <Badge
                            key={index}
                            className="bg-teal-100 text-teal-800 hover:bg-teal-100 rounded-full px-4 py-1.5 text-sm font-medium"
                          >
                            {allergy}
                          </Badge>
                        ))}
                        <Button
                          size="sm"
                          className="bg-teal-100 text-teal-700 hover:bg-teal-200 rounded-full px-4 py-1.5 h-auto text-sm font-medium"
                          onClick={() => setShowAllergiesModal(true)}
                        >
                          ADD +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Orders</h3>
                <p className="text-gray-500">No orders yet.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <AddChronicModal
        open={showChronicModal}
        onOpenChange={setShowChronicModal}
        onAdd={(conditions) => setChronicConditions(conditions)}
        currentConditions={chronicConditions}
      />

      <AddAllergiesModal
        open={showAllergiesModal}
        onOpenChange={setShowAllergiesModal}
        onAdd={(newAllergies) => setAllergies(newAllergies)}
        currentAllergies={allergies}
      />
    </div>
  </div>
  )
}

export default function PatientProfile() {
  return (
    <AuthGuard allowedRoles={['PATIENT']}>
      <PatientProfileContent />
    </AuthGuard>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  User,
  Calendar,
  MapPin,
  UserCheck,
  Menu,
  Home,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { NotificationBell } from "@/components/notification-bell"
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
import { authService } from "@/services/auth.service"
import { userService, PersonalInfoDetailResponse, UpdatePersonalInfoRequest } from "@/services/user.service"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"

function PatientProfileContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [showChronicModal, setShowChronicModal] = useState(false)
  const [showAllergiesModal, setShowAllergiesModal] = useState(false)
  const [chronicConditions, setChronicConditions] = useState<string[]>(["HYPERTENSION"])
  const [allergies, setAllergies] = useState<string[]>(["EGGS", "MILK", "PEANUTS"])
  
  // Personal Information State
  const [personalData, setPersonalData] = useState({
    fullName: "",
    gender: "Male",
    identificationNumber: "",
    dateOfBirth: "",
    phoneNumber: "",
    countryCode: "+84",
    email: "",
    address: "",
  })
  const [originalPersonalData, setOriginalPersonalData] = useState(personalData)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoDetailResponse | null>(null)
  const [isLoadingPersonal, setIsLoadingPersonal] = useState(false)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        fullName: user.fullName || 'Patient',
        role: user.role || 'PATIENT'
      })
    }
    // Load personal info immediately if personal tab is default
    if (activeTab === "personal") {
      loadPersonalInfo()
    }
  }, [])

  // Auto-load personal info when component mounts or when personal tab becomes active
  useEffect(() => {
    if (activeTab === "personal" && !personalInfo && !isLoadingPersonal) {
      loadPersonalInfo()
    }
  }, [activeTab])

  // Helper function to get initials from fullName
  const getInitials = (name: string): string => {
    if (!name) return 'PT'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Load personal info
  const loadPersonalInfo = async () => {
    setIsLoadingPersonal(true)
    try {
      const data = await userService.getPatientPersonalInfo()
      setPersonalInfo(data)
      
      // Convert gender from backend format (MALE/FEMALE) to frontend format (Male/Female)
      const genderMap: Record<string, string> = {
        'MALE': 'Male',
        'FEMALE': 'Female',
        'male': 'Male',
        'female': 'Female',
        'Male': 'Male',
        'Female': 'Female'
      }
      
      // Update personalData for editing
      setPersonalData({
        fullName: data.fullName || "",
        gender: genderMap[data.gender] || "Male",
        identificationNumber: data.cccdNumber || "",
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "",
        phoneNumber: data.phoneNumber || "",
        countryCode: "+84",
        email: data.email || "",
        address: data.address || "",
      })
      
      setOriginalPersonalData({
        fullName: data.fullName || "",
        gender: genderMap[data.gender] || "Male",
        identificationNumber: data.cccdNumber || "",
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "",
        phoneNumber: data.phoneNumber || "",
        countryCode: "+84",
        email: data.email || "",
        address: data.address || "",
      })
    } catch (error) {
      console.error("Error loading personal info:", error)
      toast({
        title: "Error",
        description: "Failed to load personal information",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPersonal(false)
    }
  }

  // Handle save
  const handleSave = async () => {
    if (activeTab === "personal") {
      try {
        // Convert gender from frontend to backend format
        const genderToBackend: Record<string, string> = {
          'Male': 'MALE',
          'Female': 'FEMALE',
          'male': 'MALE',
          'female': 'FEMALE',
          'MALE': 'MALE',
          'FEMALE': 'FEMALE'
        }

        const request: UpdatePersonalInfoRequest = {
          fullName: personalData.fullName,
          phoneNumber: personalData.phoneNumber,
          email: personalData.email,
          dateOfBirth: personalData.dateOfBirth,
          gender: genderToBackend[personalData.gender] || 'MALE',
          address: personalData.address,
        }

        const updatedInfo = await userService.updatePatientPersonalInfo(request)
        
        // Convert gender back for display
        const genderMap: Record<string, string> = {
          'MALE': 'Male',
          'FEMALE': 'Female',
        }
        
        setPersonalData({
          ...personalData,
          gender: genderMap[updatedInfo.gender] || personalData.gender,
        })
        setOriginalPersonalData({
          ...personalData,
          gender: genderMap[updatedInfo.gender] || personalData.gender,
        })
        setPersonalInfo(updatedInfo)
        setIsEditMode(false)
        
        toast({
          title: "Success",
          description: "Personal information updated successfully",
        })
      } catch (error: any) {
        console.error("Error saving personal info:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update personal information",
          variant: "destructive",
        })
      }
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setPersonalData(originalPersonalData)
    setIsEditMode(false)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      authService.clearAuthData()
      router.push('/login')
    }
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#e5f5f8' }}>
      <PatientSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ paddingTop: '16px' }}>
        {/* Header */}
        <header className="bg-white py-4 mx-4 mb-4" style={{ borderRadius: '16px', paddingLeft: '32px', paddingRight: '24px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  type="search"
                  placeholder="Search..." 
                  className="pl-10 bg-gray-50 border-gray-200" 
                />
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>{userInfo ? getInitials(userInfo.fullName) : 'PT'}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{userInfo?.fullName || 'Patient'}</p>
                      <p className="text-xs text-gray-500">Bệnh nhân</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push('/patient-profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-6 pb-6 overflow-auto">
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
                onClick={() => {
                  if (isEditMode) {
                    handleCancel()
                  } else {
                    setIsEditMode(true)
                  }
                }}
                className={`${
                  isEditMode
                    ? "bg-gray-500 hover:bg-gray-600"
                    : "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                } text-white rounded-full px-6`}
              >
                {isEditMode ? "Cancel" : "Edit"}
              </Button>
              {isEditMode && (
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-full px-6"
                >
                  Save
                </Button>
              )}
            </div>

            <TabsContent value="personal" className="mt-0">
              {isLoadingPersonal ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner />
                </div>
              ) : (
              <div className="grid grid-cols-1 gap-6">
                {/* Form Panel - Full width */}
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  {/* CONTAINER CHÍNH: Flex ngang cho Avatar và Form */}
                  <div className="flex gap-8">
                    
                    {/* === KHỐI 1: AVATAR LỚN (Fixed size) === */}
                    <div className="flex-shrink-0 pt-1">
                      <Avatar className="w-32 h-32">
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-3xl font-bold">
                          {getInitials(personalData.fullName || personalInfo?.fullName || "")}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* === KHỐI 2: CÁC TRƯỜNG NHẬP LIỆU (Flex-1) === */}
                    <div className="flex-1">
                      
                      {/* Hàng 1: Full name */}
                      <div className="grid grid-cols-1 gap-6 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                          <Input
                            value={personalData.fullName}
                            onChange={(e) => setPersonalData({ ...personalData, fullName: e.target.value })}
                            className="border-gray-300 rounded-lg"
                            disabled={!isEditMode}
                          />
                        </div>
                      </div>

                      {/* Hàng 2: Gender & Identification number (2 cột) */}
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                          <Select value={personalData.gender} onValueChange={(value) => setPersonalData({ ...personalData, gender: value })} disabled={!isEditMode}>
                            <SelectTrigger className="border-gray-300 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Identification number</label>
                          <Input 
                            value={personalData.identificationNumber}
                            onChange={(e) => setPersonalData({ ...personalData, identificationNumber: e.target.value })}
                            className="border-gray-300 rounded-lg" 
                            disabled={!isEditMode} 
                          />
                        </div>
                      </div>
                  
                      
                    </div>
                  </div>
                  {/* Hàng 3: Date of birth, Phone (2 cột) */}
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    {/* Date of birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of birth</label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={personalData.dateOfBirth}
                          onChange={(e) => setPersonalData({ ...personalData, dateOfBirth: e.target.value })}
                          className="border-gray-300 rounded-lg"
                          disabled={!isEditMode}
                        />
                        {/* Icon Calendar */}
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    
                    {/* Phone number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                      <div className="flex space-x-2">
                        <Select value={personalData.countryCode} onValueChange={(value) => setPersonalData({ ...personalData, countryCode: value })} disabled={!isEditMode}>
                          <SelectTrigger className="w-20 border-gray-300 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="+84">
                              <div className="flex items-center space-x-2">
                                <img
                                  src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/vn.svg"
                                  alt="Vietnam Flag"
                                  className="w-5 h-4 rounded-sm shadow-sm"
                                />
                                <span>+84</span>
                              </div>
                            </SelectItem>

                            <SelectItem value="+1">
                              <div className="flex items-center space-x-2">
                                <img
                                  src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/us.svg"
                                  alt="USA Flag"
                                  className="w-5 h-4 rounded-sm shadow-sm"
                                />
                                <span>+1</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={personalData.phoneNumber}
                          onChange={(e) => setPersonalData({ ...personalData, phoneNumber: e.target.value })}
                          className="flex-1 border-gray-300 rounded-lg"
                          disabled={!isEditMode}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Hàng 4: Email (Chiếm toàn bộ chiều ngang form) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      value={personalData.email}
                      onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                      className="border-gray-300 rounded-lg"
                      disabled={!isEditMode}
                    />
                  </div>

                  {/* Address */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <Input
                      value={personalData.address}
                      onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                      className="border-gray-300 rounded-lg"
                      disabled={!isEditMode}
                      placeholder="Enter your address"
                    />
                  </div>

                </div>
              </div>
              )}
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
  )
}

export default function PatientProfile() {
  return (
    <AuthGuard allowedRoles={['PATIENT']}>
      <PatientProfileContent />
    </AuthGuard>
  )
}

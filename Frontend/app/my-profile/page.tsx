"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DoctorSidebar from "@/components/doctor-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { NotificationBell } from "@/components/notification-bell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Edit, Loader2, AlertCircle, LayoutDashboard, Calendar, User, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { LoadingSpinner, PageLoadingSpinner } from "@/components/loading-spinner"
import { authService } from "@/services/auth.service"

function MyProfilePageContent() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = authService.getUserInfo()
    setUserInfo(user)
  }, [])

  // Helper function to get initials from fullName
  const getInitials = (name: string): string => {
    if (!name) {
      // Determine default based on role
      if (userInfo?.role === 'PATIENT') return 'PT'
      return 'DR'
    }
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
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

  useEffect(() => {
    // Simulate initial data loading
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Simulate API calls for profile data
        await new Promise(resolve => setTimeout(resolve, 700))
      } catch (error) {
        console.error('Error loading profile data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  // Personal Information State
  const [personalData, setPersonalData] = useState({
    fullName: "Lê Thị Tuyết Hoa",
    gender: "Female",
    identificationNumber: "9342234324234",
    dateOfBirth: "31-08-1989",
    phoneNumber: "9843233323",
    countryCode: "+84",
    maritalStatus: "Prefer not to say",
    ethnicity: "Kinh",
    email: "hoa.doctor@gmail.com",
    country: "Vietnam",
    stateProvince: "Ho Chi Minh",
    districtWard: "An Lac",
    zipPostalCode: "",
    addressLine1: "Street 1",
    addressLine2: "",
  })

  // Professional Information State
  const [professionalData, setProfessionalData] = useState({
    title: "Doctor",
    currentProvince: "Ho Chi Minh",
    clinic: "Cho Ray Hospital",
    medicalCareAdults: true,
    medicalCareChildren: true,
    specialties: ["Anesthesiology", "Cardiology", "Dermatology"],
    treatments: ["Adolescence Health", "Anxiety Disorders", "Atrial Fibrillation"],
    languages: ["English", "French", "Vietnamese"],
    certificationId: "doctor-123",
    issuingAuthority: "Medicine center",
    dateOfIssue: "04-09-2010",
  })

  const [originalPersonalData, setOriginalPersonalData] = useState(personalData)
  const [originalProfessionalData, setOriginalProfessionalData] = useState(professionalData)

  // Detect unsaved changes
  useEffect(() => {
    if (isEditMode) {
      const personalChanged = JSON.stringify(personalData) !== JSON.stringify(originalPersonalData)
      const professionalChanged = JSON.stringify(professionalData) !== JSON.stringify(originalProfessionalData)
      setHasUnsavedChanges(personalChanged || professionalChanged)
    }
  }, [personalData, professionalData, originalPersonalData, originalProfessionalData, isEditMode])

  // Block navigation when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true)
    } else {
      setIsEditMode(false)
    }
  }

  const confirmCancel = () => {
    setPersonalData(originalPersonalData)
    setProfessionalData(originalProfessionalData)
    setIsEditMode(false)
    setHasUnsavedChanges(false)
    setShowUnsavedDialog(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setOriginalPersonalData(personalData)
    setOriginalProfessionalData(professionalData)
    setIsEditMode(false)
    setHasUnsavedChanges(false)
    setIsSaving(false)
  }

  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges && isEditMode) {
      setPendingNavigation(path)
      setShowUnsavedDialog(true)
    } else {
      router.push(path)
    }
  }

  const confirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation)
      setPendingNavigation(null)
    }
    setShowUnsavedDialog(false)
  }

  if (isLoading) {
    return <PageLoadingSpinner />
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#e5f5f8' }}>
      <DoctorSidebar />

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
                      <AvatarImage src={userInfo?.role === 'PATIENT' ? "/placeholder-user.jpg" : "/clean-female-doctor.png"} />
                      <AvatarFallback>{userInfo ? getInitials(userInfo.fullName) : (userInfo?.role === 'PATIENT' ? 'PT' : 'DR')}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{userInfo?.fullName || (userInfo?.role === 'PATIENT' ? 'Patient' : 'Doctor')}</p>
                      <p className="text-xs text-gray-500">{userInfo?.role === 'PATIENT' ? 'Bệnh nhân' : 'Bác sĩ'}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push(userInfo?.role === 'PATIENT' ? '/patient-profile' : '/my-profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  {userInfo?.role !== 'PATIENT' && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
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
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="personal" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                </TabsList>

                <div className="flex gap-2">
                  {!isEditMode ? (
                    <Button onClick={handleEdit} className="gradient-primary hover:opacity-90 text-white shadow-soft-lg hover:shadow-soft-xl transition-smooth">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="glass border-[#16a1bd] text-[#16a1bd] hover:bg-white/50 transition-smooth"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving} className="gradient-primary hover:opacity-90 text-white shadow-soft-lg hover:shadow-soft-xl transition-smooth">
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Personal Tab */}
              <TabsContent value="personal" className="space-y-6">
                <div className="glass rounded-3xl p-6 shadow-soft-lg border-white/50 hover-lift">
                  <div className="flex gap-8">
                    <div className="flex-shrink-0">
                      <Avatar className="w-32 h-32 ring-4 ring-white shadow-soft-lg">
                        <AvatarFallback className="gradient-primary text-white text-3xl font-semibold">LH</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="fullName">
                            Full name {isEditMode && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id="fullName"
                            value={personalData.fullName}
                            onChange={(e) => setPersonalData({ ...personalData, fullName: e.target.value })}
                            disabled={!isEditMode}
                            className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gender">Gender {isEditMode && <span className="text-red-500">*</span>}</Label>
                          <Select
                            value={personalData.gender}
                            onValueChange={(value) => setPersonalData({ ...personalData, gender: value })}
                            disabled={!isEditMode}
                          >
                            <SelectTrigger className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="identificationNumber">
                            Identification number {isEditMode && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id="identificationNumber"
                            value={personalData.identificationNumber}
                            onChange={(e) => setPersonalData({ ...personalData, identificationNumber: e.target.value })}
                            disabled={!isEditMode}
                            className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="dateOfBirth">
                            Date of birth {isEditMode && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id="dateOfBirth"
                            value={personalData.dateOfBirth}
                            onChange={(e) => setPersonalData({ ...personalData, dateOfBirth: e.target.value })}
                            disabled={!isEditMode}
                            className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                          />
                        </div>

                        <div>
                          <Label htmlFor="phoneNumber">
                            Phone number {isEditMode && <span className="text-red-500">*</span>}
                          </Label>
                          <div className="flex gap-2">
                            <Select
                              value={personalData.countryCode}
                              onValueChange={(value) => setPersonalData({ ...personalData, countryCode: value })}
                              disabled={!isEditMode}
                            >
                              <SelectTrigger className={cn("w-24", !isEditMode && "cursor-not-allowed bg-gray-50")}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="+84">🇻🇳 +84</SelectItem>
                                <SelectItem value="+1">🇺🇸 +1</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              id="phoneNumber"
                              value={personalData.phoneNumber}
                              onChange={(e) => setPersonalData({ ...personalData, phoneNumber: e.target.value })}
                              disabled={!isEditMode}
                              className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="maritalStatus">Marital status</Label>
                          <Select
                            value={personalData.maritalStatus}
                            onValueChange={(value) => setPersonalData({ ...personalData, maritalStatus: value })}
                            disabled={!isEditMode}
                          >
                            <SelectTrigger className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Single">Single</SelectItem>
                              <SelectItem value="Married">Married</SelectItem>
                              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="ethnicity">
                            Ethnicity {isEditMode && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id="ethnicity"
                            value={personalData.ethnicity}
                            onChange={(e) => setPersonalData({ ...personalData, ethnicity: e.target.value })}
                            disabled={!isEditMode}
                            className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email {isEditMode && <span className="text-red-500">*</span>}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={personalData.email}
                          onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                          disabled={!isEditMode}
                          className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold mb-4">Address</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor="country">
                                Country {isEditMode && <span className="text-red-500">*</span>}
                              </Label>
                              <Select
                                value={personalData.country}
                                onValueChange={(value) => setPersonalData({ ...personalData, country: value })}
                                disabled={!isEditMode}
                              >
                                <SelectTrigger className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Vietnam">Vietnam</SelectItem>
                                  <SelectItem value="USA">USA</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="stateProvince">
                                State / Province {isEditMode && <span className="text-red-500">*</span>}
                              </Label>
                              <Select
                                value={personalData.stateProvince}
                                onValueChange={(value) => setPersonalData({ ...personalData, stateProvince: value })}
                                disabled={!isEditMode}
                              >
                                <SelectTrigger className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Ho Chi Minh">Ho Chi Minh</SelectItem>
                                  <SelectItem value="Hanoi">Hanoi</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="districtWard">
                                District / Ward {isEditMode && <span className="text-red-500">*</span>}
                              </Label>
                              <Select
                                value={personalData.districtWard}
                                onValueChange={(value) => setPersonalData({ ...personalData, districtWard: value })}
                                disabled={!isEditMode}
                              >
                                <SelectTrigger className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="An Lac">An Lac</SelectItem>
                                  <SelectItem value="District 1">District 1</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="zipPostalCode">Zip / Postal Code</Label>
                              <Input
                                id="zipPostalCode"
                                value={personalData.zipPostalCode}
                                onChange={(e) => setPersonalData({ ...personalData, zipPostalCode: e.target.value })}
                                disabled={!isEditMode}
                                className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="addressLine1">
                                Address Line 1 {isEditMode && <span className="text-red-500">*</span>}
                              </Label>
                              <Input
                                id="addressLine1"
                                value={personalData.addressLine1}
                                onChange={(e) => setPersonalData({ ...personalData, addressLine1: e.target.value })}
                                disabled={!isEditMode}
                                className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                              />
                            </div>

                            <div>
                              <Label htmlFor="addressLine2">Address Line 2</Label>
                              <Input
                                id="addressLine2"
                                value={personalData.addressLine2}
                                onChange={(e) => setPersonalData({ ...personalData, addressLine2: e.target.value })}
                                disabled={!isEditMode}
                                className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Professional Tab */}
              <TabsContent value="professional" className="space-y-6">
                <div className="glass rounded-3xl p-6 shadow-soft-lg border-white/50 hover-lift">
                  <div className="flex gap-8">
                    <div className="flex-shrink-0">
                      <Avatar className="w-32 h-32 ring-4 ring-white shadow-soft-lg">
                        <AvatarFallback className="gradient-primary text-white text-3xl font-semibold">LH</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Select
                            value={professionalData.title}
                            onValueChange={(value) => setProfessionalData({ ...professionalData, title: value })}
                            disabled={!isEditMode}
                          >
                            <SelectTrigger className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Doctor">Doctor</SelectItem>
                              <SelectItem value="Specialist">Specialist</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="currentProvince">Current (last) province of work</Label>
                          <Select
                            value={professionalData.currentProvince}
                            onValueChange={(value) =>
                              setProfessionalData({ ...professionalData, currentProvince: value })
                            }
                            disabled={!isEditMode}
                          >
                            <SelectTrigger className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ho Chi Minh">Ho Chi Minh</SelectItem>
                              <SelectItem value="Hanoi">Hanoi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="clinic">Clinic / hospital of work</Label>
                          <Select
                            value={professionalData.clinic}
                            onValueChange={(value) => setProfessionalData({ ...professionalData, clinic: value })}
                            disabled={!isEditMode}
                          >
                            <SelectTrigger className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cho Ray Hospital">Cho Ray Hospital</SelectItem>
                              <SelectItem value="FV Hospital">FV Hospital</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Medical care for</Label>
                          <div className="flex gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="adults"
                                checked={professionalData.medicalCareAdults}
                                onCheckedChange={(checked) =>
                                  setProfessionalData({ ...professionalData, medicalCareAdults: checked as boolean })
                                }
                                disabled={!isEditMode}
                                className={cn(!isEditMode && "cursor-not-allowed")}
                              />
                              <Label htmlFor="adults" className={cn(!isEditMode && "cursor-not-allowed")}>
                                Adults
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="children"
                                checked={professionalData.medicalCareChildren}
                                onCheckedChange={(checked) =>
                                  setProfessionalData({ ...professionalData, medicalCareChildren: checked as boolean })
                                }
                                disabled={!isEditMode}
                                className={cn(!isEditMode && "cursor-not-allowed")}
                              />
                              <Label htmlFor="children" className={cn(!isEditMode && "cursor-not-allowed")}>
                                Children
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Specialties</Label>
                          <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md bg-gray-50">
                            {professionalData.specialties.map((specialty) => (
                              <Badge key={specialty} variant="outline" className="bg-white">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label>Treatment of conditions</Label>
                          <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md bg-gray-50">
                            {professionalData.treatments.map((treatment) => (
                              <Badge key={treatment} variant="outline" className="bg-white">
                                {treatment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Languages</Label>
                        <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md bg-gray-50">
                          {professionalData.languages.map((language) => (
                            <Badge key={language} variant="outline" className="bg-white">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="certificationId">Practicing certification ID</Label>
                        <Input
                          id="certificationId"
                          value={professionalData.certificationId}
                          onChange={(e) =>
                            setProfessionalData({ ...professionalData, certificationId: e.target.value })
                          }
                          disabled={!isEditMode}
                          className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="issuingAuthority">Issuing authority</Label>
                          <Input
                            id="issuingAuthority"
                            value={professionalData.issuingAuthority}
                            onChange={(e) =>
                              setProfessionalData({ ...professionalData, issuingAuthority: e.target.value })
                            }
                            disabled={!isEditMode}
                            className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                          />
                        </div>

                        <div>
                          <Label htmlFor="dateOfIssue">Date of issue</Label>
                          <Input
                            id="dateOfIssue"
                            value={professionalData.dateOfIssue}
                            onChange={(e) => setProfessionalData({ ...professionalData, dateOfIssue: e.target.value })}
                            disabled={!isEditMode}
                            className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#16a1bd]/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[#16a1bd]" />
              </div>
              <div>
                <AlertDialogTitle>Changes Not Saved</AlertDialogTitle>
                <AlertDialogDescription>Your changes will be lost if you leave without saving.</AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={pendingNavigation ? confirmNavigation : confirmCancel}
              className="bg-[#16a1bd] hover:bg-[#138a9f]"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function MyProfilePage() {
  return (
    <AuthGuard allowedRoles={['DOCTOR']}>
      <MyProfilePageContent />
    </AuthGuard>
  )
}

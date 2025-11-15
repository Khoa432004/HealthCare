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
import { Search, Edit, Loader2, AlertCircle, LayoutDashboard, Calendar, User, Settings, LogOut, Plus, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { LoadingSpinner, PageLoadingSpinner } from "@/components/loading-spinner"
import { authService } from "@/services/auth.service"
import { userService, type ProfessionalInfoResponse } from "@/services/user.service"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

function MyProfilePageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfoResponse | null>(null)
  const [isLoadingProfessional, setIsLoadingProfessional] = useState(false)

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

  // Professional Information State (for editing)
  const [professionalData, setProfessionalData] = useState({
    title: "",
    currentProvince: "",
    clinic: "",
    medicalCareAdults: false,
    medicalCareChildren: false,
    specialties: [] as string[],
    treatments: [] as string[],
    languages: [] as string[],
    certificationId: "",
  })

  // Load professional info when professional tab is accessed
  const loadProfessionalInfo = async () => {
    if (professionalInfo) return // Already loaded
    
    setIsLoadingProfessional(true)
    try {
      const data = await userService.getProfessionalInfo()
      setProfessionalInfo(data)
      
      // Update professionalData for editing
      setProfessionalData({
        title: data.title || "",
        currentProvince: data.province || "",
        clinic: data.facilityName || "",
        medicalCareAdults: data.careTarget?.includes("Người lớn") || data.careTarget?.includes("Adults") || false,
        medicalCareChildren: data.careTarget?.includes("Trẻ em") || data.careTarget?.includes("Children") || false,
        specialties: data.specialties || [],
        treatments: data.diseasesTreated || [],
        languages: data.languages || [],
        certificationId: data.practicingCertificationId || "",
      })
      
      // Initialize editing states
      setEditingWorkExperiences(data.workExperiences || [])
      setEditingEducations(data.educations || [])
      setEditingCertifications(data.certifications || [])
    } catch (error) {
      console.error("Error loading professional info:", error)
      toast({
        title: "Error",
        description: "Failed to load professional information",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProfessional(false)
    }
  }

  // Work Plans State
  const [workPlansData, setWorkPlansData] = useState({
    sessionDuration: 15, // 10, 15, 20, 30, 60 minutes
    appointmentCost: 150000, // VND
    days: {
      monday: { enabled: true, timeSlots: [{ startTime: "08:00", endTime: "12:00" }, { startTime: "14:00", endTime: "17:00" }] },
      tuesday: { enabled: true, timeSlots: [{ startTime: "08:00", endTime: "12:00" }, { startTime: "14:00", endTime: "17:00" }] },
      wednesday: { enabled: true, timeSlots: [{ startTime: "08:00", endTime: "12:00" }, { startTime: "14:00", endTime: "17:00" }] },
      thursday: { enabled: true, timeSlots: [{ startTime: "08:00", endTime: "12:00" }, { startTime: "14:00", endTime: "17:00" }] },
      friday: { enabled: true, timeSlots: [{ startTime: "08:00", endTime: "12:00" }, { startTime: "14:00", endTime: "17:00" }] },
      saturday: { enabled: true, timeSlots: [{ startTime: "08:00", endTime: "12:00" }] },
      sunday: { enabled: false, timeSlots: [] },
    },
  })

  const [workPlansErrors, setWorkPlansErrors] = useState<Record<string, string>>({})
  const [isSavingWorkPlans, setIsSavingWorkPlans] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")

  const [originalPersonalData, setOriginalPersonalData] = useState(personalData)
  const [originalProfessionalData, setOriginalProfessionalData] = useState(professionalData)
  const [originalWorkPlansData, setOriginalWorkPlansData] = useState(workPlansData)

  // State for editing work experiences, educations, certifications
  const [editingWorkExperiences, setEditingWorkExperiences] = useState<ProfessionalInfoResponse['workExperiences']>([])
  const [editingEducations, setEditingEducations] = useState<ProfessionalInfoResponse['educations']>([])
  const [editingCertifications, setEditingCertifications] = useState<ProfessionalInfoResponse['certifications']>([])

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
      // Reset editing states to original
      if (professionalInfo) {
        setEditingWorkExperiences(professionalInfo.workExperiences || [])
        setEditingEducations(professionalInfo.educations || [])
        setEditingCertifications(professionalInfo.certifications || [])
      }
    }
  }
  
  // Handlers for adding/removing items
  const handleAddWorkExperience = () => {
    const newExp: ProfessionalInfoResponse['workExperiences'][0] = {
      id: crypto.randomUUID(),
      position: "",
      specialties: [],
      clinicHospital: "",
      location: "",
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      isCurrentJob: false
    }
    setEditingWorkExperiences([...editingWorkExperiences, newExp])
    setHasUnsavedChanges(true)
  }
  
  const handleRemoveWorkExperience = (id: string) => {
    setEditingWorkExperiences(editingWorkExperiences.filter(exp => exp.id !== id))
    setHasUnsavedChanges(true)
  }
  
  const handleUpdateWorkExperience = (id: string, field: string, value: any) => {
    setEditingWorkExperiences(editingWorkExperiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ))
    setHasUnsavedChanges(true)
  }
  
  const handleAddEducation = () => {
    const newEdu: ProfessionalInfoResponse['educations'][0] = {
      specialty: "",
      qualification: "",
      school: "",
      fromYear: new Date().getFullYear() - 4,
      toYear: new Date().getFullYear()
    }
    setEditingEducations([...editingEducations, newEdu])
    setHasUnsavedChanges(true)
  }
  
  const handleRemoveEducation = (index: number) => {
    setEditingEducations(editingEducations.filter((_, i) => i !== index))
    setHasUnsavedChanges(true)
  }
  
  const handleUpdateEducation = (index: number, field: string, value: any) => {
    setEditingEducations(editingEducations.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    ))
    setHasUnsavedChanges(true)
  }
  
  const handleAddCertification = () => {
    const newCert: ProfessionalInfoResponse['certifications'][0] = {
      name: "",
      issuingOrganization: "",
      issueDate: new Date().toISOString().split('T')[0],
      attachmentUrl: ""
    }
    setEditingCertifications([...editingCertifications, newCert])
    setHasUnsavedChanges(true)
  }
  
  const handleRemoveCertification = (index: number) => {
    setEditingCertifications(editingCertifications.filter((_, i) => i !== index))
    setHasUnsavedChanges(true)
  }
  
  const handleUpdateCertification = (index: number, field: string, value: any) => {
    setEditingCertifications(editingCertifications.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    ))
    setHasUnsavedChanges(true)
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
    try {
      if (activeTab === "professional") {
        // Validate required fields
        if (!professionalData.title || !professionalData.title.trim()) {
          toast({
            title: "Validation Error",
            description: "Title is required",
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
        
        if (!professionalData.clinic || !professionalData.clinic.trim()) {
          toast({
            title: "Validation Error",
            description: "Clinic/Hospital is required",
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
        
        if (!professionalData.certificationId || !professionalData.certificationId.trim()) {
          toast({
            title: "Validation Error",
            description: "Practicing certification ID is required",
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
        
        // Update professional info
        const updateData: any = {
          title: professionalData.title.trim(),
          facilityName: professionalData.clinic.trim(),
          careForAdults: professionalData.medicalCareAdults,
          careForChildren: professionalData.medicalCareChildren,
          specialties: professionalData.specialties || [],
          diseasesTreated: professionalData.treatments || [],
          languages: professionalData.languages || [],
          practicingCertificationId: professionalData.certificationId.trim(),
        }
        
        // Add optional fields only if they have values
        if (professionalData.currentProvince && professionalData.currentProvince.trim()) {
          updateData.province = professionalData.currentProvince.trim()
        }
        
        // Include workExperiences from editing state
        if (editingWorkExperiences && editingWorkExperiences.length > 0) {
          updateData.workExperiences = editingWorkExperiences
            .filter(exp => exp.fromDate) // Only include valid experiences
            .map(exp => ({
              id: exp.id,
              position: exp.position || "",
              specialties: exp.specialties || [],
              clinicHospital: exp.clinicHospital || "",
              location: exp.location || "",
              fromDate: exp.fromDate,
              toDate: exp.toDate || undefined,
              isCurrentJob: exp.isCurrentJob || false
            }))
        }
        
        // Include educations from editing state
        if (editingEducations && editingEducations.length > 0) {
          updateData.educations = editingEducations
            .filter(edu => edu.school && edu.specialty) // Only include valid educations
            .map(edu => ({
              specialty: edu.specialty || "",
              qualification: edu.qualification || "",
              school: edu.school || "",
              fromYear: edu.fromYear || new Date().getFullYear() - 4,
              toYear: edu.toYear || new Date().getFullYear()
            }))
        }
        
        // Include certifications from editing state
        if (editingCertifications && editingCertifications.length > 0) {
          updateData.certifications = editingCertifications
            .filter(cert => cert.name) // Only include valid certifications
            .map(cert => ({
              name: cert.name || "",
              issuingOrganization: cert.issuingOrganization || "",
              issueDate: cert.issueDate || undefined,
              attachmentUrl: cert.attachmentUrl || undefined
            }))
        }
        
        console.log('Sending update request with data:', JSON.stringify(updateData, null, 2))
        const updatedInfo = await userService.updateProfessionalInfo(updateData)
        setProfessionalInfo(updatedInfo)
        
      // Update professionalData with response
      setProfessionalData({
        title: updatedInfo.title || "",
        currentProvince: updatedInfo.province || "",
        clinic: updatedInfo.facilityName || "",
        medicalCareAdults: updatedInfo.careTarget?.includes("Người lớn") || updatedInfo.careTarget?.includes("Adults") || false,
        medicalCareChildren: updatedInfo.careTarget?.includes("Trẻ em") || updatedInfo.careTarget?.includes("Children") || false,
        specialties: updatedInfo.specialties || [],
        treatments: updatedInfo.diseasesTreated || [],
        languages: updatedInfo.languages || [],
        certificationId: updatedInfo.practicingCertificationId || "",
      })
      
      // Update editing states
      setEditingWorkExperiences(updatedInfo.workExperiences || [])
      setEditingEducations(updatedInfo.educations || [])
      setEditingCertifications(updatedInfo.certifications || [])
      
      setOriginalProfessionalData(professionalData)
        
        toast({
          title: "Success",
          description: "Professional information updated successfully",
        })
      } else {
        // TODO: Update personal info when implemented
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setOriginalPersonalData(personalData)
        toast({
          title: "Success",
          description: "Personal information updated successfully",
        })
      }
      
      setIsEditMode(false)
      setHasUnsavedChanges(false)
    } catch (error: any) {
      console.error("Error saving:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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

  // Work Plans Helper Functions
  const toggleDayEnabled = (dayKey: keyof typeof workPlansData.days) => {
    setWorkPlansData(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: {
          ...prev.days[dayKey],
          enabled: !prev.days[dayKey].enabled,
          timeSlots: !prev.days[dayKey].enabled ? prev.days[dayKey].timeSlots : prev.days[dayKey].timeSlots
        }
      }
    }))
  }

  const addTimeSlot = (dayKey: keyof typeof workPlansData.days) => {
    setWorkPlansData(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: {
          ...prev.days[dayKey],
          timeSlots: [...prev.days[dayKey].timeSlots, { startTime: "08:00", endTime: "12:00" }]
        }
      }
    }))
  }

  const removeTimeSlot = (dayKey: keyof typeof workPlansData.days, slotIndex: number) => {
    setWorkPlansData(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: {
          ...prev.days[dayKey],
          timeSlots: prev.days[dayKey].timeSlots.filter((_, index) => index !== slotIndex)
        }
      }
    }))
  }

  const updateTimeSlot = (dayKey: keyof typeof workPlansData.days, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setWorkPlansData(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: {
          ...prev.days[dayKey],
          timeSlots: prev.days[dayKey].timeSlots.map((slot, index) => 
            index === slotIndex ? { ...slot, [field]: value } : slot
          )
        }
      }
    }))
  }

  const validateWorkPlans = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate appointment cost
    if (!workPlansData.appointmentCost || workPlansData.appointmentCost <= 0) {
      errors.appointmentCost = "Giá khám phải lớn hơn 0"
    }

    // Validate session duration
    const validDurations = [10, 15, 20, 30, 60]
    if (!validDurations.includes(workPlansData.sessionDuration)) {
      errors.sessionDuration = "Thời lượng phiên không hợp lệ"
    }

    // Validate time slots for enabled days
    const dayLabels: Record<string, string> = {
      monday: "Thứ 2",
      tuesday: "Thứ 3",
      wednesday: "Thứ 4",
      thursday: "Thứ 5",
      friday: "Thứ 6",
      saturday: "Thứ 7",
      sunday: "Chủ nhật"
    }

    Object.entries(workPlansData.days).forEach(([dayKey, dayData]) => {
      if (dayData.enabled) {
        if (dayData.timeSlots.length === 0) {
          errors[`${dayKey}_slots`] = `${dayLabels[dayKey]} phải có ít nhất 1 khung giờ`
        }

        // Validate each time slot
        dayData.timeSlots.forEach((slot, index) => {
          const startTime = slot.startTime
          const endTime = slot.endTime

          if (!startTime || !endTime) {
            errors[`${dayKey}_slot_${index}`] = "Thời gian bắt đầu và kết thúc không được để trống"
            return
          }

          const [startHour, startMinute] = startTime.split(':').map(Number)
          const [endHour, endMinute] = endTime.split(':').map(Number)
          const startMinutes = startHour * 60 + startMinute
          const endMinutes = endHour * 60 + endMinute

          if (startMinutes >= endMinutes) {
            errors[`${dayKey}_slot_${index}`] = "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc"
          }
        })

        // Check for overlapping time slots
        const sortedSlots = [...dayData.timeSlots].sort((a, b) => {
          const [aHour, aMin] = a.startTime.split(':').map(Number)
          const [bHour, bMin] = b.startTime.split(':').map(Number)
          return (aHour * 60 + aMin) - (bHour * 60 + bMin)
        })

        for (let i = 0; i < sortedSlots.length - 1; i++) {
          const current = sortedSlots[i]
          const next = sortedSlots[i + 1]
          const [currentEndHour, currentEndMin] = current.endTime.split(':').map(Number)
          const [nextStartHour, nextStartMin] = next.startTime.split(':').map(Number)
          const currentEndMinutes = currentEndHour * 60 + currentEndMin
          const nextStartMinutes = nextStartHour * 60 + nextStartMin

          if (currentEndMinutes > nextStartMinutes) {
            errors[`${dayKey}_overlap`] = `${dayLabels[dayKey]} có khung giờ bị trùng nhau`
            break
          }
        }
      }
    })

    setWorkPlansErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveWorkPlans = async () => {
    if (!validateWorkPlans()) {
      toast({
        title: "Lỗi validation",
        description: "Vui lòng kiểm tra lại thông tin đã nhập",
        variant: "destructive",
      })
      return
    }

    setIsSavingWorkPlans(true)
    try {
      // TODO: Call API to save work plans
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      setOriginalWorkPlansData(workPlansData)
      setWorkPlansErrors({})
      
      toast({
        title: "Lưu thành công",
        description: "Lịch làm việc đã được cập nhật thành công",
      })
    } catch (error) {
      console.error('Error saving work plans:', error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu lịch làm việc. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsSavingWorkPlans(false)
    }
  }

  const handleCancelWorkPlans = () => {
    setWorkPlansData(originalWorkPlansData)
    setWorkPlansErrors({})
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
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value)
              if (value === "professional") {
                loadProfessionalInfo()
              }
            }} className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                  <TabsTrigger value="work-plans">Work Plans</TabsTrigger>
                </TabsList>

                {activeTab !== "work-plans" && (
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
                )}
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
                {isLoadingProfessional ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : (
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
                          {isEditMode ? (
                            <Select
                              value={professionalData.title}
                              onValueChange={(value) => setProfessionalData({ ...professionalData, title: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select title" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Bác sĩ">Bác sĩ</SelectItem>
                                <SelectItem value="Thạc sĩ">Thạc sĩ</SelectItem>
                                <SelectItem value="Tiến sĩ">Tiến sĩ</SelectItem>
                                <SelectItem value="Phó Giáo sư">Phó Giáo sư</SelectItem>
                                <SelectItem value="Giáo sư">Giáo sư</SelectItem>
                                <SelectItem value="Doctor">Doctor</SelectItem>
                                <SelectItem value="Specialist">Specialist</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={professionalInfo?.title || ""}
                              disabled
                              className="cursor-not-allowed bg-gray-50"
                            />
                          )}
                        </div>

                        <div>
                          <Label htmlFor="currentProvince">Current (last) province of work</Label>
                          {isEditMode ? (
                            <Select
                              value={professionalData.currentProvince}
                              onValueChange={(value) =>
                                setProfessionalData({ ...professionalData, currentProvince: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select province" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Ho Chi Minh">Ho Chi Minh</SelectItem>
                                <SelectItem value="Hanoi">Hanoi</SelectItem>
                                <SelectItem value="Da Nang">Da Nang</SelectItem>
                                <SelectItem value="Can Tho">Can Tho</SelectItem>
                                <SelectItem value="Hai Phong">Hai Phong</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={professionalInfo?.province || ""}
                              disabled
                              className="cursor-not-allowed bg-gray-50"
                            />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="clinic">Clinic / hospital of work</Label>
                          {isEditMode ? (
                            <Select
                              value={professionalData.clinic}
                              onValueChange={(value) => setProfessionalData({ ...professionalData, clinic: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select clinic" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cho Ray Hospital">Cho Ray Hospital</SelectItem>
                                <SelectItem value="FV Hospital">FV Hospital</SelectItem>
                                <SelectItem value="Bach Mai Hospital">Bach Mai Hospital</SelectItem>
                                <SelectItem value="Viet Duc Hospital">Viet Duc Hospital</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={professionalInfo?.facilityName || ""}
                              disabled
                              className="cursor-not-allowed bg-gray-50"
                            />
                          )}
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
                            {(isEditMode ? professionalData.specialties : (professionalInfo?.specialties || [])).length > 0 ? (
                              (isEditMode ? professionalData.specialties : (professionalInfo?.specialties || [])).map((specialty) => (
                                <Badge key={specialty} variant="outline" className="bg-white">
                                  {specialty}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">No specialties specified</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label>Treatment of conditions</Label>
                          <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md bg-gray-50">
                            {(isEditMode ? professionalData.treatments : (professionalInfo?.diseasesTreated || [])).length > 0 ? (
                              (isEditMode ? professionalData.treatments : (professionalInfo?.diseasesTreated || [])).map((treatment) => (
                                <Badge key={treatment} variant="outline" className="bg-white">
                                  {treatment}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">No treatments specified</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Languages</Label>
                        <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md bg-gray-50">
                          {(isEditMode ? professionalData.languages : (professionalInfo?.languages || [])).length > 0 ? (
                            (isEditMode ? professionalData.languages : (professionalInfo?.languages || [])).map((language) => (
                              <Badge key={language} variant="outline" className="bg-white">
                                {language}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">No languages specified</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="certificationId">Practicing certification ID</Label>
                        <Input
                          id="certificationId"
                          value={isEditMode ? professionalData.certificationId : (professionalInfo?.practicingCertificationId || "")}
                          onChange={(e) =>
                            setProfessionalData({ ...professionalData, certificationId: e.target.value })
                          }
                          disabled={!isEditMode}
                          className={cn(!isEditMode && "cursor-not-allowed bg-gray-50")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                )}
                
                {/* Work Experience Section */}
                <div className="glass rounded-3xl p-6 shadow-soft-lg border-white/50 hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Work Experience</h3>
                    {isEditMode && (
                      <Button variant="outline" size="sm" onClick={handleAddWorkExperience}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {(isEditMode ? editingWorkExperiences : (professionalInfo?.workExperiences || [])).length > 0 ? (
                      (isEditMode ? editingWorkExperiences : (professionalInfo?.workExperiences || [])).map((exp) => (
                        <div key={exp.id} className="border rounded-lg p-4">
                          {isEditMode ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Position</Label>
                                  <Input
                                    value={exp.position}
                                    onChange={(e) => handleUpdateWorkExperience(exp.id, 'position', e.target.value)}
                                    placeholder="e.g., Senior Doctor"
                                  />
                                </div>
                                <div>
                                  <Label>Clinic/Hospital</Label>
                                  <Input
                                    value={exp.clinicHospital}
                                    onChange={(e) => handleUpdateWorkExperience(exp.id, 'clinicHospital', e.target.value)}
                                    placeholder="e.g., Cho Ray Hospital"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Location</Label>
                                  <Input
                                    value={exp.location}
                                    onChange={(e) => handleUpdateWorkExperience(exp.id, 'location', e.target.value)}
                                    placeholder="e.g., Ho Chi Minh City"
                                  />
                                </div>
                                <div>
                                  <Label>Specialties (comma-separated)</Label>
                                  <Input
                                    value={exp.specialties?.join(', ') || ''}
                                    onChange={(e) => handleUpdateWorkExperience(exp.id, 'specialties', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                    placeholder="e.g., Cardiology, Internal Medicine"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label>From Date</Label>
                                  <Input
                                    type="date"
                                    value={exp.fromDate}
                                    onChange={(e) => handleUpdateWorkExperience(exp.id, 'fromDate', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>To Date</Label>
                                  <Input
                                    type="date"
                                    value={exp.toDate || ''}
                                    onChange={(e) => handleUpdateWorkExperience(exp.id, 'toDate', e.target.value)}
                                    disabled={exp.isCurrentJob}
                                  />
                                </div>
                                <div className="flex items-end">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={exp.isCurrentJob}
                                      onCheckedChange={(checked) => {
                                        handleUpdateWorkExperience(exp.id, 'isCurrentJob', checked)
                                        if (checked) {
                                          handleUpdateWorkExperience(exp.id, 'toDate', new Date().toISOString().split('T')[0])
                                        }
                                      }}
                                    />
                                    <Label>Current Job</Label>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveWorkExperience(exp.id)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{exp.position}</p>
                                <p className="text-sm text-gray-600">{exp.clinicHospital}</p>
                                <p className="text-sm text-gray-500">{exp.location}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {exp.specialties?.map((spec, idx) => (
                                    <Badge key={idx} variant="outline">{spec}</Badge>
                                  ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                  {new Date(exp.fromDate).toLocaleDateString()} - {exp.isCurrentJob ? "Current" : (exp.toDate ? new Date(exp.toDate).toLocaleDateString() : '')}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-4">No work experience added</p>
                    )}
                  </div>
                </div>

                {/* Education Section */}
                {professionalInfo && (
                <div className="glass rounded-3xl p-6 shadow-soft-lg border-white/50 hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Education</h3>
                    {isEditMode && (
                      <Button variant="outline" size="sm" onClick={handleAddEducation}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {(isEditMode ? editingEducations : (professionalInfo?.educations || [])).length > 0 ? (
                      (isEditMode ? editingEducations : (professionalInfo?.educations || [])).map((edu, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          {isEditMode ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Specialty</Label>
                                  <Input
                                    value={edu.specialty}
                                    onChange={(e) => handleUpdateEducation(idx, 'specialty', e.target.value)}
                                    placeholder="e.g., Medicine"
                                  />
                                </div>
                                <div>
                                  <Label>Qualification</Label>
                                  <Input
                                    value={edu.qualification}
                                    onChange={(e) => handleUpdateEducation(idx, 'qualification', e.target.value)}
                                    placeholder="e.g., Bachelor's Degree"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>School</Label>
                                <Input
                                  value={edu.school}
                                  onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                                  placeholder="e.g., University of Medicine"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>From Year</Label>
                                  <Input
                                    type="number"
                                    value={edu.fromYear}
                                    onChange={(e) => handleUpdateEducation(idx, 'fromYear', parseInt(e.target.value) || new Date().getFullYear() - 4)}
                                  />
                                </div>
                                <div>
                                  <Label>To Year</Label>
                                  <Input
                                    type="number"
                                    value={edu.toYear}
                                    onChange={(e) => handleUpdateEducation(idx, 'toYear', parseInt(e.target.value) || new Date().getFullYear())}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveEducation(idx)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{edu.specialty}</p>
                                <p className="text-sm text-gray-600">{edu.qualification}</p>
                                <p className="text-sm text-gray-500">{edu.school}</p>
                                <p className="text-sm text-gray-500 mt-2">
                                  {edu.fromYear} - {edu.toYear}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-4">No education added</p>
                    )}
                  </div>
                </div>
                )}

                {/* Certification Section */}
                {professionalInfo && (
                <div className="glass rounded-3xl p-6 shadow-soft-lg border-white/50 hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Certifications</h3>
                    {isEditMode && (
                      <Button variant="outline" size="sm" onClick={handleAddCertification}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {(isEditMode ? editingCertifications : (professionalInfo?.certifications || [])).length > 0 ? (
                      (isEditMode ? editingCertifications : (professionalInfo?.certifications || [])).map((cert, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          {isEditMode ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Certification Name</Label>
                                  <Input
                                    value={cert.name}
                                    onChange={(e) => handleUpdateCertification(idx, 'name', e.target.value)}
                                    placeholder="e.g., Medical License"
                                  />
                                </div>
                                <div>
                                  <Label>Issuing Organization</Label>
                                  <Input
                                    value={cert.issuingOrganization}
                                    onChange={(e) => handleUpdateCertification(idx, 'issuingOrganization', e.target.value)}
                                    placeholder="e.g., Ministry of Health"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Issue Date</Label>
                                  <Input
                                    type="date"
                                    value={cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleUpdateCertification(idx, 'issueDate', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Attachment URL (optional)</Label>
                                  <Input
                                    value={cert.attachmentUrl || ''}
                                    onChange={(e) => handleUpdateCertification(idx, 'attachmentUrl', e.target.value)}
                                    placeholder="https://..."
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveCertification(idx)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{cert.name}</p>
                                <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                                {cert.issueDate && (
                                  <p className="text-sm text-gray-500">
                                    {new Date(cert.issueDate).toLocaleDateString()}
                                  </p>
                                )}
                                {cert.attachmentUrl && (
                                  <a href={cert.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                                    View Attachment
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-4">No certifications added</p>
                    )}
                  </div>
                </div>
                )}
              </TabsContent>

              {/* Work Plans Tab */}
              <TabsContent value="work-plans" className="space-y-6">
                <div className="glass rounded-3xl p-6 shadow-soft-lg border-white/50 hover-lift">
                  <div className="space-y-6">
                    {/* Session Duration and Appointment Cost */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="sessionDuration">
                          Thời lượng phiên (phút) <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={workPlansData.sessionDuration.toString()}
                          onValueChange={(value) =>
                            setWorkPlansData({ ...workPlansData, sessionDuration: parseInt(value) })
                          }
                        >
                          <SelectTrigger className={cn(workPlansErrors.sessionDuration && "border-red-500")}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 phút</SelectItem>
                            <SelectItem value="15">15 phút</SelectItem>
                            <SelectItem value="20">20 phút</SelectItem>
                            <SelectItem value="30">30 phút</SelectItem>
                            <SelectItem value="60">60 phút</SelectItem>
                          </SelectContent>
                        </Select>
                        {workPlansErrors.sessionDuration && (
                          <p className="text-sm text-red-500 mt-1">{workPlansErrors.sessionDuration}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="appointmentCost">
                          Giá khám (VND) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="appointmentCost"
                          type="number"
                          min="0"
                          value={workPlansData.appointmentCost}
                          onChange={(e) =>
                            setWorkPlansData({ ...workPlansData, appointmentCost: parseInt(e.target.value) || 0 })
                          }
                          className={cn(workPlansErrors.appointmentCost && "border-red-500")}
                        />
                        {workPlansErrors.appointmentCost && (
                          <p className="text-sm text-red-500 mt-1">{workPlansErrors.appointmentCost}</p>
                        )}
                      </div>
                    </div>

                    {/* Days Configuration */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Cấu hình lịch làm việc theo ngày</h3>
                      <div className="space-y-4">
                        {Object.entries(workPlansData.days).map(([dayKey, dayData]) => {
                          const dayLabels: Record<string, string> = {
                            monday: "Thứ 2",
                            tuesday: "Thứ 3",
                            wednesday: "Thứ 4",
                            thursday: "Thứ 5",
                            friday: "Thứ 6",
                            saturday: "Thứ 7",
                            sunday: "Chủ nhật"
                          }

                          return (
                            <div
                              key={dayKey}
                              className={cn(
                                "border rounded-lg p-4 space-y-3",
                                !dayData.enabled && "opacity-50 bg-gray-50"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Switch
                                    checked={dayData.enabled}
                                    onCheckedChange={() => toggleDayEnabled(dayKey as keyof typeof workPlansData.days)}
                                  />
                                  <Label className="text-base font-medium cursor-pointer" htmlFor={dayKey}>
                                    {dayLabels[dayKey]}
                                  </Label>
                                </div>
                                {dayData.enabled && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addTimeSlot(dayKey as keyof typeof workPlansData.days)}
                                    className="gap-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Thêm khung giờ
                                  </Button>
                                )}
                              </div>

                              {dayData.enabled && (
                                <div className="space-y-3 pl-8">
                                  {workPlansErrors[`${dayKey}_slots`] && (
                                    <p className="text-sm text-red-500">{workPlansErrors[`${dayKey}_slots`]}</p>
                                  )}
                                  {workPlansErrors[`${dayKey}_overlap`] && (
                                    <p className="text-sm text-red-500">{workPlansErrors[`${dayKey}_overlap`]}</p>
                                  )}

                                  {dayData.timeSlots.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Chưa có khung giờ nào</p>
                                  ) : (
                                    dayData.timeSlots.map((slot, slotIndex) => (
                                      <div
                                        key={slotIndex}
                                        className="flex items-center gap-3 p-3 bg-white rounded-md border"
                                      >
                                        <div className="flex items-center gap-2 flex-1">
                                          <Clock className="w-4 h-4 text-gray-400" />
                                          <div className="flex items-center gap-2">
                                            <Input
                                              type="time"
                                              value={slot.startTime}
                                              onChange={(e) =>
                                                updateTimeSlot(
                                                  dayKey as keyof typeof workPlansData.days,
                                                  slotIndex,
                                                  'startTime',
                                                  e.target.value
                                                )
                                              }
                                              className={cn(
                                                "w-32",
                                                workPlansErrors[`${dayKey}_slot_${slotIndex}`] && "border-red-500"
                                              )}
                                            />
                                            <span className="text-gray-500">-</span>
                                            <Input
                                              type="time"
                                              value={slot.endTime}
                                              onChange={(e) =>
                                                updateTimeSlot(
                                                  dayKey as keyof typeof workPlansData.days,
                                                  slotIndex,
                                                  'endTime',
                                                  e.target.value
                                                )
                                              }
                                              className={cn(
                                                "w-32",
                                                workPlansErrors[`${dayKey}_slot_${slotIndex}`] && "border-red-500"
                                              )}
                                            />
                                          </div>
                                          {workPlansErrors[`${dayKey}_slot_${slotIndex}`] && (
                                            <p className="text-xs text-red-500">
                                              {workPlansErrors[`${dayKey}_slot_${slotIndex}`]}
                                            </p>
                                          )}
                                        </div>
                                        {dayData.timeSlots.length > 1 && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              removeTimeSlot(dayKey as keyof typeof workPlansData.days, slotIndex)
                                            }
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <X className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelWorkPlans}
                        disabled={isSavingWorkPlans}
                        className="glass border-[#16a1bd] text-[#16a1bd] hover:bg-white/50 transition-smooth"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSaveWorkPlans}
                        disabled={isSavingWorkPlans}
                        className="gradient-primary hover:opacity-90 text-white shadow-soft-lg hover:shadow-soft-xl transition-smooth"
                      >
                        {isSavingWorkPlans ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Lưu lịch
                          </>
                        )}
                      </Button>
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

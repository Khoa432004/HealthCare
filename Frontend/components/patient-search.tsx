"use client"

import { useState, useEffect, useRef } from "react"
import { Search, User, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { type User } from "@/services/user.service"
import { LoadingSpinner } from "@/components/loading-spinner"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"

interface PatientSearchProps {
  value: string
  onSelect: (patientId: string, patientName: string) => void
}

export function PatientSearch({ value, onSelect }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState(value)
  const [patients, setPatients] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchPatients(searchQuery.trim())
      } else {
        setPatients([])
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchPatients = async (query: string) => {
    setIsLoading(true)
    try {
      // Build query parameters
      const params = new URLSearchParams()
      params.append("page", "1")
      params.append("size", "10")
      params.append("roleName", "PATIENT")
      
      // Check if query looks like a phone number (all digits)
      const isPhoneNumber = /^\d+$/.test(query)
      
      if (isPhoneNumber) {
        // If query is all digits, search by phone
        params.append("phone", query)
      } else {
        // Otherwise, search by fullName
        params.append("fullName", query)
      }

      // Call API directly with query parameters
      // Use /api/v1/users endpoint (as used in userService)
      const response: any = await apiClient.get(
        `/api/v1/users?${params.toString()}`
      )

      // Extract users from response
      let users: User[] = []
      if (response.data?.content) {
        users = response.data.content
      } else if (Array.isArray(response.data)) {
        users = response.data
      } else if (Array.isArray(response)) {
        users = response
      }

      // Additional client-side filtering for better results
      // (in case API doesn't do partial matching)
      const filtered = users.filter(
        (patient) =>
          patient.fullName.toLowerCase().includes(query.toLowerCase()) ||
          patient.phoneNumber.includes(query)
      )

      setPatients(filtered)
      setShowDropdown(filtered.length > 0)
    } catch (error) {
      console.error("Error searching patients:", error)
      setPatients([])
      setShowDropdown(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    setSelectedPatient(null)
    
    // If input is cleared, clear selection
    if (!newValue) {
      onSelect("", "")
    }
  }

  const handleSelectPatient = (patient: User) => {
    setSelectedPatient(patient)
    setSearchQuery(patient.fullName)
    setShowDropdown(false)
    onSelect(patient.id, patient.fullName)
  }

  const handleInputFocus = () => {
    if (patients.length > 0 && searchQuery.length >= 2) {
      setShowDropdown(true)
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      <label className="text-sm font-medium text-slate-700 mb-2 block">Patient</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Nhập tên hoặc số điện thoại bệnh nhân..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && patients.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {patients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => handleSelectPatient(patient)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#16a1bd] rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {patient.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {patient.fullName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500">{patient.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && !isLoading && patients.length === 0 && searchQuery.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-500 text-center">
            Không tìm thấy bệnh nhân nào
          </p>
        </div>
      )}
    </div>
  )
}


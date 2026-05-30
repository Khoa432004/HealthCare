"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, Check, Lock, Unlock } from "lucide-react"
import { userService, type User } from "@/services/user.service"
import { authService } from "@/services/auth.service"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useTranslation } from "react-i18next"

export function UserManagementTable() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  
  // Filters
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, roleFilter, statusFilter, searchQuery])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getAllUsers({ page: 1, size: 100 })
      setUsers(response.content || [])
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("loadUsersFailed", "Unable to load user list"),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "PENDING") {
        // For pending status, show accounts waiting for approval
        filtered = filtered.filter(user => hasPendingApproval(user))
      } else {
        // For other statuses, exclude accounts waiting for approval
        filtered = filtered.filter(user => 
          user.status === statusFilter && !hasPendingApproval(user)
        )
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user =>
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phoneNumber?.includes(query)
      )
    }

    setFilteredUsers(filtered)
  }

  const handleApprove = async () => {
    if (!selectedUser) return

    try {
      await authService.approveDoctor(selectedUser.id)
      toast({
        title: t("success"),
        description: t("approveDoctorSuccess", "Doctor account approved successfully"),
      })
      setApproveModalOpen(false)
      loadUsers()
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("approveDoctorFailed", "Unable to approve doctor account"),
        variant: "destructive"
      })
    }
  }

  const handleToggleStatus = async (user: User, activate: boolean) => {
    try {
      await userService.toggleAccountStatus(user.id, activate)
      toast({
        title: t("success"),
        description: activate
          ? t("unlockAccountSuccess", "Account unlocked successfully")
          : t("lockAccountSuccess", "Account locked successfully"),
      })
      loadUsers()
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("updateAccountStatusFailed", "Unable to update account status"),
        variant: "destructive"
      })
    }
  }

  const hasPendingApproval = (user: User): boolean => {
    return user.role === 'DOCTOR' && user.approvalRequestStatus === 'PENDING'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t("active")}</Badge>
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{t("pending")}</Badge>
      case 'INACTIVE':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{t("inactive")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'DOCTOR':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{t("doctor")}</Badge>
      case 'PATIENT':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">{t("patient")}</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <div className="glass rounded-3xl p-6 shadow-soft-lg">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("searchUsers")}
            className="pl-10 bg-white/70"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-white/70">
            <SelectValue placeholder={t("allRoles")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            <SelectItem value="DOCTOR">{t("doctor")}</SelectItem>
            <SelectItem value="PATIENT">{t("patient")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-white/70">
            <SelectValue placeholder={t("allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            <SelectItem value="ACTIVE">{t("active")}</SelectItem>
            <SelectItem value="PENDING">{t("pending")}</SelectItem>
            <SelectItem value="INACTIVE">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t("user")}</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t("email")}</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t("phone")}</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t("role")}</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t("status")}</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t("createdAt")}</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    {t("noUsersFound")}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-emerald-600 text-white">
                            {user.fullName
                              ?.split(" ")
                          .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                        <span className="font-medium text-gray-900">{user.fullName}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600">{user.email}</td>
                    <td className="py-4 px-4 text-gray-600">{user.phoneNumber}</td>
                    <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasPendingApproval(user) && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              setSelectedUser(user)
                              setApproveModalOpen(true)
                            }}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {t("approve")}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user)
                            setDetailsModalOpen(true)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t("view")}
                        </Button>
                        {!hasPendingApproval(user) && (
                          user.status === 'ACTIVE' ? (
                            user.role !== 'ADMIN' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleToggleStatus(user, false)}
                              >
                                <Lock className="w-4 h-4 mr-1" />
                                {t("lock")}
                              </Button>
                            )
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-300 text-green-600 hover:bg-green-50"
                              onClick={() => handleToggleStatus(user, true)}
                            >
                              <Unlock className="w-4 h-4 mr-1" />
                              {t("unlock")}
                      </Button>
                          )
                        )}
                      </div>
                </td>
              </tr>
                ))
              )}
          </tbody>
        </table>
      </div>
      )}

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("approveDoctorAccount", "Approve Doctor Account")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t("approveDoctorConfirm", "Are you sure you want to approve this doctor account?")}</p>
            <p className="text-sm text-gray-600 mt-2">
              {t("account")}: <strong>{selectedUser?.fullName}</strong> ({selectedUser?.email})
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setApproveModalOpen(false)}>
              {t("cancel")}
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
              <Check className="w-4 h-4 mr-2" />
              {t("approve")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("userDetails", "User Details")}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-3">{t("basicInformation")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t("fullNameField")}</p>
                    <p className="font-medium">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("email")}</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("phone")}</p>
                    <p className="font-medium">{selectedUser.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("role")}</p>
                    <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("status")}</p>
                    <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("createdAt")}</p>
                    <p className="font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {selectedUser.status === 'ACTIVE' ? (
                selectedUser.role !== 'ADMIN' && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleToggleStatus(selectedUser, false)
                      setDetailsModalOpen(false)
                    }}
                    className="w-full"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {t("lockAccount", "Lock account")}
                  </Button>
                )
              ) : (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleToggleStatus(selectedUser, true)
                    setDetailsModalOpen(false)
                  }}
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  {t("unlockAccount", "Unlock account")}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

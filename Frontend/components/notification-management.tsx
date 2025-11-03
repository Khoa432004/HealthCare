"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { notificationService, type Notification } from "@/services/notification.service"
import { useToast } from "@/hooks/use-toast"

export function NotificationManagement() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "ADMIN" as "ADMIN" | "SYSTEM",
    targetRoles: [] as string[], // Array of roles
    sendToAll: false, // true = send to all users (targetRoles will be ["DOCTOR", "PATIENT", "ADMIN"])
  })

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await notificationService.getAllNotifications()
      setNotifications(data || [])
    } catch (error: any) {
      console.error("Error loading notifications:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách thông báo",
        variant: "destructive",
      })
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      title: "",
      content: "",
      type: "ADMIN",
      targetRoles: [],
      sendToAll: false,
    })
    setCreateDialogOpen(true)
  }

  const handleEdit = (notification: Notification) => {
    setSelectedNotification(notification)
    // Check if all 3 roles are present (means "send to all")
    const hasAllRoles = notification.targetRoles && 
                        notification.targetRoles.length === 3 &&
                        notification.targetRoles.includes("DOCTOR") &&
                        notification.targetRoles.includes("PATIENT") &&
                        notification.targetRoles.includes("ADMIN")
    const isSendToAll = !notification.targetRoles || notification.targetRoles.length === 0 || hasAllRoles
    setFormData({
      title: notification.title,
      content: notification.content,
      type: notification.type === "ADMIN" ? "ADMIN" : "SYSTEM",
      targetRoles: hasAllRoles ? [] : (notification.targetRoles || []),
      sendToAll: isSendToAll,
    })
    setEditDialogOpen(true)
  }

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification)
    setViewDialogOpen(true)
  }

  const handleDelete = (notification: Notification) => {
    setSelectedNotification(notification)
    setDeleteDialogOpen(true)
  }

  const handleSaveCreate = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề thông báo",
        variant: "destructive",
      })
      return
    }

    if (!formData.sendToAll && formData.targetRoles.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn đối tượng nhận thông báo",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await notificationService.createNotification({
        title: formData.title,
        content: formData.content,
        type: formData.type,
        targetRoles: formData.sendToAll ? ["DOCTOR", "PATIENT", "ADMIN"] : formData.targetRoles,
      })
      toast({
        title: "Thành công",
        description: "Gửi thông báo thành công",
      })
      setCreateDialogOpen(false)
      loadNotifications()
    } catch (error: any) {
      console.error("Error creating notification:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi thông báo",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedNotification) return
    if (!formData.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề thông báo",
        variant: "destructive",
      })
      return
    }

    if (!formData.sendToAll && formData.targetRoles.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn đối tượng nhận thông báo",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await notificationService.updateNotification(selectedNotification.id, {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        targetRoles: formData.sendToAll ? ["DOCTOR", "PATIENT", "ADMIN"] : formData.targetRoles,
      })
      toast({
        title: "Thành công",
        description: "Cập nhật thành công",
      })
      setEditDialogOpen(false)
      loadNotifications()
    } catch (error: any) {
      console.error("Error updating notification:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông báo",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedNotification) return

    setDeleting(true)
    try {
      await notificationService.deleteNotification(selectedNotification.id)
      toast({
        title: "Thành công",
        description: "Xóa thông báo thành công",
      })
      setDeleteDialogOpen(false)
      loadNotifications()
    } catch (error: any) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa thông báo",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes} ${day}/${month}/${year}`
  }

  const getTypeBadge = (type: string) => {
    switch (type.toUpperCase()) {
      case "ADMIN":
        return <Badge className="bg-blue-500">Admin</Badge>
      case "SYSTEM":
        return <Badge className="bg-purple-500">System</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const toggleRole = (role: string) => {
    setFormData((prev) => {
      const newRoles = prev.targetRoles.includes(role)
        ? prev.targetRoles.filter((r) => r !== role)
        : [...prev.targetRoles, role]
      return { ...prev, targetRoles: newRoles, sendToAll: false }
    })
  }

  const toggleSendToAll = () => {
    setFormData((prev) => ({
      ...prev,
      sendToAll: !prev.sendToAll,
      targetRoles: !prev.sendToAll ? [] : prev.targetRoles, // Clear roles when selecting "send to all"
    }))
  }

  const getRoleBadges = (roles: string[] | null) => {
    // Check if all 3 roles are present (means "send to all")
    const hasAllRoles = roles && 
                        roles.length === 3 &&
                        roles.includes("DOCTOR") &&
                        roles.includes("PATIENT") &&
                        roles.includes("ADMIN")
    
    if (!roles || roles.length === 0 || hasAllRoles) {
      return <Badge variant="outline">Tất cả người dùng</Badge>
    }
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((role) => (
          <Badge key={role} variant="outline">
            {role === "DOCTOR" 
              ? "Bác sĩ"
              : role === "PATIENT"
              ? "Bệnh nhân"
              : "Quản trị viên"}
          </Badge>
        ))}
      </div>
    )
  }

  // Filter notifications by search
  const filteredNotifications = search
    ? notifications.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase()) ||
        n.createdByName?.toLowerCase().includes(search.toLowerCase())
      )
    : notifications

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý thông báo</h2>
          <p className="text-sm text-gray-500">
            Xem và quản lý tất cả thông báo trong hệ thống ({notifications.length} thông báo)
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo thông báo mới
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm theo tiêu đề, nội dung, người tạo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Người tạo</TableHead>
              <TableHead>Người nhận</TableHead>
              <TableHead>Đã đọc</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredNotifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Không có thông báo nào
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">{notification.title}</TableCell>
                  <TableCell>{getTypeBadge(notification.type)}</TableCell>
                  <TableCell>{notification.createdByName || "N/A"}</TableCell>
                  <TableCell>
                    {getRoleBadges(notification.targetRoles)}
                  </TableCell>
                  <TableCell>
                    {notification.isRead ? (
                      <Badge className="bg-green-500">Đã đọc</Badge>
                    ) : (
                      <Badge variant="outline">Chưa đọc</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(notification.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleView(notification)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(notification)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(notification)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo thông báo mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo thông báo mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">
                Tiêu đề thông báo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-title"
                placeholder="Nhập tiêu đề thông báo"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-content">Nội dung thông báo</Label>
              <Textarea
                id="create-content"
                placeholder="Nhập nội dung thông báo"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Đối tượng nhận thông báo <span className="text-red-500">*</span>
              </Label>
              
              {/* Option: Send to All */}
              <div 
                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.sendToAll
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={toggleSendToAll}
              >
                <input
                  type="checkbox"
                  id="create-send-all"
                  checked={formData.sendToAll}
                  onChange={toggleSendToAll}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                />
                <Label htmlFor="create-send-all" className="ml-3 font-medium cursor-pointer text-sm">
                  🌐 Gửi cho tất cả người dùng
                </Label>
              </div>

              {/* Specific Roles */}
              {!formData.sendToAll && (
                <>
                  <div className="text-xs text-gray-600 font-medium">Hoặc chọn role cụ thể:</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.targetRoles.includes("DOCTOR")
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleRole("DOCTOR")}
                    >
                      <input
                        type="checkbox"
                        id="create-doctor"
                        checked={formData.targetRoles.includes("DOCTOR")}
                        onChange={() => toggleRole("DOCTOR")}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <Label htmlFor="create-doctor" className="ml-3 font-medium cursor-pointer text-sm">
                        👨‍⚕️ Bác sĩ
                      </Label>
                    </div>
                    
                    <div 
                      className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.targetRoles.includes("PATIENT")
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleRole("PATIENT")}
                    >
                      <input
                        type="checkbox"
                        id="create-patient"
                        checked={formData.targetRoles.includes("PATIENT")}
                        onChange={() => toggleRole("PATIENT")}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <Label htmlFor="create-patient" className="ml-3 font-medium cursor-pointer text-sm">
                        🧑‍🤝‍🧑 Bệnh nhân
                      </Label>
                    </div>
                    
                    <div 
                      className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.targetRoles.includes("ADMIN")
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleRole("ADMIN")}
                    >
                      <input
                        type="checkbox"
                        id="create-admin"
                        checked={formData.targetRoles.includes("ADMIN")}
                        onChange={() => toggleRole("ADMIN")}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <Label htmlFor="create-admin" className="ml-3 font-medium cursor-pointer text-sm">
                        👑 Quản trị viên
                      </Label>
                    </div>
                  </div>
                </>
              )}
              
              <p className={`text-xs mt-2 ${
                !formData.sendToAll && formData.targetRoles.length === 0
                  ? "text-red-500 font-medium"
                  : "text-gray-500"
              }`}>
                {formData.sendToAll 
                  ? "Thông báo sẽ được gửi đến tất cả người dùng trong hệ thống"
                  : formData.targetRoles.length === 0
                  ? "⚠️ Vui lòng chọn ít nhất một đối tượng nhận thông báo"
                  : `Đã chọn ${formData.targetRoles.length} role(s)`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveCreate} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông báo</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin thông báo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">
                Tiêu đề thông báo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                placeholder="Nhập tiêu đề thông báo"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Nội dung thông báo</Label>
              <Textarea
                id="edit-content"
                placeholder="Nhập nội dung thông báo"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Đối tượng nhận thông báo <span className="text-red-500">*</span>
              </Label>
              
              {/* Option: Send to All */}
              <div 
                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.sendToAll
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={toggleSendToAll}
              >
                <input
                  type="checkbox"
                  id="edit-send-all"
                  checked={formData.sendToAll}
                  onChange={toggleSendToAll}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                />
                <Label htmlFor="edit-send-all" className="ml-3 font-medium cursor-pointer text-sm">
                  🌐 Gửi cho tất cả người dùng
                </Label>
              </div>

              {/* Specific Roles */}
              {!formData.sendToAll && (
                <>
                  <div className="text-xs text-gray-600 font-medium">Hoặc chọn role cụ thể:</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.targetRoles.includes("DOCTOR")
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleRole("DOCTOR")}
                    >
                      <input
                        type="checkbox"
                        id="edit-doctor"
                        checked={formData.targetRoles.includes("DOCTOR")}
                        onChange={() => toggleRole("DOCTOR")}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <Label htmlFor="edit-doctor" className="ml-3 font-medium cursor-pointer text-sm">
                        👨‍⚕️ Bác sĩ
                      </Label>
                    </div>
                    
                    <div 
                      className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.targetRoles.includes("PATIENT")
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleRole("PATIENT")}
                    >
                      <input
                        type="checkbox"
                        id="edit-patient"
                        checked={formData.targetRoles.includes("PATIENT")}
                        onChange={() => toggleRole("PATIENT")}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <Label htmlFor="edit-patient" className="ml-3 font-medium cursor-pointer text-sm">
                        🧑‍🤝‍🧑 Bệnh nhân
                      </Label>
                    </div>
                    
                    <div 
                      className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.targetRoles.includes("ADMIN")
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleRole("ADMIN")}
                    >
                      <input
                        type="checkbox"
                        id="edit-admin"
                        checked={formData.targetRoles.includes("ADMIN")}
                        onChange={() => toggleRole("ADMIN")}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <Label htmlFor="edit-admin" className="ml-3 font-medium cursor-pointer text-sm">
                        👑 Quản trị viên
                      </Label>
                    </div>
                  </div>
                </>
              )}
              
              <p className={`text-xs mt-2 ${
                !formData.sendToAll && formData.targetRoles.length === 0
                  ? "text-red-500 font-medium"
                  : "text-gray-500"
              }`}>
                {formData.sendToAll 
                  ? "Thông báo sẽ được gửi đến tất cả người dùng trong hệ thống"
                  : formData.targetRoles.length === 0
                  ? "⚠️ Vui lòng chọn ít nhất một đối tượng nhận thông báo"
                  : `Đã chọn ${formData.targetRoles.length} role(s)`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết thông báo</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tiêu đề</Label>
                <p className="text-sm font-medium">{selectedNotification.title}</p>
              </div>
              <div className="space-y-2">
                <Label>Nội dung</Label>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedNotification.content || "Không có nội dung"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Loại</Label>
                <div>{getTypeBadge(selectedNotification.type)}</div>
              </div>
              <div className="space-y-2">
                <Label>Người tạo</Label>
                <p className="text-sm">{selectedNotification.createdByName || "N/A"}</p>
              </div>
              <div className="space-y-2">
                <Label>Đối tượng nhận</Label>
                <div className="text-sm">
                  {getRoleBadges(selectedNotification.targetRoles)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Đã đọc</Label>
                <div>
                  {selectedNotification.isRead ? (
                    <Badge className="bg-green-500">Đã đọc</Badge>
                  ) : (
                    <Badge variant="outline">Chưa đọc</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Thời gian tạo</Label>
                <p className="text-sm">{formatDate(selectedNotification.createdAt)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa thông báo "{selectedNotification?.title}"? Thao tác này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xác nhận"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
  )
}

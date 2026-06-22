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
import { useTranslation } from "react-i18next"

export function NotificationManagement() {
  const { t } = useTranslation()
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
        title: t("error"),
        description: error.message || t("loadNotificationsFailed", "Unable to load notifications"),
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
        title: t("error"),
        description: t("notificationTitleRequired", "Please enter a notification title"),
        variant: "destructive",
      })
      return
    }

    if (!formData.sendToAll && formData.targetRoles.length === 0) {
      toast({
        title: t("error"),
        description: t("selectRecipientsRequired", "Please select notification recipients"),
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
        title: t("success"),
        description: t("sendNotificationSuccess", "Notification sent successfully"),
      })
      setCreateDialogOpen(false)
      loadNotifications()
    } catch (error: any) {
      console.error("Error creating notification:", error)
      toast({
        title: t("error"),
        description: error.message || t("sendNotificationFailed", "Unable to send notification"),
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
        title: t("error"),
        description: t("notificationTitleRequired", "Please enter a notification title"),
        variant: "destructive",
      })
      return
    }

    if (!formData.sendToAll && formData.targetRoles.length === 0) {
      toast({
        title: t("error"),
        description: t("selectRecipientsRequired", "Please select notification recipients"),
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
        title: t("success"),
        description: t("updateNotificationSuccess", "Notification updated successfully"),
      })
      setEditDialogOpen(false)
      loadNotifications()
    } catch (error: any) {
      console.error("Error updating notification:", error)
      toast({
        title: t("error"),
        description: error.message || t("updateNotificationFailed", "Unable to update notification"),
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
        title: t("success"),
        description: t("deleteNotificationSuccess", "Notification deleted successfully"),
      })
      setDeleteDialogOpen(false)
      loadNotifications()
    } catch (error: any) {
      console.error("Error deleting notification:", error)
      toast({
        title: t("error"),
        description: error.message || t("deleteNotificationFailed", "Unable to delete notification"),
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
        return <Badge className="bg-blue-500">{t("admin")}</Badge>
      case "SYSTEM":
        return <Badge className="bg-purple-500">{t("system")}</Badge>
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
      return <Badge variant="outline">{t("allUsers")}</Badge>
    }
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((role) => (
          <Badge key={role} variant="outline">
            {role === "DOCTOR" 
              ? t("doctor")
              : role === "PATIENT"
              ? t("patient")
              : t("admin")}
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
          <h2 className="text-2xl font-bold text-gray-900">{t("notificationManagement")}</h2>
          <p className="text-sm text-gray-500">
            {t("notificationManagementDesc")} ({notifications.length})
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          {t("createNotification")}
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t("searchPlaceholder")}
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
              <TableHead>{t("notificationTitle")}</TableHead>
              <TableHead>{t("type")}</TableHead>
              <TableHead>{t("sender")}</TableHead>
              <TableHead>{t("recipients")}</TableHead>
              <TableHead>{t("read")}</TableHead>
              <TableHead>{t("createdAt")}</TableHead>
              <TableHead>{t("actions")}</TableHead>
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
                  {t("noNotifications")}
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">{notification.title}</TableCell>
                  <TableCell>{getTypeBadge(notification.type)}</TableCell>
                  <TableCell>{notification.createdByName || t("na")}</TableCell>
                  <TableCell>
                    {getRoleBadges(notification.targetRoles)}
                  </TableCell>
                  <TableCell>
                    {notification.isRead ? (
                      <Badge className="bg-green-500">{t("read")}</Badge>
                    ) : (
                      <Badge variant="outline">{t("unread")}</Badge>
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
            <DialogTitle>{t("createNotification")}</DialogTitle>
            <DialogDescription>
              {t("createNotificationDesc", "Fill in the information to create a new notification")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">
                {t("notificationTitle")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-title"
                placeholder={t("enterNotificationTitle", "Enter notification title")}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-content">{t("content")}</Label>
              <Textarea
                id="create-content"
                placeholder={t("enterNotificationContent", "Enter notification content")}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {t("recipients")} <span className="text-red-500">*</span>
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
                  🌐 {t("sendToAll")}
                </Label>
              </div>

              {/* Specific Roles */}
              {!formData.sendToAll && (
                <>
                  <div className="text-xs text-gray-600 font-medium">{t("orSelectSpecificRole", "Or select specific roles:")}</div>
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
                        👨‍⚕️ {t("doctor")}
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
                        🧑‍🤝‍🧑 {t("patient")}
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
                        👑 {t("admin")}
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
                  ? t("sendToAllHint", "The notification will be sent to all users in the system")
                  : formData.targetRoles.length === 0
                  ? `⚠️ ${t("selectAtLeastOneRecipient", "Please select at least one recipient")}`
                  : `${t("selectedLabel", "Selected")} ${formData.targetRoles.length} role(s)`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveCreate} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("sending", "Sending...")}
                </>
              ) : (
                t("send")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("editNotification", "Edit notification")}</DialogTitle>
            <DialogDescription>
              {t("editNotificationDesc", "Update notification information")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">
                {t("notificationTitle")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                placeholder={t("enterNotificationTitle", "Enter notification title")}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">{t("content")}</Label>
              <Textarea
                id="edit-content"
                placeholder={t("enterNotificationContent", "Enter notification content")}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {t("recipients")} <span className="text-red-500">*</span>
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
                  🌐 {t("sendToAll")}
                </Label>
              </div>

              {/* Specific Roles */}
              {!formData.sendToAll && (
                <>
                  <div className="text-xs text-gray-600 font-medium">{t("orSelectSpecificRole", "Or select specific roles:")}</div>
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
                        👨‍⚕️ {t("doctor")}
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
                        🧑‍🤝‍🧑 {t("patient")}
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
                        👑 {t("admin")}
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
                  ? t("sendToAllHint", "The notification will be sent to all users in the system")
                  : formData.targetRoles.length === 0
                  ? `⚠️ ${t("selectAtLeastOneRecipient", "Please select at least one recipient")}`
                  : `${t("selectedLabel", "Selected")} ${formData.targetRoles.length} role(s)`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("update")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("notificationDetails", "Notification details")}</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("notificationTitle")}</Label>
                <p className="text-sm font-medium">{selectedNotification.title}</p>
              </div>
              <div className="space-y-2">
                <Label>{t("content")}</Label>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedNotification.content || t("noContent", "No content")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("type")}</Label>
                <div>{getTypeBadge(selectedNotification.type)}</div>
              </div>
              <div className="space-y-2">
                <Label>{t("sender")}</Label>
                <p className="text-sm">{selectedNotification.createdByName || t("na")}</p>
              </div>
              <div className="space-y-2">
                <Label>{t("recipients")}</Label>
                <div className="text-sm">
                  {getRoleBadges(selectedNotification.targetRoles)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("read")}</Label>
                <div>
                  {selectedNotification.isRead ? (
                    <Badge className="bg-green-500">{t("read")}</Badge>
                  ) : (
                    <Badge variant="outline">{t("unread")}</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("createdAt")}</Label>
                <p className="text-sm">{formatDate(selectedNotification.createdAt)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>{t("close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDelete", "Confirm delete")}</DialogTitle>
            <DialogDescription>
              {t("confirmDeleteNotification", "Are you sure you want to delete this notification? This action cannot be undone.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("deleting", "Deleting...")}
                </>
              ) : (
                t("confirm")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
  )
}

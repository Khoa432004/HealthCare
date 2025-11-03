"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { notificationService, Notification } from "@/services/notification.service"
import { webSocketService } from "@/services/websocket.service"
import { getUserInfo } from "@/lib/user-utils"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const [notifs, count] = await Promise.all([
        notificationService.getMyNotifications(),
        notificationService.getUnreadCount(),
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribersRef = useRef<Array<() => void>>([])

  const setupWebSocket = useCallback(() => {
    const userInfo = getUserInfo()
    if (!userInfo?.id) {
      return
    }

    try {
      webSocketService.connect()

      const unsubNotifications = webSocketService.subscribe(
        `/topic/notifications/${userInfo.id}`,
        (notification: Notification) => {
          setNotifications(prev => {
            const exists = prev.some(n => 
              n.notificationUserId === notification.notificationUserId || n.id === notification.id
            )
            if (exists) return prev
            return [notification, ...prev]
          })
          setUnreadCount(prev => prev + 1)
        }
      )

      const unsubCount = webSocketService.subscribe(
        `/topic/notifications/${userInfo.id}/count`,
        (count: number) => {
          setUnreadCount(Number(count))
        }
      )

      unsubscribersRef.current = [unsubNotifications, unsubCount]
    } catch (error) {
      console.error('Error setting up WebSocket:', error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const timer = setTimeout(() => {
      setupWebSocket()
    }, 500)
    
    return () => {
      clearTimeout(timer)
      unsubscribersRef.current.forEach(unsub => unsub())
      unsubscribersRef.current = []
    }
  }, [setupWebSocket])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Mark notification as read
  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead || !notification.notificationUserId) {
      return
    }

    try {
      await notificationService.markAsRead(notification.notificationUserId)
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationUserId === notification.notificationUserId
            ? {
                ...n,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : n
        )
      )
      
      // Decrement unread count
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Handle notification click - open dialog and mark as read
  const handleNotificationClick = async (notification: Notification) => {
    // Close dropdown
    setIsOpen(false)
    
    // Mark as read if not already read
    if (!notification.isRead && notification.notificationUserId) {
      try {
        await notificationService.markAsRead(notification.notificationUserId)
        
        // Update local state
        const updatedNotification = {
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        }
        
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationUserId === notification.notificationUserId
              ? updatedNotification
              : n
          )
        )
        
        // Decrement unread count
        setUnreadCount((prev) => Math.max(0, prev - 1))
        
        // Set selected notification with updated data
        setSelectedNotification(updatedNotification)
      } catch (error) {
        console.error("Error marking notification as read:", error)
        // Still open dialog even if mark as read fails
        setSelectedNotification(notification)
      }
    } else {
      // Already read, just set selected notification
      setSelectedNotification(notification)
    }
    
    // Open dialog
    setIsDialogOpen(true)
  }

  // Sync selected notification when notifications update
  useEffect(() => {
    if (selectedNotification && selectedNotification.notificationUserId) {
      const updated = notifications.find(
        (n) => n.notificationUserId === selectedNotification.notificationUserId
      )
      if (updated && updated.notificationUserId === selectedNotification.notificationUserId) {
        // Only update if something actually changed
        if (
          updated.isRead !== selectedNotification.isRead ||
          updated.readAt !== selectedNotification.readAt
        ) {
          setSelectedNotification(updated)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications])

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      )
      
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      // Simple time ago format (fallback if date-fns locale fails)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return "Vừa xong"
    }
  }

  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 p-0">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Thông báo</h3>
              {hasUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs h-auto py-1 px-2"
                >
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Đang tải...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Không có thông báo
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.notificationUserId || notification.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                      !notification.isRead && "bg-blue-50"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              "font-medium text-sm mb-1",
                              !notification.isRead && "font-semibold"
                            )}
                          >
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {notification.readAt && (
                            <span className="text-xs text-gray-400">
                              Đã đọc: {formatTimeAgo(notification.readAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notification Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-xl mb-2">
                      {selectedNotification.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>Người gửi: {selectedNotification.createdByName}</span>
                        <span className="text-gray-300">•</span>
                        <span>{formatTimeAgo(selectedNotification.createdAt)}</span>
                      </div>
                      {selectedNotification.readAt && (
                        <div className="text-xs">
                          Đã đọc: {formatTimeAgo(selectedNotification.readAt)}
                        </div>
                      )}
                      {!selectedNotification.isRead && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="text-blue-600 font-medium">Chưa đọc</span>
                        </div>
                      )}
                      {selectedNotification.isRead && (
                        <div className="text-xs text-green-600 font-medium">
                          ✓ Đã đọc
                        </div>
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="mt-4">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-lg border">
                    {selectedNotification.content}
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>
                      Loại: <span className="font-medium">{selectedNotification.type}</span>
                    </span>
                    {selectedNotification.targetRoles && selectedNotification.targetRoles.length > 0 && (
                      <span>
                        Đối tượng: <span className="font-medium">
                          {selectedNotification.targetRoles.join(", ")}
                        </span>
                      </span>
                    )}
                  </div>
                  <span>
                    {new Date(selectedNotification.createdAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}


import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Plus } from "lucide-react"

export function NotificationManagement() {
  const notifications = [
    {
      id: 1,
      title: "System Maintenance",
      message: "Scheduled maintenance on Sunday",
      type: "System",
      status: "Scheduled",
    },
    {
      id: 2,
      title: "New Feature Release",
      message: "Video consultation now available",
      type: "Feature",
      status: "Sent",
    },
    { id: 3, title: "Security Update", message: "Please update your password", type: "Security", status: "Draft" },
  ]

  return (
    <Card className="p-6 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
        <Button size="sm" className="bg-[#16a1bd] hover:bg-[#0d6171]">
          <Plus className="w-4 h-4 mr-2" />
          Create
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="p-2 bg-[#16a1bd]/10 rounded-lg">
              <Bell className="w-5 h-5 text-[#16a1bd]" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                <Badge variant="outline" className="bg-white">
                  {notification.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
              <span className="text-xs text-gray-500">{notification.type}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

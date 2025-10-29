import { Users, UserCheck, Activity, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"

export function AdminMetricsCards() {
  const metrics = [
    {
      title: "Total Users",
      value: "2,543",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Active Doctors",
      value: "342",
      change: "+8.2%",
      trend: "up",
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      title: "Total Appointments",
      value: "15,234",
      change: "+23.1%",
      trend: "up",
      icon: Activity,
      color: "bg-purple-500",
    },
    {
      title: "Revenue",
      value: "₫125M",
      change: "+15.3%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title} className="glass border-white/50 p-6 hover-lift">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">{metric.title}</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent mb-3">{metric.value}</p>
              <p className="text-sm text-green-600 font-semibold">{metric.change} vs last month</p>
            </div>
            <div className={`${metric.color} p-4 rounded-2xl shadow-soft-md`}>
              <metric.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

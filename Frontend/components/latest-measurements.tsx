"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter, Plus } from "lucide-react"
import { Scale, Ruler, Droplet, Activity, Zap, Heart, TestTube, Thermometer } from "lucide-react"

const measurements = [
  {
    icon: Scale,
    title: "Weight",
    value: "86",
    unit: "kg",
    time: "11:00",
    type: "Manual",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Ruler,
    title: "Height",
    value: "160",
    unit: "cm",
    time: "11:00",
    type: "Manual",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Droplet,
    title: "Blood Glucose",
    value: "115",
    unit: "mg/dL",
    time: "11:00",
    type: "Device",
    status: "High",
    statusColor: "bg-red-500",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Activity,
    title: "Hematocrit",
    value: "45",
    unit: "%",
    time: "11:00",
    type: "Device",
    status: "Normal",
    statusColor: "bg-green-500",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Zap,
    title: "Ketone",
    value: "0.7",
    unit: "mmol/L",
    time: "11:00",
    type: "Device",
    status: "Normal",
    statusColor: "bg-green-500",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: Heart,
    title: "Blood Pressure",
    value: "86",
    unit: "mmHg",
    time: "11:00",
    type: "Device",
    status: "Normal",
    statusColor: "bg-green-500",
    color: "bg-red-100 text-red-600",
  },
]

const previousMeasurements = [
  {
    date: "19 May",
    measurements: [
      {
        icon: TestTube,
        title: "Hemoglobin",
        value: "13.1",
        unit: "g/dL",
        time: "11:00",
        type: "Device",
        status: "Hope",
        statusColor: "bg-orange-500",
        color: "bg-blue-100 text-blue-600",
      },
      {
        icon: Activity,
        title: "Hematocrit",
        value: "45",
        unit: "%",
        time: "11:00",
        type: "Device",
        status: "Normal",
        statusColor: "bg-green-500",
        color: "bg-purple-100 text-purple-600",
      },
    ],
  },
  {
    date: "18 May",
    measurements: [
      {
        icon: Droplet,
        title: "Blood Glucose",
        value: "115",
        unit: "mg/dL",
        time: "11:00",
        type: "Device",
        status: "High",
        statusColor: "bg-red-500",
        color: "bg-blue-100 text-blue-600",
      },
      {
        icon: Thermometer,
        title: "Cholesterol",
        value: "86",
        unit: "mg/dL",
        time: "11:00",
        type: "Device",
        status: "Normal",
        statusColor: "bg-green-500",
        color: "bg-green-100 text-green-600",
      },
      {
        icon: TestTube,
        title: "Uric Acid",
        value: "86",
        unit: "mg/dL",
        time: "11:00",
        type: "Device",
        status: "Normal",
        statusColor: "bg-green-500",
        color: "bg-purple-100 text-purple-600",
      },
      {
        icon: Heart,
        title: "Blood Pressure",
        value: "86",
        unit: "mmHg",
        time: "11:00",
        type: "Device",
        status: "Normal",
        statusColor: "bg-green-500",
        color: "bg-red-100 text-red-600",
      },
    ],
  },
]

export function LatestMeasurements() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Latest measurements</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" className="gradient-primary text-white shadow-soft hover:shadow-soft-md transition-smooth">
              <Plus className="w-4 h-4 mr-2" />
              Add Measurement
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Measurements */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Today</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {measurements.map((measurement, index) => {
              const Icon = measurement.icon
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg ${measurement.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{measurement.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{measurement.time}</span>
                          <span>•</span>
                          <span>{measurement.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-4 flex-shrink-0">
                      <div className="text-lg font-semibold text-gray-900">
                        {measurement.value}
                        <span className="text-sm font-normal text-gray-500 ml-1">{measurement.unit}</span>
                      </div>
                      {measurement.status && (
                        <Badge className={`${measurement.statusColor} text-white text-xs mt-1 px-3 py-1`}>
                          {measurement.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Previous Measurements */}
        {previousMeasurements.map((day, dayIndex) => (
          <div key={dayIndex}>
            <h3 className="font-medium text-gray-900 mb-4">{day.date}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {day.measurements.map((measurement, index) => {
                const Icon = measurement.icon
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg ${measurement.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 truncate">{measurement.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{measurement.time}</span>
                            <span>•</span>
                            <span>{measurement.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-4 flex-shrink-0">
                        <div className="text-lg font-semibold text-gray-900">
                          {measurement.value}
                          <span className="text-sm font-normal text-gray-500 ml-1">{measurement.unit}</span>
                        </div>
                        {measurement.status && (
                          <Badge className={`${measurement.statusColor} text-white text-xs mt-1 px-3 py-1`}>
                            {measurement.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

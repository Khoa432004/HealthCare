"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts"

const data = [
  { name: "Completed", value: 53, color: "#16a1bd", percentage: "81%" },
  { name: "Pending", value: 10, color: "#F59E0B", percentage: "15%" },
  { name: "Cancel", value: 2, color: "#EF4444", percentage: "3%" },
]

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
    </g>
  )
}

export default function AppointmentStatusChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  const centerLabel = activeIndex !== null ? data[activeIndex].name : "Completed"
  const centerValue = activeIndex !== null ? data[activeIndex].value : 53

  return (
    <div className="glass rounded-3xl shadow-soft-lg border-white/50 p-6 h-full hover-lift">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#16a1bd] to-[#0d6171] bg-clip-text text-transparent">Appointment Status Breakdown</h3>
        <span className="text-sm text-gray-500 font-medium">In month</span>
      </div>

      <div className="relative h-56 mb-6">
        {activeIndex !== null && (
          <div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white px-4 py-2 rounded-lg shadow-lg z-10 pointer-events-none"
            style={{ backgroundColor: data[activeIndex].color }}
          >
            <div className="text-sm font-medium whitespace-nowrap">
              {data[activeIndex].name}: {data[activeIndex].value}
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={renderActiveShape}
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="cursor-pointer transition-all duration-200"
                  style={{ opacity: 1 }}
                />
              ))}
            </Pie>
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" dy="-0.5em" className="text-sm font-medium fill-gray-600">
                {centerLabel}
              </tspan>
              <tspan x="50%" dy="1.5em" className="text-2xl font-bold fill-gray-900">
                {centerValue}
              </tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between glass rounded-xl p-3 hover:bg-white transition-smooth">
            <div className="flex items-center space-x-3">
              <div className="w-3.5 h-3.5 rounded-full shadow-soft" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-700 font-medium">{item.name}:</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{item.value} visits</span>
          </div>
        ))}
      </div>
    </div>
  )
}

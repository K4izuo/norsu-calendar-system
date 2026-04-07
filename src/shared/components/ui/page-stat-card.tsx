"use client"

import type { LucideIcon } from "lucide-react"

type StatColor = "gray" | "amber" | "green" | "red" | "blue" | "orange"

interface PageStatCardProps {
  title: string
  value: number
  subLabel: string
  icon: LucideIcon
  color: StatColor
}

const colorMap: Record<StatColor, { strip: string; icon: string }> = {
  gray:   { strip: "bg-gray-400",   icon: "text-gray-500" },
  amber:  { strip: "bg-amber-400",  icon: "text-amber-600" },
  green:  { strip: "bg-green-500",  icon: "text-green-600" },
  red:    { strip: "bg-red-400",    icon: "text-red-500" },
  blue:   { strip: "bg-blue-400",   icon: "text-blue-500" },
  orange: { strip: "bg-orange-400", icon: "text-orange-500" },
}

export function PageStatCard({ title, value, subLabel, icon: Icon, color }: PageStatCardProps) {
  const { strip, icon: iconColor } = colorMap[color]
  return (
    <div className="bg-white rounded-xl border shadow-xs overflow-hidden">
      <div className={`h-1 w-full ${strip}`} />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          <span className="text-sm font-medium text-gray-500">{title}</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-1.5">{subLabel}</p>
      </div>
    </div>
  )
}

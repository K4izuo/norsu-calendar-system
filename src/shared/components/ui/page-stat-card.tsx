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

const colorMap: Record<StatColor, { iconBg: string; iconColor: string }> = {
  gray:   { iconBg: "bg-gray-100",   iconColor: "text-gray-500" },
  amber:  { iconBg: "bg-amber-100",  iconColor: "text-amber-600" },
  green:  { iconBg: "bg-green-100",  iconColor: "text-green-600" },
  red:    { iconBg: "bg-red-100",    iconColor: "text-red-500" },
  blue:   { iconBg: "bg-blue-100",   iconColor: "text-blue-500" },
  orange: { iconBg: "bg-orange-100", iconColor: "text-orange-500" },
}

export function PageStatCard({ title, value, subLabel, icon: Icon, color }: PageStatCardProps) {
  const { iconBg, iconColor } = colorMap[color]
  return (
    <div className="relative flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-xs border">
      {/* Icon — absolute top-right, never affects text flow */}
      <div className={`absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>

      {/* Title */}
      <span className="pr-16 text-sm font-medium text-gray-400">{title}</span>

      {/* Value */}
      <p className="text-4xl font-bold tracking-tight text-gray-900">{value}</p>

      {/* Sub label */}
      <p className="text-xs text-gray-400">{subLabel}</p>
    </div>
  )
}

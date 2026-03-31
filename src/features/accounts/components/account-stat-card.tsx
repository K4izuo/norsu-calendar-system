"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type AccentColor = "indigo" | "orange" | "rose" | "teal";

interface AccountStatCardProps {
  title: string;
  value: string | number;
  badge: string;
  badgePositive: boolean;
  subLabel: string;
  icon: React.ElementType;
  accentColor: AccentColor;
}

const accentStyles: Record<AccentColor, { iconBg: string; iconColor: string }> = {
  indigo: { iconBg: "bg-indigo-100", iconColor: "text-indigo-500" },
  orange: { iconBg: "bg-orange-100", iconColor: "text-orange-500" },
  rose: { iconBg: "bg-rose-100", iconColor: "text-rose-500" },
  teal: { iconBg: "bg-teal-100", iconColor: "text-teal-500" },
};

const AccountStatCard: React.FC<AccountStatCardProps> = ({
  title,
  value,
  badge,
  badgePositive,
  subLabel,
  icon: Icon,
  accentColor,
}) => {
  const TrendIcon = badgePositive ? TrendingUp : TrendingDown;
  const { iconBg, iconColor } = accentStyles[accentColor];
  const badgeClasses = badgePositive
    ? "bg-green-100 text-green-600"
    : "bg-red-100 text-red-500";

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

      {/* Badge + label */}
      <div className="flex items-center gap-2">
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClasses}`}>
          <TrendIcon className="h-3 w-3" />
          {badge}
        </span>
        <span className="text-xs text-gray-400">{subLabel}</span>
      </div>
    </div>
  );
};

export default AccountStatCard;

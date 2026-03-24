"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AccountStatCardProps {
  title: string;
  value: string | number;
  badge: string;
  badgePositive: boolean;
  trendLabel: string;
  subLabel: string;
}

const AccountStatCard: React.FC<AccountStatCardProps> = ({
  title,
  value,
  badge,
  badgePositive,
  trendLabel,
  subLabel,
}) => {
  const TrendIcon = badgePositive ? TrendingUp : TrendingDown;
  const badgeClasses = badgePositive
    ? "bg-green-500/10 text-green-400"
    : "bg-red-500/10 text-red-400";
  const iconColor = badgePositive ? "text-green-400" : "text-red-400";

  return (
    <div className="flex text-card-foreground flex-col gap-3 rounded-xl bg-white p-6 shadow-xs border">
      {/* Title + badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClasses}`}
        >
          <TrendIcon className={`h-3 w-3 ${iconColor}`} />
          {badge}
        </span>
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-800">{value}</p>

      {/* Trend label + sub label */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-gray-800">{trendLabel}</span>
          <TrendIcon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <span className="text-xs text-gray-500">{subLabel}</span>
      </div>
    </div>
  );
};

export default AccountStatCard;

"use client";

import React, { useId } from "react";
import {
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  Clock3,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/core/lib/utils";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  badge: string;
  badgePositive: boolean;
  sparklineData?: number[];
}

const positiveSparkline = [
  { value: 18 },
  { value: 22 },
  { value: 14 },
  { value: 25 },
  { value: 21 },
  { value: 29 },
  { value: 33 },
  { value: 27 },
  { value: 36 },
  { value: 32 },
  { value: 39 },
  { value: 42 },
];

const negativeSparkline = [
  { value: 42 },
  { value: 38 },
  { value: 40 },
  { value: 31 },
  { value: 34 },
  { value: 28 },
  { value: 24 },
  { value: 26 },
  { value: 20 },
  { value: 18 },
  { value: 15 },
  { value: 12 },
];

const getStatIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("user")) return Users;
  if (t.includes("approved")) return CalendarCheck2;
  if (t.includes("upcoming")) return Clock3;
  if (t.includes("request")) return ClipboardList;
  return CalendarDays;
};

const getStatIconClasses = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("user")) return "bg-blue-50 text-blue-600";
  if (t.includes("approved")) return "bg-emerald-50 text-emerald-600";
  if (t.includes("upcoming")) return "bg-amber-50 text-amber-600";
  if (t.includes("request")) return "bg-rose-50 text-rose-600";
  return "bg-violet-50 text-violet-600";
};

const getStatAccentColor = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("user")) return "#2563eb";
  if (t.includes("approved")) return "#059669";
  if (t.includes("upcoming")) return "#d97706";
  if (t.includes("request")) return "#e11d48";
  return "#7c3aed";
};

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  badge,
  badgePositive,
  sparklineData,
}) => {
  const TrendIcon = badgePositive ? TrendingUp : TrendingDown;
  const StatIcon = getStatIcon(title);
  const gradientId = useId().replace(/:/g, "");
  const chartData = sparklineData
    ? sparklineData.map((v) => ({ value: v }))
    : badgePositive
    ? positiveSparkline
    : negativeSparkline;
  const trendColor = getStatAccentColor(title);
  const trendClasses = badgePositive ? "text-emerald-600" : "text-red-600";
  const iconClasses = getStatIconClasses(title);

  return (
    <div
      className="group relative flex min-h-[160px] flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-all duration-300 hover:border-primary/20 hover:shadow-md"
      aria-label={`${title}: ${value}, ${badge} vs last month`}
    >
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 space-y-2">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <TrendIcon
                className={cn("h-3.5 w-3.5 shrink-0", trendClasses)}
                aria-hidden="true"
              />
              <span className={cn("text-sm font-semibold", trendClasses)}>
                {badge}
              </span>
              <span className="text-sm text-muted-foreground">
                vs last month
              </span>
            </div>
          </div>

          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] transition-transform duration-300 group-hover:scale-110",
              iconClasses
            )}
          >
            <StatIcon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="mt-auto h-16 w-full" aria-label={`${title} trend chart`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={trendColor} stopOpacity={0.16} />
                <stop offset="100%" stopColor={trendColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              cursor={{
                stroke: trendColor,
                strokeOpacity: 0.2,
                strokeWidth: 1,
              }}
              wrapperStyle={{ outline: "none" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;

                return (
                  <div className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-md">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: trendColor }}
                    />
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-semibold text-foreground">
                      {payload[0]?.value?.toLocaleString()}
                    </span>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={trendColor}
              strokeWidth={1.75}
              fill={`url(#${gradientId})`}
              fillOpacity={1}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#ffffff",
                stroke: trendColor,
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardStatCard;

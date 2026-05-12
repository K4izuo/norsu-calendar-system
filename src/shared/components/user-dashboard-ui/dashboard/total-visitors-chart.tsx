"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useReservations } from "@/features/calendar/services/reservation-service";
import { useAuth } from "@/shared/components/context/auth-context";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";

type TimeRange = "90d" | "30d" | "7d";

const timeRangeConfig: Record<TimeRange, { label: string; days: number }> = {
  "90d": { label: "Last 3 months", days: 90 },
  "30d": { label: "Last 30 days", days: 30 },
  "7d": { label: "Last 7 days", days: 7 },
};

const chartConfig = {
  approved: { label: "Approved", color: "hsl(220 8% 30%)" },
  pending: { label: "Pending", color: "hsl(220 8% 70%)" },
} satisfies ChartConfig;

export default function ReservationActivityChart() {
  const [activeRange, setActiveRange] = React.useState<TimeRange>("7d");
  const { reservations } = useReservations();
  const { user } = useAuth();
  const isAdmin = user?.role === 3;

  const chartData = React.useMemo(() => {
    const days = timeRangeConfig[activeRange].days;
    const userId = user ? Number(user.id) : null;

    const toLocalDateStr = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const dateMap: Record<string, { approved: number; pending: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateMap[toLocalDateStr(d)] = { approved: 0, pending: 0 };
    }

    for (const r of reservations) {
      if (!isAdmin && userId !== null && r.reserved_by_user?.id !== userId) continue;
      const dateStr = r.created_at ? toLocalDateStr(new Date(r.created_at)) : null;
      if (!dateStr || !(dateStr in dateMap)) continue;
      const status = r.status?.toUpperCase();
      if (status === "APPROVED") {
        dateMap[dateStr].approved++;
      } else if (status === "PENDING") {
        dateMap[dateStr].pending++;
      }
    }

    return Object.entries(dateMap).map(([date, counts]) => ({ date, ...counts }));
  }, [reservations, activeRange, isAdmin, user]);

  const subtitleMap: Record<TimeRange, string> = {
    "90d": "Total reservations for the last 3 months",
    "30d": "Total reservations for the last 30 days",
    "7d": "Total reservations for the last 7 days",
  };

  return (
    <div className="rounded-md text-card-foreground border shadow-xs bg-white p-6 w-full flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <h2 className="text-base font-bold text-gray-900">Reservation Activity</h2>
          <p className="text-sm text-gray-500 mt-0.5">{subtitleMap[activeRange]}</p>
        </div>

        {/* Toggle buttons */}
        <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
          {(["90d", "30d", "7d"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                activeRange === range
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {timeRangeConfig[range].label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="w-full flex-1 min-h-0">
        <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="fillApproved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(220 8% 30%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(220 8% 30%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(220 8% 70%)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="hsl(220 8% 70%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                indicator="dot"
              />
            }
          />
          <Area
            dataKey="pending"
            type="monotone"
            fill="url(#fillPending)"
            stroke="hsl(220 8% 68%)"
            strokeWidth={1.5}
            stackId="a"
          />
          <Area
            dataKey="approved"
            type="monotone"
            fill="url(#fillApproved)"
            stroke="hsl(220 8% 35%)"
            strokeWidth={1.5}
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

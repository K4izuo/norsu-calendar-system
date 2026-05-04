"use client";

import DashboardStatCard from "@/shared/components/user-dashboard-ui/dashboard/stat-card";
import ReservationActivityChart from "@/shared/components/user-dashboard-ui/dashboard/total-visitors-chart";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { usePageReady } from "@/shared/components/context/page-loading-context";
import { useReservations } from "@/features/calendar/services/reservation-service";

export default function DashboardPage() {
  const { loading, isFetching, isStale } = useReservations();
  usePageReady(loading, isFetching, isStale);
  return (
    <div className="flex flex-col items-start self-stretch flex-1 min-h-0">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[
          { label: "Dashboard" }
        ]}
      />

      <div className="flex flex-col items-start gap-6 flex-1 self-stretch min-h-0">
        {/* Card row - now a responsive grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatCard
            title="Total Users"
            value="3,000"
            badge="+12.5%"
            badgePositive={true}
          />
          <DashboardStatCard
            title="Total Events"
            value="1,200"
            badge="+8.2%"
            badgePositive={true}
          />
          <DashboardStatCard
            title="Upcoming Events"
            value="8"
            badge="+4.5%"
            badgePositive={true}
          />
          <DashboardStatCard
            title="Pending Requests"
            value="15"
            badge="-20%"
            badgePositive={false}
          />
        </div>

        {/* Total Visitors chart */}
        <ReservationActivityChart />
      </div>
    </div>
  );
}

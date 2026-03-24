"use client";

import DashboardStatCard from "@/shared/components/user-dashboard-ui/dashboard/stat-card";
import AdminAssetsChart from "@/shared/components/user-dashboard-ui/dashboard/assets-line-chart";
import AdminUsersChart from "@/shared/components/user-dashboard-ui/dashboard/users-bar-chart";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-start self-stretch">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[
          { label: "Dashboard" }
        ]}
      />

      <div className="flex flex-col items-start gap-9 flex-1 self-stretch">
        {/* Card row - now a responsive grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatCard
            title="Total Users"
            value="3,000"
            badge="+12.5%"
            badgePositive={true}
            trendLabel="Trending up this month"
            subLabel="Registered users in the system"
          />
          <DashboardStatCard
            title="Total Events"
            value="1,200"
            badge="+8.2%"
            badgePositive={true}
            trendLabel="More events this month"
            subLabel="All approved calendar events"
          />
          <DashboardStatCard
            title="Upcoming Events"
            value="8"
            badge="+4.5%"
            badgePositive={true}
            trendLabel="Scheduled ahead"
            subLabel="Events within the next 7 days"
          />
          <DashboardStatCard
            title="Pending Requests"
            value="15"
            badge="-20%"
            badgePositive={false}
            trendLabel="Needs attention"
            subLabel="Reservations awaiting approval"
          />
        </div>

        {/* line charts and bar charts div */}
        <div className="flex gap-6 w-full">
          <AdminAssetsChart />
          <AdminUsersChart />
        </div>
      </div>
    </div>
  );
}

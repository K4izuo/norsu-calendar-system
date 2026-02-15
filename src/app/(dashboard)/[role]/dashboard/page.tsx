"use client";

import { UsersRound, Calendar } from "lucide-react";
import DashboardStatCard from "@/shared/components/user-dashboard-ui/dashboard/stat-card";
import AdminAssetsChart from "@/shared/components/user-dashboard-ui/dashboard/assets-line-chart";
import AdminUsersChart from "@/shared/components/user-dashboard-ui/dashboard/users-bar-chart";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
// import { useParams } from "next/navigation";

export default function DashboardPage() {
  // const params = useParams();
  // const role = params.role as string;

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
            title="TOTAL USERS"
            value="3,000"
            borderColor="#4E73DF"
            titleColor="#4E73DF"
            icon={<UsersRound className="w-8 h-8 text-gray-300" />}
          />
          <DashboardStatCard
            title="TOTAL EVENTS"
            value="1,200"
            borderColor="#4edf88"
            titleColor="#4edf88"
            icon={<Calendar className="w-8 h-8 text-gray-300" />}
          />
          <DashboardStatCard
            title="UPCOMING EVENTS"
            value="8"
            borderColor="#fbbf24"
            titleColor="#fbbf24"
            icon={<Calendar className="w-8 h-8 text-gray-300" />}
          />
          <DashboardStatCard
            title="PENDING REQUESTS"
            value="15"
            borderColor="#f87171"
            titleColor="#f87171"
            icon={<UsersRound className="w-8 h-8 text-gray-300" />}
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

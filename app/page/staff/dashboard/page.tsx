import { UsersRound, Calendar } from "lucide-react";
import DashboardStatCard from "@/components/admin-ui/dashboard/stat-card";
import AdminAssetsChart from "@/components/admin-ui/dashboard/assets-line-chart";
import AdminUsersChart from "@/components/admin-ui/dashboard/users-bar-chart";

export default function AdminDashboardTab() {
  return (
    <div className="flex flex-col items-start self-stretch">
      {/* Dashboard Title */}
      <div className="flex items-center mb-5 gap-x-2">
        <span className="text-2xl font-normal text-gray-500">Home /</span>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      </div>
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

"use client";

import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import AccountStatCard from "@/shared/components/user-dashboard-ui/accounts/account-stat-card";
import { useParams } from "next/navigation";

export default function AccountsPage() {
  const params = useParams();
  const role = params.role as string;

  return (
    <div className="flex flex-col items-start self-stretch">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "Accounts" },
        ]}
      />

      <div className="flex flex-col items-start gap-9 flex-1 self-stretch">
        {/* Stat cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AccountStatCard
            title="Total Accounts"
            value="0"
            badge="+0%"
            badgePositive={true}
            trendLabel="All registered users"
            subLabel="System-wide account count"
          />
          <AccountStatCard
            title="Dean Accounts"
            value="0"
            badge="+0%"
            badgePositive={true}
            trendLabel="Dean users"
            subLabel="Role-based dean accounts"
          />
          <AccountStatCard
            title="Staff Accounts"
            value="0"
            badge="+0%"
            badgePositive={true}
            trendLabel="Administrative staff"
            subLabel="Role-based staff members"
          />
          <AccountStatCard
            title="New This Month"
            value="0"
            badge="+0%"
            badgePositive={true}
            trendLabel="Recently registered"
            subLabel="Accounts added this month"
          />
        </div>
      </div>
    </div>
  );
}

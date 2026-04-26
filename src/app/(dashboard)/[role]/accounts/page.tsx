"use client";

import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import AccountStatCard from "@/features/accounts/components/account-stat-card";
import { Users, GraduationCap, Briefcase, UserPlus } from "lucide-react";
import { AccountsTabSection } from "@/features/accounts/components/accounts-tab-section";
import { useParams } from "next/navigation";
import { useUsers } from "@/features/accounts/services/account-service";
import { usePageReady } from "@/shared/components/context/page-loading-context";
import { Skeleton, TableSkeleton } from "@/shared/components/ui/skeleton";

export default function AccountsPage() {
  const params = useParams();
  const role = params.role as string;

  // React Query deduplicates this — no extra network request vs AccountsTabSection
  const { users, loading } = useUsers();
  usePageReady(loading);

  const total = users.length;
  const deans = users.filter((u) => u.role === 1);
  const staff = users.filter((u) => u.role === 2);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const newThisMonth = users.filter(
    (u) => u.created_at && new Date(u.created_at) >= startOfMonth
  );

  const pct = (count: number) =>
    total > 0 ? `${Math.round((count / total) * 100)}% of total` : "0% of total";

  return (
    <div className="flex flex-col items-start self-stretch h-full">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "Accounts" },
        ]}
      />

      <div className="flex flex-col items-start gap-6 flex-1 self-stretch min-h-0">
        {loading && users.length === 0 ? (
          <>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-27.5 w-full" />
              ))}
            </div>
            <TableSkeleton rows={5} />
          </>
        ) : (
          <>
            {/* Stat cards */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AccountStatCard
                title="Total Accounts"
                value={total}
                badge={newThisMonth.length > 0 ? `+${newThisMonth.length} new` : "0 new"}
                badgePositive={newThisMonth.length > 0}
                subLabel="From this month"
                icon={Users}
                accentColor="indigo"
              />
              <AccountStatCard
                title="Dean Accounts"
                value={deans.length}
                badge={pct(deans.length)}
                badgePositive={deans.length > 0}
                subLabel="Of total accounts"
                icon={GraduationCap}
                accentColor="orange"
              />
              <AccountStatCard
                title="Staff Accounts"
                value={staff.length}
                badge={pct(staff.length)}
                badgePositive={staff.length > 0}
                subLabel="Of total accounts"
                icon={Briefcase}
                accentColor="rose"
              />
              <AccountStatCard
                title="New This Month"
                value={newThisMonth.length}
                badge={newThisMonth.length > 0 ? `+${newThisMonth.length} this month` : "0 this month"}
                badgePositive={newThisMonth.length > 0}
                subLabel="Recently registered"
                icon={UserPlus}
                accentColor="teal"
              />
            </div>

            {/* Tab section */}
            <div className="flex-1 min-h-0 w-full">
              <AccountsTabSection />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

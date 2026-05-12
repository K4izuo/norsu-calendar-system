"use client";

import DashboardStatCard from "@/shared/components/user-dashboard-ui/dashboard/stat-card";
import ReservationActivityChart from "@/shared/components/user-dashboard-ui/dashboard/total-visitors-chart";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { usePageReady } from "@/shared/components/context/page-loading-context";
import { useReservations } from "@/features/calendar/services/reservation-service";
import { useDashboardStats } from "@/features/dashboard/services/dashboard-service";
import { useAuth } from "@/shared/components/context/auth-context";

const fmt = (n: number) => (n >= 0 ? `+${n}%` : `${n}%`);

export default function DashboardPage() {
  const { user } = useAuth();
  const { loading, isFetching } = useReservations();
  const { stats, loading: statsLoading } = useDashboardStats();
  usePageReady(loading || statsLoading, isFetching);

  const isAdmin = stats?.is_admin ?? user?.role === 3;

  return (
    <div className="flex flex-col items-start self-stretch flex-1 min-h-0">
      <PageBreadcrumb items={[{ label: "Dashboard" }]} />

      <div className="flex flex-col items-start gap-6 flex-1 self-stretch min-h-0">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isAdmin ? (
            <>
              <DashboardStatCard
                title="Total Users"
                value={stats ? stats.total_users!.toLocaleString() : "—"}
                badge={stats ? fmt(stats.total_users_change!) : "—"}
                badgePositive={(stats?.total_users_change ?? 0) >= 0}
                sparklineData={stats?.sparklines.users ?? undefined}
              />
              <DashboardStatCard
                title="Total Events"
                value={stats ? stats.total_events.toLocaleString() : "—"}
                badge={stats ? fmt(stats.total_events_change) : "—"}
                badgePositive={(stats?.total_events_change ?? 0) >= 0}
                sparklineData={stats?.sparklines.events}
              />
              <DashboardStatCard
                title="Upcoming Events"
                value={stats ? stats.upcoming_events.toLocaleString() : "—"}
                badge={stats ? fmt(stats.upcoming_events_change) : "—"}
                badgePositive={(stats?.upcoming_events_change ?? 0) >= 0}
                sparklineData={stats?.sparklines.upcoming}
              />
              <DashboardStatCard
                title="Pending Requests"
                value={stats ? stats.pending_requests.toLocaleString() : "—"}
                badge={stats ? fmt(stats.pending_requests_change) : "—"}
                badgePositive={(stats?.pending_requests_change ?? 0) >= 0}
                sparklineData={stats?.sparklines.pending}
              />
            </>
          ) : (
            <>
              <DashboardStatCard
                title="My Reservations"
                value={stats ? stats.total_events.toLocaleString() : "—"}
                badge={stats ? fmt(stats.total_events_change) : "—"}
                badgePositive={(stats?.total_events_change ?? 0) >= 0}
                sparklineData={stats?.sparklines.events}
              />
              <DashboardStatCard
                title="Approved Events"
                value={stats ? stats.approved_events!.toLocaleString() : "—"}
                badge={stats ? fmt(stats.approved_events_change!) : "—"}
                badgePositive={(stats?.approved_events_change ?? 0) >= 0}
                sparklineData={stats?.sparklines.approved ?? undefined}
              />
              <DashboardStatCard
                title="Upcoming Events"
                value={stats ? stats.upcoming_events.toLocaleString() : "—"}
                badge={stats ? fmt(stats.upcoming_events_change) : "—"}
                badgePositive={(stats?.upcoming_events_change ?? 0) >= 0}
                sparklineData={stats?.sparklines.upcoming}
              />
              <DashboardStatCard
                title="Pending Requests"
                value={stats ? stats.pending_requests.toLocaleString() : "—"}
                badge={stats ? fmt(stats.pending_requests_change) : "—"}
                badgePositive={(stats?.pending_requests_change ?? 0) >= 0}
                sparklineData={stats?.sparklines.pending}
              />
            </>
          )}
        </div>

        <ReservationActivityChart />
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { ReservationsTable } from "@/shared/components/user-dashboard-ui/reservations/reservation-table";
import { EventDetails } from "@/interface/user-props";
import { useReservations, useAssets } from "@/features/calendar/services/reservation-service";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { PageStatCard } from "@/shared/components/ui/page-stat-card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { CalendarDays, Clock, CircleCheck, XCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function ReservationsPage() {
  const params = useParams();
  const role = params.role as string;
  const [statusFilter, setStatusFilter] = useState("pending");

  const { reservations, error, loading } = useReservations();

  const total = reservations.length;
  const pending = reservations.filter((r) => r.status.toUpperCase() === "PENDING").length;
  const approved = reservations.filter((r) => r.status.toUpperCase() === "APPROVED").length;
  const declined = reservations.filter((r) => r.status.toUpperCase() === "DECLINED").length;

  // Get unique asset IDs from reservations
  const assetIds = useMemo(() => {
    return [...new Set(reservations.map(r => r.asset_id))];
  }, [reservations]);

  // Fetch assets using TanStack Query
  const { assets } = useAssets(assetIds);

  // Convert reservations to events format
  const events: EventDetails[] = useMemo(() => {
    return reservations.map(reservation => {
      const asset = assets.get(reservation.asset_id);

      return {
        id: reservation.id,
        title_name: reservation.title_name,
        date: reservation.date,
        time_start: reservation.time_start,
        time_end: reservation.time_end,
        asset: {
          id: reservation.asset_id,
          asset_name: asset?.asset_name || `Asset #${reservation.asset_id}`,
          capacity: asset?.capacity || 0,
        },
        category: reservation.category,
        other_category: reservation.other_category,
        info_type: reservation.info_type,
        description: reservation.description,
        people_tag: reservation.people_tag.split(", "),
        range: reservation.range,
        registration_status: reservation.status.toUpperCase() as "PENDING" | "APPROVED" | "DECLINED",
        registration_deadline: reservation.date,
        reserved_by_user: reservation.reserved_by_user,
        reserve_by_user: reservation.reserved_by_user
          ? `${reservation.reserved_by_user.first_name} ${reservation.reserved_by_user.last_name}`
          : "Unknown User",
        approved_by_user_details: reservation.approved_by_user,
        declined_by_user_details: reservation.declined_by_user,
        equipment: reservation.equipment,
        outsource: reservation.outsource,
        guests: reservation.guests,
      };
    });
  }, [reservations, assets]);

  return (
    <div className="flex flex-col items-start self-stretch h-full">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "Reservations" },
        ]}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex flex-col items-start gap-6 flex-1 self-stretch min-h-0">
        {loading && reservations.length === 0 ? (
          <>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-27.5 w-full" />
              ))}
            </div>
          </>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PageStatCard title="Total Reservations" value={total} subLabel="All submitted reservations" icon={CalendarDays} color="gray" />
            <PageStatCard title="Pending" value={pending} subLabel="Awaiting approval" icon={Clock} color="amber" />
            <PageStatCard title="Approved" value={approved} subLabel="Confirmed reservations" icon={CircleCheck} color="green" />
            <PageStatCard title="Declined" value={declined} subLabel="Rejected reservations" icon={XCircle} color="red" />
          </div>
        )}

        <div className="flex-1 min-h-0 w-full">
          <ReservationsTable
            events={events}
            isLoading={loading}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      </div>
    </div>
  );
}

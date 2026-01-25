"use client";

import { useMemo } from "react";
import { ReservationsTable } from "@/components/user-dashboard-ui/reservations/reservation-table";
import { EventDetails } from "@/interface/user-props";
import { useReservations, useAssets } from "@/services/reservation-service";
import Loading from "../loading";

export default function ReservationsPage() {
  // Fetch reservations using TanStack Query - smart caching!
  const { reservations, loading, error } = useReservations();

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

      const formattedDate = new Date(reservation.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      return {
        id: reservation.id,
        title_name: reservation.title_name,
        date: formattedDate,
        time_start: formatTime(reservation.time_start),
        time_end: formatTime(reservation.time_end),
        asset: {
          id: reservation.asset_id,
          asset_name: asset?.asset_name || `Asset #${reservation.asset_id}`,
          capacity: asset?.capacity || 0,
        },
        category: reservation.category,
        info_type: reservation.info_type,
        description: reservation.description,
        people_tag: reservation.people_tag.split(", "),
        range: reservation.range,
        registration_status: reservation.status.toUpperCase() as "PENDING" | "APPROVED" | "DECLINED",
        registration_deadline: reservation.date,
        // Map the user details from API
        reserved_by_user: reservation.reserved_by_user,
        // Fix: Better fallback that shows "Unknown User" if reserved_by_user is missing
        reserve_by_user: reservation.reserved_by_user
          ? `${reservation.reserved_by_user.first_name} ${reservation.reserved_by_user.last_name}`
          : "Unknown User",
        // Fix: Map approval/decline details with correct field names from API
        approved_by_user_details: reservation.approved_by_user,
        declined_by_user_details: reservation.declined_by_user,
      };
    });
  }, [reservations, assets]);

  return (
    <div className="flex flex-col max-w-full">
      {loading && <Loading />}
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Pass events instead of reservations */}
      <ReservationsTable events={events} role="admin" isLoading={loading} />
    </div>
  );
}
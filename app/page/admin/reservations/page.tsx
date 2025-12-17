"use client";

import { useEffect, useState, useMemo } from "react";
import { ReservationsTable } from "@/components/admin-ui/reservations/custom-table";
import { apiClient } from "@/lib/api-client";
import { EventDetails, ReservationWithRelations } from "@/interface/user-props";

interface Asset {
  id: number;
  asset_name: string;
  capacity: number;
}

export default function ReservationsPage() {
  const [allReservations, setAllReservations] = useState<ReservationWithRelations[]>([]);
  const [assets, setAssets] = useState<Map<number, Asset>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reservations - only runs once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch reservations
        const response = await apiClient.get<ReservationWithRelations[]>("/reservations/all");

        if (response.error) {
          setError(response.error);
          return;
        }

        if (response.data && Array.isArray(response.data)) {
          setAllReservations(response.data);

          // Fetch assets for these reservations
          const assetIds = [...new Set(response.data.map(r => r.asset_id))];

          if (assetIds.length > 0) {
            const assetPromises = assetIds.map(id =>
              apiClient.get<Asset[]>(`/reservations/${id}`)
            );

            const assetResponses = await Promise.all(assetPromises);

            const newAssets = new Map<number, Asset>();
            assetResponses.forEach((response, index) => {
              if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const asset = response.data[0];
                newAssets.set(assetIds[index], asset);
              }
            });

            setAssets(newAssets);
          }
        } else {
          setError("Unexpected response format from server");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`Error fetching reservations: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency - only run once on mount

  // Convert reservations to events format
  const events: EventDetails[] = useMemo(() => {
    return allReservations.map(reservation => {
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
        info_type: reservation.info_type,
        description: reservation.description,
        people_tag: reservation.people_tag.split(", "),
        range: reservation.range,
        registration_status: reservation.status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED",
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
  }, [allReservations, assets]);

  return (
    <div className="flex flex-col max-w-full">
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
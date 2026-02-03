import { ReservationWithRelations } from "@/interface/user-props";

interface ConflictCheckParams {
  assetId: number;
  date: string; // YYYY-MM-DD format
  timeStart: string; // HH:mm format
  timeEnd: string; // HH:mm format
  reservations: ReservationWithRelations[];
  excludeId?: number; // For edit mode, exclude the current reservation
}

export interface ConflictingReservation {
  id: number;
  title_name: string;
  time_start: string;
  time_end: string;
  reserved_by_user: string;
}

/**
 * Checks if a time range overlaps with existing reservations
 * @returns Array of conflicting reservations
 */
export const checkReservationConflicts = ({
  assetId,
  date,
  timeStart,
  timeEnd,
  reservations,
  excludeId
}: ConflictCheckParams): ConflictingReservation[] => {
  // Normalize time format to HH:mm for comparison
  const normalizeTime = (time: string): string => {
    if (!time) return "00:00";
    // Remove seconds if present (HH:mm:ss -> HH:mm)
    const parts = time.split(":");
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  };

  const newStart = normalizeTime(timeStart);
  const newEnd = normalizeTime(timeEnd);

  const conflicts = reservations
    .filter(r => {
      // Skip if it's the same reservation (edit mode)
      if (excludeId && r.id === excludeId) return false;

      // Must be same asset and date
      if (r.asset_id !== assetId || r.date !== date) return false;

      // Only check APPROVED and PENDING reservations
      const status = r.status?.toUpperCase();
      if (status !== 'APPROVED' && status !== 'PENDING') return false;

      // Normalize existing reservation times
      const existingStart = normalizeTime(r.time_start);
      const existingEnd = normalizeTime(r.time_end);

      // Check for time overlap
      // Overlap occurs if:
      // 1. New start is within existing range: existingStart <= newStart < existingEnd
      // 2. New end is within existing range: existingStart < newEnd <= existingEnd
      // 3. New range completely contains existing range: newStart <= existingStart && newEnd >= existingEnd
      const overlaps = (
        (existingStart <= newStart && newStart < existingEnd) ||
        (existingStart < newEnd && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );

      return overlaps;
    })
    .map(r => ({
      id: r.id,
      title_name: r.title_name,
      time_start: r.time_start,
      time_end: r.time_end,
      reserved_by_user: r.reserved_by_user
        ? `${r.reserved_by_user.first_name} ${r.reserved_by_user.last_name}`
        : "Unknown User"
    }));

  return conflicts;
};